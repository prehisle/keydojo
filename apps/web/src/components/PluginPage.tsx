import { masteryOf, type CaptureEnv, type Mastery, type Platform, type ShortcutPlugin } from '@keydojo/core';
import { useMemo, useState } from 'react';
import { navigate } from '../router';
import { store, type DrillPrefs } from '../storage';
import { usePluginData } from '../usePluginData';
import { ImportPanel } from './ImportPanel';
import { BindingsCaps } from './KeyCaps';

export const NEW_PER_SESSION = 5;

const MASTERY_LABEL: Record<Mastery, string> = { new: 'New', learning: 'Learning', young: 'Familiar', mature: 'Mastered' };

interface Props {
  plugin: ShortcutPlugin;
  platform: Platform;
  env: CaptureEnv;
}

export function PluginPage({ plugin, platform, env }: Props) {
  const data = usePluginData(plugin, platform, env);
  const [prefs, setPrefsState] = useState(() => store.drillPrefs(plugin.id));
  const setPrefs = (patch: Partial<DrillPrefs>) => {
    const next = { ...prefs, ...patch };
    store.setDrillPrefs(plugin.id, next);
    setPrefsState(next);
  };

  const allTags = useMemo(() => [...new Set(data.shortcuts.flatMap((s) => s.tags))].sort(), [data.shortcuts]);
  const selected = data.shortcuts.filter(
    (s) => s.level <= prefs.maxLevel && (prefs.tags.length === 0 || s.tags.some((t) => prefs.tags.includes(t))),
  );
  const practicable = selected.filter(data.isPracticable);
  const blocked = selected.length - practicable.length;
  const now = Date.now();
  const dueCount = practicable.filter((s) => data.progress[s.id] && data.progress[s.id]!.due <= now).length;
  const newCount = practicable.filter((s) => !data.progress[s.id]).length;
  const startLabel =
    prefs.mode === 'smart'
      ? `Start · ${dueCount} due · ${Math.min(newCount, NEW_PER_SESSION)} new`
      : `Start · ${Math.min(prefs.size, practicable.length)} of ${practicable.length} shortcuts`;

  const counts = { new: 0, learning: 0, young: 0, mature: 0 } as Record<Mastery, number>;
  for (const s of data.shortcuts) counts[masteryOf(data.progress[s.id])]++;

  const toggleTag = (t: string) =>
    setPrefs({ tags: prefs.tags.includes(t) ? prefs.tags.filter((x) => x !== t) : [...prefs.tags, t] });

  return (
    <div className="page">
      <header className="plugin-header">
        <h1>{plugin.name}</h1>
        <p>{plugin.description}</p>
        <div className="mastery-bar">
          {(Object.keys(counts) as Mastery[]).map((m) => (
            <span key={m} className={`badge ${m}`}>
              {MASTERY_LABEL[m]} {counts[m]}
            </span>
          ))}
        </div>
      </header>

      <div className="columns">
        <div>
          <section className="panel">
            <h3>Practise</h3>
            <div className="field">
              <span>Mode</span>
              <div className="segmented">
                <button className={prefs.mode === 'smart' ? 'active' : ''} onClick={() => setPrefs({ mode: 'smart' })}>
                  Smart review
                </button>
                <button className={prefs.mode === 'speed' ? 'active' : ''} onClick={() => setPrefs({ mode: 'speed' })}>
                  Speed run
                </button>
              </div>
            </div>
            <p className="muted small">
              {prefs.mode === 'smart'
                ? 'Spaced repetition: due shortcuts first, a few new ones each session; misses come back.'
                : 'Random shortcuts against the clock. Measures reaction time.'}
            </p>
            <div className="field">
              <span>Length</span>
              <div className="segmented">
                {[10, 20, 40].map((n) => (
                  <button key={n} className={prefs.size === n ? 'active' : ''} onClick={() => setPrefs({ size: n })}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <span>Difficulty</span>
              <div className="segmented">
                {([1, 2, 3] as const).map((n) => (
                  <button key={n} className={prefs.maxLevel === n ? 'active' : ''} onClick={() => setPrefs({ maxLevel: n })}>
                    {['Basics', '+ Common', 'Everything'][n - 1]}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <span>Topics</span>
              <div className="chips">
                {allTags.map((t) => (
                  <button key={t} className={`chip ${prefs.tags.includes(t) ? 'active' : ''}`} onClick={() => toggleTag(t)}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <button
              className="primary big"
              disabled={practicable.length === 0}
              onClick={() => navigate({ name: 'drill', pluginId: plugin.id })}
            >
              {startLabel}
            </button>
            {blocked > 0 && (
              <p className="muted small">
                {blocked} shortcut{blocked > 1 ? 's are' : ' is'} reserved by the browser and skipped. Use fullscreen
                mode (top right) in Chrome/Edge, or the desktop app, to practise them.
              </p>
            )}
          </section>

          {plugin.settings && plugin.settings.length > 0 && (
            <section className="panel">
              <h3>Settings</h3>
              {plugin.settings.map((s) => (
                <label key={s.key} className="field">
                  <span>{s.label}</span>
                  {s.type === 'select' ? (
                    <select
                      value={data.settings[s.key]}
                      onChange={(e) => data.setSettings({ ...data.settings, [s.key]: e.target.value })}
                    >
                      {s.options?.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={data.settings[s.key] ?? ''}
                      onChange={(e) => data.setSettings({ ...data.settings, [s.key]: e.target.value })}
                    />
                  )}
                  {s.description && <small className="muted">{s.description}</small>}
                </label>
              ))}
              {data.error && <p className="error">{data.error}</p>}
            </section>
          )}

          {plugin.importers && plugin.importers.length > 0 && data.baseDef && (
            <ImportPanel
              importers={plugin.importers}
              platform={platform}
              settings={data.settings}
              baseDef={data.baseDef}
              imported={data.imported}
              onImport={data.setImported}
            />
          )}
        </div>

        <section className="panel">
          <h3>Shortcuts ({data.shortcuts.length})</h3>
          {data.issues.length > 0 && (
            <details className="warnings">
              <summary>{data.issues.length} issues in this pack</summary>
              <ul>
                {data.issues.map((i, n) => (
                  <li key={n}>
                    <code>{i.shortcutId}</code>: {i.message}
                  </li>
                ))}
              </ul>
            </details>
          )}
          <table className="shortcut-table">
            <tbody>
              {data.shortcuts.map((s) => {
                const card = data.progress[s.id];
                const m = masteryOf(card);
                return (
                  <tr key={s.id} className={data.isPracticable(s) ? '' : 'blocked'}>
                    <td>
                      {s.action}
                      {s.context && <span className="context">{s.context}</span>}
                    </td>
                    <td>
                      <BindingsCaps bindings={s.bindings} platform={platform} />
                    </td>
                    <td className="nowrap">
                      <span className={`badge ${m}`}>{MASTERY_LABEL[m]}</span>
                      {card?.avgMs != null && <span className="muted small"> {(card.avgMs / 1000).toFixed(1)}s</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
