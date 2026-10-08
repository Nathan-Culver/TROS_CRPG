// Effects are evaluated for the player only; enemies retain their original rules.
Crafting.attackModifier=function(b,actor,maneuver,opponent=b.enemy) {
  if(actor!==b.player)return 0;
  const wounded=opponent?.wounds?.length>0;
  let modifier=0;
  for(const e of this.effects(b.character)) {
    const t=e.text;
    if(!t.startsWith('lower')||!t.includes('attacks'))continue;
    if(t.includes('against unwounded')&&wounded||t.includes('against wounded')&&!wounded)continue;
    if(t.includes('thrust')&&!maneuver.thrust||t.includes('blunt')&&!maneuver.bash||t.includes('cuts')&&(maneuver.thrust||maneuver.bash))continue;
    modifier-=Number(t.match(/\d+/)[0]); // Identical effects are deduplicated when drinking.
  }
  return modifier;
};
Crafting.defenseModifier=function(b,actor,m) {
  if(actor!==b.player)return 0;
  return -this.effects(b.character).filter(e=>e.text.startsWith('lower')&&(e.text.includes('defenses')||e.text.includes('shield')&&(m.block||m.requiresShield)||e.text.includes('block')&&m.block||e.text.includes('parries')&&m.usesWeaponTarget)).reduce((n,e)=>n+Number(e.text.match(/\d+/)[0]),0);
};
Crafting.cpBonus=function(b,action,opponent=b.enemy) {
  const ownWounded=b.player.wounds.length>0,enemyWounded=opponent?.wounds?.length>0;
  let bonus=0;
  if(!b._craftConditionalUsed||typeof b._craftConditionalUsed!=='object')b._craftConditionalUsed={};
  for(const e of this.effects(b.character)) {
    const t=e.text;if(!t.startsWith('add'))continue;
    const amount=Number(t.match(/\d+/)[0]);
    if(!t.includes('while')) {if(action==='pool')bonus=Math.max(bonus,amount);continue;}
    if(action==='pool')continue;
    const fits=t.includes('while attacking')?action==='attack':t.includes('while defending')?action==='defense':t.includes('enemy is unwounded')?!enemyWounded:t.includes('enemy is wounded')?enemyWounded:t.includes('while unwounded')?!ownWounded:ownWounded;
    if(fits) {const used=b._craftConditionalUsed[t]||0;bonus+=Math.max(0,amount-used);b._craftConditionalUsed[t]=amount;}
  }
  // Each distinct conditional CP effect is shared across every opponent and exchange.
  return bonus;
};
Crafting.traitBonus=function(c,trait) {
  let bonus=this.amount(c,`increase ${trait} by`);
  if(['reflex','knockdown'].includes(trait) )bonus+=this.amount(c,'increase agility')/2;
  return bonus;
};

