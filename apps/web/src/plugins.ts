import type { ShortcutPlugin } from '@keydojo/core';
import { sc2Plugin } from '@keydojo/plugin-sc2';
import { tmuxPlugin } from '@keydojo/plugin-tmux';
import { vscodePlugin } from '@keydojo/plugin-vscode';

/** Registered plugins. Adding an app to KeyDojo means adding it here. */
export const plugins: ShortcutPlugin[] = [vscodePlugin, tmuxPlugin, sc2Plugin];

export function findPlugin(id: string): ShortcutPlugin | undefined {
  return plugins.find((p) => p.id === id);
}
