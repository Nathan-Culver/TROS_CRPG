/**
 * Builds the Mapper Mate world, positions the camera, draws map layers, emits falling leaves, and runs the main animation loop.
 */

const canvas = document.querySelector('canvas')
// Stores the canvas drawing surface used for every map, sprite, and visual effect.
const c = canvas.getContext('2d')
c.imageSmoothingEnabled = false
// Reads the screen pixel density so the canvas stays sharp on high-resolution displays.
const dpr = window.devicePixelRatio || 1

canvas.width = 1024 * dpr
canvas.height = 576 * dpr

// Stores the tile size values used by the rest of this file.
const TILE_SIZE = 16
// Stores the map rows values used by the rest of this file.
const MAP_ROWS = l_New_Layer_1.length
// Stores the map cols values used by the rest of this file.
const MAP_COLS = l_New_Layer_1[0].length

// Stores the map width values used by the rest of this file.
const MAP_WIDTH = TILE_SIZE * MAP_COLS
// Stores the map height values used by the rest of this file.
const MAP_HEIGHT = TILE_SIZE * MAP_ROWS
// Stores the map asset version values used by the rest of this file.
const MAP_ASSET_VERSION = 'mapper-2026-08-05'

// Stores the scene scale values used by the rest of this file.
let SCENE_SCALE = 2 + dpr

// Stores the viewport width values used by the rest of this file.
let VIEWPORT_WIDTH = canvas.width / SCENE_SCALE
// Stores the viewport height values used by the rest of this file.
let VIEWPORT_HEIGHT = canvas.height / SCENE_SCALE

// Stores the scene center x values used by the rest of this file.
let SCENE_CENTER_X = VIEWPORT_WIDTH / 2
// Stores the scene center y values used by the rest of this file.
let SCENE_CENTER_Y = VIEWPORT_HEIGHT / 2
// Stores the max camera x values used by the rest of this file.
let MAX_CAMERA_X = Math.max(0, MAP_WIDTH - VIEWPORT_WIDTH)
// Stores the max camera y values used by the rest of this file.
let MAX_CAMERA_Y = Math.max(0, MAP_HEIGHT - VIEWPORT_HEIGHT)

// Match the map to its displayed size without stretching tiles or sprites.
const touchViewport = window.matchMedia('(any-pointer: coarse)')
function resizeMapViewport() {
  document.body.classList.toggle('touch-device', touchViewport.matches)
  const frame = canvas.getBoundingClientRect()
  canvas.width = Math.max(1, Math.round(frame.width * dpr))
  canvas.height = Math.max(1, Math.round(frame.height * dpr))
  c.imageSmoothingEnabled = false
  SCENE_SCALE = touchViewport.matches ? 3 * dpr : 2 + dpr
  VIEWPORT_WIDTH = canvas.width / SCENE_SCALE
  VIEWPORT_HEIGHT = canvas.height / SCENE_SCALE
  SCENE_CENTER_X = VIEWPORT_WIDTH / 2
  SCENE_CENTER_Y = VIEWPORT_HEIGHT / 2
  MAX_CAMERA_X = Math.max(0, MAP_WIDTH - VIEWPORT_WIDTH)
  MAX_CAMERA_Y = Math.max(0, MAP_HEIGHT - VIEWPORT_HEIGHT)
  document.documentElement.style.setProperty('--map-left', `${frame.left}px`)
  document.documentElement.style.setProperty('--map-top', `${frame.top}px`)
  document.documentElement.style.setProperty('--map-bottom', `${Math.max(0, window.innerHeight-frame.bottom)}px`)
}
resizeMapViewport()
window.addEventListener('resize', resizeMapViewport)
touchViewport.addEventListener('change', resizeMapViewport)

// Associates each Mapper Mate tile layer with the exported tile-number array used to draw it.
const layersData = {
  l_New_Layer_1,
  l_New_Layer_2,
  l_New_Layer_3,
  l_New_Layer_4,
}

