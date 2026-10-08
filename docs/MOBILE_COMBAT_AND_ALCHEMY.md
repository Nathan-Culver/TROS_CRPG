# Mobile combat, fullscreen and updated brewing

## Playing on mobile

Tap Begin your journey to enter fullscreen in browsers that support it. The corner button enters/exits fullscreen from the title, creation form, world and menus. Browsers without the API show Add to Home Screen guidance; opening the installed home-screen app uses the fullscreen/standalone web manifest. Installation does not provide offline play.

Character now occupies the raised left touch-action position; Interact occupies the lower right position. Held movement and world interactions use the same input and collision systems as desktop.

Combat keeps the battlefield and all combatants visible. Portrait stacks the scene above four tabs; short landscape screens put the scene beside the controls. The full background image is fitted without cropping. Actions contains initiative, opponent, maneuver, defense and dice commitments. Tactics contains stance, weapon, hit location, initiative purchase and rule notes. Status shows combat pools, stance, orientation and wounds; Log shows exchange results. Resolve, Inventory, Disengage and Flee remain in a fixed action dock. Only the selected panel scrolls when necessary. Desktop retains its simultaneous panels and original controls. Tabs support keyboard arrow navigation.

## Latest alchemy examples

The user's request to update crafting from `alchemy examples.pdf` supersedes the previous conflict resolution for matching rules. That PDF's four pages now have working recipe presets in the alchemy menu. Presets only select carried ingredients; they never grant resources or bypass the nearby bench requirement.

- Every effect requires a pair of distinct ingredients with matching effects at that rarity.
- Common uses 1 effect slot, Uncommon 2, Rare 3; maximum 5 slots and 5 distinct ingredients.
- Three or more matching sources unlock one triplet bonus: +2 combat rounds or +1 numerical potency. The default is duration for temporary effects and potency for instant recovery. Additional matching sources do not grant additional bonuses.
- Binary immunities and free movement have no numerical potency; their triplet option is duration. Immediate recovery has no duration; its triplet option is potency. Armor-drain reduction has no source duration; its existing two-round game duration remains and its triplet can increase the amount.
- Enhanced effects reach combat TNs, conditional/general CP, traits, damage, armor drain, delayed penalties and immediate recovery. Health bonuses expire by the correct amount. Identical effects refresh without stacking; a weaker dose does not replace a stronger active effect.
- Alchemy ranks and formula requirements remain from Updated Rules: Common 1, one Uncommon 2, two Uncommon 3, Rare 4, Rare + Uncommon 5. Partial formulas remain allowed.
- Ingredient data remains from Updated Rules except Arenaria's Uncommon effect: the latest Example 2 explicitly matches Aconite's CP bonus against a wounded enemy, so Arenaria now uses that effect. Its Rare Knockout and Common wound-recovery effects are unchanged.
- Existing potions and saves remain usable; already brewed potions retain their stored effects.

## Crafting reference audit

The smithing rank tests, SA progression, ore/iron/steel recipes and station requirements, quality rolls, durability wear, repair/destruction thresholds and material combat traits align with Blacksmithing Quick Reference. Purchased metal weapons are initialized as Standard and successfully repair; the earlier suspected missing quality initialization was not present in the current saved code.

The implementation includes deliberate game adaptations where references leave gaps: brewing TN 6 and 2 successes, one bar per successful refining test and per forged weapon, crafting fatigue, rental/build costs, unspecified iron wear rates, two-round armor reduction, and limb impairment represented through location-specific Pain. Physical boulders yield stone more often than ore at the user's request. Rare ore probability applies inside the ore outcome. Long-term difficulty and economy balance have not been playtested.

## Verification

Actual Fullscreen API entry/exit/re-entry; unsupported-browser fallback; creation-form scrolling on 320x568, 568x320 and 768x1024; combat at 390x844, 320x568, 844x390, 568x320 and 768x1024 with four opponents; every tab, inventory popup and Resolve; desktop controls; all four PDF formulas, skill and slot limits, successful/failed brewing, triplet duration and potency, expiry and repeated doses; actual UI recipe selection/brewing; shop-weapon repair; failed Fine repair destruction; physical station requirement; swapped touch controls; four-direction collisions and all twelve station approaches. No uncaught script or missing asset errors in these checks.

Regression checks are in `tools/test_mobile_crafting.cjs` and `tools/test_crafting_ui.cjs`. Install Playwright and its Chromium browser, serve the project on port 8766, then run the scripts with Node. `TEST_GAME_URL`, `PLAYWRIGHT_EXECUTABLE`, `PLAYWRIGHT_MODULE` and `TEST_ARTIFACTS` can override the default URL, browser, module and screenshot folder. Tests use isolated browser contexts and do not change project assets or shared game saves.


## Handheld controls and compact menus

- A interacts with nearby resources, stations and NPCs. B closes world interaction windows, character/crafting/save screens and the battle inventory popup; on the open map it has no action.
- L is the oblong Select button at the upper left: opens the character screen and pauses map movement/encounters. R is the oblong Start button at the upper right: opens Browser Saves, with an Export Saves option for import/export, and also pauses the world. The same button toggles its screen closed; B resumes too. These system screens follow the existing game's availability outside active encounters; battle inventory still supports B to close.
- A/directions are hidden in menus; B remains available. L/R release held touch and keyboard movement before opening a screen. Fullscreen is placed beside R and route hints below the top controls.
- Mobile character sections use one native dropdown, compact portrait/name headers and two-column information cards (three columns on wider touch screens). Inventory and save cards use additional horizontal columns when space allows. Desktop keeps its original tabs.
- Mobile crafting uses Craft and task dropdowns. Alchemy switches between Ingredients and Potion; selected ingredients retain their clues and the review button opens effects. Smithing selects Refine, Forge, Repair/Equip or Materials, with one refining recipe shown at a time. Forging fields share two columns. Long instructions and skill advancement controls use disclosures; crafting notices remain visible. All fields and rule transactions are reused from the existing systems.
- Verified A/B actions, L/R toggle/pause behaviour, browser save/load, JSON export/import/load, character and crafting navigation at 390x844, 320x568, 844x390, 568x320 and 768x1024, and desktop tabs. Repeatable checks: `tools/test_controller_menus.cjs`.
