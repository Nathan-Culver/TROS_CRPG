# Mobile play

The map fills a touch device's screen in portrait or landscape, preserving tile/sprite proportions and camera bounds when the device rotates. Desktop play retains the original map scale and WASD/E/C shortcuts, with a map that also fits smaller browser windows.

Touch devices show translucent direction buttons at bottom left and E (Interact) / C (Character) buttons at bottom right. Hold a direction to walk, slide between directions, and release to stop. Dragging off the pad, interruption, screen rotation, hiding the page or switching menus clears touch input. These controls use normal player movement/collision checks and world interactions; resource nodes, stations, NPCs and rental requirements remain physical map objects.

Begin your journey starts the game by touch or mouse. The character sheet has a Return to world button. Controls disappear while menus or combat are active. Native menu and battle controls remain tappable without a keyboard. Menus respect safe screen areas, stack columns on narrow devices, use larger inputs and buttons, preserve readable text, and allow vertical scrolling. Character tabs scroll horizontally and bring the selected tab into view. Battle choices, dice commitments, actions, inventory and history fit within the viewport and scroll as needed. Browser zoom is available.

Verified with browser phone emulation at 390×844, 844×390 and 320×568, plus desktop keyboard play: touch start, held movement, release and cancellation, map sizing, rotation, menus, crafting, NPC tool/workshop interaction, battle controls and inventory. No JavaScript or asset-request errors. Physical Android/iOS devices were not available for testing.
