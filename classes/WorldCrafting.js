/* Physical world objects, harvesting, construction and local workshop rentals. */
class WorldCrafting {
  constructor() {
    this.craftSprite=new Image();this.craftSprite.src='./images/crafting/crafting-props.png?v=2026-10-08';
    this.craftFrames=[[55, 36, 352, 381], [459, 75, 352, 348], [890, 127, 312, 290], [47, 432, 361, 404], [454, 511, 397, 337], [879, 548, 342, 303], [34, 844, 411, 376], [482, 892, 326, 307], [866, 916, 359, 280]];
    this.natureSprite=new Image();this.natureSprite.src='./images/tileset-forest-and-nature.png';
    this.smithSprite=new Image();this.smithSprite.src=getCharacterSprite('axe-warrior-male').walking;
    this.range=25;this.rental=null;this.dialog=null;this.travelSinceSave=0;
    this.hint=document.createElement('div');this.hint.className='world-interaction-hint';this.hint.hidden=true;document.body.append(this.hint);
    this.guide=document.createElement('div');this.guide.className='world-route-hint';this.guide.hidden=true;document.body.append(this.guide);
    this.toast=document.createElement('div');this.toast.className='world-craft-toast';this.toast.setAttribute('role','status');this.toast.hidden=true;document.body.append(this.toast);
    this.generate();
  }
  generate() {
    const blocked=new Set(collisionBlocks.map(b=>`${Math.floor(b.x/TILE_SIZE)},${Math.floor(b.y/TILE_SIZE)}`));
    const key=(x,y)=>`${x},${y}`,queue=[{x:PLAYER_SPAWN_TILE.x,y:PLAYER_SPAWN_TILE.y,d:0}],seen=new Set([key(queue[0].x,queue[0].y)]);
    this.tiles=[];
    for(let i=0;i<queue.length&&i<60000;i++) {
      const t=queue[i];if(!blocked.has(key(t.x,t.y)))this.tiles.push(t);
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {const x=t.x+dx,y=t.y+dy,k=key(x,y);if(x<1||y<1||x>=MAP_COLS-1||y>=MAP_ROWS-1||seen.has(k)||blocked.has(k))continue;seen.add(k);queue.push({x,y,d:t.d+1});}
    }
    this.objects=[];const reserved=[];
    const place=(id,kind,name,wanted,minSpacing=3,extra={})=>{
      const tile=[...this.tiles].sort((a,b)=>(a.x-wanted.x)**2+(a.y-wanted.y)**2-((b.x-wanted.x)**2+(b.y-wanted.y)**2)).find(t=>(t.d>1||kind==='station')&&reserved.every(p=>Math.hypot(p.x-t.x,p.y-t.y)>=minSpacing));
      if(!tile)return null;reserved.push(tile);const object={id,kind,name,x:tile.x*16+8,y:tile.y*16+8,tileX:tile.x,tileY:tile.y,...extra};this.objects.push(object);return object;
    };
    const spawn=PLAYER_SPAWN_TILE;
    this.camp=place('camp','camp','Your campsite',{x:spawn.x-4,y:spawn.y+2});
    this.smith=place('smith','smith','Village smith · tools & workshop rental',{x:spawn.x+7,y:spawn.y+2});
    const smithTile={x:this.smith.tileX,y:this.smith.tileY};
    // Two arms and a joined back, with a wide entrance beside the smith.
    // Keep forge and hearth within combined-recipe reach from the inner corner.
    const stationLayout=[['kit',-4,0],['bloomery',-4,3],['crucible',-2,5],['forge',2,5],['welding',4,3],['cementation',4,0]];
    for(const [station,dx,dy] of stationLayout)place(`public-${station}`,'station',CRAFT_STATIONS[station][0],{x:smithTile.x+dx,y:smithTile.y+dy},2,{station,public:true});
    const campTile={x:this.camp.tileX,y:this.camp.tileY};
    // Mirror the U at home so the campsite faces its open entrance.
    this.plots=stationLayout.map(([station,dx,dy])=>place(`home-${station}`,'station',CRAFT_STATIONS[station][0],{x:campTile.x+dx,y:campTile.y-dy},2,{station,home:true})).filter(Boolean);
    this.fire=place('campfire','fire','Campfire · burn wood to charcoal',{x:campTile.x+3,y:campTile.y+2},2);
    const publicStations=this.objects.filter(o=>o.public);
    this.workshopBounds={left:Math.min(this.smith.x,...publicStations.map(o=>o.x))-32,right:Math.max(this.smith.x,...publicStations.map(o=>o.x))+32,top:Math.min(this.smith.y,...publicStations.map(o=>o.y))-32,bottom:Math.max(this.smith.y,...publicStations.map(o=>o.y))+32};
    // Leave the entrance and courtyard free of generated rocks, trees and bushes.
    for(const [anchor,direction] of [[smithTile,1],[campTile,-1]])for(let dy=0;dy<=5;dy++)for(let dx=-4;dx<=4;dx++)reserved.push({x:anchor.x+dx,y:anchor.y+direction*dy});
    let serial=0;
    // Nodes are distributed over reachable tiles, including a useful starter trail.
    for(const t of this.tiles.filter(t=>t.d>=5&&t.d<=110).sort((a,b)=>a.d-b.d)) {
      if(reserved.some(p=>Math.hypot(p.x-t.x,p.y-t.y)<3))continue;
      const kind=serial%4===0?'ore':serial%4===1?'timber':'herb',ingredient=serial%ALCHEMY_INGREDIENTS.length;
      const name=kind==='ore'?'Large rock · stone & occasional ore':kind==='timber'?'Timber tree':`Herb bush · ${ALCHEMY_INGREDIENTS[ingredient].name}`;
      const node=place(`resource-${serial}`,kind,name,t,3,{ingredient,capacity:kind==='herb'?1:3});
      if(node)serial++;if(serial>=120)break;
    }
    // Guarantee every updated ingredient exists somewhere on the gathering trail.
    let ingredient=0;for(const node of this.objects.filter(o=>o.kind==='herb')){node.ingredient=ingredient++%48;node.name=`Herb bush · ${ALCHEMY_INGREDIENTS[node.ingredient].name}`;}
    // Register each scenery stamp from its intact upper row, including stamps
    // whose bottom row is incomplete. Bounds allow gathering along every edge.
    l_New_Layer_2.forEach((row,y)=>row.forEach((symbol,x)=>{
      const rock=symbol===511||symbol===521;
      const kind=TREE_ROOT_TILES.has(symbol)?'timber':[314,322].includes(symbol)?'herb':rock?'ore':null;
      if(!kind)return;
      const index=(x*7+y*13)%48,baseY=rock?y+(symbol===511?2:3):y;
      const node={id:`scenery-${x}-${baseY}`,kind,name:kind==='timber'?'Tree · woodcutting':kind==='ore'?'Boulder · stone & occasional ore':`Bush · ${ALCHEMY_INGREDIENTS[index].name}`,x:x*16+8,y:baseY*16+8,tileX:x,tileY:baseY,ingredient:index,capacity:kind==='herb'?1:3,existing:true};
      if(rock)node.interactBounds={left:(x-1)*16,top:y*16,right:(x+(symbol===511?2:3))*16,bottom:(baseY+1)*16};
      this.objects.push(node);
    }));
  }

