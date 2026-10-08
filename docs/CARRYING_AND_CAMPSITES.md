# Carrying, campsite storage, deployment and fire

## Playing

Your Inventory and map now show carried weight and capacity. Item rows show their weight per unit. Stored items and deployed objects do not count against the character's load. Bulky gear reduces Combat Pool and movement; heavy extra equipment makes travel and combat fatigue accumulate faster. Worn armor keeps its existing armor penalties.

Buy a two-person tent, portable fire pit or camp storage box from the village smith, or select them in starting Travel Gear. In Inventory, choose **Deploy**. Walk and turn to choose clear ground in front of the character; press **A / E** or Place to confirm. **B / Escape** or Cancel leaves the item in Inventory. Placement checks terrain, object footprints, map limits and an approach space, and avoids reserved workshop plots.

Tents provide rest and a work surface for carried alchemy tools. Fire pits provide charcoal production from carried wood. Interact with each deployed object to pack it back into Inventory, provided it fits. Permanent workshop stations stay at their original home plots; a tent redeployed at the original site retains the home building menu. Campsites can otherwise be placed anywhere on reachable, clear map ground.

A physical storage box starts beside the original tent. Interact with it to store or retrieve a chosen quantity. Its capacity is 200 lb. Storing equipped gear unequips it; crafted quality, improvements, durability, potions and other record data are retained. A box must be empty before being packed. Campsites, coordinates, storage contents and travel fatigue are included in browser saves and JSON exports/imports.

The bloomery, cementation furnace, crucible, forge and welding hearth now animate their existing fire artwork with changing glow and rising embers. The alchemy bench and anvil remain static. Reduced-motion preferences keep the fire imagery still.

## Rules and adaptations

Sources inspected: TRoS Core Rulebook, printed page 94 (Tables 5.2 and 5.3), and TRoS Companion, printed pages 70–72. The Companion fits this game's existing Flower of Battle armor system.

- The Companion treats interference from bulk separately from fatigue caused by weight. Weight above `(Strength + Endurance) × 3 / 5 / 10 / 20` lb adds `1 / 2 / 3 / 5` to the fatigue-rate penalty. Exact boundaries keep the lower tier. Worn armor/clothing are excluded from extra-equipment weight but remain part of total carried mass. Listed Overweight/Obese flaws add their fatigue modifier.
- A carried Travel Pack is treated as a worn large backpack: −1 CP and −1 Move. Packed raw supplies do not add a second full-sack penalty. Loose cargo or packed campsite bundles are mapped to the book's heavy/unwieldy categories, giving another −1 or −2 CP and −1 Move. These item-to-category mappings are game interpretations.
- Combat fatigue uses a minimum-one interval of `2 × Endurance − armor CP penalty − bulk CP penalty − weight/body fatigue penalty`. Weight does not directly subtract CP. The rulebook's plate/backpack example is reproduced by the tests.
- The core book's auto-lift values are used as a **game carrying limit**: `25 × (permanent Strength + 1)` lb (125 lb at Strength 4). The tabletop rules use descriptive burden categories and lifting tests rather than this exact inventory hard cap. The carrying cap is therefore an explicit browser-game adaptation.
- Item weights are gameplay estimates, not transcriptions of a TRoS equipment weight table. Tent 15 lb, fire pit 12 lb, storage box 10 lb, ore/stone/bar 5 lb, wood 3 lb, charcoal 1 lb, meteor ore 8 lb, ingredients 0.1 lb and potions 0.5 lb. Other equipment uses explicit values or documented category estimates in `data/campingData.js`. Animals are walking companions and have no carried body weight; their saddle does. Coins are kept in the existing numeric purse.
- Shop fire-pit and box prices, the 200-lb storage limit and starter box are game choices. The tent retains the existing catalog price. Travel uses a compressed clock: 1,200 world pixels count as one half-hour increment for fatigue. Idle time and menus do not advance that travel counter.
- New capacity-rejected purchases, pickups, crafting and withdrawals preserve money, inputs and fatigue. Failed crafting rolls still consume inputs normally. Old saves or exceptional loot may already exceed capacity; their items are retained and movement drops to one quarter until the load is reduced. Items can be stored, deployed or dropped to recover.

## Verification

Verified every weight threshold, capacity rejection, money preservation, exact storage quantities, equipped-item removal, crafted-item metadata, non-empty box protection, remote access rejection, all three deployment/packing cycles, occupied-spot rejection/cancellation, original tent-site redeployment and workshop building, a capacity-rejected brew rollback, actual saved-game restoration, bulk effects on CP and real movement, and travel fatigue.

Verified the real storage interface, mobile Deploy/A/B controls, all five fire station animations, reduced-motion settings, and no missing assets or uncaught errors. Existing brewing formulas, potion effects, phone/tablet combat, keyboard/touch collision, all twelve station approaches and combined forge/hearth access also passed.

Repeatable browser checks are `tools/test_campsites.cjs` and `tools/test_camp_edge_cases.cjs`, using the same Playwright environment options as the earlier regression scripts.
