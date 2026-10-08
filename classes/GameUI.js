/**
 * Controls character creation, armor coverage, the character sheet, inventory actions, conditions, and browser or exportable saves.
 */

const CHARACTER_ATTRIBUTES = [
  ['strength', 'Strength'], ['agility', 'Agility'], ['toughness', 'Toughness'],
  ['endurance', 'Endurance'], ['health', 'Health'], ['willpower', 'Willpower'],
  ['wit', 'Wits'], ['perception', 'Perception'],
]

// Stores the social classes values used by the rest of this file.
const SOCIAL_CLASSES = {
  slave: { name: 'Slave', cost: 0, wealth: 0 },
  peasant: { name: 'Peasant', cost: 3, wealth: 5 },
  lowFreeman: { name: 'Low Freeman', cost: 6, wealth: 15 },
  highFreeman: { name: 'High Freeman', cost: 9, wealth: 50 },
  landlessNoble: { name: 'Landless Noble', cost: 12, wealth: 100 },
  landedNoble: { name: 'Landed Noble', cost: 15, wealth: 250 },
}
// Stores the gift flaw definitions values used by the rest of this file.
const GIFT_FLAW_DEFINITIONS = [
  ['20/20', 'gift', ['minor']], ['Absolute Direction', 'gift', ['minor']], ['Accuracy (Melee)', 'gift', ['minor', 'major']], ['Accuracy (Missile)', 'gift', ['minor', 'major']], ['Alert', 'gift', ['minor', 'major']], ['Allies', 'gift', ['minor', 'major']], ['Ambidexterity', 'gift', ['major']], ['Animal Kin', 'gift', ['minor', 'major']], ['Beauty of Legends', 'gift', ['minor', 'major']], ['Careful', 'gift', ['minor', 'major']], ['Driven', 'gift', ['major']], ['Exceptional Hearing', 'gift', ['minor']], ['Glorious Destiny', 'gift', ['major']], ['Good Reputation', 'gift', ['minor', 'major']], ['Great Presence', 'gift', ['minor', 'major']], ['Hardy', 'gift', ['minor', 'major']], ['Heir', 'gift', ['minor', 'major']], ['High Pain Threshold', 'gift', ['minor', 'major']], ['Intellectual', 'gift', ['minor', 'major']], ['Jack of all Trades', 'gift', ['major']], ['Light Sleeper', 'gift', ['minor']], ['Linguist', 'gift', ['minor']], ['Marksman', 'gift', ['major']], ['Nimble', 'gift', ['minor', 'major']], ['Patron', 'gift', ['minor', 'major']], ['Quick Hands', 'gift', ['minor', 'major']], ['Quick Healing', 'gift', ['major']], ['Quick Wits', 'gift', ['minor', 'major']], ['Resolute', 'gift', ['minor', 'major']], ['Social Butterfly', 'gift', ['minor']], ['Steadfast', 'gift', ['major']], ['Tireless', 'gift', ['minor', 'major']], ['True Compassion', 'gift', ['major']], ['True Faith', 'gift', ['major']], ['True Leadership', 'gift', ['major']], ['True Love / True Hatred', 'gift', ['major']], ['Wealthy', 'gift', ['minor', 'major']], ['Berserker', 'gift', ['major']],
  ['Addiction', 'flaw', ['minor']], ['Amnesia', 'flaw', ['major']], ['Amputee', 'flaw', ['minor', 'major']], ['Anti-Destiny', 'flaw', ['major']], ['Bad Reputation', 'flaw', ['minor', 'major']], ['Bleeder', 'flaw', ['minor']], ['Bloodlust / Troublemaker', 'flaw', ['minor', 'major']], ['Chicken', 'flaw', ['major']], ['Compulsion', 'flaw', ['minor']], ['Enemy', 'flaw', ['minor', 'major']], ['Evil Twin', 'flaw', ['minor', 'major']], ['Greed', 'flaw', ['major']], ['Lecherousness', 'flaw', ['minor']], ['Lingering Injury', 'flaw', ['minor', 'major']], ['Little', 'flaw', ['minor']], ['Nearsighted', 'flaw', ['minor', 'major']], ['Obese', 'flaw', ['minor', 'major']], ['Overconfident', 'flaw', ['minor', 'major']], ['Phobia', 'flaw', ['minor', 'major']], ['Poor', 'flaw', ['minor', 'major']], ['Rage / Bad Temper', 'flaw', ['minor', 'major']], ['Shy', 'flaw', ['minor']], ['Skeletons in the Closet', 'flaw', ['minor', 'major']], ['Sleep Disorder', 'flaw', ['minor', 'major']], ['Telegraphed Techniques', 'flaw', ['minor', 'major']], ['Tormented', 'flaw', ['minor', 'major']], ['Ugly', 'flaw', ['minor', 'major']], ['Berserker', 'flaw', ['major']],
]

// Stores the gift flaw options values used by the rest of this file.
const GIFT_FLAW_OPTIONS = { none: { name: 'None', cost: 0, type: 'none', level: 'none' } }
GIFT_FLAW_DEFINITIONS.forEach(([name, type, levels]) => levels.forEach((level) => {
  const key = `${type}:${name}:${level}`
  const magnitude = level === 'major' ? 6 : 3
  GIFT_FLAW_OPTIONS[key] = { name: `${name} (${level[0].toUpperCase()}${level.slice(1)} ${type === 'gift' ? 'Gift' : 'Flaw'})`, cost: type === 'gift' ? magnitude : -magnitude, type, level, baseName: name }
}))

// Stores the armor options values used by the rest of this file.
const ARMOR_OPTIONS = {
  none: { name: 'Unarmored', value: 0, poolPenalty: 0, material: 'none', itemId: null },
  leatherSleeves: { name: 'Leather jack with sleeves', value: 2, poolPenalty: 0, material: 'leather', itemId: 'armor-leather-sleeves' },
  leatherNoSleeves: { name: 'Leather jack without sleeves', value: 2, poolPenalty: 0, material: 'leather', itemId: 'armor-leather-no-sleeves' },
  chainSleeves: { name: 'Chain shirt with sleeves', value: 4, poolPenalty: 2, material: 'mail', itemId: 'armor-chain-sleeves' },
  chainNoSleeves: { name: 'Chain shirt without sleeves', value: 4, poolPenalty: 2, material: 'mail', itemId: 'armor-chain-no-sleeves' },
  chainFull: { name: 'Full chain suit', value: 4, poolPenalty: 3, material: 'mail', itemId: 'armor-chain-full' },
  breastplate: { name: 'Breastplate', value: 5, poolPenalty: 2, material: 'plate', itemId: 'armor-breastplate' },
  plateFull: { name: 'Full plate suit', value: 6, poolPenalty: 3, material: 'plate', itemId: 'armor-plate-full' },
}
Object.assign(ARMOR_OPTIONS, FLOWER_ARMOR_OPTIONS)

