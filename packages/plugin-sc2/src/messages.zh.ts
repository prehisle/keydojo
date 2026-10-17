import type { Messages } from '@keydojo/core';
import { LAYOUT_NAMES, RACE_NAMES } from './pack';

/**
 * Chinese (国服 / zhCN) names. Button names are mostly "<verb> <unit>" (Build Barracks, Warp In
 * Stalker, Morph to Roach…), so they are composed from UNITS plus a verb rule; everything else
 * is listed in TERMS. `zhName` resolves a name, and `zh` is the full table for the plugin.
 */

/** Units and structures, as used in contexts and in composed button names. */
const UNITS: Record<string, string> = {
  // Terran
  SCV: 'SCV',
  MULE: '矿骡',
  'Command Center': '指挥中心',
  'Orbital Command': '轨道控制基地',
  'Planetary Fortress': '行星要塞',
  'Supply Depot': '补给站',
  Refinery: '精炼厂',
  Barracks: '兵营',
  'Engineering Bay': '工程站',
  Bunker: '地堡',
  'Missile Turret': '导弹塔',
  'Sensor Tower': '感应塔',
  'Ghost Academy': '幽灵军校',
  Factory: '重工厂',
  Armory: '军械库',
  Starport: '星港',
  'Fusion Core': '聚变芯体',
  'Tech Lab': '科技实验室',
  Reactor: '反应堆',
  'Barracks Tech Lab': '兵营科技实验室',
  'Factory Tech Lab': '重工厂科技实验室',
  'Starport Tech Lab': '星港科技实验室',
  Marine: '陆战队员',
  Marauder: '掠夺者',
  Reaper: '死神',
  Ghost: '幽灵特工',
  Hellion: '恶火',
  Hellbat: '恶蝠',
  'Widow Mine': '寡妇雷',
  'Siege Tank': '攻城坦克',
  Cyclone: '飓风',
  Thor: '雷神',
  Viking: '维京战机',
  Medivac: '医疗运输机',
  Liberator: '解放者',
  Raven: '渡鸦',
  Banshee: '女妖',
  Battlecruiser: '战列巡航舰',

  // Protoss
  Probe: '探机',
  Nexus: '星灵枢纽',
  Pylon: '水晶塔',
  Assimilator: '吸收舱',
  Gateway: '传送门',
  'Warp Gate': '折跃门',
  Forge: '锻炉',
  'Cybernetics Core': '控制核心',
  'Photon Cannon': '光子炮台',
  'Shield Battery': '护盾充能器',
  'Twilight Council': '暮光议会',
  'Robotics Facility': '机械台',
  'Robotics Bay': '机械研究所',
  Stargate: '星门',
  'Fleet Beacon': '舰队航标',
  'Templar Archives': '圣堂文献馆',
  'Dark Shrine': '黑暗圣坛',
  Zealot: '狂热者',
  Stalker: '追猎者',
  Sentry: '哨兵',
  Adept: '使徒',
  'High Templar': '高阶圣堂武士',
  'Dark Templar': '黑暗圣堂武士',
  Archon: '执政官',
  Observer: '观察者',
  'Warp Prism': '折跃棱镜',
  Immortal: '不朽者',
  Colossus: '巨像',
  Disruptor: '干扰者',
  Phoenix: '凤凰',
  'Void Ray': '虚空辉光舰',
  Oracle: '先知',
  Tempest: '风暴战舰',
  Carrier: '航母',
  Mothership: '母舰',
  Interceptor: '截击机',

  // Zerg
  Drone: '工蜂',
  Larva: '幼虫',
  Larvae: '幼虫',
  Hatchery: '孵化场',
  Lair: '虫穴',
  Hive: '虫巢',
  Queen: '虫后',
  Extractor: '萃取房',
  'Spawning Pool': '孵化池',
  'Evolution Chamber': '进化腔',
  'Roach Warren': '蟑螂温室',
  'Baneling Nest': '爆虫巢',
  'Hydralisk Den': '刺蛇巢穴',
  'Lurker Den': '潜伏者巢穴',
  'Infestation Pit': '感染深渊',
  Spire: '螺旋塔',
  'Greater Spire': '巨型螺旋塔',
  'Ultralisk Cavern': '雷兽窟',
  'Nydus Network': '虫道网络',
  'Nydus Worm': '坑道虫',
  'Spine Crawler': '脊针爬虫',
  'Spore Crawler': '孢子爬虫',
  'Creep Tumor': '菌毯肿瘤',
  Zergling: '跳虫',
  Baneling: '爆虫',
  Roach: '蟑螂',
  Ravager: '破坏者',
  Hydralisk: '刺蛇',
  Lurker: '潜伏者',
  Infestor: '感染虫',
  'Swarm Host': '虫群宿主',
  Ultralisk: '雷兽',
  Overlord: '王虫',
  Overseer: '眼虫',
  Mutalisk: '异龙',
  Corruptor: '腐化者',
  'Brood Lord': '巢虫领主',
  Viper: '飞蛇',
  Locust: '蝗虫',
  Changeling: '变形体',
};

