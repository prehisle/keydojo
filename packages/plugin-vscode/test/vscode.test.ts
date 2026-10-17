import { compilePack, parseSequence, pluginTexts, type Platform } from '@keydojo/core';
import { describe, expect, it } from 'vitest';
import { humanizeCommand, importKeybindings, stripJsonc, vscodePlugin } from '../src';

const base = vscodePlugin.buildPack({ platform: 'linux', settings: {} });

describe('default pack', () => {
  it.each<Platform>(['windows', 'mac', 'linux'])('compiles without issues on %s', (platform) => {
    expect(compilePack(base, platform).issues).toEqual([]);
  });
});

describe('stripJsonc', () => {
  it('removes comments and trailing commas but keeps strings', () => {
    const text = `[
      // comment
      { "key": "ctrl+/", "command": "a//b", /* inline */ },
    ]`;
    expect(JSON.parse(stripJsonc(text))).toEqual([{ key: 'ctrl+/', command: 'a//b' }]);
  });
});

describe('importKeybindings', () => {
  const json = `// Place your key bindings in this file
  [
    { "key": "ctrl+shift+d", "command": "editor.action.copyLinesDownAction" },
    { "key": "ctrl+shift+alt+down", "command": "-editor.action.copyLinesDownAction" },
    { "key": "ctrl+alt+t", "command": "workbench.action.terminal.focus", "when": "terminalProcessSupported" },
    { "command": "-workbench.action.gotoLine" },
    { "key": "ctrl+[KeyJ]", "command": "workbench.action.togglePanel" },
  ]`;
  const { pack, warnings } = importKeybindings(json, base, 'linux');
  const get = (id: string) => compilePack(pack, 'linux').pack.shortcuts.find((s) => s.id === id);

  it('replaces removed defaults with the user binding', () => {
    expect(get('editor.action.copyLinesDownAction')!.bindings).toEqual([parseSequence('Ctrl+Shift+D', 'linux')]);
  });

  it('adds unknown commands with a readable label', () => {
    expect(get('workbench.action.terminal.focus')).toMatchObject({ action: 'Terminal › Focus', context: 'terminalProcessSupported' });
  });

  it('drops commands whose bindings were all removed', () => {
    expect(get('workbench.action.gotoLine')).toBeUndefined();
  });

  it('does not duplicate a binding that equals the default', () => {
    expect(get('workbench.action.togglePanel')!.bindings).toHaveLength(1);
  });

  it('summarizes what it did', () => {
    expect(warnings[0]).toBe('Applied 3 bindings and 2 removals from keybindings.json');
  });

  it('reports invalid JSON', () => {
    expect(importKeybindings('[{', base, 'linux').warnings[0]).toMatch(/Could not parse/);
  });
});

describe('humanizeCommand', () => {
  it('strips common prefixes and splits camelCase', () => {
    expect(humanizeCommand('editor.action.formatDocument')).toBe('Format Document');
  });
});

describe('translations', () => {
  it('has Chinese for every text the UI shows', () => {
    const texts = pluginTexts(vscodePlugin, [{ platform: 'linux', settings: {} }]);
    // Names and file formats stay as they are; bare supply counts like "12–13" need no translation.
    const untranslated = [...texts].filter((t) => /[A-Za-z]/.test(t) && !['VS Code', 'keybindings.json'].includes(t) && !vscodePlugin.messages?.zh?.[t]);
    expect(untranslated).toEqual([]);
  });
});
