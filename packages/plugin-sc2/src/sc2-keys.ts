/**
 * StarCraft II hotkey notation, as used in GameHotkeys.txt and .SC2Hotkeys files:
 * `Control+Shift+A`, `Grave`, `NumPad1`. A value can list alternatives separated by commas.
 */

const MODIFIERS: Record<string, string> = { Control: 'Ctrl', Shift: 'Shift', Alt: 'Alt' };

const KEYS: Record<string, string> = {
  Grave: 'Backquote',
  Minus: 'Minus',
  Equals: 'Equal',
  BracketOpen: 'BracketLeft',
  BracketClose: 'BracketRight',
  BackSlash: 'Backslash',
  SemiColon: 'Semicolon',
  Apostrophe: 'Quote',
  Comma: 'Comma',
  Period: 'Period',
  Slash: 'Slash',
  Space: 'Space',
  Tab: 'Tab',
  Enter: 'Enter',
  Escape: 'Escape',
  Backspace: 'Backspace',
  Delete: 'Delete',
  Insert: 'Insert',
  Home: 'Home',
  End: 'End',
  PageUp: 'PageUp',
  PageDown: 'PageDown',
  Up: 'ArrowUp',
  Down: 'ArrowDown',
  Left: 'ArrowLeft',
  Right: 'ArrowRight',
  Pause: 'Pause',
  PrintScreen: 'PrintScreen',
  ScrollLock: 'ScrollLock',
  NumLock: 'NumLock',
  NumPadPlus: 'NumpadAdd',
  NumPadMinus: 'NumpadSubtract',
  NumPadMultiply: 'NumpadMultiply',
  NumPadDivide: 'NumpadDivide',
  NumPadDecimal: 'NumpadDecimal',
};

/**
 * Convert one SC2 key (no commas) to KeyDojo notation. Returns null for keys a keyboard drill
 * can't use: mouse buttons, media keys, `None`.
 */
export function sc2KeyToNotation(key: string): string | null {
  const parts = key.trim().split('+');
  const name = parts.pop() ?? '';
  const mods: string[] = [];
  for (const p of parts) {
    const m = MODIFIERS[p];
    if (!m) return null;
    mods.push(m);
  }
  let code: string | undefined;
  if (/^[A-Z0-9]$/i.test(name)) code = name.toUpperCase();
  else if (/^F([1-9]|1[0-9]|2[0-4])$/.test(name)) code = name;
  else if (/^NumPad[0-9]$/.test(name)) code = `Numpad${name.slice(6)}`;
  else code = KEYS[name];
  if (!code) return null;
  return [...mods, code].join('+');
}

/** All usable alternatives of an SC2 hotkey value, e.g. `B,Escape` -> [`B`, `Escape`]. */
export function sc2ValueToNotations(value: string): string[] {
  return value
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean)
    .map(sc2KeyToNotation)
    .filter((k): k is string => k !== null);
}
