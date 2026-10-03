/* OUTLAST v3.27.98 — Void Arsenal Epic-tier rebuild */
(function(){
  'use strict';
  if(window.__outlastVoidArsenalBalance32798)return;
  window.__outlastVoidArsenalBalance32798=true;

  function install(){
    if(typeof tempUp!=='undefined'&&Array.isArray(tempUp)){
      const balanced=[
        'Void Arsenal',
        v=>'+2 projectiles, +'+Math.round(10*v)+'% projectile speed, +'+Math.round(20*v)+'% damage, +'+Math.max(1,Math.round(1*v))+' pierce',
        v=>{
          const p=game?.player;if(!p)return;
          p.multiShot=(p.multiShot||0)+2;
          p.projectileSpeed=(p.projectileSpeed||1)*(1+.10*v);
          p.damage*=1+.20*v;
          p.pierce=(p.pierce||0)+Math.max(1,Math.round(1*v));
        }
      ];
      const i=tempUp.findIndex(x=>x&&x[0]==='Void Arsenal');
      if(i>=0)tempUp.splice(i,1,balanced);
    }

    // Void Arsenal is explicitly an Epic upgrade. Remove any legacy placement
    // so it cannot be rolled as Transcendent or another premium tier.
    if(typeof UPGRADE_RARITY_POOLS!=='undefined'&&UPGRADE_RARITY_POOLS){
      for(const rarity of Object.keys(UPGRADE_RARITY_POOLS)){
        const pool=UPGRADE_RARITY_POOLS[rarity];
        if(Array.isArray(pool))UPGRADE_RARITY_POOLS[rarity]=pool.filter(n=>n!=='Void Arsenal');
      }
      if(Array.isArray(UPGRADE_RARITY_POOLS.Epic))UPGRADE_RARITY_POOLS.Epic.push('Void Arsenal');
    }
    if(typeof UPGRADE_RARITY_BY_NAME!=='undefined'&&UPGRADE_RARITY_BY_NAME)UPGRADE_RARITY_BY_NAME['Void Arsenal']='Epic';

    if(typeof updates!=='undefined'&&Array.isArray(updates)){
      if(!updates.some(x=>Array.isArray(x)&&String(x[0]).includes('Void Arsenal'))){
        updates.unshift(['v3.27.98 — Void Arsenal Rebalance','Rebuilt Void Arsenal as an Epic-tier upgrade with controlled projectile, speed, damage, and pierce bonuses.']);
      }
    }
    if(typeof helpArticles!=='undefined'&&Array.isArray(helpArticles)){
      if(!helpArticles.some(x=>Array.isArray(x)&&/Void Arsenal/i.test(String(x[0])))){
        helpArticles.unshift(['What does Void Arsenal do now?','Upgrades','Void Arsenal is an Epic upgrade. It gives a modest projectile increase plus projectile speed, damage, and pierce instead of the old high-tier scaling.']);
      }
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  setTimeout(install,0);
})();