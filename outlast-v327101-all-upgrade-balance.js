/* OUTLAST v3.27.101 — authoritative all-rarity upgrade balance */
(function(){
  'use strict';
  if(window.__outlastAllUpgradeBalance327101)return;
  window.__outlastAllUpgradeBalance327101=true;

  const B={
    // COMMON — small, dependable starting power
    'Power Shot':['Power Shot',()=>'+4 damage',()=>game.player.damage+=4],
    'Vitality':['Vitality',()=>'+20 max HP',()=>{const p=game.player;p.max+=20;p.hp=Math.min(p.max,p.hp+20)}],
    'Swift Feet':['Swift Feet',()=>'+5% move speed',()=>{const p=game.player;p.speed=Math.min(p.speedCap,p.speed*1.05)}],
    'Magnet':['Magnet',()=>'+30 pickup radius',()=>game.player.magnet+=30],
    'Regeneration':['Regeneration',()=>'+0.5 HP/s',()=>game.player.regen+=.5],
    'Second Wind':['Second Wind',()=>'+1 HP/s',()=>game.player.regen+=1],
    'Berserker':['Berserker',()=>'+20% damage below 50% HP',()=>{const p=game.player;p.berserk=true;p.berserkBonus=(p.berserkBonus||0)+.20}],
    'XP Boost':['XP Boost',()=>'+8% XP',()=>game.player.xpBonus*=1.08],
    'Second Heart':['Second Heart',()=>'+45 max HP and heal for 45',()=>{const p=game.player;p.max+=45;p.hp=Math.min(p.max,p.hp+45)}],

    // UNCOMMON — noticeable upgrades
    'Rapid Fire':['Rapid Fire',()=>'+8% attack speed',()=>game.player.fireRate=Math.max(.16,(game.player.fireRate||.45)*.92)],
    'Piercing':['Piercing',()=>'+1 pierce',()=>game.player.pierce=(game.player.pierce||0)+1],
    'Big Bullets':['Big Bullets',()=>'+15% projectile size',()=>game.player.bulletSize=(game.player.bulletSize||1)*1.15],
    'Projectile Speed':['Projectile Speed',()=>'+12% projectile speed',()=>game.player.projectileSpeed=(game.player.projectileSpeed||1)*1.12],
    'Swift Aim':['Swift Aim',()=>'+40 range',()=>game.player.range+=40],
    'Fortified Core':['Fortified Core',()=>'+60 max HP',()=>{const p=game.player;p.max+=60;p.hp=Math.min(p.max,p.hp+60)}],
    'XP Burst':['XP Burst',()=>'+12% XP and +20 pickup radius',()=>{const p=game.player;p.xpBonus*=1.12;p.magnet+=20}],

    // RARE — strong build-defining choices
    'Multi-Shot':['Multi-Shot',()=>'+2 projectiles',()=>game.player.multiShot=(game.player.multiShot||0)+2],
    'Frost Aura':['Frost Aura',()=>'+45 aura radius, stronger slow and chill damage',()=>{const p=game.player;p.frost=true;p.frostAuraRadius=(p.frostAuraRadius||130)+45;p.frostSlow=Math.min(.88,(p.frostSlow||.50)+.06);p.frostAuraDps=(p.frostAuraDps||.12)+.06}],
    'Crit Chance':['Crit Chance',()=>'+6% crit chance',()=>game.player.crit=Math.min(.95,(game.player.crit||0)+.06)],
    'Rapid Recovery':['Rapid Recovery',()=>'+20% healing',()=>game.player.healMult=(game.player.healMult||1)*1.20],
    'Armor Pierce':['Armor Pierce',()=>'+8% damage against enemy defenses',()=>game.player.armorPierce=(game.player.armorPierce||0)+.08],
    'Coin Magnetism':['Coin Magnetism',()=>'+25 pickup radius and +8% coins',()=>{const p=game.player;p.magnet+=25;p.coinMult*=1.08}],

    // EPIC — powerful but still controlled
    'Heavy Rounds':['Heavy Rounds',()=>'+12 damage, 4% slower attacks',()=>{const p=game.player;p.damage+=12;p.fireRate=Math.min(1.1,(p.fireRate||.45)*1.04)}],
    'Chain Reaction':['Chain Reaction',()=>'+12% chain damage',()=>game.player.chain=(game.player.chain||1)*1.12],
    'Lifesteal':['Lifesteal',()=>'+0.25 HP per kill',()=>game.player.vampire=(game.player.vampire||0)+.25],
    'Shockwave':['Shockwave',()=>+'Every 14th kill triggers a 140-radius blast',()=>{game.player.shockwave=true;game.player.shockwaveEvery=14;game.player.shockwaveRadius=140;game.player.shockwaveDamage=.65}],
    'Deadeye':['Deadeye',()=>'+8% crit chance',()=>game.player.crit=Math.min(.95,(game.player.crit||0)+.08)],
    'Scavenger Luck':['Scavenger Luck',()=>'+8 Loot Luck',()=>{const p=game.player;p.lootLuck=(p.lootLuck||0)+8;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}],
    'Elite Hunter':['Elite Hunter',()=>'+20% elite damage, +5% crit, +5% move speed',()=>{const p=game.player;p.executioner=(p.executioner||0)+.20;p.crit=Math.min(.95,(p.crit||0)+.05);p.speed=Math.min(p.speedCap,p.speed*1.05)}],
    'Void Arsenal':['Void Arsenal',()=>'+2 projectiles, +10% projectile speed, +20% damage, +1 pierce',()=>{const p=game.player;p.multiShot=(p.multiShot||0)+2;p.projectileSpeed=(p.projectileSpeed||1)*1.10;p.damage*=1.20;p.pierce=(p.pierce||0)+1}],

    // LEGENDARY — major run-shaping effects
    'Lucky Hunter':['Lucky Hunter',()=>'+25% chance to double XP',()=>game.player.lucky=true],
    'Lucky Coins':['Lucky Coins',()=>'+20% coins',()=>game.player.coinMult*=1.20],
    'Adrenaline':['Adrenaline',()=>'+15% move speed while below 50% HP',()=>{const p=game.player;p.adrenaline=true;p.adrenalineBonus=.15}],
    'Shield Core':['Shield Core',()=>'+5 seconds of shield',()=>game.player.shield=Math.max(game.player.shield||0,5)],
    'Poison Rounds':['Poison Rounds',()=>+'Shots apply poison',()=>game.player.poison=true],
    'Stun Rounds':['Stun Rounds',()=>+'Shots have an 18% stun chance',()=>{game.player.stun=true;game.player.stunChance=.18}],

    // MYTHIC — strong specialization
    'Overcharge':['Overcharge',()=>'+30% ultimate damage',()=>game.player.ultDamage=(game.player.ultDamage||1)*1.30],
    'Double Tap':['Double Tap',()=>'+20% chance to fire an extra shot',()=>{game.player.doubleTap=true;game.player.doubleTapChance=.20}],
    'Treasure Radar':['Treasure Radar',()=>+'1.5x power-up drop chance',()=>{game.player.treasure=true;game.player.treasureMultiplier=Math.max(game.player.treasureMultiplier||1,1.5)}],
    'Lucky Charm':['Lucky Charm',()=>'+8 Upgrade Luck',()=>{const p=game.player;p.upgradeLuck=(p.upgradeLuck||0)+8;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}],
    'Treasure Luck':['Treasure Luck',()=>'+20 Treasure Luck',()=>{const p=game.player;p.treasureLuck=(p.treasureLuck||0)+20;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}],
    'Fortune':['Fortune',()=>'+15 Loot Luck',()=>{const p=game.player;p.lootLuck=(p.lootLuck||0)+15;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}],
    'Abyssal Core':['Abyssal Core',()=>'+60% damage, +20% attack speed, +2 pierce, +15% boss damage',()=>{const p=game.player;p.damage*=1.60;p.fireRate=Math.max(.10,(p.fireRate||.45)*.80);p.pierce=(p.pierce||0)+2;p.bossMult=(p.bossMult||1)*1.15}],

    // DIVINE — very strong but not runaway
    'Overheat':['Overheat',()=>'+25% attack speed and +5% damage',()=>{const p=game.player;p.fireRate=Math.max(.12,(p.fireRate||.45)*.75);p.damage*=1.05}],
    'Rift Pierce':['Rift Pierce',()=>'+2 pierce',()=>game.player.pierce=(game.player.pierce||0)+2],
    'Cryo Core':['Cryo Core',()=>+'Frost aura gets stronger',()=>{const p=game.player;p.frost=true;p.frostSlow=Math.min(.90,(p.frostSlow||.50)+.09);p.frostAuraDps=(p.frostAuraDps||.12)+.08}],
    'Ammo Surge':['Ammo Surge',()=>'+3 projectiles',()=>game.player.multiShot=(game.player.multiShot||0)+3],
    'Heavy Impact':['Heavy Impact',()=>'+25 damage and +20% projectile size',()=>{const p=game.player;p.damage+=25;p.bulletSize=(p.bulletSize||1)*1.20}],
    'Emergency Shield':['Emergency Shield',()=>+'7 seconds of shield',()=>game.player.shield=Math.max(game.player.shield||0,7)],
    'Divine Aegis':['Divine Aegis',()=>'+250 max HP, 8s shield, 12% damage reduction',()=>{const p=game.player;p.max+=250;p.hp=Math.min(p.max,p.hp+250);p.shield=Math.max(p.shield||0,8);p.damageTakenMult=Math.max(.50,(p.damageTakenMult||1)*.88)}],

    // CELESTIAL — high-impact synergy
    'Vampiric Surge':['Vampiric Surge',()=>'+0.5 HP per kill',()=>game.player.vampire=(game.player.vampire||0)+.50],
    'Fortune Engine':['Fortune Engine',()=>'+15 Upgrade Luck and +15% coins',()=>{const p=game.player;p.upgradeLuck=(p.upgradeLuck||0)+15;p.coinMult*=1.15;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}],
    'Combat Medic':['Combat Medic',()=>'+3 HP/s and +25% healing',()=>{const p=game.player;p.regen+=3;p.healMult=(p.healMult||1)*1.25}],
    'XP Hunter':['XP Hunter',()=>'+25% XP',()=>game.player.xpBonus*=1.25],
    'Bloodrush':['Bloodrush',()=>'+30% damage below 50% HP',()=>{const p=game.player;p.berserk=true;p.berserkBonus=(p.berserkBonus||0)+.30}],
    'Fortress':['Fortress',()=>'+160 max HP and 10% armor',()=>{const p=game.player;p.max+=160;p.hp=Math.min(p.max,p.hp+160);p.armor=Math.max(.10,(p.armor||1)-.10)}],
    'Adrenal Core':['Adrenal Core',()=>'+10% move speed and +12% attack speed',()=>{const p=game.player;p.speed=Math.min(p.speedCap,p.speed*1.10);p.fireRate=Math.max(.12,(p.fireRate||.45)*.88)}],
    'XP Reactor':['XP Reactor',()=>'+20% XP and +6 Upgrade Luck',()=>{const p=game.player;p.xpBonus*=1.20;p.upgradeLuck=(p.upgradeLuck||0)+6;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}],
    'Celestial Barrage':['Celestial Barrage',()=>'+5 projectiles, +80% damage, +30% projectile speed, +15% crit, +2 pierce',()=>{const p=game.player;p.multiShot=(p.multiShot||0)+5;p.damage*=1.80;p.projectileSpeed=(p.projectileSpeed||1)*1.30;p.crit=Math.min(.95,(p.crit||0)+.15);p.pierce=(p.pierce||0)+2}],

    // TRANSCENDENT — exceptional, but still bounded
    'Quick Reload':['Quick Reload',()=>'+14% attack speed',()=>game.player.fireRate=Math.max(.10,(game.player.fireRate||.45)*.86)],
    'Ricochet':['Ricochet',()=>'+1 pierce and +8% projectile size',()=>{const p=game.player;p.pierce=(p.pierce||0)+1;p.bulletSize=(p.bulletSize||1)*1.08}],
    'Executioner':['Executioner',()=>'+20% elite damage',()=>game.player.executioner=(game.player.executioner||0)+.20],
    'Bossbreaker':['Bossbreaker',()=>'+20% boss damage',()=>game.player.bossDamageBonus=(game.player.bossDamageBonus||0)+.20],
    'Cryo Burst':['Cryo Burst',()=>+'Large frost aura, stronger slow and chill damage',()=>{const p=game.player;p.frost=true;p.frostAuraRadius=(p.frostAuraRadius||130)+70;p.frostSlow=Math.min(.93,(p.frostSlow||.50)+.12);p.frostAuraDps=(p.frostAuraDps||.12)+.12}],
    'Shock Circuit':['Shock Circuit',()=>'+20% chain effect',()=>game.player.chain=(game.player.chain||1)*1.20],
    'Transcendent Fury':['Transcendent Fury',()=>'+125% damage, +60% attack speed, +20% crit, +3 pierce, +25% boss damage, +30% ultimate damage',()=>{const p=game.player;p.damage*=2.25;p.fireRate=Math.max(.065,(p.fireRate||.45)*.40);p.crit=Math.min(.97,(p.crit||0)+.20);p.pierce=(p.pierce||0)+3;p.bossMult=(p.bossMult||1)*1.25;p.ultDamage=(p.ultDamage||1)*1.30}],

    // ETERNAL — extreme survivability and scaling
    'Vampire Core':['Vampire Core',()=>'+0.6 HP per kill and +8% max HP',()=>{const p=game.player;p.vampire=(p.vampire||0)+.60;p.max*=1.08;p.hp=Math.min(p.max,p.hp+p.max*.08)}],
    'Salvager':['Salvager',()=>'+25% coins and +20 pickup radius',()=>{const p=game.player;p.coinMult*=1.25;p.magnet+=20}],
    'Lucky Barrage':['Lucky Barrage',()=>'+28% chance to fire an extra shot',()=>{game.player.doubleTap=true;game.player.doubleTapChance=Math.max(game.player.doubleTapChance||0,.28)}],
    'Shield Nova':['Shield Nova',()=>+'6 seconds of shield and defensive pulse',()=>{const p=game.player;p.shield=Math.max(p.shield||0,6);p.shieldEfficiency=Math.max(p.shieldEfficiency||1,1.15);game.effects.push({x:p.x,y:p.y,t:.45,r:145,fill:false})}],
    'Overclock':['Overclock',()=>'+20% attack speed and +8% damage',()=>{const p=game.player;p.fireRate=Math.max(.09,(p.fireRate||.45)*.80);p.damage*=1.08}],
    'Eternal Rebirth':['Eternal Rebirth',()=>'+900 max HP, +15 HP/s, +100% damage, 30% damage reduction, +1 Phoenix revive',()=>{const p=game.player;p.max+=900;p.hp=Math.min(p.max,p.hp+900);p.regen+=15;p.damage*=2;p.damageTakenMult=Math.max(.45,(p.damageTakenMult||1)*.70);p.phoenixRevives=(p.phoenixRevives||0)+1}],
    'Last Stand':['Last Stand',()=>'+35% damage below 25% HP',()=>{const p=game.player;p.lastStand=true;p.lastStandBonus=(p.lastStandBonus||0)+.35}],

    // OMEGA — apex choices
    'Treasure Engine':['Treasure Engine',()=>'+30 Treasure Luck and 2.25x power-up drop chance',()=>{const p=game.player;p.treasureLuck=(p.treasureLuck||0)+30;p.treasure=true;p.treasureMultiplier=Math.max(p.treasureMultiplier||1,2.25);p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}],
    'Deadly Precision':['Deadly Precision',()=>'+12% crit chance and +15% crit damage',()=>{const p=game.player;p.crit=Math.min(.99,(p.crit||0)+.12);p.critMult=(p.critMult||1.8)+.15}],
    'Omega Ascension':['Omega Ascension',()=>'+300% damage, +80% attack speed, +30% crit, +7 projectiles, +7 pierce, +125% ultimate damage, +50% boss damage, +40% chain',()=>{const p=game.player;p.damage*=4.00;p.fireRate=Math.max(.045,(p.fireRate||.45)*.20);p.crit=Math.min(.99,(p.crit||0)+.30);p.multiShot=(p.multiShot||0)+7;p.pierce=(p.pierce||0)+7;p.ultDamage=(p.ultDamage||1)*2.25;p.bossMult=(p.bossMult||1)*1.50;p.chain=(p.chain||1)*1.40;p.shockwave=true;p.shockwaveEvery=10;p.shockwaveRadius=170;p.shockwaveDamage=.90}]
  };

  function install(){
    if(typeof tempUp!=='undefined'&&Array.isArray(tempUp)){
      for(const [name,def] of Object.entries(B)){
        const i=tempUp.findIndex(x=>x&&x[0]===name);
        if(i>=0)tempUp.splice(i,1,def);
      }
    }
    if(typeof updates!=='undefined'&&Array.isArray(updates)&&!updates.some(x=>Array.isArray(x)&&String(x[0]).includes('All-Rarity Upgrade Balance'))){
      updates.unshift(['v3.27.101 — All-Rarity Upgrade Balance','Rebalanced the full active upgrade ladder from Common through Omega so each rarity has a clear, controlled power level.']);
    }
    if(typeof helpArticles!=='undefined'&&Array.isArray(helpArticles)&&!helpArticles.some(x=>Array.isArray(x)&&String(x[0]).includes('full upgrade ladder'))){
      helpArticles.unshift(['How is the upgrade ladder balanced now?','Upgrades','Every active upgrade from Common through Omega has a fixed tier-appropriate effect. Lower rarities provide focused improvements, while higher rarities combine stronger effects without runaway rarity-multiplier scaling.']);
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  setTimeout(install,0);
})();