// Stores the tree foreground tiles values used by the rest of this file.
const TREE_FOREGROUND_TILES = new Set([
  ...Array.from({ length: 15 }, (_, index) => 4 + index),
  ...Array.from({ length: 15 }, (_, index) => 43 + index),
  ...Array.from({ length: 15 }, (_, index) => 82 + index),
  ...Array.from({ length: 15 }, (_, index) => 121 + index),
  ...Array.from({ length: 15 }, (_, index) => 160 + index),
])

// Mapper Mate stores each large rock as a multi-row stamp. Draw the upper
// rows again after the player so the character passes behind the rock face,
// while the bottom row remains part of the normal map/collision plane.
// Stores the rock foreground tiles values used by the rest of this file.
const ROCK_FOREGROUND_TILES = new Set([
  ...Array.from({ length: 3 }, (_, index) => 510 + index),
  ...Array.from({ length: 3 }, (_, index) => 549 + index),
  ...Array.from({ length: 4 }, (_, index) => 520 + index),
  ...Array.from({ length: 4 }, (_, index) => 559 + index),
  ...Array.from({ length: 4 }, (_, index) => 598 + index),
])

// The shrubs are three tile rows tall. Their upper two rows belong above the
// player; their bottom row stays on the ground plane beside the collision map.
// Stores the shrub foreground tiles values used by the rest of this file.
const SHRUB_FOREGROUND_TILES = new Set([
  ...Array.from({ length: 3 }, (_, index) => 235 + index),
  ...Array.from({ length: 3 }, (_, index) => 274 + index),
  ...Array.from({ length: 3 }, (_, index) => 243 + index),
  ...Array.from({ length: 3 }, (_, index) => 282 + index),
])

// Stores the structure foreground tiles values used by the rest of this file.
const STRUCTURE_FOREGROUND_TILES = new Set([
  ...TREE_FOREGROUND_TILES,
  ...ROCK_FOREGROUND_TILES,
  ...SHRUB_FOREGROUND_TILES,
])

// Lists the map layers that must be drawn after the player so tall scenery can hide the character correctly.
const foregroundLayersData = {
  l_New_Layer_2,
}

// Limits each foreground layer to tree, rock, shrub, or structure tiles that should overlap the player.
const foregroundLayerFilters = {
  l_New_Layer_2: STRUCTURE_FOREGROUND_TILES,
}

// Loads each map image and records the tile size and column count needed to crop it correctly.
const tilesets = {
  l_New_Layer_1: {
    imageUrl: `./images/tileset-forest-and-nature.png?v=${MAP_ASSET_VERSION}`,
    tileSize: TILE_SIZE,
  },
  l_New_Layer_2: {
    imageUrl: `./images/tileset-forest-and-nature.png?v=${MAP_ASSET_VERSION}`,
    tileSize: TILE_SIZE,
  },
  l_New_Layer_3: {
    imageUrl: `./images/tileset-water-and-ponds.png?v=${MAP_ASSET_VERSION}`,
    tileSize: TILE_SIZE,
  },
  l_New_Layer_4: {
    imageUrl: `./images/tileset-coastal-terrain.png?v=${MAP_ASSET_VERSION}`,
    tileSize: TILE_SIZE,
  },
}

// Tile setup
// Holds every solid map rectangle created from the exported collision layer.
const collisionBlocks = []
// Uses Mapper Mate tile size for each collision rectangle.
const blockSize = TILE_SIZE

collisions.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if (symbol === 1) {
      collisionBlocks.push(
        new CollisionBlock({
          x: x * blockSize,
          y: y * blockSize,
          size: blockSize,
        })
      )
    }
  })
})

