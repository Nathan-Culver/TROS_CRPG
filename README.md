# The Riddle of Steel

## [▶ Play the game in your browser](https://Nathan-Culver.github.io/TROS_CRPG/)

A browser RPG with character creation, exploration, tactical combat, physical gathering, alchemy and blacksmithing. No installation, account, or backend is needed to play.

### Controls

| Key | Action |
| --- | --- |
| Space | Begin from the title screen |
| WASD | Walk around the world |
| E | Interact with nearby resources, the smith, camp or a crafting station |
| C | Open the character sheet, inventory, crafting plans and saves |
| Escape | Close a menu or conversation |

Gather herbs from bushes and occasionally while walking through grass. Buy an axe and pickaxe from the village smith to gather wood and quarry stone or ore. Rent the smith's physical workshop or build stations at your campsite. Walk beside the required station to brew, refine, forge or repair.

Crafting uses carried inventory and actual skill tests. Potions, weapon quality, steel traits and durability affect gameplay. The crafting panels allow planning away from a station but cannot bypass location requirements.

### Saves

Browser save slots remain on the browser/device used to play. Export a JSON save to keep a portable copy and import it in another browser. To move an existing local-game character to this hosted game, export from the local game and import on the hosted site; browser storage is separate for each site.

### Run locally

Open `index.html`, or serve this directory with a static web server (for example `python -m http.server 8000`) and open `http://localhost:8000/`. The project uses plain HTML, CSS, JavaScript and local assets, with no build step.

### GitHub hosting

GitHub Pages serves `main` from the repository root. `.nojekyll` ensures the game files are published as a static app. Future pushes to `main` update the playable site. The repository page shows the source; the prominent Play link above opens the game.

### Project contents

- `classes/`, `js/`, `data/`, `css/`: game systems and map data.
- `images/`: complete local visual assets, including the detailed crafting sprite atlas.
- `tools/`: existing asset-building and gameplay verification utilities.
- `references/`: the supplied crafting rule PDFs.
- `docs/`: crafting rules, world interactions, design assumptions and sprite provenance.

Old ZIP backups, scratch output and the inactive nested `TROS_TD_CRPG` copy are retained locally and excluded from version control. This repository contains the complete current playable game.

## Mobile play

Tap Begin your journey to start. Touch devices display a translucent direction pad and Interact/Character buttons on the map. Hold to walk, release to stop. Use Return to world to close the character sheet. Portrait and landscape layouts adapt to your screen; battle and crafting panels scroll and remain touch accessible. See [Mobile support](docs/MOBILE_SUPPORT.md).