// Converts gold, silver, copper, and bits into one total measured in bits.
const money = (gold = 0, silver = 0, copper = 0, bits = 0) => gold * 960 + silver * 48 + copper * 4 + bits
// Formats currency as readable text for the interface.
const formatCurrency = (total) => {
  let remaining = Math.max(0, Math.floor(Number(total) || 0))
  const gold = Math.floor(remaining / 960); remaining %= 960
  const silver = Math.floor(remaining / 48); remaining %= 48
  const copper = Math.floor(remaining / 4); const bits = remaining % 4
  return [[gold, 'g'], [silver, 's'], [copper, 'c'], [bits, 'b']]
    .filter(([value]) => value)
    .map(([value, suffix]) => `${value}${suffix}`)
    .join(' ') || '0'
}
// Reads currency and converts it into values the game can use.
const parseCurrency = (value) => {
  // Accepts an already calculated coin total without trying to parse it as text.
  if (Number.isFinite(value)) return Math.max(0, Math.floor(value))
  const totals = { g: 960, s: 48, c: 4, b: 1 }
  return Array.from(String(value || '').matchAll(/(\d+)\s*([gscb])/gi))
    .reduce((sum, match) => sum + Number(match[1]) * totals[match[2].toLowerCase()], 0)
}
// Creates one shop record with its name, category, price, and optional weapon or armor rules.
const eq = (id, name, category, price, extra = {}) => ({ id, name, category, price, ...extra })
// Stores the equipment catalog values used by the rest of this file.
const EQUIPMENT_CATALOG = [
  // Adds swords and daggers to the starting-equipment catalog.
  eq('weapon-armingSword', 'Arming Sword', 'Weapons - Swords', money(0,15), { weaponId: 'armingSword' }), eq('weapon-bastardSword', 'Bastard Sword', 'Weapons - Swords', money(3), { weaponId: 'bastardSword' }), eq('weapon-cutThrustSword', 'Cut and Thrust Sword', 'Weapons - Swords', money(3,10), { weaponId: 'cutThrustSword' }), eq('weapon-poniard', 'Poniard', 'Weapons - Swords', money(0,6), { weaponId: 'poniard' }), eq('weapon-rondel', 'Rondel Dagger', 'Weapons - Swords', money(0,0,10), { weaponId: 'rondel' }), eq('weapon-stiletto', 'Stiletto', 'Weapons - Swords', money(0,1), { weaponId: 'stiletto' }), eq('weapon-doppelhander', 'Doppelhander', 'Weapons - Swords', money(4), { weaponId: 'doppelhander' }), eq('weapon-estoc', 'Estoc', 'Weapons - Swords', money(1), { weaponId: 'estoc' }), eq('weapon-falchion', 'Falchion', 'Weapons - Swords', money(0,13), { weaponId: 'falchion' }), eq('weapon-greatSword', 'Great Sword', 'Weapons - Swords', money(2,10), { weaponId: 'greatSword' }), eq('weapon-longsword', 'Long Sword', 'Weapons - Swords', money(2), { weaponId: 'longsword' }), eq('weapon-rapier', 'Rapier', 'Weapons - Swords', money(4), { weaponId: 'rapier' }), eq('weapon-saber', 'Saber', 'Weapons - Swords', money(1,10), { weaponId: 'saber' }), eq('weapon-scimitar', 'Scimitar', 'Weapons - Swords', money(0,18), { weaponId: 'scimitar' }), eq('weapon-shortSword', 'Short Sword', 'Weapons - Swords', money(0,10), { weaponId: 'shortSword' }),
  // Adds clubs, axes, maces, hammers, and other mass weapons to the catalog.
  eq('weapon-club', 'Club', 'Weapons - Mass', money(0,0,3), { weaponId: 'club' }), eq('weapon-flail', 'Flail', 'Weapons - Mass', money(0,4), { weaponId: 'flail' }), eq('weapon-handAxe', 'Hand Axe', 'Weapons - Mass', money(0,2), { weaponId: 'handAxe' }), eq('weapon-knuckleDuster', 'Knuckle-duster', 'Weapons - Mass', money(0,0,4), { weaponId: 'knuckleDuster' }), eq('weapon-mace', 'Mace', 'Weapons - Mass', money(0,2), { weaponId: 'mace' }), eq('weapon-maul', 'Maul', 'Weapons - Mass', money(0,6), { weaponId: 'maul' }), eq('weapon-morningStar', 'Morning Star', 'Weapons - Mass', money(0,1), { weaponId: 'morningStar' }), eq('weapon-footmansPick', "Footman's Pick", 'Weapons - Mass', money(0,1), { weaponId: 'footmansPick' }), eq('weapon-poleAxe', 'Pole Axe', 'Weapons - Mass', money(0,4), { weaponId: 'poleAxe' }), eq('weapon-warflail', 'Warflail', 'Weapons - Mass', money(0,6), { weaponId: 'warflail' }), eq('weapon-warhammer', 'Warhammer', 'Weapons - Mass', money(0,3), { weaponId: 'warhammer' }),
  // Adds spears, staves, lances, and other pole arms to the catalog.
  eq('weapon-bill', 'Bill', 'Weapons - Pole Arms', money(0,5), { weaponId: 'bill' }), eq('weapon-halberd', 'Halberd', 'Weapons - Pole Arms', money(0,6), { weaponId: 'halberd' }), eq('weapon-heavyLance', 'Heavy Lance', 'Weapons - Pole Arms', money(0,0,7), { weaponId: 'heavyLance' }), eq('weapon-lightLance', 'Light Lance', 'Weapons - Pole Arms', money(0,0,4), { weaponId: 'lightLance' }), eq('weapon-pike', 'Pike', 'Weapons - Pole Arms', money(0,0,4), { weaponId: 'pike' }), eq('weapon-spear', 'Spear', 'Weapons - Pole Arms', money(0,0,2), { weaponId: 'spear' }), eq('weapon-longSpear', 'Long Spear', 'Weapons - Pole Arms', money(0,0,3), { weaponId: 'longSpear' }), eq('weapon-shortSpear', 'Short Spear', 'Weapons - Pole Arms', money(0,0,1,2), { weaponId: 'shortSpear' }), eq('weapon-quarterstaff', 'Quarterstaff', 'Weapons - Pole Arms', money(0,0,3), { weaponId: 'quarterstaff' }), eq('weapon-shortStaff', 'Shortstaff', 'Weapons - Pole Arms', money(0,0,4), { weaponId: 'shortStaff' }),
  // Adds bows, crossbows, thrown weapons, and their ammunition to the catalog.
  eq('weapon-crossbow', 'Crossbow', 'Weapons - Missile', money(0,15), { weaponId: 'crossbow' }), eq('ammo-crossbow', 'Crossbow bolt', 'Weapons - Missile', money(0,0,0,1)), eq('weapon-longbow', 'Longbow', 'Weapons - Missile', money(0,10), { weaponId: 'longbow' }), eq('ammo-longbow', 'Longbow arrow', 'Weapons - Missile', money(0,0,0,1)), eq('weapon-shortbow', 'Short Bow', 'Weapons - Missile', money(0,7), { weaponId: 'shortbow' }), eq('ammo-shortbow', 'Short bow arrow', 'Weapons - Missile', money(0,0,0,1)), eq('weapon-javelin', 'Javelin', 'Weapons - Missile', money(0,0,1), { weaponId: 'javelin' }), eq('weapon-sling', 'Sling', 'Weapons - Missile', money(0,0,1), { weaponId: 'sling' }), eq('ammo-sling', 'Sling bullets (5)', 'Weapons - Missile', money(0,0,0,1)), eq('weapon-throwingKnife', 'Throwing Knife', 'Weapons - Missile', money(0,0,4), { weaponId: 'throwingKnife' }), eq('weapon-throwingAxe', 'Throwing Axe', 'Weapons - Missile', money(0,2), { weaponId: 'throwingAxe' }), eq('weapon-throwingRock', 'Thrown rock / object', 'Weapons - Missile', 0, { weaponId: 'throwingRock' }),
  // Adds core body armor, helmets, coifs, and shields to the catalog.
  eq('armor-leather-sleeves', 'Leather jack with sleeves', 'Armor', money(0,0,10), { armorId: 'leatherSleeves' }), eq('armor-leather-no-sleeves', 'Leather jack without sleeves', 'Armor', money(0,0,6), { armorId: 'leatherNoSleeves' }), eq('armor-chain-sleeves', 'Chain shirt with sleeves', 'Armor', money(2,10), { armorId: 'chainSleeves' }), eq('armor-chain-no-sleeves', 'Chain shirt without sleeves', 'Armor', money(1,8), { armorId: 'chainNoSleeves' }), eq('armor-chain-full', 'Full chain suit', 'Armor', money(5), { armorId: 'chainFull' }), eq('armor-breastplate', 'Breastplate', 'Armor', money(7), { armorId: 'breastplate' }), eq('armor-plate-full', 'Full plate suit without helm', 'Armor', money(15), { armorId: 'plateFull' }), eq('armor-chain-coif', 'Chainmail coif', 'Armor', money(0,3,6)), eq('armor-pot-helm', 'Pot helm', 'Armor', money(0,5)), eq('armor-full-helm', 'Full helm', 'Armor', money(0,15)), eq('shield-buckler', 'Buckler', 'Armor', money(0,0,5)), eq('shield-round', 'Medium round shield', 'Armor', money(0,0,10)), eq('shield-heater', 'Medium heater shield', 'Armor', money(0,1,6)), eq('shield-kite', 'Large kite shield', 'Armor', money(0,2,8)),
  // Adds travel supplies such as packs, rope, bedding, light sources, and rations.
  eq('gear-travel-pack', 'Travel pack', 'Travel Gear', money(0,6)), eq('gear-cloak', 'Cloak', 'Travel Gear', money(0,0,6)), eq('gear-bedroll', 'Bedroll', 'Travel Gear', money(0,0,4)), eq('gear-rope', "Rope (25')", 'Travel Gear', money(0,0,4)), eq('gear-torch', 'Torch', 'Travel Gear', money(0,0,0,2)), eq('gear-lantern', 'Lantern', 'Travel Gear', money(0,0,8)), eq('gear-tent', 'Two-person tent', 'Travel Gear', money(0,0,8)), eq('gear-rations', 'Hard rations (week)', 'Travel Gear', money(0,0,2)), eq('gear-waterskin', 'Waterskin', 'Travel Gear', money(0,0,2)), eq('gear-mess-kit', 'Mess kit', 'Travel Gear', money(0,0,5)), eq('gear-whetstone', 'Whetstone and oil', 'Travel Gear', money(0,0,4)), eq('gear-grapple', 'Grappling hook', 'Travel Gear', money(0,0,4)),
  // Adds professional, crafting, writing, and performance tools to the catalog.
  eq('tool-climbing', 'Climbing gear', 'Tools', money(0,5)), eq('tool-fishing', 'Fishing gear', 'Tools', money(0,2)), eq('tool-traps', "Hunters' traps (5)", 'Tools', money(0,3)), eq('tool-lockpicks', 'Lock picks', 'Tools', money(0,4)), eq('tool-assorted', 'Assorted tools', 'Tools', money(0,4)), eq('tool-writing', 'Ink and quill', 'Tools', money(0,0,2)), eq('tool-parchment', 'Parchment roll', 'Tools', money(0,0,4)), eq('tool-book', 'Book (150 pages)', 'Tools', money(2)), eq('tool-musical', 'Musical instrument', 'Tools', money(0,10)),
  // Adds clothing sets for each common social station.
  eq('clothes-peasant', 'Peasant clothing set', 'Clothing', money(0,0,3)), eq('clothes-freeman', 'Average Freeman clothing set', 'Clothing', money(0,2)), eq('clothes-soldier', 'Enlisted soldier clothing set', 'Clothing', money(0,0,10)), eq('clothes-gentry', 'Gentry daily clothing set', 'Clothing', money(2)), eq('clothes-noble', 'Noble clothing set', 'Clothing', money(10)),
  // Adds mounts, working animals, pets, and riding equipment to the catalog.
  eq('animal-riding-horse', 'Riding Horse', 'Animals', money(1,5)), eq('animal-warhorse', 'Charger', 'Animals', money(10)), eq('animal-work-horse', 'Work Horse', 'Animals', money(0,8)), eq('animal-mule', 'Mule / Donkey', 'Animals', money(0,6)), eq('animal-pony', 'Pony', 'Animals', money(0,7)), eq('animal-dog', 'Hunting Dog', 'Animals', money(0,5)), eq('animal-cat', 'Cat', 'Animals', money(0,0,6)), eq('animal-saddle', 'Saddle', 'Animals', money(0,3)),
]
EQUIPMENT_CATALOG.push(
  // Adds Stimulant Herbs with their starting-equipment price.
  eq('herb-stimulant', 'Stimulant Herbs', 'Medicinals', money(0, 5)),
  // Adds Healing Herbs with their starting-equipment price.
  eq('herb-healing', 'Healing Herbs', 'Medicinals', money(0, 10))
)

// Converts a Flower of Battle price array into the same coin total used by the equipment shop.
const flowerPrice = (parts = [1]) => money(parts[0] || 0, parts[1] || 0, parts[2] || 0, parts[3] || 0)
Object.entries(FLOWER_WEAPONS).forEach(([weaponId, weapon]) => {
  const existing = EQUIPMENT_CATALOG.find((item) => item.weaponId === weaponId)
  const price = flowerPrice(FLOWER_WEAPON_PRICES[weaponId] || [1])
  // Updates an existing weapon entry with Flower of Battle statistics instead of adding a duplicate.
  if (existing) {
    existing.price = price
    existing.name = weapon.name
    return
  }
  const category = weapon.firearm ? 'Weapons - Firearms' : weapon.kind === 'ranged' ? 'Weapons - Missile' : weapon.profile === 'dagger' || ['cutThrust', 'greatsword', 'rapier'].includes(weapon.profile) ? 'Weapons - Blades' : 'Weapons - Hafted'
  EQUIPMENT_CATALOG.push(eq(`weapon-${weaponId}`, weapon.name, category, price, { weaponId }))
})
FLOWER_ARMOR_EQUIPMENT.forEach(([id, name, price, extra = {}]) => {
  // Adds a Flower of Battle armor item only when the core catalog does not already contain it.
  if (!EQUIPMENT_CATALOG.some((item) => item.id === id)) EQUIPMENT_CATALOG.push(eq(id, name, extra.shield ? 'Armor - Shields' : id.startsWith('fob-head') ? 'Armor - Head' : 'Armor - Body', flowerPrice(price), extra))
})
// These armor proficiencies group protective equipment by the material-handling training it requires.
const ARMOR_PROFICIENCIES = {
  padded: 'Padded Armor',
  leather: 'Leather Armor',
  mail: 'Mail Armor',
  plate: 'Plate Armor',
  shield: 'Shield Use',
}

// These detailed body regions drive both the builder silhouette and location-sensitive protection totals.
const ARMOR_ZONE_LABELS = {
  head: 'Head', face: 'Face', neck: 'Neck', shoulders: 'Shoulders', chest: 'Chest', abdomen: 'Abdomen', back: 'Back',
  upperArms: 'Upper arms', forearms: 'Forearms', hands: 'Hands', hips: 'Hips', thighs: 'Thighs', knees: 'Knees', shins: 'Lower legs', feet: 'Feet',
}

// Broad combat targets are averages of their detailed body regions, preventing a gorget or single glove from protecting an entire target zone.
const ARMOR_COMBAT_ZONES = {
  head: ['head', 'face', 'neck'],
  torso: ['shoulders', 'chest', 'abdomen', 'back'],
  arms: ['shoulders', 'upperArms', 'forearms', 'hands'],
  legs: ['hips', 'thighs', 'knees', 'shins', 'feet'],
}

// Major armor loadouts map their armor-option identifiers to the body regions covered by the purchased garment or suit.
const ARMOR_OPTION_COVERAGE = {
  leatherSleeves: ['shoulders', 'chest', 'abdomen', 'back', 'upperArms', 'forearms'],
  leatherNoSleeves: ['shoulders', 'chest', 'abdomen', 'back'],
  chainSleeves: ['shoulders', 'chest', 'abdomen', 'back', 'upperArms', 'forearms'],
  chainNoSleeves: ['shoulders', 'chest', 'abdomen', 'back'],
  chainFull: ['neck', 'shoulders', 'chest', 'abdomen', 'back', 'upperArms', 'forearms', 'hands', 'hips', 'thighs', 'knees', 'shins'],
  breastplate: ['shoulders', 'chest', 'abdomen', 'back'],
  plateFull: ['neck', 'shoulders', 'chest', 'abdomen', 'back', 'upperArms', 'forearms', 'hands', 'hips', 'thighs', 'knees', 'shins', 'feet'],
  aketon: ['shoulders', 'chest', 'abdomen', 'back', 'upperArms', 'forearms'],
  leatherDoublet: ['shoulders', 'chest', 'abdomen', 'back', 'upperArms', 'forearms'],
  cuirBouilliDoublet: ['shoulders', 'chest', 'abdomen', 'back', 'upperArms', 'forearms'],
  scaledDoublet: ['shoulders', 'chest', 'abdomen', 'back', 'upperArms', 'forearms'],
  lightMailBirnie: ['shoulders', 'chest', 'abdomen', 'back', 'upperArms', 'hips'],
  mailBirnie: ['shoulders', 'chest', 'abdomen', 'back', 'upperArms', 'forearms', 'hips'],
  doubledMailBirnie: ['shoulders', 'chest', 'abdomen', 'back', 'upperArms', 'forearms', 'hips'],
  bandedMailBirnie: ['shoulders', 'chest', 'abdomen', 'back', 'upperArms', 'forearms', 'hips'],
  breastplateLeatherBack: ['shoulders', 'chest', 'abdomen', 'back'],
  cuirass: ['shoulders', 'chest', 'abdomen', 'back'],
  hauberk: ['neck', 'shoulders', 'chest', 'abdomen', 'back', 'upperArms', 'forearms', 'hips', 'thighs'],
  leatherLeggings: ['hips', 'thighs', 'knees', 'shins'],
  chausses: ['hips', 'thighs', 'knees', 'shins', 'feet'],
  lightMailSuit: ['neck', 'shoulders', 'chest', 'abdomen', 'back', 'upperArms', 'forearms', 'hands', 'hips', 'thighs', 'knees', 'shins'],
  mailSuit: ['neck', 'shoulders', 'chest', 'abdomen', 'back', 'upperArms', 'forearms', 'hands', 'hips', 'thighs', 'knees', 'shins'],
  doubledMailSuit: ['neck', 'shoulders', 'chest', 'abdomen', 'back', 'upperArms', 'forearms', 'hands', 'hips', 'thighs', 'knees', 'shins'],
  bandedMailSuit: ['neck', 'shoulders', 'chest', 'abdomen', 'back', 'upperArms', 'forearms', 'hands', 'hips', 'thighs', 'knees', 'shins'],
  lightPlateSuit: ['neck', 'shoulders', 'chest', 'abdomen', 'back', 'upperArms', 'forearms', 'hands', 'hips', 'thighs', 'knees', 'shins', 'feet'],
  heavyPlateSuit: ['neck', 'shoulders', 'chest', 'abdomen', 'back', 'upperArms', 'forearms', 'hands', 'hips', 'thighs', 'knees', 'shins', 'feet'],
}

