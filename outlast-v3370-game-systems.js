/* OUTLAST v3.37.3 — Progress Deck, Core UI, Upgrade Authority, Skin Reliability, Shop, Stats, Modifiers, Zombie AI */
(function(){
'use strict';
const VERSION='3.37.3';
const SCALE=Object.freeze({Common:1,Uncommon:1.15,Rare:1.35,Epic:1.6,Legendary:1.9,Mythic:2.25,Divine:4,Celestial:5,Transcendent:6,Eternal:7,Omega:8});
const E=v=>String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const S=()=>{try{return save}catch(_){return null}};
const G=()=>{try{return game}catch(_){return null}};
const fmt=n=>Number(n||0).toLocaleString();

function tierFor(name){
  const map=window.OUTLAST_UPGRADE_RARITY_BY_NAME||{};
  if(map[name])return map[name];
  const pools={
    Common:['Power Shot','Vitality','Swift Feet','Magnet','Regeneration','Second Wind','Berserker','XP Boost','Second Heart','Upgrade Luck'],
    Uncommon:['Rapid Fire','Piercing','Big Bullets','Projectile Speed','Swift Aim','Fortified Core','XP Burst'],
    Rare:['Multi-Shot','Frost Aura','Crit Chance','Rapid Recovery','Armor Pierce','Coin Magnetism'],
    Epic:['Heavy Rounds','Chain Reaction','Lifesteal','Shockwave','Deadeye','Scavenger Luck','Elite Hunter','Void Arsenal'],
    Legendary:['Lucky Hunter','Lucky Coins','Adrenaline','Shield Core','Poison Rounds','Stun Rounds'],
    Mythic:['Overcharge','Double Tap','Treasure Radar','Lucky Charm','Treasure Luck','Fortune','Abyssal Core'],
    Divine:['Overheat','Rift Pierce','Cryo Core','Ammo Surge','Heavy Impact','Emergency Shield','Divine Aegis'],
    Celestial:['Vampiric Surge','Fortune Engine','Combat Medic','XP Hunter','Bloodrush','Fortress','Adrenal Core','XP Reactor','Celestial Barrage'],
    Transcendent:['Quick Reload','Ricochet','Executioner','Bossbreaker','Cryo Burst','Shock Circuit','Transcendent Fury'],
    Eternal:['Vampire Core','Salvager','Lucky Barrage','Shield Nova','Overclock','Eternal Rebirth','Last Stand'],
    Omega:['Treasure Engine','Deadly Precision','Omega Ascension']
  };
  for(const [r,names] of Object.entries(pools))if(names.includes(name))return r;
  return null;
}
function upgradeBase37(name,desc,apply,rarity){
  const mult=SCALE[rarity]||1;
  if(name==='XP Boost')return {
    desc:'+'+Math.round(8*mult)+'% XP',
    apply:function(){const p=G()?.player;if(p)p.xpBonus*=1+.08*mult;}
  };
  if(name==='XP Burst')return {
    desc:'+'+Math.round(12*mult)+'% XP and +'+Math.round(20*mult)+' pickup radius',
    apply:function(){const p=G()?.player;if(p){p.xpBonus*=1+.12*mult;p.magnet+=20*mult;}}
  };
  const d=typeof desc==='function'?desc(mult):String(desc||'');
  const a=typeof apply==='function'?apply:()=>{};
  return {desc:d,apply:()=>{const result=a(mult);if(typeof result==='function')return result();return result;}};
}
function authoritativeUpgradeChoice37(){
  const poolMap=window.OUTLAST_UPGRADE_RARITY_POOLS||{};
  const source=typeof tempUp!=='undefined'&&Array.isArray(tempUp)?tempUp:[];
  const used=new Set(),out=[];
  function candidates(r){
    const names=Array.isArray(poolMap[r])?poolMap[r]:[];
    return names.map(n=>({name:n,item:source.find(x=>x&&x[0]===n)})).filter(x=>x.item&&!used.has(x.name));
  }
  while(out.length<3){
    let rarity;
    try{rarity=window.rollUpgradeRarity?window.rollUpgradeRarity():null}catch(_){rarity=null}
    if(!SCALE[rarity])rarity='Common';
    let list=candidates(rarity);
    if(!list.length){
      const all=Object.keys(SCALE).flatMap(r=>candidates(r).map(x=>({rarity:r,...x}))).filter(x=>x.item);
      if(!all.length)break;
      const pick=all[Math.floor(Math.random()*all.length)],item=pick.item;
      const fx=upgradeBase37(pick.name,item[1],item[2],pick.rarity);
      out.push([pick.name,fx.desc,fx.apply,pick.rarity, {rarity:pick.rarity,multiplier:SCALE[pick.rarity]}]);used.add(pick.name);continue;
    }
    const pick=list[Math.floor(Math.random()*list.length)],item=pick.item;
    const fx=upgradeBase37(pick.name,item[1],item[2],rarity);
    out.push([pick.name,fx.desc,fx.apply,rarity,{rarity,multiplier:SCALE[rarity]}]);used.add(pick.name);
  }
  if(out.length<3){
    for(const rarity of Object.keys(SCALE)){
      for(const pick of candidates(rarity)){
        if(out.length>=3)break;
        const fx=upgradeBase37(pick.name,pick.item[1],pick.item[2],rarity);
        out.push([pick.name,fx.desc,fx.apply,rarity,{rarity,multiplier:SCALE[rarity]}]);used.add(pick.name);
      }
      if(out.length>=3)break;
    }
  }
  return out;
}
window.OUTLAST_UPGRADE_RARITY_SCALING37=SCALE;
window.authoritativeUpgradeChoice37=authoritativeUpgradeChoice37;

function zombieAISeed37(kind){
  const k=String(kind||'normal').toLowerCase();
  if(['ranged','spitter','volt','screamer'].includes(k))return 'Sniper';
  if(['runner','fast','crawler','leaper'].includes(k))return 'Rammer';
  if(['phantom','leech','reaper','mimic'].includes(k))return 'Ambusher';
  if(['tank','armored','brute','juggernaut','warden'].includes(k))return 'Chaser';
  if(['shielder','summoner'].includes(k))return 'Support';
  if(['toxic','splitter','swarm'].includes(k))return 'Flanker';
  return 'Hunter';
}
function zombieAI37(e,p,dt){
  if(!e||!p)return p||{x:0,y:0};
  const now=Number(G()?.time||0),d0=Math.hypot(p.x-e.x,p.y-e.y)||1,ang=Math.atan2(p.y-e.y,p.x-e.x);
  const behavior=e.aiBehavior||zombieAISeed37(e.kind);
  e.aiBehavior=behavior;e.aiClock=(Number(e.aiClock)||0)-dt;
  const strafe=Math.sin(now*(behavior==='Flanker'?1.7:.9)+(Number(e.aiPhase)||0))*90;
  let tx=p.x,ty=p.y;
  if(behavior==='Flanker'){
    tx=p.x+Math.cos(ang+Math.PI/2)*strafe;ty=p.y+Math.sin(ang+Math.PI/2)*strafe;
  }else if(behavior==='Sniper'){
    const desired=440;
    if(d0<desired-60){tx=e.x-Math.cos(ang)*160;ty=e.y-Math.sin(ang)*160;}
    else if(d0>desired+90){tx=p.x;ty=p.y;}
    else{tx=p.x+Math.cos(ang+Math.PI/2)*strafe;ty=p.y+Math.sin(ang+Math.PI/2)*strafe;}
  }else if(behavior==='Ambusher'){
    const behind=125+35*Math.sin(now*.7+(Number(e.aiPhase)||0));
    tx=p.x-Math.cos(ang)*behind+Math.cos(ang+Math.PI/2)*strafe*.45;
    ty=p.y-Math.sin(ang)*behind+Math.sin(ang+Math.PI/2)*strafe*.45;
  }else if(behavior==='Support'){
    const desired=190;
    if(d0<desired){tx=e.x-Math.cos(ang)*80;ty=e.y-Math.sin(ang)*80;}
    else if(d0>desired+100){tx=p.x;ty=p.y;}
    else{tx=p.x+Math.cos(ang+Math.PI/2)*strafe*.5;ty=p.y+Math.sin(ang+Math.PI/2)*strafe*.5;}
  }else if(behavior==='Rammer'){
    const lead=75+Math.min(140,d0*.35);
    tx=p.x+Math.cos(ang)*lead;ty=p.y+Math.sin(ang)*lead;
  }
  if(G()?.aiAggressive){
    tx+=(p.x-tx)*.35;ty+=(p.y-ty)*.35;
  }
  e.aiTargetX=tx;e.aiTargetY=ty;
  return {x:tx,y:ty,behavior};
}
window.zombieAI37=zombieAI37;
window.zombieAISeed37=zombieAISeed37;

const extraModifiers37={
  ZombieTactics:{desc:'AI zombies gain speed and tactical pressure. 2.25x rewards.',spawn:.94,reward:2.25,enemy:1.12,aiAggressive:true},
  EndlessNight:{desc:'Enemy waves arrive 30% faster. 2.35x rewards.',spawn:.70,reward:2.35,enemy:1.08},
  IronSkin:{desc:'Enemies have 35% more HP. 2.25x rewards.',spawn:1,reward:2.25,enemy:1.35},
  GlassLife:{desc:'Take 50% more damage. 2.5x rewards.',spawn:1,reward:2.5,enemy:1,damageTakenMult:1.5},
  NoPowerups:{desc:'Power-ups are disabled. 2.2x rewards.',spawn:1,reward:2.2,enemy:1,noPowerups:true},
  Starving:{desc:'Coins are worth 40% less. 2.1x rewards.',spawn:1,reward:2.1,enemy:1,coinMult:.60},
  HyperZombies:{desc:'Zombies move 45% faster. 2.4x rewards.',spawn:1,reward:2.4,enemy:1.12,zombieSpeedMult:1.45},
  BossArmor:{desc:'Bosses take longer to defeat. 2.3x rewards.',spawn:1,reward:2.3,enemy:1.15,bossDamageTakenMult:.70},
  FragileBuild:{desc:'Your max HP is reduced by 25%. 2.0x rewards.',spawn:1,reward:2.0,enemy:1,playerHpMult:.75},
  EliteWorld:{desc:'Elite enemies appear much more often. 2.6x rewards.',spawn:.90,reward:2.6,enemy:1.18,eliteChance:.30},
  Relentless:{desc:'No enemy recovery window. 2.2x rewards.',spawn:.78,reward:2.2,enemy:1.10},
  ApexTrial:{desc:'Hard AI + faster bosses + higher rewards. 3.0x rewards.',spawn:.72,reward:3.0,enemy:1.25,bossEveryMult:.70,aiAggressive:true,zombieSpeedMult:1.25}
};
function installModifiers37(){
  if(typeof runModifiers!=='undefined')Object.entries(extraModifiers37).forEach(([n,v])=>{if(!runModifiers[n])runModifiers[n]=v});
}

const shop37=[
 {id:'forge37',name:'Forge Core Cache',tag:'FORGE',price:350,desc:'+3 Forge Cores',grant:s=>s.forgeCores=(s.forgeCores||0)+3},
 {id:'coins37',name:'Coin Rebate',tag:'ECONOMY',price:700,desc:'+900 coins',grant:s=>s.coins=(s.coins||0)+900},
 {id:'skin37',name:'Skin Case Voucher',tag:'COSMETIC',price:600,desc:'+1 skin case voucher',grant:s=>s.caseCredits=(s.caseCredits||0)+1},
 {id:'xp37',name:'XP Surge Cache',tag:'PROGRESSION',price:500,desc:'+1 Forge Core + next-run XP momentum',grant:s=>{s.forgeCores=(s.forgeCores||0)+1;s.nextRunLuck=(s.nextRunLuck||0)+5}},
 {id:'parts37',name:'Material Crate',tag:'CRAFT',price:450,desc:'+10 materials',grant:s=>s.materials=(s.materials||0)+10},
 {id:'key37',name:'World Key Pack',tag:'WORLD',price:900,desc:'+2 World Keys',grant:s=>s.worldKeys=(s.worldKeys||0)+2},
 {id:'dust37',name:'Mythic Dust',tag:'RARE',price:1200,desc:'+5 Mythic Dust',grant:s=>s.mythicDust=(s.mythicDust||0)+5},
 {id:'core37',name:'Overcharged Core',tag:'FORGE',price:1500,desc:'+8 Forge Cores',grant:s=>s.forgeCores=(s.forgeCores||0)+8},
 {id:'shield37',name:'Shield Cell',tag:'SURVIVAL',price:650,desc:'+1 next-run Shield Cell',grant:s=>s.nextRunShield=(s.nextRunShield||0)+1},
 {id:'luck37',name:'Lucky Cache',tag:'LUCK',price:1000,desc:'+25 next-run Upgrade Luck',grant:s=>s.nextRunLuck=(s.nextRunLuck||0)+25},
 {id:'upgrade37',name:'Upgrade Voucher',tag:'UPGRADE',price:1800,desc:'+1 random permanent upgrade level',grant:s=>{if(typeof permanent==='undefined')return;const a=permanent.filter(u=>(s.upgrades?.[u[0]]||0)<5);if(!a.length)return;const u=a[Math.floor(Math.random()*a.length)];s.upgrades=s.upgrades||{};s.upgrades[u[0]]=(s.upgrades[u[0]]||0)+1}},
 {id:'materials37',name:'Mega Material Box',tag:'CRAFT',price:1000,desc:'+25 materials',grant:s=>s.materials=(s.materials||0)+25}
];
function shopDay37(){return typeof todayKey==='function'?todayKey():new Date().toLocaleDateString('en-CA')}
function shopBought37(){const s=S();const d=shopDay37();if(!s)return {};if(s.dailyShop37Day!==d){s.dailyShop37Day=d;s.dailyShop37Purchases={};persist?.()}return s.dailyShop37Purchases||{}}
function buyShop37(id){
 const s=S(),item=shop37.find(x=>x.id===id);if(!s||!item)return;
 const bought=shopBought37();if(bought[id])return toast('Already purchased today');
 if(Number(s.coins||0)<item.price)return toast('Not enough coins');
 s.coins-=item.price;item.grant(s);bought[id]=true;s.dailyShop37Purchases=bought;s.records=s.records||{};s.records.shopPurchases=(Number(s.records.shopPurchases)||0)+1;persist?.();toast('🛒 '+item.name+' purchased!');dailyShop37();
}
window.buyShop37=buyShop37;
function dailyShop37(){
 const s=S();if(!s)return;const bought=shopBought37();const cards=shop37.map((x,i)=>{const b=!!bought[x.id];return '<button type="button" class="outlast37-shop-card '+(b?'claimed':'')+'" data-shop37="'+E(x.id)+'" '+(b?'disabled':'')+'><span>OFFER '+String(i+1).padStart(2,'0')+'</span><b>'+E(x.name)+'</b><small>'+E(x.tag)+' • '+E(x.desc)+'</small><strong>'+(b?'✓ CLAIMED':'🪙 '+fmt(x.price))+'</strong></button>';}).join('');
 openSub('🛒 DAILY SHOP • 12 OFFERS','<div class="outlast37-shop-head"><div><b>Daily stock is saved to your account.</b><small>One purchase per offer each day • resets at midnight.</small></div><div class="outlast37-shop-day">'+E(shopDay37())+'</div></div><div class="outlast37-shop-grid">'+cards+'</div>');
}

const achievement37Extra=[
 ['Zombie Tactician','Complete a Zombie Tactics run',()=>!!S()?.records?.zombieTacticsRuns],
 ['AI Survivor','Survive a run against tactical AI',()=>Number(S()?.records?.aiKills||0)>=25],
 ['Apex Hunter','Defeat 10 bosses across runs',s=>Number(s.bosses||0)>=10],
 ['Apex Veteran','Defeat 50 bosses across runs',s=>Number(s.bosses||0)>=50],
 ['Apex Legend','Defeat 100 bosses across runs',s=>Number(s.bosses||0)>=100],
 ['Level 200','Reach Best Level 200',s=>Number(s.bestLevel||0)>=200],
 ['Level 250','Reach Best Level 250',s=>Number(s.bestLevel||0)>=250],
 ['Score Titan','Reach a 5,000,000 high score',s=>Number(s.highScore||0)>=5000000],
 ['Score God','Reach a 10,000,000 high score',s=>Number(s.highScore||0)>=10000000],
 ['XP Hoarder','Earn 5,000,000 total XP',s=>Number(S()?.records?.totalXP||0)>=5000000],
 ['Coin Hoarder','Collect 1,000,000 total coins',s=>Number(s.totalCoins||0)>=1000000],
 ['Shopkeeper','Buy 10 daily shop offers',()=>Number(S()?.records?.shopPurchases||0)>=10],
 ['Shop Veteran','Buy 50 daily shop offers',()=>Number(S()?.records?.shopPurchases||0)>=50],
 ['Shop Legend','Buy 150 daily shop offers',()=>Number(S()?.records?.shopPurchases||0)>=150],
 ['Core Analyst','Open 12 Core Systems',()=>Number(S()?.records?.coreSystemsOpened||0)>=12],
 ['Core Specialist37','Open 12 Core dashboards and play 12 maps',()=>Number(S()?.records?.coreSystemsOpened||0)>=12&&Number(S()?.records?.mapsPlayed||0)>=12],
 ['Rarity Expert','See every rarity tier',()=>Number(S()?.records?.rarityTiersSeen||0)>=11],
 ['Rarity Hoarder','Own 5 Legendary+ items',()=>Number(S()?.records?.legendaryPlusOwned||0)>=5],
 ['Wardrobe Engineer','Equip 10 different skins',()=>Number(S()?.records?.skinEquips||0)>=10],
 ['Skin Master','Own 20 skins',s=>Number(s.skinsOwned||0)>=20],
 ['Loadout Engineer','Change your loadout 25 times',()=>Number(S()?.records?.loadoutChanges||0)>=25],
 ['Inventory Architect','Open every inventory category',()=>Number(S()?.records?.inventoryCategoriesOpened||0)>=7],
 ['Modifier Explorer','Try 15 different modifiers',()=>Number(S()?.records?.modifierTypes||0)>=15],
 ['Modifier Master37','Complete 25 modified runs',()=>Number(S()?.records?.modifiedRuns||0)>=25],
 ['Zombie Dodger','Dash 100 times',()=>Number(S()?.records?.totalDodges||0)>=100],
 ['Map Tourist','Play every available map',()=>Number(S()?.records?.mapsVisited||0)>=Object.keys(typeof mapDefs!=='undefined'?mapDefs:{}).length],
 ['Boss Gatekeeper','Defeat a boss without another boss spawning first',()=>Number(S()?.records?.bossGateClears||0)>=1],
 ['Tactical Survivor','Defeat 100 zombies while tactical AI is active',()=>Number(S()?.records?.aiKills||0)>=100],
 ['Core Runner','Start a run with at least 6 core systems active',()=>Number(S()?.records?.coreRuns||0)>=6],
 ['Daily Consistency','Buy at least one shop offer on 7 different days',()=>Number(S()?.records?.shopDays||0)>=7],
 ['Build Historian','Save 5 build presets',()=>Object.keys(S()?.buildPresets||{}).length>=5],
 ['Endgame Architect','Own an Eternal or Omega cosmetic',()=>Number(S()?.records?.legendaryPlusOwned||0)>=1],
 ['Everything Equipped','Equip skin, pet, relic, charm, weapon, and character',()=>!!(S()?.selectedSkin&&S()?.selectedPet&&S()?.selectedRelic&&S()?.selectedCharm&&S()?.selectedWeapon&&S()?.selectedChar)]
];
const extraAchievements37=achievement37Extra;
function installAchievements37(){
 if(typeof achievements==='undefined'||!Array.isArray(achievements))return;
 for(const a of achievement37Extra)if(!achievements.some(x=>x&&x[0]===a[0]))achievements.push(a);
}
function achievements37(){
 installAchievements37();const s=S();if(!s)return;
 const st=Object.assign({},s.stats||{},{
  skinsOwned:Object.keys(s.skins||{}).filter(k=>s.skins[k]).length,
  weaponsOwned:Object.keys(s.unlockedWeapons||{}).filter(k=>s.unlockedWeapons[k]).length,
  prestige:Number(s.prestige||0),
  upgrades:Object.values(s.upgrades||{}).reduce((a,v)=>a+(Number(v)||0),0)
 });
 s.ach=s.ach||{};
 for(const a of achievements){try{if(!s.ach[a[0]]&&typeof a[2]==='function'&&a[2](st))s.ach[a[0]]=true}catch(_){}}
 s.records=s.records||{};persist?.();
 const unlocked=achievements.filter(a=>s.ach[a[0]]),next=achievements.filter(a=>!s.ach[a[0]]);
 const card=a=>'<div class="outlast37-ach-card '+(s.ach[a[0]]?'done':'')+'"><b>'+(s.ach[a[0]]?'✓ ':'□ ')+E(a[0])+'</b><small>'+E(a[1])+'</small></div>';
 openSub('🏆 ACHIEVEMENTS • '+unlocked.length+'/'+achievements.length,'<div class="outlast37-summary"><b>MORE GOALS, MORE REASONS TO PLAY</b><small>Combat • bosses • cosmetics • shop • AI • cores • endgame</small></div><h3>Unlocked</h3><div class="outlast37-ach-grid">'+unlocked.map(card).join('')+'</div><h3>Next Targets</h3><div class="outlast37-ach-grid">'+next.slice(0,28).map(card).join('')+'</div>');
}
function stats37(){
 const s=S(),r=s?.records||{},st=s?.stats||{},g=G(),p=g?.player;
 if(!s)return;
 s.records.statsOpened=(Number(s.records.statsOpened)||0)+1;persist?.();
 const boxes=[
  ['Games',st.games],['Kills',st.kills],['Bosses',st.bosses],['High Score',st.highScore],['Best Level',st.bestLevel],
  ['Best Time',Math.floor(st.bestTime||0)+'s'],['Best Combo',r.bestCombo],['Best Damage',fmt(r.bestDamage)],['Maps Played',r.mapsPlayed],
  ['Modified Runs',r.modifiedRuns],['Shop Purchases',r.shopPurchases],['Core Dashboards',r.coreSystemsOpened],['Skins Owned',Object.keys(s.skins||{}).filter(k=>s.skins[k]).length],
  ['Weapons Owned',Object.keys(s.unlockedWeapons||{}).filter(k=>s.unlockedWeapons[k]).length],['Pets Owned',Object.keys(s.pets||{}).filter(k=>s.pets[k]).length],
  ['Relics Owned',Object.keys(s.relics||{}).filter(k=>s.relics[k]).length],['Charms Owned',Object.keys(s.charms||{}).filter(k=>s.charms[k]).length],
  ['Forge Cores',s.forgeCores],['World Keys',s.worldKeys],['Materials',s.materials],['Mythic Dust',s.mythicDust],
  ['Permanent Levels',Object.values(s.upgrades||{}).reduce((a,v)=>a+(Number(v)||0),0)],['Prestige',s.prestige],['Battle Pass XP',s.battlePassXP],
  ['Boss Gate Clears',r.bossGateClears],['AI Kills',r.aiKills],['Skin Equips',r.skinEquips],['Inventory Categories',r.inventoryCategoriesOpened]
 ];
 if(g&&g.running)boxes.push(['LIVE Level',g.level],['LIVE Time',Math.floor(g.time)+'s'],['LIVE Zombies',g.enemies.length],['LIVE Damage',Math.round(p?.damage||0)],['LIVE Temp Shield',Number(p?.shield||0).toFixed(1)+'s'],['LIVE Omega Shield',Math.floor(p?.omegaShieldHits||0)+'/'+Math.floor(p?.omegaShieldMaxHits||0)]);
 const grid=boxes.map(x=>'<div class="outlast37-stat"><small>'+E(x[0])+'</small><b>'+E(x[1]==null?'0':String(x[1]))+'</b></div>').join('');
 openSub('📊 STATS • FULL RUN PROFILE','<div class="outlast37-stat-grid">'+grid+'</div><div class="outlast37-summary"><b>12 CORE ENGINE</b><small>Combat, Enemies, Bosses, World, Events, Progression, Cosmetics, Objectives, Economy, Modes, Support, Generation are live services in this build.</small></div>');
}
function inventory37(tab){
 const s=S();if(!s)return;
 s.records=s.records||{};s.records.inventoryOpened=(Number(s.records.inventoryOpened)||0)+1;
 const cats=[['character','🧍 Characters'],['weapon','⚔ Weapons'],['skin','✦ Skins'],['pet','🐾 Pets'],['relic','🧿 Relics'],['charm','🪬 Charms']];
 const summary='<div class="outlast37-loadout"><b>CURRENT LOADOUT</b><small>'+E(s.selectedChar)+' • '+E(s.selectedWeapon)+' • '+E(s.selectedSkin)+' • '+E(s.selectedPet)+' • '+E(s.selectedRelic)+' • '+E(s.selectedCharm)+'</small></div>';
 const buttons=cats.map(x=>'<button type="button" class="outlast37-tab" data-inventory37="'+x[0]+'">'+x[1]+'</button>').join('');
 const own=o=>Object.keys(o||{}).filter(k=>o[k]).length;
 if(!tab){openSub('🎒 INVENTORY • CLEAN LOADOUT',summary+'<div class="outlast37-inventory-tabs">'+buttons+'</div><div class="outlast37-inventory-grid"><div class="outlast37-inventory-card"><b>CHARACTERS</b><strong>'+own(s.unlockedChars)+'</strong></div><div class="outlast37-inventory-card"><b>WEAPONS</b><strong>'+own(s.unlockedWeapons)+'</strong></div><div class="outlast37-inventory-card"><b>SKINS</b><strong>'+own(s.skins)+'</strong></div><div class="outlast37-inventory-card"><b>PETS</b><strong>'+own(s.pets)+'</strong></div><div class="outlast37-inventory-card"><b>RELICS</b><strong>'+own(s.relics)+'</strong></div><div class="outlast37-inventory-card"><b>CHARMS</b><strong>'+own(s.charms)+'</strong></div></div>');return}
 s.records.inventoryCategoriesOpened=(Number(s.records.inventoryCategoriesOpened)||0)+1;persist?.();
 try{renderInventoryTab(tab)}catch(_){openSub('🎒 Inventory',summary+'<div class="outlast37-inventory-tabs">'+buttons+'</div>')}
}
function core37(section){
 const s=S();if(!s)return;
 s.records=s.records||{};s.records.coreSystemsOpened=(Number(s.records.coreSystemsOpened)||0)+1;persist?.();
 const names=[
  ['combat','⚔ Combat','Live weapon, damage, crit, projectile and upgrade systems'],
  ['enemies','☠ Enemies','150+ enemy definitions plus active zombie AI behaviors'],
  ['bosses','♛ Bosses','One-live-boss gate, phases, boss rewards and boss tracking'],
  ['world','🌎 World','Maps, obstacles, hazards, zones and world interactions'],
  ['events','⚡ Events','Run events, world events and map events'],
  ['progression','★ Progression','Permanent upgrades, skill trees, prestige and battle pass'],
  ['cosmetics','✦ Cosmetics','Skins, characters, pets, relics, charms and titles'],
  ['objectives','🎯 Objectives','World objectives, quests and milestones'],
  ['economy','🪙 Economy','Coins, keys, shop, crafting and rewards'],
  ['modes','🎲 Game Modes','Classic, Endless, Speed Run, Boss Rush, Global and Arena'],
  ['support','🛠 Support','Save, chat, feedback, mandatory update and runtime recovery'],
  ['generation','🧬 Generation','298+ upgrade choices and generated content combinations']
 ];
 const audit=window.OUTLAST_CORE_CONTENT?.audit?window.OUTLAST_CORE_CONTENT.audit():null;
 if(section){
   const key=names.find(x=>x[0]===section),data=window.OUTLAST_CORE_CONTENT?.data?.[section];
   const count=Array.isArray(data)?data.length:(audit?.[section]||'ACTIVE');
   openSub('🧩 CORE • '+(key?.[1]||section),'<div class="outlast37-summary"><b>LIVE SYSTEM</b><small>'+E(key?.[2]||'Core system active')+'</small><strong>'+E(String(count))+' ACTIVE ENTRIES</strong></div>'+('<div class="outlast37-core-list">'+(Array.isArray(data)?data.slice(0,36).map(x=>'<div class="outlast37-core-item"><b>'+E(x.name||'Core Entry')+'</b><small>'+E([x.tier,x.biome,x.behavior,x.projectile,x.attack,x.reward].filter(Boolean).join(' • '))+'</small></div>').join(''):'<div class="outlast37-core-item"><b>ACTIVE</b><small>Runtime service is enabled for this core.</small></div>')+'</div>'));
   return;
 }
 const buttons=names.map(x=>'<button type="button" class="outlast37-core-btn" data-core37="'+x[0]+'"><b>'+x[1]+'</b><small>'+x[2]+'</small><strong>OPEN</strong></button>').join('');
 openSub('🧩 12 CORE SYSTEMS • LIVE', '<div class="outlast37-summary"><b>THE 12 CORE SYSTEMS ARE NOW FUNCTIONAL UI</b><small>Each button opens active systems/data instead of being a static content catalog.</small></div><div class="outlast37-core-grid">'+buttons+'</div>');
}

function skin37(){
 const s=S();if(!s)return;
 s.skins=s.skins||{Classic:true};s.records=s.records||{};
 const owned=Object.keys(skins||{}).filter(n=>s.skins[n]);
 const cards=owned.map(n=>{const v=skins[n];return '<button type="button" class="outlast37-skin-card '+(s.selectedSkin===n?'equipped':'')+'" data-skin37="'+E(n)+'"><b>'+E(n)+'</b><small>'+E(v.rarity||'Common')+' • '+E(v.bonus||'No bonus')+'</small><strong>'+(s.selectedSkin===n?'✓ EQUIPPED':'EQUIP')+'</strong></button>';}).join('');
 openSub('✦ SKINS • EQUIPPED BONUSES', '<div class="outlast37-summary"><b>'+E(s.selectedSkin||'Classic')+' EQUIPPED</b><small>Skins apply their HP, damage, speed, crit, XP, coin and boss bonuses when a run starts.</small></div><div class="outlast37-skin-grid">'+(cards||'<div class="outlast37-core-item">No skins unlocked yet.</div>')+'</div><button type="button" class="gold" data-action="case">OPEN SKIN CASE — 250 COINS / 1 VOUCHER</button>');
}
function equipSkin37(name){
 const s=S();if(!s||!skins[name])return toast('Unknown skin');
 if(!s.skins?.[name])return toast('Open Skin Cases to unlock this skin');
 s.selectedSkin=name;s.records=s.records||{};s.records.skinEquips=(Number(s.records.skinEquips)||0)+1;
 s.records.legendaryPlusOwned=Object.keys(s.skins||{}).filter(k=>s.skins[k]&&skins[k]&&['Legendary','Mythic','Divine','Celestial','Transcendent','Eternal','Omega'].includes(skins[k].rarity)).length;
 persist?.();toast('✦ Equipped '+name);skin37();
}
window.applySkin37=function(p,skin){
 if(!p||!skin)return;
 p.skinBonuses={hp:Number(skin.hp||0),damage:Number(skin.damage||0),speed:Number(skin.speed||0),crit:Number(skin.crit||0),xp:Number(skin.xp||0),coins:Number(skin.coins||0),boss:Number(skin.boss||0)};
};
window.selectSkin=equipSkin37;
window.openSkinMenu=skin37;

function progress37(){
 const page=document.querySelector('[data-page-content="progress"]');if(!page)return;
 // Canonical entry points for Inventory, Skins, Daily Shop, and Run Modifiers live in Progress.
 // Remove their legacy cards from Inventory/Loadout to prevent duplicate navigation.
 for(const id of ['inventoryBtn','skinBtn','shopBtn','modifierBtn']){
   const button=document.getElementById(id);
   const card=button?.closest('.menu-card');
   if(card)card.remove();
 }
 // The old collection hub is replaced by direct Progress buttons.
 for(const button of [...document.querySelectorAll('#menu button')]){
   if(String(button.textContent||'').toLowerCase().includes('new content / collection')){
     button.closest('.menu-card')?.remove();
     button.remove();
   }
 }
 document.getElementById('progressSystems36')?.remove();
 page.querySelector('#extrasBtn')?.closest('.menu-card')?.remove();
 let deck=document.getElementById('progressDeck37');
 if(!deck){
   deck=document.createElement('div');deck.id='progressDeck37';deck.className='outlast37-progress-deck';
   const groups=[
    ['📊 TRACKING',['progressStats37','📊 Stats','stats'],['progressStatsDetails37','📈 Live Stats','statsLive'],['progressAchievements37','🏆 Achievements','achievements'],['progressRecords37','🥇 Records','records'],['progressLeaderboard37','📈 Leaderboards','leaderboard']],
    ['✦ COLLECTION',['progressInventory37','🎒 Inventory','inventory'],['progressSkins37','✦ Skins','skins'],['progressCodex37','☠ Zombie Codex','codex'],['progressSets37','🧿 Build Sets','sets']],
    ['🧩 SYSTEMS',['progressCore37','🧩 12 Core Systems','core'],['progressUpgrade37','⛭ Upgrade Tree','upgrade'],['progressShop37','🛒 Daily Shop','shop'],['progressModifiers37','🎲 Run Modifiers','modifiers'],['progressEvolution37','⚔ Weapon Evolutions','evolution']],
    ['♛ ENDGAME',['progressBattlePass37','🏆 Battle Pass','battle'],['progressPrestige37','★ Prestige','prestige'],['progressRarity37','✦ Rarity Ladder','rarity'],['progressWorldBoss37','♛ World Bosses','worldboss'],['progressRooms37','▣ Secret Rooms','rooms']]
   ];
   deck.innerHTML=groups.map(g=>'<section class="outlast37-progress-group"><h3>'+g[0]+'</h3><div class="outlast37-progress-grid">'+g.slice(1).map(x=>'<button type="button" class="menu-btn" id="'+x[0]+'">'+x[1]+'</button>').join('')+'</div></section>').join('');
   page.querySelector('.menu-cards')?.replaceWith(deck);
 }
 const bind=(id,fn)=>{const b=document.getElementById(id);if(b)b.onclick=e=>{e.preventDefault();e.stopPropagation();fn();}};
 bind('progressStats37',stats37);bind('progressStatsDetails37',stats37);bind('progressAchievements37',achievements37);bind('progressRecords37',()=>renderRecords());bind('progressLeaderboard37',()=>openServerLeaderboard());
 bind('progressInventory37',()=>inventory37());bind('progressSkins37',skin37);bind('progressCodex37',()=>renderCodex());bind('progressSets37',()=>renderSets());
 bind('progressCore37',()=>core37());bind('progressUpgrade37',()=>renderUpgradeTree());bind('progressShop37',dailyShop37);bind('progressModifiers37',modifiers37);bind('progressEvolution37',()=>renderWeaponTree());
 bind('progressBattlePass37',()=>renderBattlePass());bind('progressPrestige37',()=>renderPrestige());bind('progressRarity37',()=>renderRarities());bind('progressWorldBoss37',()=>renderWorldBosses());bind('progressRooms37',()=>renderRooms());
}
function modifiers37(){
 const s=S();if(!s)return;const all=Object.keys(runModifiers||{}).filter(n=>n!=='None');
 const cards=all.map(n=>{const v=runModifiers[n]||{};return '<button type="button" class="outlast37-mod-card '+(s.selectedModifier===n?'selected':'')+'" data-mod37="'+E(n)+'"><b>'+E(n)+'</b><small>'+E(v.desc||'')+'</small><strong>Reward ×'+Number(v.reward||1).toFixed(2)+' • Enemy ×'+Number(v.enemy||1).toFixed(2)+' • Spawn ×'+Number(v.spawn||1).toFixed(2)+'</strong></button>';}).join('');
 openSub('🎲 RUN MODIFIERS • EXPANDED','<div class="outlast37-summary"><b>BUILD YOUR RUN</b><small>Primary modifier plus up to two Run Builder modifiers. Higher reward multipliers mean tougher runs.</small></div><div class="outlast37-mod-grid">'+cards+'</div>');
}
function installCss37(){
 if(document.getElementById('outlast-v3370-css'))return;
 const st=document.createElement('style');st.id='outlast-v3370-css';
 st.textContent='html:not(.outlast-owner-access) #ownerPanelCard,html:not(.outlast-owner-access) #ownerBtn{display:none!important}.outlast37-progress-deck{display:grid;gap:14px}.outlast37-progress-group{padding:14px;border:1px solid #2d4154;border-radius:18px;background:#0f1821;box-shadow:0 8px 24px rgba(0,0,0,.18)}.outlast37-progress-group h3{margin:0 0 10px;font-size:12px;letter-spacing:.11em;color:#9bc6df}.outlast37-progress-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.outlast37-progress-grid .menu-btn{margin:0!important}.outlast37-summary{display:grid;gap:5px;padding:13px;border:1px solid #2d4154;border-radius:14px;background:#111d27;margin-bottom:12px}.outlast37-summary b{font-size:14px}.outlast37-summary small{color:#9bb1bf;line-height:1.45}.outlast37-summary strong{font-size:12px;color:#8fd4ff}.outlast37-stat-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.outlast37-stat{padding:11px;border-radius:12px;border:1px solid #2a4051;background:#12202a}.outlast37-stat small{display:block;color:#8098a8;font-size:10px}.outlast37-stat b{display:block;font-size:18px;margin-top:4px}.outlast37-shop-head{display:flex;justify-content:space-between;gap:12px;padding:13px;border:1px solid #2d4154;border-radius:14px;background:#111d27}.outlast37-shop-head small{display:block;color:#8fa6b5;margin-top:3px}.outlast37-shop-day{font-weight:900;color:#8fd4ff}.outlast37-shop-grid,.outlast37-skin-grid,.outlast37-core-grid,.outlast37-mod-grid,.outlast37-ach-grid,.outlast37-inventory-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin-top:12px}.outlast37-shop-card,.outlast37-skin-card,.outlast37-core-btn,.outlast37-mod-card,.outlast37-ach-card,.outlast37-inventory-card{border:1px solid #30495b;border-radius:13px;background:#12202a;color:#fff;padding:12px;text-align:left}.outlast37-shop-card{min-height:122px;display:grid;gap:5px}.outlast37-shop-card span{font-size:10px;color:#83aac6;font-weight:900}.outlast37-shop-card b,.outlast37-skin-card b,.outlast37-core-btn b,.outlast37-mod-card b,.outlast37-ach-card b{font-size:14px}.outlast37-shop-card small,.outlast37-skin-card small,.outlast37-core-btn small,.outlast37-mod-card small,.outlast37-ach-card small{display:block;color:#9bb1bf;line-height:1.35}.outlast37-shop-card strong,.outlast37-skin-card strong,.outlast37-core-btn strong,.outlast37-mod-card strong{display:block;margin-top:auto;color:#8fd4ff;font-size:11px}.outlast37-shop-card.claimed,.outlast37-skin-card.equipped,.outlast37-ach-card.done{opacity:.76;border-color:#4e8b67}.outlast37-core-btn{min-height:142px;display:grid;gap:5px;cursor:pointer}.outlast37-core-item{padding:10px;border:1px solid #294354;border-radius:11px;background:#101a22}.outlast37-core-item small{display:block;color:#94abba;margin-top:4px}.outlast37-mod-card{min-height:122px;display:grid;gap:6px;cursor:pointer}.outlast37-mod-card.selected{border-color:#6eaa7e;box-shadow:0 0 0 1px #6eaa7e inset}.outlast37-ach-card{min-height:82px}.outlast37-loadout{padding:12px;border-radius:13px;border:1px solid #2d4154;background:#101b24}.outlast37-loadout small{display:block;color:#9bb1bf;margin-top:4px}.outlast37-inventory-tabs{display:flex;flex-wrap:wrap;gap:8px}.outlast37-tab{border:1px solid #2d4154;border-radius:999px;padding:8px 11px;background:#12202a;color:#fff}.outlast37-inventory-card{display:grid;gap:4px;text-align:center}.outlast37-inventory-card b{font-size:11px;color:#91a7b6}.outlast37-inventory-card strong{font-size:20px}.outlast37-skin-card{min-height:105px;display:grid;gap:5px;cursor:pointer}@media(max-width:760px){.outlast37-progress-grid,.outlast37-stat-grid,.outlast37-shop-grid,.outlast37-skin-grid,.outlast37-core-grid,.outlast37-mod-grid,.outlast37-ach-grid,.outlast37-inventory-grid{grid-template-columns:1fr}.outlast37-shop-head{display:grid}.outlast37-progress-group{padding:11px}}';
 document.head.appendChild(st);
}
function syncOwnerLauncher37(){
 const card=document.getElementById('ownerPanelCard'),btn=document.getElementById('ownerBtn');
 const ok=typeof isOwner==='function'&&isOwner();
 document.documentElement.classList.toggle('outlast-owner-access',ok);
 document.body?.classList.toggle('outlast-owner-access',ok);
 if(card)card.style.display=ok?'':'none';
 if(btn)btn.style.display=ok?'':'none';
}
function runtimeSkinAudit37(){
 try{
  const s=S();if(!s)return;
  const v=skins[s.selectedSkin]||skins.Classic;
  const g=G();if(g?.player)window.applySkin37(g.player,v);
 }catch(_){}
}
function installEventDelegates37(){
 document.addEventListener('click',e=>{
  const sb=e.target.closest?.('[data-shop37]');if(sb){e.preventDefault();e.stopPropagation();buyShop37(sb.dataset.shop37);return;}
  const sk=e.target.closest?.('[data-skin37]');if(sk){e.preventDefault();e.stopPropagation();equipSkin37(sk.dataset.skin37);return;}
  const core=e.target.closest?.('[data-core37]');if(core){e.preventDefault();e.stopPropagation();core37(core.dataset.core37);return;}
  const inv=e.target.closest?.('[data-inventory37]');if(inv){e.preventDefault();e.stopPropagation();const s=S();s.records=s.records||{};s.records.inventoryCategoriesOpened=(Number(s.records.inventoryCategoriesOpened)||0)+1;persist?.();inventory37(inv.dataset.inventory37);return;}
  const mod=e.target.closest?.('[data-mod37]');if(mod){e.preventDefault();e.stopPropagation();const s=S();if(s){s.selectedModifier=mod.dataset.mod37;s.records=s.records||{};s.records.modifierTypes=Math.max(Number(s.records.modifierTypes)||0,Number(s.records.modifierTypesSeen||0)+1);persist?.();toast('🎲 Selected '+s.selectedModifier);modifiers37();}return;}
 },true);
}
function installRuntimeFlags37(){
 window.OUTLAST_BUILD=VERSION;window.OUTLAST_VERSION='v'+VERSION;window.OUTLAST_CORE_CONTENT_MODE='LIVE';window.OUTLAST_UI_SYSTEM_VERSION=VERSION;
 const chip=document.querySelector('#menu .menu-chip');if(chip)chip.textContent='v3.37.3 • SURVIVOR HUB';
 document.title='OUTLAST v3.37.3';
 document.querySelectorAll('[data-outlast-version]').forEach(e=>e.textContent='v3.37.3');
 const a=document.querySelector('meta[name="outlast-build"]');if(a)a.content=VERSION;
 const b=document.querySelector('meta[name="build-version"]');if(b)b.content=VERSION;
 const s=S();if(s){s.records=s.records||{};s.records.legendaryPlusOwned=Object.keys(s.skins||{}).filter(k=>s.skins[k]&&skins[k]&&['Legendary','Mythic','Divine','Celestial','Transcendent','Eternal','Omega'].includes(skins[k].rarity)).length;persist?.();}
}
function install37(){
 if(window.__OUTLAST37_INSTALLED)return;window.__OUTLAST37_INSTALLED=true;
 installModifiers37();installAchievements37();installCss37();installEventDelegates37();progress37();syncOwnerLauncher37();runtimeSkinAudit37();installRuntimeFlags37();window.makeChoices=authoritativeUpgradeChoice37;
 window.dailyShopOpen=dailyShop37;window.shopOpen=dailyShop37;window.renderExpandedStats=stats37;window.renderExpandedInventory=inventory37;window.renderExpandedModifiers=modifiers37;
 window.renderCoreSystems=core37;window.syncOwnerLauncher=syncOwnerLauncher37;window.OUTLAST_37_READY=true;
 const style=document.getElementById('outlast-v3370-css');if(style)document.documentElement.dataset.outlast3370='ready';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install37,{once:true});else install37();
setTimeout(install37,0);
setTimeout(()=>{try{syncOwnerLauncher37()}catch(_){}} ,1200);
setInterval(()=>{try{syncOwnerLauncher37();runtimeSkinAudit37()}catch(_){}} ,2500);
})();
