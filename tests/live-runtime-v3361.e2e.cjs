const { chromium } = require('playwright');

(async()=>{
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  await page.setExtraHTTPHeaders({'Cache-Control':'no-cache, no-store, max-age=0','Pragma':'no-cache'});
  const consoleErrors=[];
  page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
  page.on('pageerror',e=>consoleErrors.push('PAGEERROR: '+e.message));

  await page.addInitScript(()=>{
    localStorage.setItem('outlastUsername','E2EPlayer');
    localStorage.setItem('outlastDeviceMode','pc');
    localStorage.setItem('outlastJoystickMode','off');
    localStorage.setItem('outlast_update_ack_v3.36.2','1');
    localStorage.setItem('outlastSeenUpdateVersion','3.35.2');
  });

  const url='https://outlast-game.onrender.com/index.html?e2e='+Date.now();
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
  const servedTitle=await page.title();
  if(!servedTitle.includes('v3.36.2')) throw new Error('Live page title is not v3.36.2: '+servedTitle);

  await page.waitForSelector('#startBtn',{state:'visible',timeout:15000});

  await page.locator('#startBtn').click();
  await page.waitForTimeout(1800);

  const state=await page.evaluate(()=>window.__OUTLAST_RUNTIME_STATE||null);
  if(!state){
    const diag=await page.evaluate(()=>({title:document.title,ready:document.readyState,build:document.querySelector('meta[name="build-version"]')?.content||null,gameDisplay:getComputedStyle(document.getElementById('game')).display,menuDisplay:getComputedStyle(document.getElementById('menu')).display,buttonVisible:!!document.querySelector('#startBtn'),globalBuild:window.OUTLAST_BUILD||null,error:window.__OUTLAST_RUNTIME_STATE?.error||null}));
    throw new Error('Runtime heartbeat was not published; game loop did not expose a live state. DIAG='+JSON.stringify(diag)+' CONSOLE='+consoleErrors.join(' | '));
  }
  if(state.fatal) throw new Error('Game loop fatal error after Start Run: '+(state.error||'unknown'));
  if(!state.running) throw new Error('Start Run did not leave the game running.');
  if(!state.player) throw new Error('Start Run left the game without a player.');
  if(!(Number(state.time)>0.3)) throw new Error('Gameplay time did not advance after Start Run.');
  if(!(Number(state.heartbeat)>5)) throw new Error('Game loop heartbeat did not advance.');
  if(consoleErrors.length) throw new Error('Browser console errors: '+consoleErrors.join(' | '));

  console.log(JSON.stringify({ok:true,state,consoleErrors}));
  await browser.close();
})().catch(async err=>{console.error(err);process.exit(1)});
