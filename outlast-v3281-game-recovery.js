/* OUTLAST v3.30.32 — game viewport/recovery guard */
(function(){
  'use strict';
  if(window.__outlastRecoveryAuthority3281)return;
  window.__outlastRecoveryAuthority3281=true;
  const FALLBACK_VERSION='v3.30.32';

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
  function currentVersion(){
    const meta=document.querySelector('meta[name="build-version"]');
    const raw=window.OUTLAST_VERSION||meta?.content||FALLBACK_VERSION;
    const text=String(raw).trim();
    return /^v/i.test(text)?text:'v'+text;
  }
  function syncVersion(){
    const version=currentVersion();
    document.querySelectorAll('.menu-chip').forEach(el=>{
      if(/SURVIVOR HUB/i.test(el.textContent||''))el.textContent=version+' • SURVIVOR HUB';
    });
    document.querySelectorAll('[data-outlast-version]').forEach(el=>el.textContent=version);
    document.querySelectorAll('#outlastQualityBadge').forEach(el=>el.textContent=version+' • QUALITY');
  }

  function syncQualityBadge(){
    let badge=document.getElementById('outlastQualityBadge');
    if(!badge){
      badge=document.createElement('div');
      badge.id='outlastQualityBadge';
      document.body.appendChild(badge);
    }
    badge.textContent=currentVersion()+' • QUALITY';
    badge.style.display=menuVisible()?'block':'none';
  }

  function safeViewport(){
    const canvas=document.getElementById('game');
    if(!canvas||typeof game==='undefined')return;

    const running=!!game.running;
    if(running){
      /*
       * Start Run intentionally sets game.running before it constructs game.player.
       * The old v3.28.1 guard interpreted that brief startup window as a broken run
       * and forcibly returned to the menu. Respect the explicit startup state.
       */
      if(game.starting)return;

      if(!game.player||
         !Number.isFinite(Number(game.player.x))||
         !Number.isFinite(Number(game.player.y))){
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
      const maxX=Math.max(0,Number(W)-Number(CW));
      const maxY=Math.max(0,Number(H)-Number(CH));
      if(!Number.isFinite(Number(game.camera.x)))game.camera.x=0;
      if(!Number.isFinite(Number(game.camera.y)))game.camera.y=0;
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

    if(!game.endScreen&&!game.over&&!fatalErrorShown&&!menuVisible()){
      showMenu();
    }
    document.body.classList.remove('outlast-in-game');
    syncQualityBadge();
  }

  function addDocs(){
    try{
      if(Array.isArray(window.updates)&&!window.updates.some(x=>Array.isArray(x)&&String(x[0]).includes('v3.30.31 — Start Run Recovery Race Fix'))){
        window.updates.unshift([
          'v3.30.31 — Start Run Recovery Race Fix',
          'Small bug fixes and game stability improvements. The viewport recovery guard now waits for Start Run initialization to finish instead of cancelling a valid launch during player creation. Login was not changed.'
        ]);
      }
      if(Array.isArray(window.helpArticles)&&!window.helpArticles.some(x=>Array.isArray(x)&&String(x[0]).includes('Start Run initialization'))){
        window.helpArticles.unshift([
          'Why did Start Run return to the menu?',
          'Troubleshooting',
          'The recovery guard now ignores the brief startup period before the player object exists. After initialization, invalid player/camera state is still repaired without interrupting normal runs.'
        ]);
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
    version:currentVersion(),
    qualityBadge:document.getElementById('outlastQualityBadge')?.textContent||null,
    menuVisible:menuVisible(),
    gameStarting:!!window.game?.starting,
    gameRunning:!!window.game?.running,
    playerValid:!!window.game?.player&&Number.isFinite(Number(window.game.player.x))&&Number.isFinite(Number(window.game.player.y)),
    cameraValid:!!window.game?.camera&&Number.isFinite(Number(window.game.camera.x))&&Number.isFinite(Number(window.game.camera.y))
  });
  setInterval(()=>{try{safeViewport();}catch(_){}},750);
})();