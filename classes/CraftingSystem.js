/* Gameplay crafting rules. All transactions validate before consuming inventory. */
const SMITH_RANKS = ['Untrained', 'Beginner', 'Novice', 'Apprentice', 'Competent', 'Journeyman', 'Master', 'Grandmaster I', 'Grandmaster II', 'Grandmaster III'];
const SMITH_MATERIALS = {
  wrought: { name: 'Wrought Iron Bar', qualitySource: 'wrought', loss: .12 },
  carburized: { name: 'Carburized Iron Bar', qualitySource: 'carburized', loss: .09 },
  meteoric: { name: 'Meteoric Iron Bar', qualitySource: 'meteoric', loss: .05 },
  bloomery: { name: 'Bloomery Steel Bar', loss: .12, blood: 0, shock: 0 },
  blister: { name: 'Blister Steel Bar', loss: .09, blood: 1, shock: 2 },
  pattern: { name: 'Pattern-Welded Steel Bar', loss: .07, blood: 2, shock: 3 },
  wootz: { name: 'Wootz Steel Bar', loss: .05, blood: 3, shock: 4 },
  composite: { name: 'Composite Steel Bar', loss: .02, blood: 3, shock: 4, cost: 1 },
};
const SMITH_RECIPES = {
  wrought: { stations: ['bloomery'], inputs: { charcoal: 2, ore: 1 } },
  carburized: { stations: ['bloomery'], inputs: { charcoal: 10, ore: 5 } },
  meteoric: { stations: ['bloomery'], inputs: { charcoal: 20, meteor: 10 } },
  bloomery: { stations: ['bloomery'], inputs: { charcoal: 6, ore: 4 } },
  blister: { stations: ['cementation'], inputs: { charcoal: 8, iron: 2 } },
  pattern: { stations: ['forge', 'welding'], inputs: { charcoal: 10, iron: 2, blister: 2 } },
  wootz: { stations: ['crucible'], inputs: { charcoal: 10, iron: 2, blister: 2 } },
  composite: { stations: ['forge', 'welding'], inputs: { charcoal: 10, iron: 2, blister: 2, wootz: 2 } },
};
const CRAFT_STATIONS = { kit: ['Alchemy kit', 24], bloomery: ['Bloomery furnace', 48], cementation: ['Cementation furnace', 96], crucible: ['Crucible furnace', 144], forge: ['Forge & anvil', 48], welding: ['Welding hearth', 96] };
const DURABILITY_NAMES = ['', 'Broken', 'Critical', 'Heavily Damaged', 'Damaged', 'Knotched', 'Worn', 'Normal', 'Good', 'Excellent', 'Pristine'];

