// Crafting panels use the existing character sheet and save lifecycle.
const craftNode = (tag, text, cls) => { const el=document.createElement(tag); if(text)el.textContent=text; if(cls)el.className=cls; return el; };
GameUI.prototype.createCraftingSection = function(c) {
  const saved=Crafting.init(c), s={...saved,stations:window.worldCrafting?.access(c)||[]}, section=craftNode('section',null,'sheet-section crafting-section'); section.dataset.sheetPanel='crafting'; section.setAttribute('role','tabpanel');
  section.append(craftNode('h2','The Workshop'),craftNode('p','Gather with E beside resources on the map. Work requires a nearby built station or a rented village workshop. Crafting costs 1 Fatigue.','craft-help'));
  const notice=craftNode('p',this.craftNotice || 'Choose a craft below.','inventory-notice'); notice.setAttribute('role','status'); section.append(notice);
  const act=(fn) => { try { this.craftNotice=fn(); } catch(e) { this.craftNotice=e.message; } this.refreshInventoryState(c);this.recalculateEquippedPools(c);this.persistCharacter();this.renderCharacterSheet(); };
  const button=(parent,text,fn,disabled=false) => {const b=craftNode('button',text);b.type='button';b.disabled=disabled;b.addEventListener('click',()=>act(fn));parent.append(b);return b;};
  const tabs=craftNode('nav',null,'craft-subtabs');tabs.setAttribute('aria-label','Crafting disciplines');
  const body=craftNode('div');section.append(tabs,body);
  for(const [id,name] of [['alchemy','Alchemy'],['smithing','Blacksmithing'],['supplies','World & Supplies']]) { const b=craftNode('button',name), icon=craftNode('img',null,'menu-icon');icon.src=`./images/ui/${id}.svg`;icon.alt='';icon.width=22;icon.height=22;icon.draggable=false;b.prepend(icon);b.type='button';b.classList.toggle('active',(this.craftPage||'alchemy')===id);b.addEventListener('click',()=>{this.craftPage=id;this.renderCharacterSheet();});tabs.append(b); }
  const skill=craftNode('div',null,'craft-toolbar');body.append(skill);
  if((this.craftPage||'alchemy')!=='supplies') {
    const alchemy=(this.craftPage||'alchemy')==='alchemy', rank=alchemy?s.alchemy:s.smithing, cost=alchemy||rank<6?2:rank-3;
    skill.append(craftNode('strong',alchemy?`Alchemy ${rank}/5 · ${c.attributes.wit+rank} dice vs TN 6`:`${SMITH_RANKS[rank]} · ${c.attributes.wit+Math.max(0,rank-6)} Wits dice vs TN ${Math.max(4,10-rank)}`));
    button(skill,`Advance (${cost} SA)`,()=>Crafting.advance(c,alchemy?'alchemy':'smithing'),rank===(alchemy?5:9));
    skill.append(craftNode('span',`${c.spiritualAttributes.reduce((n,a)=>n+a.value,0)} SA available · largest balances spent first`,'craft-help'));
  }
  if((this.craftPage||'alchemy')==='alchemy') {
    body.append(craftNode('p','Select up to five different ingredients. Choose effects below: Common 1 slot/source, Uncommon 2 slots/distinct sources, Rare 3. Effects share a five-slot budget.','craft-help'));
    this.brewIngredients=(this.brewIngredients||[]).filter(id=>Crafting.count(c,id)>0);this.brewEffects||=[];
    const layout=craftNode('div',null,'brew-layout'), shelf=craftNode('div',null,'ingredient-shelf'), preview=craftNode('div',null,'brew-preview'); layout.append(shelf,preview);body.append(layout);
    const search=craftNode('input');search.type='search';search.placeholder='Find a carried ingredient';search.setAttribute('aria-label','Find ingredient');search.value=this.ingredientSearch||'';shelf.append(search);
    search.addEventListener('input',()=>{this.ingredientSearch=search.value; for(const card of shelf.querySelectorAll('[data-ingredient-name]'))card.hidden=!card.dataset.ingredientName.includes(search.value.toLowerCase());});
    let count=0;
    ALCHEMY_INGREDIENTS.forEach((i,index)=>{
      const quantity=Crafting.count(c,i.id);if(!quantity)return;count++;
      const card=craftNode('button',null,'ingredient-card');card.type='button';card.dataset.ingredientName=i.name.toLowerCase();card.hidden=!card.dataset.ingredientName.includes((this.ingredientSearch||'').toLowerCase());
      const selected=this.brewIngredients.includes(i.id);card.classList.toggle('selected',selected);card.setAttribute('aria-pressed',String(selected));card.disabled=!selected&&this.brewIngredients.length>=5;
      const icon=craftNode('span',null,'ingredient-sprite');icon.style.backgroundPosition=`${-24-(index%8)*36}px ${-14-Math.floor(index/8)*36}px`;
      card.append(icon,craftNode('strong',`${i.name} ×${quantity}`),craftNode('small',i.clue));card.title=`Common: ${i.common}\nUncommon: ${i.uncommon}\nRare: ${i.rare}`;
      card.addEventListener('click',()=>{this.brewIngredients=selected?this.brewIngredients.filter(id=>id!==i.id):[...this.brewIngredients,i.id];this.brewEffects=this.brewEffects.filter(k=>Crafting.candidates(this.brewIngredients).some(e=>e.key===k));this.renderCharacterSheet();});shelf.append(card);
    });
    if(!count)shelf.append(craftNode('p','No ingredients carried. Find herb patches on the map and press E.','craft-help'));
    preview.append(craftNode('h3',`⚗ Brewing vessel · ${this.brewIngredients.length}/5 ingredients`));
    const candidates=Crafting.candidates(this.brewIngredients), effectsBox=craftNode('div');preview.append(effectsBox);
    const slots=craftNode('p',null,'effect-slot-meter'), status=craftNode('p',null,'craft-help');preview.append(slots,status);
    let brew;
    const refresh=()=>{const f=Crafting.formula(this.brewIngredients,this.brewEffects,s.alchemy);const used=this.brewEffects.reduce((n,k)=>n+(candidates.find(e=>e.key===k)?.slots||0),0);slots.textContent=`${'▣ '.repeat(Math.min(used,5))}${'□ '.repeat(Math.max(0,5-used))} ${used}/5 effect slots`;status.textContent=f.error||`Legal formula · Alchemy ${f.required}+ · 2 successes needed`;brew.disabled=!!f.error||!s.stations.includes('kit')||c.conditions.fatigue>=c.attributes.endurance;};
    candidates.forEach(effect=>{
      const label=craftNode('label',null,`effect-card ${effect.rarity}`), check=craftNode('input');check.type='checkbox';check.checked=this.brewEffects.includes(effect.key);
      const content=craftNode('span');content.append(craftNode('strong',`${effect.rarity.toUpperCase()} · ${effect.slots} slot${effect.slots>1?'s':''}`),craftNode('span',effect.text),craftNode('small',`Matching sources: ${effect.sources.join(', ')}`));label.append(check,content);effectsBox.append(label);
      check.addEventListener('change',()=>{this.brewEffects=check.checked?[...this.brewEffects,effect.key]:this.brewEffects.filter(k=>k!==effect.key);refresh();});
    });
    brew=button(preview,'Brew potion',()=>{const result=Crafting.brew(c,this.brewIngredients,this.brewEffects);this.brewIngredients=[];this.brewEffects=[];return result;});
    button(preview,'Clear vessel',()=>{this.brewIngredients=[];this.brewEffects=[];return 'Vessel cleared.';});
    if(!s.stations.includes('kit'))preview.append(craftNode('p','Work at an alchemy bench, or bring alchemy tools to your campsite.','craft-help'));refresh();
    const active=Crafting.effects(c);if(active.length)body.append(craftNode('p',`Active potions: ${active.map(e=>`${e.text} (${e.remaining} rounds)`).join(' · ')}`,'craft-help'));
  } else if(this.craftPage==='smithing') {
    const grid=craftNode('div',null,'smith-layout');body.append(grid);
    const select=(parent,label,options)=>{const wrapper=craftNode('label',label),el=craftNode('select');options.forEach(([value,text])=>{const option=craftNode('option',text);option.value=value;el.append(option);});wrapper.append(el);parent.append(wrapper);return el;};
    const refine=craftNode('article',null,'craft-card');grid.append(refine);refine.append(craftNode('h3','Ⅰ Refine metal'));
    const iron=select(refine,'Iron substitution ',['wrought','carburized','meteoric'].map(k=>[k,SMITH_MATERIALS[k].name]));
    Object.entries(SMITH_RECIPES).forEach(([key,r])=>{const row=craftNode('div',null,'recipe-row'),heading=craftNode('strong',null,'material-title'),sprite=craftNode('span',null,'material-sprite');const positions={wrought:[-28,-101],carburized:[-95,-101],meteoric:[-158,-101],bloomery:[-248,-15],blister:[-298,-15],pattern:[-348,-15],wootz:[-398,-15],composite:[-447,-15]};sprite.style.backgroundPosition=`${positions[key][0]}px ${positions[key][1]}px`;heading.append(sprite,craftNode('span',SMITH_MATERIALS[key].name));row.append(heading,craftNode('small',`${Object.entries(r.inputs).map(([k,n])=>`${n} ${k}`).join(' + ')} · ${r.stations.map(k=>CRAFT_STATIONS[k][0]).join(' + ')}`));button(row,'Produce bar',()=>Crafting.produce(c,key,iron.value),r.stations.some(k=>!s.stations.includes(k)));refine.append(row);});
    const forge=craftNode('article',null,'craft-card');grid.append(forge);forge.append(craftNode('h3','Ⅱ Forge weapon'));
    const weapons=Object.entries(MELEE_WEAPONS).filter(([id,w])=>!w.craftRecordId&&w.kind==='melee'&&!['unarmed','club','quarterstaff','shortStaff'].includes(id));
    const weapon=select(forge,'Weapon ',weapons.map(([id,w])=>[id,w.name]));
    const bars=c.inventoryItems.filter(r=>r.material&&r.id.startsWith('bar-'));
    const bar=select(forge,'Carried bar ',bars.map(r=>[r.id,`${r.name} ×${r.quantity}`]));
    const improvements=[['attack','−1 ATN'],['defense','−1 DTN'],['damage','+1 damage (up to St+3)']];
    const first=select(forge,'First improvement (Fine / Superlative) ',improvements),second=select(forge,'Second improvement (Superlative) ',improvements);second.value='defense';
    forge.append(craftNode('p','1 bar per weapon. 2+ successes to forge. Carburized: three dice at 7+ → Fine (one improvement). Meteoric: three at 9+ → Superlative (two different improvements). Otherwise Standard.','craft-help'));
    button(forge,'Forge weapon',()=>Crafting.forge(c,weapon.value,bar.value,[first.value,second.value]),!bars.length||!s.stations.includes('forge'));
    forge.append(craftNode('h3','Ⅲ Repair & equip'));
    c.inventoryItems.filter(r=>r.durability!==undefined&&!r.destroyed).forEach(r=>{
      const row=craftNode('div',null,'recipe-row');row.append(craftNode('strong',r.name),craftNode('small',`${r.quality} · ${r.durability}/10 ${DURABILITY_NAMES[r.durability]} · ${Math.round(SMITH_MATERIALS[r.material].loss*100)}% wear per weapon use`));
      button(row,'Repair',()=>Crafting.repair(c,r.id),r.durability===10||!s.stations.includes('forge'));
      button(row,r.equipped?'Equipped':'Equip',()=>{this.toggleEquippedItem(c,r,EQUIPMENT_BY_ID[r.id]);return this.inventoryNotice;},r.equipped||r.durability<=1);forge.append(row);
    });
    forge.append(craftNode('p','Repair needs Standard 2 / Fine 3 / Superlative 4 successes; restores one level per success. Failed repair destroys the weapon.','craft-help'));
    const stocks=craftNode('article',null,'craft-card');body.append(stocks);stocks.append(craftNode('h3','Material stock'));
    c.inventoryItems.filter(r=>r.id.startsWith('raw-')||r.id.startsWith('bar-')).forEach(r=>stocks.append(craftNode('p',`${r.quantity} × ${r.name}`)));
  } else {
    const world=window.worldCrafting,state=world?.state(c),info=craftNode('div',null,'craft-card');body.append(info);
    info.append(craftNode('h3','Crafting in the world'),craftNode('p','Return to the map and press E beside a herb patch, ore boulder, timber tree, campsite, smith, or crafting station. Bushes have a 65% herb chance; walking through grass has a 3% chance per four tiles. Trees have a 75% wood chance. Large rocks yield stone 70% of the time and ore 20%. Nodes deplete individually and regrow after you explore 1,200 world pixels. Mining requires a pickaxe; woodcutting requires an axe. Buy tools from the village smith.','craft-help'));
    if(world)info.append(craftNode('p',`Campsite: tile ${world.camp.tileX}, ${world.camp.tileY} · Village smith: tile ${world.smith.tileX}, ${world.smith.tileY}`),craftNode('p',`Built at camp: ${(state?.built||[]).map(id=>CRAFT_STATIONS[id][0]).join(', ')||'None yet'}`),craftNode('p',`Nearby usable stations: ${s.stations.map(id=>CRAFT_STATIONS[id][0]).join(', ')||'None — walk to a station.'}`));
    info.append(craftNode('p','The smith rents workshop access for 1 silver per visit. Leaving the workshop grounds ends the rental. Build your own permanent stations with wood, stone, ore and charcoal at the campsite. Previous purchased stations have become real stations at your camp.','craft-help'));
    const stock=craftNode('div',null,'craft-card');stock.append(craftNode('h3','Carried crafting supplies'));body.append(stock);c.inventoryItems.filter(r=>r.id.startsWith('ingredient-')||r.id.startsWith('raw-')||r.id.startsWith('bar-')).forEach(r=>stock.append(craftNode('p',`${r.quantity} × ${r.name}`)));
  }
  const history=craftNode('details',null,'craft-history');history.append(craftNode('summary','Recent crafting tests'));s.log.forEach(text=>history.append(craftNode('p',text)));body.append(history);
  return section;
};

