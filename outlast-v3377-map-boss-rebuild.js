/* OUTLAST v3.37.7 — Rebuilt Map Picker + Boss Spawn Retry */
(function(){
'use strict';
const VERSION='3.37.7';
const PREFIX='CustomMap:';
const BUILTIN_MAPS=['Forest','Desert','Snow','Lava','City','Hospital','Laboratory','Subway','Prison','MilitaryBase','RuinedTown','Harbor','Bunker','Swamp','Skyscraper','Wasteland','Seizure','Ribhouse'];
const MAP_DESCRIPTIONS={
 Forest:'Woodland cover, fallen logs and rocky clearings.',Desert:'Sandstone ruins, cacti and wide sightlines.',
 Snow:'Ice shelves, frozen lanes and snow banks.',Lava:'Volcanic ground with glowing fissures.',
 City:'Street cover, wreckage and urban lanes.',Hospital:'Clinical corridors and emergency-room landmarks.',
 Laboratory:'Experimental structures and cool-lit lanes.',Subway:'Tunnel routes, platforms and rail hazards.',
 Prison:'Reinforced cover and narrow choke points.',MilitaryBase:'Fortifications, barriers and a defense line.',
 RuinedTown:'Collapsed buildings and broken streets.',Harbor:'Cargo routes, waterfront lanes and containers.',
 Bunker:'Reinforced structures and compact corridors.',Swamp:'Murky ground and tangled natural cover.',
 Skyscraper:'Modern tower structures and open lanes.',Wasteland:'Scorched terrain and scattered wreckage.',
 Seizure:'High-contrast neon geometry and a strange pulsing palette.',Ribhouse:'Rib-like structures and a dark, ember-lit arena.'
};
const esc=v=>String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const currentSave=()=>{try{return typeof save!=='undefined'&&save?save:null}catch(_){return null}};
const definitions=()=>{try{return typeof mapDefs!=='undefined'&&mapDefs?mapDefs:{}}catch(_){return {}}};
let previousPicker=null,installed=false;
function allBuiltinMaps(){
 const defs=definitions();
 return [...new Set([...BUILTIN_MAPS,...Object.keys(defs).filter(k=>k&&k.indexOf(PREFIX)!==0)])]
  .filter(k=>BUILTIN_MAPS.includes(k)||!!defs[k]);
}
function mapName(key){return ({MilitaryBase:'Military Base',RuinedTown:'Ruined Town'})[key]||key;}
function showToast(text){try{if(typeof toast==='function')toast(text)}catch(_){}}
function selectMap(key){
 key=String(key||'');
 const s=currentSave();
 if(!s||!key)return false;
 let custom=null;
 if(key.indexOf(PREFIX)===0){
  custom=(Array.isArray(s.customMaps)?s.customMaps:[]).find(cm=>cm&&PREFIX+String(cm.id)===key)||null;
  if(!custom){showToast('That saved custom map is missing. Reopen Choose Map and try again.');return false;}
  try{window.OUTLAST_REGISTER_CUSTOM_MAPS?.()}catch(_){}
 }else if(!BUILTIN_MAPS.includes(key)&&!Object.prototype.hasOwnProperty.call(definitions(),key)){
  showToast('That map is not available yet. Reopen Choose Map and try again.');return false;
 }
 s.map=key;
 try{if(typeof persist==='function')persist()}catch(err){window.OUTLAST_MAP_SELECT_PERSIST_ERROR=String(err)}
 try{if(typeof updateMenuSummary==='function')updateMenuSummary()}catch(_){}
 try{if(typeof closeSub==='function')closeSub()}catch(_){}
 showToast('🗺️ Map selected: '+(custom?.name||mapName(key)));
 return true;
}
function tile(key,current){
 const selected=String(current||'Forest')===key;
 const desc=MAP_DESCRIPTIONS[key]||definitions()[key]?.desc||'Unique terrain, obstacles and hazards.';
 return '<button type="button" class="option outlast3377-map-card'+(selected?' selected':'')+'" data-outlast3377-map="'+esc(key)+'" aria-pressed="'+(selected?'true':'false')+'"><b>'+esc(mapName(key))+'</b><small>'+esc(desc)+'</small>'+(selected?'<strong>✓ SELECTED</strong>':'<span class="outlast3377-map-hint">SELECT MAP</span>')+'</button>';
}
function openMapPicker(){
 const s=currentSave();
 try{window.OUTLAST_REGISTER_CUSTOM_MAPS?.()}catch(_){}
 const active=s?String(s.map||'Forest'):'Forest';
 const builtins=allBuiltinMaps();
 const custom=Array.isArray(s?.customMaps)?s.customMaps.slice(0,5):[];
 const customTiles=custom.map(cm=>{
  const key=PREFIX+String(cm.id||''),selected=active===key;
  return '<button type="button" class="option outlast3377-map-card'+(selected?' selected':'')+'" data-outlast3377-map="'+esc(key)+'" aria-pressed="'+(selected?'true':'false')+'"><b>🧩 '+esc(cm.name||'Custom Map')+'</b><small>'+esc(cm.theme||'Forest')+' theme • '+(Array.isArray(cm.objects)?cm.objects.length:0)+' objects</small>'+(selected?'<strong>✓ SELECTED</strong>':'<span class="outlast3377-map-hint">SELECT MAP</span>')+'</button>';
 }).join('');
 const html='<div class="outlast3377-map-picker"><div class="option outlast3377-map-current"><div><b>Current Map</b><small>The selected map is saved for your next run.</small></div><strong>'+esc(mapName(active))+'</strong></div><div class="outlast3377-map-section"><b>BUILT-IN MAPS • '+builtins.length+'</b><small>Choose a map below, then press Play. Seizure and Ribhouse are included.</small></div><div class="outlast3377-map-grid">'+builtins.map(k=>tile(k,active)).join('')+'</div>'+(custom.length?'<div class="outlast3377-map-section"><b>YOUR CUSTOM MAPS</b><small>Saved maps are selectable here too.</small></div><div class="outlast3377-map-grid">'+customTiles+'</div>':'<div class="option outlast3377-map-custom"><b>Want to make your own map?</b><small>Unlock Map Creator for 100,000 coins to create, save and edit custom maps.</small><button type="button" class="gold" data-outlast3377-create-map>OPEN MAP CREATOR</button></div>')+(custom.length?'<div class="option outlast3377-map-custom"><b>Create or edit a custom map</b><small>Open the Map Creator to manage your saved arenas.</small><button type="button" class="gold" data-outlast3377-create-map>OPEN MAP CREATOR</button></div>':'')+'</div>';
 try{if(typeof openSub==='function'){openSub('🗺️ Choose Map',html);return;}throw new Error('Map menu is not ready');}
 catch(err){window.OUTLAST_MAP_PICKER_ERROR=String(err);const host=document.getElementById('subContent');if(host){host.innerHTML=html;host.style.display='block';}}
}
function openLegacyCreator(){
 try{if(typeof previousPicker==='function'){previousPicker.call(window);return;}}
 catch(err){window.OUTLAST_MAP_CREATOR_OPEN_ERROR=String(err)}
 showToast('Map Creator is still loading. Close this panel and reopen Choose Map.');
}
function addStyles(){
 if(document.getElementById('outlast3377-map-picker-css'))return;
 const style=document.createElement('style');style.id='outlast3377-map-picker-css';
 style.textContent='.outlast3377-map-picker{display:grid;gap:12px}.outlast3377-map-current{display:flex;justify-content:space-between;align-items:center;gap:12px}.outlast3377-map-current small,.outlast3377-map-section small,.outlast3377-map-custom small{display:block;margin-top:4px;color:#9fb5c5;line-height:1.4}.outlast3377-map-current strong{color:#9bd7ff;font-size:14px}.outlast3377-map-section{display:grid;gap:4px;padding:0 2px}.outlast3377-map-section>b{font-size:12px;letter-spacing:.06em;color:#a6d9ff}.outlast3377-map-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}.outlast3377-map-card{display:flex!important;flex-direction:column;align-items:flex-start;gap:6px;min-height:108px;text-align:left;cursor:pointer;border:1px solid #355064!important;border-radius:12px!important;background:#111e28!important;color:#f4f8fb!important;padding:12px!important;white-space:normal}.outlast3377-map-card b{font-size:13px}.outlast3377-map-card small{color:#a6bac8;line-height:1.35;font-size:11px}.outlast3377-map-card strong{margin-top:auto;color:#95e5bb;font-size:10px}.outlast3377-map-hint{margin-top:auto;color:#94b6cc;font-size:10px;font-weight:800}.outlast3377-map-card.selected{border-color:#70c9ff!important;box-shadow:0 0 0 1px #70c9ff inset;background:#142b3a!important}.outlast3377-map-custom{display:grid;gap:5px}.outlast3377-map-custom .gold{justify-self:start}@media(max-width:760px){.outlast3377-map-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:460px){.outlast3377-map-grid{grid-template-columns:1fr}.outlast3377-map-card{min-height:82px}}';
 document.head.appendChild(style);
}
function installReleaseText(){
 try{
  if(typeof updates!=='undefined'&&Array.isArray(updates)&&!updates.some(x=>Array.isArray(x)&&String(x[0]).includes('v3.37.7')))updates.unshift(['v3.37.7 — Rebuilt Map Picker + Boss Spawn Retries','Rebuilt Choose Map with a dedicated click route for every built-in map and saved custom map. Seizure and Ribhouse are selectable, current selection is confirmed and saved, and the boss scheduler retries failed spawns with a first boss at about 15 seconds and later bosses about 30 seconds after each defeat.']);
  if(typeof helpArticles!=='undefined'&&Array.isArray(helpArticles)&&!helpArticles.some(x=>Array.isArray(x)&&String(x[0]).includes('How do I select any new map?')))helpArticles.unshift(['How do I select any new map?','Maps','Open Play → Choose Map. Pick any built-in map, including Seizure and Ribhouse, or select one of your saved custom maps. The tile will show SELECTED, a confirmation toast appears, and the choice is saved for the next run. To create or edit custom maps, use OPEN MAP CREATOR.']);
  if(typeof helpArticles!=='undefined'&&Array.isArray(helpArticles)&&!helpArticles.some(x=>Array.isArray(x)&&String(x[0]).includes('When do bosses spawn now?')))helpArticles.unshift(['When do bosses spawn now?','Bosses & Runs','The first scheduled boss should appear after about 15 seconds. Each later boss appears about 30 seconds after the previous boss is defeated. Only one boss can be active at a time. If a scheduled spawn fails, the game retries about once per second instead of leaving the boss timer stuck at zero.']);
 }catch(_){}
}
function setVersion(){
 window.OUTLAST_BUILD=VERSION;window.OUTLAST_VERSION='v'+VERSION;document.title='OUTLAST v'+VERSION;
 document.querySelectorAll('[data-outlast-version]').forEach(el=>el.textContent='v'+VERSION);
 const title=document.querySelector('#menu .menu-chip');if(title)title.textContent='v'+VERSION+' • SURVIVOR HUB';
 const a=document.querySelector('meta[name="outlast-build"]');if(a)a.content=VERSION;
 const b=document.querySelector('meta[name="build-version"]');if(b)b.content=VERSION;
}
function install(){
 if(installed)return;installed=true;
 previousPicker=window.openMapSelector;
 try{addStyles()}catch(err){window.OUTLAST_MAP_PICKER_STYLE_ERROR=String(err)}
 setVersion();installReleaseText();
 window.openMapSelector=openMapPicker;window.selectMap=selectMap;
 const mapBtn=document.getElementById('mapBtn');if(mapBtn)mapBtn.onclick=openMapPicker;
 document.addEventListener('click',function(e){
  const target=e.target,choice=target.closest?.('button[data-outlast3377-map]');
  if(choice){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();selectMap(choice.getAttribute('data-outlast3377-map'));return;}
  const create=target.closest?.('button[data-outlast3377-create-map]');
  if(create){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openLegacyCreator();}
 },true);
 window.OUTLAST_MAP_SELECTION_READY=true;
 window.OUTLAST_MAP_SELECTION_AUDIT=function(){const s=currentSave(),defs=definitions();return {version:VERSION,ready:true,currentMap:s?String(s.map||'Forest'):'NO_SAVE',builtInMapCount:allBuiltinMaps().length,savedCustomMapCount:Array.isArray(s?.customMaps)?s.customMaps.length:0,registeredMapCount:Object.keys(defs).filter(k=>k.indexOf(PREFIX)!==0).length};};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
setTimeout(install,0);
})();