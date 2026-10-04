/* OUTLAST v3.28.1 — High-Rarity Upgrade Rebuild */
(function(){
  'use strict';
  if(window.__outlastHighRarityRebuild3281)return;
  window.__outlastHighRarityRebuild3281=true;

  const TIER_MULT={
    Legendary:2.4,
    Mythic:3.6,
    Divine:5.0,
    Celestial:7.5,
    Transcendent:10.0,
    Eternal:13.0,
    Omega:16.0
  };

  const HIGH={
    Legendary:{
      'Lucky Hunter':['Lucky Hunter',v=>`+${Math.round(25+10*(v-1))}% chance for double XP`,v=>{const p=game.player;p.lucky=true;p.luckyChance=Math.min(.85,.25+.10*(v-1));}],
      'Lucky Coins':['Lucky Coins',v=>`+${Math.round(20*v)}% coins`,v=>game.player.coinMult*=1+.20*v],
      'Adrenaline':['Adrenaline',v=>`+${Math.round(15*v)}% move speed while below 50% HP`,v=>{const p=game.player;p.adrenaline=true;p.adrenalineBonus=.15*v;}],
      'Shield Core':['Shield Core',v=>`Gain ${Math.round(5*v)}s of shield`,v=>game.player.shield=Math.max(game.player.shield||0,5*v)],
      'Poison Rounds':['Poison Rounds',v=>`Shots apply poison with ${Math.round(100*v)}% poison strength`,v=>{const p=game.player;p.poison=true;p.poisonMultiplier=Math.max(1,v);}],
      'Stun Rounds':['Stun Rounds',v=>`Shots have a ${Math.min(65,Math.round(18*v))}% stun chance`,v=>{const p=game.player;p.stun=true;p.stunChance=Math.min(.65,.18*v);}]
    },
    Mythic:{
      'Overcharge':['Overcharge',v=>`+${Math.round(30*v)}% ultimate damage`,v=>game.player.ultDamage=(game.player.ultDamage||1)*(1+.30*v)],
      'Double Tap':['Double Tap',v=>`+${Math.min(60,Math.round(20*v))}% chance to fire an extra shot`,v=>{const p=game.player;p.doubleTap=true;p.doubleTapChance=Math.min(.60,.20*v);}],
      'Treasure Radar':['Treasure Radar',v=>`${(1+.50*v).toFixed(2)}x power-up drop multiplier`,v=>{const p=game.player;p.treasure=true;p.treasureMultiplier=Math.max(p.treasureMultiplier||1,1+.50*v);}],
      'Lucky Charm':['Lucky Charm',v=>`+${Math.round(8*v)} Upgrade Luck`,v=>{const p=game.player;p.upgradeLuck=(p.upgradeLuck||0)+8*v;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0);}],
      'Treasure Luck':['Treasure Luck',v=>`+${Math.round(20*v)} Treasure Luck`,v=>{const p=game.player;p.treasureLuck=(p.treasureLuck||0)+20*v;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0);}],
      'Fortune':['Fortune',v=>`+${Math.round(15*v)} Loot Luck`,v=>{const p=game.player;p.lootLuck=(p.lootLuck||0)+15*v;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0);}],
      'Abyssal Core':['Abyssal Core',v=>`+${Math.round(60*v)}% damage • +${Math.round(20*v)}% attack speed • +${Math.max(2,Math.round(2*v))} pierce • +${Math.round(15*v)}% boss damage`,v=>{const p=game.player;p.damage*=1+.60*v;p.fireRate=Math.max(.045,(p.fireRate||.45)*Math.max(.20,1-.20*v));p.pierce=(p.pierce||0)+Math.max(2,Math.round(2*v));p.bossMult=(p.bossMult||1)*(1+.15*v);}]
    },
    Divine:{
      'Overheat':['Overheat',v=>`+${Math.round(25*v)}% attack speed • +${Math.round(5*v)}% damage`,v=>{const p=game.player;p.fireRate=Math.max(.05,(p.fireRate||.45)*Math.max(.30,1-.25*v));p.damage*=1+.05*v;}],
      'Rift Pierce':['Rift Pierce',v=>`+${Math.max(2,Math.round(2*v))} pierce`,v=>game.player.pierce=(game.player.pierce||0)+Math.max(2,Math.round(2*v))],
      'Cryo Core':['Cryo Core',v=>`Frost aura: +${Math.round(70*v)} radius • much stronger slow • chill damage`,v=>{const p=game.player;p.frost=true;p.frostAuraRadius=(p.frostAuraRadius||130)+70*v;p.frostSlow=Math.min(.97,(p.frostSlow||.50)+.09*v);p.frostAuraDps=(p.frostAuraDps||.12)+.08*v;}],
      'Ammo Surge':['Ammo Surge',v=>`+${Math.max(3,Math.round(3*v))} projectiles`,v=>game.player.multiShot=(game.player.multiShot||0)+Math.max(3,Math.round(3*v))],
      'Heavy Impact':['Heavy Impact',v=>`+${Math.round(25*v)} damage • +${Math.round(20*v)}% projectile size`,v=>{const p=game.player;p.damage+=25*v;p.bulletSize=(p.bulletSize||1)*(1+.20*v);}],
      'Emergency Shield':['Emergency Shield',v=>`Gain ${Math.round(7*v)}s of shield`,v=>game.player.shield=Math.max(game.player.shield||0,7*v)],
      'Divine Aegis':['Divine Aegis',v=>`+${Math.round(250*v)} max HP • ${Math.round(8*v)}s shield • ${Math.round(12*v)}% damage reduction`,v=>{const p=game.player;p.max+=250*v;p.hp=Math.min(p.max,p.hp+250*v);p.shield=Math.max(p.shield||0,8*v);p.damageTakenMult=Math.max(.25,(p.damageTakenMult||1)*Math.pow(.88,v));}]
    },
    Celestial:{
      'Vampiric Surge':['Vampiric Surge',v=>`+${(0.50*v).toFixed(1)} HP per kill`,v=>game.player.vampire=(game.player.vampire||0)+.50*v],
      'Fortune Engine':['Fortune Engine',v=>`+${Math.round(15*v)} Upgrade Luck • +${Math.round(15*v)}% coins`,v=>{const p=game.player;p.upgradeLuck=(p.upgradeLuck||0)+15*v;p.coinMult*=1+.15*v;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0);}],
      'Combat Medic':['Combat Medic',v=>`+${(3*v).toFixed(1)} HP/s • +${Math.round(25*v)}% healing`,v=>{const p=game.player;p.regen+=3*v;p.healMult=(p.healMult||1)*(1+.25*v);}],
      'XP Hunter':['XP Hunter',v=>`+${Math.round(25*v)}% XP`,v=>game.player.xpBonus*=1+.25*v],
      'Bloodrush':['Bloodrush',v=>`+${Math.round(30*v)}% damage below 50% HP`,v=>{const p=game.player;p.berserk=true;p.berserkBonus=(p.berserkBonus||0)+.30*v;}],
      'Fortress':['Fortress',v=>`+${Math.round(160*v)} max HP • ${Math.round(10*v)}% armor`,v=>{const p=game.player;p.max+=160*v;p.hp=Math.min(p.max,p.hp+160*v);p.armor=Math.max(.05,(p.armor||1)-.10*v);}],
      'Adrenal Core':['Adrenal Core',v=>`+${Math.round(10*v)}% move speed • +${Math.round(12*v)}% attack speed`,v=>{const p=game.player;p.speed=Math.min(p.speedCap,p.speed*(1+.10*v));p.fireRate=Math.max(.045,(p.fireRate||.45)*Math.max(.25,1-.12*v));}],
      'XP Reactor':['XP Reactor',v=>`+${Math.round(20*v)}% XP • +${Math.round(6*v)} Upgrade Luck`,v=>{const p=game.player;p.xpBonus*=1+.20*v;p.upgradeLuck=(p.upgradeLuck||0)+6*v;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0);}],
      'Celestial Barrage':['Celestial Barrage',v=>`+${Math.max(5,Math.round(5*v))} projectiles • +${Math.round(80*v)}% damage • +${Math.round(30*v)}% projectile speed • +${Math.round(15*v)}% crit • +${Math.max(2,Math.round(2*v))} pierce`,v=>{const p=game.player;p.multiShot=(p.multiShot||0)+Math.max(5,Math.round(5*v));p.damage*=1+.80*v;p.projectileSpeed=(p.projectileSpeed||1)*(1+.30*v);p.crit=Math.min(.99,(p.crit||0)+.15*v);p.pierce=(p.pierce||0)+Math.max(2,Math.round(2*v));}]
    },
    Transcendent:{
      'Quick Reload':['Quick Reload',v=>`+${Math.round(14*v)}% attack speed`,v=>game.player.fireRate=Math.max(.035,(game.player.fireRate||.45)*Math.max(.18,1-.14*v))],
      'Ricochet':['Ricochet',v=>`+${Math.max(1,Math.round(v))} pierce • +${Math.round(8*v)}% projectile size`,v=>{const p=game.player;p.pierce=(p.pierce||0)+Math.max(1,Math.round(v));p.bulletSize=(p.bulletSize||1)*(1+.08*v);}],
      'Executioner':['Executioner',v=>`+${Math.round(20*v)}% elite damage`,v=>game.player.executioner=(game.player.executioner||0)+.20*v],
      'Bossbreaker':['Bossbreaker',v=>`+${Math.round(20*v)}% boss damage`,v=>game.player.bossDamageBonus=(game.player.bossDamageBonus||0)+.20*v],
      'Cryo Burst':['Cryo Burst',v=>`+${Math.round(70*v)} frost radius • stronger slow • stronger chill`,v=>{const p=game.player;p.frost=true;p.frostAuraRadius=(p.frostAuraRadius||130)+70*v;p.frostSlow=Math.min(.98,(p.frostSlow||.50)+.12*v);p.frostAuraDps=(p.frostAuraDps||.12)+.12*v;}],
      'Shock Circuit':['Shock Circuit',v=>`+${Math.round(20*v)}% chain effect`,v=>game.player.chain=(game.player.chain||1)*(1+.20*v)],
      'Transcendent Fury':['Transcendent Fury',v=>`+${Math.round(125*v)}% damage • +${Math.round(60*v)}% attack speed • +${Math.round(20*v)}% crit • +${Math.max(3,Math.round(3*v))} pierce • +${Math.round(25*v)}% boss damage • +${Math.round(30*v)}% ultimate damage`,v=>{const p=game.player;p.damage*=1+1.25*v;p.fireRate=Math.max(.035,(p.fireRate||.45)*Math.max(.16,1-.60*v));p.crit=Math.min(.99,(p.crit||0)+.20*v);p.pierce=(p.pierce||0)+Math.max(3,Math.round(3*v));p.bossMult=(p.bossMult||1)*(1+.25*v);p.ultDamage=(p.ultDamage||1)*(1+.30*v);}]
    },
    Eternal:{
      'Vampire Core':['Vampire Core',v=>`+${(0.60*v).toFixed(1)} HP per kill • +${Math.round(8*v)}% max HP`,v=>{const p=game.player;p.vampire=(p.vampire||0)+.60*v;p.max*=1+.08*v;p.hp=Math.min(p.max,p.hp+p.max*.08*v);}],
      'Salvager':['Salvager',v=>`+${Math.round(25*v)}% coins • +${Math.round(20*v)} pickup radius`,v=>{const p=game.player;p.coinMult*=1+.25*v;p.magnet+=20*v;}],
      'Lucky Barrage':['Lucky Barrage',v=>`+${Math.min(70,Math.round(28*v))}% extra-shot chance`,v=>{const p=game.player;p.doubleTap=true;p.doubleTapChance=Math.max(p.doubleTapChance||0,Math.min(.70,.28*v));}],
      'Shield Nova':['Shield Nova',v=>`Gain ${Math.round(6*v)}s shield • stronger defensive pulse`,v=>{const p=game.player;p.shield=Math.max(p.shield||0,6*v);p.shieldEfficiency=Math.max(p.shieldEfficiency||1,1+.15*v);if(game.effects)game.effects.push({x:p.x,y:p.y,t:.45,r:145+25*v,fill:false});}],
      'Overclock':['Overclock',v=>`+${Math.round(20*v)}% attack speed • +${Math.round(8*v)}% damage`,v=>{const p=game.player;p.fireRate=Math.max(.035,(p.fireRate||.45)*Math.max(.20,1-.20*v));p.damage*=1+.08*v;}],
      'Eternal Rebirth':['Eternal Rebirth',v=>`+${Math.round(900*v)} max HP • +${Math.round(15*v)} HP/s • +${Math.round(100*v)}% damage • ${Math.round(30*v)}% damage reduction • +${Math.max(1,Math.round(v))} revive`,v=>{const p=game.player;p.max+=900*v;p.hp=Math.min(p.max,p.hp+900*v);p.regen+=15*v;p.damage*=1+1.00*v;p.damageTakenMult=Math.max(.18,(p.damageTakenMult||1)*Math.pow(.70,v));p.phoenixRevives=(p.phoenixRevives||0)+Math.max(1,Math.round(v));}],
      'Last Stand':['Last Stand',v=>`+${Math.round(35*v)}% damage below 25% HP`,v=>{const p=game.player;p.lastStand=true;p.lastStandBonus=(p.lastStandBonus||0)+.35*v;}]
    },
    Omega:{
      'Treasure Engine':['Treasure Engine',v=>`+${Math.round(30*v)} Treasure Luck • ${(1+.625*v).toFixed(2)}x power-up drop multiplier`,v=>{const p=game.player;p.treasureLuck=(p.treasureLuck||0)+30*v;p.treasure=true;p.treasureMultiplier=Math.max(p.treasureMultiplier||1,1+.625*v);p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0);}],
      'Deadly Precision':['Deadly Precision',v=>`+${Math.min(99,Math.round(12*v))}% crit chance • +${Math.round(15*v)}% crit damage`,v=>{const p=game.player;p.crit=Math.min(.99,(p.crit||0)+.12*v);p.critMult=(p.critMult||1.8)+.15*v;}],
      'Omega Ascension':['Omega Ascension',v=>`+${Math.round(300*v)}% damage • +${Math.round(80*v)}% attack speed • +${Math.min(99,Math.round(30*v))}% crit • +${Math.max(7,Math.round(7*v))} projectiles • +${Math.max(7,Math.round(7*v))} pierce • +${Math.round(125*v)}% ultimate damage • +${Math.round(50*v)}% boss damage • +${Math.round(40*v)}% chain • shockwave`,v=>{const p=game.player;p.damage*=1+3.00*v;p.fireRate=Math.max(.03,(p.fireRate||.45)*Math.max(.10,1-.80*v));p.crit=Math.min(.99,(p.crit||0)+.30*v);p.multiShot=(p.multiShot||0)+Math.max(7,Math.round(7*v));p.pierce=(p.pierce||0)+Math.max(7,Math.round(7*v));p.ultDamage=(p.ultDamage||1)*(1+1.25*v);p.bossMult=(p.bossMult||1)*(1+.50*v);p.chain=(p.chain||1)*(1+.40*v);p.shockwave=true;p.shockwaveEvery=10;p.shockwaveRadius=170+10*v;p.shockwaveDamage=.90*v;}]
    }
  };

  function replaceEntries(){
    if(typeof tempUp==='undefined'||!Array.isArray(tempUp))return;
    for(const group of Object.values(HIGH)){
      for(const def of Object.values(group)){
        const i=tempUp.findIndex(x=>x&&x[0]===def[0]);
        if(i>=0)tempUp.splice(i,1,def);
      }
    }
    for(const [rarity,mult] of Object.entries(TIER_MULT)){
      if(upgradeRarities?.[rarity])upgradeRarities[rarity].mult=mult;
    }
  }

  function eligible(rarity,usedNames){
    return (UPGRADE_RARITY_POOLS?.[rarity]||[]).filter(name=>{
      if(usedNames.has(name))return false;
      if(typeof upgradeAlreadyActive==='function'&&upgradeAlreadyActive(name))return false;
      return !!tempUp.find(u=>u&&u[0]===name);
    });
  }

  function weightedAvailableRarity(available){
    const odds=typeof getUpgradeRarityOdds==='function'?getUpgradeRarityOdds():null;
    if(!odds)return available[Math.floor(Math.random()*available.length)];
    let total=0;
    for(const name of available)total+=Number(odds.weights?.[name]||0);
    if(total<=0)return available[Math.floor(Math.random()*available.length)];
    let roll=Math.random()*total;
    for(const name of available){roll-=Number(odds.weights?.[name]||0);if(roll<=0)return name;}
    return available[available.length-1];
  }

  function rebuiltMakeChoices(){
    const out=[],usedNames=new Set(),usedCats=new Set();
    let guard=0;
    while(out.length<3&&guard++<90){
      const available=UPGRADE_RARITY_ORDER.filter(r=>eligible(r,usedNames).length);
      if(!available.length)break;
      const rarity=available.includes(rollUpgradeRarity())?rollUpgradeRarity():weightedAvailableRarity(available);
      const pool=eligible(rarity,usedNames);
      if(!pool.length)continue;
      const categoryPool=(typeof upgradeCategory==='function')?pool.filter(n=>!usedCats.has(upgradeCategory(n))):pool;
      const name=(categoryPool.length?categoryPool:pool)[Math.floor(Math.random()*(categoryPool.length?categoryPool:pool).length)];
      const item=tempUp.find(u=>u&&u[0]===name);
      if(!item)continue;
      const mult=Number(upgradeRarities?.[rarity]?.mult||1);
      const cat=typeof upgradeCategory==='function'?upgradeCategory(name):'utility';
      out.push([name,item[1](mult),()=>item[2](mult),rarity,cat]);
      usedNames.add(name);usedCats.add(cat);
    }
    return out.length===3?out:(typeof window.__outlastPreviousMakeChoices==='function'?window.__outlastPreviousMakeChoices():out);
  }

  function install(){
    replaceEntries();
    window.__outlastPreviousMakeChoices=window.__outlastPreviousMakeChoices||makeChoices;
    makeChoices=rebuiltMakeChoices;
    try{
      const entry=['v3.28.1 — High-Rarity Upgrade Rebuild','Celestial, Transcendent, Eternal, and Omega upgrades now use exclusive tier pools and materially stronger effects instead of inheriting fixed Epic-strength effects.'];
      if(typeof updates!=='undefined'&&Array.isArray(updates)&&!updates.some(x=>Array.isArray(x)&&x[0]===entry[0]))updates.unshift(entry);
      const help=['How do higher-rarity upgrades get stronger?','Upgrades','Every upgrade now comes from its real rarity pool. Legendary through Omega effects scale with tier-specific power, while Celestial, Transcendent, Eternal, and Omega choices use dedicated high-impact multi-stat effects.'];
      if(typeof helpArticles!=='undefined'&&Array.isArray(helpArticles)&&!helpArticles.some(x=>Array.isArray(x)&&x[0]===help[0]))helpArticles.unshift(help);
    }catch(_){}
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  setTimeout(install,0);
  setTimeout(install,500);
})();