// Updates the visible layer using the latest game state.
const renderLayer = (
  tilesData,
  tilesetImage,
  tileSize,
  context,
  includedSymbols = null
) => {
  const tilesPerRow = Math.ceil(tilesetImage.width / tileSize)

  tilesData.forEach((row, y) => {
    row.forEach((symbol, x) => {
      if (symbol !== 0 && (!includedSymbols || includedSymbols.has(symbol))) {
        const srcX = ((symbol - 1) % tilesPerRow) * tileSize
        const srcY =
          Math.floor((symbol - 1) / tilesPerRow) * tileSize

        context.drawImage(
          tilesetImage, // source image
          srcX,
          srcY, // source x, y
          tileSize,
          tileSize, // source width, height
          x * TILE_SIZE,
          y * TILE_SIZE, // destination x, y
          TILE_SIZE,
          TILE_SIZE // destination width, height
        )
      }
    })
  })
}

// Updates the visible static layers using the latest game state.
const renderStaticLayers = async (layersData, layerFilters = {}) => {
  const offscreenCanvas = document.createElement('canvas')
  offscreenCanvas.width = MAP_WIDTH * dpr
  offscreenCanvas.height = MAP_HEIGHT * dpr
  const offscreenContext = offscreenCanvas.getContext('2d')
  offscreenContext.imageSmoothingEnabled = false
  offscreenContext.scale(dpr, dpr)

  // Draws each map layer in Mapper Mate's exported order using its assigned tileset.
  for (const [layerName, tilesData] of Object.entries(layersData)) {
    const tilesetInfo = tilesets[layerName]
    if (tilesetInfo) {
      try {
        const tilesetImage = await loadImage(tilesetInfo.imageUrl)
        renderLayer(
          tilesData,
          tilesetImage,
          tilesetInfo.tileSize,
          offscreenContext,
          layerFilters[layerName]
        )
      } catch (error) {
        console.error(`Failed to load image for layer ${layerName}:`, error)
      }
    }
  }

  // Optionally draw collision blocks and platforms for debugging
  // collisionBlocks.forEach(block => block.draw(offscreenContext));

  return offscreenCanvas
}
// END - Tile setup

// Spawn near the center of the authored world in a collision-checked clearing.
// Tile (100, 30) has a wide obstacle-free buffer in the Mapper Mate data.
// Stores the player spawn tile values used by the rest of this file.
const PLAYER_SPAWN_TILE = { x: 100, y: 30 }
// Creates the player at the map spawn with the selected walking sprites and collision dimensions.
const player = new Player({
  x: PLAYER_SPAWN_TILE.x * TILE_SIZE,
  y: PLAYER_SPAWN_TILE.y * TILE_SIZE,
  size: 15,
})

// Tracks whether each WASD movement key is currently held down.
const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
}

