/**
 * Runs random encounters and resolves group melee combat, initiative, maneuvers, wounds, conditions, fleeing, loot, and battle inventory use.
 */

const MELEE_WEAPONS = {
  unarmed: { name: 'Unarmed', attackTarget: 5, defenseTarget: 6, damageModifier: -1, damageType: 'bludgeoning', damageFactor: 3, reach: 1, kind: 'melee', canBash: true },
  armingSword: { name: 'Arming Sword', attackTarget: 6, defenseTarget: 6, damageModifier: 1, damageType: 'cutting', damageFactor: 3, reach: 3, kind: 'melee', canCut: true, canThrust: true },
  bastardSword: { name: 'Bastard Sword', attackTarget: 6, defenseTarget: 6, damageModifier: 1, damageType: 'cutting', damageFactor: 3, reach: 4, kind: 'melee', canCut: true, canThrust: true },
  cutThrustSword: { name: 'Cut and Thrust Sword', attackTarget: 6, defenseTarget: 6, damageModifier: 1, damageType: 'puncturing', damageFactor: 3, reach: 3, kind: 'melee', canCut: true, canThrust: true },
  poniard: { name: 'Poniard', attackTarget: 7, defenseTarget: 7, damageModifier: 0, damageType: 'puncturing', damageFactor: 3, reach: 1, kind: 'melee', canCut: true, canThrust: true },
  rondel: { name: 'Rondel Dagger', attackTarget: 7, defenseTarget: 9, damageModifier: 0, damageType: 'puncturing', damageFactor: 3, reach: 1, kind: 'melee', canThrust: true },
  stiletto: { name: 'Stiletto', attackTarget: 7, defenseTarget: 9, damageModifier: 0, damageType: 'puncturing', damageFactor: 3, reach: 1, kind: 'melee', canThrust: true },
  doppelhander: { name: 'Doppelhander', attackTarget: 7, defenseTarget: 8, damageModifier: 4, damageType: 'cutting', damageFactor: 3, reach: 5, kind: 'melee', canCut: true, canThrust: true },
  estoc: { name: 'Estoc', attackTarget: 7, defenseTarget: 6, damageModifier: 2, damageType: 'puncturing', damageFactor: 3, reach: 4, kind: 'melee', canBash: true, canThrust: true },
  falchion: { name: 'Falchion', attackTarget: 6, defenseTarget: 7, damageModifier: 2, damageType: 'cutting', damageFactor: 3, reach: 3, kind: 'melee', canCut: true },
  greatSword: { name: 'Great Sword', attackTarget: 6, defenseTarget: 7, damageModifier: 3, damageType: 'cutting', damageFactor: 3, reach: 4, kind: 'melee', canCut: true, canThrust: true },
  longsword: { name: 'Long Sword', attackTarget: 6, defenseTarget: 6, damageModifier: 2, damageType: 'cutting', damageFactor: 3, reach: 4, kind: 'melee', canCut: true, canThrust: true },
  rapier: { name: 'Rapier', attackTarget: 5, defenseTarget: 8, damageModifier: 2, damageType: 'puncturing', damageFactor: 3, reach: 3, kind: 'melee', canCut: true, canThrust: true },
  saber: { name: 'Saber', attackTarget: 6, defenseTarget: 6, damageModifier: 2, damageType: 'cutting', damageFactor: 3, reach: 3, kind: 'melee', canCut: true, canThrust: true },
  scimitar: { name: 'Scimitar', attackTarget: 6, defenseTarget: 6, damageModifier: 2, damageType: 'cutting', damageFactor: 3, reach: 3, kind: 'melee', canCut: true, canThrust: true },
  shortSword: { name: 'Short Sword', attackTarget: 5, defenseTarget: 7, damageModifier: 0, damageType: 'puncturing', damageFactor: 3, reach: 2, kind: 'melee', canCut: true, canThrust: true },
  club: { name: 'Club', attackTarget: 6, defenseTarget: 7, damageModifier: 1, damageType: 'bludgeoning', damageFactor: 3, reach: 3, kind: 'melee', canBash: true },
  flail: { name: 'Flail', attackTarget: 8, defenseTarget: 9, damageModifier: 2, damageType: 'bludgeoning', damageFactor: 3, reach: 3, kind: 'melee', canBash: true },
  handAxe: { name: 'Hand Axe', attackTarget: 7, defenseTarget: 8, damageModifier: 2, damageType: 'cutting', damageFactor: 3, reach: 3, kind: 'melee', canCut: true, canHook: true },
  knuckleDuster: { name: 'Knuckle-duster', attackTarget: 5, defenseTarget: 6, damageModifier: 0, damageType: 'bludgeoning', damageFactor: 3, reach: 1, kind: 'melee', canBash: true },
  mace: { name: 'Mace', attackTarget: 6, defenseTarget: 8, damageModifier: 2, damageType: 'bludgeoning', damageFactor: 3, reach: 3, kind: 'melee', canBash: true },
  maul: { name: 'Maul', attackTarget: 8, defenseTarget: 9, damageModifier: 3, damageType: 'bludgeoning', damageFactor: 3, reach: 4, kind: 'melee', canBash: true },
  morningStar: { name: 'Morning Star', attackTarget: 6, defenseTarget: 8, damageModifier: 2, damageType: 'bludgeoning', damageFactor: 3, reach: 3, kind: 'melee', canBash: true },
  footmansPick: { name: "Footman's Pick", attackTarget: 6, defenseTarget: 8, damageModifier: 2, damageType: 'puncturing', damageFactor: 3, reach: 3, kind: 'melee', canThrust: true, canHook: true },
  poleAxe: { name: 'Pole Axe', attackTarget: 7, defenseTarget: 7, damageModifier: 3, damageType: 'cutting', damageFactor: 3, reach: 4, kind: 'melee', canCut: true, canThrust: true, canHook: true },
  warflail: { name: 'Warflail', attackTarget: 8, defenseTarget: 9, damageModifier: 4, damageType: 'bludgeoning', damageFactor: 3, reach: 4, kind: 'melee', canBash: true },
  warhammer: { name: 'Warhammer', attackTarget: 6, defenseTarget: 8, damageModifier: 2, damageType: 'bludgeoning', damageFactor: 3, reach: 3, kind: 'melee', canBash: true, canHook: true },
  bill: { name: 'Bill', attackTarget: 7, defenseTarget: 7, damageModifier: 3, damageType: 'cutting', damageFactor: 3, reach: 4, kind: 'melee', canCut: true, canThrust: true, canHook: true },
  halberd: { name: 'Halberd', attackTarget: 7, defenseTarget: 8, damageModifier: 3, damageType: 'cutting', damageFactor: 3, reach: 4, kind: 'melee', canCut: true, canThrust: true, canHook: true },
  heavyLance: { name: 'Heavy Lance', attackTarget: 7, defenseTarget: 9, damageModifier: 2, damageType: 'puncturing', damageFactor: 3, reach: 5, kind: 'melee', canThrust: true },
  lightLance: { name: 'Light Lance', attackTarget: 7, defenseTarget: 9, damageModifier: 1, damageType: 'puncturing', damageFactor: 3, reach: 5, kind: 'melee', canThrust: true },
  pike: { name: 'Pike', attackTarget: 7, defenseTarget: 9, damageModifier: 2, damageType: 'puncturing', damageFactor: 3, reach: 6, kind: 'melee', canThrust: true },
  spear: { name: 'Spear', attackTarget: 6, defenseTarget: 7, damageModifier: 2, damageType: 'puncturing', damageFactor: 3, reach: 4, kind: 'melee', canThrust: true, canHook: true },
  longSpear: { name: 'Long Spear', attackTarget: 7, defenseTarget: 8, damageModifier: 2, damageType: 'puncturing', damageFactor: 3, reach: 5, kind: 'melee', canThrust: true, canHook: true },
  shortSpear: { name: 'Short Spear', attackTarget: 7, defenseTarget: 7, damageModifier: 2, damageType: 'puncturing', damageFactor: 3, reach: 3, kind: 'melee', canThrust: true, canHook: true },
  quarterstaff: { name: 'Quarterstaff', attackTarget: 6, defenseTarget: 6, damageModifier: 1, damageType: 'bludgeoning', damageFactor: 3, reach: 4, kind: 'melee', canBash: true },
  shortStaff: { name: 'Shortstaff', attackTarget: 6, defenseTarget: 7, damageModifier: 2, damageType: 'bludgeoning', damageFactor: 3, reach: 5, kind: 'melee', canBash: true },
  crossbow: { name: 'Crossbow', attackTarget: 5, defenseTarget: 9, damageModifier: 3, damageType: 'puncturing', damageFactor: 3, reach: 0, kind: 'ranged' },
  longbow: { name: 'Longbow', attackTarget: 6, defenseTarget: 9, damageModifier: 3, damageType: 'puncturing', damageFactor: 3, reach: 0, kind: 'ranged' },
  shortbow: { name: 'Short Bow', attackTarget: 6, defenseTarget: 9, damageModifier: 2, damageType: 'puncturing', damageFactor: 3, reach: 0, kind: 'ranged' },
  javelin: { name: 'Javelin', attackTarget: 7, defenseTarget: 9, damageModifier: 1, damageType: 'puncturing', damageFactor: 3, reach: 0, kind: 'ranged' },
  sling: { name: 'Sling', attackTarget: 7, defenseTarget: 9, damageModifier: 1, damageType: 'bludgeoning', damageFactor: 3, reach: 0, kind: 'ranged' },
  throwingKnife: { name: 'Throwing Knife', attackTarget: 7, defenseTarget: 9, damageModifier: -1, damageType: 'puncturing', damageFactor: 3, reach: 0, kind: 'ranged' },
  throwingAxe: { name: 'Throwing Axe', attackTarget: 7, defenseTarget: 9, damageModifier: 1, damageType: 'cutting', damageFactor: 3, reach: 0, kind: 'ranged' },
  throwingRock: { name: 'Thrown Rock/Object', attackTarget: 9, defenseTarget: 9, damageModifier: -1, damageType: 'bludgeoning', damageFactor: 3, reach: 0, kind: 'ranged' },
}

Object.assign(MELEE_WEAPONS, FLOWER_WEAPONS)

// Stores the maneuver profiles values used by the rest of this file.
const MANEUVER_PROFILES = {
  unarmed: { offense: ['disarm', 'grapple', 'kick', 'punch'], defense: ['disarmDefense', 'grappleDefense', 'parry', 'fullEvasion', 'partialEvasion', 'duckWeave'] },
  dagger: { offense: ['cut', 'disarm', 'drawCut', 'grapple', 'kick', 'punch', 'quickDraw', 'thrust'], defense: ['disarmDefense', 'grappleDefense', 'overrun', 'parry', 'quickDrawDefense', 'fullEvasion', 'partialEvasion', 'duckWeave'] },
  greatsword: { offense: ['beat', 'cut', 'drawCut', 'disarm', 'evasiveAttack', 'feintCut', 'feintThrust', 'halfSword', 'masterStrike', 'murderStroke', 'stopShort', 'thrust', 'twitch', 'windingBinding'], defense: ['counter', 'disarmDefense', 'expulsion', 'grappleDefense', 'halfSwordDefense', 'masterStrikeDefense', 'overrun', 'parry', 'rota', 'windingBindingDefense', 'fullEvasion', 'partialEvasion', 'duckWeave'] },
  cutThrust: { offense: ['beat', 'bindStrike', 'cut', 'drawCut', 'disarm', 'doubleStrike', 'feintCut', 'feintThrust', 'masterStrike', 'quickDraw', 'simultaneousBlockStrike', 'stopShort', 'thrust', 'toss', 'twitch', 'windingBinding'], defense: ['block', 'blockOpenStrike', 'counter', 'disarmDefense', 'expulsion', 'grappleDefense', 'masterStrikeDefense', 'overrun', 'parry', 'quickDrawDefense', 'rota', 'windingBindingDefense', 'fullEvasion', 'partialEvasion', 'duckWeave'] },
  rapier: { offense: ['beat', 'bindStrike', 'disarm', 'doubleStrike', 'feintThrust', 'masterStrike', 'simultaneousBlockStrike', 'stopShort', 'thrust', 'toss'], defense: ['block', 'blockOpenStrike', 'counter', 'disarmDefense', 'expulsion', 'grappleDefense', 'masterStrikeDefense', 'overrun', 'parry', 'fullEvasion', 'partialEvasion', 'duckWeave'] },
  mass: { offense: ['bash', 'bindStrike', 'cut', 'disarm', 'hook', 'simultaneousBlockStrike', 'thrust', 'twitch'], defense: ['block', 'blockOpenStrike', 'disarmDefense', 'overrun', 'parry', 'rota', 'fullEvasion', 'partialEvasion', 'duckWeave'] },
  poleAxe: { offense: ['beat', 'cut', 'hook', 'thrust', 'twitch'], defense: ['counter', 'grappleDefense', 'overrun', 'parry', 'rota', 'fullEvasion', 'partialEvasion', 'duckWeave'] },
  polearm: { offense: ['bash', 'beat', 'cut', 'disarm', 'feintCut', 'feintThrust', 'hook', 'stopShort', 'thrust'], defense: ['counter', 'disarmDefense', 'parry', 'fullEvasion', 'partialEvasion', 'duckWeave'] },
  lance: { offense: ['simultaneousBlockStrike', 'thrust'], defense: ['block', 'fullEvasion', 'partialEvasion', 'duckWeave'] },
}

// Stores the weapon profile keys values used by the rest of this file.
const WEAPON_PROFILE_KEYS = {
  unarmed: 'unarmed', poniard: 'dagger', rondel: 'dagger', stiletto: 'dagger',
  bastardSword: 'greatsword', doppelhander: 'greatsword', estoc: 'greatsword', greatSword: 'greatsword', longsword: 'greatsword',
  armingSword: 'cutThrust', cutThrustSword: 'cutThrust', falchion: 'cutThrust', saber: 'cutThrust', scimitar: 'cutThrust', shortSword: 'cutThrust', rapier: 'rapier',
  club: 'mass', flail: 'mass', handAxe: 'mass', knuckleDuster: 'mass', mace: 'mass', maul: 'mass', morningStar: 'mass', footmansPick: 'mass', warflail: 'mass', warhammer: 'mass',
  poleAxe: 'poleAxe', bill: 'polearm', halberd: 'polearm', pike: 'polearm', spear: 'polearm', longSpear: 'polearm', shortSpear: 'polearm', quarterstaff: 'polearm', shortStaff: 'polearm',
  heavyLance: 'lance', lightLance: 'lance',
}

Object.entries(MELEE_WEAPONS).forEach(([weaponId, weapon]) => {
  const profileId = weapon.profile || WEAPON_PROFILE_KEYS[weaponId]
  // Copies the correct maneuver list onto each weapon when that weapon has a recognized combat profile.
  if (profileId && MANEUVER_PROFILES[profileId]) Object.assign(weapon, MANEUVER_PROFILES[profileId])
})

// Stores the melee stances values used by the rest of this file.
const MELEE_STANCES = {
  noStance: { name: 'Neutral' },
  highForward: { name: 'High Forward Guard', requiresThrust: true },
  middleForward: { name: 'Middle Forward Guard' },
  lowForward: { name: 'Low Forward Guard' },
  highBack: { name: 'High Back Guard', requiresSwing: true },
  lowBack: { name: 'Low Back / Tail Guard', requiresSwing: true },
  charging: { name: 'Charging' },
}

// Stores the melee attitudes values used by the rest of this file.
const MELEE_ATTITUDES = {
  offensive: { name: 'Offensive', attackDice: 1, defenseDice: -1 },
  neutral: { name: 'Neutral', attackDice: 0, defenseDice: 0 },
  defensive: { name: 'Defensive', attackDice: -2, defenseDice: 2 },
}

// Stores the offensive maneuvers values used by the rest of this file.
const OFFENSIVE_MANEUVERS = {
  cut: {
    name: 'Cut',
    activationCost: 0,
    targetModifier: 0,
    diceBonus: 0,
    damageBonus: 0,
    requires: 'canCut',
  },
  thrust: {
    name: 'Thrust',
    activationCost: 0,
    targetModifier: 0,
    diceBonus: 0,
    damageBonus: 0,
    thrust: true,
    requires: 'canThrust',
  },
  feintCut: {
    name: 'Feint and Cut',
    activationCost: 2,
    targetModifier: 0,
    diceBonus: 2,
    damageBonus: 0,
    feint: true,
  },
  feintThrust: { name: 'Feint and Thrust', activationCost: 1, targetModifier: 0, diceBonus: 1, damageBonus: 0, feint: true, thrust: true },
  bindStrike: { name: 'Bind and Strike', activationCost: 1, targetModifier: 0, diceBonus: 0, damageBonus: 0, positional: true, bind: true },
  doubleStrike: { name: 'Double Strike', activationCost: 1, targetModifier: 0, diceBonus: -1, damageBonus: 0, doubleStrike: true },
  evasiveAttack: { name: 'Evasive Attack', activationCost: 1, targetModifier: 1, diceBonus: 0, damageBonus: 0, evasiveAttack: true },
  grapple: { name: 'Grapple', activationCost: 2, targetModifier: 0, diceBonus: 0, damageBonus: 0, positional: true, grapple: true },
  halfSword: { name: 'Half-sword', activationCost: 1, targetModifier: -1, diceBonus: 0, damageBonus: 2, thrust: true, halfSword: true },
  simultaneousBlockStrike: { name: 'Simultaneous Block / Strike', activationCost: 1, targetModifier: 0, diceBonus: -2, damageBonus: 0, simultaneous: true, requiresShield: true },
  stopShort: { name: 'Stop Short', activationCost: 0, targetModifier: 0, diceBonus: 0, damageBonus: 0, positional: true, stopShort: true },
  toss: { name: 'Toss', activationCost: 1, targetModifier: 0, diceBonus: 0, damageBonus: 0, positional: true, toss: true },
  punch: { name: 'Punch', activationCost: 0, targetModifier: 0, diceBonus: 0, damageBonus: -1, bash: true },
  kick: { name: 'Kick', activationCost: 1, targetModifier: 1, diceBonus: 0, damageBonus: 0, bash: true },
  disarm: { name: 'Disarm', activationCost: 1, targetModifier: 0, diceBonus: 0, damageBonus: 0, positional: true, disarm: true, minimumProficiency: 4 },
  drawCut: { name: 'Draw Cut', activationCost: 0, targetModifier: 0, diceBonus: 0, damageBonus: 0, drawCut: true, minimumProficiency: 2, requires: 'canCut' },
  quickDraw: { name: 'Quick-draw Attack', activationCost: 2, targetModifier: 0, diceBonus: 0, damageBonus: 0, quickDraw: true, minimumProficiency: 6 },
  masterStrike: { name: 'Master-Strike', activationCost: 5, targetModifier: 0, diceBonus: -2, damageBonus: 0, masterStrike: true, minimumProficiency: 15 },
  murderStroke: { name: 'Murder Stroke', activationCost: 1, targetModifier: 0, diceBonus: 0, damageBonus: 0, bash: true, murderStroke: true, minimumProficiency: 5 },
  twitch: { name: 'Twitching', activationCost: 2, targetModifier: 0, diceBonus: -1, damageBonus: 0, twitch: true, minimumProficiency: 8 },
  windingBinding: { name: 'Winding and Binding', activationCost: 2, targetModifier: 0, diceBonus: 0, damageBonus: 0, positional: true, windingBinding: true, minimumProficiency: 7 },
  netThrow: { name: 'Net Throw', activationCost: 1, targetModifier: 0, diceBonus: 0, damageBonus: 0, positional: true, netThrow: true },
  beat: {
    name: 'Beat',
    activationCost: 1,
    targetModifier: 0,
    diceBonus: 1,
    damageBonus: 0,
    positional: true,
    beat: true,
  },
  hook: {
    name: 'Hook',
    activationCost: 1,
    targetModifier: 0,
    diceBonus: 0,
    damageBonus: 0,
    positional: true,
    hook: true,
    requires: 'canHook',
  },
  bash: {
    name: 'Bash',
    activationCost: 0,
    targetModifier: 0,
    diceBonus: 0,
    damageBonus: 0,
    bash: true,
    requires: 'canBash',
  },
}

