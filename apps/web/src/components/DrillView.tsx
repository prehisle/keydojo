import {
  DrillSession,
  SequenceMatcher,
  strokeFromEvent,
  targetMsFor,
  type CaptureEnv,
  type KeyStroke,
  type Platform,
  type Shortcut,
  type ShortcutPlugin,
} from '@keydojo/core';
import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n';
import { href } from '../router';
import { store } from '../storage';
import { usePluginData } from '../usePluginData';
import { BindingsCaps, SequenceCaps } from './KeyCaps';
import { NEW_PER_SESSION } from './PluginPage';

type Phase = 'answer' | 'correct' | 'reveal' | 'done';

const NEXT_DELAY_MS = 350;
const SPEED_REVEAL_MS = 1500;

interface Props {
  plugin: ShortcutPlugin;
  platform: Platform;
  env: CaptureEnv;
}

export function DrillView(props: Props) {
  // Bumping the key restarts the drill with a fresh session.
  const [run, setRun] = useState(0);
  return <Drill key={run} {...props} onRestart={() => setRun((n) => n + 1)} />;
}

function Drill({ plugin, platform, env, onRestart }: Props & { onRestart(): void }) {
  const { m, p } = useI18n();
  const tr = (text: string) => p(plugin, text);
  const data = usePluginData(plugin, platform, env);
  const prefs = store.drillPrefs(plugin.id);

  const [session] = useState(() => {
    const pool = data.shortcuts.filter(
      (s) =>
        data.isPracticable(s) &&
        s.level <= prefs.maxLevel &&
        (prefs.tags.length === 0 || s.tags.some((t) => prefs.tags.includes(t))),
    );
    return new DrillSession(pool, data.progress, { mode: prefs.mode, size: prefs.size, maxNew: NEW_PER_SESSION });
  });
  const [item, setItem] = useState<Shortcut | null>(session.current);
  const [phase, setPhase] = useState<Phase>(session.done ? 'done' : 'answer');
  const [typed, setTyped] = useState<KeyStroke[]>([]);
  const [shake, setShake] = useState(0);
  const [imeWarning, setImeWarning] = useState(false);

  const matcher = useRef(new SequenceMatcher(item?.bindings ?? []));
  const shownAt = useRef(performance.now());
  const timer = useRef<number | undefined>(undefined);

  const advance = () => {
    const next = session.current;
    setItem(next);
    setTyped([]);
    if (!next) {
      setPhase('done');
      return;
    }
    matcher.current = new SequenceMatcher(next.bindings);
    shownAt.current = performance.now();
    setPhase('answer');
  };

  const record = (correct: boolean) => {
    session.answer(correct, performance.now() - shownAt.current);
    data.setProgress(session.updatedProgress);
  };

  const fail = () => {
    record(false);
    matcher.current.reset();
    setPhase('reveal');
    setShake((n) => n + 1);
    if (prefs.mode === 'speed') timer.current = window.setTimeout(advance, SPEED_REVEAL_MS);
  };

  // Refs let the long-lived listener see the latest state without re-subscribing.
  const handler = useRef<(e: KeyboardEvent) => void>(() => {});
  handler.current = (e: KeyboardEvent) => {
    if (phase === 'done') return;
    if (e.isComposing || e.key === 'Process') {
      e.preventDefault();
      setImeWarning(true);
      return;
    }
    const s = strokeFromEvent(e);
    if (!s) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.repeat || phase === 'correct') return;
    if (phase === 'reveal' && prefs.mode === 'speed') return;
    setImeWarning(false);

    const state = matcher.current.push(s);
    setTyped([...matcher.current.strokes]);

    if (phase === 'answer') {
      if (state === 'correct') {
        record(true);
        setPhase('correct');
        timer.current = window.setTimeout(advance, NEXT_DELAY_MS);
      } else if (state === 'wrong') {
        fail();
      }
      return;
    }

    // phase === 'reveal': the user must type the right answer once before moving on.
    if (state === 'correct') {
      setPhase('correct');
      timer.current = window.setTimeout(advance, NEXT_DELAY_MS);
    } else if (state === 'wrong') {
      matcher.current.reset();
      setShake((n) => n + 1);
    }
  };

  useEffect(() => {
    const listener = (e: KeyboardEvent) => handler.current(e);
    window.addEventListener('keydown', listener, { capture: true });
    return () => {
      window.removeEventListener('keydown', listener, { capture: true });
      window.clearTimeout(timer.current);
    };
  }, []);

  if (phase === 'done' || !item) {
    return <Summary session={session} shortcuts={data.shortcuts} platform={platform} plugin={plugin} onRestart={onRestart} />;
  }

  const answered = session.summary().total;
  const planned = answered + session.remaining;
  const strokes = Math.min(...item.bindings.map((b) => b.length));

  return (
    <div className="drill">
      <div className="drill-top">
        <a href={href({ name: 'plugin', pluginId: plugin.id })} className="muted">
          ← {tr(plugin.name)}
        </a>
        <span className="muted">
          {answered} / {planned}
        </span>
      </div>
      <div className="progress">
        <div style={{ width: `${(answered / planned) * 100}%` }} />
      </div>

      <div className={`prompt ${phase}`}>
        {item.context && <div className="context big">{tr(item.context)}</div>}
        <h1>{tr(item.action)}</h1>
        {prefs.mode === 'speed' && phase === 'answer' && (
          <div className="timer" key={item.id + answered}>
            <div style={{ animationDuration: `${targetMsFor(strokes)}ms` }} />
          </div>
        )}

        <div className="typed" key={shake}>
          {typed.length > 0 ? <SequenceCaps sequence={typed} platform={platform} /> : <span className="muted">{m.pressShortcut}</span>}
        </div>

        {phase === 'reveal' && (
          <div className="reveal">
            <BindingsCaps bindings={item.bindings} platform={platform} />
            {prefs.mode === 'smart' && <p className="muted small">{m.typeToContinue}</p>}
          </div>
        )}
        {item.note && phase !== 'answer' && <p className="muted small">{tr(item.note)}</p>}
      </div>

      {imeWarning && <p className="error center">{m.imeActive}</p>}

      {phase === 'answer' && (
        <div className="center">
          <button className="link" onClick={fail}>
            {m.dontKnow}
          </button>
        </div>
      )}
    </div>
  );
}

