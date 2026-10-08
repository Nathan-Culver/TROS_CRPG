# Crafting sprites

The map's flat-colored prop placeholders were replaced by a transparent pixel-art atlas at `images/crafting/crafting-props.png`. The renderer in `classes/WorldCrafting.js` uses precise sprite bounds so every object is complete and does not pick up neighboring cells.

The atlas contains Bloomery, Cementation and Crucible furnaces; a forge; welding hearth; a steel anvil on a wooden stump; an alchemy workbench; a campfire; and a quenching trough available for future decoration. The forge station draws the forge and anvil together. Other working stations have distinct silhouettes. Alchemy uses shaded glassware, herbs, a mortar and retort on a furnished oak bench. Existing map resources, character sprites and gameplay behavior were preserved.

Created with the built-in ImageGen tool, using `images/crafting/smithing.webp` and `images/crafting/ingredients.webp` as visual references. Generated alpha transparency was preserved. The atlas is not an animation.

Prompt: Create a production-ready transparent nine-prop atlas matching the provided detailed medieval pixel-art references, arranged as three columns and three rows: Bloomery/Cementation/Crucible furnaces; Forge/Welding Hearth/Anvil; Alchemy Workbench/Campfire/Quenching Trough. Use textured dark masonry, shaded steel and oak, natural ember flames, consistent oblique top-down perspective and crisp pixel clusters. Keep all props separate with transparent margins; no poster labels, panels, borders, ground tiles or flat geometric placeholders.

Verified in the running game: transparent asset loading, separate station frames, map scale, visible forge/anvil and alchemy details, working station interactions, and absence of JavaScript or asset-request errors.

## Workshop layout

The village workshop now forms a U with the smith at its open entrance, two stations on each arm and two across its back. The buildable campsite stations use the mirrored layout, opening toward camp. Space between stations and the central courtyard remains clear of generated resource nodes. Forge and welding hearth remain close enough for combined recipes. Rental grounds follow the whole workshop footprint, so walking between its stations preserves rental access. Existing built-station IDs and save data are retained. Verified actual player collision movement and E interaction at all twelve stations, combined-station access, rental boundaries and absence of JavaScript/asset errors.
