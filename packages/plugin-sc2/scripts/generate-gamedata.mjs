#!/usr/bin/env node
/**
 * Generates src/gamedata.generated.ts from Blizzard's StarCraft II game data, as mirrored by
 * SC2Mapster/SC2GameData. Run with `pnpm --filter @keydojo/plugin-sc2 gen`.
 *
 * What we extract, per race:
 *  - each unit's command card: button face, hotkey alias, row/column, submenu path
 *  - the default (Standard) hotkey for each button  — GameHotkeys.txt `Button/Hotkey/<alias>`
 *  - Grid overrides (`_GLS` suffix); everything else in Grid is positional (QWERT/ASDFG/ZXCVB)
 *  - English button names, used as drill prompts — GameStrings.txt `Button/Name/<face>`
 *
 * Mods are layered in the order the multiplayer game loads them; later mods override earlier ones.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = 'SC2Mapster/SC2GameData';
const COMMIT = '6dd323aae4209a01f110719a00b4e8f7a88389bc';
// The dependency chain of ladder (Legacy of the Void) multiplayer. LibertyMulti / SwarmMulti are for
// the older multiplayer versions and must not be layered in.
const MODS = ['core', 'liberty', 'swarm', 'void', 'voidmulti'];

const here = dirname(fileURLToPath(import.meta.url));
const cacheDir = join(process.env.TMPDIR ?? '/tmp', 'keydojo-sc2gamedata', COMMIT);
const outFile = join(here, '..', 'src', 'gamedata.generated.ts');

// ---------------------------------------------------------------------------------------------
// What to include

/** Buttons that are on almost every card, or not worth drilling. */
const SKIP_FACES = /^(Move|Stop|MoveHoldPosition|MovePatrol|Attack\w*|Rally\w*|SetRallyPoint\w*|Cancel\w*|Halt\w*|Spray\w*|Gather\w*|ReturnCargo|SelectBuilder|Land\w*|Acquire\w*|AutoTurret|Salvage\w*|Raise)$/;

/**
 * Units drilled, by race. `level` is the default for the card (research is always advanced);
 * `label` disambiguates unit states; `skip` drops buttons by face.
 */
