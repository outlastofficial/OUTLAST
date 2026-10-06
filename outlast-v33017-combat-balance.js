/* OUTLAST v3.30.17 — Combat, Upgrade Balance & Clear Minimap */
(function(){
'use strict';
const VERSION='3.30.17';
const BALANCED_MULT={Common:1,Uncommon:1.25,Rare:1.5,Epic:1.8,Legendary:2.2,Mythic:2.7,Divine:3.3,Celestial:4,Transcendent:4.8,Eternal:5.8,Omega:7};
const WEAPONS=['Blaster','TwinShot','Shotgun','Railgun','Plasma','Chakram','Meteor','Shuriken','RocketLauncher','ChainGun','GravityOrb','PulseCannon','Laser','FrostNova','Flame','Lightning','OrbitBlades','Boomerang','VoidLauncher','StarRifle','ThunderStaff','DroneSwarm','MineLayer','ArcBlade','SoulCannon','OmegaBlade','WastelandBow','NovaCannon','RiftBlade','StormBow'];
window.OUTLAST_BALANCED_RARITY_MULTIPLIERS=BALANCED_MULT;
window.OUTLAST_WEAPON_BULLET_TYPES=WEAPONS.slice();

function applyBalancedRarities(){
 try{
  if(typeof upgradeRarities!=='undefined'){
   for(const [r,m] of Object.entries(BALANCED_MULT)){
    if(!upgradeRarities[r])upgradeRarities[r]={};
    upgradeRarities[r].mult=m;
   }
  }
  if(typeof tempUp!=='undefined'&&Array.isArray(tempUp)){
   for(const item of tempUp){
    if(!item)continue;
    if(/^Breach /.test(String(item[0]||''))){
      item[1]=m=>`+${Math.max(1,Math.min(7,Math.round(Number(m)||1)))} pierce`;
      item[2]=m=>{const gain=Math.max(1,Math.min(7,Math.round(Number(m)||1)));game.player.pierce=(game.player.pierce||0)+gain;};
    }
   }
  }
  window.OUTLAST_UPGRADE_BALANCE_READY=true;
 }catch(err){window.OUTLAST_UPGRADE_BALANCE_ERROR=String(err);}
}
function normalizeWeapon(weapon){return WEAPONS.includes(weapon)?weapon:'Blaster';}
window.normalizeWeaponForFire=normalizeWeapon;

const SHAPE={
 Blaster:'bolt',TwinShot:'twin',Shotgun:'pellets',Railgun:'rail',Plasma:'plasma',Chakram:'ring',Meteor:'meteor',Shuriken:'star4',RocketLauncher:'rocket',ChainGun:'tracer',GravityOrb:'gravity',PulseCannon:'pulse',Laser:'laser',FrostNova:'crystal',Flame:'flame',Lightning:'zigzag',OrbitBlades:'blade',Boomerang:'boomerang',VoidLauncher:'void',StarRifle:'star5',ThunderStaff:'thunder',DroneSwarm:'drone',MineLayer:'mine',ArcBlade:'arc',SoulCannon:'soul',OmegaBlade:'omega',WastelandBow:'arrow2',NovaCannon:'nova',RiftBlade:'rift',StormBow:'storm'};
window.OUTLAST_WEAPON_BULLET_SHAPES=SHAPE;

function projectile(b){
 const x=b.x||0,y=b.y||0,t=b.type||'Blaster',q=SHAPE[t]||'bolt',r=Math.max(2,(b.r||5));
 const a=b.a==null?Math.atan2(b.vy||0,b.vx||1):b.a;
 ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.lineCap='round';ctx.lineJoin='round';
 if(b.enemy){ctx.fillStyle='#ff8c8c';ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.restore();return;}
 ctx.shadowBlur=0;
 const glow=c=>{ctx.shadowColor=c;ctx.shadowBlur=10};
 if(q==='bolt'){glow('#fff08a');ctx.fillStyle='#fff08a';ctx.beginPath();ctx.moveTo(r*2,0);ctx.lineTo(-r*.7,-r*.7);ctx.lineTo(0,0);ctx.lineTo(-r*.7,r*.7);ctx.closePath();ctx.fill();}
 else if(q==='twin'){glow('#8fffb4');ctx.fillStyle='#8fffb4';for(const yy of [-r*.55,r*.55]){ctx.beginPath();ctx.arc(0,yy,r*.7,0,Math.PI*2);ctx.fill();}}
 else if(q==='pellets'){ctx.fillStyle='#ffd76b';for(const yy of [-r*.85,0,r*.85]){ctx.beginPath();ctx.arc(r*.8,yy,r*.5,0,Math.PI*2);ctx.fill();}}
 else if(q==='rail'){glow('#d7f0ff');ctx.fillStyle='#f4fbff';ctx.fillRect(-r*2.7,-r*.35,r*5.4,r*.7);ctx.fillStyle='#bde9ff';ctx.fillRect(r*1.2,-r*.65,r*1.1,r*1.3);}
 else if(q==='plasma'){glow('#e993ff');ctx.fillStyle='#e993ff';ctx.beginPath();ctx.arc(0,0,r*1.2,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,r*1.65,-1,1);ctx.stroke();}
 else if(q==='ring'){ctx.strokeStyle='#f7d46b';ctx.lineWidth=Math.max(2,r*.42);ctx.beginPath();ctx.arc(0,0,r*1.3,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='#fff0a8';ctx.lineWidth=Math.max(1,r*.18);ctx.beginPath();ctx.arc(0,0,r*.55,0,Math.PI*2);ctx.stroke();}
 else if(q==='meteor'){glow('#ff704d');ctx.fillStyle='#8f4630';ctx.beginPath();ctx.arc(0,0,r*1.2,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ff9e4f';ctx.beginPath();ctx.moveTo(-r*.6,-r*.5);ctx.lineTo(-r*2.2,-r);ctx.lineTo(-r*1.4,-r*.1);ctx.closePath();ctx.fill();}
 else if(q==='star4'){ctx.fillStyle='#dce8ff';ctx.strokeStyle='#8eb7ff';ctx.lineWidth=2;ctx.beginPath();for(let k=0;k<8;k++){const z=k*Math.PI/4,rr=k%2?r:r*1.8;ctx.lineTo(Math.cos(z)*rr,Math.sin(z)*rr);}ctx.closePath();ctx.fill();ctx.stroke();}
 else if(q==='rocket'){glow('#ffb347');ctx.fillStyle='#c5ccd2';ctx.fillRect(-r*1.0,-r*.42,r*2.0,r*.84);ctx.fillStyle='#ff704d';ctx.beginPath();ctx.moveTo(r*1.55,0);ctx.lineTo(r*.55,-r*.62);ctx.lineTo(r*.55,r*.62);ctx.closePath();ctx.fill();ctx.fillStyle='#ff9d45';ctx.fillRect(-r*1.7,-r*.2,r*.5,r*.4);}
 else if(q==='tracer'){ctx.strokeStyle='#ffe86a';ctx.lineWidth=Math.max(2,r*.55);ctx.beginPath();ctx.moveTo(-r*2.8,0);ctx.lineTo(r*1.7,0);ctx.stroke();}
 else if(q==='gravity'){glow('#ae8cff');ctx.fillStyle='#261c48';ctx.beginPath();ctx.arc(0,0,r*1.25,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#d9c7ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r*1.7,0,Math.PI*2);ctx.stroke();}
 else if(q==='pulse'){glow('#ff7cf5');ctx.fillStyle='#d65cff';ctx.beginPath();ctx.arc(0,0,r*.7,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#ffd2ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r*1.7,0,Math.PI*2);ctx.stroke();}
 else if(q==='laser'){glow('#ff4dff');ctx.strokeStyle='#ffb6ff';ctx.lineWidth=Math.max(2,r*.5);ctx.beginPath();ctx.moveTo(-r*3.4,0);ctx.lineTo(r*3.2,0);ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(r*2.8,0,r*.45,0,Math.PI*2);ctx.fill();}
 else if(q==='crystal'){glow('#9cecff');ctx.fillStyle='#bdf5ff';ctx.beginPath();ctx.moveTo(r*1.9,0);ctx.lineTo(0,-r*1.2);ctx.lineTo(-r*.8,0);ctx.lineTo(0,r*1.2);ctx.closePath();ctx.fill();ctx.strokeStyle='#69c9ef';ctx.stroke();}
 else if(q==='flame'){glow('#ff6a2f');ctx.fillStyle='#ff6a2f';ctx.beginPath();ctx.moveTo(r*1.9,0);ctx.quadraticCurveTo(.2*r,-r*1.4,-r*.9,0);ctx.quadraticCurveTo(.2*r,r*1.4,r*1.9,0);ctx.fill();ctx.fillStyle='#ffd36b';ctx.beginPath();ctx.arc(r*.35,0,r*.45,0,Math.PI*2);ctx.fill();}
 else if(q==='zigzag'||q==='thunder'){glow(q==='thunder'?'#c89cff':'#55ddff');ctx.strokeStyle=q==='thunder'?'#fff1c4':'#a9f1ff';ctx.lineWidth=Math.max(2,r*.4);ctx.beginPath();ctx.moveTo(-r*2,0);ctx.lineTo(-r*.85,-r);ctx.lineTo(-r*.1,r*.45);ctx.lineTo(r*.75,-r*.85);ctx.lineTo(r*2,0);ctx.stroke();}
 else if(q==='blade'||q==='arc'||q==='omega'||q==='rift'){ctx.strokeStyle=q==='rift'?'#dfb0ff':q==='omega'?'#ffe58a':'#8fe7ff';ctx.lineWidth=Math.max(2,r*.45);ctx.beginPath();ctx.arc(0,0,r*1.55,-1.15,1.15);ctx.stroke();ctx.beginPath();ctx.moveTo(-r*.35,-r*.85);ctx.lineTo(r*1.7,0);ctx.lineTo(-r*.35,r*.85);ctx.stroke();}
 else if(q==='boomerang'){ctx.strokeStyle='#f7d46b';ctx.lineWidth=Math.max(2,r*.48);ctx.beginPath();ctx.arc(0,0,r*1.5,-1.2,1.2);ctx.stroke();ctx.beginPath();ctx.arc(0,0,r*.85,1.85,4.4);ctx.stroke();}
 else if(q==='void'){glow('#7b4dff');ctx.fillStyle='#170f29';ctx.beginPath();ctx.arc(0,0,r*1.25,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#b7a4ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r*1.7,0,Math.PI*2);ctx.stroke();}
 else if(q==='star5'){glow('#fff2a0');ctx.fillStyle='#fff2a0';ctx.beginPath();for(let k=0;k<10;k++){const z=-Math.PI/2+k*Math.PI/5,rr=k%2?r:r*1.75;ctx.lineTo(Math.cos(z)*rr,Math.sin(z)*rr);}ctx.closePath();ctx.fill();}
 else if(q==='drone'){ctx.fillStyle='#78e0ff';ctx.strokeStyle='#1e6176';ctx.lineWidth=2;ctx.fillRect(-r*1.1,-r*.65,r*2.2,r*1.3);ctx.beginPath();ctx.arc(0,0,r*.3,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();ctx.stroke();ctx.strokeStyle='#78e0ff';ctx.beginPath();ctx.moveTo(-r*1.4,-r*.9);ctx.lineTo(-r*2,-r*1.25);ctx.moveTo(r*1.4,-r*.9);ctx.lineTo(r*2,-r*1.25);ctx.stroke();}
 else if(q==='mine'){glow('#ff7d7d');ctx.fillStyle='#3e4650';ctx.beginPath();ctx.arc(0,0,r*1.15,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#ff7d7d';ctx.lineWidth=2;for(let k=0;k<8;k++){const z=k*Math.PI/4;ctx.beginPath();ctx.moveTo(Math.cos(z)*r,Math.sin(z)*r);ctx.lineTo(Math.cos(z)*r*1.65,Math.sin(z)*r*1.65);ctx.stroke();}}
 else if(q==='soul'){glow('#d8a4ff');ctx.fillStyle='#c286ff';ctx.beginPath();ctx.arc(0,0,r*1.3,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(r*.3,-r*.2,r*.25,0,Math.PI*2);ctx.fill();}
 else if(q==='arrow2'||q==='storm'){ctx.strokeStyle=q==='storm'?'#8bd9ff':'#d99a5d';ctx.lineWidth=Math.max(2,r*.28);ctx.beginPath();ctx.moveTo(-r*1.7,0);ctx.lineTo(r*1.45,0);ctx.stroke();ctx.fillStyle=q==='storm'?'#9cecff':'#ff7a45';ctx.beginPath();ctx.moveTo(r*1.9,0);ctx.lineTo(r*.7,-r*.7);ctx.lineTo(r*.7,r*.7);ctx.closePath();ctx.fill();}
 else if(q==='nova'){glow('#fff0a8');ctx.fillStyle='#ffce62';ctx.beginPath();ctx.arc(0,0,r*.85,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff0a8';ctx.lineWidth=2;for(let k=0;k<8;k++){const z=k*Math.PI/4;ctx.beginPath();ctx.moveTo(Math.cos(z)*r,Math.sin(z)*r);ctx.lineTo(Math.cos(z)*r*2.1,Math.sin(z)*r*2.1);ctx.stroke();}}
 else{ctx.fillStyle='#fff08a';ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();}
 ctx.restore();
}
window.drawWeaponProjectile=projectile;

function clearMinimap(){
 if(!game.running||game.upgradeOpen)return;
 const mw=Math.min(190,Math.max(155,CW*.19)),mh=mw*H/W,mx=10,my=145,sx=mw/W,sy=mh/H;
 ctx.save();
 ctx.fillStyle='rgba(4,9,14,.97)';ctx.fillRect(mx-6,my-6,mw+12,mh+12);
 ctx.strokeStyle='#7892a8';ctx.lineWidth=2;ctx.strokeRect(mx-6,my-6,mw+12,mh+12);
 ctx.fillStyle='rgba(24,38,49,.98)';ctx.fillRect(mx,my,mw,mh);
 ctx.save();ctx.globalAlpha=.78;drawMapDetails(sx,sy,mx,my);ctx.restore();
 for(const o of obstacleRects()){ctx.fillStyle='rgba(194,202,210,.9)';ctx.fillRect(mx+o.x*sx,my+o.y*sy,Math.max(2.5,o.w*sx),Math.max(2.5,o.h*sy));}
 for(const g of game.gems){const x=mx+g.x*sx,y=my+g.y*sy;ctx.fillStyle='#48dcff';ctx.beginPath();ctx.moveTo(x,y-3);ctx.lineTo(x+3,y);ctx.lineTo(x,y+3);ctx.lineTo(x-3,y);ctx.closePath();ctx.fill();}
 for(const q of game.coins){const x=mx+q.x*sx,y=my+q.y*sy;ctx.fillStyle='#ffd24d';ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fill();ctx.fillStyle='#241b00';ctx.font='bold 7px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('$',x,y);}
 for(const q of game.powerups){const x=mx+q.x*sx,y=my+q.y*sy;ctx.fillStyle=q.type==='xpVacuum'?'#ffe16b':q.type==='heal'?'#65db74':q.type==='speed'?'#64b8ff':q.type==='damage'?'#ff6a62':'#d7b4ff';ctx.fillRect(x-3,y-3,6,6);}
 for(const q of game.shrines){const x=mx+q.x*sx,y=my+q.y*sy;ctx.fillStyle=q.color||'#c890ff';ctx.beginPath();ctx.moveTo(x,y-4);ctx.lineTo(x+4,y);ctx.lineTo(x,y+4);ctx.lineTo(x-4,y);ctx.closePath();ctx.fill();}
 for(const e of game.enemies){const x=mx+e.x*sx,y=my+e.y*sy;if(e.boss){ctx.fillStyle='#ffd24d';ctx.beginPath();for(let k=0;k<10;k++){const z=-Math.PI/2+k*Math.PI/5,rr=k%2?3:6;ctx.lineTo(x+Math.cos(z)*rr,y+Math.sin(z)*rr);}ctx.closePath();ctx.fill();}else if(e.kind==='elite'){ctx.fillStyle='#ff9c4d';ctx.beginPath();ctx.moveTo(x,y-4);ctx.lineTo(x+4,y);ctx.lineTo(x,y+4);ctx.lineTo(x-4,y);ctx.closePath();ctx.fill();}else{ctx.fillStyle='#ff5a67';ctx.beginPath();ctx.arc(x,y,2.5,0,Math.PI*2);ctx.fill();}}
 if(game.player){const x=mx+game.player.x*sx,y=my+game.player.y*sy;ctx.fillStyle='#69c0ff';ctx.beginPath();ctx.moveTo(x+5,y);ctx.lineTo(x-4,y-4);ctx.lineTo(x-2,y+4);ctx.closePath();ctx.fill();ctx.strokeStyle='#fff';ctx.stroke();}
 if(game.player2){const x=mx+game.player2.x*sx,y=my+game.player2.y*sy;ctx.fillStyle='#ff7aa0';ctx.beginPath();ctx.moveTo(x+4,y);ctx.lineTo(x-3,y-3);ctx.lineTo(x-2,y+3);ctx.closePath();ctx.fill();}
 ctx.fillStyle='rgba(2,8,13,.86)';ctx.fillRect(mx,my,mw,24);ctx.fillStyle='#fff';ctx.font='bold 10px Arial';ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.fillText('MAP • LIVE OBJECTS',mx+7,my+15);
 const base=my+mh-32;ctx.fillStyle='rgba(2,8,13,.92)';ctx.fillRect(mx,base,mw,32);ctx.font='8px Arial';ctx.textBaseline='middle';
 const key=[['#69c0ff','P','PLAYER'],['#ff5a67','●','ENEMY'],['#ffd24d','★','BOSS'],['#48dcff','◆','XP'],['#ffd24d','$','COIN'],['#d7b4ff','■','POWERUP'],['#c890ff','◇','SHRINE'],['#c0c9d0','■','OBJECT']];
 for(let i=0;i<key.length;i++){const k=key[i],x=mx+(i%4)*(mw/4)+5,y=base+8+Math.floor(i/4)*13;ctx.fillStyle=k[0];ctx.font='bold 9px Arial';ctx.fillText(k[1],x,y);ctx.fillStyle='#d8e3ec';ctx.font='7px Arial';ctx.fillText(k[2],x+10,y);}
 ctx.restore();
}
window.drawMinimap=clearMinimap;

function hook(){
 applyBalancedRarities();
 try{
  document.title='OUTLAST v'+VERSION;
  window.OUTLAST_BUILD=VERSION;window.OUTLAST_VERSION='v'+VERSION;
  document.querySelectorAll('[data-outlast-version]').forEach(el=>el.textContent='v'+VERSION);
  if(Array.isArray(helpArticles)&&!helpArticles.some(a=>a&&a[0]==='Why does each gun have a unique bullet?'))helpArticles.unshift(['Why does each gun have a unique bullet?','Weapons','Every weapon now uses its own projectile identity and visual shape instead of falling back to a generic Blaster projectile.']);
  if(Array.isArray(helpArticles)&&!helpArticles.some(a=>a&&a[0]==='How are upgrades balanced by rarity?'))helpArticles.unshift(['How are upgrades balanced by rarity?','Upgrades','Rarity multipliers now scale gradually from Common to Omega. Mythic Breach gives multiple pierce instead of the old +1 bug.']);
  if(Array.isArray(helpArticles)&&!helpArticles.some(a=>a&&a[0]==='What do the minimap symbols mean?'))helpArticles.unshift(['What do the minimap symbols mean?','Maps','Blue arrow = player, red dot = enemy, gold star = boss, orange diamond = elite, cyan diamond = XP, yellow dollar = coin, colored square = power-up, purple diamond = shrine, gray block = object.']);
 }catch(_){}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hook,{once:true});else hook();
setTimeout(hook,0);
})();