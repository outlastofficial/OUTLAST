/* OUTLAST v3.30.18 — Map Creator */
(function(){
'use strict';
const VERSION='3.37.6';
const MAP_CREATOR_COST=100000;
const MAX_CUSTOM_MAPS=5;
const PREFIX='CustomMap:';

const BASE_MAPS=['Forest','Desert','Snow','Lava','City','Hospital','Laboratory','Subway','Prison','MilitaryBase','RuinedTown','Harbor','Bunker','Swamp','Skyscraper','Wasteland','Seizure','Ribhouse'];
const OBJECTS={
 Tree:[90,130],Rock:[120,85],Boulder:[150,105],FallenTree:[210,50],Log:[190,45],
 Cactus:[55,105],Crate:[145,100],Wall:[240,60],Barrier:[220,55],Pillar:[65,180],
 Car:[180,75],Container:[190,100],Ruins:[210,75],RuinedHouse:[210,110],
 Booth:[210,85],Grill:[155,105],PrismBlock:[180,80],DeadTree:[135,115]
};
const THEME_COLORS={
 Forest:['#0b1710','#1b3021','#63ba78'],Desert:['#24170b','#4a3219','#d5a24a'],
 Snow:['#0b1520','#263c4d','#8bd9ff'],Lava:['#1c0a08','#421b16','#ff6546'],
 City:['#090d13','#232c38','#6f97c3'],Hospital:['#101821','#293a47','#6fd0ea'],
 Laboratory:['#08161a','#1b3942','#60e4ff'],Subway:['#0b0a11','#292538','#b388ff'],
 Prison:['#0e1216','#2a3138','#aebdc9'],MilitaryBase:['#0d160e','#25371f','#9fbe6b'],
 RuinedTown:['#160f0d','#362821','#d19770'],Harbor:['#07151a','#17353f','#5fd3e6'],
 Bunker:['#0b0e10','#262c30','#ceb067'],Swamp:['#09150e','#1a3422','#78b968'],
 Skyscraper:['#08101a','#1d3043','#82b3ff'],Wasteland:['#170e09','#3d291f','#dd9550'],
 Seizure:['#0d0715','#2b2040','#d08cff'],Ribhouse:['#180b07','#3d1f15','#e06437']
};
const HAZARDS={
 Forest:'Falling Branches',Desert:'Heat Wave',Snow:'Ice Cracks',Lava:'Lava Pools',
 City:'Falling Debris',Hospital:'Electrical Surge',Laboratory:'Energy Leak',Subway:'Train Shock',
 Prison:'Lockdown Pulse',MilitaryBase:'Mortar Strike',RuinedTown:'Falling Rubble',
 Harbor:'Tidal Surge',Bunker:'Security Pulse',Swamp:'Toxic Mist',Skyscraper:'Glass Storm',
 Wasteland:'Falling Rubble',Seizure:'Sensory Overload',Ribhouse:'Hot Grill'
};

function safe(v){
 return String(v==null?'':v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function ensure(){
 save=save||{};
 if(!Array.isArray(save.customMaps))save.customMaps=[];
 save.customMaps=save.customMaps.slice(0,MAX_CUSTOM_MAPS);
 save.mapCreatorUnlocked=save.mapCreatorUnlocked===true;
}
function makeId(){return 'cm_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7);}
function key(id){return PREFIX+id;}
function themeData(theme){
 const c=THEME_COLORS[theme]||THEME_COLORS.Forest;
 return {bg:c[0],grid:c[1],accent:c[2]};
}
function objectDef(type){
 return Array.isArray(OBJECTS[type])?OBJECTS[type]:OBJECTS.Rock;
}
function registerCustomMap(cm){
 const k=key(cm.id);
 const td=themeData(cm.theme);
 mapDefs[k]={bg:td.bg,grid:td.grid,accent:td.accent,desc:(cm.name||'Custom Map')+' — '+cm.theme+' theme'};
 mapObstacles[k]=(Array.isArray(cm.objects)?cm.objects:[]).map(o=>{
   const d=objectDef(o.type);
   return [o.type,Number(o.x)||0,Number(o.y)||0,d[0],d[1]];
 });
 const hzKey=(cm.hazardMap&&HAZARDS[cm.hazardMap])?cm.hazardMap:cm.theme;
 if(mapHazards[hzKey])mapHazards[k]=Object.assign({},mapHazards[hzKey]);
 else if(mapHazards[cm.theme])mapHazards[k]=Object.assign({},mapHazards[cm.theme]);
 else mapHazards[k]=Object.assign({},mapHazards.Forest);
 return k;
}
function registerAll(){
 ensure();
 for(const k of Object.keys(mapDefs||{})){
   if(k.indexOf(PREFIX)===0)delete mapDefs[k];
 }
 for(const k of Object.keys(mapObstacles||{})){
   if(k.indexOf(PREFIX)===0)delete mapObstacles[k];
 }
 for(const k of Object.keys(mapHazards||{})){
   if(k.indexOf(PREFIX)===0)delete mapHazards[k];
 }
 for(const cm of save.customMaps)registerCustomMap(cm);
}
function unlock(){
 ensure();
 if(save.mapCreatorUnlocked){openCreatorEditor(null);return;}
 const coins=Number(save.coins)||0;
 if(coins<MAP_CREATOR_COST){toast('🗺️ Map Creator costs 100,000 coins. You need '+(MAP_CREATOR_COST-coins).toLocaleString()+' more.');return;}
 save.coins=coins-MAP_CREATOR_COST;
 save.mapCreatorUnlocked=true;
 persist();
 toast('🗺️ Map Creator unlocked!');
 openCreatorEditor(null);
}
function currentObjectsFromCells(cells){
 const out=[];
 const startX=280,startY=270,stepX=660,stepY=620;
 for(let i=0;i<20;i++){
   const type=cells[i];
   if(!type||type==='EMPTY')continue;
   const col=i%5,row=Math.floor(i/5);
   const d=objectDef(type);
   out.push({type,x:startX+col*stepX-d[0]/2,y:startY+row*stepY-d[1]/2});
 }
 return out;
}
function renderEditor(existing){
 ensure();
 let cells=Array(20).fill('EMPTY');
 if(existing&&Array.isArray(existing.objects)){
   const startX=280,startY=270,stepX=660,stepY=620;
   for(const o of existing.objects){
     let best=-1,bd=Infinity;
     for(let i=0;i<20;i++){
       const col=i%5,row=Math.floor(i/5);
       const x=startX+col*stepX,y=startY+row*stepY,d=Math.hypot((Number(o.x)||0)+80-x,(Number(o.y)||0)+45-y);
       if(d<bd){bd=d;best=i;}
     }
     if(best>=0)cells[best]=o.type;
   }
 }
 const name=existing?.name||'';
 const theme=existing?.theme||'Forest';
 const hazard=existing?.hazardMap||theme;
 const themeOptions=Object.keys(THEME_COLORS).map(t=>'<option value="'+safe(t)+'" '+(t===theme?'selected':'')+'>'+safe(t)+'</option>').join('');
 const hazardOptions=Object.keys(HAZARDS).map(t=>'<option value="'+safe(t)+'" '+(t===hazard?'selected':'')+'>'+safe(HAZARDS[t])+'</option>').join('');
 const objectOptions='<option value="EMPTY">🧹 Eraser</option>'+Object.keys(OBJECTS).map(t=>'<option value="'+safe(t)+'">'+safe(t)+'</option>').join('');
 const cellsHtml=cells.map((v,i)=>{
   const center=i===7||i===12;
   return '<button type="button" class="option mc-cell" data-mc-cell="'+i+'" style="min-height:58px">'+(center?'START':safe(v==='EMPTY'?'EMPTY':v))+'</button>';
 }).join('');
 openSub(existing?'🗺️ Edit Custom Map':'🗺️ Create Custom Map',
   '<div class="option"><b>100,000-coin Map Creator</b><div class="small">Build a saved custom arena. Click a grid cell to place the selected object. The center START cells stay protected.</div></div>'+
   '<div class="grid">'+
   '<label class="option"><b>Map Name</b><input id="mcName" maxlength="28" value="'+safe(name)+'" placeholder="My Map"></label>'+
   '<label class="option"><b>Theme</b><select id="mcTheme">'+themeOptions+'</select></label>'+
   '<label class="option"><b>Hazard</b><select id="mcHazard">'+hazardOptions+'</select></label>'+
   '<label class="option"><b>Object</b><select id="mcObject">'+objectOptions+'</select></label>'+
   '</div>'+
   '<div class="option"><b>Map Grid</b><div class="small">Upper / middle / lower arena zones • '+cells.filter(v=>v!=='EMPTY').length+' placed objects</div><div id="mcGrid" style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;margin-top:8px">'+cellsHtml+'</div></div>'+
   '<div class="grid"><button type="button" class="gold" id="mcSave">💾 SAVE MAP</button><button type="button" class="option" id="mcClear">Clear Objects</button><button type="button" class="option" id="mcCancel">Cancel</button></div>'
 );
 const sel=document.getElementById('mcObject');
 const grid=document.getElementById('mcGrid');
 grid?.querySelectorAll('[data-mc-cell]').forEach(btn=>{
   btn.addEventListener('click',()=>{
     const i=Number(btn.dataset.mcCell);
     if(i===7||i===12){toast('⭐ The starting area must stay clear.');return;}
     const v=sel?.value||'EMPTY';
     cells[i]=v;
     btn.textContent=v==='EMPTY'?'EMPTY':v;
     btn.style.opacity=v==='EMPTY'?'0.75':'1';
   });
 });
 document.getElementById('mcClear')?.addEventListener('click',()=>{
   cells=Array(20).fill('EMPTY');
   grid?.querySelectorAll('[data-mc-cell]').forEach(b=>{b.textContent=(Number(b.dataset.mcCell)===7||Number(b.dataset.mcCell)===12)?'START':'EMPTY';});
 });
 document.getElementById('mcCancel')?.addEventListener('click',()=>window.openMapSelector?.());
 document.getElementById('mcSave')?.addEventListener('click',()=>{
   const mapName=(document.getElementById('mcName')?.value||'').trim().replace(/\s+/g,' ');
   if(!mapName){toast('🗺️ Give your map a name first.');return;}
   const themeNow=document.getElementById('mcTheme')?.value||'Forest';
   const hazardNow=document.getElementById('mcHazard')?.value||themeNow;
   const objects=currentObjectsFromCells(cells);
   if(!objects.length){toast('🗺️ Place at least one object.');return;}
   ensure();
   let cm=existing;
   if(cm){
     cm.name=mapName;cm.theme=themeNow;cm.hazardMap=hazardNow;cm.objects=objects;
   }else{
     if(save.customMaps.length>=MAX_CUSTOM_MAPS){toast('🗺️ You have reached the 5 custom-map limit.');return;}
     cm={id:makeId(),name:mapName,theme:themeNow,hazardMap:hazardNow,objects,createdAt:new Date().toISOString()};
     save.customMaps.push(cm);
   }
   registerAll();persist();save.map=key(cm.id);persist();toast('✅ '+mapName+' saved and selected!');openMapSelector();
 });
}
function deleteCustom(id){
 ensure();
 const cm=save.customMaps.find(x=>x&&x.id===id);if(!cm)return;
 save.customMaps=save.customMaps.filter(x=>x&&x.id!==id);
 if(String(save.map)===key(id))save.map='Forest';
 registerAll();persist();openMapSelector();toast('🗑️ Custom map deleted.');
}
function openCreatorEditor(cm){renderEditor(cm||null);}

function openMapSelector(){
 ensure();registerAll();
 const builtins=Object.keys(mapDefs||{}).filter(x=>x.indexOf(PREFIX)!==0&&!!mapDefs[x]);
 let html='<div class="option"><b>🗺️ MAP CREATOR</b><div class="small">'+(save.mapCreatorUnlocked?'Unlocked — create up to 5 saved maps.':'Unlock for 100,000 coins. Cost: 100,000 • Balance: '+(Number(save.coins)||0).toLocaleString())+'</div><button type="button" id="mcUnlock" class="'+(save.mapCreatorUnlocked?'gold':'option')+'">'+(save.mapCreatorUnlocked?'➕ CREATE CUSTOM MAP':'🔒 UNLOCK — 100,000 COINS')+'</button></div>';
 html+='<div class="grid">'+builtins.map(x=>'<button type="button" class="option '+(save.map===x?'selected':'')+'" data-mc-map="'+safe(x)+'"><b>'+safe(x)+'</b></button>').join('')+'</div>';
 if(save.customMaps.length){
   html+='<div class="option"><b>💾 YOUR CUSTOM MAPS</b><div class="grid">'+save.customMaps.map(cm=>{
     const k=key(cm.id);
     return '<div class="option '+(save.map===k?'selected':'')+'"><b>'+safe(cm.name)+'</b><div class="small">'+safe(cm.theme)+' • '+(cm.objects?.length||0)+' objects</div><button type="button" class="option" data-mc-custom="'+safe(cm.id)+'">PLAY / SELECT</button> <button type="button" class="option" data-mc-edit="'+safe(cm.id)+'">EDIT</button> <button type="button" class="option" data-mc-delete="'+safe(cm.id)+'">DELETE</button></div>';
   }).join('')+'</div></div>';
 }
 openSub('🗺️ Choose Map',html);
 document.getElementById('mcUnlock')?.addEventListener('click',()=>save.mapCreatorUnlocked?openCreatorEditor(null):unlock());
 document.querySelectorAll('[data-mc-map]').forEach(b=>b.addEventListener('click',()=>{save.map=b.dataset.mcMap;persist();closeSub();}));
 document.querySelectorAll('[data-mc-custom]').forEach(b=>b.addEventListener('click',()=>{save.map=key(b.dataset.mcCustom);persist();closeSub();}));
 document.querySelectorAll('[data-mc-edit]').forEach(b=>b.addEventListener('click',()=>{const cm=save.customMaps.find(x=>x.id===b.dataset.mcEdit);if(cm)openCreatorEditor(cm);}));
 document.querySelectorAll('[data-mc-delete]').forEach(b=>b.addEventListener('click',()=>deleteCustom(b.dataset.mcDelete)));
}

function wrapMapRenderer(){
 const prev=window.drawMapDetails||drawMapDetails;
 if(window.__outlastCustomMapRendererWrapped)return;
 window.__outlastCustomMapRendererWrapped=true;
 window.drawMapDetails=function(scale=1,ox=0,oy=0){
   const map=String(save?.map||'Forest');
   if(map.indexOf(PREFIX)!==0)return prev(scale,ox,oy);
   const md=mapDefs[map]||mapDefs.Forest;
   ctx.save();ctx.beginPath();ctx.rect(ox,oy,W*scale,H*scale);ctx.clip();
   ctx.fillStyle=md.bg;ctx.fillRect(ox,oy,W*scale,H*scale);
   ctx.strokeStyle=md.grid;ctx.lineWidth=Math.max(1,1.5*scale);
   for(let x=0;x<=W;x+=160){ctx.beginPath();ctx.moveTo(ox+x*scale,oy);ctx.lineTo(ox+x*scale,oy+H*scale);ctx.stroke();}
   for(let y=0;y<=H;y+=160){ctx.beginPath();ctx.moveTo(ox,oy+y*scale);ctx.lineTo(ox+W*scale,oy+y*scale);ctx.stroke();}
   ctx.globalAlpha=.16;ctx.strokeStyle=md.accent;ctx.lineWidth=Math.max(2,4*scale);
   ctx.strokeRect(18*scale+ox,18*scale+oy,(W-36)*scale,(H-36)*scale);
   ctx.globalAlpha=.10;
   for(let x=180;x<W;x+=520){ctx.beginPath();ctx.arc(ox+x*scale,oy+H/2*scale,75*scale,0,Math.PI*2);ctx.stroke();}
   ctx.restore();
 };
 drawMapDetails=window.drawMapDetails;
}

window.OUTLAST_REGISTER_CUSTOM_MAPS=registerAll;
window.OUTLAST_MAP_CREATOR_AUDIT=function(){ensure();registerAll();return {cost:MAP_CREATOR_COST,maxSlots:MAX_CUSTOM_MAPS,unlocked:!!save.mapCreatorUnlocked,customMaps:save.customMaps.length,playable:save.customMaps.every(cm=>mapDefs[key(cm.id)]&&Array.isArray(mapObstacles[key(cm.id)]))};};

function install(){
 ensure();registerAll();wrapMapRenderer();
 window.openMapSelector=openMapSelector;
 const mapBtn=document.getElementById('mapBtn');
 if(mapBtn)mapBtn.onclick=openMapSelector;
 try{
   document.title='OUTLAST v'+VERSION;
   window.OUTLAST_BUILD=VERSION;window.OUTLAST_VERSION='v'+VERSION;
   document.querySelectorAll('[data-outlast-version]').forEach(el=>el.textContent='v'+VERSION);
   if(Array.isArray(helpArticles)&&!helpArticles.some(a=>a&&a[0]==='How do I use the Map Creator?')){
     helpArticles.unshift(['How do I use the Map Creator?','Maps','Unlock Map Creator for 100,000 coins from Choose Map. Create a named map, choose a theme and hazard, place objects on the grid, then save it. Custom maps are saved on your device and can be selected like normal maps.']);
   }
   if(Array.isArray(updates)&&!updates.some(a=>Array.isArray(a)&&String(a[0]).includes('Map Creator'))){
     updates.unshift(['v3.30.18 — Map Creator','Added a 100,000-coin permanent Map Creator unlock with saved custom maps, theme/hazard selection, object placement, editing, deletion, and playable custom arenas.']);
   }
 }catch(_){}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
setTimeout(install,0);
})();