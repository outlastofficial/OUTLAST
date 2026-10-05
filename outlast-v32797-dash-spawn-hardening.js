/* OUTLAST v3.27.97 — movement + spawn safety hardening */
(function(){
  'use strict';
  if(window.__outlastBugHardening32797)return;
  window.__outlastBugHardening32797=true;

  const DASH_DISTANCE=260;
  const DASH_STEP=8;
  const DASH_COOLDOWN=4;

  function finite(v){return Number.isFinite(Number(v));}
  function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
  function clearPoint(x,y,r){
    return finite(x)&&finite(y)&&finite(r)&&
      x>=r+4&&x<=W-r-4&&y>=r+4&&y<=H-r-4&&!blocked(x,y,r);
  }

  function strictSafePoint(x,y,r=20,avoidX=null,avoidY=null){
    r=Math.max(6,Number(r)||20);
    const bx=clamp(Number(x)||W/2,r+6,W-r-6);
    const by=clamp(Number(y)||H/2,r+6,H-r-6);
    const minGap=Math.max(70,r*3.5);
    const accept=(px,py)=>{
      px=clamp(px,r+6,W-r-6); py=clamp(py,r+6,H-r-6);
      if(!clearPoint(px,py,r))return null;
      if(avoidX!==null&&avoidY!==null&&finite(avoidX)&&finite(avoidY)&&Math.hypot(px-avoidX,py-avoidY)<minGap)return null;
      return {x:px,y:py};
    };
    const direct=accept(bx,by); if(direct)return direct;

    for(let ring=16;ring<=1600;ring+=16){
      for(let step=0;step<64;step++){
        const a=step*Math.PI*2/64;
        const p=accept(bx+Math.cos(a)*ring,by+Math.sin(a)*ring);
        if(p)return p;
      }
    }

    for(let step=28;step>=8;step-=4){
      for(let y=r+6;y<=H-r-6;y+=step){
        for(let x=r+6;x<=W-r-6;x+=step){
          const p=accept(x,y); if(p)return p;
        }
      }
    }
    return null;
  }

  // Never return a blocked player spawn to startGame.
  window.findSafePlayerSpawn=function(x,y,r=20,avoidX=null,avoidY=null){
    const p=strictSafePoint(x,y,r,avoidX,avoidY);
    return p || strictSafePoint(W/2,H/2,r,null,null) || {x:r+8,y:r+8};
  };

  window.findOpenEnemyPoint=function(x,y,r=15,spread=260){
    const p=strictSafePoint(x,y,r);
    return p || null;
  };

  // Replace the old dash teleport with a swept, collision-aware dash.
  window.dash=function(){
    if(!game.running||game.paused||game.upgradeOpen||!game.player)return;
    const p=game.player;
    if((p.dashCooldown||0)>0)return;
    let dx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0);
    let dy=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);
    if(!dx&&!dy)dy=-1;
    const len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len;
    const r=Math.max(8,Number(p.r)||20);
    let moved=0;
    for(let d=DASH_STEP;d<=DASH_DISTANCE;d+=DASH_STEP){
      const nx=clamp(p.x+ux*DASH_STEP,r+6,W-r-6);
      const ny=clamp(p.y+uy*DASH_STEP,r+6,H-r-6);
      if(!clearPoint(nx,ny,r))break;
      p.x=nx;p.y=ny;moved+=DASH_STEP;
    }
    p.dashCooldown=DASH_COOLDOWN;
    if(moved>0){
      save.records.totalDodges=(save.records.totalDodges||0)+1;
      game.effects.push({x:p.x,y:p.y,t:.16,r:28,color:'#69c7ff'});
    }
  };

  function repairEntity(e,avoidX=null,avoidY=null,remove=false){
    if(!e||!finite(e.x)||!finite(e.y))return remove?false:true;
    const r=Math.max(6,Number(e.r)||16);
    if(clearPoint(e.x,e.y,r))return true;
    const p=strictSafePoint(e.x,e.y,r,avoidX,avoidY);
    if(p){e.x=p.x;e.y=p.y;return true;}
    return !remove;
  }

  const oldEnemy=window.spawnEnemy;
  if(typeof oldEnemy==='function'&&!window.__outlastEnemyHardening32797){
    window.__outlastEnemyHardening32797=true;
    window.spawnEnemy=function(){
      const before=game.enemies.length,result=oldEnemy.apply(this,arguments);
      for(let i=before;i<game.enemies.length;i++){
        const e=game.enemies[i];
        if(!repairEntity(e,game.player?.x??null,game.player?.y??null,true))game.enemies.splice(i--,1);
      }
      return result;
    };
  }

  const oldBoss=window.spawnBoss;
  if(typeof oldBoss==='function'&&!window.__outlastBossHardening32797){
    window.__outlastBossHardening32797=true;
    window.spawnBoss=function(){
      const before=game.enemies.length,result=oldBoss.apply(this,arguments);
      for(let i=before;i<game.enemies.length;i++){
        const e=game.enemies[i];
        if(!repairEntity(e,game.player?.x??null,game.player?.y??null,true))game.enemies.splice(i--,1);
      }
      return result;
    };
  }

  if(typeof updates!=='undefined'&&Array.isArray(updates)){
    updates.unshift(['v3.27.97 — Dash & Spawn Safety','Hardened the Shift/mobile dash so it cannot clip through solid map objects, strengthened safe spawn selection, and prevented blocked entity placements. Login was not changed.']);
  }
  if(typeof helpArticles!=='undefined'&&Array.isArray(helpArticles)){
    helpArticles.unshift(['How does the safer dash work?','Dash','Press Shift during a run, or use the mobile Dash control. The dash is collision-aware: it stops before solid map objects instead of passing through them.']);
    helpArticles.unshift(['How are spawn points protected?','Spawn Safety','Before a run or entity spawn is accepted, OUTLAST checks the full collision radius against map objects. Blocked positions are moved to a clear point instead of being accepted inside an object.']);
  }
})();