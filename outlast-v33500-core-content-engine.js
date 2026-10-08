/* OUTLAST v3.35.0 — 12 Core Content Engine */
(function(){
'use strict';
const VERSION='3.35.0';
const THEMES=['Ash','Void','Nightfall','Wasteland','Rift','Frost','Storm','Ember','Shadow','Radiant'];
const ROLES=['Breaker','Runner','Hunter','Sentinel','Reaper','Warden','Striker','Caster','Blaster','Stalker'];
const MODIFIERS=['Alpha','Prime','Ascended','Corrupted','Frozen','Burning','Charged','Mythic','Omega','Transcendent'];
const BIOMES=['Ruins','Outpost','Facility','Catacombs','Foundry','Fields','Citadel','Labyrinth','Station','Bunker'];
const BEHAVIORS=['Chaser','Flanker','Ambusher','Splitter','Burrower','Rammer','Sniper','Summoner','Teleporter','Shielded'];
const TIERS=['Common','Uncommon','Rare','Epic','Legendary','Mythic','Omega','Transcendent'];
const REWARDS=['Coins','XP','Forge Core','Relic Dust','Charm Shard','Skin Token','Pet Food','Key'];
const ATTACKS=['Burst','Beam','Spread','Arc','Mine','Wave','Dash','Orbit','Volley','Pulse'];
const PROJECTILES=['round','bolt','shard','orb','disc','needle','ring','flare','blade','beam'];
const MODES=['Standard','Hard','Nightmare','Nightmare+','Omega','Omega+','Endless','Boss Rush','Gauntlet','Event'];
function hash(s){let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function pick(a,s){return a[hash(s)%a.length];}
function make(seed,kind,i){const key=kind+':'+seed+':'+i;return {id:key,name:`${pick(MODIFIERS,key)} ${pick(THEMES,key+'t')} ${pick(ROLES,key+'r')} ${kind} ${String(i+1).padStart(3,'0')}`,theme:pick(THEMES,key+'a'),role:pick(ROLES,key+'b'),modifier:pick(MODIFIERS,key+'c'),biome:pick(BIOMES,key+'d'),tier:pick(TIERS,key+'e'),behavior:pick(BEHAVIORS,key+'f'),reward:pick(REWARDS,key+'g')};}
function build(seed='OUTLAST'){const out={};
out.combat=Array.from({length:120},(_,i)=>{const x=make(seed,'Weapon',i);return Object.assign(x,{projectile:pick(PROJECTILES,x.id+'p'),attack:pick(ATTACKS,x.id+'a'),projectileSpeed:480+(hash(x.id+'s')%420),damage:10+(hash(x.id+'d')%90),pierce:1+(hash(x.id+'pi')%5),bounce:hash(x.id+'b')%4});});
out.enemies=Array.from({length:150},(_,i)=>{const x=make(seed,'Enemy',i);return Object.assign(x,{hp:60+(hash(x.id)%940),speed:.7+(hash(x.id+'s')%130)/100,damage:6+(hash(x.id+'d')%55),behavior:pick(BEHAVIORS,x.id+'bh')});});
out.bosses=Array.from({length:60},(_,i)=>{const x=make(seed,'Boss',i);return Object.assign(x,{phases:2+(hash(x.id)%4),attacks:[pick(ATTACKS,x.id+'1'),pick(ATTACKS,x.id+'2'),pick(ATTACKS,x.id+'3')],hp:5000+(hash(x.id+'hp')%45000),summons:hash(x.id+'su')%5});});
out.world=Array.from({length:40},(_,i)=>{const x=make(seed,'Map',i);return Object.assign(x,{hazard:pick(ATTACKS,x.id+'h'),zones:3+(hash(x.id+'z')%5),objects:10+(hash(x.id+'o')%30)});});
out.events=Array.from({length:50},(_,i)=>{const x=make(seed,'Event',i);return Object.assign(x,{duration:30+(hash(x.id+'t')%330),modifier:pick(MODIFIERS,x.id+'m')});});
out.progression=Array.from({length:120},(_,i)=>Object.assign(make(seed,'Progression',i),{cost:500+i*250,stat:pick(['damage','fireRate','maxHp','speed','magnet','crit','xp','coins','armor','bossDamage'],seed+i+'s')}));
out.cosmetics=Array.from({length:120},(_,i)=>make(seed,'Cosmetic',i));
out.objectives=Array.from({length:120},(_,i)=>Object.assign(make(seed,'Objective',i),{target:10+(hash(seed+i+'q')%490)}));
out.economy={rewards:Array.from({length:80},(_,i)=>Object.assign(make(seed,'Reward',i),{amount:25+(hash(seed+i+'a')%9975)})),tiers:TIERS.slice(),drops:REWARDS.slice()};
out.modes=MODES.map((name,i)=>({id:name.toLowerCase().replace(/[^a-z]+/g,'-'),name,difficulty:1+i*.35,reward:1+i*.2}));
out.support={save:true,leaderboards:true,chat:true,settings:true,tutorial:true,howTo:true,updates:true,version:VERSION};
out.generation={themes:THEMES,roles:ROLES,modifiers:MODIFIERS,biomes:BIOMES,behaviors:BEHAVIORS,tiers:TIERS,rewards:REWARDS,combinations:THEMES.length*ROLES.length*MODIFIERS.length*BIOMES.length*TIERS.length*BEHAVIORS.length*REWARDS.length};
return out;}
function install(){
const seed=String(window.OUTLAST_CONTENT_SEED||'OUTLAST');
if(!window.OUTLAST_CORE_CONTENT||window.OUTLAST_CORE_CONTENT.version!==VERSION)window.OUTLAST_CORE_CONTENT={version:VERSION,seed,data:build(seed)};
window.OUTLAST_CORE_CONTENT.get=function(kind,id){const a=this.data[kind];return Array.isArray(a)?a.find(x=>x.id===id)||null:null;};
window.OUTLAST_CORE_CONTENT.regenerate=function(nextSeed){window.OUTLAST_CONTENT_SEED=String(nextSeed||'OUTLAST');window.OUTLAST_CORE_CONTENT={version:VERSION,seed:window.OUTLAST_CONTENT_SEED,data:build(window.OUTLAST_CONTENT_SEED)};return window.OUTLAST_CORE_CONTENT;};
window.OUTLAST_CORE_CONTENT.audit=function(){const d=this.data;return {version:this.version,combat:d.combat.length,enemies:d.enemies.length,bosses:d.bosses.length,world:d.world.length,events:d.events.length,progression:d.progression.length,cosmetics:d.cosmetics.length,objectives:d.objectives.length,economy:d.economy.rewards.length,modes:d.modes.length,combinationSpace:d.generation.combinations};};
try{
window.OUTLAST_CORE_CONTENT_VERSION=VERSION;
document.querySelectorAll('[data-outlast-version]').forEach(e=>e.textContent='v'+VERSION);
if(Array.isArray(helpArticles)&&!helpArticles.some(x=>x&&x[0]==='What are the 12 Core Systems?'))helpArticles.unshift(['What are the 12 Core Systems?','Core Systems','OUTLAST uses 12 shared systems: Combat, Enemies, Bosses, World, Events, Progression, Cosmetics, Objectives, Economy / Rewards, Game Modes, Support Systems, and Content Generation.']);
if(Array.isArray(updates)&&!updates.some(x=>Array.isArray(x)&&String(x[0]).includes('12 Core Systems')))updates.unshift(['v3.35.0 — 12 Core Systems','Activated the 12-core content architecture across combat, enemies, bosses, world, events, progression, cosmetics, objectives, economy, modes, support, and procedural content generation.']);
}catch(_){}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
setTimeout(install,0);
})();

/* Real player-facing v3.35.0 update popup. */
(function(){
'use strict';
const VERSION='3.35.0',KEY='outlastUpdatePopupV3350',POPUP_ID='outlastV3350UpdatePopup';
function storage(){try{return window.localStorage;}catch(_){return null;}}
function seen(){const s=storage();try{return s?.getItem(KEY)==='1';}catch(_){return false;}}
function markSeen(){const s=storage();try{s?.setItem(KEY,'1');}catch(_){}}
function installPopup(){
 if(document.getElementById(POPUP_ID))return document.getElementById(POPUP_ID);
 const style=document.createElement('style');style.id='outlast-v3350-update-popup-style';
 style.textContent='#'+POPUP_ID+'{position:fixed!important;inset:0!important;display:none;align-items:center!important;justify-content:center!important;padding:18px!important;box-sizing:border-box!important;background:rgba(3,7,12,.86)!important;backdrop-filter:blur(7px)!important;z-index:300000!important;font-family:Arial,sans-serif!important}#'+POPUP_ID+' .v3350-card{width:min(720px,94vw)!important;max-height:86vh!important;overflow:auto!important;background:linear-gradient(145deg,#172534,#0b1219)!important;border:1px solid #4d7595!important;border-radius:24px!important;padding:26px!important;box-sizing:border-box!important;box-shadow:0 30px 100px rgba(0,0,0,.72)!important;color:#fff!important}#'+POPUP_ID+' .v3350-kicker{color:#8ed0ff!important;font-size:12px!important;font-weight:900!important;letter-spacing:.15em!important;text-transform:uppercase!important;margin-bottom:8px!important}#'+POPUP_ID+' h2{font-size:31px!important;margin:0 0 8px!important}#'+POPUP_ID+' p{color:#b9c9d7!important;line-height:1.5!important;margin:8px 0!important}#'+POPUP_ID+' ul{padding-left:22px!important;margin:16px 0!important}#'+POPUP_ID+' li{margin:9px 0!important;color:#dce8f1!important}#'+POPUP_ID+' .v3350-actions{display:flex!important;justify-content:flex-end!important;margin-top:20px!important}#'+POPUP_ID+' button{border:0!important;border-radius:11px!important;padding:12px 20px!important;background:#3da96b!important;color:#fff!important;font:700 16px Arial!important;cursor:pointer!important;box-shadow:0 4px 0 #23673f!important}';
 document.head.appendChild(style);
 const root=document.createElement('div');root.id=POPUP_ID;root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','OUTLAST v3.35.0 update');
 root.innerHTML='<div class="v3350-card"><div class="v3350-kicker">OUTLAST • NEW UPDATE</div><h2>12 Core Content Update</h2><p><b>v3.35.0</b> is now live. New content systems have been added to OUTLAST.</p><ul><li>Expanded combat and weapon content</li><li>More enemies, bosses, world content, and events</li><li>Expanded progression, upgrades, rewards, and objectives</li><li>New modes, modifiers, themes, and gameplay combinations</li><li>Additional support for saves, leaderboards, chat, settings, tutorial, and How To</li></ul><p>This update popup is player-facing only.</p><div class="v3350-actions"><button type="button" id="outlastV3350UpdateGotIt">GOT IT</button></div></div>';
 document.body.appendChild(root);
 const close=()=>{root.style.display='none';markSeen();};
 root.querySelector('#outlastV3350UpdateGotIt')?.addEventListener('click',close);
 root.addEventListener('click',e=>{if(e.target===root)close();});
 root.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close();}});
 return root;
}
function show(force=false){const root=installPopup();if(!root)return false;if(!force&&seen())return false;root.style.display='flex';setTimeout(()=>root.querySelector('#outlastV3350UpdateGotIt')?.focus(),0);return true;}
function autoShow(){if(seen())return;show(false);}
window.OUTLAST_UPDATE_POPUP={version:VERSION,storageKey:KEY,install:installPopup,show,autoShow};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(autoShow,700),{once:true});else setTimeout(autoShow,700);
})();