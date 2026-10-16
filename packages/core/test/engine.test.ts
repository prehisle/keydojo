import { describe, expect, it } from 'vitest';
import {
  compilePack,
  DrillSession,
  isCapturable,
  masteryOf,
  newCard,
  parseSequence,
  review,
  SequenceMatcher,
  stroke,
  type ShortcutPackDef,
} from '../src';

const def: ShortcutPackDef = {
  id: 't',
  name: 'Test',
  shortcuts: [
    { id: 'palette', action: 'Palette', keys: ['Mod+Shift+P', 'F1'] },
    { id: 'chord', action: 'Keyboard shortcuts', keys: 'Mod+K Mod+S', level: 2 },
    { id: 'close', action: 'Close', keys: 'Mod+W', mac: 'Cmd+W' },
    { id: 'linux-only', action: 'Format', keys: 'Shift+Alt+F', linux: 'Ctrl+Shift+I' },
  ],
};

describe('compilePack', () => {
  it('applies platform overrides', () => {
    const { pack } = compilePack(def, 'linux');
    expect(pack.shortcuts.find((s) => s.id === 'linux-only')!.bindings).toEqual([parseSequence('Ctrl+Shift+I', 'linux')]);
  });

  it('reports bad keys without dropping the rest', () => {
    const { pack, issues } = compilePack(
      { id: 'x', name: 'x', shortcuts: [{ id: 'bad', action: 'Bad', keys: 'Hyper+Q' }, ...def.shortcuts] },
      'linux',
    );
    expect(pack.shortcuts).toHaveLength(4);
    expect(issues).toEqual([{ shortcutId: 'bad', message: expect.stringContaining('Hyper') }]);
  });

  it('detects duplicate and prefix conflicts in the same context', () => {
    const { issues } = compilePack(
      {
        id: 'x',
        name: 'x',
        shortcuts: [
          { id: 'a', action: 'A', keys: 'Ctrl+K' },
          { id: 'b', action: 'B', keys: 'Ctrl+K Ctrl+S' },
          { id: 'c', action: 'C', keys: 'Ctrl+K', context: 'other' },
          { id: 'd', action: 'D', keys: 'Ctrl+K' },
        ],
      },
      'linux',
    );
    expect(issues.map((i) => i.shortcutId).sort()).toEqual(['b', 'd', 'd']);
  });
});

describe('SequenceMatcher', () => {
  it('reports progress through a chord, then success', () => {
    const m = new SequenceMatcher([parseSequence('Ctrl+K Ctrl+S', 'linux')]);
    expect(m.push(stroke('KeyK', 'Ctrl'))).toBe('progress');
    expect(m.push(stroke('KeyS', 'Ctrl'))).toBe('correct');
  });

  it('accepts any alternative binding', () => {
    const m = new SequenceMatcher([parseSequence('Ctrl+Shift+P', 'linux'), parseSequence('F1', 'linux')]);
    expect(m.push(stroke('F1'))).toBe('correct');
  });

  it('fails on the first wrong stroke', () => {
    const m = new SequenceMatcher([parseSequence('Ctrl+B %', 'linux')]);
    expect(m.push(stroke('KeyB', 'Ctrl'))).toBe('progress');
    expect(m.push(stroke('Digit5'))).toBe('wrong');
  });
});

describe('isCapturable', () => {
  it('flags shortcuts the browser swallows', () => {
    expect(isCapturable(parseSequence('Ctrl+W', 'linux'), 'linux', 'browser')).toBe(false);
    expect(isCapturable(parseSequence('Ctrl+K Ctrl+W', 'linux'), 'linux', 'browser')).toBe(false);
    expect(isCapturable(parseSequence('Ctrl+W', 'linux'), 'linux', 'desktop')).toBe(true);
    expect(isCapturable(parseSequence('Cmd+W', 'mac'), 'mac', 'browser')).toBe(false);
    expect(isCapturable(parseSequence('Ctrl+Shift+P', 'linux'), 'linux', 'browser')).toBe(true);
  });
});

describe('SRS', () => {
  it('grows intervals on success and resets on failure', () => {
    let card = newCard(0);
    card = review(card, 'good', 0);
    expect(masteryOf(card)).toBe('learning');
    card = review(card, 'good', card.due);
    card = review(card, 'good', card.due);
    expect(masteryOf(card)).toBe('young');
    card = review(card, 'again', card.due);
    expect(card.lapses).toBe(1);
    expect(masteryOf(card)).toBe('learning');
  });
});

describe('DrillSession', () => {
  const { pack } = compilePack(def, 'linux');

  it('introduces new cards in level order and re-queues misses', () => {
    const session = new DrillSession(pack.shortcuts, {}, { mode: 'smart', size: 4, now: () => 1000 });
    expect(session.current!.level).toBe(1);
    const first = session.current!.id;
    session.answer(false, 3000);
    expect(session.remaining).toBe(4);
    session.answer(true, 500);
    session.answer(true, 500);
    session.answer(true, 500);
    expect(session.current!.id).toBe(first);
    session.answer(true, 800);
    expect(session.done).toBe(true);

    const summary = session.summary();
    expect(summary).toMatchObject({ total: 5, correct: 4, missed: [first] });
    expect(session.updatedProgress[first]!.lapses).toBe(1);
  });

  it('does not mutate the progress it was given', () => {
    const progress = {};
    const session = new DrillSession(pack.shortcuts, progress, { mode: 'speed', size: 2, random: () => 0.5 });
    session.answer(true, 400);
    expect(progress).toEqual({});
    expect(Object.keys(session.updatedProgress)).toHaveLength(1);
  });

  it('prefers due cards over new ones', () => {
    const due = { ...newCard(0), lastReviewed: 1, due: 500, interval: 1 };
    const session = new DrillSession(pack.shortcuts, { chord: due }, { mode: 'smart', size: 2, now: () => 1000 });
    expect(session.current!.id).toBe('chord');
  });
});
