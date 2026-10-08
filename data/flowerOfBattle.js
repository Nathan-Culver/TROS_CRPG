/**
 * Lists Flower of Battle weapons, prices, armor, damage values, reach, and the maneuver profiles used by combat.
 */

// Rules data transcribed from The Flower of Battle. Damage values are the
// modifier applied to Strength; reach uses Hand=1, Short=2, Medium=3,
// Long=4, Very Long=5, and Extremely Long=6.
// Creates a Flower of Battle melee-weapon record with reach, damage, grip, and maneuver-profile rules.
const fobMeleeWeapon = (name, stats) => {
  const modifiers = [stats.cutDamage, stats.thrustDamage, stats.bashDamage].filter(Number.isFinite)
  const attackTargets = [stats.cutTarget, stats.thrustTarget, stats.bashTarget].filter(Number.isFinite)
  return {
    name,
    kind: 'melee',
    attackTarget: Math.min(...attackTargets),
    defenseTarget: stats.defenseTarget,
    damageModifier: modifiers.length ? Math.max(...modifiers) : 0,
    damageType: Number.isFinite(stats.cutDamage) ? 'cutting' : Number.isFinite(stats.thrustDamage) ? 'puncturing' : 'bludgeoning',
    damageFactor: 3,
    reach: stats.reach,
    canCut: Number.isFinite(stats.cutTarget),
    canThrust: Number.isFinite(stats.thrustTarget),
    canBash: Number.isFinite(stats.bashTarget),
    ...stats,
  }
}

// Creates a Flower of Battle ranged-weapon record with missile damage and ammunition rules.
const fobRangedWeapon = (name, attackTarget, damageModifier, damageType = 'puncturing', extra = {}) => ({
  name, kind: 'ranged', attackTarget, defenseTarget: 9, damageModifier,
  damageType, damageFactor: 3, reach: 0, ...extra,
})

