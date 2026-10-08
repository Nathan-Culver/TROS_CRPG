# Smithing and alchemy update

**Latest update:** [MOBILE_COMBAT_AND_ALCHEMY.md](MOBILE_COMBAT_AND_ALCHEMY.md) describes current pair/triplet brewing rules from the latest `alchemy examples.pdf`, mobile fullscreen and compact combat. The historical matching rules below have been superseded.

**World interaction follow-up:** gathering and station access described below have been replaced by physical resource interactions, buildable stations, and NPC rentals. See [WORLD_CRAFTING_UPDATE.md](WORLD_CRAFTING_UPDATE.md) for the current controls and gathering chances. The original crafting rules and combat integration described here still apply.

Updated project: `C:\Users\s6ncu\OneDrive\Desktop\TROS_CRPG\index.html`

Open the game, create or load a character, press **C**, and choose **Crafting**. Its three sections are Alchemy, Blacksmithing, and Gathering & Stations.

## Playing

1. Establish an Alchemy kit or the required smithing stations in Gathering & Stations. These spend the character's coins and persist in saves.
2. Forage for herbs, mine ore, gather wood, and burn wood to charcoal. Work adds one Fatigue. Use Catch Breath in Conditions to recover.
3. In Alchemy, select up to five different carried ingredients, then check the effects to include. The colored cards show matching sources, rarity, and slot costs. The interface checks the skill requirement and five-slot budget before brewing.
4. Drink the resulting potions from Inventory or the existing battle Inventory. Permanent recovery applies immediately; temporary effects expire through combat rounds.
5. In Blacksmithing, refine ore and fuel into bars, select a metal weapon and carried bar, and choose potential quality improvements. Newly forged weapons appear in Inventory and can be equipped in the workshop.
6. Repair damaged weapons at the forge. The interface explains the success requirements and the risk of destruction.

## Implemented systems

- All 48 ingredients and their folklore clues and three effect tiers, transcribed from the Updated Rules document.
- Wits + Alchemy tests; Alchemy 1–5; Common single-source effects, Uncommon matching pairs, Rare matching triplets; independent ingredient and effect-slot limits; legal partial formulas and lower-tier brewing.
- Actual consumption on successful and failed crafting, potion inventory records, combat and menu use, temporary stat/CP/TN/damage effects, recovery, delayed penalties, movement benefits, terrain benefits, and knockdown/knockout immunity.
- Blacksmithing ranks through Grandmaster III, rank target numbers, extra Grandmaster dice, and SA advancement costs.
- Wrought/carburized/meteoric iron and all five steel recipes, with their fuel/input/station requirements and iron substitution.
- Mining and charcoal yields using the reference probabilities. Meteoric ore cannot be manufactured or purchased.
- Standard/Fine/Superlative outcomes, selectable quality improvements, individual weapon durability, wear chances, broken-weapon restrictions, repairs, and irreversible destruction on failed repair.
- Cutting/puncturing Blood Loss, blunt Shock, and Composite maneuver-cost traits in combat.
- Crafted weapon statistics and all crafting inventory, stations, skill ranks, active effects, and logs persist through the existing save/export/import systems.
- Ingredient and material icons use the supplied sheets through CSS crops. Colors and controls follow the existing dark parchment/gold style. Smaller screens have a working scrolling character sheet.

## Original rule precedence (superseded for alchemy matching)

The Updated Rules PDF governs ingredient data, the brewing pool, rarity matching, and formula skill requirements. The older quick reference and the new visual-aids PDF describe an older pair/triplet system; those conflicts were intentionally resolved in favor of Updated Rules. Consequently a Rare pair is invalid, Common effects do not require a pair, and a Rare triplet produces the listed two-round effect without an extra duration/potency bonus. Some older example ingredient matches also differ from the updated table.

The Blacksmithing Quick Reference governs quality rather than the older images: Fine and Superlative require the stated dice results and allow a choice of one or two improvements, including damage.

## Assumptions filling gaps in the sources

