import { compilePack, defaultSettings, formatSequence, parseSequence, pluginTexts, stroke } from '@keydojo/core';
import { describe, expect, it } from 'vitest';
import { parseListKeys, parseTmuxKey, tmuxPlugin, tokenize } from '../src';

describe('parseTmuxKey', () => {
  it('parses tmux modifier notation', () => {
    expect(parseTmuxKey('C-b')).toEqual(stroke('KeyB', 'Ctrl'));
    expect(parseTmuxKey('C-B')).toEqual(stroke('KeyB', 'Ctrl'));
    expect(parseTmuxKey('M-Up')).toEqual(stroke('ArrowUp', 'Alt'));
    expect(parseTmuxKey('C-M-x')).toEqual(stroke('KeyX', 'Ctrl', 'Alt'));
    expect(parseTmuxKey('E')).toEqual(stroke('KeyE', 'Shift'));
    expect(parseTmuxKey('%')).toEqual(stroke('Digit5', 'Shift'));
    expect(parseTmuxKey('BTab')).toEqual(stroke('Tab', 'Shift'));
    expect(parseTmuxKey('C--')).toEqual(stroke('Minus', 'Ctrl'));
  });
});

describe('tokenize', () => {
  it('handles escapes and quotes', () => {
    expect(tokenize(`bind-key -T prefix \\" split-window`)).toEqual(['bind-key', '-T', 'prefix', '"', 'split-window']);
    expect(tokenize(`bind-key -T prefix '#' list-buffers`)).toEqual(['bind-key', '-T', 'prefix', '#', 'list-buffers']);
    expect(tokenize(`command-prompt -I "#W" { rename-window "%%" }`)).toEqual([
      'command-prompt', '-I', '#W', '{', 'rename-window', '%%', '}',
    ]);
  });
});

describe('tmux plugin', () => {
  it('builds a valid pack with no conflicts', () => {
    const def = tmuxPlugin.buildPack({ platform: 'linux', settings: defaultSettings(tmuxPlugin) });
    const { pack, issues } = compilePack(def, 'linux');
    expect(issues).toEqual([]);
    const split = pack.shortcuts.find((s) => s.id === 'split-horizontal')!;
    expect(formatSequence(split.bindings[0]!, 'linux')).toBe('Ctrl+B %');
  });

  it('applies a custom prefix', () => {
    const def = tmuxPlugin.buildPack({ platform: 'linux', settings: { prefix: 'C-a', modeKeys: 'emacs' } });
    const { pack } = compilePack(def, 'linux');
    expect(pack.shortcuts.find((s) => s.id === 'new-window')!.bindings[0]).toEqual(parseSequence('Ctrl+A C', 'linux'));
    expect(pack.shortcuts.some((s) => s.context === 'copy-mode-vi')).toBe(false);
  });
});

const LIST_KEYS = `
bind-key    -T copy-mode-vi C-v                  send-keys -X rectangle-toggle
bind-key    -T copy-mode    C-Space              send-keys -X begin-selection
bind-key    -T prefix       C-a                  send-prefix
bind-key    -T prefix       \\"                   split-window -c "#{pane_current_path}"
bind-key    -T prefix       %                    split-window -h -c "#{pane_current_path}"
bind-key    -T prefix       s                    choose-tree -Zs
bind-key    -T prefix       x                    confirm-before -p "kill-pane #P? (y/n)" kill-pane
bind-key -r -T prefix       C-Up                 resize-pane -U
bind-key    -T prefix       r                    source-file ~/.tmux.conf
bind-key    -T root         MouseDown1Pane       select-pane -t = \; send-keys -M
bind-key    -T root         M-h                  select-pane -L
bind-key    -T my-table     a                    display-message hi
`;

describe('parseListKeys', () => {
  const result = parseListKeys(LIST_KEYS, { prefix: stroke('KeyA', 'Ctrl'), copyTable: 'copy-mode-vi' });
  const byId = Object.fromEntries(result.pack.shortcuts.map((s) => [s.id, s]));

  it('reuses default ids for unchanged bindings', () => {
    expect(byId['split-horizontal']).toMatchObject({ keys: 'Ctrl+A Shift+5' });
    expect(byId['split-vertical']).toMatchObject({ action: 'Split pane top / bottom' });
    expect(byId['choose-session']).toBeDefined();
    expect(byId['kill-pane']).toBeDefined();
    expect(byId['resize-up']).toBeDefined();
  });

  it('keeps custom bindings with generated ids', () => {
    expect(byId['prefix:r']).toMatchObject({ action: 'Reload tmux config', keys: 'Ctrl+A R' });
    expect(byId['root:M-h']).toMatchObject({ action: 'Move to the pane on the left', keys: 'Alt+H' });
    expect(byId['copy-mode-vi:C-v']).toMatchObject({ context: 'copy-mode-vi' });
  });

  it('skips mouse, other tables and the unchosen copy table, and spots the prefix', () => {
    expect(byId['copy-mode:C-Space']).toBeUndefined();
    expect(byId['my-table:a']).toBeUndefined();
    expect(result.suggestedPrefix).toBe('C-a');
    expect(result.warnings).toEqual(expect.arrayContaining([expect.stringContaining('mouse')]));
  });

  it('produces a pack that compiles cleanly', () => {
    expect(compilePack(result.pack, 'linux').issues).toEqual([]);
  });
});

describe('translations', () => {
  it('has Chinese for every text the UI shows', () => {
    const texts = pluginTexts(tmuxPlugin, ['vi', 'emacs'].map((modeKeys) => ({ platform: 'linux' as const, settings: { prefix: 'C-b', modeKeys } })));
    // Names and file formats stay as they are; bare supply counts like "12–13" need no translation.
    const untranslated = [...texts].filter((t) => /[A-Za-z]/.test(t) && !['tmux', 'tmux list-keys'].includes(t) && !tmuxPlugin.messages?.zh?.[t]);
    expect(untranslated).toEqual([]);
  });
});
