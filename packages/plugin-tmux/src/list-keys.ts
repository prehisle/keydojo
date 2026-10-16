import { KeyParseError, sequenceToNotation, type ImportResult, type KeyStroke, type ShortcutDef } from '@keydojo/core';
import { DEFAULT_BINDINGS } from './defaults';
import { parseTmuxKey } from './tmux-keys';

const DIRECTION: Record<string, string> = { '-U': 'up', '-D': 'down', '-L': 'left', '-R': 'right' };
const PANE_DIRECTION: Record<string, string> = {
  '-U': 'the pane above',
  '-D': 'the pane below',
  '-L': 'the pane on the left',
  '-R': 'the pane on the right',
};

/** Split a tmux command line into tokens, honouring quotes and backslash escapes. */
export function tokenize(line: string): string[] {
  const tokens: string[] = [];
  let cur = '';
  let quote: string | null = null;
  let hasToken = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (quote) {
      if (ch === quote) quote = null;
      else if (ch === '\\' && quote === '"' && i + 1 < line.length) cur += line[++i];
      else cur += ch;
    } else if (ch === '\\' && i + 1 < line.length) {
      cur += line[++i];
      hasToken = true;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      hasToken = true;
    } else if (/\s/.test(ch)) {
      if (hasToken) tokens.push(cur);
      cur = '';
      hasToken = false;
    } else {
      cur += ch;
      hasToken = true;
    }
  }
  if (hasToken) tokens.push(cur);
  return tokens;
}

/** Human-readable description of a tmux command. Labels match DEFAULT_BINDINGS where possible. */
export function describeCommand(args: string[]): string {
  const [cmd = '', ...rest] = args;
  // Flags may be combined, as in `choose-tree -Zs`.
  const has = (flag: string) => rest.some((a) => /^-[A-Za-z]+$/.test(a) && a.includes(flag.slice(1)));
  const dir = rest.find((a) => a in DIRECTION);
  const full = args.join(' ');

  switch (cmd) {
    case 'split-window':
    case 'splitw':
      return has('-h') ? 'Split pane left / right' : 'Split pane top / bottom';
    case 'select-pane':
    case 'selectp':
      if (dir) return `Move to ${PANE_DIRECTION[dir]}`;
      if (has('-m')) return 'Mark the current pane';
      if (rest.includes(':.+')) return 'Cycle to the next pane';
      break;
    case 'resize-pane':
    case 'resizep': {
      if (has('-Z')) return 'Zoom / unzoom the current pane';
      const n = rest.find((a) => /^\d+$/.test(a)) ?? '1';
      if (dir) return `Resize pane ${DIRECTION[dir]} by ${n} cell${n === '1' ? '' : 's'}`;
      break;
    }
    case 'new-window':
    case 'neww':
      return 'Create a new window';
    case 'next-window':
    case 'next':
      return 'Next window';
    case 'previous-window':
    case 'prev':
      return 'Previous window';
    case 'last-window':
    case 'last':
      return 'Last used window';
    case 'last-pane':
    case 'lastp':
      return 'Go to the last active pane';
    case 'kill-pane':
    case 'killp':
      return 'Kill the current pane';
    case 'kill-window':
    case 'killw':
      return 'Kill the current window';
    case 'detach-client':
    case 'detach':
      return 'Detach from the session';
    case 'copy-mode':
      return 'Enter copy mode (scrollback)';
    case 'paste-buffer':
    case 'pasteb':
      return 'Paste the most recent buffer';
    case 'list-keys':
    case 'lsk':
      return 'List all key bindings';
    case 'display-panes':
    case 'displayp':
      return 'Show pane numbers';
    case 'break-pane':
    case 'breakp':
      return 'Break the pane out into its own window';
    case 'next-layout':
    case 'nextl':
      return 'Cycle through pane layouts';
    case 'source-file':
    case 'source':
      return 'Reload tmux config';
    case 'swap-pane':
    case 'swapp':
      if (has('-U')) return 'Swap the pane with the previous one';
      if (has('-D')) return 'Swap the pane with the next one';
      break;
    case 'select-window':
    case 'selectw': {
      const target = rest[rest.indexOf('-t') + 1];
      const m = target?.match(/^:=?(\d+)$/);
      if (m) return `Go to window ${m[1]}`;
      break;
    }
    case 'choose-tree':
      if (has('-s')) return 'Choose a session from a list';
      if (has('-w')) return 'Choose a window from a tree';
      break;
    case 'send-keys':
    case 'send': {
      const i = rest.indexOf('-X');
      if (i >= 0 && rest[i + 1]) return `Copy mode: ${rest[i + 1]!.replace(/-/g, ' ')}`;
      break;
    }
    case 'confirm-before':
    case 'confirm':
      if (full.includes('kill-pane')) return 'Kill the current pane';
      if (full.includes('kill-window')) return 'Kill the current window';
      break;
    case 'command-prompt':
      if (full.includes('rename-window')) return 'Rename the current window';
      if (full.includes('rename-session')) return 'Rename the current session';
      if (rest.length === 0) return 'Open the tmux command prompt';
      break;
  }
  return full;
}