// Stores last time for the calculations and drawing code below.
let lastTime = performance.now()
// Tracks the map position currently centered inside the visible canvas.
const camera = { x: 0, y: 0 }
// Resets player to spawn to its starting values.
const resetPlayerToSpawn = () => {
  player.x = PLAYER_SPAWN_TILE.x * TILE_SIZE
  player.y = PLAYER_SPAWN_TILE.y * TILE_SIZE
  player.velocity.x = 0
  player.velocity.y = 0
  player.currentFrame = 0
  player.elapsedTime = 0
  player.currentSprite = player.sprites.walkDown
  player.currentSprite.frameCount = PLAYER_WALK_FRAMES.length
  player.facing = 'down'
  player.center = { x: player.x + player.width / 2, y: player.y + player.height / 2 }
  camera.x = Math.min(MAX_CAMERA_X, Math.max(0, player.center.x - VIEWPORT_WIDTH / 2))
  camera.y = Math.min(MAX_CAMERA_Y, Math.max(0, player.center.y - VIEWPORT_HEIGHT / 2))
}
// Creates the menu system and connects map entry, saves, knockout recovery, and character selection.
const gameUI = new GameUI({
  onEnterMap: (character) => {
    player.setCharacterSprite(character?.spriteId || DEFAULT_CHARACTER_SPRITE_ID)
    Object.values(keys).forEach((key) => {
      key.pressed = false
    })
    player.velocity.x = 0
    player.velocity.y = 0
    lastTime = performance.now()
  },
  getSaveState: () => ({
    player: { x: player.x, y: player.y, facing: player.facing, currentFrame: player.currentFrame },
    camera: { x: camera.x, y: camera.y },
    encounter: { distanceTravelled: battleSystem.distanceTravelled, nextEncounterDistance: battleSystem.nextEncounterDistance },
  }),
  onLoadSave: (world) => {
    const savedPlayer = world.player || {}, savedCamera = world.camera || {}, savedEncounter = world.encounter || {}
    player.x = Math.max(0, Math.min(MAP_WIDTH - player.width, Number(savedPlayer.x) || PLAYER_SPAWN_TILE.x * TILE_SIZE))
    player.y = Math.max(0, Math.min(MAP_HEIGHT - player.height, Number(savedPlayer.y) || PLAYER_SPAWN_TILE.y * TILE_SIZE))
    player.facing = ['up', 'down', 'left', 'right'].includes(savedPlayer.facing) ? savedPlayer.facing : 'down'
    player.currentSprite = player.sprites[`walk${player.facing[0].toUpperCase()}${player.facing.slice(1)}`]
    player.currentSprite.frameCount = PLAYER_WALK_FRAMES.length
    player.currentFrame = Math.max(0, Math.min(PLAYER_WALK_FRAMES.length - 1, Number(savedPlayer.currentFrame) || 0))
    player.elapsedTime = 0
    player.center = { x: player.x + player.width / 2, y: player.y + player.height / 2 }
    camera.x = Number.isFinite(savedCamera.x) ? Math.max(0, Math.min(MAX_CAMERA_X, savedCamera.x)) : Math.min(MAX_CAMERA_X, Math.max(0, player.center.x - VIEWPORT_WIDTH / 2))
    camera.y = Number.isFinite(savedCamera.y) ? Math.max(0, Math.min(MAX_CAMERA_Y, savedCamera.y)) : Math.min(MAX_CAMERA_Y, Math.max(0, player.center.y - VIEWPORT_HEIGHT / 2))
    battleSystem.distanceTravelled = Math.max(0, Number(savedEncounter.distanceTravelled) || 0)
    battleSystem.nextEncounterDistance = Math.max(1, Number(savedEncounter.nextEncounterDistance) || battleSystem.rollEncounterDistance())
  },
})

// Creates random-encounter combat and connects it to travel, the character, defeat recovery, and map return.
const battleSystem = new BattleSystem({
  getCharacter: () => gameUI.getCharacter(),
  onStart: () => {
    Object.values(keys).forEach((key) => {
      key.pressed = false
    })
    player.velocity.x = 0
    player.velocity.y = 0
  },
  onEnd: () => {
    lastTime = performance.now()
  },
  onDefeatResolution: (resolution) => {
    if (resolution === 'death') {
      gameUI.restartCharacterBuilder()
      return
    }
    resetPlayerToSpawn()
    gameUI.recoverFromKnockout()
  },
})

// Stores the tree root tiles values used by the rest of this file.
const TREE_ROOT_TILES = new Set([200, 203, 207, 211])
// Stores the max leaves values used by the rest of this file.
const MAX_LEAVES = 250
// Holds every falling leaf particle currently visible on the map.
const leafs = []

// Records the visible tree positions that are allowed to release falling leaves.
const treeEmitters = []
l_New_Layer_2.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if (TREE_ROOT_TILES.has(symbol)) {
      treeEmitters.push({
        x: x * TILE_SIZE + TILE_SIZE,
        y: y * TILE_SIZE - TILE_SIZE * 3,
        timeUntilNextLeaf: Math.random() * 1.5,
      })
    }
  })
})

