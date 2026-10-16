/* OUTLAST v4.5.28 — Unique Boss Combat + Enforced Intermission */
(function(){
'use strict';
const VERSION='4.5.28';
const BOSS_INTERMISSION_MS=30000;
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

function runUniqueBossAbility(g,b){
 const p=g&&g.player;if(!g||!b||!p)return;
 const profile=BOSSES.find(x=>x.name===b.raidName);if(!profile)return;
 const now=Date.now();
 if(!Number.isFinite(b.__uniqueAbilityAt))b.__uniqueAbilityAt=now+3200;
 if(now<b.__uniqueAbilityAt)return;
 const distance=Math.hypot(p.x-b.x,p.y-b.y);
 const damage=(amount,label)=>{try{if(typeof outlastTakePlayerDamage==='function')outlastTakePlayerDamage(p,amount,label);else p.hp=Math.max(0,p.hp-amount)}catch(_){p.hp=Math.max(0,p.hp-amount)}};
 const fx=(x,y,r,color,t=.65)=>{if(Array.isArray(g.effects))g.effects.push({x,y,r,color,t});};
 const setNext=(ms)=>{b.__uniqueAbilityAt=now+ms;};
 const aimShot=(x,y,damageAmount,speed=320,r=8)=>{const dx=p.x-x,dy=p.y-y,d=Math.hypot(dx,dy)||1;if(Array.isArray(g.bullets)&&g.bullets.length<160)g.bullets.push({enemy:true,x,y,vx:dx/d*speed,vy:dy/d*speed,r,dmg:damageAmount});};
 switch(profile.name){
  case 'Grave Titan': {
   fx(b.x,b.y,155,'#f3c969',.8);fx(b.x,b.y,95,'#f3c969',.55);
   if(distance<155)damage(Math.max(8,Number(b.damage||24)*.52),'Grave Titan shockwave');
   if(typeof burst==='function')burst(b.x,b.y,'#f3c969',16,105);
   setNext(5200);break;
  }
  case 'Plague Doctor': {
   for(let i=-1;i<=1;i++){const dx=p.x-b.x,dy=p.y-b.y,base=Math.atan2(dy,dx)+i*.19;if(Array.isArray(g.bullets)&&g.bullets.length<157)g.bullets.push({enemy:true,x:b.x,y:b.y,vx:Math.cos(base)*365,vy:Math.sin(base)*365,r:8,dmg:Math.max(5,Number(b.damage||20)*.34),poison:true});}
   fx(b.x,b.y,45,'#a5e65b',.5);setNext(4400);break;
  }
  case 'Mutant Brute': {
   const dx=p.x-b.x,dy=p.y-b.y,d=Math.hypot(dx,dy)||1,step=Math.min(125,Math.max(45,d-40));
   const nx=Math.max(30,Math.min(typeof W==='number'?W-30:2000,b.x+dx/d*step));
   const ny=Math.max(30,Math.min(typeof H==='number'?H-30,b.y+dy/d*step));
   fx(b.x,b.y,70,'#ff8b4a',.35);
   try{if(typeof tryMoveEntity==='function')tryMoveEntity(b,nx,ny);else{b.x=nx;b.y=ny}}catch(_){b.x=nx;b.y=ny}
   if(Math.hypot(p.x-b.x,p.y-b.y)<Number(p.r||18)+Number(b.r||42)+22)damage(Math.max(9,Number(b.damage||25)*.58),'Mutant Brute charge');
   if(typeof burst==='function')burst(b.x,b.y,'#ff8b4a',12,125);
   setNext(4800);break;
  }
  case 'Undead Commander': {
   if(typeof spawnEnemy==='function'){
    for(let i=0;i<3;i++){const angle=(Math.PI*2*i/3)+Math.random()*.25;const before=g.enemies.length;try{spawnEnemy(i===0?'elite':(i===1?'runner':'ranged'))}catch(_){}
     const m=g.enemies[before];if(m&&!m.boss){m.x=Math.max(25,Math.min(typeof W==='number'?W-25:2000,b.x+Math.cos(angle)*70));m.y=Math.max(25,Math.min(typeof H==='number'?H-25,b.y+Math.sin(angle)*70));m.summoned=true;m.__bossCommanderMinion=true;}
    }
   }
   fx(b.x,b.y,100,'#c6a2ff',.55);setNext(8500);break;
  }
  case 'The Abomination': {
   if(!Array.isArray(g.__outlastPoisonZones))g.__outlastPoisonZones=[];
   g.__outlastPoisonZones.push({x:p.x,y:p.y,r:82,until:now+4200,nextDamage:now+900});
   fx(p.x,p.y,82,'#78d94f',.9);if(typeof burst==='function')burst(p.x,p.y,'#78d94f',10,70);
   setNext(7600);break;
  }
  case 'Storm Colossus': {
   const tx=p.x,ty=p.y;fx(tx,ty,76,'#65d8ff',1.05);
   if(!Array.isArray(g.__outlastLightningStrikes))g.__outlastLightningStrikes=[];
   g.__outlastLightningStrikes.push({x:tx,y:ty,at:now+950,r:76,damage:Math.max(8,Number(b.damage||24)*.72)});
   setNext(5700);break;
  }
  case 'Void Tyrant': {
   const ang=Math.atan2(p.y-b.y,p.x-b.x)+Math.PI,dist=175;
   const nx=Math.max(35,Math.min(typeof W==='number'?W-35:2000,p.x+Math.cos(ang)*dist));
   const ny=Math.max(35,Math.min(typeof H==='number'?H-35,p.y+Math.sin(ang)*dist));
   fx(b.x,b.y,60,'#a86bff',.35);b.x=nx;b.y=ny;fx(b.x,b.y,72,'#a86bff',.55);
   if(typeof burst==='function')burst(b.x,b.y,'#a86bff',14,100);
   setNext(6200);break;
  }
  case 'Eternal Warden': {
   b.__wardenShieldUntil=now+2400;
   b.hp=Math.min(Number(b.max)||b.hp,Number(b.hp)+Math.max(1,(Number(b.max)||0)*.045));
   b.__wardenShieldFxUntil=now+2400;fx(b.x,b.y,Number(b.r||42)+25,'#8ee7ff',.8);
   if(typeof ring==='function')ring(b.x,b.y,'#8ee7ff',Number(b.r||42)+24,.8);
   setNext(7200);break;
  }
 }
}
function processUniqueBossHazards(g){
 const p=g&&g.player;if(!g||!p)return;const now=Date.now();
 if(Array.isArray(g.__outlastPoisonZones)){
  g.__outlastPoisonZones=g.__outlastPoisonZones.filter(z=>z&&z.until>now);
  for(const z of g.__outlastPoisonZones){if(now>=z.nextDamage){z.nextDamage=now+900;if(Math.hypot(p.x-z.x,p.y-z.y)<z.r)try{if(typeof outlastTakePlayerDamage==='function')outlastTakePlayerDamage(p,Math.max(3,Number(g.enemies.find(e=>e&&e.boss&&e.raidName==='The Abomination')?.damage||18)*.16),'Abomination poison zone')}catch(_){}}}
 }
 if(Array.isArray(g.__outlastLightningStrikes)){
  const pending=[];for(const z of g.__outlastLightningStrikes){if(!z||z.at>now){if(z)pending.push(z);continue;}fxLightning(g,z);if(Math.hypot(p.x-z.x,p.y-z.y)<z.r)try{if(typeof outlastTakePlayerDamage==='function')outlastTakePlayerDamage(p,z.damage,'Storm Colossus lightning')}catch(_){}}
  g.__outlastLightningStrikes=pending;
 }
 const boss=activeBoss(g);if(boss&&boss.raidName==='Eternal Warden'&&Number(boss.__wardenShieldUntil)>now){
  boss.__wardenShieldTick=Number(boss.__wardenShieldTick)||now;
  if(now-boss.__wardenShieldTick>700){boss.__wardenShieldTick=now;boss.hp=Math.min(Number(boss.max)||boss.hp,Number(boss.hp)+Math.max(1,(Number(boss.max)||0)*.012));}
 }
}
function fxLightning(g,z){try{if(Array.isArray(g.effects))g.effects.push({x:z.x,y:z.y,r:z.r,color:'#6bdfff',t:.7});if(typeof burst==='function')burst(z.x,z.y,'#6bdfff',20,150)}catch(_){}}

function tick(){
 const g=game(),sv=save();
 if(!canSchedule(g,sv)){if(!g||!g.running||g.over||sv?.mode==='1v1 Arena'||g.practiceMode||sv?.practiceMode)state.run=null;return}
 if(state.run!==g){state.run=g;state.deck=[];state.index=0;state.hadBoss=false;state.lastDefeatAt=0;state.lastAttemptAt=0;state.firstSpawnDone=false;state.retries=0;shuffleDeck()}
 const boss=ensureBossIdentity(g);
 processUniqueBossHazards(g);
 if(boss){runUniqueBossAbility(g,boss);state.hadBoss=true;state.firstSpawnDone=true;state.lastDefeatAt=0;return}
 if(state.hadBoss){state.hadBoss=false;state.lastDefeatAt=Date.now();g.bossClock=0;g.bossSpawnRetryTimer=0}
 const elapsed=num(g.time);
 const due=state.firstSpawnDone ? (state.lastDefeatAt>0&&Date.now()-state.lastDefeatAt>=BOSS_INTERMISSION_MS) : elapsed>=15;
 if(!due)return;
 const now=Date.now();if(now-state.lastAttemptAt<900)return;state.lastAttemptAt=now;
 let result=false;
 try{if(typeof window.spawnBoss==='function')result=window.spawnBoss()}catch(err){window.OUTLAST_UNIQUE_BOSS_SPAWN_ERROR=String(err&&err.message||err)}
 let after=ensureBossIdentity(g);
 if(!after&&typeof window.OUTLAST_FORCE_BOSS_SPAWN==='function'&&now-state.lastAttemptAt>=0){
   try{result=window.OUTLAST_FORCE_BOSS_SPAWN('v4.5.28-unique-boss-safety-net')}catch(err){window.OUTLAST_UNIQUE_BOSS_FORCE_ERROR=String(err&&err.message||err)}
   after=ensureBossIdentity(g);
 }
 if(after){state.hadBoss=true;state.firstSpawnDone=true;state.lastDefeatAt=0;g.bossClock=0;g.bossSpawnRetryTimer=0}
 else{state.retries++;window.OUTLAST_UNIQUE_BOSS_RETRY_COUNT=state.retries}
}
const oldSpawn=window.spawnBoss;
if(typeof oldSpawn==='function'&&!oldSpawn.__outlastUniqueBoss4527){
 const wrapped=function(){const g=game();if(g&&state.run===g&&state.firstSpawnDone&&state.lastDefeatAt>0&&Date.now()-state.lastDefeatAt<BOSS_INTERMISSION_MS)return false;const before=new Set(Array.isArray(g&&g.enemies)?g.enemies:[]),result=oldSpawn.apply(this,arguments);if(g&&Array.isArray(g.enemies)){const b=g.enemies.find(e=>e&&e.boss&&!before.has(e)&&num(e.hp)>0);if(b)tagBoss(g,b)}return result};
 wrapped.__outlastUniqueBoss4527=true;window.spawnBoss=wrapped;try{spawnBoss=wrapped}catch(_){}
}
window.OUTLAST_BOSS_UNIQUE_PROFILES=BOSSES.map(x=>({name:x.name,title:x.title,ability:x.ability}));
window.OUTLAST_BOSS_UNIQUE_AUDIT=function(){const g=game(),b=activeBoss(g);return{version:VERSION,ready:true,profiles:BOSSES.length,uniqueNames:new Set(BOSSES.map(x=>x.name)).size,activeBoss:b?b.raidName:null,activeBossHasAbility:!!(b&&b.bossAbilityLabel),spawnCount:state.spawns,retries:state.retries,lastBoss:state.lastName,nextBoss:state.deck[state.index]?.name||null,secondsUntilNext:!state.firstSpawnDone?Math.max(0,15-num(g&&g.time)):state.lastDefeatAt?Math.max(0,BOSS_INTERMISSION_MS/1000-(Date.now()-state.lastDefeatAt)/1000):0,intermissionMs:BOSS_INTERMISSION_MS,uniqueAbilityReady:!!(b&&BOSSES.some(x=>x.name===b.raidName))}};
window.OUTLAST_UPGRADE_BALANCE_AUDIT_V4527=function(){
 const tiers=['Common','Uncommon','Rare','Epic','Legendary','Mythic','Divine','Celestial','Transcendent','Eternal','Omega'];
 const expected={Common:1,Uncommon:1.15,Rare:1.35,Epic:1.6,Legendary:1.9,Mythic:2.25,Divine:4,Celestial:5,Transcendent:6,Eternal:7,Omega:8};
 const pools=window.OUTLAST_UPGRADE_RARITY_POOLS||{},by=window.OUTLAST_UPGRADE_RARITY_BY_NAME||{};
 const cards=Array.isArray(window.OUTLAST_UPGRADE_LIBRARY)?window.OUTLAST_UPGRADE_LIBRARY:[];
 return{version:VERSION,tiers:tiers.map(t=>({rarity:t,multiplier:expected[t],poolCount:(pools[t]||[]).length})),strictLadder:tiers.every((t,i)=>!i||expected[t]>expected[tiers[i-1]]),mappedNames:Object.keys(by).length,libraryCards:cards.length,postMythic:[expected.Divine,expected.Celestial,expected.Transcendent,expected.Eternal,expected.Omega]};
};
if(Array.isArray(window.updates)&&!window.updates.some(x=>x&&String(x[0]).startsWith('v4.5.28 — Unique Boss Combat')))window.updates.unshift(['v4.5.27 — Upgrade & Boss Rebuild','Rebalanced capped upgrade steps and gave all eight rotating bosses distinct combat abilities. A hard 30-second intermission blocks the normal scheduler from starting the next boss early; failed spawns are retried.']);
if(Array.isArray(window.helpArticles)){
 if(!window.helpArticles.some(x=>x&&x[0]==='How do bosses rotate now?'))window.helpArticles.unshift(['How do bosses rotate now?','Bosses & Runs','Boss fights rotate through eight distinct bosses without repeats until the roster is exhausted. Each boss has a unique signature attack. The first boss appears after about 15 seconds; after a boss is defeated, the next is scheduled about 30 seconds later. If a spawn fails, OUTLAST retries instead of leaving the run without a boss.']);
 if(!window.helpArticles.some(x=>x&&x[0]==='How are upgrade rarities balanced?'))window.helpArticles.unshift(['How are upgrade rarities balanced?','Upgrades & Luck','Upgrade effects scale by a single rarity ladder: Common 1×, Uncommon 1.15×, Rare 1.35×, Epic 1.6×, Legendary 1.9×, Mythic 2.25×, Divine 4×, Celestial 5×, Transcendent 6×, Eternal 7×, Omega 8×. Whole-number projectile and pierce bonuses use capped steps to avoid screen-filling projectiles or unlimited pierce.']);
}
setInterval(tick,500);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',tick,{once:true});else tick();
})();