// Stores the flower weapons values used by the rest of this file.
const FLOWER_WEAPONS = {
  // Daggers and shortswords
  akinakes: fobMeleeWeapon('Akinakes', { cutTarget: 7, thrustTarget: 6, defenseTarget: 8, cutDamage: -1, thrustDamage: 0, drawCutModifier: 1, reach: 2, profile: 'dagger' }),
  broadDagger: fobMeleeWeapon('Broad Dagger', { cutTarget: 7, thrustTarget: 7, defenseTarget: 7, cutDamage: -1, thrustDamage: 1, drawCutModifier: 1, reach: 2, profile: 'dagger' }),
  pugio: fobMeleeWeapon('Pugio', { cutTarget: 7, thrustTarget: 6, defenseTarget: 8, cutDamage: -2, thrustDamage: 1, drawCutModifier: 2, reach: 2, profile: 'dagger' }),
  cutlass: fobMeleeWeapon('Cutlass / Dussack', { cutTarget: 6, thrustTarget: 7, defenseTarget: 7, cutDamage: 0, thrustDamage: -1, drawCutModifier: 1, reach: 2, profile: 'cutThrust' }),
  dussack: fobMeleeWeapon('Dussack', { cutTarget: 6, thrustTarget: 7, defenseTarget: 7, cutDamage: 0, thrustDamage: -1, drawCutModifier: 1, reach: 2, profile: 'cutThrust' }),
  smallDagger: fobMeleeWeapon('Small Dagger', { cutTarget: 9, thrustTarget: 7, defenseTarget: 9, cutDamage: -3, thrustDamage: -1, drawCutModifier: 2, reach: 1, profile: 'dagger' }),
  largeDagger: fobMeleeWeapon('Large Dagger', { cutTarget: 8, thrustTarget: 6, defenseTarget: 8, cutDamage: -2, thrustDamage: 0, drawCutModifier: 1, reach: 1, profile: 'dagger' }),
  gladius: fobMeleeWeapon('Gladius', { cutTarget: 6, thrustTarget: 6, defenseTarget: 7, cutDamage: 0, thrustDamage: 1, drawCutModifier: 0, reach: 2, profile: 'cutThrust' }),
  jambiya: fobMeleeWeapon('Jambiya Dagger', { cutTarget: 7, thrustTarget: 8, defenseTarget: 10, cutDamage: -3, thrustDamage: -1, drawCutModifier: 2, reach: 1, profile: 'dagger' }),
  razor: fobMeleeWeapon('Razor', { cutTarget: 8, defenseTarget: 10, cutDamage: -5, drawCutModifier: 5, reach: 1, profile: 'dagger' }),
  smallKnife: fobMeleeWeapon('Small Knife', { cutTarget: 10, thrustTarget: 7, defenseTarget: 10, cutDamage: -4, thrustDamage: -2, drawCutModifier: 2, reach: 1, profile: 'dagger' }),
  largeKnife: fobMeleeWeapon('Large Knife', { cutTarget: 9, thrustTarget: 7, defenseTarget: 10, cutDamage: -3, thrustDamage: 0, drawCutModifier: 2, reach: 2, profile: 'dagger' }),
  kukri: fobMeleeWeapon('Kukri', { cutTarget: 6, thrustTarget: 9, defenseTarget: 8, cutDamage: 0, thrustDamage: 0, drawCutModifier: 1, reach: 1, profile: 'dagger', heavyBlade: true }),
  falcata: fobMeleeWeapon('Falcata', { cutTarget: 6, thrustTarget: 9, defenseTarget: 8, cutDamage: 1, thrustDamage: 0, drawCutModifier: 1, reach: 2, profile: 'cutThrust', heavyBlade: true }),
  kopis: fobMeleeWeapon('Kopis / Yataghan', { cutTarget: 6, thrustTarget: 9, defenseTarget: 8, cutDamage: 2, thrustDamage: 0, drawCutModifier: 1, reach: 3, profile: 'cutThrust', heavyBlade: true }),
  parryingDagger: fobMeleeWeapon('Parrying Dagger', { cutTarget: 8, thrustTarget: 6, defenseTarget: 6, cutDamage: -3, thrustDamage: -1, drawCutModifier: 1, reach: 1, profile: 'dagger' }),
  mainGauche: fobMeleeWeapon('Main Gauche', { thrustTarget: 6, defenseTarget: 5, thrustDamage: -1, reach: 2, profile: 'dagger' }),
  protosword: fobMeleeWeapon('Protosword / Macahuitl', { cutTarget: 6, thrustTarget: 8, defenseTarget: 7, cutDamage: 0, thrustDamage: -1, drawCutModifier: 1, reach: 2, profile: 'cutThrust' }),
  twoHandedProtosword: fobMeleeWeapon('Two-Handed Protosword', { cutTarget: 7, thrustTarget: 9, defenseTarget: 8, cutDamage: 1, thrustDamage: -2, drawCutModifier: 1, reach: 3, profile: 'greatsword', heavyBlade: true }),
  rondel: fobMeleeWeapon('Rondel Dagger', { thrustTarget: 6, defenseTarget: 6, thrustDamage: 0, reach: 1, profile: 'dagger', armorPiercing: 1 }),
  sax: fobMeleeWeapon('Sax', { cutTarget: 6, thrustTarget: 8, defenseTarget: 8, cutDamage: -1, thrustDamage: 0, drawCutModifier: 1, reach: 2, profile: 'dagger' }),
  longSax: fobMeleeWeapon('Long Sax', { cutTarget: 7, thrustTarget: 8, defenseTarget: 7, cutDamage: 0, thrustDamage: 0, drawCutModifier: 0, reach: 3, profile: 'cutThrust' }),
  shortSword: fobMeleeWeapon('Short Sword', { cutTarget: 7, thrustTarget: 5, defenseTarget: 7, cutDamage: -1, thrustDamage: 0, drawCutModifier: 1, reach: 2, profile: 'cutThrust' }),
  stiletto: fobMeleeWeapon('Stiletto', { thrustTarget: 5, defenseTarget: 7, thrustDamage: -2, reach: 2, profile: 'dagger' }),
  poniard: fobMeleeWeapon('Misericorde / Poniard', { thrustTarget: 5, defenseTarget: 10, thrustDamage: -2, reach: 1, profile: 'dagger' }),

  // Eastern swords
  yanMaoDao: fobMeleeWeapon('Yan Mao Dao Sword', { cutTarget: 6, thrustTarget: 8, defenseTarget: 7, cutDamage: 1, thrustDamage: 0, drawCutModifier: 1, reach: 2, profile: 'cutThrust', heavyBlade: true }),
  lieuYeDao: fobMeleeWeapon('Lieu Ye Dao Saber', { cutTarget: 6, thrustTarget: 9, defenseTarget: 8, cutDamage: 0, thrustDamage: -1, drawCutModifier: 2, reach: 3, profile: 'cutThrust', heavyBlade: true }),
  jianSword: fobMeleeWeapon('Jian Sword', { cutTarget: 6, thrustTarget: 7, defenseTarget: 6, cutDamage: 0, thrustDamage: 0, drawCutModifier: 1, reach: 3, profile: 'greatsword' }),
  katana: fobMeleeWeapon('Katana / Tachi', { cutTarget: 5, thrustTarget: 7, defenseTarget: 7, cutDamage: 1, thrustDamage: 0, drawCutModifier: 2, reach: 3, profile: 'cutThrust' }),
  khandar: fobMeleeWeapon('Khandar Sword', { cutTarget: 7, thrustTarget: 9, defenseTarget: 8, cutDamage: 2, thrustDamage: 0, drawCutModifier: -2, reach: 3, profile: 'greatsword', heavyBlade: true }),
  noDachi: fobMeleeWeapon('No-Dachi Sword', { cutTarget: 5, thrustTarget: 7, defenseTarget: 7, cutDamage: 2, thrustDamage: 0, drawCutModifier: 2, reach: 4, profile: 'greatsword', heavyBlade: true }),
  pata: fobMeleeWeapon('Pata Sword', { cutTarget: 8, thrustTarget: 7, defenseTarget: 8, cutDamage: 0, thrustDamage: 2, drawCutModifier: -1, reach: 3, profile: 'cutThrust' }),
  shamshir: fobMeleeWeapon('Shamshir Sword', { cutTarget: 6, thrustTarget: 9, defenseTarget: 7, cutDamage: -1, thrustDamage: 0, drawCutModifier: 2, reach: 3, profile: 'cutThrust' }),
  wakizashi: fobMeleeWeapon('Wakizashi Sword', { cutTarget: 5, thrustTarget: 7, defenseTarget: 7, cutDamage: 0, thrustDamage: 0, drawCutModifier: 1, reach: 2, profile: 'dagger' }),

  // Staves, axes, hammers, spears, pole arms, maces, and flails
  bata: fobMeleeWeapon('Bata / Alpeen', { bashTarget: 6, thrustTarget: 6, defenseTarget: 6, bashDamage: -2, reach: 3, profile: 'polearm' }),
  knobbedCane: fobMeleeWeapon('Knobbed Cane', { bashTarget: 7, thrustTarget: 6, defenseTarget: 6, bashDamage: 0, reach: 3, profile: 'polearm' }),
  quarterstaff: fobMeleeWeapon('Quarterstaff', { bashTarget: 7, thrustTarget: 6, defenseTarget: 6, bashDamage: 0, reach: 4, profile: 'polearm' }),
  shortStaff: fobMeleeWeapon('Shortstaff', { bashTarget: 8, thrustTarget: 6, defenseTarget: 7, bashDamage: 1, reach: 5, profile: 'polearm' }),
  elephantKnife: fobMeleeWeapon('Bhuj / Kutti Elephant Knife', { cutTarget: 8, thrustTarget: 10, defenseTarget: 9, cutDamage: 4, thrustDamage: 0, reach: 3, profile: 'mass', heavyBlade: true }),
  battleAxe: fobMeleeWeapon('Battle Axe', { cutTarget: 8, defenseTarget: 8, cutDamage: 3, thrustDamage: 1, bashDamage: 0, reach: 3, profile: 'mass', heavyBlade: true, canHook: true }),
  beardedAxe: fobMeleeWeapon('Bearded Axe', { cutTarget: 8, defenseTarget: 8, cutDamage: 1, bashDamage: 0, reach: 4, profile: 'mass', heavyBlade: true, canHook: true }),
  handAxe: fobMeleeWeapon('Hand Axe', { cutTarget: 6, defenseTarget: 7, cutDamage: 1, bashDamage: 0, reach: 2, profile: 'mass', heavyBlade: true, canHook: true }),
  kernAxe: fobMeleeWeapon('Kern Axe', { cutTarget: 7, thrustTarget: 8, defenseTarget: 7, cutDamage: 3, thrustDamage: 1, bashDamage: 0, reach: 3, profile: 'mass', heavyBlade: true, canHook: true }),
  sparthAxe: fobMeleeWeapon('Sparth Axe / Bardiche', { cutTarget: 8, thrustTarget: 9, defenseTarget: 8, cutDamage: 4, thrustDamage: 1, bashDamage: 0, reach: 5, profile: 'mass', heavyBlade: true, canHook: true }),
  pollHammer: fobMeleeWeapon('Poll Hammer', { bashTarget: 7, thrustTarget: 8, defenseTarget: 6, bashDamage: 1, thrustDamage: 1, reach: 4, profile: 'poleAxe', armorPiercing: 1 }),
  poleAxe: fobMeleeWeapon('Poll Axe', { cutTarget: 7, bashTarget: 7, thrustTarget: 8, defenseTarget: 6, cutDamage: 0, bashDamage: 1, thrustDamage: 1, reach: 4, profile: 'poleAxe', heavyBlade: true, canHook: true, armorPiercing: 1 }),
  warhammer: fobMeleeWeapon('War Hammer', { bashTarget: 6, thrustTarget: 6, defenseTarget: 8, bashDamage: 1, thrustDamage: 2, reach: 2, profile: 'mass', canHook: true, armorPiercing: 1 }),
  shortSpear: fobMeleeWeapon('Short Spear', { cutTarget: 9, thrustTarget: 7, defenseTarget: 8, cutDamage: -2, thrustDamage: 1, reach: 3, profile: 'polearm' }),
  spear: fobMeleeWeapon('Spear', { cutTarget: 9, thrustTarget: 6, defenseTarget: 7, cutDamage: -1, thrustDamage: 2, reach: 5, profile: 'polearm' }),
  pike: fobMeleeWeapon('Pike', { thrustTarget: 8, defenseTarget: 10, thrustDamage: 2, reach: 6, profile: 'polearm' }),
  lightLance: fobMeleeWeapon('Light Lance', { thrustTarget: 7, defenseTarget: 10, thrustDamage: 2, reach: 5, profile: 'lance' }),
  heavyLance: fobMeleeWeapon('Heavy Lance', { thrustTarget: 8, defenseTarget: 10, thrustDamage: 1, reach: 6, profile: 'lance' }),
  balancedSpear: fobMeleeWeapon('Balanced Spear', { cutTarget: 8, thrustTarget: 6, defenseTarget: 6, cutDamage: -1, thrustDamage: 1, bashDamage: 1, reach: 4, profile: 'polearm' }),
  hewingSpear: fobMeleeWeapon('Hewing Spear', { cutTarget: 8, thrustTarget: 7, defenseTarget: 7, cutDamage: 0, thrustDamage: 2, reach: 5, profile: 'polearm', heavyBlade: true }),
  bill: fobMeleeWeapon('Bill', { cutTarget: 8, thrustTarget: 7, defenseTarget: 8, cutDamage: 2, thrustDamage: 1, reach: 5, profile: 'polearm', heavyBlade: true, canHook: true }),
  goedendag: fobMeleeWeapon('Goedendag / Morgenstern', { bashTarget: 8, thrustTarget: 7, defenseTarget: 8, bashDamage: 3, thrustDamage: 1, reach: 5, profile: 'polearm', heavyBlade: true }),
  halberd: fobMeleeWeapon('Halberd', { cutTarget: 7, thrustTarget: 8, defenseTarget: 8, cutDamage: 3, thrustDamage: 1, reach: 5, profile: 'polearm', heavyBlade: true, canHook: true, armorPiercing: 1 }),
  partisanAxe: fobMeleeWeapon('Partisan Axe', { cutTarget: 8, thrustTarget: 8, defenseTarget: 7, cutDamage: 1, thrustDamage: 2, reach: 6, profile: 'polearm', canHook: true }),
  lightFlail: fobMeleeWeapon('Light Flail', { bashTarget: 8, defenseTarget: 10, bashDamage: 3, reach: 4, profile: 'mass' }),
  heavyFlail: fobMeleeWeapon('Heavy Flail', { bashTarget: 8, defenseTarget: 10, bashDamage: 4, reach: 4, profile: 'mass' }),
  warflail: fobMeleeWeapon('War Flail', { bashTarget: 7, defenseTarget: 8, bashDamage: 4, reach: 5, profile: 'mass' }),
  lightMace: fobMeleeWeapon('Light Mace', { bashTarget: 6, defenseTarget: 6, bashDamage: 1, reach: 2, profile: 'mass' }),
  heavyMace: fobMeleeWeapon('Heavy Mace', { bashTarget: 7, defenseTarget: 7, bashDamage: 2, reach: 2, profile: 'mass' }),
  spikedMace: fobMeleeWeapon('Spiked Mace', { bashTarget: 7, defenseTarget: 7, bashDamage: 1, reach: 2, profile: 'mass', armorPiercing: 1 }),

  // Western swords
  armingSword: fobMeleeWeapon('Arming Sword', { cutTarget: 6, thrustTarget: 7, defenseTarget: 6, cutDamage: 1, thrustDamage: 0, drawCutModifier: 0, reach: 3, profile: 'cutThrust' }),
  backsword: fobMeleeWeapon('Backsword', { cutTarget: 7, thrustTarget: 7, defenseTarget: 6, cutDamage: 1, thrustDamage: 0, drawCutModifier: 1, reach: 3, profile: 'cutThrust' }),
  bastardSword: fobMeleeWeapon('Bastard Sword', { cutTarget: 6, thrustTarget: 6, defenseTarget: 6, cutDamage: 1, thrustDamage: 2, drawCutModifier: 0, reach: 4, profile: 'greatsword', heavyBlade: true }),
  claymore: fobMeleeWeapon('Claymore Sword', { cutTarget: 6, thrustTarget: 8, defenseTarget: 7, cutDamage: 3, thrustDamage: 1, drawCutModifier: -2, reach: 4, profile: 'greatsword', heavyBlade: true }),
  cutThrustSword: fobMeleeWeapon('Cut and Thrust Sword', { cutTarget: 6, thrustTarget: 6, defenseTarget: 6, cutDamage: 0, thrustDamage: 1, drawCutModifier: 1, reach: 3, profile: 'cutThrust' }),
  doppelhander: fobMeleeWeapon('Doppelhander', { cutTarget: 7, thrustTarget: 8, defenseTarget: 8, cutDamage: 4, thrustDamage: 1, drawCutModifier: -2, reach: 5, profile: 'greatsword', heavyBlade: true }),
  flammard: fobMeleeWeapon('Flammard', { cutTarget: 7, thrustTarget: 9, defenseTarget: 8, cutDamage: 4, thrustDamage: 1, drawCutModifier: -2, reach: 5, profile: 'greatsword', heavyBlade: true }),
  estoc: fobMeleeWeapon('Estoc', { bashTarget: 7, thrustTarget: 7, defenseTarget: 6, bashDamage: -1, thrustDamage: 1, reach: 4, profile: 'greatsword', heavyBlade: true }),
  falchion: fobMeleeWeapon('Falchion', { cutTarget: 6, thrustTarget: 8, defenseTarget: 7, cutDamage: 2, thrustDamage: 0, drawCutModifier: -1, reach: 2, profile: 'cutThrust', heavyBlade: true }),
  falx: fobMeleeWeapon('Falx', { cutTarget: 8, thrustTarget: 9, defenseTarget: 8, cutDamage: 2, thrustDamage: 0, drawCutModifier: 1, reach: 4, profile: 'greatsword', heavyBlade: true }),
  rhomphia: fobMeleeWeapon('Rhomphia', { cutTarget: 7, thrustTarget: 9, defenseTarget: 9, cutDamage: 2, thrustDamage: 0, drawCutModifier: 1, reach: 5, profile: 'greatsword', heavyBlade: true }),
  greatSword: fobMeleeWeapon('Great Sword', { cutTarget: 6, thrustTarget: 8, defenseTarget: 7, cutDamage: 3, thrustDamage: 0, drawCutModifier: -2, reach: 4, profile: 'greatsword', heavyBlade: true }),
  katzbalger: fobMeleeWeapon('Katzbalger', { cutTarget: 6, thrustTarget: 8, defenseTarget: 6, cutDamage: 1, thrustDamage: 0, drawCutModifier: 0, reach: 2, profile: 'cutThrust' }),
  longsword: fobMeleeWeapon('Longsword', { cutTarget: 6, thrustTarget: 7, defenseTarget: 6, cutDamage: 2, thrustDamage: 1, drawCutModifier: -1, reach: 4, profile: 'greatsword', heavyBlade: true }),
  grosseMesser: fobMeleeWeapon('Grosse Messer', { cutTarget: 6, thrustTarget: 8, defenseTarget: 7, cutDamage: 1, thrustDamage: 0, drawCutModifier: 1, reach: 4, profile: 'cutThrust', heavyBlade: true }),
  kriegsMesser: fobMeleeWeapon('Kriegs Messer', { cutTarget: 6, thrustTarget: 8, defenseTarget: 7, cutDamage: 2, thrustDamage: 0, drawCutModifier: 1, reach: 3, profile: 'greatsword', heavyBlade: true }),
  norseSword: fobMeleeWeapon('Norse Sword', { cutTarget: 6, thrustTarget: 8, defenseTarget: 6, cutDamage: 1, thrustDamage: 0, drawCutModifier: 0, reach: 3, profile: 'cutThrust' }),
  pallasch: fobMeleeWeapon('Pallasch', { cutTarget: 7, thrustTarget: 7, defenseTarget: 7, cutDamage: 2, thrustDamage: 1, drawCutModifier: 1, reach: 4, profile: 'cutThrust' }),
  rapier: fobMeleeWeapon('Rapier', { cutTarget: 7, thrustTarget: 5, defenseTarget: 6, cutDamage: -3, thrustDamage: 2, drawCutModifier: 1, reach: 4, profile: 'rapier' }),
  saber: fobMeleeWeapon('Saber', { cutTarget: 6, thrustTarget: 8, defenseTarget: 8, cutDamage: 0, thrustDamage: 0, drawCutModifier: 2, reach: 3, profile: 'cutThrust' }),
  schiavona: fobMeleeWeapon('Schiavona', { cutTarget: 7, thrustTarget: 7, defenseTarget: 6, cutDamage: 1, thrustDamage: 1, drawCutModifier: 1, reach: 4, profile: 'cutThrust' }),
  schweizersabel: fobMeleeWeapon('Schweizersabel', { cutTarget: 6, thrustTarget: 8, defenseTarget: 7, cutDamage: 1, thrustDamage: 0, drawCutModifier: 2, reach: 4, profile: 'greatsword' }),
  sidesword: fobMeleeWeapon('Sidesword', { cutTarget: 7, thrustTarget: 6, defenseTarget: 6, cutDamage: -1, thrustDamage: 2, drawCutModifier: 1, reach: 3, profile: 'cutThrust' }),
  smallsword: fobMeleeWeapon('Smallsword', { cutTarget: 9, thrustTarget: 5, defenseTarget: 6, cutDamage: -4, thrustDamage: 1, drawCutModifier: 1, reach: 3, profile: 'rapier' }),
  colichemarde: fobMeleeWeapon('Colichemarde', { cutTarget: 9, thrustTarget: 5, defenseTarget: 6, cutDamage: -4, thrustDamage: 0, drawCutModifier: 1, reach: 3, profile: 'rapier' }),

  // Bows and crossbows
  longbow: fobRangedWeapon('Long Bow', 7, 3, 'puncturing', { effectiveStrength: 5, prepRounds: 2, ranges: [15, 30, 45, 90, 260] }),
  recurveBow: fobRangedWeapon('Recurve Bow', 6, 1, 'puncturing', { effectiveStrength: 5, prepRounds: 2, ranges: [10, 20, 30, 60, 120] }),
  recurveCompositeBow: fobRangedWeapon('Recurve Composite Bow', 7, 2, 'puncturing', { effectiveStrength: 6, prepRounds: 2, ranges: [10, 20, 35, 70, 220] }),
  shortbow: fobRangedWeapon('Short Bow', 6, 1, 'puncturing', { effectiveStrength: 4, prepRounds: 2 }),
  arbalest: fobRangedWeapon('Arbalest', 5, 4, 'puncturing', { effectiveStrength: 7, prepRounds: 8, ranges: [10, 25, 50, 100, 200] }),
  doubleCrossbow: fobRangedWeapon('Double Crossbow', 6, 2, 'puncturing', { effectiveStrength: 5, prepRounds: 8, doubleShot: true }),
  heavyCrossbow: fobRangedWeapon('Heavy Crossbow', 5, 3, 'puncturing', { effectiveStrength: 6, prepRounds: 4 }),
  huntingCrossbow: fobRangedWeapon('Hunting Crossbow', 6, 2, 'puncturing', { effectiveStrength: 5, prepRounds: 4 }),
  lightCrossbow: fobRangedWeapon('Light Crossbow', 6, 1, 'puncturing', { effectiveStrength: 4, prepRounds: 4 }),
  repeatingCrossbow: fobRangedWeapon('Repeating Crossbow', 7, 0, 'puncturing', { effectiveStrength: 3, prepRounds: 1 }),

  // Thrown weapons and firearms
  cateia: fobRangedWeapon('Cateia', 7, 1, 'bludgeoning'),
  francisca: fobRangedWeapon('Francisca', 7, 2, 'cutting'),
  hurlbat: fobRangedWeapon('Hurlbat', 7, 1, 'cutting'),
  javelin: fobRangedWeapon('Javelin', 7, 1, 'puncturing'),
  pilum: fobRangedWeapon('Pilum / Angon', 6, 3, 'puncturing', { armorPiercing: 1 }),
  plumbata: fobRangedWeapon('Plumbata', 7, 1, 'puncturing', { armorPiercing: 1 }),
  sling: fobRangedWeapon('Sling', 7, 1, 'bludgeoning'),
  weaversBeam: fobRangedWeapon("Weaver's Beam", 8, 3, 'puncturing'),
  thrownHammer: fobRangedWeapon('Thrown Hammer', 6, 1, 'bludgeoning'),
  throwingKnife: fobRangedWeapon('Thrown Knife / Dagger', 8, -1, 'puncturing'),
  thrownSpear: fobRangedWeapon('Thrown Spear', 7, 2, 'puncturing'),
  thrownSword: fobRangedWeapon('Thrown Sword', 9, 0, 'cutting'),
  matchlockHandGun: fobRangedWeapon('Matchlock Hand Gun', 5, 2, 'puncturing', { effectiveStrength: 4, prepRounds: 25, firearm: true, armorPiercing: 1 }),
  flintlockHandGun: fobRangedWeapon('Flintlock Hand Gun', 5, 2, 'puncturing', { effectiveStrength: 4, prepRounds: 25, firearm: true, armorPiercing: 1 }),
  matchlockMusket: fobRangedWeapon('Matchlock Musket', 5, 3, 'puncturing', { effectiveStrength: 5, prepRounds: 25, firearm: true, armorPiercing: 2 }),
  flintlockMusket: fobRangedWeapon('Flintlock Musket', 5, 3, 'puncturing', { effectiveStrength: 5, prepRounds: 25, firearm: true, armorPiercing: 2 }),
  matchlockBlunderbuss: fobRangedWeapon('Matchlock Blunderbuss', 4, 2, 'puncturing', { effectiveStrength: 10, prepRounds: 46, firearm: true }),
  flintlockBlunderbuss: fobRangedWeapon('Flintlock Blunderbuss', 4, 2, 'puncturing', { effectiveStrength: 10, prepRounds: 46, firearm: true }),
}

