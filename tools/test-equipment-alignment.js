/**
 * This validation utility confirms that builder proficiency and armor choices correspond one-for-one with functional equipment sold in the starting shop.
 */

// Load the real combat catalog and character-builder source so the test checks production data instead of duplicated fixtures.
const fs = require('fs')
const source = `${fs.readFileSync('data/flowerOfBattle.js', 'utf8')}\n${fs.readFileSync('classes/BattleSystem.js', 'utf8')}\n${fs.readFileSync('classes/GameUI.js', 'utf8')}`

// Expose the builder's derived equipment collections from their shared browser-script scope.
const catalogs = Function(`${source}; return { BUILDER_EQUIPMENT_CATALOG, BUILDER_WEAPON_OPTIONS: getBuilderWeaponOptions(), BUILDER_ARMOR_OPTIONS, ARMOR_OPTIONS, ARMOR_PROFICIENCIES }`)()

// Build lookup sets that make every correspondence assertion explicit and order-independent.
const shopWeaponIds = new Set(catalogs.BUILDER_EQUIPMENT_CATALOG.filter((item) => item.weaponId).map((item) => item.weaponId))
const proficiencyWeaponIds = new Set(catalogs.BUILDER_WEAPON_OPTIONS.map(([weaponId]) => weaponId))
const functionalArmorItems = catalogs.BUILDER_EQUIPMENT_CATALOG.filter((item) => item.category.startsWith('Armor') && !item.shield)
const selectableArmorIds = new Set(Object.keys(catalogs.BUILDER_ARMOR_OPTIONS).filter((armorId) => armorId !== 'none'))

// Verify that purchasable weapons and selectable proficiency weapons contain exactly the same identifiers.
if (shopWeaponIds.size !== proficiencyWeaponIds.size || [...shopWeaponIds].some((weaponId) => !proficiencyWeaponIds.has(weaponId))) {
  throw new Error('Purchasable weapons and builder proficiency choices are not aligned.')
}

// Verify that every armor item sold by the builder has protection metadata and belongs to a recognized armor proficiency.
functionalArmorItems.forEach((item) => {
  if (!item.armorPiece || !catalogs.ARMOR_PROFICIENCIES[item.armorPiece.proficiency] || !item.armorPiece.coverage.length) {
    throw new Error(`Functional armor mapping is missing for ${item.name}.`)
  }
  // Major suits must also remain selectable as equipped loadouts; minor pieces layer onto those suits independently.
  if (!item.armorPiece.minor && (!item.armorId || !catalogs.ARMOR_OPTIONS[item.armorId] || !selectableArmorIds.has(item.armorId))) throw new Error(`Major armor loadout mapping is missing for ${item.name}.`)
})

// Verify the reverse mapping so the armor selector cannot offer a loadout that the player cannot purchase.
selectableArmorIds.forEach((armorId) => {
  if (!functionalArmorItems.some((item) => item.armorId === armorId)) {
    throw new Error(`Equipped armor choice ${armorId} has no purchasable item.`)
  }
})

// Report the validated catalog sizes for a quick regression signal.
console.log(`Equipment alignment passed: ${shopWeaponIds.size} weapons and ${selectableArmorIds.size} armor loadouts.`)

