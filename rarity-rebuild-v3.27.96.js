/* OUTLAST v3.27.96 — rebuilt high-rarity upgrade layer */
(function(){
  'use strict';
  function install(){
    if(typeof tempUp==='undefined'||!Array.isArray(tempUp)) return;
    const defs=[
      ['Elite Hunter',v=>`+${Math.round(65*v)}% elite damage, +${Math.round(18*v)}% crit, +${Math.round(8*v)}% move speed`,v=>{game.player.executioner=(game.player.executioner||0)+.65*v;game.player.crit=Math.min(.95,(game.player.crit||0)+.18*v);game.player.speed*=(1+.08*v)}],
      ['Abyssal Core',v=>`+${Math.round(120*v)}% damage, +${Math.round(42*v)}% attack speed, +${Math.max(2,Math.round(2*v))} pierce, +${Math.round(25*v)}% boss damage`,v=>{game.player.damage*=1+1.20*v;game.player.fireRate=Math.max(.09,(game.player.fireRate||.45)*(1-.42*v));game.player.pierce=(game.player.pierce||0)+Math.max(2,Math.round(2*v));game.player.bossDamageBonus=(game.player.bossDamageBonus||0)+.25*v}],
      ['Divine Aegis',v=>`+${Math.round(400*v)} max HP, ${Math.round(12*v)}s shield, ${Math.round(18*v)}% damage reduction`,v=>{game.player.max+=400*v;game.player.hp=Math.min(game.player.max,game.player.hp+400*v);game.player.shield=Math.max(game.player.shield||0,12*v);game.player.damageTakenMult=Math.max(.35,(game.player.damageTakenMult||1)*(1-.18*v))}],
      ['Celestial Barrage',v=>`+${Math.max(6,Math.min(18,Math.round(6*v)))} projectiles, +${Math.round(250*v)}% damage, +${Math.round(60*v)}% projectile speed, +${Math.round(20*v)}% crit, +${Math.max(3,Math.round(3*v))} pierce, stronger chains`,v=>{game.player.multiShot=(game.player.multiShot||0)+Math.max(6,Math.min(18,Math.round(6*v)));game.player.damage*=1+2.50*v;game.player.projectileSpeed=(game.player.projectileSpeed||1)*(1+.60*v);game.player.crit=Math.min(.99,(game.player.crit||0)+.20*v);game.player.pierce=(game.player.pierce||0)+Math.max(3,Math.round(3*v));game.player.chain=(game.player.chain||1)*(1+.35*v)}],
      ['Transcendent Fury',v=>`+${Math.round(600*v)}% damage, +${Math.round(125*v)}% attack speed, +${Math.round(25*v)}% crit, +${Math.max(6,Math.round(6*v))} pierce, +${Math.round(45*v)}% boss damage, +${Math.round(35*v)}% ultimate damage`,v=>{game.player.damage*=1+6*v;game.player.fireRate=Math.max(.045,(game.player.fireRate||.45)*(1-1.25*v));game.player.crit=Math.min(.99,(game.player.crit||0)+.25*v);game.player.pierce=(game.player.pierce||0)+Math.max(6,Math.round(6*v));game.player.bossDamageBonus=(game.player.bossDamageBonus||0)+.45*v;game.player.ultDamage=(game.player.ultDamage||1)*(1+.35*v)}],
      ['Void Arsenal',v=>`+${Math.max(8,Math.min(20,Math.round(8*v)))} projectiles, +${Math.round(100*v)}% projectile speed, +${Math.round(300*v)}% damage, +${Math.max(8,Math.round(8*v))} pierce, stronger chains`,v=>{game.player.multiShot=(game.player.multiShot||0)+Math.max(8,Math.min(20,Math.round(8*v)));game.player.projectileSpeed=(game.player.projectileSpeed||1)*(1+1.00*v);game.player.damage*=1+3.00*v;game.player.pierce=(game.player.pierce||0)+Math.max(8,Math.round(8*v));game.player.chain=(game.player.chain||1)*(1+.65*v)}],
      ['Eternal Rebirth',v=>`+${Math.round(1500*v)} max HP, +${(35*v).toFixed(1)} HP/s, +${Math.round(350*v)}% damage, ${Math.round(50*v)}% damage reduction, +${Math.max(1,Math.min(3,Math.round(v/3)))} Phoenix revive(s)`,v=>{game.player.max+=1500*v;game.player.hp=Math.min(game.player.max,game.player.hp+1500*v);game.player.regen+=(35*v);game.player.damage*=1+3.50*v;game.player.damageTakenMult=Math.max(.25,(game.player.damageTakenMult||1)*Math.pow(.50,Math.min(1.5,v)));game.player.phoenixRevives=(game.player.phoenixRevives||0)+Math.max(1,Math.min(3,Math.round(v/3)))}],
      ['Omega Ascension',v=>`+${Math.round(1500*v)}% damage, +${Math.round(250*v)}% attack speed, guaranteed crits, +${Math.max(12,Math.min(24,Math.round(12*v)))} projectiles, +${Math.max(12,Math.round(12*v))} pierce, +${Math.round(300*v)}% ultimate damage, +${Math.round(100*v)}% boss damage`,v=>{game.player.damage*=1+15.00*v;game.player.fireRate=Math.max(.035,(game.player.fireRate||.45)*(1-2.50*v));game.player.crit=1;game.player.multiShot=(game.player.multiShot||0)+Math.max(12,Math.min(24,Math.round(12*v)));game.player.pierce=(game.player.pierce||0)+Math.max(12,Math.round(12*v));game.player.ultDamage=(game.player.ultDamage||1)*(1+3.00*v);game.player.bossDamageBonus=(game.player.bossDamageBonus||0)+1.00*v;game.player.chain=(game.player.chain||1)*(1+1.25*v);game.player.shockwave=true;game.player.phoenixRevives=(game.player.phoenixRevives||0)+2}]
    ];
    for(const d of defs){
      const i=tempUp.findIndex(x=>x[0]===d[0]);
      if(i>=0)tempUp.splice(i,1,d);else tempUp.push(d);
    }
    window.__outlastPremiumRarityRebuild='3.27.96';
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  setTimeout(install,0);
})();
