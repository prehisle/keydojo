import {
  ScenarioRun,
  isCapturable,
  resolveScenario,
  strokeFromEvent,
  updateRecord,
  type CaptureEnv,
  type Platform,
  type ScenarioRecord,
  type ScenarioResult,
  type ScenarioStep,
  type ShortcutPlugin,
} from '@keydojo/core';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useI18n } from '../i18n';
import { href } from '../router';
import { store } from '../storage';
import { usePluginData } from '../usePluginData';
import { BindingsCaps, SequenceCaps } from './KeyCaps';

interface Props {
  plugin: ShortcutPlugin;
  scenarioId: string;
  platform: Platform;
  env: CaptureEnv;
}

// How many finished / upcoming steps to show around the current one.
const STEPS_BEFORE = 2;
const STEPS_AFTER = 5;

export const formatMs = (ms: number) => `${(ms / 1000).toFixed(ms < 60_000 ? 2 : 1)}s`;

export function ScenarioView(props: Props) {
  // Bumping the key restarts with a fresh run.
  const [attempt, setAttempt] = useState(0);
  return <Scenario key={attempt} {...props} onRestart={() => setAttempt((n) => n + 1)} />;
}

function Scenario({ plugin, scenarioId, platform, env, onRestart }: Props & { onRestart(): void }) {
  const { m, p } = useI18n();
  const tr = (text: string) => p(plugin, text);
  const data = usePluginData(plugin, platform, env);
  const def = data.scenarios.find((s) => s.id === scenarioId);
  const [resolved] = useState(() => (def ? resolveScenario(def, data.shortcuts) : null));
  const blocked = resolved?.steps.filter((s) => !s.shortcut.bindings.some((b) => isCapturable(b, platform, env))) ?? [];

  const back = (
    <a href={href({ name: 'plugin', pluginId: plugin.id })} className="muted">
      ← {tr(plugin.name)}
    </a>
  );

  if (!def || !resolved || resolved.steps.length === 0) {
    return (
      <div className="page center">
        <h2>{m.scenarioUnavailable}</h2>
        <p className="muted">{m.scenarioUnavailableHelp}</p>
        {back}
      </div>
    );
  }
  if (blocked.length > 0) {
    return (
      <div className="page center">
        <h2>{tr(def.name)}</h2>
        <p className="error">
          {m.blockedSteps(blocked.length)} <BindingsCaps bindings={blocked[0]!.shortcut.bindings} platform={platform} />.{' '}
          {m.blockedStepsHelp}
        </p>
        {back}
      </div>
    );
  }
  return (
    <Runner
      plugin={plugin}
      scenarioId={def.id}
      name={tr(def.name)}
      steps={resolved.steps}
      missing={resolved.missing}
      platform={platform}
      back={back}
      onRestart={onRestart}
    />
  );
}

interface RunnerProps {
  plugin: ShortcutPlugin;
  scenarioId: string;
  name: string;
  steps: ScenarioStep[];
  missing: string[];
  platform: Platform;
  back: ReactNode;
  onRestart(): void;
}

type Phase = 'answer' | 'reveal';

