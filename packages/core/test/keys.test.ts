import { describe, expect, it } from 'vitest';
import {
  formatSequence,
  KeyParseError,
  parseSequence,
  parseStroke,
  sequenceToNotation,
  stroke,
  strokeFromEvent,
} from '../src';

describe('parseStroke', () => {
  it('parses modifiers in any order and normalizes them', () => {
    expect(parseStroke('shift+ctrl+p', 'windows')).toEqual(stroke('KeyP', 'Ctrl', 'Shift'));
  });

  it('resolves Mod per platform', () => {
    expect(parseStroke('Mod+K', 'mac')).toEqual(stroke('KeyK', 'Meta'));
    expect(parseStroke('Mod+K', 'linux')).toEqual(stroke('KeyK', 'Ctrl'));
  });

  it('treats shifted symbols as Shift + base key', () => {
    expect(parseStroke('%', 'linux')).toEqual(stroke('Digit5', 'Shift'));
    expect(parseStroke('"', 'linux')).toEqual(stroke('Quote', 'Shift'));
  });

  it('handles + as a key', () => {
    expect(parseStroke('Ctrl++', 'linux')).toEqual(stroke('Equal', 'Ctrl', 'Shift'));
    expect(parseStroke('+', 'linux')).toEqual(stroke('Equal', 'Shift'));
  });

  it('parses named and function keys', () => {
    expect(parseStroke('Ctrl+`', 'linux')).toEqual(stroke('Backquote', 'Ctrl'));
    expect(parseStroke('shift+f12', 'linux')).toEqual(stroke('F12', 'Shift'));
    expect(parseStroke('Alt+Up', 'linux')).toEqual(stroke('ArrowUp', 'Alt'));
  });

  it('rejects unknown modifiers and keys', () => {
    expect(() => parseStroke('Hyper+A', 'linux')).toThrow(KeyParseError);
    expect(() => parseStroke('Ctrl+§', 'linux')).toThrow(KeyParseError);
  });
});

describe('sequences', () => {
  it('parses chords', () => {
    expect(parseSequence('Ctrl+K Ctrl+S', 'linux')).toEqual([stroke('KeyK', 'Ctrl'), stroke('KeyS', 'Ctrl')]);
  });

  it('round-trips through notation', () => {
    for (const text of ['Ctrl+B %', 'Mod+Shift+P', 'Ctrl+Shift+`', 'Shift+Alt+Down', 'F5', 'Ctrl+Space', 'Mod+\\']) {
      const seq = parseSequence(text, 'mac');
      expect(parseSequence(sequenceToNotation(seq), 'mac')).toEqual(seq);
    }
  });

  it('formats for display per platform', () => {
    const seq = parseSequence('Mod+Shift+P', 'mac');
    expect(formatSequence(seq, 'mac')).toBe('⇧⌘P');
    expect(formatSequence(parseSequence('Ctrl+B %', 'linux'), 'linux')).toBe('Ctrl+B %');
  });
});

describe('strokeFromEvent', () => {
  const ev = (code: string, mods: Partial<Record<'ctrlKey' | 'altKey' | 'shiftKey' | 'metaKey', boolean>> = {}) => ({
    code,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    ...mods,
  });

  it('ignores bare modifier presses', () => {
    expect(strokeFromEvent(ev('ControlLeft', { ctrlKey: true }))).toBeNull();
  });

  it('captures modifiers', () => {
    expect(strokeFromEvent(ev('KeyP', { ctrlKey: true, shiftKey: true }))).toEqual(stroke('KeyP', 'Ctrl', 'Shift'));
  });
});
