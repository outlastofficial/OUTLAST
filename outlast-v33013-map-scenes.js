/* OUTLAST v3.30.13 — Unique Map Scene Renderer
   Visual-only map rebuild. Start Run, login, movement, collision data, and map selection are preserved.
*/
(function(){
'use strict';

const VERSION='3.30.13';

const THEMES={
  Forest:{
    bg:'#0b1710',grid:'#1b3021',accent:'#63ba78',floor:'#102117',
    desc:'Deep forest floor with winding clearings and dense woodland cover.'
  },
  Desert:{
    bg:'#24170b',grid:'#4a3219',accent:'#d5a24a',floor:'#2d1d0d',
    desc:'Night desert ruins with long dune shadows and sandstone lanes.'
  },
  Snow:{
    bg:'#0b1520',grid:'#263c4d',accent:'#8bd9ff',floor:'#112331',
    desc:'Frozen midnight terrain with ice shelves, cracks, and blue snow fields.'
  },
  Lava:{
    bg:'#1c0a08',grid:'#421b16',accent:'#ff6546',floor:'#24100d',
    desc:'Volcanic rock with glowing channels and fractured obsidian ground.'
  },
  City:{
    bg:'#090d13',grid:'#232c38',accent:'#6f97c3',floor:'#0e131b',
    desc:'Blacktop city blocks with lanes, intersections, barriers, and wrecked streets.'
  },
  Hospital:{
    bg:'#101821',grid:'#293a47',accent:'#6fd0ea',floor:'#131d26',
    desc:'Dark emergency ward with tiled corridors, treatment zones, and utility lanes.'
  },
  Laboratory:{
    bg:'#08161a',grid:'#1b3942',accent:'#60e4ff',floor:'#0c2025',
    desc:'Experimental lab floor with power circuits, containment zones, and test bays.'
  },
  Subway:{
    bg:'#0b0a11',grid:'#292538',accent:'#b388ff',floor:'#11101a',
    desc:'Underground rail network with tracks, platforms, pillars, and tunnel lines.'
  },
  Prison:{
    bg:'#0e1216',grid:'#2a3138',accent:'#aebdc9',floor:'#151a1f',
    desc:'Lockdown prison yard with cell blocks, fenced lanes, and watch routes.'
  },
  MilitaryBase:{
    bg:'#0d160e',grid:'#25371f',accent:'#9fbe6b',floor:'#111c12',
    desc:'Tactical base with a central runway, staging pads, and defense lanes.'
  },
  RuinedTown:{
    bg:'#160f0d',grid:'#362821',accent:'#d19770',floor:'#1c1411',
    desc:'Collapsed town streets with old foundations, rubble fields, and broken walls.'
  },
  Harbor:{
    bg:'#07151a',grid:'#17353f',accent:'#5fd3e6',floor:'#0a2027',
    desc:'Night harbor with dark water, docks, tide lines, and industrial staging areas.'
  },
  Bunker:{
    bg:'#0b0e10',grid:'#262c30',accent:'#ceb067',floor:'#111518',
    desc:'Heavy underground bunker with segmented rooms, bulkheads, and utility halls.'
  },
  Swamp:{
    bg:'#09150e',grid:'#1a3422',accent:'#78b968',floor:'#0d1c12',
    desc:'Murky swamp with stagnant pools, reed beds, muddy islands, and dead timber.'
  },
  Skyscraper:{
    bg:'#08101a',grid:'#1d3043',accent:'#82b3ff',floor:'#0c1621',
    desc:'Rooftop district with service zones, a helipad, and high-rise machinery.'
  },
  Wasteland:{
    bg:'#170e09',grid:'#3d291f',accent:'#dd9550',floor:'#1d110b',
    desc:'Broken endgame wasteland with a dry riverbed, cracked earth, and salvage fields.'
  },
  Seizure:{
    bg:'#0d0715',grid:'#2b2040',accent:'#d08cff',floor:'#140b1e',
    desc:'Static geometric sensory-overload arena with bold shapes and no strobe effects.'
  },
  Ribhouse:{
    bg:'#180b07',grid:'#3d1f15',accent:'#e06437',floor:'#21100b',
    desc:'Original BBQ restaurant-style floor with wood planks, serving lanes, and dining zones.'
  }
};

const THEME_NAMES=Object.keys(THEMES);
for(const name of THEME_NAMES){
  if(typeof mapDefs!=='undefined' && mapDefs[name]){
    Object.assign(mapDefs[name],{
      bg:THEMES[name].bg,
      grid:THEMES[name].grid,
      accent:THEMES[name].accent
    });
  }
}

function px(v,scale,offset){return offset+v*scale;}
function rect(x,y,w,h,fill,alpha,stroke,lineWidth,scale,ox,oy){
  ctx.save();
  if(alpha!==undefined)ctx.globalAlpha=alpha;
  if(fill){ctx.fillStyle=fill;ctx.fillRect(px(x,scale,ox),px(y,scale,oy),w*scale,h*scale);}
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=(lineWidth||1)*scale;ctx.strokeRect(px(x,scale,ox),px(y,scale,oy),w*scale,h*scale);}
  ctx.restore();
}
function line(points,stroke,width,alpha,scale,ox,oy){
  ctx.save();
  if(alpha!==undefined)ctx.globalAlpha=alpha;
  ctx.strokeStyle=stroke;ctx.lineWidth=width*scale;ctx.lineJoin='round';ctx.lineCap='round';
  ctx.beginPath();
  points.forEach((p,i)=>{const x=px(p[0],scale,ox),y=px(p[1],scale,oy);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)});
  ctx.stroke();ctx.restore();
}
function circle(x,y,r,fill,alpha,stroke,lineWidth,scale,ox,oy){
  ctx.save();
  if(alpha!==undefined)ctx.globalAlpha=alpha;
  ctx.beginPath();ctx.arc(px(x,scale,ox),px(y,scale,oy),r*scale,0,Math.PI*2);
  if(fill){ctx.fillStyle=fill;ctx.fill();}
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=(lineWidth||1)*scale;ctx.stroke();}
  ctx.restore();
}
function ellipse(x,y,rx,ry,fill,alpha,stroke,lineWidth,scale,ox,oy){
  ctx.save();
  if(alpha!==undefined)ctx.globalAlpha=alpha;
  ctx.beginPath();ctx.ellipse(px(x,scale,ox),px(y,scale,oy),rx*scale,ry*scale,0,0,Math.PI*2);
  if(fill){ctx.fillStyle=fill;ctx.fill();}
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=(lineWidth||1)*scale;ctx.stroke();}
  ctx.restore();
}
function poly(points,fill,alpha,stroke,lineWidth,scale,ox,oy){
  ctx.save();
  if(alpha!==undefined)ctx.globalAlpha=alpha;
  ctx.beginPath();
  points.forEach((p,i)=>{const x=px(p[0],scale,ox),y=px(p[1],scale,oy);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)});
  ctx.closePath();
  if(fill){ctx.fillStyle=fill;ctx.fill();}
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=(lineWidth||1)*scale;ctx.stroke();}
  ctx.restore();
}

