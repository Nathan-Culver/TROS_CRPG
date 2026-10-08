/**
 * Represents one rectangular map obstacle and can draw it as a translucent box while collision debugging is enabled.
 */

class CollisionBlock {
  // Initializes the instance state and connects the dependencies used by later methods.
  constructor({ x, y, size }) {
    this.x = x
    this.y = y
    this.width = size
    this.height = size
  }

  // Draws this object on the game canvas at its current position.
  draw(c) {
    // Optional: Draw collision blocks for debugging
    c.fillStyle = 'rgba(255, 0, 0, 0.5)'
    c.fillRect(this.x, this.y, this.width, this.height)
  }
}

