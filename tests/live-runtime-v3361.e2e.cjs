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
    localStorage.setItem('outlast_update_ack_v4.0.0','1');
    localStorage.setItem('outlast_update_ack_v4.5.1','1');
    localStorage.setItem('outlastSeenUpdateVersion','3.37.0');
    localStorage.setItem('outlastNewPlayerTutorialV317','1');
    localStorage.setItem('outlast_update_ack_v4.5.1','1');
    localStorage.setItem('outlast_v451_release_popup_ack','1');
    localStorage.setItem('outlastSeenUpdateVersion','4.5.1');
  });

  const baseUrl=process.env.OUTLAST_RUNTIME_TEST_URL||'https://outlast-game.onrender.com/index.html';
  let url='',servedTitle='',servedBuild=null;
  // Auto-deploy services and GitHub Pages can briefly serve the prior build while a push is deploying.
  // Always reload with a fresh query until the active release and runtime marker agree.
  for(let attempt=0;attempt<20;attempt++){
    url=baseUrl+'?e2e='+Date.now()+'&deployCheck='+attempt;
    await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForTimeout(500);
    servedTitle=await page.title();
    servedBuild=await page.evaluate(()=>window.OUTLAST_BUILD||null).catch(()=>null);
    if(servedTitle.includes('v4.5.1')&&servedBuild==='4.5.1')break;
    if(attempt<19)await page.waitForTimeout(3000);
  }
  if(!servedTitle.includes('v4.5.1')||servedBuild!=='4.5.1'){
    throw new Error('Latest build was not served after fresh-load retries: '+JSON.stringify({servedTitle,servedBuild,url,consoleErrors,http404}));
  }

  await page.waitForSelector('#startBtn',{state:'visible',timeout:15000});
  await page.waitForTimeout(850); // Let delayed modules and the release notice initialize.
  await page.locator('#outlastV4000GotIt').waitFor({state:'visible',timeout:8000});
  await page.locator('#outlastV4000GotIt').click();
  const releaseState=await page.evaluate(()=>({
    audit:typeof window.OUTLAST_ULTIMATE_EXPANSION_AUDIT==='function'?window.OUTLAST_ULTIMATE_EXPANSION_AUDIT():null,
    readyState:document.readyState,
    progressPage:!!document.querySelector('[data-page-content="progress"]'),
    progressCards:!!document.querySelector('[data-page-content="progress"] .menu-cards'),
    statsButton:!!document.getElementById('statsBtn'),
    menuCardContainers:document.querySelectorAll('.menu-cards').length,
    trophiesButton:!!document.getElementById('outlastV4000BossTrophiesBtn'),
    cardError:window.OUTLAST_V4000_TROPHY_CARD_ERROR||null
  }));
  const majorRelease=releaseState.audit;
  if(!majorRelease||majorRelease.version!=='4.0.0'||!majorRelease.bossTrophiesReady||!majorRelease.trophyCardReady||!majorRelease.updateLogReady||!majorRelease.popupReady||!majorRelease.mandatoryUpdateCheck){
    throw new Error('v4.0.0 release modules did not initialize fully: '+JSON.stringify(releaseState));
  }
  if(await page.locator('#outlastV4000BossTrophiesBtn').count()!==1)throw new Error('Progress → Boss Trophies card is missing.');
  const stalePopupShowing=await page.evaluate(()=>{const el=document.getElementById('outlastV3350UpdatePopup');return !!el&&getComputedStyle(el).display!=='none';});
  if(stalePopupShowing)throw new Error('Obsolete v3.35.0 popup is still covering the current build.');
  const worldAndUiAudit=await page.evaluate(()=>{
    const audit=typeof window.OUTLAST_MAP_PLAYABILITY_AUDIT_V430==='function'?window.OUTLAST_MAP_PLAYABILITY_AUDIT_V430():null;
    const visualAudit=typeof window.OUTLAST_MAP_VISUAL_AUDIT_V434==='function'?window.OUTLAST_MAP_VISUAL_AUDIT_V434():null;
    return {build:window.OUTLAST_BUILD||null,title:document.title,uiHotfix:window.OUTLAST_UI_HOTFIX_V432===true,upgradeCardRedesign:!!window.OUTLAST_UPGRADE_CARD_DESIGN_V435?.ready,gearRoom:!!window.OUTLAST_GEAR_ROOM_V435?.ready,ownerPanelEntrypoint:typeof window.openOwnerPanel==='function',visualAudit,visualReady:window.OUTLAST_MAP_VISUAL_READY_V434===true,audit};
  });
  if(worldAndUiAudit.build!=='4.5.1'||!worldAndUiAudit.title.includes('v4.5.1')||!worldAndUiAudit.uiHotfix||!worldAndUiAudit.upgradeCardRedesign||!worldAndUiAudit.gearRoom||!worldAndUiAudit.ownerPanelEntrypoint||!worldAndUiAudit.visualReady||!worldAndUiAudit.visualAudit?.ready){
    throw new Error('v4.5.1 UI, owner and map renderer modules did not remain active after delayed initialization: '+JSON.stringify(worldAndUiAudit));
  }
  if(!worldAndUiAudit.visualAudit||worldAndUiAudit.visualAudit.added!==82||worldAndUiAudit.visualAudit.distinctPalettes!==82||worldAndUiAudit.visualAudit.distinctLayouts!==82){
    throw new Error('Distinct visual map audit failed: '+JSON.stringify(worldAndUiAudit.visualAudit));
  }
  if(!worldAndUiAudit.audit||!worldAndUiAudit.audit.ready||worldAndUiAudit.audit.count!==100||worldAndUiAudit.audit.unique!==100){
    throw new Error('100-map registry audit failed: '+JSON.stringify(worldAndUiAudit.audit));
  }
  const featureRegistry=await page.evaluate(()=>({
    thorns:typeof tempUp!=='undefined'&&Array.isArray(tempUp)&&tempUp.some(u=>u&&u[0]==='Thorns'),
    cards:Number(window.OUTLAST_UPGRADE_LIBRARY_COUNT||0),
    mapReady:!!window.OUTLAST_MAP_SELECTION_READY,
    ultimateReady:!!window.OUTLAST_ULTIMATE_READY,
    audit:typeof window.OUTLAST_EXPANSION_AUDIT==='function'?window.OUTLAST_EXPANSION_AUDIT():null
  }));
  if(!featureRegistry.thorns||featureRegistry.cards<500||!featureRegistry.mapReady||!featureRegistry.ultimateReady){
    const runtimeDiag=await page.evaluate(()=>({expansionReady:!!window.OUTLAST_MAP_UPGRADE_EXPANSION_READY,expansionAudit:typeof window.OUTLAST_MAP_UPGRADE_EXPANSION_AUDIT==='function'?window.OUTLAST_MAP_UPGRADE_EXPANSION_AUDIT():null,loadedExpansionResources:performance.getEntriesByType('resource').map(x=>x.name).filter(x=>x.includes('outlast-v410-map-upgrade-expansion'))}));
    throw new Error('v4.1.0 features were not registered: '+JSON.stringify({featureRegistry,runtimeDiag,consoleErrors,http404}));
  }
  const expansionAudit=await page.evaluate(()=>typeof window.OUTLAST_MAP_UPGRADE_EXPANSION_AUDIT==='function'?window.OUTLAST_MAP_UPGRADE_EXPANSION_AUDIT():null);
  if(!expansionAudit||expansionAudit.version!=='4.2.4'||expansionAudit.permanentChoices<500||expansionAudit.inRunChoices<500||expansionAudit.mapRegistryCount<18){
    throw new Error('v4.5.1 map/upgrades expansion incomplete: '+JSON.stringify(expansionAudit));
  }
  await page.locator('#mapBtn').click();
  await page.waitForTimeout(80);
  const pickerBuild=await page.evaluate(()=>window.OUTLAST_BUILD||null);
  if(pickerBuild!=='4.5.1')throw new Error('Opening Choose Map reverted the current build marker: '+pickerBuild);
  const pickerAudit=await page.evaluate(()=>typeof window.OUTLAST_MAP_PICKER_AUDIT==='function'?window.OUTLAST_MAP_PICKER_AUDIT():{missingAudit:true,ready:!!window.OUTLAST_MAP_SELECTION_READY});
  if(!pickerAudit.visible||!pickerAudit.ribhouse||pickerAudit.buttonCount<100)throw new Error('100-map picker did not render all selectable tiles: '+JSON.stringify(pickerAudit));
  const mapVisualAudit=await page.evaluate(()=>{
    const modal=document.getElementById('outlast3377MapPickerModal');
    const first=[...(modal?.querySelectorAll('button[data-outlast3377-map]')||[])].slice(0,2);
    return {banner:!!modal?.querySelector('.outlast3377-map-new-banner'),keys:first.map(b=>b.getAttribute('data-outlast3377-map')),badges:first.map(b=>!!b.querySelector('.outlast3377-map-new'))};
  });
  if(!mapVisualAudit.banner||mapVisualAudit.keys.join(',')!=='Seizure,Ribhouse'||mapVisualAudit.badges.some(v=>!v))throw new Error('The new maps are not prominent in the first row: '+JSON.stringify(mapVisualAudit));
  const allMapProbe=await page.evaluate(()=>{
    const keys=['Forest','Desert','Snow','Lava','City','Hospital','Laboratory','Subway','Prison','MilitaryBase','RuinedTown','Harbor','Bunker','Swamp','Skyscraper','Wasteland','Seizure','Ribhouse'];
    const result=[];
    for(const key of keys){
      const button=document.querySelector('button[data-outlast3377-map="'+key+'"]');
      if(!button)return {ok:false,missing:key,result};
      button.click();
      result.push({key,selected:save.map===key,definition:!!mapDefs[key],obstacles:Array.isArray(mapObstacles[key]),hazard:!!mapHazards[key]});
      if(save.map!==key||!mapDefs[key]||!Array.isArray(mapObstacles[key]))return {ok:false,failed:key,result};
      if(!document.getElementById('outlast3377MapPickerModal'))window.OUTLAST_OPEN_MAP_PICKER_3377();
    }
    save.map='Forest';persist();document.getElementById('outlast3377MapPickerModal')?.remove();window.OUTLAST_MAP_PICKER_OPEN=false;
    return {ok:true,count:result.length,result};
  });
  if(!allMapProbe.ok||allMapProbe.count!==18)throw new Error('Not all built-in maps are selectable/playable: '+JSON.stringify(allMapProbe));
  await page.locator('#mapBtn').click();
  const addedMapProbe=await page.evaluate(()=>{
    const names=['The Void','Neon District','Clockwork Factory','Crystal Caverns','The Backrooms','Orbital Station','The Final Frontier','Frozen Abyss'];
    const results=[];
    for(const name of names){
      let modal=document.getElementById('outlast3377MapPickerModal');
      if(!modal)window.OUTLAST_OPEN_MAP_PICKER_3377();
      const button=[...(document.querySelectorAll('button[data-outlast3377-map]'))].find(b=>b.getAttribute('data-outlast3377-map')===name);
      if(!button)return {ok:false,missing:name,results};
      button.click();
      const d=mapDefs[name],layout=mapObstacles[name],hazard=mapHazards[name];
      results.push({name,selected:save.map===name,theme:d&&d.theme,bg:d&&d.bg,props:Array.isArray(layout)?layout.length:0,hazard:!!hazard});
      if(save.map!==name||!d||!d.theme||!Array.isArray(layout)||layout.length<12||!hazard)return {ok:false,failed:name,results};
    }
    save.map='Forest';persist();document.getElementById('outlast3377MapPickerModal')?.remove();window.OUTLAST_MAP_PICKER_OPEN=false;
    return {ok:true,count:results.length,uniqueThemes:new Set(results.map(x=>x.theme)).size,results};
  });
  if(!addedMapProbe.ok||addedMapProbe.count!==8||addedMapProbe.uniqueThemes<5)throw new Error('Added map selection/theme verification failed: '+JSON.stringify(addedMapProbe));
  await page.locator('#mapBtn').click();
  await page.locator('button[data-outlast3377-map="Ribhouse"]').click();
  const selectedMap=await page.evaluate(()=>save.map);
  if(selectedMap!=='Ribhouse')throw new Error('New map selection did not persist: '+selectedMap);
  await page.locator('#mapBtn').click();
  await page.locator('button[data-outlast3377-create-map]').click();
  await page.locator('#mcUnlock').waitFor({state:'visible',timeout:8000});
  const creatorAudit=await page.evaluate(()=>({unlock:!!document.getElementById('mcUnlock'),audit:typeof window.OUTLAST_MAP_CREATOR_AUDIT==='function'?window.OUTLAST_MAP_CREATOR_AUDIT():null}));
  if(!creatorAudit.unlock||!creatorAudit.audit)throw new Error('Map Creator did not open its unlock/editor screen: '+JSON.stringify(creatorAudit));
  const creatorBuild=await page.evaluate(()=>window.OUTLAST_BUILD||null);
  if(creatorBuild!=='4.5.1')throw new Error('Opening Map Creator reverted the current build marker: '+creatorBuild);
  await page.locator('#closeSub').click();
  const skillPrep=await page.evaluate(()=>{save.coins=Math.max(Number(save.coins)||0,10000);persist();return {coins:save.coins};});
  if(skillPrep.coins<900)throw new Error('Skill test could not fund Blink: '+JSON.stringify(skillPrep));
  await page.locator('.menu-nav-btn[data-page="loadout"]').click();
  await page.locator('#skillBtn').click();
  await page.locator('button[data-action="skill"][data-value="Blink"]').waitFor({state:'visible',timeout:8000});
  await page.locator('button[data-action="skill"][data-value="Blink"]').click();
  const chosenSkill=await page.evaluate(()=>({skill:save.activeSkill,owned:!!save.ownedSkills?.Blink}));
  if(chosenSkill.skill!=='Blink'||!chosenSkill.owned)throw new Error('Active Skill could not be purchased/equipped: '+JSON.stringify(chosenSkill));
  await page.locator('#closeSub').click();
  await page.evaluate(()=>{if(typeof closeSub==='function')closeSub();const panel=document.getElementById('subPanel');if(panel)panel.style.display='none';});
  await page.waitForFunction(()=>{const panel=document.getElementById('subPanel');return !panel||getComputedStyle(panel).display==='none';});
  await page.locator('.menu-nav-btn[data-page="play"]').click();
  const skinPrep=await page.evaluate(()=>{
    if(typeof skins==='undefined'||typeof save==='undefined') return {ok:false};
    const name=Object.keys(skins).find(n=>n!=='Classic');
    if(!name) return {ok:false,reason:'no non-Classic skin definition'};
    save.skins=save.skins||{};save.skins[name]=true;save.selectedSkin=name;persist();
    return {ok:true,name};
  });
  await page.locator('#startBtn').click();
  await page.waitForTimeout(2500);

  const addedMapRenderProbe=await page.evaluate(()=>{
    const original=String(save.map||'Forest'),names=['The Void','Neon District','Crystal Caverns'];
    const results=[];
    for(const name of names){
      if(!mapDefs[name]||!Array.isArray(mapObstacles[name]))return {ok:false,missing:name,results};
      const beforeTerrain=Number(window.OUTLAST_MAP_TERRAIN_RENDER_COUNT_V434)||0;
      const beforeObjects=Number(window.OUTLAST_MAP_OBJECT_RENDER_COUNT_V434)||0;
      save.map=name;game.map=name;game.mapEventTimer=(mapHazards[name]||mapHazards.Forest).interval;
      if(typeof draw==='function')draw();
      results.push({name,terrain:window.OUTLAST_MAP_LAST_TERRAIN_RENDER_V434,objects:window.OUTLAST_MAP_LAST_OBJECT_RENDER_V434,
        terrainCount:(Number(window.OUTLAST_MAP_TERRAIN_RENDER_COUNT_V434)||0)-beforeTerrain,
        objectCount:(Number(window.OUTLAST_MAP_OBJECT_RENDER_COUNT_V434)||0)-beforeObjects,
        palette:mapDefs[name].bg,props:mapObstacles[name].length});
    }
    save.map=original;game.map=original;game.mapEventTimer=(mapHazards[original]||mapHazards.Forest).interval;
    if(typeof draw==='function')draw();
    return {ok:results.every(x=>x.terrain===x.name&&x.objects===x.name&&x.terrainCount>0&&x.objectCount>0&&x.props>=12),
      uniquePalettes:new Set(results.map(x=>x.palette)).size,results};
  });
  if(!addedMapRenderProbe.ok||addedMapRenderProbe.uniquePalettes!==3){
    throw new Error('New map canvas renderer did not draw unique terrain and themed props: '+JSON.stringify(addedMapRenderProbe));
  }

  const layoutAudit=await page.evaluate(()=>{
    const buttons=[...document.querySelectorAll('#menu .menu-page button')].map(b=>({id:b.id,text:(b.innerText||b.textContent||'').replace(/\s+/g,' ').trim(),page:b.closest('.menu-page')?.dataset.pageContent||''}));
    const count=needle=>buttons.filter(b=>b.text.toLowerCase().includes(needle)).length;
    const shopCount=buttons.filter(b=>{const t=b.text.toLowerCase();return t.includes('daily shop')||t.includes('open shop')}).length;
    const duplicateIds=[...document.querySelectorAll('#menu button[id]')].map(b=>b.id).filter((id,i,a)=>id&&a.indexOf(id)!==i);
    return {counts:{inventory:count('inventory'),skins:count('skin'),shop:shopCount,modifiers:count('run modifiers'),oldCollectionHub:count('new content / collection')},matches:{inventory:buttons.filter(b=>b.text.toLowerCase().includes('inventory')),skins:buttons.filter(b=>b.text.toLowerCase().includes('skin')),shop:buttons.filter(b=>{const t=b.text.toLowerCase();return t.includes('daily shop')||t.includes('open shop')}),modifiers:buttons.filter(b=>b.text.toLowerCase().includes('run modifiers'))},duplicateButtonIds:[...new Set(duplicateIds)],progressDeck:!!document.getElementById('progressDeck37'),progressPage:!!document.querySelector('[data-page-content="progress"]'),legacyCards:!!document.querySelector('[data-page-content="progress"] .menu-cards'),progress36:!!document.getElementById('progressSystems36'),systemsReady:!!window.OUTLAST_37_READY,build:window.OUTLAST_BUILD||null,installError:window.__OUTLAST37_INSTALL_ERROR||null,loadedSystemScripts:[...document.scripts].map(s=>s.src).filter(s=>s.includes('v3360')||s.includes('v3370'))};
  });
  for(const [action,count] of Object.entries(layoutAudit.counts)){
    const expected=action==='oldCollectionHub'?0:1;
    if(count!==expected)throw new Error('Duplicate or missing '+action+' entry point(s): '+JSON.stringify({layoutAudit,consoleErrors}));
  }
  if(layoutAudit.duplicateButtonIds.length)throw new Error('Duplicate button IDs remain in the menu: '+JSON.stringify(layoutAudit));

  const state=await page.evaluate(()=>window.__OUTLAST_RUNTIME_STATE||null);
  if(!state) throw new Error('Runtime heartbeat was not published; game loop is not running.');
  const runSkill=await page.evaluate(()=>game.player?.activeSkill||null);
  if(runSkill!=='Blink')throw new Error('Equipped skill was not copied into the run: '+runSkill);
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
  const afkReady=await page.locator('#outlastAFKSpotButton').waitFor({state:'visible',timeout:8000}).then(()=>true).catch(()=>false);
  if(!afkReady)throw new Error('AFK Spot button did not appear during gameplay.');
  await page.locator('#outlastAFKSpotButton').click();
  await page.locator('#outlastAFKLounge').waitFor({state:'visible',timeout:3000});
  const afkBefore=await page.evaluate(()=>({paused:game.paused,active:window.OUTLAST_AFK_ACTIVE,time:game.time}));
  if(!afkBefore.paused||!afkBefore.active)throw new Error('AFK Lounge did not pause the run: '+JSON.stringify(afkBefore));
  await page.waitForTimeout(650);
  const afkDuring=await page.evaluate(()=>({paused:game.paused,time:game.time}));
  if(!afkDuring.paused||Math.abs(afkDuring.time-afkBefore.time)>.08)throw new Error('Game time advanced inside the AFK Lounge: '+JSON.stringify({afkBefore,afkDuring}));
  await page.locator('#outlastAFKResume').click();
  const afkAfter=await page.evaluate(()=>({paused:game.paused,active:window.OUTLAST_AFK_ACTIVE}));
  if(afkAfter.paused||afkAfter.active)throw new Error('AFK Resume did not restore gameplay: '+JSON.stringify(afkAfter));
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
    localStorage.setItem('outlast_update_ack_v4.0.0','1');
    localStorage.setItem('outlast_update_ack_v4.5.1','1');
    localStorage.setItem('outlast_update_ack_v3.37.0','1');
    localStorage.setItem('outlastSeenUpdateVersion','3.37.16');
    localStorage.setItem('outlastNewPlayerTutorialV317','1');
  });
  const mobileUrl=(process.env.OUTLAST_RUNTIME_TEST_URL||'https://outlast-game.onrender.com/index.html')+'?mobileE2E='+Date.now();
  await mobilePage.goto(mobileUrl,{waitUntil:'domcontentloaded',timeout:30000});
  await mobilePage.waitForSelector('#startBtn',{state:'visible',timeout:15000});
  await mobilePage.waitForTimeout(400);
  if (await mobilePage.locator('#outlastV4000GotIt').isVisible().catch(()=>false)) {
    await mobilePage.locator('#outlastV4000GotIt').click();
  }
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
  const mobileMapVisual=await mobilePage.evaluate(()=>{
    const modal=document.getElementById('outlast3377MapPickerModal');
    const first=[...(modal?.querySelectorAll('button[data-outlast3377-map]')||[])].slice(0,2);
    return {banner:!!modal?.querySelector('.outlast3377-map-new-banner'),keys:first.map(b=>b.getAttribute('data-outlast3377-map')),badges:first.map(b=>!!b.querySelector('.outlast3377-map-new'))};
  });
  if(!mobileMapVisual.banner||mobileMapVisual.keys.join(',')!=='Seizure,Ribhouse'||mobileMapVisual.badges.some(v=>!v))throw new Error('New maps are not prominent on mobile: '+JSON.stringify(mobileMapVisual));
  await mobilePage.locator('button[data-outlast3377-map="Ribhouse"]').tap();
  const mobileMapSelected=await mobilePage.evaluate(()=>save.map);
  if(mobileMapSelected!=='Ribhouse')throw new Error('Mobile map selection failed: '+mobileMapSelected);
  await mobilePage.locator('#startBtn').tap();
  await mobilePage.waitForTimeout(2200);
  await mobilePage.waitForFunction(()=>!game.upgradeOpen||performance.now()>=Number(game.__upgradeRollUnlockAt||0)+75,{timeout:15000});
  const cardRendererAudit=await mobilePage.evaluate(()=>{
    const before={running:game.running,paused:game.paused,over:game.over,open:game.upgradeOpen,choices:game.upgradeChoices,rolling:game.__upgradeRollActive};
    if(!game.player)return {ready:false,reason:'player not initialized'};
    const ctx=document.getElementById('game')?.getContext('2d'),baseFill=ctx?.fillText,renderedText=[];
    try{
      if(ctx&&baseFill)ctx.fillText=function(text,...args){renderedText.push(String(text));return baseFill.call(this,text,...args)};
      game.running=true;game.over=false;game.paused=true;game.upgradeOpen=true;game.__upgradeRollActive=false;
      game.upgradeChoices=[
        ['Ascension • Renewal Circuit [Uncommon]','Regenerate +0.03 HP every second, including during long survival runs.',function(){},'Uncommon'],
        ['Ascension • Renewal Circuit [Mythic]','Regenerate +0.07 HP per second and gain a stronger recovery bonus.',function(){},'Mythic'],
        ['Omega Guardian: Infinite Renewal Circuit [Omega]','Restore health more quickly and create a protective field around the player.',function(){},'Omega']
      ];
      draw();
      const audit=window.OUTLAST_UPGRADE_CARD_DESIGN_V435?.audit?.()||null;
      const visibleTitle=renderedText.some(t=>t.includes('Renewal Circuit'));
      const visibleFooter=renderedText.some(t=>t.includes('RARITY MULTIPLIER'));
      const visibleInteractionHint=renderedText.some(t=>t.includes('PRESS 1')||t.includes('WAIT FOR REVEAL'));
      return {ready:!!audit?.renderHook&&audit.active&&audit.choices===3&&visibleTitle&&visibleFooter&&visibleInteractionHint,
        error:audit?.error||window.OUTLAST_V435_CARD_ERROR||null,visibleTitle,visibleFooter,visibleInteractionHint,build:window.OUTLAST_BUILD,renderedText:renderedText.slice(-45)};
    } finally {if(ctx&&baseFill)ctx.fillText=baseFill;game.running=before.running;game.paused=before.paused;game.over=before.over;game.upgradeOpen=before.open;game.upgradeChoices=before.choices;game.__upgradeRollActive=before.rolling;draw();}
  });
  if(!cardRendererAudit.ready||cardRendererAudit.error)throw new Error('v4.5.1 redesigned upgrade cards failed the long-title/text rendering check: '+JSON.stringify(cardRendererAudit));
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
