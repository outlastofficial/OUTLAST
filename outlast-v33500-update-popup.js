/* OUTLAST v3.35.0 — real player-facing update popup */
(function(){
  'use strict';

  const VERSION='3.35.0';
  const KEY='outlastUpdatePopupV3350';
  const POPUP_ID='outlastV3350UpdatePopup';

  function storage(){
    try{return window.localStorage;}catch(_){return null;}
  }
  function seen(){
    const s=storage();
    try{return s?.getItem(KEY)==='1';}catch(_){return false;}
  }
  function markSeen(){
    const s=storage();
    try{s?.setItem(KEY,'1');}catch(_){}
  }
  function install(){
    if(document.getElementById(POPUP_ID))return document.getElementById(POPUP_ID);

    const style=document.createElement('style');
    style.id='outlast-v3350-update-popup-style';
    style.textContent=
      '#'+POPUP_ID+'{position:fixed!important;inset:0!important;display:none;align-items:center!important;justify-content:center!important;padding:18px!important;box-sizing:border-box!important;background:rgba(3,7,12,.86)!important;backdrop-filter:blur(7px)!important;z-index:300000!important;font-family:Arial,sans-serif!important}'+
      '#'+POPUP_ID+' .v3350-card{width:min(720px,94vw)!important;max-height:86vh!important;overflow:auto!important;background:linear-gradient(145deg,#172534,#0b1219)!important;border:1px solid #4d7595!important;border-radius:24px!important;padding:26px!important;box-sizing:border-box!important;box-shadow:0 30px 100px rgba(0,0,0,.72)!important;color:#fff!important}'+
      '#'+POPUP_ID+' .v3350-kicker{color:#8ed0ff!important;font-size:12px!important;font-weight:900!important;letter-spacing:.15em!important;text-transform:uppercase!important;margin-bottom:8px!important}'+
      '#'+POPUP_ID+' h2{font-size:31px!important;margin:0 0 8px!important}'+
      '#'+POPUP_ID+' p{color:#b9c9d7!important;line-height:1.5!important;margin:8px 0!important}'+
      '#'+POPUP_ID+' ul{padding-left:22px!important;margin:16px 0!important}'+
      '#'+POPUP_ID+' li{margin:9px 0!important;color:#dce8f1!important}'+
      '#'+POPUP_ID+' .v3350-actions{display:flex!important;justify-content:flex-end!important;margin-top:20px!important}'+
      '#'+POPUP_ID+' button{border:0!important;border-radius:11px!important;padding:12px 20px!important;background:#3da96b!important;color:#fff!important;font:700 16px Arial!important;cursor:pointer!important;box-shadow:0 4px 0 #23673f!important}';

    document.head.appendChild(style);

    const root=document.createElement('div');
    root.id=POPUP_ID;
    root.setAttribute('role','dialog');
    root.setAttribute('aria-modal','true');
    root.setAttribute('aria-label','OUTLAST v3.35.0 update');
    root.innerHTML=
      '<div class="v3350-card">'+
        '<div class="v3350-kicker">OUTLAST • NEW UPDATE</div>'+
        '<h2>12 Core Content Update</h2>'+
        '<p><b>v3.35.0</b> is now live. New content systems have been added to OUTLAST.</p>'+
        '<ul>'+
          '<li>Expanded combat and weapon content</li>'+
          '<li>More enemies, bosses, world content, and events</li>'+
          '<li>Expanded progression, upgrades, rewards, and objectives</li>'+
          '<li>New modes, modifiers, themes, and gameplay combinations</li>'+
          '<li>Additional support for saves, leaderboards, chat, settings, tutorial, and How To</li>'+
        '</ul>'+
        '<p class="small">This update popup is player-facing only.</p>'+
        '<div class="v3350-actions"><button type="button" id="outlastV3350UpdateGotIt">GOT IT</button></div>'+
      '</div>';

    document.body.appendChild(root);
    const close=()=>{
      root.style.display='none';
      markSeen();
    };
    root.querySelector('#outlastV3350UpdateGotIt')?.addEventListener('click',close);
    root.addEventListener('click',e=>{if(e.target===root)close();});
    root.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close();}});
    return root;
  }

  function show(force=false){
    const root=install();
    if(!root)return false;
    if(!force && seen())return false;
    root.style.display='flex';
    setTimeout(()=>root.querySelector('#outlastV3350UpdateGotIt')?.focus(),0);
    return true;
  }

  function autoShow(){
    if(seen())return;
    show(false);
  }

  window.OUTLAST_UPDATE_POPUP={
    version:VERSION,
    storageKey:KEY,
    install,
    show,
    autoShow
  };

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>setTimeout(autoShow,700),{once:true});
  }else{
    setTimeout(autoShow,700);
  }
})();