/* OUTLAST v4.3.8 — Eleven-tier rarity rolls + boss/modifier balance fixes */
(function(){
'use strict';
const VERSION='4.3.8';
const SCALE=Object.freeze({
 Common:1,Uncommon:1.15,Rare:1.35,Epic:1.6,Legendary:1.9,Mythic:2.25,
 Divine:4,Celestial:4.8,Transcendent:5.6,Eternal:6.8,Omega:8
});
const BASE_WEIGHTS=Object.freeze({
 Common:50,Uncommon:25,Rare:13,Epic:7,Legendary:3.2,Mythic:.8,
 Divine:.45,Celestial:.25,Transcendent:.12,Eternal:.06,Omega:.03
});
const LUCK_FACTOR=Object.freeze({
 Common:-.58,Uncommon:-.42,Rare:.62,Epic:1,Legendary:1.8,Mythic:3.2,
 Divine:4.2,Celestial:5.2,Transcendent:6.2,Eternal:7,Omega:8
});
const tiers=Object.keys(SCALE);

const SPECIAL_CARD_TIERS=Object.freeze({
 'Final Swarm':'Mythic','Glass Reactor':'Epic','Overdrive':'Mythic',
 'Guardian Core':'Epic','Treasure Hunter':'Rare','Weapon Mastery':'Legendary'
});
function repairUnassignedChoices(){
 let source=[];
 try{if(typeof tempUp!=='undefined'&&Array.isArray(tempUp))source=tempUp;}catch(_){}
 const pools=window.OUTLAST_UPGRADE_RARITY_POOLS,byName=window.OUTLAST_UPGRADE_RARITY_BY_NAME;
 if(!pools||!byName||!source.length)return {ready:false,added:[]};
 const added=[];
 for(const [name,tier] of Object.entries(SPECIAL_CARD_TIERS)){
  if(!source.some(item=>item&&item[0]===name))continue;
  for(const [existingTier,names] of Object.entries(pools)){
   if(Array.isArray(names)&&names.includes(name)){byName[name]=existingTier;break;}
  }
  if(byName[name])continue;
  if(!Array.isArray(pools[tier]))pools[tier]=[];
  pools[tier].push(name);byName[name]=tier;added.push({name,tier});
 }
 window.OUTLAST_UPGRADE_CATALOG_REPAIRS=added;
 return {ready:true,added};
}
function weightsFor(luck){
 const bonus=Math.min(.72,Math.max(0,Number(luck)||0)/125);
 const result={};
 for(const tier of tiers){
  const factor=LUCK_FACTOR[tier];
  result[tier]=BASE_WEIGHTS[tier]*(factor<0?1+bonus*factor:1+bonus*factor);
 }
 return result;
}
function rollAt(value,luck){
 const t=Number(value);
 const position=Math.min(1-Number.EPSILON,Math.max(0,Number.isFinite(t)?t:Math.random()));
 const weights=weightsFor(luck),total=tiers.reduce((sum,tier)=>sum+weights[tier],0);
 let cursor=position*total;
 for(const tier of tiers){cursor-=weights[tier];if(cursor<0)return tier;}
 return tiers[tiers.length-1];
}
function roll(){
 let luck=0;
 try{luck=Number(typeof game!=='undefined'&&game&&game.player&&game.player.upgradeLuck)||0}catch(_){}
 return rollAt(Math.random(),luck);
}
window.OUTLAST_UPGRADE_RARITY_SCALING37=SCALE;
window.OUTLAST_RARITY_AUDIT_SCALE=SCALE;
window.OUTLAST_RARITY_AUDIT_WEIGHTS=BASE_WEIGHTS;
window.OUTLAST_RARITY_AUDIT_WEIGHTS_FOR_LUCK=weightsFor;
window.OUTLAST_ROLL_UPGRADE_RARITY_AT=rollAt;
window.rollUpgradeRarity=roll;
try{rollUpgradeRarity=roll}catch(_){}
function setVersion(){
 window.OUTLAST_BUILD=VERSION;
 window.OUTLAST_VERSION='v'+VERSION;
 window.OUTLAST_UI_SYSTEM_VERSION=VERSION;
 document.title='OUTLAST v'+VERSION;
 const build=document.querySelector('meta[name="outlast-build"]');
 const meta=document.querySelector('meta[name="build-version"]');
 if(build)build.content=VERSION;
 if(meta)meta.content=VERSION;
 document.querySelectorAll('[data-outlast-version]').forEach(el=>{el.textContent='v'+VERSION;});
 const chip=document.querySelector('#menu .menu-chip');
 if(chip)chip.textContent='v'+VERSION+' • SURVIVOR HUB';
 window.OUTLAST_UPGRADE_BOSS_BALANCE_READY=true;
}
function installReleaseNotes(){
 try{
  if(typeof updates!=='undefined'&&Array.isArray(updates)&&!updates.some(x=>Array.isArray(x)&&String(x[0]).includes('v4.3.8 — Eleven-Tier Upgrade & Boss Balance'))){
   updates.unshift(['v4.3.8 — Eleven-Tier Upgrade & Boss Balance','Enabled real upgrade rolls for all eleven rarity tiers. Fixed Boss Hunter leaking into boss outgoing damage, wired Boss Armor resistance, synchronized Boss Gauntlet rewards and mode-aware boss timing, and aligned the player-facing How-To.']);
  }
  if(typeof helpArticles!=='undefined'&&Array.isArray(helpArticles)){
   const text='All eleven upgrade rarities can now appear in level-up choices. Upgrade Luck shifts the odds toward higher tiers. Boss Hunter increases only your damage against bosses; Boss Armor reduces the damage you deal to bosses. Later bosses wait for the previous boss to be defeated. Mode intervals control the later cadence, Boss Gauntlet uses 45 seconds, and FastBosses/ApexTrial shorten the interval.';
   const article=helpArticles.find(x=>Array.isArray(x)&&String(x[0]).includes('How do rarity rolls and boss modifiers work?'));
   if(article)article[2]=text;else helpArticles.unshift(['How do rarity rolls and boss modifiers work?','Upgrades & Bosses',text]);
   const stale=helpArticles.find(x=>Array.isArray(x)&&String(x[0]).includes('Why are bosses not spawning consistently?'));
   if(stale)stale[2]='Boss timing follows the selected mode and active modifiers. Most runs schedule an early first boss; later bosses wait until the previous boss is defeated and then use the mode interval. Boss Gauntlet uses a 45-second interval. FastBosses and ApexTrial shorten boss intervals.';
  }
 }catch(err){window.OUTLAST_BALANCE_NOTES_ERROR=String(err&&err.message||err);}
}
function install(){
 repairUnassignedChoices();
 installReleaseNotes();
 setVersion();
 window.OUTLAST_RARITY_AUDIT=function(){
  const weights=weightsFor(0),total=Object.values(weights).reduce((a,b)=>a+b,0);
  return {version:VERSION,tiers:tiers.map(tier=>({tier,multiplier:SCALE[tier],baseWeight:BASE_WEIGHTS[tier],baseChancePercent:100*weights[tier]/total})),ready:true};
 };
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.addEventListener('load',setVersion,{once:true});
setTimeout(install,0);
setTimeout(setVersion,100);
setTimeout(setVersion,800);
setTimeout(setVersion,1800);
})();