/* OUTLAST v3.28.1 — game viewport/recovery + version authority */
(function(){
  'use strict';
  if(window.__outlastRecoveryAuthority3281)return;
  window.__outlastRecoveryAuthority3281=true;
  const VERSION='v3.30.10';

  function menuVisible(){
    const el=document.getElementById('menu');
    return !!el && getComputedStyle(el).display!=='none';
  }
  function showMenu(){
    const menu=document.getElementById('menu');
    if(menu)menu.style.display='flex';
    try{document.getElementById('subPanel').style.display='none';}catch(_){}
    try{hideGameOverActions?.();}catch(_){}
    try{updateMenuSummary?.();}catch(_){}
  }
  function syncVersion(){
    document.querySelectorAll('.menu-chip').forEach(el=>{
      if(/SURVIVOR HUB/i.test(el.textContent||''))el.textContent=VERSION+' • SURVIVOR HUB';
    });
    document.querySelectorAll('[data-outlast-version]').forEach(el=>el.textContent=VERSION);
    document.querySelectorAll('#outlastQualityBadge').forEach(el=>el.textContent=VERSION+' • QUALITY');
    const meta=document.querySelector('meta[name="outlast-build"]');if(meta)meta.content=VERSION.slice(1);
    const meta2=document.querySelector('meta[name="build-version"]');if(meta2)meta2.content=VERSION.slice(1);
    document.title='OUTLAST '+VERSION;
    window.OUTLAST_BUILD=VERSION.slice(1);
    window.OUTLAST_VERSION=VERSION;
  }

  function syncQualityBadge(){
    let badge=document.getElementById('outlastQualityBadge');
    if(!badge){
      badge=document.createElement('div');
      badge.id='outlastQualityBadge';
      document.body.appendChild(badge);
    }
    badge.textContent=VERSION+' • QUALITY';
    // Quality is a menu/recovery indicator, not an in-run HUD element.
    badge.style.display=menuVisible()?'block':'none';
  }

  function safeViewport(){
    const canvas=document.getElementById('game');
    if(!canvas||typeof game==='undefined')return;

    let running=!!game.running;
    if(running){
      // A running game must always have a valid player and camera.
      if(!game.player||!Number.isFinite(Number(game.player.x))||!Number.isFinite(Number(game.player.y))){
        game.running=false;
        game.paused=false;
        game.over=true;
        try{fatalErrorShown=false;fatalGameError='';}catch(_){}
        showMenu();
        try{toast?.('⚠️ Run recovered safely. Your menu is available again.');}catch(_){}
        return;
      }

      const px=Number(game.player.x),py=Number(game.player.y);
      game.camera=game.camera||{x:0,y:0};
      const maxX=Math.max(0,Number(W)-Number(CW)),maxY=Math.max(0,Number(H)-Number(CH));
      if(!Number.isFinite(Number(game.camera.x)))game.camera.x=0;
      if(!Number.isFinite(Number(game.camera.y)))game.camera.y=0;
      // Re-center/clamp the camera so a bad camera state cannot leave a blank map.
      game.camera.x=Math.max(0,Math.min(maxX,px-Number(CW)/2));
      game.camera.y=Math.max(0,Math.min(maxY,py-Number(CH)/2));
      canvas.style.display='block';
      const menu=document.getElementById('menu');
      if(menu)menu.style.display='none';
      document.body.classList.add('outlast-in-game');
      document.body.classList.remove('menu-open');
      syncQualityBadge();
      try{if(typeof draw==='function')draw();}catch(_){}
      return;
    }

    // Prevent the exact blank-screen state: the menu must return whenever a run
    // has stopped without a game-over/fatal overlay taking ownership of the screen.
    if(!game.endScreen&&!game.over&&!fatalErrorShown&&!menuVisible()){
      showMenu();
    }
    document.body.classList.remove('outlast-in-game');
    syncQualityBadge();
  }

  function addDocs(){
    try{
      if(Array.isArray(updates)&&!updates.some(x=>Array.isArray(x)&&String(x[0]).includes('Game Viewport Recovery'))){
        updates.unshift(['v3.28.1 — Game Viewport Recovery','Maintained the stable in-game recovery path, restored the menu when a run stops unexpectedly, repaired invalid camera coordinates, and corrected the stale Quality version badge. Login was not changed.']);
      }
      if(Array.isArray(helpArticles)&&!helpArticles.some(x=>Array.isArray(x)&&String(x[0]).includes('blank in-game screen'))){
        helpArticles.unshift(['What should I do if the game screen is blank?','Troubleshooting','OUTLAST now automatically repairs invalid camera/player state and returns to the menu if a run stops without a proper game-over screen. Refreshing is no longer required for the normal recovery path.']);
      }
    }catch(_){}
  }

  function run(){
    syncVersion();
    addDocs();
    safeViewport();
    syncQualityBadge();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  [0,100,500,1000,2000,4000].forEach(ms=>setTimeout(run,ms));
  window.__outlastRecoveryAudit=()=>({
    version:window.OUTLAST_VERSION||VERSION,
    qualityBadge:document.getElementById('outlastQualityBadge')?.textContent||null,
    menuVisible:menuVisible(),
    gameRunning:!!window.game?.running,
    playerValid:!!window.game?.player&&Number.isFinite(Number(window.game.player.x))&&Number.isFinite(Number(window.game.player.y)),
    cameraValid:!!window.game?.camera&&Number.isFinite(Number(window.game.camera.x))&&Number.isFinite(Number(window.game.camera.y))
  });
  setInterval(()=>{try{safeViewport();}catch(_){}},750);
})();