// Shared catalog items are cloned when several armor rules use the same historical garment, preserving one purchasable item for every armor option.
const claimedArmorItems = new Set()
Object.entries(ARMOR_OPTIONS).forEach(([armorId, armor]) => {
  let item = EQUIPMENT_CATALOG.find((entry) => entry.id === armor.itemId)
  if (!item) return
  if (claimedArmorItems.has(item.id) || item.armorId && item.armorId !== armorId) {
    item = eq(`${item.id}-${armorId}`, armor.name.replace(/\s*\(AV\s*\d+\).*/, ''), item.category, item.price, { armorId })
    EQUIPMENT_CATALOG.push(item)
    armor.itemId = item.id
  } else {
    item.armorId = armorId
  }
  claimedArmorItems.add(item.id)
  const proficiency = ['cloth'].includes(armor.material) ? 'padded' : ['leather', 'cuirBouilli'].includes(armor.material) ? 'leather' : ['lightMail', 'mail', 'doubledMail', 'bandedMail', 'scale'].includes(armor.material) ? 'mail' : 'plate'
  item.armorPiece = { proficiency, coverage: ARMOR_OPTION_COVERAGE[armorId] || ['chest', 'abdomen', 'back'], value: armor.value, material: armor.material || proficiency, poolPenalty: armor.poolPenalty || 0, minor: false }
})

// Minor armor profiles restore helmets, coifs, neck defenses, gloves, arm defenses, leg defenses, and footwear as functional purchases.
const MINOR_ARMOR_PROFILES = {
  'armor-chain-coif': ['mail', ['head', 'neck'], 4, 'mail'],
  'armor-pot-helm': ['plate', ['head'], 4, 'plate'],
  'armor-full-helm': ['plate', ['head', 'face', 'neck'], 5, 'plate'],
  'fob-armor-arming-glove': ['leather', ['hands'], 2, 'leather'],
  'fob-armor-banded-gloves': ['mail', ['hands', 'forearms'], 4, 'bandedMail'],
  'fob-armor-greaves': ['plate', ['knees', 'shins', 'feet'], 5, 'plate'],
  'fob-armor-gauntlets': ['plate', ['forearms', 'hands'], 5, 'plate'],
  'fob-armor-leather-boots': ['leather', ['shins', 'feet'], 2, 'leather'],
  'fob-armor-leather-gloves': ['leather', ['hands'], 2, 'leather'],
  'fob-armor-light-mail-gloves': ['mail', ['hands'], 3, 'lightMail'],
  'fob-armor-poleyn': ['plate', ['knees'], 5, 'plate'],
  'fob-armor-vambrace': ['plate', ['upperArms', 'forearms'], 5, 'plate'],
  'fob-armor-tassets': ['plate', ['hips', 'thighs'], 5, 'plate'],
  'fob-head-aventail': ['mail', ['neck', 'shoulders'], 4, 'mail'],
  'fob-head-full-helm': ['plate', ['head', 'face', 'neck'], 5, 'plate'],
  'fob-head-gorget': ['plate', ['neck'], 5, 'plate'],
  'fob-head-kettle': ['plate', ['head'], 4, 'plate'],
  'fob-head-leather-coif': ['leather', ['head', 'neck'], 2, 'leather'],
  'fob-head-mail-coif': ['mail', ['head', 'neck'], 4, 'mail'],
  'fob-head-ventail-coif': ['mail', ['head', 'face', 'neck'], 4, 'mail'],
  'fob-head-pot-helm': ['plate', ['head'], 4, 'plate'],
}
Object.entries(MINOR_ARMOR_PROFILES).forEach(([itemId, [proficiency, coverage, value, material]]) => {
  const item = EQUIPMENT_CATALOG.find((entry) => entry.id === itemId)
  if (item) {
    item.armorPiece = { proficiency, coverage, value, material, poolPenalty: 0, minor: true }
    // Places head and neck defenses together while routing limb pieces to the body-armor shop list.
    item.category = itemId.startsWith('fob-head') || ['armor-chain-coif', 'armor-pot-helm', 'armor-full-helm'].includes(itemId) ? 'Armor - Head' : 'Armor - Body'
  }
})
EQUIPMENT_CATALOG.filter((item) => item.shield).forEach((item) => {
  item.armorPiece = { proficiency: 'shield', coverage: [], value: item.shield.armor || 0, material: 'shield', poolPenalty: item.shield.poolPenalty || 0, minor: true }
  item.category = 'Armor - Shields'
})
// Keeps same-named Core and Flower of Battle helmet entries distinguishable instead of showing apparent duplicates in the shop.
EQUIPMENT_CATALOG.find((item) => item.id === 'armor-pot-helm').name = 'Pot Helm (Core)'
EQUIPMENT_CATALOG.find((item) => item.id === 'armor-full-helm').name = 'Full Helm (Core)'
// Collects all major suits and garments into the body-armor category for a simpler shop layout.
EQUIPMENT_CATALOG.filter((item) => item.armorPiece && !item.armorPiece.minor).forEach((item) => { item.category = 'Armor - Body' })
// Stores the equipment by id values used by the rest of this file.
const EQUIPMENT_BY_ID = Object.fromEntries(EQUIPMENT_CATALOG.map((item) => [item.id, item]))
// Stores the builder equipment catalog values used by the rest of this file.
const BUILDER_EQUIPMENT_CATALOG = EQUIPMENT_CATALOG.filter((item) => !item.category.startsWith('Armor') || item.armorPiece)
// Builds the purchasable weapon/proficiency mapping after the combat weapon catalog has loaded.
const getBuilderWeaponOptions = () => Array.from(
  new Map(BUILDER_EQUIPMENT_CATALOG.filter((item) => item.weaponId && MELEE_WEAPONS[item.weaponId]).map((item) => [item.weaponId, MELEE_WEAPONS[item.weaponId]])).entries()
)
// Stores the builder armor options values used by the rest of this file.
const BUILDER_ARMOR_OPTIONS = Object.fromEntries([
  ['none', ARMOR_OPTIONS.none],
  ...BUILDER_EQUIPMENT_CATALOG.filter((item) => item.armorId && ARMOR_OPTIONS[item.armorId]).map((item) => [item.armorId, ARMOR_OPTIONS[item.armorId]]),
])
// Stores the item use effects values used by the rest of this file.
const ITEM_USE_EFFECTS = {
  'gear-travel-pack': { message: 'You check and organize the travel pack.', condition: 'Travel pack organized' },
  'gear-rations': { message: 'You eat a ration and recover 1 Fatigue.', fatigueRecovery: 1, consume: true },
  'gear-waterskin': { message: 'You drink from the waterskin and recover 1 Fatigue.', fatigueRecovery: 1 },
  'gear-torch': { message: 'You light a torch.', condition: 'Carrying a lit torch', consume: true },
  'gear-whetstone': { message: 'You clean and sharpen the equipped weapon.', condition: 'Weapon maintained' },
  'herb-stimulant': { message: 'The stimulant herbs remove all current Pain, Shock, Fatigue, and Knockout.', stimulant: true, consume: true },
  'herb-healing': { message: 'The healing herbs reduce the highest current wound by one level.', healing: true, consume: true },
}

// Manages the start screen, character builder, character sheet, inventory actions, and save slots.
class GameUI {
  // Initializes the instance state and connects the dependencies used by later methods.
  constructor({ onEnterMap = () => {}, getSaveState = () => ({}), onLoadSave = () => {} } = {}) {
    this.onEnterMap = onEnterMap
    this.getSaveState = getSaveState
    this.onLoadSave = onLoadSave
    this.mode = 'start'
    this.character = null
    this.cart = new Map()
    this.povertyFallbackActive = false
    this.characterPointBudget = 70
    this.activeSheetTab = 'character'
    this.selectedSpriteId = DEFAULT_CHARACTER_SPRITE_ID
    this.cacheElements()
    this.buildControls()
    this.bindEvents()
    this.restorePointBuyDefaults()
  }

  // Finds the page elements this system updates and keeps references to them for fast reuse.
  cacheElements() {
    const one = (selector) => document.querySelector(selector)
    this.startScreen = one('#start-screen'); this.builderScreen = one('#character-builder'); this.builderForm = one('#character-builder-form'); this.characterMenu = one('#character-menu'); this.spriteGrid = one('#character-sprite-grid')
    this.identityInputs = { nationality: one('#character-nationality'), sex: one('#character-sex'), age: one('#character-age'), height: one('#character-height'), weight: one('#character-weight'), religion: one('#character-religion'), liege: one('#character-liege'), insight: one('#character-insight') }
    this.pointTotal = one('#character-point-total'); this.pointSummary = one('#point-buy-summary'); this.socialClass = one('#social-class')
    this.attributeGrid = one('#attribute-grid'); this.attributeSummary = one('#attribute-summary'); this.highAttribute = one('#high-attribute'); this.balanceButton = one('#balance-attributes')
    this.primaryWeapon = one('#primary-weapon'); this.secondaryWeapon = one('#secondary-weapon'); this.primaryProficiency = one('#primary-proficiency'); this.secondaryProficiency = one('#secondary-proficiency'); this.proficiencySummary = one('#proficiency-summary')
    this.giftFlawGrid = one('#gift-flaw-grid'); this.giftFlawNotes = one('#gift-flaw-notes'); this.spiritualGrid = one('#spiritual-grid'); this.spiritualSummary = one('#spiritual-summary')
    this.equipmentCategory = one('#equipment-category'); this.equipmentItem = one('#equipment-item'); this.equipmentQuantity = one('#equipment-quantity'); this.equipmentAdd = one('#equipment-add'); this.wealthSummary = one('#wealth-summary'); this.equipmentCart = one('#equipment-cart')
    this.armorSelect = one('#character-armor'); this.damageRules = one('#damage-rules'); this.derivedReflex = one('#derived-reflex'); this.derivedPool = one('#derived-cp'); this.derivedMissilePool = one('#derived-mp'); this.derivedArmor = one('#derived-armor')
    this.armorBodyZones = Array.from(document.querySelectorAll('[data-armor-zone]')); this.armorPreviewName = one('#armor-preview-name'); this.armorPreviewProfile = one('#armor-preview-profile'); this.armorPreviewZones = one('#armor-preview-zones'); this.armorOwnedSummary = one('#armor-owned-summary')
    this.errorElement = one('#builder-error'); this.sheetName = one('#sheet-name'); this.sheetTabs = one('#character-sheet-tabs'); this.sheetContent = one('#character-sheet-content'); this.profileArt = one('.barbarian-profile-art')
  }

