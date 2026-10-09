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
    localStorage.setItem('outlast_update_ack_v3.37.16','1');
    localStorage.setItem('outlastSeenUpdateVersion','3.37.0');
    localStorage.setItem('outlastNewPlayerTutorialV317','1');
  });

  const url=(process.env.OUTLAST_RUNTIME_TEST_URL||'https://outlast-game.onrender.com/index.html')+'?e2e='+Date.now();
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
  const servedTitle=await page.title();
  if(!servedTitle.includes('v3.37.16')) console.log('Version marker diagnostic: '+servedTitle);

  await page.waitForSelector('#startBtn',{state:'visible',timeout:15000});
  await page.waitForTimeout(850); // Let delayed modules and the old-popup timer finish before auditing.
  const stalePopupShowing=await page.evaluate(()=>{const el=document.getElementById('outlastV3350UpdatePopup');return !!el&&getComputedStyle(el).display!=='none';});
  if(stalePopupShowing)throw new Error('Obsolete v3.35.0 popup is still covering the current build.');
  const featureRegistry=await page.evaluate(()=>({
    thorns:typeof tempUp!=='undefined'&&Array.isArray(tempUp)&&tempUp.some(u=>u&&u[0]==='Thorns'),
    cards:Number(window.OUTLAST_UPGRADE_LIBRARY_COUNT||0),
    mapReady:!!window.OUTLAST_MAP_SELECTION_READY,
    ultimateReady:!!window.OUTLAST_ULTIMATE_READY,
    audit:typeof window.OUTLAST_EXPANSION_AUDIT==='function'?window.OUTLAST_EXPANSION_AUDIT():null
  }));
  if(!featureRegistry.thorns||featureRegistry.cards<400||!featureRegistry.mapReady||!featureRegistry.ultimateReady){
    throw new Error('v3.37.16 features were not registered: '+JSON.stringify(featureRegistry));
  }
  await page.locator('#mapBtn').click();
  await page.waitForTimeout(80);
  const pickerBuild=await page.evaluate(()=>window.OUTLAST_BUILD||null);
  if(pickerBuild!=='3.37.16')throw new Error('Opening Choose Map reverted the current build marker: '+pickerBuild);
  const pickerAudit=await page.evaluate(()=>typeof window.OUTLAST_MAP_PICKER_AUDIT==='function'?window.OUTLAST_MAP_PICKER_AUDIT():{missingAudit:true,ready:!!window.OUTLAST_MAP_SELECTION_READY});
  if(!pickerAudit.visible||!pickerAudit.ribhouse||pickerAudit.buttonCount<18)throw new Error('New map picker did not render visibly: '+JSON.stringify(pickerAudit));
  await page.locator('button[data-outlast3377-map="Ribhouse"]').click();
  const selectedMap=await page.evaluate(()=>save.map);
  if(selectedMap!=='Ribhouse')throw new Error('New map selection did not persist: '+selectedMap);
  await page.locator('#mapBtn').click();
  await page.locator('button[data-outlast3377-create-map]').click();
  await page.locator('#mcUnlock').waitFor({state:'visible',timeout:8000});
  const creatorAudit=await page.evaluate(()=>({unlock:!!document.getElementById('mcUnlock'),audit:typeof window.OUTLAST_MAP_CREATOR_AUDIT==='function'?window.OUTLAST_MAP_CREATOR_AUDIT():null}));
  if(!creatorAudit.unlock||!creatorAudit.audit)throw new Error('Map Creator did not open its unlock/editor screen: '+JSON.stringify(creatorAudit));
  const creatorBuild=await page.evaluate(()=>window.OUTLAST_BUILD||null);
  if(creatorBuild!=='3.37.16')throw new Error('Opening Map Creator reverted the current build marker: '+creatorBuild);
  await page.locator('#closeSub').click();
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
    const buttons=[...document.querySelectorAll('#menu .menu-page button')].map(b=>({id:b.id,text:(b.innerText||b.textContent||'').replace(/\s+/g,' ').trim(),page:b.closest('.menu-page')?.dataset.pageContent||''}));
    const count=needle=>buttons.filter(b=>b.text.toLowerCase().includes(needle)).length;
    const shopCount=buttons.filter(b=>{const t=b.text.toLowerCase();return t.includes('daily shop')||t.includes('open shop')}).length;
    const duplicateIds=[...document.querySelectorAll('#menu button[id]')].map(b=>b.id).filter((id,i,a)=>id&&a.indexOf(id)!==i);
    return {counts:{inventory:count('inventory'),skins:count('skin'),shop:shopCount,modifiers:count('run modifiers'),oldCollectionHub:count('new content / collection')},duplicateButtonIds:[...new Set(duplicateIds)],progressDeck:!!document.getElementById('progressDeck37'),progressPage:!!document.querySelector('[data-page-content="progress"]'),legacyCards:!!document.querySelector('[data-page-content="progress"] .menu-cards'),progress36:!!document.getElementById('progressSystems36'),systemsReady:!!window.OUTLAST_37_READY,build:window.OUTLAST_BUILD||null,installError:window.__OUTLAST37_INSTALL_ERROR||null,loadedSystemScripts:[...document.scripts].map(s=>s.src).filter(s=>s.includes('v3360')||s.includes('v3370'))};
  });
  for(const [action,count] of Object.entries(layoutAudit.counts)){
    const expected=action==='oldCollectionHub'?0:1;
    if(count!==expected)throw new Error('Duplicate or missing '+action+' entry point(s): '+JSON.stringify({layoutAudit,consoleErrors}));
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
  await page.waitForFunction(()=>!game.upgradeOpen||performance.now()>=Number(game.__upgradeRollUnlockAt||0)+75,{timeout:15000});
  await page.evaluate(()=>{if(game.upgradeOpen){if(typeof chooseUpgrade!=='function')throw new Error('Upgrade choice function missing');chooseUpgrade(0)}if(game.paused&&!game.upgradeOpen)game.paused=false;});
  await page.waitForTimeout(250);
  const beforeMove=await page.evaluate(()=>({x:game.player.x,y:game.player.y,time:game.time}));
  await page.keyboard.down('d');await page.waitForTimeout(800);await page.keyboard.up('d');await page.waitForTimeout(100);
  const afterMove=await page.evaluate(()=>({x:game.player.x,y:game.player.y,time:game.time}));
  const displacement=Math.hypot(afterMove.x-beforeMove.x,afterMove.y-beforeMove.y);
  if(!(displacement>10))throw new Error('WASD did not move the player after Start Run: '+JSON.stringify({beforeMove,afterMove,layoutAudit}));
  const thornsPrep=await page.evaluate(()=>{
    const p=game.player;p.thorns=.5;p.thornsRadius=180;p.__outlastThornsReadyAt=0;p.shield=0;p.omegaShieldMaxHits=0;p.omegaShieldHits=0;p.god=false;p.godMode=false;
    const probe={__outlastThornsProbe:true,x:p.x+28,y:p.y,hp:1000000,max:1000000,r:14,kind:'zombie',speed:0,damage:0,xp:1,boss:false,phase:1,aiBehavior:'Hunter',aiPhase:0,slowTimer:0,burn:0,poison:0,chainTimer:0};
    game.enemies=[probe];const enemyHp=probe.hp,playerHp=p.hp;outlastTakePlayerDamage(p,1,'thorns runtime test');
    return {enemyHp,playerHp,remainingEnemyHp:probe.hp,remainingPlayerHp:p.hp};
  });
  if(!(thornsPrep.remainingPlayerHp<thornsPrep.playerHp)||!(thornsPrep.remainingEnemyHp<thornsPrep.enemyHp)){
    throw new Error('Thorns upgrade did not retaliate on hit: '+JSON.stringify(thornsPrep));
  }
  const ultimatePrep=await page.evaluate(()=>{
    const p=game.player;
    // Clear any incidental level-up pause created by the preceding smoke steps.
    game.running=true;game.paused=false;game.over=false;game.upgradeOpen=false;
    game.xp=0;game.xpNeed=Math.max(Number(game.xpNeed)||1,1000000000);
    game.upgradeChoices=[];
    const probe={__outlastUltimateProbe:true,x:p.x+35,y:p.y,hp:1000000000,max:1000000000,r:14,kind:'zombie',speed:0,damage:0,xp:1,boss:false,phase:1,aiBehavior:'Hunter',aiPhase:0,slowTimer:0,burn:0,poison:0,chainTimer:0};
    game.enemies=[probe];p.ult=100;
    return {hp:probe.hp,charge:p.ult,running:game.running,paused:game.paused,upgradeOpen:game.upgradeOpen};
  });
  await page.keyboard.press('r');await page.waitForTimeout(200);
  const ultimateResult=await page.evaluate(()=>{
    const probe=game.enemies.find(e=>e&&e.__outlastUltimateProbe);
    return {hp:probe?probe.hp:null,charge:Number(game.player.ult)||0,toast:document.getElementById('toast')?.textContent||''};
  });
  if(!(Number(ultimateResult.hp)<ultimatePrep.hp)||!(ultimateResult.charge<100)||!ultimateResult.toast.includes('ULTIMATE RELEASED')){
    throw new Error('Ultimate did not fire and damage enemies: '+JSON.stringify({ultimatePrep,ultimateResult}));
  }
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
  const bossCheck=await page.evaluate(()=>{
    const spawned=typeof spawnBoss==='function'&&spawnBoss();
    const boss=game.enemies.find(e=>e&&e.boss&&!e.__dead&&Number(e.hp)>0);
    if(typeof window.syncBossBar==='function')window.syncBossBar();
    return {spawned:!!spawned,found:!!boss,distance:boss?Math.hypot(boss.x-game.player.x,boss.y-game.player.y):null,
      barDisplay:document.getElementById('outlastBossBar')?.style.display||'',count:Number(game.bossCount)||0};
  });
  if(!bossCheck.spawned||!bossCheck.found||!(bossCheck.distance<=380)){
    throw new Error('Boss did not spawn inside visible combat range: '+JSON.stringify(bossCheck));
  }
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

  // Mobile smoke test: verify menu/chat layout, map selection, gameplay controls, and touch ultimate.
  const mobilePage=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await mobilePage.setExtraHTTPHeaders({'Cache-Control':'no-cache, no-store, max-age=0','Pragma':'no-cache'});
  const mobileErrors=[],mobile404=[];
  mobilePage.on('console',m=>{if(m.type()==='error')mobileErrors.push(m.text())});
  mobilePage.on('pageerror',e=>mobileErrors.push('PAGEERROR: '+e.message+' STACK: '+(e.stack||'')));
  mobilePage.on('response',r=>{if(r.status()===404)mobile404.push(r.url())});
  await mobilePage.addInitScript(()=>{
    localStorage.setItem('outlastUsername','E2EMobile');
    localStorage.setItem('outlastDeviceMode','mobile');
    localStorage.setItem('outlastJoystickMode','on');
    localStorage.setItem('outlast_update_ack_v3.37.16','1');
    localStorage.setItem('outlast_update_ack_v3.37.0','1');
    localStorage.setItem('outlastSeenUpdateVersion','3.37.16');
    localStorage.setItem('outlastNewPlayerTutorialV317','1');
  });
  const mobileUrl=(process.env.OUTLAST_RUNTIME_TEST_URL||'https://outlast-game.onrender.com/index.html')+'?mobileE2E='+Date.now();
  await mobilePage.goto(mobileUrl,{waitUntil:'domcontentloaded',timeout:30000});
  await mobilePage.waitForSelector('#startBtn',{state:'visible',timeout:15000});
  await mobilePage.waitForTimeout(400);
  const mobileMenuCheck=await mobilePage.evaluate(()=>{
    const b=document.getElementById('gecToggle'),r=b&&b.getBoundingClientRect(),controls=document.getElementById('mobileControls');
    return {build:window.OUTLAST_BUILD||null,chatExists:!!b,chatTop:r?r.top:null,chatBottom:r?r.bottom:null,
      controlsVisible:!!controls&&getComputedStyle(controls).display!=='none'&&controls.getBoundingClientRect().width>0,
      eventOverlay:!!document.querySelector('.oeb-overlay')};
  });
  if(!mobileMenuCheck.chatExists||!(mobileMenuCheck.chatTop>=0&&mobileMenuCheck.chatTop<175)||mobileMenuCheck.eventOverlay||mobileMenuCheck.controlsVisible){
    throw new Error('Mobile menu layout/control visibility regression: '+JSON.stringify(mobileMenuCheck));
  }
  // Explicitly show onboarding and verify Chat remains clickable above it.
  await mobilePage.evaluate(()=>window.openNewPlayerTutorial?.());
  await mobilePage.locator('#newPlayerTutorial .npt-skip').waitFor({state:'visible',timeout:3000});
  await mobilePage.locator('#gecToggle').tap();
  if(!await mobilePage.locator('#outlastEverywhereChat .gec-panel').isVisible())throw new Error('Mobile Chat button did not open its panel.');
  await mobilePage.locator('#gecClose').tap();
  if(await mobilePage.locator('#outlastEverywhereChat .gec-panel').isVisible())throw new Error('Mobile Chat close control did not close the panel.');
  await mobilePage.locator('#newPlayerTutorial .npt-skip').tap();
  await mobilePage.waitForTimeout(100);
  await mobilePage.locator('#mapBtn').tap();
  await mobilePage.locator('button[data-outlast3377-map="Ribhouse"]').waitFor({state:'visible',timeout:8000});
  await mobilePage.locator('button[data-outlast3377-map="Ribhouse"]').tap();
  const mobileMapSelected=await mobilePage.evaluate(()=>save.map);
  if(mobileMapSelected!=='Ribhouse')throw new Error('Mobile map selection failed: '+mobileMapSelected);
  await mobilePage.locator('#startBtn').tap();
  await mobilePage.waitForTimeout(2200);
  await mobilePage.waitForFunction(()=>!game.upgradeOpen||performance.now()>=Number(game.__upgradeRollUnlockAt||0)+75,{timeout:15000});
  await mobilePage.evaluate(()=>{if(game.upgradeOpen){if(typeof chooseUpgrade!=='function')throw new Error('Upgrade choice function missing');chooseUpgrade(0)}if(game.paused&&!game.upgradeOpen)game.paused=false;});
  await mobilePage.waitForTimeout(250);
  if(!await mobilePage.locator('#mobileControls').isVisible())throw new Error('Mobile movement/actions did not appear during gameplay.');
  const mobileUlt=mobilePage.locator('[data-mobile-action="ult"]');
  if(!await mobileUlt.isVisible())throw new Error('Mobile ULT button is not visible during gameplay.');
  const mobileUltimatePrep=await mobilePage.evaluate(()=>{
    const p=game.player,probe={__outlastMobileUltimateProbe:true,x:p.x+35,y:p.y,hp:1000000000,max:1000000000,r:14,kind:'zombie',speed:0,damage:0,xp:1,boss:false,phase:1,aiBehavior:'Hunter',aiPhase:0,slowTimer:0,burn:0,poison:0,chainTimer:0};
    game.enemies=[probe];p.ult=100;return {hp:probe.hp,charge:p.ult};
  });
  await mobileUlt.tap();await mobilePage.waitForTimeout(200);
  const mobileUltimateResult=await mobilePage.evaluate(()=>{
    const e=game.enemies.find(e=>e&&e.__outlastMobileUltimateProbe);
    return {hp:e?e.hp:null,charge:Number(game.player.ult)||0,toast:document.getElementById('toast')?.textContent||''};
  });
  if(!(Number(mobileUltimateResult.hp)<mobileUltimatePrep.hp)||!(mobileUltimateResult.charge<100)||!mobileUltimateResult.toast.includes('ULTIMATE RELEASED')){
    throw new Error('Mobile ULT tap failed to fire: '+JSON.stringify({mobileUltimatePrep,mobileUltimateResult}));
  }
  if(mobileErrors.length||mobile404.length)throw new Error('Mobile browser errors: '+mobileErrors.join(' | ')+' HTTP404='+mobile404.join(' | '));
  await mobilePage.close();
  if(consoleErrors.length) throw new Error('Browser console errors: '+consoleErrors.join(' | ')+' HTTP404='+http404.join(' | '));

  console.log(JSON.stringify({ok:true,state,flags,liveChecks,skinPrep,layoutAudit,beforeMove,afterMove,displacement,firePrep,fireResult,mobileMenuCheck,mobileMapSelected,mobileUltimatePrep,mobileUltimateResult,consoleErrors,http404,mobileErrors,mobile404}));
  await browser.close();
})().catch(async err=>{console.error(err);process.exit(1)});

// v3.37 backend event-state compatibility verified
