/**
 * This validation utility exercises a focused gameplay rule and throws an error when that rule regresses. Comments identify each setup, action, and assertion group.
 */

const fs = require('fs')

// Loads the production combat source so this test checks the same rules used by the game.
const source = fs.readFileSync('classes/BattleSystem.js', 'utf8')
// Extracts the Strength-versus-Toughness modifier function from the production combat source.
const declaration = source.match(
  /const getStrengthToughnessDamageModifier[\s\S]*?\n\}/
)[0]
// Creates a callable copy of the production Strength-versus-Toughness damage rule.
const modifier = Function(
  `${declaration}; return getStrengthToughnessDamageModifier`
)()
// Calculates the modifier for each tested Strength and Toughness pair.
const actual = [
  [4, 4],
  [5, 4],
  [8, 4],
  [4, 5],
  [4, 8],
].map(([strength, toughness]) => modifier(strength, toughness))
// Lists the exact +2, +1, 0, -1, and -2 results required by the damage rule.
const expected = [0, 1, 2, -1, -2]

if (JSON.stringify(actual) !== JSON.stringify(expected)) {
  throw new Error(`Expected ${expected}; received ${actual}`)
}

console.log(`Strength/Toughness damage bands passed: ${actual}`)


