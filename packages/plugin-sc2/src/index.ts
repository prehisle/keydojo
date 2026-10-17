import { definePlugin } from '@keydojo/core';
import type { Race } from './gamedata';
import { parseHotkeysFile } from './hotkeys-file';
import { buildSc2Pack, LAYOUT_NAMES, type Layout } from './pack';

export { buildSc2Pack, type Layout, type Overrides } from './pack';
export { parseHotkeysFile } from './hotkeys-file';
export { sc2KeyToNotation, sc2ValueToNotations } from './sc2-keys';
export { GAME_DATA } from './gamedata.generated';
export type { GameData, Race } from './gamedata';

const asRace = (v: string | undefined): Race => (v === 'protoss' || v === 'zerg' ? v : 'terran');
const asLayout = (v: string | undefined): Layout => (v === 'grid' ? 'grid' : 'standard');

/**
 * StarCraft II. Hotkeys come from Blizzard's own game data (see scripts/generate-gamedata.mjs),
 * so every race and both built-in layouts are exact. The drill context is what you have selected.
 */
export const sc2Plugin = definePlugin({
  id: 'sc2',
  name: 'StarCraft II',
  description: 'Command card hotkeys for all three races, Standard or Grid, straight from the game data. Best in Speed mode.',
  homepage: 'https://starcraft2.blizzard.com',
  settings: [
    {
      key: 'race',
      label: 'Race',
      type: 'select',
      default: 'terran',
      options: [
        { value: 'terran', label: 'Terran' },
        { value: 'protoss', label: 'Protoss' },
        { value: 'zerg', label: 'Zerg' },
      ],
    },
    {
      key: 'layout',
      label: 'Hotkey layout',
      type: 'select',
      default: 'standard',
      options: [
        { value: 'standard', label: 'Standard' },
        { value: 'grid', label: 'Grid' },
      ],
      description: 'The built-in profile in Options › Hotkeys. Using a custom profile? Import it below.',
    },
  ],

  buildPack({ settings }) {
    return buildSc2Pack({ race: asRace(settings.race), layout: asLayout(settings.layout) });
  },

  importers: [
    {
      id: 'sc2hotkeys',
      label: '.SC2Hotkeys profile',
      instructions:
        'Custom profiles live in Documents/StarCraft II/Accounts/<id>/Hotkeys/*.SC2Hotkeys. Pick your race and the layout the profile is based on above first.',
      accept: '.SC2Hotkeys,.txt',
      parse(text, { settings }) {
        const race = asRace(settings.race);
        const parsed = parseHotkeysFile(text);
        const layout = parsed.layout ?? asLayout(settings.layout);
        const pack = buildSc2Pack({ race, layout, overrides: parsed.overrides });
        const warnings: string[] = [];
        if (parsed.entries === 0) {
          warnings.push('No hotkeys found — is this an .SC2Hotkeys file?');
          return { pack: { ...pack, shortcuts: [] }, warnings };
        }
        warnings.push(
          `Applied ${parsed.entries} custom hotkeys on top of ${LAYOUT_NAMES[layout]}${parsed.layout ? ' (from the file)' : ''}. Switched race? Import again.`,
        );
        return { pack: { ...pack, name: `${pack.name} · custom` }, warnings };
      },
    },
  ],
});
