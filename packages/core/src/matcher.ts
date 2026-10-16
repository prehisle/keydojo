import { strokesEqual, type KeySequence, type KeyStroke } from './keys';

export type MatchState = 'progress' | 'correct' | 'wrong';

/**
 * Checks strokes typed during a drill against the accepted bindings, one stroke at a time,
 * so multi-stroke answers (`Ctrl+K Ctrl+S`, `Ctrl+B %`) can show progress as they go.
 */
export class SequenceMatcher {
  private typed: KeyStroke[] = [];

  constructor(private readonly bindings: KeySequence[]) {}

  push(s: KeyStroke): MatchState {
    this.typed.push(s);
    const n = this.typed.length;
    const candidates = this.bindings.filter(
      (b) => b.length >= n && this.typed.every((t, i) => strokesEqual(t, b[i]!)),
    );
    if (candidates.some((b) => b.length === n)) return 'correct';
    return candidates.length > 0 ? 'progress' : 'wrong';
  }

  get strokes(): readonly KeyStroke[] {
    return this.typed;
  }

  reset(): void {
    this.typed = [];
  }
}