// Creates leaf particles around visible tree canopies without exceeding the performance limit.
const spawnLeavesAroundVisibleTrees = (deltaTime) => {
  const padding = TILE_SIZE * 5

  treeEmitters.forEach((emitter) => {
    const isNearViewport =
      emitter.x >= camera.x - padding &&
      emitter.x <= camera.x + VIEWPORT_WIDTH + padding &&
      emitter.y >= camera.y - padding &&
      emitter.y <= camera.y + VIEWPORT_HEIGHT + padding

    if (!isNearViewport) return

    emitter.timeUntilNextLeaf -= deltaTime
    if (emitter.timeUntilNextLeaf > 0 || leafs.length >= MAX_LEAVES) return

    leafs.push(
      new Sprite({
        x: emitter.x + (Math.random() - 0.5) * TILE_SIZE * 3,
        y: emitter.y + (Math.random() - 0.5) * TILE_SIZE * 2,
        velocity: {
          x: (Math.random() - 0.35) * 10,
          y: 7 + Math.random() * 9,
        },
        lifetime: 5 + Math.random() * 4,
      })
    )

    emitter.timeUntilNextLeaf = 0.8 + Math.random() * 1.8
  })
}

// Runs one animation frame: movement, encounters, camera position, map drawing, leaves, and the player sprite.
function animate(backgroundCanvas, foregroundCanvas) {
  // Calculate delta time
  const currentTime = performance.now()
  const deltaTime = Math.min((currentTime - lastTime) / 1000, 1 / 30)
  lastTime = currentTime

  // Moves the player and records travel only while the map is active and no battle is open.
  if (!battleSystem.isActive && gameUI.isMapActive()) {
    const previousX = player.x
    const previousY = player.y

    player.handleInput(keys)
    player.update(deltaTime, collisionBlocks)

    const travelDistance = Math.hypot(
      player.x - previousX,
      player.y - previousY
    )
    battleSystem.recordTravel(travelDistance)
    window.worldCrafting?.update(travelDistance)
  }

  camera.x = Math.min(
    Math.max(0, player.center.x - VIEWPORT_WIDTH / 2),
    MAX_CAMERA_X
  )
  camera.y = Math.min(
    Math.max(0, player.center.y - VIEWPORT_HEIGHT / 2),
    MAX_CAMERA_Y
  )
  // Creates leaf particles around visible tree canopies without exceeding the performance limit.
  spawnLeavesAroundVisibleTrees(deltaTime)

  window.worldCrafting?.update()

  // Render scene
  c.clearRect(0, 0, canvas.width, canvas.height)
  c.save()
  c.scale(SCENE_SCALE, SCENE_SCALE)
  c.translate(-camera.x, -camera.y)
  c.drawImage(backgroundCanvas, 0, 0, MAP_WIDTH, MAP_HEIGHT)
  window.worldCrafting?.draw(c)
  player.draw(c)
  c.drawImage(foregroundCanvas, 0, 0, MAP_WIDTH, MAP_HEIGHT)

  // Updates every falling leaf and removes leaves that have completed their animation.
  for (let i = leafs.length - 1; i >= 0; i--) {
    const leaf = leafs[i]
    leaf.update(deltaTime)
    leaf.draw(c)

    if (leaf.alpha <= 0) {
      leafs.splice(i, 1)
    }
  }

  c.restore()

  // Requests the next browser animation frame so the game loop continues smoothly.
  requestAnimationFrame(() => animate(backgroundCanvas, foregroundCanvas))
}

// Starts rendering and prepares its initial state.
const startRendering = async () => {
  try {
    const [backgroundCanvas, foregroundCanvas] = await Promise.all([
      renderStaticLayers(layersData),
      renderStaticLayers(foregroundLayersData, foregroundLayerFilters),
    ])
    if (!backgroundCanvas || !foregroundCanvas) {
      console.error('Failed to create the map canvases')
      return
    }

    animate(backgroundCanvas, foregroundCanvas)
  } catch (error) {
    console.error('Error during rendering:', error)
  }
}

startRendering()


