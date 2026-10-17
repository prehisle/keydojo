import type { KeyStroke } from './keys';
import { SequenceMatcher } from './matcher';
import type { Shortcut } from './pack';

/**
 * A scenario is a fixed series of shortcuts performed in order against the clock — a
 * StarCraft build order, or a multi-step editing task. Steps reference shortcuts by id, so a
 * scenario always uses the bindings of the active pack, including imported custom ones.
 */
export interface ScenarioDef {
  /** Stable id, unique within the plugin. Records are stored against it. */
  id: string;
  name: string;
  description?: string;
  steps: ScenarioStepDef[];
}

export interface ScenarioStepDef {
  /** Id of a shortcut in the plugin's pack. */
  shortcut: string;
  /** Shown next to the step, e.g. the supply count in a build order. */
  note?: string;
  /** Perform the step this many times in a row (default 1). */
  times?: number;
}

export interface ScenarioStep {
  shortcut: Shortcut;
  note?: string;
}

export interface ResolvedScenario {
  steps: ScenarioStep[];
  /** Step shortcut ids not found in the pack (e.g. removed by an imported config). */
  missing: string[];
}

export function resolveScenario(def: ScenarioDef, shortcuts: Shortcut[]): ResolvedScenario {
  const byId = new Map(shortcuts.map((s) => [s.id, s]));
  const steps: ScenarioStep[] = [];
  const missing: string[] = [];
  for (const step of def.steps) {
    const shortcut = byId.get(step.shortcut);
    if (!shortcut) {
      if (!missing.includes(step.shortcut)) missing.push(step.shortcut);
      continue;
    }
    for (let i = 0; i < (step.times ?? 1); i++) steps.push({ shortcut, note: step.note });
  }
  return { steps, missing };
}

export type ScenarioPress = 'progress' | 'step' | 'wrong' | 'finished';

export interface ScenarioResult {
  totalMs: number;
  mistakes: number;
  /** Time spent on each step, from finishing the previous one. */
  splits: number[];
}

/**
 * One timed attempt. The clock starts on the first key press, so reading the first prompt is
 * free. A wrong key counts as a mistake and the step must be retyped; there is no skipping.
 */
export class ScenarioRun {
  private index = 0;
  private matcher: SequenceMatcher;
  private startedAt: number | null = null;
  private stepStartedAt = 0;
  private finishedAt: number | null = null;
  private readonly splits: number[] = [];
  private mistakeCount = 0;
  /** Steps on which the user made at least one mistake. */
  readonly missedSteps = new Set<number>();

  constructor(
    readonly steps: ScenarioStep[],
    private readonly now: () => number = Date.now,
  ) {
    if (steps.length === 0) throw new Error('A scenario needs at least one step');
    this.matcher = new SequenceMatcher(steps[0]!.shortcut.bindings);
  }

  get current(): ScenarioStep | null {
    return this.steps[this.index] ?? null;
  }

  get currentIndex(): number {
    return this.index;
  }

  get done(): boolean {
    return this.index >= this.steps.length;
  }

  get started(): boolean {
    return this.startedAt !== null;
  }

  get mistakes(): number {
    return this.mistakeCount;
  }

  get typed(): readonly KeyStroke[] {
    return this.matcher.strokes;
  }

  /** Time since the first key press (frozen once finished). */
  elapsedMs(): number {
    if (this.startedAt === null) return 0;
    return (this.finishedAt ?? this.now()) - this.startedAt;
  }

  press(stroke: KeyStroke): ScenarioPress {
    if (this.done) return 'finished';
    const t = this.now();
    if (this.startedAt === null) {
      this.startedAt = t;
      this.stepStartedAt = t;
    }
    const state = this.matcher.push(stroke);
    if (state === 'progress') return 'progress';
    if (state === 'wrong') {
      this.mistakeCount++;
      this.missedSteps.add(this.index);
      this.matcher.reset();
      return 'wrong';
    }
    this.splits.push(t - this.stepStartedAt);
    this.stepStartedAt = t;
    this.index++;
    if (this.done) {
      this.finishedAt = t;
      return 'finished';
    }
    this.matcher = new SequenceMatcher(this.steps[this.index]!.shortcut.bindings);
    return 'step';
  }

  result(): ScenarioResult {
    if (!this.done) throw new Error('Scenario is not finished');
    return { totalMs: this.elapsedMs(), mistakes: this.mistakeCount, splits: [...this.splits] };
  }
}

/** Personal records for one scenario. */
export interface ScenarioRecord {
  runs: number;
  /** Fastest run regardless of mistakes. */
  bestMs: number;
  bestMistakes: number;
  /** Fastest run without a single mistake, if any. */
  bestCleanMs: number | null;
  last: ScenarioResult;
}

export function updateRecord(prev: ScenarioRecord | undefined, r: ScenarioResult): ScenarioRecord {
  const faster = !prev || r.totalMs < prev.bestMs;
  const clean = r.mistakes === 0 && (prev?.bestCleanMs == null || r.totalMs < prev.bestCleanMs);
  return {
    runs: (prev?.runs ?? 0) + 1,
    bestMs: faster ? r.totalMs : prev.bestMs,
    bestMistakes: faster ? r.mistakes : prev.bestMistakes,
    bestCleanMs: clean ? r.totalMs : (prev?.bestCleanMs ?? null),
    last: r,
  };
}
