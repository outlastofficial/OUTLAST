/* OUTLAST v3.27.102 — Bouncing Bullets */
(function(){
  'use strict';
  if(window.__outlastBouncingBullets327102)return;
  window.__outlastBouncingBullets327102=true;

  const def=[
    'Bouncing Bullets',
    ()=>'Shots bounce to up to 2 nearby enemies at 60% damage per bounce',
    ()=>{
      const p=game.player;
      if(!p)return;
      p.bouncingBullets=true;
      p.bounceCount=Math.min(4,(Number(p.bounceCount)||0)+2);
      p.bounceDamage=.60;
      p.bounceRange=360;
    }
  ];

  function install(){
    if(typeof tempUp!=='undefined'&&Array.isArray(tempUp)){
      const i=tempUp.findIndex(x=>x&&x[0]==='Bouncing Bullets');
      if(i>=0)tempUp.splice(i,1,def);else tempUp.push(def);
    }
    if(typeof UPGRADE_RARITY_POOLS!=='undefined'&&UPGRADE_RARITY_POOLS.Rare&&Array.isArray(UPGRADE_RARITY_POOLS.Rare)){
      if(!UPGRADE_RARITY_POOLS.Rare.includes('Bouncing Bullets'))UPGRADE_RARITY_POOLS.Rare.push('Bouncing Bullets');
    }
    if(typeof updates!=='undefined'&&Array.isArray(updates)&&!updates.some(x=>Array.isArray(x)&&String(x[0]).includes('Bouncing Bullets'))){
      updates.unshift(['v3.27.102 — Bouncing Bullets','Added a Rare Bouncing Bullets upgrade that makes projectile shots chain to nearby enemies with controlled bounce damage.']);
    }
    if(typeof helpArticles!=='undefined'&&Array.isArray(helpArticles)&&!helpArticles.some(x=>Array.isArray(x)&&String(x[0]).includes('Bouncing Bullets'))){
      helpArticles.unshift(['How does Bouncing Bullets work?','Upgrades','Bouncing Bullets lets new projectile shots bounce to up to 2 nearby enemies. Each bounce deals 60% of the previous shot damage, with a 360px target search range.']);
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  setTimeout(install,0);
})();
