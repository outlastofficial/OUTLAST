/* OUTLAST v3.27.30 — isolated Admin Event Preview visual layer */
(function(){
  'use strict';
  function install(){
    if(typeof window.adminEventPreview!=='function'||typeof window.openSub!=='function')return;
    window.adminEventPreview=function(){
      if(typeof isAdmin==='function'&&!isAdmin())return;
      const entries=Object.entries(window.worldEvents||{});
      const name=entries[0]?.[0]||'Nightfall Event';
      const desc=entries[0]?.[1]||'Upcoming event';
      const safe=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
      const launchMs=Date.parse('2026-10-03T11:00:00-04:00');
      const countdown=()=>{
        const ms=launchMs-Date.now();
        if(ms<=0)return 'LIVE';
        const total=Math.floor(ms/1000),d=Math.floor(total/86400),h=Math.floor(total%86400/3600),m=Math.floor(total%3600/60),s=total%60;
        return (d?d+'d ':'')+String(h).padStart(2,'0')+'h '+String(m).padStart(2,'0')+'m '+String(s).padStart(2,'0')+'s';
      };
      const visual='<div class="option" style="padding:14px;background:linear-gradient(145deg,#101e2a,#0a1219);border:1px solid #315b73">'+
        '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><b style="font-size:20px">🌎 '+safe(name)+'</b><span class="small" id="adminPreviewCountdown">'+countdown()+'</span></div>'+
        '<div class="small" style="margin-top:6px">'+safe(desc)+'</div>'+
        '<div style="margin-top:12px;padding:11px;border:1px solid #29475b;border-radius:10px;background:#08121a"><b>📡 EVENT PROTOCOL</b><div class="small" style="margin-top:5px">Countdown • Community Signal • Investigation • Missions</div></div>'+
        '<div class="grid" style="margin-top:9px">'+
        '<div class="option"><b>📻 Broadcasts</b><div class="small">Incoming transmission UI</div></div>'+
        '<div class="option"><b>🔎 Investigation</b><div class="small">Five-clue interface</div></div>'+
        '<div class="option"><b>🎯 Missions</b><div class="small">Progress and reward UI</div></div>'+
        '<div class="option"><b>🛒 Event Shop</b><div class="small">Limited event cosmetics</div></div></div>'+
        '<div style="margin-top:9px;padding:12px;border:1px solid #7c3b45;border-radius:10px;background:linear-gradient(145deg,#2a1015,#101820)"><b style="font-size:17px">🎃 RIFT PUMPKIN</b><div class="small" style="margin-top:4px">Event boss warning and boss HUD visual treatment</div><div style="height:8px;background:#071017;border:1px solid #263e50;border-radius:99px;overflow:hidden;margin-top:7px"><span style="display:block;width:72%;height:100%;background:#4ca7cc"></span></div></div>'+
        '</div>'+
        '<div class="small" style="margin-top:10px;color:#9eb8ca">VISUAL PREVIEW ONLY • Does not activate, save, broadcast, or alter the live event.</div>';
      const cards=entries.length?entries.map(([n,d])=>'<button class="option" style="text-align:left" data-admin-preview-event="'+safe(n)+'"><b>🌎 '+safe(n)+'</b><div class="small">'+safe(d)+'</div></button>').join(''):'<div class="option">No upcoming events are configured.</div>';
      openSub('👁️ Event Preview',visual+'<div class="small" style="margin:12px 0 7px"><b>EVENTS</b></div><div class="grid">'+cards+'</div><div id="adminEventPreviewResult" class="option" style="margin-top:12px"><b>Select an event to inspect its preview.</b></div>');
      document.getElementById('subContent')?.querySelectorAll('[data-admin-preview-event]').forEach(btn=>btn.addEventListener('click',()=>{
        const n=btn.dataset.adminPreviewEvent||'Event',d=(window.worldEvents&&window.worldEvents[n])||'No description available.';
        const r=document.getElementById('adminEventPreviewResult');
        if(r)r.innerHTML='<b style="font-size:18px">🌎 '+safe(n)+'</b><div class="small" style="margin-top:6px">'+safe(d)+'</div><div class="small" style="margin-top:9px;color:#f2d06b">PREVIEW MODE — live event state unchanged.</div>';
      }));
    };
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();