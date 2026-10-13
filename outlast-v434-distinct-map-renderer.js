/* OUTLAST v4.3.4 — Distinct terrain and prop rendering for all 82 added maps */
(function(){
'use strict';
const V='4.3.4';
const BASE=['Seizure','Ribhouse','Forest','Desert','Snow','Lava','City','Hospital','Laboratory','Subway','Prison','MilitaryBase','RuinedTown','Harbor','Bunker','Swamp','Skyscraper','Wasteland'];
const POS=[[220,220],[800,250],[1380,260],[2020,230],[2660,260],[3310,230],[3750,260],[260,850],[900,900],[1410,880],[2110,850],[2780,920],[3500,870],[230,1640],[850,1740],[1390,1810],[2130,1650],[2820,1740],[3530,1640],[250,2350],[850,2470],[1390,2500],[2160,2390],[2820,2500],[3510,2430],[3760,2780]];
const PACKS={
 cosmic:['PrismBlock','Anchor','Container','Crystal','Pillar','Rock','Generator'],
 industrial:['Generator','Tank','Console','Container','Barrier','Crate','Elevator','ClockGear','BlastDoor'],
 crystal:['PrismBlock','Crystal','Rock','ObsidianPillar','Anchor','IceCave'],
 frost:['IceRock','SnowBank','IceBlock','IceCave','Boulder','Pillar'],
 aquatic:['Boat','Container','Anchor','DockWall','Crane','Rock','Barrier'],
 ruins:['Ruins','Arch','Pillar','ObsidianPillar','Rock','Boulder','DeadTree'],
 urban:['Car','Bus','Truck','Barrier','Blockade','Dumpster','SignalBox','Bench'],
 nature:['Tree','Rock','FallenTree','DeadTree','ReedBed','BogRock','MudPatch','Boulder'],
 desert:['Cactus','DuneRock','Arch','Ruins','Rock','Boulder','Sandbags'],
 facility:['Generator','Console','Tank','Crate','Containment','Cabinet','Barrier','Elevator'],
 carnival:['Booth','Bench','Crate','Grill','Container','RibPlatter'],
 hive:['Containment','Crystal','DeadTree','Rubble','PrismBlock','Rock'],
 temple:['Pillar','Arch','Ruins','PrismBlock','Anchor','Rock'],
 magma:['LavaRock','ObsidianPillar','Rock','Ruins','Generator','Crate'],
 aquaticIce:['IceRock','Boat','Anchor','Container','DockWall','Rock'],
 dream:['PrismBlock','Crystal','Anchor','Pillar','Container','Rock']
};
const HUE={cosmic:255,industrial:205,crystal:275,frost:190,aquatic:175,ruins:28,urban:220,nature:115,desert:35,facility:185,carnival:325,hive:85,temple:45,magma:8,aquaticIce:205,dream:295};
const FAMILY_TESTS=[
 ['magma',/magma|volcan|lava|furnace|ember|solar flare|reactor zero|red sand|acid refinery|furnace|obsidian/i],
 ['frost',/frozen|ice|arctic|black ice|aurora|cryo|snow/i],
 ['crystal',/crystal|glass|prism|mirror|shard|shardfall/i],
 ['aquaticIce',/frozen ship|frozen abyss|arctic trench|icebreaker/i],
 ['aquatic',/abyss|sunken|flood|drowned|port|harbor|tidal|monsoon|ship|trench|floodgate|underwater|tide/i],
 ['cosmic',/void|rift|orbital|lunar|solar array|starship|satellite|quantum|wormhole|dead planet|meteor|omega vault|frontier|sky fortress|skybridge/i],
 ['industrial',/factory|power plant|clockwork|gear|steamworks|foundry|refinery|furnace|reactor|furnace|rail yard|magnetic fields|spiral|overpass|clocktower/i],
 ['carnival',/carnival|theater|puppet|prize|ticket|bazaar|mall/i],
 ['hive',/hive|parasite|nursery|wyrm|alien orchard|bioforge|biohazard|quarantine|bio-armor|the maw/i],
 ['facility',/laboratory|lab|prison|outpost|observatory|station|cyber|containment|security|hospital|research base|warzone|power|iron foundry/i],
 ['nature',/forest|orchard|garden|redwood|overgrown|marsh|marsh|swamp|silent forest|monsoon|toxic|ghost town/i],
 ['desert',/desert|sand|canyon|crater|wasteland|mirage|highway|roadside|bone pit|bone orchard/i],
 ['temple',/temple|dungeon|catacomb|cathedral|grave|bone|kingdom|museum|library|ruins|ghost|graveyard|rust cathedral/i],
 ['urban',/city|district|metro|subway|rail|station|yard|skyscraper|street|neon|museum|flooded metro/i],
 ['dream',/dream|spiral|the endless|silent|final frontier/i]
];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hash=s=>{let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
const num=v=>Number.isFinite(Number(v))?Number(v):0;
function getSave(){try{return typeof save!=='undefined'&&save?save:window.save||null}catch(_){return window.save||null}}
function getDefs(){try{return typeof mapDefs!=='undefined'?mapDefs:window.mapDefs||{}}catch(_){return window.mapDefs||{}}}
function getObstacles(){try{return typeof mapObstacles!=='undefined'?mapObstacles:window.mapObstacles||{}}catch(_){return window.mapObstacles||{}}}
function getHazards(){try{return typeof mapHazards!=='undefined'?mapHazards:window.mapHazards||{}}catch(_){return window.mapHazards||{}}}
function familyOf(name){
 const s=String(name).toLowerCase();
 for(const [f,re] of FAMILY_TESTS)if(re.test(s))return f;
 return ['cosmic','industrial','crystal','frost','aquatic','ruins','urban','nature','desert','facility','carnival','hive','temple','magma','aquaticIce','dream'][hash(name)%16];
}
function sizeFor(type){
 const sizes={Tree:[90,130],Rock:[120,85],IceRock:[135,95],LavaRock:[120,105],Rubble:[120,85],Cactus:[55,105],Car:[165,72],Vehicle:[160,80],Bus:[245,88],Truck:[225,82],Bed:[170,60],Bench:[105,55],Cabinet:[80,110],Console:[105,70],Crate:[90,75],Crates:[110,85],Tank:[110,105],Pillar:[68,160],CellBlock:[200,90],Wall:[190,55],Barrier:[175,46],Blockade:[210,54],Sandbags:[190,62],Log:[190,45],Container:[170,90],Generator:[110,105],BlastDoor:[185,80],DeadTree:[110,125],MudPatch:[135,72],ReedBed:[160,65],Desk:[135,70],Ruins:[180,80],SnowBank:[220,65],Boulder:[150,105],FallenTree:[210,50],Arch:[180,82],DuneRock:[170,75],IceCave:[185,95],ObsidianPillar:[70,170],SignalBox:[130,90],WatchTower:[90,170],Bunker:[170,120],RuinedHouse:[200,140],Boat:[180,68],BogRock:[135,88],Elevator:[100,145],PrismBlock:[125,100],Anchor:[110,110],Booth:[145,85],Grill:[125,75],RibPlatter:[140,72],Crane:[175,125],DockWall:[190,55],Crystal:[80,120],ClockGear:[115,115],Containment:[160,110],RiftGate:[150,190],HexPod:[115,100]};
 return sizes[type]||[110,82];
}
function makeLayout(name,i,family){
 const pack=PACKS[family]||PACKS.cosmic,objects=[],step=(i*7+hash(name)%POS.length)%POS.length;
 for(let j=0;j<19;j++){
  const p=POS[(step+j*7)%POS.length],type=pack[(j*3+i+hash(name)%pack.length)%pack.length],s=sizeFor(type);
  let x=p[0]+(((i+j*3)%7)-3)*13,y=p[1]+(((i*2+j)%7)-3)*11;
  // Keep a generous, obstacle-free opening where every run starts.
  if(Math.abs(x-1600)<255&&Math.abs(y-1200)<300)continue;
  x=Math.max(65,Math.min(4000-s[0]-65,x));y=Math.max(65,Math.min(3000-s[1]-65,y));
  objects.push([type,x,y,s[0],s[1]]);
 }
 return objects;
}
function applyData(){
 const defs=getDefs(),obs=getObstacles(),haz=getHazards(),all=Array.isArray(window.OUTLAST_MAP_CATALOG)?window.OUTLAST_MAP_CATALOG:[];
 if(!all.length||!defs||!obs||!haz)return false;
 const added=all.filter(n=>!BASE.includes(n)&&!String(n).startsWith('CustomMap:'));
 added.forEach((name,i)=>{
  const family=familyOf(name),h=hash(name),baseHue=(HUE[family]||215)+(h%47)-23,hue=(baseHue+360)%360;
  const accentHue=(hue+78+(h%37))%360;
  const old=defs[name]||{};
  defs[name]={...old,bg:'hsl('+hue+' 43% '+(11+(h%4))+'%)',grid:'hsl('+hue+' 35% '+(24+(h%5))+'%)',accent:'hsl('+accentHue+' 82% 66%)',theme:family,themeSeed:h,themeHue:hue,desc:(old.desc||'Distinct arena with a unique layout.')+' Terrain: '+family+'.'};
  obs[name]=makeLayout(name,i,family);
  if(haz[name])haz[name]={...haz[name],color:'hsl('+accentHue+' 88% 65%)',theme:family};
 });
 window.OUTLAST_MAP_THEME_REGISTRY_V434=V;
 window.OUTLAST_MAP_THEME_COUNT_V434=added.length;
 window.OUTLAST_MAP_LAYOUT_SIGNATURES_V434=added.map(n=>JSON.stringify(obs[n]));
 return added.length>=82;
}
function isAdded(name){return !!name&&!BASE.includes(name)&&!!(window.OUTLAST_MAP_CATALOG||[]).includes(name)&&!String(name).startsWith('CustomMap:')}
function getTheme(name){return getDefs()[name]||{theme:familyOf(name),accent:'#81d8ff',grid:'#314351',bg:'#111720',themeSeed:hash(name)}}
function drawPoly(c,points,fill,stroke,lw){if(!points.length)return;c.beginPath();c.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)c.lineTo(points[i][0],points[i][1]);c.closePath();if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw||2;c.stroke()}}
function drawThemeTerrain(name,scale=1,ox=0,oy=0){
 let c;try{c=ctx}catch(_){return}if(!c||typeof c.save!=='function')return;
 const m=getTheme(name),fam=m.theme||familyOf(name),seed=num(m.themeSeed)||hash(name),accent=m.accent||'#77d8ff',grid=m.grid||'#2a3d4d';
 c.save();c.globalAlpha=.42;c.lineWidth=Math.max(1,1.4*scale);c.strokeStyle=grid;c.fillStyle=accent;
 const sx=x=>ox+x*scale,sy=y=>oy+y*scale;
 if(fam==='cosmic'||fam==='dream'){
  c.globalAlpha=.52;
  for(let k=0;k<72;k++){const x=65+((seed+k*613)%3850),y=55+((seed*3+k*379)%2890),r=(2+(k%4))*scale;c.globalAlpha=.18+(k%4)*.06;c.beginPath();c.arc(sx(x),sy(y),r,0,Math.PI*2);c.fill()}
  c.globalAlpha=.2;c.strokeStyle=accent;
  for(let k=0;k<7;k++){const x=350+((seed+k*509)%3300),y=220+((seed+k*311)%2450),r=(42+(k%3)*25)*scale;c.beginPath();c.ellipse(sx(x),sy(y),r*1.55,r*.62,(k%5)*.5,0,Math.PI*2);c.stroke()}
  if(fam==='dream'){c.globalAlpha=.11;for(let k=0;k<14;k++){const x=200+(k*277+seed%109)%3500,y=150+(k*183+seed%91)%2550;c.beginPath();c.arc(sx(x),sy(y),(80+k%4*20)*scale,0,Math.PI*1.65);c.stroke()}}
 }else if(fam==='urban'){
  c.globalAlpha=.30;c.fillStyle='#03070d';
  for(let x=120;x<4000;x+=760){c.fillRect(sx(x),oy,58*scale,3000*scale)}
  for(let y=280;y<3000;y+=730){c.fillRect(ox,sy(y),4000*scale,52*scale)}
  c.globalAlpha=.46;c.strokeStyle=accent;c.setLineDash([18*scale,22*scale]);
  for(let x=150;x<4000;x+=760){c.beginPath();c.moveTo(sx(x+29),oy);c.lineTo(sx(x+29),oy+3000*scale);c.stroke()}
  for(let y=300;y<3000;y+=730){c.beginPath();c.moveTo(ox,sy(y+26));c.lineTo(ox+4000*scale,sy(y+26));c.stroke()}
  c.setLineDash([]);
 }else if(fam==='industrial'||fam==='facility'){
  c.globalAlpha=.34;c.strokeStyle=accent;c.lineWidth=Math.max(1,2*scale);
  for(let x=80;x<4000;x+=260){c.beginPath();c.moveTo(sx(x),oy+40*scale);c.lineTo(sx(x),oy+2960*scale);c.stroke()}
  for(let y=100;y<3000;y+=230){c.beginPath();c.moveTo(ox+35*scale,sy(y));c.lineTo(ox+3965*scale,sy(y));c.stroke()}
  c.globalAlpha=.25;c.fillStyle=accent;
  for(let k=0;k<28;k++){const x=90+(seed+k*149)%3800,y=100+(seed*2+k*227)%2750;c.fillRect(sx(x),sy(y),36*scale,5*scale);c.fillRect(sx(x),sy(y),5*scale,36*scale)}
 }else if(fam==='crystal'){
  c.globalAlpha=.18;c.strokeStyle=accent;
  for(let k=0;k<26;k++){const x=100+(seed+k*317)%3800,y=90+(seed*3+k*211)%2800,h=(34+k%4*12)*scale,w=(20+k%3*9)*scale;drawPoly(c,[[sx(x),sy(y-h)],[sx(x+w),sy(y)],[sx(x),sy(y+h)],[sx(x-w),sy(y)]],null,accent,Math.max(1,2*scale));c.beginPath();c.moveTo(sx(x),sy(y-h));c.lineTo(sx(x),sy(y+h));c.stroke()}
 }else if(fam==='frost'||fam==='aquaticIce'){
  c.globalAlpha=.16;c.fillStyle='#d9f5ff';c.strokeStyle=accent;
  for(let k=0;k<26;k++){const x=100+(seed+k*313)%3800,y=80+(seed*2+k*191)%2800,w=(55+k%4*22)*scale,h=(18+k%3*9)*scale;c.beginPath();c.ellipse(sx(x),sy(y),w,h,(k%5)*.25,0,Math.PI*2);c.fill();c.globalAlpha=.24;c.beginPath();c.moveTo(sx(x-w*.8),sy(y));c.lineTo(sx(x),sy(y-h*1.6));c.lineTo(sx(x+w*.7),sy(y+h*.4));c.stroke();c.globalAlpha=.16}
 }else if(fam==='aquatic'){
  c.globalAlpha=.35;c.strokeStyle=accent;
  for(let y=80;y<3000;y+=95){c.beginPath();for(let x=0;x<=4000;x+=90){const yy=y+Math.sin((x/135)+(y/110)+(seed%17))*(11+(seed%6));if(x===0)c.moveTo(ox+sx(x),sy(yy));else c.lineTo(ox+sx(x),sy(yy))}c.stroke()}
  c.globalAlpha=.12;c.fillStyle='#1fc7d7';
  for(let k=0;k<14;k++){const x=100+(seed+k*293)%3700,y=120+(seed+k*173)%2700;c.beginPath();c.ellipse(sx(x),sy(y),70*scale,25*scale,0,0,Math.PI*2);c.fill()}
 }else if(fam==='nature'||fam==='hive'){
  c.globalAlpha=fam==='hive'?.17:.13;c.strokeStyle=accent;c.fillStyle=accent;
  if(fam==='hive'){
   const side=38*scale,hh=side*.866;
   for(let row=0;row<15;row++)for(let col=0;col<19;col++){const x=120+col*side*1.5+(row%2)*side*.75,y=90+row*hh*1.7;if((col+row+seed)%3===0){c.beginPath();for(let a=0;a<6;a++){const an=Math.PI/3*a;c.lineTo(sx(x+side*Math.cos(an)),sy(y+side*Math.sin(an)))}c.closePath();c.stroke()}}
  }else{
   for(let k=0;k<32;k++){const x=100+(seed+k*233)%3800,y=70+(seed*5+k*157)%2850,r=(32+k%5*13)*scale;c.beginPath();c.ellipse(sx(x),sy(y),r*1.4,r*.62,k%4*.4,0,Math.PI*2);c.fill();c.globalAlpha=.23;c.beginPath();c.arc(sx(x),sy(y),r,0,Math.PI*2);c.stroke();c.globalAlpha=.13}
  }
 }else if(fam==='desert'||fam==='magma'){
  c.globalAlpha=fam==='magma'?.20:.15;c.strokeStyle=accent;c.fillStyle=accent;
  for(let y=160;y<3000;y+=155){c.beginPath();for(let x=0;x<=4000;x+=100){const yy=y+Math.sin(x/235+seed%17+y/150)*(fam==='magma'?19:27);if(x===0)c.moveTo(ox+sx(x),sy(yy));else c.lineTo(ox+sx(x),sy(yy))}c.stroke()}
  if(fam==='magma'){c.globalAlpha=.14;for(let k=0;k<14;k++){const x=100+(seed+k*347)%3800,y=100+(seed+k*197)%2800;c.beginPath();c.ellipse(sx(x),sy(y),54*scale,22*scale,k*.3,0,Math.PI*2);c.fill()}}
  else{c.globalAlpha=.13;for(let k=0;k<30;k++){const x=90+(seed+k*227)%3800,y=100+(seed+k*311)%2750;c.fillRect(sx(x),sy(y),90*scale,4*scale)}}
 }else if(fam==='ruins'||fam==='temple'){
  c.globalAlpha=.24;c.strokeStyle=accent;
  for(let y=90,row=0;y<3000;y+=112,row++){const offset=(row%2)*70;for(let x=-100;x<4000;x+=220){const xx=x+offset,yy=y+((seed+row*19)%18);c.strokeRect(sx(xx),sy(yy),210*scale,102*scale);if((row+Math.floor(x/220)+seed)%4===0){c.beginPath();c.moveTo(sx(xx+45),sy(yy+20));c.lineTo(sx(xx+74),sy(yy+48));c.lineTo(sx(xx+58),sy(yy+84));c.stroke()}}}
  if(fam==='temple'){c.globalAlpha=.17;for(let k=0;k<9;k++){const x=360+((seed+k*433)%3200),y=280+((seed+k*287)%2400);c.beginPath();c.arc(sx(x),sy(y),32*scale,0,Math.PI*2);c.stroke();c.beginPath();c.arc(sx(x),sy(y),20*scale,0,Math.PI*2);c.stroke()}}
 }else if(fam==='carnival'){
  c.globalAlpha=.2;c.fillStyle=accent;
  for(let k=0;k<50;k++){const x=50+(seed+k*157)%3900,y=60+(seed*2+k*211)%2860,r=(4+k%4*2)*scale;c.beginPath();c.arc(sx(x),sy(y),r,0,Math.PI*2);c.fill()}
  c.globalAlpha=.15;c.strokeStyle=accent;for(let y=100;y<3000;y+=250){c.beginPath();c.moveTo(ox,sy(y));c.lineTo(ox+4000*scale,sy(y+65));c.stroke()}
 }else{
  c.globalAlpha=.18;c.strokeStyle=accent;
  for(let k=0;k<28;k++){const x=100+(seed+k*223)%3800,y=70+(seed*3+k*173)%2850;c.beginPath();c.arc(sx(x),sy(y),18*scale,0,Math.PI*2);c.stroke()}
 }
 c.restore();
}
function paletteFor(family,m){
 const hue=num(m.themeHue)||HUE[family]||200;
 const colors={
  cosmic:['#18213d','#364b79','#a8b9ff'],industrial:['#263441','#536b7c','#a6d9e8'],
  crystal:['#39274c','#73529b','#d6b7ff'],frost:['#203948','#6b9eb3','#d7f6ff'],
  aquatic:['#12343a','#286d78','#6be8ed'],ruins:['#40362c','#76634e','#e2be86'],
  urban:['#252d3a','#56687d','#bacce6'],nature:['#263b2b','#4e7650','#b4db82'],
  desert:['#4a3924','#8b6d43','#e8bf72'],facility:['#20333c','#4b7380','#83edf1'],
  carnival:['#3d213f','#7d386f','#ff94da'],hive:['#273521','#617d37','#c0ec6b'],
  temple:['#493522','#8c6c3d','#ffd27c'],magma:['#3a1919','#8e3327','#ff8856'],
  aquaticIce:['#1e3545','#5a829d','#c3f4ff'],dream:['#30213f','#654b85','#ecbcff']
 };
 return colors[family]||colors.cosmic;
}
function drawStyledObjects(scale=1,ox=0,oy=0){
 let c;try{c=ctx}catch(_){return}if(!c||typeof c.save!=='function')return;
 const name=String(getSave()?.map||''),items=(getObstacles()[name]||[]),m=getTheme(name),fam=m.theme||familyOf(name),pal=paletteFor(fam,m);
 const [base,mid,bright]=pal,accent=m.accent||bright,seed=num(m.themeSeed)||hash(name);
 c.save();
 for(let i=0;i<items.length;i++){
  const o=items[i],type=o[0],x=ox+o[1]*scale,y=oy+o[2]*scale,w=o[3]*scale,h=o[4]*scale;
  const metal=['Generator','Tank','Console','Container','Elevator','BlastDoor','ClockGear','SignalBox','Cabinet','Containment','RiftGate','HexPod'].includes(type);
  const stone=['Pillar','Wall','Barrier','Blockade','Sandbags','CellBlock','Ruins','Arch','Bunker','RuinedHouse','ObsidianPillar','DockWall'].includes(type);
  const crystal=['Crystal','PrismBlock','IceCave','IceRock','IceBlock','SnowBank'].includes(type);
  const organic=['Tree','DeadTree','ReedBed','FallenTree','BogRock','MudPatch','Boulder','Rock','Rubble'].includes(type);
  const vehicle=['Car','Vehicle','Bus','Truck','Boat','Crane'].includes(type);
  const paletteFill=metal?mid:stone?'#6e6b72':crystal?bright:organic?base:mid;
  c.save();c.shadowColor=accent;c.shadowBlur=(fam==='cosmic'||fam==='crystal'||fam==='dream'?7:2)*scale;
  c.fillStyle=paletteFill;c.strokeStyle=accent;c.lineWidth=Math.max(1.5,2.5*scale);
  if(crystal){
   drawPoly(c,[[x+w*.5,y],[x+w*.92,y+h*.34],[x+w*.78,y+h*.88],[x+w*.5,y+h],[x+w*.20,y+h*.76],[x+w*.08,y+h*.32]],paletteFill,accent,Math.max(1.4,2.5*scale));
   c.globalAlpha=.65;c.strokeStyle='#ffffff';c.beginPath();c.moveTo(x+w*.5,y+h*.05);c.lineTo(x+w*.48,y+h*.68);c.lineTo(x+w*.78,y+h*.88);c.stroke();c.beginPath();c.moveTo(x+w*.48,y+h*.68);c.lineTo(x+w*.2,y+h*.76);c.stroke();
  }else if(type==='Tree'||type==='DeadTree'){
   c.fillStyle=type==='Tree'?'#614733':'#3f403b';c.fillRect(x+w*.43,y+h*.4,w*.15,h*.56);
   c.fillStyle=type==='Tree'?mid:'#514c47';for(let q=0;q<3;q++){c.beginPath();c.ellipse(x+w*(.36+q*.13),y+h*(.28+q*.14),w*.27,h*.22,0,0,Math.PI*2);c.fill()}
   c.strokeStyle=accent;c.beginPath();c.arc(x+w*.5,y+h*.34,Math.min(w,h)*.3,0,Math.PI*2);c.stroke();
  }else if(type==='Cactus'){
   c.fillStyle='#5fa65f';c.fillRect(x+w*.38,y+h*.16,w*.25,h*.76);c.fillRect(x+w*.12,y+h*.42,w*.28,h*.11);c.fillRect(x+w*.12,y+h*.3,w*.11,h*.24);c.fillRect(x+w*.6,y+h*.56,w*.28,h*.11);c.fillRect(x+w*.77,y+h*.39,w*.11,h*.27);c.strokeRect(x+w*.38,y+h*.16,w*.25,h*.76);
  }else if(type==='Car'||type==='Vehicle'||type==='Bus'||type==='Truck'){
   c.fillStyle=mid;c.beginPath();c.roundRect(x+w*.03,y+h*.23,w*.94,h*.58,5*scale);c.fill();c.stroke();
   c.fillStyle='#10212e';c.fillRect(x+w*.20,y+h*.3,w*.26,h*.26);c.fillRect(x+w*.54,y+h*.3,w*.25,h*.26);
   c.fillStyle='#111820';for(const wx of [.2,.74]){c.beginPath();c.arc(x+w*wx,y+h*.82,h*.13,0,Math.PI*2);c.fill()}
   c.fillStyle=accent;c.fillRect(x+w*.06,y+h*.55,w*.08,h*.08);c.fillRect(x+w*.86,y+h*.55,w*.08,h*.08);
  }else if(type==='Boat'){
   drawPoly(c,[[x+w*.04,y+h*.25],[x+w*.94,y+h*.25],[x+w*.75,y+h*.82],[x+w*.22,y+h*.82]],mid,accent,Math.max(1.5,2*scale));c.fillStyle=base;c.fillRect(x+w*.42,y+h*.08,w*.20,h*.45);c.strokeRect(x+w*.42,y+h*.08,w*.20,h*.45);
  }else if(type==='ClockGear'){
   c.beginPath();c.arc(x+w*.5,y+h*.5,Math.min(w,h)*.38,0,Math.PI*2);c.fill();c.stroke();c.fillStyle=base;c.beginPath();c.arc(x+w*.5,y+h*.5,Math.min(w,h)*.16,0,Math.PI*2);c.fill();c.stroke();for(let t=0;t<8;t++){const a=t*Math.PI/4;c.beginPath();c.moveTo(x+w*.5+Math.cos(a)*w*.19,y+h*.5+Math.sin(a)*h*.19);c.lineTo(x+w*.5+Math.cos(a)*w*.47,y+h*.5+Math.sin(a)*h*.47);c.stroke()}
  }else if(type==='Arch'||type==='Ruins'||type==='Pillar'||type==='ObsidianPillar'){
   c.fillStyle=type==='ObsidianPillar'?'#282632':'#70604d';c.fillRect(x+w*.10,y+h*.05,w*.80,h*.90);c.strokeRect(x+w*.10,y+h*.05,w*.80,h*.90);c.strokeStyle=accent;c.globalAlpha=.7;for(let q=1;q<4;q++){c.beginPath();c.moveTo(x+w*.12,y+h*q/4);c.lineTo(x+w*.88,y+h*q/4);c.stroke()}c.globalAlpha=1;
   if(type==='Arch'){c.clearRect(x+w*.32,y+h*.38,w*.36,h*.58);c.strokeRect(x+w*.32,y+h*.38,w*.36,h*.58)}
  }else{
   c.beginPath();c.roundRect(x,y,w,h,Math.min(8*scale,w*.12,h*.12));c.fill();c.stroke();
   // Distinct surface detail so unfamiliar props never become generic grey boxes.
   c.strokeStyle=bright;c.globalAlpha=.75;c.lineWidth=Math.max(1,1.4*scale);
   if(metal){c.strokeRect(x+w*.12,y+h*.13,w*.76,h*.70);c.fillStyle=accent;c.fillRect(x+w*.19,y+h*.22,w*.12,h*.14);c.fillRect(x+w*.39,y+h*.22,w*.12,h*.14);c.fillRect(x+w*.65,y+h*.22,w*.12,h*.14);c.beginPath();c.moveTo(x+w*.14,y+h*.58);c.lineTo(x+w*.86,y+h*.58);c.stroke()}
   else if(type==='Booth'||type==='Grill'){for(let q=0;q<5;q++){c.fillStyle=q%2?base:bright;c.fillRect(x+w*q/5,y,w/5,h*.26)}c.strokeRect(x+w*.08,y+h*.10,w*.84,h*.78)}
   else if(type==='Bench'){c.fillRect(x+w*.08,y+h*.26,w*.84,h*.25);for(let q=0;q<4;q++)c.fillRect(x+w*(.15+q*.22),y+h*.62,w*.07,h*.30)}
   else{for(let q=1;q<4;q++){c.beginPath();c.moveTo(x+w*q/4,y+h*.08);c.lineTo(x+w*q/4,y+h*.92);c.stroke()}c.beginPath();c.moveTo(x+w*.08,y+h*.5);c.lineTo(x+w*.92,y+h*.5);c.stroke()}
  }
  if(fam==='cosmic'||fam==='dream'){c.globalAlpha=.85;c.strokeStyle=bright;c.beginPath();c.ellipse(x+w*.5,y+h*.5,w*.63,h*.34,0,0,Math.PI*2);c.stroke()}
  if(fam==='carnival'){c.globalAlpha=.85;c.strokeStyle=['#ff617d','#ffca61','#79f0d4','#a9a0ff'][i%4];c.lineWidth=Math.max(2,3*scale);c.beginPath();c.moveTo(x+w*.08,y+h*.22);c.lineTo(x+w*.92,y+h*.78);c.stroke()}
  c.restore();
 }
 c.restore();
}
function installDrawWrappers(){
 try{
  if(typeof window.drawMapDetails==='function'&&!window.drawMapDetails.__outlastV434){
   const original=window.drawMapDetails;
   const wrap=function(scale=1,ox=0,oy=0){const out=original.apply(this,arguments);const n=String(getSave()?.map||'Forest');if(isAdded(n))drawThemeTerrain(n,scale,ox,oy);return out};
   wrap.__outlastV434=true;window.drawMapDetails=wrap;try{drawMapDetails=wrap}catch(_){}
  }
  if(typeof window.drawMapObjects==='function'&&!window.drawMapObjects.__outlastV434){
   const original=window.drawMapObjects;
   const wrap=function(scale=1,ox=0,oy=0){const n=String(getSave()?.map||'Forest');if(isAdded(n))return drawStyledObjects(scale,ox,oy);return original.apply(this,arguments)};
   wrap.__outlastV434=true;window.drawMapObjects=wrap;try{drawMapObjects=wrap}catch(_){}
  }
 }catch(e){window.OUTLAST_MAP_RENDERER_ERROR=String(e&&e.message||e)}
}
function notes(){try{
 if(typeof updates!=='undefined'&&Array.isArray(updates)&&!updates.some(x=>Array.isArray(x)&&String(x[0]).includes('v4.3.4')))updates.unshift(['v4.3.4 — Distinct Map Visuals','Rebuilt visuals for all 82 added arenas. New maps now use map-specific terrain patterns, stronger palettes, themed obstacle layouts and detailed scenery drawing instead of reusing the default grey prop style. Original maps are unchanged.']);
 if(typeof helpArticles!=='undefined'&&Array.isArray(helpArticles)){
  const entries=[['Why do the 82 extra maps look different now?','Maps','The added maps now use distinct terrain treatments such as crystal fields, icy ridges, volcanic fissures, orbital starfields, city streets, water currents, ancient floor tiles, gearworks and alien hives. Their scenery layouts and prop styles also differ by map family. Open Play → Choose Map; the new arenas are grouped first.'],['How are the new map visuals tested?','Maps','The world visual audit checks that every added map has a registered theme, a unique palette, a distinct obstacle layout and an active themed rendering path. Start a run on multiple maps to confirm the background and scenery change before continuing a long run.']];
  for(let i=entries.length-1;i>=0;i--)if(!helpArticles.some(x=>x&&x[0]===entries[i][0]))helpArticles.unshift(entries[i]);
 }
}catch(_){}}
function audit(){
 const defs=getDefs(),obs=getObstacles(),all=Array.isArray(window.OUTLAST_MAP_CATALOG)?window.OUTLAST_MAP_CATALOG:[],added=all.filter(n=>!BASE.includes(n)&&!String(n).startsWith('CustomMap:'));
 const palettes=added.map(n=>defs[n]&&[defs[n].bg,defs[n].grid,defs[n].accent].join('|')),layouts=added.map(n=>JSON.stringify(obs[n]||[])),families=[...new Set(added.map(n=>defs[n]&&defs[n].theme))];
 return {version:V,total:all.length,added:added.length,uniqueAdded:new Set(added).size,distinctPalettes:new Set(palettes).size,distinctLayouts:new Set(layouts).size,families,missingThemes:added.filter(n=>!defs[n]||!defs[n].theme),missingLayouts:added.filter(n=>!Array.isArray(obs[n])||obs[n].length<12),drawMapDetailsWrapped:!!window.drawMapDetails?.__outlastV434,drawMapObjectsWrapped:!!window.drawMapObjects?.__outlastV434,ready:added.length===82&&new Set(added).size===82&&new Set(palettes).size===82&&new Set(layouts).size===82&&added.every(n=>defs[n]?.theme&&Array.isArray(obs[n])&&obs[n].length>=12)&&!!window.drawMapDetails?.__outlastV434&&!!window.drawMapObjects?.__outlastV434};
}
function setVersion(){
 const current=String(window.OUTLAST_BUILD||'0').split('.').map(x=>Number(x)||0),next=V.split('.').map(x=>Number(x)||0);let cmp=0;
 for(let i=0;i<Math.max(current.length,next.length);i++){if((current[i]||0)!==(next[i]||0)){cmp=(current[i]||0)>(next[i]||0)?1:-1;break}}
 if(cmp>0)return;
 window.OUTLAST_BUILD=V;window.OUTLAST_VERSION='v'+V;document.title='OUTLAST v'+V;
 ['meta[name="outlast-build"]','meta[name="build-version"]'].forEach(s=>{const e=document.querySelector(s);if(e)e.content=V});
 document.querySelectorAll('.menu-chip').forEach(e=>{if(/SURVIVOR HUB/i.test(e.textContent||''))e.textContent='v'+V+' • SURVIVOR HUB'});
}
function install(){try{if(applyData()){installDrawWrappers();notes();setVersion();window.OUTLAST_MAP_VISUAL_AUDIT_V434=audit;window.OUTLAST_MAP_VISUAL_READY_V434=audit().ready;if(!audit().ready)window.OUTLAST_MAP_VISUAL_AUDIT_ERROR='Some added maps are missing a visual theme, layout or rendering wrapper'}else window.OUTLAST_MAP_VISUAL_WAITING=true}catch(e){window.OUTLAST_MAP_VISUAL_INSTALL_ERROR=String(e&&e.message||e)}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.addEventListener('load',install,{once:true});setTimeout(install,0);setTimeout(install,100);setTimeout(install,400);setTimeout(install,900);
})();