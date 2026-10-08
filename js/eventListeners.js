/**
 * Converts keyboard presses into map movement and menu shortcuts while preventing stuck keys after focus changes.
 */

window.addEventListener('keydown', (event) => {
  // Ignores map movement keys while a battle encounter is active.
  if (battleSystem.isActive) return
  if (gameUI.mode === 'world') { if (event.key === 'Escape') window.worldCrafting?.closeDialog(); return }
  if (gameUI.isMapActive() && event.key.toLowerCase() === 'e') { event.preventDefault(); if (!event.repeat) window.worldCrafting?.interact(); return }
  // Lets menus consume their own keyboard shortcuts before map movement is processed.
  if (gameUI.handleKeyDown(event)) return

  // Marks the matching WASD direction as pressed when the player holds that key.
  switch (event.key.toLowerCase()) {
    case 'w':
      keys.w.pressed = true
      break
    case 'a':
      keys.a.pressed = true
      break
    case 's':
      keys.s.pressed = true
      break
    case 'd':
      keys.d.pressed = true
      break
  }
})

window.addEventListener('keyup', (event) => {
  // Marks the matching WASD direction as released when the player lets go of that key.
  switch (event.key.toLowerCase()) {
    case 'w':
      keys.w.pressed = false
      break
    case 'a':
      keys.a.pressed = false
      break
    case 's':
      keys.s.pressed = false
      break
    case 'd':
      keys.d.pressed = false
      break
  }
})

// On return to game's tab, ensure delta time is reset
document.addEventListener('visibilitychange', () => {
  // Resets the animation clock when the browser tab becomes visible, preventing a large movement jump.
  if (!document.hidden) {
    lastTime = performance.now()
  }
  else Object.values(keys).forEach(key => { key.pressed = false })
})

window.addEventListener('blur', () => Object.values(keys).forEach(key => { key.pressed = false }))