  // Creates controls from the current saved data.
  buildControls() {
    this.armorBodyZones.forEach((zone) => zone.classList.add('armor-body-zone'))
    CHARACTER_SPRITES.forEach((sprite) => {
      const label = document.createElement('label'); label.className = 'character-sprite-option'; label.title = sprite.name
      const input = document.createElement('input'); input.type = 'radio'; input.name = 'character-sprite'; input.value = sprite.id; input.checked = sprite.id === this.selectedSpriteId
      const portrait = document.createElement('img'); portrait.src = sprite.portrait; portrait.alt = ''
      const name = document.createElement('span'); name.textContent = sprite.name
      label.append(input, portrait, name); this.spriteGrid.appendChild(label)
    })
    Object.entries(SOCIAL_CLASSES).forEach(([key, value]) => this.addOption(this.socialClass, key, `${value.name} (${value.cost} CP; ${value.wealth} gold)`))
    CHARACTER_ATTRIBUTES.forEach(([key, label]) => {
      this.addOption(this.highAttribute, key, label)
      const wrapper = document.createElement('label'); wrapper.textContent = label
      const input = document.createElement('input'); input.type = 'number'; input.min = ['strength', 'toughness'].includes(key) ? '0' : '2'; input.max = '7'; input.dataset.attribute = key
      wrapper.appendChild(input); this.attributeGrid.appendChild(wrapper)
    })
    getBuilderWeaponOptions().forEach(([key, weapon]) => {
      const suffix = weapon.kind === 'ranged' ? ' (Missile)' : ' (Melee)'
      this.addOption(this.primaryWeapon, key, weapon.name + suffix); this.addOption(this.secondaryWeapon, key, weapon.name + suffix)
    })
    Object.entries(BUILDER_ARMOR_OPTIONS).forEach(([key, armor]) => this.addOption(this.armorSelect, key, `${armor.name}${armor.name.includes('(AV ') ? '' : ` (AV ${armor.value})`} · CP ${armor.poolPenalty ? '-' + armor.poolPenalty : '0'}`))
    for (let slot = 1; slot <= 4; slot++) {
      const label = document.createElement('label'); label.textContent = `Gift / Flaw ${slot}`
      const select = document.createElement('select'); select.dataset.giftFlaw = String(slot)
      Object.entries(GIFT_FLAW_OPTIONS).forEach(([key, data]) => this.addOption(select, key, data.cost ? `${data.name} (${data.cost > 0 ? '+' : ''}${data.cost} CP)` : data.name))
      label.appendChild(select); this.giftFlawGrid.appendChild(label)
    }
    this.giftFlawSelects = Array.from(this.giftFlawGrid.querySelectorAll('select'))
    const spiritualDefaults = [['Conscience', 'Do what is right', 1], ['Destiny', 'Rise from exile to lead a free people', 1], ['Drive', 'Protect the weak', 2], ['Oath', 'Never abandon a companion', 1], ['Passion', 'Loyalty to my people', 2]]
    spiritualDefaults.forEach(([type, focus, value], index) => {
      const row = document.createElement('div'); row.className = 'spiritual-row'
      const typeSelect = document.createElement('select'); typeSelect.dataset.spiritualType = String(index)
      ;['Conscience', 'Destiny', 'Drive', 'Faith', 'Oath', 'Passion'].forEach((name) => this.addOption(typeSelect, name, name)); typeSelect.value = type
      const focusInput = document.createElement('input'); focusInput.dataset.spiritualFocus = String(index); focusInput.placeholder = 'Focus'; focusInput.value = focus
      const valueInput = document.createElement('input'); valueInput.dataset.spiritualValue = String(index); valueInput.type = 'number'; valueInput.min = '0'; valueInput.max = '5'; valueInput.value = String(value)
      row.append(typeSelect, focusInput, valueInput); this.spiritualGrid.appendChild(row)
    })
    this.spiritualTypeSelects = Array.from(this.spiritualGrid.querySelectorAll('[data-spiritual-type]'))
    this.spiritualFocusInputs = Array.from(this.spiritualGrid.querySelectorAll('[data-spiritual-focus]'))
    this.spiritualValueInputs = Array.from(this.spiritualGrid.querySelectorAll('[data-spiritual-value]'))
    Array.from(new Set(BUILDER_EQUIPMENT_CATALOG.map((item) => item.category))).forEach((category) => this.addOption(this.equipmentCategory, category, category))
    this.refreshEquipmentItems()
  }

  // Adds option to the current interface or record.
  addOption(select, value, label) { const option = document.createElement('option'); option.value = value; option.textContent = label; select.appendChild(option) }

  // Connects buttons, selectors, keyboard input, and inventory actions to their matching game behavior.
  bindEvents() {
    this.spriteGrid.addEventListener('change', (event) => { if (!event.target.matches('input[name="character-sprite"]')) return; this.selectedSpriteId = event.target.value })
    this.highAttribute.addEventListener('change', () => { this.rebalanceAttributes(); this.updateBuilder() })
    this.balanceButton.addEventListener('click', () => this.restorePointBuyDefaults())
    this.socialClass.addEventListener('change', () => this.updateBuilder())
    this.equipmentCategory.addEventListener('change', () => { this.refreshEquipmentItems(); this.renderArmorCoverage() })
    this.equipmentItem.addEventListener('change', () => this.renderArmorCoverage())
    this.equipmentAdd.addEventListener('click', () => this.purchaseEquipment())
    this.equipmentCart.addEventListener('click', (event) => { const button = event.target.closest('[data-remove-item]'); if (!button) return; this.cart.delete(button.dataset.removeItem); this.renderCart(); this.updateBuilder() })
    const controls = [this.attributeGrid, this.identityInputs.insight, this.primaryWeapon, this.secondaryWeapon, this.primaryProficiency, this.secondaryProficiency, ...this.giftFlawSelects, this.giftFlawNotes, this.spiritualGrid, this.armorSelect, this.damageRules]
    controls.forEach((element) => { element.addEventListener('input', () => this.updateBuilder()); element.addEventListener('change', () => this.updateBuilder()) })
    this.builderForm.addEventListener('submit', (event) => { event.preventDefault(); this.finishCharacter() })
  }

  // Restores point buy defaults to the default character-builder values.
  restorePointBuyDefaults() {
    this.socialClass.value = 'highFreeman'; this.highAttribute.value = 'agility'; this.primaryWeapon.value = 'longsword'; this.secondaryWeapon.value = 'spear'; this.primaryProficiency.value = '7'; this.secondaryProficiency.value = '0'; this.identityInputs.insight.value = '0'; this.armorSelect.value = 'none'
    this.selectedSpriteId = DEFAULT_CHARACTER_SPRITE_ID
    const defaultSpriteInput = this.spriteGrid.querySelector(`input[value="${this.selectedSpriteId}"]`); if (defaultSpriteInput) defaultSpriteInput.checked = true
    const defaults = { strength: 4, toughness: 4, agility: 4, endurance: 4, health: 4, willpower: 4, wit: 4, perception: 4 }
    this.attributeGrid.querySelectorAll('[data-attribute]').forEach((input) => { input.value = defaults[input.dataset.attribute] })
    this.giftFlawSelects.forEach((select) => { select.value = 'none' }); this.cart.clear(); this.cart.set('clothes-peasant', 1); this.cart.set('gear-travel-pack', 1); this.cart.set('herb-stimulant', 4); this.cart.set('herb-healing', 2); this.renderCart(); this.updateBuilder()
  }

  // Responds to key down and updates the related game state.
  handleKeyDown(event) {
    if (this.mode === 'start' && event.code === 'Space') { event.preventDefault(); this.showBuilder(); return true }
    if (this.mode === 'map' && event.key.toLowerCase() === 'c') { event.preventDefault(); this.openCharacterMenu(); return true }
    if (this.mode === 'menu' && (event.key.toLowerCase() === 'c' || event.key === 'Escape')) { event.preventDefault(); this.closeCharacterMenu(); return true }
    return this.mode !== 'map'
  }
  // Hides the title screen, opens the Character Builder, and focuses the character-name field.
  showBuilder() { this.mode = 'builder'; this.startScreen.hidden = true; this.builderScreen.hidden = false; document.querySelector('#character-name').focus() }
  // Checks whether map active is true.
  isMapActive() { return this.mode === 'map' }
  // Returns the current character.
  getCharacter() { return this.character }
  // Clears the defeated character and returns the player to a fresh Character Builder.
  restartCharacterBuilder() {
    const inheritedInsight = Math.max(0, Math.floor(Number(this.character?.insight) || 0))
    this.characterPointBudget = 70 + inheritedInsight
    this.character = null
    this.characterMenu.hidden = true
    this.startScreen.hidden = true
    this.builderScreen.hidden = false
    this.mode = 'builder'
    this.errorElement.textContent = ''
    this.restorePointBuyDefaults()
    try { localStorage.removeItem('tros-character') } catch (storageError) { console.warn('The defeated character could not be cleared locally.', storageError) }
    document.querySelector('#character-name').focus()
  }
  // Returns a knocked-out character to the map spawn, clears unconsciousness, and removes half their coins.
  recoverFromKnockout() {
    if (!this.character) return
    this.ensureCharacterState(this.character)
    const conditions = this.character.conditions
    conditions.unconsciousRounds = 0
    conditions.knockedDown = false
    conditions.coma = false
    conditions.dead = false
    this.character.wealthTotal = Math.floor(this.character.wealthTotal / 2)
    this.character.remainingWealth = formatCurrency(this.character.wealthTotal)
    this.characterMenu.hidden = true
    this.builderScreen.hidden = true
    this.mode = 'map'
    this.persistCharacter()
    this.onEnterMap(this.character)
  }

  // Returns the current attributes.
  getAttributes() { return Array.from(this.attributeGrid.querySelectorAll('[data-attribute]')).reduce((result, input) => { result[input.dataset.attribute] = Number(input.value); return result }, {}) }
  // Returns the character-point cost for one chosen attribute rank.
  attributeCost(value) { return value <= 6 ? value : value === 7 ? 9 : Infinity }
  // Returns the character-point cost for one weapon proficiency rank.
  proficiencyCost(rank) { return rank <= 6 ? rank : rank === 7 ? 8 : rank === 8 ? 12 : Infinity }
  // Restores every attribute to 4 and then reapplies the selected high attribute.
  rebalanceAttributes() {
    const highKey = this.highAttribute.value || 'agility'
    const values = Object.fromEntries(CHARACTER_ATTRIBUTES.map(([key]) => [key, ['strength', 'toughness'].includes(key) ? 4 : 2]))
    values[highKey] = 7
    const adjustable = CHARACTER_ATTRIBUTES.map(([key]) => key).filter((key) => key !== highKey && !['strength', 'toughness'].includes(key))
    let spent = Object.values(values).reduce((sum, value) => sum + this.attributeCost(value), 0)
    while (spent < 49) {
      const key = adjustable.find((attribute) => values[attribute] < 6)
      if (!key) break
      values[key]++
      spent++
    }
    this.attributeGrid.querySelectorAll('[data-attribute]').forEach((input) => { input.value = values[input.dataset.attribute] })
  }

  // Returns the current gift flaws.
  getGiftFlaws() { return this.giftFlawSelects.map((select) => ({ key: select.value, ...GIFT_FLAW_OPTIONS[select.value] })).filter((item) => item.type !== 'none') }
  // Returns the current point breakdown.
  getPointBreakdown() {
    const attributes = Object.values(this.getAttributes()).reduce((sum, value) => sum + this.attributeCost(value), 0); const social = SOCIAL_CLASSES[this.socialClass.value].cost
    const insight = Math.max(0, Math.floor(Number(this.identityInputs.insight.value) || 0))
    const proficiencies = this.proficiencyCost(Number(this.primaryProficiency.value)) + this.proficiencyCost(Number(this.secondaryProficiency.value)); const giftsFlaws = this.getGiftFlaws().reduce((sum, item) => sum + item.cost, 0)
    return { race: 0, social, insight, attributes, proficiencies, giftsFlaws, budget: this.characterPointBudget, total: social + insight + attributes + proficiencies + giftsFlaws }
  }

  // Returns the current spiritual attributes.
  getSpiritualAttributes() { return this.spiritualTypeSelects.map((select, index) => ({ type: select.value, focus: this.spiritualFocusInputs[index].value.trim(), value: Number(this.spiritualValueInputs[index].value) })) }
  // Returns the selected major armor loadout plus every purchased minor armor piece that supplements it.
  getEquippedArmorItems() {
    const selectedArmor = ARMOR_OPTIONS[this.armorSelect.value] || ARMOR_OPTIONS.none
    const selectedItem = selectedArmor.itemId ? EQUIPMENT_BY_ID[selectedArmor.itemId] : null
    const minorItems = Array.from(this.cart.keys())
      .map((itemId) => EQUIPMENT_BY_ID[itemId])
      .filter((item) => item?.armorPiece?.minor && !item.shield)
    return [selectedItem, ...minorItems].filter(Boolean)
  }

  // Combines layered armor pieces by detailed region and averages those regions into the four combat target zones.
  calculateArmorLoadout() {
    const selectedArmor = ARMOR_OPTIONS[this.armorSelect.value] || ARMOR_OPTIONS.none
    const items = this.getEquippedArmorItems()
    const detailedCoverage = Object.fromEntries(Object.keys(ARMOR_ZONE_LABELS).map((zone) => [zone, { value: 0, material: 'none', items: [] }]))
    items.forEach((item) => {
      const profile = item.armorPiece
      profile.coverage.forEach((zone) => {
        const coverage = detailedCoverage[zone]
        coverage.items.push(item.name)
        if (profile.value >= coverage.value) {
          coverage.value = profile.value
          coverage.material = profile.material
        }
      })
    })
    const coverageValues = Object.fromEntries(Object.entries(ARMOR_COMBAT_ZONES).map(([combatZone, parts]) => {
      const total = parts.reduce((sum, part) => sum + detailedCoverage[part].value, 0)
      const strongest = parts.map((part) => detailedCoverage[part]).sort((left, right) => right.value - left.value)[0]
      return [combatZone, { value: Math.round(total / parts.length), material: strongest.material, parts: Object.fromEntries(parts.map((part) => [part, detailedCoverage[part].value])) }]
    }))
    const armorValue = Math.max(0, ...Object.values(coverageValues).map((coverage) => coverage.value))
    const proficiencies = Array.from(new Set(items.map((item) => ARMOR_PROFICIENCIES[item.armorPiece.proficiency]))).filter(Boolean)
    const minorCount = items.filter((item) => item.armorPiece.minor).length
    return {
      ...selectedArmor,
      name: items.length ? `${selectedArmor.name}${minorCount ? ` + ${minorCount} minor piece${minorCount === 1 ? '' : 's'}` : ''}` : 'Unarmored',
      value: armorValue,
      material: selectedArmor.material || 'none',
      coverage: detailedCoverage,
      coverageValues,
      proficiencies,
      equippedArmorItemIds: items.map((item) => item.id),
    }
  }