// Stores the defensive maneuvers values used by the rest of this file.
const DEFENSIVE_MANEUVERS = {
  parry: {
    name: 'Parry',
    activationCost: 0,
    targetModifier: 0,
    diceBonus: 0,
    usesWeaponTarget: true,
  },
  fullEvasion: {
    name: 'Full Evasion',
    activationCost: 0,
    targetModifier: 0,
    diceBonus: 0,
    fixedTarget: 4,
    fullEvasion: true,
  },
  partialEvasion: {
    name: 'Partial Evasion',
    activationCost: 0,
    targetModifier: 0,
    diceBonus: 0,
    fixedTarget: 7,
    positional: true,
  },
  duckWeave: {
    name: 'Duck and Weave',
    activationCost: 0,
    targetModifier: 0,
    diceBonus: 0,
    fixedTarget: 9,
    positional: true,
    duckWeave: true,
  },
  counter: {
    name: 'Counter',
    activationCost: 2,
    targetModifier: 1,
    diceBonus: 0,
    usesWeaponTarget: true,
    counter: true,
  },
  block: { name: 'Block', activationCost: 0, targetModifier: 0, diceBonus: 0, fixedTarget: 6, block: true, requiresShield: true },
  blockOpenStrike: { name: 'Block Open and Strike', activationCost: 2, targetModifier: 0, diceBonus: 0, fixedTarget: 6, blockOpenStrike: true, requiresShield: true },
  expulsion: { name: 'Expulsion', activationCost: 2, targetModifier: 0, diceBonus: 0, usesWeaponTarget: true, expulsion: true },
  grappleDefense: { name: 'Grapple', activationCost: 2, targetModifier: 0, diceBonus: 0, fixedTarget: 6, positional: true, grapple: true },
  halfSwordDefense: { name: 'Half-sword', activationCost: 1, targetModifier: -1, diceBonus: 0, usesWeaponTarget: true, halfSword: true },
  disarmDefense: { name: 'Disarm', activationCost: 3, targetModifier: 0, diceBonus: 0, usesWeaponTarget: true, disarm: true, minimumProficiency: 4 },
  quickDrawDefense: { name: 'Quick-draw Parry', activationCost: 2, targetModifier: 0, diceBonus: 0, usesWeaponTarget: true, quickDraw: true, minimumProficiency: 6 },
  masterStrikeDefense: { name: 'Master-Strike', activationCost: 5, targetModifier: 0, diceBonus: -2, usesWeaponTarget: true, masterStrike: true, minimumProficiency: 15 },
  overrun: { name: 'Overrun', activationCost: 3, targetModifier: 0, diceBonus: 0, fixedTarget: 7, positional: true, overrun: true, minimumProficiency: 12 },
  rota: { name: 'Rota', activationCost: 2, targetModifier: 0, diceBonus: 0, usesWeaponTarget: true, counter: true, rota: true, minimumProficiency: 3 },
  windingBindingDefense: { name: 'Winding and Binding', activationCost: 2, targetModifier: 0, diceBonus: 0, usesWeaponTarget: true, windingBinding: true, minimumProficiency: 7 },
  shieldWall: { name: 'Shield Wall', activationCost: 1, targetModifier: 0, diceBonus: 0, fixedTarget: 5, shieldWall: true, requiresShield: true, requiresAllies: true },
}

Object.entries(OFFENSIVE_MANEUVERS).forEach(([key, maneuver]) => { maneuver.key = key })
Object.entries(DEFENSIVE_MANEUVERS).forEach(([key, maneuver]) => { maneuver.key = key })

// Stores the flower maneuver costs values used by the rest of this file.
const FLOWER_MANEUVER_COSTS = {
  greatsword: { disarm: 1, disarmDefense: 3, drawCut: 0, masterStrike: 5, masterStrikeDefense: 5, murderStroke: 1, overrun: 3, rota: 2, twitch: 2, windingBinding: 2, windingBindingDefense: 2 },
  cutThrust: { disarm: 1, disarmDefense: 3, drawCut: 0, quickDraw: 2, quickDrawDefense: 2, masterStrike: 6, masterStrikeDefense: 6, overrun: 3, rota: 2, twitch: 2, windingBinding: 2, windingBindingDefense: 2 },
  dagger: { disarm: 2, disarmDefense: 4, drawCut: 0, quickDraw: 1, quickDrawDefense: 1, overrun: 3 },
  rapier: { disarm: 1, disarmDefense: 3, masterStrike: 6, masterStrikeDefense: 6, overrun: 3 },
  mass: { disarm: 1, disarmDefense: 3, overrun: 4, rota: 2, twitch: 2 },
  polearm: { disarm: 2, disarmDefense: 5 },
  poleAxe: { overrun: 3, rota: 2, twitch: 2 },
  unarmed: { disarm: 2, disarmDefense: 4 },
}

// Stores the orientation names values used by the rest of this file.
const ORIENTATION_NAMES = {
  '-2': 'Enemy at Rear',
  '-1': 'Enemy at Flank',
  0: 'Front',
  1: 'Flank Advantage',
  2: 'Rear Advantage',
}
// Stores the orientation attack dice values used by the rest of this file.
const ORIENTATION_ATTACK_DICE = [0, 2, 4]

// Lists all fourteen declared attack zones from the rulebook and the exact d6 locations each zone can strike.
// Zones I-VII are swinging paths, while Zones VIII-XIV are thrusting paths.
const TARGET_ZONES = {
  zoneI: {
    name: 'I - Lower legs (swing)',
    attackType: 'swing',
    guardZone: 'legs',
    locations: [
      { location: 'Foot', bodyZone: 'legs', armorPart: 'feet', sided: true },
      { location: 'Shin and lower leg', bodyZone: 'legs', armorPart: 'shins', sided: true },
      { location: 'Shin and lower leg', bodyZone: 'legs', armorPart: 'shins', sided: true },
      { location: 'Shin and lower leg', bodyZone: 'legs', armorPart: 'shins', sided: true },
      { location: 'Knee', bodyZone: 'legs', armorPart: 'knees', sided: true },
      { location: 'Knee', bodyZone: 'legs', armorPart: 'knees', sided: true },
    ],
  },
  zoneII: {
    name: 'II - Upper legs (swing)',
    attackType: 'swing',
    guardZone: 'legs',
    locations: [
      { location: 'Knee', bodyZone: 'legs', armorPart: 'knees', sided: true },
      { location: 'Knee', bodyZone: 'legs', armorPart: 'knees', sided: true },
      { location: 'Thigh', bodyZone: 'legs', armorPart: 'thighs', sided: true },
      { location: 'Thigh', bodyZone: 'legs', armorPart: 'thighs', sided: true },
      { location: 'Thigh', bodyZone: 'legs', armorPart: 'thighs', sided: true },
      { location: 'Hip', bodyZone: 'legs', armorPart: 'hips', sided: true },
    ],
  },
  zoneIII: {
    name: 'III - Horizontal swing',
    attackType: 'swing',
    guardZone: 'torso',
    locations: [
      { location: 'Hip', bodyZone: 'legs', armorPart: 'hips', sided: true },
      { location: 'Upper abdomen', bodyZone: 'torso', armorPart: 'abdomen' },
      { location: 'Lower abdomen', bodyZone: 'torso', armorPart: 'abdomen' },
      { location: 'Ribcage', bodyZone: 'torso', armorPart: 'chest', sided: true },
      { location: 'Ribcage', bodyZone: 'torso', armorPart: 'chest', sided: true },
      { redirect: 'zoneVII' },
    ],
  },
  zoneIV: {
    name: 'IV - Overhand swing',
    attackType: 'swing',
    guardZone: 'head',
    locations: [
      { location: 'Upper arm and shoulder', bodyZone: 'arms', armorPart: 'upperArms', sided: true },
      { location: 'Upper arm and shoulder', bodyZone: 'arms', armorPart: 'upperArms', sided: true },
      { location: 'Chest', bodyZone: 'torso', armorPart: 'chest' },
      { location: 'Neck', bodyZone: 'head', armorPart: 'neck' },
      { location: 'Lower head and face', bodyZone: 'head', armorPart: 'face' },
      { location: 'Upper head', bodyZone: 'head', armorPart: 'head' },
    ],
  },
  zoneV: {
    name: 'V - Vertical swing',
    attackType: 'swing',
    guardZone: 'head',
    locations: [
      { location: 'Upper head', bodyZone: 'head', armorPart: 'head' },
      { location: 'Upper head', bodyZone: 'head', armorPart: 'head' },
      { location: 'Upper head', bodyZone: 'head', armorPart: 'head' },
      { location: 'Lower head and face', bodyZone: 'head', armorPart: 'face' },
      { location: 'Shoulder', bodyZone: 'arms', armorPart: 'shoulders', sided: true },
      { location: 'Shoulder', bodyZone: 'arms', armorPart: 'shoulders', sided: true },
    ],
  },
  zoneVI: {
    name: 'VI - Upward swing',
    attackType: 'swing',
    guardZone: 'torso',
    locations: [
      { location: 'Inner thigh', bodyZone: 'legs', armorPart: 'thighs', sided: true },
      { location: 'Inner thigh', bodyZone: 'legs', armorPart: 'thighs', sided: true },
      { location: 'Inner thigh', bodyZone: 'legs', armorPart: 'thighs', sided: true },
      { location: 'Groin', bodyZone: 'torso', armorPart: 'abdomen' },
      { location: 'Abdomen', bodyZone: 'torso', armorPart: 'abdomen' },
      { location: 'Chest', bodyZone: 'torso', armorPart: 'chest' },
    ],
  },
  zoneVII: {
    name: 'VII - Arms (swing)',
    attackType: 'swing',
    guardZone: 'arms',
    locations: [
      { location: 'Hand', bodyZone: 'arms', armorPart: 'hands', sided: true },
      { location: 'Forearm', bodyZone: 'arms', armorPart: 'forearms', sided: true },
      { location: 'Forearm', bodyZone: 'arms', armorPart: 'forearms', sided: true },
      { location: 'Elbow', bodyZone: 'arms', armorPart: 'forearms', sided: true },
      { location: 'Upper arm and shoulder', bodyZone: 'arms', armorPart: 'upperArms', sided: true },
      { location: 'Upper arm and shoulder', bodyZone: 'arms', armorPart: 'upperArms', sided: true },
    ],
  },
  zoneVIII: {
    name: 'VIII - Lower legs (thrust)',
    attackType: 'thrust',
    guardZone: 'legs',
    locations: [
      { location: 'Foot', bodyZone: 'legs', armorPart: 'feet', sided: true },
      { location: 'Shin and lower leg', bodyZone: 'legs', armorPart: 'shins', sided: true },
      { location: 'Shin and lower leg', bodyZone: 'legs', armorPart: 'shins', sided: true },
      { location: 'Shin and lower leg', bodyZone: 'legs', armorPart: 'shins', sided: true },
      { location: 'Knee', bodyZone: 'legs', armorPart: 'knees', sided: true },
      { location: 'Passed between the legs', bodyZone: 'legs', armorPart: 'none', miss: true },
    ],
  },
  zoneIX: {
    name: 'IX - Upper legs (thrust)',
    attackType: 'thrust',
    guardZone: 'legs',
    locations: [
      { location: 'Knee', bodyZone: 'legs', armorPart: 'knees', sided: true },
      { location: 'Thigh', bodyZone: 'legs', armorPart: 'thighs', sided: true },
      { location: 'Thigh', bodyZone: 'legs', armorPart: 'thighs', sided: true },
      { location: 'Thigh', bodyZone: 'legs', armorPart: 'thighs', sided: true },
      { location: 'Thigh', bodyZone: 'legs', armorPart: 'thighs', sided: true },
      { location: 'Hip', bodyZone: 'legs', armorPart: 'hips', sided: true },
    ],
  },
  zoneX: {
    name: 'X - Pelvic region (thrust)',
    attackType: 'thrust',
    guardZone: 'torso',
    locations: [
      { location: 'Hip', bodyZone: 'legs', armorPart: 'hips', sided: true },
      { location: 'Hip', bodyZone: 'legs', armorPart: 'hips', sided: true },
      { location: 'Groin', bodyZone: 'torso', armorPart: 'abdomen' },
      { location: 'Groin', bodyZone: 'torso', armorPart: 'abdomen' },
      { location: 'Lower abdomen', bodyZone: 'torso', armorPart: 'abdomen' },
      { location: 'Lower abdomen', bodyZone: 'torso', armorPart: 'abdomen' },
    ],
  },
  zoneXI: {
    name: 'XI - Belly (thrust)',
    attackType: 'thrust',
    guardZone: 'torso',
    locations: [
      { location: 'Lower abdomen', bodyZone: 'torso', armorPart: 'abdomen' },
      { location: 'Lower abdomen', bodyZone: 'torso', armorPart: 'abdomen' },
      { location: 'Lower abdomen', bodyZone: 'torso', armorPart: 'abdomen' },
      { location: 'Lower abdomen', bodyZone: 'torso', armorPart: 'abdomen' },
      { location: 'Lower abdomen', bodyZone: 'torso', armorPart: 'abdomen' },
      { location: 'Flesh to the side', bodyZone: 'torso', armorPart: 'abdomen', sided: true },
    ],
  },
  zoneXII: {
    name: 'XII - Chest (thrust)',
    attackType: 'thrust',
    guardZone: 'torso',
    locations: [
      { location: 'Under the ribs', bodyZone: 'torso', armorPart: 'abdomen' },
      { location: 'Under the ribs', bodyZone: 'torso', armorPart: 'abdomen' },
      { location: 'Chest', bodyZone: 'torso', armorPart: 'chest' },
      { location: 'Chest', bodyZone: 'torso', armorPart: 'chest' },
      { location: 'Chest', bodyZone: 'torso', armorPart: 'chest' },
      { location: 'Chest', bodyZone: 'torso', armorPart: 'chest' },
    ],
  },
  zoneXIII: {
    name: 'XIII - Head (thrust)',
    attackType: 'thrust',
    guardZone: 'head',
    locations: [
      { location: 'Collar and throat', bodyZone: 'head', armorPart: 'neck' },
      { location: 'Collar and throat', bodyZone: 'head', armorPart: 'neck' },
      { location: 'Face', bodyZone: 'head', armorPart: 'face' },
      { location: 'Face', bodyZone: 'head', armorPart: 'face' },
      { location: 'Head', bodyZone: 'head', armorPart: 'head' },
      { location: 'Head', bodyZone: 'head', armorPart: 'head' },
    ],
  },
  zoneXIV: {
    name: 'XIV - Arms (thrust)',
    attackType: 'thrust',
    guardZone: 'arms',
    locations: [
      { location: 'Hand', bodyZone: 'arms', armorPart: 'hands', sided: true },
      { location: 'Forearm', bodyZone: 'arms', armorPart: 'forearms', sided: true },
      { location: 'Forearm', bodyZone: 'arms', armorPart: 'forearms', sided: true },
      { location: 'Elbow', bodyZone: 'arms', armorPart: 'forearms', sided: true },
      { location: 'Upper arm', bodyZone: 'arms', armorPart: 'upperArms', sided: true },
      { location: 'Upper arm', bodyZone: 'arms', armorPart: 'upperArms', sided: true },
    ],
  },
}

// Returns the current strength toughness damage modifier.
const getStrengthToughnessDamageModifier = (strength, toughness) => {
  // Equal Strength and Toughness cancel each other, so the attack receives no damage adjustment.
  if (strength === toughness) return 0
  // Strength at least twice Toughness grants the maximum +2 damage bonus.
  if (strength >= toughness * 2) return 2
  // Toughness at least twice Strength imposes the maximum -2 damage penalty.
  if (toughness >= strength * 2) return -2
  return strength > toughness ? 1 : -1
}

// Manages random encounters, simultaneous combat decisions, wounds, conditions, fleeing, inventory use, and battle rewards.
class BattleSystem {
  // Initializes the instance state and connects the dependencies used by later methods.
  constructor({
    getCharacter = () => null,
    onStart = () => {},
    onEnd = () => {},
    onDefeatResolution = () => {},
  } = {}) {
    this.getCharacter = getCharacter
    this.onStart = onStart
    this.onEnd = onEnd
    this.onDefeatResolution = onDefeatResolution
    this.isActive = false
    this.isResolving = false
    this.distanceTravelled = 0
    this.nextEncounterDistance = this.rollEncounterDistance()
    this.lootItems = new Map()
    this.lootCopper = 0
    this.defeatedEnemyCount = 0
    this.lootApplied = false
    this.orientation = 0
    this.round = 1
    this.exchange = 1
    this.initiative = null
    this.battleEnded = false
    this.pendingOutcome = null
    this.character = null
    this.reachAdvantage = null
    this.defeatResolution = null
    this.canReequip = false

    this.enemyTemplates = CHARACTER_SPRITES.map((sprite) => ({
      name: sprite.name,
      weapon: MELEE_WEAPONS[sprite.weapon] ? sprite.weapon : 'armingSword',
      spriteId: sprite.id,
      portrait: sprite.portrait,
    }))

    this.cacheElements()
    this.populateSelects()
    this.bindEvents()
  }

