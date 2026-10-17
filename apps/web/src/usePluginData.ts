import {
  compilePack,
  defaultSettings,
  isCapturable,
  type CaptureEnv,
  type PackIssue,
  type ScenarioDef,
  type Platform,
  type ProgressMap,
  type SettingValues,
  type Shortcut,
  type ShortcutPackDef,
  type ShortcutPlugin,
} from '@keydojo/core';
import { useCallback, useMemo, useState } from 'react';
import { store, type ImportedPack } from './storage';

export interface PluginData {
  settings: SettingValues;
  setSettings(v: SettingValues): void;
  imported: ImportedPack | null;
  setImported(v: ImportedPack | null): void;
  /** The pack before compilation — importers merge onto this. */
  baseDef: ShortcutPackDef | null;
  shortcuts: Shortcut[];
  issues: PackIssue[];
  /** Set when the plugin could not build its pack, e.g. an invalid setting. */
  error: string | null;
  progress: ProgressMap;
  /** Timed multi-step drills offered by the plugin for the current settings. */
  scenarios: ScenarioDef[];
  setProgress(v: ProgressMap): void;
  isPracticable(s: Shortcut): boolean;
}

/** Load, build and persist everything the UI needs for one plugin. */
export function usePluginData(plugin: ShortcutPlugin, platform: Platform, env: CaptureEnv): PluginData {
  const [settings, setSettingsState] = useState(() => ({ ...defaultSettings(plugin), ...store.settings(plugin.id) }));
  const [imported, setImportedState] = useState(() => store.imported(plugin.id));
  const [progress, setProgressState] = useState(() => store.progress(plugin.id));

  const built = useMemo(() => {
    let baseDef: ShortcutPackDef;
    let scenarios: ScenarioDef[];
    try {
      baseDef = plugin.buildPack({ platform, settings });
      scenarios = plugin.scenarios?.({ platform, settings }) ?? [];
    } catch (err) {
      return { baseDef: null, shortcuts: [], issues: [], scenarios: [], error: (err as Error).message };
    }
    const { pack, issues } = compilePack(imported?.pack ?? baseDef, platform);
    return { baseDef, shortcuts: pack.shortcuts, issues, scenarios, error: null };
  }, [plugin, platform, settings, imported]);

  const setSettings = useCallback(
    (v: SettingValues) => {
      store.setSettings(plugin.id, v);
      setSettingsState(v);
    },
    [plugin.id],
  );
  const setImported = useCallback(
    (v: ImportedPack | null) => {
      store.setImported(plugin.id, v);
      setImportedState(v);
    },
    [plugin.id],
  );
  const setProgress = useCallback(
    (v: ProgressMap) => {
      store.setProgress(plugin.id, v);
      setProgressState(v);
    },
    [plugin.id],
  );
  // A shortcut is practicable if at least one of its bindings reaches the page.
  const isPracticable = useCallback(
    (s: Shortcut) => s.bindings.some((b) => isCapturable(b, platform, env)),
    [platform, env],
  );

  return { settings, setSettings, imported, setImported, progress, setProgress, isPracticable, ...built };
}
