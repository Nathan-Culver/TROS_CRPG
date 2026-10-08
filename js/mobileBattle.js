/* Reuse the actual combat controls; compact tabs only change their layout. */
(() => {
  const screen=document.getElementById('battle-screen'), hud=screen.querySelector('.battle-hud'), controls=screen.querySelector('.battle-controls');
  const compact=matchMedia('(max-width:760px), (any-pointer:coarse), (max-height:560px)');
  const tabs=document.createElement('nav');tabs.className='mobile-battle-tabs';tabs.setAttribute('aria-label','Combat panels');tabs.setAttribute('role','tablist');
  const tactics=document.createElement('section');tactics.className='battle-panel mobile-battle-tactics';
  const dock=document.createElement('div');dock.className='mobile-battle-dock';
  const summary=document.createElement('p');summary.className='mobile-battle-summary';
  const actions=controls.querySelector('.battle-actions');
  const moves=[...['battle-stance','battle-weapon','battle-target'].map(id=>document.getElementById(id).closest('label')),controls.querySelector('.battle-preempt'),controls.querySelector('.battle-rules-note'),actions].map(node=>{const marker=document.createComment('desktop combat placement');node.before(marker);return {node,marker};});
  screen.insertBefore(summary,hud);screen.insertBefore(tabs,hud);hud.append(tactics);screen.append(dock);
  const panels=[['actions','Actions',controls],['tactics','Tactics',tactics],['status','Status',screen.querySelector('.battle-statuses')],['log','Log',screen.querySelector('.battle-log-panel')]];
  let selected='actions';
  const originalParty=BattleSystem.prototype.renderEnemyParty;
  BattleSystem.prototype.renderEnemyParty=function(...args){const result=originalParty.apply(this,args);this.enemies.forEach((enemy,index)=>enemy.actor.style.setProperty('--mobile-enemy-x',`${this.enemies.length===1?78:50+34*index/(this.enemies.length-1)}%`));return result;};
  const select=id=>{selected=id;for(const [key,,panel] of panels){panel.classList.toggle('mobile-panel-active',key===id);const button=tabs.querySelector(`[data-panel="${key}"]`);button.setAttribute('aria-selected',String(key===id));button.tabIndex=key===id?0:-1;}hud.scrollTop=0;};
  for(const [id,label,panel] of panels){panel.id ||= `battle-panel-${id}`;const button=document.createElement('button');button.type='button';button.textContent=label;button.dataset.panel=id;button.id=`battle-tab-${id}`;button.setAttribute('role','tab');button.setAttribute('aria-controls',panel.id);button.addEventListener('click',()=>select(id));tabs.append(button);}
  tabs.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const index=panels.findIndex(([id])=>id===selected);select(panels[event.key==='Home'?0:event.key==='End'?3:(index+(event.key==='ArrowRight'?1:3))%4][0]);tabs.querySelector('[aria-selected="true"]').focus();});
  const layout=()=>{
    screen.classList.toggle('compact-battle',compact.matches);
    if(compact.matches){moves.forEach(({node})=>(node===actions?dock:tactics).append(node));for(const [id,,panel] of panels){panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',`battle-tab-${id}`);}}
    else{moves.forEach(({node,marker})=>marker.after(node));for(const [,,panel] of panels){panel.removeAttribute('role');panel.removeAttribute('aria-labelledby');}}
    select(selected);
  };
  const updateSummary=()=>{summary.textContent=`${document.getElementById('battle-player-name').textContent} · CP ${document.getElementById('battle-player-pool').textContent} · ${document.getElementById('battle-enemy-count').textContent}`;};
  new MutationObserver(updateSummary).observe(screen.querySelector('.battle-statuses'),{subtree:true,childList:true,characterData:true});
  new MutationObserver(()=>{if(!screen.hidden){select('actions');updateSummary();}}).observe(screen,{attributes:true,attributeFilter:['hidden']});
  compact.addEventListener('change',layout);layout();updateSummary();
})();