// Stores the flower weapon prices values used by the rest of this file.
const FLOWER_WEAPON_PRICES = {
  arbalest: [0, 90], doubleCrossbow: [0, 50], huntingCrossbow: [0, 25], lightCrossbow: [0, 15], longbow: [0, 20], recurveBow: [0, 12], recurveCompositeBow: [0, 30], repeatingCrossbow: [0, 50], shortbow: [0, 7],
  akinakes: [0, 14], parryingDagger: [0, 10], broadDagger: [0, 7], cutlass: [0, 20], falcata: [0, 22], gladius: [0, 15], jambiya: [0, 5], kopis: [0, 25], kukri: [0, 16], largeDagger: [0, 6], largeKnife: [0, 0, 8], longSax: [0, 18], mainGauche: [0, 30], poniard: [0, 0, 5], protosword: [0, 0, 6], razor: [0, 0, 2], rondel: [0, 2], sax: [0, 15], shortSword: [0, 8], smallDagger: [0, 1], smallKnife: [0, 0, 3], stiletto: [0, 12],
  yanMaoDao: [0, 12], lieuYeDao: [0, 15], jianSword: [0, 50], katana: [0, 80], khandar: [0, 30], noDachi: [0, 90], pata: [0, 20], shamshir: [0, 45], wakizashi: [0, 70],
  balancedSpear: [0, 12], bata: [0, 0, 1], battleAxe: [0, 5], elephantKnife: [0, 7], bill: [0, 15], goedendag: [0, 4], halberd: [0, 14], handAxe: [0, 2], heavyFlail: [0, 30], heavyLance: [0, 0, 8], heavyMace: [0, 20], hewingSpear: [0, 1], kernAxe: [0, 6], lightFlail: [0, 25], lightLance: [0, 0, 5], lightMace: [0, 3], partisanAxe: [0, 12], pollHammer: [0, 8], poleAxe: [0, 8], quarterstaff: [0, 0, 1], shortSpear: [0, 0, 2], shortStaff: [0, 0, 1], sparthAxe: [0, 16], spear: [0, 0, 3], spikedMace: [0, 22], warflail: [0, 18],
  armingSword: [0, 15], backsword: [0, 20], bastardSword: [0, 50], claymore: [0, 65], colichemarde: [0, 110], cutThrustSword: [0, 32], doppelhander: [0, 85], estoc: [0, 40], falchion: [0, 13], falx: [0, 10], flammard: [0, 90], greatSword: [0, 35], grosseMesser: [0, 12], katzbalger: [0, 24], kriegsMesser: [0, 18], longsword: [0, 40], norseSword: [0, 16], pallasch: [0, 25], rapier: [0, 80], saber: [0, 30], schiavona: [0, 60], schweizersabel: [0, 70], sidesword: [0, 45], smallsword: [0, 100],
  cateia: [0, 0, 4], francisca: [0, 2], hurlbat: [0, 6], javelin: [0, 0, 2], pilum: [0, 3], plumbata: [0, 1], sling: [0, 0, 1],
  matchlockHandGun: [2, 10], flintlockHandGun: [4, 0], matchlockMusket: [4, 0], flintlockMusket: [6, 0], matchlockBlunderbuss: [5, 0], flintlockBlunderbuss: [8, 0],
}

