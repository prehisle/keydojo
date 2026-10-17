/**
 * Shape of gamedata.generated.ts. Hotkey values are raw SC2 notation (see sc2-keys.ts), e.g.
 * `Control+1`, or `B,Escape` for alternatives.
 */
export interface GameData {
  source: { repo: string; commit: string };
  /** Grid key for each command card slot, row-major (row * 5 + column). */
  gridSlots: (string | null)[];
  /** Global hotkeys that don't depend on the selection. */
  global: GlobalHotkey[];
  /** Move / Stop / Hold / Patrol / Attack, shared by every unit. */
  common: CardButton[];
  races: Record<Race, UnitCard[]>;
}

export type Race = 'terran' | 'protoss' | 'zerg';

export interface HotkeyValue {
  /** Standard layout default. */
  std: string;
  /** Grid layout exception; without one, Grid uses the button's slot. */
  grid?: string;
}

export interface GlobalHotkey extends HotkeyValue {
  /** UI hotkey id, as in the `[Hotkeys]` section of .SC2Hotkeys files. */
  id: string;
  action: string;
  level: 1 | 2 | 3;
  tag?: string;
  race?: Race;
}

export interface UnitCard {
  /** Catalog id, e.g. `SiegeTankSieged`. Hotkey files can scope overrides to it (`Alias/Unit`). */
  unit: string;
  /** Kebab-case id used in shortcut ids. */
  id: string;
  /** What the player has selected, shown as the drill context. */
  context: string;
  buttons: CardButton[];
}

export interface CardButton extends HotkeyValue {
  face: string;
  /** Hotkey alias: the name used in .SC2Hotkeys files. Usually equals `face`. */
  alias: string;
  name: string;
  row: number;
  col: number;
  /** Set when the button sits in a submenu (e.g. SCV → Build). */
  submenu?: SubmenuButton;
  tag?: string;
  level?: 1 | 2 | 3;
}

export interface SubmenuButton extends HotkeyValue {
  alias: string;
  row: number;
  col: number;
}