- Updated Rules supplies the Alchemy pool but no target number or success threshold. Brewing uses TN 6 and retains the older quick reference's two-success requirement and material loss on failure.
- New and older characters start at Alchemy 1 and Untrained Blacksmithing. Alchemy rank increases cost 2 SA; smithing uses the documented 2/3/4/5 SA progression. Spending removes points from the largest SA balances first and preserves all focus records. Victory awards 1 SA to the lowest available balance below 5 so progression remains attainable in this game's existing encounter loop.
- One successful refining test yields one bar, and one weapon requires one bar. All refining uses the smithing test and two-success threshold, following the reference checklist. Quality is inherited from the chosen iron source through advanced steel. Intermediate steel bars must have the same iron source; missing materials are rejected without consuming stock.
- Workshop stations are persistent character-owned access, available from the character menu, rather than new objects placed in the map. Prices in bits: Alchemy kit 24, Bloomery 48, Forge 48, Cementation 96, Welding Hearth 96, Crucible 144. Gathering and crafting each cost 1 Fatigue. Repair has no additional material cost because the source supplies none.
- Foraging yields one random ingredient from the complete list. Boulders and wood gathering are repeatable fieldwork actions governed by Fatigue rather than map resource depletion.
- Existing metal melee weapons default to Standard Bloomery durability. Iron wear rates are unspecified, so wrought/carburized/meteoric use 12%/9%/5%. Wooden weapons and unarmed combat are exempt. Stacked metal purchases become individual instances so damage does not affect every copy at once.
- A failed quality roll still yields a Standard weapon when the basic crafting test succeeds. Meteoric material has a Superlative check only. Quality damage increases are capped at St+3; stronger existing damage is preserved.
- Repeated doses refresh identical effects rather than stacking them. Different applicable effects combine. Conditional CP is tracked separately for each effect and can be spent once per round across all opponents/exchanges. Armor-drain reduction lasts two rounds and cannot exceed the actual armor penalty. Removing two wounds removes the two highest-severity wound records.
- Agility contributes half a point to Reflex and Knockdown while active. Temporary Health adds a current/max Health point and removes that point when it expires. Limb immunity suppresses limb Pain because the game has no separate crippled-limb subsystem. Free movement covers evasion, evasive attacks, and overrun rather than unrelated grapple/disarm costs.
- To make the specified terrain effect functional, encounters use forest clearings (50%, no modifier), uneven ground (30%, player -1 CP), or dense undergrowth (20%, player -1 CP and opponents +1 CP). Terrain is logged; the potion cancels both modifiers for its duration.

## Validation

Tested in headless Microsoft Edge against the actual game assets and the installed project. Direct opening of the saved `index.html` and the existing save/export/import payload were also verified. No JavaScript page errors or failed asset requests occurred.

Checks covered character creation and existing shop use; workshop navigation and gathering; 48 ingredient records; matching/duplicate/skill/slot restrictions; successful and failed brewing; iron and advanced steel production; Fine/Superlative improvements; repair success and destruction; independent durability; save reconstruction of crafted weapon statistics; Grandmaster advancement; combat immunity, stat/TN/CP bonuses, steel wound traits, terrain effects, temporary Health, effect expiry, and broken-weapon fallback. Desktop and 600-pixel-wide layouts were visually inspected and checked for horizontal overflow.

The complete balance of the game's combat and economy has not been playtested over a long campaign. Existing unrelated systems were retained; the deliberately added progression and terrain assumptions are listed above for later tuning.

## Files and backup

Modified: `index.html`, `classes/GameUI.js`, `classes/BattleSystem.js`.

Added: `data/craftingData.js`, `classes/CraftingSystem.js`, `classes/CraftingUI.js`, `classes/CraftingCombat.js`, `css/crafting.css`, and two reference image assets under `images/crafting/`.

`original-files-backup.zip` contains every pre-existing file replaced during installation. `crafting-update-files.zip` contains the changed/added files with their project-relative paths; it is an update package, not a standalone copy of the entire game.
