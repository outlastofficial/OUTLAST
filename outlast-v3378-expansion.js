/* OUTLAST v3.37.8 — Thorns, Expanded Arenas, 133 Upgrade Cards, Boss Reliability + Ultimate Fix */
(function(){
'use strict';
const VERSION='3.37.11';
const TIERS=['Common','Uncommon','Rare','Epic','Legendary','Mythic','Divine','Celestial','Transcendent','Eternal','Omega'];
const MULT={Common:1,Uncommon:1.15,Rare:1.35,Epic:1.6,Legendary:1.9,Mythic:2.25,Divine:4,Celestial:5,Transcendent:6,Eternal:7,Omega:8};
const fmt=n=>String(Number(Number(n).toFixed(1)));
const MAPS={
 Forest:['Tree','Rock','Log','FallenTree'],Desert:['Cactus','Rock','DuneRock','Ruins'],Snow:['SnowBank','IceRock','IceBlock','IceCave'],
 Lava:['LavaRock','ObsidianPillar','Rock'],City:['Car','Barrier','Truck','Dumpster'],Hospital:['Bed','Cabinet','Generator','Bench'],
 Laboratory:['Crate','Tank','Console','Containment'],Subway:['Bench','Pillar','SignalBox'],Prison:['CellBlock','Barrier','WatchTower'],
 MilitaryBase:['Sandbags','Vehicle','Crates','Bunker'],RuinedTown:['Rubble','Wall','RuinedHouse'],Harbor:['Container','Crane','Boat','DockWall'],
 Bunker:['BlastDoor','Console','Barrier'],Swamp:['DeadTree','MudPatch','ReedBed','BogRock'],Skyscraper:['Desk','Column','Generator','Elevator'],
 Wasteland:['Wreck','Rock','Barrier','Bunker'],Seizure:['PrismBlock','Anchor'],Ribhouse:['Booth','Grill','RibPlatter','SauceRack']
};
const POSITIONS=[
 [3210,250,140,90],[3460,520,180,70],[3740,790,130,150],[3250,1080,210,55],
 [3500,1370,135,110],[3770,1660,180,75],[3270,1950,140,120],[3530,2240,190,70],
 [3780,2530,125,140],[2360,2690,180,60],[650,2700,145,90]
];
const FAMILIES=[
 {name:'Thorns',desc:m=>'Deal '+fmt(8*m)+'% of your damage to nearby enemies when you take a hit.',apply:(p,m)=>{p.thorns=(Number(p.thorns)||0)+.08*m;p.thornsRadius=Math.max(Number(p.thornsRadius)||0,180);}},
 {name:'Armor Weave',desc:m=>'Take '+fmt(2*m)+'% less damage from each hit.',apply:(p,m)=>{p.damageTakenMult=(Number(p.damageTakenMult)||1)*(1-Math.min(.75,.02*m));}},
 {name:'Ultimate Charge',desc:m=>'Gain '+fmt(4*m)+'% more ultimate charge from kills.',apply:(p,m)=>{p.ultGain=(Number(p.ultGain)||1)*(1+.04*m);}},
 {name:'Ultimate Force',desc:m=>'Deal '+fmt(6*m)+'% more damage with your ultimate.',apply:(p,m)=>{p.ultDamage=(Number(p.ultDamage)||1)*(1+.06*m);}},
 {name:'Boss Hunter',desc:m=>'Deal '+fmt(5*m)+'% more damage to bosses.',apply:(p,m)=>{p.bossMult=(Number(p.bossMult)||1)*(1+.05*m);}},
 {name:'Critical Force',desc:m=>'Add '+fmt(8*m)+'% critical-hit damage.',apply:(p,m)=>{p.critMult=(Number(p.critMult)||1.8)+.08*m;}},
 {name:'Loot Magnet',desc:m=>'Increase pickup range by '+fmt(22*m)+'.',apply:(p,m)=>{p.magnet=(Number(p.magnet)||0)+22*m;}},
 {name:'Coin Cache',desc:m=>'Earn '+fmt(2.5*m)+'% more coins.',apply:(p,m)=>{p.coinMult=(Number(p.coinMult)||1)*(1+.025*m);}},
 {name:'XP Conduit',desc:m=>'Gain '+fmt(3.5*m)+'% more XP.',apply:(p,m)=>{p.xpBonus=(Number(p.xpBonus)||1)*(1+.035*m);}},
 {name:'Combat Might',desc:m=>'Increase weapon damage by '+fmt(4*m)+'%.',apply:(p,m)=>{p.damage=(Number(p.damage)||1)*(1+.04*m);}},
 {name:'Rapid Fire',desc:m=>'Attack '+fmt(2.5*m)+'% faster.',apply:(p,m)=>{p.fireRate=Math.max(.08,(Number(p.fireRate)||.45)/(1+.025*m));}},
 {name:'Longshot',desc:m=>'Increase weapon range by '+fmt(20*m)+'.',apply:(p,m)=>{p.range=(Number(p.range)||0)+20*m;}}
];
let cardsRegistered=false,mapsExpanded=false,thornsWrapped=false,ultimateWrapped=false;
function addUpgradeCards(){
 if(cardsRegistered)return true;
 if(typeof tempUp==='undefined'||!Array.isArray(tempUp))return false;
 if(!window.OUTLAST_UPGRADE_RARITY_POOLS||typeof window.OUTLAST_UPGRADE_RARITY_POOLS!=='object')return false;
 const pools=window.OUTLAST_UPGRADE_RARITY_POOLS;
 const byName=window.OUTLAST_UPGRADE_RARITY_BY_NAME||(window.OUTLAST_UPGRADE_RARITY_BY_NAME={});
 for(const tier of TIERS){
  if(!Array.isArray(pools[tier]))pools[tier]=[];
  const mult=MULT[tier];
  for(const family of FAMILIES){
   const name=tier+' '+family.name;
   if(!tempUp.some(x=>x&&x[0]===name)){
    tempUp.push([name,function(v){return family.desc(Number(v)||mult);},function(v){
     const p=(typeof game!=='undefined'&&game)?game.player:null;if(!p)return;
     family.apply(p,Number(v)||mult);
    }]);
   }
   if(!pools[tier].includes(name))pools[tier].push(name);
   byName[name]=tier;
  }
 }
 if(!tempUp.some(x=>x&&x[0]==='Thorns')){
  tempUp.push(['Thorns',function(v){return FAMILIES[0].desc(Number(v)||MULT.Rare);},function(v){
   const p=(typeof game!=='undefined'&&game)?game.player:null;if(!p)return;
   FAMILIES[0].apply(p,Number(v)||MULT.Rare);
  }]);
 }
 if(!pools.Rare.includes('Thorns'))pools.Rare.push('Thorns');
 byName.Thorns='Rare';
 const unique=[...new Set(Object.values(pools).flat().filter(Boolean))];
 window.OUTLAST_UPGRADE_LIBRARY_COUNT=unique.length;
 window.OUTLAST_V3378_ADDED_UPGRADES=FAMILIES.length*TIERS.length+1;
 window.OUTLAST_UPGRADE_LIBRARY_VERSION=VERSION;
 cardsRegistered=true;
 return true;
}
function expandMaps(){
 if(mapsExpanded)return true;
 if(typeof mapObstacles==='undefined'||!mapObstacles||typeof mapObstacles!=='object')return false;
 let added=0;
 for(const [map,types] of Object.entries(MAPS)){
  if(!Array.isArray(mapObstacles[map]))continue;
  for(let i=0;i<POSITIONS.length;i++){
   const pos=POSITIONS[i],type=types[i%types.length],item=[type,pos[0],pos[1],pos[2],pos[3]];
   const key=item.join('|');
   if(!mapObstacles[map].some(o=>Array.isArray(o)&&o.slice(0,5).join('|')===key)){mapObstacles[map].push(item);added++;}
  }
 }
 window.OUTLAST_MAP_SIZE={width:4000,height:3000};
 window.OUTLAST_MAP_EXPANSION_VERSION=VERSION;
 window.OUTLAST_MAP_EXPANSION_ADDED_OBJECTS=added;
 mapsExpanded=true;
 return true;
}
function wrapThorns(){
 if(thornsWrapped||typeof window.outlastTakePlayerDamage!=='function')return;
 const original=window.outlastTakePlayerDamage;
 const wrapped=function(player,amount,reason,minHp){
  const before=Number(player&&player.hp);
  const result=original.apply(this,arguments);
  try{
   const g=typeof game!=='undefined'?game:null;
   if(!g||player!==g.player||!player||!(Number(player.thorns)>0)||!(Number(player.hp)<before))return result;
   const now=Date.now();
   if(now<Number(player.__outlastThornsReadyAt||0))return result;
   player.__outlastThornsReadyAt=now+550;
   const radius=Math.max(80,Number(player.thornsRadius)||180);
   let hits=0;
   for(let i=g.enemies.length-1;i>=0;i--){
    const e=g.enemies[i];if(!e||e.__dead||Number(e.hp)<=0)continue;
    if(Math.hypot(Number(e.x)-Number(player.x),Number(e.y)-Number(player.y))>radius)continue;
    if(typeof damageEnemy!=='function')continue;
    damageEnemy(e,Math.max(1,(Number(player.damage)||1)*Number(player.thorns)));
    hits++;
    if(Number(e.hp)<=0&&typeof killEnemy==='function')killEnemy(i);
   }
   if(hits){if(typeof ring==='function')ring(player.x,player.y,'#baf7ff',radius,.32);if(typeof burst==='function')burst(player.x,player.y,'#baf7ff',10,95);}
  }catch(err){window.OUTLAST_THORNS_ERROR=String(err&&err.message||err);}
  return result;
 };
 window.outlastTakePlayerDamage=wrapped;
 try{outlastTakePlayerDamage=wrapped;}catch(_){}
 thornsWrapped=true;
 window.OUTLAST_THORNS_READY=true;
}
function wrapUltimate(){
 if(ultimateWrapped||typeof window.useUltimate!=='function')return;
 const wrapped=function(){
  const g=typeof game!=='undefined'?game:null,p=g&&g.player;
  if(!g||!g.running||g.paused||g.upgradeOpen||!p)return false;
  const charge=Math.max(0,Number(p.ult)||0);
  if(charge<100){if(typeof toast==='function')toast('⚡ ULTIMATE CHARGING • '+Math.floor(charge)+'%');return false;}
  p.ult=0;
  const base=Math.max(120,(Number(p.damage)||20)*6)*(Number(p.ultDamage)||1);
  let hits=0;
  if(typeof ring==='function')ring(p.x,p.y,'#74e7ff',Math.min(520,Math.max(280,Math.min(CW,CH)*.85)),.75);
  if(typeof burst==='function')burst(p.x,p.y,'#74e7ff',42,280);
  g.shake=Math.max(Number(g.shake)||0,.42);
  for(let i=g.enemies.length-1;i>=0;i--){
   const e=g.enemies[i];if(!e||e.__dead||Number(e.hp)<=0)continue;
   if(typeof damageEnemy!=='function')continue;
   damageEnemy(e,base);hits++;
   if(Number(e.hp)<=0&&typeof killEnemy==='function')killEnemy(i);
  }
  if(typeof toast==='function')toast('⚡ ULTIMATE RELEASED • '+hits+' TARGETS HIT');
  return true;
 };
 window.useUltimate=wrapped;
 try{useUltimate=wrapped;}catch(_){}
 ultimateWrapped=true;
 window.OUTLAST_ULTIMATE_READY=true;
}
function installVersionAndHelp(){
 window.OUTLAST_BUILD=VERSION;window.OUTLAST_VERSION='v'+VERSION;document.title='OUTLAST v'+VERSION;
 const meta=document.querySelector('meta[name="outlast-build"]');if(meta)meta.content=VERSION;
 const buildMeta=document.querySelector('meta[name="build-version"]');if(buildMeta)buildMeta.content=VERSION;
 document.querySelectorAll('[data-outlast-version]').forEach(el=>el.textContent='v'+VERSION);
 document.querySelectorAll('.menu-chip').forEach(el=>{if(/SURVIVOR HUB/i.test(String(el.textContent||'')))el.textContent='v'+VERSION+' • SURVIVOR HUB';});
 if(typeof updates!=='undefined'&&Array.isArray(updates)&&!updates.some(x=>x&&String(x[0]).includes('v3.37.8'))){
  updates.unshift(['v3.37.8 — Thorns, 133 Extra Upgrades, Expanded Maps + Combat Fixes','Added the Thorns counterattack upgrade and 132 additional rarity-scaled cards; expanded every built-in arena to 4000 × 3000 with more map-specific cover; aligned boss timers, retried failed spawns, and moved bosses into the visible fight; rebuilt rarity-specific upgrade reveal animations; repaired ultimate charge feedback and its full-charge area attack; removed the stray bottom release-note block and moved Chat away from the bottom edge.']);
  if(typeof updates!=='undefined'&&Array.isArray(updates)&&!updates.some(x=>x&&String(x[0]).includes('v3.37.9'))){updates.unshift(['v3.37.9 — Map Picker Overlay Fix','Fixed the map picker visibility and closing behavior, restored the Map Creator launcher, and expanded regression checks for map selection, Thorns, ultimate firing and boss visibility.']);}
  if(typeof updates!=='undefined'&&Array.isArray(updates)&&!updates.some(x=>x&&String(x[0]).includes('v3.37.10'))){updates.unshift(['v3.37.10 — Restore Map Picker Route After Load','Fixed the delayed Map Creator initializer overwriting Choose Map, explicitly restored the modern picker after load, and exposed a stable Map Creator opener.']);}
  if(typeof updates!=='undefined'&&Array.isArray(updates)&&!updates.some(x=>x&&String(x[0]).includes('v3.37.11'))){updates.unshift(['v3.37.11 — Separate Map Picker and Creator Routes','Separated the normal Choose Map action from the Map Creator route to prevent late module initialization from hijacking map selection.']);}
 }
 if(typeof helpArticles!=='undefined'&&Array.isArray(helpArticles)){
  const entries=[
   ['How does Thorns work?','Upgrades & Combat','Thorns is a level-up upgrade. When your player actually loses HP, it deals a counterattack to nearby enemies based on your damage. Higher-rarity Thorns cards deal a larger counterattack, and the effect has a short cooldown so contact damage cannot trigger it every frame.'],
   ['How do I use my ultimate?','Controls & Combat','Defeat enemies to charge the ultimate. Normal kills now add 3% charge, while boss kills add 30% (before your Ultimate Charge bonuses). When the HUD reaches 100%, press R on PC or tap ULT on mobile. A toast confirms when the ultimate fires; if it is not ready, the HUD percentage is reported instead.'],
   ['How were the maps expanded?','Maps','Every built-in arena now measures 4000 × 3000 instead of 3200 × 2400, with additional map-themed obstacles distributed into the new right-side and lower areas. The player start remains near its previous safe location.'],
   ['How do I use the fixed map picker?','Maps','Choose Map now opens above the menu in a dedicated overlay. Select a tile to save the map and close the picker. The × button, Escape key, or clicking outside the card also close it. OPEN MAP CREATOR opens the existing unlock/editor screen.'],
   ['Why does Choose Map work after page load?','Maps','OUTLAST now restores the modern Choose Map route after all delayed menu modules initialize. Map Creator has its own opener so it cannot replace the normal map selector.'],
   ['How is Map Creator opened separately?','Maps','Choose Map uses OUTLAST_OPEN_MAP_PICKER_3377, while the existing Map Creator uses its own exported opener. Selecting a map closes the picker and persists the choice without replacing either route.'],
   ['What animations do upgrade rarities use?','Upgrades & Rarities','Uncommon and higher upgrade choices reveal with rarity-specific motion: Uncommon bounce, Rare pulse, Epic rise, Legendary roll, Mythic orbit, Divine halo, Celestial stars, Transcendent glitch, Eternal time dial, and Omega burst. The reveal finishes before you can select an animated card.'],
   ['How many level-up choices are available?','Upgrades & Rarities','The existing 298-card pool is expanded by 133 additional choices, including 12 rarity-scaled upgrade families across all 11 rarity tiers. Upgrade family benefits scale upward with rarity.']
  ];
  for(let i=entries.length-1;i>=0;i--)if(!helpArticles.some(a=>a&&a[0]===entries[i][0]))helpArticles.unshift(entries[i]);
 }
}
function install(){
 installVersionAndHelp();
 expandMaps();
 addUpgradeCards();
 wrapThorns();
 wrapUltimate();
 window.OUTLAST_EXPANSION_AUDIT=function(){
  return {version:VERSION,upgradeCardsAdded:window.OUTLAST_V3378_ADDED_UPGRADES||0,upgradeCount:window.OUTLAST_UPGRADE_LIBRARY_COUNT||0,
   mapSize:window.OUTLAST_MAP_SIZE||null,mapObjectsAdded:window.OUTLAST_MAP_EXPANSION_ADDED_OBJECTS||0,
   thornsReady:!!window.OUTLAST_THORNS_READY,ultimateReady:!!window.OUTLAST_ULTIMATE_READY};
 };
 if(!cardsRegistered||!mapsExpanded||!thornsWrapped||!ultimateWrapped){
  if(!window.__outlast3378Retry){window.__outlast3378Retry=setTimeout(function(){window.__outlast3378Retry=null;install();},150);}
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
setTimeout(install,0);
})();