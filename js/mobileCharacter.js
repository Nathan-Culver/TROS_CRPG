/* Native section navigation and compact mobile cards reuse the character sheet. */
(() => {
  const row=document.createElement('label');row.className='mobile-sheet-navigation';row.append('Section');
  const select=document.createElement('select');select.id='mobile-sheet-section';select.setAttribute('aria-label','Character menu section');row.append(select);
  gameUI.sheetTabs.before(row);
  select.addEventListener('change',()=>gameUI.selectSheetTab(select.value));
  const compact=matchMedia('(max-width:760px), (any-pointer:coarse), (max-height:560px)');
  const choice=(parent,label,options,value,action)=>{
    const wrap=document.createElement('label');wrap.className='mobile-sheet-navigation mobile-craft-choice';wrap.append(label);const input=document.createElement('select');input.setAttribute('aria-label',label);for(const [id,name] of options){const option=document.createElement('option');option.value=id;option.textContent=name;input.append(option);}input.value=options.some(([id])=>id===value)?value:options[0][0];input.addEventListener('change',()=>action(input.value));wrap.append(input);parent.prepend(wrap);return input;
  };
  const craftLayout=()=>{
    if(!compact.matches)return;
    const section=gameUI.sheetContent.querySelector('.crafting-section');if(!section)return;
    const nav=section.querySelector('.craft-subtabs'),page=gameUI.craftPage||'alchemy';
    const navigation=document.createElement('div');navigation.className='mobile-craft-navigation';section.prepend(navigation);
    choice(navigation,'Craft',['alchemy','smithing','supplies'].map(id=>[id,id==='alchemy'?'Alchemy':id==='smithing'?'Blacksmithing':'World & Supplies']),page,id=>{gameUI.craftPage=id;gameUI.renderCharacterSheet();});nav.hidden=true;
    section.querySelector('h2').hidden=true;
    const toolbar=section.querySelector('.craft-toolbar');
    if(toolbar?.querySelector('strong')){const details=document.createElement('details');details.className='mobile-craft-skill';const summary=document.createElement('summary');summary.textContent=toolbar.querySelector('strong').textContent+' · Advance';details.append(summary);toolbar.before(details);details.append(toolbar);}
    const notice=section.querySelector('.inventory-notice');if(notice?.textContent==='Choose a craft below.')notice.hidden=true;
    // Put lengthy instructions behind a disclosure while preserving notices and skill totals.
    const instructions=document.createElement('details');instructions.className='mobile-craft-instructions';const title=document.createElement('summary');title.textContent='Crafting instructions';instructions.append(title);
    for(const paragraph of [...section.querySelectorAll('p.craft-help')])if(!paragraph.textContent.startsWith('Active potions:')&&!paragraph.closest('.brew-preview'))instructions.append(paragraph);
    section.querySelector('h2').after(instructions);
    if(page==='alchemy'){
      const layout=section.querySelector('.brew-layout'),shelf=section.querySelector('.ingredient-shelf'),preview=section.querySelector('.brew-preview');
      const example=section.querySelector('.craft-history');
      const apply=step=>{gameUI.mobileAlchemyStep=step;shelf.hidden=step!=='ingredients';preview.hidden=step!=='potion';if(example)example.hidden=step!=='ingredients';};
      const stepSelect=choice(layout,'Brewing step',[['ingredients','Ingredients'],['potion',`Potion (${gameUI.brewIngredients?.length||0}/5 ingredients)`]],gameUI.mobileAlchemyStep||'ingredients',apply);navigation.append(stepSelect.parentElement);apply(gameUI.mobileAlchemyStep||'ingredients');
      const next=document.createElement('button');next.type='button';next.className='mobile-brew-next';next.textContent='Review potion effects';next.addEventListener('click',()=>{gameUI.mobileAlchemyStep='potion';gameUI.renderCharacterSheet();});shelf.append(next);
      layout.classList.add('mobile-brew-layout');
    }else if(page==='smithing'){
      const grid=section.querySelector('.smith-layout'),[refine,forge]=grid.children,repair=document.createElement('article');repair.className='craft-card';
      const repairHeading=[...forge.querySelectorAll('h3')].find(h=>h.textContent.includes('Repair'));for(let node=repairHeading;node;){const next=node.nextSibling;repair.append(node);node=next;}grid.append(repair);
      const stock=[...section.querySelectorAll('.craft-card')].find(card=>card.querySelector('h3')?.textContent==='Material stock');
      const tasks=[['refine','Refine metal',refine],['forge','Forge weapon',forge],['repair','Repair & equip',repair],['stock','Materials',stock]];
      const apply=task=>{gameUI.mobileSmithTask=task;for(const[id,,panel]of tasks)if(panel)panel.hidden=id!==task;};
      const taskSelect=choice(grid,'Smithing task',tasks.map(([id,name])=>[id,name]),gameUI.mobileSmithTask||'refine',apply);navigation.append(taskSelect.parentElement);apply(gameUI.mobileSmithTask||'refine');grid.classList.add('mobile-smith-layout');forge.classList.add('mobile-forge-form');
      const recipes=[...refine.querySelectorAll('.recipe-row')],updateRecipe=id=>{gameUI.mobileMetalRecipe=id;recipes.forEach((row,index)=>row.hidden=String(index)!==id);};
      choice(refine,'Metal recipe',recipes.map((row,index)=>[String(index),row.querySelector('strong').textContent]),gameUI.mobileMetalRecipe||'0',updateRecipe);updateRecipe(gameUI.mobileMetalRecipe||'0');
    }
    const body=nav.nextElementSibling,sidebar=document.createElement('div');sidebar.className='mobile-craft-sidebar';
    sidebar.append(navigation,instructions);const skill=section.querySelector('.mobile-craft-skill');if(skill)sidebar.append(skill);
    if(page==='alchemy'){const recipes=section.querySelector('.craft-history');if(recipes)sidebar.append(recipes);}
    body.classList.add('mobile-craft-body');section.prepend(sidebar);
  };
  const sync=()=>{
    const saves=['browserSaves','exportSaves'].includes(gameUI.activeSheetTab);
    const current=select.value,options=[...gameUI.sheetTabs.querySelectorAll('[data-sheet-tab]')].filter(tab=>!saves||['browserSaves','exportSaves'].includes(tab.dataset.sheetTab));
    const signature=options.map(tab=>tab.dataset.sheetTab).join(',');
    if(select.dataset.options!==signature){select.replaceChildren(...options.map(tab=>{const option=document.createElement('option');option.value=tab.dataset.sheetTab;option.textContent=tab.textContent;return option;}));select.dataset.options=signature;}
    select.value=gameUI.activeSheetTab||current;
    document.body.classList.toggle('touch-overlay',touchViewport.matches&&['menu','world'].includes(gameUI.mode));
  };
  const originalRender=GameUI.prototype.renderCharacterSheet;
  GameUI.prototype.renderCharacterSheet=function(...args){const result=originalRender.apply(this,args);craftLayout();sync();return result;};
  const originalSelect=GameUI.prototype.selectSheetTab;
  GameUI.prototype.selectSheetTab=function(...args){const result=originalSelect.apply(this,args);sync();return result;};
  new MutationObserver(sync).observe(gameUI.characterMenu,{attributes:true,attributeFilter:['hidden']});
  new MutationObserver(sync).observe(document.body,{childList:true});
  touchViewport.addEventListener('change',sync);compact.addEventListener('change',()=>{if(gameUI.mode==='menu')gameUI.renderCharacterSheet();});sync();
})();