  // Highlights owned and previewed protection on both body silhouettes and explains each piece's proficiency and covered regions.
  renderArmorCoverage() {
    const ownedItems = Array.from(this.cart.keys()).map((itemId) => EQUIPMENT_BY_ID[itemId]).filter((item) => item?.armorPiece)
    const ownedZones = new Set(ownedItems.flatMap((item) => item.armorPiece.coverage))
    const shopItem = EQUIPMENT_BY_ID[this.equipmentItem.value]
    const selectedArmorItem = EQUIPMENT_BY_ID[ARMOR_OPTIONS[this.armorSelect.value]?.itemId]
    const previewItem = shopItem?.armorPiece ? shopItem : selectedArmorItem?.armorPiece ? selectedArmorItem : null
    const previewZones = new Set(previewItem?.armorPiece.coverage || [])
    this.armorBodyZones.forEach((element) => {
      const zone = element.dataset.armorZone
      element.classList.toggle('armor-owned', ownedZones.has(zone))
      element.classList.toggle('armor-preview', previewZones.has(zone))
    })
    this.armorPreviewName.textContent = previewItem?.name || 'No armor selected'
    this.armorPreviewProfile.textContent = `Proficiency: ${previewItem ? ARMOR_PROFICIENCIES[previewItem.armorPiece.proficiency] : 'None'}${previewItem ? ` · AV ${previewItem.armorPiece.value}` : ''}`
    this.armorPreviewZones.textContent = `Coverage: ${previewItem?.armorPiece.coverage.length ? previewItem.armorPiece.coverage.map((zone) => ARMOR_ZONE_LABELS[zone]).join(', ') : previewItem?.shield ? 'Mobile shield defense' : 'None'}`
    this.armorOwnedSummary.replaceChildren()
    if (!ownedItems.length) {
      const empty = document.createElement('div')
      empty.textContent = 'No protective equipment purchased.'
      this.armorOwnedSummary.appendChild(empty)
      return
    }
    ownedItems.forEach((item) => {
      const row = document.createElement('div')
      row.textContent = `${item.name} — ${ARMOR_PROFICIENCIES[item.armorPiece.proficiency]} · AV ${item.armorPiece.value}`
      this.armorOwnedSummary.appendChild(row)
    })
  }

  // Calculates derived from the current game values.
  calculateDerived() {
    const attributes = this.getAttributes(); const reflex = Math.floor((attributes.agility + attributes.wit) / 2); const aim = Math.floor((attributes.agility + attributes.perception) / 2); const knockdown = Math.floor((attributes.strength + attributes.agility) / 2); const knockout = attributes.toughness + Math.floor(attributes.willpower / 2); const move = Math.floor((attributes.strength + attributes.agility + attributes.endurance) / 2); const armor = this.calculateArmorLoadout()
    const proficiencies = this.getProficiencies(); const combatPools = {}; const missilePools = {}
    Object.entries(proficiencies).forEach(([weaponId, rank]) => { if (MELEE_WEAPONS[weaponId].kind === 'ranged') missilePools[weaponId] = Math.max(0, aim + rank - armor.poolPenalty); else combatPools[weaponId] = Math.max(0, reflex + rank - armor.poolPenalty) })
    const combatPool = Math.max(reflex - armor.poolPenalty, ...Object.values(combatPools)); const missilePool = Math.max(aim - armor.poolPenalty, ...Object.values(missilePools))
    return { reflex, aim, knockdown, knockout, move, armor, combatPool, missilePool, combatPools, missilePools }
  }
  // Returns the current proficiencies.
  getProficiencies() { const result = { [this.primaryWeapon.value]: Number(this.primaryProficiency.value) }; const secondary = Number(this.secondaryProficiency.value); if (secondary > 0) result[this.secondaryWeapon.value] = secondary; return result }

  // Refreshes equipment items so it matches the latest selections.
  refreshEquipmentItems() { this.equipmentItem.replaceChildren(); BUILDER_EQUIPMENT_CATALOG.filter((item) => item.category === this.equipmentCategory.value).forEach((item) => this.addOption(this.equipmentItem, item.id, `${item.name} - ${this.formatMoney(item.price)}`)); this.renderArmorCoverage() }
  // Returns the current starting wealth.
  getStartingWealth() {
    let wealth = money(SOCIAL_CLASSES[this.socialClass.value].wealth); const selections = this.getGiftFlaws(); if (selections.some((item) => item.type === 'gift' && item.baseName === 'Wealthy' && item.level === 'major')) wealth *= 2; if (selections.some((item) => item.type === 'flaw' && item.baseName === 'Poor' && item.level === 'minor')) wealth = Math.floor(wealth / 2); if (selections.some((item) => item.type === 'flaw' && item.baseName === 'Poor' && item.level === 'major')) wealth = 0; return wealth
  }
  // Returns the current s free dagger.
  getsFreeDagger() { return this.getStartingWealth() <= 0 }
  // Adjusts poverty loadout so it follows the game's minimum equipment rules.
  normalizePovertyLoadout() {
    const needsFallback = this.getsFreeDagger()
    if (needsFallback) {
      this.cart.clear()
      this.primaryWeapon.value = 'poniard'
      this.secondaryProficiency.value = '0'
      this.armorSelect.value = 'none'
    }
    if (needsFallback !== this.povertyFallbackActive) {
      this.povertyFallbackActive = needsFallback
      this.renderCart()
    }
  }
  // Returns the current cart total.
  getCartTotal() { return Array.from(this.cart).reduce((sum, [id, quantity]) => sum + EQUIPMENT_BY_ID[id].price * quantity, 0) }
  // Formats money as readable text for the interface.
  formatMoney(total) { return formatCurrency(total) }
  // Purchases equipment when the character can afford it.
  purchaseEquipment() { const id = this.equipmentItem.value; const quantity = Math.max(1, Math.min(99, Number(this.equipmentQuantity.value) || 1)); const item = EQUIPMENT_BY_ID[id]; if (!item) return; if (this.getCartTotal() + item.price * quantity > this.getStartingWealth()) { this.errorElement.textContent = `You cannot afford ${quantity} × ${item.name}.`; return } this.cart.set(id, (this.cart.get(id) || 0) + quantity); this.errorElement.textContent = ''; this.renderCart(); this.updateBuilder() }
  // Updates the visible cart using the latest game state.
  renderCart() {
    this.equipmentCart.replaceChildren()
    Array.from(this.cart).forEach(([id, quantity]) => {
      const item = EQUIPMENT_BY_ID[id]; const row = document.createElement('div'); row.className = 'equipment-cart-row'; const name = document.createElement('span'); name.textContent = `${quantity} × ${item.name}`; const cost = document.createElement('strong'); cost.textContent = this.formatMoney(item.price * quantity); const remove = document.createElement('button'); remove.type = 'button'; remove.dataset.removeItem = id; remove.textContent = 'Remove'; row.append(name, cost, remove); this.equipmentCart.appendChild(row)
    })
    if (this.getsFreeDagger()) {
      const row = document.createElement('div'); row.className = 'equipment-cart-row poverty-fallback'; const name = document.createElement('span'); name.textContent = '1 × Poniard (minimum dagger)'; const cost = document.createElement('strong'); cost.textContent = 'Granted'; const status = document.createElement('span'); status.textContent = 'Cannot be sold'; row.append(name, cost, status); this.equipmentCart.appendChild(row)
    }
  }

  // Updates builder to match the current frame or game state.
  updateBuilder() {
    this.normalizePovertyLoadout()
    const breakdown = this.getPointBreakdown(); this.pointTotal.textContent = `${breakdown.total} / ${breakdown.budget}`; this.pointTotal.style.color = breakdown.total === breakdown.budget ? '#ffe7a0' : '#ff9d8f'; this.pointSummary.textContent = `Human 0 · Social Class ${breakdown.social} · Insight ${breakdown.insight} · Attributes ${breakdown.attributes} · Proficiencies ${breakdown.proficiencies} · Gifts/Flaws ${breakdown.giftsFlaws} · Available ${breakdown.budget}`
    const sevenCount = Object.values(this.getAttributes()).filter((value) => value === 7).length; this.attributeSummary.textContent = `${breakdown.attributes} points spent; ${sevenCount} attribute at rank 7 (maximum one).`; this.attributeSummary.style.color = sevenCount <= 1 ? '#aee4bc' : '#ff9d8f'
    const ranks = [Number(this.primaryProficiency.value), Number(this.secondaryProficiency.value)]; this.proficiencySummary.textContent = `${breakdown.proficiencies} points spent (rank 7 costs 8; rank 8 costs 12).`; this.proficiencySummary.style.color = ranks.filter((rank) => rank === 8).length <= 1 ? '#aee4bc' : '#ff9d8f'
    const spiritualTotal = this.getSpiritualAttributes().reduce((sum, item) => sum + item.value, 0); this.spiritualSummary.textContent = `${spiritualTotal} / 7 Spiritual Attribute points assigned.`; this.spiritualSummary.style.color = spiritualTotal === 7 ? '#aee4bc' : '#ff9d8f'
    const starting = this.getStartingWealth(); const spent = this.getCartTotal(); this.wealthSummary.textContent = `Starting wealth ${this.formatMoney(starting)} · Spent ${this.formatMoney(spent)} · Remaining ${this.formatMoney(starting - spent)}${this.getsFreeDagger() ? ' · Free dagger granted' : ''}`; this.wealthSummary.style.color = spent <= starting ? '#aee4bc' : '#ff9d8f'
    const derived = this.calculateDerived(); this.derivedReflex.textContent = derived.reflex; this.derivedPool.textContent = derived.combatPool; this.derivedMissilePool.textContent = derived.missilePool; this.derivedArmor.textContent = derived.armor.value; this.renderArmorCoverage()
  }

  // Checks character and returns a clear message when a choice is invalid.
  validateCharacter() {
    const age = Number(this.identityInputs.age.value), insight = Number(this.identityInputs.insight.value); if (!Number.isInteger(age) || age < 1 || age > 120) return 'Age must be a whole number from 1 to 120.'; if (!Number.isInteger(insight) || insight < 0) return 'Insight must be a non-negative whole number.'
    const attributes = this.getAttributes(); if (Object.entries(attributes).some(([key, value]) => !Number.isInteger(value) || value < (['strength', 'toughness'].includes(key) ? 0 : 2) || value > 7)) return 'Strength and Toughness must be whole numbers from 0 to 7; every other attribute must be from 2 to 7.'; if (Object.values(attributes).filter((value) => value === 7).length > 1) return 'Only one beginning attribute may be rank 7.'
    const primary = Number(this.primaryProficiency.value), secondary = Number(this.secondaryProficiency.value); if (![primary, secondary].every((rank) => Number.isInteger(rank) && rank >= 0 && rank <= 8)) return 'Proficiencies must be whole ranks from 0 to 8.'; if (primary <= 0) return 'Purchase at least one rank in the primary weapon proficiency.'; if ([primary, secondary].filter((rank) => rank === 8).length > 1) return 'Only one beginning proficiency may be rank 8.'; if (secondary > 0 && this.primaryWeapon.value === this.secondaryWeapon.value) return 'Choose a different secondary weapon proficiency.'
    const giftFlaws = this.getGiftFlaws(); const keys = giftFlaws.map((item) => item.key); if (new Set(keys).size !== keys.length) return 'Each exact gift/flaw version may only be selected once.'; if (giftFlaws.some((item) => item.baseName === 'Poor') && ['slave', 'peasant'].includes(this.socialClass.value)) return 'The Poor flaw is unavailable below Freeman social class.'; if (giftFlaws.some((item) => item.baseName === 'Poor') && giftFlaws.some((item) => item.baseName === 'Wealthy')) return 'Wealthy and Poor cannot be selected together.'
    const spiritual = this.getSpiritualAttributes(); if (spiritual.some((item) => !Number.isInteger(item.value) || item.value < 0 || item.value > 5)) return 'Each Spiritual Attribute must be from 0 to 5.'; if (spiritual.reduce((sum, item) => sum + item.value, 0) !== 7) return 'Assign exactly 7 points among five Spiritual Attributes.'; if (spiritual.some((item) => item.type !== 'Conscience' && !item.focus)) return 'Every Spiritual Attribute except Conscience needs a focus.'; const limited = spiritual.filter((item) => !['Oath', 'Passion'].includes(item.type)).map((item) => item.type); if (new Set(limited).size !== limited.length) return 'Only Oath and Passion may be selected more than once.'
    const breakdown = this.getPointBreakdown(), total = breakdown.total; if (total !== breakdown.budget) return `${total < breakdown.budget ? 'Spend' : 'Remove'} ${Math.abs(breakdown.budget - total)} character point${Math.abs(breakdown.budget - total) === 1 ? '' : 's'} to finish at exactly ${breakdown.budget}.`
    if (this.getCartTotal() > this.getStartingWealth()) return 'Starting equipment exceeds available wealth.'; const armor = ARMOR_OPTIONS[this.armorSelect.value]; if (armor.itemId && !this.cart.has(armor.itemId)) return `Purchase ${armor.name} before equipping it.`; const ownedWeapons = new Set(Array.from(this.cart.keys()).map((id) => EQUIPMENT_BY_ID[id].weaponId).filter(Boolean)); if (this.getsFreeDagger()) ownedWeapons.add('poniard'); if (!ownedWeapons.has(this.primaryWeapon.value)) return `Purchase ${MELEE_WEAPONS[this.primaryWeapon.value].name} before making it primary.`; if (secondary > 0 && !ownedWeapons.has(this.secondaryWeapon.value)) return `Purchase ${MELEE_WEAPONS[this.secondaryWeapon.value].name} before using its proficiency.`
    return ''
  }

