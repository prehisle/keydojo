import type { DrillMode, Platform, ProgressMap, ScenarioRecord, SettingValues, ShortcutPackDef } from '@keydojo/core';

/**
 * Persistence. Everything goes through `kv` so the desktop build can swap localStorage
 * for a file-backed store without touching the UI.
 */
export interface KVStore {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

const kv: KVStore = {
  get: (k) => localStorage.getItem(k),
  set: (k, v) => localStorage.setItem(k, v),
  remove: (k) => localStorage.removeItem(k),
};

const PREFIX = 'keydojo:v1:';

function read<T>(key: string, fallback: T): T {
  const raw = kv.get(PREFIX + key);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  kv.set(PREFIX + key, JSON.stringify(value));
}

export interface ImportedPack {
  importerId: string;
  importedAt: number;
  pack: ShortcutPackDef;
}

export interface DrillPrefs {
  mode: DrillMode;
  size: number;
  tags: string[];
  maxLevel: 1 | 2 | 3;
}

export const DEFAULT_DRILL_PREFS: DrillPrefs = { mode: 'smart', size: 20, tags: [], maxLevel: 3 };

export const store = {
  platform: () => read<Platform | null>('platform', null),
  setPlatform: (p: Platform) => write('platform', p),

  settings: (pluginId: string) => read<SettingValues>(`settings:${pluginId}`, {}),
  setSettings: (pluginId: string, v: SettingValues) => write(`settings:${pluginId}`, v),

  imported: (pluginId: string) => read<ImportedPack | null>(`imported:${pluginId}`, null),
  setImported: (pluginId: string, v: ImportedPack | null) =>
    v ? write(`imported:${pluginId}`, v) : kv.remove(PREFIX + `imported:${pluginId}`),

  drillPrefs: (pluginId: string) => ({ ...DEFAULT_DRILL_PREFS, ...read<Partial<DrillPrefs>>(`drill:${pluginId}`, {}) }),
  setDrillPrefs: (pluginId: string, v: DrillPrefs) => write(`drill:${pluginId}`, v),

  progress: (pluginId: string) => read<ProgressMap>(`progress:${pluginId}`, {}),
  setProgress: (pluginId: string, v: ProgressMap) => write(`progress:${pluginId}`, v),

  scenarioRecords: (pluginId: string) => read<Record<string, ScenarioRecord>>(`scenarios:${pluginId}`, {}),
  setScenarioRecords: (pluginId: string, v: Record<string, ScenarioRecord>) => write(`scenarios:${pluginId}`, v),
};
