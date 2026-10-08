/* OUTLAST v3.36.0 — focused reliability + progression expansion */
(function(){
'use strict';
const E=v=>String(v==null?'':v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const S=()=>typeof save!=='undefined'?save:{};
const G=()=>typeof game!=='undefined'?game:null;
const owned=o=>Object.keys(o||{}).filter(k=>o[k]).length;

function installRarity36(){
  if(!window.OUTLAST_UPGRADE_RARITY_BY_NAME)window.OUTLAST_UPGRADE_RARITY_BY_NAME={};
  window.OUTLAST_UPGRADE_RARITY_SCALING={Common:1,Uncommon:1.15,Rare:1.35,Epic:1.6,Legendary:1.9,Mythic:2.25,Divine:2.7,Celestial:3.2,Transcendent:3.8,Eternal:4.6,Omega:5.5};
  const fallback=['Common','Uncommon','Rare','Epic','Legendary','Mythic','Divine','Celestial','Transcendent','Eternal','Omega'];
  const getRarity=name=>{
    const mapped=window.OUTLAST_UPGRADE_RARITY_BY_NAME?.[name];
    if(mapped)return mapped;
    const prefix=String(name||'').split(/\s+/)[0];
    return fallback.includes(prefix)?prefix:'Common';
  };
  window.makeChoices=function(){
    const pool=Array.isArray(tempUp)?tempUp.slice():[],out=[],used=new Set();
    while(out.length<3&&pool.length){
      const rarity=G()?.level===3&&out.length===0?'Legendary':(typeof rollUpgradeRarity==='function'?rollUpgradeRarity():'Common');
      const mapped=pool.filter(u=>!used.has(u?.[0])&&window.OUTLAST_UPGRADE_RARITY_BY_NAME?.[u?.[0]]===rarity);
      const candidates=mapped.length?mapped:pool.filter(u=>!used.has(u?.[0]));
      if(!candidates.length)break;
      const chosen=candidates[Math.floor(Math.random()*candidates.length)];
      const idx=pool.indexOf(chosen);if(idx<0)break;pool.splice(idx,1);
      const name=chosen[0],desc=chosen[1],apply=chosen[2];used.add(name);
      const actualRarity=window.OUTLAST_UPGRADE_RARITY_BY_NAME?.[name]||getRarity(name)||rarity;
      const mult=Number((upgradeRarities[actualRarity]||{}).mult)||1;
      out.push([name,desc(mult),()=>apply(mult),actualRarity,{rarity:actualRarity,multiplier:mult}]);
    }
    return out;
  };
}

function openSkinMenu36(){
  const s=S(),list=Object.keys(skins||{}),ownedSkins=list.filter(n=>!!s.skins?.[n]),byRarity={};
  for(const n of ownedSkins){
    byRarity[skins[n].rarity]||=[];
    if(!byRarity[skins[n].rarity])byRarity[skins[n].rarity]=[];
    byRarity[skins[n].rarity].push(n);
  }
  const order=['Common','Uncommon','Rare','Epic','Legendary','Mythic','Divine','Celestial','Transcendent','Eternal','Omega','Special'];
  const groups=order.filter(r=>byRarity[r]?.length).map(r=>{
    return '<section><h3>'+E(r)+' Skins</h3><div class="grid">'+byRarity[r].map(n=>{
      const v=skins[n],parts=[v.hp&&('HP +'+Math.round(v.hp*100)+'%'),v.damage&&('Damage +'+Math.round(v.damage*100)+'%'),v.speed&&('Speed +'+Math.round(v.speed*100)+'%'),v.xp&&('XP +'+Math.round(v.xp*100)+'%'),v.coins&&('Coins +'+Math.round(v.coins*100)+'%'),v.crit&&('Crit +'+Math.round(v.crit*100)+'%'),v.boss&&('Boss Damage +'+Math.round(v.boss*100)+'%')].filter(Boolean).join(' • ')||'No stat bonus';
      return '<button class="option '+(s.selectedSkin===n?'selected':'')+'" data-action="skin" data-value="'+E(n)+'"><b>'+E(n)+(s.selectedSkin===n?' • EQUIPPED':'')+'</b><div class="small">'+E(v.rarity)+' • '+E(parts)+'</div><div class="small">'+E(v.bonus||'No bonus')+'</div></button>';
    }).join('')+'</div></section>';
  }).join('');
  openSub('✦ Skins','<div class="option"><b>SKINS APPLY REAL BONUSES</b><div class="small">Equipped skin: <b>'+E(s.selectedSkin)+'</b>. Skin bonuses are applied in Start Run.</div><button class="gold" data-action="case">OPEN CASE — 250 ● / 1 Voucher</button></div><div class="small" style="margin:10px 0">Owned '+ownedSkins.length+'/'+list.length+'</div>'+groups);
}

function expandAchievements36(){
  if(!Array.isArray(achievements))return;
  const extra=[
    ['Combo Master','Reach a 100-hit combo',s=>Number(s.bestCombo||0)>=100],
    ['Combo Legend','Reach a 250-hit combo',s=>Number(s.bestCombo||0)>=250],
    ['Boss Line','Defeat 10 bosses',s=>Number(s.bosses||0)>=10],
    ['Boss Hunter Elite','Defeat 50 bosses',s=>Number(s.bosses||0)>=50],
    ['Skin Collector','Own 5 skins',s=>Number(s.skinsOwned||0)>=5],
    ['Wardrobe Full','Own 15 skins',s=>Number(s.skinsOwned||0)>=15],
    ['Arsenal Builder','Own 15 weapons',s=>Number(s.weaponsOwned||0)>=15],
    ['Evolution Path','Unlock 5 weapon evolutions',s=>Number(s.evolutions||0)>=5],
    ['Crafting Pro','Craft 25 items',s=>Number(s.crafted||0)>=25],
    ['Forge Master','Own 25 Forge Cores',s=>Number(s.forgeCores||0)>=25],
    ['Upgrade Hoarder','Buy 100 permanent upgrade levels',s=>Number(s.upgrades||0)>=100],
    ['Upgrade Architect','Buy 250 permanent upgrade levels',s=>Number(s.upgrades||0)>=250],
    ['Run Veteran','Complete 100 runs',s=>Number(s.games||0)>=100],
    ['Coin Tycoon','Collect 500,000 coins',s=>Number(s.totalCoins||0)>=500000],
    ['Prestige Master','Reach Prestige 5',s=>Number(s.prestige||0)>=5],
    ['Endgame Ready','Reach Best Level 100',s=>Number(s.bestLevel||0)>=100],
    ['Core Navigator','Open all 12 Core Systems',s=>Number(s.coreSystemsOpened||0)>=12],
    ['World Traveler','Play 10 different maps',()=>Number(S().records?.mapsPlayed||0)>=10],
    ['Modifier Master','Complete 10 modified runs',()=>Number(S().records?.modifiedRuns||0)>=10],
    ['Daily Shopper','Purchase 20 shop offers',()=>Number(S().records?.shopPurchases||0)>=20],
    ['Inventory Manager','Open Inventory',()=>Number(S().records?.inventoryOpened||0)>=1],
    ['Rarity Scholar','Open the Rarity Ladder',()=>Number(S().records?.rarityLadderOpened||0)>=1],
    ['No-Heal Survivor','Complete a NoHealing run',()=>Number(S().records?.noHealingRuns||0)>=1],
    ['Boss Rush Champion','Clear a Boss Rush run',()=>Number(S().records?.bossRushWins||0)>=1]
  ];
  extra.forEach(a=>{if(!achievements.some(x=>x[0]===a[0]))achievements.push(a);});
  // achievement catalog target: achievements.length>=60
}

function stats36(){
  const s=S(),st=s.stats||{},r=s.records||{},g=G(),p=g?.player;
  const levels=Object.values(s.upgrades||{}).reduce((n,v)=>n+(Number(v)||0),0);
  if(S().records){S().records.statsOpened=(Number(S().records.statsOpened)||0)+1;persist();}openSub('📊 Stats','<div class="stats-grid-v3360">'+
    [['Games',st.games],['Kills',st.kills],['Bosses',st.bosses],['High Score',st.highScore],['Best Level',st.bestLevel],['Best Time',Math.floor(Number(st.bestTime||0))+'s'],['Live Damage',Math.round(Number(p?.damage||0))],['Fire Rate',Number(p?.fireRate||0).toFixed(2)+'s'],['Crit',Number((p?.crit||0)*100).toFixed(1)+'%'],['Best Combo',r.bestCombo||0],['Best Damage',r.bestDamage||0],['Permanent Levels',levels],['Coins',s.coins||0],['World Keys',s.worldKeys||0],['Forge Cores',s.forgeCores||0],['Materials',s.materials||0],['Skins',owned(s.skins)],['Pets',owned(s.pets)],['Relics',owned(s.relics)],['Charms',owned(s.charms)],['Achievements',Object.keys(s.ach||{}).filter(k=>s.ach[k]).length],['Prestige',s.prestige||0]].map(x=>'<div class="stat-box"><b>'+E(x[0])+'</b><span>'+E(Number(x[1]||0).toLocaleString?.()??x[1])+'</span></div>').join('')+
    '</div><div class="small" style="margin-top:10px">Live map '+E(s.map||'Forest')+' • mode '+E(s.mode||'Classic')+' • difficulty '+E(s.difficulty||'Normal')+' • boss '+(Array.isArray(g?.enemies)&&g.enemies.some(e=>e?.boss&&!e.__dead&&e.hp>0)?'LIVE':'NONE')+'</div>');
}

function inventory36(){
  const s=S();
  if(s.records)s.records.inventoryOpened=(Number(s.records.inventoryOpened)||0)+1;persist();
  openSub('🎒 Inventory','<div class="option"><b>CURRENT LOADOUT</b><div class="small">'+E(s.selectedChar)+' • '+E(s.selectedWeapon)+' • '+E(s.selectedSkin)+' • '+E(s.selectedPet)+' • '+E(s.selectedRelic||'None')+' • '+E(s.selectedCharm||'None')+'</div></div><div class="inventory-wallet"><b>WALLET</b><div class="small">🪙 '+Number(s.coins||0).toLocaleString()+' • 🔑 '+Number(s.worldKeys||0).toLocaleString()+' • ◆ '+Number(s.forgeCores||0).toLocaleString()+' • ⛏ '+Number(s.materials||0).toLocaleString()+' • ✦ '+Number(s.caseCredits||0).toLocaleString()+'</div></div><div class="grid"><button class="option" data-action="skin" data-value="'+E(s.selectedSkin)+'"><b>✦ Skins</b><div class="small">'+owned(s.skins)+' owned</div></button><button class="option" data-action="pet" data-value="'+E(s.selectedPet)+'"><b>🐾 Pets</b><div class="small">'+owned(s.pets)+' owned</div></button><button class="option" data-action="relic" data-value="'+E(s.selectedRelic||'None')+'"><b>🧿 Relics</b><div class="small">'+owned(s.relics)+' owned</div></button><button class="option" data-action="charm" data-value="'+E(s.selectedCharm||'None')+'"><b>🪬 Charms</b><div class="small">'+owned(s.charms)+' owned</div></button></div>');
}

function modifiers36(){
  const s=S(),names=Object.keys(runModifiers||{}).filter(n=>n!=='None');
  openSub('🎲 Run Modifiers','<div class="option"><b>RISK → REWARD</b><div class="small">Pick a modifier and compare its Reward, Enemy, and Spawn multipliers before starting.</div></div><div class="grid modifiers-v3360">'+names.map(n=>{const v=runModifiers[n]||{};return '<button class="option modifier-v3360 '+(s.selectedModifier===n?'selected':'')+'" data-action="modifier" data-value="'+E(n)+'"><b>'+E(n)+(s.selectedModifier===n?' • SELECTED':'')+'</b><div class="small">'+E(v.desc||'Custom modifier')+'</div><div class="small">Reward ×'+Number(v.reward||1).toFixed(2)+' • Enemy ×'+Number(v.enemy||1).toFixed(2)+' • Spawn ×'+Number(v.spawn||1).toFixed(2)+'</div></button>';}).join('')+'</div>');
}

function coreLive36(k){
  const s=S(),g=G(),p=g?.player,a=window.OUTLAST_CORE_CONTENT?.audit?.();
  if(k==='Combat')return 'Damage '+Math.round(p?.damage||0)+' • Fire '+Number(p?.fireRate||0).toFixed(2)+'s';
  if(k==='Enemies')return 'Live '+(g?.enemies?.length||0)+' • Kills '+Number(s.stats?.kills||0);
  if(k==='Bosses')return (g?.enemies||[]).some(e=>e?.boss&&!e.__dead&&e.hp>0)?'LIVE BOSS':'WAITING FOR BOSS DEFEAT';
  if(k==='World')return 'Map '+(s.map||'Forest')+' • Zone '+(s.selectedZone||'Greenbelt');
  if(k==='Events')return 'Run '+(g?.event||'None')+' • World '+(g?.worldEvent||'None');
  if(k==='Progression')return 'Level '+Number(g?.level||s.stats?.bestLevel||1)+' • permanent '+Object.values(s.upgrades||{}).reduce((n,v)=>n+(Number(v)||0),0);
  if(k==='Cosmetics')return 'Skins '+owned(s.skins)+' • Pets '+owned(s.pets)+' • Relics '+owned(s.relics)+' • Charms '+owned(s.charms);
  if(k==='Objectives')return (s.currentObjective||'Zombie Hunt')+' • '+Math.floor(Number(g?.objectiveProgress||0));
  if(k==='Economy / Rewards')return 'Coins '+Number(s.coins||0).toLocaleString()+' • Keys '+Number(s.worldKeys||0).toLocaleString();
  if(k==='Game Modes')return (s.mode||'Classic')+' • '+(s.difficulty||'Normal')+' • '+(s.challengeMode||'None');
  if(k==='Support Systems')return 'Save • Settings • Chat • Tutorial • Updates ACTIVE';
  if(k==='Content Generation')return a?Number(a.combinationSpace||0).toLocaleString()+' combinations':'Engine loading';
  return '';
}
function core36(){
  const a=window.OUTLAST_CORE_CONTENT?.audit?.();if(!a)return openSub('🧩 12 Core Systems','<div class="option"><b>Core engine unavailable</b></div>');
  const keys=['Combat','Enemies','Bosses','World','Events','Progression','Cosmetics','Objectives','Economy / Rewards','Game Modes','Support Systems','Content Generation'];
  const map={Combat:'combat',Enemies:'enemies',Bosses:'bosses',World:'world',Events:'events',Progression:'progression',Cosmetics:'cosmetics',Objectives:'objectives', 'Economy / Rewards':'economy', 'Game Modes':'modes', 'Support Systems':'support', 'Content Generation':'generation'};
  openSub('🧩 12 Core Systems','<div class="option"><b>12 CORE SYSTEMS — LIVE</b><div class="small">Every tile has a live game-state snapshot plus the generated catalog behind it.</div></div><div class="grid core-grid-v3360">'+keys.map(k=>'<button class="option core-card-v3360" data-core36="'+E(k)+'"><b>🧩 '+E(k)+'</b><div class="small">'+E(coreLive36(k))+'</div><div class="small">'+(k==='Content Generation'?Number(a.combinationSpace||0).toLocaleString()+' combinations':Number(a[map[k]]||0).toLocaleString()+' entries')+' • OPEN</div></button>').join('')+'</div>');
  document.querySelectorAll('[data-core36]').forEach(b=>b.addEventListener('click',()=>{
    const k=map[b.dataset.core36],d=window.OUTLAST_CORE_CONTENT?.data?.[k];
    const s=S();s.records=s.records||{};s.records.coreSystemsSeen=s.records.coreSystemsSeen||{};s.records.coreSystemsSeen[k]=true;s.records.coreSystemsOpened=Object.keys(s.records.coreSystemsSeen).length;persist();
    openSub('🧩 '+b.dataset.core36,'<div class="option"><b>LIVE</b><div class="small">'+E(coreLive36(b.dataset.core36))+'</div></div><div class="grid">'+(Array.isArray(d)?d.slice(0,60).map(x=>'<div class="option"><b>'+E(x.name||'Entry')+'</b><div class="small">'+E([x.tier,x.biome,x.behavior,x.reward,x.projectile,x.attack].filter(Boolean).join(' • '))+'</div></div>').join(''):'<div class="option"><b>ACTIVE</b></div>')+'</div>');
  }));
}

function progress36(){
  const page=document.querySelector('[data-page-content="progress"]');if(!page)return;
  page.querySelector('#extrasBtn')?.closest('.menu-card')?.remove();
  if(!document.getElementById('progressSystems36')){
    const holder=document.createElement('div');holder.id='progressSystems36';holder.className='progress-v3360-stack';
    const group=(title,items)=>{const g=document.createElement('div');g.className='progress-group-v3360';g.innerHTML='<div class="progress-group-title">'+title+'</div><div class="progress-group-grid">'+items.map(x=>'<button class="menu-btn progress-direct-v3360" type="button" id="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>';return g;};
    holder.append(group('📊 TRACKING & MASTERY',[['statsCombatBtn','📊 Expanded Stats'],['progressAchievementsBtn','🏆 Achievements'],['progressRecordsBtn','🥇 Records'],['progressLeaderboardBtn','📈 Leaderboards']]),group('✦ COLLECTION',[['progressCollectionBtn','✦ Collection'],['progressInventoryBtn','🎒 Inventory'],['progressSkinsBtn','✦ Skins'],['progressCodexBtn','☠ Zombie Codex'],['progressSetsBtn','🧿 Build Sets']]),group('🧩 SYSTEMS',[['progressCoreBtn','🧩 12 Core Systems'],['progressUpgradeBtn','⛭ Permanent Upgrade Tree'],['progressEvolutionBtn','⚔ Weapon Evolution Tree'],['progressShopBtn','🛒 DAILY SHOP'],['progressModifierBtn','🎲 Run Modifiers']]),group('♛ ENDGAME',[['progressBattlePassBtn','🏆 Battle Pass'],['progressPrestigeBtn','★ Prestige'],['progressRarityBtn','✦ Rarity Ladder'],['progressWorldBossBtn','♛ World Bosses'],['progressRoomsBtn','▣ Secret Rooms']]));
    page.querySelector('.menu-cards')?.after(holder);
  }
  const bind=(id,fn)=>{const b=document.getElementById(id);if(b)b.onclick=fn;};
  bind('statsCombatBtn',stats36);bind('progressAchievementsBtn',()=>{addMoreAchievements36();document.getElementById('achBtn')?.click();});bind('progressRecordsBtn',renderRecords);bind('progressLeaderboardBtn',openServerLeaderboard);bind('progressCollectionBtn',()=>renderCollection36?renderCollection36():openSkinMenu36());bind('progressInventoryBtn',inventory36);bind('progressSkinsBtn',openSkinMenu36);bind('progressCodexBtn',renderCodex);bind('progressSetsBtn',renderSets);bind('progressCoreBtn',core36);bind('progressUpgradeBtn',renderUpgradeTree);bind('progressEvolutionBtn',renderWeaponTree);bind('progressShopBtn',dailyShopOpen);bind('progressModifierBtn',modifiers36);bind('progressBattlePassBtn',renderBattlePass);bind('progressPrestigeBtn',renderPrestige);bind('progressRarityBtn',()=>{S().records=S().records||{};S().records.rarityLadderOpened=(Number(S().records.rarityLadderOpened)||0)+1;persist();renderRarities();});bind('progressWorldBossBtn',renderWorldBosses);bind('progressRoomsBtn',renderRooms);
}

function installCss36(){
  if(document.getElementById('outlast-v3360-focused-css'))return;
  const st=document.createElement('style');st.id='outlast-v3360-focused-css';
  st.textContent='.progress-v3360-stack{display:grid;gap:12px;margin-top:12px}.progress-group-v3360{padding:12px;border:1px solid #2d4154;border-radius:16px;background:#101821}.progress-group-title{font-size:12px;font-weight:900;letter-spacing:.12em;color:#8fb5cf;margin-bottom:9px}.progress-group-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.progress-direct-v3360{margin:0!important;font-size:14px}.stats-grid-v3360{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.stat-box{background:#182431;border:1px solid #2b4053;border-radius:10px;padding:9px}.stat-box b{display:block;font-size:10px;color:#8298a9}.stat-box span{display:block;font-size:17px;font-weight:900;margin-top:3px}.inventory-wallet{padding:12px;border:1px solid #2d4154;border-radius:12px;background:#111d27}.core-grid-v3360{grid-template-columns:repeat(2,minmax(0,1fr))}.core-card-v3360{min-height:120px}.modifier-v3360{min-height:112px}.daily-shop-grid-v3360{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:12px}.daily-shop-card-v3360{min-height:125px}.daily-shop-card-v3360 .daily-shop-rank{font-size:10px;color:#83aac6;font-weight:900;margin-bottom:7px}@media(max-width:760px){.progress-group-grid,.stats-grid-v3360,.core-grid-v3360,.daily-shop-grid-v3360{grid-template-columns:1fr}}';
  document.head.appendChild(st);
}
function owner36(){const btn=document.getElementById('ownerBtn');if(btn)btn.style.display=isOwner()?'':'none';const card=document.getElementById('ownerPanelCard');if(card)card.style.display=isOwner()?'':'none';}

function installModifiers36(){
 if(typeof runModifiers==='undefined')return;
 const extras={NoHealing:{desc:'No healing; 2.4x rewards',spawn:1,reward:2.4,enemy:1,noHealing:true},FastBosses:{desc:'Boss timer 45% faster; 2.2x rewards',spawn:1,reward:2.2,enemy:1.15,bossEveryMult:.55},EliteSurge:{desc:'More elite enemies; 2.35x rewards',spawn:.92,reward:2.35,enemy:1.22,eliteChance:.18},EnemyRage:{desc:'Enemies hit harder; 2.5x rewards',spawn:1,reward:2.5,enemy:1.38},FragileArmor:{desc:'Take 35% more damage; 2.15x rewards',spawn:1,reward:2.15,enemy:1,damageTakenMult:1.35},TreasureHunt:{desc:'More loot; 2x rewards',spawn:.95,reward:2,enemy:.9,lootMult:1.35},SupplyShortage:{desc:'Fewer pickups; 2.3x rewards',spawn:1.08,reward:2.3,enemy:1.05,lootMult:.55},OneHitWonder:{desc:'One-hit failure challenge; 3.25x rewards',spawn:1,reward:3.25,enemy:1.1,oneHit:true},SwarmProtocol:{desc:'Heavy swarm pressure; 2.7x rewards',spawn:.52,reward:2.7,enemy:1.16},LowGravity:{desc:'Slower movement; 1.9x rewards',spawn:1.05,reward:1.9,enemy:.86},BossRushLite:{desc:'Bosses arrive sooner; 2.8x rewards',spawn:1,reward:2.8,enemy:1.2,bossEveryMult:.65},GlassEconomy:{desc:'Lower coin gain; 2.6x rewards',spawn:1,reward:2.6,enemy:1,coinMult:.65},CriticalOnly:{desc:'Harder enemies; crit-focused build; 2.45x rewards',spawn:1,reward:2.45,enemy:1.28,critMult:1.2}};
 Object.entries(extras).forEach(([n,v])=>{if(!runModifiers[n])runModifiers[n]=v;});
}
function installShop36(){
 if(typeof DAILY_SHOP_POOL==='undefined')return;
 const extras=[{id:'skinBundle',name:'Skin Case Bundle',price:1800,tag:'COSMETIC',desc:'+4 Skin Case Vouchers'},{id:'coreBurst',name:'Core Burst',price:2600,tag:'FORGE',desc:'+15 Forge Cores'},{id:'luckSurge',name:'Luck Surge',price:1700,tag:'LUCK',desc:'+50 Luck for your next run'},{id:'upgradeBundle',name:'Upgrade Bundle',price:3200,tag:'UPGRADE',desc:'+2 random permanent upgrades'},{id:'materialVault',name:'Material Vault',price:1750,tag:'CRAFT',desc:'+50 crafting materials'},{id:'keyVault',name:'World Key Vault',price:1700,tag:'WORLD',desc:'+5 World Keys'}];
 extras.forEach(x=>{if(!DAILY_SHOP_POOL.some(y=>y.id===x.id))DAILY_SHOP_POOL.push(x);});
 const oldEnsure=window.ensureDailyShopStock;
 if(typeof oldEnsure==='function'&&!oldEnsure.__v3360){
  const wrapped=function(){
   const s=S(),day=todayKey(),extraIds=extras.map(x=>x.id);
   if(s.shopStockRevision!=='v3360ShopRevision'&&s.shopStockDay===day&&Array.isArray(s.shopStockIds)&&s.shopStockIds.length===8)s.shopStockDay='';
   oldEnsure();
   if(s.shopStockRotation!=='3.36.0'||s.shopStockRevision!=='v3360ShopRevision'){s.shopStockRotation='3.36.0';s.shopStockRevision='v3360ShopRevision';persist();}
   if(s.shopStockDay===day&&Array.isArray(s.shopStockIds)&&s.shopStockIds.length===8&&!s.shopStockIds.some(id=>extraIds.includes(id))&&s.shopStockRevision==='v3360ShopRevision'){s.shopStockDay='';oldEnsure();s.shopStockRotation='3.36.0';s.shopStockRevision='v3360ShopRevision';persist();}
  };wrapped.__v3360=true;window.ensureDailyShopStock=wrapped;
 }
 const oldBuy=window.buyShop;
 if(typeof oldBuy==='function'&&!oldBuy.__v3360){
  const wrapped=function(k){
   const x=extras.find(e=>e.id===k);if(!x)return oldBuy(k);ensureDailyShopStock();const s=S(),day=todayKey();s.shopPurchases=s.shopPurchases||{};
   if(s.shopDay!==day){s.shopDay=day;s.shopPurchases={};}if(s.shopPurchases[k])return toast('Already purchased today');if(Number(s.coins||0)<x.price)return toast('Not enough coins');
   s.coins-=x.price;if(k==='skinBundle')s.caseCredits=(s.caseCredits||0)+4;if(k==='coreBurst')s.forgeCores=(s.forgeCores||0)+15;if(k==='luckSurge')s.nextRunLuck=(s.nextRunLuck||0)+50;
   if(k==='upgradeBundle'){const names=typeof permanent!=='undefined'?permanent.filter(u=>(s.upgrades?.[u[0]]||0)<5):[];for(let i=0;i<2&&names.length;i++){const u=names.splice(Math.floor(Math.random()*names.length),1)[0];s.upgrades[u[0]]=(s.upgrades[u[0]]||0)+1;}}
   if(k==='materialVault')s.materials=(s.materials||0)+50;if(k==='keyVault')s.worldKeys=(s.worldKeys||0)+5;s.shopPurchases[k]=true;s.records=s.records||{};s.records.shopPurchases=(Number(s.records.shopPurchases)||0)+1;persist();toast('🛒 '+x.name+' purchased!');dailyShopOpen();
  };wrapped.__v3360=true;window.buyShop=wrapped;
 }
 const oldDaily=window.dailyShopOpen;
 window.dailyShopOpen36=function(){ensureDailyShopStock();const s=S(),items=getDailyShopItems(),purchases=s.shopPurchases||{},day=todayKey();const cards=items.map((x,i)=>{const bought=!!purchases[x.id];return '<button class="option daily-shop-card-v3360 '+(bought?'selected':'')+'" data-action="shop" data-value="'+E(x.id)+'" '+(bought?'disabled':'')+'><div class="daily-shop-rank">OFFER '+String(i+1).padStart(2,'0')+'</div><b>'+E(x.name)+'</b><div class="small">'+E(x.tag)+' • '+E(x.desc)+'</div><div class="daily-shop-price">'+(bought?'✓ CLAIMED TODAY':'🪙 '+Number(x.price||0).toLocaleString()+' coins')+'</div></button>';}).join('');openSub('🛒 DAILY SHOP','<div class="daily-shop-banner-v3360"><div><b>8 OFFERS • '+E(day)+'</b><div class="small">Eight offers are saved for today. Stock rotates daily and purchases are saved.</div></div><div class="daily-shop-timer">NEXT RESET<br><strong>'+dailyShopCountdownText()+'</strong></div></div><div class="daily-shop-grid-v3360">'+cards+'</div>');};
 window.dailyShopOpen=window.dailyShopOpen36;window.shopOpen=window.dailyShopOpen36;
}
function addMoreAchievements36(){
 if(!Array.isArray(achievements))return;
 const more=[
  ['Level 75','Reach best level 75',s=>Number(s.bestLevel||0)>=75],
  ['Level 100','Reach best level 100',s=>Number(s.bestLevel||0)>=100],
  ['Level 125','Reach best level 125',s=>Number(s.bestLevel||0)>=125],
  ['Level 150','Reach best level 150',s=>Number(s.bestLevel||0)>=150],
  ['Combo Master II','Reach a 150-hit combo',s=>Number(s.bestCombo||0)>=150],
  ['Damage Master','Best damage >= 25000',()=>Number(S().records?.bestDamage||0)>=25000],
  ['Boss Line','Defeat 10 bosses',s=>Number(s.bosses||0)>=10],
  ['Boss Hunter Elite','Defeat 50 bosses',s=>Number(s.bosses||0)>=50],
  ['Skin Collector','Own 5 skins',s=>Number(s.skinsOwned||0)>=5],
  ['Wardrobe Full','Own 15 skins',s=>Number(s.skinsOwned||0)>=15],
  ['Arsenal Builder','Own 15 weapons',s=>Number(s.weaponsOwned||0)>=15],
  ['Crafting Pro','Craft 25 items',s=>Number(s.crafted||0)>=25],
  ['Forge Master','Own 25 Forge Cores',s=>Number(s.forgeCores||0)>=25],
  ['Upgrade Hoarder','Buy 100 permanent upgrade levels',s=>Number(s.upgrades||0)>=100],
  ['Upgrade Architect','Buy 250 permanent upgrade levels',s=>Number(s.upgrades||0)>=250],
  ['Run Veteran','Complete 100 runs',s=>Number(s.games||0)>=100],
  ['Coin Tycoon','Collect 500000 coins',s=>Number(s.totalCoins||0)>=500000],
  ['Prestige Master','Reach Prestige 5',s=>Number(s.prestige||0)>=5],
  ['Core Navigator','Open all 12 Core Systems',s=>Number(s.coreSystemsOpened||0)>=12],
  ['World Traveler','Play 10 maps',()=>Number(S().records?.mapsPlayed||0)>=10],
  ['Modifier Master','Complete 10 modified runs',()=>Number(S().records?.modifiedRuns||0)>=10],
  ['Daily Shopper','Purchase 20 shop offers',()=>Number(S().records?.shopPurchases||0)>=20],
  ['Inventory Manager','Open Inventory',()=>Number(S().records?.inventoryOpened||0)>=1],
  ['Rarity Scholar','Open the Rarity Ladder',()=>Number(S().records?.rarityLadderOpened||0)>=1],
  ['No-Heal Survivor','Complete a NoHealing run',()=>Number(S().records?.noHealingRuns||0)>=1],
  ['Boss Rush Champion','Clear a Boss Rush run',()=>Number(S().records?.bossRushWins||0)>=1],
  ['Pet Trainer','Own 6 pets',()=>owned(S().pets)>=6],
  ['Relic Hunter','Own 10 relics',()=>owned(S().relics)>=10],
  ['Charm Master','Own 10 charms',()=>owned(S().charms)>=10],
  ['Map Master','Play 16 maps',()=>Number(S().records?.mapsPlayed||0)>=16],
  ['Cosmetic Specialist','Own 30 cosmetics',s=>Number(s.skinsOwned||0)+owned(S().pets)+owned(S().relics)+owned(S().charms)>=30],
  ['Core Operator','Open 6 core dashboards',s=>Number(s.coreSystemsOpened||0)>=6],
  ['Core Engineer','Open all 12 core dashboards',s=>Number(s.coreSystemsOpened||0)>=12],
  ['Daily Veteran','Purchase 100 shop offers',()=>Number(S().records?.shopPurchases||0)>=100],
  ['Daily Legend','Purchase 250 shop offers',()=>Number(S().records?.shopPurchases||0)>=250],
  ['Core Browser','Open 3 core dashboards',s=>Number(s.coreSystemsOpened||0)>=3],
  ['Core Specialist','Open 9 core dashboards',s=>Number(s.coreSystemsOpened||0)>=9],
  ['Stats Fan','Open expanded Stats',()=>Number(S().records?.statsOpened||0)>=1],
  ['Inventory Fan','Open Inventory',()=>Number(S().records?.inventoryOpened||0)>=1],
  ['Skin Fitting','Equip a non-Classic skin',()=>S().selectedSkin&&S().selectedSkin!=='Classic'],
  ['Rare Wardrobe','Own 5 Rare+ skins',()=>Object.keys(S().skins||{}).filter(k=>S().skins[k]&&skins[k]&&['Rare','Epic','Legendary','Mythic','Divine','Celestial','Transcendent','Eternal','Omega'].includes(skins[k].rarity)).length>=5],
  ['Legendary Wardrobe','Own 3 Legendary+ skins',()=>Object.keys(S().skins||{}).filter(k=>S().skins[k]&&skins[k]&&['Legendary','Mythic','Divine','Celestial','Transcendent','Eternal','Omega'].includes(skins[k].rarity)).length>=3],
  ['Omega Odds','Own an Omega skin',()=>Object.keys(S().skins||{}).some(k=>S().skins[k]&&skins[k]?.rarity==='Omega')],
  ['Weapon Collector','Own 20 weapons',s=>Number(s.weaponsOwned||0)>=20],
  ['Pet Collector','Own 8 pets',()=>owned(S().pets)>=8],
  ['Relic Collector','Own 15 relics',()=>owned(S().relics)>=15],
  ['Charm Collector','Own 15 charms',()=>owned(S().charms)>=15],
  ['World Hopper','Play 20 maps',()=>Number(S().records?.mapsPlayed||0)>=20],
  ['Modifier Veteran','Complete 50 modified runs',()=>Number(S().records?.modifiedRuns||0)>=50],
  ['Modifier Collector','Try 10 modifier types',()=>Number(S().records?.modifierTypes||0)>=10],
  ['Boss Survivor','Win a run after defeating a boss',s=>Number(s.bosses||0)>=1],
  ['Boss Marathon','Defeat 100 bosses',s=>Number(s.bosses||0)>=100],
  ['XP Millionaire','Earn 1,000,000 XP',()=>Number(S().records?.totalXP||0)>=1000000],
  ['Economy Expert','Hold 100,000 coins',()=>Number(S().coins||0)>=100000],
  ['Build Archivist','Save 3 build presets',()=>Object.keys(S().buildPresets||{}).length>=3],
  ['Loadout Complete','Equip skin, pet, relic, charm',()=>!!(S().selectedSkin&&S().selectedPet&&S().selectedRelic&&S().selectedCharm)]
 ];
 more.forEach(a=>{if(!achievements.some(x=>x[0]===a[0]))achievements.push(a);});
}
function bindSkinFix36(){
 const s=S();
 window.selectSkin=function(n){
  if(!skins[n])return toast('Unknown skin');
  if(!s.skins?.[n])return toast('Open Skin Cases to unlock this skin');
  s.selectedSkin=n;persist();openSkinMenu36();toast('✦ Equipped '+n);
 };
 window.openSkinCase=function(){
  const st=S(),usedVoucher=Number(st.caseCredits||0)>0;
  if(usedVoucher)st.caseCredits--;else{if(Number(st.coins||0)<250)return toast('Not enough coins');st.coins-=250;}
  const roll=Math.random();let rarity='Common',acc=0;
  for(const pair of skinCaseOdds){acc+=pair[1];if(roll<=acc){rarity=pair[0];break;}}
  let pool=Object.keys(skins).filter(n=>!st.skins?.[n]&&skins[n].rarity===rarity);
  if(!pool.length)pool=Object.keys(skins).filter(n=>!st.skins?.[n]);
  if(!pool.length){if(!usedVoucher)st.coins+=250;st.forgeCores=(st.forgeCores||0)+1;persist();toast('◆ All skins owned — +1 Forge Core!');openSkinMenu36();return;}
  const got=pool[Math.floor(Math.random()*pool.length)];
  st.skins=st.skins||{};st.skins[got]=true;st.selectedSkin=got;persist();toast('✦ Unlocked '+got+'!');openSkinMenu36();
 };
 const b=document.getElementById('skinBtn');if(b)b.onclick=e=>{e.preventDefault();e.stopPropagation();openSkinMenu36();};
}
function syncOwnerLauncher(){
 const btn=document.getElementById('ownerBtn');if(btn)btn.style.display=isOwner()?'':'none';
 const card=document.getElementById('ownerPanelCard');if(card)card.style.display=isOwner()?'':'none';
}function install36(){installModifiers36();installShop36();addMoreAchievements36();bindSkinFix36();
  installCss36();expandAchievements36();installRarity36();window.openSkinMenu=openSkinMenu36;window.renderExpandedStats=stats36;window.renderExpandedInventory=inventory36;window.renderExpandedModifiers=modifiers36;window.renderCoreSystems=core36;window.CORE36_LIVE=coreLive36;window.syncOwnerLauncher=syncOwnerLauncher;progress36();owner36();
  S().records=S().records||{};persist();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install36,{once:true});else install36();
setTimeout(owner36,500);setInterval(owner36,2500);
})();