  // Finds the page elements this system updates and keeps references to them for fast reuse.
  cacheElements() {
    this.screen = document.querySelector('#battle-screen')
    this.banner = document.querySelector('#battle-banner')
    this.playerActor = document.querySelector('#battle-player-sprite')
    this.enemyPartyElement = document.querySelector('#battle-enemy-party')
    this.playerName = document.querySelector('#battle-player-name')
    this.playerPool = document.querySelector('#battle-player-pool')
    this.enemyCount = document.querySelector('#battle-enemy-count')
    this.enemyList = document.querySelector('#battle-enemy-list')
    this.playerStance = document.querySelector('#battle-player-stance')
    this.orientationText = document.querySelector('#battle-orientation')
    this.playerWounds = document.querySelector('#battle-player-wounds')
    this.weaponSelect = document.querySelector('#battle-weapon')
    this.stanceSelect = document.querySelector('#battle-stance')
    this.intentSelect = document.querySelector('#battle-intent')
    this.opponentSelect = document.querySelector('#battle-opponent')
    this.offenseSelect = document.querySelector('#battle-offense')
    this.defenseSelect = document.querySelector('#battle-defense')
    this.targetSelect = document.querySelector('#battle-target')
    this.buyInitiativeInput = document.querySelector('#battle-buy-initiative')
    this.attackDiceInput = document.querySelector('#battle-attack-dice')
    this.defenseDiceInput = document.querySelector('#battle-defense-dice')
    this.attackDiceLabel = document.querySelector('label[for="battle-attack-dice"]')
    this.defenseDiceLabel = document.querySelector('label[for="battle-defense-dice"]')
    this.attackDiceValue = document.querySelector('#battle-attack-dice-value')
    this.defenseDiceValue = document.querySelector(
      '#battle-defense-dice-value'
    )
    this.actionButton = document.querySelector('#battle-resolve')
    this.inventoryOpenButton = document.querySelector('#battle-inventory-open')
    this.fleeButton = document.querySelector('#battle-flee')
    this.escapeButton = document.querySelector('#battle-escape')
    this.rulesNote = document.querySelector('#battle-rules-note')
    this.logElement = document.querySelector('#battle-log')
    this.inventoryPopup = document.querySelector('#battle-inventory-popup')
    this.inventoryList = document.querySelector('#battle-inventory-list')
    this.inventoryWealth = document.querySelector('#battle-inventory-wealth')
    this.inventoryNotice = document.querySelector('#battle-inventory-notice')
    this.inventoryCloseButton = document.querySelector('#battle-inventory-close')
    this.lootPopup = document.querySelector('#battle-loot-popup')
    this.lootList = document.querySelector('#battle-loot-list')
    this.lootCollectButton = document.querySelector('#battle-loot-collect')
    this.defeatPopup = document.querySelector('#battle-defeat-popup')
    this.defeatTitle = document.querySelector('#battle-defeat-title')
    this.defeatMessage = document.querySelector('#battle-defeat-message')
    this.defeatContinueButton = document.querySelector('#battle-defeat-continue')
  }

  // Fills selects with the choices available to the player.
  populateSelects() {
    this.fillSelect(this.weaponSelect, MELEE_WEAPONS)
    this.fillSelect(this.stanceSelect, MELEE_STANCES)
    this.fillSelect(this.offenseSelect, OFFENSIVE_MANEUVERS)
    this.fillSelect(this.defenseSelect, DEFENSIVE_MANEUVERS)
    this.fillSelect(this.targetSelect, TARGET_ZONES)
    this.weaponSelect.value = 'longsword'
    this.stanceSelect.value = 'noStance'
    this.offenseSelect.value = 'cut'
    this.defenseSelect.value = 'parry'
    this.targetSelect.value = 'zoneIII'
  }

  // Fills select with the supplied choices.
  fillSelect(select, values) {
    Object.entries(values).forEach(([value, data]) => {
      const option = document.createElement('option')
      option.value = value
      option.textContent = data.name
      select.appendChild(option)
    })
  }

  // Connects buttons, selectors, keyboard input, and inventory actions to their matching game behavior.
  bindEvents() {
    this.actionButton.addEventListener('click', () => {
      if (this.battleEnded) {
        this.closeBattle()
        return
      }
      this.resolveExchange()
    })

    this.fleeButton.addEventListener('click', () => this.attemptFlee())
    this.escapeButton.addEventListener('click', () => this.attemptEscape())
    this.inventoryOpenButton.addEventListener('click', () => this.openBattleInventory())
    this.inventoryCloseButton.addEventListener('click', () => this.closeBattleInventory())
    this.lootCollectButton.addEventListener('click', () => { this.lootPopup.hidden = true })
    this.defeatContinueButton.addEventListener('click', () => {
      const resolution = this.defeatResolution
      this.defeatPopup.hidden = true
      this.closeBattle()
      this.onDefeatResolution(resolution)
    })

    ;[
      this.weaponSelect,
      this.stanceSelect,
      this.intentSelect,
      this.opponentSelect,
      this.offenseSelect,
      this.defenseSelect,
      this.targetSelect,
      this.buyInitiativeInput,
      this.attackDiceInput,
      this.defenseDiceInput,
    ].forEach((element) => {
      element.addEventListener('input', () => this.updateInterface())
      element.addEventListener('change', () => this.updateInterface())
    })
    this.opponentSelect.addEventListener('change', () => {
      const selected = this.getSelectedEnemy()
      if (selected) this.activateEnemy(selected)
      this.updateInterface()
    })
  }

  // Randomly determines encounter distance for this encounter.
  rollEncounterDistance() {
    return 700 + Math.random() * 700
  }

  // Randomly determines enemy combat pool for this encounter.
  rollEnemyCombatPool() {
    return 4 + Math.floor(Math.random() * 9)
  }

  // Randomly determines enemy traits for this encounter.
  rollEnemyTraits() {
    const gifts = [
      { name: 'Strong', strength: 1 },
      { name: 'Tough as Nails', toughness: 1 },
      { name: 'Hardy', endurance: 1 },
      { name: 'Quick Witted', wit: 1 },
      { name: 'Alert', perception: 1 },
      { name: 'High Pain Threshold', painResistance: 1 },
      { name: 'High Pain Threshold (Major)', painResistance: 2 },
    ]
    const flaws = [
      { name: 'Weak', strength: -1 },
      { name: 'Frail', toughness: -1 },
      { name: 'Slow', reflex: -1 },
      { name: 'Poor Footwork', knockdown: -1 },
      { name: 'Low Pain Threshold', painResistance: -1 },
      { name: 'Bleeder', bleeder: true },
    ]
    const selected = []
    if (Math.random() < 0.35) selected.push(gifts[Math.floor(Math.random() * gifts.length)])
    if (Math.random() < 0.35) selected.push(flaws[Math.floor(Math.random() * flaws.length)])
    return selected.reduce(
      (result, trait) => {
        result.names.push(trait.name)
        ;['strength', 'toughness', 'endurance', 'reflex', 'wit', 'perception', 'knockdown', 'painResistance'].forEach((key) => {
          result[key] += trait[key] || 0
        })
        result.bleeder = result.bleeder || Boolean(trait.bleeder)
        return result
      },
      { names: [], strength: 0, toughness: 0, endurance: 0, reflex: 0, wit: 0, perception: 0, knockdown: 0, painResistance: 0, bleeder: false }
    )
  }

  // Builds practical piecemeal coverage for generated enemy body armor instead of treating one AV as full-body protection.
  createEnemyArmorCoverage(value, material) {
    const bodyParts = ['head', 'face', 'neck', 'shoulders', 'chest', 'abdomen', 'back', 'upperArms', 'forearms', 'hands', 'hips', 'thighs', 'knees', 'shins', 'feet']
    const coveredParts = material === 'mail'
      ? new Set(['shoulders', 'chest', 'abdomen', 'back', 'upperArms', 'forearms', 'hips'])
      : material === 'leather'
        ? new Set(['shoulders', 'chest', 'abdomen', 'back', 'upperArms', 'forearms'])
        : new Set()
    return Object.fromEntries(bodyParts.map((part) => [part, {
      value: coveredParts.has(part) ? value : 0,
      material: coveredParts.has(part) ? material : 'none',
      items: coveredParts.has(part) ? [`Generated ${material} armor`] : [],
    }]))
  }

  // Randomly determines enemy count for this encounter.
  rollEnemyCount() {
    const roll = Math.random()
    if (roll < 0.20) return 1
    if (roll < 0.32) return 2
    if (roll < 0.38) return 3
    if (roll < 0.41) return 4
    if (roll < 0.42) return 5
    return 0
  }

  // Records travel and triggers any result that becomes due.
  recordTravel(distance) {
    if (this.isActive || distance <= 0) return

    this.distanceTravelled += distance
    if (this.distanceTravelled >= this.nextEncounterDistance) {
      const enemyTotal = this.rollEnemyCount()
      this.distanceTravelled = 0
      this.nextEncounterDistance = this.rollEncounterDistance()
      if (enemyTotal > 0) this.startBattle(enemyTotal)
    }
  }

  // Creates a new combatant with the supplied values.
  createCombatant({
    id,
    name,
    pool,
    weapon,
    armor = 2,
    armorMaterial = 'leather',
    armorCoverage = null,
    armorDetailedCoverage = null,
    strength = 5,
    toughness = 5,
    endurance = 5,
    health = 5,
    reflex = 5,
    willpower = 5,
    wit = 5,
    perception = 5,
    proficiency = 0,
    knockdown = 5,
    knockout = 7,
    encumbrancePenalty = 0,
    bleeder = false,
    painResistance = 0,
    shield = null,
    damageRules = 'core',
    wounds = [],
    conditions = null,
  }) {
    const conditionState = {
      currentHealth: health,
      maxHealth: health,
      pain: 0,
      shock: 0,
      pendingShock: 0,
      bleeding: 0,
      fatigue: 0,
      knockedDown: false,
      unconsciousRounds: 0,
      coma: false,
      dead: false,
      other: [],
      ...(conditions || {}),
    }
    const combatant = {
      id,
      name,
      baseMaxPool: pool,
      maxPool: pool,
      pool,
      weapon,
      armor,
      armorMaterial,
      // Stores location-specific protection so a head strike does not incorrectly use torso armor and vice versa.
      armorCoverage,
      armorDetailedCoverage,
      strength,
      toughness,
      endurance,
      health,
      reflex,
      willpower,
      wit,
      perception,
      proficiency,
      knockdown,
      knockout,
      encumbrancePenalty,
      bleeder,
      painResistance,
      shield,
      damageRules,
      stance: 'middleForward',
      attitude: 'neutral',
      wounds: wounds.map((wound) => {
        if (Number.isFinite(wound.shock) && Number.isFinite(wound.pain) && Number.isFinite(wound.bloodLoss)) return { ...wound }
        const zone = wound.zone || 'zoneIII'
        const bodyZone = wound.bodyZone || (['head', 'torso', 'arms', 'legs'].includes(zone) ? zone : TARGET_ZONES[zone]?.guardZone || 'torso')
        return { ...wound, zone, bodyZone, ...this.getWoundEffects({ willpower }, wound.severity, wound.damageType || 'cutting', bodyZone) }
      }),
      conditions: conditionState,
      roundsActive: 0,
      defeated: false,
      counterBonus: 0,
      nextDefenseBonus: 0,
      guardBeaten: false,
      lastAction: null,
    }
    this.recalculateConditionTotals(combatant)
    return combatant
  }

  // Starts battle and prepares its initial state.
  startBattle(enemyTotal) {
    if (this.isActive) return

    this.character = this.getCharacter() || {
      name: 'Wayfarer',
      primaryWeapon: 'longsword',
      proficiencies: { longsword: 7 },
      combatPool: 12,
      reflex: 5,
      attributes: { strength: 4, toughness: 4, endurance: 5, health: 5, willpower: 5, wit: 5, perception: 5 },
      armor: { value: 2, poolPenalty: 0 },
      damageRules: 'core',
      wounds: [],
    }
    this.configurePlayerWeapons(this.character)
    const playerSprite = getCharacterSprite(this.character.spriteId)
    this.playerActor.style.backgroundImage = `url('${playerSprite.portrait}')`
    this.playerActor.setAttribute('aria-label', `${playerSprite.name} battle sprite`)

    this.player = this.createCombatant({
      id: 'player',
      name: this.character.name,
      pool: this.character.combatPools?.[this.weaponSelect.value] || Math.max(1, this.character.reflex + (this.character.proficiencies[this.weaponSelect.value] || 0) - this.character.armor.poolPenalty),
      weapon: this.weaponSelect.value,
      armor: this.character.armor.value,
      armorMaterial: this.character.armor.material || 'leather',
      armorCoverage: this.character.armor.coverageValues || null,
      armorDetailedCoverage: this.character.armor.coverage || null,
      strength: this.character.attributes.strength,
      toughness: this.character.attributes.toughness,
      endurance: this.character.attributes.endurance,
      health: this.character.attributes.health,
      reflex: this.character.reflex,
      willpower: this.character.attributes.willpower,
      wit: this.character.attributes.wit,
      perception: this.character.attributes.perception,
      proficiency: this.character.proficiencies[this.weaponSelect.value] || 0,
      knockdown: this.character.knockdown,
      knockout: this.character.knockout,
      encumbrancePenalty: this.character.armor.poolPenalty || 0,
      bleeder: this.character.giftsFlaws?.some((gift) => gift.startsWith('Bleeder')) || false,
      painResistance: this.character.giftsFlaws?.some((gift) => gift.startsWith('High Pain Threshold') && gift.includes('Major')) ? 2 : this.character.giftsFlaws?.some((gift) => gift.startsWith('High Pain Threshold')) ? 1 : 0,
      shield: this.getEquippedShield(this.character),
      damageRules: this.character.damageRules,
      wounds: this.character.wounds,
      conditions: this.character.conditions,
    })
    const availableTemplates = this.enemyTemplates.filter((template) => template.spriteId !== this.character.spriteId)
    const shuffledTemplates = [...availableTemplates].sort(
      () => Math.random() - 0.5
    )
    this.enemies = shuffledTemplates.slice(0, enemyTotal).map((template, index) => {
      const pool = this.rollEnemyCombatPool()
      const armorRoll = Math.random()
      const traits = this.rollEnemyTraits()
      const baseReflex = Math.max(3, Math.min(7, pool - 4))
      const armorValue = armorRoll < 0.35 ? 4 : armorRoll < 0.7 ? 2 : 0
      const armorMaterial = armorRoll < 0.35 ? 'mail' : armorRoll < 0.7 ? 'leather' : 'none'
      const combatant = this.createCombatant({
        id: `enemy-${index}`,
        name: template.name,
        pool,
        weapon: template.weapon,
        armor: armorValue,
        armorMaterial,
        armorDetailedCoverage: this.createEnemyArmorCoverage(armorValue, armorMaterial),
        strength: Math.max(1, 3 + Math.floor(Math.random() * 4) + traits.strength),
        toughness: Math.max(1, 3 + Math.floor(Math.random() * 4) + traits.toughness),
        endurance: Math.max(1, 3 + Math.floor(Math.random() * 5) + traits.endurance),
        health: 3 + Math.floor(Math.random() * 5),
        reflex: Math.max(1, baseReflex + traits.reflex),
        willpower: 3 + Math.floor(Math.random() * 5),
        wit: Math.max(1, 3 + Math.floor(Math.random() * 5) + traits.wit),
        perception: Math.max(1, 3 + Math.floor(Math.random() * 5) + traits.perception),
        proficiency: Math.max(0, pool - baseReflex),
        knockdown: Math.max(1, Math.max(3, Math.min(8, pool - 3)) + traits.knockdown),
        knockout: 5 + Math.floor(Math.random() * 5),
        encumbrancePenalty: armorRoll < 0.35 ? 1 : 0,
        bleeder: traits.bleeder,
        painResistance: traits.painResistance,
        damageRules: this.character.damageRules,
      })
      combatant.template = template
      combatant.partyIndex = index
      combatant.traits = traits.names
      combatant.fled = false
      combatant.orientation = 0
      combatant.reachAdvantage = null
      combatant.pairInitiative = null
      return combatant
    })
    this.enemyIndex = 0
    this.enemy = this.enemies[0]
    this.refreshOpponentOptions()
    this.renderEnemyParty()
    this.isActive = true
    this.isResolving = false
    this.battleEnded = false
    this.pendingOutcome = null
    this.lootItems = new Map()
    this.lootCopper = 0
    this.defeatedEnemyCount = 0
    this.lootApplied = false
    this.lootPopup.hidden = true
    this.inventoryPopup.hidden = true
    this.inventoryNotice.textContent = ''
    this.defeatPopup.hidden = true
    this.defeatResolution = null
    this.canReequip = false
    this.round = 1
    this.exchange = 1
    this.initiative = null
    this.orientation = 0
    this.reachAdvantage = this.getInitialReachAdvantage()
    this.pauseAfterExchange = false
    this.distanceTravelled = 0
    this.nextEncounterDistance = this.rollEncounterDistance()
    this.logElement.replaceChildren()
    this.screen.hidden = false
    this.screen.setAttribute('aria-hidden', 'false')
    this.actionButton.disabled = false
    this.inventoryOpenButton.disabled = false
    this.fleeButton.disabled = false
    this.setControlsDisabled(false)
    this.onStart()

    this.beginRound()
    if (this.player.defeated) {
      this.endBattle('defeat')
      return
    }
    this.addLog(
      `${enemyTotal} ${enemyTotal === 1 ? 'opponent blocks' : 'opponents block'} the road.`,
      'important'
    )
    this.enemies.forEach((enemy) => {
      this.addLog(`${enemy.name} joins the melee with a Combat Pool of ${enemy.maxPool}.`)
      if (enemy.traits.length) this.addLog(`${enemy.name}'s traits: ${enemy.traits.join(', ')}.`)
    })
    this.addLog(
      'Declare Red to attack, White to act cautiously, or Blue to defend, then commit Combat Pool dice.'
    )
    this.animateBanner('Random encounter!')
    this.updateInterface()
  }

  // Updates the visible enemy party using the latest game state.
  renderEnemyParty() {
    this.enemyPartyElement.replaceChildren()
    const count = this.enemies.length
    const start = count === 1 ? 78 : 58
    const end = count === 1 ? 78 : 92
    const scale = count <= 2 ? 1.06 : count === 3 ? 0.96 : 0.84

    this.enemies.forEach((enemy, index) => {
      const actor = document.createElement('div')
      actor.className = `battle-actor enemy${
        enemy.template.flipX ? ' mirror' : ''
      }${index === 0 ? ' active' : ''}`
      actor.style.backgroundImage = `url('${enemy.template.portrait}')`
      actor.style.backgroundPosition = 'center'
      actor.setAttribute('aria-label', enemy.template.name)
      const position = count === 1 ? start : start + ((end - start) * index) / (count - 1)
      actor.style.setProperty('--enemy-x', `${position}%`)
      actor.style.setProperty('--enemy-scale', String(scale))
      actor.addEventListener('click', () => {
        if (enemy.defeated || enemy.fled || this.isResolving) return
        this.opponentSelect.value = enemy.id
        this.activateEnemy(enemy)
        this.updateInterface()
      })
      this.enemyPartyElement.appendChild(actor)
      enemy.actor = actor
    })
    this.enemyActor = this.enemy.actor
  }

