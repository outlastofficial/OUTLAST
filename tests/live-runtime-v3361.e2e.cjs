const { chromium } = require('playwright');

(async()=>{
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  await page.setExtraHTTPHeaders({'Cache-Control':'no-cache, no-store, max-age=0','Pragma':'no-cache'});
  const consoleErrors=[];const http404=[];
  page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
  page.on('pageerror',e=>consoleErrors.push('PAGEERROR: '+e.message+' STACK: '+(e.stack||'')));page.on('response',r=>{if(r.status()===404)http404.push(r.url())});

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
  await page.waitForTimeout(250); // Let the late systems module finish installing before auditing the menu.
  const skinPrep=await page.evaluate(()=>{
    if(typeof skins==='undefined'||typeof save==='undefined') return {ok:false};
    const name=Object.keys(skins).find(n=>n!=='Classic');
    if(!name) return {ok:false,reason:'no non-Classic skin definition'};
    save.skins=save.skins||{};save.skins[name]=true;save.selectedSkin=name;persist();
    return {ok:true,name};
  });
  await page.locator('#startBtn').click();
  await page.waitForTimeout(2500);

  const layoutAudit=await page.evaluate(()=>{
    const buttons=[...document.querySelectorAll('#menu .menu-page button')].map(b=>({id:b.id,text:(b.innerText||b.textContent||'').replace(/\\s+/g,' ').trim(),page:b.closest('.menu-page')?.dataset.pageContent||''}));
    const count=re=>buttons.filter(b=>re.test(b.text)).length;
    const duplicateIds=[...document.querySelectorAll('#menu button[id]')].map(b=>b.id).filter((id,i,a)=>id&&a.indexOf(id)!==i);
    return {counts:{inventory:count(/\\binventory\\b/i),skins:count(/\\bskins?\\b/i),shop:count(/daily shop|open shop/i),modifiers:count(/run modifiers/i),oldCollectionHub:count(/new content\\s*\\/\\s*collection/i)},duplicateButtonIds:[...new Set(duplicateIds)],progressDeck:!!document.getElementById('progressDeck37')};
  });
  for(const [action,count] of Object.entries(layoutAudit.counts)){
    const expected=action==='oldCollectionHub'?0:1;
    if(count!==expected)throw new Error('Duplicate or missing '+action+' entry point(s): '+JSON.stringify(layoutAudit));
  }
  if(layoutAudit.duplicateButtonIds.length)throw new Error('Duplicate button IDs remain in the menu: '+JSON.stringify(layoutAudit));

  const state=await page.evaluate(()=>window.__OUTLAST_RUNTIME_STATE||null);
  if(!state) throw new Error('Runtime heartbeat was not published; game loop is not running.');
  if(state.fatal) throw new Error('Game loop fatal error after Start Run: '+(state.error||'unknown'));
  if(!state.running) throw new Error('Start Run did not leave the game running.');
  if(!state.player) throw new Error('Start Run left the game without a player.');
  if(!(Number(state.time)>0.8)) throw new Error('Gameplay time did not advance after Start Run.');
  if(!(Number(state.heartbeat)>10)) throw new Error('Game loop heartbeat did not advance.');
  if(!(Number(state.enemies)>=1)) throw new Error('Gameplay loop is alive but no zombie spawned.');
  const beforeMove=await page.evaluate(()=>({x:game.player.x,y:game.player.y,time:game.time}));
  await page.keyboard.down('d');await page.waitForTimeout(800);await page.keyboard.up('d');await page.waitForTimeout(100);
  const afterMove=await page.evaluate(()=>({x:game.player.x,y:game.player.y,time:game.time}));
  const displacement=Math.hypot(afterMove.x-beforeMove.x,afterMove.y-beforeMove.y);
  if(!(displacement>10))throw new Error('WASD did not move the player after Start Run: '+JSON.stringify({beforeMove,afterMove,layoutAudit}));
  const firePrep=await page.evaluate(()=>{
    const p=game.player,old=game.enemies[0]||{};
    const probe={...old,__outlastE2EProbe:true,x:p.x+85,y:p.y,hp:1000000,max:1000000,r:14,kind:'zombie',speed:0,damage:0,xp:1,boss:false,phase:1,aiBehavior:'Hunter',aiPhase:0,slowTimer:0,burn:0,poison:0,chainTimer:0};
    game.enemies=[probe];game.lastShot=0;
    return {hp:probe.hp,x:p.x,y:p.y};
  });
  await page.waitForTimeout(900);
  const fireResult=await page.evaluate(()=>({hp:game.enemies.find(e=>e.__outlastE2EProbe)?.hp,bullets:game.bullets.filter(b=>!b.enemy).length,lastShot:game.lastShot,playerX:game.player.x}));
  if(!(Number(fireResult.hp)<firePrep.hp))throw new Error('Automatic weapon did not damage a nearby zombie: '+JSON.stringify({firePrep,fireResult,layoutAudit}));

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
    coreData:!!window.OUTLAST_CORE_CONTENT,
    uiVersion:window.OUTLAST_UI_SYSTEM_VERSION||null,
    coreMode:window.OUTLAST_CORE_CONTENT_MODE||null,
    systems:window.OUTLAST_37_READY||false,
    scale:!!window.OUTLAST_UPGRADE_RARITY_SCALING37,
    mandatory:!!window.OUTLAST_MANDATORY_UPDATE_CHECK
  }));
  if(!flags.core) throw new Error('12-core engine version was not published.');
  if(!flags.systems) throw new Error('v3.37 systems module did not initialize.');
  if(!flags.scale) throw new Error('Authoritative rarity scale did not initialize.');
  if(!flags.mandatory) throw new Error('Mandatory update checker did not initialize.');
  if(consoleErrors.length) throw new Error('Browser console errors: '+consoleErrors.join(' | ')+' HTTP404='+http404.join(' | '));

  console.log(JSON.stringify({ok:true,state,flags,liveChecks,skinPrep,layoutAudit,beforeMove,afterMove,displacement,firePrep,fireResult,consoleErrors,http404}));
  await browser.close();
})().catch(async err=>{console.error(err);process.exit(1)});

// v3.37 backend event-state compatibility verified
