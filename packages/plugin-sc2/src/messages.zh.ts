import type { Messages } from '@keydojo/core';
import { LAYOUT_NAMES, RACE_NAMES } from './pack';

/**
 * Chinese names as in the 国服 (zhCN) client. Blizzard's zhCN game strings aren't public, so names
 * come from Chinese sources, most reliable first:
 *
 *   [S] sc2.blizzard.cn unit pages and tech trees (2017, via the Wayback Machine)
 *   [N] sc2.blizzard.cn patch notes (2020–2026); where a name changed since [S], [N] wins
 *   [B] zhCN .SC2Mod data (TeamKoprulu/SCEvoComplete), which copies the client's button names and
 *       verb patterns (建造 / 训练 / 制造 / 折跃 / 变异为 / 研究 / 进化)
 *   [W] 灰机 / B站 wikis, Baidu Baike, NetEase game pages — for things added after 2017
 *
 * Unmarked entries follow those patterns (取消…, 关闭…) or are our own wording (global hotkeys).
 * Button names are mostly "<verb> <unit or upgrade>", so they are composed from the tables
 * below by RULES; `zhName` resolves one name.
 */

/** Units and structures [S]. */
const UNITS: Record<string, string> = {
  // Terran
  SCV: 'SCV',
  MULE: '矿骡', // [N]
  'Command Center': '指挥中心',
  'Orbital Command': '轨道控制基地',
  'Planetary Fortress': '行星要塞',
  'Supply Depot': '补给站',
  Refinery: '精炼厂',
  Barracks: '兵营',
  'Engineering Bay': '工程站',
  Bunker: '地堡',
  'Missile Turret': '导弹塔',
  'Sensor Tower': '感应塔', // [W]
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
  Marauder: '劫掠者',
  Reaper: '收割者',
  Ghost: '幽灵',
  Hellion: '恶火',
  Hellbat: '恶蝠',
  'Widow Mine': '寡妇雷',
  'Siege Tank': '攻城坦克',
  Cyclone: '飓风',
  Thor: '雷神',
  Viking: '维京战机',
  Medivac: '医疗运输机',
  Liberator: '解放者',
  Raven: '铁鸦',
  Banshee: '女妖',
  Battlecruiser: '战列巡航舰',

  // Protoss
  Probe: '探机',
  Nexus: '星灵枢纽',
  Pylon: '水晶塔',
  Assimilator: '吸纳舱',
  Gateway: '传送门',
  'Warp Gate': '折跃门',
  Forge: '锻炉',
  'Cybernetics Core': '控制芯核',
  'Photon Cannon': '光子炮台',
  'Shield Battery': '护盾充能器', // [N]
  'Twilight Council': '光影议会',
  'Robotics Facility': '机械台',
  'Robotics Bay': '机械研究所',
  Stargate: '星门',
  'Fleet Beacon': '舰队航标',
  'Templar Archives': '圣堂武士文献馆',
  'Dark Shrine': '黑暗圣坛',
  Zealot: '狂热者',
  Stalker: '追猎者',
  Sentry: '机械哨兵',
  Adept: '使徒',
  'High Templar': '高阶圣堂武士',
  'Dark Templar': '黑暗圣堂武士',
  Archon: '执政官',
  Observer: '侦测器',
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
  Interceptor: '拦截机', // [N]

  // Zerg
  Drone: '工蜂',
  Larva: '幼虫',
  Larvae: '幼虫',
  Hatchery: '孵化场',
  Lair: '虫穴',
  Hive: '主巢',
  Queen: '虫后',
  Extractor: '萃取房',
  'Spawning Pool': '分裂池',
  'Evolution Chamber': '进化腔',
  'Roach Warren': '蟑螂温室',
  'Baneling Nest': '爆虫巢穴',
  'Hydralisk Den': '刺蛇巢',
  'Lurker Den': '潜伏者巢穴',
  'Infestation Pit': '感染深渊',
  Spire: '尖塔',
  'Greater Spire': '巨型尖塔',
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
  Infestor: '感染者',
  'Swarm Host': '虫群宿主',
  Ultralisk: '雷兽',
  Overlord: '王虫',
  Overseer: '眼虫',
  Mutalisk: '异龙',
  Corruptor: '腐化者',
  'Brood Lord': '巢虫领主',
  Viper: '飞蛇',
  Locust: '蝗虫',
  Changeling: '拟态雏虫',
};

