/* Physical campsite objects and local storage persist inside each character's world state. */
const Camping={
 placement:null,
 init(c=gameUI.character){
  if(!c)return null;const state=worldCrafting.state(c);
  if(!state.camps){const camp=worldCrafting.camp,fire=worldCrafting.fire;state.camps={serial:0,deployed:[{...camp,portable:true,itemId:'gear-tent'},{...fire,portable:true,itemId:'gear-fire-pit'}]};
   const chest=this.findSpot('storage',camp.x+24,camp.y+16,state.camps.deployed.map(o=>this.footprint(o.kind,o.x,o.y)));if(chest)state.camps.deployed.push({id:'camp-storage',kind:'storage',name:'Camp storage box',...chest,portable:true,itemId:'gear-storage-box',contents:[]});
  }
  state.camps.deployed.forEach(o=>{if(o.kind==='storage')o.contents||=[];});return state.camps;
 },
 footprint(kind,x,y){return kind==='camp'?{x:x-10,y:y-7,width:20,height:12}:kind==='storage'?{x:x-11,y:y-7,width:22,height:12}:{x:x-11,y:y-8,width:22,height:12};},
 overlap(a,b){return a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;},
 free(kind,x,y,extra=[]){
  if(this.reachableTiles&&!this.reachableTiles.has(`${Math.floor(x/16)},${Math.floor(y/16)}`))return false;
  const rect=this.footprint(kind,x,y),blocks=collisionBlocks.concat(worldCrafting.objects.filter(o=>!['camp','campfire'].includes(o.id)).map(o=>worldCrafting.objectBounds(o)).filter(Boolean),extra);
  if(rect.x<16||rect.y<16||rect.x+rect.width>MAP_WIDTH-16||rect.y+rect.height>MAP_HEIGHT-16)return false;
  if(blocks.some(b=>this.overlap({...rect,x:rect.x-3,y:rect.y-3,width:rect.width+6,height:rect.height+6},b)))return false;
  return [[-24,0],[24,0],[0,-24],[0,24]].some(([dx,dy])=>!blocks.concat(rect).some(b=>this.overlap({x:x+dx-7.5,y:y+dy-7.5,width:15,height:15},b)));
 },
 findSpot(kind,x,y,extra=[]){for(let radius=0;radius<=64;radius+=16)for(const[dx,dy]of[[radius,0],[-radius,0],[0,radius],[0,-radius]]){const tx=Math.floor((x+dx)/16)*16+8,ty=Math.floor((y+dy)/16)*16+8;if(this.free(kind,tx,ty,extra))return{x:tx,y:ty,tileX:Math.floor(tx/16),tileY:Math.floor(ty/16)};}return null;},
 objects(c=gameUI.character){return this.init(c)?.deployed||[];},
 near(kind){return this.objects().filter(o=>!kind||o.kind===kind).filter(o=>worldCrafting.distance(o)<=worldCrafting.range).sort((a,b)=>worldCrafting.distance(a)-worldCrafting.distance(b))[0];},
 refresh(text){Crafting.init(gameUI.character);gameUI.refreshInventoryState(gameUI.character);gameUI.recalculateEquippedPools(gameUI.character);gameUI.persistCharacter();if(text)worldCrafting.message(text);},
 requireNearby(box){Crafting.ready(gameUI.character);if(battleSystem.isActive||!this.objects().includes(box)||worldCrafting.distance(box)>worldCrafting.range)throw new Error('Walk beside this campsite object to use it.');},
 buy(id){const info=CAMP_ITEMS[id],c=gameUI.character;InventoryLoad.check(c,[...c.inventoryItems,{id,name:info.name,quantity:1}]);worldCrafting.pay(info.price);Crafting.add(c,id,info.name);return `${info.name} purchased. Choose Deploy in Inventory, then place it on the map.`;},
 target(){const facing=player.facing,dx=facing==='left'?-40:facing==='right'?40:0,dy=facing==='up'?-40:facing==='down'?40:0;return{x:Math.floor((player.center.x+dx)/16)*16+8,y:Math.floor((player.center.y+dy)/16)*16+8};},
 begin(id){if(!CAMP_ITEMS[id]||!Crafting.count(gameUI.character,id))throw new Error('Carry the campsite item before deploying it.');Crafting.ready(gameUI.character);if(battleSystem.isActive)throw new Error('Deploy campsites outside combat.');this.placement={id};if(gameUI.mode==='menu')gameUI.closeCharacterMenu();this.placementBar.hidden=false;this.updateHint();},
 cancel(){this.placement=null;this.placementBar.hidden=true;worldCrafting.message('Placement cancelled; the item is still in your inventory.');},
 updateHint(){if(!this.placement)return;const info=CAMP_ITEMS[this.placement.id],target=this.target(),extra=this.objects().map(o=>this.footprint(o.kind,o.x,o.y));this.placementText.textContent=`Place ${info.name} in front of you · ${this.free(info.kind,target.x,target.y,extra)?'clear ground':'blocked — move or turn'} · A / E to place, B / Escape to cancel`;},
 deploy(){
  if(!this.placement)return;const c=gameUI.character,id=this.placement.id,info=CAMP_ITEMS[id],target=this.target(),extra=this.objects().map(o=>this.footprint(o.kind,o.x,o.y));
  Crafting.ready(c);if(!gameUI.isMapActive()||battleSystem.isActive)throw new Error('Return to the world before placing campsite gear.');if(!this.free(info.kind,target.x,target.y,extra))throw new Error('This spot is blocked. Move or turn toward clear ground.');
  const state=this.init(c),record=c.inventoryItems.find(r=>r.id===id&&r.quantity>0);if(!record)throw new Error('That campsite item is no longer carried.');
  Crafting.consume(c,{[id]:1});const object={id:`deployed-camp-${++state.serial}`,kind:info.kind,name:info.kind==='camp'?'Your tent':info.name,...target,tileX:Math.floor(target.x/16),tileY:Math.floor(target.y/16),portable:true,itemId:id,...(info.kind==='storage'?{contents:[]}: {})};state.deployed.push(object);this.placement=null;this.placementBar.hidden=true;this.refresh(`${object.name} deployed. Walk beside it to interact.`);
 },
 pack(objects){const c=gameUI.character;objects.forEach(o=>this.requireNearby(o));if(objects.some(o=>o.contents?.length))throw new Error('Empty the storage box before packing it.');const items=objects.map(o=>({id:o.itemId,name:CAMP_ITEMS[o.itemId].name,quantity:1,equipped:false}));InventoryLoad.check(c,[...c.inventoryItems,...items]);objects.forEach(o=>{const state=this.init(c);state.deployed=state.deployed.filter(x=>x!==o);Crafting.add(c,o.itemId,CAMP_ITEMS[o.itemId].name);});this.refresh('Campsite gear packed into Inventory.');worldCrafting.closeDialog();},
 openCamp(o){
  this.requireNearby(o);const c=gameUI.character,{button,finish}=worldCrafting.showDialog('Your Campsite','Rest, use portable alchemy tools, or pack your tent. Storage is in the nearby physical box.');
  button('Rest at camp',()=>{const dice=Array.from({length:c.attributes.endurance},()=>Math.floor(Math.random()*10)+1),successes=dice.filter(d=>d>=6).length;c.conditions.fatigue=Math.max(0,c.conditions.fatigue-successes);return `Rest [${dice}]: recovered ${successes} Fatigue.`;});
  button('Set out alchemy tools',()=>{if(!Crafting.count(c,'tool-alchemy'))throw new Error('Buy alchemy tools from the smith first.');worldCrafting.closeDialog();worldCrafting.openCraft('alchemy');});
  const home=Math.hypot(o.x-worldCrafting.camp.x,o.y-worldCrafting.camp.y)<=worldCrafting.range;if(home)for(const[station,[name]]of Object.entries(CRAFT_STATIONS)){const cost=worldCrafting.buildCost(station);button(worldCrafting.state(c).built.includes(station)?`${name} · built`:`Build ${name} · ${Object.entries(cost).map(([id,n])=>`${n} ${id.replace('raw-','')}`).join(' + ')}`,()=>worldCrafting.build(station),worldCrafting.state(c).built.includes(station));}
  button('Pack tent',()=>this.pack([o]));finish();
 },
 openFire(o){this.requireNearby(o);const{button,finish}=worldCrafting.showDialog('Fire Pit','Burn carried wood into charcoal, or pack the fire pit for travel.');button('Burn wood into charcoal',()=>{worldCrafting.actionNode=o;try{return Crafting.gather(gameUI.character,'charcoal');}finally{worldCrafting.actionNode=null;}});button('Pack fire pit',()=>this.pack([o]));finish();},
 transfer(box,direction,id,quantity){
  this.requireNearby(box);const c=gameUI.character,source=direction==='store'?c.inventoryItems:box.contents,dest=direction==='store'?box.contents:c.inventoryItems,record=source.find(r=>r.id===id);
  if(!record||!Number.isInteger(quantity)||quantity<1||quantity>record.quantity)throw new Error('Choose an available item and valid quantity.');
  const copy={...JSON.parse(JSON.stringify(record)),quantity,equipped:false};
  if(direction==='take')InventoryLoad.check(c,[...dest,copy]);else if(InventoryLoad.total([...dest,copy])>200)throw new Error('This storage box holds up to 200 lb.');
  if(direction==='store'&&record.equipped)gameUI.unequipItem(c,record,EQUIPMENT_BY_ID[record.id]);
  const existing=dest.find(r=>r.id===id);if(existing)existing.quantity+=quantity;else dest.push(copy);record.quantity-=quantity;
  if(direction==='store')c.inventoryItems=c.inventoryItems.filter(r=>r.quantity>0);else box.contents=box.contents.filter(r=>r.quantity>0);
  this.refresh();return `${quantity} × ${copy.name} ${direction==='store'?'stored':'retrieved'}.`;
 },
 openStorage(box,notice=''){
  this.requireNearby(box);const c=gameUI.character,{card,button,finish}=worldCrafting.showDialog('Camp Storage',`Box: ${InventoryLoad.total(box.contents).toFixed(1)} / 200 lb · ${InventoryLoad.summary(c)}`);if(notice)card.append(craftNode('p',notice,'inventory-notice'));
  const grid=craftNode('div',null,'camp-storage-grid');card.append(grid);
  for(const[direction,title,items]of [['store','Store carried items',c.inventoryItems],['take','Retrieve stored items',box.contents]]){
   const panel=craftNode('div'),label=craftNode('label',title),select=craftNode('select');select.setAttribute('aria-label',title);items.forEach(r=>{const option=craftNode('option',`${r.name} ×${r.quantity} · ${InventoryLoad.unit(r)} lb each`);option.value=r.id;select.append(option);});label.append(select);panel.append(label);
   const quantityLabel=craftNode('label','Quantity'),amount=craftNode('input');amount.type='number';amount.min=1;amount.step=1;amount.value=1;amount.setAttribute('aria-label',`${title} quantity`);quantityLabel.append(amount);panel.append(quantityLabel);
   const update=()=>{amount.max=items.find(r=>r.id===select.value)?.quantity||1;amount.value=Math.min(Number(amount.value)||1,Number(amount.max));};select.addEventListener('change',update);update();
   const action=craftNode('button',direction==='store'?'Store':'Retrieve');action.type='button';action.disabled=!items.length;action.addEventListener('click',()=>{try{const result=this.transfer(box,direction,select.value,Number(amount.value));this.openStorage(box,result);}catch(e){this.openStorage(box,e.message);}});panel.append(action);grid.append(panel);
  }
  button('Pack storage box',()=>this.pack([box]),box.contents.length>0);finish();
 },
 draw(ctx,o,ghost=false){ctx.save();ctx.translate(o.x,o.y);if(ghost)ctx.globalAlpha=.45;if(o.kind==='camp'&&worldCrafting.natureSprite.complete)ctx.drawImage(worldCrafting.natureSprite,544,304,80,64,-18,-26,36,29);else if(o.kind==='fire'&&worldCrafting.craftSprite.complete)worldCrafting.drawFirePit(ctx);else if(o.kind==='storage'&&this.boxImage.complete)ctx.drawImage(this.boxImage,-14,-18,28,23);ctx.restore();},
};
window.Camping=Camping;
Camping.reachableTiles=new Set(worldCrafting.tiles.map(t=>`${t.x},${t.y}`));
Camping.boxImage=new Image();Camping.boxImage.src='./images/crafting/storage-box.svg';
Camping.placementBar=craftNode('div',null,'camp-placement-bar');Camping.placementBar.hidden=true;Camping.placementText=craftNode('span');Camping.placementBar.append(Camping.placementText);for(const[text,fn]of[['Place',()=>{try{Camping.deploy();}catch(e){worldCrafting.message(e.message);}}],['Cancel',()=>Camping.cancel()]]){const b=craftNode('button',text);b.type='button';b.addEventListener('click',fn);Camping.placementBar.append(b);}document.body.append(Camping.placementBar);

