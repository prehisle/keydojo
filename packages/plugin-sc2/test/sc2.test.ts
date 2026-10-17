import { compilePack, parseSequence, resolveScenario, type ShortcutPackDef } from '@keydojo/core';
import { describe, expect, it } from 'vitest';
import { buildSc2Pack, parseHotkeysFile, sc2KeyToNotation, sc2Plugin, sc2ValueToNotations, type Layout, type Race } from '../src';

const keysOf = (pack: ShortcutPackDef, id: string) => {
  const s = compilePack(pack, 'windows').pack.shortcuts.find((x) => x.id === id);
  if (!s) throw new Error(`no shortcut ${id}`);
  return s.bindings;
};
const seq = (text: string) => [parseSequence(text, 'windows')];

describe('built-in packs', () => {
  const combos = (['terran', 'protoss', 'zerg'] as Race[]).flatMap((race) => (['standard', 'grid'] as Layout[]).map((layout) => [race, layout] as const));

  it.each(combos)('%s / %s compiles without issues', (race, layout) => {
    const { pack, issues } = compilePack(buildSc2Pack({ race, layout }), 'windows');
    expect(issues).toEqual([]);
    expect(pack.shortcuts.length).toBeGreaterThan(100);
  });

  it('matches the Standard layout', () => {
    const t = buildSc2Pack({ race: 'terran', layout: 'standard' });
    expect(keysOf(t, 'terran.barracks.marine')).toEqual(seq('A'));
    expect(keysOf(t, 'terran.scv.supply-depot')).toEqual(seq('B S'));
    expect(keysOf(t, 'terran.scv.factory')).toEqual(seq('V F'));
    expect(keysOf(t, 'terran.command-center.orbital-command')).toEqual(seq('B'));
    expect(keysOf(t, 'global.control-group-assign1')).toEqual(seq('Ctrl+1'));
    const z = buildSc2Pack({ race: 'zerg', layout: 'standard' });
    expect(keysOf(z, 'zerg.queen.morph-morphalisk')).toEqual(seq('V'));
    expect(keysOf(z, 'zerg.hatchery.larva')).toEqual(seq('S'));
    const p = buildSc2Pack({ race: 'protoss', layout: 'standard' });
    expect(keysOf(p, 'protoss.probe.pylon')).toEqual(seq('B E'));
  });

  it('derives Grid keys from command card slots', () => {
    const t = buildSc2Pack({ race: 'terran', layout: 'grid' });
    expect(keysOf(t, 'terran.barracks.marine')).toEqual(seq('Q'));
    expect(keysOf(t, 'terran.barracks.reaper')).toEqual(seq('W'));
    expect(keysOf(t, 'terran.scv.supply-depot')).toEqual(seq('Z E'));
    expect(keysOf(t, 'common.move')).toEqual(seq('Q'));
  });

  it('only includes the selected race', () => {
    const ids = buildSc2Pack({ race: 'zerg', layout: 'standard' }).shortcuts.map((s) => s.id);
    expect(ids.some((id) => id.startsWith('terran.'))).toBe(false);
    expect(ids).not.toContain('global.warp-in');
  });
});

describe('sc2KeyToNotation', () => {
  it.each([
    ['A', 'A'],
    ['Control+Shift+1', 'Ctrl+Shift+1'],
    ['Grave', 'Backquote'],
    ['BracketOpen', 'BracketLeft'],
    ['NumPad7', 'Numpad7'],
    ['F12', 'F12'],
  ])('%s -> %s', (sc2, notation) => expect(sc2KeyToNotation(sc2)).toBe(notation));

  it('drops keys a keyboard drill cannot use', () => {
    expect(sc2KeyToNotation('MiddleMouseButton')).toBeNull();
    expect(sc2KeyToNotation('None')).toBeNull();
    expect(sc2ValueToNotations('B,Escape,Shift+MiddleMouseButton')).toEqual(['B', 'Escape']);
  });
});

describe('.SC2Hotkeys import', () => {
  const file = `[Settings]
AllowSetConflicts=1

[Hotkeys]
ControlGroupRecall1=Q
IdleWorker=

[Commands]
Marine/Barracks=E
TerranBuild/SCV=R,D
SupplyDepot=T
`;
  const parsed = parseHotkeysFile(file);
  const pack = buildSc2Pack({ race: 'terran', layout: 'standard', overrides: parsed.overrides });

  it('applies unit-scoped and global command overrides', () => {
    expect(keysOf(pack, 'terran.barracks.marine')).toEqual(seq('E'));
    expect(keysOf(pack, 'terran.scv.supply-depot')).toEqual([...seq('R T'), ...seq('D T')]);
  });

  it('applies UI hotkeys, and an empty value unbinds', () => {
    expect(keysOf(pack, 'global.control-group-recall1')).toEqual(seq('Q'));
    expect(pack.shortcuts.find((s) => s.id === 'global.idle-worker')).toBeUndefined();
  });

  it('keeps defaults for everything else', () => {
    expect(keysOf(pack, 'terran.barracks.reaper')).toEqual(seq('R'));
  });

  it('detects Grid-based profiles', () => {
    expect(parseHotkeysFile('[Settings]\nGrid=1\n').layout).toBe('grid');
    expect(parsed.layout).toBeUndefined();
  });

  it('reports what it did through the importer', () => {
    const importer = sc2Plugin.importers![0]!;
    const settings = { race: 'terran', layout: 'grid' };
    const base = sc2Plugin.buildPack({ platform: 'windows', settings });
    const result = importer.parse(file, { platform: 'windows', settings, base });
    expect(result.warnings[0]).toMatch(/Applied 5 custom hotkeys on top of Grid/);
    expect(keysOf(result.pack, 'terran.barracks.reaper')).toEqual(seq('W'));
    expect(importer.parse('hello', { platform: 'windows', settings, base }).pack.shortcuts).toEqual([]);
  });
});

describe('build orders', () => {
  it.each(['terran', 'protoss', 'zerg'] as Race[])('%s build orders only use existing shortcuts', (race) => {
    const settings = { race, layout: 'standard' };
    const shortcuts = compilePack(sc2Plugin.buildPack({ platform: 'windows', settings }), 'windows').pack.shortcuts;
    const scenarios = sc2Plugin.scenarios!({ platform: 'windows', settings });
    expect(scenarios.length).toBeGreaterThanOrEqual(3);
    for (const s of scenarios) {
      const { steps, missing } = resolveScenario(s, shortcuts);
      expect(missing, s.id).toEqual([]);
      expect(steps.length).toBeGreaterThanOrEqual(10);
    }
  });
});
