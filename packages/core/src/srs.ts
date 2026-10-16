/**
 * Spaced repetition scheduling, SM-2 style, with grades derived from correctness and
 * reaction time instead of self-rating — for motor skills, speed is the honest signal.
 */

export type Grade = 'again' | 'hard' | 'good' | 'easy';

export interface CardState {
  reps: number;
  lapses: number;
  ease: number;
  /** Current interval in milliseconds. */
  interval: number;
  /** Epoch ms when the card is next due. */
  due: number;
  lastReviewed: number;
  /** Exponential moving average of correct-answer reaction time, ms. */
  avgMs: number | null;
}

export type ProgressMap = Record<string, CardState>;

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

export function newCard(now: number): CardState {
  return { reps: 0, lapses: 0, ease: 2.5, interval: 0, due: now, lastReviewed: 0, avgMs: null };
}

/**
 * @param ms time from prompt shown to final stroke
 * @param targetMs what counts as "fluent" for this stroke count
 */
export function gradeAttempt(correct: boolean, ms: number, targetMs: number): Grade {
  if (!correct) return 'again';
  if (ms <= targetMs * 0.6) return 'easy';
  if (ms <= targetMs * 1.5) return 'good';
  return 'hard';
}

/** Fluency target scales with the number of strokes in the answer. */
export function targetMsFor(strokeCount: number, baseMs = 1500): number {
  return baseMs + (strokeCount - 1) * 600;
}

export function review(card: CardState, grade: Grade, now: number, ms?: number): CardState {
  let { reps, lapses, ease, interval } = card;

  switch (grade) {
    case 'again':
      lapses += 1;
      reps = 0;
      ease = Math.max(1.3, ease - 0.2);
      interval = MINUTE;
      break;
    case 'hard':
      ease = Math.max(1.3, ease - 0.15);
      interval = reps === 0 ? 5 * MINUTE : Math.max(10 * MINUTE, interval * 1.2);
      reps += 1;
      break;
    case 'good':
      interval = reps === 0 ? 10 * MINUTE : reps === 1 ? DAY : interval * ease;
      reps += 1;
      break;
    case 'easy':
      ease += 0.15;
      interval = reps === 0 ? DAY : Math.max(DAY, interval * ease * 1.3);
      reps += 1;
      break;
  }

  const avgMs =
    grade === 'again' || ms === undefined ? card.avgMs : card.avgMs === null ? ms : card.avgMs * 0.7 + ms * 0.3;

  return { reps, lapses, ease, interval, due: now + interval, lastReviewed: now, avgMs };
}

export type Mastery = 'new' | 'learning' | 'young' | 'mature';

export function masteryOf(card: CardState | undefined): Mastery {
  if (!card || card.reps + card.lapses === 0) return 'new';
  if (card.interval < DAY) return 'learning';
  if (card.interval < 21 * DAY) return 'young';
  return 'mature';
}