/** Unit states, as in "Siege Tank (sieged)" — named after the mode button [S]. */
const STATES: Record<string, string> = {
  burrowed: '潜地',
  sieged: '攻城模式',
  'high impact': '冲击弹头',
  fighter: '战机模式',
  assault: '机甲模式',
  defender: '防卫模式',
  surveillance: '监察模式', // [B][N]
  phasing: '相位模式',
};

/** Upgrades and research [S], composed with "Research …" / "Upgrade …" / "Evolve …". */
const UPGRADES: Record<string, string> = {
  'Combat Shield': '防暴护盾',
  Stimpack: '强化剂',
  'Concussive Shells': '震荡弹',
  'Infernal Pre-Igniter': '地狱火预燃器',
  'Drilling Claws': '钻地之爪', // [N]
  'Smart Servos': '智能伺服器', // [W]
  'Mag-Field Accelerator': '电磁力场加速器',
  'Cloaking Field': '隐形力场',
  'Hyperflight Rotors': '高速旋翼', // [N]
  'Interference Matrix': '干扰矩阵', // [W]
  'Infantry Weapons': '人类步兵武器',
  'Infantry Armor': '人类步兵护甲',
  'Neosteel Armor': '精钢护甲', // [W]
  'Hi-Sec Auto Tracking': '瞬时自动追踪', // [N]
  'Vehicle Weapons': '人类战车武器',
  'Ship Weapons': '人类舰船武器',
  'Vehicle and Ship Plating': '人类战车及舰船钢板', // [S] 战车钢板 + 舰船钢板, merged as in [B]
  'Personal Cloaking': '隐形迷彩',
  'Weapon Refit': '武器改装',
  'Advanced Ballistics': '强化弹道',
  'Caduceus Reactor': '卡度休斯反应堆',

  'Ground Weapons': '星灵地面单位武器',
  'Ground Armor': '星灵地面单位护甲',
  Shields: '星灵护盾',
  'Air Weapons': '星灵空中单位武器',
  'Air Armor': '星灵空中单位护甲',
  'Warp Gate': '折跃门', // [N]
  Blink: '闪现',
  Charge: '冲锋',
  'Resonating Glaives': '共鸣之刃',
  'Extended Thermal Lance': '加长热能射线枪',
  'Gravitic Boosters': '重力加速器',
  'Gravitic Drive': '重力驱动器',
  'Anion Pulse-Crystals': '阴离子脉冲水晶',
  'Flux Vanes': '熔流旋叶', // [W]
  'Tectonic Destabilizers': '构造失稳器', // [W]
  'Psionic Storm': '灵能风暴',
  'Shadow Stride': '暗影步', // [W]

  'Pneumatized Carapace': '充气甲壳',
  Burrow: '潜地',
  'Metabolic Boost': '代谢加速',
  'Adrenal Glands': '肾上腺体',
  'Ground Carapace': '异虫地面单位甲壳',
  'Melee Attacks': '异虫近战攻击',
  'Missile Attacks': '异虫喷射攻击',
  'Glial Reconstitution': '神经胶原重组',
  'Tunneling Claws': '掘地之爪',
  'Centrifugal Hooks': '环心镰钩',
  'Grooved Spines': '深槽脊刺',
  'Muscular Augments': '肌腱扩增',
  'Nanomuscular Swell': '狂暴', // [W] the research is named after the ability (Frenzy)
  'Adaptive Talons': '适应之爪', // [N]
  'Seismic Spines': '震地脊刺', // [W]
  'Neural Parasite': '神经寄生',
  'Flyer Attacks': '异虫飞行生物攻击',
  'Flyer Carapace': '异虫飞行生物甲壳',
  'Chitinous Plating': '骨板',
  'Anabolic Synthesis': '合成代谢', // [B]
};