/** Unit states, as in "Siege Tank (sieged)". */
const STATES: Record<string, string> = {
  burrowed: '钻地',
  sieged: '攻城模式',
  'high impact': '高冲击模式',
  fighter: '战斗机模式',
  assault: '突击模式',
  defender: '防御模式',
  surveillance: '监视模式',
  phasing: '相位模式',
};

/** Upgrades and research, composed with "Research …" / "Upgrade …" / "Evolve …". */
const UPGRADES: Record<string, string> = {
  'Combat Shield': '战斗盾牌',
  Stimpack: '兴奋剂',
  'Concussive Shells': '震撼弹',
  'Infernal Pre-Igniter': '地狱火预燃器',
  'Drilling Claws': '钻地爪',
  'Smart Servos': '智能伺服',
  'Mag-Field Accelerator': '磁场加速器',
  'Cloaking Field': '隐形力场',
  'Hyperflight Rotors': '超速旋翼',
  'Interference Matrix': '干扰矩阵',
  'Infantry Weapons': '步兵武器',
  'Infantry Armor': '步兵装甲',
  'Neosteel Armor': '新钢装甲',
  'Hi-Sec Auto Tracking': '高精自动追踪',
  'Vehicle Weapons': '载具武器',
  'Ship Weapons': '舰船武器',
  'Vehicle and Ship Plating': '载具和舰船装甲',
  'Personal Cloaking': '个人隐形',
  'Weapon Refit': '武器改装',
  'Advanced Ballistics': '高级弹道学',
  'Caduceus Reactor': '医疗反应堆',

  'Ground Weapons': '地面武器',
  'Ground Armor': '地面护甲',
  Shields: '护盾',
  'Air Weapons': '空中武器',
  'Air Armor': '空中护甲',
  'Warp Gate': '折跃门',
  Blink: '闪烁',
  Charge: '冲锋',
  'Resonating Glaives': '共振刃',
  'Extended Thermal Lance': '延伸热能射线',
  'Gravitic Boosters': '重力加速器',
  'Gravitic Drive': '重力驱动',
  'Anion Pulse-Crystals': '阴离子脉冲水晶',
  'Flux Vanes': '通量叶片',
  'Tectonic Destabilizers': '地壳震荡器',
  'Psionic Storm': '灵能风暴',
  'Shadow Stride': '暗影步',

  'Pneumatized Carapace': '充气甲壳',
  Burrow: '钻地',
  'Metabolic Boost': '代谢加速',
  'Adrenal Glands': '肾上腺',
  'Ground Carapace': '地面甲壳',
  'Melee Attacks': '近战攻击',
  'Missile Attacks': '远程攻击',
  'Glial Reconstitution': '神经重组',
  'Tunneling Claws': '掘地利爪',
  'Centrifugal Hooks': '离心钩',
  'Grooved Spines': '沟槽脊刺',
  'Muscular Augments': '肌肉强化',
  'Nanomuscular Swell': '纳米肌肉膨胀',
  'Adaptive Talons': '适应利爪',
  'Seismic Spines': '地震脊刺',
  'Neural Parasite': '神经寄生',
  'Flyer Attacks': '飞行攻击',
  'Flyer Carapace': '飞行甲壳',
  'Chitinous Plating': '几丁质护甲',
  'Anabolic Synthesis': '合成代谢',
};

