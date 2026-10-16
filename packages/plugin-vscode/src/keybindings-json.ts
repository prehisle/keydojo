import {
  compilePack,
  KeyParseError,
  parseSequence,
  sequenceToNotation,
  type ImportResult,
  type Platform,
  type ShortcutDef,
  type ShortcutPackDef,
} from '@keydojo/core';

interface VSCodeBinding {
  key?: string;
  command?: string;
  when?: string;
}

/** Strip `//` and `/* *\/` comments and trailing commas, leaving strings intact. */
export function stripJsonc(text: string): string {
  let out = '';
  let inString = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    const next = text[i + 1];
    if (inString) {
      out += ch;
      if (ch === '\\') out += text[++i] ?? '';
      else if (ch === '"') inString = false;
    } else if (ch === '"') {
      inString = true;
      out += ch;
    } else if (ch === '/' && next === '/') {
      while (i < text.length && text[i] !== '\n') i++;
      out += '\n';
    } else if (ch === '/' && next === '*') {
      i += 2;
      while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) i++;
      i++;
    } else {
      out += ch;
    }
  }
  return out.replace(/,(\s*[\]}])/g, '$1');
}

/**
 * Convert a VSCode key string (`ctrl+shift+p`, `cmd+k cmd+s`, `ctrl+[KeyA]`) to KeyDojo
 * notation. VSCode already uses `+` and spaces the same way; only scan codes need help.
 */
export function vscodeKeyToNotation(key: string, platform: Platform): string {
  const text = key.replace(/\[(\w+)\]/g, '$1');
  return sequenceToNotation(parseSequence(text, platform));
}

/** Turn `editor.action.formatDocument` into `Format Document` for commands we don't know. */
export function humanizeCommand(command: string): string {
  const parts = command
    .replace(/^(workbench\.action\.|editor\.action\.|workbench\.)/, '')
    .split('.')
    .map((p) => p.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase()));
  return parts.join(' › ');
}

/**
 * Apply a user keybindings.json on top of the default pack, following VSCode's rules:
 * entries add bindings, and `-command` entries remove them.
 */
export function importKeybindings(text: string, base: ShortcutPackDef, platform: Platform): ImportResult {
  const warnings: string[] = [];
  let entries: unknown;
  try {
    entries = JSON.parse(stripJsonc(text));
  } catch (err) {
    return { pack: base, warnings: [`Could not parse keybindings.json: ${(err as Error).message}`] };
  }
  if (!Array.isArray(entries)) {
    return { pack: base, warnings: ['keybindings.json should contain an array of bindings'] };
  }

  // Resolve defaults to concrete per-platform bindings, keyed by command.
  const compiled = compilePack(base, platform).pack;
  const byCommand = new Map<string, ShortcutDef>();
  for (const s of compiled.shortcuts) {
    const def = base.shortcuts.find((d) => d.id === s.id)!;
    byCommand.set(s.id, {
      id: s.id,
      action: s.action,
      keys: s.bindings.map(sequenceToNotation),
      context: s.context,
      tags: s.tags,
      level: s.level,
      note: def.note,
    });
  }
  const keysOf = (d: ShortcutDef) => (Array.isArray(d.keys) ? d.keys : [d.keys]);

  let added = 0;
  let removed = 0;
  for (const raw of entries as VSCodeBinding[]) {
    if (!raw || typeof raw.command !== 'string') continue;
    const removal = raw.command.startsWith('-');
    const command = removal ? raw.command.slice(1) : raw.command;

    let notation: string | undefined;
    if (raw.key) {
      try {
        notation = vscodeKeyToNotation(raw.key, platform);
      } catch (err) {
        if (!(err instanceof KeyParseError)) throw err;
        warnings.push(`${command}: ${err.message}`);
        continue;
      }
    }

    const existing = byCommand.get(command);
    if (removal) {
      if (!existing) continue;
      existing.keys = notation ? keysOf(existing).filter((k) => k !== notation) : [];
      removed++;
      continue;
    }
    if (!notation) continue;

    if (existing) {
      if (!keysOf(existing).includes(notation)) existing.keys = [...keysOf(existing), notation];
    } else {
      byCommand.set(command, {
        id: command,
        action: humanizeCommand(command),
        keys: [notation],
        context: raw.when,
        tags: ['custom'],
        level: 2,
      });
    }
    added++;
  }

  const shortcuts = [...byCommand.values()].filter((d) => keysOf(d).length > 0);
  warnings.unshift(`Applied ${added} bindings and ${removed} removals from keybindings.json`);
  return { pack: { id: base.id, name: `${base.name} + keybindings.json`, shortcuts }, warnings };
}