/** Everything that is not composed. */
const TERMS: Record<string, string> = {
  // Plugin and pack
  'StarCraft II': '星际争霸 II',
  'Command card hotkeys for all three races, Standard or Grid, straight from the game data. Best in Speed mode.':
    '三个种族的指令面板快捷键，标准或网格布局，直接取自游戏数据。推荐用速度挑战模式练习。',
  Race: '种族',
  Terran: '人类',
  Protoss: '星灵',
  Zerg: '异虫',
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
  'control-groups': '控制组',
  camera: '镜头',
  build: '建造',
  train: '生产',
  addons: '附加建筑',
  morph: '变形',
  research: '研究',
  abilities: '技能',

  // Global hotkeys (our own phrasing; 控制组 and 子编组 as in [N])
  'Select an idle worker': '选择闲置工人',
  'Select the whole army': '选择全部部队',
  'Jump the camera to your base': '镜头跳到主基地',
  'Jump to the last alert': '跳到最近的警报',
  'Cycle to the next subgroup': '切换到下一个子编组',
  'Select control group 1': '选择控制组 1',
  'Create control group 1': '设置控制组 1',
  'Add selection to control group 1': '将所选单位加入控制组 1',
  'Create control group 1, removing units from other groups': '设置控制组 1，并从其他控制组中移除这些单位',
  'Add to control group 1, removing units from other groups': '加入控制组 1，并从其他控制组中移除这些单位',
  'Save camera location 1': '保存镜头位置 1',
  'Jump to camera location 1': '跳到镜头位置 1',
  'Cycle through Warp Gates / Warp Prisms to warp in': '轮换折跃门 / 折跃棱镜进行折跃',

  // Common commands
  Move: '移动',
  Stop: '停止',
  'Hold Position': '原地驻守',
  Patrol: '巡逻',
  Attack: '攻击', // [S]

  // Terran
  Repair: '修理', // [S]
  Load: '装载', // [B]
  'Unload All': '卸载全部', // [B]
  'Lift Off': '起飞', // [B]
  'Scanner Sweep': '析像扫描', // [B][W]
  'Calldown: MULE': '轨道空投：矿骡', // [W]
  'Calldown: Extra Supplies': '轨道空投：补给站', // [W]
  Lower: '降下', // [W]
  'Arm Silo with Nuke': '装填核弹发射井', // [B]
  'Use Stimpack': '使用强化剂', // [S]
  'Set Bunker Rally Point': '设定地堡集结点', // [B] 设定集结点
  'KD8 Charge': 'KD8型炸弹', // [S][N]
  'Hold Fire': '停火', // [S]
  'Cancel Hold Fire': '取消停火',
  'Tac Nuke Strike': '战术聚变打击', // [S]
  Cloak: '隐形', // [S]
  Decloak: '解除隐形', // [B]
  'EMP Round': '电磁脉冲', // [N] (EMP弹 in [S])
  'Weapons Free': '自由射击', // [S]
  'Steady Targeting': '稳定瞄准', // [S][N]
  'Hellbat Mode': '恶蝠模式', // [S]
  'Hellion Mode': '恶火模式', // [S]
  'Activate Mine': '激活地雷', // [S]
  'Deactivate Mine': '解除激活地雷',
  'Siege Mode': '攻城模式', // [S]
  'Tank Mode': '坦克模式', // [S]
  'Lock On': '锁定', // [S]
  Cancel: '取消',
  'High Impact Payload': '冲击弹头', // [S]
  'Explosive Payload': '爆裂弹头', // [S]
  'Assault Mode': '机甲模式', // [S]
  'Fighter Mode': '战机模式', // [S]
  Heal: '治疗', // [S]
  'Ignite Afterburners': '后燃推进系统', // [S]
  'Defender Mode': '防卫模式', // [S]
  'Anti-Armor Missile': '反护甲飞弹', // [N]
  'Interference Matrix': '干扰矩阵', // [W]
  'Yamato Cannon': '大和炮', // [S]
  'Tactical Jump': '战术跳跃', // [S]

  // Protoss
  'Chrono Boost': '时空提速', // [N] (星空加速 before Legacy of the Void)
  'Strategic Recall': '枢纽召回', // [N]
  'Energy Recharge': '充能', // [N]
  'Transform to Warp Gate': '变形为折跃门', // [N]
  'Transform to Gateway': '变形为传送门',
  Restore: '恢复', // [B]
  Charge: '冲锋', // [S]
  Blink: '闪现', // [S]
  'Force Field': '力场', // [S]
  'Guardian Shield': '守护者之盾', // [S][N]
  'Psionic Transfer': '灵能传送', // [S]
  'Archon Merge': '执政官融合', // [S]
  'Psionic Storm': '灵能风暴', // [S]
  Feedback: '能量反蚀', // [S]
  'Shadow Stride': '暗影步', // [W]
  'Surveillance Mode': '监察模式', // [B][N]
  'Observer Mode': '侦测器模式', // [B]
  'Phasing Mode': '相位模式', // [S]
  'Transport Mode': '运输模式',
  'Purification Nova': '净化新星', // [S][N]
  'Graviton Beam': '引力子光束', // [N]
  'Prismatic Alignment': '校准棱镜', // [S][N]
  Revelation: '天启', // [S][N]
  'Stasis Ward': '静滞结界', // [S][N]
  'Activate Pulsar Beam': '激活脉冲光线', // [S]
  'Deactivate Pulsar Beam': '关闭脉冲光线',
  'Cloaking Field': '隐形力场', // [S]
  'Mass Recall': '群体召回', // [S]
  'Time Warp': '时间扭曲', // [N] (时空折跃 in [S])

  // Zerg
  Burrow: '潜地', // [S]
  Unburrow: '出地', // [B]
  'Select Larvae': '选择幼虫', // [B]
  'Birth Queen': '孵化虫后',
  'Spawn Larvae': '孵化幼虫', // [S]
  'Spawn Creep Tumor': '产下菌毯肿瘤', // [S]
  Transfusion: '哺液', // [S]
  'Summon Nydus Worm': '召唤坑道虫',
  Explode: '爆炸', // [S]
  'Enable Structure Attack': '开启对建筑攻击', // [S]
  'Disable Structure Attack': '关闭对建筑攻击',
  'Corrosive Bile': '腐蚀胆汁', // [S]
  Lunge: '狂暴', // [W] the button is HydraliskFrenzy
  'Fungal Growth': '霉菌滋生', // [S]
  'Neural Parasite': '神经寄生', // [S]
  'Microbial Shroud': '微生物环绕云', // [N]
  'Spawn Locust': '孵化蝗虫', // [S]
  'Generate Creep': '排放菌毯', // [S][N]
  'Mutate Ventral Sacs': '变异腹囊', // [S]
  'Spawn Changeling': '孵化拟态雏虫', // [S]
  Contaminate: '污染', // [S]
  Oversight: '超距视界', // [W]
  'Caustic Spray': '腐蚀喷液', // [S]
  Consume: '吞噬', // [S]
  'Blinding Cloud': '蔽目毒云', // [S]
  Abduct: '绑架', // [S][N]
  'Parasitic Bomb': '寄生弹', // [S]

  // Build orders
  'Reaper Expand': '收割者开局双矿',
  'The standard Terran opener: depot, barracks, gas, reaper, orbital, natural CC.':
    '人类标准开局：补给站、兵营、瓦斯、收割者、轨道控制基地、分矿指挥中心。',
  '3-Rax Stim': '三兵营强化剂',
  'Bio follow-up after expanding: two more barracks, stim, combat shield, +1.':
    '开出分矿后的生化部队运营：再造两个兵营，研究强化剂、防暴护盾和 +1 攻。',
  'Tank & Medivac': '坦克 + 医疗运输机',
  'Factory tech lab into Starport: siege tanks and medivacs for a two-base push.':
    '重工厂挂科技实验室后接星港：攻城坦克加医疗运输机，双矿推进。',
  'Gate · Core · Nexus': '传送门 · 控制芯核 · 星灵枢纽',
  'The standard Protoss opener into Warp Gate, with chrono on probes.': '星灵标准开局，转折跃门，时空提速探机。',
  'Stargate Oracle': '星门先知',
  'Stargate opener: Oracle harass, then Void Rays with a battery at home.':
    '星门开局：先知骚扰，随后出虚空辉光舰，家里造护盾充能器。',
  'Blink Stalkers': '闪现追猎',
  'Twilight Council into Blink with a robo for detection.': '光影议会研究闪现，机械台出侦测器反隐。',
  'Hatch · Gas · Pool': '孵化场 · 瓦斯 · 分裂池',
  'The standard Zerg opener (16 hatch, 18 gas, 17 pool) into queens and ling speed.':
    '异虫标准开局（16 孵化场、18 瓦斯、17 分裂池），接虫后和跳虫速度。',
  'Roach · Ravager': '蟑螂 · 破坏者',
  'Roach Warren and Lair off two bases, roach speed, ravagers and +1 missile.':
    '双矿出蟑螂温室和虫穴，研究蟑螂速度，出破坏者，升 +1 喷射攻击。',
  'Inject & Drone Cycle': '注卵与补工蜂循环',
  'The macro loop: inject, spread creep, drone up, keep supply ahead.': '运营循环：注卵、铺菌毯、补工蜂、提前补人口。',

  // Build order notes (supply counts pass through untranslated)
  '16 · natural': '16 · 分矿',
  '19 · Barracks done': '19 · 兵营完成',
  '20 · natural': '20 · 分矿',
  '100 gas': '100 瓦斯',
  '2 pairs': '2 对',
  '3 rax': '3 兵营',
  'after Stim': '强化剂之后',
  'after the Reaper': '收割者之后',
  'at the front': '在前线',
  'at their mineral line': '对方矿区',
  'blink forward': '向前闪现',
  'Core done': '控制芯核完成',
  'creep queen': '铺毯虫后',
  'Factory done': '重工厂完成',
  inject: '注卵',
  'Lair done': '虫穴完成',
  leapfrog: '交替推进',
  main: '主矿',
  natural: '分矿',
  'on Blink': '时空提速闪现研究',
  'on Nexus': '时空提速星灵枢纽',
  'on Stargate': '时空提速星门',
  'on their units': '对方单位',
  'on Warp Gate research': '时空提速折跃门研究',
  'Orbital done': '轨道控制基地完成',
  'Pool done · both hatcheries': '分裂池完成 · 两个孵化场',
  'push out': '出兵',
  'reactor rax': '反应堆兵营',
  'Stargate done': '星门完成',
  'third base': '三矿',
  'Twilight done': '光影议会完成',
  'up to 4 gates': '补到 4 个传送门',
  'warp-in round': '一轮折跃',
};

