/* OUTLAST v3.14.23 — Full Event Expansion • timing source shared by countdown + calendar */
(function(){
  'use strict';
  if(window.__OUTLAST_EVENT_EXPANSION__) return;
  window.__OUTLAST_EVENT_EXPANSION__=true;

  const EVENT_CONFIG={
    id:'nightfall-october-2026',
    name:'Nightfall / October Event',
    startAt:Number(window.OUTLAST_EVENT_TARGET_MS)||new Date('2026-10-03T15:00:00Z').getTime()
  };
  const IS_TESTER=/outlast-test(?:\.onrender\.com)?$/i.test(location.hostname);
  const EVENT_AT=EVENT_CONFIG.startAt;
  const API='https://outlast-test-server.onrender.com';
  const KEY='outlastEventExpansionV323';
  const defaults={
    coins:0,contrib:0,clues:0,clueCooldown:0,completedRuns:0,bossDefeated:false,
    activated:false,rewardClaimed:false,finaleSeen:false,aftermath:false,encounters:0,
    missions:{clues:0,runs:0,boss:0,coins:0,contrib:0},
    achievements:{},purchases:{}
  };
  let state={...defaults,...safeLoad()};
  state.missions={...defaults.missions,...(state.missions||{})};
  state.achievements={...(state.achievements||{})};
  state.purchases={...(state.purchases||{})};

  function safeLoad(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(_){return {}}}
  function saveState(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(_){}}
  function qs(s){try{return document.querySelector(s)}catch(_){return null}}
  function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function remaining(){return Math.max(0,(Number(window.OUTLAST_EVENT_TARGET_MS)||EVENT_AT)-Date.now())}
  function phase(){return remaining()===0?'LIVE':remaining()<=86400000?'FINAL':'BUILDUP'}
  function fmt(ms){let sec=Math.floor(ms/1000),d=Math.floor(sec/86400);sec%=86400;let h=Math.floor(sec/3600);sec%=3600;let m=Math.floor(sec/60);sec%=60;return d+'d '+String(h).padStart(2,'0')+'h '+String(m).padStart(2,'0')+'m '+String(sec).padStart(2,'0')+'s'}
  function eventDateText(){
    return new Date(EVENT_AT).toLocaleString([],{
      weekday:'long',year:'numeric',month:'long',day:'numeric',
      hour:'numeric',minute:'2-digit'
    });
  }
  function showCalendar(){
    const r=remaining(),p=phase();
    openModal('EVENT CALENDAR',
      '<div class="oeb23-card"><h4>'+esc(EVENT_CONFIG.name)+'</h4>'+
      '<div>'+esc(eventDateText())+'</div>'+
      '<div class="oeb23-muted">This is the exact timestamp used by the live event countdown.</div></div>'+
      '<div class="oeb23-card"><h4>Countdown</h4><div><b>'+(p==='LIVE'?'LIVE':fmt(r))+'</b></div></div>');
  }
  function toastMsg(msg){try{if(typeof toast==='function')toast(msg)}catch(_){}}

  const clueNames=['Broken Signal Fragment','Unknown Coordinate','Damaged Access Key','Encrypted Warning','Strange Symbol'];
  const broadcasts=[
    ['SIGNAL DETECTED...','Something has started transmitting beneath the OUTLAST network.'],
    ['...CAN ANYONE HEAR THIS?','The signal is getting stronger. Stay alert.'],
    ['THEY KNOW WE\'RE HERE.','Unknown activity is approaching the event access point.'],
    ['PROTOCOL ACTIVATION PENDING.','All survivors: prepare for incoming protocol activation.']
  ];
  const missions=[
    ['Signal Hunter','Collect all 5 investigation clues',5,()=>state.clues],
    ['Field Response','Complete 3 event runs',3,()=>state.completedRuns],
    ['Breach Protocol','Defeat the event boss',1,()=>state.bossDefeated?1:0],
    ['Signal Scavenger','Earn 100 event coins',100,()=>state.coins],
    ['Community Effort','Contribute 25 community points',25,()=>state.contrib]
  ];
  const shop=[
    ['eventBadge','🎃 Signal Breaker Badge',50,'Permanent profile badge'],
    ['signalFrame','📡 Signal Frame',75,'Permanent profile frame'],
    ['riftTitle','⚡ RIFT RESPONDER title',100,'Permanent profile title'],
    ['pumpkinPulse','🎃 Pumpkin Pulse effect',125,'Permanent reward effect'],
    ['riftWeapon','🌀 Riftbreaker weapon skin',175,'Permanent cosmetic weapon skin']
  ];

  function ensureCss(){
    if(qs('#oeb23Css'))return;
    const s=document.createElement('style');s.id='oeb23Css';s.textContent=`
      .oeb-overlay{position:fixed;inset:0;background:rgba(2,7,12,.78);z-index:99990;display:flex;align-items:center;justify-content:center;padding:18px}
      .oeb-modal{width:min(680px,100%);max-height:88vh;overflow:auto;background:#0b1722;border:1px solid #41677b;border-radius:20px;padding:22px;box-shadow:0 20px 80px #000}
      .oeb-kicker{font-size:10px;letter-spacing:1.4px;color:#70d7c7;font-weight:800}.oeb-row{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.oeb-btn{border:1px solid #37627a;background:#142738;color:#eaf5ff;border-radius:8px;padding:7px 9px;cursor:pointer;font-size:10px;font-weight:800}
      #oeb23Root{font-family:inherit;color:#eaf5ff}
      .oeb23-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
      .oeb23-card{padding:11px;border:1px solid #29475b;background:#0e1c28;border-radius:11px}
      .oeb23-card h4{margin:0 0 5px;font-size:13px}.oeb23-muted{color:#8fa6b9;font-size:12px;line-height:1.4}
      .oeb23-progress{height:8px;border-radius:99px;background:#071017;overflow:hidden;border:1px solid #263e50;margin:7px 0}.oeb23-fill{height:100%;width:0;background:#4ca7cc}
      .oeb23-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.oeb23-btn{border:1px solid #37627a;background:#142738;color:#eaf5ff;border-radius:8px;padding:7px 9px;font-size:10px;font-weight:800;cursor:pointer}
      .oeb23-btn.green{background:#275d43}.oeb23-btn.gold{background:#68511b}.oeb23-btn:disabled{opacity:.45;cursor:not-allowed}
      .oeb23-terminal{margin-top:9px;padding:10px;border:1px dashed #47718a;border-radius:10px;background:#0b1721}
      .oeb23-terminal strong{font-size:12px}
      @media(max-width:650px){.oeb23-grid{grid-template-columns:1fr}}
    `;document.head.appendChild(s);
  }
  function openModal(title,body){
    ensureCss();
    const o=document.createElement('div');o.className='oeb-overlay';o.innerHTML='<div class="oeb-modal" id="oeb23Root"><div class="oeb-kicker">OUTLAST EVENT PROTOCOL</div><h2>'+esc(title)+'</h2>'+body+'<div class="oeb-row"><button class="oeb-btn" data-close>CLOSE</button></div></div>';
    document.body.appendChild(o);
    o.addEventListener('click',e=>{if(e.target===o||e.target.closest('[data-close]'))o.remove()});
    return o;
  }
  async function server(path,opts){
    if(IS_TESTER)return null;
    try{const r=await fetch(API+path,{cache:'no-store',headers:{'Content-Type':'application/json'},...opts});const d=await r.json();if(!r.ok)throw new Error(d.error||'Server request failed');return d}catch(e){return null}
  }
  async function syncCommunity(){
    const d=await server('/api/event/state');
    if(d?.ok){
      state.globalProgress=Math.max(0,Math.min(100,Number(d.progress?.percent)||0));
      state.globalContrib=Math.max(0,Math.floor(Number(d.progress?.points)||0));
      state.globalGoal=Math.max(1,Math.floor(Number(d.progress?.goal)||5000));
    }else{
      state.globalProgress=Math.min(100,Math.max(Number(state.globalProgress)||0,Math.floor((Number(state.contrib)||0)/50)));
      state.globalContrib=Number(state.globalContrib)||0;state.globalGoal=5000;
    }
    saveState();
  }
  async function contribute(points,reason){
    const n=Math.max(1,Math.min(25,Math.floor(Number(points)||1)));
    const d=await server('/api/event/contribute',{method:'POST',body:JSON.stringify({username:currentUser(),points:n,reason})});
    if(!d?.progress)return false;
    state.contrib+=n;state.missions.contrib=state.contrib;
    state.globalProgress=Number(d.progress.percent)||0;state.globalContrib=Number(d.progress.points)||0;state.globalGoal=Number(d.progress.goal)||5000;
    saveState();
    return true;
  }
  function currentUser(){
    try{return String((window.save&&window.save.username)||localStorage.getItem('outlastUsername')||'Player').slice(0,18)}catch(_){return 'Player'}
  }

  function setAchievement(id,name,desc){
    if(state.achievements[id])return false;
    state.achievements[id]={name,desc,at:Date.now()};saveState();
    toastMsg('🏆 EVENT ACHIEVEMENT: '+name);
    return true;
  }
  function checkAchievements(){
    if(state.clues>=1)setAchievement('firstContact','First Contact','Recovered your first event clue.');
    if(state.clues>=5)setAchievement('signalBreaker','Signal Breaker','Completed the five-clue investigation.');
    if(state.completedRuns>=1)setAchievement('fieldResponder','Field Responder','Completed your first event run.');
    if(state.bossDefeated)setAchievement('breachSurvivor','Breach Survivor','Defeated the event boss.');
    if(state.aftermath)setAchievement('aftermathWitness','Aftermath Witness','Witnessed the permanent aftermath.');
    if(state.contrib>=25)setAchievement('community','Community Signal','Contributed 25 community points.');
  }

  function scanClue(){
    if(phase()==='LIVE'){openModal('EVENT ACTIVE','<p>The investigation terminal is now locked. The event access point is active.</p><div class="oeb23-terminal"><strong>EVENT TERMINAL ONLINE</strong><div class="oeb23-muted">Use ACCESS to enter the event run.</div></div>');return}
    if(state.clues>=5){openModal('INVESTIGATION COMPLETE','All five clues have been recovered. The signal is fully decoded.');return}
    if(Date.now()<Number(state.clueCooldown||0)){openModal('SIGNAL COOLDOWN','The scanner needs time to recover.<p><b>'+Math.ceil((state.clueCooldown-Date.now())/60000)+' minutes</b> remaining.</p>');return}
    const clue=clueNames[state.clues];
    state.clues++;
    state.missions.clues=state.clues;
    state.coins+=25;
    state.missions.coins=state.coins;
    state.clueCooldown=Date.now()+3000;
    saveState();contribute(5,'clue');checkAchievements();
    openModal('CLUE RECOVERED','<div class="oeb23-card"><h4>'+esc(clue)+'</h4><div class="oeb23-muted">A piece of the event mystery has been archived.</div></div><p>Investigation: <b>'+state.clues+'/5</b> • Event Coins: <b>'+state.coins+'</b></p>');
  }

  function showInvestigation(){
    const list=clueNames.map((x,i)=>'<div class="oeb23-card"><b>'+(i<state.clues?'✓ ':'? ')+'</b>'+esc(x)+'</div>').join('');
    const m=openModal('EVENT INVESTIGATION','<div class="oeb23-grid">'+list+'</div><p class="oeb23-muted">Each scan recovers one clue. The cooldown is short for testing, then the full event progression continues.</p><div class="oeb23-actions"><button class="oeb23-btn green" data-scan>SCAN FOR CLUE</button></div>');
    m.querySelector('[data-scan]').onclick=()=>{m.remove();scanClue()};
  }

  function showBroadcast(){
    const index=Math.min(3,Math.max(0,Math.floor((Math.max(0,(EVENT_AT-Date.now()))/86400000))));
    const b=broadcasts[Math.min(3,3-index)]||broadcasts[3];
    openModal('INCOMING TRANSMISSION','<div class="oeb23-card"><h4>'+esc(b[0])+'</h4><div>'+esc(b[1])+'</div></div><p class="oeb23-muted">Transmissions unlock as the countdown approaches zero.</p>');
  }

  function missionDone(m){return Number(m[3]?.()||0)>=m[2]}
  function rewardForMission(i){
    if(state.missions['claim'+i])return;
    const m=missions[i];if(!missionDone(m))return;
    state.missions['claim'+i]=true;state.coins+=40;state.missions.coins=state.coins;saveState();contribute(2,'mission');toastMsg('🎁 Mission reward: +40 Event Coins');checkAchievements();
  }
  function showMissions(){
    const cards=missions.map((m,i)=>{const v=Math.min(m[2],Number(m[3]())||0),done=v>=m[2];return '<div class="oeb23-card"><h4>'+esc(m[0])+'</h4><div class="oeb23-muted">'+esc(m[1])+'</div><div class="oeb23-progress"><div class="oeb23-fill" style="width:'+Math.floor(v/m[2]*100)+'%"></div></div><div>'+v+'/'+m[2]+' '+(done?'✓ COMPLETE':'')+'</div><div class="oeb23-actions">'+(done?'<button class="oeb23-btn gold" data-mission="'+i+'">'+(state.missions['claim'+i]?'CLAIMED':'CLAIM +40')+'</button>':'')+'</div></div>'}).join('');
    const m=openModal('EVENT MISSIONS','<div class="oeb23-grid">'+cards+'</div><p><b>Event Coins: '+state.coins+'</b></p>');
    m.querySelectorAll('[data-mission]').forEach(b=>b.onclick=()=>{rewardForMission(Number(b.dataset.mission));m.remove();showMissions()});
  }

  function buyShop(i){
    const item=shop[i];if(state.purchases[item[0]])return;
    if(state.coins<item[2]){toastMsg('Need '+(item[2]-state.coins)+' more Event Coins');return}
    state.coins-=item[2];state.purchases[item[0]]=true;saveState();checkAchievements();
    toastMsg('🛒 Unlocked: '+item[1]);
    openModal('ITEM UNLOCKED','<div class="oeb23-card"><h4>'+esc(item[1])+'</h4><div class="oeb23-muted">'+esc(item[3])+'</div></div><p>Event Coins remaining: <b>'+state.coins+'</b></p>');
  }
  function showShop(){
    const cards=shop.map((x,i)=>'<div class="oeb23-card"><h4>'+esc(x[1])+'</h4><div class="oeb23-muted">'+esc(x[3])+'</div><p><b>'+x[2]+' Event Coins</b></p><button class="oeb23-btn gold" '+(state.purchases[x[0]]?'disabled':'')+' data-buy="'+i+'">'+(state.purchases[x[0]]?'UNLOCKED':'BUY')+'</button></div>').join('');
    const m=openModal('LIMITED EVENT SHOP','<p>Event Coins: <b>'+state.coins+'</b></p><div class="oeb23-grid">'+cards+'</div>');
    m.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>{buyShop(Number(b.dataset.buy));m.remove();showShop()});
  }

  async function showLeaderboard(){
    const d=await server('/api/event/leaderboard?limit=10');
    const entries=d?.entries||[];
    const body=entries.length?entries.map((x,i)=>'<div class="oeb23-card"><b>#'+(i+1)+' '+esc(x.username||x.name)+'</b><div class="oeb23-muted">'+(x.points||0)+' contribution points • '+(x.bosses||0)+' boss clears</div></div>').join(''):'<div class="oeb23-card">No event records yet.</div>';
    openModal('EVENT LEADERBOARD','<div class="oeb23-grid">'+body+'</div><p class="oeb23-muted">The community leaderboard is server-backed when the event service is online.</p>');
  }

  async function terminalAccess(){
    if(state.bossDefeated){openModal('EVENT COMPLETE','The Rift Pumpkin has already been defeated on this account. Your event rewards remain unlocked.');return}
    let live=phase()==='LIVE';
    if(!IS_TESTER){
      const auth=await server('/api/event/state');
      if(auth?.schedule)live=Boolean(auth.schedule.live)||(Boolean(auth.active)&&String(auth.globalEvent?.type||'')==='october');
    }
    if(!live){openModal('ACCESS LOCKED','The event terminal will unlock when the authoritative countdown reaches zero.');return}
    state.activated=true;saveState();checkAchievements();
    if(window.game&&game.running){
      game.eventRun=true;
      spawnEventBoss();
      return;
    }
    openModal('EVENT TERMINAL ONLINE','<div class="oeb23-terminal"><strong>🎃 RIFT BREACH DETECTED</strong><div class="oeb23-muted">Start an Event Run to enter the breach. The event boss can appear during the run.</div><div class="oeb23-actions"><button class="oeb23-btn green" data-start>START EVENT RUN</button></div></div>');
    const m=document.querySelector('.oeb-overlay:last-child');
    m?.querySelector('[data-start]')?.addEventListener('click',()=>{m.remove();startEventRun()});
  }

  function startEventRun(){
    try{
      if(window.game&&game.running){spawnEventBoss();return}
      if(typeof startGame==='function')startGame();
      setTimeout(()=>{if(window.game&&game.running){game.eventRun=true;saveState();spawnEventBoss()}},1200);
    }catch(_){toastMsg('Unable to start the event run from the current screen.')}
  }

  function spawnEventBoss(){
    try{
      if(!window.game||!game.running||game.over){toastMsg('Start a run before entering the breach.');return}
      if(state.bossDefeated)return;
      game.eventRun=true;
      if(game.enemies.some(e=>e&&e.eventBoss))return;
      if(typeof spawnBoss!=='function')return;
      const before=game.enemies.length;
      spawnBoss();
      const boss=game.enemies.slice(before).find(e=>e&&e.boss)||game.enemies[game.enemies.length-1];
      if(boss){
        boss.eventBoss=true;boss.eventName='Rift Pumpkin';boss.bossEmoji='🎃';
        boss.max*=1.8;boss.hp=boss.max;boss.damage*=1.2;boss.speed*=1.08;boss.shoot=Math.max(.6,(boss.shoot||1.5)*.9);
        state.activated=true;saveState();toastMsg('🎃 RIFT PUMPKIN BOSS INCOMING!');
        contribute(10,'boss-summon');
      }
    }catch(_){}
  }

  let lastRun=false,lastBoss=false,lastPhase=phase(),encounterTimer=0,lastTick=0;
  function eventTick(){
    const p=phase();
    if(p!==lastPhase){
      lastPhase=p;
      if(p==='LIVE'&&!state.finaleSeen){state.finaleSeen=true;saveState();openFinale()}
    }
    if(window.game&&game.running&&!game.over){
      if(!game.eventRun){encounterTimer=0;lastBoss=false;}
      else {
        encounterTimer++;
        if(encounterTimer>=45){encounterTimer=0;eventEncounter()}
      }
      const activeBoss=game.eventRun&&game.enemies.some(e=>e&&e.eventBoss);
      if(lastBoss&& !activeBoss && !state.bossDefeated){
        state.bossDefeated=true;state.coins+=150;state.missions.boss=1;state.missions.coins=state.coins;state.aftermath=true;saveState();contribute(15,'boss-clear');checkAchievements();openModal('RIFT BREACH CLOSED','<div class="oeb23-card"><h4>🎃 Event Boss Defeated</h4><div class="oeb23-muted">+150 Event Coins • the aftermath is now permanently unlocked.</div></div>');
      }
      if(!lastRun){lastRun=true}
    }
    if(window.game&&game.over&&lastRun){
      if(game.eventRun){
        state.completedRuns++;state.missions.runs=state.completedRuns;saveState();contribute(3,'event-run');checkAchievements();
      }
      game.eventRun=false;lastRun=false;saveState();
    }
    lastBoss=!!(window.game&&game.eventRun&&game.running&&!game.over&&game.enemies.some(e=>e&&e.eventBoss));
    if(Date.now()-lastTick>15000){lastTick=Date.now();syncCommunity()}
  }
  function eventEncounter(){
    if(!window.game||!game.running||game.over||!game.eventRun||phase()!=='LIVE')return;
    state.encounters++;state.coins+=10;state.missions.coins=state.coins;saveState();contribute(2,'encounter');
    toastMsg('📡 SIGNAL CACHE FOUND • +10 EVENT COINS');
    checkAchievements();
  }

  function openFinale(){
    openModal('🎃 PROTOCOL ACTIVATION','<div class="oeb23-card"><h4>SIGNAL LOCKED → ACCESS POINT ONLINE</h4><div class="oeb23-muted">The countdown is over. The event terminal is active and the Rift Pumpkin breach is open.</div></div><div class="oeb23-actions"><button class="oeb23-btn green" data-access>ENTER EVENT</button><button class="oeb23-btn" data-shop>SHOP</button></div>');
    const m=document.querySelector('.oeb-overlay:last-child');
    m?.querySelector('[data-access]')?.addEventListener('click',()=>{m.remove();terminalAccess()});
    m?.querySelector('[data-shop]')?.addEventListener('click',()=>{m.remove();showShop()});
  }

  function showAftermath(){
    openModal('EVENT AFTERMATH','<div class="oeb23-card"><h4>THE SIGNAL REMAINS.</h4><div class="oeb23-muted">The breach has closed, but your event rewards, achievements, cosmetics, and title remain permanently unlocked.</div></div><div class="oeb23-grid"><div class="oeb23-card"><h4>Achievements</h4><div>'+Object.keys(state.achievements).length+'</div></div><div class="oeb23-card"><h4>Event Coins</h4><div>'+state.coins+'</div></div></div>');
  }

  function showDetails(){
    syncCommunity();
    const p=phase(),pct=Number(state.globalProgress)||0;
    const missionCount=missions.filter(missionDone).length;
    const body='<p><b>'+(p==='LIVE'?'EVENT ACTIVE':p==='FINAL'?'FINAL 24-HOUR WARNING':'EVENT INCOMING')+'</b></p>'+
      '<div class="oeb23-grid">'+
      '<div class="oeb23-card"><h4>Countdown</h4><div>'+(p==='LIVE'?'LIVE':fmt(remaining()))+'</div></div>'+
      '<div class="oeb23-card"><h4>Community Signal</h4><div>'+pct.toFixed(1)+'%</div><div class="oeb23-progress"><div class="oeb23-fill" style="width:'+pct+'%"></div></div><div class="oeb23-muted">'+(state.globalContrib||0)+' / '+(state.globalGoal||5000)+' points</div></div>'+
      '<div class="oeb23-card"><h4>Investigation</h4><div>'+state.clues+'/5 clues</div></div>'+
      '<div class="oeb23-card"><h4>Event Missions</h4><div>'+missionCount+'/5 complete</div></div>'+
      '</div>'+
      '<div class="oeb23-actions"><button class="oeb23-btn" data-i>INVESTIGATE</button><button class="oeb23-btn" data-b>BROADCAST</button><button class="oeb23-btn gold" data-m>MISSIONS</button><button class="oeb23-btn gold" data-s>SHOP</button><button class="oeb23-btn" data-l>LEADERBOARD</button><button class="oeb23-btn" data-c>CALENDAR</button><button class="oeb23-btn green" data-a>ACCESS</button></div>'+
      (state.aftermath?'<div class="oeb23-terminal"><strong>AFTERMATH ARCHIVE</strong><div class="oeb23-actions"><button class="oeb23-btn" data-after>VIEW AFTERMATH</button></div></div>':'');
    const m=openModal('EVENT PROTOCOL',body);
    m.querySelector('[data-i]').onclick=()=>{m.remove();showInvestigation()};
    m.querySelector('[data-b]').onclick=()=>{m.remove();showBroadcast()};
    m.querySelector('[data-m]').onclick=()=>{m.remove();showMissions()};
    m.querySelector('[data-s]').onclick=()=>{m.remove();showShop()};
    m.querySelector('[data-l]').onclick=()=>{m.remove();showLeaderboard()};
    m.querySelector('[data-c]').onclick=()=>{m.remove();showCalendar()};
    m.querySelector('[data-a]').onclick=()=>{m.remove();terminalAccess()};
    m.querySelector('[data-after]')?.addEventListener('click',()=>{m.remove();showAftermath()});
  }

  function rootRender(){
    const root=qs('#outlastEventBuild');if(!root)return;
    const p=phase(),r=remaining(),title=p==='LIVE'?'EVENT LIVE':p==='FINAL'?'FINAL WARNING':'EVENT';
    const count=p==='LIVE'?'LIVE':fmt(r);
    root.innerHTML='<div class="oeb-card '+(p==='FINAL'?'oeb-glitch':'')+'"><span class="oeb-title">'+title+'</span><span class="oeb-count">'+count+'</span><div class="oeb-row"><button class="oeb-btn" data-open>DETAILS</button></div></div>';
    root.querySelector('[data-open]').onclick=showDetails;
  }

  async function syncEventAuthority(){
    if(IS_TESTER)return null;
    const d=await server('/api/event/state');
    const start=Number(d?.schedule?.scheduledStartAt||0),serverNow=Number(d?.schedule?.serverNow||0);
    if(start>0&&serverNow>0){
      const offset=serverNow-Date.now();
      window.OUTLAST_EVENT_SERVER_OFFSET_MS=offset;
      window.OUTLAST_EVENT_TARGET_MS=start-offset;
      return d;
    }
    return null;
  }
  async function init(){
    ensureCss();
    await syncEventAuthority();
    rootRender();await syncCommunity();checkAchievements();
    if(phase()==='LIVE'&&!state.finaleSeen){state.finaleSeen=true;saveState();setTimeout(openFinale,120);}
    setInterval(()=>{rootRender();eventTick()},1000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();

  if(typeof updates!=='undefined'&&Array.isArray(updates)&&!updates.some(x=>Array.isArray(x)&&String(x[0]).includes('Event Bug Sweep'))){updates.unshift(['v3.27.104 — Event Bug Sweep','Hardened event timing, live access, contribution validation, event-run tracking, and repeat boss rewards.']);}
  if(typeof helpArticles!=='undefined'&&Array.isArray(helpArticles)&&!helpArticles.some(x=>Array.isArray(x)&&String(x[0]).includes('event timing and access'))){helpArticles.unshift(['How does event timing and access stay reliable?','Halloween Event','The event countdown uses one canonical timestamp. Live access and community contributions are checked against the event service, and event encounters/runs are only counted during actual event runs.']);}
  window.OUTLAST_EVENT_EXPANSION={showDetails,showInvestigation,showMissions,showShop,showLeaderboard,showCalendar,terminalAccess,spawnEventBoss};
})();