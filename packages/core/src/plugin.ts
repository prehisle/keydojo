import type { Platform } from './keys';
import type { ShortcutPackDef } from './pack';
import type { ScenarioDef } from './scenario';

/**
 * A plugin adds training for one application. Most plugins are pure data: a default
 * pack plus, ideally, an importer for the app's own config file so users can drill
 * their real bindings.
 *
 * Everything a plugin returns must be JSON-serializable — imported packs are persisted.
 */
export interface ShortcutPlugin {
  /** Stable id, used as the storage namespace. */
  id: string;
  name: string;
  description: string;
  homepage?: string;
  /** User-tunable options, e.g. the tmux prefix key. */
  settings?: PluginSetting[];
  /** Build the default pack, applying settings. */
  buildPack(ctx: PluginContext): ShortcutPackDef;
  importers?: ConfigImporter[];
  /**
   * Timed multi-step drills (e.g. build orders). Steps reference shortcut ids from the pack;
   * whatever bindings are active — default or imported — are the ones practised.
   */
  scenarios?(ctx: PluginContext): ScenarioDef[];
}

export interface PluginContext {
  platform: Platform;
  settings: SettingValues;
}

export type SettingValues = Record<string, string>;

export interface PluginSetting {
  key: string;
  label: string;
  type: 'select' | 'text';
  options?: { value: string; label: string }[];
  default: string;
  description?: string;
}

export interface ConfigImporter {
  id: string;
  label: string;
  /** Tells the user where to find the config, e.g. which command to run. */
  instructions: string;
  /** File extensions for the file picker, e.g. `.json`. */
  accept?: string;
  /**
   * Turn the raw config text into a pack. `base` is the plugin's default pack, for
   * formats that only store overrides (like VSCode's keybindings.json).
   */
  parse(text: string, ctx: PluginContext & { base: ShortcutPackDef }): ImportResult;
}

export interface ImportResult {
  pack: ShortcutPackDef;
  warnings: string[];
}

export function definePlugin(plugin: ShortcutPlugin): ShortcutPlugin {
  return plugin;
}

export function defaultSettings(plugin: ShortcutPlugin): SettingValues {
  return Object.fromEntries((plugin.settings ?? []).map((s) => [s.key, s.default]));
}