const RACES = {
  terran: [
    { unit: 'SCV', level: 1 },
    { unit: 'CommandCenter', level: 1 },
    { unit: 'OrbitalCommand', level: 1 },
    { unit: 'PlanetaryFortress', level: 3 },
    { unit: 'SupplyDepot', level: 3 },
    { unit: 'Barracks', level: 1 },
    { unit: 'Factory', level: 1 },
    { unit: 'Starport', level: 1 },
    { unit: 'BarracksTechLab', label: 'Barracks Tech Lab', level: 3 },
    { unit: 'FactoryTechLab', label: 'Factory Tech Lab', level: 3 },
    { unit: 'StarportTechLab', label: 'Starport Tech Lab', level: 3 },
    { unit: 'EngineeringBay', level: 3 },
    { unit: 'Armory', level: 3 },
    { unit: 'GhostAcademy', level: 3 },
    { unit: 'FusionCore', level: 3 },
    { unit: 'Bunker', level: 3 },
    { unit: 'Marine', level: 1 },
    { unit: 'Marauder', level: 2 },
    { unit: 'Reaper', level: 2 },
    { unit: 'Ghost', level: 2 },
    { unit: 'Hellion', level: 2 },
    { unit: 'HellionTank', label: 'Hellbat', level: 2 },
    { unit: 'WidowMine', level: 2 },
    { unit: 'WidowMineBurrowed', label: 'Widow Mine (burrowed)', level: 2 },
    { unit: 'SiegeTank', level: 1 },
    { unit: 'SiegeTankSieged', label: 'Siege Tank (sieged)', level: 1 },
    { unit: 'Cyclone', level: 2 },
    { unit: 'Thor', level: 2 },
    { unit: 'ThorAP', label: 'Thor (high impact)', level: 2 },
    { unit: 'VikingFighter', label: 'Viking (fighter)', level: 2 },
    { unit: 'VikingAssault', label: 'Viking (assault)', level: 2 },
    { unit: 'Medivac', level: 2 },
    { unit: 'Liberator', level: 2 },
    { unit: 'LiberatorAG', label: 'Liberator (defender)', level: 2 },
    { unit: 'Raven', level: 2 },
    { unit: 'Banshee', level: 2 },
    { unit: 'Battlecruiser', level: 2 },
  ],
  protoss: [
    { unit: 'Probe', level: 1 },
    { unit: 'Nexus', level: 1 },
    { unit: 'Gateway', level: 2 },
    { unit: 'WarpGate', level: 1, skip: ['UpgradeToWarpGate'] },
    { unit: 'RoboticsFacility', level: 1 },
    { unit: 'Stargate', level: 1 },
    { unit: 'Forge', level: 3 },
    { unit: 'CyberneticsCore', level: 3 },
    { unit: 'TwilightCouncil', level: 3 },
    { unit: 'RoboticsBay', level: 3 },
    { unit: 'FleetBeacon', level: 3 },
    { unit: 'TemplarArchive', level: 3 },
    { unit: 'DarkShrine', level: 3 },
    { unit: 'ShieldBattery', level: 3 },
    { unit: 'Zealot', level: 2 },
    { unit: 'Stalker', level: 1 },
    { unit: 'Sentry', level: 2 },
    { unit: 'Adept', level: 2 },
    { unit: 'HighTemplar', level: 2 },
    { unit: 'DarkTemplar', level: 2 },
    { unit: 'Observer', level: 2 },
    { unit: 'ObserverSiegeMode', label: 'Observer (surveillance)', level: 3 },
    { unit: 'WarpPrism', level: 2 },
    { unit: 'WarpPrismPhasing', label: 'Warp Prism (phasing)', level: 2 },
    { unit: 'Disruptor', level: 2 },
    { unit: 'Phoenix', level: 2 },
    { unit: 'VoidRay', level: 2 },
    { unit: 'Oracle', level: 2 },
    { unit: 'Carrier', level: 2 },
    { unit: 'Mothership', level: 3 },
  ],
  zerg: [
    { unit: 'Drone', level: 1 },
    { unit: 'Larva', level: 1 },
    { unit: 'Hatchery', level: 1 },
    { unit: 'Lair', level: 2 },
    { unit: 'Queen', level: 1 },
    { unit: 'SpawningPool', level: 3 },
    { unit: 'EvolutionChamber', level: 3 },
    { unit: 'RoachWarren', level: 3 },
    { unit: 'BanelingNest', level: 3 },
    { unit: 'HydraliskDen', level: 3 },
    { unit: 'LurkerDenMP', label: 'Lurker Den', level: 3 },
    { unit: 'InfestationPit', level: 3 },
    { unit: 'Spire', level: 3 },
    { unit: 'GreaterSpire', level: 3 },
    { unit: 'UltraliskCavern', level: 3 },
    { unit: 'NydusNetwork', level: 3 },
    { unit: 'Zergling', level: 2 },
    { unit: 'Baneling', level: 2 },
    { unit: 'Roach', level: 2 },
    { unit: 'Ravager', level: 2 },
    { unit: 'Hydralisk', level: 2 },
    { unit: 'LurkerMP', label: 'Lurker', level: 2 },
    { unit: 'LurkerMPBurrowed', label: 'Lurker (burrowed)', level: 2 },
    { unit: 'Infestor', level: 2 },
    { unit: 'SwarmHostMP', label: 'Swarm Host', level: 2 },
    { unit: 'Ultralisk', level: 3 },
    { unit: 'Overlord', level: 2, skip: ['StopGenerateCreep'] },
    { unit: 'Overseer', level: 2 },
    { unit: 'Corruptor', level: 2 },
    { unit: 'Viper', level: 2 },
  ],
};

/** Buttons important enough to be basics regardless of their card's level. */
const BASIC_FACES = new Set([
  'Stim', 'StimMarauder', 'SiegeMode', 'Unsiege', 'CalldownMULE', 'ScannerSweep', 'OrbitalCommand',
  'Blink', 'ForceField', 'GuardianShield', 'MorphMorphalisk', 'BuildCreepTumor', 'BuildCreepTumorTumor',
  'Lair', 'UpgradeToWarpGate', 'ChronoBoostEnergyCost', 'BatteryOvercharge',
]);

/** Global (non command-card) hotkeys: UI hotkey id -> prompt. */
const GLOBAL = [
  { id: 'IdleWorker', action: 'Select an idle worker', level: 1 },
  { id: 'ArmySelect', action: 'Select the whole army', level: 1 },
  { id: 'TownCamera', action: 'Jump the camera to your base', level: 1 },
  { id: 'AlertRecall', action: 'Jump to the last alert', level: 2 },
  { id: 'SubgroupNext', action: 'Cycle to the next subgroup', level: 2 },
  { id: 'ControlGroupRecall1', action: 'Select control group 1', level: 1, tag: 'control-groups' },
  { id: 'ControlGroupAssign1', action: 'Create control group 1', level: 1, tag: 'control-groups' },
  { id: 'ControlGroupAppend1', action: 'Add selection to control group 1', level: 1, tag: 'control-groups' },
  { id: 'ControlGroupAssignAndSteal1', action: 'Create control group 1, removing units from other groups', level: 3, tag: 'control-groups' },
  { id: 'ControlGroupAppendAndSteal1', action: 'Add to control group 1, removing units from other groups', level: 3, tag: 'control-groups' },
  { id: 'CameraSave0', action: 'Save camera location 1', level: 3, tag: 'camera' },
  { id: 'CameraView0', action: 'Jump to camera location 1', level: 2, tag: 'camera' },
  { id: 'WarpIn', action: 'Cycle through Warp Gates / Warp Prisms to warp in', level: 2, race: 'protoss' },
];

