/* OUTLAST v3.27.105 — event content and effect hardening */
(function(){
  'use strict';
  if(window.__outlastEventHardening327105)return;
  window.__outlastEventHardening327105=true;

  let originalSpawn=null;
  let originalUpdate=null;
  let treasureCacheClock=0;

  function installSpawnPatch(){
    const fn=window.spawnEnemy;
    if(typeof fn!=='function')return false;
    if(fn.__outlastOmegaPatch327105)return true;
    originalSpawn=fn;
    const wrapped=function(type){
      const g=window.game;
      const omegaEvent=!!(g&&g.worldEvent==='OmegaHunt'&&(type==='juggernaut'||type==='phantom'));
      const before=g&&Array.isArray(g.enemies)?g.enemies.length:0;
      const result=originalSpawn.apply(this,arguments);
      if(omegaEvent&&g&&Array.isArray(g.enemies)){
        const spawned=g.enemies.slice(before).filter(e=>e&&!e.boss&&!e.__dead);
        const e=spawned[spawned.length-1];
        if(e){
          e.kind='omega';
          e.omegaTarget=true;
          e.max=Math.max((Number(e.max)||100)*2.35,520+(Number(g.level)||1)*24);
          e.hp=e.max;
          e.speed=Math.max(72,(Number(e.speed)||70)*1.08);
          e.damage=Math.max(20,(Number(e.damage)||15)*1.28);
          e.r=Math.max(28,Number(e.r)||15);
          e.xp=Math.max(10,Math.floor((Number(e.xp)||2)*4));
          if(g.player&&typeof ring==='function')ring(e.x,e.y,'#dca7ff',42,.45);
          if(g.player&&typeof burst==='function')burst(e.x,e.y,'#dca7ff',9,100);
          if(window.save?.codex)window.save.codex.omega=true;
        }
      }
      return result;
    };
    wrapped.__outlastOmegaPatch327105=true;
    window.spawnEnemy=wrapped;
    return true;
  }

  function installUpdatePatch(){
    const fn=window.update;
    if(typeof fn!=='function')return false;
    if(fn.__outlastEventPatch327105)return true;
    originalUpdate=fn;
    const wrapped=function(dt){
      const g=window.game,p=g?.player,step=Math.max(0,Number(dt)||0);
      const event=String(g?.worldEvent||'');
      const factor=event==='PowerSurge'?.74:event==='TimeWarp'?.82:1;
      const expiresThisFrame=!!(g&&p&&factor<1&&Number(g.worldEventTimer)>0&&Number(g.worldEventTimer)<=step+.001);
      const preRate=expiresThisFrame?Number(p.fireRate):NaN;
      if(event!=='TreasureRain')treasureCacheClock=0;
      const result=originalUpdate.apply(this,arguments);
      const g2=window.game,p2=g2?.player;

      if(expiresThisFrame&&p2&&Number.isFinite(preRate)&&preRate>0&&Number.isFinite(Number(p2.fireRate))){
        p2.fireRate=Math.max(.07,preRate/factor);
      }

      if(g2&&g2.running&&!g2.over&&g2.worldEvent==='TreasureRain'&&Number(g2.worldEventTimer)>0){
        treasureCacheClock-=step;
        if(treasureCacheClock<=0){
          treasureCacheClock=5;
          if(Array.isArray(g2.coins)&&g2.coins.length<Math.max(1,(Number(g2.MAX_PICKUPS)||200)-1)){
            const px=g2.player?.x||0,py=g2.player?.y||0;
            const value=20+Math.floor(Math.random()*11);
            g2.coins.push({x:px+(Math.random()-.5)*420,y:py+(Math.random()-.5)*300,value,icon:'$',treasureCache:true});
            if(typeof ring==='function')ring(px,py,'#ffd86b',28,.28);
            if(typeof burst==='function')burst(px,py,'#ffd86b',6,75);
            if(typeof toast==='function')toast('TREASURE CACHE DROPPED!');
          }
        }
      }
      return result;
    };
    wrapped.__outlastEventPatch327105=true;
    window.update=wrapped;
    return true;
  }

  function install(){
    installSpawnPatch();
    installUpdatePatch();
    if(typeof updates!=='undefined'&&Array.isArray(updates)&&!updates.some(x=>Array.isArray(x)&&String(x[0]).includes('Event Content Hardening'))){
      updates.unshift(['v3.27.105 — Event Content Hardening','Small event reliability fixes for temporary event effects, target spawning, and Treasure Rain rewards.']);
    }
    if(typeof helpArticles!=='undefined'&&Array.isArray(helpArticles)&&!helpArticles.some(x=>Array.isArray(x)&&String(x[0]).includes('Treasure Rain'))){
      helpArticles.unshift(['How do the event effects stay reliable?','Halloween Event','Temporary event effects are removed without erasing upgrades gained during the event. Omega Hunt creates a distinct high-threat target, and Treasure Rain drops extra treasure caches during its active window.']);
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  [0,100,500,1500].forEach(ms=>setTimeout(install,ms));
})();