  // Returns the current remaining enemy count.
  getRemainingEnemyCount() {
    return this.getActiveEnemies().length
  }

  // Returns the current active enemies.
  getActiveEnemies() {
    return this.enemies.filter((enemy) => !enemy.defeated && !enemy.fled)
  }

  // Returns the current selected enemy.
  getSelectedEnemy() {
    return this.getActiveEnemies().find((enemy) => enemy.id === this.opponentSelect.value) || this.getActiveEnemies()[0] || null
  }

  // Refreshes opponent options so it matches the latest selections.
  refreshOpponentOptions() {
    const previous = this.opponentSelect.value
    this.opponentSelect.replaceChildren()
    this.getActiveEnemies().forEach((enemy) => {
      const option = document.createElement('option')
      option.value = enemy.id
      option.textContent = enemy.name
      this.opponentSelect.appendChild(option)
    })
    this.opponentSelect.value = this.getActiveEnemies().some((enemy) => enemy.id === previous)
      ? previous
      : this.getActiveEnemies()[0]?.id || ''
  }

  // Makes enemy the opponent currently shown and resolved.
  activateEnemy(enemy) {
    if (!enemy) return
    if (this.enemy && this.enemy !== enemy) {
      this.enemy.orientation = this.orientation
      this.enemy.reachAdvantage = this.reachAdvantage
    }
    this.enemy = enemy
    this.enemyIndex = this.enemies.indexOf(enemy)
    this.enemyActor = enemy.actor
    this.orientation = enemy.orientation || 0
    this.reachAdvantage = enemy.reachAdvantage ?? this.getInitialReachAdvantage()
    this.enemies.forEach((candidate) => candidate.actor?.classList.toggle('active', candidate === enemy && !candidate.defeated && !candidate.fled))
  }

  // Stores active enemy state so it can be restored later.
  storeActiveEnemyState() {
    if (!this.enemy) return
    this.enemy.orientation = this.orientation
    this.enemy.reachAdvantage = this.reachAdvantage
  }

  // Returns the current equipped shield.
  getEquippedShield(character) {
    const ownedIds = character.equipmentIds || []
    for (const id of ownedIds) {
      const item = FLOWER_ARMOR_EQUIPMENT.find(([itemId]) => itemId === id)
      if (item?.[3]?.shield) return { name: item[1], ...item[3].shield }
    }
    return null
  }

  // Applies group pressure to the affected character or combatant.
  applyGroupPressure() {
    // Every combatant keeps an independent Combat Pool while sharing the same
    // exchange timeline.
    this.player.maxPool = this.player.baseMaxPool
    this.groupPressure = 0
  }

  // Configures player weapons from the current character data.
  configurePlayerWeapons(character) {
    this.weaponSelect.replaceChildren()
    Object.entries(character.proficiencies).forEach(([weaponId, value]) => {
      if (value <= 0 || !MELEE_WEAPONS[weaponId] || MELEE_WEAPONS[weaponId].kind !== 'melee') return
      const option = document.createElement('option')
      option.value = weaponId
      option.textContent = `${MELEE_WEAPONS[weaponId].name} (${value})`
      this.weaponSelect.appendChild(option)
    })
    if (MELEE_WEAPONS[character.primaryWeapon]?.kind === 'melee' && !Array.from(this.weaponSelect.options).some((option) => option.value === character.primaryWeapon)) {
      const option = document.createElement('option')
      option.value = character.primaryWeapon
      option.textContent = `${MELEE_WEAPONS[character.primaryWeapon].name} (${character.proficiencies[character.primaryWeapon] || 0})`
      this.weaponSelect.appendChild(option)
    }
    if (!this.weaponSelect.options.length) {
      const option = document.createElement('option')
      option.value = 'unarmed'
      option.textContent = 'Unarmed (0)'
      this.weaponSelect.appendChild(option)
    }
    this.weaponSelect.value = MELEE_WEAPONS[character.primaryWeapon]?.kind === 'melee' ? character.primaryWeapon : this.weaponSelect.options[0].value
    this.weaponSelect.disabled = true
    this.configureManeuverOptions()
  }

  // Returns the current player pool for weapon.
  getPlayerPoolForWeapon(weaponId) {
    return this.character.combatPools?.[weaponId] || Math.max(
      1,
      this.character.reflex +
        (this.character.proficiencies[weaponId] || 0) -
        this.character.armor.poolPenalty
    )
  }

  // Applies reequipped weapon to the affected character or combatant.
  applyReequippedWeapon() {
    const weaponId = this.weaponSelect.value
    const previousWeapon = this.player.weapon
    this.player.weapon = weaponId
    this.player.proficiency = this.character.proficiencies[weaponId] || 0
    this.player.baseMaxPool = this.getPlayerPoolForWeapon(weaponId)
    this.refreshConditionPools(this.player)
    this.reachAdvantage = this.getInitialReachAdvantage()
    this.canReequip = false
    if (previousWeapon !== weaponId) {
      this.addLog(
        `${this.player.name} readies ${MELEE_WEAPONS[weaponId].name} and now has a Combat Pool of ${this.player.maxPool}.`,
        'important'
      )
    }
  }

  // Configures maneuver options from the current character data.
  configureManeuverOptions() {
    const weapon = MELEE_WEAPONS[this.weaponSelect.value]
    const proficiency = this.character?.proficiencies?.[this.weaponSelect.value] || 0
    const shield = this.character ? this.getEquippedShield(this.character) : null
    Array.from(this.stanceSelect.options).forEach((option) => {
      const stance = MELEE_STANCES[option.value]
      option.disabled = Boolean((stance.requiresSwing && !weapon.canCut && !weapon.canBash) || (stance.requiresThrust && !weapon.canThrust))
    })
    if (this.stanceSelect.selectedOptions[0]?.disabled) this.stanceSelect.value = 'noStance'
    const configure = (select, permitted, definitions) => {
      Array.from(select.options).forEach((option) => {
        const maneuver = definitions[option.value]
        option.disabled = !permitted.includes(option.value) ||
          Boolean(maneuver.requires && !weapon[maneuver.requires]) ||
          Boolean(maneuver.requiresShield && !shield) ||
          Boolean(maneuver.requiresAllies) ||
          Boolean(maneuver.murderStroke && !weapon.heavyBlade) ||
          proficiency < (maneuver.minimumProficiency || 0) ||
          Boolean(this.player && !this.isManeuverAvailable(this.player, maneuver))
      })
      if (select.selectedOptions[0]?.disabled) {
        select.value = Array.from(select.options).find((option) => !option.disabled)?.value || ''
      }
    }
    configure(this.offenseSelect, weapon.offense || [], OFFENSIVE_MANEUVERS)
    configure(this.defenseSelect, weapon.defense || ['fullEvasion', 'partialEvasion', 'duckWeave'], DEFENSIVE_MANEUVERS)
    this.configureTargetOptions()
  }

  // Enables only the seven attack zones that match the selected swinging or thrusting maneuver.
  configureTargetOptions() {
    const maneuver = OFFENSIVE_MANEUVERS[this.offenseSelect.value] || OFFENSIVE_MANEUVERS.cut
    const attackType = maneuver.thrust ? 'thrust' : 'swing'
    Array.from(this.targetSelect.options).forEach((option) => {
      option.disabled = TARGET_ZONES[option.value].attackType !== attackType
    })
    // Moves an incompatible previous selection to the first legal zone when the player changes maneuvers.
    if (this.targetSelect.selectedOptions[0]?.disabled) {
      this.targetSelect.value = Array.from(this.targetSelect.options).find((option) => !option.disabled)?.value || ''
    }
  }

  // Returns the current initial reach advantage.
  getInitialReachAdvantage() {
    const playerReach = MELEE_WEAPONS[this.player.weapon].reach
    const enemyReach = MELEE_WEAPONS[this.enemy.weapon].reach
    if (playerReach === enemyReach) return null
    return playerReach > enemyReach ? 'player' : this.enemy.id
  }

  // Begins round and resets the values needed for it.
  beginRound() {
    this.applyGroupPressure()
    this.applyRoundConditions(this.player)
    this.refreshConditionPools(this.player)
    const activeEnemies = this.getActiveEnemies()
    activeEnemies.forEach((enemy) => {
      this.applyRoundConditions(enemy)
      this.refreshConditionPools(enemy)
    })
    if (this.player.defeated) {
      this.endBattle('defeat')
      return
    }
    if (!this.getActiveEnemies().length) {
      this.endBattle('victory')
      return
    }
    const canDeclareStance = this.round === 1 || this.pauseAfterExchange || !this.initiative
    this.player.stance = canDeclareStance ? this.stanceSelect.value : 'noStance'
    this.player.attitude = canDeclareStance
      ? this.getAttitudeForIntent(this.intentSelect.value)
      : 'neutral'
    activeEnemies.forEach((enemy) => {
      const reengages = !canDeclareStance && Math.random() < 0.2
      if (canDeclareStance || reengages) {
        enemy.stance = this.chooseEnemyStance(enemy)
        enemy.intent = this.chooseEnemyIntent(enemy)
        enemy.pairInitiative = null
        if (reengages) this.addLog(`${enemy.name} breaks distance, re-engages, and adopts ${MELEE_STANCES[enemy.stance].name}.`)
      } else {
        enemy.stance = 'noStance'
      }
      enemy.attitude = canDeclareStance || reengages
        ? this.getAttitudeForIntent(enemy.intent)
        : 'neutral'
    })
    this.needsInitiativeDeclaration = canDeclareStance
    this.boutOpeningExchange = canDeclareStance
    if (canDeclareStance) this.initiative = null
    this.pauseAfterExchange = false
    this.exchange = 1
    this.refreshOpponentOptions()
    this.activateEnemy(this.getSelectedEnemy())
    this.addLog(`Round ${this.round}: every active combatant refreshes their Combat Pool.`)
  }

  // Applies round conditions to the affected character or combatant.
  applyRoundConditions(combatant) {
    if (combatant.defeated) return
    const conditions = combatant.conditions
    combatant.roundsActive++
    this.recalculateConditionTotals(combatant)

    if (conditions.bleeding > 0) {
      const enduranceDice = this.getConditionTrait(combatant, 'endurance')
      const bloodRoll = this.rollPool(enduranceDice, conditions.bleeding)
      if (bloodRoll.successes === 0) {
        conditions.currentHealth = Math.max(0, conditions.currentHealth - 1)
        this.addLog(`${combatant.name} fails the Endurance test against Blood Loss ${conditions.bleeding} and loses 1 Health.`, 'wound')
      } else {
        this.addLog(`${combatant.name} resists Blood Loss ${conditions.bleeding} with ${bloodRoll.successes} Endurance success${bloodRoll.successes === 1 ? '' : 'es'}.`)
      }
    }

    const fatigueInterval = Math.max(1, this.getConditionTrait(combatant, 'endurance') * 2 - combatant.encumbrancePenalty)
    if (combatant.roundsActive > 0 && combatant.roundsActive % fatigueInterval === 0) {
      conditions.fatigue++
      this.addLog(`${combatant.name} gains 1 Fatigue after ${fatigueInterval} active round${fatigueInterval === 1 ? '' : 's'}.`)
    }

    if (conditions.unconsciousRounds > 0) {
      conditions.unconsciousRounds--
      if (conditions.unconsciousRounds === 0 && !conditions.coma) this.addLog(`${combatant.name} regains consciousness.`)
    }
    if (conditions.currentHealth <= 0) {
      conditions.coma = true
      combatant.defeated = true
      this.addLog(`${combatant.name}'s Health reaches 0; they fall into a coma.`, 'important')
      if (this.isEnemyCombatant(combatant)) this.resolveEnemyDefeatFear(combatant)
    }
  }

  // Refreshes condition pools so it matches the latest selections.
  refreshConditionPools(combatant) {
    const conditions = combatant.conditions
    let refreshed = combatant.baseMaxPool
    if (conditions.currentHealth <= 1) refreshed = Math.floor(refreshed / 2)
    const woundPenalty = Math.max(conditions.pain, conditions.pendingShock || 0)
    refreshed = Math.max(0, refreshed - woundPenalty - conditions.fatigue - (conditions.knockedDown ? 2 : 0))
    combatant.maxPool = refreshed
    combatant.pool = refreshed
    conditions.shock = conditions.pendingShock || 0
    conditions.pendingShock = 0
    if (conditions.knockedDown) conditions.knockedDown = false
    if (conditions.unconsciousRounds > 0 || conditions.coma || conditions.dead) combatant.pool = 0
  }

  // Returns the current condition trait.
  getConditionTrait(combatant, trait) {
    const value = combatant[trait] || 0
    return combatant.conditions.currentHealth <= 1 ? Math.floor(value / 2) : value
  }

  // Chooses enemy stance for an enemy based on the current combat situation.
  chooseEnemyStance(enemy = this.enemy) {
    const weapon = MELEE_WEAPONS[enemy.weapon]
    const choices = ['noStance', 'middleForward', 'lowForward', 'charging']
    if (weapon.canThrust) choices.push('highForward')
    if (weapon.canCut || weapon.canBash) choices.push('highBack', 'lowBack')
    return choices[Math.floor(Math.random() * choices.length)]
  }

  // Returns the current attitude for intent.
  getAttitudeForIntent(intent) {
    if (intent === 'red') return 'offensive'
    if (intent === 'blue') return 'defensive'
    return 'neutral'
  }

  // Chooses enemy intent for an enemy based on the current combat situation.
  chooseEnemyIntent(enemy = this.enemy) {
    const woundTotal = this.totalWounds(enemy)
    const roll = Math.random()
    if (woundTotal >= 6) {
      if (roll < 0.2) return 'red'
      if (roll < 0.45) return 'white'
      return 'blue'
    }
    if (roll < 0.45) return 'red'
    if (roll < 0.75) return 'white'
    return 'blue'
  }

  // Chooses enemy offense for an enemy based on the current combat situation.
  chooseEnemyOffense(enemy = this.enemy) {
    const weapon = MELEE_WEAPONS[enemy.weapon]
    const choices = (weapon.offense || ['bash']).filter((key) => this.isManeuverAvailable(enemy, OFFENSIVE_MANEUVERS[key]))
    return choices[Math.floor(Math.random() * choices.length)]
  }

  // Chooses enemy defense for an enemy based on the current combat situation.
  chooseEnemyDefense(enemy = this.enemy) {
    const choices = [...(MELEE_WEAPONS[enemy.weapon].defense || ['partialEvasion'])].filter((key) => this.isManeuverAvailable(enemy, DEFENSIVE_MANEUVERS[key]))
    if (enemy.lastAction === 'attack') {
      const fullEvasionIndex = choices.indexOf('fullEvasion')
      if (fullEvasionIndex >= 0) choices.splice(fullEvasionIndex, 1)
    }
    return choices[Math.floor(Math.random() * choices.length)]
  }

  // Chooses one of the seven legal rulebook zones for the enemy's selected attack maneuver.
  chooseEnemyTarget(maneuverKey) {
    const maneuver = OFFENSIVE_MANEUVERS[maneuverKey] || OFFENSIVE_MANEUVERS.cut
    const attackType = maneuver.thrust ? 'thrust' : 'swing'
    const choices = Object.keys(TARGET_ZONES).filter((zone) => TARGET_ZONES[zone].attackType === attackType)
    return choices[Math.floor(Math.random() * choices.length)]
  }

  // Returns the current player plan.
  getPlayerPlan() {
    return {
      intent: this.intentSelect.value,
      attackManeuver: this.offenseSelect.value,
      defenseManeuver: this.defenseSelect.value,
      attackZone: this.targetSelect.value,
      attackDice: Number(this.attackDiceInput.value),
      defenseDice: Number(this.defenseDiceInput.value),
    }
  }

  // Returns the current enemy plan.
  getEnemyPlan(enemy = this.enemy) {
    const remaining = Math.max(1, enemy.pool)
    const firstExchangeRatio = 0.48 + Math.random() * 0.2
    const attackManeuver = this.chooseEnemyOffense(enemy)
    const committed =
      this.exchange === 1
        ? Math.max(1, Math.floor(remaining * firstExchangeRatio))
        : remaining

    return {
      intent: enemy.intent || this.chooseEnemyIntent(enemy),
      attackManeuver,
      defenseManeuver: this.chooseEnemyDefense(enemy),
      attackZone: this.chooseEnemyTarget(attackManeuver),
      attackDice: committed,
      defenseDice: committed,
    }
  }

  // Returns the current group initiative score.
  getGroupInitiativeScore(combatant, plan) {
    const priority = { red: 2, white: 1, blue: 0 }[plan.intent] || 0
    const maneuver = this.getOffensiveManeuver(combatant, plan.attackManeuver)
    const reflexRoll = this.rollPool(
      this.getConditionTrait(combatant, 'reflex'),
      this.getAttackTarget(MELEE_WEAPONS[combatant.weapon], maneuver)
    )
    return priority * 1000 + reflexRoll.successes * 20 + this.getConditionTrait(combatant, 'reflex') + Math.random()
  }

  // Carries out group action for the selected combatant.
  executeGroupAction(action, playerPlan, enemyPlans) {
    const enemy = action.enemy
    if (this.player.defeated || !enemy || enemy.defeated || enemy.fled) return
    this.activateEnemy(enemy)
    const enemyPlan = enemyPlans.get(enemy)
    if (action.actor === this.player) {
      this.resolveAttack(this.player, enemy, playerPlan, enemyPlan)
    } else {
      this.resolveAttack(enemy, this.player, enemyPlan, playerPlan)
    }
    enemy.pairInitiative = this.initiative === 'player' ? 'player' : 'enemy'
    this.storeActiveEnemyState()
  }

