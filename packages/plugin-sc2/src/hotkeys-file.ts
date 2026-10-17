import type { Layout, Overrides } from './pack';

export interface ParsedHotkeysFile {
  overrides: Overrides;
  /** Set when the file says which built-in profile it extends. */
  layout?: Layout;
  /** Number of entries bound to keys a keyboard drill can't use (mouse buttons etc). */
  entries: number;
}

/**
 * Parse an .SC2Hotkeys file. It is INI-like: `[Settings]`, `[Hotkeys]` (global UI hotkeys) and
 * `[Commands]` (command card buttons), each with `Name=Key[,Key…]` lines. Files only store what
 * differs from the profile they are based on.
 */
export function parseHotkeysFile(text: string): ParsedHotkeysFile {
  const overrides: Overrides = { commands: new Map(), hotkeys: new Map() };
  const settings = new Map<string, string>();
  let section = '';
  let entries = 0;
  for (const raw of text.replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith(';') || line.startsWith('#')) continue;
    const header = /^\[(.+)\]$/.exec(line);
    if (header) {
      section = header[1]!.toLowerCase();
      continue;
    }
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const name = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim();
    if (section === 'settings') settings.set(name.toLowerCase(), value);
    else if (section === 'hotkeys') overrides.hotkeys.set(name, value);
    else if (section === 'commands') overrides.commands.set(name, value);
    else continue;
    if (section !== 'settings') entries++;
  }
  const grid = settings.get('grid') === '1' || /_GLS$/i.test(settings.get('suffix') ?? '');
  return { overrides, layout: grid ? 'grid' : undefined, entries };
}