const Crafting = {
  init(character) {
    character.crafting = { alchemy: 1, smithing: 0, stations: [], activeEffects: [], serial: 0, log: [], ...(character.crafting || {}) };
    const s = character.crafting;
    s.alchemy = Math.max(1, Math.min(5, Math.floor(Number(s.alchemy) || 1)));
    s.smithing = Math.max(0, Math.min(9, Math.floor(Number(s.smithing) || 0)));
    s.activeEffects = (s.activeEffects || []).filter(e => e.remaining > 0);
    // Metal weapons are physical instances; stacked purchases must wear independently.
    const extraWeapons=[];
    for(const r of character.inventoryItems) {
      const id=EQUIPMENT_BY_ID[r.id]?.weaponId, base=MELEE_WEAPONS[id];
      if(r.quantity>1&&base?.kind==='melee'&&!['unarmed','club','quarterstaff','shortStaff'].includes(id)) {
        const quantity=r.quantity;r.quantity=1;
        for(let n=1;n<quantity;n++) {
          const instance=`crafted-${++s.serial}`,source=r.baseWeapon||id;
          const copy={...r,id:instance,weaponId:instance,baseWeapon:source,equipped:false,material:r.material||'bloomery',quality:r.quality||'Standard',durability:r.durability??10};
          character.proficiencies[instance]=character.proficiencies[source]||0;extraWeapons.push(copy);
        }
      }
    }
    character.inventoryItems.push(...extraWeapons);
    character.inventoryItems.forEach(r => {
      if (r.baseWeapon) this.registerWeapon(r);
      const weapon = EQUIPMENT_BY_ID[r.id]?.weaponId;
      if (weapon && MELEE_WEAPONS[weapon]?.kind === 'melee' && !['unarmed', 'club', 'quarterstaff', 'shortStaff'].includes(weapon)) {
        r.material ||= 'bloomery'; r.quality ||= 'Standard'; r.durability ??= 10;
      }
    });
    if (character.inventoryItems.some(r => r.equipped && r.durability <= 1)) {
      character.inventoryItems.filter(r => r.durability <= 1).forEach(r => { r.equipped = false; });
      character.primaryWeapon = 'unarmed';
    }
    return s;
  },
  registerWeapon(r) {
    const base = MELEE_WEAPONS[r.baseWeapon];
    if (!base) return;
    const w = { ...base, name: r.name, craftRecordId: r.id };
    for (const improve of r.improvements || []) {
      const fields = improve === 'attack' ? ['attackTarget', 'cutTarget', 'thrustTarget', 'bashTarget'] : improve === 'defense' ? ['defenseTarget'] : ['damageModifier', 'cutDamage', 'thrustDamage', 'bashDamage'];
      fields.forEach(key => { if (Number.isFinite(w[key])) w[key] += improve === 'damage' ? (w[key] < 3 ? 1 : 0) : -1; });
    }
    MELEE_WEAPONS[r.weaponId] = w;
    EQUIPMENT_BY_ID[r.id] = { id: r.id, name: r.name, weaponId: r.weaponId, category: 'Crafted Weapons' };
  },
  count(c, id) { return c.inventoryItems.filter(r => r.id === id).reduce((n,r) => n + r.quantity, 0); },
  add(c, id, name, quantity = 1, extra = {}) {
    const found = c.inventoryItems.find(r => r.id === id);
    if (found) found.quantity += quantity;
    else c.inventoryItems.push({ id, name, quantity, equipped: false, ...extra });
    EQUIPMENT_BY_ID[id] ||= { id, name, category: 'Crafting' };
  },
  consume(c, inputs) {
    if (Object.entries(inputs).some(([id,n]) => this.count(c,id) < n)) throw new Error('Required materials are missing.');
    for (const [id, amount] of Object.entries(inputs)) {
      let left = amount;
      for (const r of c.inventoryItems.filter(r => r.id === id)) { const n = Math.min(left,r.quantity); r.quantity -= n; left -= n; }
    }
    c.inventoryItems = c.inventoryItems.filter(r => r.quantity > 0);
  },
  ready(c, stations = [], effort = false) {
    const s = this.init(c);
    if (c.conditions.dead || c.conditions.coma || c.conditions.unconsciousRounds > 0) throw new Error('You must be conscious to work.');
    if (stations.some(id => !s.stations.includes(id))) throw new Error('Acquire the required station first.');
    if (effort && c.conditions.fatigue >= c.attributes.endurance) throw new Error('Too fatigued to work. Catch your breath in Conditions.');
  },
  roll(c, alchemy = false, random = Math.random) {
    const s = this.init(c), rank = s.smithing;
    const tn = alchemy ? 6 : Math.max(4, 10 - rank);
    const count = c.attributes.wit + (alchemy ? s.alchemy : Math.max(0,rank-6));
    const dice = Array.from({length: count}, () => Math.floor(random()*10)+1);
    return { dice, tn, successes: dice.filter(d => d >= tn).length };
  },
  record(c, text) { c.crafting.log.unshift(text); c.crafting.log = c.crafting.log.slice(0,10); return text; },
  advance(c, skill) {
    this.ready(c);
    const s = c.crafting, max = skill === 'alchemy' ? 5 : 9;
    if (!['alchemy','smithing'].includes(skill) || s[skill] >= max) throw new Error('Highest skill rank already reached.');
    const cost = skill === 'smithing' && s.smithing >= 6 ? s.smithing-3 : 2;
    if (c.spiritualAttributes.reduce((n,a) => n+a.value,0) < cost) throw new Error(`Advancement requires ${cost} SA.`);
    let left = cost;
    // Spend the largest SA balances first, retaining every focus and attribute record.
    [...c.spiritualAttributes].sort((a,b) => b.value-a.value).forEach(a => { const used = Math.min(left,a.value); a.value -= used; left -= used; });
    s[skill]++;
    return this.record(c, `${skill === 'alchemy' ? 'Alchemy' : 'Blacksmithing'} improved. Spent ${cost} SA.`);
  },
  acquire(c, station) {
    this.ready(c);
    if (!CRAFT_STATIONS[station] || c.crafting.stations.includes(station)) throw new Error('Station already available.');
    const [name,cost] = CRAFT_STATIONS[station];
    if (c.wealthTotal < cost) throw new Error(`Requires ${formatCurrency(cost)}.`);
    c.wealthTotal -= cost; c.remainingWealth = formatCurrency(c.wealthTotal); c.crafting.stations.push(station);
    return this.record(c, `${name} established at your workshop.`);
  },
  gather(c, action, random = Math.random) {
    this.ready(c, [], true);
    if (!['forage','mine','wood','charcoal'].includes(action)) throw new Error('Unknown gathering task.');
    if (action === 'charcoal') this.consume(c, {'raw-wood':1});
    c.conditions.fatigue++;
    const roll = random();
    let id, name, n = 1;
    if (action === 'forage') { const ingredient = ALCHEMY_INGREDIENTS[Math.floor(random()*ALCHEMY_INGREDIENTS.length)]; id=ingredient.id; name=ingredient.name; }
    if (action === 'mine') { id=roll >= .95 ? 'raw-meteor' : 'raw-ore'; name=roll >= .95 ? 'Meteoric Iron Ore' : 'Iron Ore'; n=roll < .7 || roll >= .95 ? 1 : roll < .85 ? 2 : 3; }
    if (action === 'wood') { id='raw-wood'; name='Wood'; }
    if (action === 'charcoal') { id='raw-charcoal'; name='Charcoal'; n=roll < .7 ? 1 : roll < .85 ? 2 : 3; }
    this.add(c,id,name,n);
    return this.record(c, `Gathered ${n} × ${name}. +1 Fatigue.`);
  },
  barId(material, source) { return `bar-${material}-${source}`; },
  produce(c, material, iron = 'wrought', random = Math.random) {
    const recipe = SMITH_RECIPES[material];
    if (!recipe || !['wrought','carburized','meteoric'].includes(iron)) throw new Error('Invalid recipe.');
    this.ready(c, recipe.stations, true);
    const source = SMITH_MATERIALS[material].qualitySource || (material === 'bloomery' ? 'wrought' : iron);
    const inputs = {};
    Object.entries(recipe.inputs).forEach(([key,n]) => { inputs[key === 'iron' ? this.barId(iron,iron) : ['charcoal','ore','meteor'].includes(key) ? `raw-${key}` : this.barId(key,source)] = n; });
    this.consume(c, inputs); c.conditions.fatigue++;
    const result = this.roll(c,false,random);
    if (result.successes >= 2) this.add(c,this.barId(material,source),`${SMITH_MATERIALS[material].name} (${source})`,1,{ material, qualitySource:source });
    return this.record(c, `${SMITH_MATERIALS[material].name}: [${result.dice}] vs TN ${result.tn}, ${result.successes} successes. ${result.successes>=2 ? 'One bar produced.' : 'Failed; materials destroyed.'}`);
  },
  forge(c, baseWeapon, bar, choices = ['attack','defense'], random = Math.random) {
    this.ready(c,['forge'],true);
    const base = MELEE_WEAPONS[baseWeapon], stock = c.inventoryItems.find(r => r.id === bar && r.quantity > 0);
    if (!base || base.craftRecordId || base.kind !== 'melee' || ['unarmed','club','quarterstaff','shortStaff'].includes(baseWeapon) || !stock?.material) throw new Error('Select a metal weapon and a carried bar.');
    if (new Set(choices).size !== choices.length || choices.some(x => !['attack','defense','damage'].includes(x))) throw new Error('Choose different improvements.');
    const source = stock.qualitySource, material = stock.material;
    this.consume(c,{[bar]:1}); c.conditions.fatigue++;
    const r = this.roll(c,false,random);
    if (r.successes < 2) return this.record(c, `Forge failed: [${r.dice}] vs TN ${r.tn}. Bar destroyed.`);
    const quality = source === 'meteoric' && r.dice.filter(d=>d>=9).length >= 3 ? 'Superlative' : source === 'carburized' && r.dice.filter(d=>d>=7).length >= 3 ? 'Fine' : 'Standard';
    const id = `crafted-${++c.crafting.serial}`;
    const record = { id, name: `${quality} ${base.name} · ${SMITH_MATERIALS[material].name.replace(' Bar','')}`, quantity:1, baseWeapon, weaponId:id, material, quality, durability:10, improvements:choices.slice(0,quality==='Superlative'?2:quality==='Fine'?1:0), equipped:false };
    c.inventoryItems.push(record); this.registerWeapon(record);
    c.proficiencies[id] = c.proficiencies[baseWeapon] || 0;
    return this.record(c, `Forged ${record.name}: [${r.dice}] vs TN ${r.tn}. ${record.improvements.join(' + ') || 'No quality improvement'}.`);
  },
  repair(c, id, random = Math.random) {
    this.ready(c,['forge'],true);
    const r=c.inventoryItems.find(x=>x.id===id), required={Standard:2,Fine:3,Superlative:4}[r?.quality];
    if (!required || r.durability >= 10 || r.destroyed) throw new Error('Select a damaged weapon that has not been destroyed.');
    c.conditions.fatigue++;
    const roll=this.roll(c,false,random);
    if (roll.successes>=required) r.durability=Math.min(10,r.durability+roll.successes);
    else { r.durability=1; r.equipped=false; if(c.primaryWeapon===(r.weaponId || EQUIPMENT_BY_ID[r.id]?.weaponId)) c.primaryWeapon='unarmed'; r.destroyed=true; }
    return this.record(c, `Repair [${roll.dice}] vs TN ${roll.tn}, needs ${required} successes: ${r.destroyed?'failed; weapon destroyed.':`restored to ${r.durability}/10.`}`);
  },
  candidates(ids) {
    const ingredients = [...new Set(ids)].map(id=>ALCHEMY_INGREDIENTS.find(i=>i.id===id)).filter(Boolean), result=[];
    for (const [rarity,slots] of [['common',1],['uncommon',2],['rare',3]]) {
      const groups = new Map();
      ingredients.forEach(i => { const text=i[rarity]; if(!groups.has(text)) groups.set(text,[]); groups.get(text).push(i.name); });
      groups.forEach((sources,text) => { if(sources.length>=2) result.push({triplet:sources.length>=3,key:`${rarity}:${text}`,rarity,slots,text,sources}); });
    }
    return result;
  },
  enhance(effect, choice = "duration") {
    const enhanced={...effect, baseText:effect.text, duration:2, potency:0};
    if(effect.triplet && choice==="duration" && /for \d+ rounds/.test(effect.text)) {enhanced.duration=4;enhanced.text=effect.text.replace(/for \d+ rounds/,"for 4 rounds");}
    else if(effect.triplet && choice==="potency" && this.canEnhancePotency(effect)) {enhanced.potency=1;enhanced.text=effect.text.replace(/\d+/,n=>String(Number(n)+1));}
    return enhanced;
  },
  canEnhancePotency(effect) {return /\d+/.test(effect.text.split("for ")[0]);},
  amount(c,prefix) {return Math.max(0,...this.effects(c).filter(e=>e.text.startsWith(prefix)).map(e=>Number(e.text.match(/\d+/)?.[0]||0)));},
  delayAmount(c,type) {return Math.max(0,...this.effects(c).filter(e=>e.text.startsWith('delay')&&e.text.includes(type)).map(e=>Number(e.text.match(/\d+/)[0])));},
  formula(ids, keys, skill, enhancements = {}) {
    if (!ids.length || ids.length>5 || new Set(ids).size!==ids.length) return {error:'Choose 1–5 different ingredients.'};
    const candidates=this.candidates(ids), effects=keys.map(k=>candidates.find(e=>e.key===k));
    if (!effects.length || effects.some(e=>!e) || new Set(keys).size!==keys.length) return {error:'Choose available effects.'};
    const slots=effects.reduce((n,e)=>n+e.slots,0), rare=effects.filter(e=>e.rarity==='rare').length, uncommon=effects.filter(e=>e.rarity==='uncommon').length;
    const required=rare ? (uncommon?5:4) : uncommon>1?3:uncommon?2:1;
    if(slots>5) return {error:'Formula exceeds five effect slots.',slots};
    if(skill<required) return {error:`Requires Alchemy ${required}.`,slots};
    return {effects:effects.map(e=>this.enhance(e,enhancements[e.key] || (this.canEnhancePotency(e)&&!e.text.includes("rounds")?"potency":"duration"))),slots,required};
  },
  brew(c,ids,keys,random=Math.random,enhancements={}) {
    this.ready(c,['kit'],true);
    const f=this.formula(ids,keys,c.crafting.alchemy,enhancements);
    if(f.error) throw new Error(f.error);
    this.consume(c,Object.fromEntries(ids.map(id=>[id,1]))); c.conditions.fatigue++;
    const roll=this.roll(c,true,random);
    if(roll.successes>=2) { const id=`potion-${++c.crafting.serial}`; this.add(c,id,`Potion ${c.crafting.serial} · ${f.effects.map(e=>e.rarity).join(' + ')}`,1,{potionEffects:f.effects}); }
    return this.record(c, `Alchemy [${roll.dice}] vs TN 6, ${roll.successes} successes: ${roll.successes>=2?'potion added to Inventory.':'failed; ingredients destroyed.'}`);
  },
  effects(c) { return c?.crafting?.activeEffects || []; },
  has(c,text) { return this.effects(c).some(e=>e.text.includes(text)); },
  // Repeated doses refresh duration; identical effects never stack.
  drink(c,r,target=c) {
    if (!r.potionEffects || r.quantity<1 || target.conditions.dead || target.conditions.coma || target.conditions.unconsciousRounds>0) throw new Error('Cannot drink this potion now.');
    this.init(c);
    for(const effect of r.potionEffects) {
      const text=effect.text;
      if(text.startsWith('remove')) {
        const n=Number(text.match(/\d+/)[0]);
        if(text.includes('wounds')) target.wounds.sort((a,b)=>b.severity-a.severity).splice(0,n);
        else {
          const key=text.includes('blood loss')?'bloodLoss':text.includes('pain')?'pain':text.includes('shock')?'shock':'fatigue';
          if(key==='fatigue') target.conditions.fatigue=Math.max(0,target.conditions.fatigue-n);
          else if(key==='shock') {target.conditions.shock=Math.max(0,target.conditions.shock-n);target.conditions.pendingShock=Math.max(0,(target.conditions.pendingShock||0)-n);}
          else { let left=n; for(const w of [...target.wounds].sort((a,b)=>(b[key]||0)-(a[key]||0))) {const used=Math.min(left,w[key]||0);w[key]-=used;left-=used;} }
        }
      } else {
        const baseText=effect.baseText||text, duration=effect.duration||Number(text.match(/for (\d+) rounds/)?.[1])||2;
        const previous=c.crafting.activeEffects.find(e=>(e.baseText||e.text)===baseText);
        const oldHealth=previous&&text.startsWith('increase health by')?Number(previous.text.match(/\d+/)[0]):0;
        if(previous) {previous.remaining=Math.max(previous.remaining,duration);if((effect.potency||0)>=(previous.potency||0))Object.assign(previous,{text,baseText,potency:effect.potency||0});}
        else c.crafting.activeEffects.push({text,baseText,remaining:duration,potency:effect.potency||0});
        if(text.startsWith('increase health by')) {const nextHealth=Number((previous?.text||text).match(/\d+/)[0]);target.conditions.currentHealth+=nextHealth-oldHealth;target.conditions.maxHealth+=nextHealth-oldHealth;}
      }
    }
    r.quantity--; c.inventoryItems=c.inventoryItems.filter(i=>i.quantity>0);
    return `${r.name} consumed. Temporary effects last their listed combat rounds.`;
  },
  tick(c,target=c) { const s=c.crafting; if(!s)return; s.activeEffects.forEach(e=>{e.remaining--;if(e.remaining<=0&&e.text.startsWith('increase health by')){target.conditions.currentHealth=Math.max(0,target.conditions.currentHealth-Number(e.text.match(/\d+/)[0]));target.conditions.maxHealth=Math.max(1,target.conditions.maxHealth-Number(e.text.match(/\d+/)[0]));}}); s.activeEffects=s.activeEffects.filter(e=>e.remaining>0); },
  recordFor(c,weaponId) { return c?.inventoryItems?.find(r=>(r.weaponId || EQUIPMENT_BY_ID[r.id]?.weaponId)===weaponId && r.quantity>0); },
  wear(b,actor,weaponId,random=Math.random) {
    if(actor!==b.player)return;
    const r=this.recordFor(b.character,weaponId);
    if(!r?.material || r.destroyed)return;
    if(random()<SMITH_MATERIALS[r.material].loss) { r.durability=Math.max(1,r.durability-1);b.addLog(`${r.name}: durability ${r.durability}/10 (${DURABILITY_NAMES[r.durability]}).`); }
    if(r.durability<=1) {
      r.equipped=false; actor.weapon='unarmed'; actor.proficiency=0; b.character.primaryWeapon='unarmed';
      actor.baseMaxPool=b.getPlayerPoolForWeapon('unarmed');
      b.configurePlayerWeapons(b.character); b.weaponSelect.value='unarmed';
      b.addLog('Your weapon is broken. You fight unarmed until it is repaired.','important');
    }
  },
};
