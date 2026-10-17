import type { LabelOptions, Platform } from './keys';
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
  /**
   * Translations of the plugin's own text, keyed by the English original: action names,
   * contexts, tags, notes, scenario names, setting labels… Text is translated when shown, so
   * stored packs and progress stay language-independent. Missing entries fall back to English.
   */
  messages?: Partial<Record<Locale, Messages>>;
  /** How key caps are labelled, e.g. `{ shiftedSymbols: false }` to show Shift+1 rather than `!`. */
  keyLabels?: LabelOptions;
}

/** UI languages. English is the source language of all plugin text. */
export type Locale = 'en' | 'zh';

export const LOCALES: Locale[] = ['en', 'zh'];

/** English text -> translation. */
export type Messages = Record<string, string>;

/** Translate a plugin's text, falling back to the English original. */
export function translate(plugin: ShortcutPlugin, locale: Locale, text: string): string {
  return plugin.messages?.[locale]?.[text] ?? text;
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
   * formats that only store overrides (like VSCode's keybindings.json). Warnings are shown as
   * is, so write them in `locale`.
   */
  parse(text: string, ctx: PluginContext & { base: ShortcutPackDef; locale: Locale }): ImportResult;
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

/**
 * Every piece of plugin text the UI can show for the given settings combinations — for tests
 * that check a translation is complete.
 */
export function pluginTexts(plugin: ShortcutPlugin, contexts: PluginContext[]): Set<string> {
  const out = new Set<string>([plugin.name, plugin.description]);
  const add = (s: string | undefined) => s && out.add(s);
  for (const s of plugin.settings ?? []) {
    add(s.label);
    add(s.description);
    s.options?.forEach((o) => add(o.label));
  }
  for (const i of plugin.importers ?? []) {
    add(i.label);
    add(i.instructions);
  }
  for (const ctx of contexts) {
    const pack = plugin.buildPack(ctx);
    add(pack.name);
    for (const s of pack.shortcuts) {
      add(s.action);
      add(s.context);
      add(s.note);
      s.tags?.forEach(add);
    }
    for (const sc of plugin.scenarios?.(ctx) ?? []) {
      add(sc.name);
      add(sc.description);
      sc.steps.forEach((st) => add(st.note));
    }
  }
  return out;
}
