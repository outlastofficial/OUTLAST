/* OUTLAST v3.29.1 — Map Rebuild
   Purpose: restore Map button reliability and add distinct map scenery.
   Does not modify Start Run or login.
*/
(function(){
'use strict';
if(window.__outlast3291MapRebuild)return;
window.__outlast3291MapRebuild=true;

const MAP_DESCRIPTIONS={
 Forest:'Dense woodland with pines, fallen logs, rocks, cabins and brush.',
 Desert:'Dry canyon terrain with cacti, ruins, rock stacks and scrap.',
 Snow:'Frozen terrain with ice shelves, snow drifts, cabins and frozen debris.',
 Lava:'Volcanic ground with lava vents, basalt columns, bridges and scorched debris.',
 City:'Urban streets with cars, storefronts, barriers, lamp posts and street clutter.',
 Hospital:'Abandoned medical wing with beds, carts, cabinets, curtains and equipment.',
 Laboratory:'Industrial research complex with tanks, consoles, crates, cables and warning lights.',
 Subway:'Underground station with platforms, pillars, benches, signs and maintenance gear.',
 Prison:'Reinforced facility with cells, fences, guard posts, lights and barricades.',
 MilitaryBase:'Fortified base with vehicles, sandbags, crates, towers and equipment.',
 RuinedTown:'Destroyed settlement with broken walls, rubble, carts, signs and fire barrels.',
 Harbor:'Working dock layout with containers, cranes, boats, buoys and dock equipment.',
 Bunker:'Heavy underground complex with blast doors, vents, consoles, pipes and generators.',
 Swamp:'Wetland with dead trees, reeds, mud banks, stumps, pools and driftwood.',
 Skyscraper:'High-rise interior with desks, columns, server racks, elevators and glass walls.',
 Wasteland:'Open badlands with wrecks, boulders, towers, scrap piles and dry vegetation.'
};

const MAP_OBJECTS={
 Forest:[
  ['pine',180,150,52,100],['pine',340,620,58,105],['pine',1240,145,55,110],['pine',1450,620,52,100],
  ['log',235,420,150,34],['log',1110,470,165,34],['bush',520,170,70,44],['bush',980,690,76,48],
  ['cabin',1380,300,130,92],['sign',720,130,42,68],['campfire',540,650,42,38],['stoneRing',890,270,86,52]
 ],
 Desert:[
  ['cactus',190,170,30,78],['cactus',1340,175,34,86],['cactus',510,655,28,74],['cactus',1180,650,32,82],
  ['ruin',280,310,150,70],['ruin',1080,300,180,76],['rockstack',690,180,100,72],['rockstack',1420,520,105,78],
  ['wagon',820,690,150,58],['sign',600,480,44,72],['bones',1010,180,74,28],['well',460,170,64,48]
 ],
 Snow:[
  ['pineSnow',180,150,56,110],['pineSnow',340,610,58,115],['pineSnow',1230,145,54,110],['pineSnow',1450,610,56,112],
  ['iceChunk',520,240,92,70],['iceChunk',980,190,112,78],['snowDrift',250,470,170,48],['snowDrift',1180,480,190,52],
  ['cabin',700,665,140,92],['sled',930,670,110,45],['lamp',430,180,22,82],['frozenCrate',1380,290,110,75]
 ],
 Lava:[
  ['basalt',170,160,72,120],['basalt',1330,160,76,128],['basalt',360,650,82,130],['basalt',1380,610,78,126],
  ['lavaVent',560,180,58,58],['lavaVent',1060,670,60,60],['bridge',700,360,220,48],['scorchPile',280,430,140,64],
  ['obsidian',980,250,110,70],['warningPost',470,300,30,80],['ashPile',1160,400,120,52],['lavaRidge',780,620,180,44]
 ],
 City:[
  ['car',170,190,145,70],['car',1280,185,150,70],['car',430,650,150,70],['car',1260,650,150,70],
  ['lamp',300,120,22,95],['lamp',1120,120,22,95],['hydrant',610,180,24,52],['hydrant',970,670,24,52],
  ['shopfront',720,145,170,72],['busStop',940,310,82,105],['dumpster',250,430,90,68],['barrier',1080,500,180,44]
 ],
 Hospital:[
  ['bed',180,190,150,58],['bed',1280,190,150,58],['bed',500,650,150,58],['bed',1230,650,150,58],
  ['cart',390,310,62,78],['cart',1010,310,62,78],['cabinet',700,160,70,128],['cabinet',860,600,70,128],
  ['wheelchair',260,500,62,52],['screen',1130,450,52,82],['biohazard',740,470,54,54],['gurney',520,320,120,48]
 ],
 Laboratory:[
  ['tank',180,180,82,130],['tank',1280,180,82,130],['tank',420,650,82,130],['tank',1220,650,82,130],
  ['console',690,160,110,66],['console',900,160,110,66],['server',350,330,80,120],['server',1120,330,80,120],
  ['crateLab',570,460,100,70],['crateLab',1000,500,110,72],['cable',640,640,220,18],['warningPost',1380,410,30,80]
 ],
 Subway:[
  ['bench',170,200,180,46],['bench',1260,200,180,46],['bench',460,650,180,46],['bench',1160,650,180,46],
  ['pillar',360,160,54,150],['pillar',980,160,54,150],['turnstile',690,330,90,54],['signSub',820,145,92,44],
  ['ticket',520,430,88,62],['machine',1040,430,88,62],['maintenance',250,490,100,76],['railGear',1320,460,100,60]
 ],
 Prison:[
  ['cell',170,180,160,72],['cell',1270,180,160,72],['cell',460,650,160,72],['cell',1200,650,160,72],
  ['fence',360,140,34,210],['fence',1060,140,34,210],['guardPost',700,300,86,94],['guardPost',900,500,86,94],
  ['bench',520,420,150,44],['light',250,120,24,75],['barrel',1100,300,42,58],['barrier',820,670,170,44]
 ],
 MilitaryBase:[
  ['vehicle',170,180,175,92],['vehicle',1270,180,175,92],['vehicle',430,645,175,92],['vehicle',1190,625,175,92],
  ['sandbag',350,300,170,58],['sandbag',1050,300,170,58],['watchTower',690,130,88,150],['watchTower',900,510,88,150],
  ['crateMil',520,470,105,78],['crateMil',1000,470,105,78],['radio',250,520,58,82],['barrier',800,350,190,44]
 ],
 RuinedTown:[
  ['rubble',170,180,160,92],['rubble',1280,180,160,92],['rubble',430,640,170,96],['rubble',1200,630,170,96],
  ['brokenWall',350,300,190,58],['brokenWall',1080,300,200,58],['cart',680,160,100,60],['cart',900,610,100,60],
  ['sign',250,470,44,72],['barrelFire',1120,470,48,62],['fallenBeam',540,430,170,34],['shopRuins',760,420,150,72]
 ],
 Harbor:[
  ['container',170,180,155,88],['container',1290,180,155,88],['container',420,630,155,88],['container',1190,625,155,88],
  ['crane',620,150,150,105],['crane',950,500,150,105],['boat',280,350,190,74],['boat',1100,350,190,74],
  ['buoy',560,230,28,58],['buoy',1000,230,28,58],['dockGear',720,650,120,60],['ropeCoil',920,300,64,48]
 ],
 Bunker:[
  ['blastDoor',170,180,155,90],['blastDoor',1280,180,155,90],['generator',450,640,150,90],['generator',1190,630,150,90],
  ['vent',350,270,120,38],['vent',1060,270,120,38],['console',690,150,110,70],['console',900,520,110,70],
  ['pipe',560,410,220,28],['pipe',1000,410,220,28],['ammoCrate',250,500,98,72],['bulkhead',800,650,190,46]
 ],
 Swamp:[
  ['deadTree',170,150,58,118],['deadTree',1320,150,58,120],['deadTree',360,635,60,122],['deadTree',1280,610,60,124],
  ['reed',250,300,120,74],['reed',1110,300,125,78],['mudBank',530,640,190,54],['mudBank',980,640,190,54],
  ['stump',720,180,62,54],['stump',900,470,62,54],['driftwood',420,420,170,34],['swampPool',730,300,170,78]
 ],
 Skyscraper:[
  ['desk',170,180,170,72],['desk',1250,180,170,72],['desk',420,650,170,72],['desk',1200,640,170,72],
  ['column',360,130,54,170],['column',1060,130,54,170],['server',690,170,90,130],['server',900,500,90,130],
  ['elevator',520,360,120,82],['elevator',1060,360,120,82],['glassWall',250,500,180,24],['glassWall',1190,500,180,24]
 ],
 Wasteland:[
  ['wreck',170,190,185,78],['wreck',1250,185,190,82],['wreck',410,650,185,78],['wreck',1190,625,190,82],
  ['boulder',350,280,110,92],['boulder',1060,300,120,96],['radioTower',700,130,74,160],['radioTower',930,500,74,160],
  ['scrap',560,470,140,68],['scrap',960,460,150,70],['deadBush',250,530,74,44],['deadBush',1260,500,78,46]
 ]
};

const PALETTE={
 pine:['#315438','#1c3122'],log:['#744e34','#3e291d'],bush:['#47683b','#263d24'],cabin:['#70513d','#38291f'],sign:['#b18a4c','#624a28'],campfire:['#e17c32','#673318'],stoneRing:['#68645c','#38362f'],
 cactus:['#5c8a45','#2e4f23'],ruin:['#746653','#40372e'],rockstack:['#77726a','#3e3a34'],wagon:['#7b5b3f','#443221'],bones:['#c4ba9d','#6d6654'],well:['#6d6255','#39322b'],
 pineSnow:['#486b58','#dae9f1'],iceChunk:['#8fc7dd','#4e7c91'],snowDrift:['#dcebf2','#8ea9b5'],sled:['#8c6e4e','#443528'],lamp:['#8b8f96','#3f4347'],frozenCrate:['#6f8290','#39444c'],
 basalt:['#54565b','#292c31'],lavaVent:['#ef744d','#7c2d20'],bridge:['#6f6256','#39312b'],scorchPile:['#4b4038','#27221f'],obsidian:['#343849','#1b1d26'],warningPost:['#d5b44a','#66541f'],ashPile:['#5b514b','#302b27'],lavaRidge:['#71352f','#3b1e1b'],
 car:['#52677b','#26303a'],hydrant:['#b44e45','#592622'],shopfront:['#6a879c','#334552'],busStop:['#8f8f82','#45443d'],dumpster:['#4e655d','#2a3833'],barrier:['#777f86','#343a3e'],
 bed:['#b8c2c9','#626970'],cart:['#78858c','#394248'],cabinet:['#806747','#433322'],wheelchair:['#7d8da0','#384252'],screen:['#4b8f9d','#284a51'],biohazard:['#b4a04f','#5a4e25'],gurney:['#a6adb5','#575c62'],
 tank:['#47797c','#203e41'],console:['#526f78','#29383d'],server:['#4e5964','#272d34'],crateLab:['#7b674f','#433a2c'],cable:['#4a5360','#252b31'],
 bench:['#89929b','#484e54'],pillar:['#6b7177','#34383d'],turnstile:['#6d8795','#35444c'],signSub:['#6f8ec1','#334767'],ticket:['#555d66','#2a3035'],machine:['#627a84','#33454b'],maintenance:['#616972','#30343a'],railGear:['#4b545d','#252a2e'],
 cell:['#70777d','#35393d'],fence:['#666b70','#303438'],guardPost:['#776e61','#39342e'],light:['#c1c7c5','#505552'],barrel:['#75513d','#3d2b21'],radio:['#586876','#2c3640'],
 rubble:['#6f6860','#39342e'],brokenWall:['#77716a','#3c3834'],barrelFire:['#a6613f','#4d2e21'],fallenBeam:['#624a38','#36281e'],shopRuins:['#665a50','#342e2a'],
 container:['#4e7782','#29424a'],crane:['#686d72','#34383b'],boat:['#5a707c','#2d3a41'],buoy:['#d56a56','#673027'],dockGear:['#76664e','#3f362a'],ropeCoil:['#957a51','#4c3d28'],
 blastDoor:['#5e6469','#2e3235'],generator:['#575d62','#2a2e31'],vent:['#72767a','#3a3d40'],pipe:['#60676c','#303538'],ammoCrate:['#6f633f','#3b3421'],bulkhead:['#595f64','#2b2f33'],
 deadTree:['#51493f','#2b2722'],reed:['#607d49','#314225'],mudBank:['#51422c','#2d2418'],stump:['#68523c','#38291f'],driftwood:['#6f523a','#3a291c'],swampPool:['#3f655c','#223b36'],
 desk:['#715b4c','#3d3028'],column:['#68727a','#333a3f'],elevator:['#5f737e','#303a40'],glassWall:['#63869b','#314752'],
 wreck:['#5f625f','#303230'],boulder:['#6d685f','#393630'],radioTower:['#5c6062','#2d3031'],scrap:['#6c6258','#38312b'],deadBush:['#66533e','#342b20']
};

function esc(v){return String(v??'').replace(/[&<>"]/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));}

function installDescriptions(){
  if(typeof mapDefs==='undefined')return;
  Object.entries(MAP_DESCRIPTIONS).forEach(([name,desc])=>{
    if(mapDefs[name])mapDefs[name].desc=desc;
  });
  if(typeof mapObstacles!=='undefined' && Array.isArray(mapObstacles.Wasteland)===false){
    mapObstacles.Wasteland=[
      ['Wreck',410,235,165,70],['Boulder',760,500,130,90],['Wreck',1170,285,165,70],
      ['Scrap',590,735,160,58],['Boulder',1320,690,150,90]
    ];
  }
}

function drawProp(ctx,type,x,y,w,h){
  const p=PALETTE[type]||['#666','#333'];ctx.save();
  ctx.fillStyle=p[0];ctx.strokeStyle=p[1];ctx.lineWidth=3;
  switch(type){
    case 'pine': case 'pineSnow': case 'deadTree':
      ctx.fillRect(x+w*.44,y+h*.50,w*.12,h*.48);
      ctx.beginPath();ctx.moveTo(x+w*.5,y);ctx.lineTo(x+w*.08,y+h*.75);ctx.lineTo(x+w*.92,y+h*.75);ctx.closePath();ctx.fill();break;
    case 'bush':case 'deadBush':
      ctx.beginPath();ctx.arc(x+w*.35,y+h*.62,Math.min(w,h)*.35,0,Math.PI*2);ctx.arc(x+w*.65,y+h*.58,Math.min(w,h)*.4,0,Math.PI*2);ctx.fill();break;
    case 'cactus':
      ctx.fillRect(x+w*.38,y+h*.08,w*.24,h*.84);ctx.fillRect(x+w*.08,y+h*.36,w*.35,h*.13);ctx.fillRect(x+w*.57,y+h*.52,w*.32,h*.13);break;
    case 'rockstack':case 'boulder':case 'stoneRing':case 'iceChunk':case 'obsidian':
      ctx.beginPath();ctx.moveTo(x+w*.1,y+h*.8);ctx.lineTo(x+w*.28,y+h*.16);ctx.lineTo(x+w*.66,y+h*.05);ctx.lineTo(x+w*.92,y+h*.72);ctx.closePath();ctx.fill();break;
    case 'log':case 'fallenBeam':case 'driftwood':
      ctx.save();ctx.translate(x+w/2,y+h/2);ctx.rotate(-.16);ctx.fillRect(-w/2,-h/2,w,h);ctx.restore();break;
    case 'campfire':case 'barrelFire':
      ctx.beginPath();ctx.arc(x+w/2,y+h*.58,Math.min(w,h)*.35,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f2b84b';ctx.beginPath();ctx.arc(x+w/2,y+h*.45,Math.min(w,h)*.18,0,Math.PI*2);ctx.fill();break;
    case 'lamp':case 'warningPost':case 'sign':case 'signSub':
      ctx.fillRect(x+w*.4,y+h*.25,w*.2,h*.72);ctx.fillRect(x+w*.08,y+h*.08,w*.84,h*.28);break;
    case 'lavaVent':
      ctx.beginPath();ctx.arc(x+w/2,y+h/2,Math.min(w,h)*.44,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffcf61';ctx.beginPath();ctx.arc(x+w*.52,y+h*.45,Math.min(w,h)*.17,0,Math.PI*2);ctx.fill();break;
    case 'bridge':case 'barrier':case 'brokenWall':case 'glassWall':
      ctx.fillRect(x,y+h*.25,w,h*.5);for(let i=1;i<5;i++)ctx.fillRect(x+w*i/5,y+h*.15,w*.03,h*.7);break;
    case 'car':case 'vehicle':case 'wreck':
      ctx.fillRect(x,y+h*.25,w,h*.5);ctx.fillStyle='#252b31';ctx.fillRect(x+w*.18,y+h*.05,w*.64,h*.28);ctx.fillRect(x+w*.1,y+h*.76,w*.18,h*.15);ctx.fillRect(x+w*.72,y+h*.76,w*.18,h*.15);break;
    case 'shopfront':case 'storefront':
      ctx.fillRect(x,y+h*.35,w,h*.55);ctx.fillStyle='#9ebed0';ctx.fillRect(x+w*.12,y+h*.48,w*.76,h*.28);break;
    case 'bed':case 'gurney':case 'bench':case 'desk':
      ctx.fillRect(x,y+h*.22,w,h*.45);ctx.fillRect(x+w*.08,y+h*.67,w*.1,h*.28);ctx.fillRect(x+w*.82,y+h*.67,w*.1,h*.28);break;
    case 'tank':case 'server':case 'cabinet':case 'machine':case 'generator':case 'elevator':case 'blastDoor':case 'bulkhead':
      ctx.fillRect(x,y,w,h);ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(x+w*.12,y+h*.12,w*.76,h*.1);break;
    case 'console':case 'screen':case 'ticket':case 'radio':
      ctx.fillRect(x,y+h*.12,w,h*.66);ctx.fillStyle='#8bd4e7';ctx.fillRect(x+w*.12,y+h*.24,w*.76,h*.26);break;
    case 'crateLab':case 'crateMil':case 'crate':case 'ammoCrate':case 'scrap':
      ctx.fillRect(x,y,w,h);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w,y+h);ctx.moveTo(x+w,y);ctx.lineTo(x,y+h);ctx.stroke();break;
    case 'container':
      ctx.fillRect(x,y,w,h);for(let i=1;i<5;i++)ctx.fillRect(x+w*i/5,y,w*.025,h);break;
    case 'crane':case 'radioTower':case 'watchTower':
      ctx.strokeStyle=p[1];ctx.lineWidth=Math.max(4,w*.08);ctx.beginPath();ctx.moveTo(x+w*.2,y+h);ctx.lineTo(x+w*.5,y);ctx.lineTo(x+w*.8,y+h);ctx.stroke();ctx.fillRect(x+w*.34,y+h*.25,w*.32,h*.12);break;
    case 'boat':
      ctx.beginPath();ctx.moveTo(x+w*.04,y+h*.35);ctx.lineTo(x+w*.18,y+h*.8);ctx.lineTo(x+w*.82,y+h*.8);ctx.lineTo(x+w*.96,y+h*.35);ctx.closePath();ctx.fill();break;
    case 'reed':
      for(let i=0;i<8;i++){ctx.fillRect(x+i*w/8,y+h*.15+(i%3)*h*.08,3,h*.7); }break;
    case 'swampPool':
      ctx.beginPath();ctx.ellipse(x+w/2,y+h/2,w/2,h/2,0,0,Math.PI*2);ctx.fill();break;
    default:
      ctx.fillRect(x,y,w,h);ctx.strokeRect(x,y,w,h);
  }
  ctx.restore();
}

function drawUniqueScene(scale=1,ox=0,oy=0){
  if(typeof save==='undefined'||typeof ctx==='undefined')return;
  const list=MAP_OBJECTS[save.map];if(!list)return;
  ctx.save();ctx.globalAlpha=.96;
  for(const [type,x,y,w,h] of list)drawProp(ctx,type,ox+x*scale,oy+y*scale,w*scale,h*scale);
  ctx.restore();
}

function rebuildMapButton(){
  const btn=document.getElementById('mapBtn');if(!btn||btn.dataset.mapRebuilt==='1')return !!btn;
  // Replace the node so stale click handlers from older map layers are removed.
  const fresh=btn.cloneNode(true);btn.replaceWith(fresh);
  fresh.dataset.mapRebuilt='1';
  fresh.setAttribute('aria-label','Choose Map');
  fresh.onclick=(e)=>{e.preventDefault();e.stopPropagation();openMapMenu();};
  fresh.addEventListener('pointerup',e=>{if(e.pointerType==='touch'||e.pointerType==='pen'){e.preventDefault();e.stopPropagation();openMapMenu();}},{passive:false});
  window.openMapMenu=openMapMenu;
  return true;
}

function openMapMenu(){
  if(typeof openSub!=='function')return;
  const names=Object.keys(typeof mapDefs!=='undefined'?mapDefs:MAP_DESCRIPTIONS);
  const current=typeof save!=='undefined'&&save.map?save.map:'Forest';
  const html=names.map(name=>{
    const md=(typeof mapDefs!=='undefined'&&mapDefs[name])||{};
    const desc=MAP_DESCRIPTIONS[name]||md.desc||'Unique map environment';
    const count=MAP_OBJECTS[name]?.length||0;
    return '<button type="button" class="option '+(name===current?'selected':'')+'" data-action="map-rebuilt" data-value="'+esc(name)+'"><b>🗺️ '+esc(name)+'</b><div class="small">'+esc(desc)+'</div><div class="small" style="margin-top:5px">'+count+' unique scenery objects'+(name===current?' • CURRENT':'')+'</div></button>';
  }).join('');
  openSub('🗺️ Choose Map','<div class="grid" id="outlast3291MapChoices">'+html+'</div>');
  const panel=document.getElementById('outlast3291MapChoices');if(!panel)return;
  panel.addEventListener('click',e=>{
    const b=e.target.closest('[data-action="map-rebuilt"]');if(!b)return;
    e.preventDefault();e.stopPropagation();
    const name=b.dataset.value;
    if(!MAP_OBJECTS[name] && !(typeof mapDefs!=='undefined'&&mapDefs[name]))return;
    if(typeof save!=='undefined'){save.map=name;if(typeof persist==='function')persist();}
    if(typeof toast==='function')toast('🗺️ '+name+' selected');
    openMapMenu();
  });
}

function installVisualHook(){
  if(typeof drawMapObjects!=='function'||window.__outlast3291DrawWrapped)return;
  window.__outlast3291DrawWrapped=true;
  const base=drawMapObjects;
  window.drawMapObjects=function(...args){base.apply(this,args);drawUniqueScene(...args);};
}

function boot(){
  installDescriptions();
  rebuildMapButton();
  installVisualHook();
  if(typeof updates!=='undefined'&&Array.isArray(updates)&&!updates.some(x=>Array.isArray(x)&&String(x[0]).includes('v3.29.1 — Map Rebuild'))){
    updates.unshift(['v3.29.1 — Map Rebuild','Rebuilt the Map selector and added unique scenery sets with more map objects across every environment.']);
  }
  if(typeof helpArticles!=='undefined'&&Array.isArray(helpArticles)&&!helpArticles.some(x=>Array.isArray(x)&&String(x[0]).includes('unique map scenery'))){
    helpArticles.unshift(['How do the maps differ?','Maps','Every map now has its own scenery set and extra environmental objects. Use Choose Map to preview each map and select it before starting a run.']);
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
[100,500,1200,2500].forEach(ms=>setTimeout(()=>{try{installDescriptions();rebuildMapButton();installVisualHook();}catch(_){ }},ms));
})();