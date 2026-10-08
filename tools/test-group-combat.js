/**
 * This validation utility exercises a focused gameplay rule and throws an error when that rule regresses. Comments identify each setup, action, and assertion group.
 */

const fs = require('fs')

// Loads the production combat source so this test checks the same rules used by the game.
const source = `${fs.readFileSync('data/flowerOfBattle.js', 'utf8')}\n${fs.readFileSync('classes/BattleSystem.js', 'utf8')}`
// Creates random-encounter combat and connects it to travel, the character, defeat recovery, and map return.
const BattleSystem = Function(`${source}\n; return BattleSystem`)()
// Creates a minimal battle object without loading browser interface elements.
const battle = Object.create(BattleSystem.prototype)

battle.isActive = true
battle.isResolving = false
battle.battleEnded = false
battle.canReequip = false
battle.exchange = 1
battle.needsInitiativeDeclaration = true
battle.boutOpeningExchange = true
battle.pauseAfterExchange = false
battle.orientation = 0
battle.reachAdvantage = null
battle.initiative = null
battle.actionButton = { disabled: false }
battle.weaponSelect = { value: 'longsword' }
battle.stanceSelect = { value: 'noStance' }
battle.opponentSelect = { value: 'enemy-0' }
battle.player = {
  id: 'player', weapon: 'longsword', reflex: 5, stance: 'noStance', attitude: 'neutral',
  defeated: false, conditions: { currentHealth: 4 },
}
battle.enemies = Array.from({ length: 3 }, (_, index) => ({
  id: `enemy-${index}`, weapon: 'longsword', reflex: 4 + index,
  stance: 'noStance', attitude: 'neutral', defeated: false, fled: false,
  orientation: 0, reachAdvantage: null, pairInitiative: null,
  wounds: [], conditions: { currentHealth: 4 }, actor: { classList: { toggle() {} } },
}))
battle.enemy = battle.enemies[0]
battle.getPlayerPlan = () => ({
  intent: 'blue', attackManeuver: 'cut', defenseManeuver: 'parry',
  attackZone: 'torso', attackDice: 0, defenseDice: 4,
})
battle.getEnemyPlan = () => ({
  intent: 'red', attackManeuver: 'cut', defenseManeuver: 'parry',
  attackZone: 'torso', attackDice: 3, defenseDice: 3,
})
battle.getGroupInitiativeScore = (combatant) => combatant.reflex
battle.configureManeuverOptions = () => {}
battle.afterGroupExchange = () => { battle.groupExchangeFinished = true; battle.isResolving = false }
battle.addLog = () => {}
// Collects the combatants that acted so simultaneous group resolution can be verified.
const attackers = []
battle.resolveAttack = (attacker) => {
  attackers.push(attacker.id)
  battle.initiative = attacker.id
}

battle.resolveGroupExchange()

// Lists the player and enemies that must each receive one action in the group exchange.
const expectedAttackers = ['enemy-2', 'enemy-1', 'enemy-0']
if (JSON.stringify(attackers) !== JSON.stringify(expectedAttackers)) {
  throw new Error(`Expected all enemies in reflex order; received ${attackers}`)
}
if (!battle.groupExchangeFinished) throw new Error('Group exchange did not finish.')

// Saves the normal random-number function so the test can restore it after fixed rolls.
const originalRandom = Math.random
Math.random = () => 0
// Generates enemy gifts and flaws using controlled random rolls for a repeatable assertion.
const traits = battle.rollEnemyTraits()
// Creates a badly wounded enemy to test the chance of fleeing at wound level 3 or higher.
const woundedEnemy = battle.enemies[0]
woundedEnemy.wounds = [{ severity: 3 }]
woundedEnemy.actor = { classList: { remove() {}, add() {} } }
// Records whether the wounded enemy left the encounter during the controlled flee check.
const fled = battle.maybeEnemyFlees(woundedEnemy)
Math.random = originalRandom

if (traits.names.length !== 2) throw new Error('Enemy did not receive both a gift and flaw at a qualifying roll.')
if (!fled || !woundedEnemy.fled) throw new Error('Level 3 wound flee check did not trigger at a qualifying roll.')

battle.player.conditions.fatigue = 0
battle.isResolving = false
// Stores escape outcome for the calculations and drawing code below.
let escapeOutcome = null
battle.endBattle = (outcome) => { escapeOutcome = outcome }
Math.random = () => 0
battle.attemptEscape()
if (escapeOutcome !== 'fled') throw new Error('A successful player escape did not end the battle as fled.')

battle.isResolving = false
battle.battleEnded = false
// Stores free attack triggered for the calculations and drawing code below.
let freeAttackTriggered = false
battle.resolveEnemyFreeAttacks = () => { freeAttackTriggered = true }
Math.random = () => 0.999
battle.attemptEscape()
Math.random = originalRandom
if (!freeAttackTriggered) throw new Error('A failed player escape did not expose the player to group free attacks.')

console.log('Group combat, traits, wounded-enemy flight, and player escape checks passed.')