// Merge saved physical camp gear with resources and permanent workshop stations.
const originalCampObjects=WorldCrafting.prototype.activeObjects;
WorldCrafting.prototype.activeObjects=function(c=gameUI.character){return originalCampObjects.call(this,c).filter(o=>!['camp','campfire'].includes(o.id)).concat(Camping.objects(c));};
const originalCampBounds=WorldCrafting.prototype.objectBounds;
WorldCrafting.prototype.objectBounds=function(o){if(['camp','storage'].includes(o.kind))return Camping.footprint(o.kind,o.x,o.y);return originalCampBounds.call(this,o);};
const originalCampDraw=WorldCrafting.prototype.draw;
WorldCrafting.prototype.draw=function(ctx,foreground=false){originalCampDraw.call(this,ctx,foreground);for(const o of Camping.objects()){if(o.kind!=='storage')continue;const inFront=o.y>player.y+player.height;if(foreground!==inFront)continue;Camping.draw(ctx,o);}if(!foreground&&Camping.placement){Camping.updateHint();const info=CAMP_ITEMS[Camping.placement.id];Camping.draw(ctx,{...Camping.target(),kind:info.kind},true);}};
const originalCampAccess=WorldCrafting.prototype.access;
WorldCrafting.prototype.access=function(c=gameUI.character){const saved=this.camp,near=Camping.near('camp');if(near)this.camp=near;else this.camp={x:-1e6,y:-1e6};try{return originalCampAccess.call(this,c);}finally{this.camp=saved;}};
const originalCampInteract=WorldCrafting.prototype.interact;
WorldCrafting.prototype.interact=function(){if(!gameUI.isMapActive()||battleSystem.isActive)return;if(Camping.placement){try{Camping.deploy();}catch(e){this.message(e.message);}return;}const o=this.nearby();try{if(o?.kind==='storage'){Camping.openStorage(o);return;}if(o?.kind==='camp'){Camping.openCamp(o);return;}if(o?.kind==='fire'){Camping.openFire(o);return;}}catch(e){this.message(e.message);return;}originalCampInteract.call(this);};
const originalCampSmith=WorldCrafting.prototype.openSmith;
WorldCrafting.prototype.openSmith=function(){originalCampSmith.call(this);const card=this.dialog.querySelector('.world-dialog-card'),heading=craftNode('h3','Campsite supplies');card.insertBefore(heading,card.lastElementChild);for(const[id,info]of Object.entries(CAMP_ITEMS)){const b=craftNode('button',`Buy ${info.name} · ${formatCurrency(info.price)} · ${info.weight} lb`);b.type='button';b.addEventListener('click',()=>{try{const text=Camping.buy(id);Camping.refresh(text);this.dialog.querySelector('.inventory-notice').textContent=text;}catch(e){this.dialog.querySelector('.inventory-notice').textContent=e.message;}});card.insertBefore(b,card.lastElementChild);}};
const originalCampInventory=GameUI.prototype.createInventorySection;
GameUI.prototype.createInventorySection=function(c){const section=originalCampInventory.call(this,c),summary=craftNode('p',InventoryLoad.summary(c),'inventory-load-summary');section.querySelector('h2').after(summary);[...section.querySelectorAll('.inventory-action-row')].forEach((row,index)=>{const r=c.inventoryItems[index];row.querySelector('.inventory-action-name').append(` · ${InventoryLoad.unit(r)} lb each`);if(CAMP_ITEMS[r.id]){const use=row.querySelector('.inventory-actions button:nth-child(2)');use.disabled=false;use.textContent='Deploy';}});return section;};
const originalCampUse=GameUI.prototype.useInventoryItem;
GameUI.prototype.useInventoryItem=function(c,r){if(CAMP_ITEMS[r.id]){try{Camping.begin(r.id);}catch(e){this.inventoryNotice=e.message;}return;}return originalCampUse.call(this,c,r);};
const originalCampPools=GameUI.prototype.recalculateEquippedPools;
GameUI.prototype.recalculateEquippedPools=function(c){originalCampPools.call(this,c);const penalty=InventoryLoad.stats(c).cpPenalty;for(const pools of[c.combatPools,c.missilePools])for(const key in pools)pools[key]=Math.max(1,pools[key]-penalty);c.combatPool=Math.max(1,c.combatPool-penalty);c.missilePool=Math.max(1,c.missilePool-penalty);};
const originalCampInput=Player.prototype.handleInput;
Player.prototype.handleInput=function(keys){originalCampInput.call(this,keys);const s=InventoryLoad.stats(gameUI.character),base=gameUI.character?.move||6,factor=s.overloaded ? 0.25 : Math.max(.25,(base-s.movePenalty)/base);this.velocity.x*=factor;this.velocity.y*=factor;};
window.addEventListener('keydown',event=>{if(!Camping.placement)return;if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();Camping.cancel();}else if(event.key.toLowerCase()==='e'){event.preventDefault();event.stopImmediatePropagation();if(!event.repeat)worldCrafting.interact();}},true);

