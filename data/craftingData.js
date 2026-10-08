// Ingredient effects and folklore transcribed from Updated Rules PDF.
const ALCHEMY_INGREDIENTS = [
  {
    "id": "ingredient-0",
    "name": "Aconite",
    "clue": "The wolf's bane knows when blood has already been spilled; wounded prey seems slower beneath its shadow.",
    "rare": "lower attacks by 1 tn for 2 rounds against wounded enemies",
    "uncommon": "add 2 cp for 2 rounds while enemy is wounded",
    "common": "lower shield defense by 1 tn for 2 rounds"
  },
  {
    "id": "ingredient-1",
    "name": "Aglaophotis",
    "clue": "A hardy herb of stubborn travelers, said to keep both hammer and heart from failing.",
    "rare": "lower blunt attacks by 1 tn for 2 rounds",
    "uncommon": "add 1 cp for 2 rounds",
    "common": "increase endurance by 1 for 2 rounds"
  },
  {
    "id": "ingredient-2",
    "name": "Allspice Root",
    "clue": "Its biting root is chewed before battle, waking the limbs and guiding the edge.",
    "rare": "lower cuts attacks by 1 tn for 2 rounds",
    "uncommon": "add 2 cp for 2 rounds while attacking",
    "common": "remove 3 fatigue"
  },
  {
    "id": "ingredient-3",
    "name": "Ambrosia",
    "clue": "A food of impossible vigor; it is prized before the first wound is struck.",
    "rare": "lower thrust attacks by 1 tn for 2 rounds",
    "uncommon": "add 2 cp for 2 rounds while enemy is unwounded",
    "common": "remove 2 wounds"
  },
  {
    "id": "ingredient-4",
    "name": "Arenaria",
    "clue": "This humble flower clings to stone and survives where weaker things fall.",
    "rare": "ignore knockout for 2 rounds",
    "uncommon": "add 2 cp for 2 rounds while enemy is wounded",
    "common": "remove 2 wounds"
  },
  {
    "id": "ingredient-5",
    "name": "Balisse Fruit",
    "clue": "Sweet and bright, the fruit is associated with beginnings, vigor, and the strength of the untouched.",
    "rare": "lower attacks by 1 tn for 2 rounds against unwounded enemies",
    "uncommon": "add 2 cp for 2 rounds while unwounded",
    "common": "increase health by 1 for 2 rounds"
  },
  {
    "id": "ingredient-6",
    "name": "Barometzs",
    "clue": "A strange growth is whispered to drink the red tide and leave an enemy exposed.",
    "rare": "lower defenses by 1 tn for 2 rounds",
    "uncommon": "add 2 cp for 2 rounds while enemy is wounded",
    "common": "delay 8 blood loss for 2 rounds"
  },
  {
    "id": "ingredient-7",
    "name": "Beggartick Blossoms",
    "clue": "Its hooked blossoms cling fast, and folk healers say they steady those shaken by sudden violence.",
    "rare": "lower defenses by 1 tn for 2 rounds",
    "uncommon": "add 2 cp for 2 rounds while defending",
    "common": "remove 4 shock"
  },
  {
    "id": "ingredient-8",
    "name": "Berbercane Fruit",
    "clue": "The thorny cane favors the spear's lesson: find the opening and press deeper.",
    "rare": "lower thrust attacks by 1 tn for 2 rounds",
    "uncommon": "add 2 cp for 2 rounds while enemy is wounded",
    "common": "increase thrust damage rating by 1 for 2 rounds"
  },
  {
    "id": "ingredient-9",
    "name": "Bison Grass",
    "clue": "Where the great beasts tread, the grass is said to lend heavy feet both purpose and momentum.",
    "rare": "ignore knockdown for 2 rounds",
    "uncommon": "add 1 cp for 2 rounds",
    "common": "movement has no cp cost for 2 rounds"
  },
  {
    "id": "ingredient-10",
    "name": "Black Myrtle Petals",
    "clue": "Dark petals are burned for those who must endure pain without surrendering to it.",
    "rare": "lower blunt attacks by 1 tn for 2 rounds",
    "uncommon": "add 2 cp for 2 rounds while enemy is unwounded",
    "common": "remove 4 pain"
  },
  {
    "id": "ingredient-11",
    "name": "Bloodmoss",
    "clue": "It grows where old blood darkens the earth, and surgeons prize it when crimson refuses to stop.",
    "rare": "lower attacks by 1 tn for 2 rounds against wounded enemies",
    "uncommon": "add 2 cp for 2 rounds while wounded",
    "common": "remove 4 blood loss"
  },
  {
    "id": "ingredient-12",
    "name": "Blowball",
    "clue": "Its seeds scatter on the faintest breath; dancers carry its fluff for quick and light steps.",
    "rare": "lower cuts attacks by 1 tn for 2 rounds",
    "uncommon": "add 2 cp for 2 rounds while unwounded",
    "common": "increase agility by 1 for 2 rounds"
  },
  {
    "id": "ingredient-13",
    "name": "Bryonia",
    "clue": "A bitter vine said to make the body stubborn enough to keep fighting when sense would flee.",
    "rare": "ignore knockout for 2 rounds",
    "uncommon": "add 2 cp for 2 rounds while attacking",
    "common": "increase toughness by 1 for 2 rounds"
  },
  {
    "id": "ingredient-14",
    "name": "Celandine",
    "clue": "The yellow sap is linked to watchfulness and to keeping suffering at the door a little longer.",
    "rare": "lower attacks by 1 tn for 2 rounds against unwounded enemies",
    "uncommon": "add 2 cp for 2 rounds while defending",
    "common": "delay 8 pain for 2 rounds"
  },
  {
    "id": "ingredient-15",
    "name": "Crow's Eye",
    "clue": "Its dark berries are named for the bird that sees danger before it arrives.",
    "rare": "lower defenses by 1 tn for 2 rounds",
    "uncommon": "add 2 cp for 2 rounds while enemy is wounded",
    "common": "increase reflex by 1 for 2 rounds"
  },
  {
    "id": "ingredient-16",
    "name": "Crows-Eye Root",
    "clue": "The root is dug from stubborn soil and used in old tales of sudden, violent strength.",
    "rare": "lower defenses by 1 tn for 2 rounds",
    "uncommon": "add 2 cp for 2 rounds while attacking",
    "common": "increase strength by 1 for 2 rounds"
  },
  {
    "id": "ingredient-17",
    "name": "Ergot Seeds",
    "clue": "A dangerous grain-spirit that can make a broken body forget, briefly, that it should not move.",
    "rare": "ignore knockdown for 2 rounds",
    "uncommon": "add 2 cp for 2 rounds while wounded",
    "common": "ignore crippled limb for 2 rounds"
  },
  {
    "id": "ingredient-18",
    "name": "Fern Flower",
    "clue": "Those who claim to have found the unseen flower speak of moving before misfortune can touch them.",
    "rare": "lower attacks by 1 tn for 2 rounds against unwounded enemies",
    "uncommon": "add 2 cp for 2 rounds while enemy is unwounded",
    "common": "increase agility by 1 for 2 rounds"
  },
  {
    "id": "ingredient-19",
    "name": "Fools' Parsley Leaves",
    "clue": "A deceiver's leaf sometimes credited with strength earned through foolish confidence.",
    "rare": "lower thrust attacks by 1 tn for 2 rounds",
    "uncommon": "add 2 cp for 2 rounds while enemy is unwounded",
    "common": "increase strength by 1 for 2 rounds"
  },
  {
    "id": "ingredient-20",
    "name": "Ginatia Petals",
    "clue": "The bitter petals are taken to keep the senses from fleeing after a terrible blow.",
    "rare": "lower blunt attacks by 1 tn for 2 rounds",
    "uncommon": "add 2 cp for 2 rounds while enemy is unwounded",
    "common": "delay 8 shock for 2 rounds"
  },
  {
    "id": "ingredient-21",
    "name": "Han Fiber",
    "clue": "Twisted into cord and cloth, its lesson is simple: what binds and cushions can outlast the blade.",
    "rare": "lower cuts attacks by 1 tn for 2 rounds",
    "uncommon": "add 1 cp for 2 rounds",
    "common": "lessen armor combat pool drain by 1"
  },
  {
    "id": "ingredient-22",
    "name": "Hellebore Petals",
    "clue": "A grim flower of old battlefields, said to lend force to the hand that strikes.",
    "rare": "lower attacks by 1 tn for 2 rounds against wounded enemies",
    "uncommon": "add 2 cp for 2 rounds while attacking",
    "common": "increase blunt damage rating by 1 for 2 rounds"
  },
  {
    "id": "ingredient-23",
    "name": "Honeysuckle",
    "clue": "Sweetness clings to the vine long after winter; folk tales make it a symbol of lingering strength.",
    "rare": "ignore knockout for 2 rounds",
    "uncommon": "add 2 cp for 2 rounds while defending",
    "common": "increase endurance by 1 for 2 rounds"
  },
  {
    "id": "ingredient-24",
    "name": "Idunn's Apples",
    "clue": "Golden fruit from tales of gods and renewal, treasured for preserving life's bright spark.",
    "rare": "lower attacks by 1 tn for 2 rounds against unwounded enemies",
    "uncommon": "add 2 cp for 2 rounds while defending",
    "common": "increase health by 1 for 2 rounds"
  },
  {
    "id": "ingredient-25",
    "name": "Longrube",
    "clue": "A deep-growing root eaten by laborers who must keep going after strength should be spent.",
    "rare": "lower defenses by 1 tn for 2 rounds",
    "uncommon": "add 2 cp for 2 rounds while unwounded",
    "common": "remove 3 fatigue"
  },
  {
    "id": "ingredient-26",
    "name": "Lotus Tree",
    "clue": "Dreaming beneath its branches, warriors are said to forget the sharpest memories of suffering.",
    "rare": "lower cuts attacks by 1 tn for 2 rounds",
    "uncommon": "add 2 cp for 2 rounds while attacking",
    "common": "delay 8 pain for 2 rounds"
  },
  {
    "id": "ingredient-27",
    "name": "Mandrake Root",
    "clue": "The screaming root is feared for its stubborn spirit and the refusal of its legend to be silenced.",
    "rare": "ignore knockdown for 2 rounds",
    "uncommon": "add 2 cp for 2 rounds while enemy is wounded",
    "common": "increase willpower by 1 for 2 rounds"
  },
  {
    "id": "ingredient-28",
    "name": "Molu",
    "clue": "A dense fungus believed to make both flesh and protection endure longer.",
    "rare": "ignore knockout for 2 rounds",
    "uncommon": "add 2 cp for 2 rounds while wounded",
    "common": "lessen armor combat pool drain by 1"
  },
  {
    "id": "ingredient-29",
    "name": "Moly",
    "clue": "A rare warding herb from travelers' tales, useful for slipping past the guarded point and clever hand.",
    "rare": "lower thrust attacks by 1 tn for 2 rounds",
    "uncommon": "add 2 cp for 2 rounds while unwounded",
    "common": "lower parries by 1 tn for 2 rounds"
  },
  {
    "id": "ingredient-30",
    "name": "Nostrix",
    "clue": "Its serrated leaves are said to remember every wound made by a sharp edge.",
    "rare": "lower thrust attacks by 1 tn for 2 rounds",
    "uncommon": "add 2 cp for 2 rounds while wounded",
    "common": "increase cutting damage rating by 1 for 2 rounds"
  },
  {
    "id": "ingredient-31",
    "name": "Pantao",
    "clue": "A fruit of long journeys and longer lives, associated with patient minds and unyielding purpose.",
    "rare": "lower blunt attacks by 1 tn for 2 rounds",
    "uncommon": "add 1 cp for 2 rounds",
    "common": "increase willpower by 1 for 2 rounds"
  },
  {
    "id": "ingredient-32",
    "name": "Pringrape",
    "clue": "Its dark juice stains the tongue like blood, and healers use it when the first red drops appear.",
    "rare": "lower attacks by 1 tn for 2 rounds against unwounded enemies",
    "uncommon": "add 2 cp for 2 rounds while enemy is unwounded",
    "common": "delay 8 blood loss for 2 rounds"
  },
  {
    "id": "ingredient-33",
    "name": "Ranogrin",
    "clue": "A reed of marsh and riverbanks, whispered to bend aside defenses and leave openings behind.",
    "rare": "lower blunt attacks by 1 tn for 2 rounds",
    "uncommon": "add 2 cp for 2 rounds while attacking",
    "common": "lower block by 1 tn for 2 rounds"
  },
  {
    "id": "ingredient-34",
    "name": "Raskovnik",
    "clue": "The legendary key-herb opens what should remain closed, including the hidden resolve within the heart.",
    "rare": "ignore knockdown for 2 rounds",
    "uncommon": "add 2 cp for 2 rounds while defending",
    "common": "increase willpower by 1 for 2 rounds"
  },
  {
    "id": "ingredient-35",
    "name": "Ribleaf",
    "clue": "Its broad leaves are pressed over fresh injuries, like green hands holding the blood inside.",
    "rare": "lower attacks by 1 tn for 2 rounds against wounded enemies",
    "uncommon": "add 2 cp for 2 rounds while defending",
    "common": "remove 4 blood loss"
  },
  {
    "id": "ingredient-36",
    "name": "Sanjeevani Herb",
    "clue": "A mountain herb of resurrection stories, carried when a fading life must not be allowed to leave.",
    "rare": "lower attacks by 1 tn for 2 rounds against wounded enemies",
    "uncommon": "add 2 cp for 2 rounds while unwounded",
    "common": "remove 4 blood loss"
  },
  {
    "id": "ingredient-37",
    "name": "Sewant Mushrooms",
    "clue": "These pale mushrooms grow in silence and are associated with waking those stunned into stillness.",
    "rare": "ignore knockout for 2 rounds",
    "uncommon": "add 2 cp for 2 rounds while unwounded",
    "common": "remove 4 shock"
  },
  {
    "id": "ingredient-38",
    "name": "Spinnak",
    "clue": "A wiry herb whose curling stems seem to twitch at every passing disturbance.",
    "rare": "lower cuts attacks by 1 tn for 2 rounds",
    "uncommon": "add 2 cp for 2 rounds while enemy is wounded",
    "common": "increase reflex by 1 for 2 rounds"
  },
  {
    "id": "ingredient-39",
    "name": "Verbena",
    "clue": "Sacred to crossroads and wandering, verbena is carried by those who refuse to let the land command them.",
    "rare": "lower defenses by 1 tn for 2 rounds",
    "uncommon": "add 1 cp for 2 rounds",
    "common": "ignore terrain penalties and negate enemy terrain bonuses for 2 rounds"
  },
  {
    "id": "ingredient-40",
    "name": "White Myrtle Petals",
    "clue": "Pale blossoms are steeped for warriors who must stand firm despite the body's loud complaints.",
    "rare": "ignore knockdown for 2 rounds",
    "uncommon": "add 2 cp for 2 rounds while attacking",
    "common": "remove 4 pain"
  },
  {
    "id": "ingredient-41",
    "name": "White Vine",
    "clue": "Its climbing tendrils never seem to tire, crawling over stone long after other plants have stopped.",
    "rare": "ignore knockout for 2 rounds",
    "uncommon": "add 2 cp for 2 rounds while enemy is wounded",
    "common": "movement has no cp cost for 2 rounds"
  },
  {
    "id": "ingredient-42",
    "name": "Winter Cherry",
    "clue": "A bright fruit that survives cold seasons, symbolizing life that refuses the long winter.",
    "rare": "lower blunt attacks by 1 tn for 2 rounds",
    "uncommon": "add 2 cp for 2 rounds while enemy is unwounded",
    "common": "increase health by 1 for 2 rounds"
  },
  {
    "id": "ingredient-43",
    "name": "Wolfsbane",
    "clue": "A feared flower of hunters and wolves; its poison is said to make wounded prey forget its weakness.",
    "rare": "lower thrust attacks by 1 tn for 2 rounds",
    "uncommon": "add 2 cp for 2 rounds while wounded",
    "common": "ignore crippled limb for 2 rounds"
  },
  {
    "id": "ingredient-44",
    "name": "Wolfsbane Leaves",
    "clue": "The leaves are linked to the endurance of hunted beasts that continue running despite the bite.",
    "rare": "lower attacks by 1 tn for 2 rounds against wounded enemies",
    "uncommon": "add 2 cp for 2 rounds while unwounded",
    "common": "increase toughness by 1 for 2 rounds"
  },
  {
    "id": "ingredient-45",
    "name": "Wolf's Aloe",
    "clue": "A cooling succulent named for the creature that survives tooth, frost, and hunger.",
    "rare": "lower attacks by 1 tn for 2 rounds against unwounded enemies",
    "uncommon": "add 2 cp for 2 rounds while defending",
    "common": "remove 2 wounds"
  },
  {
    "id": "ingredient-46",
    "name": "Yellow Mold",
    "clue": "Its dusty yellow bloom unsettles the senses, as though teaching the body to ignore sudden terror.",
    "rare": "lower cuts attacks by 1 tn for 2 rounds",
    "uncommon": "add 2 cp for 2 rounds while wounded",
    "common": "delay 8 shock for 2 rounds"
  },
  {
    "id": "ingredient-47",
    "name": "Yggdrasil Wood",
    "clue": "A fragment of the world-tree's legend: rooted against every storm and familiar with every path.",
    "rare": "ignore knockdown for 2 rounds",
    "uncommon": "add 2 cp for 2 rounds while unwounded",
    "common": "ignore terrain penalties and negate enemy terrain bonuses for 2 rounds"
  }
];