  // Resolves group exchange and applies its result to every affected combatant.
  resolveGroupExchange() {
    if (!this.isActive || this.isResolving || this.battleEnded) return
    const activeEnemies = this.getActiveEnemies()
    if (!activeEnemies.length) {
      this.endBattle('victory')
      return
    }

    this.isResolving = true
    this.actionButton.disabled = true
    if (this.canReequip) this.applyReequippedWeapon()
    else this.player.weapon = this.weaponSelect.value

    const target = this.getSelectedEnemy() || activeEnemies[0]
    this.activateEnemy(target)
    const playerPlan = this.getPlayerPlan()
    const enemyPlans = new Map(activeEnemies.map((enemy) => [enemy, this.getEnemyPlan(enemy)]))
    let actions = []

    if (this.exchange === 1 && this.needsInitiativeDeclaration) {
      this.player.stance = this.stanceSelect.value
      this.player.attitude = this.getAttitudeForIntent(playerPlan.intent)
      activeEnemies.forEach((enemy) => {
        enemy.attitude = this.getAttitudeForIntent(enemyPlans.get(enemy).intent)
      })
      if (playerPlan.intent !== 'blue') actions.push({ actor: this.player, enemy: target, plan: playerPlan })
      activeEnemies.forEach((enemy) => {
        const plan = enemyPlans.get(enemy)
        if (plan.intent !== 'blue') actions.push({ actor: enemy, enemy, plan })
      })
      actions.forEach((action) => {
        action.score = this.getGroupInitiativeScore(action.actor, action.plan)
      })
      actions.sort((left, right) => right.score - left.score)
      this.needsInitiativeDeclaration = false
      if (!actions.length) this.addLog('Every combatant declares Blue; the entire group circles without committing.')
    } else {
      if (target.pairInitiative === 'enemy' && this.buyInitiativeInput.checked) {
        this.activateEnemy(target)
        if (this.attemptBuyInitiative(this.player, target)) target.pairInitiative = 'player'
      }
      activeEnemies.forEach((enemy) => {
        if (enemy.pairInitiative === 'player' && Math.random() < 0.18) {
          this.activateEnemy(enemy)
          if (this.attemptBuyInitiative(enemy, this.player)) enemy.pairInitiative = 'enemy'
        }
      })
      let playerActionAdded = false
      activeEnemies.forEach((enemy) => {
        if (enemy === target && enemy.pairInitiative === 'player' && !playerActionAdded) {
          actions.push({ actor: this.player, enemy, plan: playerPlan, score: this.getConditionTrait(this.player, 'reflex') })
          playerActionAdded = true
        } else if (enemy.pairInitiative !== 'player') {
          actions.push({ actor: enemy, enemy, plan: enemyPlans.get(enemy), score: this.getConditionTrait(enemy, 'reflex') })
        }
      })
      actions.sort((left, right) => right.score - left.score)
    }

    actions.forEach((action) => this.executeGroupAction(action, playerPlan, enemyPlans))
    this.afterGroupExchange()
  }

  // Identifies whether a combatant belongs to the current enemy group.
  isEnemyCombatant(combatant) {
    return Boolean(this.enemies?.includes(combatant))
  }

  // Returns the most severe wound currently carried by one enemy.
  getWorstWoundLevel(enemy) {
    return enemy.wounds.reduce((highest, wound) => Math.max(highest, wound.severity), 0)
  }

  // Returns the enemy's highest remaining wound Pain after Willpower and Pain Resistance have already reduced it.
  getHighestCurrentPain(enemy) {
    return enemy.wounds.reduce((highest, wound) => Math.max(highest, wound.pain || 0), 0)
  }

  // Counts enemy NPCs who have actually died, rather than those who escaped or were merely knocked unconscious.
  getDeadEnemyCount() {
    return this.enemies.filter((enemy) => enemy.conditions.dead).length
  }

  // Counts other living enemies whose worst wound is Level 2 or higher.
  getOtherSeriouslyWoundedEnemyCount(subject) {
    return this.enemies.filter((enemy) =>
      enemy !== subject &&
      !enemy.defeated &&
      !enemy.fled &&
      this.getWorstWoundLevel(enemy) >= 2
    ).length
  }

  // Marks a failed enemy fear test as a retreat and removes that enemy from later group actions.
  makeEnemyFlee(enemy, reason) {
    if (enemy.defeated || enemy.fled) return false
    enemy.fled = true
    enemy.actor?.classList.remove('active')
    enemy.actor?.classList.add('fled')
    this.addLog(`${enemy.name} ${reason} and flees the battle.`, 'important')
    return true
  }

  // Rolls Willpower plus Endurance against a calculated fear target; one success is enough to remain in the fight.
  resolveEnemyFearCheck(enemy, rawDifficulty, reason) {
    if (enemy.defeated || enemy.fled) return true
    const fearTarget = Math.max(1, Math.ceil(rawDifficulty / 2))
    const fearDice = Math.max(0, this.getConditionTrait(enemy, 'willpower') + this.getConditionTrait(enemy, 'endurance'))
    const roll = this.rollPool(fearDice, fearTarget)
    const passed = roll.successes > 0
    this.addLog(
      `${enemy.name} tests Fear (${fearDice} dice vs TN ${fearTarget}) after ${reason}: ${roll.successes} success${roll.successes === 1 ? '' : 'es'} [${roll.dice.join(', ')}].`,
      passed ? undefined : 'important'
    )
    if (!passed) this.makeEnemyFlee(enemy, 'breaks under fear')
    return passed
  }

  // Tests only the newly wounded enemy after it suffers a Level 2 or worse wound.
  resolveEnemyWoundFear(enemy) {
    const worstWound = this.getWorstWoundLevel(enemy)
    const deadEnemies = this.getDeadEnemyCount()
    const woundedAllies = this.getOtherSeriouslyWoundedEnemyCount(enemy)
    const rawDifficulty = worstWound + deadEnemies + woundedAllies
    return this.resolveEnemyFearCheck(
      enemy,
      rawDifficulty,
      `suffering a Level ${worstWound} wound (${deadEnemies} dead, ${woundedAllies} other seriously wounded)`
    )
  }

  // Tests every surviving enemy when one of their allies is defeated, including each survivor's current highest Pain.
  resolveEnemyDefeatFear(defeatedEnemy) {
    if (defeatedEnemy.fearDefeatProcessed) return
    defeatedEnemy.fearDefeatProcessed = true
    this.getActiveEnemies().forEach((enemy) => {
      const worstWound = this.getWorstWoundLevel(enemy)
      const highestPain = this.getHighestCurrentPain(enemy)
      const deadEnemies = this.getDeadEnemyCount()
      const woundedAllies = this.getOtherSeriouslyWoundedEnemyCount(enemy)
      const rawDifficulty = worstWound + highestPain + deadEnemies + woundedAllies
      this.resolveEnemyFearCheck(
        enemy,
        rawDifficulty,
        `${defeatedEnemy.name}'s defeat (Wound ${worstWound}, Pain ${highestPain}, ${deadEnemies} dead, ${woundedAllies} other seriously wounded)`
      )
    })
  }

  // Applies end-of-exchange wounds, fleeing checks, and round progression after every combatant acts.
  afterGroupExchange() {
    ;[this.player, ...this.getActiveEnemies()].forEach((combatant) => {
      if (combatant.guardBeaten > 0) combatant.guardBeaten--
    })
    if (this.player.defeated) {
      this.endBattle('defeat')
      return
    }

    this.enemies.forEach((enemy) => {
      if (enemy.defeated && !enemy.defeatProcessed) {
        enemy.defeatProcessed = true
        this.rollLootForEnemy(enemy)
        enemy.actor?.classList.remove('active')
        enemy.actor?.classList.add('defeated')
        this.resolveEnemyDefeatFear(enemy)
      }
    })
    this.refreshOpponentOptions()

    if (!this.getActiveEnemies().length) {
      this.endBattle('victory')
      return
    }
    this.activateEnemy(this.getSelectedEnemy())
    this.initiative = this.enemy.pairInitiative === 'player' ? 'player' : this.enemy.id

    if (this.pauseAfterExchange) {
      this.round++
      this.beginRound()
      this.addLog('The group resets after the break in engagement.')
    } else if (this.exchange === 1) {
      this.exchange = 2
      this.boutOpeningExchange = false
      this.player.stance = 'noStance'
      this.player.attitude = 'neutral'
      this.getActiveEnemies().forEach((enemy) => {
        enemy.stance = 'noStance'
        enemy.attitude = 'neutral'
      })
      this.addLog('Exchange 2: every combatant acts according to the initiative held against each opponent.')
    } else {
      this.round++
      this.beginRound()
    }
    this.finishResolution()
  }

  // Resolves exchange and applies its result to every affected combatant.
  resolveExchange() {
    this.resolveGroupExchange()
  }

  // Resolves legacy exchange and applies its result to every affected combatant.
  resolveLegacyExchange() {
    if (!this.isActive || this.isResolving || this.battleEnded) return

    this.isResolving = true
    this.actionButton.disabled = true
    if (this.canReequip) this.applyReequippedWeapon()
    else this.player.weapon = this.weaponSelect.value

    const playerPlan = this.getPlayerPlan()
    const enemyPlan = this.getEnemyPlan()

    if (this.exchange === 1 && this.needsInitiativeDeclaration) {
      this.player.stance = this.stanceSelect.value
      this.player.attitude = this.getAttitudeForIntent(playerPlan.intent)
      this.enemy.attitude = this.getAttitudeForIntent(enemyPlan.intent)
      const initiativeResult = this.resolveInitiative(
        playerPlan.intent,
        enemyPlan.intent
      )

      if (initiativeResult === 'circle') {
        this.addLog('Both fighters show Blue. They circle without committing.')
        this.animateBanner('Both defend — circle!')
        this.finishResolution()
        return
      }

      if (initiativeResult === 'competing') {
        this.resolveCompetingAttacks(playerPlan, enemyPlan)
        this.afterExchange()
        return
      }

      if (initiativeResult === 'ordered') {
        this.resolveOrderedAttacks(playerPlan, enemyPlan)
        this.afterExchange()
        return
      }
    }

    if (this.exchange === 2) {
      if (this.initiative === 'enemy' && this.buyInitiativeInput.checked) {
        this.attemptBuyInitiative(this.player, this.enemy)
      } else if (this.initiative === 'player' && Math.random() < 0.18) {
        this.attemptBuyInitiative(this.enemy, this.player)
      }
    }

    if (this.initiative === 'player') {
      this.resolveAttack(this.player, this.enemy, playerPlan, enemyPlan)
    } else {
      this.resolveAttack(this.enemy, this.player, enemyPlan, playerPlan)
    }

    this.afterExchange()
  }

  // Resolves initiative and applies its result to every affected combatant.
  resolveInitiative(playerIntent, enemyIntent) {
    if (playerIntent === 'blue' && enemyIntent === 'blue') {
      return 'circle'
    }

    if (playerIntent === enemyIntent) {
      this.needsInitiativeDeclaration = false
      this.addLog(`Both fighters choose ${playerIntent === 'red' ? 'Red' : 'White'}. Reflex decides whose blow lands first.`)
      this.animateBanner(`${playerIntent === 'red' ? 'Red' : 'White'} against ${playerIntent === 'red' ? 'red' : 'white'}!`)
      return 'competing'
    }

    const priority = { red: 2, white: 1, blue: 0 }
    const playerPriority = priority[playerIntent]
    const enemyPriority = priority[enemyIntent]
    this.initiative = playerPriority > enemyPriority ? 'player' : 'enemy'
    this.needsInitiativeDeclaration = false

    if (playerIntent !== 'blue' && enemyIntent !== 'blue') {
      this.addLog('Red attacks first; White remains cautious and acts second if able.')
      return 'ordered'
    }

    const attacker = this.initiative === 'player' ? this.player : this.enemy
    this.addLog(`${attacker.name} takes the initiative.`)
    return this.initiative
  }

  // Resolves ordered attacks and applies its result to every affected combatant.
  resolveOrderedAttacks(playerPlan, enemyPlan) {
    const first = this.initiative === 'player' ? this.player : this.enemy
    const second = first === this.player ? this.enemy : this.player
    const firstPlan = first === this.player ? playerPlan : enemyPlan
    const secondPlan = second === this.player ? playerPlan : enemyPlan

    this.resolveUnopposedStrike(first, second, firstPlan)
    if (!second.defeated && second.pool > 0) {
      this.addLog(`${second.name} follows cautiously after the Red attack.`)
      this.resolveUnopposedStrike(second, first, secondPlan)
      if (!second.defeated) this.initiative = second.id
    }
  }

  // Resolves competing attacks and applies its result to every affected combatant.
  resolveCompetingAttacks(playerPlan, enemyPlan) {
    const playerContest = this.rollPool(this.getConditionTrait(this.player, 'reflex'), this.getAttackTarget(MELEE_WEAPONS[this.player.weapon], this.getOffensiveManeuver(this.player, playerPlan.attackManeuver)))
    const enemyContest = this.rollPool(this.getConditionTrait(this.enemy, 'reflex'), this.getAttackTarget(MELEE_WEAPONS[this.enemy.weapon], this.getOffensiveManeuver(this.enemy, enemyPlan.attackManeuver)))
    this.addLog(`${this.player.name} rolls Reflex: ${playerContest.successes}; ${this.enemy.name}: ${enemyContest.successes}.`)

    let first = playerContest.successes > enemyContest.successes ? this.player : this.enemy
    if (playerContest.successes === enemyContest.successes) {
      const playerThrust = playerPlan.attackManeuver === 'thrust' ? 1 : 0
      const enemyThrust = enemyPlan.attackManeuver === 'thrust' ? 1 : 0
      const playerSpeed = this.getConditionTrait(this.player, 'reflex') + playerThrust
      const enemySpeed = this.getConditionTrait(this.enemy, 'reflex') + enemyThrust
      first = playerSpeed === enemySpeed ? (Math.random() < 0.5 ? this.player : this.enemy) : (playerSpeed > enemySpeed ? this.player : this.enemy)
      this.addLog(playerSpeed === enemySpeed ? 'The Reflex contest ties; the first opening is razor-thin.' : 'A thrust breaks the tied Reflex contest.')
    }

    let second = first === this.player ? this.enemy : this.player
    if (second === this.player && this.buyInitiativeInput.checked) {
      if (this.attemptBuyInitiative(this.player, this.enemy)) [first, second] = [second, first]
    } else if (second === this.enemy && Math.random() < 0.2) {
      if (this.attemptBuyInitiative(this.enemy, this.player)) [first, second] = [second, first]
    }

    this.initiative = first.id
    this.resolveUnopposedStrike(first, second, first === this.player ? playerPlan : enemyPlan)
    if (!second.defeated && second.pool > 0) {
      this.addLog(`${second.name} is committed and strikes second with the dice that remain.`)
      this.resolveUnopposedStrike(second, first, second === this.player ? playerPlan : enemyPlan)
      if (!second.defeated) this.initiative = second.id
    }
  }

  // Resolves unopposed strike and applies its result to every affected combatant.
  resolveUnopposedStrike(attacker, defender, plan) {
    const result = this.rollUnopposedAttack(attacker, plan)
    if (result.successes <= 0) return
    if (result.maneuver.positional) this.resolvePositionalManeuver(attacker, defender, result.maneuver, result.successes)
    else this.inflictAttackWound(attacker, defender, result.successes, result.maneuver, result.attackZone)
  }

  // Attempts buy initiative and reports whether it succeeds.
  attemptBuyInitiative(buyer, opponent) {
    const cost = this.getConditionTrait(opponent, 'perception')
    if (buyer.pool <= cost) {
      this.addLog(`${buyer.name} cannot spare the ${cost} CP needed to buy initiative.`)
      return false
    }
    buyer.pool -= cost
    const buyerRoll = this.rollPool(this.getConditionTrait(buyer, 'willpower'), this.getConditionTrait(opponent, 'reflex'))
    const opponentRoll = this.rollPool(this.getConditionTrait(opponent, 'wit'), this.getConditionTrait(buyer, 'reflex'))
    const success = buyerRoll.successes > opponentRoll.successes
    this.addLog(`${buyer.name} spends ${cost} CP to buy initiative: Willpower ${buyerRoll.successes} vs Wit ${opponentRoll.successes}${success ? ' — success.' : ' — failure.'}`)
    if (success) this.initiative = buyer.id
    return success
  }

  // Randomly determines unopposed attack for this encounter.
  rollUnopposedAttack(attacker, plan) {
    const maneuver = this.getOffensiveManeuver(attacker, plan.attackManeuver)
    const attackZone = maneuver.murderStroke ? 'zoneV' : plan.attackZone
    const weapon = MELEE_WEAPONS[attacker.weapon]
    const activationCost = this.getActivationCost(
      attacker,
      'attack',
      maneuver.activationCost
      , maneuver
    )
    const committedDice = this.spendPool(
      attacker,
      plan.attackDice,
      activationCost
    )
    const stanceBonus = this.getStanceAttackBonus(attacker, maneuver, attackZone)
    const orientationBonus = this.getOrientationBonus(attacker.id)
    const rawReachPenalty = this.getReachPenalty(attacker.id, 'attack')
    const reachPenalty = maneuver.beat ? Math.floor(rawReachPenalty / 2) : rawReachPenalty
    const counterBonus = attacker.counterBonus
    attacker.counterBonus = 0
    const diceCount = Math.max(
      0,
      committedDice +
        stanceBonus +
        maneuver.diceBonus +
        counterBonus +
        orientationBonus -
        reachPenalty
    )
    const target = this.clampTarget(this.getAttackTarget(weapon, maneuver) + maneuver.targetModifier + Crafting.attackModifier(this, attacker, maneuver))
    const result = this.rollPool(diceCount + (attacker === this.player && committedDice > 0 ? Crafting.cpBonus(this, 'attack') : 0), target)
    this.addLog(
      `${attacker.name} ${maneuver.name.toLowerCase()}s: ${result.successes} successes [${result.dice.join(
        ', '
      )}] vs TN ${target}.`
    )
    this.animateActors(attacker.id)
    attacker.lastAction = 'attack'
    return { ...result, maneuver, attackZone }
  }

  // Returns the current offensive maneuver.
  getOffensiveManeuver(combatant, requested) {
    const weapon = MELEE_WEAPONS[combatant.weapon]
    const permitted = (weapon.offense || ['bash']).filter((key) => !OFFENSIVE_MANEUVERS[key].requires || weapon[OFFENSIVE_MANEUVERS[key].requires])
    const fallbackKey = permitted.find((key) => this.isManeuverAvailable(combatant, OFFENSIVE_MANEUVERS[key])) || permitted[0]
    const fallback = OFFENSIVE_MANEUVERS[fallbackKey]
    const maneuver = OFFENSIVE_MANEUVERS[requested] || fallback
    if (maneuver.beat && !this.boutOpeningExchange) {
      this.addLog(`Beat is only available at the opening of a bout or after a pause; ${fallback.name} is used instead.`)
      return fallback
    }
    if (!permitted.includes(requested) || !this.isManeuverAvailable(combatant, maneuver)) {
      this.addLog(`${maneuver.name} is not available with ${MELEE_WEAPONS[combatant.weapon].name}; ${fallback.name} is used instead.`)
      return fallback
    }
    return maneuver
  }

