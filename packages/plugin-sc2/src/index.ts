import { definePlugin, type ShortcutDef } from '@keydojo/core';

/**
 * StarCraft II, Terran, standard hotkey layout. The context is what you have selected,
 * which decides what the command card shows — that is what the drill prompt says.
 *
 * Protoss / Zerg packs and the Grid layout are welcome contributions.
 */
const TERRAN_STANDARD: ShortcutDef[] = [
  // Global
  { id: 'select-idle-worker', action: 'Select an idle worker', keys: 'F1', context: 'Global', tags: ['global'] },
  { id: 'select-army', action: 'Select the whole army', keys: 'F2', context: 'Global', tags: ['global'] },
  { id: 'base-camera', action: 'Jump the camera to your base', keys: 'Backspace', context: 'Global', tags: ['global'] },
  { id: 'set-group-1', action: 'Set control group 1', keys: 'Ctrl+1', context: 'Global', tags: ['global', 'control-groups'] },
  { id: 'add-group-1', action: 'Add selection to control group 1', keys: 'Shift+1', context: 'Global', tags: ['global', 'control-groups'] },
  { id: 'steal-group-1', action: 'Move selection to control group 1 (steal)', keys: 'Alt+1', context: 'Global', tags: ['global', 'control-groups'], level: 3 },

  // Unit commands
  { id: 'cmd-move', action: 'Move', keys: 'M', context: 'Any unit', tags: ['commands'] },
  { id: 'cmd-stop', action: 'Stop', keys: 'S', context: 'Any unit', tags: ['commands'] },
  { id: 'cmd-hold', action: 'Hold position', keys: 'H', context: 'Any unit', tags: ['commands'] },
  { id: 'cmd-patrol', action: 'Patrol', keys: 'P', context: 'Any unit', tags: ['commands'] },
  { id: 'cmd-attack', action: 'Attack move', keys: 'A', context: 'Any unit', tags: ['commands'] },

  // SCV build — basic
  { id: 'build-command-center', action: 'Build a Command Center', keys: 'B C', context: 'SCV', tags: ['build'] },
  { id: 'build-supply-depot', action: 'Build a Supply Depot', keys: 'B S', context: 'SCV', tags: ['build'] },
  { id: 'build-refinery', action: 'Build a Refinery', keys: 'B R', context: 'SCV', tags: ['build'] },
  { id: 'build-barracks', action: 'Build a Barracks', keys: 'B B', context: 'SCV', tags: ['build'] },
  { id: 'build-engineering-bay', action: 'Build an Engineering Bay', keys: 'B E', context: 'SCV', tags: ['build'] },
  { id: 'build-bunker', action: 'Build a Bunker', keys: 'B U', context: 'SCV', tags: ['build'], level: 2 },
  { id: 'build-missile-turret', action: 'Build a Missile Turret', keys: 'B T', context: 'SCV', tags: ['build'], level: 2 },
  { id: 'build-sensor-tower', action: 'Build a Sensor Tower', keys: 'B N', context: 'SCV', tags: ['build'], level: 3 },
  // SCV build — advanced
  { id: 'build-factory', action: 'Build a Factory', keys: 'V F', context: 'SCV', tags: ['build'] },
  { id: 'build-starport', action: 'Build a Starport', keys: 'V S', context: 'SCV', tags: ['build'] },
  { id: 'build-armory', action: 'Build an Armory', keys: 'V A', context: 'SCV', tags: ['build'], level: 2 },
  { id: 'build-fusion-core', action: 'Build a Fusion Core', keys: 'V C', context: 'SCV', tags: ['build'], level: 3 },
  { id: 'build-ghost-academy', action: 'Build a Ghost Academy', keys: 'V G', context: 'SCV', tags: ['build'], level: 3 },

  // Command Center / Orbital
  { id: 'train-scv', action: 'Train an SCV', keys: 'S', context: 'Command Center', tags: ['train'] },
  { id: 'upgrade-orbital', action: 'Upgrade to Orbital Command', keys: 'O', context: 'Command Center', tags: ['train'] },
  { id: 'upgrade-planetary', action: 'Upgrade to Planetary Fortress', keys: 'P', context: 'Command Center', tags: ['train'], level: 2 },
  { id: 'calldown-mule', action: 'Calldown: MULE', keys: 'E', context: 'Orbital Command', tags: ['abilities'] },
  { id: 'scanner-sweep', action: 'Scanner Sweep', keys: 'C', context: 'Orbital Command', tags: ['abilities'] },
  { id: 'extra-supplies', action: 'Calldown: Extra Supplies', keys: 'X', context: 'Orbital Command', tags: ['abilities'], level: 3 },

  // Barracks
  { id: 'train-marine', action: 'Train a Marine', keys: 'A', context: 'Barracks', tags: ['train'] },
  { id: 'train-reaper', action: 'Train a Reaper', keys: 'R', context: 'Barracks', tags: ['train'] },
  { id: 'train-marauder', action: 'Train a Marauder', keys: 'D', context: 'Barracks', tags: ['train'] },
  { id: 'train-ghost', action: 'Train a Ghost', keys: 'G', context: 'Barracks', tags: ['train'], level: 2 },
  { id: 'barracks-tech-lab', action: 'Build a Tech Lab', keys: 'X', context: 'Barracks', tags: ['addons'] },
  { id: 'barracks-reactor', action: 'Build a Reactor', keys: 'C', context: 'Barracks', tags: ['addons'] },

  // Factory
  { id: 'train-hellion', action: 'Build a Hellion', keys: 'E', context: 'Factory', tags: ['train'] },
  { id: 'train-hellbat', action: 'Build a Hellbat', keys: 'R', context: 'Factory', tags: ['train'], level: 2 },
  { id: 'train-widow-mine', action: 'Build a Widow Mine', keys: 'D', context: 'Factory', tags: ['train'] },
  { id: 'train-siege-tank', action: 'Build a Siege Tank', keys: 'S', context: 'Factory', tags: ['train'] },
  { id: 'train-cyclone', action: 'Build a Cyclone', keys: 'C', context: 'Factory', tags: ['train'], level: 2 },
  { id: 'train-thor', action: 'Build a Thor', keys: 'T', context: 'Factory', tags: ['train'], level: 2 },

  // Starport
  { id: 'train-viking', action: 'Build a Viking', keys: 'V', context: 'Starport', tags: ['train'] },
  { id: 'train-medivac', action: 'Build a Medivac', keys: 'D', context: 'Starport', tags: ['train'] },
  { id: 'train-liberator', action: 'Build a Liberator', keys: 'N', context: 'Starport', tags: ['train'], level: 2 },
  { id: 'train-raven', action: 'Build a Raven', keys: 'R', context: 'Starport', tags: ['train'], level: 2 },
  { id: 'train-banshee', action: 'Build a Banshee', keys: 'E', context: 'Starport', tags: ['train'], level: 2 },
  { id: 'train-battlecruiser', action: 'Build a Battlecruiser', keys: 'B', context: 'Starport', tags: ['train'], level: 3 },

  // Unit abilities
  { id: 'stimpack', action: 'Stimpack', keys: 'T', context: 'Marine / Marauder', tags: ['abilities'] },
  { id: 'siege-mode', action: 'Siege Mode', keys: 'E', context: 'Siege Tank', tags: ['abilities'] },
  { id: 'unsiege', action: 'Tank Mode (unsiege)', keys: 'D', context: 'Siege Tank (sieged)', tags: ['abilities'] },
];

export const sc2Plugin = definePlugin({
  id: 'sc2',
  name: 'StarCraft II',
  description: 'Terran hotkeys (standard layout): build, train, abilities and control groups. Best in Speed mode.',
  homepage: 'https://starcraft2.blizzard.com',
  buildPack() {
    return { id: 'sc2', name: 'Terran · Standard', shortcuts: TERRAN_STANDARD };
  },
});
