/**
 * Lists every selectable character portrait, walking sheet, frame layout, combat weapon, and display name.
 */

const CHARACTER_SPRITES = [
  ['dualblade-male', 'Blacksteel Duelist', 'longsword'],
  ['dualblade-female', 'Blacksteel Blade-Sister', 'longsword'],
  ['monk-male', 'Ashen Fist Adept', 'unarmed'],
  ['monk-female', 'Iron Palm Disciple', 'unarmed'],
  ['druid-male', 'Thornwood Keeper', 'quarterstaff'],
  ['druid-female', 'Greenwood Seer', 'quarterstaff'],
  ['bard-male', 'Roadside Minstrel', 'shortSword'],
  ['bard-female', 'Wandering Skald', 'shortSword'],
  ['ranger-male', 'Borderland Ranger', 'shortSword'],
  ['ranger-female', 'Greenwood Archer', 'shortSword'],
  ['barbarian-male', 'Wildland Reaver', 'greatSword'],
  ['barbarian-female', 'Wildland Huntress', 'greatSword'],
  ['cleric-male', 'Dawn Mace Cleric', 'mace'],
  ['cleric-female', 'Dawn Mace Sister', 'mace'],
  ['knight-male', 'Lionguard Knight', 'armingSword'],
  ['knight-female', 'Lionguard Dame', 'armingSword'],
  ['rogue-male', 'Hooded Cutpurse', 'poniard'],
  ['rogue-female', 'Veiled Knife', 'poniard'],
  ['alchemist-male', 'Guild Alchemist', 'shortSword'],
  ['alchemist-female', 'Guild Apothecary', 'shortSword'],
  ['axe-warrior-male', 'Crimson Halberdier', 'halberd'],
  ['axe-warrior-female', 'Crimson Axe-Guard', 'poleAxe'],
  ['blue-mage-male', 'Azure Arcanist', 'mace'],
  ['blue-mage-female', 'Frostbound Magus', 'mace'],
  ['blue-warrior-male', 'Sapphire Swordmaster', 'longsword'],
  ['blue-warrior-female', 'Sapphire Swordmaiden', 'longsword'],
  ['battlemage-male', 'Violet Battlemage', 'longsword'],
  ['battlemage-female', 'Violet War-Magus', 'longsword'],
  ['axe-mage-male', 'Blood-Axe Warlock', 'poleAxe'],
  ['axe-mage-female', 'Blood-Axe Witch', 'poleAxe'],
  ['blood-axe-male', 'Crimson Blood-Axe', 'poleAxe'],
  ['blood-axe-female', 'Crimson Blood-Axe Sister', 'poleAxe'],
].map(([id, name, weapon]) => ({
  id,
  name,
  weapon,
  portrait: `./images/character-sprites/portraits/${id}.png?v=sprite-alignment-2026-08-08`,
  walking: `./images/character-sprites/walking/${id}.png?v=uniform-map-scale-v2-2026-08-08`,
}))

// Stores the default character sprite id values used by the rest of this file.
const DEFAULT_CHARACTER_SPRITE_ID = 'barbarian-male'

// Returns the current character sprite.
const getCharacterSprite = (id) =>
  CHARACTER_SPRITES.find((sprite) => sprite.id === id) ||
  CHARACTER_SPRITES.find((sprite) => sprite.id === DEFAULT_CHARACTER_SPRITE_ID)


