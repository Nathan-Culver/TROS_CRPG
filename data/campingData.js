/* Item weights are explicit game estimates in pounds, not a tabletop price/weight table. */
const CAMP_ITEMS={
 'gear-tent':{kind:'camp',name:'Two-person tent',weight:15,price:money(0,0,8)},
 'gear-fire-pit':{kind:'fire',name:'Portable fire pit',weight:12,price:money(0,0,6)},
 'gear-storage-box':{kind:'storage',name:'Camp storage box',weight:10,price:money(0,0,5)},
};
for(const [id,info] of Object.entries(CAMP_ITEMS)){
 if(!EQUIPMENT_BY_ID[id]){const item=eq(id,info.name,'Travel Gear',info.price,{weight:info.weight,campKind:info.kind});EQUIPMENT_CATALOG.push(item);EQUIPMENT_BY_ID[id]=item;}
 else Object.assign(EQUIPMENT_BY_ID[id],{weight:info.weight,campKind:info.kind});
}
const ITEM_WEIGHTS={
 'raw-wood':3,'raw-charcoal':1,'raw-ore':5,'raw-meteor':8,'raw-stone':5,
 'tool-pickaxe':6,'tool-axe':3,'tool-alchemy':5,
 'gear-travel-pack':2,'gear-cloak':3,'gear-bedroll':5,'gear-rope':5,'gear-torch':1,'gear-lantern':2,
 'gear-rations':7,'gear-waterskin':4,'gear-mess-kit':1,'gear-whetstone':.5,'gear-grapple':3,
 'animal-saddle':15,
};
const InventoryLoad={
 unit(r){
  const item=EQUIPMENT_BY_ID[r.id]||{},id=r.id;
  if(Number.isFinite(r.weight))return Math.max(0,r.weight);
  if(Number.isFinite(item.weight))return Math.max(0,item.weight);
  if(id in ITEM_WEIGHTS)return ITEM_WEIGHTS[id];
  if(id.startsWith('ingredient-')||id.startsWith('herb-'))return .1;
  if(r.potionEffects||id.startsWith('potion-'))return .5;
  if(id.startsWith('bar-'))return 5;
  if(item.weaponId||r.baseWeapon){const weapon=r.baseWeapon||item.weaponId;return /dagger|poniard|rondel|stiletto|knife|knuckle/i.test(weapon)?1:/doppel|great|maul|pole|pike|halberd|lance|bill/i.test(weapon)?7:/staff|spear|bow|crossbow/i.test(weapon)?4:3;}
  if(item.shield||id.startsWith('shield-'))return /buckler/.test(id)?2:/kite/.test(id)?10:6;
  if(item.armorId||item.armorPiece||id.startsWith('armor-'))return /full.*plate|plate.*full/.test(id)?45:/chain.*full/.test(id)?40:/chain|mail/.test(id)?/coif|helm|head|arm|leg|hand|foot/.test(id)?5:20:/breastplate|cuirass/.test(id)?15:/helm|head/.test(id)?5:/leather/.test(id)?/arm|leg|hand|foot/.test(id)?2:8:4;
  if(id.startsWith('animal-'))return 0; // Companions walk; they are not carried in the pack.
  if(id.startsWith('ammo-'))return .1;
  if(item.category==='Clothing')return 3;
  if(item.category==='Tools')return 2;
  return 1;
 },
 total(items){return Math.round(items.reduce((sum,r)=>sum+this.unit(r)*Math.max(0,Number(r.quantity)||0),0)*100)/100;},
 stats(c){
  const items=c?.inventoryItems||[],st=Math.max(1,Number(c?.attributes?.strength)||1),en=Math.max(1,Number(c?.attributes?.endurance)||1),base=st+en;
  const weight=this.total(items),extra=this.total(items.filter(r=>{const item=EQUIPMENT_BY_ID[r.id];return !(r.equipped&&(r.armorId||item?.armorId||item?.armorPiece||item?.category==='Clothing'));}));
  const capacity=25*(st+1),weightPenalty=extra>base*20?5:extra>base*10?3:extra>base*5?2:extra>base*3?1:0;
  const pack=items.some(r=>r.id==='gear-travel-pack'&&r.quantity>0)?1:0;
  const campCargo=this.total(items.filter(r=>CAMP_ITEMS[r.id])),looseCargo=this.total(items.filter(r=>r.id.startsWith('raw-')||r.id.startsWith('bar-')));
  // Stowed supplies inside the pack do not add a second "full sack" penalty.
  const cargo=campCargo+(pack?0:looseCargo),bulky=campCargo>0||!pack&&looseCargo>=10,bulkPenalty=bulky?(cargo>base*5?2:1):0;
  const cpPenalty=pack+bulkPenalty,movePenalty=pack+(bulky?1:0),bodyPenalty=c?.giftsFlaws?.some(t=>/obese/i.test(t))?2:c?.giftsFlaws?.some(t=>/overweight/i.test(t))?1:0;
  const fatiguePenalty=weightPenalty+bodyPenalty,armorPenalty=c?.armor?.poolPenalty||0;
  return {weight,extra,capacity,cpPenalty,movePenalty,fatiguePenalty,overloaded:weight>capacity,comfortable:base*3,fatigueInterval:Math.max(1,en*2-armorPenalty-cpPenalty-fatiguePenalty)};
 },
 check(c,items){if(this.total(items)>this.stats(c).capacity+.0001)throw new Error('Carrying limit exceeded. Store supplies in a camp box, deploy campsite gear, or drop items first.');},
 summary(c){const s=this.stats(c);return `${s.weight.toFixed(1)} / ${s.capacity} lb carried · ${s.extra.toFixed(1)} lb extra equipment · CP −${s.cpPenalty}, Move −${s.movePenalty} · Fatigue every ${s.fatigueInterval} combat rounds${s.overloaded?' · OVERLOADED':''}`;},
};
