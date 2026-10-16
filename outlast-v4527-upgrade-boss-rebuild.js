/* OUTLAST v4.5.27 — Rarity Balance + Unique Boss Rotation + Spawn Safety */
(function(){
'use strict';
const VERSION='4.5.27';
const BOSSES=[
 {name:'Grave Titan',emoji:'♜',title:'Shockwave Colossus',hp:1.04,speed:.88,ability:'Ground shockwave'},
 {name:'Plague Doctor',emoji:'☠',title:'Toxic Marksman',hp:.94,speed:1.04,ability:'Three-shot poison volley'},
 {name:'Mutant Brute',emoji:'♟',title:'Ramming Behemoth',hp:1.02,speed:.96,ability:'Heavy charge'},
 {name:'Undead Commander',emoji:'♛',title:'Horde Commander',hp:1.08,speed:.92,ability:'Summons reinforcements'},
 {name:'The Abomination',emoji:'☣',title:'Blight Spreader',hp:1.05,speed:.90,ability:'Lingering poison zone'},
 {name:'Storm Colossus',emoji:'ϟ',title:'Tempest Engine',hp:1.10,speed:.94,ability:'Targeted lightning strike'},
 {name:'Void Tyrant',emoji:'◈',title:'Rift Stalker',hp:1.12,speed:1.12,ability:'Short-range teleport'},
 {name:'Eternal Warden',emoji:'⬡',title:'Aegis Sovereign',hp:1.18,speed:.86,ability:'Timed defensive guard'}
];
const num=v=>Number.isFinite(Number(v))?Number(v):0;
function game(){try{return typeof window.game!=='undefined'&&window.game?window.game:(typeof game!=='undefined'?game:null)}catch(_){return window.game||null}}
function save(){try{return typeof window.save!=='undefined'&&window.save?window.save:(typeof save!=='undefined'?save:null)}catch(_){return window.save||null}}
function activeBoss(g){return Array.isArray(g&&g.enemies)?g.enemies.find(e=>e&&e.boss&&!e.__dead&&num(e.hp)>0):null}
const state={run:null,deck:[],index:0,hadBoss:false,lastDefeatAt:0,lastAttemptAt:0,firstSpawnDone:false,spawns:0,retries:0,lastName:null};
function shuffleDeck(){state.deck=BOSSES.slice();for(let i=state.deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[state.deck[i],state.deck[j]]=[state.deck[j],state.deck[i]]}state.index=0}
function nextProfile(){if(!state.deck.length||state.index>=state.deck.length)shuffleDeck();const p=state.deck[state.index++];state.lastName=p.name;return p}
function tagBoss(g,b){
 if(!g||!b||!b.boss)return null;
 if(b.__outlastUniqueBoss4527)return b;
 const profile=nextProfile();
 let defs={};try{defs=typeof raidBossDefs!=='undefined'?raidBossDefs:(window.raidBossDefs||{})}catch(_){}
 b.raidName=profile.name;b.bossTitle=profile.title;b.bossAbilityLabel=profile.ability;b.bossEmoji=profile.emoji;
 b.__outlastUniqueBoss4527=true;b.__outlastUniqueBossProfile=profile.name;
 b.raidAbilityTimer=1.8+Math.random()*.6;b.raidZoneTick=.65;
 const hpFactor=Math.max(.7,Math.min(1.35,profile.hp));
 if(Number.isFinite(Number(b.hp))&&Number.isFinite(Number(b.max))&&Number(b.max)>0&&!b.__outlastBossProfileHpApplied){
   const oldMax=Number(b.max);b.max=oldMax*hpFactor;b.hp=Math.min(b.max,Number(b.hp)*hpFactor);b.__outlastBossProfileHpApplied=true;
 }
 if(Number.isFinite(Number(b.speed))&&Number(b.speed)>0&&!b.__outlastBossProfileSpeedApplied){b.speed*=profile.speed;b.__outlastBossProfileSpeedApplied=true}
 if(Number.isFinite(Number(b.r))&&Number(b.r)>0)b.r=Math.max(34,Math.min(54,Number(b.r)+(profile.name==='Eternal Warden'?5:profile.name==='Plague Doctor'?-5:0)));
 if(defs[profile.name])g.raidBoss=profile.name;
 state.spawns++;
 window.OUTLAST_LAST_BOSS={name:profile.name,title:profile.title,ability:profile.ability,hp:num(b.hp),max:num(b.max),spawnNumber:state.spawns};
 return b;
}
function ensureBossIdentity(g){const b=activeBoss(g);if(b&&!b.__outlastUniqueBoss4527)tagBoss(g,b);return b}
function canSchedule(g,sv){
 if(!g||!sv||!g.running||g.paused||g.over||!g.player)return false;
 if(sv.mode==='1v1 Arena'||g.practiceMode||sv.practiceMode)return false;
 return true;
}
function tick(){
 const g=game(),sv=save();
 if(!canSchedule(g,sv)){state.run=null;return}
 if(state.run!==g){state.run=g;state.deck=[];state.index=0;state.hadBoss=false;state.lastDefeatAt=0;state.lastAttemptAt=0;state.firstSpawnDone=false;state.retries=0;shuffleDeck()}
 const boss=ensureBossIdentity(g);
 if(boss){state.hadBoss=true;state.firstSpawnDone=true;state.lastDefeatAt=0;return}
 if(state.hadBoss){state.hadBoss=false;state.lastDefeatAt=Date.now();g.bossClock=0;g.bossSpawnRetryTimer=0}
 const elapsed=num(g.time);
 const due=state.firstSpawnDone ? (state.lastDefeatAt>0&&Date.now()-state.lastDefeatAt>=30000) : elapsed>=15;
 if(!due)return;
 const now=Date.now();if(now-state.lastAttemptAt<900)return;state.lastAttemptAt=now;
 let result=false;
 try{if(typeof window.spawnBoss==='function')result=window.spawnBoss()}catch(err){window.OUTLAST_UNIQUE_BOSS_SPAWN_ERROR=String(err&&err.message||err)}
 let after=ensureBossIdentity(g);
 if(!after&&typeof window.OUTLAST_FORCE_BOSS_SPAWN==='function'&&now-state.lastAttemptAt>=0){
   try{result=window.OUTLAST_FORCE_BOSS_SPAWN('v4.5.27-unique-boss-safety-net')}catch(err){window.OUTLAST_UNIQUE_BOSS_FORCE_ERROR=String(err&&err.message||err)}
   after=ensureBossIdentity(g);
 }
 if(after){state.hadBoss=true;state.firstSpawnDone=true;state.lastDefeatAt=0;g.bossClock=0;g.bossSpawnRetryTimer=0}
 else{state.retries++;window.OUTLAST_UNIQUE_BOSS_RETRY_COUNT=state.retries}
}
const oldSpawn=window.spawnBoss;
if(typeof oldSpawn==='function'&&!oldSpawn.__outlastUniqueBoss4527){
 const wrapped=function(){const g=game(),before=new Set(Array.isArray(g&&g.enemies)?g.enemies:[]),result=oldSpawn.apply(this,arguments);if(g&&Array.isArray(g.enemies)){const b=g.enemies.find(e=>e&&e.boss&&!before.has(e)&&num(e.hp)>0);if(b)tagBoss(g,b)}return result};
 wrapped.__outlastUniqueBoss4527=true;window.spawnBoss=wrapped;try{spawnBoss=wrapped}catch(_){}
}
window.OUTLAST_BOSS_UNIQUE_PROFILES=BOSSES.map(x=>({name:x.name,title:x.title,ability:x.ability}));
window.OUTLAST_BOSS_UNIQUE_AUDIT=function(){const g=game(),b=activeBoss(g);return{version:VERSION,ready:true,profiles:BOSSES.length,uniqueNames:new Set(BOSSES.map(x=>x.name)).size,activeBoss:b?b.raidName:null,activeBossHasAbility:!!(b&&b.bossAbilityLabel),spawnCount:state.spawns,retries:state.retries,lastBoss:state.lastName,nextBoss:state.deck[state.index]?.name||null,secondsUntilNext:!state.firstSpawnDone?Math.max(0,15-num(g&&g.time)):state.lastDefeatAt?Math.max(0,30-(Date.now()-state.lastDefeatAt)/1000):0}};
window.OUTLAST_UPGRADE_BALANCE_AUDIT_V4527=function(){
 const tiers=['Common','Uncommon','Rare','Epic','Legendary','Mythic','Divine','Celestial','Transcendent','Eternal','Omega'];
 const expected={Common:1,Uncommon:1.15,Rare:1.35,Epic:1.6,Legendary:1.9,Mythic:2.25,Divine:4,Celestial:5,Transcendent:6,Eternal:7,Omega:8};
 const pools=window.OUTLAST_UPGRADE_RARITY_POOLS||{},by=window.OUTLAST_UPGRADE_RARITY_BY_NAME||{};
 const cards=Array.isArray(window.OUTLAST_UPGRADE_LIBRARY)?window.OUTLAST_UPGRADE_LIBRARY:[];
 return{version:VERSION,tiers:tiers.map(t=>({rarity:t,multiplier:expected[t],poolCount:(pools[t]||[]).length})),strictLadder:tiers.every((t,i)=>!i||expected[t]>expected[tiers[i-1]]),mappedNames:Object.keys(by).length,libraryCards:cards.length,postMythic:[expected.Divine,expected.Celestial,expected.Transcendent,expected.Eternal,expected.Omega]};
};
if(Array.isArray(window.updates)&&!window.updates.some(x=>x&&String(x[0]).startsWith('v4.5.27 — Upgrade & Boss Rebuild')))window.updates.unshift(['v4.5.27 — Upgrade & Boss Rebuild','Rebalanced discrete upgrade steps so each tier climbs more evenly while preserving the approved rarity ladder. Bosses now rotate through eight distinct named fights without repeating until the roster is exhausted, each with its own ability, and a retrying scheduler prevents the next boss from being skipped after a defeat.']);
if(Array.isArray(window.helpArticles)){
 if(!window.helpArticles.some(x=>x&&x[0]==='How do bosses rotate now?'))window.helpArticles.unshift(['How do bosses rotate now?','Bosses & Runs','Boss fights rotate through eight distinct bosses without repeats until the roster is exhausted. Each boss has a unique signature attack. The first boss appears after about 15 seconds; after a boss is defeated, the next is scheduled about 30 seconds later. If a spawn fails, OUTLAST retries instead of leaving the run without a boss.']);
 if(!window.helpArticles.some(x=>x&&x[0]==='How are upgrade rarities balanced?'))window.helpArticles.unshift(['How are upgrade rarities balanced?','Upgrades & Luck','Upgrade effects scale by a single rarity ladder: Common 1×, Uncommon 1.15×, Rare 1.35×, Epic 1.6×, Legendary 1.9×, Mythic 2.25×, Divine 4×, Celestial 5×, Transcendent 6×, Eternal 7×, Omega 8×. Whole-number projectile and pierce bonuses use capped steps to avoid screen-filling projectiles or unlimited pierce.']);
}
setInterval(tick,500);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',tick,{once:true});else tick();
})();