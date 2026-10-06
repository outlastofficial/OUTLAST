/* OUTLAST v3.27.108 — authoritative rarity/card mapping rebuild */
(function(){
  'use strict';
  if(window.__outlastRarityAuthority327108)return;
  window.__outlastRarityAuthority327108=true;
  const POOLS={
    Common:['Power Shot','Vitality','Swift Feet','Magnet','Regeneration','Second Wind','Berserker','XP Boost','Second Heart'],
    Uncommon:['Rapid Fire','Piercing','Big Bullets','Projectile Speed','Swift Aim','Fortified Core','XP Burst'],
    Rare:['Multi-Shot','Frost Aura','Crit Chance','Rapid Recovery','Armor Pierce','Coin Magnetism','Bouncing Bullets'],
    Epic:['Heavy Rounds','Chain Reaction','Lifesteal','Shockwave','Deadeye','Scavenger Luck','Elite Hunter','Void Arsenal'],
    Legendary:['Lucky Hunter','Lucky Coins','Adrenaline','Shield Core','Poison Rounds','Stun Rounds'],
    Mythic:['Overcharge','Double Tap','Treasure Radar','Lucky Charm','Treasure Luck','Fortune','Abyssal Core'],
    Divine:['Overheat','Rift Pierce','Cryo Core','Ammo Surge','Heavy Impact','Emergency Shield','Divine Aegis'],
    Celestial:['Vampiric Surge','Fortune Engine','Combat Medic','XP Hunter','Bloodrush','Fortress','Adrenal Core','XP Reactor','Celestial Barrage'],
    Transcendent:['Quick Reload','Ricochet','Executioner','Bossbreaker','Cryo Burst','Shock Circuit','Transcendent Fury'],
    Eternal:['Vampire Core','Salvager','Lucky Barrage','Shield Nova','Overclock','Eternal Rebirth','Last Stand'],
    Omega:['Treasure Engine','Deadly Precision','Omega Ascension']
  };
  const BY_NAME=Object.create(null);
  for(const [rarity,names] of Object.entries(POOLS))for(const name of names)BY_NAME[name]=rarity;
  window.OUTLAST_UPGRADE_RARITY_BY_NAME=BY_NAME;
  window.OUTLAST_UPGRADE_RARITY_POOLS=POOLS;
  const active=item=>{try{return typeof upgradeAlreadyActive==='function'&&upgradeAlreadyActive(item[0]);}catch(_){return false;}};
  const category=name=>{try{return typeof upgradeCategory==='function'?upgradeCategory(name):'utility';}catch(_){return 'utility';}};
  function authoritativeMakeChoices(){
    const out=[],usedNames=new Set(),usedCats=new Set();
    const available=()=>Object.keys(POOLS).filter(r=>POOLS[r].some(name=>{if(usedNames.has(name))return false;const item=tempUp.find(u=>u&&u[0]===name);return !!item&&!active(item);}));
    while(out.length<3){
      const tiers=available();if(!tiers.length)break;
      let rarity;try{rarity=rollUpgradeRarity();}catch(_){rarity='Common';}
      if(!tiers.includes(rarity)){
        const weighted=tiers.map(r=>({r,w:Number(upgradeRarities?.[r]?.weight||1)}));
        const total=weighted.reduce((a,x)=>a+x.w,0);let roll=Math.random()*total;rarity=weighted[weighted.length-1].r;
        for(const x of weighted){roll-=x.w;if(roll<=0){rarity=x.r;break;}}
      }
      const pool=POOLS[rarity].filter(name=>{if(usedNames.has(name))return false;const item=tempUp.find(u=>u&&u[0]===name);return !!item&&!active(item);});
      if(!pool.length)continue;
      const preferred=pool.filter(name=>!usedCats.has(category(name)));
      const choices=preferred.length?preferred:pool;
      const name=choices[Math.floor(Math.random()*choices.length)],item=tempUp.find(u=>u&&u[0]===name);if(!item)continue;
      const mult=Number(upgradeRarities?.[rarity]?.mult||1),desc=typeof item[1]==='function'?item[1](mult):String(item[1]||''),apply=typeof item[2]==='function'?item[2]:()=>{},cat=category(name);
      out.push([name,desc,()=>apply(mult),rarity,cat]);usedNames.add(name);usedCats.add(cat);
    }
    if(out.length<3)for(const rarity of Object.keys(POOLS)){for(const name of POOLS[rarity]){if(out.length>=3||usedNames.has(name))break;const item=tempUp.find(u=>u&&u[0]===name);if(!item||active(item))continue;const mult=Number(upgradeRarities?.[rarity]?.mult||1),desc=typeof item[1]==='function'?item[1](mult):String(item[1]||''),apply=typeof item[2]==='function'?item[2]:()=>{};out.push([name,desc,()=>apply(mult),rarity,category(name)]);usedNames.add(name);}if(out.length>=3)break;}
    return out;
  }
  window.makeChoices=authoritativeMakeChoices;
  const sanitizeChoices=()=>{if(!Array.isArray(game?.upgradeChoices))return;for(const u of game.upgradeChoices){if(!u||!u[0])continue;const real=BY_NAME[u[0]];if(real){u[3]=real;const item=typeof tempUp!=='undefined'&&tempUp.find(x=>x&&x[0]===u[0]);if(item&&typeof upgradeRarities!=='undefined'&&upgradeRarities[real]&&typeof item[1]==='function')u[1]=item[1](Number(upgradeRarities[real].mult||1));}}};
  const oldDraw=window.draw;
  if(typeof oldDraw==='function'&&!window.__outlastRarityDrawGuard327108){window.__outlastRarityDrawGuard327108=true;window.draw=function(){try{sanitizeChoices();}catch(_){}return oldDraw.apply(this,arguments);};}
  try{
    const u=['v3.27.108 — Rarity Card Authority Fix','Fixed upgrade rarity cards so every upgrade displays its true rarity from the authoritative rarity pool. Transcendent Fury now shows TRANSCENDENT, Omega upgrades show OMEGA, and lower tiers can no longer receive a mismatched rarity label or multiplier. Login was not changed.'];
    const h=['Why does every upgrade now show the correct rarity?','Rarities','Each upgrade is assigned to one authoritative rarity pool. The card label, rarity chance, and power multiplier all use that same rarity, so an upgrade such as Transcendent Fury cannot appear with an Uncommon label.'];
    if(Array.isArray(updates)&&!updates.some(x=>Array.isArray(x)&&String(x[0]).includes('Rarity Card Authority Fix')))updates.unshift(u);
    if(Array.isArray(helpArticles)&&!helpArticles.some(x=>Array.isArray(x)&&String(x[0]).includes('every upgrade now show the correct rarity')))helpArticles.unshift(h);
  }catch(_){}
  window.__outlastRarityAuthorityAudit=()=>{const errors=[],seen=new Set();for(const [rarity,names] of Object.entries(POOLS)){if(!names.length)errors.push('empty:'+rarity);for(const n of names){if(seen.has(n))errors.push('duplicate:'+n);seen.add(n);if(!Array.isArray(tempUp)||!tempUp.some(x=>x&&x[0]===n))errors.push('missing:'+n);}}return {ok:!errors.length,errors,totalMapped:seen.size};};
  setTimeout(()=>{try{window.__outlastRarityAuthorityAudit();}catch(_){}},0);
})();