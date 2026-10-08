/**
 * Draws and animates the chosen walking sprite while moving the player against the map's collision boundaries.
 */

const X_VELOCITY = 150
// Stores the y velocity values used by the rest of this file.
const Y_VELOCITY = 150
// Stores the player frame width values used by the rest of this file.
const PLAYER_FRAME_WIDTH = 80
// Stores the player frame height values used by the rest of this file.
const PLAYER_FRAME_HEIGHT = 80
// Stores the player render scale values used by the rest of this file.
const PLAYER_RENDER_SCALE = 0.5
// Stores the player walk frames values used by the rest of this file.
const PLAYER_WALK_FRAMES = [0, 1, 2, 3, 4, 5]

// Tracks the player's sprite, movement, animation, facing direction, and map collisions.
class Player {
  // Initializes the instance state and connects the dependencies used by later methods.
  constructor({ x, y, size, velocity = { x: 0, y: 0 } }) {
    this.x = x
    this.y = y
    this.width = size
    this.height = size
    this.renderWidth = PLAYER_FRAME_WIDTH * PLAYER_RENDER_SCALE
    this.velocity = velocity
    this.center = {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
    }

    this.loaded = false
    this.image = new Image()
    this.image.onload = () => {
      this.loaded = true
    }
    this.spriteId = DEFAULT_CHARACTER_SPRITE_ID
    this.image.src = getCharacterSprite(this.spriteId).walking

    this.currentFrame = 0
    this.elapsedTime = 0
    this.sprites = {
      walkDown: {
        x: 0,
        width: PLAYER_FRAME_WIDTH,
        height: PLAYER_FRAME_HEIGHT,
        frameCount: PLAYER_WALK_FRAMES.length,
      },
      walkUp: {
        x: PLAYER_FRAME_WIDTH,
        width: PLAYER_FRAME_WIDTH,
        height: PLAYER_FRAME_HEIGHT,
        frameCount: PLAYER_WALK_FRAMES.length,
      },
      walkLeft: {
        x: PLAYER_FRAME_WIDTH * 2,
        width: PLAYER_FRAME_WIDTH,
        height: PLAYER_FRAME_HEIGHT,
        frameCount: PLAYER_WALK_FRAMES.length,
      },
      walkRight: {
        x: PLAYER_FRAME_WIDTH * 3,
        width: PLAYER_FRAME_WIDTH,
        height: PLAYER_FRAME_HEIGHT,
        frameCount: PLAYER_WALK_FRAMES.length,
      },
    }

    this.currentSprite = this.sprites.walkDown
    this.facing = 'down'
  }

  // Draws this object on the game canvas at its current position.
  draw(c) {
    if (!this.loaded) return
    const renderHeight = this.currentSprite.height * PLAYER_RENDER_SCALE

    // Red square debug code
    // c.fillStyle = 'rgba(0, 0, 255, 0.5)'
    // c.fillRect(this.x, this.y, this.width, this.height)

    c.drawImage(
      this.image,
      this.currentSprite.x,
      this.currentFrame * this.currentSprite.height,
      this.currentSprite.width,
      this.currentSprite.height,
      this.x - (this.renderWidth - this.width) / 2,
      this.y + this.height - renderHeight,
      this.renderWidth,
      renderHeight
    )
  }

  // Sets character sprite to the supplied value.
  setCharacterSprite(spriteId) {
    const sprite = getCharacterSprite(spriteId)
    if (!sprite || sprite.id === this.spriteId) return
    this.spriteId = sprite.id
    this.loaded = false
    this.currentFrame = 0
    this.elapsedTime = 0
    this.image.src = sprite.walking
  }

