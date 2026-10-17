import { describe, expect, it } from 'vitest';
import { compilePack, parseStroke, resolveScenario, ScenarioRun, updateRecord, type ScenarioDef } from '../src';

const { pack } = compilePack(
  {
    id: 't',
    name: 't',
    shortcuts: [
      { id: 'depot', action: 'Build Supply Depot', keys: 'B S' },
      { id: 'scv', action: 'Train SCV', keys: 'S' },
    ],
  },
  'linux',
);
const key = (k: string) => parseStroke(k, 'linux');

const def: ScenarioDef = {
  id: 'opener',
  name: 'Opener',
  steps: [{ shortcut: 'scv', times: 2 }, { shortcut: 'depot', note: '14' }, { shortcut: 'gone' }],
};

describe('resolveScenario', () => {
  it('expands repeats and reports missing shortcuts', () => {
    const { steps, missing } = resolveScenario(def, pack.shortcuts);
    expect(steps.map((s) => s.shortcut.id)).toEqual(['scv', 'scv', 'depot']);
    expect(steps[2]!.note).toBe('14');
    expect(missing).toEqual(['gone']);
  });
});

describe('ScenarioRun', () => {
  const setup = () => {
    let t = 1000;
    const run = new ScenarioRun(resolveScenario(def, pack.shortcuts).steps, () => t);
    return { run, advance: (ms: number) => (t += ms) };
  };

  it('starts the clock on the first key and records splits', () => {
    const { run, advance } = setup();
    advance(5000); // reading time is free
    expect(run.elapsedMs()).toBe(0);
    expect(run.press(key('S'))).toBe('step');
    advance(300);
    expect(run.press(key('S'))).toBe('step');
    advance(200);
    expect(run.press(key('B'))).toBe('progress');
    advance(100);
    expect(run.press(key('S'))).toBe('finished');
    expect(run.result()).toEqual({ totalMs: 600, mistakes: 0, splits: [0, 300, 300] });
  });

  it('counts mistakes and makes the step be retyped', () => {
    const { run } = setup();
    run.press(key('S'));
    run.press(key('S'));
    expect(run.press(key('X'))).toBe('wrong');
    expect(run.currentIndex).toBe(2);
    expect(run.typed).toEqual([]);
    run.press(key('B'));
    expect(run.press(key('S'))).toBe('finished');
    expect(run.mistakes).toBe(1);
    expect([...run.missedSteps]).toEqual([2]);
  });
});

describe('updateRecord', () => {
  it('tracks best overall and best clean runs', () => {
    let rec = updateRecord(undefined, { totalMs: 900, mistakes: 1, splits: [] });
    expect(rec).toMatchObject({ runs: 1, bestMs: 900, bestMistakes: 1, bestCleanMs: null });
    rec = updateRecord(rec, { totalMs: 1200, mistakes: 0, splits: [] });
    expect(rec).toMatchObject({ runs: 2, bestMs: 900, bestCleanMs: 1200 });
    rec = updateRecord(rec, { totalMs: 800, mistakes: 0, splits: [] });
    expect(rec).toMatchObject({ runs: 3, bestMs: 800, bestMistakes: 0, bestCleanMs: 800 });
  });
});
