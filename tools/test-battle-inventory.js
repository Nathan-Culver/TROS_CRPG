/**
 * This validation utility confirms that encounter inventory use updates wounds, consumes the item, and synchronizes the persistent character record.
 */

// Load the production combat and inventory definitions into one browser-like script scope.
const fs = require('fs')
const source = `${fs.readFileSync('data/flowerOfBattle.js', 'utf8')}\n${fs.readFileSync('classes/BattleSystem.js', 'utf8')}\n${fs.readFileSync('classes/GameUI.js', 'utf8')}`
const BattleSystem = Function(`${source}\n; return BattleSystem`)()

// Supply the storage surface used when a battle item immediately persists the character.
global.localStorage = { setItem() {} }

// Build the smallest combat state needed to exercise a Healing Herb during an active encounter.
const battle = Object.create(BattleSystem.prototype)
battle.isResolving = false
battle.battleEnded = false
battle.character = {
  inventoryItems: [{ id: 'herb-healing', name: 'Healing Herbs', quantity: 1, equipped: false }],
  equipmentIds: [],
  inventory: [],
}
battle.player = {
  name: 'Tester',
  wounds: [{ severity: 3, damageType: 'cutting', zone: 'torso', location: 'Torso', pain: 4, bloodLoss: 3 }],
  conditions: { pain: 4, shock: 3, pendingShock: 0, fatigue: 0, unconsciousRounds: 0, bleeding: 3, other: [] },
}
battle.inventoryNotice = { textContent: '' }
battle.addLog = () => {}
battle.renderBattleInventory = () => {}
battle.updateInterface = () => {}
battle.getWoundEffects = () => ({ shock: 2, rawPain: 2, pain: 2, bloodLoss: 1 })
battle.recalculateConditionTotals = () => {}

// Use the herb and assert both its wound reduction and its removal from the carried inventory.
battle.useBattleInventoryItem('herb-healing')
if (battle.player.wounds[0].severity !== 2) throw new Error('Healing Herb did not reduce the wound level during battle.')
if (battle.character.inventoryItems.length !== 0) throw new Error('Consumed Healing Herb remained in battle inventory.')
if (battle.character.wounds[0].severity !== 2) throw new Error('Battle wound change did not synchronize to the character record.')

// Report the successful encounter-inventory behavior check.
console.log('Battle inventory item use passed.')

