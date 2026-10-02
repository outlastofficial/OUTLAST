/* OUTLAST v3.27.47 — Settings Expansion + Bug Guard */
(function(){
  'use strict';
  const V='3.27.47';
  function s(){ return (window.save&&save.settings)||{}; }
  function persistSafe(){ try{ if(typeof persist==='function') persist(); }catch(_){} }
  function toggle(key,def=true){ if(!save.settings)save.settings={}; save.settings[key]=save.settings[key]===undefined?!def:!save.settings[key]; persistSafe(); render(); }
  function render(){
    const sub=document.getElementById('subContent'), panel=document.getElementById('subPanel');
    if(!sub||!panel)return;
    const q=s();
    const row=(id,label,value)=>'<button type="button" class="option" id="'+id+'">'+label+': '+(value?'ON':'OFF')+'</button>';
    sub.innerHTML='<h2>⚙️ Settings</h2>'+
      '<div class="small" style="margin-bottom:12px">Personal settings are saved on this device.</div>'+
      '<div class="grid">'+
      row('olSetShake2','Screen Shake',q.shake!==false)+
      row('olSetDamage2','Damage Numbers',q.damageNumbers!==false)+
      row('olSetMotion2','Reduced Motion',!!q.reducedMotion)+
      row('olSetFlash2','Reduced Flash Effects',!!q.reducedFlash)+
      row('olSetConfirm2','Confirm Run Exit',q.confirmExit!==false)+
      row('olSetAutosave2','Autosave',q.autosave!==false)+
      row('olSetHints2','Gameplay Hints',q.hints!==false)+
      row('olSetChat2','Chat Notifications',q.chatNotifications!==false)+
      '</div>'+
      '<div class="option" style="margin-top:12px"><b>Display</b><div class="small">Fullscreen, control mode, joystick, and UI scaling stay in the existing settings.</div><button type="button" class="menu-btn" id="olSetFull2">🖥️ Toggle Fullscreen</button></div>'+
      '<div class="option"><b>Settings Reset</b><div class="small">Restore only gameplay/display preferences. Account/login data is not changed.</div><button type="button" class="danger menu-btn" id="olSetReset2">↩️ Reset Settings Only</button></div>';
    panel.style.display='flex';
    const bind=(id,fn)=>{const b=document.getElementById(id);if(b)b.onclick=e=>{e.preventDefault();e.stopPropagation();fn();return false;}};
    bind('olSetShake2',()=>toggle('shake',true));
    bind('olSetDamage2',()=>toggle('damageNumbers',true));
    bind('olSetMotion2',()=>toggle('reducedMotion',false));
    bind('olSetFlash2',()=>toggle('reducedFlash',false));
    bind('olSetConfirm2',()=>toggle('confirmExit',true));
    bind('olSetAutosave2',()=>toggle('autosave',true));
    bind('olSetHints2',()=>toggle('hints',true));
    bind('olSetChat2',()=>toggle('chatNotifications',true));
    bind('olSetFull2',()=>{if(document.fullscreenElement)document.exitFullscreen?.();else document.documentElement.requestFullscreen?.();});
    bind('olSetReset2',()=>{save.settings={shake:true,damageNumbers:true,reducedMotion:false,reducedFlash:false,confirmExit:true,autosave:true,hints:true,chatNotifications:true};persistSafe();render();});
  }
  window.openSettingsExpanded=render;
  function wire(){
    const b=document.getElementById('settingsNewBtn');
    if(b){b.onclick=e=>{e.preventDefault();e.stopPropagation();render();};}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire,{once:true});else wire();
  setTimeout(wire,250);setTimeout(wire,1000);
  try{ if(window.save&&save.settings){ save.settings.autosave=save.settings.autosave!==false; persistSafe(); } }catch(_){}
})();