  // Checks whether maneuver available is true.
  isManeuverAvailable(combatant, maneuver) {
    const weapon = MELEE_WEAPONS[combatant.weapon]
    if (!maneuver) return false
    if (maneuver.requires && !weapon[maneuver.requires]) return false
    if (maneuver.requiresShield && !combatant.shield) return false
    if (maneuver.requiresAllies) return false
    if (maneuver.murderStroke && !weapon.heavyBlade) return false
    if (combatant.proficiency < (maneuver.minimumProficiency || 0)) return false
    if (maneuver.quickDraw && !this.boutOpeningExchange) return false
    if (maneuver.beat && !this.boutOpeningExchange) return false
    return true
  }

  // Resolves attack and applies its result to every affected combatant.
  resolveAttack(attacker, defender, attackerPlan, defenderPlan) {
    const attackManeuver = this.getOffensiveManeuver(attacker, attackerPlan.attackManeuver)
    const attackZone = attackManeuver.murderStroke ? 'zoneV' : attackerPlan.attackZone
    if (attackManeuver.murderStroke && attackerPlan.attackZone !== 'zoneV') this.addLog('Murder Stroke must descend onto the head; the target is corrected to Zone V.')
    let defenseManeuver = DEFENSIVE_MANEUVERS[defenderPlan.defenseManeuver] || DEFENSIVE_MANEUVERS.parry
    const permittedDefenses = MELEE_WEAPONS[defender.weapon].defense || ['partialEvasion']
    if (!permittedDefenses.includes(defenderPlan.defenseManeuver) || !this.isManeuverAvailable(defender, defenseManeuver)) {
      const fallbackKey = permittedDefenses.find((key) => this.isManeuverAvailable(defender, DEFENSIVE_MANEUVERS[key])) || 'partialEvasion'
      defenseManeuver = DEFENSIVE_MANEUVERS[fallbackKey]
      this.addLog(`${DEFENSIVE_MANEUVERS[defenderPlan.defenseManeuver]?.name || 'That defense'} is unavailable with ${MELEE_WEAPONS[defender.weapon].name}; ${defenseManeuver.name} is used instead.`)
    }
    if (defenseManeuver.expulsion && !attackManeuver.thrust) {
      defenseManeuver = DEFENSIVE_MANEUVERS.parry
      this.addLog('Expulsion can only oppose a thrust; Parry is used instead.')
    }
    if (defender.guardBeaten && (defenseManeuver.usesWeaponTarget || defenseManeuver.counter)) {
      defenseManeuver = DEFENSIVE_MANEUVERS.partialEvasion
      this.addLog(`${defender.name}'s weapon was beaten aside; Partial Evasion replaces the unavailable parry.`)
    }
    if (defenseManeuver.fullEvasion && defender.lastAction === 'attack') {
      defenseManeuver = DEFENSIVE_MANEUVERS.partialEvasion
      this.addLog('Full Evasion cannot immediately follow an attack; Partial Evasion is used instead.')
    }
    const attackWeapon = MELEE_WEAPONS[attacker.weapon]
    const defenseWeapon = MELEE_WEAPONS[defender.weapon]

    const attackCost = this.getActivationCost(
      attacker,
      'attack',
      attackManeuver.activationCost
      , attackManeuver
    )
    const defenseCost = this.getActivationCost(
      defender,
      'defense',
      defenseManeuver.activationCost
      , defenseManeuver
    )
    const attackCommitted = this.spendPool(
      attacker,
      attackerPlan.attackDice,
      attackCost
    )
    const defenseCommitted = this.spendPool(
      defender,
      defenderPlan.defenseDice,
      defenseCost
    )

    const orientationBonus = this.getOrientationBonus(attacker.id)
    const rawAttackReachPenalty = this.getReachPenalty(attacker.id, 'attack')
    const attackReachPenalty = attackManeuver.beat ? Math.floor(rawAttackReachPenalty / 2) : rawAttackReachPenalty
    const defenseReachPenalty = this.getReachPenalty(defender.id, 'defense')
    const carriedDefenseBonus = defender.nextDefenseBonus
    defender.nextDefenseBonus = 0
    const counterBonus = attacker.counterBonus
    attacker.counterBonus = 0
    const attackDice = Math.max(
      0,
      attackCommitted +
        this.getStanceAttackBonus(attacker, attackManeuver, attackZone) +
        attackManeuver.diceBonus +
        counterBonus +
        orientationBonus -
        attackReachPenalty
    )
    const defenseDice = Math.max(
      0,
      defenseCommitted +
        this.getStanceDefenseBonus(defender, attackManeuver, attackZone) +
        defenseManeuver.diceBonus -
        defenseReachPenalty +
        carriedDefenseBonus
    )
    const attackTarget = this.clampTarget(
      this.getAttackTarget(attackWeapon, attackManeuver) + attackManeuver.targetModifier + Crafting.attackModifier(this, attacker, attackManeuver, defender)
    )
    const baseDefenseTarget = defenseManeuver.block && defender.shield
      ? defender.shield.meleeTarget
      : defenseManeuver.usesWeaponTarget
        ? defenseWeapon.defenseTarget
        : defenseManeuver.fixedTarget
    const defenseTarget = this.clampTarget(baseDefenseTarget + defenseManeuver.targetModifier + Crafting.defenseModifier(this, defender, defenseManeuver))

    const attackRoll = this.rollPool(attackDice + (attacker === this.player && attackCommitted > 0 ? Crafting.cpBonus(this, 'attack', defender) : 0), attackTarget)
    const defenseRoll = this.rollPool(defenseDice + (defender === this.player && defenseCommitted > 0 ? Crafting.cpBonus(this, 'defense', attacker) : 0), defenseTarget)
    const netSuccesses = attackRoll.successes - defenseRoll.successes
    attacker.lastAction = 'attack'
    defender.lastAction = 'defense'

    this.addLog(
      `${attacker.name}: ${attackManeuver.name} ${attackRoll.successes} success${
        attackRoll.successes === 1 ? '' : 'es'
      } vs ${defender.name}: ${defenseManeuver.name} ${
        defenseRoll.successes
      }.`
    )
    this.animateActors(attacker.id, netSuccesses > 0 ? defender.id : null)

    if (netSuccesses > 0) {
      this.initiative = attacker.id
      if (attackManeuver.positional) {
        this.resolvePositionalManeuver(
          attacker,
          defender,
          attackManeuver,
          netSuccesses
        )
      } else {
        this.inflictAttackWound(
          attacker,
          defender,
          netSuccesses,
          attackManeuver,
          attackZone
        )
        if (attackManeuver.doubleStrike && netSuccesses > 1 && !defender.defeated) {
          this.addLog(`${attacker.name}'s second strike follows through.`)
          this.inflictAttackWound(attacker, defender, netSuccesses - 1, attackManeuver, attackZone)
        }
      }
      if (attackManeuver.evasiveAttack) attacker.nextDefenseBonus += 1
      if (attackManeuver.simultaneous) attacker.nextDefenseBonus += 2
      if (attackManeuver.masterStrike) attacker.nextDefenseBonus += Math.floor(attackCommitted / 2)
      return
    }

    if (netSuccesses < 0) {
      const defenseMargin = Math.abs(netSuccesses)
      const partialMustPay = defenseManeuver === DEFENSIVE_MANEUVERS.partialEvasion
      if (partialMustPay && defender.pool >= 2) {
        defender.pool -= 2
        this.initiative = defender.id
        this.addLog(`${defender.name} pays 2 CP after a Partial Evasion and takes initiative.`)
      } else if (partialMustPay) {
        this.initiative = attacker.id
        this.addLog(`${defender.name} evades but lacks 2 CP to take initiative.`)
      } else {
        this.initiative = defender.id
        this.addLog(`${defender.name} takes the initiative on the defense.`)
      }

      if (defenseManeuver.positional) {
        this.shiftOrientation(defender.id, 1)
        if (defenseManeuver.duckWeave) {
          this.reachAdvantage = defender.id
          const poolLoss = Math.min(attacker.pool, attackRoll.successes)
          attacker.pool -= poolLoss
          this.addLog(`${attacker.name} loses ${poolLoss} CP after the Duck and Weave.`)
        }
        this.addLog(`${defender.name} improves position with an evade.`)
      }

      if (defenseManeuver.fullEvasion) {
        this.pauseAfterExchange = true
        this.initiative = null
        this.addLog('Full Evasion breaks the bout; initiative must be declared again.')
      }

      if (defenseManeuver.counter) {
        defender.counterBonus += attackRoll.successes
        this.addLog(`${defender.name}'s Counter banks ${attackRoll.successes} bonus dice for the next attack.`)
      }
      if (defenseManeuver.masterStrike || defenseManeuver.overrun) {
        defender.counterBonus += defenseMargin
        this.addLog(`${defender.name}'s ${defenseManeuver.name} carries ${defenseMargin} defense success${defenseMargin === 1 ? '' : 'es'} into the return attack.`)
      }
      if (defenseManeuver.disarm) this.resolveDisarm(defender, attacker, defenseMargin)
      if (defenseManeuver.blockOpenStrike) {
        defender.counterBonus += defenseMargin
        this.addLog(`${defender.name}'s Block Open and Strike banks ${defenseMargin} bonus dice for the return blow.`)
      }
      if (defenseManeuver.expulsion) {
        const poolLoss = Math.min(attacker.pool, defenseMargin)
        attacker.pool -= poolLoss
        this.addLog(`${defender.name}'s Expulsion drives the weapon aside; ${attacker.name} loses ${poolLoss} CP.`)
      }
      if (attackManeuver.twitch && !defenseManeuver.fullEvasion && !defenseManeuver.positional) {
        const twitchDice = Math.max(1, Math.floor(attackCommitted / 3))
        if (twitchDice > defenseMargin) {
          attacker.counterBonus += twitchDice + defenseMargin
          this.initiative = attacker.id
          this.addLog(`${attacker.name}'s Twitch preserves initiative and banks ${twitchDice + defenseMargin} dice for the opposite-side follow-up.`)
        }
      }
      return
    }

    this.initiative = attacker.id
    this.addLog(`${attacker.name} retains initiative after the tied contest.`)
  }

  // Resolves positional maneuver and applies its result to every affected combatant.
  resolvePositionalManeuver(attacker, defender, maneuver, netSuccesses) {
    if (maneuver.beat) {
      const poolLoss = Math.min(defender.pool, Math.max(2, netSuccesses * 2))
      defender.pool -= poolLoss
      defender.guardBeaten = 2
      this.addLog(
        `${attacker.name} beats the guard aside; ${defender.name} loses ${poolLoss} CP and cannot parry on the next exchange.`
      )
    } else if (maneuver.hook) {
      const oldPool = defender.pool
      defender.pool = Math.floor(defender.pool / 2)
      this.shiftOrientation(attacker.id, 1)
      this.addLog(`${attacker.name} hooks ${defender.name} off balance; available CP falls from ${oldPool} to ${defender.pool}.`)
    } else if (maneuver.grapple) {
      const oldPool = defender.pool
      defender.pool = Math.floor(defender.pool / 2)
      this.reachAdvantage = attacker.id
      this.addLog(`${attacker.name} closes into a grapple; ${defender.name}'s available CP falls from ${oldPool} to ${defender.pool}.`)
    } else if (maneuver.bind || maneuver.stopShort || maneuver.toss) {
      const poolLoss = Math.min(defender.pool, Math.max(1, netSuccesses))
      defender.pool -= poolLoss
      if (maneuver.toss) this.shiftOrientation(attacker.id, 1)
      this.addLog(`${attacker.name}'s ${maneuver.name} costs ${defender.name} ${poolLoss} CP${maneuver.toss ? ' and improves position' : ''}.`)
    } else if (maneuver.disarm) {
      this.resolveDisarm(attacker, defender, netSuccesses)
    } else if (maneuver.windingBinding) {
      if (netSuccesses <= 2) {
        attacker.counterBonus += 3
        this.reachAdvantage = attacker.id
        this.addLog(`${attacker.name} enters the bind and gains 3 CP for the next winding action.`)
      } else {
        this.addLog('The margin is too wide to establish Winding and Binding; initiative is retained without entering the bind.')
      }
    } else if (maneuver.netThrow) {
      const reduction = Math.max(1, netSuccesses)
      defender.baseMaxPool = Math.max(1, defender.baseMaxPool - reduction)
      defender.maxPool = Math.min(defender.maxPool, defender.baseMaxPool)
      defender.pool = Math.min(defender.pool, defender.maxPool)
      this.addLog(`${defender.name} is entangled; maximum CP is reduced by ${reduction}.`)
    }
    this.initiative = attacker.id
  }

  // Resolves disarm and applies its result to every affected combatant.
  resolveDisarm(actor, target, margin) {
    const gripDice = Math.max(0, target.strength - margin)
    const gripRoll = this.rollPool(gripDice, 8)
    if (gripRoll.successes > 0) {
      const poolLoss = Math.min(target.pool, margin)
      target.pool -= poolLoss
      this.addLog(`${target.name} retains the weapon but loses ${poolLoss} CP fighting the disarm.`)
      return
    }
    target.pool = 0
    target.guardBeaten = Math.max(target.guardBeaten || 0, 2)
    this.addLog(`${actor.name} disarms ${target.name}; the weapon must be recovered before the next round.`, 'important')
  }

  // Changes orientation by the maneuver's positional result.
  shiftOrientation(actorId, amount) {
    if (actorId === 'player') {
      this.orientation = Math.min(2, this.orientation + amount)
    } else {
      this.orientation = Math.max(-2, this.orientation - amount)
    }
  }

  // Returns the current orientation bonus.
  getOrientationBonus(actorId) {
    const advantage =
      actorId === 'player'
        ? Math.max(0, this.orientation)
        : Math.max(0, -this.orientation)
    return ORIENTATION_ATTACK_DICE[advantage]
  }

  // Returns the current stance attack bonus.
  getStanceAttackBonus(combatant, maneuver, attackZone) {
    const attitudeBonus = MELEE_ATTITUDES[combatant.attitude || 'neutral'].attackDice
    const isThrust = Boolean(maneuver.thrust)
    const isSwing = !isThrust
    const guardZone = TARGET_ZONES[attackZone]?.guardZone || 'torso'
    let guardBonus = 0
    switch (combatant.stance) {
      case 'highForward':
        if (isThrust) guardBonus = ['head', 'torso'].includes(guardZone) ? 3 : 1
        break
      case 'middleForward':
        if (isThrust && ['head', 'torso'].includes(guardZone)) guardBonus = 1
        break
      case 'lowForward':
        guardBonus = guardZone === 'arms' ? 2 : isThrust ? -1 : -2
        break
      case 'highBack':
        guardBonus = isThrust ? -2 : ['head', 'arms'].includes(guardZone) ? 3 : 1
        break
      case 'lowBack':
        guardBonus = isThrust ? -2 : guardZone === 'legs' ? 2 : -1
        break
      case 'charging':
        guardBonus = 2
        break
    }
    return attitudeBonus + (isSwing || isThrust ? guardBonus : 0)
  }

  // Returns the current stance defense bonus.
  getStanceDefenseBonus(combatant, incomingManeuver, attackZone) {
    const attitudeBonus = MELEE_ATTITUDES[combatant.attitude || 'neutral'].defenseDice
    const guardZone = TARGET_ZONES[attackZone]?.guardZone || 'torso'
    let guardBonus = 0
    switch (combatant.stance) {
      case 'highForward':
        guardBonus = ['head', 'torso'].includes(guardZone) ? 1 : -2
        break
      case 'middleForward':
        guardBonus = guardZone === 'torso' ? 2 : guardZone === 'head' ? 1 : 0
        break
      case 'lowForward':
        guardBonus = guardZone === 'legs' ? 3 : guardZone === 'torso' ? 2 : guardZone === 'head' ? -1 : 0
        break
      case 'highBack':
        guardBonus = ['arms', 'legs'].includes(guardZone) ? -2 : 0
        break
      case 'lowBack':
        guardBonus = ['arms', 'legs'].includes(guardZone) ? 0 : -2
        break
      case 'charging':
        guardBonus = -2
        break
    }
    return attitudeBonus + guardBonus
  }

  // Returns the current attack target.
  getAttackTarget(weapon, maneuver) {
    if (maneuver.thrust && Number.isFinite(weapon.thrustTarget)) return weapon.thrustTarget
    if ((maneuver.bash || maneuver.murderStroke) && Number.isFinite(weapon.bashTarget)) return weapon.bashTarget
    if (Number.isFinite(weapon.cutTarget)) return weapon.cutTarget
    if (Number.isFinite(weapon.thrustTarget)) return weapon.thrustTarget
    if (Number.isFinite(weapon.bashTarget)) return weapon.bashTarget
    return weapon.attackTarget
  }

  // Returns the current damage modifier.
  getDamageModifier(weapon, maneuver, defender) {
    let modifier
    if (maneuver.murderStroke) modifier = 0
    else if (maneuver.thrust) modifier = Number.isFinite(weapon.thrustDamage) ? weapon.thrustDamage : weapon.damageModifier
    else if (maneuver.bash) modifier = Number.isFinite(weapon.bashDamage) ? weapon.bashDamage : weapon.damageModifier
    else modifier = Number.isFinite(weapon.cutDamage) ? weapon.cutDamage : weapon.damageModifier
    if (maneuver.drawCut) {
      modifier += weapon.drawCutModifier || 0
      const hardArmor = ['cuirBouilli', 'scale', 'mail', 'doubledMail', 'bandedMail', 'lightPlate', 'plate', 'heavyPlate'].includes(defender.armorMaterial)
      modifier -= hardArmor ? 2 : defender.armor > 0 ? 1 : 0
    }
    if (weapon.armorPiercing && defender.armor > 0) modifier += weapon.armorPiercing
    return modifier
  }

  // Returns the current reach penalty.
  getReachPenalty(actorId, action) {
    if (!this.reachAdvantage) return 0
    const playerReach = MELEE_WEAPONS[this.player.weapon].reach
    const enemyReach = MELEE_WEAPONS[this.enemy.weapon].reach
    const difference = Math.abs(playerReach - enemyReach)
    if (difference === 0 || this.reachAdvantage === actorId) return 0

    const longerId = playerReach > enemyReach ? 'player' : this.enemy.id
    if (this.reachAdvantage === longerId) {
      return action === 'attack' ? difference : 0
    }
    return actorId === longerId ? difference : 0
  }

