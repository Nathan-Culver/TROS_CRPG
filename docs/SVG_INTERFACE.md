# Editable SVG interface artwork

Following the chosen approach, detailed pixel sprites, portraits, map textures, crafting sheets and background art stay as bitmaps. Tracing those would change their fine detail and significantly increase downloads. The title crest, four direction arrows, interaction/character controls, journey/return buttons and three crafting discipline icons now use twelve small, genuine SVG drawings in `images/ui/`. They contain editable paths, shapes and text, with no embedded raster images. The armor coverage diagram already uses interactive inline SVG in `index.html` and remains editable there.

Each SVG has explicit dimensions and a `viewBox`. Edit its paths, transforms, fills or strokes with a vector editor or text editor. The palette uses parchment `#ead9af`, gold `#c9a75c` and the alchemy accent `#70a999`. Existing raster sources remain intact. `tools/build_svg_ui.py` can regenerate the original icon set; customize that script too if regenerating after manual edits.

The game loads SVG through normal image elements, with fixed icon dimensions and responsive CSS. Decorative icons have empty alt text, while buttons retain descriptive accessible names. Icon images do not intercept pointer input or drag gestures. This preserves the complete touch target. Individual self-contained SVG files also support direct local-file play without an external SVG-symbol fetch.

Verified SVG loading alongside the existing animated bitmap sheets, mobile touch movement/actions, portrait and landscape layouts, title and character creation screens, crafting tabs and battle UI. Desktop keyboard controls remain available.
