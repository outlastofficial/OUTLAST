/* OUTLAST v3.27.99 — premium rarity balance rebuild */
(function(){
  'use strict';
  if(window.__outlastPremiumBalance32799)return;
  window.__outlastPremiumBalance32799=true;

  const defs={
    'Abyssal Core':['Abyssal Core',()=>'+60% damage, +20% attack speed, +2 pierce, +15% boss damage',()=>{const p=game?.player;if(!p)return;p.damage*=1.60;p.fireRate=Math.max(.10,(p.fireRate||.45)*.80);p.pierce=(p.pierce||0)+2;p.bossMult=(p.bossMult||1)*1.15}],
    'Divine Aegis':['Divine Aegis',()=>'+300 max HP, 8s shield, 15% damage reduction',()=>{const p=game?.player;if(!p)return;p.max+=300;p.hp=Math.min(p.max,p.hp+300);p.shield=Math.max(p.shield||0,8);p.damageTakenMult=Math.max(.50,(p.damageTakenMult||1)*.85)}],
    'Celestial Barrage':['Celestial Barrage',()=>'+5 projectiles, +80% damage, +30% projectile speed, +15% crit, +2 pierce',()=>{const p=game?.player;if(!p)return;p.multiShot=(p.multiShot||0)+5;p.damage*=1.80;p.projectileSpeed=(p.projectileSpeed||1)*1.30;p.crit=Math.min(.95,(p.crit||0)+.15);p.pierce=(p.pierce||0)+2}],
    'Transcendent Fury':['Transcendent Fury',()=>'+125% damage, +60% attack speed, +20% crit, +3 pierce, +25% boss damage, +30% ultimate damage',()=>{const p=game?.player;if(!p)return;p.damage*=2.25;p.fireRate=Math.max(.065,(p.fireRate||.45)*.40);p.crit=Math.min(.97,(p.crit||0)+.20);p.pierce=(p.pierce||0)+3;p.bossMult=(p.bossMult||1)*1.25;p.ultDamage=(p.ultDamage||1)*1.30}],
    'Eternal Rebirth':['Eternal Rebirth',()=>'+900 max HP, +15 HP/s, +100% damage, 30% damage reduction, +1 Phoenix revive',()=>{const p=game?.player;if(!p)return;p.max+=900;p.hp=Math.min(p.max,p.hp+900);p.regen+=(15);p.damage*=2.00;p.damageTakenMult=Math.max(.45,(p.damageTakenMult||1)*.70);p.phoenixRevives=(p.phoenixRevives||0)+1}],
    'Omega Ascension':['Omega Ascension',()=>'+350% damage, +90% attack speed, +30% crit, +8 projectiles, +8 pierce, +150% ultimate damage, +60% boss damage',()=>{const p=game?.player;if(!p)return;p.damage*=4.50;p.fireRate=Math.max(.045,(p.fireRate||.45)*.10);p.crit=Math.min(.99,(p.crit||0)+.30);p.multiShot=(p.multiShot||0)+8;p.pierce=(p.pierce||0)+8;p.ultDamage=(p.ultDamage||1)*2.50;p.bossMult=(p.bossMult||1)*1.60;p.chain=(p.chain||1)*1.50;p.shockwave=true}]
  };

  function install(){
    if(typeof tempUp!=='undefined'&&Array.isArray(tempUp)){
      for(const [name,def] of Object.entries(defs)){const i=tempUp.findIndex(x=>x&&x[0]===name);if(i>=0)tempUp.splice(i,1,def);}
    }
    if(typeof updates!=='undefined'&&Array.isArray(updates)&&!updates.some(x=>Array.isArray(x)&&String(x[0]).includes('Premium Rarity Balance'))){
      updates.unshift(['v3.27.99 — Premium Rarity Balance','Rebalanced the remaining oversized high-rarity upgrades so each rarity has a controlled, distinct strength.']);
    }
    if(typeof helpArticles!=='undefined'&&Array.isArray(helpArticles)&&!helpArticles.some(x=>Array.isArray(x)&&String(x[0]).includes('premium rarity upgrades'))){
      helpArticles.unshift(['How were the premium rarity upgrades balanced?','Upgrades','Abyssal Core, Divine Aegis, Celestial Barrage, Transcendent Fury, Eternal Rebirth, and Omega Ascension were rebuilt with fixed tier-appropriate bonuses so their strength no longer scales out of control.']);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  setTimeout(install,0);
})();