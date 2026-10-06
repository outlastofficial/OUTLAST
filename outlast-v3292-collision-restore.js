/* OUTLAST v3.29.2 — solid map-object collision restore */
(function(){
'use strict';
if(window.__outlast3292CollisionRestore)return;
window.__outlast3292CollisionRestore=true;

function buildExtraRects(){
  const src=(typeof MAP_OBJECTS==='object'&&MAP_OBJECTS)||{};
  const out={};
  for(const [map,items] of Object.entries(src)){
    out[map]=(Array.isArray(items)?items:[]).map(o=>({x:Number(o[1])||0,y:Number(o[2])||0,w:Math.max(1,Number(o[3])||1),h:Math.max(1,Number(o[4])||1),type:String(o[0]||'object')}));
  }
  return out;
}
const extra=buildExtraRects();
function pointBlocked(x,y,r,rects){
  return rects.some(o=>{
    const cx=Math.max(o.x,Math.min(x,o.x+o.w)),cy=Math.max(o.y,Math.min(y,o.y+o.h));
    return Math.hypot(x-cx,y-cy)<r;
  });
}
function findOpenEnemyPoint(x,y,r=15,spread=260){
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const bx=clamp(Number(x)||W/2,r+6,W-r-6),by=clamp(Number(y)||H/2,r+6,H-r-6);
  const rects=obstacleRects();
  if(!pointBlocked(bx,by,r,rects))return {x:bx,y:by};
  for(let ring=20;ring<=spread;ring+=20){
    for(let step=0;step<24;step++){
      const a=step/24*Math.PI*2,px=clamp(bx+Math.cos(a)*ring,r+6,W-r-6),py=clamp(by+Math.sin(a)*ring,r+6,H-r-6);
      if(!pointBlocked(px,py,r,rects))return {x:px,y:py};
    }
  }
  return {x:bx,y:by};
}
function rescueEnemyFromObstacle(e){
  if(e&&pointBlocked(e.x,e.y,e.r||15,obstacleRects())){const p=findOpenEnemyPoint(e.x,e.y,e.r||15,260);e.x=p.x;e.y=p.y;}
}
if(typeof obstacleRects==='function'&&!window.__outlast3292ObstacleWrapped){
  window.__outlast3292ObstacleWrapped=true;
  const baseObstacleRects=obstacleRects;
  obstacleRects=function(map=save.map){
    const base=baseObstacleRects(map)||[];
    const more=extra[map]||[];
    return base.concat(more);
  };
}
if(typeof spawnEnemy==='function'&&!window.__outlast3292SpawnWrapped){
  window.__outlast3292SpawnWrapped=true;
  const baseSpawnEnemy=spawnEnemy;
  spawnEnemy=function(type){
    const before=game.enemies.length;
    const result=baseSpawnEnemy(type);
    for(let i=before;i<game.enemies.length;i++)rescueEnemyFromObstacle(game.enemies[i]);
    return result;
  };
}
if(typeof dash==='function'&&!window.__outlast3292DashWrapped){
  window.__outlast3292DashWrapped=true;
  dash=function(){
    if(!game.running||game.paused||game.upgradeOpen||!game.player)return;
    if((game.player.dashCooldown||0)>0)return;
    const dx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0);
    const dy=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);
    if(!dx&&!dy){const nx=game.player.x,ny=Math.max(30,game.player.y-220);tryMoveEntity(game.player,nx,ny);}
    else{const len=Math.hypot(dx,dy)||1;tryMoveEntity(game.player,Math.max(30,Math.min(W-30,game.player.x+dx/len*220)),Math.max(30,Math.min(H-30,game.player.y+dy/len*220)));}
    game.player.dashCooldown=4;save.records.totalDodges=(save.records.totalDodges||0)+1;
  };
}
window.__outlastUniqueMapSolids=extra;
window.__outlast3292MapCollisionAudit=()=>({maps:Object.keys(extra).length,solidObjectCount:Object.values(extra).reduce((n,a)=>n+a.length,0),obstacleCollisionWrapped:!!window.__outlast3292ObstacleWrapped,dashCollisionWrapped:!!window.__outlast3292DashWrapped});
})();