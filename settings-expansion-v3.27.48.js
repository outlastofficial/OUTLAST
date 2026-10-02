/* OUTLAST v3.27.48 — Settings reliability rebuild */
(function(){
  'use strict';
  const defaults={shake:true,damageNumbers:true,reducedMotion:false,reducedFlash:false,confirmExit:true,autosave:true,hints:true,chatNotifications:true};
  function get(){ if(!window.save) return {}; save.settings=save.settings||{}; for(const k in defaults) if(save.settings[k]===undefined) save.settings[k]=defaults[k]; return save.settings; }
  function persistSafe(){try{if(typeof persist==='function')persist();}catch(_){}}
  function render(){
    const sub=document.getElementById('subContent'),panel=document.getElementById('subPanel'); if(!sub||!panel)return;
    const q=get();
    const toggle=(id,label,key)=>'<button type="button" class="option" id="'+id+'">'+label+': '+(q[key]?'ON':'OFF')+'</button>';
    sub.innerHTML='<h2>⚙️ Settings</h2><div class="small" style="margin-bottom:12px">Gameplay and display preferences are saved on this device.</div>'+
      '<div class="grid">'+
      toggle('ol48Shake','Screen Shake','shake')+toggle('ol48Damage','Damage Numbers','damageNumbers')+
      toggle('ol48Motion','Reduced Motion','reducedMotion')+toggle('ol48Flash','Reduced Flash Effects','reducedFlash')+
      toggle('ol48Confirm','Confirm Run Exit','confirmExit')+toggle('ol48Auto','Autosave','autosave')+
      toggle('ol48Hints','Gameplay Hints','hints')+toggle('ol48Chat','Chat Notifications','chatNotifications')+
      '</div><div class="option" style="margin-top:12px"><b>Display</b><div class="small">Fullscreen and control/joystick options remain available below.</div>'+
      '<button type="button" class="menu-btn" id="ol48Full">🖥️ Toggle Fullscreen</button></div>'+
      '<div class="option"><b>Settings Reset</b><div class="small">Only gameplay/display preferences are reset. Login/account data is untouched.</div>'+
      '<button type="button" class="danger menu-btn" id="ol48Reset">↩️ Reset Settings Only</button></div>';
    panel.style.display='flex';
    const bind=(id,fn)=>{const b=document.getElementById(id);if(b)b.onclick=e=>{e.preventDefault();e.stopPropagation();fn();return false;}};
    [['ol48Shake','shake'],['ol48Damage','damageNumbers'],['ol48Motion','reducedMotion'],['ol48Flash','reducedFlash'],['ol48Confirm','confirmExit'],['ol48Auto','autosave'],['ol48Hints','hints'],['ol48Chat','chatNotifications']].forEach(([id,key])=>bind(id,()=>{q[key]=!q[key];persistSafe();render();}));
    bind('ol48Full',()=>{if(document.fullscreenElement)document.exitFullscreen?.();else document.documentElement.requestFullscreen?.();});
    bind('ol48Reset',()=>{save.settings={...defaults};persistSafe();render();});
  }
  window.openSettingsSafe=render;
  window.openSettingsExpanded=render;
  function wire(){
    const b=document.getElementById('settingsNewBtn');
    if(!b)return;
    b.onclick=e=>{e.preventDefault();e.stopImmediatePropagation();render();return false;};
    b.onpointerup=e=>{e.preventDefault();e.stopImmediatePropagation();render();};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire,{once:true});else wire();
  setTimeout(wire,50);setTimeout(wire,250);setTimeout(wire,1000);
})();
