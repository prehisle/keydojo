import type { Shortcut } from './pack';
import { gradeAttempt, newCard, review, targetMsFor, type Grade, type ProgressMap } from './srs';

/**
 * - `smart`: spaced repetition — due cards first, then a few new ones. Misses come back
 *   later in the same session.
 * - `speed`: random shortcuts against the clock; only reaction times are recorded.
 */
export type DrillMode = 'smart' | 'speed';

export interface DrillOptions {
  mode: DrillMode;
  /** Number of prompts in the session. */
  size: number;
  /** Cap on never-seen shortcuts introduced in one smart session. */
  maxNew?: number;
  now?: () => number;
  random?: () => number;
}

export interface DrillResult {
  shortcutId: string;
  correct: boolean;
  ms: number;
  grade: Grade;
}

export interface DrillSummary {
  total: number;
  correct: number;
  accuracy: number;
  avgMs: number | null;
  /** Shortcuts missed at least once, in order of first miss. */
  missed: string[];
}

// How many prompts later a missed card reappears.
const RETRY_GAP = 3;

export class DrillSession {
  private queue: Shortcut[];
  private results: DrillResult[] = [];
  private readonly now: () => number;

  constructor(
    shortcuts: Shortcut[],
    private progress: ProgressMap,
    private readonly options: DrillOptions,
  ) {
    this.now = options.now ?? Date.now;
    const random = options.random ?? Math.random;
    this.queue =
      options.mode === 'speed'
        ? shuffle(shortcuts, random).slice(0, options.size)
        : pickSmart(shortcuts, progress, options.size, options.maxNew ?? 5, this.now());
  }

  get current(): Shortcut | null {
    return this.queue[0] ?? null;
  }

  get remaining(): number {
    return this.queue.length;
  }

  get done(): boolean {
    return this.queue.length === 0;
  }

  /** The updated progress. The session never mutates the map it was given. */
  get updatedProgress(): ProgressMap {
    return this.progress;
  }

  answer(correct: boolean, ms: number): DrillResult {
    const item = this.queue.shift();
    if (!item) throw new Error('Drill session is finished');

    const strokes = Math.min(...item.bindings.map((b) => b.length));
    const grade = gradeAttempt(correct, ms, targetMsFor(strokes));
    const now = this.now();
    const prev = this.progress[item.id] ?? newCard(now);
    // A miss in speed mode still resets the card; a hit only feeds the timing average.
    const next =
      this.options.mode === 'speed' && correct
        ? { ...prev, avgMs: prev.avgMs === null ? ms : prev.avgMs * 0.7 + ms * 0.3 }
        : review(prev, grade, now, ms);
    this.progress = { ...this.progress, [item.id]: next };

    if (!correct && this.options.mode === 'smart') {
      this.queue.splice(Math.min(RETRY_GAP, this.queue.length), 0, item);
    }

    const result = { shortcutId: item.id, correct, ms, grade };
    this.results.push(result);
    return result;
  }

  summary(): DrillSummary {
    const total = this.results.length;
    const hits = this.results.filter((r) => r.correct);
    const missed: string[] = [];
    for (const r of this.results) if (!r.correct && !missed.includes(r.shortcutId)) missed.push(r.shortcutId);
    return {
      total,
      correct: hits.length,
      accuracy: total ? hits.length / total : 0,
      avgMs: hits.length ? hits.reduce((s, r) => s + r.ms, 0) / hits.length : null,
      missed,
    };
  }
}

function pickSmart(shortcuts: Shortcut[], progress: ProgressMap, size: number, maxNew: number, now: number): Shortcut[] {
  const due = shortcuts
    .filter((s) => progress[s.id] && progress[s.id]!.due <= now)
    .sort((a, b) => progress[a.id]!.due - progress[b.id]!.due);
  const fresh = shortcuts.filter((s) => !progress[s.id]).sort((a, b) => a.level - b.level);

  const picked = due.slice(0, size);
  picked.push(...fresh.slice(0, Math.min(maxNew, size - picked.length)));

  // Nothing due and nothing new: practise the cards that are due soonest anyway.
  if (picked.length < size) {
    const rest = shortcuts
      .filter((s) => !picked.includes(s) && progress[s.id])
      .sort((a, b) => progress[a.id]!.due - progress[b.id]!.due);
    picked.push(...rest.slice(0, size - picked.length));
  }
  return picked;
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}