  state(c=gameUI.character) {
    if(!c)return null;const s=c.crafting||Crafting.init(c);
    if(!s.world) {
      s.world={version:1,harvest:{},built:[...s.stations],travel:0};
      // Previously purchased stations become actual objects at the home campsite.
      if(s.stations.includes('kit')&&!Crafting.count(c,'tool-alchemy'))Crafting.add(c,'tool-alchemy','Alchemy tools',1);
    }
    return s.world;
  }
  activeObjects(c=gameUI.character) {const state=this.state(c);return this.objects.filter(o=>!o.home||state?.built.includes(o.station));}
  distance(o) {
    const bounds=o.interactBounds;
    if(bounds)return Math.hypot(Math.max(bounds.left-player.center.x,0,player.center.x-bounds.right),Math.max(bounds.top-player.center.y,0,player.center.y-bounds.bottom));
    return Math.hypot(player.center.x-o.x,player.center.y-o.y);
  }
  nearby(kind) {return this.activeObjects().filter(o=>(!kind||o.kind===kind)&&this.distance(o)<=this.range).sort((a,b)=>this.distance(a)-this.distance(b))[0];}
  access(c=gameUI.character) {
    if(!c||c!==gameUI.character||battleSystem.isActive)return [];
    const state=this.state(c),access=new Set();
    for(const o of this.activeObjects(c)) {
      if(o.kind!=='station'||this.distance(o)>this.range+6)continue;
      if(o.home&&state.built.includes(o.station)||o.public&&this.rental===c)access.add(o.station);
    }
    // Portable alchemy tools still need a camp work surface or an alchemy bench.
    if(Crafting.count(c,'tool-alchemy')&&(this.distance(this.camp)<=this.range||access.has('kit')))access.add('kit');
    return [...access];
  }
  message(text) {this.toast.textContent=text;this.toast.hidden=false;this.toastUntil=performance.now()+4500;}
  commit(text) {gameUI.refreshInventoryState(gameUI.character);gameUI.persistCharacter();this.message(text);}
  update(distance=0) {
    if(!gameUI.character){this.hint.hidden=true;this.guide.hidden=true;return;}
    const state=this.state();state.travel+=distance;this.travelSinceSave+=distance;
    if(distance>0&&!battleSystem.isActive&&gameUI.isMapActive())this.grassForage(distance);
    if(this.rental&&this.rental!==gameUI.character)this.rental=null;
    const grounds=this.workshopBounds,p=player.center;
    if(this.rental&&(p.x<grounds.left||p.x>grounds.right||p.y<grounds.top||p.y>grounds.bottom)){this.rental=null;this.message('You leave the workshop. Your rental visit has ended.');}
    this.guide.hidden=!gameUI.isMapActive()||battleSystem.isActive;const direction=o=>{const dx=o.x-player.center.x,dy=o.y-player.center.y;return Math.abs(dx)>Math.abs(dy)?(dx>0?'→':'←'):(dy>0?'↓':'↑');};this.guide.textContent=`Camp ${direction(this.camp)} ${Math.ceil(this.distance(this.camp)/16)} tiles · Smith ${direction(this.smith)} ${Math.ceil(this.distance(this.smith)/16)} tiles`;
    const near=this.nearby();this.hint.hidden=!gameUI.isMapActive()||battleSystem.isActive||!near;
    if(near)this.hint.textContent=`E · ${near.name}${this.depleted(near)?' (depleted)':''}`;
    if(this.toastUntil<performance.now())this.toast.hidden=true;
    if(this.travelSinceSave>=100){gameUI.persistCharacter();this.travelSinceSave=0;}
  }
  depleted(node) {const record=this.state()?.harvest[node.id];return record&&record.remaining<=0&&this.state().travel<record.regrowAt;}
  grassForage(distance) {
    const c=gameUI.character;if(c.conditions.dead||c.conditions.coma||c.conditions.unconsciousRounds)return;
    const x=Math.floor(player.center.x/16),y=Math.floor(player.center.y/16),symbol=l_New_Layer_1[y]?.[x],column=(symbol-1)%39,row=Math.floor((symbol-1)/39);
    if(row<9||row>12||column<14||column>17)return;
    const state=this.state(c);state.grassProgress=(state.grassProgress||0)+distance;
    while(state.grassProgress>=64){state.grassProgress-=64;if(Math.random()<.03){const herb=ALCHEMY_INGREDIENTS[Math.floor(Math.random()*48)];Crafting.add(c,herb.id,herb.name);this.commit(`You notice ${herb.name} in the grass and gather it.`);}}
  }
  harvest(node) {
    if(!node||this.distance(node)>this.range||this.depleted(node))throw new Error('This resource is depleted. Explore elsewhere and return later.');
    const c=gameUI.character,action=node.kind==='ore'?'mine':node.kind==='timber'?'wood':'forage';
    const tool=action==='mine'?'tool-pickaxe':action==='wood'?'tool-axe':null;
    if(tool&&!Crafting.count(c,tool))throw new Error(`You need a ${action==='mine'?'pickaxe':'woodcutting axe'}. Buy one from the village smith.`);
    Crafting.ready(c,[],true);
    const chance=Math.random();let text;
    if(node.kind==='herb'&&chance<.65||node.kind==='timber'&&chance<.75||node.kind==='ore'&&chance>=.70&&chance<.90) {
      this.actionNode=node;
      try{text=Crafting.gather(c,action,node.kind==='herb'?()=> (node.ingredient+.1)/48:Math.random);}finally{this.actionNode=null;}
    } else {
      c.conditions.fatigue++;
      if(node.kind==='ore'&&chance<.70){const quantity=1+Math.floor(Math.random()*3);Crafting.add(c,'raw-stone','Stone',quantity);text=`Quarried ${quantity} × Stone. +1 Fatigue.`;}
      else text=`You search the ${node.kind==='herb'?'bush':node.kind==='timber'?'tree':'rock'} but find no usable material. +1 Fatigue.`;
      Crafting.record(c,text);
    }
    const state=this.state(),previous=state.harvest[node.id];
    const remaining=previous&&state.travel<previous.regrowAt?previous.remaining:node.capacity;
    state.harvest[node.id]={remaining:remaining-1,regrowAt:state.travel+1200};
    this.commit(text);
  }
  interact() {
    if(!gameUI.isMapActive()||battleSystem.isActive)return;
    const node=this.nearby();if(!node){this.message('Move beside a resource, campsite, or workshop and press E.');return;}
    try {
      if(['herb','ore','timber'].includes(node.kind)){this.harvest(node);return;}
      if(node.kind==='camp'){this.openCamp();return;}
      if(node.kind==='smith'){this.openSmith();return;}
      if(node.kind==='fire'){this.actionNode=node;try{this.commit(Crafting.gather(gameUI.character,'charcoal'));}finally{this.actionNode=null;}return;}
      if(node.public&&this.rental!==gameUI.character){this.openSmith();return;}
      this.openCraft(node.station==='kit'?'alchemy':'smithing');
    }catch(error){this.message(error.message);}
  }
  openCraft(page) {gameUI.craftPage=page;gameUI.activeSheetTab='crafting';gameUI.craftNotice=`Working at ${this.nearby()?.name||'your campsite'}.`;gameUI.openCharacterMenu();}
  closeDialog() {if(this.dialog){this.dialog.remove();this.dialog=null;}gameUI.mode='map';gameUI.onEnterMap(gameUI.character);}
  showDialog(title,description) {
    if(this.dialog)this.dialog.remove();Object.values(keys).forEach(k=>k.pressed=false);gameUI.mode='world';
    const overlay=document.createElement('section');overlay.className='game-overlay world-workshop-dialog';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label',title);
    const card=craftNode('div',null,'world-dialog-card');card.append(craftNode('h2',title),craftNode('p',description));const notice=craftNode('p',null,'inventory-notice');notice.setAttribute('role','status');card.append(notice);
    const button=(text,fn,disabled=false)=>{const b=craftNode('button',text);b.type='button';b.disabled=disabled;b.addEventListener('click',()=>{try{const result=fn();if(result)notice.textContent=result;gameUI.refreshInventoryState(gameUI.character);gameUI.persistCharacter();}catch(e){notice.textContent=e.message;}});card.append(b);return b;};
    overlay.append(card);document.body.append(overlay);this.dialog=overlay;
    return {card,button,finish:()=>{button('Return to the world',()=>this.closeDialog());card.querySelector('button')?.focus();}};
  }
  openSmith() {
    const c=gameUI.character,{button,finish}=this.showDialog('Village Smith','A working forge, furnaces, welding hearth and alchemy bench stand beside the smith. Rent access for this visit, or buy tools to take into the wilds.');
    button(this.rental===c?'Workshop already rented':'Rent workshop · 1 silver',()=>{if(this.rental===c)return 'Your current rental is still active.';this.pay(48);this.rental=c;return 'Workshop rented. Walk to its forge or alchemy bench and press E. Rental ends when you leave the workshop grounds.';});
    for(const [id,name,price] of [['tool-pickaxe','Pickaxe',12],['tool-axe','Woodcutting axe',12],['tool-alchemy','Alchemy tools',24]])button(`Buy ${name} · ${formatCurrency(price)}`,()=>{if(Crafting.count(c,id))return `You already carry ${name}.`;this.pay(price);Crafting.add(c,id,name);return `${name} added to your carried inventory.`;});
    finish();
  }
  pay(amount) {const c=gameUI.character;Crafting.ready(c);if(c.wealthTotal<amount)throw new Error(`You need ${formatCurrency(amount)}.`);c.wealthTotal-=amount;c.remainingWealth=formatCurrency(c.wealthTotal);}
  build(station) {
    const c=gameUI.character,state=this.state(c);if(this.distance(this.camp)>this.range)throw new Error('Build at your campsite.');
    if(state.built.includes(station))throw new Error('That station is already built.');
    const cost=this.buildCost(station);Crafting.ready(c,[],true);Crafting.consume(c,cost);c.conditions.fatigue++;
    state.built.push(station);if(!c.crafting.stations.includes(station))c.crafting.stations.push(station);
    return Crafting.record(c,`${CRAFT_STATIONS[station][0]} built at your campsite. Walk beside it and press E to work.`);
  }
  buildCost(station) {return station==='kit'?{'raw-wood':4}:station==='forge'?{'raw-wood':4,'raw-stone':8,'raw-ore':2}:station==='welding'?{'raw-wood':4,'raw-stone':6,'raw-charcoal':4}:{'raw-wood':6,'raw-stone':10,'raw-charcoal':4};}
  openCamp() {
    const c=gameUI.character,{button,finish}=this.showDialog('Your Campsite','Build permanent stations here using carried wood, stone, ore and charcoal. Finished stations appear beside the camp. Use the campfire for charcoal, or work with portable alchemy tools at the camp table.');
    button('Rest at camp',()=>{Crafting.ready(c);const dice=Array.from({length:c.attributes.endurance},()=>Math.floor(Math.random()*10)+1),successes=dice.filter(d=>d>=6).length;c.conditions.fatigue=Math.max(0,c.conditions.fatigue-successes);return `Rest [${dice}]: recovered ${successes} Fatigue.`;});
    button('Set out alchemy tools',()=>{if(!Crafting.count(c,'tool-alchemy'))throw new Error('Buy alchemy tools from the village smith first.');this.closeDialog();this.openCraft('alchemy');});
    for(const [station,[name]] of Object.entries(CRAFT_STATIONS)){const cost=this.buildCost(station);button(this.state(c).built.includes(station)?`${name} · built`:`Build ${name} · ${Object.entries(cost).map(([id,n])=>`${n} ${id.replace('raw-','')}`).join(' + ')}`,()=>this.build(station),this.state(c).built.includes(station));}
    finish();
  }
  drawCraftProp(ctx,index,x,ground,width) {
    const [sx,sy,sw,sh]=this.craftFrames[index],height=width*sh/sw;
    ctx.drawImage(this.craftSprite,sx,sy,sw,sh,x-width/2,ground-height,width,height);
  }
  draw(ctx) {
    if(!gameUI.character)return;
    const near=this.nearby();
    for(const o of this.activeObjects().sort((a,b)=>a.y-b.y)) {
      if(o.x<camera.x-32||o.y<camera.y-32||o.x>camera.x+VIEWPORT_WIDTH+32||o.y>camera.y+VIEWPORT_HEIGHT+32)continue;
      const used=this.depleted(o);ctx.save();ctx.translate(o.x,o.y);ctx.globalAlpha=used ? 0.35 : 1;
      ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(-7,-1,14,4);
      const native=this.natureSprite.complete&&this.natureSprite.naturalWidth;
      if(o.existing){if(used){ctx.fillStyle='#8a8069';ctx.fillRect(-3,-2,6,2);}}
      else if(o.kind==='station'||o.kind==='fire') {
        if(this.craftSprite.complete&&this.craftSprite.naturalWidth) {
          if(o.kind==='fire')this.drawCraftProp(ctx,7,0,4,26);
          else if(o.station==='forge'){this.drawCraftProp(ctx,3,-5,1,28);this.drawCraftProp(ctx,5,9,6,18);}
          else this.drawCraftProp(ctx,{bloomery:0,cementation:1,crucible:2,welding:4,kit:6}[o.station],0,4,o.station==='kit'?32:30);
        }
      }
      else if(native&&o.kind==='herb'){ctx.drawImage(this.natureSprite,256+(o.ingredient%11)*32,96,32,48,-8,-21,16,24);}
      else if(native&&o.kind==='ore'){ctx.drawImage(this.natureSprite,48,208,40,40,-12,-20,24,24);ctx.fillStyle='#9b7045';ctx.fillRect(2,-6,2,2);}
      else if(native&&o.kind==='timber'){ctx.drawImage(this.natureSprite,48+(Number(o.id.split('-')[1])%3)*48,0,48,96,-12,-44,24,48);}
      else if(native&&o.kind==='camp'){ctx.drawImage(this.natureSprite,544,304,80,64,-18,-26,36,29);}
      else if(o.kind==='herb'){ctx.fillStyle='#406d31';ctx.fillRect(-1,-8,2,9);ctx.fillRect(-5,-5,10,2);ctx.fillStyle=['#bb65b9','#efcf66','#86a8d2'][o.ingredient%3];ctx.fillRect(-4,-11,7,5);}
      else if(o.kind==='ore'){ctx.fillStyle='#4b515b';ctx.fillRect(-7,-9,14,10);ctx.fillRect(-4,-12,9,4);ctx.fillStyle='#9ba2ac';ctx.fillRect(-4,-8,3,3);ctx.fillStyle='#a76d40';ctx.fillRect(2,-4,3,3);}
      else if(o.kind==='timber'){ctx.fillStyle='#583c24';ctx.fillRect(-2,-10,4,12);ctx.fillStyle='#365d2d';ctx.fillRect(-8,-19,16,10);ctx.fillRect(-5,-23,11,5);ctx.fillStyle='#66934c';ctx.fillRect(-6,-18,6,4);}
      else if(o.kind==='camp'){ctx.fillStyle='#b69757';ctx.beginPath();ctx.moveTo(-12,1);ctx.lineTo(0,-18);ctx.lineTo(12,1);ctx.fill();ctx.fillStyle='#51402e';ctx.fillRect(-3,-6,6,7);}
      else if(o.kind==='smith'&&this.smithSprite.complete&&this.smithSprite.naturalWidth){ctx.drawImage(this.smithSprite,0,0,80,80,-20,-32,40,40);}
      else if(o.kind==='smith'){ctx.fillStyle='#463324';ctx.fillRect(-6,-10,12,12);ctx.fillStyle='#bf9065';ctx.fillRect(-4,-20,8,8);ctx.fillStyle='#726556';ctx.fillRect(-5,-23,10,4);ctx.fillStyle='#d8c29c';ctx.fillRect(-3,-6,6,8);}
      if(o===near){ctx.globalAlpha=1;ctx.font='4px Georgia';ctx.textAlign='center';ctx.fillStyle='#17130f';const w=ctx.measureText(o.name).width+5;ctx.fillRect(-w/2,-33,w,6);ctx.fillStyle='#f3e8ca';ctx.fillText(o.name,0,-29);}
      ctx.restore();
    }
  }
}

const worldCrafting=new WorldCrafting();window.worldCrafting=worldCrafting;
const originalWorldCraftReady=Crafting.ready;
Crafting.ready=function(c,stations=[],effort=false) {
  // Location is validated at the transaction layer as well as in the interface.
  originalWorldCraftReady.call(this,c,[],effort);
  if(stations.some(station=>!worldCrafting.access(c).includes(station)))throw new Error('Walk to the required station in the world. Rent the village workshop or build a station at camp.');
};
const originalWorldGather=Crafting.gather;
Crafting.gather=function(c,action,random=Math.random) {
  const node=worldCrafting.actionNode,expected={forage:'herb',mine:'ore',wood:'timber',charcoal:'fire'}[action];
  if(c!==gameUI.character||!node||node.kind!==expected||worldCrafting.distance(node)>worldCrafting.range)throw new Error('Gather from a physical resource in the world with E.');
  return originalWorldGather.call(this,c,action,random);
};
Crafting.acquire=function(c,station){if(c!==gameUI.character)throw new Error('No active character.');return worldCrafting.build(station);};