// Capacity checks and rollback keep failed pickups/purchases from consuming existing supplies.
const originalLoadAdd=Crafting.add;
Crafting.add=function(c,id,name,quantity=1,extra={}){InventoryLoad.check(c,[...c.inventoryItems,{id,name,quantity,...extra}]);return originalLoadAdd.call(this,c,id,name,quantity,extra);};
for(const[name,target]of [['gather',Crafting],['produce',Crafting],['forge',Crafting],['brew',Crafting],['harvest',worldCrafting]]){
 const original=target[name];target[name]=function(...args){const c=name==='harvest'?gameUI.character:args[0],before=JSON.parse(JSON.stringify(c));try{return original.apply(this,args);}catch(e){Object.assign(c,before);throw e;}};
}
const originalLoadBattle=BattleSystem.prototype.startBattle;
BattleSystem.prototype.startBattle=function(...args){if(this.isActive)return;if(gameUI.character)gameUI.recalculateEquippedPools(gameUI.character);if(Camping.placement){Camping.placement=null;Camping.placementBar.hidden=true;}const result=originalLoadBattle.apply(this,args);if(this.isActive)this.addLog(`Carrying: ${InventoryLoad.summary(this.character)}.`);return result;};
const originalLoadUpdate=WorldCrafting.prototype.update;
WorldCrafting.prototype.update=function(distance=0){originalLoadUpdate.call(this,distance);const c=gameUI.character;if(!c)return;
 const state=this.state(c);if(distance>0&&gameUI.isMapActive()&&!battleSystem.isActive){state.travelFatigue=(state.travelFatigue||0)+distance;const interval=InventoryLoad.stats(c).fatigueInterval*1200;let gained=0;while(state.travelFatigue>=interval){state.travelFatigue-=interval;c.conditions.fatigue++;gained++;}if(gained)this.commit(`Travel with your load adds ${gained} Fatigue. Rest at a tent.`);}
 const tents=Camping.objects().filter(o=>o.kind==='camp').sort((a,b)=>this.distance(a)-this.distance(b)),tent=tents[0];if(tent){const dx=tent.x-player.center.x,dy=tent.y-player.center.y,direction=Math.abs(dx)>Math.abs(dy)?(dx>0?'→':'←'):(dy>0?'↓':'↑');this.guide.textContent=`Tent ${direction} ${Math.ceil(this.distance(tent)/16)} tiles · Smith ${Math.ceil(this.distance(this.smith)/16)} tiles`;}else this.guide.textContent=`No deployed tent · Smith ${Math.ceil(this.distance(this.smith)/16)} tiles`;
 Camping.weightHud.hidden=!gameUI.isMapActive()||battleSystem.isActive;const load=InventoryLoad.stats(c),text=`Load ${load.weight.toFixed(1)} / ${load.capacity} lb${load.overloaded?' · Overloaded':''}`;if(Camping.weightHud.textContent!==text)Camping.weightHud.textContent=text;
 if(Camping.placement&&(!gameUI.isMapActive()||battleSystem.isActive)){Camping.placement=null;Camping.placementBar.hidden=true;}
};
Camping.weightHud=craftNode('div',null,'inventory-load-hud');document.body.append(Camping.weightHud);Camping.weightHud.hidden=true;
