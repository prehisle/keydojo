/**
 * Key model.
 *
 * Every shortcut in KeyDojo is a KeySequence: one or more KeyStrokes pressed in order.
 * That single shape covers plain combos (VSCode `Ctrl+Shift+P`), chords (`Ctrl+K Ctrl+S`),
 * prefix keys (tmux `C-b %`) and rapid single-key series (StarCraft `B B`).
 *
 * Strokes identify keys by `KeyboardEvent.code` (physical position), not `key`, so drills
 * behave the same regardless of keyboard layout or active input method.
 */

export type Modifier = 'Ctrl' | 'Alt' | 'Shift' | 'Meta';
export type Platform = 'mac' | 'windows' | 'linux';

export interface KeyStroke {
  /** Always sorted in MODIFIER_ORDER, no duplicates. */
  mods: Modifier[];
  /** A `KeyboardEvent.code` value, e.g. `KeyA`, `Digit5`, `ArrowUp`. */
  code: string;
}

export type KeySequence = KeyStroke[];

export const MODIFIER_ORDER: readonly Modifier[] = ['Ctrl', 'Alt', 'Shift', 'Meta'];

const MODIFIER_ALIASES: Record<string, Modifier | 'Mod'> = {
  ctrl: 'Ctrl',
  control: 'Ctrl',
  alt: 'Alt',
  option: 'Alt',
  opt: 'Alt',
  shift: 'Shift',
  meta: 'Meta',
  cmd: 'Meta',
  command: 'Meta',
  super: 'Meta',
  win: 'Meta',
  // Cmd on macOS, Ctrl everywhere else.
  mod: 'Mod',
};

/** Friendly key name -> KeyboardEvent.code. */
const NAMED_KEYS: Record<string, string> = {
  enter: 'Enter',
  return: 'Enter',
  esc: 'Escape',
  escape: 'Escape',
  space: 'Space',
  tab: 'Tab',
  backspace: 'Backspace',
  delete: 'Delete',
  del: 'Delete',
  insert: 'Insert',
  home: 'Home',
  end: 'End',
  pageup: 'PageUp',
  pagedown: 'PageDown',
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
  '`': 'Backquote',
  '-': 'Minus',
  '=': 'Equal',
  '[': 'BracketLeft',
  ']': 'BracketRight',
  '\\': 'Backslash',
  ';': 'Semicolon',
  "'": 'Quote',
  ',': 'Comma',
  '.': 'Period',
  '/': 'Slash',
};

/** Shifted symbols on a US layout -> base code. `%` means Shift+Digit5. */
const SHIFTED_SYMBOLS: Record<string, string> = {
  '~': 'Backquote',
  '!': 'Digit1',
  '@': 'Digit2',
  '#': 'Digit3',
  $: 'Digit4',
  '%': 'Digit5',
  '^': 'Digit6',
  '&': 'Digit7',
  '*': 'Digit8',
  '(': 'Digit9',
  ')': 'Digit0',
  _: 'Minus',
  '+': 'Equal',
  '{': 'BracketLeft',
  '}': 'BracketRight',
  '|': 'Backslash',
  ':': 'Semicolon',
  '"': 'Quote',
  '<': 'Comma',
  '>': 'Period',
  '?': 'Slash',
};

const CODE_LABELS: Record<string, string> = {
  Backquote: '`',
  Minus: '-',
  Equal: '=',
  BracketLeft: '[',
  BracketRight: ']',
  Backslash: '\\',
  Semicolon: ';',
  Quote: "'",
  Comma: ',',
  Period: '.',
  Slash: '/',
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
  Escape: 'Esc',
};

const SHIFTED_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(SHIFTED_SYMBOLS).map(([sym, code]) => [code, sym]),
);

const MODIFIER_CODES = new Set([
  'ShiftLeft',
  'ShiftRight',
  'ControlLeft',
  'ControlRight',
  'AltLeft',
  'AltRight',
  'MetaLeft',
  'MetaRight',
  'OSLeft',
  'OSRight',
  'CapsLock',
  'Fn',
]);

export class KeyParseError extends Error {}

export function normalizeMods(mods: Iterable<Modifier>): Modifier[] {
  const set = new Set(mods);
  return MODIFIER_ORDER.filter((m) => set.has(m));
}

export function stroke(code: string, ...mods: Modifier[]): KeyStroke {
  return { code, mods: normalizeMods(mods) };
}

/** Resolve a single key name (no modifiers) to a code plus any implied modifiers. */
export function resolveKeyName(name: string): { code: string; implied: Modifier[] } {
  if (name.length === 1) {
    if (/[a-z]/i.test(name)) return { code: `Key${name.toUpperCase()}`, implied: [] };
    if (/[0-9]/.test(name)) return { code: `Digit${name}`, implied: [] };
    const shifted = SHIFTED_SYMBOLS[name];
    if (shifted) return { code: shifted, implied: ['Shift'] };
  }
  const named = NAMED_KEYS[name.toLowerCase()];
  if (named) return { code: named, implied: [] };
  if (/^f([1-9]|1[0-9]|2[0-4])$/i.test(name)) return { code: name.toUpperCase(), implied: [] };
  // Allow raw KeyboardEvent.code values (e.g. `Numpad1`) as an escape hatch.
  if (/^(Key[A-Z]|Digit[0-9]|Numpad\w+|[A-Z][A-Za-z]+)$/.test(name)) return { code: name, implied: [] };
  throw new KeyParseError(`Unknown key "${name}"`);
}