/** Everything that is not composed. */
const TERMS: Record<string, string> = {
  // Plugin and pack
  'StarCraft II': '星际争霸 II',
  'Command card hotkeys for all three races, Standard or Grid, straight from the game data. Best in Speed mode.':
    '三个种族的指令面板快捷键，标准或网格布局，直接取自游戏数据。推荐用速度挑战模式练习。',
  Race: '种族',
  Terran: '人族',
  Protoss: '神族',
  Zerg: '虫族',
  'Hotkey layout': '快捷键方案',
  Standard: '标准',
  Grid: '网格',
  'The built-in profile in Options › Hotkeys. Using a custom profile? Import it below.':
    '即 选项 › 快捷键 中的内置方案。用的是自定义方案？在下方导入。',
  '.SC2Hotkeys profile': '.SC2Hotkeys 快捷键文件',
  'Custom profiles live in Documents/StarCraft II/Accounts/<id>/Hotkeys/*.SC2Hotkeys. Pick your race and the layout the profile is based on above first.':
    '自定义方案位于 文档/StarCraft II/Accounts/<id>/Hotkeys/*.SC2Hotkeys。请先在上方选好种族，以及该方案基于的布局。',

  // Contexts and tags
  Global: '全局',
  'Any unit': '任意单位',
  global: '全局',
  commands: '基本指令',
  'control-groups': '编队',
  camera: '镜头',
  build: '建造',
  train: '训练',
  addons: '附加建筑',
  morph: '变形',
  research: '研究',
  abilities: '技能',

  // Global hotkeys
  'Select an idle worker': '选择空闲农民',
  'Select the whole army': '选择全部部队',
  'Jump the camera to your base': '镜头跳到主基地',
  'Jump to the last alert': '跳到最近的警报',
  'Cycle to the next subgroup': '切换到下一个子编组',
  'Select control group 1': '选择编队 1',
  'Create control group 1': '设置编队 1',
  'Add selection to control group 1': '将所选单位加入编队 1',
  'Create control group 1, removing units from other groups': '设置编队 1，并从其他编队中移除这些单位',
  'Add to control group 1, removing units from other groups': '加入编队 1，并从其他编队中移除这些单位',
  'Save camera location 1': '保存镜头位置 1',
  'Jump to camera location 1': '跳到镜头位置 1',
  'Cycle through Warp Gates / Warp Prisms to warp in': '轮换折跃门 / 折跃棱镜进行折跃',

  // Common commands
  Move: '移动',
  Stop: '停止',
  'Hold Position': '原地待命',
  Patrol: '巡逻',
  Attack: '攻击',

  // Terran abilities
  Repair: '修理',
  Load: '装载',
  'Unload All': '全部卸载',
  'Lift Off': '升空',
  'Scanner Sweep': '扫描',
  'Calldown: MULE': '呼叫矿骡',
  'Calldown: Extra Supplies': '呼叫额外补给',
  Lower: '降下',
  'Arm Silo with Nuke': '装填核弹',
  'Use Stimpack': '使用兴奋剂',
  'Set Bunker Rally Point': '设置地堡集结点',
  'KD8 Charge': 'KD8 震撼弹',
  'Hold Fire': '停火',
  'Tac Nuke Strike': '战术核打击',
  Cloak: '隐形',
  Decloak: '取消隐形',
  'EMP Round': 'EMP 弹',
  'Weapons Free': '自由开火',
  'Steady Targeting': '稳定瞄准',
  'Hellbat Mode': '恶蝠模式',
  'Hellion Mode': '恶火模式',
  'Activate Mine': '激活地雷',
  'Deactivate Mine': '解除地雷',
  'Siege Mode': '攻城模式',
  'Tank Mode': '坦克模式',
  'Lock On': '锁定',
  Cancel: '取消',
  'High Impact Payload': '高冲击载荷',
  'Explosive Payload': '爆炸载荷',
  'Assault Mode': '突击模式',
  'Fighter Mode': '战斗机模式',
  Heal: '治疗',
  'Ignite Afterburners': '点燃加力燃烧器',
  'Defender Mode': '防御模式',
  'Anti-Armor Missile': '反装甲导弹',
  'Interference Matrix': '干扰矩阵',
  'Yamato Cannon': '大和炮',
  'Tactical Jump': '战术跳跃',

  // Protoss abilities
  'Chrono Boost': '星空加速',
  'Strategic Recall': '战略召回',
  'Energy Recharge': '能量充能',
  'Transform to Warp Gate': '转换为折跃门',
  'Transform to Gateway': '转换为传送门',
  Restore: '恢复',
  Charge: '冲锋',
  Blink: '闪烁',
  'Force Field': '力场',
  'Guardian Shield': '守护屏障',
  'Psionic Transfer': '灵能转移',
  'Archon Merge': '融合执政官',
  'Psionic Storm': '灵能风暴',
  Feedback: '反馈',
  'Shadow Stride': '暗影步',
  'Surveillance Mode': '监视模式',
  'Observer Mode': '观察模式',
  'Phasing Mode': '相位模式',
  'Transport Mode': '运输模式',
  'Purification Nova': '净化新星',
  'Graviton Beam': '重力光束',
  'Prismatic Alignment': '棱镜校准',
  Revelation: '启示',
  'Stasis Ward': '静滞结界',
  'Activate Pulsar Beam': '激活脉冲光束',
  'Deactivate Pulsar Beam': '关闭脉冲光束',
  'Cloaking Field': '隐形力场',
  'Mass Recall': '大规模召回',
  'Time Warp': '时间扭曲',

  // Zerg abilities
  Burrow: '钻地',
  Unburrow: '钻出地面',
  'Select Larvae': '选择幼虫',
  'Birth Queen': '训练虫后',
  'Spawn Larvae': '注卵',
  'Spawn Creep Tumor': '放置菌毯肿瘤',
  Transfusion: '输血',
  'Summon Nydus Worm': '召唤坑道虫',
  Explode: '引爆',
  'Enable Structure Attack': '允许攻击建筑',
  'Disable Structure Attack': '禁止攻击建筑',
  'Corrosive Bile': '腐蚀胆汁',
  Lunge: '突进',
  'Cancel Hold Fire': '取消停火',
  'Fungal Growth': '真菌增生',
  'Neural Parasite': '神经寄生',
  'Microbial Shroud': '微生物护罩',
  'Spawn Locust': '释放蝗虫',
  'Generate Creep': '生成菌毯',
  'Mutate Ventral Sacs': '变异腹囊',
  'Spawn Changeling': '生成变形体',
  Contaminate: '污染',
  Oversight: '监视',
  'Caustic Spray': '腐蚀喷射',
  Consume: '吞噬',
  'Blinding Cloud': '致盲云雾',
  Abduct: '绑架',
  'Parasitic Bomb': '寄生炸弹',

  // Build orders
  'Reaper Expand': '死神开局双矿',
  'The standard Terran opener: depot, barracks, gas, reaper, orbital, natural CC.':
    '人族标准开局：补给站、兵营、气矿、死神、轨道控制基地、分矿指挥中心。',
  '3-Rax Stim': '三兵营兴奋剂',
  'Bio follow-up after expanding: two more barracks, stim, combat shield, +1.':
    '开出分矿后的生化部队运营：再造两个兵营，研究兴奋剂、战斗盾牌和 +1 攻。',
  'Tank & Medivac': '坦克 + 医疗运输机',
  'Factory tech lab into Starport: siege tanks and medivacs for a two-base push.':
    '重工厂挂科技实验室后接星港：攻城坦克加医疗运输机，双矿推进。',
  'Gate · Core · Nexus': '传送门 · 控制核心 · 星灵枢纽',
  'The standard Protoss opener into Warp Gate, with chrono on probes.': '神族标准开局，转折跃门，星空加速探机。',
  'Stargate Oracle': '星门先知',
  'Stargate opener: Oracle harass, then Void Rays with a battery at home.':
    '星门开局：先知骚扰，随后出虚空辉光舰，家里造护盾充能器。',
  'Blink Stalkers': '闪烁追猎',
  'Twilight Council into Blink with a robo for detection.': '暮光议会研究闪烁，机械台出观察者反隐。',
  'Hatch · Gas · Pool': '孵化场 · 气矿 · 孵化池',
  'The standard Zerg opener (16 hatch, 18 gas, 17 pool) into queens and ling speed.':
    '虫族标准开局（16 基地、18 气、17 池），接虫后和跳虫速度。',
  'Roach · Ravager': '蟑螂 · 破坏者',
  'Roach Warren and Lair off two bases, roach speed, ravagers and +1 missile.':
    '双矿出蟑螂温室和虫穴，研究蟑螂速度，出破坏者，升 +1 远程攻击。',
  'Inject & Drone Cycle': '注卵与补农循环',
  'The macro loop: inject, spread creep, drone up, keep supply ahead.': '运营循环：注卵、铺菌毯、补农民、提前补人口。',

  // Build order notes (supply counts pass through untranslated)
  '16 · natural': '16 · 分矿',
  '19 · Barracks done': '19 · 兵营完成',
  '20 · natural': '20 · 分矿',
  '100 gas': '100 气',
  '2 pairs': '2 对',
  '3 rax': '3 兵营',
  'after Stim': '兴奋剂之后',
  'after the Reaper': '死神之后',
  'at the front': '在前线',
  'at their mineral line': '对方矿区',
  'blink forward': '向前闪烁',
  'Core done': '控制核心完成',
  'creep queen': '铺毯虫后',
  'Factory done': '重工厂完成',
  inject: '注卵',
  'Lair done': '虫穴完成',
  leapfrog: '交替推进',
  main: '主矿',
  natural: '分矿',
  'on Blink': '加速闪烁研究',
  'on Nexus': '加速星灵枢纽',
  'on Stargate': '加速星门',
  'on their units': '对方单位',
  'on Warp Gate research': '加速折跃门研究',
  'Orbital done': '轨道控制基地完成',
  'Pool done · both hatcheries': '孵化池完成 · 两个基地',
  'push out': '出兵',
  'reactor rax': '反应堆兵营',
  'Stargate done': '星门完成',
  'third base': '三矿',
  'Twilight done': '暮光议会完成',
  'up to 4 gates': '补到 4 个传送门',
  'warp-in round': '一轮折跃',
};

