import type { Platform } from '@keydojo/core';
import { useEffect, useState } from 'react';
import { DrillView } from './components/DrillView';
import { ScenarioView } from './components/ScenarioView';
import { Home } from './components/Home';
import { PluginPage } from './components/PluginPage';
import { canLockKeyboard, currentCaptureEnv, detectPlatform, enterKeyboardLock } from './platform';
import { findPlugin } from './plugins';
import { href, useRoute } from './router';
import { store } from './storage';

const PLATFORM_LABEL: Record<Platform, string> = { mac: 'macOS', windows: 'Windows', linux: 'Linux' };

export function App() {
  const route = useRoute();
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
            <button className="secondary small" onClick={enterKeyboardLock} title="Lets the page capture Ctrl+W, Ctrl+T, …">
              Fullscreen · capture all keys
            </button>
          )}
          <select value={platform} onChange={(e) => setPlatform(e.target.value as Platform)} title="Keyboard layout">
            {(Object.keys(PLATFORM_LABEL) as Platform[]).map((p) => (
              <option key={p} value={p}>
                {PLATFORM_LABEL[p]}
              </option>
            ))}
          </select>
        </div>
      </nav>
      <main>
        {route.name === 'home' && <Home />}
        {route.name !== 'home' && !plugin && (
          <div className="page center">
            <h2>Unknown plugin</h2>
            <a href={href({ name: 'home' })}>Back home</a>
          </div>
        )}
        {route.name === 'plugin' && plugin && <PluginPage key={plugin.id + platform + env} plugin={plugin} platform={platform} env={env} />}
        {route.name === 'drill' && plugin && <DrillView key={plugin.id + platform} plugin={plugin} platform={platform} env={env} />}
        {route.name === 'scenario' && plugin && (
          <ScenarioView key={plugin.id + platform + route.scenarioId} plugin={plugin} scenarioId={route.scenarioId} platform={platform} env={env} />
        )}
      </main>
      <footer className="muted small center">
        Open source · <a href="https://github.com/prehisle/keydojo">GitHub</a>
      </footer>
    </>
  );
}