const COPY_TABLES = new Set(['copy-mode', 'copy-mode-vi']);
const MOUSE_KEY = /^(Mouse|Wheel|DoubleClick|TripleClick|SecondClick)/;

export interface ListKeysOptions {
  prefix: KeyStroke;
  /** Which copy-mode table to keep; the other one is noise for the user. */
  copyTable: 'copy-mode' | 'copy-mode-vi';
}

/** Parse the output of `tmux list-keys` into shortcut definitions. */
export function parseListKeys(text: string, opts: ListKeysOptions): ImportResult & { suggestedPrefix?: string } {
  const shortcuts: ShortcutDef[] = [];
  const warnings: string[] = [];
  let skippedMouse = 0;
  let skippedTables = 0;
  let suggestedPrefix: string | undefined;
  const usedIds = new Set<string>();

  const defaultsByKey = new Map(DEFAULT_BINDINGS.map((b) => [`${b.table ?? 'prefix'} ${b.key}`, b]));

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const tokens = tokenize(line);
    if (tokens[0] !== 'bind-key' && tokens[0] !== 'bind') continue;

    let table = 'prefix';
    let note: string | undefined;
    let i = 1;
    for (; i < tokens.length; i++) {
      const t = tokens[i]!;
      if (t === '-T') table = tokens[++i] ?? table;
      else if (t === '-N') note = tokens[++i];
      else if (t === '-n') table = 'root';
      else if (t === '-r') continue;
      else break;
    }
    const key = tokens[i];
    const command = tokens.slice(i + 1);
    if (!key || command.length === 0) continue;

    if (MOUSE_KEY.test(key)) {
      skippedMouse++;
      continue;
    }
    if (command[0] === 'send-prefix' && table === 'prefix') {
      // `bind C-a send-prefix` is the usual sign of a remapped prefix.
      suggestedPrefix = key;
      continue;
    }
    if (table !== 'prefix' && table !== 'root' && table !== opts.copyTable) {
      skippedTables++;
      continue;
    }

    let keyStroke: KeyStroke;
    try {
      keyStroke = parseTmuxKey(key);
    } catch (err) {
      if (!(err instanceof KeyParseError)) throw err;
      warnings.push(err.message);
      continue;
    }

    const seq = table === 'prefix' ? [opts.prefix, keyStroke] : [keyStroke];
    const action = note ?? describeCommand(command);
    const known = defaultsByKey.get(`${table} ${key}`);
    // Keep the default id when the binding is unchanged, so earlier progress carries over.
    let id = known && known.action === action ? known.id : `${table}:${key}`;
    if (usedIds.has(id)) id = `${id}#${shortcuts.length}`;
    usedIds.add(id);

    shortcuts.push({
      id,
      action,
      keys: sequenceToNotation(seq),
      context: COPY_TABLES.has(table) ? table : undefined,
      tags: known?.tags ?? [COPY_TABLES.has(table) ? 'copy' : table === 'root' ? 'root' : 'custom'],
      level: known?.level ?? 2,
    });
  }

  if (skippedMouse) warnings.push(`Skipped ${skippedMouse} mouse bindings`);
  if (skippedTables) warnings.push(`Skipped ${skippedTables} bindings from other key tables`);
  if (shortcuts.length === 0) warnings.push('No key bindings found — paste the full output of `tmux list-keys`.');

  return { pack: { id: 'tmux', name: 'tmux (imported)', shortcuts }, warnings, suggestedPrefix };
}
