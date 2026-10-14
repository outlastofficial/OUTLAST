/* OUTLAST v4.4.1 — Skills, Rarity, Balance and UI Reliability */
(function(){
'use strict';
const VERSION='4.4.1';
const TIERS=['Common','Uncommon','Rare','Epic','Legendary','Mythic','Divine','Celestial','Transcendent','Eternal','Omega'];
const MULT={Common:1,Uncommon:1.15,Rare:1.35,Epic:1.6,Legendary:1.9,Mythic:2.25,Divine:4,Celestial:5,Transcendent:6,Eternal:7,Omega:8};
const WEIGHTS={Common:52,Uncommon:25,Rare:13,Epic:6.5,Legendary:2.5,Mythic:.5,Divine:.22,Celestial:.12,Transcendent:.065,Eternal:.035,Omega:.018};
const COLORS={Common:'#a4b2bf',Uncommon:'#65df92',Rare:'#6bcaff',Epic:'#c49aff',Legendary:'#ffdb72',Mythic:'#ff7cdd',Divine:'#fff0a8',Celestial:'#86efff',Transcendent:'#b3a2ff',Eternal:'#ffd2ef',Omega:'#ff9f6d'};
const $=s=>document.querySelector(s);
const num=v=>Number.isFinite(Number(v))?Number(v):0;
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function currentGame(){try{return typeof game!=='undefined'&&game?game:(window.game||null)}catch(_){return window.game||null}}
function currentSave(){try{return typeof save!=='undefined'&&save?save:(window.save||null)}catch(_){return window.save||null}}
function currentPlayer(){const g=currentGame();return g&&g.player?g.player:null}
function say(m){try{if(typeof window.toast==='function')window.toast(m)}catch(_){}}
function tierFromName(name){
 const s=String(name||'');
 const a=s.match(/\[(Common|Uncommon|Rare|Epic|Legendary|Mythic|Divine|Celestial|Transcendent|Eternal|Omega)\]\s*$/);
 if(a)return a[1];
 const b=s.match(/^(Common|Uncommon|Rare|Epic|Legendary|Mythic|Divine|Celestial|Transcendent|Eternal|Omega)\s+/);
 return b?b[1]:'';
}
function modifiers(){try{return typeof runModifiers!=='undefined'?runModifiers:(window.runModifiers||{})}catch(_){return window.runModifiers||{}}}
function selectedModifiers(){
 const s=currentSave(),defs=modifiers();if(!s)return [];
 return [s.selectedModifier].concat(Array.isArray(s.builderMods)?s.builderMods:[]).filter((name,i,arr)=>name&&name!=='None'&&arr.indexOf(name)===i&&defs[name]).map(name=>defs[name]);
}
function product(list,key){return list.reduce((acc,m)=>acc*(Number(m[key])||1),1)}

function installRarity(){
 let defs={};
 try{defs=typeof upgradeRarities!=='undefined'?upgradeRarities:(window.upgradeRarities||{})}catch(_){defs=window.upgradeRarities||{}}
 TIERS.forEach(t=>{
  defs[t]=Object.assign({},defs[t]||{},{mult:MULT[t],label:t.toUpperCase(),glow:COLORS[t]});
  try{if(typeof rarityTiers!=='undefined'&&rarityTiers[t]){rarityTiers[t].power=MULT[t];rarityTiers[t].color=COLORS[t]}}catch(_){}
 });
 window.upgradeRarities=defs;
 const pools=window.OUTLAST_UPGRADE_RARITY_POOLS||(window.OUTLAST_UPGRADE_RARITY_POOLS={});
 const byName=window.OUTLAST_UPGRADE_RARITY_BY_NAME||(window.OUTLAST_UPGRADE_RARITY_BY_NAME={});
 TIERS.forEach(t=>{
  if(!Array.isArray(pools[t]))pools[t]=[];
  pools[t].forEach(name=>{if(!byName[name])byName[name]=t});
 });
 const src=typeof tempUp!=='undefined'&&Array.isArray(tempUp)?tempUp:[];
 src.forEach(item=>{
  if(!item||!item[0])return;
  const name=String(item[0]),tier=byName[name]||tierFromName(name)||'Common';
  byName[name]=MULT[tier]?tier:'Common';
  if(!pools[byName[name]].includes(name))pools[byName[name]].push(name);
 });
 TIERS.forEach(t=>{pools[t]=Array.from(new Set(pools[t])).filter(name=>byName[name]===t)});
 window.OUTLAST_UPGRADE_RARITY_SCALING=MULT;
 window.OUTLAST_UPGRADE_RARITY_SCALING_V441=MULT;
 window.OUTLAST_RARITY_AUDIT_V441=function(){
  return {version:VERSION,tiers:TIERS.slice(),multipliers:TIERS.map(t=>MULT[t]),strict:TIERS.every((t,i)=>!i||MULT[t]>MULT[TIERS[i-1]]),allWeightsPositive:TIERS.every(t=>WEIGHTS[t]>0),poolCounts:Object.fromEntries(TIERS.map(t=>[t,(pools[t]||[]).length])),mapped:src.filter(x=>x&&byName[x[0]]).length,unmapped:src.filter(x=>x&&!byName[x[0]]).map(x=>x[0])};
 };
 window.rollUpgradeRarity=function(){
  const p=currentPlayer(),luck=Math.min(.8,Math.max(0,num(p&&p.upgradeLuck))/100),w={};
  TIERS.forEach((t,i)=>{
   let lift=1;
   if(i===0)lift=1-luck*.65;
   else if(i===1)lift=1-luck*.45;
   else lift=1+luck*(i<5?.65+i*.18:1.1+(i-4)*.92);
   w[t]=Math.max(.0001,WEIGHTS[t]*lift);
  });
  let roll=Math.random()*Object.values(w).reduce((a,b)=>a+b,0);
  for(const t of TIERS){roll-=w[t];if(roll<=0)return t}
  return 'Common';
 };
 try{rollUpgradeRarity=window.rollUpgradeRarity}catch(_){}
}
function installModifierDefs(){
 const m=modifiers();if(!m)return;
 Object.assign(m,{
  FastBosses:{desc:'Bosses arrive 35% sooner. 2.2× rewards.',spawn:1,reward:2.2,enemy:1,bossEveryMult:.65},
  EliteSurge:{desc:'Elite appearances are doubled. 2.1× rewards.',spawn:.95,reward:2.1,enemy:1.1,eliteChanceMult:2},
  EnemyRage:{desc:'Enemies have 20% more HP and deal 45% more damage. 2× rewards.',spawn:1,reward:2,enemy:1.2,enemyDamageMult:1.45},
  FragileArmor:{desc:'Take 25% more damage. 1.9× rewards.',spawn:1,reward:1.9,enemy:1,damageTakenMult:1.25},
  GlassLife:{desc:'Take 50% more damage. 2.5× rewards.',spawn:1,reward:2.5,enemy:1,damageTakenMult:1.5},
  BossArmor:{desc:'Bosses have 15% more HP and take 30% less damage. 2.3× rewards.',spawn:1,reward:2.3,enemy:1,bossHpMult:1.15,bossDamageTakenMult:.7},
  SupplyShortage:{desc:'Power-up drops are cut in half. 2× rewards.',spawn:1,reward:2,enemy:1,supplyDropMult:.5},
  TreasureHunt:{desc:'Improved coin and power-up drops. 1.8× rewards.',spawn:.9,reward:1.8,enemy:1,treasure:true,treasureDropMult:1.35,coinMult:1.15},
  TinyEnemies:{desc:'Enemies are smaller and deal less damage. 1.5× rewards.',spawn:.85,reward:1.5,enemy:.9,enemyDamageMult:.9,enemySizeMult:.72},
  BloodMoon:{desc:'Bosses arrive sooner; enemies are tougher. 1.5× rewards.',spawn:.8,reward:1.5,enemy:1.2,bossEveryMult:.8},
  EliteWorld:{desc:'Elite appearances are greatly increased. 2.6× rewards.',spawn:.9,reward:2.6,enemy:1.18,eliteChanceMult:2.4},
  Starving:{desc:'Coin rewards are reduced by 40%. 2.1× rewards.',spawn:1,reward:2.1,enemy:1,coinMult:.6},
  NoHealing:{desc:'Healing from regeneration and pickups is disabled. 2.4× rewards.',spawn:1,reward:2.4,enemy:1,noHealing:true},
  NoPowerups:{desc:'Power-up drops are disabled. 2.2× rewards.',spawn:1,reward:2.2,enemy:1,noPowerups:true},
  FragileBuild:{desc:'Maximum HP is reduced by 25%. 2× rewards.',spawn:1,reward:2,enemy:1,playerHpMult:.75}
 });
 window.runModifiers=m;
 window.OUTLAST_MODIFIER_EFFECTS_V441=true;
}
function prepareRunEffects(){
 const g=currentGame(),s=currentSave(),p=g&&g.player;
 if(!g||!p||!g.running||p.__outlastV441Prepared)return;
 const chosen=selectedModifiers(),tree=s&&s.skillTree||{},startMax=Math.max(1,num(p.max));
 const field=Math.max(0,Math.min(5,Math.floor(num(tree.fieldTraining))));
 p.max=startMax*(1+.05*field);
 p.hp=Math.min(p.max,num(p.hp)+(p.max-startMax));
 p.activeSkill=(s&&s.activeSkill)||p.activeSkill||'Nova';
 p.coinMult=(Number(p.coinMult)||1)*product(chosen,'coinMult')*(1+.04*Math.max(0,num(tree.scavenger)));
 p.damageTakenMult=(Number(p.damageTakenMult)||1)*product(chosen,'damageTakenMult');
 chosen.forEach(m=>{if(num(m.armorMult)>0&&num(m.armorMult)<1)p.damageTakenMult*=1/num(m.armorMult)});
 p.xpBonus=(Number(p.xpBonus)||1)*(1+.04*Math.max(0,num(tree.xpResearch)));
 p.petPower=(Number(p.petPower)||1)*(1+.05*Math.max(0,num(tree.petBond)));
 if(s&&s.challengeMode==='GlassCannon'){p.max*=.55;p.hp=Math.min(p.hp,p.max)}
 if(chosen.some(m=>m.treasure)){
  p.treasure=true;
  p.treasureDropMultiplier=(Number(p.treasureDropMultiplier)||1)*product(chosen.filter(m=>m.treasure),'treasureDropMult');
 }
 g.enemyDamageMult=product(chosen,'enemyDamageMult')*product(chosen,'enemyDamage');
 g.bossDamageTakenMult=product(chosen,'bossDamageTakenMult');
 g.bossHpMult=product(chosen,'bossHpMult');
 g.bossIntervalMult=product(chosen,'bossEveryMult')*(s&&s.mode==='Boss Rush'?.75:1);
 if(s&&s.challengeMode==='BossGauntlet')g.bossIntervalMult*=1.125;
 g.eliteChanceMult=product(chosen,'eliteChanceMult');
 chosen.forEach(m=>{if(num(m.eliteChance)>0)g.eliteChanceMult*=num(m.eliteChance)>1?num(m.eliteChance):1+num(m.eliteChance)});
 g.supplyDropMult=product(chosen,'supplyDropMult');
 chosen.forEach(m=>{if(num(m.supplyPenalty)>0)g.supplyDropMult*=Math.min(1,num(m.supplyPenalty))});
 g.enemySizeMult=product(chosen,'enemySizeMult');
 g.noHealing=chosen.some(m=>m.noHealing);
 g.noPowerups=chosen.some(m=>m.noPowerups);
 g.aiAggressive=g.aiAggressive||chosen.some(m=>m.aiAggressive);
 g.zombieSpeedMult=product(chosen,'zombieSpeedMult');
 // startGame applies playerHpMult already, so it is intentionally not applied twice here.
 p.__outlastV441Prepared=true;
 window.OUTLAST_RUN_EFFECTS_AUDIT_V441={modifierCount:chosen.length,damageTakenMult:p.damageTakenMult,enemyDamageMult:g.enemyDamageMult,bossDamageTakenMult:g.bossDamageTakenMult,bossHpMult:g.bossHpMult,bossIntervalMult:g.bossIntervalMult,eliteChanceMult:g.eliteChanceMult,supplyDropMult:g.supplyDropMult};
}
function installCombat(){
 let old=window.update;
 if(typeof old==='function'&&!old.__outlastV441Update){
  const originalUpdate=old;
  const wrap=function(dt){
   const g=currentGame();prepareRunEffects();
   if(g&&g.running&&Array.isArray(g.enemies)&&!g.enemies.some(e=>e&&e.boss&&!e.__dead&&num(e.hp)>0)){
    const interval=Math.max(.2,num(g.bossIntervalMult)||1);
    if(interval<1)g.bossClock=num(g.bossClock)+num(dt)*(1/interval-1);
   }
   const p=g&&g.player,hp=p?num(p.hp):0,result=originalUpdate.apply(this,arguments);
   if(g&&p&&g.player===p&&g.noHealing&&num(p.hp)>hp)p.hp=hp;
   return result;
  };
  wrap.__outlastV441Update=true;window.update=wrap;try{update=wrap}catch(_){}
 }
 old=window.outlastTakePlayerDamage;
 if(typeof old==='function'&&!old.__outlastV441Incoming){
  const originalHit=old;
  const wrap=function(p,amount,reason,minHp){const g=currentGame();let d=num(amount);if(g&&p===g.player)d*=Math.max(0,num(g.enemyDamageMult)||1);return originalHit.call(this,p,d,reason,minHp)};
  wrap.__outlastV441Incoming=true;window.outlastTakePlayerDamage=wrap;try{outlastTakePlayerDamage=wrap}catch(_){}
 }
 old=window.damageEnemy;
 if(typeof old==='function'&&!old.__outlastV441Damage){
  const originalDamage=old;
  const wrap=function(e,amount){const g=currentGame(),p=g&&g.player;let d=num(amount);if(e&&e.boss&&g){d*=Math.max(0,num(g.bossDamageTakenMult)||1);if(e.raidName==='Eternal Warden'&&num(e.guardTimer)>0)d*=.45}if(p&&num(p.armorPierce)>0)d*=1+Math.min(.75,num(p.armorPierce));return originalDamage.call(this,e,d)};
  wrap.__outlastV441Damage=true;window.damageEnemy=wrap;try{damageEnemy=wrap}catch(_){}
 }
 old=window.spawnEnemy;
 if(typeof old==='function'&&!old.__outlastV441Spawn){
  const original=old,wrap=function(type){
   const g=currentGame(),before=g&&Array.isArray(g.enemies)?g.enemies.length:0,result=original.apply(this,arguments);
   const resizeFrom=start=>{if(!g||!Array.isArray(g.enemies))return;for(let i=start;i<g.enemies.length;i++){const e=g.enemies[i];if(e&&!e.__outlastV441Size&&num(g.enemySizeMult)>0&&num(g.enemySizeMult)!==1){e.r=Math.max(5,num(e.r)*g.enemySizeMult);e.__outlastV441Size=true}}};
   resizeFrom(before);
   if(g&&g.running&&!type&&num(g.level)>=12&&num(g.eliteChanceMult)>1&&Math.random()<Math.min(.19,Math.max(0,num(g.level)-10)*.01)*Math.min(3,num(g.eliteChanceMult)-1)){const start=g.enemies.length;original.call(this,'elite');resizeFrom(start)}
   return result;
  };
  wrap.__outlastV441Spawn=true;window.spawnEnemy=wrap;try{spawnEnemy=wrap}catch(_){}
 }
 old=window.killEnemy;
 if(typeof old==='function'&&!old.__outlastV441Supply){
  const original=old,wrap=function(){const g=currentGame(),before=g&&Array.isArray(g.powerups)?g.powerups.length:0,result=original.apply(this,arguments);if(g&&Array.isArray(g.powerups)&&num(g.supplyDropMult)<1){for(let i=g.powerups.length-1;i>=before;i--)if(Math.random()>Math.max(0,num(g.supplyDropMult)))g.powerups.splice(i,1)}return result};
  wrap.__outlastV441Supply=true;window.killEnemy=wrap;try{killEnemy=wrap}catch(_){}
 }
 old=window.spawnBoss;
 if(typeof old==='function'&&!old.__outlastV441Boss){
  const original=old,wrap=function(){
   const g=currentGame(),before=new Set(g&&Array.isArray(g.enemies)?g.enemies:[]),result=original.apply(this,arguments);
   if(!g||!Array.isArray(g.enemies))return result;
   const boss=g.enemies.find(e=>e&&e.boss&&!before.has(e)&&!e.__outlastV441Boss);
   if(boss){
    boss.damage=num(boss.damage)/Math.max(.01,num(g.player&&g.player.bossMult)||1);
    const hpMult=Math.max(1,num(g.bossHpMult)||1);boss.max=num(boss.max||boss.hp)*hpMult;boss.hp=num(boss.hp)*hpMult;
    let defs={},names=[];
    try{defs=typeof raidBossDefs!=='undefined'?raidBossDefs:{};names=typeof worldBosses!=='undefined'?worldBosses:[]}catch(_){}
    const valid=names.filter(name=>defs[name]);
    boss.raidName=(g.raidBoss&&defs[g.raidBoss])?g.raidBoss:(valid.length?valid[Math.floor(Math.random()*valid.length)]:'Grave Titan');
    boss.raidAbilityTimer=2.8;boss.raidZoneTick=.7;boss.__outlastV441Boss=true;
    window.OUTLAST_LAST_BOSS={name:boss.raidName,hp:num(boss.hp),max:num(boss.max),damage:num(boss.damage)};
   }
   return result;
  };
  wrap.__outlastV441Boss=true;window.spawnBoss=wrap;try{spawnBoss=wrap}catch(_){}
 }
 old=window.specialEnemyTick;
 if(typeof old==='function'&&!old.__outlastV441Raid){
  const original=old,wrap=function(dt){
   const g=currentGame(),p=g&&g.player;if(p&&num(p.__outlastTimeStopUntil)>Date.now())return;
   const result=original.apply(this,arguments);if(!g||!g.running||!p||!Array.isArray(g.enemies))return result;
   for(const e of g.enemies){
    if(!e||!e.boss||!e.raidName||e.__dead)continue;
    if(num(e.guardTimer)>0)e.guardTimer=Math.max(0,num(e.guardTimer)-num(dt));
    if(e.raidName==='The Abomination'&&e.raidZone&&Date.now()<num(e.raidZone.until)){
     e.raidZoneTick=num(e.raidZoneTick)-num(dt);
     if(e.raidZoneTick<=0){if(Math.hypot(p.x-e.raidZone.x,p.y-e.raidZone.y)<125&&typeof window.outlastTakePlayerDamage==='function')window.outlastTakePlayerDamage(p,8,'Abomination poison zone',1);e.raidZoneTick=.7}
    }else if(e.raidZone&&Date.now()>=num(e.raidZone.until))e.raidZone=null;
    e.raidAbilityTimer=num(e.raidAbilityTimer||1)-num(dt);
    if(e.raidName==='Eternal Warden'&&e.raidAbilityTimer<=0){e.guardTimer=1.8;e.raidAbilityTimer=7.5;if(window.ring)window.ring(e.x,e.y,'#d7d0ff',160,.55);continue}
    if(e.raidAbilityTimer>0)continue;
    const dist=Math.hypot(p.x-e.x,p.y-e.y);
    if(e.raidName==='Grave Titan'){if(window.ring)window.ring(e.x,e.y,'#d6aa65',190,.55);if(dist<190&&window.outlastTakePlayerDamage)window.outlastTakePlayerDamage(p,24,'Grave Titan shockwave',1);e.raidAbilityTimer=4.6}
    else if(e.raidName==='Plague Doctor'){const a=Math.atan2(p.y-e.y,p.x-e.x);for(let j=-1;j<=1;j++)g.bullets.push({enemy:true,x:e.x,y:e.y,vx:Math.cos(a+j*.22)*255,vy:Math.sin(a+j*.22)*255,r:8,dmg:18,acid:true,poison:true});e.raidAbilityTimer=4.2}
    else if(e.raidName==='Mutant Brute'){const dx=p.x-e.x,dy=p.y-e.y,l=Math.hypot(dx,dy)||1,ww=typeof W!=='undefined'?W:4000,hh=typeof H!=='undefined'?H:3000,x=Math.max(40,Math.min(ww-40,e.x+dx/l*115)),y=Math.max(40,Math.min(hh-40,e.y+dy/l*115));if(typeof blocked!=='function'||!blocked(x,y,45)){e.x=x;e.y=y}if(Math.hypot(p.x-e.x,p.y-e.y)<110&&window.outlastTakePlayerDamage)window.outlastTakePlayerDamage(p,30,'Mutant Brute charge',1);e.raidAbilityTimer=5.2}
    else if(e.raidName==='Undead Commander'){if(window.spawnEnemy){window.spawnEnemy('fast');window.spawnEnemy('normal')}e.raidAbilityTimer=7.2}
    else if(e.raidName==='The Abomination'){e.raidZone={x:p.x,y:p.y,until:Date.now()+2500};e.raidZoneTick=.7;if(window.ring)window.ring(p.x,p.y,'#83d16c',125,1);e.raidAbilityTimer=6}
    else if(e.raidName==='Storm Colossus'){const x=p.x+(Math.random()-.5)*280,y=p.y+(Math.random()-.5)*280;if(window.ring)window.ring(x,y,'#8be7ff',85,.65);if(Math.hypot(p.x-x,p.y-y)<85&&window.outlastTakePlayerDamage)window.outlastTakePlayerDamage(p,28,'Storm Colossus lightning',1);e.raidAbilityTimer=4.4}
    else if(e.raidName==='Void Tyrant'){const a=Math.random()*Math.PI*2,x=p.x+Math.cos(a)*150,y=p.y+Math.sin(a)*150;if(typeof blocked!=='function'||!blocked(x,y,45)){e.x=x;e.y=y}if(window.ring)window.ring(e.x,e.y,'#bd91ff',105,.5);e.raidAbilityTimer=5.1}
   }
   return result;
  };
  wrap.__outlastV441Raid=true;window.specialEnemyTick=wrap;try{specialEnemyTick=wrap}catch(_){}
 }
 old=window.zombieAI37;
 if(typeof old==='function'&&!old.__outlastV441Freeze){const original=old,wrap=function(e,p,dt){if(p&&num(p.__outlastTimeStopUntil)>Date.now())return{x:num(e&&e.x),y:num(e&&e.y),behavior:'Time Stopped'};return original.apply(this,arguments)};wrap.__outlastV441Freeze=true;window.zombieAI37=wrap;try{zombieAI37=wrap}catch(_){}}
 window.OUTLAST_COMBAT_HOOKS_V441={ready:true,modifierEffects:true,armorPierce:true,bossDamageNormalized:true,raidAbilities:true,timeStop:true};
}
function selectSkill(name,options){
 const s=currentSave(),g=currentGame();let defs;
 try{defs=typeof activeSkills!=='undefined'?activeSkills:window.activeSkills}catch(_){defs=window.activeSkills}
 if(!s||!defs||!defs[name]){say('That skill is unavailable.');return false}
 s.ownedSkills=Object.assign({Nova:true},s.ownedSkills||{});const def=defs[name];
 if(!s.ownedSkills[name]){const cost=Math.max(0,num(def.cost));if(num(s.coins)<cost){say('Need '+cost.toLocaleString()+' coins to unlock '+name+'.');return false}s.coins=Math.max(0,num(s.coins)-cost);s.ownedSkills[name]=true}
 s.activeSkill=name;if(g&&g.player)g.player.activeSkill=name;
 try{if(typeof persist==='function')persist()}catch(_){}try{if(typeof updateMenuSummary==='function')updateMenuSummary()}catch(_){}
 if(!(options&&options.silent))say(name+' equipped — press Q during a run.');
 window.OUTLAST_ACTIVE_SKILL_SELECTION_V441={name:name,owned:true,runUpdated:!!(g&&g.player&&g.player.activeSkill===name),time:Date.now()};
 if(typeof window.renderSkills==='function'&&!(options&&options.skipRender)){try{window.renderSkills()}catch(_){}}
 return true;
}
function renderSkills(){
 const s=currentSave();let defs;
 try{defs=typeof activeSkills!=='undefined'?activeSkills:window.activeSkills}catch(_){defs=window.activeSkills}
 if(!s||!defs){say('Skills are still loading. Reopen this menu.');return}
 const cards=Object.entries(defs).map(([name,d])=>{
  const owned=!!(s.ownedSkills&&s.ownedSkills[name]),equipped=s.activeSkill===name,icon=({Nova:'✴',Blink:'➤',Fortify:'⬡',TimeStop:'❄',Meteor:'☄'})[name]||'✦';
  const state=equipped?'EQUIPPED':owned?'OWNED • EQUIP':'UNLOCK • '+num(d.cost).toLocaleString()+' COINS';
  return '<button type="button" class="option outlast-v441-skill-card '+(equipped?'selected':'')+'" data-action="skill" data-value="'+esc(name)+'"><span class="outlast-v441-skill-icon">'+icon+'</span><span class="outlast-v441-skill-copy"><b>'+esc(name)+'</b><span>'+esc(d.desc||'Active ability')+'</span><small>Cooldown '+num(d.cool)+'s • '+(owned?'Unlocked':'Cost '+num(d.cost).toLocaleString()+' coins')+'</small><strong>'+state+'</strong></span></button>';
 }).join('');
 const html='<section class="outlast-v441-skill-shell"><div class="outlast-v441-panel-top"><div><b>ACTIVE ABILITY</b><p>Choose the ability you take into a run. Unlocks and equipped skills save to your account.</p></div><span class="outlast-v441-current-skill">EQUIPPED: '+esc(s.activeSkill||'Nova')+'</span></div><div class="outlast-v441-skill-grid">'+cards+'</div><div class="outlast-v441-controls-note">PC: press <b>Q</b> • Mobile: tap <b>SKILL</b> • Cooldowns appear on the HUD.</div></section>';
 try{if(typeof openSub==='function')openSub('◉ Active Skills',html);else if(document.querySelector('#subContent'))document.querySelector('#subContent').innerHTML=html}catch(_){}
}
function useActiveSkill(){
 const g=currentGame(),s=currentSave(),p=g&&g.player;
 if(!g||!g.running||g.paused||g.upgradeOpen||!p)return false;
 const name=(s&&s.activeSkill)||p.activeSkill||'Nova';let defs;
 try{defs=typeof activeSkills!=='undefined'?activeSkills:window.activeSkills}catch(_){defs=window.activeSkills}
 const def=defs&&defs[name];if(!def){say('No active skill equipped. Open Loadout → Active Skills.');return false}
 p.activeSkill=name;if(num(p.skillCooldown)>0){say(name+' recharging • '+Math.ceil(num(p.skillCooldown))+'s');return false}
 const enemies=Array.isArray(g.enemies)?g.enemies:[];
 if(name==='Nova'){
  const radius=220+Math.max(0,num(p.explosionRadius));
  for(let i=enemies.length-1;i>=0;i--){const e=enemies[i];if(e&&!e.__dead&&Math.hypot(num(e.x)-num(p.x),num(e.y)-num(p.y))<radius){window.damageEnemy(e,num(p.damage)*4);if(num(e.hp)<=0)window.killEnemy(i)}}
  if(window.ring)window.ring(p.x,p.y,'#90e9ff',radius,.8);say('✴ NOVA • '+Math.round(radius)+' RANGE');
 }else if(name==='Blink'){
  let dx=(typeof keys!=='undefined'&&(keys.d||keys.arrowright)?1:0)-(typeof keys!=='undefined'&&(keys.a||keys.arrowleft)?1:0);
  let dy=(typeof keys!=='undefined'&&(keys.s||keys.arrowdown)?1:0)-(typeof keys!=='undefined'&&(keys.w||keys.arrowup)?1:0);
  if(!dx&&!dy)dy=-1;const len=Math.hypot(dx,dy)||1,sx=num(p.x),sy=num(p.y),ww=typeof W!=='undefined'?W:4000,hh=typeof H!=='undefined'?H:3000;let moved=false;
  for(let distance=450;distance>=90;distance-=30){const x=Math.max(30,Math.min(ww-30,sx+dx/len*distance)),y=Math.max(30,Math.min(hh-30,sy+dy/len*distance));if(typeof blocked!=='function'||!blocked(x,y,num(p.r)||20)){p.x=x;p.y=y;moved=true;break}}
  if(!moved){say('Blink blocked by terrain.');return false}if(window.ring)window.ring(p.x,p.y,'#7cf2ce',36,.35);say('➤ BLINK');
 }else if(name==='Fortify'){
  if(typeof window.outlastGrantTempShield==='function')window.outlastGrantTempShield(8);else p.shield=Math.max(num(p.shield),8);
  if(window.ring)window.ring(p.x,p.y,'#8bbdff',75,.5);say('⬡ FORTIFY • SHIELD UP');
 }else if(name==='TimeStop'){
  p.__outlastTimeStopUntil=Date.now()+5000;for(const e of enemies)if(e&&!e.__dead)e.slowTimer=Math.max(num(e.slowTimer),5);
  if(window.ring)window.ring(p.x,p.y,'#b2a1ff',480,.75);say('❄ TIME STOP • ENEMIES FROZEN FOR 5s');
 }else if(name==='Meteor'){
  const radius=560,damage=Math.max(120,num(p.damage)*6);let hits=0;
  for(let i=enemies.length-1;i>=0;i--){const e=enemies[i];if(!e||e.__dead||Math.hypot(num(e.x)-num(p.x),num(e.y)-num(p.y))>radius)continue;if(window.ring)window.ring(e.x,e.y,'#ff9469',80,.5,true);window.damageEnemy(e,damage);hits++;if(num(e.hp)<=0)window.killEnemy(i)}
  if(window.burst)window.burst(p.x,p.y,'#ff9469',32,230);say('☄ METEOR • '+hits+' TARGETS HIT');
 }
 p.skillCooldown=Math.max(.5,num(def.cool)*Math.max(.25,Number(p.skillCooldownMult)||1));
 window.OUTLAST_ACTIVE_SKILL_CAST_V441={skill:name,cooldown:p.skillCooldown,time:Date.now(),targets:enemies.length};return true;
}
function installSkills(){
 window.selectSkill=selectSkill;window.renderSkills=renderSkills;window.useActiveSkill=useActiveSkill;window.OUTLAST_SELECT_ACTIVE_SKILL_V441=selectSkill;
 try{selectSkill=window.selectSkill;renderSkills=window.renderSkills;useActiveSkill=window.useActiveSkill}catch(_){}
 const button=document.getElementById('skillBtn');if(button)button.onclick=renderSkills;
}
function fixChoiceEffects(){
 const old=window.makeChoices;if(typeof old!=='function'||old.__outlastV441ChoiceFix)return;
 const wrapped=function(){
  const choices=old.apply(this,arguments);if(!Array.isArray(choices))return choices;
  for(const c of choices){
   if(!Array.isArray(c))continue;const tier=MULT[c[3]]?c[3]:'Common',mult=MULT[tier];
   c[4]=Object.assign({},c[4]||{},{rarity:tier,multiplier:mult});
   if(String(c[0])==='Fortress'&&typeof c[2]==='function'&&!c[2].__outlastV441Fortress){
    const apply=c[2],repaired=function(){const result=apply.apply(this,arguments),p=currentPlayer();if(p)p.damageTakenMult=(Number(p.damageTakenMult)||1)*(1-Math.min(.4,.02*mult));return result};
    repaired.__outlastV441Fortress=true;c[2]=repaired;c[1]='+'+Math.round(15*mult)+' max HP and '+Number((2*mult).toFixed(1))+'% reduced damage taken';
   }
  }
  return choices;
 };
 wrapped.__outlastV441ChoiceFix=true;window.makeChoices=wrapped;try{makeChoices=wrapped}catch(_){}
}
function normalizeBosses(){
 let defs;try{defs=typeof raidBossDefs!=='undefined'?raidBossDefs:window.raidBossDefs}catch(_){defs=window.raidBossDefs}
 if(!defs)return;
 Object.assign(defs,{
  'Grave Titan':{hpMult:4.4,reward:3000,desc:'Ground shockwaves punish close range.'},
  'Plague Doctor':{hpMult:4.8,reward:3300,desc:'Three-shot poison volleys at range.'},
  'Mutant Brute':{hpMult:5.2,reward:3700,desc:'Heavy charge punishes standing still.'},
  'Undead Commander':{hpMult:5.6,reward:4100,desc:'Calls extra zombies during the fight.'},
  'The Abomination':{hpMult:6,reward:4500,desc:'Leaves a temporary poison zone.'},
  'Storm Colossus':{hpMult:6.5,reward:5000,desc:'Calls a lightning strike close to you.'},
  'Void Tyrant':{hpMult:7.2,reward:5700,desc:'Teleports around the arena.'},
  'Eternal Warden':{hpMult:8,reward:6500,desc:'Raises a defensive guard between attacks.'}
 });
 window.OUTLAST_RAID_BOSS_BALANCE_V441=Object.keys(defs).map(name=>({name:name,hp:num(defs[name].hpMult),reward:num(defs[name].reward)})).sort((a,b)=>a.hp-b.hp);
}
function addStyles(){
 if(!$('#outlast-v441-style')){
  const st=document.createElement('style');st.id='outlast-v441-style';
  st.textContent='#menu .menu-shell{gap:16px}#menu .menu-side{background:linear-gradient(180deg,#101b28,#0a1119);border:1px solid #2b4357;border-radius:18px;padding:12px}#menu .menu-nav-btn{border:1px solid #263d50;background:#111c28;color:#c8d7e4;border-radius:12px;min-height:44px;text-align:left;transition:transform .16s,border-color .16s}#menu .menu-nav-btn:hover,#menu .menu-nav-btn.active{border-color:#5caad0;background:#163348;color:#fff;transform:translateX(2px)}#menu .menu-page-title{font-size:clamp(24px,3vw,34px);font-weight:900;color:#f4f9ff;margin-bottom:5px}#menu .menu-page-sub{font-size:13px;line-height:1.55;color:#9eafc0;margin-bottom:14px}#menu .menu-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,185px),1fr));gap:12px}#menu .menu-card{position:relative;min-width:0;border:1px solid #293e50;border-radius:16px;padding:15px;background:linear-gradient(145deg,#182533,#0c131c);box-shadow:0 8px 22px #0003;transition:transform .16s,border-color .16s}#menu .menu-card:before{content:\"\";position:absolute;left:15px;right:15px;top:0;height:2px;background:linear-gradient(90deg,#68caff,transparent)}#menu .menu-card:hover{transform:translateY(-2px);border-color:#477b9a}#menu .menu-card h3{font-size:15px;color:#e2edf8;margin:0 0 11px}#menu .menu-btn{width:100%;min-height:42px;border:1px solid #38556c;border-radius:11px;padding:10px 12px;background:linear-gradient(180deg,#1c3041,#142433);box-shadow:none;color:#eff8ff;font-size:13px;white-space:normal}#menu .quick-card{border:1px solid #376d65;border-radius:18px;background:linear-gradient(120deg,#102922,#111a23);padding:18px;margin-bottom:14px}#menu #menuSummary{border:1px solid #233748;border-radius:12px;background:#0b141d;padding:10px 12px;margin-bottom:14px}#subPanel .card{border-color:#2b465b;background:linear-gradient(150deg,#131f2b,#0c131b)}#subContent .grid{gap:11px}#subContent .option{border:1px solid #2a4154;border-radius:13px;background:linear-gradient(145deg,#162432,#101821)}#subContent .option.selected{border-color:#58c9a2;background:linear-gradient(145deg,#16372f,#12242a)}#menu button:focus-visible,#subPanel button:focus-visible{outline:2px solid #80d8ff;outline-offset:2px}.outlast-v441-skill-shell{display:grid;gap:13px}.outlast-v441-panel-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:14px;border:1px solid #2a4e5d;border-radius:14px;background:#102630}.outlast-v441-panel-top p{margin:5px 0 0;color:#a8bdcb;font-size:12px;line-height:1.5}.outlast-v441-current-skill{padding:6px 9px;border-radius:9px;background:#143b30;border:1px solid #3c856a;color:#9df2ca;font-size:10px;font-weight:900}.outlast-v441-skill-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));gap:11px}.outlast-v441-skill-card{display:flex;align-items:flex-start;gap:12px;text-align:left;min-height:140px;padding:15px!important}.outlast-v441-skill-icon{display:grid;place-items:center;flex:0 0 42px;height:42px;border-radius:12px;background:#0b1721;border:1px solid #38586e;font-size:22px;color:#a3e2ff}.outlast-v441-skill-copy{display:grid;gap:7px;min-width:0}.outlast-v441-skill-copy b{font-size:16px;color:#f4f9ff}.outlast-v441-skill-copy span{color:#b5c7d5;font-size:12px;line-height:1.45}.outlast-v441-skill-copy small{color:#8fa6b8;font-size:11px}.outlast-v441-skill-copy strong{font-size:10px;color:#9bdcff}@media(max-width:760px){#menu .menu-shell{grid-template-columns:1fr!important;gap:10px}#menu .menu-side{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}#menu .menu-nav-btn{font-size:11px;text-align:center;padding:9px 5px;min-height:40px}.outlast-v441-panel-top{display:grid}}';
  document.head.appendChild(st);
 }
 if(!$('#outlast-v441-upgrade-css')){
  const st=document.createElement('style');st.id='outlast-v441-upgrade-css';
  st.textContent='#outlast-v441-upgrade-overlay{position:fixed;inset:0;z-index:999990;display:none;place-items:center;padding:clamp(10px,3vw,30px);box-sizing:border-box;background:radial-gradient(ellipse at 50% 35%,#183042eb,#03070cf9 72%);backdrop-filter:blur(5px);color:#f4f9ff}.outlast-v441-upgrade-inner{width:min(1120px,100%);max-height:94vh;overflow:auto;box-sizing:border-box;border:1px solid #2b465a;border-radius:23px;padding:clamp(13px,2.5vw,26px);background:linear-gradient(150deg,#111d29,#090f16)}.outlast-v441-upgrade-head{text-align:center;margin:0 auto 18px}.outlast-v441-kicker{color:#8ad6ff;font-size:10px;font-weight:900;letter-spacing:.2em}.outlast-v441-upgrade-head h2{font-size:clamp(24px,4vw,38px);margin:8px 0 5px}.outlast-v441-upgrade-head p{margin:0;color:#a5b7c7;font-size:12px}.outlast-v441-upgrade-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px}.outlast-v441-upgrade-card{display:flex;flex-direction:column;gap:12px;min-width:0;min-height:280px;text-align:left;padding:18px;border-radius:18px;border:1px solid var(--tier);background:linear-gradient(155deg,#172432,#0d141c);color:#fff;cursor:pointer;transition:transform .18s}.outlast-v441-upgrade-card:hover:not(:disabled){transform:translateY(-4px)}.outlast-v441-upgrade-card:disabled{opacity:.55;cursor:wait}.outlast-v441-upgrade-top{display:flex;justify-content:space-between;gap:6px;color:var(--tier);font-size:10px;font-weight:900}.outlast-v441-upgrade-top span:last-child{border:1px solid var(--tier);border-radius:8px;padding:4px 6px}.outlast-v441-upgrade-title{display:flex;gap:10px;align-items:center}.outlast-v441-upgrade-icon{display:grid;place-items:center;flex:0 0 42px;height:42px;border-radius:13px;background:#0b131c;border:1px solid var(--tier);font-size:23px;color:var(--tier)}.outlast-v441-upgrade-title b{font-size:clamp(15px,1.6vw,19px);line-height:1.22;overflow-wrap:anywhere}.outlast-v441-upgrade-desc{flex:1;color:#c3d0dc;font-size:13px;line-height:1.55;overflow-wrap:anywhere}.outlast-v441-upgrade-footer{border-top:1px solid #2a3a49;padding-top:10px;display:flex;justify-content:space-between;gap:8px;color:#91a6b8;font-size:10px}.outlast-v441-upgrade-footer b{color:var(--tier);font-size:11px}.outlast-v441-upgrade-lock{text-align:center;margin-top:14px;color:#c0d1de;font-size:11px}.outlast-v441-common{animation:outlastFade .35s ease-out}.outlast-v441-uncommon{animation:outlastBounce .55s ease-out}.outlast-v441-rare{animation:outlastPulse .8s ease-in-out infinite alternate}.outlast-v441-epic{animation:outlastRise .6s ease-out}.outlast-v441-legendary{animation:outlastRoll .7s ease-out}.outlast-v441-mythic{animation:outlastHalo 1.4s ease-in-out infinite alternate}.outlast-v441-divine{animation:outlastHalo 1.1s ease-in-out infinite alternate}.outlast-v441-celestial{animation:outlastPulse 1.2s ease-in-out infinite alternate}.outlast-v441-transcendent{animation:outlastGlitch .4s steps(2) infinite alternate}.outlast-v441-eternal{animation:outlastTime 2.2s linear infinite}.outlast-v441-omega{animation:outlastOmega .8s ease-in-out infinite alternate}@keyframes outlastFade{from{opacity:.5;transform:translateY(8px)}to{opacity:1}}@keyframes outlastBounce{0%{transform:translateY(-14px)}70%{transform:translateY(2px)}to{transform:none}}@keyframes outlastPulse{to{box-shadow:0 0 22px #6bcaff55}}@keyframes outlastRise{from{opacity:.4;transform:translateY(18px)}to{opacity:1;transform:none}}@keyframes outlastRoll{from{transform:rotateY(50deg);opacity:.6}to{transform:none;opacity:1}}@keyframes outlastHalo{to{filter:brightness(1.18)}}@keyframes outlastGlitch{from{transform:translateX(-1px)}to{transform:translateX(1px)}}@keyframes outlastTime{from{border-color:#6d5fa0}to{border-color:#d7c9ff}}@keyframes outlastOmega{to{box-shadow:0 0 25px #ff9d6b77}}@media(max-width:760px){.outlast-v441-upgrade-grid{grid-template-columns:1fr}.outlast-v441-upgrade-card{min-height:0;padding:14px}}@media(prefers-reduced-motion:reduce){.outlast-v441-upgrade-card{animation:none!important;transition:none!important}}';
  document.head.appendChild(st);
 }
}
function renderUpgradeOverlay(){
 const g=currentGame();let root=$('#outlast-v441-upgrade-overlay');
 if(!root){
  root=document.createElement('div');root.id='outlast-v441-upgrade-overlay';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');
  root.innerHTML='<div class="outlast-v441-upgrade-inner"><header class="outlast-v441-upgrade-head"><div class="outlast-v441-kicker">SURVIVOR GROWTH • PICK ONE</div><h2>LEVEL UP</h2><p>Choose one upgrade; higher rarity means a stronger applied effect.</p></header><div class="outlast-v441-upgrade-grid" id="outlast-v441-upgrade-grid"></div><div class="outlast-v441-upgrade-lock" id="outlast-v441-upgrade-lock"></div></div>';
  document.body.appendChild(root);
  root.addEventListener('click',e=>{
   const button=e.target.closest&&e.target.closest('[data-v441-pick]');if(!button)return;
   e.preventDefault();e.stopPropagation();const g=currentGame(),i=Number(button.getAttribute('data-v441-pick'));
   if(!g||!Array.isArray(g.upgradeChoices)||!g.upgradeChoices[i])return;
   const name=String(g.upgradeChoices[i][0]||''),until=num(g.__upgradeRollUnlockAt);
   if(g.__upgradeRollActive&&performance.now()<until)return;
   g.__upgradeRollKey=g.__upgradeRollKey||('v441-'+Date.now());g.__upgradeRollUnlockAt=Math.min(until||0,performance.now());g.__upgradeRollActive=false;
   try{window.chooseUpgrade(i)}catch(err){window.OUTLAST_UPGRADE_PICK_ERROR_V441=String(err&&err.message||err)}
   window.OUTLAST_LAST_UPGRADE_PICK_V441={index:i,name:name,time:Date.now()};
  });
 }
 const active=!!(g&&g.running&&g.upgradeOpen&&Array.isArray(g.upgradeChoices)&&g.upgradeChoices.length===3);
 if(!active){root.style.display='none';return}root.style.display='grid';
 const choices=g.upgradeChoices,signature=choices.map(c=>[c&&c[0],c&&c[1],c&&c[3]].join('~')).join('|');
 if(root.getAttribute('data-signature')!==signature){
  root.setAttribute('data-signature',signature);
  $('#outlast-v441-upgrade-grid').innerHTML=choices.map((c,i)=>{
   const name=String(c&&c[0]||'Unknown Upgrade'),desc=String(c&&c[1]||'Effect unavailable'),tier=MULT[c&&c[3]]?c[3]:'Common',rank=TIERS.indexOf(tier)+1;
   const title=esc(name.replace(/\s*\[(Common|Uncommon|Rare|Epic|Legendary|Mythic|Divine|Celestial|Transcendent|Eternal|Omega)\]\s*$/i,''));
   let icon='⚔';if(/heal|hp|regen/i.test(name))icon='✚';else if(/shield|armor|fortress/i.test(name))icon='⬡';else if(/coin|luck|treasure/i.test(name))icon='◉';else if(/xp|level/i.test(name))icon='✧';else if(/boss|elite/i.test(name))icon='♜';else if(/frost|cryo|poison/i.test(name))icon='❄';
   return '<button type="button" class="outlast-v441-upgrade-card outlast-v441-'+tier.toLowerCase()+'" data-v441-pick="'+i+'" style="--tier:'+COLORS[tier]+'"><span class="outlast-v441-upgrade-top"><span>'+tier.toUpperCase()+' • TIER '+rank+'/11</span><span>KEY '+(i+1)+'</span></span><span class="outlast-v441-upgrade-title"><span class="outlast-v441-upgrade-icon">'+icon+'</span><b>'+title+'</b></span><span class="outlast-v441-upgrade-desc">'+esc(desc)+'</span><span class="outlast-v441-upgrade-footer"><b>'+MULT[tier]+'× SCALE</b><span>'+(tier==='Common'?'BASELINE':tier==='Omega'?'TOP TIER':'POWER '+rank)+'</span></span></button>';
  }).join('');
 }
 const locked=!!(g.__upgradeRollActive&&performance.now()<num(g.__upgradeRollUnlockAt));
 $('#outlast-v441-upgrade-lock').textContent=locked?'Revealing rarity… cards unlock when the roll ends.':'Tap a card or press 1, 2, or 3.';
 root.querySelectorAll('[data-v441-pick]').forEach(b=>b.disabled=locked);
}
function buildAudit(){
 const src=typeof tempUp!=='undefined'&&Array.isArray(tempUp)?tempUp:[],perm=typeof permanent!=='undefined'&&Array.isArray(permanent)?permanent:[],pools=window.OUTLAST_UPGRADE_RARITY_POOLS||{},by=window.OUTLAST_UPGRADE_RARITY_BY_NAME||{},duplicates=[],seen=new Set();
 for(const x of src){if(!x||!x[0])continue;const name=String(x[0]);if(seen.has(name)&&!duplicates.includes(name))duplicates.push(name);seen.add(name)}
 let bosses={};try{bosses=typeof raidBossDefs!=='undefined'?raidBossDefs:(window.raidBossDefs||{})}catch(_){}
 let world=[];try{world=typeof worldBosses!=='undefined'?worldBosses:[]}catch(_){}
 return {version:VERSION,inRun:src.length,permanent:perm.length,modifiers:Object.keys(modifiers()).length,bosses:Object.keys(bosses).length,strictLadder:TIERS.every((t,i)=>!i||MULT[t]>MULT[TIERS[i-1]]),poolCounts:Object.fromEntries(TIERS.map(t=>[t,(pools[t]||[]).length])),duplicates:duplicates,unmapped:src.filter(x=>x&&x[0]&&!by[x[0]]).map(x=>x[0]),orphanPools:TIERS.flatMap(t=>(pools[t]||[]).filter(name=>!src.some(x=>x&&x[0]===name)).map(name=>t+': '+name)),missingHandlers:src.filter(x=>x&&typeof x[2]!=='function').map(x=>x[0]),missingBosses:world.filter(name=>!bosses[name])};
}
function drawAudit(tab){
 const root=$('#outlast-v441-audit');if(!root)return;root.setAttribute('data-tab',tab);
 root.querySelectorAll('[data-audit-tab]').forEach(b=>b.classList.toggle('active',b.getAttribute('data-audit-tab')===tab));
 const data=buildAudit(),src=typeof tempUp!=='undefined'&&Array.isArray(tempUp)?tempUp:[],perm=typeof permanent!=='undefined'&&Array.isArray(permanent)?permanent:[],mods=modifiers();
 let bossDefs={};try{bossDefs=typeof raidBossDefs!=='undefined'?raidBossDefs:(window.raidBossDefs||{})}catch(_){}
 root.querySelector('#outlast-v441-audit-stats').innerHTML=[['IN-RUN',data.inRun],['PERMANENT',data.permanent],['MODIFIERS',data.modifiers],['BOSSES',data.bosses],['RARITY',data.strictLadder?'PASS':'CHECK']].map(x=>'<div><small>'+x[0]+'</small><b>'+esc(x[1])+'</b></div>').join('');
 const query=root.querySelector('#outlast-v441-audit-search').value.toLowerCase(),rarity=root.querySelector('#outlast-v441-audit-rarity').value;let html='';
 if(tab==='permanent'){
  html='<div class="outlast-v441-audit-count">'+perm.length+' permanent entries; search by name, effect, tree or cost.</div><table class="outlast-v441-audit-table"><thead><tr><th>Upgrade</th><th>Tree</th><th>Effect</th><th>Cost</th></tr></thead><tbody>'+perm.map(x=>{const name=String(x&&x[0]||''),desc=String(x&&x[1]||''),group=String(x&&x[3]||'Standard');if(query&&!(name+' '+desc+' '+group).toLowerCase().includes(query))return '';return '<tr><td>'+esc(name)+'</td><td>'+esc(group)+'</td><td>'+esc(desc)+'</td><td>'+num(x&&x[2]).toLocaleString()+'</td></tr>'}).join('')+'</tbody></table>';
 }else if(tab==='modifiers'){
  html='<div class="outlast-v441-audit-count">'+Object.keys(mods).length+' modifiers including negative effects and reward variants.</div><table class="outlast-v441-audit-table"><thead><tr><th>Modifier</th><th>Effect</th><th>Enemy HP</th><th>Spawn</th><th>Reward</th><th>Effect fields</th></tr></thead><tbody>'+Object.entries(mods).filter(x=>x[0]!=='None').map(([name,m])=>{const keys=Object.keys(m).filter(k=>!['desc','enemy','spawn','reward'].includes(k));if(query&&!(name+' '+m.desc+' '+keys.join(' ')).toLowerCase().includes(query))return '';return '<tr><td>'+esc(name)+'</td><td>'+esc(m.desc||'')+'</td><td>×'+(num(m.enemy)||1)+'</td><td>×'+(num(m.spawn)||1)+'</td><td>×'+(num(m.reward)||1)+'</td><td>'+esc(keys.join(', ')||'standard')+'</td></tr>'}).join('')+'</tbody></table>';
 }else if(tab==='bosses'){
  html='<div class="outlast-v441-audit-count">Bosses sorted from lowest to highest HP multiplier.</div><table class="outlast-v441-audit-table"><thead><tr><th>Boss</th><th>HP scale</th><th>Reward</th><th>Mechanic</th></tr></thead><tbody>'+Object.entries(bossDefs).sort((a,b)=>num(a[1].hpMult)-num(b[1].hpMult)).map(([name,m])=>{if(query&&!(name+' '+m.desc).toLowerCase().includes(query))return '';return '<tr><td>'+esc(name)+'</td><td>×'+num(m.hpMult)+'</td><td>'+num(m.reward).toLocaleString()+' coins</td><td>'+esc(m.desc||'')+'</td></tr>'}).join('')+'</tbody></table>';
 }else if(tab==='findings'){
  const rows=[['Rarity ladder',data.strictLadder?'PASS':'CHECK',TIERS.map(t=>t+' '+MULT[t]+'×').join(' → ')],['Apply handlers',data.missingHandlers.length?'CHECK':'PASS',data.missingHandlers.join(', ')||'All in-run entries have apply functions.'],['Rarity mapping',data.unmapped.length?'CHECK':'PASS',data.unmapped.join(', ')||'All in-run entries have tiers.'],['Pool links',data.orphanPools.length?'CHECK':'PASS',data.orphanPools.join(', ')||'No missing card entries in rarity pools.'],['Boss coverage',data.missingBosses.length?'CHECK':'PASS',data.missingBosses.join(', ')||'All listed world bosses have definitions.'],['Duplicate names',data.duplicates.length?'REVIEW':'PASS',data.duplicates.join(', ')||'No repeated in-run upgrade names.']];
  html='<div class="outlast-v441-findings">'+rows.map(x=>'<div class="outlast-v441-audit-finding"><b>'+esc(x[1])+' • '+esc(x[0])+'</b><p>'+esc(x[2])+'</p></div>').join('')+'</div><h3>v4.4.1 fixes</h3><p>Skill selection and use; passive tree stats; high-tier rarity weights; modifier consumers; Fortress and Armor Pierce; boss damage scaling; raid boss definitions and mechanics.</p>';
 }else{
  html='<div class="outlast-v441-audit-count">'+src.length+' in-run cards; actual loaded descriptions, rarity, scale and handler status.</div><table class="outlast-v441-audit-table"><thead><tr><th>Upgrade</th><th>Rarity</th><th>Displayed effect</th><th>Scale</th><th>Handler</th></tr></thead><tbody>'+src.map(x=>{if(!x||!x[0])return '';const name=String(x[0]),tier=(window.OUTLAST_UPGRADE_RARITY_BY_NAME||{})[name]||tierFromName(name)||'Common',mult=MULT[tier]||1;let desc='';try{desc=typeof x[1]==='function'?String(x[1](mult)||''):String(x[1]||'')}catch(_){desc='Description error — inspect entry.'}if(query&&!(name+' '+desc+' '+tier).toLowerCase().includes(query))return '';if(rarity!=='All'&&rarity!==tier)return '';return '<tr><td>'+esc(name)+'</td><td><span class="outlast-v441-tier-pill" style="--tier:'+COLORS[tier]+'">'+esc(tier)+'</span></td><td>'+esc(desc)+'</td><td>'+mult+'×</td><td>'+(typeof x[2]==='function'?'READY':'MISSING')+'</td></tr>'}).join('')+'</tbody></table>';
 }
 root.querySelector('#outlast-v441-audit-content').innerHTML=html;
 root.querySelector('#outlast-v441-audit-rarity').style.display=tab==='upgrades'?'block':'none';
}
function openAudit(tab){
 let root=$('#outlast-v441-audit');
 if(!root){
  root=document.createElement('div');root.id='outlast-v441-audit';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');
  root.innerHTML='<section class="outlast-v441-audit-shell"><header class="outlast-v441-audit-header"><div><div class="outlast-v441-kicker">LIVE REGISTRY CHECK • v'+VERSION+'</div><h2>Upgrade & Boss Balance Audit</h2><p>All loaded in-run upgrades, permanent nodes, debuffs and raid bosses.</p></div><button type="button" id="outlast-v441-audit-close">×</button></header><div id="outlast-v441-audit-stats" class="outlast-v441-audit-stats"></div><div class="outlast-v441-audit-controls"><input type="search" id="outlast-v441-audit-search" placeholder="Search name, effect, rarity, mechanic…"><select id="outlast-v441-audit-rarity"><option>All</option>'+TIERS.map(t=>'<option>'+t+'</option>').join('')+'</select></div><nav class="outlast-v441-audit-tabs"><button data-audit-tab="upgrades">In-Run Upgrades</button><button data-audit-tab="permanent">Permanent Tree</button><button data-audit-tab="modifiers">Debuffs & Modifiers</button><button data-audit-tab="bosses">Bosses</button><button data-audit-tab="findings">Findings</button></nav><div id="outlast-v441-audit-content"></div></section>';
  document.body.appendChild(root);
  root.addEventListener('click',e=>{if(e.target===root||e.target.closest('#outlast-v441-audit-close')){root.style.display='none';return}const b=e.target.closest('[data-audit-tab]');if(b)drawAudit(b.getAttribute('data-audit-tab'))});
  root.querySelector('#outlast-v441-audit-search').addEventListener('input',()=>drawAudit(root.getAttribute('data-tab')||'upgrades'));
  root.querySelector('#outlast-v441-audit-rarity').addEventListener('change',()=>drawAudit(root.getAttribute('data-tab')||'upgrades'));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&root.style.display==='flex')root.style.display='none'});
 }
 root.style.display='flex';drawAudit(tab||'upgrades');
}
function addAuditStyles(){
 if($('#outlast-v441-audit-css'))return;
 const st=document.createElement('style');st.id='outlast-v441-audit-css';
 st.textContent='#outlast-v441-audit{position:fixed;inset:0;z-index:999980;display:none;align-items:center;justify-content:center;padding:14px;box-sizing:border-box;background:#02060af2;backdrop-filter:blur(7px);color:#edf6ff}#outlast-v441-audit .outlast-v441-audit-shell{width:min(1180px,100%);max-height:95vh;overflow:auto;padding:clamp(12px,2vw,22px);box-sizing:border-box;border:1px solid #2d495d;border-radius:20px;background:linear-gradient(145deg,#13202c,#080e14)}#outlast-v441-audit .outlast-v441-audit-header{display:flex;justify-content:space-between;gap:18px}#outlast-v441-audit h2{margin:6px 0;font-size:clamp(22px,3.5vw,32px)}#outlast-v441-audit .outlast-v441-audit-header p{margin:0 0 13px;color:#9fb4c5;font-size:12px}#outlast-v441-audit .outlast-v441-audit-stats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:9px;margin:14px 0}#outlast-v441-audit .outlast-v441-audit-stats>div{display:grid;gap:5px;padding:11px;border:1px solid #294153;border-radius:12px;background:#0c1720}#outlast-v441-audit .outlast-v441-audit-stats small{font-size:9px;color:#91a7b8;font-weight:900}#outlast-v441-audit .outlast-v441-audit-stats b{font-size:18px;color:#dff4ff}#outlast-v441-audit .outlast-v441-audit-controls{display:grid;grid-template-columns:minmax(0,1fr) 160px;gap:9px;margin-bottom:10px}#outlast-v441-audit input,#outlast-v441-audit select{min-width:0;padding:11px;box-sizing:border-box;border-radius:10px;border:1px solid #2e4d62;background:#09131c;color:#f4faff}#outlast-v441-audit .outlast-v441-audit-tabs{display:flex;gap:7px;overflow-x:auto;padding:2px 0 10px}#outlast-v441-audit .outlast-v441-audit-tabs button{flex:0 0 auto;border:1px solid #2d475b;border-radius:9px;padding:9px 11px;background:#101c27;color:#b8ccda;font-size:11px}#outlast-v441-audit .outlast-v441-audit-tabs button.active{border-color:#58b9d9;background:#173448;color:#fff}#outlast-v441-audit .outlast-v441-audit-count{margin:5px 0 11px;color:#96adbe;font-size:11px}#outlast-v441-audit .outlast-v441-audit-table{width:100%;border-collapse:collapse;font-size:11px}#outlast-v441-audit .outlast-v441-audit-table th{position:sticky;top:0;background:#1b2b38;color:#b8d4e5;text-align:left;font-size:9px;padding:10px}#outlast-v441-audit .outlast-v441-audit-table td{vertical-align:top;padding:9px 10px;border-bottom:1px solid #1e2d39;color:#b9c8d5;line-height:1.45;overflow-wrap:anywhere}#outlast-v441-audit .outlast-v441-audit-table td:first-child{color:#f0f6fb;font-weight:800}#outlast-v441-audit .outlast-v441-tier-pill{display:inline-block;padding:4px 7px;border-radius:7px;border:1px solid var(--tier);color:var(--tier);font-size:9px;font-weight:900}#outlast-v441-audit .outlast-v441-findings{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:9px}#outlast-v441-audit .outlast-v441-audit-finding{border:1px solid #2a4658;border-radius:11px;background:#0d1821;padding:12px}#outlast-v441-audit .outlast-v441-audit-finding b{font-size:11px;color:#a8e6c9}#outlast-v441-audit .outlast-v441-audit-finding p{margin:7px 0 0;font-size:11px;color:#b1c2d0;line-height:1.5}@media(max-width:700px){#outlast-v441-audit .outlast-v441-audit-stats{grid-template-columns:repeat(2,minmax(0,1fr))}#outlast-v441-audit .outlast-v441-audit-controls{grid-template-columns:1fr}#outlast-v441-audit .outlast-v441-audit-table{font-size:10px}#outlast-v441-audit .outlast-v441-audit-table th,#outlast-v441-audit .outlast-v441-audit-table td{padding:7px 6px}}';
 document.head.appendChild(st);
}
function addAuditCard(){
 const host=$('[data-page-content="progress"] .menu-cards');
 if(host&&!$('#outlastBalanceAuditBtn')){const card=document.createElement('div');card.className='menu-card';card.innerHTML='<h3>🧪 Upgrade & Boss Audit</h3><p class="small">Search every in-run upgrade, permanent node, debuff and raid boss.</p><button type="button" class="menu-btn" id="outlastBalanceAuditBtn">OPEN BALANCE AUDIT</button>';host.appendChild(card)}
 if(!window.__OUTLAST_V441_AUDIT_LISTENER){window.__OUTLAST_V441_AUDIT_LISTENER=true;document.addEventListener('click',e=>{const b=e.target&&e.target.closest?e.target.closest('#outlastBalanceAuditBtn'):null;if(!b)return;e.preventDefault();e.stopPropagation();openAudit('upgrades')},true)}
}
function addReleaseNotes(){
 try{if(typeof updates!=='undefined'&&Array.isArray(updates)&&!updates.some(x=>x&&String(x[0]).includes('v4.4.1')))updates.unshift(['v4.4.1 — Skills, Rarity & Combat Integrity','Fixed active-skill selection and use, restored passive Skill Tree effects, redesigned level-up cards and menu styling, and added a searchable balance audit. Wired run debuffs, repaired Fortress and Armor Pierce, corrected boss damage scaling, and added unique raid boss mechanics.'])}catch(_){}
 try{
  if(typeof helpArticles!=='undefined'&&Array.isArray(helpArticles)){
   const items={
    'How do I change my active skill?':'Open Loadout → Manage Skills. Choose an unlocked skill to equip it immediately; the choice saves to your account. Locked skills show their coin cost. Press Q on PC or tap SKILL on mobile.',
    'How do higher rarity upgrades scale?':'Common 1×, Uncommon 1.15×, Rare 1.35×, Epic 1.6×, Legendary 1.9×, Mythic 2.25×, Divine 4×, Celestial 5×, Transcendent 6×, Eternal 7×, Omega 8×. Open Progress → Upgrade & Boss Audit to inspect loaded cards.',
    'What does the Upgrade & Boss Audit show?':'Open Progress → Upgrade & Boss Audit to search every in-run upgrade, permanent node, run modifier/debuff and raid boss. Each upgrade lists its tier, description, scale and handler status.',
    'How do run debuffs work?':'Modifiers affect incoming damage, enemy damage, power-up drops, elite appearances, coin earnings, boss timing, enemy size and healing. Review all entries in Progress → Upgrade & Boss Audit.',
    'How do raid bosses differ?':'Grave Titan uses shockwaves; Plague Doctor fires poison volleys; Mutant Brute charges; Undead Commander summons zombies; The Abomination creates poison zones; Storm Colossus calls lightning; Void Tyrant teleports; Eternal Warden guards between attacks.'
   };
   Object.entries(items).forEach(([title,body])=>{const old=helpArticles.find(x=>x&&String(x[0])===title);if(old)old[2]=body;else helpArticles.unshift([title,title.toLowerCase().includes('skill')?'Skills & Controls':title.includes('Audit')?'Upgrades & Balance':'Upgrades & Rarities',body])});
  }
 }catch(_){}
}
function setVersion(){
 const meta=$('meta[name="outlast-build"]'),build=$('meta[name="build-version"]');
 const DISPLAY_VERSION=(meta&&meta.content)||(build&&build.content)||VERSION;
 window.OUTLAST_BUILD=DISPLAY_VERSION;window.OUTLAST_VERSION='v'+DISPLAY_VERSION;window.OUTLAST_V441_READY=true;document.title='OUTLAST v'+DISPLAY_VERSION;
 if(meta)meta.content=DISPLAY_VERSION;if(build)build.content=DISPLAY_VERSION;
 document.querySelectorAll('[data-outlast-version]').forEach(el=>el.textContent='v'+DISPLAY_VERSION);
 document.querySelectorAll('.menu-chip').forEach(el=>{if(/SURVIVOR HUB/i.test(el.textContent||''))el.textContent='v'+DISPLAY_VERSION+' • SURVIVOR HUB'});
}
function install(){
 try{
  addStyles();addAuditStyles();installRarity();installModifierDefs();normalizeBosses();installCombat();installSkills();fixChoiceEffects();addReleaseNotes();addAuditCard();setVersion();
  window.OUTLAST_BALANCE_AUDIT_V441=buildAudit;window.OUTLAST_OPEN_BALANCE_AUDIT_V441=openAudit;
  window.OUTLAST_SKILL_AUDIT_V441=function(){return{selected:currentSave()?.activeSkill||'Nova',player:currentPlayer()?.activeSkill||'none',tree:Object.assign({},currentSave()?.skillTree||{}),cast:window.OUTLAST_ACTIVE_SKILL_CAST_V441||null}};
  renderUpgradeOverlay();prepareRunEffects();
 }catch(err){window.OUTLAST_V441_INSTALL_ERROR=String(err&&err.message||err)}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
setTimeout(install,0);setTimeout(install,100);setTimeout(install,450);
const previousDraw=window.draw;
if(typeof previousDraw==='function'&&!previousDraw.__outlastV441Overlay){
 const wrap=function(){const result=previousDraw.apply(this,arguments);try{renderUpgradeOverlay()}catch(err){window.OUTLAST_V441_OVERLAY_ERROR=String(err&&err.message||err)}return result};
 wrap.__outlastV441Overlay=true;window.draw=wrap;try{draw=wrap}catch(_){}
}
window.addEventListener('keydown',e=>{
 const g=currentGame();if(!g||!g.running||!g.upgradeOpen||!['1','2','3'].includes(String(e.key||'')))return;
 e.preventDefault();e.stopImmediatePropagation();const i=Number(e.key)-1,now=performance.now(),until=num(g.__upgradeRollUnlockAt);
 if(g.__upgradeRollActive&&now<until)return;g.__upgradeRollKey=g.__upgradeRollKey||('v441-'+Date.now());g.__upgradeRollUnlockAt=Math.min(until||0,now);g.__upgradeRollActive=false;
 try{window.chooseUpgrade(i)}catch(err){window.OUTLAST_UPGRADE_PICK_ERROR_V441=String(err&&err.message||err)}
},true);
setInterval(function(){try{if(!window.OUTLAST_V441_READY)install();renderUpgradeOverlay();prepareRunEffects()}catch(err){window.OUTLAST_V441_RUNTIME_ERROR=String(err&&err.message||err)}},250);
})();