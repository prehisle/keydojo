import { masteryOf } from '@keydojo/core';
import { plugins } from '../plugins';
import { href } from '../router';
import { store } from '../storage';

export function Home() {
  return (
    <div className="page">
      <section className="hero">
        <h1>Train your shortcuts into muscle memory.</h1>
        <p>
          Pick an app, optionally import your own config, and drill with spaced repetition or against the clock.
        </p>
      </section>
      <div className="plugin-grid">
        {plugins.map((p) => {
          const progress = store.progress(p.id);
          const learned = Object.values(progress).filter((c) => masteryOf(c) !== 'new').length;
          return (
            <a key={p.id} className="plugin-card" href={href({ name: 'plugin', pluginId: p.id })}>
              <h2>{p.name}</h2>
              <p>{p.description}</p>
              <span className="muted">{learned > 0 ? `${learned} shortcuts practised` : 'Not started'}</span>
            </a>
          );
        })}
      </div>
      <p className="muted center">
        Missing an app? Plugins are mostly data — see <code>CONTRIBUTING.md</code>.
      </p>
    </div>
  );
}
