# Contributing to KeyDojo

## Writing a plugin

A plugin teaches KeyDojo about one application. Most plugins are **just data**.

### 1. Create the package

```
packages/plugin-myapp/
  package.json     # copy from plugin-sc2, rename to @keydojo/plugin-myapp
  src/index.ts
  test/myapp.test.ts
```

### 2. Define shortcuts

```ts
import { definePlugin } from '@keydojo/core';

export const myAppPlugin = definePlugin({
  id: 'myapp',                       // storage namespace — never change it after release
  name: 'My App',
  description: 'What users will practise.',
  buildPack: () => ({
    id: 'myapp',
    name: 'My App defaults',
    shortcuts: [
      { id: 'save', action: 'Save the file', keys: 'Mod+S', tags: ['file'] },
      { id: 'palette', action: 'Open the command palette', keys: ['Mod+Shift+P', 'F1'] },
      { id: 'format', action: 'Format', keys: 'Shift+Alt+F', linux: 'Ctrl+Shift+I' },
      { id: 'zen', action: 'Toggle Zen mode', keys: 'Mod+K Z', level: 3 },
    ],
  }),
});
```

Then register it in `apps/web/src/plugins.ts`.

### Key notation

| Write                  | Means                                                     |
| ---------------------- | --------------------------------------------------------- |
| `Ctrl+Shift+P`         | one stroke with modifiers (`Ctrl`, `Alt`, `Shift`, `Meta`/`Cmd`) |
| `Mod+S`                | `Cmd+S` on macOS, `Ctrl+S` elsewhere                      |
| `Ctrl+K Ctrl+S`        | a sequence: strokes separated by spaces                   |
| `%`, `"`, `?`          | shifted symbols, i.e. `Shift+5`, `Shift+'`, `Shift+/` (US layout) |
| `Up`, `Esc`, `Space`, `F5`, `` ` ``, `\\` | named keys                             |

Keys are matched by **physical position** (`KeyboardEvent.code`), so drills work on any keyboard layout.

### Shortcut fields

- `id` — stable; user progress is stored against it. Don't rename ids in released packs.
- `action` — the drill prompt. Phrase it as what the user wants to do.
- `keys` — one binding or an array of equivalent ones; `mac` / `windows` / `linux` override per platform.
- `context` — where the shortcut applies (`copy-mode`, `Barracks`). Shown in the prompt; conflicts are only checked within a context.
- `tags` — topics users can filter by.
- `level` — `1` basics, `2` common, `3` advanced.

### 3. Optional: settings and importers

- **Settings** (`settings`) let users adapt the pack, like tmux's prefix key. They're passed to `buildPack`.
- **Importers** (`importers`) turn the app's own config file into a pack, so users drill *their* bindings. See `plugin-vscode/src/keybindings-json.ts` and `plugin-tmux/src/list-keys.ts`.

### 4. Optional: translations

The UI is in English and Chinese. Plugin text is translated when shown, using a table keyed by the English original — `action`, `context`, tags, notes, scenario names, setting labels:

```ts
import type { Messages } from '@keydojo/core';

const zh: Messages = { 'Save the file': '保存文件', file: '文件' };

export const myAppPlugin = definePlugin({ /* … */ messages: { zh } });
```

Missing entries fall back to English. Packs and progress are stored in English, so a user can switch language at any time. `pluginTexts(plugin, contexts)` lists every string the UI can show — the built-in plugins' tests use it to check the Chinese table is complete. Importer warnings are shown as is; write them in `ctx.locale`.

UI text lives in `apps/web/src/i18n/en.ts` and `zh.ts`; the type checker rejects a `zh.ts` that is missing a key.

### 5. Test it

At minimum, assert the pack compiles cleanly on every platform — this catches typos and conflicting bindings:

```ts
import { compilePack } from '@keydojo/core';
expect(compilePack(myAppPlugin.buildPack({ platform: 'mac', settings: {} }), 'mac').issues).toEqual([]);
```

## Fixing shortcut data

Wrong or missing shortcuts? Edit the pack and include a source (official docs link) in the PR description.

## Development

```bash
pnpm install
pnpm dev
pnpm test
pnpm typecheck
```

`packages/core` must stay DOM-free so it can run in tests, the web app and the desktop shell alike.
