import type { ShortcutDef, ShortcutPackDef } from '@keydojo/core';
import type { GameData, HotkeyValue, Race } from './gamedata';
import { GAME_DATA } from './gamedata.generated';
import { sc2ValueToNotations } from './sc2-keys';

export type Layout = 'standard' | 'grid';

export const RACE_NAMES: Record<Race, string> = { terran: 'Terran', protoss: 'Protoss', zerg: 'Zerg' };
export const LAYOUT_NAMES: Record<Layout, string> = { standard: 'Standard', grid: 'Grid' };

/**
 * Hotkey overrides from a user's .SC2Hotkeys file. `commands` keys are `Alias` or `Alias/Unit`
 * (an override scoped to one unit); `hotkeys` keys are UI hotkey ids like `ControlGroupRecall1`.
 */
export interface Overrides {
  commands: Map<string, string>;
  hotkeys: Map<string, string>;
}

export interface BuildOptions {
  race: Race;
  layout: Layout;
  overrides?: Overrides;
  data?: GameData;
}

/** Anything with a hotkey on the command card: a button, or the submenu button leading to it. */
type Slotted = HotkeyValue & { alias: string; face?: string; row: number; col: number };

const slug = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

/** Build the drill pack for one race and layout, applying any user overrides. */
export function buildSc2Pack({ race, layout, overrides, data = GAME_DATA }: BuildOptions): ShortcutPackDef {
  /** A user override wins, most specific first; an empty override means "unbound". */
  const findOverride = (b: Slotted, unit?: string): string | undefined => {
    const o = overrides?.commands;
    if (!o) return undefined;
    const names = [...new Set([b.alias, b.face ?? b.alias])];
    const scoped = unit ? names.map((n) => `${n}/${unit}`) : [];
    for (const name of [...scoped, ...names]) {
      const v = o.get(name);
      if (v !== undefined) return v;
    }
    return undefined;
  };
  const commandKeys = (b: Slotted, unit?: string): string[] => {
    const custom = findOverride(b, unit);
    if (custom !== undefined) return sc2ValueToNotations(custom);
    if (layout === 'grid') return sc2ValueToNotations(b.grid ?? data.gridSlots[b.row * 5 + b.col] ?? '');
    return sc2ValueToNotations(b.std);
  };

  const shortcuts: ShortcutDef[] = [];
  const push = (def: Omit<ShortcutDef, 'keys'>, keys: string[]) => {
    if (keys.length > 0) shortcuts.push({ ...def, keys: [...new Set(keys)] });
  };

  for (const g of data.global) {
    if (g.race && g.race !== race) continue;
    const custom = overrides?.hotkeys.get(g.id);
    const value = custom ?? (layout === 'grid' ? (g.grid ?? g.std) : g.std);
    push({ id: `global.${slug(g.id)}`, action: g.action, context: 'Global', tags: [g.tag ?? 'global'], level: g.level }, sc2ValueToNotations(value));
  }

  for (const b of data.common) {
    push({ id: `common.${slug(b.face)}`, action: b.name, context: 'Any unit', tags: ['commands'], level: 1 }, commandKeys(b));
  }

  for (const card of data.races[race]) {
    for (const b of card.buttons) {
      const keys = commandKeys(b, card.unit);
      push(
        { id: `${race}.${card.id}.${slug(b.face)}`, action: b.name, context: card.context, tags: [b.tag ?? 'abilities'], level: b.level ?? 1 },
        b.submenu ? withSubmenu(commandKeys(b.submenu, card.unit), keys) : keys,
      );
    }
  }

  return { id: `sc2-${race}`, name: `${RACE_NAMES[race]} · ${LAYOUT_NAMES[layout]}`, shortcuts };
}

/** `B` + `S` -> `B S`: open the submenu, then press the command. */
function withSubmenu(prefixes: string[], keys: string[]): string[] {
  return prefixes.flatMap((p) => keys.map((k) => `${p} ${k}`));
}