// Hydrate crafted items before equipment, combat, and saves read their records.
const originalEnsureCharacterState=GameUI.prototype.ensureCharacterState;
GameUI.prototype.ensureCharacterState=function(c) { originalEnsureCharacterState.call(this,c);Crafting.init(c);c.inventoryItems.forEach(r=>{EQUIPMENT_BY_ID[r.id]||={id:r.id,name:r.name,category:'Crafting'};});this.recalculateEquippedPools(c); };
const originalUseInventory=GameUI.prototype.useInventoryItem;
GameUI.prototype.useInventoryItem=function(c,r) { if(!r.potionEffects)return originalUseInventory.call(this,c,r);try {this.inventoryNotice=Crafting.drink(c,r);this.recalculateCharacterConditions(c);}catch(e){this.inventoryNotice=e.message;} };
const originalCraftMenuConditions=GameUI.prototype.recalculateCharacterConditions;
GameUI.prototype.recalculateCharacterConditions=function(c) {originalCraftMenuConditions.call(this,c);if(Crafting.has(c,'delay 8 pain'))c.conditions.pain=Math.max(0,c.conditions.pain-8);if(Crafting.has(c,'delay 8 blood loss'))c.conditions.bleeding=Math.max(0,c.conditions.bleeding-8);};
const originalToggleEquip=GameUI.prototype.toggleEquippedItem;
GameUI.prototype.toggleEquippedItem=function(c,r,item) {if(r.durability<=1||r.destroyed){this.inventoryNotice='Broken or destroyed weapons cannot be equipped.';return;}originalToggleEquip.call(this,c,r,item);};
const originalKeyDown=GameUI.prototype.handleKeyDown;
GameUI.prototype.handleKeyDown=function(e) {if(this.mode==='menu'&&e.target?.matches('input,select,textarea')){if(e.key==='Escape'&&this.mode==='menu'){this.closeCharacterMenu();return true;}return this.mode!=='map';}return originalKeyDown.call(this,e);};
