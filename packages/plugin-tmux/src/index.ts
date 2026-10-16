import { definePlugin, sequenceToNotation, type ShortcutDef } from '@keydojo/core';
import { DEFAULT_BINDINGS } from './defaults';
import { parseListKeys } from './list-keys';
import { parseTmuxKey } from './tmux-keys';

export { parseTmuxKey } from './tmux-keys';
export { parseListKeys, describeCommand, tokenize } from './list-keys';

export const tmuxPlugin = definePlugin({
  id: 'tmux',
  name: 'tmux',
  description: 'Terminal multiplexer: prefix-key bindings for sessions, windows, panes and copy mode.',
  homepage: 'https://github.com/tmux/tmux',
  settings: [
    {
      key: 'prefix',
      label: 'Prefix key',
      type: 'text',
      default: 'C-b',
      description: 'In tmux notation, e.g. C-b, C-a, C-Space.',
    },
    {
      key: 'modeKeys',
      label: 'Copy mode keys',
      type: 'select',
      default: 'vi',
      options: [
        { value: 'vi', label: 'vi (setw -g mode-keys vi)' },
        { value: 'emacs', label: 'emacs (tmux default)' },
      ],
    },
  ],

  buildPack({ settings }) {
    const prefix = parseTmuxKey(settings.prefix || 'C-b');
    const shortcuts: ShortcutDef[] = [];
    for (const b of DEFAULT_BINDINGS) {
      if (b.table === 'copy-mode-vi' && settings.modeKeys !== 'vi') continue;
      const key = parseTmuxKey(b.key);
      const table = b.table ?? 'prefix';
      shortcuts.push({
        id: b.id,
        action: b.action,
        keys: sequenceToNotation(table === 'prefix' ? [prefix, key] : [key]),
        context: table === 'prefix' || table === 'root' ? undefined : table,
        tags: b.tags,
        level: b.level ?? 1,
      });
    }
    return { id: 'tmux', name: 'tmux defaults', shortcuts };
  },

  importers: [
    {
      id: 'list-keys',
      label: 'tmux list-keys',
      instructions:
        'Run `tmux list-keys > tmux-keys.txt` inside tmux and load the file (or paste its contents). Set your prefix above first.',
      accept: '.txt,.conf',
      parse(text, { settings }) {
        const prefix = parseTmuxKey(settings.prefix || 'C-b');
        const copyTable = settings.modeKeys === 'vi' ? 'copy-mode-vi' : 'copy-mode';
        const { suggestedPrefix, ...result } = parseListKeys(text, { prefix, copyTable });
        if (suggestedPrefix && suggestedPrefix !== (settings.prefix || 'C-b')) {
          result.warnings.unshift(
            `Your config binds \`${suggestedPrefix} send-prefix\` — your prefix is probably ${suggestedPrefix}. Update the prefix setting and import again.`,
          );
        }
        return result;
      },
    },
  ],
});
