import { definePlugin } from '@keydojo/core';
import { DEFAULT_SHORTCUTS } from './defaults';
import { importKeybindings } from './keybindings-json';

export { importKeybindings, stripJsonc, vscodeKeyToNotation, humanizeCommand } from './keybindings-json';

const KEYBINDINGS_PATHS =
  'Windows: %APPDATA%\\Code\\User\\keybindings.json · macOS: ~/Library/Application Support/Code/User/keybindings.json · Linux: ~/.config/Code/User/keybindings.json';

export const vscodePlugin = definePlugin({
  id: 'vscode',
  name: 'VS Code',
  description: 'Editing, navigation, multi-cursor and debugging shortcuts for Visual Studio Code.',
  homepage: 'https://code.visualstudio.com/docs/getstarted/keybindings',

  buildPack() {
    return { id: 'vscode', name: 'VS Code defaults', shortcuts: DEFAULT_SHORTCUTS };
  },

  importers: [
    {
      id: 'keybindings-json',
      label: 'keybindings.json',
      instructions: `Load your keybindings.json (Command Palette → "Preferences: Open Keyboard Shortcuts (JSON)"). It is merged onto the defaults. ${KEYBINDINGS_PATHS}`,
      accept: '.json',
      parse(text, { base, platform }) {
        return importKeybindings(text, base, platform);
      },
    },
  ],
});
