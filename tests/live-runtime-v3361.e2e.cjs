const { chromium } = require('playwright');

(async()=>{
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  await page.setExtraHTTPHeaders({'Cache-Control':'no-cache, no-store, max-age=0','Pragma':'no-cache'});
  const consoleErrors=[];
  page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
  page.on('pageerror',e=>consoleErrors.push('PAGEERROR: '+e.message+' STACK: '+(e.stack||'')));

  await page.addInitScript(()=>{
    localStorage.setItem('outlastUsername','E2EPlayer');
    localStorage.setItem('outlastDeviceMode','pc');
    localStorage.setItem('outlastJoystickMode','off');
    localStorage.setItem('outlast_update_ack_v3.37.0','1');
    localStorage.setItem('outlastSeenUpdateVersion','3.37.0');
  });

  const url=(process.env.OUTLAST_RUNTIME_TEST_URL||'https://outlast-game.onrender.com/index.html')+'?e2e='+Date.now();
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
  const servedTitle=await page.title();
  if(!servedTitle.includes('v3.37.0')) console.log('Version marker diagnostic: '+servedTitle);

  await page.waitForSelector('#startBtn',{state:'visible',timeout:15000});
  const skinPrep=await page.evaluate(()=>{
    if(typeof skins==='undefined'||typeof save==='undefined') return {ok:false};
    const name=Object.keys(skins).find(n=>n!=='Classic');
    if(!name) return {ok:false,reason:'no non-Classic skin definition'};
    save.skins=save.skins||{};save.skins[name]=true;save.selectedSkin=name;persist();
    return {ok:true,name};
  });
  await page.locator('#startBtn').click();
  await page.waitForTimeout(2500);

  const state=await page.evaluate(()=>window.__OUTLAST_RUNTIME_STATE||null);
  if(!state) throw new Error('Runtime heartbeat was not published; game loop is not running.');
  if(state.fatal) throw new Error('Game loop fatal error after Start Run: '+(state.error||'unknown'));
  if(!state.running) throw new Error('Start Run did not leave the game running.');
  if(!state.player) throw new Error('Start Run left the game without a player.');
  if(!(Number(state.time)>0.8)) throw new Error('Gameplay time did not advance after Start Run.');
  if(!(Number(state.heartbeat)>10)) throw new Error('Game loop heartbeat did not advance.');
  if(!(Number(state.enemies)>=1)) throw new Error('Gameplay loop is alive but no zombie spawned.');
  const liveChecks=await page.evaluate(()=>({
    ai:!!(typeof game!=='undefined'&&Array.isArray(game.enemies)&&game.enemies.some(e=>e&&e.aiBehavior)),
    skin:!!(typeof game!=='undefined'&&game.player&&game.player.skinBonuses&&Number(game.player.skinBonuses.xp||0)>=0),
    ownerHidden:!document.getElementById('ownerPanelCard')||getComputedStyle(document.getElementById('ownerPanelCard')).display==='none'
  }));
  if(!liveChecks.ai) throw new Error('Zombies spawned without the new AI state.');
  if(!liveChecks.skin || !skinPrep.ok) throw new Error('Equipped skin did not initialize into the run.');
  if(!liveChecks.ownerHidden) throw new Error('Non-owner player can see the Owner Panel.');
  const flags=await page.evaluate(()=>({
    core:window.OUTLAST_CORE_CONTENT_VERSION||null,
    coreMode:window.OUTLAST_CORE_CONTENT_MODE||null,
    systems:window.OUTLAST_37_READY||false,
    scale:!!window.OUTLAST_UPGRADE_RARITY_SCALING37,
    mandatory:!!window.OUTLAST_MANDATORY_UPDATE_CHECK
  }));
  if(!flags.core) throw new Error('12-core engine version was not published.');
  if(!flags.systems) throw new Error('v3.37 systems module did not initialize.');
  if(!flags.scale) throw new Error('Authoritative rarity scale did not initialize.');
  if(!flags.mandatory) throw new Error('Mandatory update checker did not initialize.');
  if(consoleErrors.length) throw new Error('Browser console errors: '+consoleErrors.join(' | '));

  console.log(JSON.stringify({ok:true,state,flags,liveChecks,skinPrep,consoleErrors}));
  await browser.close();
})().catch(async err=>{console.error(err);process.exit(1)});