interface SummaryProps {
  session: DrillSession;
  shortcuts: Shortcut[];
  platform: Platform;
  plugin: ShortcutPlugin;
  onRestart(): void;
}

function Summary({ session, shortcuts, platform, plugin, onRestart }: SummaryProps) {
  const { m, p } = useI18n();
  const tr = (text: string) => p(plugin, text);
  const pluginId = plugin.id;
  const s = session.summary();
  const missed = s.missed.map((id) => shortcuts.find((x) => x.id === id)).filter((x): x is Shortcut => !!x);

  if (s.total === 0) {
    return (
      <div className="page center">
        <h2>{m.nothingToPractise}</h2>
        <p className="muted">{m.nothingHelp}</p>
        <a className="button" href={href({ name: 'plugin', pluginId })}>
          {m.back}
        </a>
      </div>
    );
  }

  return (
    <div className="page summary">
      <h1>{m.sessionComplete}</h1>
      <div className="stats">
        <div>
          <strong>{Math.round(s.accuracy * 100)}%</strong>
          <span>{m.accuracy}</span>
        </div>
        <div>
          <strong>{s.avgMs === null ? '—' : `${(s.avgMs / 1000).toFixed(2)}s`}</strong>
          <span>{m.avgTime}</span>
        </div>
        <div>
          <strong>
            {s.correct}/{s.total}
          </strong>
          <span>{m.correct}</span>
        </div>
      </div>
      {missed.length > 0 && (
        <section className="panel">
          <h3>{m.reviewThese}</h3>
          <table className="shortcut-table">
            <tbody>
              {missed.map((s) => (
                <tr key={s.id}>
                  <td>
                    {tr(s.action)}
                    {s.context && <span className="context">{tr(s.context)}</span>}
                  </td>
                  <td>
                    <BindingsCaps bindings={s.bindings} platform={platform} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
      <div className="row center">
        <button className="primary" onClick={onRestart}>
          {m.again}
        </button>
        <a className="button secondary" href={href({ name: 'plugin', pluginId })}>
          {m.back}
        </a>
      </div>
    </div>
  );
}