/** Larva morphs read better as "hatch" than "morph". */
const FROM_LARVA = new Set(['Drone', 'Zergling', 'Overlord', 'Roach', 'Hydralisk', 'Mutalisk', 'Corruptor', 'Infestor', 'Swarm Host', 'Ultralisk', 'Viper']);
/** Protoss "Warp In" covers both probe buildings and units from any production structure. */
const PROTOSS_STRUCTURES = new Set([
  'Nexus', 'Pylon', 'Assimilator', 'Gateway', 'Forge', 'Cybernetics Core', 'Photon Cannon', 'Shield Battery',
  'Twilight Council', 'Robotics Facility', 'Robotics Bay', 'Stargate', 'Fleet Beacon', 'Templar Archives', 'Dark Shrine',
]);
/** "Mutate into" upgrades a structure in place for these, and builds a new one otherwise. */
const UPGRADED = new Set(['Lair', 'Hive', 'Greater Spire']);

/** Composed names: an English pattern, and how to build the Chinese from the looked-up part. */
const RULES: [RegExp, Record<string, string>, (zh: string, en: string, extra?: string) => string][] = [
  [/^Build (.+)$/, UNITS, (z) => `建造${z}`],
  [/^Train (.+)$/, UNITS, (z) => `训练${z}`],
  [/^Warp In (.+)$/, UNITS, (z, en) => (PROTOSS_STRUCTURES.has(en) ? `建造${z}` : `训练${z}`)],
  [/^Mutate into (.+)$/, UNITS, (z, en) => (UPGRADED.has(en) ? `升级为${z}` : `变异为${z}`)],
  [/^Morph to (.+)$/, UNITS, (z, en) => (FROM_LARVA.has(en) ? `孵化${z}` : `变形为${z}`)],
  [/^Upgrade to (.+)$/, UNITS, (z) => `升级为${z}`],
  [/^Research (.+)$/, UPGRADES, (z) => `研究${z}`],
  [/^Upgrade (.+)$/, UPGRADES, (z) => `升级${z}`],
  [/^Evolve (.+)$/, UPGRADES, (z) => `进化${z}`],
  [/^Summon (.+) Hallucination$/, UNITS, (z) => `幻象：${z}`],
  [/^Summon \d+ (.+) Hallucinations$/, UNITS, (z, _, count) => `幻象：${count} 个${z}`],
  [/^(.+) \((.+)\)$/, UNITS, (z, _, state) => `${z}（${STATES[state!] ?? state}）`],
];