  // Finishes character and moves to the next game state.
  finishCharacter() {
    const pointBreakdown = this.getPointBreakdown()
    const unspentPoints = Math.max(0, pointBreakdown.budget - pointBreakdown.total)
    if (unspentPoints > 0) {
      this.identityInputs.insight.value = String(Number(this.identityInputs.insight.value) + unspentPoints)
      this.updateBuilder()
    }
    const error = this.validateCharacter(); if (error) { this.errorElement.textContent = error; return }
    const attributes = this.getAttributes(), derived = this.calculateDerived(), proficiencies = this.getProficiencies(), giftFlaws = this.getGiftFlaws(), spiritualAttributes = this.getSpiritualAttributes(), socialClass = SOCIAL_CLASSES[this.socialClass.value], pointBuy = this.getPointBreakdown(); const highAttribute = Object.entries(attributes).sort((a, b) => b[1] - a[1])[0][0]; const philosophy = document.querySelector('#character-philosophy').value.trim(); const remainingWealth = this.getStartingWealth() - this.getCartTotal()
    // Equips the chosen main suit and all purchased minor armor pieces while keeping their catalog armor metadata available after character creation.
    const equippedArmorIds = new Set(derived.armor.equippedArmorItemIds)
    const inventoryItems = Array.from(this.cart).map(([id, quantity]) => ({ id, name: EQUIPMENT_BY_ID[id].name, quantity, armorId: id === derived.armor.itemId ? this.armorSelect.value : EQUIPMENT_BY_ID[id].armorId, equipped: EQUIPMENT_BY_ID[id].weaponId === this.primaryWeapon.value || equippedArmorIds.has(id) }))
    if (this.getsFreeDagger()) inventoryItems.push({ id: 'weapon-poniard', name: 'Poniard', quantity: 1, equipped: this.primaryWeapon.value === 'poniard' })
    const inventory = inventoryItems.map((item) => `${item.quantity} × ${item.name}${item.equipped ? ' (equipped)' : ''}`)
    const equipmentIds = inventoryItems.filter((item) => item.equipped).map((item) => item.id)
    const conditions = { currentHealth: attributes.health, maxHealth: attributes.health, pain: 0, shock: 0, bleeding: 0, fatigue: 0, knockedDown: false, unconsciousRounds: 0, coma: false, dead: false, other: [] }
    const identity = Object.fromEntries(Object.entries(this.identityInputs).map(([key, input]) => [key, ['age', 'insight'].includes(key) ? Number(input.value) : input.value.trim()]))
    this.character = { name: document.querySelector('#character-name').value.trim() || 'Wayfarer', concept: document.querySelector('#character-concept').value, philosophy, spriteId: this.selectedSpriteId, ...identity, race: 'Human', socialClass: socialClass.name, pointBuy, attributes, highAttribute, giftsFlaws: giftFlaws.map((item) => item.name), giftFlawDetails: this.giftFlawNotes.value.trim(), spiritualAttributes, traits: [`${CHARACTER_ATTRIBUTES.find(([key]) => key === highAttribute)[1]} is the high attribute`, ...(giftFlaws.length ? giftFlaws.map((item) => item.name) : ['No gifts or flaws']), philosophy || 'No declared philosophy'], proficiencies, armorProficiencies: derived.armor.proficiencies, primaryWeapon: this.primaryWeapon.value, armor: derived.armor, equipmentIds, inventoryItems, conditions, reflex: derived.reflex, aim: derived.aim, knockdown: derived.knockdown, knockout: derived.knockout, move: derived.move, combatPool: derived.combatPool, missilePool: derived.missilePool, combatPools: derived.combatPools, missilePools: derived.missilePools, damageRules: this.damageRules.value, wounds: [], startingWealth: this.formatMoney(this.getStartingWealth()), wealthTotal: remainingWealth, remainingWealth: this.formatMoney(remainingWealth), inventory }
    try { localStorage.setItem('tros-character', JSON.stringify(this.character)) } catch (storageError) { console.warn('Character could not be saved locally.', storageError) }
    this.errorElement.textContent = ''; this.builderScreen.hidden = true; this.mode = 'map'; this.onEnterMap(this.character)
  }

