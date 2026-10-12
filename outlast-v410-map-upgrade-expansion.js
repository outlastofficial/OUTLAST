/* OUTLAST v4.1.0 — Map Selection Repair + 500 Permanent / 500 In-Run Upgrade Choices */
(function () {
  'use strict';
  const VERSION = '4.2.1';
  const MAPS = ['Forest','Desert','Snow','Lava','City','Hospital','Laboratory','Subway','Prison','MilitaryBase','RuinedTown','Harbor','Bunker','Swamp','Skyscraper','Wasteland','Seizure','Ribhouse'];
  const TIERS = ['Common','Uncommon','Rare','Epic','Legendary','Mythic','Divine','Celestial','Transcendent','Eternal','Omega'];
  const SCALE = {Common:1,Uncommon:1.15,Rare:1.35,Epic:1.6,Legendary:1.9,Mythic:2.25,Divine:4,Celestial:4.8,Transcendent:5.6,Eternal:6.8,Omega:8};
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt = n => Number(Number(n).toFixed(2)).toString();
  const getSave = () => { try { return typeof save !== 'undefined' && save ? save : window.save || null; } catch (_) { return window.save || null; } };
  const getGame = () => { try { return typeof game !== 'undefined' && game ? game : window.game || null; } catch (_) { return window.game || null; } };
  const getPlayer = () => getGame()?.player || null;

  function ensureMapRegistry() {
    let defs, obstacles, hazards;
    try { defs = typeof mapDefs !== 'undefined' ? mapDefs : window.mapDefs; } catch (_) { defs = window.mapDefs; }
    try { obstacles = typeof mapObstacles !== 'undefined' ? mapObstacles : window.mapObstacles; } catch (_) { obstacles = window.mapObstacles; }
    try { hazards = typeof mapHazards !== 'undefined' ? mapHazards : window.mapHazards; } catch (_) { hazards = window.mapHazards; }
    if (!defs || !obstacles || !hazards) return false;
    const palettes = {
      Forest:['#0b1710','#1b3021','#63ba78'], Desert:['#24170b','#4a3219','#d5a24a'], Snow:['#0b1520','#263c4d','#8bd9ff'],
      Lava:['#1c0a08','#421b16','#ff6546'], City:['#090d13','#232c38','#6f97c3'], Hospital:['#101821','#293a47','#6fd0ea'],
      Laboratory:['#08161a','#1b3942','#7de2ff'], Subway:['#111119','#292935','#d0a6ff'], Prison:['#151a1f','#303b44','#9bb4c7'],
      MilitaryBase:['#121a13','#293b2a','#a4c47a'], RuinedTown:['#1c1412','#3a2925','#d59b77'], Harbor:['#0b1820','#203e4b','#70cfe0'],
      Bunker:['#14181b','#303b40','#9ab3b8'], Swamp:['#10180e','#26341b','#9db85c'], Skyscraper:['#11131d','#292d43','#b0a9ff'],
      Wasteland:['#17130d','#393020','#d0b06d'], Seizure:['#0d0715','#2b2040','#d08cff'], Ribhouse:['#180b07','#3d1f15','#e06437']
    };
    const descriptions = {
      Forest:'Woodland cover, fallen logs and rocky clearings.', Desert:'Sandstone ruins, cacti and wide sightlines.', Snow:'Ice shelves and frozen lanes.',
      Lava:'Volcanic ground with glowing fissures.', City:'Street cover and urban lanes.', Hospital:'Clinical corridors and emergency-room landmarks.',
      Laboratory:'Experimental structures and cool-lit lanes.', Subway:'Tunnel routes and rail hazards.', Prison:'Reinforced cover and narrow choke points.',
      MilitaryBase:'Fortifications, barriers and a defense line.', RuinedTown:'Collapsed buildings and broken streets.', Harbor:'Cargo routes and waterfront lanes.',
      Bunker:'Blast doors and enclosed routes.', Swamp:'Bog pools and dead trees.', Skyscraper:'Office cover and vertical-feeling lanes.',
      Wasteland:'Salvage fields, cracked earth and wreckage.', Seizure:'Geometric sensory-overload arena without strobe effects.',
      Ribhouse:'BBQ restaurant floor, serving lanes and dining zones.'
    };
    for (const key of MAPS) {
      const p = palettes[key];
      if (!defs[key]) defs[key] = {bg:p[0],grid:p[1],accent:p[2],desc:descriptions[key]};
      else { defs[key].desc = defs[key].desc || descriptions[key]; }
      if (!Array.isArray(obstacles[key])) obstacles[key] = [];
      if (!hazards[key]) {
        const source = hazards[key === 'Wasteland' ? 'Desert' : 'Forest'] || {interval:20,damage:8,color:p[2]};
        hazards[key] = Object.assign({}, source, {color:source.color || p[2]});
      }
    }
    window.OUTLAST_MAP_REGISTRY_VERSION = VERSION;
    window.OUTLAST_MAP_REGISTRY_COUNT = MAPS.filter(k => !!defs[k] && Array.isArray(obstacles[k]) && !!hazards[k]).length;
    return window.OUTLAST_MAP_REGISTRY_COUNT === MAPS.length;
  }

  function repairMapSelection() {
    ensureMapRegistry();
    const picker = window.OUTLAST_OPEN_MAP_PICKER_3377;
    if (typeof picker === 'function') {
      const btn = document.getElementById('mapBtn');
      if (btn && btn.dataset.outlastMapRepair !== VERSION) {
        btn.dataset.outlastMapRepair = VERSION;
        btn.onclick = function (event) { if (event) { event.preventDefault(); event.stopPropagation(); } picker(); };
      }
    }
    const original = window.startGame;
    if (typeof original === 'function' && !original.__outlastV410MapGuard) {
      const wrapped = function () {
        ensureMapRegistry();
        const s = getSave();
        if (s && !MAPS.includes(String(s.map || 'Forest')) && !String(s.map || '').startsWith('CustomMap:')) s.map = 'Forest';
        const chosen = String(s?.map || 'Forest');
        window.OUTLAST_LAST_STARTED_MAP = chosen;
        const result = original.apply(this, arguments);
        const g = getGame();
        if (g) g.map = chosen;
        return result;
      };
      wrapped.__outlastV410MapGuard = true;
      window.startGame = wrapped;
      try { startGame = wrapped; } catch (_) {}
    }
    window.OUTLAST_MAP_PLAYABILITY_AUDIT = function () {
      ensureMapRegistry();
      let defs, obstacles, hazards;
      try { defs = mapDefs; obstacles = mapObstacles; hazards = mapHazards; } catch (_) { defs = {}; obstacles = {}; hazards = {}; }
      return {version:VERSION,count:MAPS.filter(k => !!defs[k] && Array.isArray(obstacles[k]) && !!hazards[k]).length,maps:MAPS.map(key=>({key,definition:!!defs[key],obstacles:Array.isArray(obstacles[key]),hazard:!!hazards[key]}))};
    };
  }

  const FAMILIES = [
    {name:'Damage Matrix',desc:n=>'+'+fmt(.25*n)+' starting weapon damage',apply:(p,n)=>{p.damage=(Number(p.damage)||0)+.25*n;}},
    {name:'Vital Core',desc:n=>'+'+fmt(2*n)+' starting max HP',apply:(p,n)=>{p.max+=2*n;p.hp=Math.min(p.max,p.hp+2*n);}},
    {name:'Fleet Engine',desc:n=>'+'+fmt(.006*n*100)+'% movement speed',apply:(p,n)=>{p.speed=Math.min(Number(p.speedCap)||9,(Number(p.speed)||1)*(1+.006*n));}},
    {name:'Longshot Array',desc:n=>'+'+fmt(3*n)+' weapon range',apply:(p,n)=>{p.range=(Number(p.range)||0)+3*n;}},
    {name:'Magnet Field',desc:n=>'+'+fmt(4*n)+' pickup range',apply:(p,n)=>{p.magnet=(Number(p.magnet)||0)+4*n;}},
    {name:'Renewal Circuit',desc:n=>'+'+fmt(.025*n)+' HP per second',apply:(p,n)=>{p.regen=(Number(p.regen)||0)+.025*n;}},
    {name:'Piercing Rails',desc:n=>'+'+Math.max(1,Math.floor(n/2))+' piercing at full node level',apply:(p,n)=>{p.pierce=(Number(p.pierce)||0)+Math.max(1,Math.floor(n/2));}},
    {name:'Multi-Volley',desc:n=>'+'+Math.max(1,Math.floor(n/3))+' projectile at full node level',apply:(p,n)=>{p.multiShot=(Number(p.multiShot)||0)+Math.max(1,Math.floor(n/3));}},
    {name:'Deadeye Lens',desc:n=>'+'+fmt(.0015*n*100)+'% critical chance',apply:(p,n)=>{p.crit=Math.min(.99,(Number(p.crit)||0)+.0015*n);}},
    {name:'Critical Payload',desc:n=>'+'+fmt(.015*n)+' critical damage multiplier',apply:(p,n)=>{p.critMult=(Number(p.critMult)||1.8)+.015*n;}},
    {name:'Projectile Thrusters',desc:n=>'+'+fmt(.01*n*100)+'% projectile speed',apply:(p,n)=>{p.projectileSpeed=(Number(p.projectileSpeed)||1)*(1+.01*n);}},
    {name:'Rapid Trigger',desc:n=>'+'+fmt(.004*n*100)+'% attack speed',apply:(p,n)=>{p.fireRate=Math.max(.045,(Number(p.fireRate)||.45)/(1+.004*n));}},
    {name:'Coin Engine',desc:n=>'+'+fmt(.01*n*100)+'% coin earnings',apply:(p,n)=>{p.coinMult=(Number(p.coinMult)||1)*(1+.01*n);}},
    {name:'XP Reactor',desc:n=>'+'+fmt(.015*n*100)+'% XP gain',apply:(p,n)=>{p.xpBonus=(Number(p.xpBonus)||1)*(1+.015*n);}},
    {name:'Bossbreaker Core',desc:n=>'+'+fmt(.015*n*100)+'% boss damage',apply:(p,n)=>{p.bossMult=(Number(p.bossMult)||1)*(1+.015*n);}},
    {name:'Ultimate Amplifier',desc:n=>'+'+fmt(.02*n*100)+'% ultimate damage',apply:(p,n)=>{p.ultDamage=(Number(p.ultDamage)||1)*(1+.02*n);}},
    {name:'Ultimate Capacitor',desc:n=>'+'+fmt(.015*n*100)+'% ultimate charge gain',apply:(p,n)=>{p.ultGain=(Number(p.ultGain)||1)*(1+.015*n);}},
    {name:'Armor Piercing',desc:n=>'+'+fmt(.01*n*100)+'% armor pierce',apply:(p,n)=>{p.armorPierce=(Number(p.armorPierce)||0)+.01*n;}},
    {name:'Vampiric Edge',desc:n=>'+'+fmt(.002*n*100)+'% lifesteal',apply:(p,n)=>{p.lifesteal=(Number(p.lifesteal)||0)+.002*n;}},
    {name:'Thorn Armor',desc:n=>'+'+fmt(.015*n*100)+'% thorns retaliation',apply:(p,n)=>{p.thorns=(Number(p.thorns)||0)+.015*n;p.thornsRadius=Math.max(Number(p.thornsRadius)||0,180);}},
    {name:'Shield Weave',desc:n=>'+'+fmt(.08*n)+' seconds of shield',apply:(p,n)=>{p.shield=Math.max(Number(p.shield)||0,.08*n);}},
    {name:'Damage Dampener',desc:n=>fmt(.003*n*100)+'% less incoming damage',apply:(p,n)=>{p.damageTakenMult=(Number(p.damageTakenMult)||1)*(1-Math.min(.35,.003*n));}},
    {name:'Healing Resonance',desc:n=>'+'+fmt(.015*n*100)+'% healing strength',apply:(p,n)=>{p.healMult=(Number(p.healMult)||1)*(1+.015*n);}},
    {name:'Upgrade Fortune',desc:n=>'+'+fmt(.5*n)+' upgrade luck',apply:(p,n)=>{p.upgradeLuck=(Number(p.upgradeLuck)||0)+.5*n;p.luck=(Number(p.luck)||0)+.5*n;}},
    {name:'Loot Fortune',desc:n=>'+'+fmt(.5*n)+' loot luck',apply:(p,n)=>{p.lootLuck=(Number(p.lootLuck)||0)+.5*n;p.luck=(Number(p.luck)||0)+.5*n;}},
    {name:'Treasure Fortune',desc:n=>'+'+fmt(.5*n)+' treasure luck',apply:(p,n)=>{p.treasureLuck=(Number(p.treasureLuck)||0)+.5*n;p.luck=(Number(p.luck)||0)+.5*n;}},
    {name:'Pet Bond',desc:n=>'+'+fmt(.01*n*100)+'% pet power',apply:(p,n)=>{p.petPower=(Number(p.petPower)||1)*(1+.01*n);}},
    {name:'Relic Resonance',desc:n=>'+'+fmt(.01*n*100)+'% relic power',apply:(p,n)=>{p.relicPower=(Number(p.relicPower)||1)*(1+.01*n);}},
    {name:'Charm Resonance',desc:n=>'+'+fmt(.01*n*100)+'% charm power',apply:(p,n)=>{p.charmPower=(Number(p.charmPower)||1)*(1+.01*n);}},
    {name:'Blast Radius',desc:n=>'+'+fmt(2*n)+' explosion radius',apply:(p,n)=>{p.explosionRadius=(Number(p.explosionRadius)||0)+2*n;}},
    {name:'Burning Edge',desc:n=>'+'+fmt(.001*n*100)+'% burn chance',apply:(p,n)=>{p.burnChance=(Number(p.burnChance)||0)+.001*n;}},
    {name:'Frost Circuit',desc:n=>'+'+fmt(.01*n*100)+'% enemy slow strength',apply:(p,n)=>{p.slowPower=(Number(p.slowPower)||1)+.01*n;}},
    {name:'Poison Payload',desc:n=>'+'+fmt(.001*n*100)+'% poison chance',apply:(p,n)=>{p.poisonChance=(Number(p.poisonChance)||0)+.001*n;}},
    {name:'Chain Conductor',desc:n=>'+'+fmt(.001*n*100)+'% chain chance',apply:(p,n)=>{p.chainChance=(Number(p.chainChance)||0)+.001*n;}},
    {name:'Dash Calibration',desc:n=>'+'+fmt(.01*n*100)+'% dash distance',apply:(p,n)=>{p.dashDistanceMult=(Number(p.dashDistanceMult)||1)*(1+.01*n);}},
    {name:'Dash Coolant',desc:n=>fmt(.01*n*100)+'% shorter dash cooldown',apply:(p,n)=>{p.dashCooldownMult=(Number(p.dashCooldownMult)||1)*(1-.01*n);}},
    {name:'Skill Coolant',desc:n=>fmt(.01*n*100)+'% shorter skill cooldown',apply:(p,n)=>{p.skillCooldownMult=(Number(p.skillCooldownMult)||1)*(1-.01*n);}},
    {name:'Elite Hunter',desc:n=>'+'+fmt(.02*n*100)+'% elite damage',apply:(p,n)=>{p.eliteMult=(Number(p.eliteMult)||1)*(1+.02*n);}},
    {name:'Coin Value',desc:n=>'+'+fmt(.01*n*100)+'% coin pickup value',apply:(p,n)=>{p.coinValueMult=(Number(p.coinValueMult)||1)*(1+.01*n);}},
    {name:'XP Value',desc:n=>'+'+fmt(.01*n*100)+'% XP pickup value',apply:(p,n)=>{p.xpValueMult=(Number(p.xpValueMult)||1)*(1+.01*n);}},
    {name:'Knockback Training',desc:n=>'+'+fmt(2*n)+' knockback force',apply:(p,n)=>{p.knockback=(Number(p.knockback)||0)+2*n;}},
    {name:'Score Multiplier',desc:n=>'+'+fmt(.01*n*100)+'% score gain',apply:(p,n)=>{p.scoreMult=(Number(p.scoreMult)||1)*(1+.01*n);}},
    {name:'Projectile Mass',desc:n=>'+'+fmt(.5*n)+' projectile size',apply:(p,n)=>{p.projectileSize=(Number(p.projectileSize)||1)+.5*n;}},
    {name:'Ammo Efficiency',desc:n=>'+'+fmt(.01*n*100)+'% ammo efficiency',apply:(p,n)=>{p.ammoEfficiency=(Number(p.ammoEfficiency)||1)*(1+.01*n);}},
    {name:'Pickup Duration',desc:n=>'+'+fmt(1*n)+' pickup attraction strength',apply:(p,n)=>{p.magnet=(Number(p.magnet)||0)+n;}},
    {name:'Boss Stagger',desc:n=>'+'+fmt(.001*n*100)+'% boss stagger chance',apply:(p,n)=>{p.bossStunChance=(Number(p.bossStunChance)||0)+.001*n;}},
    {name:'Emergency Guard',desc:n=>'+'+fmt(.002*n*100)+'% emergency shield chance',apply:(p,n)=>{p.emergencyShieldChance=(Number(p.emergencyShieldChance)||0)+.002*n;}},
    {name:'Rebirth Reserve',desc:n=>'+'+fmt(.001*n*100)+'% revive chance',apply:(p,n)=>{p.reviveChance=(Number(p.reviveChance)||0)+.001*n;}},
    {name:'Weapon Stability',desc:n=>'+'+fmt(.01*n*100)+'% weapon stability',apply:(p,n)=>{p.weaponStability=(Number(p.weaponStability)||1)*(1+.01*n);}},
    {name:'Overheat Control',desc:n=>'+'+fmt(.01*n*100)+'% overheat control',apply:(p,n)=>{p.overheatControl=(Number(p.overheatControl)||1)*(1+.01*n);}},
    {name:'Evolution Catalyst',desc:n=>'+'+fmt(.015*n*100)+'% evolved weapon damage',apply:(p,n)=>{p.evolutionDamage=(Number(p.evolutionDamage)||1)*(1+.015*n);}},
    {name:'Wave Rewards',desc:n=>'+'+fmt(.015*n*100)+'% wave reward bonus',apply:(p,n)=>{p.waveRewardMult=(Number(p.waveRewardMult)||1)*(1+.015*n);}},
    {name:'Resource Saver',desc:n=>'+'+fmt(.01*n*100)+'% resource bonus',apply:(p,n)=>{p.resourceMult=(Number(p.resourceMult)||1)*(1+.01*n);}}
  ];

  const permanentDefs = Object.create(null);
  let permanentAdded = 0;
  function installPermanentChoices() {
    try { if (typeof permanent === 'undefined' || !Array.isArray(permanent)) return 0; } catch (_) { return 0; }
    const existing = new Set(permanent.map(x=>Array.isArray(x)?String(x[0]):''));
    // Interleave families by rank so all available mechanics are represented even when filling a partially populated tree.
    for (let rank=0; rank<10 && permanent.length<500; rank++) {
      for (let fi=0; fi<FAMILIES.length && permanent.length<500; fi++) {
        const family=FAMILIES[fi];
        const name='Ascension • '+family.name+' '+String(rank+1).padStart(2,'0');
        if (existing.has(name)) continue;
        const strength=rank+1;
        const desc=family.desc(strength)+' per purchased level. Max level 5.';
        const cost=1200+fi*95+rank*260;
        permanent.push([name,desc,cost,'Ascension']);
        permanentDefs[name]={family,rank};
        existing.add(name);
        permanentAdded++;
      }
    }
    // If the existing tree was already over 500, do not remove old upgrades or player progress.
    window.OUTLAST_PERMANENT_EXPANSION_COUNT=permanent.length;
    window.OUTLAST_PERMANENT_EXPANSION_ADDED=permanentAdded;
    return permanent.length;
  }

  function applyPermanentChoices() {
    const s=getSave(),g=getGame(),p=g&&g.player;
    if(!s||!p)return;
    for(const [name,def] of Object.entries(permanentDefs)) {
      const levels=Math.max(0,Math.min(5,Math.floor(Number(s.upgrades?.[name])||0)));
      if(!levels)continue;
      const strength=(def.rank+1)*levels;
      try { def.family.apply(p,strength); } catch(error) { window.OUTLAST_PERMANENT_APPLY_ERROR=String(error&&error.message||error); }
    }
  }

  function installInRunChoices() {
    let pool;
    try { pool = typeof tempUp !== 'undefined' && Array.isArray(tempUp) ? tempUp : null; } catch (_) { pool = null; }
    if (!pool) return 0;
    const rarityPools = window.OUTLAST_UPGRADE_RARITY_POOLS || (window.OUTLAST_UPGRADE_RARITY_POOLS = {});
    const byName = window.OUTLAST_UPGRADE_RARITY_BY_NAME || (window.OUTLAST_UPGRADE_RARITY_BY_NAME = {});
    for (const tier of TIERS) if (!Array.isArray(rarityPools[tier])) rarityPools[tier]=[];
    const names = new Set(pool.map(x=>Array.isArray(x)?String(x[0]):''));
    let added=0;
    outer: for (const family of FAMILIES) {
      for (const tier of TIERS) {
        if (names.size >= 500) break outer;
        const name='Ascension • '+family.name+' ['+tier+']';
        if (names.has(name)) continue;
        const entry=[
          name,
          value=>family.desc(Math.max(1,Number(value)||SCALE.Common)),
          value=>{const p=getPlayer();if(p)family.apply(p,Math.max(1,Number(value)||SCALE.Common));}
        ];
        pool.push(entry);
        rarityPools[tier].push(name);
        byName[name]=tier;
        names.add(name);
        added++;
      }
    }
    window.OUTLAST_IN_RUN_EXPANSION_ADDED=added;
    window.OUTLAST_UPGRADE_LIBRARY_COUNT=names.size;
    window.OUTLAST_UPGRADE_LIBRARY_VERSION=VERSION;
    return names.size;
  }

  function enhancePermanentTree() {
    const host=document.getElementById('subContent');
    const title=host&&host.querySelector('h2');
    if(!host||!title||!String(title.textContent||'').includes('Permanent Upgrade Tree'))return;
    if(host.querySelector('#outlastV410PermanentSearch'))return;
    const grid=host.querySelector('.grid');
    if(!grid)return;
    const bar=document.createElement('div');
    bar.className='option';
    bar.style.cssText='display:grid;gap:8px;margin:10px 0';
    bar.innerHTML='<b>ASCENSION TREE • '+(typeof permanent!=='undefined'?permanent.length:0)+' PERMANENT CHOICES</b><input id="outlastV410PermanentSearch" type="search" placeholder="Search permanent upgrades…" aria-label="Search permanent upgrades" style="width:100%;box-sizing:border-box;padding:11px;border-radius:8px;background:#0c141c;color:#fff;border:1px solid #496174"><small id="outlastV410PermanentCount">Showing all permanent upgrades</small>';
    host.insertBefore(bar,grid);
    const input=bar.querySelector('input'),status=bar.querySelector('small');
    input.addEventListener('input',()=>{
      const q=input.value.trim().toLowerCase();let shown=0;
      grid.querySelectorAll('button[data-action="upgrade"]').forEach(button=>{
        const match=!q||button.textContent.toLowerCase().includes(q);
        button.style.display=match?'':'none';if(match)shown++;
      });
      status.textContent='Showing '+shown+' of '+grid.querySelectorAll('button[data-action="upgrade"]').length+' permanent upgrades';
    });
  }

  function addStylesAndHelp() {
    if(!document.getElementById('outlast-v410-style')){
      const style=document.createElement('style');style.id='outlast-v410-style';
      style.textContent='.outlast-v410-upgrade-count{display:inline-flex;align-items:center;gap:6px;padding:5px 9px;border:1px solid #35536a;border-radius:9px;color:#bfe8ff;font-size:12px;font-weight:800}#outlastV410PermanentSearch:focus{outline:2px solid #75cfff;outline-offset:1px}';
      document.head.appendChild(style);
    }
    try {
      if(Array.isArray(updates)&&!updates.some(x=>Array.isArray(x)&&String(x[0]).includes('v4.2.1'))){
        updates.unshift(['v4.2.1 — Map, Skill + AFK Reliability','Repaired built-in map registry and selection validation. Expanded the permanent upgrade tree to 500 choices and the in-run level-up pool to at least 500 distinct cards, added a searchable permanent tree, and increased upper-rarity scaling through Omega 8×.']);
      }
      if(Array.isArray(helpArticles)){
        const articles=[
          ['How do I select the new maps?','Maps','Open Play → Choose Map, select any map tile, and check the SELECTED marker. The selection is saved before the picker closes. All 18 built-in maps have registered terrain, obstacles, and hazard profiles.'],
          ['How do I change my Active Skill?','Active Skills','Open Loadout → Manage Skills. Click an owned skill to equip it, or click an unowned skill to buy it if you have enough coins. The selected skill is saved and used with Q during a run.'],
          ['What is the AFK Lounge?','AFK Lounge','Open More → AFK Lounge, or use the AFK Spot button during a run. It is a safe pause area: enemies and run rewards are paused until you resume.'],
          ['How many upgrade choices are there in v4.2.1?','Upgrades & Rarities','The permanent upgrade tree contains at least 500 choices, and the in-run level-up pool contains at least 500 distinct cards. Use the search field at the top of the permanent tree to find a specific upgrade.'],
          ['What are the updated rarity multipliers?','Upgrades & Rarities','Common 1×, Uncommon 1.15×, Rare 1.35×, Epic 1.6×, Legendary 1.9×, Mythic 2.25×, Divine 4×, Celestial 4.8×, Transcendent 5.6×, Eternal 6.8×, Omega 8×. Higher tiers scale above lower tiers.']
        ];
        for(let i=articles.length-1;i>=0;i--)if(!helpArticles.some(a=>a&&a[0]===articles[i][0]))helpArticles.unshift(articles[i]);
      }
    } catch (_) {}
  }

  function setVersionAndPopup() {
    window.OUTLAST_BUILD=VERSION;
    window.OUTLAST_VERSION='v'+VERSION;
    document.title='OUTLAST v'+VERSION;
    document.querySelectorAll('[data-outlast-version]').forEach(el=>el.textContent='v'+VERSION);
    document.querySelectorAll('.menu-chip').forEach(el=>{
      const t=String(el.textContent||'');
      if(/SURVIVOR HUB/i.test(t))el.textContent=t.replace(/v\d+\.\d+\.\d+/ig,'v'+VERSION);
    });
    const modal=document.getElementById('outlastV4000UpdatePopup');
    if(modal){
      const title=modal.querySelector('#outlastV4000UpdateTitle');
      if(title)title.textContent='OUTLAST v4.2.1 — Map, Skill + AFK Reliability';
      const paragraphs=modal.querySelectorAll('p');
      if(paragraphs[0])paragraphs[0].textContent='Reliability patch: map tiles now have a dedicated selection route, Active Skills can be purchased and equipped, purchased Ascension bonuses apply at run start, and the safe AFK Lounge pauses the run and rewards.';
      const gotIt=document.getElementById('outlastV4000GotIt'),close=document.getElementById('outlastV4000Close');
      const acknowledge=()=>{try{localStorage.setItem('outlastSeenUpdateVersion',VERSION)}catch(_){};modal.style.display='none';};
      if(gotIt)gotIt.onclick=acknowledge;
      if(close)close.onclick=acknowledge;
      let seen=false;try{seen=localStorage.getItem('outlastSeenUpdateVersion')===VERSION}catch(_){}
      modal.style.display=seen?'none':'flex';
    }
    const updateNote=document.querySelector('[data-outlast-v4000-update-note]');
    if(updateNote){
      updateNote.innerHTML='<b>v4.2.0 — Maps, Skills + AFK Lounge</b><div class="small">Reliable map tile selection; Active Skills can be purchased/equipped; permanent Ascension effects apply on run start; 500 permanent and 500 in-run upgrade choices; safe AFK Lounge.</div>';
    }
  }


  function installPermanentApplyHook() {
    const original=window.startGame;
    if(typeof original!=='function'||original.__outlastV420PermanentApply)return;
    const wrapped=function(){const result=original.apply(this,arguments);try{const g=getGame();if(g&&g.player&&!g.player.__outlastAscensionApplied){applyPermanentChoices();g.player.__outlastAscensionApplied=true;}}catch(error){window.OUTLAST_PERMANENT_APPLY_ERROR=String(error&&error.message||error);}return result;};
    wrapped.__outlastV420PermanentApply=true;window.startGame=wrapped;try{startGame=wrapped}catch(_){}
  }
  function installMapClickRepair() {
    if(window.__OUTLAST_V420_MAP_CLICK_REPAIR)return;window.__OUTLAST_V420_MAP_CLICK_REPAIR=true;
    document.addEventListener('click',function(event){
      const tile=event.target&&event.target.closest&&event.target.closest('button[data-outlast3377-map]');if(!tile)return;
      event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();ensureMapRegistry();
      const key=String(tile.getAttribute('data-outlast3377-map')||'');
      try{if(typeof window.selectMap==='function')window.selectMap(key);else{const s=getSave();if(s&&MAPS.includes(key)){s.map=key;if(typeof persist==='function')persist();if(typeof updateMenuSummary==='function')updateMenuSummary();if(typeof closeSub==='function')closeSub();if(typeof toast==='function')toast('Map selected: '+key);}}window.OUTLAST_LAST_MAP_SELECTION=key;}
      catch(error){window.OUTLAST_MAP_SELECTION_ERROR=String(error&&error.message||error);if(typeof toast==='function')toast('Could not select this map. Reopen Choose Map and try again.');}
    },true);
    const style=document.createElement('style');style.id='outlast-v420-map-click-style';style.textContent='#outlast3377MapPickerModal{z-index:999999!important;pointer-events:auto!important}#outlast3377MapPickerModal *{pointer-events:auto}';document.head.appendChild(style);
  }
  function installSkillSelectionRepair() {
    window.selectSkill=function(name){
      const s=getSave();if(!s||!activeSkills||!activeSkills[name])return false;s.ownedSkills=s.ownedSkills||{};const def=activeSkills[name];
      if(!s.ownedSkills[name]){const cost=Math.max(0,Number(def.cost)||0);if((Number(s.coins)||0)<cost){if(typeof toast==='function')toast('Need '+cost.toLocaleString()+' coins to unlock '+name+'.');return false;}s.coins=Math.max(0,Number(s.coins)-cost);s.ownedSkills[name]=true;}
      s.activeSkill=name;if(typeof persist==='function')persist();if(typeof updateMenuSummary==='function')updateMenuSummary();if(typeof renderSkills==='function')renderSkills();if(typeof toast==='function')toast(name+' equipped — press Q during a run.');window.OUTLAST_ACTIVE_SKILL_SELECTION=name;return true;
    };
  }
  function installAFKLounge() {
    if(window.__OUTLAST_V420_AFK_INSTALLED)return;window.__OUTLAST_V420_AFK_INSTALLED=true;
    const more=document.querySelector('[data-page-content="more"] .menu-cards');
    if(more&&!document.getElementById('outlastAFKLoungeBtn')){const card=document.createElement('div');card.className='menu-card';card.innerHTML='<h3>☕ AFK Lounge</h3><p class="small">A safe place to step away. Enemies and rewards pause while you are here.</p><button class="menu-btn" id="outlastAFKLoungeBtn" type="button">Open AFK Lounge</button>';more.appendChild(card);}
    if(!document.getElementById('outlastAFKSpotButton')){const b=document.createElement('button');b.id='outlastAFKSpotButton';b.type='button';b.textContent='☕ AFK Spot';b.style.cssText='position:fixed;left:12px;bottom:12px;z-index:130;display:none;padding:10px 13px;border-radius:12px;border:1px solid #6c927c;background:#14261e;color:#e9fff1;font-weight:800;box-shadow:0 5px 20px #0008;cursor:pointer';document.body.appendChild(b);}
    if(!document.getElementById('outlastAFKLounge')){const m=document.createElement('div');m.id='outlastAFKLounge';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.style.cssText='position:fixed;inset:0;z-index:1000000;display:none;align-items:center;justify-content:center;padding:18px;background:radial-gradient(ellipse at center,#213a31ee,#050b0af5);backdrop-filter:blur(7px)';m.innerHTML='<section style="width:min(600px,94vw);border:1px solid #527c68;border-radius:22px;padding:26px;background:linear-gradient(145deg,#172b23,#09110e);color:#edfff4;box-shadow:0 25px 80px #000b;text-align:center"><div style="font-size:46px">☕ 🌿</div><div style="font-size:28px;font-weight:900;margin:8px 0">AFK LOUNGE</div><p style="color:#c1d9cb;line-height:1.55">Safe spot: the run is paused, enemies stop, and no run rewards are earned while you take a break.</p><div style="margin:18px auto;padding:14px;border-radius:12px;background:#0b1711;border:1px solid #2e4c3b"><b>SAFE ZONE • PAUSED</b></div><div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><button type="button" id="outlastAFKResume" class="menu-btn">▶ Resume Run</button><button type="button" id="outlastAFKReturn" class="menu-btn">Return to Menu</button></div></section>';document.body.appendChild(m);}
    let wasRunning=false,wasPaused=false;
    const open=()=>{const g=getGame();wasRunning=!!(g&&g.running&&!g.over);wasPaused=!!(g&&g.paused);if(g&&wasRunning)g.paused=true;const m=document.getElementById('outlastAFKLounge');if(m)m.style.display='flex';window.OUTLAST_AFK_ACTIVE=true;};
    const close=resume=>{const g=getGame(),m=document.getElementById('outlastAFKLounge');if(m)m.style.display='none';if(g&&wasRunning)g.paused=resume?false:wasPaused;window.OUTLAST_AFK_ACTIVE=false;if(!resume&&wasRunning&&typeof showMenu==='function')showMenu();};
    document.getElementById('outlastAFKLoungeBtn')?.addEventListener('click',open);document.getElementById('outlastAFKSpotButton')?.addEventListener('click',open);document.getElementById('outlastAFKResume')?.addEventListener('click',()=>close(true));document.getElementById('outlastAFKReturn')?.addEventListener('click',()=>close(false));
    const spot=document.getElementById('outlastAFKSpotButton');setInterval(()=>{const g=getGame();if(spot)spot.style.display=g&&g.running&&!g.over?'block':'none';},1000);
  }

  function install() {
    if(window.__OUTLAST_V410_INSTALLED){installInRunChoices();try{window.OUTLAST_UPGRADE_LIBRARY_COUNT=new Set(tempUp.map(x=>x&&x[0]).filter(Boolean)).size}catch(_){}repairMapSelection();installMapClickRepair();installSkillSelectionRepair();installAFKLounge();installPermanentApplyHook();setVersionAndPopup();return;}
    window.__OUTLAST_V410_INSTALLED=true;
    const mapOk=ensureMapRegistry();
    installPermanentChoices();
    const runCount=installInRunChoices();
    repairMapSelection();
    installMapClickRepair();
    installSkillSelectionRepair();
    installAFKLounge();
    installPermanentApplyHook();
    addStylesAndHelp();
    setVersionAndPopup();
    const host=document.getElementById('subContent');
    if(host&&typeof MutationObserver==='function'){
      const observer=new MutationObserver(()=>enhancePermanentTree());
      observer.observe(host,{childList:true,subtree:true});
      window.OUTLAST_V410_TREE_OBSERVER=observer;
    }
    const upgradeBtn=document.getElementById('upgradeBtn');
    if(upgradeBtn)upgradeBtn.addEventListener('click',()=>setTimeout(enhancePermanentTree,0),true);
    window.OUTLAST_MAP_UPGRADE_EXPANSION_AUDIT=function(){
      let defs,obstacles,hazards;
      try{defs=mapDefs;obstacles=mapObstacles;hazards=mapHazards}catch(_){defs={};obstacles={};hazards={};}
      const permanentCount=(()=>{try{return typeof permanent!=='undefined'&&Array.isArray(permanent)?permanent.length:0}catch(_){return 0}})();
      const inRunCount=(()=>{try{return typeof tempUp!=='undefined'&&Array.isArray(tempUp)?new Set(tempUp.map(x=>x&&x[0]).filter(Boolean)).size:0}catch(_){return 0}})();
      return {version:VERSION,permanentChoices:permanentCount,inRunChoices:inRunCount,mapRegistryCount:MAPS.filter(k=>!!defs[k]&&Array.isArray(obstacles[k])&&!!hazards[k]).length,permanentAdded,runChoicesAdded:runCount>=0?window.OUTLAST_IN_RUN_EXPANSION_ADDED||0:0,mapRegistryReady:mapOk};
    };
    window.OUTLAST_MAP_UPGRADE_EXPANSION_READY=true;
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
  setTimeout(install,0);
  window.addEventListener('load',install,{once:true});
})();