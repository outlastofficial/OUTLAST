/* OUTLAST v3.29.1 — visible map/gameplay sync (no Start Run changes) */
(function(){
'use strict';
if(window.__outlast3291MapBossDisplay)return;
window.__outlast3291MapBossDisplay=true;

function esc(v){return String(v??'').replace(/[&<>"]/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));}

function mapDescription(name){
  const md=(typeof mapDefs!=='undefined'&&mapDefs[name])||{};
  if(md.desc)return md.desc;
  const wz=typeof worldZones!=='undefined'
    ? Object.values(worldZones).find(z=>z&&z.map===name)
    : null;
  return wz?.desc || 'Distinct environment with its own hazards and obstacles.';
}

function mapZone(name){
  const wz=typeof worldZones!=='undefined'
    ? Object.entries(worldZones).find(([,z])=>z&&z.map===name)
    : null;
  return wz ? wz[0] : '';
}

function openMapPreview(){
  const names=Object.keys(typeof mapDefs!=='undefined'?mapDefs:{});
  const selected=save?.map||names[0]||'Forest';
  const cards=names.map(name=>{
    const md=mapDefs[name]||{};
    const hz=(typeof mapHazards!=='undefined'&&mapHazards[name])||null;
    const obs=Array.isArray(mapObstacles?.[name])?mapObstacles[name].length:0;
    const zone=mapZone(name);
    const active=name===selected;
    return '<button type="button" class="option '+(active?'selected':'')+'" data-map-preview="'+esc(name)+'">'+
      '<b>🗺️ '+esc(name)+'</b>'+
      '<div class="small">'+esc(mapDescription(name))+'</div>'+
      '<div class="small" style="margin-top:5px">'+
        (hz?'Hazard: '+esc(hz.name)+' • ':'')+
        (zone?'Zone: '+esc(zone)+' • ':'')+
        obs+' solid objects'+
      '</div>'+
      (active?'<div class="small" style="margin-top:5px;color:#7ee7a0">✓ CURRENT MAP</div>':'')+
      '</button>';
  }).join('');

  openSub('🗺️ Map Preview',
    '<div class="option" style="margin-bottom:10px">'+
      '<b>Current Map: '+esc(selected)+'</b>'+
      '<div class="small">'+esc(mapDescription(selected))+'</div>'+
    '</div>'+
    '<div class="grid" id="outlast3291MapGrid">'+cards+'</div>'
  );

  document.getElementById('outlast3291MapGrid')?.addEventListener('click',e=>{
    const b=e.target.closest('[data-map-preview]');
    if(!b)return;
    const name=b.getAttribute('data-map-preview');
    if(!mapDefs?.[name])return;
    save.map=name;
    persist();
    toast('🗺️ Map selected: '+name);
    openMapPreview();
  });
}

function installMapButton(){
  const btn=document.getElementById('mapBtn');
  if(!btn)return false;
  btn.onclick=(e)=>{e.preventDefault();e.stopPropagation();openMapPreview();};
  btn.setAttribute('aria-label','Choose Map and view map details');
  return true;
}

function installBossHud(){
  if(document.getElementById('outlast3291BossHud'))return true;
  const style=document.createElement('style');
  style.id='outlast3291BossHudStyle';
  style.textContent=
    '#outlast3291BossHud{position:fixed;right:18px;bottom:16px;z-index:70;display:none;align-items:center;gap:9px;min-width:150px;padding:9px 12px;box-sizing:border-box;border:1px solid rgba(105,192,255,.38);border-radius:12px;background:rgba(5,10,15,.90);box-shadow:0 10px 28px rgba(0,0,0,.28);pointer-events:none;font-family:Arial,sans-serif}'+
    '#outlast3291BossHud .label{font-size:10px;font-weight:900;letter-spacing:.12em;color:#8fb6cf}'+
    '#outlast3291BossHud .time{font-size:18px;font-weight:900;color:#fff;min-width:55px;text-align:right}'+
    '#outlast3291BossHud .state{font-size:10px;font-weight:800;color:#ffcf70;white-space:nowrap}'+
    '@media(max-width:760px){#outlast3291BossHud{right:10px;bottom:80px;min-width:138px;padding:8px 10px}#outlast3291BossHud .time{font-size:16px}}';
  document.head.appendChild(style);
  const hud=document.createElement('div');
  hud.id='outlast3291BossHud';
  hud.setAttribute('aria-live','polite');
  hud.innerHTML='<span class="label">BOSS</span><span class="time" id="outlast3291BossTime">00:00</span><span class="state" id="outlast3291BossState">NEXT</span>';
  document.body.appendChild(hud);
  return true;
}

function updateBossHud(){
  const hud=document.getElementById('outlast3291BossHud');
  const timeEl=document.getElementById('outlast3291BossTime');
  const stateEl=document.getElementById('outlast3291BossState');
  if(!hud||!timeEl||!stateEl)return;
  const running=!!game?.running&&!game?.over;
  if(!running){hud.style.display='none';return;}
  const every=Number(game?.stats?.bossEvery||0);
  const clock=Number(game?.bossClock||0);
  if(!(every>0)||!Number.isFinite(clock)){hud.style.display='none';return;}
  const remaining=Math.max(0,every-Math.max(0,clock));
  const min=String(Math.floor(remaining/60)).padStart(2,'0');
  const sec=String(Math.ceil(remaining%60)).padStart(2,'0');
  timeEl.textContent=min+':'+sec;
  stateEl.textContent=remaining<=1?'INCOMING':'NEXT';
  stateEl.style.color=remaining<=10?'#ff8f72':'#ffcf70';
  hud.style.display='flex';
}

function audit(){
  return {
    mapButton:!!document.getElementById('mapBtn'),
    mapPreviewData:typeof mapDefs!=='undefined'&&typeof mapHazards!=='undefined'&&typeof mapObstacles!=='undefined',
    bossHud:!!document.getElementById('outlast3291BossHud')
  };
}

function boot(){
  installMapButton();
  installBossHud();
  updateBossHud();
  setInterval(updateBossHud,250);
  window.__outlast3291Audit=audit;
  if(typeof updates!=='undefined'&&Array.isArray(updates)&&!updates.some(x=>Array.isArray(x)&&String(x[0]).includes('v3.29.1 — Visible Map Sync'))){
    updates.unshift(['v3.29.1 — Visible Map Sync','Updated the map area with live map details and restored the in-run boss countdown display.']);
  }
  if(typeof helpArticles!=='undefined'&&Array.isArray(helpArticles)&&!helpArticles.some(x=>Array.isArray(x)&&String(x[0]).includes('map details'))){
    helpArticles.unshift(['How do map details work?','Maps','The Map area now shows each available map with its hazard, world zone, and solid-object count. Select a map there before starting a run.']);
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
[0,250,1000,2500].forEach(ms=>setTimeout(()=>{try{installMapButton();installBossHud();updateBossHud();}catch(_){ }},ms));
})();