/** Terran structures are "建造", but units from the Factory and Starport are "制造" [B]. */
const TERRAN_STRUCTURES = new Set([
  'Command Center', 'Supply Depot', 'Refinery', 'Barracks', 'Engineering Bay', 'Bunker', 'Missile Turret',
  'Sensor Tower', 'Ghost Academy', 'Factory', 'Armory', 'Starport', 'Fusion Core', 'Tech Lab', 'Reactor', 'Interceptor',
]);

/** Composed names: an English pattern, and how to build the Chinese from the looked-up part [B]. */
const RULES: [RegExp, Record<string, string>, (zh: string, en: string, extra?: string) => string][] = [
  [/^Build (.+)$/, UNITS, (z, en) => (TERRAN_STRUCTURES.has(en) ? `建造${z}` : `制造${z}`)],
  [/^Train (.+)$/, UNITS, (z) => `训练${z}`],
  [/^Warp In (.+)$/, UNITS, (z) => `折跃${z}`],
  [/^(?:Mutate into|Morph to) (.+)$/, UNITS, (z) => `变异为${z}`],
  [/^Upgrade to (.+)$/, UNITS, (z) => `升级为${z}`],
  [/^Research (.+)$/, UPGRADES, (z) => `研究${z}`],
  [/^Upgrade (.+)$/, UPGRADES, (z) => `升级${z}`],
  [/^Evolve (.+)$/, UPGRADES, (z) => `进化${z}`],
  [/^Summon (.+) Hallucination$/, UNITS, (z) => `生成${z}幻像`], // [S]
  [/^Summon \d+ (.+) Hallucinations$/, UNITS, (z, _, count) => `生成${count}个${z}幻像`], // [S]
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
