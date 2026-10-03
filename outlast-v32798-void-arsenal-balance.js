/* OUTLAST v3.27.98 — Void Arsenal balance rebuild */
(function(){
  'use strict';
  if(window.__outlastVoidArsenalBalance32798)return;
  window.__outlastVoidArsenalBalance32798=true;
  function install(){
    if(typeof tempUp==='undefined'||!Array.isArray(tempUp))return;
    const balanced=[
      'Void Arsenal',
      v=>'+5 projectiles, +'+Math.round(15*v)+'% projectile speed, +'+Math.round(30*v)+'% damage, +'+Math.max(2,Math.round(1*v))+' pierce',
      v=>{
        const p=game?.player;if(!p)return;
        p.multiShot=(p.multiShot||0)+5;
        p.projectileSpeed=(p.projectileSpeed||1)*(1+.15*v);
        p.damage*=1+.30*v;
        p.pierce=(p.pierce||0)+Math.max(2,Math.round(1*v));
      }
    ];
    const i=tempUp.findIndex(x=>x&&x[0]==='Void Arsenal');
    if(i>=0)tempUp.splice(i,1,balanced);else tempUp.push(balanced);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  setTimeout(install,0);
})();