/**
 * Parse one stroke in KeyDojo notation: modifiers and key joined by `+`.
 * Examples: `Ctrl+Shift+P`, `Mod+K`, `%`, `Shift+5`, `Ctrl++`, `F12`.
 */
export function parseStroke(text: string, platform: Platform): KeyStroke {
  const trimmed = text.trim();
  if (!trimmed) throw new KeyParseError('Empty key stroke');

  // The key itself may be `+`, which collides with the separator.
  let keyPart: string;
  let modPart: string[];
  if (trimmed === '+') {
    keyPart = '+';
    modPart = [];
  } else if (trimmed.endsWith('++')) {
    keyPart = '+';
    modPart = trimmed.slice(0, -2).split('+');
  } else {
    const parts = trimmed.split('+');
    keyPart = parts.pop()!;
    modPart = parts;
  }

  const mods: Modifier[] = [];
  for (const raw of modPart) {
    const alias = MODIFIER_ALIASES[raw.trim().toLowerCase()];
    if (!alias) throw new KeyParseError(`Unknown modifier "${raw}" in "${text}"`);
    mods.push(alias === 'Mod' ? (platform === 'mac' ? 'Meta' : 'Ctrl') : alias);
  }
  const { code, implied } = resolveKeyName(keyPart.trim());
  return { code, mods: normalizeMods([...mods, ...implied]) };
}

/** Parse a whitespace-separated sequence of strokes, e.g. `Ctrl+K Ctrl+S` or `Ctrl+B %`. */
export function parseSequence(text: string, platform: Platform): KeySequence {
  const parts = text.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) throw new KeyParseError('Empty key sequence');
  return parts.map((p) => parseStroke(p, platform));
}

export function strokeId(s: KeyStroke): string {
  return [...s.mods, s.code].join('+');
}

export function sequenceId(seq: KeySequence): string {
  return seq.map(strokeId).join(' ');
}

export function strokesEqual(a: KeyStroke, b: KeyStroke): boolean {
  return strokeId(a) === strokeId(b);
}

export function isModifierCode(code: string): boolean {
  return MODIFIER_CODES.has(code);
}

/** Minimal shape of a DOM KeyboardEvent, so core stays DOM-free and testable. */
export interface KeyEventLike {
  code: string;
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
}

/** Convert a keydown event to a stroke. Returns null for bare modifier presses. */
export function strokeFromEvent(e: KeyEventLike): KeyStroke | null {
  if (!e.code || isModifierCode(e.code)) return null;
  const mods: Modifier[] = [];
  if (e.ctrlKey) mods.push('Ctrl');
  if (e.altKey) mods.push('Alt');
  if (e.shiftKey) mods.push('Shift');
  if (e.metaKey) mods.push('Meta');
  return { code: e.code, mods: normalizeMods(mods) };
}

/**
 * Inverse of `parseStroke`: render a stroke back to KeyDojo notation. Importers use this to
 * emit pack definitions from app-specific key syntax.
 */
export function strokeToNotation(s: KeyStroke): string {
  let key = s.code;
  if (key.startsWith('Key')) key = key.slice(3);
  else if (key.startsWith('Digit')) key = key.slice(5);
  else if (key.startsWith('Arrow')) key = key.slice(5);
  return [...s.mods, key].join('+');
}

export function sequenceToNotation(seq: KeySequence): string {
  return seq.map(strokeToNotation).join(' ');
}

function codeLabel(code: string): string {
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  return CODE_LABELS[code] ?? code;
}

const MAC_MOD_LABELS: Record<Modifier, string> = { Ctrl: '⌃', Alt: '⌥', Shift: '⇧', Meta: '⌘' };
const PC_MOD_LABELS: Record<Platform, Record<Modifier, string>> = {
  mac: MAC_MOD_LABELS,
  windows: { Ctrl: 'Ctrl', Alt: 'Alt', Shift: 'Shift', Meta: 'Win' },
  linux: { Ctrl: 'Ctrl', Alt: 'Alt', Shift: 'Shift', Meta: 'Super' },
};

/** Split a stroke into display parts, e.g. ["Ctrl", "Shift", "P"]. */
export function strokeParts(s: KeyStroke, platform: Platform): string[] {
  // Show `Shift+Digit5` as `%` — that is how tmux and most docs write it.
  const symbol = SHIFTED_LABELS[s.code];
  if (symbol && s.mods.length === 1 && s.mods[0] === 'Shift') return [symbol];
  const labels = PC_MOD_LABELS[platform];
  return [...s.mods.map((m) => labels[m]), codeLabel(s.code)];
}

export function formatStroke(s: KeyStroke, platform: Platform): string {
  return strokeParts(s, platform).join(platform === 'mac' ? '' : '+');
}

export function formatSequence(seq: KeySequence, platform: Platform): string {
  return seq.map((s) => formatStroke(s, platform)).join(' ');
}
