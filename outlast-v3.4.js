/* OUTLAST v3.4.0 — Replayability, Run Builder, Mastery, Codex, Achievements, Extraction, Cosmetics, Co-op HUD, Recovery */
(() => {
  'use strict';
  const VERSION = '3.4.0';
  const KEY = 'outlastV34Recovery';
  const MODS = {
    DoubleTrouble: '2x spawn pressure / stronger enemies / increased rewards',
    GlassWorld: 'Enemies are tougher / 2x rewards',
    BloodMoon: 'More frequent bosses / increased rewards'
  };
  const CHALLENGES = {
    Horde: 'Far more enemy pressure and increased rewards',
    GlassCannon: 'Lower HP with a large reward multiplier',
    BossGauntlet: 'More frequent bosses and increased rewards',
    Chaos: 'Frequent random events with stronger enemies'
  };
  const ABILITIES = {
    Survivor: ['Field Scavenger', '+5% pickup radius.'],
    Tank: ['Reinforced Frame', '+8% max HP.'],
    Assassin: ['Lethal Edge', '+6% weapon damage.'],
    Mage: ['Arcane Scope', '+8% attack range.'],
    Engineer: ['Utility Rig', '+8% coin gain.'],
    Ninja: ['Evasive Step', '+6% movement speed.'],
    Paladin: ['Bulwark', '+8% max HP.'],
    Pyromancer: ['Overheat', '+6% weapon damage.'],
    Ranger: ['Longshot', '+8% attack range.'],
    Medic: ['Field Medic', 'Regenerates a small amount of HP during long runs.'],
    Warden: ['Fortified Core', '+10% max HP.'],
    Scout: ['Pathfinder', '+6% movement speed.'],
    Commander: ['Battle Plan', '+4% damage and +4% range.'],
    ExoPilot: ['Powered Armor', '+5% HP and +5% damage.'],
    ShadowRunner: ['Phase Step', '+7% movement speed.'],
    Chronomancer: ['Time Sense', '+5% range and +4% movement speed.'],
    Warlord: ['Brutal Force', '+10% damage.'],
    VoidWalker: ['Void Sight', '+7% damage and +5% range.']
  };
  const ACHS = [
    ['First Run','Complete 1 run',s=>s.games>=1,250],
    ['Centurion','Defeat 100 enemies',s=>s.kills>=100,500],
    ['Boss Hunter','Defeat 10 bosses',s=>s.bosses>=10,750],
    ['Long Haul','Survive 10 minutes in one run',s=>s.bestTime>=600,1000],
    ['Level 25','Reach level 25 in a run',s=>s.bestLevel>=25,1500],
    ['Millionaire Run','Earn 10,000 coins from runs',s=>s.totalCoins>=10000,1500],
    ['High Score','Score 100,000 points',s=>s.highScore>=100000,2000],
    ['Veteran','Complete 25 runs',s=>s.games>=25,2500],
    ['Elite Survivor','Complete 50 runs',s=>s.games>=50,5000],
    ['Boss Breaker','Defeat 50 bosses',s=>s.bosses>=50,3500],
    ['Grinder','Defeat 2,500 enemies',s=>s.kills>=2500,4000],
    ['Endurer','Survive 30 minutes in one run',s=>s.bestTime>=1800,5000]
  ];

  const $ = id => document.getElementById(id);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safe = fn => { try { return fn(); } catch (_) { return null; } };

  function gameReady() {
    return typeof save !== 'undefined' && save && typeof game !== 'undefined' && game;
  }

  function state() {
    if (typeof save === 'undefined' || !save) return null;
    if (!save.v34 || typeof save.v34 !== 'object') save.v34 = {};
    const s = save.v34;
    if (!s.week || typeof s.week !== 'object') s.week = {};
    if (!s.mastery || typeof s.mastery !== 'object') s.mastery = {};
    if (!s.codex || typeof s.codex !== 'object') s.codex = {};
    if (!s.achievements || typeof s.achievements !== 'object') s.achievements = {};
    if (!s.cosmetics || typeof s.cosmetics !== 'object') s.cosmetics = {trail:'Classic',killEffect:'Burst'};
    if (!Array.isArray(s.builds)) s.builds = [];
    if (!s.runHistory) s.runHistory = [];
    if (!s.recovery) s.recovery = {};
    if (!s.week.key) s.week.key = weekKey();
    if (!s.week.claimed || typeof s.week.claimed !== 'object') s.week.claimed = {};
    if (s.week.key !== weekKey()) s.week = {key:weekKey(),kills:0,bosses:0,time:0,runs:0,claimed:{}};
    return s;
  }

  function weekKey() {
    const d = new Date();
    const one = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const day = Math.floor((Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()) - one) / 86400000) + 1;
    return d.getUTCFullYear() + '-W' + Math.ceil(day / 7);
  }

  function persistSafe() {
    safe(() => { if (typeof persist === 'function') persist(); });
  }

  function notify(msg) {
    if (typeof toast === 'function') safe(() => toast(msg));
    else {
      const n = document.createElement('div');
      n.textContent = msg;
      n.style.cssText='position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:99999;background:#101820;color:#fff;padding:12px 16px;border:1px solid #3c5268;border-radius:12px;font:700 14px Arial';
      document.body.appendChild(n);
      setTimeout(()=>n.remove(),2600);
    }
  }

  function modal(title, body) {
    let m = $('v34Modal');
    if (!m) {
      m = document.createElement('div');
      m.id='v34Modal';
      m.className='v34-modal';
      m.innerHTML='<div class="v34-modal-card" role="dialog" aria-modal="true"><div class="v34-modal-head"><div id="v34ModalTitle"></div><button type="button" class="v34-close" data-v34="close">×</button></div><div id="v34ModalBody"></div></div>';
      document.body.appendChild(m);
      m.addEventListener('click',e=>{ if(e.target===m) closeModal(); });
      m.addEventListener('click',e=>{ const b=e.target.closest('[data-v34]'); if(!b) return; action(b.dataset.v34,b); });
    }
    $('v34ModalTitle').textContent=title;
    $('v34ModalBody').innerHTML=body;
    m.style.display='flex';
  }
  function closeModal(){ const m=$('v34Modal'); if(m)m.style.display='none'; }
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});

  function options(arr, selected, labelFn) {
    return arr.map(x=>'<option value="'+esc(x)+'" '+(x===selected?'selected':'')+'>'+esc(labelFn?labelFn(x):x)+'</option>').join('');
  }

  function hardModifiers() {
    if (typeof runModifiers === 'undefined') return Object.keys(MODS);
    return Object.keys(runModifiers).filter(k=>k!=='None' && k!=='TinyEnemies' && (Number(runModifiers[k]?.enemy||1)>=1 || k==='BloodMoon'));
  }
  function getChallengeModes() {
    if (typeof challengeModes === 'undefined') return Object.keys(CHALLENGES);
    return Object.keys(challengeModes).filter(k=>k && Number(challengeModes[k]?.enemy||1)>=1);
  }

  function seedHash(text) {
    let h=2166136261;
    for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);}
    return h>>>0;
  }
  function seedRng(seed) {
    let x=seedHash(String(seed));
    return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;};
  }

  function openBuilder() {
    const maps = typeof mapDefs!=='undefined' ? Object.keys(mapDefs) : ['Forest'];
    const diffs = typeof diffDefs!=='undefined' ? Object.keys(diffDefs) : ['Normal'];
    const modes = typeof modeDefs!=='undefined' ? Object.keys(modeDefs) : ['Classic'];
    const mods = hardModifiers();
    const challenges = getChallengeModes();
    const s=state();
    const seed = s.builderSeed || (new Date().toISOString().slice(0,10)+'-'+Math.floor(Math.random()*999999));
    modal('🎲 Run Builder',
      '<div class="v34-grid">'+
      '<label>Map<select id="v34Map">'+options(maps,save.map)+'</select></label>'+
      '<label>Difficulty<select id="v34Diff">'+options(diffs,save.difficulty)+'</select></label>'+
      '<label>Mode<select id="v34Mode">'+options(modes,save.mode)+'</select></label>'+
      '<label>Hard Modifier<select id="v34Mod"><option value="None">None</option>'+options(mods,save.selectedModifier)+'</select></label>'+
      '<label>Challenge Mode<select id="v34Challenge"><option value="None">None</option>'+options(challenges,save.challengeMode)+'</select></label>'+
      '<label>Share Seed<input id="v34Seed" maxlength="40" value="'+esc(seed)+'"></label>'+
      '</div>'+
      '<div class="v34-note">The seed reproduces the selected run setup. Gameplay randomness remains server/client generated.</div>'+
      '<div class="v34-run-card" id="v34Preview"></div>'+
      '<div class="v34-actions"><button type="button" data-v34="builderRandom">🎲 GENERATE RANDOM RUN</button><button type="button" class="gold" data-v34="builderStart">▶ START THIS RUN</button><button type="button" data-v34="builderSave">💾 SAVE BUILD</button></div>');
    updateBuilderPreview();
    ['v34Map','v34Diff','v34Mode','v34Mod','v34Challenge','v34Seed'].forEach(id=>$(id)?.addEventListener('change',updateBuilderPreview));
  }

  function builderValues() {
    return {map:$('v34Map')?.value||save.map,difficulty:$('v34Diff')?.value||save.difficulty,mode:$('v34Mode')?.value||save.mode,modifier:$('v34Mod')?.value||'None',challenge:$('v34Challenge')?.value||'None',seed:$('v34Seed')?.value||'OUTLAST'};
  }

  function updateBuilderPreview() {
    const p=builderValues(), parts=[];
    if(p.modifier!=='None')parts.push(MODS[p.modifier]||'Hard modifier active.');
    if(p.challenge!=='None')parts.push(CHALLENGES[p.challenge]||'Challenge mode active.');
    const mapDesc=typeof mapDefs!=='undefined'&&mapDefs[p.map]?.desc?mapDefs[p.map].desc:'';
    $('v34Preview').innerHTML='<b>RUN PREVIEW</b><div class="small">'+esc(p.map)+' • '+esc(p.difficulty)+' • '+esc(p.mode)+'</div><div class="small">'+(parts.length?esc(parts.join(' ')):'No extra modifier.')+'</div><div class="small">Seed: '+esc(p.seed)+(mapDesc?' • '+esc(mapDesc):'')+'</div>';
  }

  function startBuiltRun() {
    if(!gameReady()){notify('Game is not ready yet.');return;}
    const p=builderValues(),s=state();
    save.map=p.map; save.difficulty=p.difficulty; save.mode=p.mode; save.selectedModifier=p.modifier; save.challengeMode=p.challenge;
    save.builderMods=[]; s.builderSeed=p.seed; s.runSeed=p.seed;
    persistSafe(); closeModal();
    if(typeof newRunStats==='function')safe(()=>newRunStats());
    if(typeof startGame==='function')safe(()=>startGame(false));
    notify('▶ Run started — '+p.map+' / '+p.difficulty);
  }
  function randomBuiltRun() {
    const maps=typeof mapDefs!=='undefined'?Object.keys(mapDefs):['Forest'];
    const diffs=typeof diffDefs!=='undefined'?Object.keys(diffDefs):['Normal'];
    const modes=typeof modeDefs!=='undefined'?Object.keys(modeDefs):['Classic'];
    const mods=hardModifiers(),chs=getChallengeModes(),rng=seedRng(String($('v34Seed')?.value||Date.now()));
    const pick=a=>a[Math.floor(rng()*a.length)]||a[0];
    $('v34Map').value=pick(maps); $('v34Diff').value=pick(diffs); $('v34Mode').value=pick(modes);
    $('v34Mod').value=pick(['None'].concat(mods)); $('v34Challenge').value=pick(['None'].concat(chs));
    $('v34Seed').value='OUTLAST-'+Math.floor(rng()*0xFFFFFF).toString(16).toUpperCase().padStart(6,'0');
    updateBuilderPreview();
  }
  function saveBuilder() {
    const p=builderValues(),s=state();
    s.builds.unshift(p); s.builds=s.builds.slice(0,12); persistSafe(); notify('💾 Build saved.');
  }

  function statsData() {
    const base=(save.stats&&typeof save.stats==='object')?save.stats:{};
    const s=state();
    return {games:Number(base.games||0),kills:Number(base.kills||0),bosses:Number(base.bosses||0),bestTime:Number(base.bestTime||0),bestLevel:Number(base.bestLevel||1),highScore:Number(base.highScore||0),coins:Number(base.totalCoins||0),week:s.week,mastery:s.mastery};
  }

  function openStats() {
    const d=statsData();
    modal('📊 OUTLAST Statistics',
      '<div class="v34-stat-grid">'+[
        ['Runs',d.games],['Total Kills',d.kills],['Bosses',d.bosses],['Best Level',d.bestLevel],
        ['Best Survival',Math.floor(d.bestTime)+'s'],['High Score',d.highScore.toLocaleString()],['Run Coins',d.coins.toLocaleString()],['This Week Kills',d.week.kills||0]
      ].map(x=>'<div class="v34-stat"><b>'+esc(x[1])+'</b><span>'+esc(x[0])+'</span></div>').join('')+'</div>'+
      '<div class="v34-note">Progress is stored in your OUTLAST save. A local recovery copy is also maintained.</div>');
  }

  function openAchievements() {
    const d=statsData(), list=[];
    for(const [name,desc,fn,reward] of ACHS){
      const done=!!state().achievements[name];
      const ready=!!safe(()=>fn(d));
      if(ready && !done){state().achievements[name]=true;save.coins=(Number(save.coins)||0)+reward;notify('★ Achievement unlocked: '+name+' +'+reward+' coins');}
      list.push('<div class="v34-list-item"><div><b>'+esc(name)+'</b><div class="small">'+esc(desc)+'</div></div><span class="v34-pill '+(state().achievements[name]?'good':'')+'">'+(state().achievements[name]?'UNLOCKED':'LOCKED')+'</span></div>');
    }
    persistSafe();
    modal('🏆 Achievements',list.join('')||'<div class="v34-note">No achievements found.</div>');
  }

  function openMastery() {
    const names=typeof weapons!=='undefined'?Object.keys(weapons):Object.keys(save.unlockedWeapons||{});
    const s=state();
    const rows=names.map(n=>{
      const xp=Number(s.mastery[n]||0),lvl=Math.min(50,1+Math.floor(xp/100)),pct=xp%100;
      return '<div class="v34-list-item"><div><b>'+esc(n)+'</b><div class="small">Mastery '+lvl+' • '+xp+' XP</div><div class="v34-bar"><i style="width:'+pct+'%"></i></div></div><span class="v34-pill">'+lvl+'/50</span></div>';
    });
    modal('⚔️ Weapon Mastery',rows.join('')+'<div class="v34-note">Mastery XP comes from kills using the selected damage-dealing weapon. Non-damage weapons are not added.</div>');
  }

  function openCodex() {
    const s=state();
    const names=typeof zombieTypes!=='undefined'?Object.keys(zombieTypes):[];
    const rows=names.map(n=>{
      const seen=!!s.codex[n];
      const d=typeof zombieTypes!=='undefined'?zombieTypes[n]:{};
      return '<div class="v34-list-item"><div><b>'+esc(seen?n:'???')+'</b><div class="small">'+(seen?esc(d.desc||'Encounter logged.'):'Encounter this enemy to unlock its details.')+'</div></div><span class="v34-pill '+(seen?'good':'')+'">'+(seen?'DISCOVERED':'LOCKED')+'</span></div>';
    });
    modal('📖 Enemy Codex',rows.join('')+'<div class="v34-note">Enemy discoveries are recorded automatically when an enemy type appears during a run.</div>');
  }

  function openMissions() {
    const s=state(),w=s.week;
    const missions=[
      ['Weekly Hunter','Defeat 500 enemies','kills',500,3000],
      ['Weekly Boss Breaker','Defeat 8 bosses','bosses',8,4500],
      ['Weekly Endurer','Survive 45 minutes','time',2700,4000],
      ['Weekly Grinder','Complete 10 runs','runs',10,3500]
    ];
    const rows=missions.map(m=>{
      const v=Number(w[m[2]]||0),done=v>=m[3],claimed=!!w.claimed[m[0]];
      return '<div class="v34-list-item"><div><b>'+esc(m[0])+'</b><div class="small">'+esc(m[1])+'</div><div class="small">'+Math.min(m[3],Math.floor(v))+'/'+m[3]+'</div><div class="v34-bar"><i style="width:'+Math.min(100,v/m[3]*100)+'%"></i></div></div><button type="button" '+(done&&!claimed?'':'disabled')+' data-v34="claimWeekly" data-key="'+esc(m[0])+'" data-reward="'+m[4]+'">'+(claimed?'CLAIMED':done?'CLAIM':'LOCKED')+'</button></div>';
    });
    modal('📅 Weekly Missions',rows.join('')+'<div class="v34-note">Missions reset automatically each week. Rewards are saved locally with your profile.</div>');
  }

  function openCodexAndMissions() {
    modal('🧭 Progress Hub',
      '<div class="v34-grid two">'+
      '<button type="button" data-v34="stats">📊 Statistics</button>'+
      '<button type="button" data-v34="achievements">🏆 Achievements</button>'+
      '<button type="button" data-v34="mastery">⚔️ Weapon Mastery</button>'+
      '<button type="button" data-v34="codex">📖 Enemy Codex</button>'+
      '<button type="button" data-v34="missions">📅 Weekly Missions</button>'+
      '<button type="button" data-v34="cosmetics">🎨 Cosmetics</button>'+
      '</div>');
  }

  function openModifiers() {
    const mods=hardModifiers().map(k=>'<div class="v34-list-item"><div><b>'+esc(k)+'</b><div class="small">'+esc(MODS[k]||'Hard run modifier.')+'</div></div><span class="v34-pill">HARDER</span></div>');
    const chs=getChallengeModes().map(k=>'<div class="v34-list-item"><div><b>'+esc(k)+'</b><div class="small">'+esc(CHALLENGES[k]||'Challenge mode.')+'</div></div><span class="v34-pill">CHALLENGE</span></div>');
    modal('☠️ Run Modifiers', '<h3>Hard Modifiers</h3>'+mods.join('')+'<h3>Challenge Modes</h3>'+chs.join('')+'<div class="v34-note">Modifiers in the v3.4 builder are limited to modes intended to increase difficulty or pressure.</div>');
  }

  function openCosmetics() {
    const s=state();
    const trails=['Classic','Pulse','Frost','Void'];
    const effects=['Burst','Rings','Stars','Nova'];
    modal('🎨 Cosmetics',
      '<div class="v34-grid">'+
      '<label>Run Trail<select id="v34Trail">'+options(trails,s.cosmetics.trail)+'</select></label>'+
      '<label>Kill Effect<select id="v34Effect">'+options(effects,s.cosmetics.killEffect)+'</select></label>'+
      '</div>'+
      '<div class="v34-actions"><button type="button" class="gold" data-v34="saveCosmetics">SAVE COSMETICS</button></div>'+
      '<div class="v34-note">Cosmetics are profile-saved and do not alter weapon damage or leaderboard validation.</div>');
  }

  function saveCosmetics() {
    const s=state(); s.cosmetics.trail=$('v34Trail')?.value||s.cosmetics.trail; s.cosmetics.killEffect=$('v34Effect')?.value||s.cosmetics.killEffect; persistSafe(); notify('🎨 Cosmetics saved.'); closeModal();
  }

  function openCharacterAbility() {
    const name=save.selectedChar||'Survivor', a=ABILITIES[name]||['Survivor Training','Small balanced bonus.'];
    modal('🧬 Character Ability','<div class="v34-run-card"><b>'+esc(name)+'</b><div class="small">'+esc(a[0])+'</div><p>'+esc(a[1])+'</p></div><div class="v34-note">The ability is applied once per run and does not replace the character’s base stats.</div>');
  }

  function openCoop() {
    const online=typeof outlastOnline!=='undefined'&&outlastOnline;
    const code=typeof roomCode!=='undefined'?roomCode:'';
    const count=typeof roomPlayers!=='undefined'?Object.keys(roomPlayers||{}).length:0;
    modal('👥 Co-op Status',
      '<div class="v34-stat-grid">'+
      '<div class="v34-stat"><b>'+(online?'ONLINE':'OFFLINE')+'</b><span>Server</span></div>'+
      '<div class="v34-stat"><b>'+esc(code||'—')+'</b><span>Room</span></div>'+
      '<div class="v34-stat"><b>'+Math.max(1,count)+'</b><span>Players Seen</span></div>'+
      '<div class="v34-stat"><b>4</b><span>Room Limit</span></div></div>'+
      '<div class="v34-note">Co-op uses the existing OUTLAST WebSocket room system. v3.4 keeps the shared-room status visible and preserves the synchronized run design.</div>'+
      '<div class="v34-actions"><button type="button" data-v34="coopsync">🔄 REFRESH CO-OP STATUS</button></div>');
  }

  function openRecovery() {
    const s=state(), r=s.recovery||{};
    modal('💾 Save & Recovery',
      '<div class="v34-run-card"><b>Local recovery copy</b><div class="small">Last backup: '+esc(r.time?new Date(r.time).toLocaleString():'Not yet created')+'</div><div class="small">Profile: '+esc(typeof currentUsername!=='undefined'?currentUsername:'Player')+'</div></div>'+
      '<div class="v34-actions"><button type="button" data-v34="backupNow">BACK UP NOW</button><button type="button" class="gold" data-v34="restoreBackup">RESTORE LAST BACKUP</button></div>'+
      '<div class="v34-note">Restore is manual so a newer save can never be overwritten automatically.</div>');
  }

  function writeRecovery() {
    if(!gameReady()) return;
    const s=state(); if(!s) return;
    try {
      const payload={time:Date.now(),username:(typeof currentUsername!=='undefined'?currentUsername:''),save:JSON.parse(JSON.stringify(save))};
      localStorage.setItem(KEY,JSON.stringify(payload));
      s.recovery.time=payload.time;
    } catch (_) {}
  }

  function restoreRecovery() {
    try {
      const raw=localStorage.getItem(KEY);
      if(!raw){notify('No recovery backup exists.');return;}
      const p=JSON.parse(raw);
      if(!p.save){notify('Recovery backup is invalid.');return;}
      Object.assign(save,p.save);
      persistSafe();
      notify('💾 Recovery restored. Please reopen the menu.');
      closeModal();
    } catch (_) { notify('Recovery restore failed safely.'); }
  }

  function openProgress() {
    openCodexAndMissions();
  }

  function addMenuCard() {
    const more=document.querySelector('[data-page-content="more"] .menu-cards');
    if(more && !$('v34ToolsCard')) {
      const card=document.createElement('div');
      card.className='menu-card';
      card.id='v34ToolsCard';
      card.innerHTML='<h3>OUTLAST v3.4 Hub</h3><button class="menu-btn gold" id="v34HubBtn" type="button">🚀 Open v3.4 Features</button>';
      more.appendChild(card);
      $('v34HubBtn').onclick=()=>openHub();
    }
    const play=document.querySelector('[data-page-content="play"] .menu-cards');
    if(play && !$('v34BuilderCard')) {
      const card=document.createElement('div'); card.className='menu-card'; card.id='v34BuilderCard';
      card.innerHTML='<h3>Run Builder</h3><button class="menu-btn" id="v34BuilderBtn" type="button">🎲 Build a Run</button>';
      play.appendChild(card); $('v34BuilderBtn').onclick=openBuilder;
    }
  }

  function openHub() {
    modal('🚀 OUTLAST v3.4 Feature Hub',
      '<div class="v34-grid two">'+
      '<button type="button" data-v34="builder">🎲 Run Builder</button>'+
      '<button type="button" data-v34="missions">📅 Weekly Missions</button>'+
      '<button type="button" data-v34="mastery">⚔️ Weapon Mastery</button>'+
      '<button type="button" data-v34="codex">📖 Enemy Codex</button>'+
      '<button type="button" data-v34="stats">📊 Run Statistics</button>'+
      '<button type="button" data-v34="achievements">🏆 Achievements</button>'+
      '<button type="button" data-v34="modifiers">☠️ Modifiers</button>'+
      '<button type="button" data-v34="cosmetics">🎨 Cosmetics</button>'+
      '<button type="button" data-v34="character">🧬 Character Ability</button>'+
      '<button type="button" data-v34="coop">👥 Co-op Status</button>'+
      '<button type="button" data-v34="recovery">💾 Save Recovery</button>'+
      '<button type="button" data-v34="discord">💬 Discord</button>'+
      '</div><div class="v34-note">Daily Challenge, leaderboard, quests, skins, settings, and existing game systems remain in their original menu locations.</div>');
  }

  function action(a,b) {
    switch(a) {
      case 'close': closeModal(); break;
      case 'builder': openBuilder(); break;
      case 'builderRandom': randomBuiltRun(); break;
      case 'builderStart': startBuiltRun(); break;
      case 'builderSave': saveBuilder(); break;
      case 'stats': openStats(); break;
      case 'achievements': openAchievements(); break;
      case 'mastery': openMastery(); break;
      case 'codex': openCodex(); break;
      case 'missions': openMissions(); break;
      case 'modifiers': openModifiers(); break;
      case 'cosmetics': openCosmetics(); break;
      case 'saveCosmetics': saveCosmetics(); break;
      case 'character': openCharacterAbility(); break;
      case 'coop': openCoop(); break;
      case 'coopsync': openCoop(); break;
      case 'recovery': openRecovery(); break;
      case 'backupNow': writeRecovery(); persistSafe(); notify('💾 Backup created.'); openRecovery(); break;
      case 'restoreBackup': restoreRecovery(); break;
      case 'claimWeekly': {
        const s=state(),k=b.dataset.key,reward=Math.max(0,Math.floor(Number(b.dataset.reward)||0));
        if(!s.week.claimed[k]){s.week.claimed[k]=true;save.coins=(Number(save.coins)||0)+reward;persistSafe();notify('📅 Weekly reward claimed! +'+reward+' coins');}
        openMissions(); break;
      }
      case 'discord': window.open('https://discord.gg/bCMdZfggQ','_blank','noopener'); break;
    }
  }

  function applyCharacterAbility() {
    if(!gameReady() || !game.running || !game.player) return;
    if(game.player.__v34AbilityRun === true) return;
    const name=save.selectedChar||'Survivor', p=game.player;
    try {
      if(['Tank','Warden','Paladin'].includes(name)){p.max*=1.08;p.hp=Math.min(p.max,p.hp*1.08);}
      else if(['Assassin','Pyromancer','Warlord'].includes(name)){p.damage*=1.06;}
      else if(['Mage','Ranger','Chronomancer'].includes(name)){p.range*=1.08;}
      else if(['Ninja','Scout','ShadowRunner'].includes(name)){p.speed*=1.06;if(Number.isFinite(p.speedCap))p.speedCap*=1.04;}
      else if(name==='Commander'){p.damage*=1.04;p.range*=1.04;}
      else if(name==='ExoPilot'){p.max*=1.05;p.hp=Math.min(p.max,p.hp*1.05);p.damage*=1.05;}
      else if(name==='VoidWalker'){p.damage*=1.07;p.range*=1.05;}
      else if(name==='Engineer'){p.coinMult*=1.08;}
      else if(name==='Survivor'){p.pickupRange=(p.pickupRange||72)*1.05;}
      p.__v34AbilityRun=true; p.__v34LastHeal=0;
    } catch (_) {}
  }

  function observeEnemies() {
    if(!gameReady() || !game.running) return;
    const s=state(), enemies=Array.isArray(game.enemies)?game.enemies:[];
    for(const e of enemies) {
      if(e && e.kind) s.codex[e.kind]=true;
    }
  }

  function awardMastery(kills) {
    if(!kills) return;
    const s=state(),w=save.selectedWeapon||'Blaster';
    s.mastery[w]=Math.max(0,Number(s.mastery[w]||0)+Math.floor(kills));
  }

  function updateWeeklyLive(dt) {
    if(!gameReady() || !game.running) return;
    const s=state(), w=s.week;
    const rk=Number(run?.kills||0);
    const rt=Number(game.time||0);
    const dk=Math.max(0,rk-(s.__lastRunKills||0));
    const dtm=Math.max(0,rt-(s.__lastRunTime||0));
    w.kills+=dk; w.time+=dtm; s.__lastRunKills=rk; s.__lastRunTime=rt;
    if(save.selectedChar==='Medic' && game.player && Number(game.time||0)-Number(game.player.__v34LastHeal||0)>=5){
      game.player.hp=Math.min(game.player.max,game.player.hp+Math.max(1,game.player.max*.012));
      game.player.__v34LastHeal=Number(game.time||0);
    }
  }

  let session=false, lastRunning=false, startedAt=0, runSnapshot=null, lastEvent=0;
  function onRunStart() {
    session=true; startedAt=Date.now();
    const s=state(),p=gameReady()&&game.player?game.player:null;
    s.runSeed=s.runSeed||('RUN-'+Date.now().toString(36).toUpperCase());
    runSnapshot={weapon:save.selectedWeapon||'Blaster',character:save.selectedChar||'Survivor',map:save.map,difficulty:save.difficulty,mode:save.mode,modifier:save.selectedModifier||'None',challenge:save.challengeMode||'None',seed:s.runSeed};
    s.__lastRunKills=0;s.__lastRunTime=0;
    if(p) p.__v34AbilityRun=false;
    notify('▶ '+runSnapshot.character+' / '+runSnapshot.weapon);
  }

  function onRunEnd() {
    if(!session) return;
    session=false;
    const s=state(),kills=Math.max(0,Math.floor(Number(run?.kills||0))),time=Math.max(0,Number(game?.time||0)),bosses=Math.max(0,Math.floor(Number(run?.bosses||0))),level=Math.max(1,Math.floor(Number(game?.level||1))),score=Math.max(0,Math.floor(Number(game?.score||0)));
    awardMastery(kills);
    s.week.runs++; s.week.bosses+=bosses; s.week.kills+=Math.max(0,kills-(s.__lastRunKills||0)); s.week.time+=Math.max(0,time-(s.__lastRunTime||0));
    const rec={...runSnapshot,kills,bosses,time,level,score,date:Date.now()};
    s.runHistory.unshift(rec);s.runHistory=s.runHistory.slice(0,20);
    if(level>=25) s.extractionMilestone=Math.max(1,Number(s.extractionMilestone||0));
    s.runSeed=null;s.__lastRunKills=0;s.__lastRunTime=0;lastEvent=0;
    persistSafe(); writeRecovery(); checkAchievements();
    notify(kills?'Run saved — '+kills+' kills recorded.':'Run saved.');
  }

  function checkAchievements() {
    const d=statsData(),s=state();
    for(const [name,desc,fn,reward] of ACHS) {
      if(!s.achievements[name] && safe(()=>fn(d))) {
        s.achievements[name]=true;
        save.coins=(Number(save.coins)||0)+reward;
        notify('★ '+name+' unlocked! +'+reward+' coins');
      }
    }
    persistSafe();
  }

  function updateGameOverPanel() {
    const panel=$('gameOverActions');
    if(!panel || getComputedStyle(panel).display==='none') return;
    const host=$('gameOverStats'); if(!host || host.dataset.v34==='1') return;
    const s=state(),h=s.runHistory?.[0], milestone=(h&&h.level>=25)?'YES':'NO';
    host.insertAdjacentHTML('beforeend','<div class="game-over-stat">Weapon Mastery: '+esc(h?.weapon||save.selectedWeapon||'Blaster')+' • +'+Math.max(0,Math.floor(h?.kills||run?.kills||0))+' XP</div><div class="game-over-stat">Extraction Milestone: '+milestone+'</div><div class="game-over-stat">Seed: '+esc(h?.seed||'—')+'</div>');
    host.dataset.v34='1';
  }

  function ensureExtractionButton() {
    let b=$('v34ExtractBtn');
    if(!b){
      b=document.createElement('button');b.id='v34ExtractBtn';b.type='button';b.textContent='🚁 EXTRACT AT LEVEL 25';b.className='v34-extract';
      b.onclick=()=>{if(gameReady()&&game.running&&Number(game.level||1)>=25&&save.mode!=='1v1 Arena'){const s=state();s.lastExtraction=true;safe(()=>endRun(true,true,true));}};
      document.body.appendChild(b);
    }
    const show=gameReady()&&game.running&&Number(game.level||1)>=25&&save.mode!=='1v1 Arena'&&!game.upgradeOpen;
    b.style.display=show?'block':'none';
  }

  function extraMapEvent() {
    if(!gameReady()||!game.running||save.mode==='1v1 Arena')return;
    const p=game.player;if(!p)return;
    const roll=Math.random();
    if(roll<0.45 && Array.isArray(game.coins)){
      for(let i=0;i<3;i++) game.coins.push({x:Math.max(40,Math.min(worldW-40,p.x+(Math.random()*180-90))),y:Math.max(40,Math.min(worldH-40,p.y+(Math.random()*180-90))),value:5*(p.coinMult||1),icon:'$'});
      notify('📦 Supply Drop!');
    } else if(roll<0.78 && typeof spawnEnemy==='function'){
      safe(()=>spawnEnemy('elite')); safe(()=>spawnEnemy('fast')); notify('⚠ Elite Surge!');
    } else if(Array.isArray(game.powerups)){
      game.powerups.push({x:p.x+50,y:p.y,type:'shield'});notify('✨ Emergency Supply!');
    }
  }

  function updateVersionMarker() {
    const title=document.querySelector('title');
    if(title && /OUTLAST v/i.test(title.textContent||'')) title.textContent='OUTLAST v'+VERSION;
    const metas=document.querySelectorAll('meta');
    metas.forEach(m=>{if(m.getAttribute('name')==='outlast-build')m.setAttribute('content',VERSION);});
  }

  function injectStyle() {
    if($('v34Style'))return;
    const st=document.createElement('style');st.id='v34Style';
    st.textContent =
      '.v34-modal{position:fixed;inset:0;z-index:100000;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.78);padding:14px;box-sizing:border-box}'+
      '.v34-modal-card{width:min(860px,96vw);max-height:92vh;overflow:auto;background:linear-gradient(145deg,#101923,#0b1118);border:1px solid #334a60;border-radius:18px;padding:18px;box-sizing:border-box;box-shadow:0 24px 80px rgba(0,0,0,.55)}'+
      '.v34-modal-head{display:flex;justify-content:space-between;align-items:center;gap:12px;font-weight:900;font-size:24px;margin-bottom:12px}.v34-close{width:44px!important;height:44px;padding:0!important;font-size:28px!important;background:#202b36!important;box-shadow:none!important}'+
      '.v34-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.v34-grid.two button{min-height:64px}.v34-grid label{display:flex;flex-direction:column;gap:6px;font-weight:700;color:#b9c6d4}.v34-grid select,.v34-grid input{box-sizing:border-box;width:100%;padding:12px;border-radius:10px;border:1px solid #405468;background:#0b1117;color:#fff;font:600 15px Arial}'+
      '.v34-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.v34-actions button{flex:1 1 180px}.v34-note{margin-top:12px;padding:10px 12px;background:#0d151d;border:1px solid #263847;border-radius:10px;color:#94a8ba;font-size:13px}.v34-run-card{margin-top:12px;padding:14px;border:1px solid #2b445a;background:#111a23;border-radius:12px}.v34-list-item{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:11px 12px;margin:8px 0;border:1px solid #273a4c;background:#111a23;border-radius:12px}.v34-pill{font-size:11px;font-weight:900;padding:5px 8px;border-radius:999px;border:1px solid #405468;color:#9fb1c2;white-space:nowrap}.v34-pill.good{border-color:#3f9b69;color:#9bf0bb}.v34-stat-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.v34-stat{padding:14px;background:#111a23;border:1px solid #273a4c;border-radius:12px}.v34-stat b{display:block;font-size:22px;margin-bottom:4px}.v34-stat span{font-size:12px;color:#91a4b5}.v34-bar{height:7px;background:#0b1117;border-radius:99px;overflow:hidden;margin-top:7px}.v34-bar i{display:block;height:100%;background:#58a6ff}.v34-extract{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:50000;background:#2b6cff;color:#fff;border:2px solid #7cb4ff;box-shadow:0 8px 24px rgba(0,0,0,.45);display:none}@media(max-width:760px){.v34-grid,.v34-grid.two{grid-template-columns:1fr}.v34-stat-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.v34-modal{padding:8px}.v34-modal-card{max-height:95vh;padding:14px}.v34-modal-head{font-size:20px}}';
    document.head.appendChild(st);
  }

  function removeOldMalformedVersion_unused() {
    document.documentElement.innerHTML = document.documentElement.innerHTML.replace(/\\\\g<1>3\\.3\\.0\\\\g<2>>/g,'<meta name="outlast-build" content="'+VERSION+'">');
  }

  function init() {
    updateVersionMarker();
    injectStyle();
    addMenuCard();
    state();
    ensureExtractionButton();
    writeRecovery();
    setInterval(addMenuCard,1500);
    setInterval(writeRecovery,5000);
    setInterval(()=>{
      try {
        if(!gameReady())return;
        const running=!!game.running;
        if(running && !lastRunning) onRunStart();
        if(!running && lastRunning) onRunEnd();
        lastRunning=running;
        if(running){
          applyCharacterAbility();
          observeEnemies();
          updateWeeklyLive(.25);
          ensureExtractionButton();
          if(Number(game.time||0)-lastEvent>=60){lastEvent=Number(game.time||0);extraMapEvent();}
        } else ensureExtractionButton();
        updateGameOverPanel();
        if(Number(game.time||0)>0 && Number(game.time||0)%60<.3) writeRecovery();
      } catch(err) { console.warn('OUTLAST v3.4 layer error',err); }
    },250);
    checkAchievements();
  }

  window.OUTLAST_V34={version:VERSION,openHub,openBuilder,openStats,openAchievements,openMastery,openCodex,openMissions,openRecovery};
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
