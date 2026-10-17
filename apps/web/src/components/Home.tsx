import { masteryOf } from '@keydojo/core';
import { plugins } from '../plugins';
import { useI18n } from '../i18n';
import { href } from '../router';
import { store } from '../storage';

export function Home() {
  const { m, p } = useI18n();
  return (
    <div className="page">
      <section className="hero">
        <h1>{m.heroTitle}</h1>
        <p>{m.heroText}</p>
      </section>
      <div className="plugin-grid">
        {plugins.map((plugin) => {
          const progress = store.progress(plugin.id);
          const learned = Object.values(progress).filter((c) => masteryOf(c) !== 'new').length;
          return (
            <a key={plugin.id} className="plugin-card" href={href({ name: 'plugin', pluginId: plugin.id })}>
              <h2>{p(plugin, plugin.name)}</h2>
              <p>{p(plugin, plugin.description)}</p>
              <span className="muted">{learned > 0 ? m.practised(learned) : m.notStarted}</span>
            </a>
          );
        })}
      </div>
      <p className="muted center">
        {m.missingApp} <code>CONTRIBUTING.md</code>
        {m.fullStop}
      </p>
    </div>
  );
}
