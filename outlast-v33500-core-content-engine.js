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
document.title='OUTLAST v'+VERSION;window.OUTLAST_BUILD=VERSION;window.OUTLAST_VERSION='v'+VERSION;
document.querySelectorAll('[data-outlast-version]').forEach(e=>e.textContent='v'+VERSION);
if(Array.isArray(helpArticles)&&!helpArticles.some(x=>x&&x[0]==='What are the 12 Core Systems?'))helpArticles.unshift(['What are the 12 Core Systems?','Core Systems','OUTLAST uses 12 shared systems: Combat, Enemies, Bosses, World, Events, Progression, Cosmetics, Objectives, Economy / Rewards, Game Modes, Support Systems, and Content Generation.']);
if(Array.isArray(updates)&&!updates.some(x=>Array.isArray(x)&&String(x[0]).includes('12 Core Systems')))updates.unshift(['v3.35.0 — 12 Core Systems','Activated the 12-core content architecture across combat, enemies, bosses, world, events, progression, cosmetics, objectives, economy, modes, support, and procedural content generation.']);
}catch(_){}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
setTimeout(install,0);
})();