function sceneForest(s,ox,oy,t){
  rect(0,0,W,H,t.floor,.42,null,0,s,ox,oy);
  for(let i=0;i<10;i++){
    circle(260+i*300,360+(i%2)*610,250,'#1a3a24',.16,null,0,s,ox,oy);
  }
  line([[0,980],[430,760],[820,830],[1180,650],[1530,790],[1920,590],[2330,760],[2700,610],[3200,760]],'#5ea36d',22,.15,s,ox,oy);
  line([[0,1000],[430,780],[820,850],[1180,670],[1530,810],[1920,610],[2330,780],[2700,630],[3200,780]],'#07100b',9,.42,s,ox,oy);
  for(let y=260;y<H;y+=520){
    for(let x=160+(y%340);x<W;x+=430)circle(x,y,40,'#6a9f5c',.08,'#6a9f5c',1,s,ox,oy);
  }
}
function sceneDesert(s,ox,oy,t){
  rect(0,0,W,H,t.floor,.35,null,0,s,ox,oy);
  for(let y=180;y<H;y+=310){
    line([[-120,y],[500,y-90],[1120,y-30],[1680,y-120],[2280,y-20],[3380,y-90]],'#e0b25d',15,.12,s,ox,oy);
    line([[-120,y+18],[500,y-72],[1120,y-12],[1680,y-102],[2280,y-2],[3380,y-72]],'#5b3717',7,.34,s,ox,oy);
  }
  circle(2470,480,260,'#b77b2d',.08,'#d5a24a',3,s,ox,oy);
  for(let i=0;i<7;i++)line([[180+i*430,1360],[300+i*430,1180],[420+i*430,1360]],'#8f6328',3,.3,s,ox,oy);
}
function sceneSnow(s,ox,oy,t){
  rect(0,0,W,H,t.floor,.48,null,0,s,ox,oy);
  ellipse(640,520,430,240,'#35647b',.25,'#7fd8ff',4,s,ox,oy);
  ellipse(2440,890,520,300,'#2c596f',.20,'#7fd8ff',4,s,ox,oy);
  ellipse(1550,1800,430,210,'#264c60',.18,'#73c9ef',3,s,ox,oy);
  for(const p of [
    [[80,180],[540,280],[980,220],[1320,340]],
    [[1730,280],[2160,190],[2690,300],[3140,220]],
    [[120,1580],[640,1480],[1020,1590]],
    [[1970,1500],[2440,1610],[3080,1510]]
  ])line(p,'#a8e7ff',7,.18,s,ox,oy);
  line([[380,920],[720,1050],[980,1010],[1290,1120],[1590,1020]],'#9ee9ff',5,.34,s,ox,oy);
}
function sceneLava(s,ox,oy,t){
  rect(0,0,W,H,t.floor,.35,null,0,s,ox,oy);
  poly([[0,430],[700,260],[1250,420],[1840,300],[2460,500],[3200,330],[3200,610],[2470,770],[1850,580],[1230,690],[620,530],[0,680]],'#7f281b',.32,'#ff704d',3,s,ox,oy);
  poly([[0,1780],[560,1650],[1100,1830],[1540,1680],[2100,1810],[2640,1650],[3200,1780],[3200,1980],[2580,1880],[2010,2010],[1490,1910],[1040,2020],[510,1900],[0,1980]],'#7b241a',.28,'#ff704d',3,s,ox,oy);
  for(let x=180;x<W;x+=420){
    line([[x,820],[x+90,900],[x+30,1030],[x+120,1150],[x+50,1280]],'#ff6a43',7,.34,s,ox,oy);
  }
  for(let y=250;y<H;y+=360){
    line([[200,y],[520,y+80],[840,y-20]],'#8d3120',5,.26,s,ox,oy);
  }
}
function sceneCity(s,ox,oy,t){
  rect(0,0,W,H,t.floor,.55,null,0,s,ox,oy);
  const roads=[430,1040,1640,2250,2860];
  for(const x of roads){
    rect(x-85,0,170,H,'#080b0f',.64,null,0,s,ox,oy);
    for(let y=80;y<H;y+=180)rect(x-5,y,10,72,'#c8b679',.40,null,0,s,ox,oy);
  }
  const hroads=[360,920,1500,2100,2680];
  for(const y of hroads){
    rect(0,y-78,W,156,'#080b0f',.62,null,0,s,ox,oy);
    for(let x=80;x<W;x+=200)rect(x,y-5,80,10,'#c8b679',.35,null,0,s,ox,oy);
  }
  for(const x of [145,745,1340,1940,2550,3160])for(const y of [110,690,1280,1880,2480])rect(x,y,90,55,'#1d2530',.65,'#4a6178',1,s,ox,oy);
}
function sceneHospital(s,ox,oy,t){
  rect(0,0,W,H,t.floor,.52,null,0,s,ox,oy);
  for(let x=0;x<=W;x+=160)line([[x,0],[x,H]],'#40606e',1,.20,s,ox,oy);
  for(let y=0;y<=H;y+=120)line([[0,y],[W,y]],'#40606e',1,.20,s,ox,oy);
  rect(80,1020,3040,220,'#0a1015',.55,'#67c9e0',2,s,ox,oy);
  rect(1420,80,360,2240,'#0a1015',.35,'#67c9e0',2,s,ox,oy);
  for(let x=220;x<3000;x+=420)rect(x,1027,180,5,'#6fd0ea',.45,null,0,s,ox,oy);
  for(let y=140;y<2200;y+=330)rect(1590,y,20,120,'#6fd0ea',.38,null,0,s,ox,oy);
}
function sceneLab(s,ox,oy,t){
  rect(0,0,W,H,t.floor,.52,null,0,s,ox,oy);
  for(let x=180;x<W;x+=420)for(let y=180;y<H;y+=350){
    rect(x,y,250,150,'#102a31',.42,'#3d8998',2,s,ox,oy);
    line([[x+20,y+120],[x+90,y+120],[x+110,y+80],[x+215,y+80]],'#5fe7ff',2,.30,s,ox,oy);
  }
  for(const x of [620,1290,1960,2630])circle(x,1780,90,'#0b2026',.60,'#5ce3ff',3,s,ox,oy);
  line([[0,700],[650,700],[650,1500],[1290,1500],[1290,700],[1950,700],[1950,1500],[2630,1500],[2630,700],[3200,700]],'#5ce3ff',4,.28,s,ox,oy);
}
function sceneSubway(s,ox,oy,t){
  rect(0,0,W,H,t.floor,.60,null,0,s,ox,oy);
  for(const y of [420,860,1300,1740,2180]){
    line([[0,y],[W,y]],'#8a8b95',10,.16,s,ox,oy);
    line([[0,y-28],[W,y-28]],'#c0a7e4',3,.26,s,ox,oy);
    line([[0,y+28],[W,y+28]],'#c0a7e4',3,.26,s,ox,oy);
    for(let x=60;x<W;x+=120)rect(x,y-48,6,96,'#7f7f88',.34,null,0,s,ox,oy);
  }
  for(const x of [470,1090,1710,2330,2950])rect(x-36,0,72,H,'#12121a',.30,'#a77fe3',2,s,ox,oy);
}
function scenePrison(s,ox,oy,t){
  rect(0,0,W,H,t.floor,.50,null,0,s,ox,oy);
  rect(90,120,3020,470,'#101419',.60,'#7b8792',2,s,ox,oy);
  rect(90,1810,3020,470,'#101419',.60,'#7b8792',2,s,ox,oy);
  for(let x=140;x<3060;x+=180){
    line([[x,120],[x,590]],'#8c9aa5',2,.24,s,ox,oy);
    line([[x,1810],[x,2280]],'#8c9aa5',2,.24,s,ox,oy);
  }
  rect(1320,580,560,1240,'#1a2025',.44,'#c2d0d8',2,s,ox,oy);
  for(let y=690;y<1740;y+=130)line([[1340,y],[1860,y]],'#8e9ba5',2,.25,s,ox,oy);
  circle(1600,1200,190,'#111820',.42,'#c2d0d8',4,s,ox,oy);
}
function sceneMilitaryBase(s,ox,oy,t){
  rect(0,0,W,H,t.floor,.58,null,0,s,ox,oy);
  rect(1300,80,600,2240,'#0a100b',.50,'#9fbe6b',3,s,ox,oy);
  for(let y=130;y<2200;y+=190)rect(1575,y,50,95,'#9fbe6b',.46,null,0,s,ox,oy);
  circle(1600,1200,250,'#111812',.72,'#9fbe6b',5,s,ox,oy);
  line([[1500,1200],[1700,1200]],'#9fbe6b',4,.55,s,ox,oy);
  line([[1600,1100],[1600,1300]],'#9fbe6b',4,.55,s,ox,oy);
  for(const y of [330,840,1560,2020])rect(180,y,700,100,'#172216',.58,'#607944',2,s,ox,oy);
  for(const y of [420,1120,1860])rect(2220,y,700,100,'#172216',.58,'#607944',2,s,ox,oy);
}
function sceneRuinedTown(s,ox,oy,t){
  rect(0,0,W,H,t.floor,.58,null,0,s,ox,oy);
  const blocks=[[120,120,900,520],[1110,140,840,570],[2170,100,850,560],[260,860,980,720],[1440,900,760,610],[2380,860,620,740]];
  for(const b of blocks)rect(b[0],b[1],b[2],b[3],'#201815',.54,'#966d55',2,s,ox,oy);
  line([[0,760],[800,760],[800,820],[1620,820],[1620,720],[2400,720],[2400,780],[3200,780]],'#c08a67',8,.24,s,ox,oy);
  for(let i=0;i<16;i++){
    const x=80+(i*197)%3000,y=120+(i*311)%2050;
    rect(x,y,70,42,'#8d6550',.18,'#a77a62',1,s,ox,oy);
  }
}
function sceneHarbor(s,ox,oy,t){
  rect(0,0,W,H,t.floor,.48,null,0,s,ox,oy);
  poly([[0,1420],[520,1320],[980,1450],[1460,1360],[1980,1490],[2470,1370],[3200,1450],[3200,2400],[0,2400]],'#07313a',.52,'#57cfe2',3,s,ox,oy);
  for(let y=1500;y<2380;y+=150)line([[0,y],[W,y+35]],'#61d5e6',3,.20,s,ox,oy);
  for(const x of [260,960,1660,2360,3060])rect(x,180,x?120:120,1130,'#172126',.40,'#577f88',2,s,ox,oy);
  for(let y=260;y<1250;y+=210)rect(80,y,1140,12,'#64d6e8',.18,null,0,s,ox,oy);
  line([[40,1350],[700,1350],[700,1240],[1380,1240],[1380,1360],[2140,1360],[2140,1240],[3160,1240]],'#6ed9e8',5,.30,s,ox,oy);
}
function sceneBunker(s,ox,oy,t){
  rect(0,0,W,H,t.floor,.58,null,0,s,ox,oy);
  for(let x=260;x<3200;x+=620)for(let y=220;y<2200;y+=510){
    rect(x,y,430,300,'#0f1418',.46,'#616a72',2,s,ox,oy);
    circle(x+215,y+150,80,'#0b1014',.42,'#ceb067',2,s,ox,oy);
  }
  line([[0,900],[500,900],[500,1530],[1100,1530],[1100,900],[1700,900],[1700,1530],[2300,1530],[2300,900],[3200,900]],'#ceb067',5,.22,s,ox,oy);
}
function sceneSwamp(s,ox,oy,t){
  rect(0,0,W,H,t.floor,.48,null,0,s,ox,oy);
  const pools=[
    [480,480,320,190],[1380,420,430,220],[2480,520,390,210],
    [760,1180,470,250],[1840,1230,350,210],[2860,1330,300,180],
    [430,1900,380,220],[1500,1890,500,250],[2540,1980,430,220]
  ];
  for(const p of pools)ellipse(p[0],p[1],p[2],p[3],'#12362a',.72,'#5d9669',3,s,ox,oy);
  for(let x=140;x<W;x+=310){
    for(let y=220+(x%240);y<H;y+=430){
      line([[x,y],[x+30,y-70],[x+55,y]],'#6b9f58',3,.26,s,ox,oy);
    }
  }
  line([[0,1080],[450,980],[900,1110],[1340,1010],[1780,1120],[2240,1010],[2700,1120],[3200,1050]],'#6aa55e',13,.14,s,ox,oy);
}
function sceneSkyscraper(s,ox,oy,t){
  rect(0,0,W,H,t.floor,.62,null,0,s,ox,oy);
  for(let x=120;x<W;x+=420)rect(x,90,240,H-180,'#0b141e',.38,'#57718c',2,s,ox,oy);
  circle(1600,1200,300,'#0a1118',.75,'#82b3ff',5,s,ox,oy);
  circle(1600,1200,220,null,.98,'#82b3ff',2,s,ox,oy);
  line([[1380,1200],[1820,1200]],'#82b3ff',3,.54,s,ox,oy);
  line([[1600,1020],[1600,1380]],'#82b3ff',3,.54,s,ox,oy);
  for(const x of [450,1110,2090,2740])rect(x,170,110,70,'#17293c',.65,'#82b3ff',1,s,ox,oy);
}
function sceneWasteland(s,ox,oy,t){
  rect(0,0,W,H,t.floor,.48,null,0,s,ox,oy);
  poly([[0,820],[380,700],[820,860],[1220,730],[1600,900],[2020,760],[2400,900],[2800,760],[3200,850],[3200,1130],[2780,1030],[2390,1160],[2010,1010],[1610,1180],[1210,1040],[820,1130],[390,1040],[0,1160]],'#27160d',.68,'#9f5f30',3,s,ox,oy);
  line([[0,920],[380,840],[820,980],[1220,850],[1600,1010],[2020,870],[2400,1010],[2800,870],[3200,960]],'#d68d4d',11,.16,s,ox,oy);
  for(let i=0;i<18;i++){
    const x=(i*257)%3000+80,y=(i*411)%2150+90;
    line([[x,y],[x+55,y+28],[x+15,y+70],[x+95,y+120]],'#9f6637',3,.28,s,ox,oy);
  }
  for(const x of [360,1120,1980,2780])rect(x,1410,260,120,'#2a1d16',.55,'#ad7442',2,s,ox,oy);
}
function sceneSeizure(s,ox,oy,t){
  rect(0,0,W,H,t.floor,.50,null,0,s,ox,oy);
  const diamonds=[
    [420,380,170,'#5c2a82'],[1050,850,230,'#3c2c74'],[1700,380,200,'#6a3d8f'],
    [2420,840,260,'#482b78'],[770,1690,240,'#6f3c8b'],[1850,1760,300,'#39296e'],
    [2780,1760,230,'#603686']
  ];
  for(const [x,y,r,c] of diamonds){
    poly([[x,y-r],[x+r,y],[x,y+r],[x-r,y]],c,.24,'#d08cff',3,s,ox,oy);
  }
  for(let x=120;x<W;x+=380)line([[x,0],[x+260,H]],'#d08cff',4,.10,s,ox,oy);
  for(let y=180;y<H;y+=430)line([[0,y],[W,y+180]],'#9e74dd',3,.11,s,ox,oy);
}
function sceneRibhouse(s,ox,oy,t){
  rect(0,0,W,H,t.floor,.64,null,0,s,ox,oy);
  for(let y=0;y<H;y+=90)rect(0,y,W,70,(Math.floor(y/90)%2===0?'#2a130c':'#34170e'),.58,null,0,s,ox,oy);
  for(let x=120;x<W;x+=420)rect(x,90,24,H-180,'#87472e',.26,null,0,s,ox,oy);
  const zones=[[130,160,620,360],[1280,150,620,360],[2390,150,620,360],[300,900,680,430],[1260,900,680,430],[2220,900,680,430],[520,1700,650,360],[1540,1700,650,360]];
  for(const z of zones)rect(z[0],z[1],z[2],z[3],'#5a2b1b',.20,'#d56a3c',2,s,ox,oy);
  line([[0,720],[3200,720]],'#d56a3c',5,.24,s,ox,oy);
  line([[0,1570],[3200,1570]],'#d56a3c',5,.24,s,ox,oy);
  for(const x of [760,1600,2440])circle(x,700,70,'#2b150d',.70,'#e06437',3,s,ox,oy);
}