function Runner({ plugin, scenarioId, name, steps, missing, platform, back, onRestart }: RunnerProps) {
  const { m, p } = useI18n();
  const tr = (text: string) => p(plugin, text);
  const pluginId = plugin.id;
  const [run] = useState(() => new ScenarioRun(steps, () => performance.now()));
  const [, setTick] = useState(0);
  const rerender = () => setTick((n) => n + 1);
  const [phase, setPhase] = useState<Phase>('answer');
  const [shake, setShake] = useState(0);
  const [showKeys, setShowKeys] = useState(false);
  const [imeWarning, setImeWarning] = useState(false);
  const [finished, setFinished] = useState<{ result: ScenarioResult; prev?: ScenarioRecord; recorded: boolean } | null>(null);

  // Refs let the long-lived listener see the latest state without re-subscribing.
  const handler = useRef<(e: KeyboardEvent) => void>(() => {});
  handler.current = (e: KeyboardEvent) => {
    if (run.done) return;
    if (e.isComposing || e.key === 'Process') {
      e.preventDefault();
      setImeWarning(true);
      return;
    }
    const s = strokeFromEvent(e);
    if (!s) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.repeat) return;
    setImeWarning(false);

    const state = run.press(s);
    if (state === 'wrong') {
      setPhase('reveal');
      setShake((n) => n + 1);
    } else if (state === 'step') {
      setPhase('answer');
    } else if (state === 'finished') {
      const result = run.result();
      const records = store.scenarioRecords(pluginId);
      const prev = records[scenarioId];
      // Runs with the keys on screen are practice, not records.
      if (!showKeys) store.setScenarioRecords(pluginId, { ...records, [scenarioId]: updateRecord(prev, result) });
      setFinished({ result, prev, recorded: !showKeys });
    }
    rerender();
  };

  useEffect(() => {
    const listener = (e: KeyboardEvent) => handler.current(e);
    window.addEventListener('keydown', listener, { capture: true });
    return () => window.removeEventListener('keydown', listener, { capture: true });
  }, []);

  // Keep the clock moving while a run is in progress.
  useEffect(() => {
    if (finished) return;
    const id = window.setInterval(() => run.started && rerender(), 100);
    return () => window.clearInterval(id);
  }, [finished, run]);

  if (finished) {
    return (
      <ScenarioSummary
        plugin={plugin}
        name={name}
        steps={steps}
        missed={run.missedSteps}
        {...finished}
        platform={platform}
        back={back}
        onRestart={onRestart}
      />
    );
  }

  const index = run.currentIndex;
  const step = run.current!;
  const typed = run.typed;
  const window_ = steps.slice(Math.max(0, index - STEPS_BEFORE), index + STEPS_AFTER + 1);
  const offset = Math.max(0, index - STEPS_BEFORE);

  return (
    <div className="drill">
      <div className="drill-top">
        {back}
        <span className="muted">
          {name} · {index} / {steps.length}
        </span>
      </div>
      <div className="progress">
        <div style={{ width: `${(index / steps.length) * 100}%` }} />
      </div>

      <div className="scenario-clock">
        <strong>{formatMs(run.elapsedMs())}</strong>
        <span className={run.mistakes > 0 ? 'bad' : 'muted'}>
          {m.mistakes(run.mistakes)}
        </span>
      </div>

      <div className={`prompt ${phase}`}>
        {step.shortcut.context && <div className="context big">{tr(step.shortcut.context)}</div>}
        <h1>{tr(step.shortcut.action)}</h1>
        {step.note && <p className="muted">{tr(step.note)}</p>}
        <div className="typed" key={shake}>
          {typed.length > 0 ? (
            <SequenceCaps sequence={typed} platform={platform} />
          ) : (
            <span className="muted">{run.started ? '…' : m.pressToStart}</span>
          )}
        </div>
        {(phase === 'reveal' || showKeys) && (
          <div className="reveal">
            <BindingsCaps bindings={step.shortcut.bindings} platform={platform} />
          </div>
        )}
      </div>

      <ol className="scenario-steps" start={offset + 1}>
        {window_.map((s, i) => {
          const n = offset + i;
          const cls = n < index ? 'done' : n === index ? 'current' : '';
          return (
            <li key={n} className={cls}>
              <span>
                {tr(s.shortcut.action)}
                {s.shortcut.context && <span className="context">{tr(s.shortcut.context)}</span>}
              </span>
              {s.note && <span className="muted small">{tr(s.note)}</span>}
            </li>
          );
        })}
      </ol>

      {imeWarning && <p className="error center">{m.imeActive}</p>}
      {missing.length > 0 && (
        <p className="muted small center">{m.missingSteps(missing.length)}</p>
      )}
      {!run.started && (
        <label className="center small muted show-keys">
          <input type="checkbox" checked={showKeys} onChange={(e) => setShowKeys(e.target.checked)} /> {m.showKeys}
        </label>
      )}
    </div>
  );
}

interface SummaryProps {
  plugin: ShortcutPlugin;
  name: string;
  steps: ScenarioStep[];
  missed: ReadonlySet<number>;
  result: ScenarioResult;
  prev?: ScenarioRecord;
  recorded: boolean;
  platform: Platform;
  back: ReactNode;
  onRestart(): void;
}

function ScenarioSummary({ plugin, name, steps, missed, result, prev, recorded, platform, back, onRestart }: SummaryProps) {
  const { m, p } = useI18n();
  const tr = (text: string) => p(plugin, text);
  const newBest = recorded && (!prev || result.totalMs < prev.bestMs);
  const slowest = Math.max(...result.splits);
  const best = recorded ? Math.min(prev?.bestMs ?? Infinity, result.totalMs) : prev?.bestMs;

  return (
    <div className="page summary">
      <div className="drill-top">{back}</div>
      <h1>{name}</h1>
      {newBest && prev && <p className="good">{m.newBest(formatMs(prev.bestMs - result.totalMs))}</p>}
      {!recorded && <p className="muted">{m.practiceRun}</p>}
      <div className="stats">
        <div>
          <strong>{formatMs(result.totalMs)}</strong>
          <span>{m.time}</span>
        </div>
        <div>
          <strong>{result.mistakes}</strong>
          <span>{m.mistakesLabel}</span>
        </div>
        <div>
          <strong>{best === undefined ? '—' : formatMs(best)}</strong>
          <span>{m.best}</span>
        </div>
      </div>
      <section className="panel">
        <h3>{m.splits}</h3>
        <table className="shortcut-table">
          <tbody>
            {steps.map((s, i) => (
              <tr key={i} className={missed.has(i) ? 'missed' : ''}>
                <td>
                  {tr(s.shortcut.action)}
                  {s.shortcut.context && <span className="context">{tr(s.shortcut.context)}</span>}
                </td>
                <td>
                  <BindingsCaps bindings={s.shortcut.bindings} platform={platform} />
                </td>
                <td className={`nowrap ${result.splits[i] === slowest ? 'bad' : 'muted'}`}>{formatMs(result.splits[i] ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <div className="row center">
        <button className="primary" onClick={onRestart} autoFocus>
          {m.again}
        </button>
      </div>
    </div>
  );
}
