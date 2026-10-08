/**
 * Loads a sprite sheet, selects animation frames, and draws the correctly cropped frame on the canvas.
 */

class Sprite {
  // Initializes the instance state and connects the dependencies used by later methods.
  constructor({
    x,
    y,
    imageSrc = './images/leaf.png',
    velocity,
    lifetime = 7,
  }) {
    this.x = x
    this.y = y
    this.width = 8
    this.height = 5
    this.center = {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
    }

    this.loaded = false
    this.image = new Image()
    this.image.onload = () => {
      this.loaded = true
    }
    this.image.src = imageSrc
    this.currentFrame = 0

    this.currentSprite = {
      x: 0,
      y: 0,
      width: 12,
      height: 7,
      frameCount: 6,
    }
    this.elapsedTime = 0
    this.velocity = velocity
    this.lifetime = lifetime
    this.alpha = 1
    this.totalElapsedTime = 0
  }

  // Draws this object on the game canvas at its current position.
  draw(c) {
    if (!this.loaded) return

    c.save()
    c.globalAlpha = this.alpha
    c.drawImage(
      this.image,
      this.currentSprite.x + this.currentSprite.width * this.currentFrame,
      this.currentSprite.y,
      this.currentSprite.width,
      this.currentSprite.height,
      this.x,
      this.y,
      this.width,
      this.height
    )
    c.restore()
  }

  // Updates this object for the current animation frame.
  update(deltaTime) {
    if (!deltaTime) return

    this.elapsedTime += deltaTime
    this.totalElapsedTime += deltaTime
    const intervalToGoToNextFrame = 0.15

    if (this.elapsedTime > intervalToGoToNextFrame) {
      this.currentFrame =
        (this.currentFrame + 1) % this.currentSprite.frameCount
      this.elapsedTime -= intervalToGoToNextFrame
    }

    const breeze = Math.sin(this.totalElapsedTime * 3) * 4
    this.x += (this.velocity.x + breeze) * deltaTime
    this.y += this.velocity.y * deltaTime

    const fadeDuration = 1.5
    const remainingLife = this.lifetime - this.totalElapsedTime
    this.alpha = Math.max(0, Math.min(1, remainingLife / fadeDuration))
  }
}


