/**
 * This regression test verifies restored minor armor, proficiency grouping, body coverage, and location-specific battle protection.
 */

// Load production armor and battle files so every assertion exercises the data shipped to the browser.
const fs = require('fs')
const source = `${fs.readFileSync('data/flowerOfBattle.js', 'utf8')}\n${fs.readFileSync('classes/BattleSystem.js', 'utf8')}\n${fs.readFileSync('classes/GameUI.js', 'utf8')}`

// Expose only the catalogs and combat class required for this focused validation.
const game = Function(`${source}; return { BUILDER_EQUIPMENT_CATALOG, ARMOR_PROFICIENCIES, BattleSystem }`)()
const equipment = new Map(game.BUILDER_EQUIPMENT_CATALOG.map((item) => [item.id, item]))

// List every specifically requested restored piece so later catalog edits cannot silently hide one again.
const requiredArmorIds = [
  'armor-pot-helm', 'armor-full-helm', 'armor-chain-coif', 'fob-head-aventail',
  'fob-head-full-helm', 'fob-head-gorget', 'fob-head-kettle', 'fob-head-leather-coif',
  'fob-head-mail-coif', 'fob-head-ventail-coif', 'fob-head-pot-helm',
]

// Require every restored piece to be purchasable, assigned to a proficiency, and protective over at least one named body region.
requiredArmorIds.forEach((itemId) => {
  const item = equipment.get(itemId)
  if (!item) throw new Error(`Restored armor item ${itemId} is missing from the Character Builder.`)
  if (!game.ARMOR_PROFICIENCIES[item.armorPiece?.proficiency]) throw new Error(`${item.name} has no valid armor proficiency.`)
  if (!item.armorPiece.coverage.length) throw new Error(`${item.name} has no body coverage.`)
})

// Call the battle armor resolver without constructing browser UI to prove head and torso strikes read different saved coverage values.
const getEffectiveArmor = game.BattleSystem.prototype.getEffectiveArmor
const defender = { armor: 1, armorMaterial: 'leather', armorCoverage: { head: { value: 5, material: 'plate' }, torso: { value: 2, material: 'mail' } } }
if (getEffectiveArmor.call({}, defender, 'puncturing', 'head') !== 5) throw new Error('Head armor coverage is not used for a head strike.')
if (getEffectiveArmor.call({}, defender, 'puncturing', 'torso') !== 2) throw new Error('Torso armor coverage is not used for a torso strike.')

// Report a concise success signal for automated and manual project checks.
console.log(`Armor coverage passed: ${requiredArmorIds.length} restored pieces use proficiency and body-zone protection.`)

