import { LOCALES, type Locale, type Platform } from '@keydojo/core';
import { useEffect, useState } from 'react';
import { DrillView } from './components/DrillView';
import { KeyLabels } from './components/KeyCaps';
import { ScenarioView } from './components/ScenarioView';
import { Home } from './components/Home';
import { PluginPage } from './components/PluginPage';
import { canLockKeyboard, currentCaptureEnv, detectPlatform, enterKeyboardLock } from './platform';
import { LOCALE_NAMES, useI18n } from './i18n';
import { findPlugin } from './plugins';
import { href, useRoute } from './router';
import { store } from './storage';

const PLATFORM_LABEL: Record<Platform, string> = { mac: 'macOS', windows: 'Windows', linux: 'Linux' };

export function App() {
  const route = useRoute();
  const { m, locale, setLocale } = useI18n();
  const [platform, setPlatformState] = useState<Platform>(() => store.platform() ?? detectPlatform());
  const [env, setEnv] = useState(currentCaptureEnv);

  useEffect(() => {
    const onChange = () => setEnv(currentCaptureEnv());
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const setPlatform = (p: Platform) => {
    store.setPlatform(p);
    setPlatformState(p);
  };

  const plugin = route.name !== 'home' ? findPlugin(route.pluginId) : undefined;

  return (
    <>
      <nav className="topbar">
        <a href={href({ name: 'home' })} className="logo">
          ⌨️ KeyDojo
        </a>
        <div className="row">
          {env === 'browser' && canLockKeyboard() && (
            <button className="secondary small" onClick={enterKeyboardLock} title={m.fullscreenTitle}>
              {m.fullscreen}
            </button>
          )}
          <select value={platform} onChange={(e) => setPlatform(e.target.value as Platform)} title={m.keyboardLayout}>
            {(Object.keys(PLATFORM_LABEL) as Platform[]).map((p) => (
              <option key={p} value={p}>
                {PLATFORM_LABEL[p]}
              </option>
            ))}
          </select>
          <select value={locale} onChange={(e) => setLocale(e.target.value as Locale)} title={m.language}>
            {LOCALES.map((l) => (
              <option key={l} value={l}>
                {LOCALE_NAMES[l]}
              </option>
            ))}
          </select>
        </div>
      </nav>
      <main>
        <KeyLabels.Provider value={plugin?.keyLabels ?? {}}>
          {route.name === 'home' && <Home />}
          {route.name !== 'home' && !plugin && (
            <div className="page center">
              <h2>{m.unknownPlugin}</h2>
              <a href={href({ name: 'home' })}>{m.backHome}</a>
            </div>
          )}
          {route.name === 'plugin' && plugin && <PluginPage key={plugin.id + platform + env} plugin={plugin} platform={platform} env={env} />}
          {route.name === 'drill' && plugin && <DrillView key={plugin.id + platform} plugin={plugin} platform={platform} env={env} />}
          {route.name === 'scenario' && plugin && (
            <ScenarioView key={plugin.id + platform + route.scenarioId} plugin={plugin} scenarioId={route.scenarioId} platform={platform} env={env} />
          )}
        </KeyLabels.Provider>
      </main>
      <footer className="muted small center">
        {m.openSource} · <a href="https://github.com/prehisle/keydojo">GitHub</a> ·{' '}
        <a href="https://github.com/prehisle/keydojo/issues">{m.feedback}</a>
      </footer>
    </>
  );
}