/** Translate one name, or `undefined` if it is unknown. */
export function zhName(text: string): string | undefined {
  const direct = TERMS[text] ?? UNITS[text];
  if (direct) return direct;
  for (const [re, table, compose] of RULES) {
    const m = text.match(re);
    const zh = m && table[m[1]!];
    // The extra part is the unit state, or the hallucination count.
    if (zh) return compose(zh, m[1]!, m[2] ?? text.match(/\d+/)?.[0]);
  }
  return undefined;
}

/** Pack names, as built in pack.ts: "Terran · Standard", plus " · custom" once imported. */
const PACK_NAMES = Object.fromEntries(
  Object.values(RACE_NAMES).flatMap((r) =>
    Object.values(LAYOUT_NAMES).flatMap((l) => {
      const name = `${TERMS[r]} · ${TERMS[l]}`;
      return [
        [`${r} · ${l}`, name],
        [`${r} · ${l} · custom`, `${name} · 自定义`],
      ];
    }),
  ),
);

/**
 * Lookup table for the plugin. Composed names are expanded for every English name the game data
 * produces, so the table is plain data like any other plugin's.
 */
export function buildZhMessages(names: Iterable<string>): Messages {
  const out: Messages = { ...UNITS, ...TERMS, ...PACK_NAMES };
  for (const n of names) {
    const zh = zhName(n);
    if (zh) out[n] = zh;
  }
  return out;
}