function drawUniqueMapDetails(scale,ox,oy){
  const map=String((typeof save!=='undefined'&&save&&save.map)||'Forest');
  const t=THEMES[map]||THEMES.Forest;
  ctx.save();
  ctx.beginPath();
  ctx.rect(ox,oy,W*scale,H*scale);
  ctx.clip();
  switch(map){
    case 'Forest':sceneForest(scale,ox,oy,t);break;
    case 'Desert':sceneDesert(scale,ox,oy,t);break;
    case 'Snow':sceneSnow(scale,ox,oy,t);break;
    case 'Lava':sceneLava(scale,ox,oy,t);break;
    case 'City':sceneCity(scale,ox,oy,t);break;
    case 'Hospital':sceneHospital(scale,ox,oy,t);break;
    case 'Laboratory':sceneLab(scale,ox,oy,t);break;
    case 'Subway':sceneSubway(scale,ox,oy,t);break;
    case 'Prison':scenePrison(scale,ox,oy,t);break;
    case 'MilitaryBase':sceneMilitaryBase(scale,ox,oy,t);break;
    case 'RuinedTown':sceneRuinedTown(scale,ox,oy,t);break;
    case 'Harbor':sceneHarbor(scale,ox,oy,t);break;
    case 'Bunker':sceneBunker(scale,ox,oy,t);break;
    case 'Swamp':sceneSwamp(scale,ox,oy,t);break;
    case 'Skyscraper':sceneSkyscraper(scale,ox,oy,t);break;
    case 'Wasteland':sceneWasteland(scale,ox,oy,t);break;
    case 'Seizure':sceneSeizure(scale,ox,oy,t);break;
    case 'Ribhouse':sceneRibhouse(scale,ox,oy,t);break;
    default:sceneForest(scale,ox,oy,THEMES.Forest);
  }
  ctx.restore();
}

