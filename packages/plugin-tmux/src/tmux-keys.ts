import { KeyParseError, resolveKeyName, stroke, type KeyStroke, type Modifier } from '@keydojo/core';

const TMUX_NAMED: Record<string, { code: string; mods?: Modifier[] }> = {
  Up: { code: 'ArrowUp' },
  Down: { code: 'ArrowDown' },
  Left: { code: 'ArrowLeft' },
  Right: { code: 'ArrowRight' },
  Space: { code: 'Space' },
  Enter: { code: 'Enter' },
  Escape: { code: 'Escape' },
  Tab: { code: 'Tab' },
  BTab: { code: 'Tab', mods: ['Shift'] },
  BSpace: { code: 'Backspace' },
  DC: { code: 'Delete' },
  IC: { code: 'Insert' },
  Home: { code: 'Home' },
  End: { code: 'End' },
  NPage: { code: 'PageDown' },
  PageDown: { code: 'PageDown' },
  PgDn: { code: 'PageDown' },
  PPage: { code: 'PageUp' },
  PageUp: { code: 'PageUp' },
  PgUp: { code: 'PageUp' },
};

/**
 * Parse a key in tmux notation: `C-b`, `M-Left`, `S-Up`, `C-M-x`, `%`, `"`, `F5`, `BTab`.
 * Uppercase letters imply Shift, as they do in tmux.
 */
export function parseTmuxKey(text: string): KeyStroke {
  let rest = text;
  const mods: Modifier[] = [];
  // Modifier prefixes; `C--` is Ctrl+Minus, so stop when only the key is left.
  while (rest.length > 2 && /^[CMS]-/.test(rest)) {
    mods.push(rest[0] === 'C' ? 'Ctrl' : rest[0] === 'M' ? 'Alt' : 'Shift');
    rest = rest.slice(2);
  }
  if (rest.startsWith('^') && rest.length === 2) {
    mods.push('Ctrl');
    rest = rest.slice(1);
  }

  const named = TMUX_NAMED[rest];
  if (named) return stroke(named.code, ...mods, ...(named.mods ?? []));
  if (/^F([1-9]|1[0-2])$/.test(rest)) return stroke(rest, ...mods);

  if (rest.length === 1) {
    // In tmux C-b and C-B are the same key; elsewhere uppercase means Shift.
    if (/[A-Z]/.test(rest) && !mods.includes('Ctrl')) mods.push('Shift');
    const { code, implied } = resolveKeyName(rest);
    return stroke(code, ...mods, ...implied);
  }
  throw new KeyParseError(`Unsupported tmux key "${text}"`);
}