  // Turns a successful attack into attack wound on the defender.
  inflictAttackWound(attacker, defender, netSuccesses, maneuver, attackZone) {
    const weapon = MELEE_WEAPONS[attacker.weapon]
    const hitLocation = this.rollWoundLocation(attackZone)
    // Zone VIII can pass harmlessly between the legs on a location roll of 6 even though the attack roll succeeded.
    if (hitLocation.miss) {
      this.addLog(`${attacker.name}'s ${maneuver.name.toLowerCase()} passes between ${defender.name}'s legs without striking.`)
      return
    }
    const severity = this.calculateWoundSeverity(
      attacker,
      defender,
      netSuccesses,
      maneuver,
      hitLocation
    )
    this.reachAdvantage = attacker.id
    this.applyWound(
      defender,
      severity,
      `${attacker.name}'s ${maneuver.name.toLowerCase()}`,
      attackZone,
      maneuver.thrust ? 'puncturing' : maneuver.bash || maneuver.murderStroke ? 'bludgeoning' : weapon.damageType,
      { margin: netSuccesses, mass: Boolean(maneuver.bash || maneuver.murderStroke || weapon.canBash && !weapon.canCut) },
      hitLocation
    )
  }

  // Calculates wound severity from the current game values.
  calculateWoundSeverity(attacker, defender, netSuccesses, maneuver, hitLocation) {
    const weapon = MELEE_WEAPONS[attacker.weapon]
    const damageType = maneuver.thrust ? 'puncturing' : maneuver.bash || maneuver.murderStroke ? 'bludgeoning' : 'cutting'
    const effectiveArmor = this.getEffectiveArmor(defender, damageType, hitLocation)
    const potionDamage = attacker === this.player && Crafting.effects(this.character).some(e => e.text.startsWith(`increase ${damageType === 'puncturing' ? 'thrust' : damageType === 'bludgeoning' ? 'blunt' : 'cutting'} damage`)) ? 1 : 0
    const strengthToughnessModifier = getStrengthToughnessDamageModifier(
      this.getConditionTrait(attacker, 'strength'),
      this.getConditionTrait(defender, 'toughness')
    )
    let impact

    if (attacker.damageRules === 'companion') {
      impact =
        (netSuccesses + this.getDamageModifier(weapon, maneuver, defender) + maneuver.damageBonus + potionDamage) *
          weapon.damageFactor +
        strengthToughnessModifier -
        effectiveArmor * 3
      const adjusted = Math.max(0, impact)
      if (adjusted === 0) return 0
      return Math.min(5, Math.ceil(adjusted / 3))
    }

    impact =
      netSuccesses +
      this.getDamageModifier(weapon, maneuver, defender) +
      maneuver.damageBonus + potionDamage -
      effectiveArmor +
      strengthToughnessModifier
    return Math.max(0, Math.min(5, impact))
  }

  // Returns the current effective armor.
  getEffectiveArmor(defender, damageType, hitLocation = null) {
    const adjustments = {
      cloth: { cutting: -1 },
      leather: { cutting: -1, puncturing: 1, bludgeoning: -1 },
      cuirBouilli: { bludgeoning: 1 },
      scale: { cutting: 1, puncturing: -1 },
      lightMail: { cutting: 1, bludgeoning: -1 },
      mail: { cutting: 1, bludgeoning: -1 },
      doubledMail: { cutting: 1, puncturing: 1, bludgeoning: -1 },
      bandedMail: { cutting: 1, puncturing: 1 },
      plate: { cutting: 1, bludgeoning: 1 },
      heavyPlate: { cutting: 1, bludgeoning: 1 },
    }
    // Uses exact purchased body-part protection first, then the matching broad zone, and finally legacy whole-body armor.
    const exactArmor = hitLocation?.armorPart ? defender.armorDetailedCoverage?.[hitLocation.armorPart] : null
    const zoneArmor = hitLocation?.bodyZone ? defender.armorCoverage?.[hitLocation.bodyZone] : null
    if (hitLocation?.armorPart && defender.armorDetailedCoverage) {
      const armorValue = Number.isFinite(exactArmor?.value) ? exactArmor.value : 0
      const armorMaterial = exactArmor?.material || 'none'
      return Math.max(0, armorValue + (adjustments[armorMaterial]?.[damageType] || 0))
    }
    const armorValue = Number.isFinite(zoneArmor?.value) ? zoneArmor.value : defender.armor
    const armorMaterial = zoneArmor?.material || defender.armorMaterial
    return Math.max(0, armorValue + (adjustments[armorMaterial]?.[damageType] || 0))
  }

  // Applies wound to the affected character or combatant.
  applyWound(target, severity, source, zone = 'zoneIII', damageType = 'cutting', impact = {}, rolledLocation = null) {
    const hitLocation = rolledLocation || this.rollWoundLocation(zone)
    const location = hitLocation.location
    if (severity === 0) {
      this.addLog(`${source} only grazes ${target.name}'s ${location.toLowerCase()}.`)
      return
    }
    const effects = this.getWoundEffects(target, severity, damageType, hitLocation.bodyZone)
    // Records the declared zone, exact d6 result, and armor region so repeated wounds can be grouped by their true location.
    const wound = {
      severity,
      location,
      locationKey: hitLocation.locationKey,
      locationRoll: hitLocation.roll,
      zone,
      bodyZone: hitLocation.bodyZone,
      armorPart: hitLocation.armorPart,
      damageType,
      ...effects,
    }
    target.wounds.push(wound)
    this.recalculateConditionTotals(target)
    this.applyImmediateShock(target, wound)
    this.addLog(
      `${source} targets ${TARGET_ZONES[zone]?.name || zone}; location roll ${hitLocation.roll} strikes ${target.name}'s ${location.toLowerCase()} for a Level ${severity} ${damageType} wound (Shock ${wound.shock}, Pain ${wound.pain}, BL ${wound.bloodLoss}).`,
      'wound'
    )

    if (target.pool <= 0 || hitLocation.bodyZone === 'legs' && severity >= 3 || hitLocation.bodyZone === 'head' && severity >= 3) {
      this.resolveKnockdown(target, Math.max(1, impact.margin || severity), Boolean(impact.mass), wound)
    }
    if (hitLocation.bodyZone === 'head' && (severity >= 2 || damageType === 'bludgeoning')) this.resolveKnockout(target, severity)

    if (severity >= 5) {
      target.conditions.dead = true
      target.defeated = true
      this.addLog(`${target.name} can no longer continue.`, 'important')
    }
    // Defeat fear resolves immediately so later enemies in the same simultaneous exchange can lose their scheduled actions by fleeing.
    if (target.defeated && this.isEnemyCombatant(target)) this.resolveEnemyDefeatFear(target)
    // A surviving enemy immediately tests fear whenever this newly recorded wound is Level 2 or worse.
    if (severity >= 2 && this.isEnemyCombatant(target) && !target.defeated && !target.fled) {
      this.resolveEnemyWoundFear(target)
    }
  }

  // Rolls a d6 on the declared rulebook zone and returns the exact body location struck.
  rollWoundLocation(zone) {
    const declaredZone = TARGET_ZONES[zone] || TARGET_ZONES.zoneIII
    const roll = Math.floor(Math.random() * 6) + 1
    const result = declaredZone.locations[roll - 1]
    // Zone III redirects an arm result to Zone VII, which requires a second location roll in the cutting table.
    if (result.redirect) return this.rollWoundLocation(result.redirect)
    const side = result.sided ? (Math.random() < 0.5 ? 'Left' : 'Right') : ''
    const location = `${side}${side ? ' ' : ''}${result.location}`
    return {
      ...result,
      location,
      locationKey: `${result.armorPart}:${side || 'center'}`,
      roll,
      zone,
    }
  }

  // Returns the current wound effects.
  getWoundEffects(target, severity, damageType, zone) {
    const shockByLevel = [0, 3, 5, 7, 9, 12]
    const painByLevel = [0, 2, 4, 6, 8, 10]
    const bloodLossByType = {
      cutting: [0, 0, 1, 3, 6, 10],
      puncturing: [0, 0, 2, 5, 8, 12],
      bludgeoning: [0, 0, 0, 1, 3, 6],
    }
    const zoneShock = zone === 'head' ? 2 : zone === 'torso' ? 1 : 0
    const typeShock = damageType === 'bludgeoning' ? 1 : 0
    const effectiveWillpower = target.conditions ? this.getConditionTrait(target, 'willpower') : target.willpower
    const shock = Math.max(0, shockByLevel[severity] + zoneShock + typeShock - Math.floor(effectiveWillpower / 2))
    const pain = Math.max(0, painByLevel[severity] + (zone === 'head' ? 1 : 0) - effectiveWillpower - (target.painResistance || 0))
    const bloodLoss = (bloodLossByType[damageType]?.[severity] ?? severity) * (target.bleeder ? 2 : 1)
    return { shock, rawPain: painByLevel[severity], pain, bloodLoss }
  }

  // Recalculates condition totals after equipment, wounds, or conditions change.
  recalculateConditionTotals(combatant) {
    const painByLocation = new Map(), bloodByLocation = new Map()
    combatant.wounds.forEach((wound) => {
      // Only the highest value is retained when several wounds strike the same exact body location.
      const area = wound.locationKey || wound.location || wound.zone
      painByLocation.set(area, Math.max(painByLocation.get(area) || 0, wound.pain || 0))
      bloodByLocation.set(area, Math.max(bloodByLocation.get(area) || 0, wound.bloodLoss || 0))
    })
    combatant.conditions.pain = Array.from(painByLocation.values()).reduce((sum, value) => sum + value, 0)
    combatant.conditions.bleeding = Array.from(bloodByLocation.values()).reduce((sum, value) => sum + value, 0)
  }

  // Applies immediate shock to the affected character or combatant.
  applyImmediateShock(target, wound) {
    const woundLocation = wound.locationKey || wound.location || wound.zone
    const reappliedShock = Math.max(...target.wounds.filter((entry) => (entry.locationKey || entry.location || entry.zone) === woundLocation).map((entry) => entry.shock || 0))
    const before = target.pool
    target.conditions.shock = reappliedShock
    target.pool = Math.max(0, target.pool - reappliedShock)
    target.conditions.pendingShock = Math.max(target.conditions.pendingShock || 0, reappliedShock - before)
    this.addLog(`${target.name} immediately loses ${Math.min(before, reappliedShock)} CP to Shock${reappliedShock > before ? `; ${reappliedShock - before} carries into the next round` : ''}.`)
  }

  // Resolves knockdown and applies its result to every affected combatant.
  resolveKnockdown(target, margin, mass, wound) {
    const targetNumber = Math.min(10, Math.max(4, mass ? margin * 3 : margin * 2, wound.shock || 0))
    const knockdownDice = this.getConditionTrait(target, 'knockdown')
    const roll = this.rollPool(knockdownDice, targetNumber)
    if (roll.successes === 0) {
      target.conditions.knockedDown = true
      this.addLog(`${target.name} fails Knockdown ${knockdownDice} vs TN ${targetNumber} and falls.`, 'wound')
    } else this.addLog(`${target.name} remains standing with ${roll.successes} Knockdown success${roll.successes === 1 ? '' : 'es'}.`)
  }

  // Resolves knockout and applies its result to every affected combatant.
  resolveKnockout(target, severity) {
    const targetNumber = Math.min(10, 6 + severity)
    const knockoutDice = this.getConditionTrait(target, 'knockout')
    const roll = this.rollPool(knockoutDice, targetNumber)
    if (roll.successes === 0) {
      target.conditions.unconsciousRounds = Math.floor(Math.random() * 10) + 1
      target.defeated = true
      this.addLog(`${target.name} fails Knockout ${knockoutDice} vs TN ${targetNumber} and is unconscious for ${target.conditions.unconsciousRounds} rounds.`, 'important')
    } else this.addLog(`${target.name} resists knockout with ${roll.successes} success${roll.successes === 1 ? '' : 'es'}.`)
  }

  // Adds the severity of all current wounds to produce one overall wound total.
  totalWounds(combatant) {
    return combatant.wounds.reduce((total, wound) => total + wound.severity, 0)
  }

  // Returns the current activation cost.
  getActivationCost(combatant, action, baseCost, maneuver = null) {
    const profile = MELEE_WEAPONS[combatant.weapon].profile || WEAPON_PROFILE_KEYS[combatant.weapon]
    return FLOWER_MANEUVER_COSTS[profile]?.[maneuver?.key] ?? baseCost
  }

  // Spends pool without allowing the value to fall below zero.
  spendPool(combatant, requestedDice, activationCost) {
    if (combatant.pool <= activationCost) {
      combatant.pool = Math.max(0, combatant.pool - activationCost)
      return 0
    }

    const dice = Math.max(
      0,
      Math.min(Math.floor(requestedDice), combatant.pool - activationCost)
    )
    combatant.pool -= dice + activationCost
    return dice
  }

  // Randomly determines pool for this encounter.
  rollPool(count, target) {
    const dice = []
    let successes = 0
    for (let index = 0; index < count; index++) {
      const roll = Math.floor(Math.random() * 10) + 1
      dice.push(roll)
      if (roll >= target) successes++
    }
    return { dice, successes }
  }

  // Keeps target within its valid minimum and maximum.
  clampTarget(target) {
    return Math.max(4, Math.min(9, target))
  }

  // Applies bleeding, fatigue, defeat checks, and exchange progression after an attack exchange.
  afterExchange() {
    ;[this.player, this.enemy].forEach((combatant) => {
      if (combatant.guardBeaten > 0) combatant.guardBeaten--
    })
    if (this.player.defeated) {
      this.endBattle('defeat')
      return
    }

    if (this.enemy.defeated) {
      if (!this.advanceToNextEnemy()) {
        this.endBattle('victory')
        return
      }
      this.finishResolution()
      return
    }

    if (this.pauseAfterExchange) {
      this.round++
      this.beginRound()
      this.addLog('A new bout begins after the pause.')
    } else if (this.exchange === 1) {
      this.exchange = 2
      this.boutOpeningExchange = false
      this.player.stance = 'noStance'
      this.player.attitude = 'neutral'
      this.enemy.stance = 'noStance'
      this.enemy.attitude = 'neutral'
      this.addLog(
        `Exchange 2: ${
          this.initiative === 'player' ? this.player.name : this.enemy.name
        } has initiative.`
      )
    } else {
      this.round++
      this.beginRound()
    }

    if (this.player.defeated) {
      this.endBattle('defeat')
      return
    }
    if (this.enemy.defeated) {
      if (!this.advanceToNextEnemy()) this.endBattle('victory')
      else this.finishResolution()
      return
    }

    this.finishResolution()
  }

  // Advances to next enemy after the current step is resolved.
  advanceToNextEnemy() {
    this.rollLootForEnemy(this.enemy)
    this.enemy.actor.classList.remove('active')
    this.enemy.actor.classList.add('defeated')
    this.enemyIndex++
    if (this.enemyIndex >= this.enemies.length) return false

    this.enemy = this.enemies[this.enemyIndex]
    this.enemyActor = this.enemy.actor
    this.enemyActor.classList.add('active')
    this.orientation = 0
    this.reachAdvantage = this.getInitialReachAdvantage()
    this.round++
    this.pauseAfterExchange = true
    this.beginRound()
    this.addLog(
      `${this.enemy.name} steps forward with a Combat Pool of ${this.enemy.maxPool}.`,
      'important'
    )
    this.animateBanner(`${this.getRemainingEnemyCount()} opponents remain`)
    return true
  }

  // Finishes resolution and moves to the next game state.
  finishResolution() {
    this.isResolving = false
    this.actionButton.disabled = false
    this.updateInterface()
  }

  // Resolves enemy free attacks and applies its result to every affected combatant.
  resolveEnemyFreeAttacks(reason) {
    this.isResolving = true
    this.actionButton.disabled = true
    this.addLog(reason, 'important')
    const playerPlan = this.getPlayerPlan()
    this.getActiveEnemies()
      .sort((left, right) => this.getConditionTrait(right, 'reflex') - this.getConditionTrait(left, 'reflex'))
      .forEach((enemy) => {
        if (this.player.defeated) return
        this.activateEnemy(enemy)
        const enemyPlan = this.getEnemyPlan(enemy)
        enemyPlan.attackDice = Math.min(enemy.pool, 6)
        this.resolveAttack(enemy, this.player, enemyPlan, playerPlan)
        enemy.pairInitiative = this.initiative === 'player' ? 'player' : 'enemy'
        this.storeActiveEnemyState()
      })
    this.afterGroupExchange()
  }

  // Opens battle inventory with the latest character data.
  openBattleInventory() {
    if (!this.isActive || this.isResolving || this.battleEnded) return
    this.renderBattleInventory()
    this.inventoryPopup.hidden = false
  }

  // Closes battle inventory and returns to the previous screen.
  closeBattleInventory() {
    this.inventoryPopup.hidden = true
  }

  // Updates the visible battle inventory using the latest game state.
  renderBattleInventory() {
    const records = Array.isArray(this.character?.inventoryItems) ? this.character.inventoryItems : []
    this.inventoryList.replaceChildren()
    this.inventoryWealth.textContent = `Coin purse: ${this.character?.remainingWealth || '0'}`
    if (!records.length) {
      const empty = document.createElement('p')
      empty.className = 'battle-inventory-row'
      empty.textContent = 'Inventory is empty.'
      this.inventoryList.appendChild(empty)
      return
    }
    records.forEach((record) => {
      const row = document.createElement('div')
      row.className = 'battle-inventory-row'
      const name = document.createElement('span')
      name.textContent = `${record.quantity} × ${record.name}${record.equipped ? ' — Equipped' : ''}`
      const use = document.createElement('button')
      use.type = 'button'
      use.className = 'battle-button secondary'
      use.textContent = 'Use'
      use.disabled = !ITEM_USE_EFFECTS[record.id] && !record.potionEffects
      use.addEventListener('click', () => this.useBattleInventoryItem(record.id))
      row.append(name, use)
      this.inventoryList.appendChild(row)
    })
  }