  // Opens character menu with the latest character data.
  openCharacterMenu() { if (!this.character) return; this.mode = 'menu'; this.renderCharacterSheet(); this.characterMenu.hidden = false }
  // Summarizes the four battle hit zones from the detailed front/back armor coverage saved on the character.
  formatArmorCombatCoverage(armor) {
    if (!armor?.coverageValues) return 'Legacy whole-body protection'
    // Converts internal target keys into the same plain-language labels shown in combat.
    const labels = { head: 'Head / Neck', torso: 'Torso', arms: 'Arms', legs: 'Legs' }
    return Object.entries(armor.coverageValues).map(([zone, protection]) => `${labels[zone] || zone}: AV ${protection.value}`).join(' · ')
  }
  // Closes character menu and returns to the previous screen.
  closeCharacterMenu() { this.characterMenu.hidden = true; this.mode = 'map'; this.onEnterMap(this.character) }
  // Updates the visible character sheet using the latest game state.
  renderCharacterSheet() {
    const character = this.character
    this.ensureCharacterState(character)
    const pointBuy = character.pointBuy || { race: 0, social: 0, insight: 0, attributes: 0, proficiencies: 0, giftsFlaws: 0, budget: 70, total: 0 }
    const sections = [
      ['character', 'Character', [['Concept', character.concept], ['Philosophy', character.philosophy || 'Unwritten'], ['Race', character.race], ['Nationality', character.nationality || 'Unspecified'], ['Sex', character.sex || 'Unspecified'], ['Age', character.age ?? 'Unspecified'], ['Height', character.height || 'Unspecified'], ['Weight', character.weight || 'Unspecified'], ['Religion', character.religion || 'None'], ['Liege', character.liege || 'None'], ['Insight', character.insight ?? 0], ['Social class', character.socialClass], ['__heading__', 'Starting Character Characteristics'], ['Race', pointBuy.race], ['Social Class', pointBuy.social], ['Insight', pointBuy.insight || 0], ['Attributes', pointBuy.attributes], ['Proficiencies', pointBuy.proficiencies], ['Gifts / Flaws', pointBuy.giftsFlaws], ['Total', `${pointBuy.total} / ${pointBuy.budget || 70}`]]],
      ['combat', 'Combat', [['Combat Pool', character.combatPool], ['CP formula', 'Reflex + melee proficiency - armor CP penalty'], ['Missile Pool', character.missilePool], ['MP formula', 'Aim + missile proficiency - armor CP penalty'], ['Reflex', character.reflex], ['Aim', character.aim], ['Knockdown', character.knockdown], ['Knockout', character.knockout], ['Move', character.move], ['Primary weapon', MELEE_WEAPONS[character.primaryWeapon].name], ['Armor', `${character.armor.name} (AV ${character.armor.value}; CP ${character.armor.poolPenalty ? '-' + character.armor.poolPenalty : '0'})`], ['Armor coverage', this.formatArmorCombatCoverage(character.armor)], ['Damage rules', character.damageRules === 'core' ? 'Core' : 'Companion variant']]],
      ['conditions', 'Conditions', this.getConditionRows(character)],
      ['attributes', 'Attributes', [...CHARACTER_ATTRIBUTES.map(([key, label]) => [label, character.attributes[key]]), ...character.spiritualAttributes.map((item) => [`Spiritual — ${item.type}`, `${item.value} · ${item.focus || 'Conscience'}`])]],
      ['proficiencies', 'Proficiencies', [...Object.entries(character.proficiencies).map(([weapon, value]) => [MELEE_WEAPONS[weapon].name, `${value} (${MELEE_WEAPONS[weapon].kind === 'ranged' ? 'MP' : 'CP'} ${MELEE_WEAPONS[weapon].kind === 'ranged' ? character.missilePools[weapon] : character.combatPools[weapon]})`]), ...(character.armorProficiencies || []).map((name) => [`Armor — ${name}`, 'Covers matching equipped armor pieces'])]],
      ['traits', 'Traits', [...character.traits.map((trait, index) => [`Trait ${index + 1}`, trait]), ['Gifts / Flaws', character.giftsFlaws.length ? character.giftsFlaws.join(', ') : 'None'], ['Details', character.giftFlawDetails || 'None']]],
      ['inventory', 'Inventory', []],
      ['crafting', 'Crafting', []],
      ['browserSaves', 'Browser Saves', []],
      ['exportSaves', 'Export Saves', []],
    ]

    this.sheetName.textContent = character.name
    const selectedSprite = getCharacterSprite(character.spriteId)
    this.profileArt.style.backgroundImage = `url('${selectedSprite.portrait}')`
    this.profileArt.setAttribute('aria-label', `${selectedSprite.name} portrait`)
    this.sheetTabs.replaceChildren()
    this.sheetContent.replaceChildren()
    sections.forEach(([id, title, rows]) => {
      const tab = document.createElement('button')
      tab.type = 'button'
      tab.className = 'sheet-tab'
      tab.dataset.sheetTab = id
      tab.setAttribute('role', 'tab')
      tab.textContent = title
      tab.addEventListener('click', () => this.selectSheetTab(id))
      this.sheetTabs.appendChild(tab)
      this.sheetContent.appendChild(id === 'crafting' ? this.createCraftingSection(character) : id === 'inventory' ? this.createInventorySection(character) : id === 'conditions' ? this.createConditionsSection(character, rows) : id === 'browserSaves' ? this.createSaveSlotsSection('browser') : id === 'exportSaves' ? this.createSaveSlotsSection('export') : this.createSheetSection(title, rows, id))
    })
    if (!sections.some(([id]) => id === this.activeSheetTab)) this.activeSheetTab = 'character'
    this.selectSheetTab(this.activeSheetTab)
  }
  // Adds any missing character state fields required by newer game versions.
  ensureCharacterState(character) {
    character.spriteId = getCharacterSprite(character.spriteId).id
    // Removes retired attributes and skill records from older saves while subtracting their former point costs only once.
    character.attributes = character.attributes || {}
    const removedAttributeCost = ['mentalAptitude', 'social'].reduce((total, key) => total + (Number.isFinite(character.attributes[key]) ? this.attributeCost(character.attributes[key]) : 0), 0)
    delete character.attributes.mentalAptitude
    delete character.attributes.social
    const removedSkillCost = Number(character.pointBuy?.skillPackets || 0) + Number(character.pointBuy?.individualSkills || 0)
    if (character.pointBuy) {
      character.pointBuy.attributes = Math.max(0, Number(character.pointBuy.attributes || 0) - removedAttributeCost)
      character.pointBuy.total = Math.max(0, Number(character.pointBuy.total || 0) - removedAttributeCost - removedSkillCost)
      delete character.pointBuy.skillPackets
      delete character.pointBuy.individualSkills
    }
    delete character.skillPackets
    delete character.socialSkillPacket
    delete character.skills
    // Replaces a retired high attribute with the strongest attribute that still exists and removes obsolete trait text.
    if (!CHARACTER_ATTRIBUTES.some(([key]) => key === character.highAttribute)) character.highAttribute = Object.entries(character.attributes).sort((left, right) => right[1] - left[1])[0]?.[0] || 'strength'
    character.traits = (Array.isArray(character.traits) ? character.traits : []).filter((trait) => !/^(Mental Aptitude|Social) is the high attribute$/i.test(trait))
    if (!character.traits.some((trait) => / is the high attribute$/i.test(trait))) {
      const highLabel = CHARACTER_ATTRIBUTES.find(([key]) => key === character.highAttribute)?.[1] || 'Strength'
      character.traits.unshift(`${highLabel} is the high attribute`)
    }
    character.wounds = Array.isArray(character.wounds) ? character.wounds : []
    character.conditions = { currentHealth: character.attributes.health, maxHealth: character.attributes.health, pain: 0, shock: 0, bleeding: 0, fatigue: 0, knockedDown: false, unconsciousRounds: 0, coma: false, dead: false, other: [], ...(character.conditions || {}) }
    character.conditions.other = Array.isArray(character.conditions.other) ? character.conditions.other : []
    character.wealthTotal = Number.isFinite(character.wealthTotal) ? character.wealthTotal : parseCurrency(character.remainingWealth)
    character.remainingWealth = formatCurrency(character.wealthTotal)
    if (!Array.isArray(character.inventoryItems)) {
      const equipped = new Set(character.equipmentIds || [])
      const legacy = Array.isArray(character.inventory) ? character.inventory : []
      character.inventoryItems = legacy.map((entry) => {
        const match = String(entry).match(/^(\d+) × (.+?)(?: \(equipped\))?$/)
        if (!match || match[2].startsWith('Coin purse:')) return null
        const catalogItem = EQUIPMENT_CATALOG.find((item) => item.name === match[2])
        if (!catalogItem) return null
        return { id: catalogItem.id, name: catalogItem.name, quantity: Number(match[1]), armorId: catalogItem.id === character.armor?.itemId ? catalogItem.armorId : undefined, equipped: catalogItem.weaponId === character.primaryWeapon || catalogItem.id === character.armor?.itemId || catalogItem.shield && equipped.has(catalogItem.id) }
      }).filter(Boolean)
    }
    this.refreshInventoryState(character)
  }
  // Returns the current condition rows.
  getConditionRows(character) {
    const conditions = character.conditions
    const rows = [
      ['Health', `${conditions.currentHealth} / ${conditions.maxHealth}`],
      ['Endurance', character.attributes.endurance],
      ['Pain penalty', conditions.pain],
      ['Current Shock', conditions.shock],
      ['Fatigue', conditions.fatigue],
      ['Blood Loss TN', conditions.bleeding],
      ['Knockdown', conditions.knockedDown ? 'Knocked down' : 'Standing'],
      ['Knockout', conditions.unconsciousRounds > 0 ? `Unconscious (${conditions.unconsciousRounds} rounds)` : 'Conscious'],
      ['Overall state', conditions.dead ? 'Dead' : conditions.coma ? 'Comatose' : 'Active'],
    ]
    if (!character.wounds.length) rows.push(['Wounds', 'None'])
    character.wounds.forEach((wound, index) => rows.push([`Wound ${index + 1}`, `Level ${wound.severity} ${wound.damageType} - ${wound.location}; Shock ${wound.shock || 0}, Pain ${wound.pain || 0}, BL ${wound.bloodLoss || 0}`]))
    if (conditions.other.length) rows.push(['Other conditions', conditions.other.join(', ')])
    return rows
  }
  // Creates a new conditions section with the supplied values.
  createConditionsSection(character, rows) {
    const section = this.createSheetSection('Conditions', rows, 'conditions')
    const actions = document.createElement('div'); actions.className = 'condition-actions'
    const rest = document.createElement('button'); rest.type = 'button'; rest.textContent = 'Catch Breath (EN / TN 6)'; rest.disabled = character.conditions.fatigue <= 0 || character.conditions.coma || character.conditions.dead; rest.addEventListener('click', () => this.restCharacter())
    actions.appendChild(rest); section.appendChild(actions)
    if (this.conditionNotice) { const notice = document.createElement('p'); notice.className = 'inventory-notice'; notice.textContent = this.conditionNotice; section.appendChild(notice) }
    return section
  }
  // Restores recoverable condition values when the character is allowed to rest.
  restCharacter() {
    const conditions = this.character.conditions, dice = this.character.attributes.endurance, rolls = Array.from({ length: dice }, () => Math.floor(Math.random() * 10) + 1), successes = rolls.filter((roll) => roll >= 6).length
    conditions.fatigue = Math.max(0, conditions.fatigue - successes)
    this.conditionNotice = `Endurance ${dice} rolled [${rolls.join(', ')}]: ${successes} success${successes === 1 ? '' : 'es'}; ${successes} Fatigue recovered.`
    this.persistCharacter(); this.renderCharacterSheet()
  }
  // Creates a new inventory section with the supplied values.
  createInventorySection(character) {
    const section = document.createElement('section'); section.className = 'sheet-section inventory-section'; section.dataset.sheetPanel = 'inventory'; section.setAttribute('role', 'tabpanel')
    const heading = document.createElement('h2'); heading.textContent = 'Inventory'; section.appendChild(heading)
    const wealth = document.createElement('div'); wealth.className = 'inventory-wealth'; wealth.innerHTML = `<span>Starting wealth</span><strong>${character.startingWealth}</strong><span>Coin purse</span><strong>${character.remainingWealth}</strong>`; section.appendChild(wealth)
    if (this.inventoryNotice) { const notice = document.createElement('p'); notice.className = 'inventory-notice'; notice.textContent = this.inventoryNotice; section.appendChild(notice) }
    if (!character.inventoryItems.length) { const empty = document.createElement('p'); empty.className = 'inventory-empty'; empty.textContent = 'Inventory is empty.'; section.appendChild(empty); return section }
    character.inventoryItems.forEach((record) => {
      const item = EQUIPMENT_BY_ID[record.id]
      const row = document.createElement('div'); row.className = 'inventory-action-row'
      const description = document.createElement('div'); description.className = 'inventory-action-name'; description.textContent = `${record.quantity} × ${record.name}${record.equipped ? ' - Equipped' : ''}${record.durability !== undefined ? ` · ${record.durability}/10 ${DURABILITY_NAMES[record.durability]}${record.destroyed ? ' (destroyed)' : ''}` : ''}${record.potionEffects ? ' · '+record.potionEffects.map(e=>e.text).join('; ') : ''}`
      const actions = document.createElement('div'); actions.className = 'inventory-actions'
      const equip = document.createElement('button'); equip.type = 'button'; equip.textContent = record.equipped ? 'Unequip' : 'Equip'; equip.disabled = !this.isEquippableItem(item, record) || record.durability <= 1 || record.destroyed; equip.addEventListener('click', () => this.handleInventoryAction('equip', record.id))
      const use = document.createElement('button'); use.type = 'button'; use.textContent = 'Use'; use.disabled = !ITEM_USE_EFFECTS[record.id] && !record.potionEffects; use.addEventListener('click', () => this.handleInventoryAction('use', record.id))
      const drop = document.createElement('button'); drop.type = 'button'; drop.textContent = 'Drop'; drop.addEventListener('click', () => this.handleInventoryAction('drop', record.id))
      actions.append(equip, use, drop); row.append(description, actions); section.appendChild(row)
    })
    return section
  }
  // Checks whether equippable item is true.
  isEquippableItem(item, record = {}) { return Boolean(item && (item.weaponId || item.armorPiece || record.armorId || item.armorId || item.shield || item.category === 'Clothing')) }
  // Responds to inventory action and updates the related game state.
  handleInventoryAction(action, id) {
    const character = this.character, record = character.inventoryItems.find((entry) => entry.id === id), item = EQUIPMENT_BY_ID[id]
    if (!record || !item) return
    if (action === 'equip') this.toggleEquippedItem(character, record, item)
    if (action === 'use') this.useInventoryItem(character, record)
    if (action === 'drop') {
      record.quantity--
      this.inventoryNotice = `Dropped 1 × ${record.name}.`
      if (record.quantity <= 0) { if (record.equipped) this.unequipItem(character, record, item); character.inventoryItems = character.inventoryItems.filter((entry) => entry !== record) }
    }
    this.refreshInventoryState(character); this.persistCharacter(); this.renderCharacterSheet()
  }
  // Switches equipped item between its available states.
  toggleEquippedItem(character, record, item) {
    if (record.equipped) { this.unequipItem(character, record, item); this.inventoryNotice = `${record.name} unequipped.`; return }
    if (item.weaponId) { character.inventoryItems.forEach((entry) => { const other = EQUIPMENT_BY_ID[entry.id]; if (other?.weaponId) entry.equipped = false }); character.primaryWeapon = item.weaponId }
    const armorId = record.armorId || item.armorId
    if (armorId) { character.inventoryItems.forEach((entry) => { const other = EQUIPMENT_BY_ID[entry.id]; if (entry.armorId || other?.armorId) entry.equipped = false }); character.armor = { ...ARMOR_OPTIONS[armorId], id: armorId } }
    if (item.shield) character.inventoryItems.forEach((entry) => { if (EQUIPMENT_BY_ID[entry.id]?.shield) entry.equipped = false })
    record.equipped = true; this.recalculateEquippedArmor(character); this.recalculateEquippedPools(character); this.inventoryNotice = `${record.name} equipped.`
  }
  // Removes an item from the equipped loadout and recalculates armor and combat pools.
  unequipItem(character, record, item) {
    record.equipped = false
    if (item.weaponId && character.primaryWeapon === item.weaponId) character.primaryWeapon = 'unarmed'
    if (record.armorId || item.armorId) character.armor = { ...ARMOR_OPTIONS.none, id: 'none' }
    this.recalculateEquippedArmor(character)
    this.recalculateEquippedPools(character)
  }
  // Rebuilds detailed and combat-zone protection whenever armor is equipped or removed from the character-menu inventory.
  recalculateEquippedArmor(character) {
    const items = character.inventoryItems.filter((record) => record.equipped).map((record) => EQUIPMENT_BY_ID[record.id]).filter((item) => item?.armorPiece && !item.shield)
    const majorRecord = character.inventoryItems.find((record) => record.equipped && (record.armorId || EQUIPMENT_BY_ID[record.id]?.armorId) && !EQUIPMENT_BY_ID[record.id]?.armorPiece?.minor)
    const majorId = majorRecord?.armorId || (majorRecord ? EQUIPMENT_BY_ID[majorRecord.id]?.armorId : null)
    const base = ARMOR_OPTIONS[majorId] || ARMOR_OPTIONS.none
    const detailedCoverage = Object.fromEntries(Object.keys(ARMOR_ZONE_LABELS).map((zone) => [zone, { value: 0, material: 'none', items: [] }]))
    items.forEach((item) => item.armorPiece.coverage.forEach((zone) => {
      const coverage = detailedCoverage[zone]
      coverage.items.push(item.name)
      if (item.armorPiece.value >= coverage.value) { coverage.value = item.armorPiece.value; coverage.material = item.armorPiece.material }
    }))
    const coverageValues = Object.fromEntries(Object.entries(ARMOR_COMBAT_ZONES).map(([combatZone, parts]) => {
      const strongest = parts.map((part) => detailedCoverage[part]).sort((left, right) => right.value - left.value)[0]
      return [combatZone, { value: Math.round(parts.reduce((sum, part) => sum + detailedCoverage[part].value, 0) / parts.length), material: strongest.material, parts: Object.fromEntries(parts.map((part) => [part, detailedCoverage[part].value])) }]
    }))
    const minorCount = items.filter((item) => item.armorPiece.minor).length
    character.armor = { ...base, name: items.length ? `${base.name}${minorCount ? ` + ${minorCount} minor piece${minorCount === 1 ? '' : 's'}` : ''}` : 'Unarmored', value: Math.max(0, ...Object.values(coverageValues).map((coverage) => coverage.value)), coverage: detailedCoverage, coverageValues, proficiencies: Array.from(new Set(items.map((item) => ARMOR_PROFICIENCIES[item.armorPiece.proficiency]))).filter(Boolean), equippedArmorItemIds: items.map((item) => item.id) }
    character.armorProficiencies = character.armor.proficiencies
  }
  // Recalculates equipped pools after equipment, wounds, or conditions change.
  recalculateEquippedPools(character) {
    const penalty = character.armor?.poolPenalty || 0
    character.combatPools = {}; character.missilePools = {}
    Object.entries(character.proficiencies).forEach(([weaponId, rank]) => { if (MELEE_WEAPONS[weaponId]?.kind === 'ranged') character.missilePools[weaponId] = Math.max(1, character.aim + rank - penalty); else character.combatPools[weaponId] = Math.max(1, character.reflex + rank - penalty) })
    character.combatPool = character.primaryWeapon === 'unarmed' ? Math.max(1, character.reflex - penalty) : character.combatPools[character.primaryWeapon] || Math.max(1, character.reflex - penalty)
    character.missilePool = Math.max(1, ...Object.values(character.missilePools), character.aim - penalty)
  }
  // Applies a herb or usable item effect, consumes one unit, and updates conditions.
  useInventoryItem(character, record) {
    const effect = ITEM_USE_EFFECTS[record.id]; if (!effect) return
    if (effect.healing && !character.wounds.length) { this.inventoryNotice = 'There is no wound for the healing herbs to treat.'; return }
    if (effect.fatigueRecovery) character.conditions.fatigue = Math.max(0, character.conditions.fatigue - effect.fatigueRecovery)
    if (effect.condition && !character.conditions.other.includes(effect.condition)) character.conditions.other.push(effect.condition)
    if (effect.stimulant) {
      character.conditions.pain = 0; character.conditions.shock = 0; character.conditions.pendingShock = 0; character.conditions.fatigue = 0; character.conditions.unconsciousRounds = 0
      character.wounds.forEach((wound) => { wound.pain = 0; wound.painSuppressed = true })
    }
    if (effect.healing) this.reduceHighestWound(character)
    if (effect.consume) record.quantity--
    if (record.quantity <= 0) character.inventoryItems = character.inventoryItems.filter((entry) => entry !== record)
    this.inventoryNotice = effect.message
  }
  // Reduces highest wound by the amount allowed by the used item.
  reduceHighestWound(character) {
    const wound = character.wounds.reduce((highest, entry) => entry.severity > highest.severity ? entry : highest)
    wound.severity = Math.max(0, wound.severity - 1)
    if (wound.severity === 0) character.wounds = character.wounds.filter((entry) => entry !== wound)
    else Object.assign(wound, this.getCharacterWoundEffects(character, wound))
    this.recalculateCharacterConditions(character)
  }
  // Returns the current character wound effects.
  getCharacterWoundEffects(character, wound) {
    const shockLevels = [0, 3, 5, 7, 9, 12], painLevels = [0, 2, 4, 6, 8, 10]
    const bloodLevels = { cutting: [0, 0, 1, 3, 6, 10], puncturing: [0, 0, 2, 5, 8, 12], bludgeoning: [0, 0, 0, 1, 3, 6] }
    const willpower = character.attributes.willpower || 0
    const painResistance = character.giftsFlaws?.some((gift) => gift.startsWith('High Pain Threshold') && gift.includes('Major')) ? 2 : character.giftsFlaws?.some((gift) => gift.startsWith('High Pain Threshold')) ? 1 : 0
    const bodyZone = wound.bodyZone || wound.zone
    const zoneShock = bodyZone === 'head' ? 2 : bodyZone === 'torso' ? 1 : 0
    const typeShock = wound.damageType === 'bludgeoning' ? 1 : 0
    return {
      shock: Math.max(0, shockLevels[wound.severity] + zoneShock + typeShock - Math.floor(willpower / 2)),
      rawPain: painLevels[wound.severity],
      pain: wound.painSuppressed ? 0 : Math.max(0, painLevels[wound.severity] + (bodyZone === 'head' ? 1 : 0) - willpower - painResistance),
      bloodLoss: (bloodLevels[wound.damageType]?.[wound.severity] ?? wound.severity) * (character.giftsFlaws?.some((gift) => gift.startsWith('Bleeder')) ? 2 : 1),
    }
  }
  // Recalculates character conditions after equipment, wounds, or conditions change.
  recalculateCharacterConditions(character) {
    const painByArea = new Map(), bloodByArea = new Map()
    // Repeated wounds at one exact location keep only the highest Pain and Blood Loss, while different locations remain cumulative.
    character.wounds.forEach((wound) => { const area = wound.locationKey || wound.location || wound.zone; painByArea.set(area, Math.max(painByArea.get(area) || 0, wound.pain || 0)); bloodByArea.set(area, Math.max(bloodByArea.get(area) || 0, wound.bloodLoss || 0)) })
    character.conditions.pain = Array.from(painByArea.values()).reduce((sum, value) => sum + value, 0)
    character.conditions.bleeding = Array.from(bloodByArea.values()).reduce((sum, value) => sum + value, 0)
  }
  // Refreshes inventory state so it matches the latest selections.
  refreshInventoryState(character) { character.equipmentIds = character.inventoryItems.filter((item) => item.equipped).map((item) => item.id); character.inventory = character.inventoryItems.map((item) => `${item.quantity} × ${item.name}${item.equipped ? ' (equipped)' : ''}`) }
  // Writes the current character to browser storage so menu changes are not lost.
  persistCharacter() { try { localStorage.setItem('tros-character', JSON.stringify(this.character)) } catch (storageError) { console.warn('Character could not be saved locally.', storageError) } }
  // Returns the current save slot key.
  getSaveSlotKey(type, slot) { return `tros-${type}-save-${slot}` }
  // Creates save payload from the current saved data.
  buildSavePayload() {
    return {
      version: 1,
      savedAt: new Date().toISOString(),
      characterPointBudget: this.characterPointBudget,
      character: JSON.parse(JSON.stringify(this.character)),
      world: JSON.parse(JSON.stringify(this.getSaveState() || {})),
    }
  }
  // Returns the current save slot payload.
  getSaveSlotPayload(type, slot) {
    try {
      const raw = localStorage.getItem(this.getSaveSlotKey(type, slot))
      if (!raw) return null
      const payload = JSON.parse(raw)
      return payload?.character ? payload : null
    } catch (error) {
      console.warn(`Save slot ${slot} could not be read.`, error)
      return null
    }
  }
  // Creates a new save slots section with the supplied values.
  createSaveSlotsSection(type) {
    const isBrowser = type === 'browser', id = isBrowser ? 'browserSaves' : 'exportSaves'
    const section = document.createElement('section'); section.className = 'sheet-section save-slots-section'; section.dataset.sheetPanel = id; section.setAttribute('role', 'tabpanel')
    const heading = document.createElement('h2'); heading.textContent = isBrowser ? 'Browser Saves' : 'Exportable Saves'; section.appendChild(heading)
    const help = document.createElement('p'); help.className = 'save-slots-help'; help.textContent = isBrowser ? 'Stored in this browser. Clearing browser data will remove these slots.' : 'Export downloads a portable JSON file. Import places a JSON save into the selected slot; Delete removes only the in-browser slot copy.'; section.appendChild(help)
    if (this.saveNotice && this.saveNoticeType === type) { const notice = document.createElement('p'); notice.className = 'inventory-notice'; notice.textContent = this.saveNotice; section.appendChild(notice) }
    for (let slot = 1; slot <= 3; slot++) section.appendChild(this.createSaveSlotRow(type, slot))
    return section
  }
  // Creates a new save slot row with the supplied values.
  createSaveSlotRow(type, slot) {
    const payload = this.getSaveSlotPayload(type, slot), row = document.createElement('article'); row.className = 'save-slot-row'
    const info = document.createElement('div'); info.className = 'save-slot-info'
    const title = document.createElement('strong'); title.textContent = `Slot ${slot}`
    const detail = document.createElement('span'); detail.textContent = payload ? `${payload.character.name || 'Unnamed character'} · ${this.formatSaveTimestamp(payload.savedAt)}` : 'Empty'
    info.append(title, detail)
    const actions = document.createElement('div'); actions.className = 'save-slot-actions'
    const primary = document.createElement('button'); primary.type = 'button'; primary.textContent = type === 'browser' ? 'Save' : 'Export'; primary.addEventListener('click', () => this.saveToSlot(type, slot))
    const load = document.createElement('button'); load.type = 'button'; load.textContent = 'Load'; load.disabled = !payload; load.addEventListener('click', () => this.loadFromSlot(type, slot))
    actions.append(primary)
    if (type === 'export') {
      const importButton = document.createElement('button'); importButton.type = 'button'; importButton.textContent = 'Import'
      const fileInput = document.createElement('input'); fileInput.type = 'file'; fileInput.accept = '.json,application/json'; fileInput.hidden = true
      importButton.addEventListener('click', () => fileInput.click())
      fileInput.addEventListener('change', () => this.importSaveFile(slot, fileInput.files?.[0]))
      actions.append(importButton, fileInput)
    }
    const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Delete'; remove.disabled = !payload; remove.addEventListener('click', () => this.deleteSaveSlot(type, slot))
    actions.append(load, remove); row.append(info, actions); return row
  }
  // Formats save timestamp as readable text for the interface.
  formatSaveTimestamp(value) {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? 'Unknown date' : date.toLocaleString()
  }
  // Saves to slot for later use.
  saveToSlot(type, slot) {
    const payload = this.buildSavePayload()
    try {
      localStorage.setItem(this.getSaveSlotKey(type, slot), JSON.stringify(payload))
      this.saveNoticeType = type
      this.saveNotice = `${type === 'browser' ? 'Browser' : 'Export'} slot ${slot} saved.`
      if (type === 'export') this.downloadSavePayload(payload, slot)
    } catch (error) {
      this.saveNoticeType = type; this.saveNotice = `Slot ${slot} could not be saved.`
      console.warn(this.saveNotice, error)
    }
    this.renderCharacterSheet()
  }
  // Loads from slot and restores its saved values.
  loadFromSlot(type, slot) {
    const payload = this.getSaveSlotPayload(type, slot)
    if (!payload) { this.saveNoticeType = type; this.saveNotice = `Slot ${slot} is empty.`; this.renderCharacterSheet(); return }
    this.applySavePayload(payload)
  }
  // Deletes save slot after the player confirms the action.
  deleteSaveSlot(type, slot) {
    this.saveNoticeType = type
    try { localStorage.removeItem(this.getSaveSlotKey(type, slot)); this.saveNotice = `Slot ${slot} deleted.` } catch (error) { this.saveNotice = `Slot ${slot} could not be deleted.`; console.warn(this.saveNotice, error) }
    this.renderCharacterSheet()
  }
  // Downloads save payload as a file the player can keep.
  downloadSavePayload(payload, slot) {
    const safeName = String(payload.character.name || 'character').replace(/[^a-z0-9_-]+/gi, '-').replace(/^-|-$/g, '') || 'character'
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob), link = document.createElement('a')
    link.href = url; link.download = `tros-${safeName}-slot-${slot}.json`; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 0)
  }
  // Imports save file from a file chosen by the player.
  async importSaveFile(slot, file) {
    if (!file) return
    this.saveNoticeType = 'export'
    try {
      const payload = JSON.parse(await file.text())
      if (payload?.version !== 1 || !payload?.character?.name || !payload.character.attributes || !payload.character.conditions || !Array.isArray(payload.character.inventoryItems)) throw new Error('Missing or incompatible character data')
      localStorage.setItem(this.getSaveSlotKey('export', slot), JSON.stringify(payload))
      this.saveNotice = `${file.name} imported into slot ${slot}.`
    } catch (error) {
      this.saveNotice = `${file.name || 'The selected file'} is not a valid TROS save.`
      console.warn(this.saveNotice, error)
    }
    this.renderCharacterSheet()
  }
  // Applies save payload to the affected character or combatant.
  applySavePayload(payload) {
    this.character = JSON.parse(JSON.stringify(payload.character))
    this.characterPointBudget = Math.max(70, Number(payload.characterPointBudget) || Number(this.character.pointBuy?.budget) || 70)
    this.ensureCharacterState(this.character)
    this.persistCharacter()
    this.characterMenu.hidden = true
    this.builderScreen.hidden = true
    this.startScreen.hidden = true
    this.mode = 'map'
    this.onLoadSave(JSON.parse(JSON.stringify(payload.world || {})))
    this.onEnterMap(this.character)
  }
  // Selects sheet tab and displays its content.
  selectSheetTab(id) { this.activeSheetTab = id; this.sheetTabs.querySelectorAll('[data-sheet-tab]').forEach((tab) => { const active = tab.dataset.sheetTab === id; tab.classList.toggle('active', active); tab.setAttribute('aria-selected', String(active)) }); this.sheetContent.querySelectorAll('[data-sheet-panel]').forEach((panel) => { panel.hidden = panel.dataset.sheetPanel !== id }); this.sheetContent.scrollTop = 0 }
  // Creates a new sheet section with the supplied values.
  createSheetSection(title, rows, id) { const section = document.createElement('section'); section.className = 'sheet-section'; section.dataset.sheetPanel = id; section.setAttribute('role', 'tabpanel'); const heading = document.createElement('h2'); heading.textContent = title; section.appendChild(heading); rows.forEach(([label, value]) => { if (label === '__heading__') { const subheading = document.createElement('h3'); subheading.className = 'sheet-subheading'; subheading.textContent = value; section.appendChild(subheading); return } const row = document.createElement('div'); row.className = 'sheet-row'; const name = document.createElement('span'); name.textContent = label; const detail = document.createElement('strong'); detail.textContent = String(value); row.append(name, detail); section.appendChild(row) }); return section }
}


