/* OUTLAST v3.37.6 — Map Selection, Interactive Core Browser, HUD Cleanup, Boss Retry */
(function(){
'use strict';
const VERSION='3.37.6';
const esc=v=>String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const CORE=[
 ['combat','⚔ Combat','Weapons, projectiles, damage, critical hits and upgrade choices'],
 ['enemies','☠ Enemies','Enemy definitions, traits, drops and zombie behaviors'],
 ['bosses','♛ Bosses','Boss variants, phases, gates, rewards and spawn status'],
 ['world','🌎 World & Maps','Map selection, obstacles, hazards, zones and custom maps'],
 ['events','⚡ Events','Run events, world events and event modifiers'],
 ['progression','★ Progression','Permanent upgrades, skill trees, prestige and battle pass'],
 ['cosmetics','✦ Cosmetics','Characters, skins, pets, relics, charms and titles'],
 ['objectives','🎯 Objectives','Missions, quests, achievements and milestones'],
 ['economy','🪙 Economy','Coins, keys, shop offers, crafting and rewards'],
 ['modes','🎲 Game Modes','Classic, Endless, Speed Run, Boss Rush, Global and Arena'],
 ['support','🛠 Support','How-To, settings, saves, feedback and runtime recovery'],
 ['generation','🧬 Content Generation','Themes, roles, modifiers, biomes, rarity tiers and combinations']
];
const CORE_ACTIONS={
 combat:[['Open Weapon Evolutions','weaponTreeBtn'],['Open Upgrade Rarities','raritiesBtn'],['Open Weapon List','weaponBtn']],
 enemies:[['Open Zombie Codex','codexBtn']],
 bosses:[['Open Boss List','worldBossBtn']],
 world:[['Choose Map','mapBtn'],['World Zones','world2Btn']],
 events:[['Build a Run','runBuilderBtn'],['Challenge Modes','challengeModeBtn']],
 progression:[['Progression','progressionBtn'],['Upgrade Tree','upgradeBtn'],['Prestige','prestigeBtn'],['Battle Pass','battlePassBtn']],
 cosmetics:[['Characters','charBtn'],['Skins','skinBtn'],['Pets','petBtn'],['Relics','relicBtn'],['Charms','charmBtn']],
 objectives:[['Missions','missionBtn'],['Achievements','achBtn'],['Challenges','challengeBtn'],['Records','recordsBtn']],
 economy:[['Shop','shopBtn'],['Inventory','inventoryBtn'],['Forge','forgeBtn'],['Crafting','craftBtn'],['Daily Reward','dailyBtn']],
 modes:[['Choose Game Mode','modeBtn'],['Build a Run','runBuilderBtn'],['Challenge Modes','challengeModeBtn']],
 support:[['How-To','helpBtn'],['Settings','settingsNewBtn'],['Update Log','updatesBtn']],
 generation:[['Zombie Codex','codexBtn'],['Weapon Evolutions','weaponTreeBtn'],['Choose Map','mapBtn']]
};
function selectMapChoice(key){
 try{window.OUTLAST_REGISTER_CUSTOM_MAPS?.()}catch(_){}
 key=String(key||'');
 if(!key)return;
 const isCustom=key.startsWith('CustomMap:');
 if(!(typeof mapDefs!=='undefined'&&mapDefs[key])){
  try{toast('That map is not available yet. Reopen Choose Map and try again.')}catch(_){}
  return;
 }
 if(isCustom&&!(Array.isArray(save.customMaps)&&save.customMaps.some(cm=>'CustomMap:'+String(cm.id)===key))){
  try{toast('That saved custom map is missing.')}catch(_){}
  return;
 }
 save.map=key;
 try{persist()}catch(_){}
 try{closeSub()}catch(_){}
 const cm=isCustom?(save.customMaps||[]).find(item=>'CustomMap:'+String(item.id)===key):null;
 try{toast('🗺️ Map selected: '+(cm?.name||key.replace(/^CustomMap:/,'')))}catch(_){}
}
function bindMapSelector(){
 const mapBtn=document.getElementById('mapBtn');
 const legacy=window.openMapSelector;
 if(typeof legacy==='function'&&!legacy.__outlastMapPickerWrapped376){
  const wrapper=function(){
   try{window.OUTLAST_REGISTER_CUSTOM_MAPS?.()}catch(_){}
   legacy.apply(this,arguments);
  };
  wrapper.__outlastMapPickerWrapped376=true;
  window.openMapSelector=wrapper;
  if(mapBtn)mapBtn.onclick=wrapper;
 }
}
function coreItems(section){
 const root=window.OUTLAST_CORE_CONTENT;
 const data=root&&root.data;
 if(!data)return [];
 let items=data[section];
 if(section==='economy')items=data.economy&&data.economy.rewards;
 if(section==='support')items=Object.entries(data.support||{}).map(([name,active])=>({name,active}));
 if(section==='generation'&&items&&typeof items==='object'&&!Array.isArray(items)){
  return [
   {name:'Themes',detail:(items.themes||[]).join(' • '),count:(items.themes||[]).length},
   {name:'Combat roles',detail:(items.roles||[]).join(' • '),count:(items.roles||[]).length},
   {name:'Modifiers',detail:(items.modifiers||[]).join(' • '),count:(items.modifiers||[]).length},
   {name:'Biomes',detail:(items.biomes||[]).join(' • '),count:(items.biomes||[]).length},
   {name:'Enemy behaviors',detail:(items.behaviors||[]).join(' • '),count:(items.behaviors||[]).length},
   {name:'Rarity tiers',detail:(items.tiers||[]).join(' • '),count:(items.tiers||[]).length},
   {name:'Reward types',detail:(items.rewards||[]).join(' • '),count:(items.rewards||[]).length},
   {name:'Combination space',detail:'Themes × roles × modifiers × biomes × tiers × behaviors × rewards',count:Number(items.combinations)||0}
  ];
 }
 if(section==='support'&&items&&typeof items==='object'&&!Array.isArray(items))return Object.entries(items).map(([name,active])=>({name,active}));
 return Array.isArray(items)?items:[];
}
function coreDetail(section,item){
 const show=(label,value)=>value==null||value===''?null:label+' '+(Array.isArray(value)?value.join('/'):String(value));
 const fields={
  combat:['tier','projectile','attack','damage','pierce','bounce'],
  enemies:['tier','behavior','hp','speed','damage','biome'],
  bosses:['tier','phases','attacks','hp','summons','biome'],
  world:['biome','hazard','zones','objects','theme'],
  events:['theme','modifier','duration','biome'],
  progression:['tier','stat','cost','theme'],
  cosmetics:['tier','theme','role','modifier','biome'],
  objectives:['tier','biome','target','reward','modifier'],
  economy:['tier','reward','amount','theme'],
  modes:['difficulty','reward','name'],
  support:['active','name'],
  generation:['count','detail']
 }[section]||['tier','theme','role','reward'];
 return fields.map(k=>show(k[0].toUpperCase()+k.slice(1),item?.[k])).filter(Boolean).join(' • ')||'Available in the active game systems.';
}
function openCoreSection(section){
 const entry=CORE.find(x=>x[0]===section);if(!entry)return openCoreHub();
 const items=coreItems(section);
 const actions=(CORE_ACTIONS[section]||[]).map(([label,id])=>'<button type="button" class="gold" data-outlast-core-action="'+esc(id)+'">'+esc(label)+'</button>').join('');
 const rows=items.slice(0,36).map((item,i)=>'<article class="outlast376-core-entry"><b>'+esc(item.name||item.id||('Entry '+(i+1)))+'</b><small>'+esc(coreDetail(section,item))+'</small></article>').join('');
 const summary='<div class="outlast376-core-summary"><b>'+esc(entry[1])+' • INTERACTIVE</b><small>'+esc(entry[2])+'</small><strong>'+items.length.toLocaleString()+' registry entries</strong></div>';
 const body=summary+'<div class="outlast376-core-actions">'+actions+'</div><div class="outlast376-core-list">'+(rows||'<article class="outlast376-core-entry"><b>Live game system</b><small>The live runtime owns this feature. Use the actions above to open it.</small></article>')+'</div><button type="button" data-outlast-core-back class="menu-btn">← Back to 12 Core Systems</button>';
 try{openSub('🧩 CORE • '+entry[1],body)}catch(_){}
}
function openCoreHub(){
 try{save.records=save.records||{};save.records.coreSystemsOpened=(Number(save.records.coreSystemsOpened)||0)+1;persist()}catch(_){}
 const audit=window.OUTLAST_CORE_CONTENT?.audit?.()||{};
 const buttons=CORE.map(([key,title,desc])=>{
  const raw=coreItems(key),count=raw.length||Number(audit[key])||0;
  return '<button type="button" class="outlast376-core-btn" data-outlast-core-section="'+key+'"><b>'+title+'</b><small>'+desc+'</small><strong>'+count.toLocaleString()+' entries · OPEN →</strong></button>';
 }).join('');
 try{openSub('🧩 12 CORE SYSTEMS','<div class="outlast376-core-summary"><b>Choose a system to inspect its data and open its live gameplay feature.</b><small>The sections below are clickable, and each one includes links to the actual game screens.</small></div><div class="outlast376-core-grid">'+buttons+'</div>')}catch(_){}
}
function runCoreAction(id){
 const btn=document.getElementById(String(id||''));
 if(!btn)return;
 try{closeSub()}catch(_){}
 try{btn.click()}catch(_){}
}
function installCoreLauncher(){
 const page=document.querySelector('[data-page-content="progress"]');
 if(page&&!document.getElementById('outlast376CoreLauncher')){
  const card=document.createElement('section');card.id='outlast376CoreLauncher';card.className='outlast376-launch-card';
  card.innerHTML='<div><b>🧩 12 Core Systems</b><small>Browse live combat, enemies, bosses, maps, progression and more.</small></div><button type="button" class="gold" data-outlast-core-open>OPEN CORE SYSTEMS</button>';
  const sub=page.querySelector('.menu-page-sub');
  if(sub)sub.insertAdjacentElement('afterend',card);else page.prepend(card);
 }
 const more=document.querySelector('[data-page-content="more"]');
 if(more&&!document.getElementById('outlast376CoreLauncherMore')){
  const card=document.createElement('section');card.id='outlast376CoreLauncherMore';card.className='outlast376-launch-card';
  card.innerHTML='<div><b>🧩 12 Core Systems</b><small>Open the interactive systems browser.</small></div><button type="button" class="gold" data-outlast-core-open>OPEN CORE SYSTEMS</button>';
  const grid=more.querySelector('.menu-cards');
  if(grid)grid.prepend(card);else more.prepend(card);
 }
}
function cleanUi(){
 ['outlastChatToggle','outlastChat','menuChatBtn','exitGameBtn'].forEach(id=>document.getElementById(id)?.remove());
 document.querySelectorAll('.next-update-poll,#nextUpdatePollForm').forEach(el=>el.remove());
 const style=document.createElement('style');style.id='outlast-v3376-interaction-cleanup-css';
 style.textContent='#outlastChatToggle,#outlastChat,#menuChatBtn,#exitGameBtn,.next-update-poll,#nextUpdatePollForm{display:none!important}#outlast376CoreLauncher,#outlast376CoreLauncherMore{margin:12px 0;padding:14px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;border:1px solid #31516a;border-radius:15px;background:linear-gradient(135deg,#132432,#0b1219);color:#fff}#outlast376CoreLauncher small,#outlast376CoreLauncherMore small{display:block;color:#a8bdcb;margin-top:4px;line-height:1.4}.outlast376-core-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:12px 0}.outlast376-core-btn{min-height:110px;text-align:left;display:flex;flex-direction:column;gap:8px;padding:12px;border:1px solid #34526a;border-radius:14px;background:#101f2b;color:#fff;cursor:pointer}.outlast376-core-btn b{font-size:14px}.outlast376-core-btn small,.outlast376-core-entry small{display:block;color:#a7bac7;line-height:1.4}.outlast376-core-btn strong{margin-top:auto;color:#9bd3ff;font-size:11px}.outlast376-core-summary{display:grid;gap:6px;padding:13px;border:1px solid #34516a;border-radius:13px;background:#11202a;margin-bottom:12px}.outlast376-core-summary small{color:#abc0ce;line-height:1.45}.outlast376-core-summary strong{font-size:12px;color:#9bd3ff}.outlast376-core-actions{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}.outlast376-core-list{display:grid;gap:7px;margin:10px 0}.outlast376-core-entry{padding:10px 12px;border:1px solid #263e50;border-radius:10px;background:#0b151d;color:#fff}.outlast376-core-entry small{margin-top:5px}@media(max-width:680px){.outlast376-core-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:420px){.outlast376-core-grid{grid-template-columns:1fr}}';
 document.head.appendChild(style);
}
function installReleaseText(){
 try{
  if(Array.isArray(updates)&&!updates.some(x=>Array.isArray(x)&&String(x[0]).includes('v3.37.6')))updates.unshift(['v3.37.6 — Maps, Core Controls & Boss Timer Fix','Restored direct map selection for built-in and saved custom maps, made the 12 Core Systems browser interactive with links to live features, fixed stale boss cleanup and synchronized the countdown to scheduled spawns, and removed the chat/poll/exit-button clutter.']);
  if(Array.isArray(helpArticles)&&!helpArticles.some(x=>Array.isArray(x)&&String(x[0]).includes('How do I select the newer maps?')))helpArticles.unshift(['How do I select the newer maps?','Maps','Open Play → Choose Map. All registered built-in maps appear in the picker, and saved custom maps appear in their own section. Select a map once; OUTLAST saves it and uses it for the next run.']);
  if(Array.isArray(helpArticles)&&!helpArticles.some(x=>Array.isArray(x)&&String(x[0]).includes('How do I interact with the 12 Core Systems?')))helpArticles.unshift(['How do I interact with the 12 Core Systems?','Core Systems','Open Progress → 12 Core Systems. Select any of the 12 categories to inspect its registry, then use the action buttons to open the corresponding live game screen. The Core Systems button is also available in More.']);
  if(Array.isArray(helpArticles)&&!helpArticles.some(x=>Array.isArray(x)&&String(x[0]).includes('Why did the boss timer reach zero without a boss?')))helpArticles.unshift(['Why did the boss timer reach zero without a boss?','Bosses & Runs','The countdown now matches the spawn scheduler: the first boss is scheduled after about 20 seconds, then another is scheduled after the active boss is defeated and the next interval passes. The HUD says BOSS ACTIVE while a boss is alive and BOSS INCOMING when its timer is due.']);
  if(Array.isArray(helpArticles)&&!helpArticles.some(x=>Array.isArray(x)&&String(x[0]).includes('How do I pause and leave a run?')))helpArticles.unshift(['How do I pause and leave a run?','Controls','Press Esc during a run to open Pause, then choose Return to Menu. The separate on-screen Exit Game button has been removed from the playfield.']);
 }catch(_){}
}
function install(){
 if(window.__OUTLAST_INTERACTION_FIXES376)return;
 window.__OUTLAST_INTERACTION_FIXES376=true;
 window.OUTLAST_BUILD=VERSION;window.OUTLAST_VERSION='v'+VERSION;document.title='OUTLAST v'+VERSION;
 document.querySelectorAll('[data-outlast-version]').forEach(el=>el.textContent='v'+VERSION);
 const chip=document.querySelector('#menu .menu-chip');if(chip)chip.textContent='v'+VERSION+' • SURVIVOR HUB';
 const meta=document.querySelector('meta[name="outlast-build"]');if(meta)meta.content=VERSION;
 const buildMeta=document.querySelector('meta[name="build-version"]');if(buildMeta)buildMeta.content=VERSION;
 cleanUi();installCoreLauncher();installReleaseText();bindMapSelector();
 window.renderCoreSystems=openCoreHub;window.OUTLAST_OPEN_CORE_SYSTEMS=openCoreHub;window.OUTLAST_OPEN_CORE_SECTION=openCoreSection;
 window.selectMap=selectMapChoice;
 document.addEventListener('click',function(e){
  const target=e.target;
  const coreOpen=target.closest?.('[data-outlast-core-open]');
  if(coreOpen){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openCoreHub();return;}
  const coreSection=target.closest?.('[data-outlast-core-section]');
  if(coreSection){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openCoreSection(coreSection.dataset.outlastCoreSection);return;}
  const coreBack=target.closest?.('[data-outlast-core-back]');
  if(coreBack){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openCoreHub();return;}
  const coreAction=target.closest?.('[data-outlast-core-action]');
  if(coreAction){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();runCoreAction(coreAction.dataset.outlastCoreAction);return;}
  const mapButton=target.closest?.('button[data-mc-map],button[data-mc-custom],button[data-action="map"][data-value]');
  if(mapButton){
   const key=mapButton.dataset.mcCustom?'CustomMap:'+mapButton.dataset.mcCustom:(mapButton.dataset.mcMap||mapButton.dataset.value);
   if(key){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();selectMapChoice(key);}
  }
 },true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();