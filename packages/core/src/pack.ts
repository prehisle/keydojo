import { KeyParseError, parseSequence, sequenceId, type KeySequence, type Platform } from './keys';

/**
 * Authoring format for shortcuts. This is what plugin authors write (usually as a plain
 * data file). Keys use KeyDojo notation — see `parseStroke` in keys.ts.
 */
export interface ShortcutDef {
  /** Stable id, unique within the pack. Progress is stored against it. */
  id: string;
  /** What the shortcut does, phrased as the drill prompt. */
  action: string;
  /** One binding or several equivalent ones. */
  keys: string | string[];
  /** Per-platform overrides, for bindings that differ beyond the `Mod` modifier. */
  mac?: string | string[];
  windows?: string | string[];
  linux?: string | string[];
  /** Where the shortcut applies, e.g. `copy-mode`, `editorTextFocus`, `Barracks`. */
  context?: string;
  tags?: string[];
  /** 1 (basic) .. 3 (advanced). */
  level?: 1 | 2 | 3;
  note?: string;
}

export interface ShortcutPackDef {
  id: string;
  name: string;
  shortcuts: ShortcutDef[];
}

/** A shortcut compiled for a specific platform. */
export interface Shortcut {
  id: string;
  action: string;
  /** All accepted bindings; pressing any of them counts as correct. */
  bindings: KeySequence[];
  context?: string;
  tags: string[];
  level: 1 | 2 | 3;
  note?: string;
}

export interface ShortcutPack {
  id: string;
  name: string;
  shortcuts: Shortcut[];
}

export interface PackIssue {
  shortcutId: string;
  message: string;
}

export interface CompileResult {
  pack: ShortcutPack;
  issues: PackIssue[];
}

function asArray<T>(v: T | T[] | undefined): T[] {
  if (v === undefined) return [];
  return Array.isArray(v) ? v : [v];
}

/**
 * Compile a pack definition for one platform. Invalid entries are dropped and reported
 * rather than thrown, so one typo in a community pack doesn't break the whole thing.
 */
export function compilePack(def: ShortcutPackDef, platform: Platform): CompileResult {
  const issues: PackIssue[] = [];
  const shortcuts: Shortcut[] = [];
  const seenIds = new Set<string>();

  for (const s of def.shortcuts) {
    if (seenIds.has(s.id)) {
      issues.push({ shortcutId: s.id, message: 'Duplicate id' });
      continue;
    }
    seenIds.add(s.id);

    const raw = asArray(s[platform] ?? s.keys);
    const bindings: KeySequence[] = [];
    for (const text of raw) {
      try {
        bindings.push(parseSequence(text, platform));
      } catch (err) {
        if (!(err instanceof KeyParseError)) throw err;
        issues.push({ shortcutId: s.id, message: err.message });
      }
    }
    if (bindings.length === 0) continue;

    shortcuts.push({
      id: s.id,
      action: s.action,
      bindings,
      context: s.context,
      tags: s.tags ?? [],
      level: s.level ?? 1,
      note: s.note,
    });
  }

  issues.push(...findConflicts(shortcuts));
  return { pack: { id: def.id, name: def.name, shortcuts }, issues };
}

/**
 * Report bindings that are identical, or where one is a prefix of another, within the same
 * context. Either case means the real app could not tell the shortcuts apart.
 */
export function findConflicts(shortcuts: Shortcut[]): PackIssue[] {
  const issues: PackIssue[] = [];
  const byContext = new Map<string, { id: string; key: string }[]>();
  for (const s of shortcuts) {
    const list = byContext.get(s.context ?? '') ?? [];
    for (const b of s.bindings) list.push({ id: s.id, key: sequenceId(b) });
    byContext.set(s.context ?? '', list);
  }
  for (const list of byContext.values()) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i]!;
        const b = list[j]!;
        if (a.id === b.id) continue;
        if (a.key === b.key) {
          issues.push({ shortcutId: b.id, message: `Same binding as "${a.id}" (${a.key})` });
        } else if (b.key.startsWith(a.key + ' ') || a.key.startsWith(b.key + ' ')) {
          issues.push({ shortcutId: b.id, message: `Binding overlaps with "${a.id}" as a prefix` });
        }
      }
    }
  }
  return issues;
}