// Stores the flower armor options values used by the rest of this file.
const FLOWER_ARMOR_OPTIONS = {
  aketon: { name: 'Aketon / Gambeson (AV 1)', value: 1, poolPenalty: 0, movePenalty: 0, material: 'cloth', itemId: 'fob-armor-aketon' },
  leatherDoublet: { name: 'Leather Doublet / Jack (AV 2)', value: 2, poolPenalty: 0, movePenalty: 0, material: 'leather', itemId: 'fob-armor-doublet' },
  cuirBouilliDoublet: { name: 'Cuir Bouilli Doublet (AV 3)', value: 3, poolPenalty: 0, movePenalty: 0, material: 'cuirBouilli', itemId: 'fob-armor-doublet' },
  scaledDoublet: { name: 'Scaled Doublet (AV 4)', value: 4, poolPenalty: 1, movePenalty: 1, material: 'scale', itemId: 'fob-armor-doublet' },
  lightMailBirnie: { name: 'Light Mail Birnie (AV 3)', value: 3, poolPenalty: 1, movePenalty: 1, material: 'lightMail', itemId: 'fob-armor-birnie-short' },
  mailBirnie: { name: 'Mail Birnie (AV 4)', value: 4, poolPenalty: 1, movePenalty: 1, material: 'mail', itemId: 'fob-armor-birnie-long' },
  doubledMailBirnie: { name: 'Doubled Mail Birnie (AV 5)', value: 5, poolPenalty: 1, movePenalty: 1, material: 'doubledMail', itemId: 'fob-armor-birnie-long' },
  bandedMailBirnie: { name: 'Banded Mail Birnie (AV 5)', value: 5, poolPenalty: 1, movePenalty: 1, material: 'bandedMail', itemId: 'fob-armor-birnie-long' },
  breastplateLeatherBack: { name: 'Breastplate with Leather Back (AV 5)', value: 5, poolPenalty: 0, movePenalty: 0, material: 'plate', itemId: 'fob-armor-breastplate' },
  cuirass: { name: 'Plate Cuirass (AV 5)', value: 5, poolPenalty: 0, movePenalty: 0, material: 'plate', itemId: 'fob-armor-cuirass' },
  hauberk: { name: 'Mail Hauberk (AV 4)', value: 4, poolPenalty: 1, movePenalty: 1, material: 'mail', itemId: 'fob-armor-hauberk' },
  leatherLeggings: { name: 'Leather Leggings (AV 2)', value: 2, poolPenalty: 0, movePenalty: 0, material: 'leather', itemId: 'fob-armor-leather-leggings' },
  chausses: { name: 'Mail Chausses (AV 4)', value: 4, poolPenalty: 1, movePenalty: 1, material: 'mail', itemId: 'fob-armor-chausses' },
  lightMailSuit: { name: 'Light Mail Full Suit (AV 3)', value: 3, poolPenalty: 1, movePenalty: 1, material: 'lightMail', itemId: 'fob-armor-mail-suit' },
  mailSuit: { name: 'Mail Full Suit (AV 4)', value: 4, poolPenalty: 1, movePenalty: 1, material: 'mail', itemId: 'fob-armor-mail-suit' },
  doubledMailSuit: { name: 'Doubled Mail Full Suit (AV 5)', value: 5, poolPenalty: 2, movePenalty: 2, material: 'doubledMail', itemId: 'fob-armor-mail-suit' },
  bandedMailSuit: { name: 'Banded Mail Full Suit (AV 5)', value: 5, poolPenalty: 1, movePenalty: 1, material: 'bandedMail', itemId: 'fob-armor-mail-suit' },
  lightPlateSuit: { name: 'Light Plate Full Suit (AV 4)', value: 4, poolPenalty: 2, movePenalty: 1, material: 'lightPlate', itemId: 'fob-armor-plate-suit' },
  plateFull: { name: 'Plate Full Suit (AV 5)', value: 5, poolPenalty: 2, movePenalty: 1, material: 'plate', itemId: 'fob-armor-plate-suit' },
  heavyPlateSuit: { name: 'Heavy Plate Full Suit (AV 6)', value: 6, poolPenalty: 2, movePenalty: 2, material: 'heavyPlate', itemId: 'fob-armor-plate-suit' },
}