  // Uses the selected carried item during battle and immediately refreshes the character and inventory displays.
  useBattleInventoryItem(id) {
    if (this.isResolving || this.battleEnded) return
    const record = this.character?.inventoryItems?.find((entry) => entry.id === id)
    const effect = ITEM_USE_EFFECTS[id]
    if (!record || !effect) return
    if (effect.healing && !this.player.wounds.length) {
      this.inventoryNotice.textContent = 'There is no wound for the healing herbs to treat.'
      return
    }
    if (effect.fatigueRecovery) this.player.conditions.fatigue = Math.max(0, this.player.conditions.fatigue - effect.fatigueRecovery)
    if (effect.condition && !this.player.conditions.other.includes(effect.condition)) this.player.conditions.other.push(effect.condition)
    if (effect.stimulant) {
      this.player.conditions.pain = 0
      this.player.conditions.shock = 0
      this.player.conditions.pendingShock = 0
      this.player.conditions.fatigue = 0
      this.player.conditions.unconsciousRounds = 0
      this.player.wounds.forEach((wound) => {
        wound.pain = 0
        wound.painSuppressed = true
      })
    }
    if (effect.healing) {
      const wound = this.player.wounds.reduce((highest, entry) => entry.severity > highest.severity ? entry : highest)
      wound.severity = Math.max(0, wound.severity - 1)
      if (wound.severity === 0) this.player.wounds = this.player.wounds.filter((entry) => entry !== wound)
      else Object.assign(wound, this.getWoundEffects(this.player, wound.severity, wound.damageType || 'cutting', wound.bodyZone || (['head', 'torso', 'arms', 'legs'].includes(wound.zone) ? wound.zone : TARGET_ZONES[wound.zone]?.guardZone || 'torso')))
    }
    if (effect.consume) record.quantity--
    if (record.quantity <= 0) this.character.inventoryItems = this.character.inventoryItems.filter((entry) => entry !== record)
    this.recalculateConditionTotals(this.player)
    this.character.wounds = this.player.wounds.map((wound) => ({ ...wound }))
    this.character.conditions = { ...this.player.conditions, other: [...(this.player.conditions.other || [])] }
    this.character.equipmentIds = this.character.inventoryItems.filter((item) => item.equipped).map((item) => item.id)
    this.character.inventory = this.character.inventoryItems.map((item) => `${item.quantity} × ${item.name}${item.equipped ? ' (equipped)' : ''}`)
    try {
      localStorage.setItem('tros-character', JSON.stringify(this.character))
    } catch (error) {
      console.warn('Battle inventory changes could not be saved locally.', error)
    }
    this.inventoryNotice.textContent = effect.message
    this.addLog(`${this.player.name} uses ${record.name}.`, 'important')
    this.renderBattleInventory()
    this.updateInterface()
  }

  // Attempts escape and reports whether it succeeds.
  attemptEscape() {
    if (!this.isActive || this.isResolving || this.battleEnded) return
    const enemies = this.getActiveEnemies()
    const averageReflex = enemies.reduce((sum, enemy) => sum + this.getConditionTrait(enemy, 'reflex'), 0) / Math.max(1, enemies.length)
    const chance = Math.max(
      0.1,
      Math.min(
        0.8,
        0.45 + (this.getConditionTrait(this.player, 'reflex') - averageReflex) * 0.04 -
          Math.max(0, enemies.length - 1) * 0.08 - this.player.conditions.fatigue * 0.03
      )
    )
    if (Math.random() < chance) {
      this.addLog(`You escape the group (${Math.round(chance * 100)}% chance).`, 'important')
      this.endBattle('fled')
      return
    }
    this.resolveEnemyFreeAttacks(`Escape fails (${Math.round(chance * 100)}% chance); every engaged opponent gets an opening.`)
  }

  // Attempts flee and reports whether it succeeds.
  attemptFlee() {
    if (!this.isActive || this.isResolving || this.battleEnded) return

    const playerAdvantage = Math.max(0, this.orientation)
    const enemyAdvantage = Math.max(0, -this.orientation)
    const groupPenalty = Math.max(0, this.getRemainingEnemyCount() - 1) * 0.08
    const chance = Math.max(
      0.08,
      0.42 + playerAdvantage * 0.12 - enemyAdvantage * 0.1 - groupPenalty
    )
    if (Math.random() < chance) {
      this.addLog(
        'You disengage successfully. Choose a new weapon, stance, and initiative declaration before re-engaging.',
        'important'
      )
      this.round++
      this.pauseAfterExchange = true
      this.beginRound()
      this.canReequip = true
      this.updateInterface()
      return
    }

    this.resolveEnemyFreeAttacks('The disengagement fails; every engaged opponent presses the opening.')
  }

  // Ends battle and records its outcome.
  endBattle(outcome) {
    this.battleEnded = true
    this.pendingOutcome = outcome
    this.isResolving = false
    this.setControlsDisabled(true)
    this.actionButton.disabled = false
    this.actionButton.textContent = 'Return to the road'
    this.fleeButton.disabled = true
    this.escapeButton.disabled = true

    if (this.character) {
      if (outcome === 'victory' && !this._craftSAAwarded) {
        const sa = [...(this.character.spiritualAttributes || [])].sort((a,b) => a.value-b.value).find(a => a.value < 5)
        if (sa) { sa.value++; this._craftSAAwarded = true; this.addLog(`Victory grants 1 ${sa.type} SA for future advancement.`, 'important') }
      }
      if (['victory', 'fled'].includes(outcome) && this.defeatedEnemyCount > 0) this.applyLootRewards()
      this.character.wounds = this.player.wounds.map((wound) => ({ ...wound }))
      this.character.conditions = { ...this.player.conditions, other: [...(this.player.conditions.other || [])] }
      try {
        localStorage.setItem('tros-character', JSON.stringify(this.character))
      } catch (error) {
        console.warn('Updated wounds could not be saved locally.', error)
      }
    }

    if (outcome === 'victory') this.animateBanner('Victory')
    if (outcome === 'defeat') { this.animateBanner('Defeated'); this.showDefeatPopup() }
    if (outcome === 'fled') this.animateBanner('Escaped')
    if (['victory', 'fled'].includes(outcome) && this.defeatedEnemyCount > 0) this.showLootPopup()
    this.updateInterface()
  }

  // Shows whether the player died or was knocked out and explains what will happen next.
  showDefeatPopup() {
    const conditions = this.player.conditions
    const died = conditions.dead || conditions.coma || conditions.currentHealth <= 0
    this.defeatResolution = died ? 'death' : 'knockout'
    this.defeatTitle.textContent = died ? 'You Died' : 'Knocked Out'
    this.defeatMessage.textContent = died
      ? 'Your story has ended. Your current Insight becomes bonus Character Points for the next character.'
      : 'You awaken at the forest clearing. Your knockout is cleared, but half your coins are gone.'
    this.defeatContinueButton.textContent = died ? 'Return to Character Builder' : 'Wake at Spawn'
    this.actionButton.disabled = true
    this.defeatPopup.hidden = false
  }

  // Randomly determines loot for enemy for this encounter.
  rollLootForEnemy(enemy) {
    if (enemy.lootRolled) return
    enemy.lootRolled = true
    this.defeatedEnemyCount++
    if (Math.random() >= 0.20) return

    const quantityRoll = Math.random()
    const rewardCount = quantityRoll < 0.01
      ? 5 + Math.floor(Math.random() * 6)
      : quantityRoll < 0.04 ? 4
        : quantityRoll < 0.09 ? 3
          : quantityRoll < 0.19 ? 2 : 1

    for (let index = 0; index < rewardCount; index++) {
      if (Math.random() < 0.65) {
        const item = EQUIPMENT_CATALOG[Math.floor(Math.random() * EQUIPMENT_CATALOG.length)]
        this.lootItems.set(item.id, (this.lootItems.get(item.id) || 0) + 1)
      } else {
        this.lootCopper += Math.floor(Math.random() * 101)
      }
    }
  }

  // Applies loot rewards to the affected character or combatant.
  applyLootRewards() {
    if (this.lootApplied || !this.character) return
    this.lootApplied = true
    this.character.inventoryItems = Array.isArray(this.character.inventoryItems) ? this.character.inventoryItems : []
    this.lootItems.forEach((quantity, id) => {
      const item = EQUIPMENT_BY_ID[id]
      const existing = this.character.inventoryItems.find((record) => record.id === id)
      if (existing) existing.quantity += quantity
      else this.character.inventoryItems.push({ id, name: item.name, quantity, armorId: item.armorId, equipped: false })
    })
    this.character.wealthTotal = (Number.isFinite(this.character.wealthTotal) ? this.character.wealthTotal : parseCurrency(this.character.remainingWealth)) + this.lootCopper * 4
    this.character.remainingWealth = formatCurrency(this.character.wealthTotal)
    this.character.equipmentIds = this.character.inventoryItems.filter((item) => item.equipped).map((item) => item.id)
    this.character.inventory = this.character.inventoryItems.map((item) => `${item.quantity} × ${item.name}${item.equipped ? ' (equipped)' : ''}`)
  }

  // Shows every item and coin awarded after the encounter before returning to the map.
  showLootPopup() {
    this.lootList.replaceChildren()
    this.lootItems.forEach((quantity, id) => {
      const line = document.createElement('li')
      line.textContent = `${quantity} × ${EQUIPMENT_BY_ID[id].name}`
      this.lootList.appendChild(line)
    })
    if (this.lootCopper > 0) {
      const line = document.createElement('li')
      line.textContent = `${formatCurrency(this.lootCopper * 4)} in coins (${this.lootCopper} copper)`
      this.lootList.appendChild(line)
    }
    if (!this.lootList.children.length) {
      const line = document.createElement('li')
      line.textContent = 'No loot was recovered.'
      this.lootList.appendChild(line)
    }
    this.lootPopup.hidden = false
  }

  // Closes battle and returns to the previous screen.
  closeBattle() {
    this.inventoryPopup.hidden = true
    this.lootPopup.hidden = true
    this.defeatPopup.hidden = true
    this.screen.hidden = true
    this.screen.setAttribute('aria-hidden', 'true')
    this.isActive = false
    this.battleEnded = false
    this.pendingOutcome = null
    this.defeatResolution = null
    this.canReequip = false
    this.setControlsDisabled(false)
    this.actionButton.textContent = 'Resolve exchange'
    this.onEnd()
  }

  // Sets controls disabled to the supplied value.
  setControlsDisabled(disabled) {
    ;[
      this.weaponSelect,
      this.stanceSelect,
      this.intentSelect,
      this.opponentSelect,
      this.offenseSelect,
      this.defenseSelect,
      this.targetSelect,
      this.buyInitiativeInput,
      this.attackDiceInput,
      this.defenseDiceInput,
    ].forEach((element) => {
      element.disabled = disabled
    })
    this.inventoryOpenButton.disabled = disabled
    this.weaponSelect.disabled = disabled || !this.canReequip
    this.escapeButton.disabled = disabled
  }

  // Updates interface to match the current frame or game state.
  updateInterface() {
    if (!this.player || !this.enemy) return
    this.configureManeuverOptions()

    this.playerName.textContent = this.player.name
    this.playerPool.textContent = `${this.player.pool} / ${this.player.maxPool}`
    this.renderEnemySummary()
    const displayedPlayerStance = this.boutOpeningExchange ? this.stanceSelect.value : this.player.stance
    this.playerStance.textContent = MELEE_STANCES[displayedPlayerStance].name
    this.orientationText.textContent = ORIENTATION_NAMES[this.orientation]
    this.renderWounds(this.playerWounds, this.player)

    const maxDice = Math.max(0, this.player.pool)
    this.attackDiceInput.max = maxDice
    this.defenseDiceInput.max = maxDice

    // A single Combat Pool is shared by offense and defense across both
    // Exchanges. Only the commitment for the character's current role is
    // legal; the other commitment is held at zero so the interface cannot
    // imply that two full pools are available.
    const playerIsAttacking = this.needsInitiativeDeclaration
      ? this.intentSelect.value !== 'blue'
      : this.getSelectedEnemy()?.pairInitiative === 'player'
    const activeDiceInput = playerIsAttacking
      ? this.attackDiceInput
      : this.defenseDiceInput
    const inactiveDiceInput = playerIsAttacking
      ? this.defenseDiceInput
      : this.attackDiceInput
    inactiveDiceInput.value = 0
    if (maxDice <= 0) {
      activeDiceInput.value = 0
    } else {
      const currentCommitment = Number(activeDiceInput.value)
      activeDiceInput.value = Math.min(
        maxDice,
        currentCommitment > 0 ? currentCommitment : Math.max(1, Math.ceil(maxDice / 2))
      )
    }
    activeDiceInput.disabled = this.battleEnded || maxDice <= 0
    inactiveDiceInput.disabled = true
    this.attackDiceLabel.textContent = playerIsAttacking
      ? 'Attack commitment (active)'
      : 'Attack commitment (inactive)'
    this.defenseDiceLabel.textContent = playerIsAttacking
      ? 'Defense commitment (inactive)'
      : 'Defense commitment (active)'
    this.attackDiceValue.textContent = this.attackDiceInput.value
    this.defenseDiceValue.textContent = this.defenseDiceInput.value

    if (!this.battleEnded) {
      if (this.exchange === 1) {
        this.actionButton.textContent = 'Reveal initiative & resolve'
      } else {
        this.actionButton.textContent =
          this.getSelectedEnemy()?.pairInitiative === 'player'
            ? 'Resolve your attack'
            : 'Resolve group exchange'
      }
    }

    this.intentSelect.disabled = !this.needsInitiativeDeclaration || this.battleEnded
    this.opponentSelect.disabled = this.battleEnded || this.isResolving || !this.getActiveEnemies().length
    this.inventoryOpenButton.disabled = this.battleEnded || this.isResolving
    this.weaponSelect.disabled = this.battleEnded || !this.canReequip || !this.boutOpeningExchange
    this.stanceSelect.disabled = this.battleEnded || !this.boutOpeningExchange
    this.offenseSelect.disabled = this.battleEnded || !playerIsAttacking
    this.targetSelect.disabled = this.battleEnded || !playerIsAttacking
    this.defenseSelect.disabled = this.battleEnded || playerIsAttacking
    this.buyInitiativeInput.disabled = this.battleEnded || this.exchange !== 2 || this.getSelectedEnemy()?.pairInitiative !== 'enemy'
    const weapon = MELEE_WEAPONS[this.weaponSelect.value]
    const offense = OFFENSIVE_MANEUVERS[this.offenseSelect.value]
    const defense = DEFENSIVE_MANEUVERS[this.defenseSelect.value]
    const attackTarget = this.getAttackTarget(weapon, offense)
    const damageModifier = this.getDamageModifier(weapon, offense, this.enemy)
    const strengthToughnessModifier = getStrengthToughnessDamageModifier(
      this.player.strength,
      this.enemy.toughness
    )
    const offenseCost = this.getActivationCost(this.player, 'attack', offense.activationCost, offense)
    const defenseCost = this.getActivationCost(this.player, 'defense', defense.activationCost, defense)
    this.rulesNote.textContent = `${weapon.name}: ${offense.name} ATN ${attackTarget}, DTN ${
      weapon.defenseTarget
    }, DR Strength ${damageModifier >= 0 ? '+' : ''}${
      damageModifier
    }, reach ${weapon.reach}. ${offense.name} costs ${
      offenseCost
    } CP; ${defense.name} costs ${defenseCost} CP. Strength vs. Toughness ${
      strengthToughnessModifier >= 0 ? '+' : ''
    }${strengthToughnessModifier} damage. ${
      this.player.damageRules === 'core' ? 'Core damage.' : 'Companion WDF damage.'
    } One shared CP is spent across both Exchanges; it refreshes to the exact builder-derived value each round, and only the active commitment above is deducted.`

    if (this.battleEnded) {
      const outcomeLabels = {
        victory: 'Victory',
        defeat: 'Defeated',
        fled: 'Escaped',
      }
      this.banner.textContent = outcomeLabels[this.pendingOutcome]
    } else {
      this.banner.textContent = `Round ${this.round} · Exchange ${this.exchange} · ${
        this.initiative
          ? `${this.initiative === 'player' ? 'You have' : 'Enemy has'} initiative`
          : 'Declare initiative'
      }`
    }
  }

  // Updates the visible enemy summary using the latest game state.
  renderEnemySummary() {
    const remaining = this.getRemainingEnemyCount()
    this.enemyCount.textContent = `${remaining} ${remaining === 1 ? 'Opponent' : 'Opponents'}`
    this.enemyList.replaceChildren()

    this.enemies.forEach((enemy) => {
      const entry = document.createElement('section')
      const maxWound = enemy.wounds.reduce(
        (highest, wound) => Math.max(highest, wound.severity),
        0
      )
      entry.className = `enemy-summary-entry${
        enemy === this.enemy && !enemy.defeated && !enemy.fled ? ' active' : ''
      }${maxWound > 0 ? ' wounded' : ''}${enemy.defeated ? ' defeated' : ''}${enemy.fled ? ' fled' : ''}`
      if (!enemy.defeated && !enemy.fled) {
        entry.tabIndex = 0
        entry.addEventListener('click', () => {
          this.opponentSelect.value = enemy.id
          this.activateEnemy(enemy)
          this.updateInterface()
        })
      }

      const name = document.createElement('h2')
      name.className = 'enemy-summary-name'
      name.textContent = enemy.name

      const wound = document.createElement('span')
      wound.className = 'enemy-summary-wound'
      wound.textContent = enemy.fled
        ? `Fled â€” Wound Level ${maxWound || 0}`
        : enemy.defeated
        ? `Defeated — Wound Level ${maxWound || 1}`
        : maxWound > 0
          ? `Wounded — Level ${maxWound}`
          : 'Unwounded'

      entry.append(name, wound)
      this.enemyList.appendChild(entry)
    })
  }

  // Updates the visible wounds using the latest game state.
  renderWounds(container, combatant) {
    container.replaceChildren()
    if (combatant.wounds.length === 0) {
      const empty = document.createElement('span')
      empty.className = 'wound-none'
      empty.textContent = 'Unwounded'
      container.appendChild(empty)
      return
    }

    combatant.wounds.forEach((wound) => {
      const pip = document.createElement('span')
      pip.className = 'wound-pip'
      pip.title = `Level ${wound.severity} ${wound.damageType} wound - ${wound.location}`
      pip.style.transform = `scale(${0.72 + wound.severity * 0.08})`
      container.appendChild(pip)
    })
  }

  // Adds log to the current interface or record.
  addLog(message, className = '') {
    const entry = document.createElement('p')
    entry.textContent = message
    if (className) entry.className = className
    this.logElement.appendChild(entry)
    this.logElement.scrollTop = this.logElement.scrollHeight
  }

  // Animates the battle announcement banner during the encounter transition.
  animateBanner(message) {
    this.banner.textContent = message
  }

  // Animates the player and enemy figures so attacks and reactions remain visually active.
  animateActors(attackerId, defenderId = null) {
    const attacker = attackerId === 'player' ? this.playerActor : this.enemyActor
    attacker.classList.add('attacking')
    window.setTimeout(() => attacker.classList.remove('attacking'), 180)

    if (defenderId) {
      const defender =
        defenderId === 'player' ? this.playerActor : this.enemyActor
      window.setTimeout(() => defender.classList.add('hit'), 90)
      window.setTimeout(() => defender.classList.remove('hit'), 260)
    }
  }
}