// ---------------------------------------------------------------------------------------------
// Fetching

async function fetchText(path) {
  const cached = join(cacheDir, path);
  try {
    return await readFile(cached, 'utf8');
  } catch {
    /* not cached yet */
  }
  const url = `https://raw.githubusercontent.com/${REPO}/${COMMIT}/${path}`;
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const text = await res.text();
  await mkdir(dirname(cached), { recursive: true });
  await writeFile(cached, text);
  return text;
}

const modFile = (mod, kind) =>
  ({
    units: `mods/${mod}.sc2mod/base.sc2data/GameData/UnitData.xml`,
    buttons: `mods/${mod}.sc2mod/base.sc2data/GameData/ButtonData.xml`,
    abilities: `mods/${mod}.sc2mod/base.sc2data/GameData/AbilData.xml`,
    hotkeys: `mods/${mod}.sc2mod/enus.sc2data/LocalizedData/GameHotkeys.txt`,
    strings: `mods/${mod}.sc2mod/enus.sc2data/LocalizedData/GameStrings.txt`,
  })[kind];

// ---------------------------------------------------------------------------------------------
// Minimal XML: enough for Blizzard's catalog files (elements + attributes, no mixed content).

function parseXml(text) {
  const root = { name: '#root', attrs: {}, children: [] };
  const stack = [root];
  const re = /<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<\/([\w:.-]+)\s*>|<([\w:.-]+)((?:\s+[\w:.-]+\s*=\s*"[^"]*")*)\s*(\/?)>/g;
  for (let m; (m = re.exec(text)); ) {
    if (m[1]) {
      stack.pop();
    } else if (m[2]) {
      const attrs = {};
      for (const a of m[3].matchAll(/([\w:.-]+)\s*=\s*"([^"]*)"/g)) attrs[a[1]] = decodeEntities(a[2]);
      const el = { name: m[2], attrs, children: [] };
      stack.at(-1).children.push(el);
      if (!m[4]) stack.push(el);
    }
  }
  return root;
}

function decodeEntities(s) {
  return s.replace(/&(lt|gt|amp|quot|apos);/g, (_, e) => ({ lt: '<', gt: '>', amp: '&', quot: '"', apos: "'" })[e]);
}

/** A catalog field can be an attribute or a `<Field value=".."/>` child. */
function field(el, name) {
  if (name in el.attrs) return el.attrs[name];
  const child = el.children.find((c) => c.name === name);
  return child?.attrs.value;
}

/** Fold a catalog element into a plain record, merging indexed array children like the game does. */
function mergeInto(target, el) {
  for (const [k, v] of Object.entries(el.attrs)) {
    if (k !== 'index' && k !== 'removed') target.fields[k] = v;
  }
  for (const child of el.children) {
    if ('value' in child.attrs && child.children.length === 0 && !('index' in child.attrs) && !isArrayField(child.name)) {
      target.fields[child.name] = child.attrs.value;
      continue;
    }
    const list = (target.lists[child.name] ??= []);
    // Array entries are addressed by numeric position or by a named index like `Research1`.
    const idx = child.attrs.index;
    const at = idx === undefined ? -1 : /^\d+$/.test(idx) ? Number(idx) : list.findIndex((e) => e?.key === idx);
    if (child.attrs.removed === '1') {
      if (at >= 0) list[at] = null;
      continue;
    }
    if (at >= 0 && list[at]) {
      mergeInto(list[at], child);
    } else {
      const entry = { key: idx, fields: {}, lists: {} };
      mergeInto(entry, child);
      if (at >= 0) list[at] = entry;
      else list.push(entry);
    }
  }
}

const isArrayField = (name) => name === 'CardLayouts' || name === 'LayoutButtons';

// ---------------------------------------------------------------------------------------------

async function loadCatalog(kind, tag) {
  const entries = new Map();
  for (const mod of MODS) {
    const text = await fetchText(modFile(mod, kind));
    if (!text) continue;
    for (const el of parseXml(text).children.flatMap((c) => c.children)) {
      if (!tag.test(el.name) || !el.attrs.id) continue;
      let entry = entries.get(el.attrs.id);
      if (!entry) {
        // A child starts as a copy of its parent; its indexed overrides address the inherited arrays.
        const parent = el.attrs.parent && entries.get(el.attrs.parent);
        entry = parent ? structuredClone(parent) : { type: el.name, fields: {}, lists: {} };
        entry.parent = el.attrs.parent;
        entries.set(el.attrs.id, entry);
      }
      mergeInto(entry, el);
    }
  }
  return entries;
}

async function loadKeyValues(kind) {
  const map = new Map();
  for (const mod of MODS) {
    const text = await fetchText(modFile(mod, kind));
    if (!text) continue;
    for (const line of text.split(/\r?\n/)) {
      const eq = line.indexOf('=');
      if (eq > 0) map.set(line.slice(0, eq), line.slice(eq + 1));
    }
  }
  return map;
}

function stripMarkup(s) {
  return s.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function slug(s) {
  return s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

async function main() {
  const [units, buttons, abilities, hotkeys, strings] = await Promise.all([
    loadCatalog('units', /^CUnit$/),
    loadCatalog('buttons', /^CButton$/),
    loadCatalog('abilities', /^CAbil/),
    loadKeyValues('hotkeys'),
    loadKeyValues('strings'),
  ]);

  const buttonField = (id, name, depth = 0) => {
    const b = buttons.get(id);
    if (!b || depth > 10) return undefined;
    return b.fields[name] ?? (b.parent ? buttonField(b.parent, name, depth + 1) : undefined);
  };
  const resolveId = (value, face) => value?.replaceAll('##id##', face);
  const hotkeyAlias = (face) => resolveId(buttonField(face, 'HotkeyAlias'), face) || face;
  const buttonName = (face) => {
    const key = resolveId(buttonField(face, 'Name'), face) ?? `Button/Name/${face}`;
    const raw = strings.get(key) ?? strings.get(`Button/Name/${face}`);
    return raw ? stripMarkup(raw) : undefined;
  };
  /** Default Standard hotkey, plus the Grid exception if there is one. */
  const buttonKeys = (face) => {
    const candidates = [resolveId(buttonField(face, 'Hotkey'), face), `Button/Hotkey/${hotkeyAlias(face)}`, `Button/Hotkey/${face}`];
    const key = candidates.find((k) => k && hotkeys.has(k));
    if (!key) return undefined;
    const grid = hotkeys.get(`${key}_GLS`);
    return { std: hotkeys.get(key), ...(grid !== undefined ? { grid } : {}) };
  };

  /**
   * Command cards keep buttons for commands that multiplayer has since removed (e.g. 250mm Strike
   * Cannons); the ability's info entry is blanked instead. Only keep commands the unit can issue.
   */
  const isAvailable = (unitData, abilCmd) => {
    const [abil, cmd] = (abilCmd ?? '').split(',');
    if (!abil || abil === '255') return true;
    const links = (unitData.lists.AbilArray ?? []).filter(Boolean).map((a) => a.fields.Link);
    if (!links.includes(abil)) return false;
    const info = abilities.get(abil)?.lists.InfoArray?.find((e) => e?.key === cmd);
    if (!info) return true;
    if (info.fields.Upgrade === '' || info.fields.Unit === '') return false;
    const face = info.lists.Button?.find(Boolean)?.fields.DefaultButtonFace;
    return face !== '';
  };

  const warnings = [];
  const races = {};

  for (const [race, list] of Object.entries(RACES)) {
    const cards = [];
    const labels = new Set();
    for (const { unit, label, level, skip = [] } of list) {
      const data = units.get(unit);
      const layouts = (data?.lists.CardLayouts ?? []).filter(Boolean);
      if (layouts.length === 0) {
        warnings.push(`${race}: no command card for ${unit}`);
        continue;
      }
      const context = label ?? stripMarkup(strings.get(`Unit/Name/${unit}`) ?? unit);
      if (labels.has(context)) warnings.push(`${race}: duplicate context label "${context}"`);
      labels.add(context);

      const buttonsOut = [];
      const seen = new Set();
      const walk = (layout, submenu) => {
        for (const b of (layout.lists.LayoutButtons ?? []).filter(Boolean)) {
          const f = b.fields;
          const face = f.Face;
          const type = f.Type ?? 'AbilCmd';
          if (!face || SKIP_FACES.test(face) || skip.includes(face)) continue;
          const pos = { row: Number(f.Row ?? 0), col: Number(f.Column ?? 0) };
          if (type === 'Submenu') {
            const card = layouts.find((l) => l.fields.CardId === f.SubmenuCardId);
            const keys = buttonKeys(face);
            if (!keys) warnings.push(`${race}: submenu ${unit}/${face} has no hotkey`);
            else if (card) walk(card, { alias: hotkeyAlias(face), ...pos, ...keys });
            continue;
          }
          if (type !== 'AbilCmd' && type !== 'SelectLarva') continue;
          if (!isAvailable(data, f.AbilCmd)) continue;
          const rawName = buttonName(face);
          // Leveled upgrades share one button slot and hotkey; drill them once.
          const name = rawName?.replace(/ Level 1$/, '');
          if (!rawName || / Level [2-9]$/.test(rawName) || name === 'Attack') continue;
          // The same command often appears once per unit state (e.g. two Burrow buttons).
          if (seen.has(face) || seen.has(name)) continue;
          seen.add(face);
          seen.add(name);
          const keys = buttonKeys(face);
          if (!keys) {
            warnings.push(`${race}: ${unit}/${face} has no hotkey, skipped`);
            continue;
          }
          const abil = (f.AbilCmd ?? '').split(',')[0];
          const tag = tagFor(abil, f.AbilCmd ?? '', type);
          buttonsOut.push({
            face,
            alias: hotkeyAlias(face),
            name,
            row: pos.row,
            col: pos.col,
            ...keys,
            ...(submenu ? { submenu } : {}),
            tag,
            level: BASIC_FACES.has(face) ? 1 : tag === 'research' ? 3 : level,
          });
        }
      };
      // The first card without a CardId is the unit's main card.
      walk(layouts.find((l) => !l.fields.CardId) ?? layouts[0], undefined);
      if (buttonsOut.length === 0) warnings.push(`${race}: ${unit} has no drillable buttons`);
      cards.push({ unit, id: slug(unit), context, buttons: buttonsOut });
    }
    races[race] = cards;
  }

  // Common commands come from a plain combat unit's card.
  const common = [];
  const marineCard = (units.get('Marine')?.lists.CardLayouts ?? []).filter(Boolean)[0];
  for (const face of ['Move', 'Stop', 'MoveHoldPosition', 'MovePatrol', 'Attack']) {
    const b = marineCard?.lists.LayoutButtons?.find((x) => x?.fields.Face === face);
    const keys = buttonKeys(face);
    if (!b || !keys) throw new Error(`Marine card lacks ${face}`);
    const pos = { row: Number(b.fields.Row), col: Number(b.fields.Column) };
    common.push({ face, alias: hotkeyAlias(face), name: buttonName(face), ...pos, ...keys });
  }

  const gridSlots = [];
  for (let i = 0; i < 15; i++) gridSlots.push(hotkeys.get(`UI/Hotkey/CommandButton${String(i).padStart(2, '0')}_GLS`));
  const global = GLOBAL.map((g) => {
    const std = hotkeys.get(`UI/Hotkey/${g.id}`);
    if (std === undefined) throw new Error(`no UI hotkey ${g.id}`);
    const grid = hotkeys.get(`UI/Hotkey/${g.id}_GLS`);
    return { ...g, std, ...(grid !== undefined ? { grid } : {}) };
  });

  const data = { source: { repo: REPO, commit: COMMIT }, gridSlots, global, common, races };

  const out =
    `// Generated by scripts/generate-gamedata.mjs from ${REPO}@${COMMIT.slice(0, 10)}. Do not edit.\n` +
    `import type { GameData } from './gamedata';\n\n` +
    `export const GAME_DATA: GameData = ${JSON.stringify(data, null, 1)};\n`;
  await writeFile(outFile, out);

  const counts = Object.fromEntries(Object.entries(races).map(([r, cards]) => [r, cards.reduce((n, c) => n + c.buttons.length, 0)]));
  console.log(`Wrote ${outFile}`, counts);
  for (const w of warnings) console.warn('warning:', w);
}

function tagFor(abil, abilCmd, type) {
  if (/^(Terran|Protoss|Zerg)Build$/.test(abil)) return 'build';
  if (type === 'SelectLarva' || /Train|WarpIn/i.test(abil) || /,Train\d+$/.test(abilCmd)) return 'train';
  if (/AddOns/.test(abil)) return 'addons';
  if (/UpgradeTo|MorphTo|Morph/i.test(abil)) return 'morph';
  if (/Research|Upgrade/i.test(abil)) return 'research';
  return 'abilities';
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
