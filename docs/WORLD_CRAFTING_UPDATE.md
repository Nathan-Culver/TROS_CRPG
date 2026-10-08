# Crafting now takes place in the world

Open the original game's `index.html`, create or load a character, and use **WASD** to walk. Press **E** beside a highlighted resource, NPC, campsite, campfire, or crafting station. The map shows directions and tile distances to your camp and the smith.

## Resources

- **Bushes:** interacting has a **65%** chance of gathering the patch's herb. The 48 updated ingredients are represented along the reachable gathering trail. Suitable existing map bushes are also interactive.
- **Grass:** every four tiles walked through grassy terrain gives a **3%** chance of noticing and gathering a herb. This is passive, without an extra Fatigue charge.
- **Trees:** carry a **woodcutting axe** and interact. There is a **75%** chance of gathering wood. Existing map trees and the added timber trees work this way.
- **Large rocks:** carry a **pickaxe** and interact. There is a **70%** chance of gathering **1–3 stone**, a **20%** chance of gathering ore, and a **10%** chance of finding nothing usable. On an ore result, the original iron/meteoric ore yield probabilities apply. Suitable existing large rocks are interactive too.
- Active gathering attempts cost one Fatigue, including unsuccessful attempts. Bush patches permit one attempt before depletion; trees and rocks permit three. Individual depletion is saved. Nodes regrow after 1,200 world pixels of exploration from their last attempt.

## Tools and the village workshop

Find the **Village Smith** near the starting area and press E to speak to him. A pickaxe costs 3 copper, a woodcutting axe costs 3 copper, and portable alchemy tools cost 6 copper. Tools must be carried; they do not need a weapon-equipment slot.

Rent the smith's workshop for **1 silver per visit**. Physical furnaces, forge/anvil, welding hearth, and alchemy bench are beside the NPC. Walk to a station and press E to work. A rental ends when you leave the workshop grounds (100 world pixels from the smith) or load another character/save. It is not permanent ownership.

## Build your own stations

Find **Your Campsite**, press E, and choose a station to build using carried materials. The finished object appears on the map. Return to that object to forge, refine, repair, or brew. Construction and ownership persist in saves.

| Station | Construction materials |
| --- | --- |
| Alchemy workbench | 4 wood |
| Forge and anvil | 4 wood, 8 stone, 2 iron ore |
| Welding hearth | 4 wood, 6 stone, 4 charcoal |
| Bloomery furnace | 6 wood, 10 stone, 4 charcoal |
| Cementation furnace | 6 wood, 10 stone, 4 charcoal |
| Crucible furnace | 6 wood, 10 stone, 4 charcoal |

Construction costs one Fatigue. The campfire turns carried wood into charcoal using the original yield rules. You can rest at camp. Portable alchemy tools can be set out at the campsite's work surface.

Stations purchased in the earlier version are migrated into actual built objects at your campsite, so those purchases retain their value.

## Location requirements

Gathering buttons and station-purchase buttons were removed from the character sheet. Its World & Supplies tab provides carried-stock and location information. Resource collection requires interacting on the map. Crafting screens open at world stations and remain available for planning from the character sheet, but crafting transactions require physical proximity to the relevant station and actual ownership or an active rental. Recipes requiring a forge and welding hearth require both to be nearby.

## Sources and assumptions

Alchemy ingredient/effect rules and smithing production, quality, durability and repair rules from the previous update remain in place. The gathering chances requested in this follow-up override the earlier guaranteed gathering actions. The exact chances, tool prices, construction costs, depletion/regrowth distances, and rental duration are game-design assumptions because these details were not specified in the reference rules. Existing terrain/scenery and character sprite assets supply the world visuals.

## Tested

Verified actual keyboard walking and E interactions in Microsoft Edge: harvesting and depletion, tool requirements, smith dialogue and payment, rental expiry, visible construction, refining and forging at built stations, campfire charcoal, camp alchemy access, passive grass gathering, chance-based wood success/failure, stone and less frequent ore results, remote-action rejection, and persistence of built stations and harvest state in existing save payloads. Desktop and 600-pixel-wide dialogue layouts were inspected; no JavaScript page errors or failed asset requests occurred.

`world-crafting-backup.zip` preserves the files replaced by this follow-up. The earlier original-file backup remains available separately. `world-crafting-update-files.zip` contains this follow-up's changed files with project-relative paths; it is an update package rather than a standalone copy of the game.
