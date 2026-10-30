(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root&&root.document)root.OUTLAST_ZOMBIE_NAV=api;})(typeof window!=='undefined'?window:globalThis,function(){
'use strict';
const finite=(v,f=0)=>Number.isFinite(Number(v))?Number(v):f;
function isCacheFresh(cache,mapKey,goalKey,now,maxAge=.45){
 return !!cache&&cache.map===mapKey&&cache.goal===goalKey&&Array.isArray(cache.path)&&Number.isFinite(Number(cache.at))&&finite(now)-finite(cache.at)<maxAge;
}
function trackStuck(enemy,beforeX,beforeY,afterX,afterY,dt,intendedDistance){
 if(!enemy)return false;
 const moved=Math.hypot(finite(afterX)-finite(beforeX),finite(afterY)-finite(beforeY));
 if(finite(intendedDistance)<.5||moved>=.5){enemy.__zStuckTime=0;return false;}
 enemy.__zStuckTime=Math.min(4,Math.max(0,finite(enemy.__zStuckTime))+Math.max(0,finite(dt)));
 return enemy.__zStuckTime>=.45;
}
function pickRecoveryStep(x,y,targetX,targetY,step,radius,isBlocked){
 if(typeof isBlocked!=='function')return null;
 x=finite(x);y=finite(y);targetX=finite(targetX);targetY=finite(targetY);step=Math.max(0,finite(step));radius=Math.max(1,finite(radius,18));
 if(step<.5)return null;
 const base=Math.atan2(targetY-y,targetX-x),offsets=[0,-Math.PI/4,Math.PI/4,-Math.PI/2,Math.PI/2,-3*Math.PI/4,3*Math.PI/4,Math.PI];
 let best=null,bestScore=Infinity;
 for(const offset of offsets){
  const a=base+offset,nx=x+Math.cos(a)*step,ny=y+Math.sin(a)*step;
  // Match tryMoveEntity's axis-separated collision rules to avoid choosing an unusable diagonal.
  if(isBlocked(nx,y,radius)||isBlocked(nx,ny,radius))continue;
  const score=Math.hypot(targetX-nx,targetY-ny)+Math.abs(offset)*step*.10;
  if(score<bestScore){bestScore=score;best={x:nx,y:ny,angle:a};}
 }
 return best;
}
return{isCacheFresh,trackStuck,pickRecoveryStep};
});