window.OUTLAST_MAP_SCENE_VERSION=VERSION;
window.OUTLAST_MAP_SCENE_THEMES=THEMES;
window.OUTLAST_MAP_SCENE_NAMES=THEME_NAMES.slice();

try{
  drawMapDetails=drawUniqueMapDetails;
  if(typeof window!=='undefined')window.drawMapDetails=drawUniqueMapDetails;
}catch(_){}

try{
  document.title='OUTLAST v'+VERSION;
  for(const sel of ['meta[name="outlast-build"]','meta[name="build-version"]']){
    const el=document.querySelector(sel);if(el)el.content=VERSION;
  }
  document.querySelectorAll('[data-outlast-version]').forEach(el=>el.textContent='v'+VERSION);
  const chips=document.querySelectorAll('.menu-chip');
  chips.forEach(el=>{
    const txt=String(el.textContent||'');
    if(/OUTLAST/i.test(txt)&&/v\d+\.\d+\.\d+/i.test(txt))el.textContent=txt.replace(/v\d+\.\d+\.\d+/ig,'v'+VERSION);
  });
}catch(_){}

try{
  const howToEntry=['How are the maps different in v3.30.13?','Maps',
    'Every map now has its own dark terrain scene, lighting palette, ground pattern, and landmark atmosphere. Forest, Desert, Snow, Lava, City, Hospital, Laboratory, Subway, Prison, Military Base, Ruined Town, Harbor, Bunker, Swamp, Skyscraper, Wasteland, Seizure, and Ribhouse all use different visual treatment. No map uses a plain white playfield.'];
  if(Array.isArray(helpArticles) && !helpArticles.some(a=>a&&a[0]===howToEntry[0]))helpArticles.unshift(howToEntry);
}catch(_){}

function injectUpdateEntry(){
  try{
    const host=document.getElementById('subContent');
    if(!host)return;
    if(host.dataset.mapSceneUpdate==='1')return;
    const entry=document.createElement('div');
    entry.className='option';
    entry.style.marginBottom='10px';
    entry.innerHTML='<b>v3.30.13 — Unique Map Scenes</b><div class="small">Rebuilt the map visuals so every map has a distinct dark terrain identity instead of a flat bright field. Start Run, login, collisions, and map selection were left unchanged.</div>';
    host.prepend(entry);
    host.dataset.mapSceneUpdate='1';
  }catch(_){}
}

function hook(){
  try{
    const b=document.getElementById('updatesBtn');
    if(b && !b.dataset.mapSceneHooked){
      b.dataset.mapSceneHooked='1';
      b.addEventListener('click',()=>setTimeout(injectUpdateEntry,0),false);
    }
  }catch(_){}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hook,{once:true});else hook();

})();