// Stores the flower armor equipment values used by the rest of this file.
const FLOWER_ARMOR_EQUIPMENT = [
  ['fob-armor-aketon', 'Aketon', [0, 0, 3]], ['fob-armor-arming-glove', 'Arming Glove', [0, 7, 6]], ['fob-armor-banded-gloves', 'Banded Leather Gloves', [0, 6]], ['fob-armor-breastplate', 'Breastplate with Leather Back', [4, 0]], ['fob-armor-chausses', 'Mail Chausses with Foot', [2, 10]], ['fob-armor-cuirass', 'Cuirass', [7, 0]], ['fob-armor-greaves', 'Cussart, Greaves and Sabaton', [0, 15]], ['fob-armor-doublet', 'Doublet / Jack with Long Sleeves', [0, 0, 10]], ['fob-armor-gauntlets', 'Gauntlets and Couters', [0, 12]], ['fob-armor-hauberk', 'Hauberk', [3, 0]], ['fob-armor-leather-boots', 'Leather Boots', [0, 7]], ['fob-armor-leather-gloves', 'Leather Gloves', [0, 1]], ['fob-armor-leather-leggings', 'Leather Leggings', [0, 0, 6]], ['fob-armor-light-mail-gloves', 'Light Mail Gloves', [0, 4]], ['fob-armor-mail-suit', 'Mail Full Suit', [5, 0]], ['fob-armor-birnie-long', 'Mail Birnie with Long Sleeves', [2, 10]], ['fob-armor-birnie-short', 'Mail Birnie with Short Sleeves', [1, 8]], ['fob-armor-plate-suit', 'Plate Full Suit without Helm', [15, 0]], ['fob-armor-poleyn', 'Poleyns', [0, 12]], ['fob-armor-vambrace', 'Rerebrace and Vambrace', [0, 15]], ['fob-armor-tassets', 'Tassets', [1, 0]],
  ['fob-head-aventail', 'Aventail', [0, 1, 6]], ['fob-head-full-helm', 'Full Helm', [0, 15]], ['fob-head-gorget', 'Gorget', [0, 5]], ['fob-head-kettle', 'Kettle Helm', [0, 1, 6]], ['fob-head-leather-coif', 'Leather Coif', [0, 1]], ['fob-head-mail-coif', 'Mail Coif', [0, 3, 6]], ['fob-head-ventail-coif', 'Mail Coif with Ventail', [0, 4]], ['fob-head-pot-helm', 'Pot Helm', [0, 5]],
  ['fob-shield-hand', 'Hand / Buckler Shield', [0, 0, 5], { shield: { size: 'hand', meleeTarget: 7, missileTarget: 9, armor: 4 } }], ['fob-shield-small', 'Small Round Shield', [0, 0, 10], { shield: { size: 'small', meleeTarget: 6, missileTarget: 8, armor: 4 } }], ['fob-shield-medium', 'Medium Heater Shield', [0, 1, 6], { shield: { size: 'medium', meleeTarget: 5, missileTarget: 7, armor: 4, poolPenalty: 1 } }], ['fob-shield-large', 'Large Kite Shield', [0, 2, 8], { shield: { size: 'large', meleeTarget: 5, missileTarget: 6, armor: 4, poolPenalty: 1 } }],
]


