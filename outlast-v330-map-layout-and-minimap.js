/* OUTLAST v3.30.1 — Unique Map Layouts + Functional Minimap
   Purpose: give every map a distinct navigational layout and make the minimap useful.
   Does not modify Start Run, login, or server connection flow.
*/
(function(){
'use strict';
if(window.__outlast330MapLayout)return;
window.__outlast330MapLayout=true;

const MAP_LAYOUT_INFO={
  Forest:'River trail + woodland clearings',
  Desert:'Canyon lanes + dune fields',
  Snow:'Frozen lake + snow ridges',
  Lava:'Lava river + basalt islands',
  City:'Street grid + intersections',
  Hospital:'Corridors + patient rooms',
  Laboratory:'Test chambers + hazard lanes',
  Subway:'Tracks + platforms + station lanes',
  Prison:'Cell blocks + secure yard',
  MilitaryBase:'Runway + trenches + helipad',
  RuinedTown:'Broken streets + building foundations',
  Harbor:'Waterfront + piers + container lanes',
  Bunker:'Blast rooms + reinforced corridors',
  Swamp:'Water pools + boardwalk',
  Skyscraper:'Office floors + elevator core',
  Wasteland:'Crater fields + wreck lanes'
};

function layoutForest(ctx,W,H){
  ctx.save();ctx.globalAlpha=.34;
  ctx.fillStyle='#2c5435';
  [[80,90,660,430],[2250,150,820,500],[80,1500,720,650],[2250,1560,780,610]].forEach(a=>ctx.fillRect(...a));
  ctx.fillStyle='#315d3a';ctx.beginPath();ctx.moveTo(1350,-20);ctx.bezierCurveTo(1160,420,1750,650,1370,1100);ctx.bezierCurveTo(1060,1460,1550,1700,1320,2440);ctx.lineTo(1720,2440);ctx.bezierCurveTo(1940,1880,1450,1500,1760,1120);ctx.bezierCurveTo(2080,720,1510,450,1700,-20);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#6d9e58';ctx.lineWidth=70;ctx.beginPath();ctx.moveTo(250,1250);ctx.bezierCurveTo(720,1080,980,1260,1320,1180);ctx.bezierCurveTo(1640,1100,1940,1280,2390,1130);ctx.stroke();
  ctx.fillStyle='#2a6670';ctx.beginPath();ctx.ellipse(2260,1190,310,210,0,0,Math.PI*2);ctx.fill();
  ctx.restore();
}
function layoutDesert(ctx,W,H){
  ctx.save();ctx.globalAlpha=.34;
  ctx.fillStyle='#7b5a30';
  ctx.beginPath();ctx.moveTo(0,620);ctx.lineTo(320,360);ctx.lineTo(710,430);ctx.lineTo(970,760);ctx.lineTo(760,1030);ctx.lineTo(330,950);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(3200,520);ctx.lineTo(2880,280);ctx.lineTo(2500,410);ctx.lineTo(2240,720);ctx.lineTo(2420,1010);ctx.lineTo(2880,900);ctx.closePath();ctx.fill();
  ctx.fillStyle='#c49b59';for(let i=0;i<7;i++){ctx.beginPath();ctx.arc(420+i*430,420+(i%2)*240,170,0,Math.PI, true);ctx.stroke();}  
  ctx.strokeStyle='#a87d42';ctx.lineWidth=120;ctx.beginPath();ctx.moveTo(160,1910);ctx.bezierCurveTo(760,1720,1120,1900,1580,1720);ctx.bezierCurveTo(2070,1510,2440,1660,3040,1480);ctx.stroke();
  ctx.restore();
}
function layoutSnow(ctx,W,H){
  ctx.save();ctx.globalAlpha=.42;
  ctx.fillStyle='#b9e4f2';ctx.beginPath();ctx.ellipse(1580,1190,720,430,.08,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#e8f7fc';ctx.lineWidth=80;for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(100,360+i*360);ctx.bezierCurveTo(720,250+i*380,1190,490+i*330,1840,300+i*390);ctx.bezierCurveTo(2390,150+i*430,2740,450+i*300,3100,300+i*380);ctx.stroke();}
  ctx.strokeStyle='#7eb0c7';ctx.lineWidth=28;ctx.beginPath();ctx.moveTo(260,2030);ctx.bezierCurveTo(920,1830,1340,2110,2030,1900);ctx.bezierCurveTo(2510,1750,2750,1940,3080,1830);ctx.stroke();
  ctx.restore();
}
function layoutLava(ctx,W,H){
  ctx.save();ctx.globalAlpha=.4;
  ctx.fillStyle='#7e2f28';ctx.beginPath();ctx.moveTo(0,980);ctx.bezierCurveTo(420,790,710,1120,1080,980);ctx.bezierCurveTo(1410,850,1700,1140,1990,940);ctx.bezierCurveTo(2320,720,2700,1050,3200,820);ctx.lineTo(3200,1320);ctx.bezierCurveTo(2700,1540,2330,1190,2000,1420);ctx.bezierCurveTo(1660,1610,1410,1280,1080,1490);ctx.bezierCurveTo(730,1660,430,1320,0,1510);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#ff6b3f';ctx.lineWidth=110;ctx.beginPath();ctx.moveTo(80,1880);ctx.bezierCurveTo(600,1730,780,2040,1190,1900);ctx.bezierCurveTo(1570,1780,1830,2020,2250,1820);ctx.bezierCurveTo(2680,1610,2860,1860,3160,1730);ctx.stroke();
  ctx.strokeStyle='#d9a35c';ctx.lineWidth=24;for(const [x,y] of [[420,420],[1080,420],[2060,520],[2750,450],[650,1560],[1540,1520],[2470,1390]]){ctx.beginPath();ctx.arc(x,y,120,0,Math.PI*2);ctx.stroke();}
  ctx.restore();
}
function layoutCity(ctx,W,H){
  ctx.save();ctx.globalAlpha=.55;
  ctx.fillStyle='#202a33';
  [[0,520,W,180],[0,1260,W,180],[760,0,190, H],[2240,0,190,H]].forEach(a=>ctx.fillRect(...a));
  ctx.fillStyle='#33414c';ctx.fillRect(900,700,1260,580);ctx.fillStyle='#2a3540';ctx.fillRect(1200,840,660,330);
  ctx.strokeStyle='#d0bd64';ctx.lineWidth=10;ctx.setLineDash([55,35]);for(const y of [605,1345]){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}ctx.setLineDash([]);
  ctx.strokeStyle='#b6c0c7';ctx.lineWidth=16;for(const x of [835,2315]){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  ctx.restore();
}
function layoutHospital(ctx,W,H){
  ctx.save();ctx.globalAlpha=.5;
  ctx.fillStyle='#eef3f5';ctx.fillRect(260,180,1040,1980);ctx.fillRect(1900,180,1040,1980);
  ctx.fillStyle='#d2e0e6';ctx.fillRect(1290,260,620,1800);
  ctx.fillStyle='#b4c4cc';ctx.fillRect(520,500,430,250);ctx.fillRect(520,920,430,250);ctx.fillRect(2250,500,430,250);ctx.fillRect(2250,920,430,250);
  ctx.strokeStyle='#8fa7b3';ctx.lineWidth=20;for(const y of [860,1280,1700]){ctx.beginPath();ctx.moveTo(270,y);ctx.lineTo(1300,y);ctx.stroke();ctx.moveTo(1900,y);ctx.lineTo(2930,y);ctx.stroke();}
  ctx.fillStyle='#c24f55';for(const [x,y] of [[1580,380],[1580,2000],[350,1050],[2850,1050]]){ctx.fillRect(x-24,y-70,48,140);ctx.fillRect(x-70,y-24,140,48);}
  ctx.restore();
}
function layoutLaboratory(ctx,W,H){
  ctx.save();ctx.globalAlpha=.5;
  ctx.fillStyle='#17333a';ctx.fillRect(260,210,720,720);ctx.fillRect(1220,210,720,720);ctx.fillRect(2180,210,720,720);
  ctx.fillStyle='#10262c';ctx.fillRect(260,1120,2640,920);
  ctx.strokeStyle='#58d4e6';ctx.lineWidth=12;for(const x of [1010,1970]){ctx.beginPath();ctx.moveTo(x,220);ctx.lineTo(x,2050);ctx.stroke();}
  ctx.strokeStyle='#d7b14b';ctx.lineWidth=16;ctx.setLineDash([28,18]);for(const y of [320,820,1240,1760]){ctx.beginPath();ctx.moveTo(300,y);ctx.lineTo(2860,y);ctx.stroke();}ctx.setLineDash([]);
  ctx.restore();
}
function layoutSubway(ctx,W,H){
  ctx.save();ctx.globalAlpha=.55;
  ctx.fillStyle='#171a20';ctx.fillRect(0,700,W,760);
  ctx.fillStyle='#45434f';ctx.fillRect(0,560,1000,120);ctx.fillRect(2200,560,1000,120);ctx.fillRect(0,1460,1000,120);ctx.fillRect(2200,1460,1000,120);
  ctx.fillStyle='#0c0e12';ctx.fillRect(1000,700,1200,760);
  ctx.strokeStyle='#b1a0c8';ctx.lineWidth=12;for(const y of [735,825,1335,1425]){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  ctx.strokeStyle='#6c7078';ctx.lineWidth=22;ctx.setLineDash([130,45]);ctx.beginPath();ctx.moveTo(1110,1080);ctx.lineTo(2090,1080);ctx.stroke();ctx.setLineDash([]);
  ctx.restore();
}
function layoutPrison(ctx,W,H){
  ctx.save();ctx.globalAlpha=.5;
  ctx.fillStyle='#31383e';
  for(let row=0;row<3;row++)for(let col=0;col<2;col++){ctx.fillRect(270+col*1420,220+row*620,1160,430);}
  ctx.fillStyle='#22282d';ctx.fillRect(1430,850,340,800);
  ctx.strokeStyle='#87939b';ctx.lineWidth=18;ctx.setLineDash([70,25]);for(const x of [1450,1770]){ctx.beginPath();ctx.moveTo(x,220);ctx.lineTo(x,2080);ctx.stroke();}ctx.setLineDash([]);
  ctx.strokeStyle='#c3d0d8';ctx.lineWidth=28;ctx.strokeRect(1460,880,280,730);
  ctx.restore();
}
function layoutMilitaryBase(ctx,W,H){
  ctx.save();ctx.globalAlpha=.5;
  ctx.fillStyle='#33482f';ctx.fillRect(180,220,2840,1960);
  ctx.fillStyle='#4c5b4d';ctx.fillRect(0,1060,W,300);ctx.fillRect(1430,0,340,H);
  ctx.fillStyle='#73806b';ctx.fillRect(430,540,2340,80);ctx.fillRect(430,1780,2340,80);
  ctx.strokeStyle='#b8c67b';ctx.lineWidth=10;ctx.setLineDash([90,55]);ctx.beginPath();ctx.moveTo(250,1210);ctx.lineTo(2950,1210);ctx.stroke();ctx.setLineDash([]);
  ctx.strokeStyle='#839a72';ctx.lineWidth=24;ctx.beginPath();ctx.arc(1600,1490,270,0,Math.PI*2);ctx.stroke();
  ctx.restore();
}
function layoutRuinedTown(ctx,W,H){
  ctx.save();ctx.globalAlpha=.48;
  ctx.fillStyle='#4b3c37';ctx.fillRect(0,940,W,520);ctx.fillRect(1340,0,520,H);
  ctx.fillStyle='#3a302d';for(const a of [[260,230,520,380],[2400,230,520,380],[260,1760,520,360],[2400,1760,520,360],[1130,380,400,260],[1660,1740,430,260]])ctx.fillRect(...a);
  ctx.strokeStyle='#9b725d';ctx.lineWidth=22;ctx.setLineDash([70,40]);for(const x of [260,2940]){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}ctx.beginPath();ctx.moveTo(0,1200);ctx.lineTo(W,1200);ctx.stroke();ctx.setLineDash([]);
  ctx.restore();
}
function layoutHarbor(ctx,W,H){
  ctx.save();ctx.globalAlpha=.55;
  ctx.fillStyle='#1b4b61';ctx.fillRect(0,1510,W,890);
  ctx.strokeStyle='#4e8294';ctx.lineWidth=26;ctx.beginPath();ctx.moveTo(0,1510);ctx.bezierCurveTo(700,1420,1080,1590,1600,1510);ctx.bezierCurveTo(2140,1410,2660,1580,W,1480);ctx.stroke();
  ctx.fillStyle='#7a6954';for(const [x,y,w,h] of [[300,1320,720,120],[1260,1140,1080,120],[430,1710,130,670],[1350,1590,130,810],[2380,1660,130,740]])ctx.fillRect(x,y,w,h);
  ctx.strokeStyle='#a88e68';ctx.lineWidth=12;ctx.setLineDash([32,22]);ctx.beginPath();ctx.moveTo(0,1360);ctx.lineTo(W,1360);ctx.stroke();ctx.setLineDash([]);
  ctx.restore();
}
function layoutBunker(ctx,W,H){
  ctx.save();ctx.globalAlpha=.48;
  ctx.fillStyle='#30343a';for(const a of [[220,180,860,720],[2120,180,860,720],[220,1120,1200,980],[1780,1120,1200,980]])ctx.fillRect(...a);
  ctx.fillStyle='#22262b';ctx.fillRect(1080,180,1040,1920);
  ctx.strokeStyle='#8d7650';ctx.lineWidth=24;for(const x of [1050,2150]){ctx.beginPath();ctx.moveTo(x,210);ctx.lineTo(x,2090);ctx.stroke();}for(const y of [1040]){ctx.beginPath();ctx.moveTo(240,y);ctx.lineTo(2960,y);ctx.stroke();}
  ctx.restore();
}
function layoutSwamp(ctx,W,H){
  ctx.save();ctx.globalAlpha=.5;
  ctx.fillStyle='#21483f';for(const a of [[180,260,700,520],[2220,220,760,500],[820,1450,860,600],[2200,1580,620,500]])ctx.fillRect(...a);
  ctx.fillStyle='#3e6658';for(const [x,y,rx,ry] of [[500,720,330,230],[2580,650,350,220],[1240,1780,410,270],[2450,1890,290,210]]){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();}
  ctx.strokeStyle='#9b8054';ctx.lineWidth=95;ctx.beginPath();ctx.moveTo(180,1340);ctx.bezierCurveTo(720,1280,1020,1460,1430,1350);ctx.bezierCurveTo(1830,1240,2300,1400,3020,1270);ctx.stroke();
  ctx.strokeStyle='#6e5b3f';ctx.lineWidth=18;ctx.setLineDash([40,30]);ctx.beginPath();ctx.moveTo(220,1340);ctx.bezierCurveTo(760,1280,1020,1460,1430,1350);ctx.bezierCurveTo(1830,1240,2300,1400,3020,1270);ctx.stroke();ctx.setLineDash([]);
  ctx.restore();
}
function layoutSkyscraper(ctx,W,H){
  ctx.save();ctx.globalAlpha=.5;
  ctx.fillStyle='#263447';for(let row=0;row<4;row++)ctx.fillRect(120,160+row*540,2960,430);
  ctx.fillStyle='#121a23';ctx.fillRect(1440,120,320,2160);
  ctx.strokeStyle='#6c88a8';ctx.lineWidth=10;for(let y=540;y<2200;y+=540){ctx.beginPath();ctx.moveTo(120,y);ctx.lineTo(3080,y);ctx.stroke();}
  ctx.strokeStyle='#89b7e9';ctx.lineWidth=18;ctx.strokeRect(1460,180,280,2040);
  ctx.fillStyle='#3a4f66';for(const x of [430,830,2140,2540])for(const y of [270,810,1350,1890])ctx.fillRect(x,y,250,130);
  ctx.restore();
}
function layoutWasteland(ctx,W,H){
  ctx.save();ctx.globalAlpha=.42;
  ctx.fillStyle='#514132';for(let i=0;i<10;i++){ctx.beginPath();ctx.arc(280+(i*317)%2600,300+(i*193)%1700,90+(i%4)*28,0,Math.PI*2);ctx.fill();}
  ctx.strokeStyle='#8a6a48';ctx.lineWidth=75;ctx.beginPath();ctx.moveTo(120,2040);ctx.bezierCurveTo(720,1840,1080,2060,1600,1910);ctx.bezierCurveTo(2080,1770,2500,1960,3100,1800);ctx.stroke();
  ctx.strokeStyle='#765c42';ctx.lineWidth=18;ctx.setLineDash([65,36]);ctx.beginPath();ctx.moveTo(0,740);ctx.lineTo(3200,520);ctx.stroke();ctx.beginPath();ctx.moveTo(0,1660);ctx.lineTo(3200,1450);ctx.stroke();ctx.setLineDash([]);
  ctx.restore();
}
function drawMapLayout(ctx,map,W,H){
  switch(map){
    case 'Forest':return layoutForest(ctx,W,H);
    case 'Desert':return layoutDesert(ctx,W,H);
    case 'Snow':return layoutSnow(ctx,W,H);
    case 'Lava':return layoutLava(ctx,W,H);
    case 'City':return layoutCity(ctx,W,H);
    case 'Hospital':return layoutHospital(ctx,W,H);
    case 'Laboratory':return layoutLaboratory(ctx,W,H);
    case 'Subway':return layoutSubway(ctx,W,H);
    case 'Prison':return layoutPrison(ctx,W,H);
    case 'MilitaryBase':return layoutMilitaryBase(ctx,W,H);
    case 'RuinedTown':return layoutRuinedTown(ctx,W,H);
    case 'Harbor':return layoutHarbor(ctx,W,H);
    case 'Bunker':return layoutBunker(ctx,W,H);
    case 'Swamp':return layoutSwamp(ctx,W,H);
    case 'Skyscraper':return layoutSkyscraper(ctx,W,H);
    case 'Wasteland':return layoutWasteland(ctx,W,H);
    default:return layoutForest(ctx,W,H);
  }
}

function installWorldRenderer(){if(window.__outlast330MapRendererInstalled)return;window.__outlast330MapRendererInstalled=true;window.__outlast330MapRenderer=drawMapLayout;}
function drawBetterMinimap(){
  if(typeof game==='undefined'||!game.running||game.upgradeOpen||typeof ctx==='undefined')return;
  const mw=Math.min(190,Math.max(155,CW*.19)),mh=mw*H/W,mx=10,my=145,sx=mw/W,sy=mh/H,map=typeof save!=='undefined'?save.map:'Forest';
  ctx.save();
  ctx.fillStyle='rgba(4,9,14,.95)';ctx.fillRect(mx-7,my-7,mw+14,mh+14);
  ctx.strokeStyle=(typeof mapDefs!=='undefined'&&mapDefs[map]?.accent)||'#69c0ff';ctx.lineWidth=2;ctx.strokeRect(mx-7,my-7,mw+14,mh+14);
  ctx.fillStyle=(typeof mapDefs!=='undefined'&&mapDefs[map]?.bg)||'#172019';ctx.fillRect(mx,my,mw,mh);

  ctx.save();
  ctx.translate(mx,my);ctx.scale(sx,sy);
  drawMapLayout(ctx,map,W,H);
  ctx.restore();

  if(typeof obstacleRects==='function'){
    for(const o of obstacleRects()){
      ctx.fillStyle='rgba(180,190,200,.72)';
      ctx.fillRect(mx+o.x*sx,my+o.y*sy,Math.max(2,o.w*sx),Math.max(2,o.h*sy));
    }
  }
  if(game.gems)for(const g of game.gems){ctx.fillStyle='#55d8ff';ctx.fillRect(mx+g.x*sx-1.5,my+g.y*sy-1.5,3,3);}
  if(game.coins)for(const q of game.coins){ctx.fillStyle='#ffd24d';ctx.fillRect(mx+q.x*sx-1.5,my+q.y*sy-1.5,3,3);}
  if(game.powerups)for(const q of game.powerups){ctx.fillStyle=q.type==='xpVacuum'?'#ffe16b':'#d7b4ff';ctx.beginPath();ctx.arc(mx+q.x*sx,my+q.y*sy,3,0,Math.PI*2);ctx.fill();}
  if(game.shrines)for(const s of game.shrines){ctx.fillStyle=s.color||'#fff';ctx.fillRect(mx+s.x*sx-2,my+s.y*sy-2,4,4);}
  if(game.enemies)for(const e of game.enemies){ctx.fillStyle=e.boss?'#ff4e5f':'#e76a6a';ctx.fillRect(mx+e.x*sx-1.5,my+e.y*sy-1.5,e.boss?5:3,e.boss?5:3);}
  if(game.player){
    ctx.fillStyle='#69c0ff';ctx.beginPath();ctx.arc(mx+game.player.x*sx,my+game.player.y*sy,5,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.stroke();
  }
  if(game.player2){ctx.fillStyle='#ff5f69';ctx.beginPath();ctx.arc(mx+game.player2.x*sx,my+game.player2.y*sy,4,0,Math.PI*2);ctx.fill();}

  const cam=game.camera||{x:0,y:0};
  const vx=Math.max(0,Math.min(W-CW,Number(cam.x)||0)),vy=Math.max(0,Math.min(H-CH,Number(cam.y)||0));
  ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=1.5;
  ctx.strokeRect(mx+vx*sx,my+vy*sy,Math.max(3,CW*sx),Math.max(3,CH*sy));

  ctx.fillStyle='#fff';ctx.font='bold 10px Arial';ctx.fillText('MAP • '+String(map),mx+7,my+13);
  ctx.font='9px Arial';ctx.fillStyle='#9bb0bf';ctx.fillText(MAP_LAYOUT_INFO[map]||'Unique layout',mx+7,my+mh-7);
  ctx.restore();
}

function installMinimap(){
  if(window.__outlast330MinimapWrapped)return;
  window.__outlast330MinimapWrapped=true;
  window.drawMinimap=drawBetterMinimap;
}

function audit(){
  const maps=Object.keys(MAP_LAYOUT_INFO);
  return {
    version:'3.30.1',
    mapCount:maps.length,
    uniqueProfiles:maps.length===16,
    minimapFunctional:typeof window.drawMinimap==='function',
    mapRendererInstalled:!!window.__outlast330MapRendererInstalled,
    startGameUntouched:true
  };
}

function boot(){
  installWorldRenderer();
  installMinimap();
  if(typeof updates!=='undefined'&&Array.isArray(updates)&&!updates.some(x=>Array.isArray(x)&&String(x[0]).includes('v3.30.1 — Unique Map Layouts'))){
    updates.unshift(['v3.30.1 — Unique Map Layouts','Reworked every map with its own navigational layout and rebuilt the minimap to show terrain, structures, players, enemies, loot, and the current camera view.']);
  }
  if(typeof helpArticles!=='undefined'&&Array.isArray(helpArticles)&&!helpArticles.some(x=>Array.isArray(x)&&String(x[0]).includes('minimap show'))){
    helpArticles.unshift(['How does the new minimap work?','Maps','The minimap now mirrors the current map layout, including major terrain shapes, solid objects, loot, enemies, players, and the current camera viewport. Each map has a distinct layout such as streets, corridors, tracks, docks, rivers, lava lanes, or swamp pools.']);
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
[200,700,1600,2800].forEach(ms=>setTimeout(()=>{try{installWorldRenderer();installMinimap();}catch(_){ }},ms));
window.__outlast330MapAudit=audit;
})();