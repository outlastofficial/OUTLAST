/* OUTLAST v3.27.99 — premium rarity balance rebuild */
(function(){
  'use strict';
  if(window.__outlastPremiumBalance32799)return;
  window.__outlastPremiumBalance32799=true;
  const defs={
    'Abyssal Core':['Abyssal Core',v=>'+ '+Math.round(45*v)+'% damage, +'+Math.round(18*v)+'% attack speed, +'+Math.max(2,Math.round(2*v))+' pierce, +'+Math.round(12*v)+'% boss damage',v=>{const p=game?.player;if(!p)return;p.damage*=1+.45*v;p.fireRate=Math.max(.10,(p.fireRate||.45)*(1-.18*v));p.pierce=(p.pierce||0)+Math.max(2,Math.round(2*v));p.bossMult=(p.bossMult||1)*(1+.12*v)}],
    'Divine Aegis':['Divine Aegis',v=>'+'+Math.round(180*v)+' max HP, '+Math.round(8*v)+'s shield, '+Math.round(10*v)+'% damage reduction',v=>{const p=game?.player;if(!p)return;p.max+=180*v;p.hp=Math.min(p.max,p.hp+180*v);p.shield=Math.max(p.shield||0,8*v);p.damageTakenMult=Math.max(.50,(p.damageTakenMult||1)*(1-.10*v))}],
    'Celestial Barrage':['Celestial Barrage',v=>'+'+Math.max(4,Math.round(4*v))+' projectiles, +'+Math.round(60*v)+'% damage, +'+Math.round(25*v)+'% projectile speed, +'+Math.round(10*v)+'% crit, +'+Math.max(1,Math.round(v))+' pierce',v=>{const p=game?.player;if(!p)return;p.multiShot=(p.multiShot||0)+Math.max(4,Math.round(4*v));p.damage*=1+.60*v;p.projectileSpeed=(p.projectileSpeed||1)*(1+.25*v);p.crit=Math.min(.95,(p.crit||0)+.10*v);p.pierce=(p.pierce||0)+Math.max(1,Math.round(v))}],
    'Transcendent Fury':['Transcendent Fury',v=>'+'+Math.round(100*v)+'% damage, +'+Math.round(50*v)+'% attack speed, +'+Math.round(15*v)+'% crit, +'+Math.max(3,Math.round(3*v))+' pierce, +'+Math.round(20*v)+'% boss damage, +'+Math.round(20*v)+'% ultimate damage',v=>{const p=game?.player;if(!p)return;p.damage*=1+1.00*v;p.fireRate=Math.max(.07,(p.fireRate||.45)*(1-.50*v));p.crit=Math.min(.97,(p.crit||0)+.15*v);p.pierce=(p.pierce||0)+Math.max(3,Math.round(3*v));p.bossMult=(p.bossMult||1)*(1+.20*v);p.ultDamage=(p.ultDamage||1)*(1+.20*v)}],
    'Eternal Rebirth':['Eternal Rebirth',v=>'+'+Math.round(650*v)+' max HP, +'+(12*v).toFixed(1)+' HP/s, +'+Math.round(80*v)+'% damage, -25% damage taken, +1 Phoenix revive',v=>{const p=game?.player;if(!p)return;p.max+=650*v;p.hp=Math.min(p.max,p.hp+650*v);p.regen+=(12*v);p.damage*=1+.80*v;p.damageTakenMult=Math.max(.45,(p.damageTakenMult||1)*Math.pow(.75,v));p.phoenixRevives=(p.phoenixRevives||0)+1}],
    'Omega Ascension':['Omega Ascension',v=>'+'+Math.round(275*v)+'% damage, +'+Math.round(70*v)+'% attack speed, +'+Math.round(25*v)+'% crit, +'+Math.max(6,Math.round(6*v))+' projectiles, +'+Math.max(6,Math.round(6*v))+' pierce, +'+Math.round(100*v)+'% ultimate damage, +'+Math.round(50*v)+'% boss damage',v=>{const p=game?.player;if(!p)return;p.damage*=1+2.75*v;p.fireRate=Math.max(.045,(p.fireRate||.45)*(1-.70*v));p.crit=Math.min(.99,(p.crit||0)+.25*v);p.multiShot=(p.multiShot||0)+Math.max(6,Math.round(6*v));p.pierce=(p.pierce||0)+Math.max(6,Math.round(6*v));p.ultDamage=(p.ultDamage||1)*(1+1.00*v);p.bossMult=(p.bossMult||1)*(1+.50*v);p.chain=(p.chain||1)*(1+.65*v);p.shockwave=true}]
  };
  function install(){
    if(typeof tempUp!=='undefined'&&Array.isArray(tempUp)){
      for(const [name,def] of Object.entries(defs)){const i=tempUp.findIndex(x=>x&&x[0]===name);if(i>=0)tempUp.splice(i,1,def);}
    }
    if(typeof updates!=='undefined'&&Array.isArray(updates)&&!updates.some(x=>Array.isArray(x)&&String(x[0]).includes('Premium Rarity Balance'))){
      updates.unshift(['v3.27.99 — Premium Rarity Balance','Rebalanced the remaining oversized high-rarity upgrades so each rarity has a controlled, distinct strength.']);
    }
    if(typeof helpArticles!=='undefined'&&Array.isArray(helpArticles)&&!helpArticles.some(x=>Array.isArray(x)&&String(x[0]).includes('premium rarity upgrades'))){
      helpArticles.unshift(['How were the premium rarity upgrades balanced?','Upgrades','Abyssal Core, Divine Aegis, Celestial Barrage, Transcendent Fury, Eternal Rebirth, and Omega Ascension were rebuilt with controlled tier-specific bonuses.']);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  setTimeout(install,0);
})();