const originalStartCraftBattle=BattleSystem.prototype.startBattle;
if(originalStartCraftBattle)BattleSystem.prototype.startBattle=function(...args){
  this._craftRound=0;this._craftConditionalUsed=0;this._craftSAAwarded=false;
  // A modest encounter terrain profile makes the listed terrain potion functional.
  const roll=Math.random();this.craftTerrain=roll<.5?{name:'Forest clearing',penalty:0,enemyBonus:0}:roll<.8?{name:'Uneven forest floor',penalty:1,enemyBonus:0}:{name:'Dense undergrowth',penalty:1,enemyBonus:1};
  const result=originalStartCraftBattle.apply(this,args);
  this.addLog(`${this.craftTerrain.name}: player terrain penalty ${this.craftTerrain.penalty} CP, opponent terrain bonus ${this.craftTerrain.enemyBonus} CP per round.`);
  return result;
};
const originalCraftRound=BattleSystem.prototype.beginRound;
BattleSystem.prototype.beginRound=function(...args) {
  if(this._craftRound&&this._craftRound!==this.round) {
    const delayed=Crafting.delayAmount(this.character,'shock')>0;Crafting.tick(this.character,this.player);
    if(delayed&&!Crafting.delayAmount(this.character,'shock')) {this.player.conditions.pendingShock=(this.player.conditions.pendingShock||0)+(this.character.crafting.delayedShock||0);this.character.crafting.delayedShock=0;}
  }
  if(this._craftRound!==this.round)this._craftConditionalUsed=0;
  this._craftRound=this.round;
  return originalCraftRound.apply(this,args);
};
const originalCraftTrait=BattleSystem.prototype.getConditionTrait;
BattleSystem.prototype.getConditionTrait=function(actor,trait) {const bonus=actor===this.player?Crafting.traitBonus(this.character,trait):0;return originalCraftTrait.call(this,actor,trait)+bonus;};
const originalCraftTotals=BattleSystem.prototype.recalculateConditionTotals;
BattleSystem.prototype.recalculateConditionTotals=function(actor) {
  originalCraftTotals.call(this,actor);
  if(actor!==this.player)return;
  actor.conditions.pain=Math.max(0,actor.conditions.pain-Crafting.delayAmount(this.character,'pain'));
  actor.conditions.bleeding=Math.max(0,actor.conditions.bleeding-Crafting.delayAmount(this.character,'blood loss'));
  // This game models limb impairment through location-specific Pain.
  if(Crafting.has(this.character,'ignore crippled limb')) {const limbPain=actor.wounds.filter(w=>['arms','legs'].includes(w.bodyZone)).reduce((n,w)=>n+(w.pain||0),0);actor.conditions.pain=Math.max(0,actor.conditions.pain-limbPain);}
};
const originalCraftPools=BattleSystem.prototype.refreshConditionPools;
BattleSystem.prototype.refreshConditionPools=function(actor) {
  originalCraftPools.call(this,actor);
  if(actor.conditions.unconsciousRounds||actor.conditions.coma||actor.conditions.dead)return;
  const negateTerrain=Crafting.has(this.character,'ignore terrain penalties');
  const terrain=this.craftTerrain||{penalty:0,enemyBonus:0};
  if(actor!==this.player){if(!negateTerrain){actor.pool+=terrain.enemyBonus;actor.maxPool+=terrain.enemyBonus;}return;}
  const armor=Crafting.has(this.character,'lessen armor')?Math.min(Crafting.amount(this.character,'lessen armor'),actor.encumbrancePenalty):0;
  const bonus=Crafting.cpBonus(this,'pool')+armor+Math.floor(Crafting.traitBonus(this.character,'reflex'));
  actor.pool=Math.max(0,actor.pool+bonus-(negateTerrain?0:terrain.penalty));actor.maxPool=Math.max(0,actor.maxPool+bonus-(negateTerrain?0:terrain.penalty));
};
const originalCraftCost=BattleSystem.prototype.getActivationCost;
BattleSystem.prototype.getActivationCost=function(actor,action,cost,m=null) {
  const original=originalCraftCost.call(this,actor,action,cost,m);
  if(actor!==this.player)return original;
  const record=Crafting.recordFor(this.character,actor.weapon), material=SMITH_MATERIALS[record?.material];
  if(Crafting.has(this.character,'movement has no cp cost')&&(m?.fullEvasion||m?.duckWeave||m?.key==='partialEvasion'||m?.evasiveAttack||m?.key==='overrun'))return 0;
  return Math.max(0,original-(material?.cost||0));
};
const originalCraftWound=BattleSystem.prototype.inflictAttackWound;
BattleSystem.prototype.inflictAttackWound=function(attacker,defender,...args) {
  this._craftImpactMaterial=attacker===this.player?SMITH_MATERIALS[Crafting.recordFor(this.character,attacker.weapon)?.material]:null;
  try{return originalCraftWound.call(this,attacker,defender,...args);}finally{this._craftImpactMaterial=null;}
};
const originalCraftWoundEffects=BattleSystem.prototype.getWoundEffects;
BattleSystem.prototype.getWoundEffects=function(target,severity,type,zone) {
  const effects=originalCraftWoundEffects.call(this,target,severity,type,zone),mat=this._craftImpactMaterial;
  if(mat&&target!==this.player&&severity>0) {if(type==='bludgeoning')effects.shock+=mat.shock||0;else effects.bloodLoss+=mat.blood||0;}
  return effects;
};
const originalCraftImmediateShock=BattleSystem.prototype.applyImmediateShock;
BattleSystem.prototype.applyImmediateShock=function(target,wound) {
  const delay=Crafting.delayAmount(this.character,'shock');
  if(target!==this.player||!delay)return originalCraftImmediateShock.call(this,target,wound);
  const saved=target.wounds.map(w=>[w,w.shock]);
  const deferred=Math.min(delay,Math.max(...saved.map(([,n])=>n||0)));
  this.character.crafting.delayedShock=Math.max(this.character.crafting.delayedShock||0,deferred);
  saved.forEach(([w,n])=>w.shock=Math.max(0,n-delay));
  try{return originalCraftImmediateShock.call(this,target,wound);}finally{saved.forEach(([w,n])=>w.shock=n);}
};
for(const [method,text] of [['resolveKnockdown','ignore knockdown'],['resolveKnockout','ignore knockout']]) {
  const original=BattleSystem.prototype[method];
  BattleSystem.prototype[method]=function(target,...args){if(target===this.player&&Crafting.has(this.character,text)){this.addLog(`Potion prevents ${text.replace('ignore ','')}.`);return;}return original.call(this,target,...args);};
}
const originalCraftResolve=BattleSystem.prototype.resolveAttack;
BattleSystem.prototype.resolveAttack=function(attacker,defender,attackPlan,defensePlan) {
  const aw=attacker.weapon,dw=defender.weapon;
  try{return originalCraftResolve.call(this,attacker,defender,attackPlan,defensePlan);}finally{
    if(attackPlan.attackDice>0)Crafting.wear(this,attacker,aw);
    if(defensePlan.defenseDice>0&&DEFENSIVE_MANEUVERS[defensePlan.defenseManeuver]?.usesWeaponTarget)Crafting.wear(this,defender,dw);
  }
};
const originalCraftUnopposed=BattleSystem.prototype.resolveUnopposedStrike;
BattleSystem.prototype.resolveUnopposedStrike=function(attacker,defender,plan) {const weapon=attacker.weapon;try{return originalCraftUnopposed.call(this,attacker,defender,plan);}finally{if(plan.attackDice>0)Crafting.wear(this,attacker,weapon);}};
const originalCraftWeaponOptions=BattleSystem.prototype.configurePlayerWeapons;
BattleSystem.prototype.configurePlayerWeapons=function(c) {
  Crafting.init(c);originalCraftWeaponOptions.call(this,c);
  for(const option of [...this.weaponSelect.options]) {const r=Crafting.recordFor(c,option.value);if(option.value!=='unarmed'&&(!r||r.durability<=1||r.destroyed))option.remove();}
  if(![...this.weaponSelect.options].some(o=>o.value==='unarmed')){const o=document.createElement('option');o.value='unarmed';o.textContent='Unarmed';this.weaponSelect.append(o);}
  this.weaponSelect.value=[...this.weaponSelect.options].some(o=>o.value===c.primaryWeapon)?c.primaryWeapon:'unarmed';this.configureManeuverOptions();
};
const originalCraftInventoryBattle=BattleSystem.prototype.useBattleInventoryItem;
BattleSystem.prototype.useBattleInventoryItem=function(id) {
  const r=this.character?.inventoryItems.find(r=>r.id===id);
  if(!r?.potionEffects)return originalCraftInventoryBattle.call(this,id);
  if(this.isResolving||this.battleEnded)return;
  try {
    const before=Crafting.cpBonus(this,'pool')+(Crafting.has(this.character,'lessen armor')?Math.min(Crafting.amount(this.character,'lessen armor'),this.player.encumbrancePenalty):0)+Math.floor(Crafting.traitBonus(this.character,'reflex'));
    const terrainBefore=Crafting.has(this.character,'ignore terrain penalties');
    this.inventoryNotice.textContent=Crafting.drink(this.character,r,this.player);
    const after=Crafting.cpBonus(this,'pool')+(Crafting.has(this.character,'lessen armor')?Math.min(Crafting.amount(this.character,'lessen armor'),this.player.encumbrancePenalty):0)+Math.floor(Crafting.traitBonus(this.character,'reflex'));
    this.player.pool+=Math.max(0,after-before);this.player.maxPool+=Math.max(0,after-before);
    if(!terrainBefore&&Crafting.has(this.character,'ignore terrain penalties')) {const t=this.craftTerrain||{penalty:0,enemyBonus:0};this.player.pool+=t.penalty;this.player.maxPool+=t.penalty;this.enemies.forEach(enemy=>{enemy.pool=Math.max(0,enemy.pool-t.enemyBonus);enemy.maxPool=Math.max(0,enemy.maxPool-t.enemyBonus);});}
    this.recalculateConditionTotals(this.player);this.character.wounds=this.player.wounds.map(w=>({...w}));this.character.conditions={...this.player.conditions};localStorage.setItem('tros-character',JSON.stringify(this.character));this.addLog(`${this.player.name} drinks ${r.name}.`);this.renderBattleInventory();this.updateInterface();
  }catch(e){this.inventoryNotice.textContent=e.message;}
};
