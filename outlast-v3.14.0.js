(function(){
'use strict';

/* OUTLAST v3.14.0 — Operations / Event / Progression expansion */
const V314='3.14.1';
const NIGHTFALL_TARGET=new Date(2026,9,1,12,0,0,0);
const OPS_KEY='v314Ops';
const DAILY_POOL=[
  {id:'sweep',name:'Zombie Sweep',desc:'Defeat 75 zombies across your runs today.',type:'kills',target:75,reward:125},
  {id:'salvage',name:'Salvage Run',desc:'Collect 300 run coins today.',type:'coins',target:300,reward:150},
  {id:'bossbreak',name:'Boss Breaker',desc:'Defeat 2 bosses today.',type:'bosses',target:2,reward:200},
  {id:'survive',name:'Night Watch',desc:'Survive 120 seconds across today’s runs.',type:'time',target:120,reward:175},
  {id:'deep',name:'Deep Run',desc:'Reach Level 12 in a run today.',type:'level',target:12,reward:225},
  {id:'veteran',name:'Veteran Sweep',desc:'Defeat 150 zombies today.',type:'kills',target:150,reward:250}
];
const WEEKLY_POOL=[
  {id:'wkKills',name:'Outlast the Horde',desc:'Defeat 500 zombies this week.',type:'kills',target:500,reward:600,keys:3},
  {id:'wkTime',name:'Long Watch',desc:'Survive 600 total seconds this week.',type:'time',target:600,reward:700,keys:4},
  {id:'wkBoss',name:'Boss Hunter',desc:'Defeat 8 bosses this week.',type:'bosses',target:8,reward:800,keys:5}
];
const MILESTONES=[
  {level:5,coins:75,keys:1,label:'Field Ready'},
  {level:10,coins:125,keys:1,label:'Deep Patrol'},
  {level:15,coins:200,keys:2,label:'Night Veteran'},
  {level:20,coins:300,keys:2,label:'Elite Survivor'},
  {level:25,coins:500,keys:3,label:'Extraction Ready'}
];
const PROTOCOLS=[
  {id:'nightfall',name:'Nightfall Protocol',desc:'Arms Blood Moon for the next run.',modifier:'BloodMoon'},
  {id:'salvage',name:'Salvage Protocol',desc:'Arms Treasure Rush for the next run.',modifier:'TreasureRush'},
  {id:'steel',name:'Steel Protocol',desc:'Arms Glass World for the next run.',modifier:'GlassWorld'}
];
const UPDATE_ITEMS=[
  'New Operations Center with rotating daily contracts and a weekly operation.',
  'New level milestone rewards at Levels 5, 10, 15, 20, and 25.',
  'Live Nightfall Event Center restored with the October 1, 2026 countdown.',
  'Nightfall Event becomes a live in-game state after the countdown reaches zero.',
  'New automatic Supply Drops during long runs, with faster drops during Nightfall.',
  'Added an in-run Threat Scanner showing live enemy pressure and boss danger.',
  'Added Deployment Protocol shortcuts for several existing high-intensity run setups.',
  'Added a persistent Loadout Snapshot for quick save/equip testing.',
  'Added a leaderboard server-status check inside Operations Center.',
  'Repaired Admin Event Preview routing so the button works in the active Admin Panel.',
  'Updated visible build/version metadata and release popup to v3.14.0.',
  'Mobile-safe controls and outside-click panel behavior are preserved for the new UI.'
];

function v314Storage(){
  if(typeof save==='undefined')return null;
  save[OPS_KEY]=save[OPS_KEY]||{};
  const o=save[OPS_KEY];
  if(!o.dailyKey)o.dailyKey='';
  if(!o.dailyProgress)o.dailyProgress={};
  if(!o.dailyClaims)o.dailyClaims={};
  if(!o.weekKey)o.weekKey='';
  if(!o.weekProgress)o.weekProgress=0;
  if(!o.weekClaimed)o.weekClaimed=false;
  if(!o.milestones)o.milestones={};
  if(!o.snapshot)o.snapshot=null;
  if(typeof o.nightfallClaimed!=='boolean')o.nightfallClaimed=false;
  if(o.dailyKey!==v314DayKey()){
    o.dailyKey=v314DayKey();o.dailyProgress={};o.dailyClaims={};
  }
  if(o.weekKey!==v314WeekKey()){
    o.weekKey=v314WeekKey();o.weekProgress=0;o.weekClaimed=false;
  }
  return o;
}
function v314DayKey(){
  const d=new Date();
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function v314WeekKey(){
  const d=new Date();
  const base=new Date(d.getFullYear(),d.getMonth(),d.getDate());
  const day=base.getDay()||7;
  base.setDate(base.getDate()-day+1);
  return base.getFullYear()+'-'+String(base.getMonth()+1).padStart(2,'0')+'-'+String(base.getDate()).padStart(2,'0');
}
function v314Hash(s){let n=0;for(let i=0;i<s.length;i++)n=((n<<5)-n+s.charCodeAt(i))|0;return Math.abs(n);}
function v314DailyOps(){
  const list=[],used=new Set(),seed=v314Hash(v314DayKey());
  for(let i=0;i<3;i++){
    let idx=(seed+i*7+i*i)%DAILY_POOL.length;
    while(used.has(idx))idx=(idx+1)%DAILY_POOL.length;
    used.add(idx);list.push(DAILY_POOL[idx]);
  }
  return list;
}
function v314WeeklyOp(){return WEEKLY_POOL[v314Hash(v314WeekKey())%WEEKLY_POOL.length];}
function v314Fmt(ms){
  const s=Math.max(0,Math.floor(ms/1000));
  const d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60),ss=s%60;
  if(d)return d+'d '+h+'h '+m+'m';
  if(h)return h+'h '+m+'m '+ss+'s';
  return m+'m '+String(ss).padStart(2,'0')+'s';
}
function v314EventLive(){return Date.now()>=NIGHTFALL_TARGET.getTime();}
function v314NightfallClaim(){
  const o=v314Storage();
  if(!o||!v314EventLive())return v314Toast('🌑 Nightfall is not live yet');
  if(o.nightfallClaimed)return v314Toast('Nightfall event reward already claimed');
  o.nightfallClaimed=true;
  save.coins=Math.round((Number(save.coins)||0)+1000);
  save.worldKeys=(Number(save.worldKeys)||0)+5;
  v314SafePersist();
  v314Toast('🌑 Nightfall reward claimed! +1000 coins • +5 World Keys');
  renderV314EventCenter();
}
function v314NightfallHUD(){
  let el=document.getElementById('v314NightfallHUD');
  if(!el){
    el=document.createElement('div');el.id='v314NightfallHUD';
    el.style.cssText='position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:20;display:none;padding:7px 13px;border:1px solid #8a6a19;border-radius:999px;background:rgba(24,13,8,.94);box-shadow:0 8px 24px rgba(0,0,0,.35);font:900 12px Arial;color:#f4d48a;pointer-events:none;text-align:center';
    document.body.appendChild(el);
  }
  if(typeof game==='undefined'||!game?.running||!v314EventLive()){el.style.display='none';return;}
  el.style.display='block';el.textContent='🌑 NIGHTFALL LIVE • SUPPLY DROPS BOOSTED';
}
function v314SafePersist(){try{if(typeof persist==='function')persist();}catch(_){} }
function v314Toast(msg){try{if(typeof toast==='function')toast(msg);}catch(_){} }
function v314Open(title,body){try{if(typeof openSub==='function')openSub(title,body);}catch(_){} }
function v314Progress(c){const o=v314Storage();return o?.dailyProgress?.[c.id]||0;}
function v314Esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}

function renderV314Operations(){
  const o=v314Storage();if(!o)return;
  const daily=v314DailyOps(),weekly=v314WeeklyOp();
  const dailyHtml=daily.map(c=>{
    const p=Math.min(c.target,v314Progress(c));
    const done=!!o.dailyClaims[c.id];
    const pct=Math.min(100,Math.round(p/c.target*100));
    return '<div class="option"><b>▣ '+v314Esc(c.name)+'</b><div class="small">'+v314Esc(c.desc)+'</div><div class="small" style="margin-top:7px">Progress: '+Math.floor(p)+' / '+c.target+' • Reward: '+c.reward+' coins</div><div style="height:7px;background:#0a1118;border-radius:999px;overflow:hidden;margin:8px 0"><div style="width:'+pct+'%;height:100%;background:#58b8df"></div></div><button class="'+(done||p<c.target?'':'gold')+'" data-action="v314ClaimDaily" data-value="'+c.id+'" '+(done||p<c.target?'disabled':'')+'>'+ (done?'✓ CLAIMED':p>=c.target?'CLAIM '+c.reward+' ●':'LOCKED') +'</button></div>';
  }).join('');
  const wp=Math.min(weekly.target,o.weekProgress||0),wDone=o.weekClaimed,pct=Math.min(100,Math.round(wp/weekly.target*100));
  const msHtml=MILESTONES.map(m=>{
    const done=!!o.milestones[m.level];
    return '<div class="option '+(done?'selected':'')+'"><b>Level '+m.level+' • '+v314Esc(m.label)+'</b><div class="small">Reward: '+m.coins+' coins + '+m.keys+' World Key'+(m.keys===1?'':'s')+'</div><div class="small">'+(done?'✓ Claimed':'Reach Level '+m.level+' in a run')+'</div></div>';
  }).join('');
  const snap=o.snapshot;
  const snapText=snap?'Saved: '+v314Esc(snap.char)+' • '+v314Esc(snap.weapon)+' • '+v314Esc(snap.map):'No loadout snapshot saved yet.';
  const protoHtml=PROTOCOLS.map(p=>'<button class="option" data-action="v314Protocol" data-value="'+p.modifier+'"><b>⚡ '+v314Esc(p.name)+'</b><div class="small">'+v314Esc(p.desc)+'</div></button>').join('');
  v314Open('🚨 Operations Center',
    '<div class="quick-card"><h3>FIELD OPERATIONS</h3><p>Complete contracts during normal play. Progress is saved locally and resets on the stated schedule.</p></div>'+
    '<h3 style="margin:12px 0 8px">DAILY CONTRACTS</h3><div class="grid">'+dailyHtml+'</div>'+
    '<h3 style="margin:16px 0 8px">WEEKLY OPERATION</h3><div class="option"><b>▣ '+v314Esc(weekly.name)+'</b><div class="small">'+v314Esc(weekly.desc)+'</div><div class="small" style="margin-top:7px">Progress: '+Math.floor(wp)+' / '+weekly.target+' • Reward: '+weekly.reward+' coins + '+weekly.keys+' Keys</div><div style="height:7px;background:#0a1118;border-radius:999px;overflow:hidden;margin:8px 0"><div style="width:'+pct+'%;height:100%;background:#b58c2a"></div></div><button class="gold" data-action="v314ClaimWeekly" '+(wDone||wp<weekly.target?'disabled':'')+'>'+(wDone?'✓ CLAIMED':wp>=weekly.target?'CLAIM WEEKLY REWARD':'LOCKED')+'</button></div>'+
    '<h3 style="margin:16px 0 8px">LEVEL MILESTONES</h3><div class="grid">'+msHtml+'</div>'+
    '<h3 style="margin:16px 0 8px">DEPLOYMENT PROTOCOLS</h3><div class="grid">'+protoHtml+'</div>'+
    '<h3 style="margin:16px 0 8px">LOADOUT SNAPSHOT</h3><div class="option"><b>💾 Quick Snapshot</b><div class="small">'+snapText+'</div><div class="row" style="margin-top:9px;justify-content:flex-start"><button class="green" data-action="v314SaveSnapshot">SAVE CURRENT</button><button data-action="v314LoadSnapshot" '+(snap?'':'disabled')+'>EQUIP SNAPSHOT</button></div></div>'+
    '<h3 style="margin:16px 0 8px">ONLINE SYNC</h3><div class="option"><b id="v314LeaderboardStatus">Leaderboard sync status: not checked</b><div class="small">Check the live leaderboard service without changing your score.</div><button class="menu-btn" style="margin-top:8px" data-action="v314LeaderboardCheck">CHECK SERVER</button></div>'
  );
}

function renderV314EventCenter(){
  const live=v314EventLive(),left=Math.max(0,NIGHTFALL_TARGET.getTime()-Date.now()),o=v314Storage(),claimed=!!o?.nightfallClaimed;
  v314Open('🌑 Nightfall Event Center',
    '<div class="quick-card"><h3>'+ (live?'🌑 NIGHTFALL IS LIVE':'🌑 NIGHTFALL DEPLOYS OCTOBER 1') +'</h3><p>'+(live?'The event is active. Supply Drops are boosted during Nightfall.':'The event activates at 12:00 PM (noon) local time on October 1, 2026.')+'</p></div>'+
    '<div class="option" style="text-align:center"><div class="small">EVENT COUNTDOWN</div><div id="v314EventBigCountdown" style="font-size:38px;font-weight:900;margin:8px 0">'+(live?'LIVE':'T− '+v314Fmt(left))+'</div><div class="small">October 1, 2026 • 12:00 PM (NOON) local time</div></div>'+
    '<div class="grid" style="margin-top:12px"><div class="option"><b>📦 Supply Drop Boost</b><div class="small">Nightfall supply drops arrive every 45 seconds and contain extra rewards.</div></div><div class="option"><b>🌑 Event Status</b><div class="small">'+(live?'ACTIVE':'SCHEDULED')+'</div></div><div class="option"><b>🎁 Event Reward</b><div class="small">Live players can claim one permanent event reward: 1,000 coins + 5 World Keys.</div><button class="'+(live&&!claimed?'gold':'menu-btn')+'" data-action="v314ClaimNightfall" '+(!live||claimed?'disabled':'')+' style="margin-top:8px;width:100%">'+(claimed?'✓ REWARD CLAIMED':live?'CLAIM NIGHTFALL REWARD':'LOCKED UNTIL LIVE')+'</button></div></div>'+
    '<div class="option" style="margin-top:12px"><b>👁️ Admin Preview</b><div class="small">Admin Event Preview is separate from the live event and never activates it.</div></div>'
  );
}

function v314EnsureCards(){
  const more=document.querySelector('.menu-page[data-page-content="more"] .menu-cards');
  if(more&&!document.getElementById('v314OperationsBtn')){
    more.insertAdjacentHTML('beforeend','<div class="menu-card"><h3>Operations</h3><button class="menu-btn gold" id="v314OperationsBtn">🚨 Operations Center</button><div class="small">Daily contracts, milestones, protocols, and sync tools.</div></div>');
  }
  const play=document.querySelector('.menu-page[data-page-content="play"] .menu-cards');
  if(play&&!document.getElementById('v314EventBtn')){
    play.insertAdjacentHTML('beforeend','<div class="menu-card" id="v314NightfallCard"><h3>Nightfall Event</h3><button class="menu-btn" id="v314EventBtn">🌑 Event Center</button><div class="small" id="v314CountdownMini">Calculating countdown…</div></div>');
  }
  const ob=document.getElementById('v314OperationsBtn');if(ob&&!ob.dataset.bound){ob.dataset.bound='1';ob.addEventListener('click',renderV314Operations);}
  const eb=document.getElementById('v314EventBtn');if(eb&&!eb.dataset.bound){eb.dataset.bound='1';eb.addEventListener('click',renderV314EventCenter);}
}

function v314TrackProgress(){
  if(typeof game==='undefined'||!game?.running||typeof run==='undefined')return;
  const o=v314Storage();if(!o)return;
  const rk=Number(run.kills||0),rc=Number(run.coins||0),rb=Number(run.bosses||0),rt=Number(game.time||0),rl=Number(game.level||1);
  if(!v314TrackProgress.state)v314TrackProgress.state={k:rk,c:rc,b:rb,t:rt,l:rl};
  const s=v314TrackProgress.state;
  if(rk<s.k||rc<s.c||rb<s.b||rt<s.t){s.k=rk;s.c=rc;s.b=rb;s.t=rt;s.l=rl;return;}
  const dk=Math.max(0,rk-s.k),dc=Math.max(0,rc-s.c),db=Math.max(0,rb-s.b),dt=Math.max(0,rt-s.t);
  if(dk||dc||db||dt||rl>s.l){
    for(const c of v314DailyOps()){
      if(c.type==='kills')o.dailyProgress[c.id]=(o.dailyProgress[c.id]||0)+dk;
      if(c.type==='coins')o.dailyProgress[c.id]=(o.dailyProgress[c.id]||0)+dc;
      if(c.type==='bosses')o.dailyProgress[c.id]=(o.dailyProgress[c.id]||0)+db;
      if(c.type==='time')o.dailyProgress[c.id]=(o.dailyProgress[c.id]||0)+dt;
      if(c.type==='level')o.dailyProgress[c.id]=Math.max(o.dailyProgress[c.id]||0,rl);
    }
    const w=v314WeeklyOp();
    if(w.type==='kills')o.weekProgress+=dk;
    if(w.type==='time')o.weekProgress+=dt;
    if(w.type==='bosses')o.weekProgress+=db;
    s.k=rk;s.c=rc;s.b=rb;s.t=rt;s.l=rl;
    v314TrackProgress.dirty=true;
  }
}
function v314MilestoneTick(){
  if(typeof game==='undefined'||!game?.running)return;
  const o=v314Storage();if(!o)return;
  const level=Number(game.level||1);
  for(const m of MILESTONES){
    if(level>=m.level&&!o.milestones[m.level]){
      o.milestones[m.level]=true;
      save.coins=Math.round((Number(save.coins)||0)+m.coins);
      save.worldKeys=(Number(save.worldKeys)||0)+m.keys;
      v314SafePersist();
      v314Toast('🏅 '+m.label+' milestone! +'+m.coins+' coins • +'+m.keys+' Key'+(m.keys===1?'':'s'));
    }
  }
}
function v314SupplyTick(){
  if(typeof game==='undefined'||!game?.running||!game?.player)return;
  const nowT=Number(game.time||0),prev=v314SupplyTick.lastTime||0;
  if(nowT<prev){game.v314NextSupply=v314EventLive()?60:90;}
  v314SupplyTick.lastTime=nowT;
  if(!game.v314NextSupply)game.v314NextSupply=(v314EventLive()?60:90);
  const interval=v314EventLive()?45:90;
  if(nowT>=game.v314NextSupply){
    if(Array.isArray(game.coins))for(let i=0;i<(v314EventLive()?5:3);i++)game.coins.push({x:game.player.x+(Math.random()-.5)*140,y:game.player.y+(Math.random()-.5)*140,value:(v314EventLive()?30:20)+Math.floor(Math.random()*(v314EventLive()?20:15)),icon:'◆'});
    if(Array.isArray(game.gems))game.gems.push({x:game.player.x+30,y:game.player.y-30,value:Math.max(20,Number(game.xpNeed||50)/3),icon:'✦'});
    if(Array.isArray(game.powerups)&&game.powerups.length<25)game.powerups.push({x:game.player.x-30,y:game.player.y-30,type:'shield'});
    v314Toast('📦 SUPPLY DROP incoming!');
    game.v314NextSupply=nowT+interval;
  }
}

function v314ThreatTick(){
  let el=document.getElementById('v314ThreatHUD');
  if(!el){
    el=document.createElement('div');el.id='v314ThreatHUD';
    el.style.cssText='position:fixed;right:14px;top:14px;z-index:12;display:none;min-width:170px;padding:8px 11px;border:1px solid #3e607d;border-radius:11px;background:rgba(8,13,19,.92);box-shadow:0 10px 26px rgba(0,0,0,.28);font:700 12px Arial;color:#dceaf5;pointer-events:none';
    document.body.appendChild(el);
  }
  if(typeof game==='undefined'||!game?.running){el.style.display='none';return;}
  const enemies=Array.isArray(game.enemies)?game.enemies.length:0,boss=Array.isArray(game.enemies)&&game.enemies.some(e=>e&&e.boss);
  const score=Math.min(100,enemies*2+Number(game.level||1)*2+(boss?30:0));
  const label=score>=80?'CRITICAL':score>=55?'HIGH':score>=30?'ELEVATED':'STABLE';
  el.style.display='block';el.textContent='THREAT • '+label+' • '+enemies+' hostiles'+(boss?' • BOSS':'');
}

async function v314LeaderboardCheck(){
  const el=document.getElementById('v314LeaderboardStatus');
  if(el)el.textContent='Leaderboard sync status: checking…';
  try{
    const r=await fetch('https://outlast-server.onrender.com/api/leaderboard',{cache:'no-store'});
    if(!r.ok)throw new Error('HTTP '+r.status);
    const data=await r.json();
    const count=Array.isArray(data)?data.length:(Array.isArray(data?.leaderboard)?data.leaderboard.length:Array.isArray(data?.rows)?data.rows.length:0);
    if(el)el.textContent='Leaderboard sync status: ONLINE • '+count+' records returned';
  }catch(err){
    if(el)el.textContent='Leaderboard sync status: UNAVAILABLE right now';
    v314Toast('⚠️ Leaderboard service could not be checked');
  }
}

function v314SaveSnapshot(){
  const o=v314Storage();if(!o)return;
  o.snapshot={
    char:typeof save.selectedChar!=='undefined'?save.selectedChar:'Unknown',
    weapon:typeof save.selectedWeapon!=='undefined'?save.selectedWeapon:'Unknown',
    skin:typeof save.selectedSkin!=='undefined'?save.selectedSkin:'Default',
    pet:typeof save.selectedPet!=='undefined'?save.selectedPet:'None',
    relic:typeof save.selectedRelic!=='undefined'?save.selectedRelic:'None',
    charm:typeof save.selectedCharm!=='undefined'?save.selectedCharm:'None',
    map:typeof save.map!=='undefined'?save.map:'Unknown',
    difficulty:typeof save.difficulty!=='undefined'?save.difficulty:'Normal',
    mode:typeof save.mode!=='undefined'?save.mode:'Standard'
  };
  v314SafePersist();v314Toast('💾 Loadout snapshot saved');renderV314Operations();
}
function v314LoadSnapshot(){
  const o=v314Storage(),s=o?.snapshot;if(!s)return v314Toast('No loadout snapshot saved');
  if(s.char)save.selectedChar=s.char;if(s.weapon)save.selectedWeapon=s.weapon;if(s.skin)save.selectedSkin=s.skin;if(s.pet)save.selectedPet=s.pet;if(s.relic)save.selectedRelic=s.relic;if(s.charm)save.selectedCharm=s.charm;if(s.map)save.map=s.map;if(s.difficulty)save.difficulty=s.difficulty;if(s.mode)save.mode=s.mode;
  v314SafePersist();v314Toast('✅ Loadout snapshot equipped');renderV314Operations();
}

function v314ClaimDaily(id){
  const o=v314Storage(),c=v314DailyOps().find(x=>x.id===id);if(!o||!c)return;
  if(o.dailyClaims[c.id])return v314Toast('Already claimed');
  if(v314Progress(c)<c.target)return v314Toast('Contract not complete');
  o.dailyClaims[c.id]=true;save.coins=Math.round((Number(save.coins)||0)+c.reward);v314SafePersist();v314Toast('▣ '+c.name+' complete! +'+c.reward+' coins');renderV314Operations();
}
function v314ClaimWeekly(){
  const o=v314Storage(),w=v314WeeklyOp();if(!o)return;
  if(o.weekClaimed)return v314Toast('Already claimed');
  if(Number(o.weekProgress||0)<w.target)return v314Toast('Weekly operation not complete');
  o.weekClaimed=true;save.coins=Math.round((Number(save.coins)||0)+w.reward);save.worldKeys=(Number(save.worldKeys)||0)+w.keys;v314SafePersist();v314Toast('▣ '+w.name+' complete! +'+w.reward+' coins • +'+w.keys+' Keys');renderV314Operations();
}

function v314AdminPreview(){
  try{if(typeof isAdmin==='function'&&!isAdmin()){v314Toast('Admin access required');return;}}catch(_){return;}
  const entries=typeof worldEvents!=='undefined'?Object.entries(worldEvents):[];
  const cards=entries.length?entries.map(([name,desc])=>'<button class="option" style="text-align:left" data-v314-preview-event="'+v314Esc(name)+'"><b>🌎 '+v314Esc(name)+'</b><div class="small">'+v314Esc(desc)+'</div><div class="small" style="margin-top:5px;color:#f2d06b">PREVIEW ONLY • Does not trigger the live event</div></button>').join(''):'<div class="option"><b>No configured events</b></div>';
  v314Open('👁️ Event Preview','<div class="option"><b>UPCOMING EVENT PREVIEW</b><div class="small">Choose an event to inspect. This never starts, saves, or alters the live run.</div></div><div class="grid" style="margin-top:12px">'+cards+'</div><div id="v314PreviewResult" class="option" style="margin-top:12px"><b>Select an event above.</b></div>');
  document.getElementById('subContent')?.querySelectorAll('[data-v314-preview-event]').forEach(btn=>btn.addEventListener('click',()=>{
    const name=btn.getAttribute('data-v314-preview-event'),desc=typeof worldEvents!=='undefined'?worldEvents[name]:'No description available.';
    const result=document.getElementById('v314PreviewResult');
    if(result)result.innerHTML='<div style="font-size:28px;font-weight:900">🌎 '+v314Esc(name)+'</div><div class="small" style="margin-top:8px">'+v314Esc(desc)+'</div><div style="margin-top:12px;padding:10px;border:1px solid #8a6a19;border-radius:10px;background:#17130a"><b>PREVIEW MODE</b><div class="small">The live event is unchanged.</div></div>';
  }));
}

function v314AdminUnlocked(){
  try{return typeof isAdmin==='function'&&isAdmin();}catch(_){return false;}
}
function v314AdminPanelOpen(){
  const sc=document.getElementById('subContent');if(!sc)return false;
  const title=(sc.querySelector('h2,h3')?.textContent||'').toLowerCase();
  const text=(sc.textContent||'').toLowerCase();
  return /admin panel|administrator|admin tools|admin controls|admin abuse/.test(title)||/admin panel|administrator|admin tools|admin controls|admin abuse/.test(text);
}
function v314EnsureAdminPreview(){
  const sc=document.getElementById('subContent');if(!sc||!v314AdminUnlocked())return;
  const text=(sc.textContent||'').toLowerCase();
  const title=(sc.querySelector('h2,h3')?.textContent||'').toLowerCase();
  const owner=/owner panel|owner tools|owner control center/.test(title+' '+text);
  const admin=/admin panel|administrator|admin tools|admin controls|admin abuse/.test(title+' '+text);
  if(owner||(!admin&&sc.dataset.v314AdminContext!=='1'))return;
  sc.dataset.v314AdminContext='1';
  if(sc.querySelector('[data-v314-admin-preview-launch]'))return;
  const wrap=document.createElement('div');
  wrap.setAttribute('data-v314-admin-preview-launch','1');
  wrap.className='option';
  wrap.style.cssText='margin-top:12px;border:1px solid #8a6a19;background:#17130a;text-align:left';
  wrap.innerHTML='<b>👁️ EVENT PREVIEW</b><div class="small" style="margin-top:5px">ADMIN ONLY • inspect events without starting them.</div><button type="button" class="gold" data-action="v314AdminEventPreview" style="margin-top:9px;width:100%">OPEN EVENT PREVIEW</button>';
  sc.appendChild(wrap);
}
function v314PatchAdmin(){
  window.adminEventPreview=v314AdminPreview;
  const bind=()=>{
    const sc=document.getElementById('subContent');
    if(sc&&!sc.dataset.v314PreviewBound){
      sc.dataset.v314PreviewBound='1';
      sc.addEventListener('click',e=>{
        const b=e.target?.closest?.('[data-action="v314AdminEventPreview"]');
        if(!b)return;
        e.preventDefault();e.stopPropagation();
        v314AdminPreview();
      });
    }
    v314EnsureAdminPreview();
  };
  bind();
  if(!document.body.dataset.v314AdminObserver){
    document.body.dataset.v314AdminObserver='1';
    new MutationObserver(()=>setTimeout(bind,30)).observe(document.body,{childList:true,subtree:true});
  }
  if(!window.__v314OpenSubWrapped&&typeof window.openSub==='function'){
    const original=window.openSub;
    window.openSub=function(title,body){
      const result=original.apply(this,arguments);
      setTimeout(()=>{
        if(/admin panel|administrator|admin tools|admin controls|admin abuse/i.test(String(title||'')))v314EnsureAdminPreview();
      },0);
      return result;
    };
    window.__v314OpenSubWrapped=true;
  }
}
function v314UpdatePopup(){
  /* v3.14.0 systems remain active, but their retired release popup is disabled.
     The single current popup is owned by the main game build metadata. */
  const pop=document.getElementById('updatePopup');
  if(pop && pop.dataset.v314Retired!=='1'){
    pop.dataset.v314Retired='1';
    if(pop.style.display==='flex')pop.style.display='none';
  }
}

function v314UpdateLog(){
  /* The current build owns the release log. Do not replace it with the
     retired v3.14.0-only log. */
  try{
    if(typeof renderUpdates==='function'){ renderUpdates(); return; }
  }catch(_){}
}

function v314Tick(){
  try{
    v314EnsureCards();v314TrackProgress();v314MilestoneTick();v314SupplyTick();v314ThreatTick();v314NightfallHUD();
    const mini=document.getElementById('v314CountdownMini');
    if(mini)mini.textContent=v314EventLive()?'🌑 NIGHTFALL IS LIVE':'T− '+v314Fmt(NIGHTFALL_TARGET.getTime()-Date.now());
    const big=document.getElementById('v314EventBigCountdown');
    if(big)big.textContent=v314EventLive()?'LIVE':'T− '+v314Fmt(NIGHTFALL_TARGET.getTime()-Date.now());
    if(v314TrackProgress.dirty&&Date.now()-(v314Tick.lastPersist||0)>5000){v314SafePersist();v314TrackProgress.dirty=false;v314Tick.lastPersist=Date.now();}
  }catch(err){/* v3.14 systems never stop the base game */}
}

function v314Bind(){
  v314Storage();
  v314EnsureCards();
  v314PatchAdmin();
  const updatesBtn=document.getElementById('updatesBtn');
  if(updatesBtn&&!updatesBtn.dataset.v314Bound){updatesBtn.dataset.v314Bound='1';updatesBtn.onclick=v314UpdateLog;}
  const sub=document.getElementById('subContent');
  if(sub&&!sub.dataset.v314Bound){sub.dataset.v314Bound='1';sub.addEventListener('click',e=>{
    const b=e.target?.closest?.('[data-action]');if(!b)return;const a=b.dataset.action,v=b.dataset.value;
    if(a==='v314ClaimDaily')v314ClaimDaily(v);
    else if(a==='v314ClaimWeekly')v314ClaimWeekly();
    else if(a==='v314SaveSnapshot')v314SaveSnapshot();
    else if(a==='v314LoadSnapshot')v314LoadSnapshot();
    else if(a==='v314LeaderboardCheck')v314LeaderboardCheck();
    else if(a==='v314ClaimNightfall')v314NightfallClaim();
    else if(a==='v314Protocol'){if(typeof save!=='undefined'){save.selectedModifier=v;v314SafePersist();v314Toast('⚡ '+v+' armed for the next run');}}
  });}
  v314UpdatePopup();
  setInterval(v314Tick,1000);
  setTimeout(v314Tick,40);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',v314Bind,{once:true});else v314Bind();
})();