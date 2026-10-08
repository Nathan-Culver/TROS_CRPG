/* Native pointer controls share player input and world interactions with WASD/E/C. */
(() => {
  const controls = document.querySelector('#touch-controls')
  const pointers = new Map()
  const directions = [...controls.querySelectorAll('[data-direction]')]
  const selectButton=document.getElementById('touch-select')
  const startButton=document.getElementById('touch-start')
  const interactButton=document.getElementById('touch-interact')
  const backButton=document.getElementById('touch-character')
  const stopMovement=()=>{release();Object.values(keys).forEach(key=>key.pressed=false);player.velocity.x=0;player.velocity.y=0;}
  const fullscreenButton = document.getElementById('mobile-fullscreen')
  const fullscreenStatus = document.getElementById('fullscreen-status')
  const standalone = () => matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches || navigator.standalone === true
  const isFullscreen = () => !!(document.fullscreenElement || document.webkitFullscreenElement)
  let fullscreenMessageTimer
  const fullscreenHint = () => {
    fullscreenStatus.textContent = 'For a full-screen app in this browser, choose Share or the browser menu → Add to Home Screen, then open the game from its icon.'
    fullscreenStatus.hidden = false
    clearTimeout(fullscreenMessageTimer)
    fullscreenMessageTimer = setTimeout(() => { fullscreenStatus.hidden = true }, 8000)
  }
  const enterFullscreen = async () => {
    if (!touchViewport.matches || isFullscreen() || standalone()) return
    const request = document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen
    if (!request) { fullscreenHint(); return }
    try { await request.call(document.documentElement,{navigationUI:'hide'}); fullscreenStatus.hidden = true }
    catch { fullscreenHint() }
  }
  const syncDirections = () => {
    for (const [key, state] of Object.entries(keys)) {
      state.touchPressed = [...pointers.values()].includes(key)
      controls.querySelector(`[data-direction="${key}"]`)?.classList.toggle('held', state.touchPressed)
    }
  }
  const release = () => { pointers.clear(); syncDirections() }
  const sync = () => {
    fullscreenButton.hidden = !touchViewport.matches || standalone() && !isFullscreen()
    fullscreenButton.setAttribute('aria-label', isFullscreen() ? 'Exit fullscreen' : 'Enter fullscreen')
    fullscreenButton.title = isFullscreen() ? 'Exit fullscreen' : 'Enter fullscreen'
    fullscreenButton.setAttribute('aria-pressed', String(isFullscreen()))
    const playing=!!gameUI.character&&!['start','builder'].includes(gameUI.mode)
    const onMap=playing&&gameUI.isMapActive()&&!battleSystem.isActive
    const battleInventory=battleSystem.isActive&&!battleSystem.inventoryPopup.hidden
    controls.hidden=!touchViewport.matches||!playing||battleSystem.isActive&&!battleInventory
    controls.querySelector('.touch-dpad').hidden=!onMap
    controls.querySelector('.touch-system').hidden=battleSystem.isActive
    interactButton.hidden=!onMap
    backButton.disabled=onMap&&!window.Camping?.placement
    document.body.classList.toggle('touch-playing',touchViewport.matches&&playing&&!battleSystem.isActive)
    const saves=gameUI.mode==='menu'&&['browserSaves','exportSaves'].includes(gameUI.activeSheetTab)
    document.body.classList.toggle('touch-save-screen',touchViewport.matches&&saves)
    selectButton.setAttribute('aria-pressed',String(gameUI.mode==='menu'&&!saves))
    startButton.setAttribute('aria-pressed',String(saves))
    if (!onMap) release()
    document.querySelector('.map-hint').hidden = touchViewport.matches || !gameUI.isMapActive() || battleSystem.isActive
  }
  directions.forEach(button => {
    button.addEventListener('pointerdown', event => {
      if (!gameUI.isMapActive() || battleSystem.isActive || event.button !== 0) return
      event.preventDefault()
      button.setPointerCapture(event.pointerId)
      pointers.set(event.pointerId, button.dataset.direction)
      syncDirections()
    })
    button.addEventListener('pointermove', event => {
      if (!pointers.has(event.pointerId)) return
      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-direction]')
      pointers.set(event.pointerId, target && controls.contains(target) ? target.dataset.direction : null)
      syncDirections()
    })
    for (const type of ['pointerup','pointercancel','lostpointercapture']) button.addEventListener(type, event => {
      pointers.delete(event.pointerId)
      syncDirections()
    })
    button.addEventListener('contextmenu', event => event.preventDefault())
  })
  let pointerActivation = null
  document.addEventListener('click', event => {
    // Changing screens on release must not click the new screen underneath.
    if (pointerActivation && event.detail > 0 && performance.now()-pointerActivation.time < 500 && Math.hypot(event.clientX-pointerActivation.x,event.clientY-pointerActivation.y) < 24) {
      pointerActivation = null
      event.preventDefault()
      event.stopImmediatePropagation()
    }
  }, true)
  const bindAction = (id, action) => {
    const button = document.getElementById(id)
    button.addEventListener('pointerdown', event => { if (event.button === 0) event.preventDefault() })
    // Pointer release responds immediately even after a direction-pad drag.
    button.addEventListener('pointerup', event => {
      if (event.button !== 0) return
      const rect = button.getBoundingClientRect()
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) return
      pointerActivation = {x:event.clientX,y:event.clientY,time:performance.now()}
      action()
    })
    // Keyboard and assistive activation still use the native click path.
    button.addEventListener('click', event => { if (event.detail === 0) action() })
  }
  bindAction('begin-game', () => { if (gameUI.mode === 'start') { enterFullscreen(); gameUI.showBuilder(!touchViewport.matches) } sync() })
  bindAction('mobile-fullscreen', async () => {
    release()
    if (isFullscreen()) {
      const exit = document.exitFullscreen || document.webkitExitFullscreen
      try { await exit?.call(document) } catch { /* Browser retains its exit gesture. */ }
    } else await enterFullscreen()
    sync()
  })
  bindAction('close-character-menu', () => { if (gameUI.mode === 'menu') gameUI.closeCharacterMenu(); sync() })
  bindAction('touch-interact', () => {
    release()
    if (gameUI.isMapActive() && !battleSystem.isActive) worldCrafting.interact()
    sync()
  })
  bindAction('touch-character', () => {
    stopMovement()
    if(window.Camping?.placement){Camping.cancel();sync();return}
    if(battleSystem.isActive&&!battleSystem.inventoryPopup.hidden)battleSystem.closeBattleInventory()
    else if(gameUI.mode==='world')worldCrafting.closeDialog()
    else if(gameUI.mode==='menu')gameUI.closeCharacterMenu()
    sync()
  })
  const openPausedScreen=(tab)=>{
    if(!gameUI.character||battleSystem.isActive||['start','builder'].includes(gameUI.mode))return
    stopMovement()
    if(gameUI.mode==='menu'&&(tab==='character'?!['browserSaves','exportSaves'].includes(gameUI.activeSheetTab):['browserSaves','exportSaves'].includes(gameUI.activeSheetTab)))gameUI.closeCharacterMenu()
    else {
      if(gameUI.mode==='world')worldCrafting.closeDialog()
      gameUI.activeSheetTab=tab
      gameUI.openCharacterMenu()
    }
    sync()
  }
  bindAction('touch-select',()=>openPausedScreen('character'))
  bindAction('touch-start',()=>openPausedScreen('browserSaves'))
  window.addEventListener('blur', release)
  window.addEventListener('resize', release)
  document.addEventListener('visibilitychange', () => { if (document.hidden) release() })
  touchViewport.addEventListener('change', sync)
  for (const event of ['fullscreenchange','webkitfullscreenchange']) document.addEventListener(event, () => { release(); resizeMapViewport(); sync() })
  const observer = new MutationObserver(sync)
  for (const id of ['start-screen','character-builder','character-menu','battle-screen','battle-inventory-popup']) observer.observe(document.getElementById(id), {attributes:true,attributeFilter:['hidden','aria-hidden']})
  observer.observe(document.body, {childList:true})
  if(window.Camping)observer.observe(Camping.placementBar,{attributes:true,attributeFilter:['hidden']})
  observer.observe(gameUI.sheetTabs,{subtree:true,childList:true,attributes:true,attributeFilter:['aria-selected']})
  sync()
})()