  // Updates this object for the current animation frame.
  update(deltaTime, collisionBlocks) {
    if (!deltaTime) return

    this.elapsedTime += deltaTime

    const intervalToGoToNextFrame = 0.12

    if (this.elapsedTime > intervalToGoToNextFrame) {
      this.currentFrame =
        (this.currentFrame + 1) % this.currentSprite.frameCount
      this.elapsedTime -= intervalToGoToNextFrame
    }

    // Update horizontal position and check collisions
    this.updateHorizontalPosition(deltaTime)
    this.checkForHorizontalCollisions(collisionBlocks)

    // Update vertical position and check collisions
    this.updateVerticalPosition(deltaTime)
    this.checkForVerticalCollisions(collisionBlocks)

    this.center = {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
    }

  }

  // Updates horizontal position to match the current frame or game state.
  updateHorizontalPosition(deltaTime) {
    this.x += this.velocity.x * deltaTime
  }

  // Updates vertical position to match the current frame or game state.
  updateVerticalPosition(deltaTime) {
    this.y += this.velocity.y * deltaTime
  }

  // Responds to input and updates the related game state.
  handleInput(keys) {
    this.velocity.x = 0
    this.velocity.y = 0

    if (keys.d.pressed || keys.d.touchPressed) {
      this.velocity.x = X_VELOCITY

      this.currentSprite = this.sprites.walkRight
      this.currentSprite.frameCount = PLAYER_WALK_FRAMES.length
      this.facing = 'right'
    } else if (keys.a.pressed || keys.a.touchPressed) {
      this.velocity.x = -X_VELOCITY

      this.currentSprite = this.sprites.walkLeft
      this.currentSprite.frameCount = PLAYER_WALK_FRAMES.length
      this.facing = 'left'
    } else if (keys.w.pressed || keys.w.touchPressed) {
      this.velocity.y = -Y_VELOCITY

      this.currentSprite = this.sprites.walkUp
      this.currentSprite.frameCount = PLAYER_WALK_FRAMES.length
      this.facing = 'up'
    } else if (keys.s.pressed || keys.s.touchPressed) {
      this.velocity.y = Y_VELOCITY

      this.currentSprite = this.sprites.walkDown
      this.currentSprite.frameCount = PLAYER_WALK_FRAMES.length
      this.facing = 'down'
    } else {
      this.currentSprite.frameCount = 1
      this.currentFrame = 0
      this.elapsedTime = 0
    }
  }

  // Checks for horizontal collisions and stops movement when a collision is found.
  checkForHorizontalCollisions(collisionBlocks) {
    const buffer = 0.0001
    for (let i = 0; i < collisionBlocks.length; i++) {
      const collisionBlock = collisionBlocks[i]

      // Check if a collision exists on all axes
      if (
        this.x < collisionBlock.x + collisionBlock.width &&
        this.x + this.width > collisionBlock.x &&
        this.y + this.height > collisionBlock.y &&
        this.y < collisionBlock.y + collisionBlock.height
      ) {
        // Check collision while player is going left
        if (this.velocity.x < 0) {
          this.x = collisionBlock.x + collisionBlock.width + buffer
          break
        }

        // Check collision while player is going right
        if (this.velocity.x > 0) {
          this.x = collisionBlock.x - this.width - buffer

          break
        }
      }
    }
  }

  // Checks for vertical collisions and stops movement when a collision is found.
  checkForVerticalCollisions(collisionBlocks) {
    const buffer = 0.0001
    for (let i = 0; i < collisionBlocks.length; i++) {
      const collisionBlock = collisionBlocks[i]

      // If a collision exists
      if (
        this.x < collisionBlock.x + collisionBlock.width &&
        this.x + this.width > collisionBlock.x &&
        this.y + this.height > collisionBlock.y &&
        this.y < collisionBlock.y + collisionBlock.height
      ) {
        // Check collision while player is going up
        if (this.velocity.y < 0) {
          this.velocity.y = 0
          this.y = collisionBlock.y + collisionBlock.height + buffer
          break
        }

        // Check collision while player is going down
        if (this.velocity.y > 0) {
          this.velocity.y = 0
          this.y = collisionBlock.y - this.height - buffer
          break
        }
      }
    }
  }
}


