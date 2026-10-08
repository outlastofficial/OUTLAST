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

/* OUTLAST v3.37.0 — authoritative progression, collection, AI, and UI pass */
(function(){
'use strict';
const G37=()=>typeof game!=='undefined'?game:null;
const S37=()=>typeof save!=='undefined'?save:{};
const E37=v=>String(v==null?'':v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const O37=o=>Object.keys(o||{}).filter(k=>o[k]).length;
const SCALE37={Common:1,Uncommon:1.15,Rare:1.35,Epic:1.6,Legendary:1.9,Mythic:2.25,Divine:2.7,Celestial:3.2,Transcendent:3.8,Eternal:4.6,Omega:5.5};
const RARITY_W37={Common:52,Uncommon:25,Rare:13,Epic:6.5,Legendary:2.5,Mythic:.5,Divine:.25,Celestial:.12,Transcendent:.06,Eternal:.025,Omega:.005};

function syncVersion37(){
  window.OUTLAST_BUILD='3.37.0';window.OUTLAST_VERSION='v3.37.0';
  document.title='OUTLAST v3.37.0';
  document.querySelectorAll('[data-outlast-version]').forEach(e=>e.textContent='v3.37.0');
  const a=document.querySelector('meta[name="outlast-build"]');if(a)a.content='3.37.0';
  const b=document.querySelector('meta[name="build-version"]');if(b)b.content='3.37.0';
  const chip=document.querySelector('#menu .menu-chip');if(chip)chip.textContent='v3.37.0 • SURVIVOR HUB';
}

function installAuthoritativeUpgrades37(){
  window.OUTLAST_UPGRADE_RARITY_SCALING={...SCALE37};
  if(!window.OUTLAST_UPGRADE_RARITY_BY_NAME)window.OUTLAST_UPGRADE_RARITY_BY_NAME={};
  const libNames=Array.isArray(window.OUTLAST_UPGRADE_LIBRARY_NAMES)?window.OUTLAST_UPGRADE_LIBRARY_NAMES:[];
  const mappedNames=libNames.filter(n=>window.OUTLAST_UPGRADE_RARITY_BY_NAME[n]);
  const pool=Array.isArray(tempUp)?tempUp.filter(u=>u&&window.OUTLAST_UPGRADE_RARITY_BY_NAME[u[0]]):[];
  window.OUTLAST_UPGRADE_AUDIT={
    scale:{...SCALE37},
    examples:{
      CommonScholar:'Base 3% XP ×1.00 = +3.0% XP',
      MythicScholar:'Base 3% XP ×2.25 = +6.8% XP • Rarity ×2.25',
      OmegaScholar:'Base 3% XP ×5.50 = +16.5% XP • Rarity ×5.50'
    },
    mappedCards:mappedNames.length||pool.length,
    rule:'Displayed rarity and applied effect use the same authoritative card rarity.'
  };
  function weightedRarity37(luck){
    const bonus=Math.min(.9,Math.max(0,Number(luck)||0)/100);
    const w={};
    Object.entries(RARITY_W37).forEach(([k,v],i)=>{
      const boost=Math.min(6,1+bonus*(i<2?.35:i<5?1.2:3.5));
      w[k]=i===0?v*(1-bonus*.62):v*boost;
    });
    let total=Object.values(w).reduce((a,v)=>a+v,0),r=Math.random()*total;
    for(const k of Object.keys(w)){r-=w[k];if(r<=0)return k}
    return 'Common';
  }
  window.makeChoices=function(){
    const choices=[],used=new Set(),byR={};
    for(const u of pool){const name=u[0],r=window.OUTLAST_UPGRADE_RARITY_BY_NAME[name];(byR[r]||(byR[r]=[])).push(u);}
    for(let slot=0;slot<3&&pool.length;slot++){
      let desired=slot===0&&G37()?.level===3?'Legendary':weightedRarity37(G37()?.player?.upgradeLuck||0);
      let candidates=byR[desired]?.filter(u=>!used.has(u[0]))||[];
      if(!candidates.length){
        const ranked=Object.keys(SCALE37).slice().sort((a,b)=>Math.abs((SCALE37[a]||1)-(SCALE37[desired]||1))-Math.abs((SCALE37[b]||1)-(SCALE37[desired]||1)));
        for(const r of ranked){candidates=(byR[r]||[]).filter(u=>!used.has(u[0]));if(candidates.length){desired=r;break;}}
      }
      if(!candidates.length)break;
      const u=candidates[Math.floor(Math.random()*candidates.length)],name=u[0],r=window.OUTLAST_UPGRADE_RARITY_BY_NAME[name]||desired,mult=Number(SCALE37[r]||1);
      used.add(name);
      const desc=typeof u[1]==='function'?u[1](mult):String(u[1]||'');
      const apply=typeof u[2]==='function'?u[2](mult):u[2];
      choices.push([name,desc+' • Rarity ×'+mult.toFixed(2),typeof apply==='function'?apply:()=>{},r,{baseMultiplier:mult,rarity:r}]);
    }
    return choices;
  };
}

function ownerVisible37(){
  const ok=typeof isOwner==='function'&&isOwner();
  const b=document.getElementById('ownerBtn'),card=document.getElementById('ownerPanelCard');
  if(b)b.style.display=ok?'':'none';
  if(card)card.style.display=ok?'':'none';
}
function hideOwnerImmediately37(){
  const b=document.getElementById('ownerBtn'),card=document.getElementById('ownerPanelCard');
  if(b)b.style.display='none';if(card)card.style.display='none';ownerVisible37();
}

function bossGate37(){
  const g=G37();if(!g)return;
  g.nextBossLocked=!!(Array.isArray(g.enemies)&&g.enemies.some(e=>e&&e.boss&&!e.__dead&&Number(e.hp)>0));
  g.bossLockReason=g.nextBossLocked?'DEFEAT CURRENT BOSS':'READY';
}

function zombieProfile37(kind){
  const k=String(kind||'normal').toLowerCase();
  if(['ranged','spitter','volt'].includes(k))return 'ranged';
  if(['runner','fast','charger','leaper'].includes(k))return 'flanker';
  if(['tank','armored','brute','juggernaut','riftbrute'].includes(k))return 'bruiser';
  if(['phantom','mimic','wastelandstalker'].includes(k))return 'stalker';
  if(['crawler','swarm'].includes(k))return 'orbit';
  if(['screamer','siren'].includes(k))return 'retreat';
  if(['elite','golden','toxic','volatile'].includes(k))return 'hunter';
  return 'chase';
}
function outlastZombieAI(e,p,dt){
  if(!e||!p)return {vx:0,vy:0};
  e.aiProfile=e.aiProfile||zombieProfile37(e.kind);
  e.aiClock=(Number(e.aiClock)||0)+dt;
  const dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy)||1,tx=dx/d,ty=dy/d;
  let vx=tx*e.speed,vy=ty*e.speed;
  const px=-ty,py=tx;
  if(e.aiProfile==='ranged'){
    const desired=330,radial=(d-desired)*1.15;
    vx=tx*radial+px*Math.sin(e.aiClock*1.7+(e.x+e.y)*.002)*e.speed*.72;
    vy=ty*radial+py*Math.sin(e.aiClock*1.7+(e.x+e.y)*.002)*e.speed*.72;
  }else if(e.aiProfile==='flanker'){
    const orbit=px*(d>210?e.speed*.7:e.speed*1.15);
    vx=tx*e.speed*.78+orbit;vy=ty*e.speed*.78+py*(d>210?e.speed*.7:e.speed*1.15);
  }else if(e.aiProfile==='bruiser'){
    vx=tx*e.speed*.92;vy=ty*e.speed*.92;
  }else if(e.aiProfile==='stalker'){
    const orbit=px*(Math.sin(e.aiClock*.9)*.8+.8)*e.speed*.85;
    vx=tx*e.speed*.65+orbit;vy=ty*e.speed*.65+py*(Math.sin(e.aiClock*.9)*.8+.8)*e.speed*.85;
    if(d<110){vx=-tx*e.speed;vy=-ty*e.speed}
  }else if(e.aiProfile==='orbit'){
    const orbit=px*e.speed*.95,radial=(d-145)*.9;
    vx=tx*radial+orbit;vy=ty*radial+py*e.speed*.95;
  }else if(e.aiProfile==='retreat'){
    const base=d<180?-e.speed:e.speed*.78;
    vx=tx*base+px*Math.sin(e.aiClock*2.2)*e.speed*.7;
    vy=ty*base+py*Math.sin(e.aiClock*2.2)*e.speed*.7;
  }else if(e.aiProfile==='hunter'){
    const offset=px*Math.sin(e.aiClock*.75+(e.x*.01))*e.speed*.35;
    vx=tx*e.speed+offset;vy=ty*e.speed+py*Math.sin(e.aiClock*.75+(e.x*.01))*e.speed*.35;
  }
  const m=Math.hypot(vx,vy)||1;
  return {vx:Math.max(-e.speed,Math.min(e.speed,vx/m*e.speed)),vy:Math.max(-e.speed,Math.min(e.speed,vy/m*e.speed))};
}

function improveSkins37(){
  const list=Object.keys(skins||{}),bucket={};
  for(const n of list){const r=skins[n]?.rarity||'Common';(bucket[r]||(bucket[r]=[])).push(n);}
  window.openSkinMenu=function(){
    const s=S37(),order=['Common','Uncommon','Rare','Epic','Legendary','Mythic','Divine','Celestial','Transcendent','Eternal','Omega','Special'];
    const sections=order.filter(r=>bucket[r]?.length).map(r=>'<section style="margin-top:14px"><h3>'+r+'</h3><div class="grid">'+bucket[r].map(n=>{
      const v=skins[n],owned=!!s.skins?.[n],sel=s.selectedSkin===n;
      const stats=[['HP',v.hp],['DMG',v.damage],['SPD',v.speed],['XP',v.xp],['COINS',v.coins],['CRIT',v.crit],['BOSS',v.boss]].filter(x=>Number(x[1])>0).map(x=>x[0]+' +'+Math.round(x[1]*100)+'%').join(' • ')||'No stat bonus';
      return '<button class="option '+(sel?'selected ':'')+(owned?'':'locked')+'" data-skin37="'+E37(n)+'"><b>'+E37(n)+(sel?' • EQUIPPED':'')+'</b><div class="small">'+E37(v.rarity||'Common')+' • '+E37(stats)+'</div><div class="small">'+E37(v.bonus||'')+'</div></button>';
    }).join('')+'</div></section>').join('');
    openSub('✦ SKINS','<div class="option"><b>SKIN BONUSES ARE ACTIVE</b><div class="small">Equipped skin: '+E37(s.selectedSkin||'Classic')+'</div><button class="gold" id="skinCase37">OPEN CASE — 250 COINS / 1 VOUCHER</button></div>'+sections);
    document.querySelectorAll('[data-skin37]').forEach(b=>b.onclick=()=>{const n=b.dataset.skin37;if(!s.skins?.[n])return toast('Skin not owned');s.selectedSkin=n;persist();window.openSkinMenu();toast('✦ Equipped '+n);});
    document.getElementById('skinCase37')?.addEventListener('click',()=>window.openSkinCase37());
  };
  window.openSkinCase37=function(){
    const s=S37();let useVoucher=Number(s.caseCredits||0)>0;if(useVoucher)s.caseCredits--;else{if(Number(s.coins||0)<250)return toast('Not enough coins');s.coins-=250;}
    const r=Math.random();let acc=0,rarity='Common';
    for(const [k,p] of (typeof skinCaseOdds!=='undefined'?skinCaseOdds:[])){acc+=p;if(r<=acc){rarity=k;break;}}
    let choices=list.filter(n=>!s.skins?.[n]&&skins[n]?.rarity===rarity);
    if(!choices.length)choices=list.filter(n=>!s.skins?.[n]);
    if(!choices.length){if(!useVoucher)s.coins+=250;s.forgeCores=(s.forgeCores||0)+1;persist();toast('All skins owned — +1 Forge Core');window.openSkinMenu();return;}
    const got=choices[Math.floor(Math.random()*choices.length)];s.skins=s.skins||{};s.skins[got]=true;s.selectedSkin=got;persist();toast('✦ Unlocked '+got);window.openSkinMenu();
  };
}

function progress37(){
  const page=document.querySelector('[data-page-content="progress"]'),cards=page?.querySelector('.menu-cards');if(!page||!cards)return;
  const groups=[
    ['📊 STATS & RECORDS',[['progressStatsCombatBtn','📊 Stats'],['progressAchievementsBtn','🏆 Achievements'],['progressRecordsBtn','🥇 Records'],['progressLeaderboardBtn','📈 Leaderboards']]],
    ['✦ COLLECTION & LOADOUT',[['progressInventoryBtn','🎒 Inventory'],['progressCollectionBtn','✦ Collection'],['progressSkinsBtn','✦ Skins'],['progressCodexBtn','☠ Zombie Codex'],['progressSetsBtn','🧿 Build Sets']]],
    ['🧩 PROGRESSION & SYSTEMS',[['progressCoreBtn','🧩 12 Core Systems'],['progressUpgradeBtn','⛭ Upgrade Tree'],['progressEvolutionBtn','⚔ Evolution Tree'],['progressShopBtn','🛒 DAILY SHOP'],['progressModifierBtn','🎲 Run Modifiers'],['progressRarityBtn','✦ Rarity Ladder']]],
    ['♛ ENDGAME',[['progressBattlePassBtn','🏆 Battle Pass'],['progressPrestigeBtn','★ Prestige'],['progressWorldBossBtn','♛ World Bosses'],['progressRoomsBtn','▣ Secret Rooms'],['progressTitlesBtn','🏅 Titles'],['progressMissionsBtn','🎯 Missions & Quests']]
  ];
  cards.innerHTML='<div class="progress-v3370-grid">'+groups.map(g=>'<section class="progress-v3370-group"><h3>'+g[0]+'</h3><div class="progress-v3370-buttons">'+g[1].map(x=>'<button class="menu-btn progress-v3370-btn" type="button" id="'+x[0]+'">'+x[1]+'</button>').join('')+'</div></section>').join('')+'</div>';
  const bind=(id,fn)=>{const b=document.getElementById(id);if(b)b.onclick=fn};
  bind('progressStatsCombatBtn',stats37);bind('progressAchievementsBtn',()=>{renderAchievements37();});
  bind('progressRecordsBtn',()=>window.renderRecords37?window.renderRecords37():renderRecords?.());
  bind('progressLeaderboardBtn',()=>openServerLeaderboard?.());
  bind('progressInventoryBtn',inventory37);bind('progressCollectionBtn',collection37);bind('progressSkinsBtn',openSkinMenu);bind('progressCodexBtn',renderCodex);bind('progressSetsBtn',renderSets);
  bind('progressCoreBtn',core37);bind('progressUpgradeBtn',window.renderUpgradeTree||renderUpgradeTree);bind('progressEvolutionBtn',renderWeaponTree);
  bind('progressShopBtn',dailyShop37);bind('progressModifierBtn',modifier37);bind('progressRarityBtn',renderRarities);
  bind('progressBattlePassBtn',renderBattlePass);bind('progressPrestigeBtn',renderPrestige);bind('progressWorldBossBtn',renderWorldBosses);bind('progressRoomsBtn',renderRooms);
  bind('progressTitlesBtn',()=>titleOpen?.());bind('progressMissionsBtn',()=>document.getElementById('missionBtn')?.click());
}

function stats37(tab='overview'){
  const s=S37(),st=s.stats||{},r=s.records||{},g=G37(),p=g?.player;
  if(s.records){s.records.statsOpened=(Number(s.records.statsOpened)||0)+1;persist();}
  const data={
    overview:[['Games',st.games],['Kills',st.kills],['Bosses',st.bosses],['High Score',st.highScore],['Best Level',st.bestLevel],['Best Time',Math.floor(st.bestTime||0)+'s'],['Best Combo',r.bestCombo||0],['Best Damage',r.bestDamage||0]],
    combat:[['Damage',Math.round(p?.damage||0)],['Fire Interval',Number(p?.fireRate||0).toFixed(3)+'s'],['Crit',((p?.crit||0)*100).toFixed(1)+'%'],['Armor',((p?.armor||0)*100).toFixed(1)+'%'],['Pierce',p?.pierce||0],['Multi-Shot',p?.multiShot||0],['Boss Damage',((p?.bossMult||1)*100).toFixed(0)+'%'],['Shield',p?.shield||0]],
    progression:[['Level',g?.level||st.bestLevel||1],['Permanent Levels',Object.values(s.upgrades||{}).reduce((a,v)=>a+(Number(v)||0),0)],['Prestige',s.prestige||0],['Battle Pass XP',s.battlePassXP||0],['World Keys',s.worldKeys||0],['Upgrade Luck',p?.upgradeLuck||0],['Loot Luck',p?.lootLuck||0],['Treasure Luck',p?.treasureLuck||0]],
    collection:[['Characters',O37(s.unlockedChars)],['Weapons',O37(s.unlockedWeapons)],['Skins',O37(s.skins)],['Pets',O37(s.pets)],['Relics',O37(s.relics)],['Charms',O37(s.charms)],['Codex',O37(s.codex)],['Achievements',O37(s.ach)]],
    economy:[['Coins',s.coins||0],['Total Coins',st.totalCoins||0],['Forge Cores',s.forgeCores||0],['Materials',s.materials||0],['Mythic Dust',s.mythicDust||0],['Case Vouchers',s.caseCredits||0],['Shop Purchases',r.shopPurchases||0],['Keys',s.worldKeys||0]]
  };
  const tabs=[['overview','📊 Overview'],['combat','⚔ Combat'],['progression','★ Progression'],['collection','✦ Collection'],['economy','🪙 Economy']];
  openSub('📊 EXPANDED STATS','<div class="stats37-tabs">'+tabs.map(t=>'<button class="option '+(tab===t[0]?'selected':'')+'" data-stats37="'+t[0]+'">'+t[1]+'</button>').join('')+'</div><div class="stats37-grid">'+data[tab].map(x=>'<div class="stat-box"><b>'+E37(x[0])+'</b><span>'+E37(String(x[1]??0))+'</span></div>').join('')+'</div><div class="option" style="margin-top:12px"><b>LIVE RUN</b><div class="small">Map '+E37(s.map)+' • Mode '+E37(s.mode)+' • Difficulty '+E37(s.difficulty)+' • Boss '+(g?.enemies?.some(e=>e?.boss&&!e.__dead&&e.hp>0)?'LIVE':'NONE')+'</div></div>');
  document.querySelectorAll('[data-stats37]').forEach(b=>b.onclick=()=>stats37(b.dataset.stats37));
}

function inventory37(tab='loadout'){
  const s=S37(),own=o=>O37(o);
  if(s.records){s.records.inventoryOpened=(Number(s.records.inventoryOpened)||0)+1;persist();}
  const tabs=[['loadout','⚔ Loadout'],['characters','🧍 Characters'],['weapons','🔫 Weapons'],['skins','✦ Skins'],['pets','🐾 Pets'],['relics','🧿 Relics'],['charms','🪬 Charms']];
  let body='<div class="inventory37-tabs">'+tabs.map(t=>'<button class="option '+(tab===t[0]?'selected':'')+'" data-inv37="'+t[0]+'">'+t[1]+'</button>').join('')+'</div>';
  if(tab==='loadout'){
    body+='<div class="option"><b>EQUIPPED</b><div class="small">Character: '+E37(s.selectedChar)+' • Weapon: '+E37(s.selectedWeapon)+' • Skin: '+E37(s.selectedSkin)+'</div><div class="small">Pet: '+E37(s.selectedPet)+' • Relic: '+E37(s.selectedRelic||'None')+' • Charm: '+E37(s.selectedCharm||'None')+'</div></div><div class="inventory37-wallet"><b>WALLET</b><div class="small">🪙 '+Number(s.coins||0).toLocaleString()+' • 🔑 '+Number(s.worldKeys||0).toLocaleString()+' • ◆ '+Number(s.forgeCores||0)+' • ⛏ '+Number(s.materials||0)+' • ✦ '+Number(s.caseCredits||0)+'</div></div>';
  }else if(tab==='skins'){window.openSkinMenu();return;}else{
    const maps={characters:s.unlockedChars,weapons:s.unlockedWeapons,pets:s.pets,relics:s.relics,charms:s.charms},m=maps[tab]||{};
    body+='<div class="grid inventory37-list">'+Object.keys(m).map(n=>'<div class="option '+(m[n]?'selected':'')+'"><b>'+E37(n)+'</b><div class="small">'+(m[n]?'OWNED':'LOCKED')+'</div></div>').join('')+'</div>';
  }
  openSub('🎒 INVENTORY',body);document.querySelectorAll('[data-inv37]').forEach(b=>b.onclick=()=>inventory37(b.dataset.inv37));
}

function collection37(){
  const s=S37(),skinsOwned=O37(s.skins),pets=O37(s.pets),relics=O37(s.relics),charms=O37(s.charms);
  openSub('✦ COLLECTION','<div class="grid collection37-grid"><div class="option"><b>✦ Skins</b><div class="small">'+skinsOwned+' owned</div><button class="option" id="collection37Skins">OPEN</button></div><div class="option"><b>🐾 Pets</b><div class="small">'+pets+' owned</div><button class="option" id="collection37Pets">OPEN</button></div><div class="option"><b>🧿 Relics</b><div class="small">'+relics+' owned</div><button class="option" id="collection37Relics">OPEN</button></div><div class="option"><b>🪬 Charms</b><div class="small">'+charms+' owned</div><button class="option" id="collection37Charms">OPEN</button></div><div class="option"><b>☠ Zombie Codex</b><div class="small">'+O37(s.codex)+' discovered</div></div><div class="option"><b>⚔ Weapon Evolutions</b><div class="small">'+O37(s.weaponEvolutions)+' unlocked</div></div></div>');
  document.getElementById('collection37Skins')?.addEventListener('click',openSkinMenu);document.getElementById('collection37Pets')?.addEventListener('click',openPets);document.getElementById('collection37Relics')?.addEventListener('click',openRelics);document.getElementById('collection37Charms')?.addEventListener('click',openCharms);
}

function modifier37(filter='all'){
  const s=S37(),all=Object.keys(runModifiers||{}).filter(n=>n!=='None'),groups={all:all,combat:all.filter(n=>/rage|armor|glass|onehit|critical/i.test(n)),boss:all.filter(n=>/boss/i.test(n)),economy:all.filter(n=>/treasure|supply|coin|loot/i.test(n)),movement:all.filter(n=>/gravity|swarm|fast/i.test(n))},names=groups[filter]||all;
  openSub('🎲 RUN MODIFIERS','<div class="modifier37-filter">'+['all','combat','boss','economy','movement'].map(k=>'<button class="option '+(k===filter?'selected':'')+'" data-mod37="'+k+'">'+k.toUpperCase()+'</button>').join('')+'</div><div class="option"><b>RISK → REWARD</b><div class="small">Every card shows the exact reward multiplier plus its main danger.</div></div><div class="grid modifier37-grid">'+names.map(n=>{const v=runModifiers[n]||{};return '<button class="option" data-modpick37="'+E37(n)+'"><b>'+E37(n)+(s.selectedModifier===n?' • SELECTED':'')+'</b><div class="small">'+E37(v.desc||'Custom modifier')+'</div><div class="small">Reward ×'+Number(v.reward||1).toFixed(2)+' • Enemy ×'+Number(v.enemy||1).toFixed(2)+' • Spawn ×'+Number(v.spawn||1).toFixed(2)+'</div></button>';}).join('')+'</div>');
  document.querySelectorAll('[data-mod37]').forEach(b=>b.onclick=()=>modifier37(b.dataset.mod37));
  document.querySelectorAll('[data-modpick37]').forEach(b=>b.onclick=()=>{s.selectedModifier=b.dataset.modpick37;persist();modifier37(filter);});
}

const SHOP37=[
 {id:'coins37',name:'Coin Hoard',price:800,tag:'ECONOMY',desc:'+1,200 coins'},
 {id:'keys37',name:'Key Cache',price:1400,tag:'WORLD',desc:'+5 World Keys'},
 {id:'core37',name:'Forge Core Stack',price:1600,tag:'FORGE',desc:'+8 Forge Cores'},
 {id:'skin37',name:'Skin Case Bundle',price:2200,tag:'COSMETIC',desc:'+5 case vouchers'},
 {id:'mat37',name:'Material Vault',price:1500,tag:'CRAFT',desc:'+50 materials'},
 {id:'dust37',name:'Mythic Dust Vault',price:1900,tag:'RARITY',desc:'+10 Mythic Dust'},
 {id:'luck37',name:'Luck Capsule',price:1700,tag:'LUCK',desc:'+50 Upgrade Luck for next run'},
 {id:'xp37',name:'XP Booster Cache',price:1100,tag:'XP',desc:'+2 temporary XP boosters'},
 {id:'upgrade37',name:'Upgrade Coupon',price:2400,tag:'UPGRADE',desc:'+1 permanent upgrade level'},
 {id:'random37',name:'Mystery Crate',price:2000,tag:'MYSTERY',desc:'One random resource bundle'},
 {id:'heal37',name:'Shield Cell Pack',price:900,tag:'DEFENSE',desc:'+4 shield cells'},
 {id:'map37',name:'Map Keycard',price:1300,tag:'WORLD',desc:'+1 Map Creator token'}
];
function seed37(day){let h=2166136261;for(const ch of String(day))h=Math.imul(h^ch.charCodeAt(0),16777619)>>>0;return h>>>0;}
function dailyShop37(){
  const s=S37(),day=todayKey();if(s.shop37Day!==day){s.shop37Day=day;s.shop37Purchases={};let seed=seed37(day);const pool=SHOP37.slice(),ids=[];while(ids.length<10&&pool.length){seed=(Math.imul(seed,1664525)+1013904223)>>>0;ids.push(pool.splice(seed%pool.length,1)[0].id);}s.shop37Ids=ids;persist();}
  const ids=Array.isArray(s.shop37Ids)?s.shop37Ids:SHOP37.slice(0,10).map(x=>x.id),items=ids.map(id=>SHOP37.find(x=>x.id===id)).filter(Boolean),p=s.shop37Purchases||{};
  openSub('🛒 DAILY SHOP','<div class="daily-shop37-head"><div><b>10 OFFERS • '+E37(day)+'</b><div class="small">Stock rotates daily and every purchase is saved.</div></div><div class="daily-shop-timer">NEXT RESET<br><strong>'+new Date(dailyShopNextRefresh()).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})+'</strong></div></div><div class="daily-shop-grid-v3370">'+items.map(x=>'<button class="option '+(p[x.id]?'selected':'')+'" data-shop37="'+x.id+'" '+(p[x.id]?'disabled':'')+'><b>'+E37(x.name)+'</b><div class="small">'+E37(x.tag)+' • '+E37(x.desc)+'</div><div class="daily-shop-price">'+(p[x.id]?'✓ CLAIMED TODAY':'🪙 '+x.price.toLocaleString()+' coins')+'</div></button>').join('')+'</div>');
  document.querySelectorAll('[data-shop37]').forEach(b=>b.onclick=()=>buyShop37(b.dataset.shop37));
}
function buyShop37(id){
  const s=S37(),x=SHOP37.find(v=>v.id===id);if(!x)return;if(!s.shop37Purchases)s.shop37Purchases={};
  if(s.shop37Purchases[id])return toast('Already purchased today');if(Number(s.coins||0)<x.price)return toast('Not enough coins');
  s.coins-=x.price;
  if(id==='coins37')s.coins+=1200;if(id==='keys37')s.worldKeys=(s.worldKeys||0)+5;if(id==='core37')s.forgeCores=(s.forgeCores||0)+8;if(id==='skin37')s.caseCredits=(s.caseCredits||0)+5;if(id==='mat37')s.materials=(s.materials||0)+50;if(id==='dust37')s.mythicDust=(s.mythicDust||0)+10;if(id==='luck37')s.nextRunLuck=(s.nextRunLuck||0)+50;if(id==='xp37')s.xpBoosters=(s.xpBoosters||0)+2;if(id==='upgrade37'){const avail=(typeof permanent!=='undefined'?permanent:[]).filter(u=>(s.upgrades?.[u[0]]||0)<5);if(avail.length){const u=avail[Math.floor(Math.random()*avail.length)];s.upgrades[u[0]]=(s.upgrades[u[0]]||0)+1;}}if(id==='random37'){s.forgeCores=(s.forgeCores||0)+2;s.materials=(s.materials||0)+10;}if(id==='heal37')s.shieldCells=(s.shieldCells||0)+4;if(id==='map37')s.mapCreatorTokens=(s.mapCreatorTokens||0)+1;
  s.shop37Purchases[id]=true;s.records=s.records||{};s.records.shopPurchases=(Number(s.records.shopPurchases)||0)+1;persist();toast('🛒 '+x.name+' purchased!');dailyShop37();
}
window.dailyShopRotation37='v3.37.0 • 10 daily offers';

function core37(){
  const a=window.OUTLAST_CORE_CONTENT?.audit?.(),keys=['combat','enemies','bosses','world','events','progression','cosmetics','objectives','economy','modes','support','generation'];
  if(!a)return openSub('🧩 12 CORE SYSTEMS','<div class="option"><b>Core engine unavailable</b><div class="small">The current build could not initialize the 12-core engine.</div></div>');
  openSub('🧩 12 CORE SYSTEMS','<div class="option"><b>12 CORE SYSTEMS • LIVE</b><div class="small">These are live dashboards backed by the current engine, not a static list.</div></div><div class="grid core37-dashboard">'+keys.map(k=>'<button class="option" data-core37="'+k+'"><b>🧩 '+E37(k.toUpperCase())+'</b><div class="small">'+Number(a[k]||0).toLocaleString()+' active entries • OPEN</div></button>').join('')+'</div>');
  document.querySelectorAll('[data-core37]').forEach(b=>b.onclick=()=>{const d=window.OUTLAST_CORE_CONTENT?.data?.[b.dataset.core37];openSub('🧩 '+E37(b.dataset.core37.toUpperCase()),'<div class="option"><b>LIVE DATA</b><div class="small">'+(Array.isArray(d)?d.length+' generated entries':'Active')+'</div></div><div class="grid">'+(Array.isArray(d)?d.slice(0,60).map(x=>'<div class="option"><b>'+E37(x.name||'Entry')+'</b><div class="small">'+E37([x.tier,x.biome,x.behavior,x.reward,x.projectile,x.attack,x.effect].filter(Boolean).join(' • '))+'</div></div>').join(''):'<div class="option"><b>ACTIVE</b></div>')+'</div>')});
  window.CORE37_LIVE=coreLive37;
}
function coreLive37(k){const g=G37(),s=S37(),a=window.OUTLAST_CORE_CONTENT?.audit?.();if(k==='combat')return 'Damage '+Math.round(g?.player?.damage||0)+' • Crit '+((g?.player?.crit||0)*100).toFixed(1)+'%';if(k==='enemies')return 'Live '+(g?.enemies?.filter(e=>e&&!e.__dead).length||0)+' • Kills '+(s.stats?.kills||0);if(k==='bosses')return 'Boss '+(g?.enemies?.some(e=>e?.boss&&!e.__dead&&e.hp>0)?'LIVE — next spawn LOCKED':'WAITING');if(k==='world')return 'Map '+s.map+' • Zone '+(s.selectedZone||'Greenbelt');if(k==='events')return 'Run '+(g?.event||'None')+' • World '+(g?.worldEvent||'None');if(k==='progression')return 'Level '+(g?.level||1)+' • Permanent '+Object.values(s.upgrades||{}).reduce((n,v)=>n+(Number(v)||0),0);if(k==='cosmetics')return 'Skins '+O37(s.skins)+' • Pets '+O37(s.pets)+' • Relics '+O37(s.relics)+' • Charms '+O37(s.charms);if(k==='objectives')return (s.currentObjective||'Zombie Hunt')+' • '+(g?.objectiveProgress||0);if(k==='economy')return 'Coins '+Number(s.coins||0).toLocaleString()+' • Keys '+Number(s.worldKeys||0);if(k==='modes')return s.mode+' • '+s.difficulty+' • '+(s.challengeMode||'None');if(k==='support')return 'Save • Settings • Chat • Tutorial • Updates ACTIVE';if(k==='generation')return Number(a?.combinationSpace||0).toLocaleString()+' combinations';return '';}

function renderAchievements37(){
  const s=S37(),st=Object.assign({},s.stats||{},{skinsOwned:O37(s.skins),weaponsOwned:O37(s.unlockedWeapons),evolutions:O37(s.weaponEvolutions),crafted:Number(s.records?.totalCrafted||0),forgeCores:Number(s.forgeCores||0),prestige:Number(s.prestige||0),upgrades:Object.values(s.upgrades||{}).reduce((a,v)=>a+(Number(v)||0),0),coreSystemsOpened:Number(s.records?.coreSystemsOpened||0)});
  if(!Array.isArray(achievements))return;
  const add=[];
  const defs=[
   ['Boss Breaker 1','Defeat 3 bosses',x=>x.bosses>=3],['Boss Breaker 2','Defeat 20 bosses',x=>x.bosses>=20],['Boss Breaker 3','Defeat 75 bosses',x=>x.bosses>=75],['Boss Breaker 4','Defeat 150 bosses',x=>x.bosses>=150],
   ['Combo 50','Reach a 50 combo',x=>x.bestCombo>=50],['Combo 500','Reach a 500 combo',x=>x.bestCombo>=500],['Damage 10K','Record 10,000 best damage',x=>x.bestDamage>=10000],['Damage 100K','Record 100,000 best damage',x=>x.bestDamage>=100000],
   ['Map Scout','Play 5 maps',()=>Number(s.records?.mapsPlayed||0)>=5],['Map Explorer','Play 15 maps',()=>Number(s.records?.mapsPlayed||0)>=15],['Map Veteran','Play 25 maps',()=>Number(s.records?.mapsPlayed||0)>=25],
   ['Daily Fan','Buy 10 shop offers',()=>Number(s.records?.shopPurchases||0)>=10],['Daily Expert','Buy 50 shop offers',()=>Number(s.records?.shopPurchases||0)>=50],['Daily Legend','Buy 200 shop offers',()=>Number(s.records?.shopPurchases||0)>=200],
   ['Core Viewer','Open 1 core dashboard',x=>x.coreSystemsOpened>=1],['Core Researcher','Open 4 core dashboards',x=>x.coreSystemsOpened>=4],['Core Master','Open 8 core dashboards',x=>x.coreSystemsOpened>=8],['Core Engineer II','Open all 12 core dashboards',x=>x.coreSystemsOpened>=12],
   ['Skin Rookie','Own 2 skins',x=>x.skinsOwned>=2],['Skin Collector II','Own 10 skins',x=>x.skinsOwned>=10],['Skin Archivist','Own 20 skins',x=>x.skinsOwned>=20],
   ['Arsenal Rookie','Own 8 weapons',x=>x.weaponsOwned>=8],['Arsenal Expert','Own 16 weapons',x=>x.weaponsOwned>=16],['Arsenal Master','Own 24 weapons',x=>x.weaponsOwned>=24],
   ['Evolution Rookie','Unlock 2 evolutions',x=>x.evolutions>=2],['Evolution Expert','Unlock 8 evolutions',x=>x.evolutions>=8],['Evolution Master','Unlock 16 evolutions',x=>x.evolutions>=16],
   ['Forge Stocked','Hold 50 Forge Cores',x=>x.forgeCores>=50],['Forge Warehouse','Hold 100 Forge Cores',x=>x.forgeCores>=100],
   ['Upgrade Scholar','Buy 150 permanent levels',x=>x.upgrades>=150],['Upgrade Grandmaster','Buy 300 permanent levels',x=>x.upgrades>=300],
   ['Coins 100K','Earn 100,000 coins',x=>x.totalCoins>=100000],['Coins 1M','Earn 1,000,000 coins',x=>x.totalCoins>=1000000],['Coins 5M','Earn 5,000,000 coins',x=>x.totalCoins>=5000000],
   ['Level 60','Reach level 60',x=>x.bestLevel>=60],['Level 90','Reach level 90',x=>x.bestLevel>=90],['Level 120','Reach level 120',x=>x.bestLevel>=120],['Level 180','Reach level 180',x=>x.bestLevel>=180],
   ['Run 25','Complete 25 runs',x=>x.games>=25],['Run 100','Complete 100 runs',x=>x.games>=100],['Run 250','Complete 250 runs',x=>x.games>=250],
   ['XP Hunter','Earn 250,000 XP',()=>Number(s.records?.totalXP||0)>=250000],['XP Master','Earn 2,500,000 XP',()=>Number(s.records?.totalXP||0)>=2500000],
   ['Modifier Tester','Complete 5 modified runs',()=>Number(s.records?.modifiedRuns||0)>=5],['Modifier Scientist','Complete 25 modified runs',()=>Number(s.records?.modifiedRuns||0)>=25],
   ['Inventory Pro','Open Inventory 10 times',()=>Number(s.records?.inventoryOpened||0)>=10],['Stats Pro','Open Stats 10 times',()=>Number(s.records?.statsOpened||0)>=10],
   ['Rarity Hunter','Claim a Mythic upgrade',()=>Number(s.records?.mythicUpgrades||0)>=1],['Rarity Master','Claim an Omega upgrade',()=>Number(s.records?.omegaUpgrades||0)>=1],
   ['Shield Survivor','Block 25 hits',()=>Number(s.records?.shieldBlocks||0)>=25],['Shield Specialist','Block 100 hits',()=>Number(s.records?.shieldBlocks||0)>=100],
   ['Boss Gatekeeper','Defeat 25 bosses without a second boss spawning',x=>x.bosses>=25],
   ['AI Survivor','Survive 10 minutes with adaptive zombie AI active',x=>x.bestTime>=600],
   ['Collection Complete','Own 50 combined cosmetics',()=>O37(s.skins)+O37(s.pets)+O37(s.relics)+O37(s.charms)>=50],
   ['Collection Hoarder','Own 100 combined cosmetics',()=>O37(s.skins)+O37(s.pets)+O37(s.relics)+O37(s.charms)>=100]
  ];
  defs.forEach(a=>{if(!achievements.some(x=>x[0]===a[0]))add.push(a)});
  add.forEach(a=>achievements.push(a));
  while(achievements.length<90){
    const n=achievements.length+1;achievements.push(['Milestone '+n,'Complete '+n+' total progression milestones',x=>(x.games>=Math.max(1,n-40)&&x.kills>=Math.max(25,n*25))]);
  }
  window.ACHIEVEMENT_TARGET_37=90;
  for(const a of achievements){try{if(!s.ach[a[0]]&&a[2](st))s.ach[a[0]]=true}catch(_){}}
  persist();
  const unlocked=achievements.filter(a=>!!s.ach[a[0]]),next=achievements.filter(a=>!s.ach[a[0]]);
  const card=a=>'<div class="option '+(s.ach[a[0]]?'selected':'')+'"><b>'+(s.ach[a[0]]?'✓':'□ ') +E37(a[0])+'</b><div class="small">'+E37(a[1])+'</div></div>';
  openSub('🏆 ACHIEVEMENTS','<div class="option"><b>'+unlocked.length+'/'+achievements.length+' UNLOCKED</b><div class="small">Combat, bosses, AI, collection, economy, upgrades, cores, and mastery.</div></div><h3>Unlocked</h3><div class="grid">'+unlocked.map(card).join('')+'</div><h3>Next Targets</h3><div class="grid">'+next.slice(0,24).map(card).join('')+'</div>');
}

function patchBoss37(){
  const g=G37();if(!g)return;
  bossGate37();
  const original=window.spawnBoss;
  if(typeof original==='function'&&!original.__v3370){
    const wrapped=function(){
      if(outlastBossIsAlive?.())return false;
      const result=original();
      if(result){g.nextBossLocked=true;g.bossLockReason='DEFEAT CURRENT BOSS';}
      return result;
    };
    wrapped.__v3370=true;window.spawnBoss=wrapped;
  }
}

function installCss37(){
 if(document.getElementById('outlast-v3370-css'))return;
 const st=document.createElement('style');st.id='outlast-v3370-css';
 st.textContent='.progress-v3370-grid{display:grid;gap:14px}.progress-v3370-group{background:#101923;border:1px solid #294052;border-radius:18px;padding:13px}.progress-v3370-group h3{margin:0 0 9px;font-size:12px;letter-spacing:.12em;color:#8fb5cf}.progress-v3370-buttons{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}.progress-v3370-btn{margin:0!important;min-height:52px}.stats37-tabs,.inventory37-tabs,.modifier37-filter{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin-bottom:12px}.stats37-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}.inventory37-list,.modifier37-grid,.collection37-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.inventory37-wallet{margin:10px 0;padding:12px;border:1px solid #2d4154;border-radius:12px;background:#111d27}.core37-dashboard{grid-template-columns:repeat(3,minmax(0,1fr))}.daily-shop-grid-v3370{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:12px}.daily-shop37-head{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:12px;border:1px solid #2d4154;border-radius:14px;background:#101d28}.daily-shop-price{font-weight:900;margin-top:8px}.modifier37-grid{grid-template-columns:repeat(2,minmax(0,1fr))}@media(max-width:760px){.progress-v3370-buttons,.stats37-grid,.inventory37-list,.modifier37-grid,.collection37-grid,.core37-dashboard,.daily-shop-grid-v3370{grid-template-columns:1fr 1fr}}@media(max-width:480px){.progress-v3370-buttons,.stats37-grid,.inventory37-list,.modifier37-grid,.collection37-grid,.core37-dashboard,.daily-shop-grid-v3370{grid-template-columns:1fr}}';
 document.head.appendChild(st);
}
function wire37(){
 syncVersion37();
 installAuthoritativeUpgrades37();
 improveSkins37();
 if(typeof outlastGrantTempShield==='function'){
   const p=G37()?.player;
   if(p){p.skinColor=skins?.[S37().selectedSkin||'Classic']?.color||p.skinColor||'#5e9fff';p.shieldEfficiency=Math.max(1,Number(p.shieldEfficiency)||1);}
 }
 progress37();
 renderAchievements37;
 window.stats37=stats37;window.inventory37=inventory37;window.modifier37=modifier37;window.collection37=collection37;window.renderAchievements37=renderAchievements37;window.core37=core37;
 window.outlastZombieAI=outlastZombieAI;window.zombieProfile37=zombieProfile37;window.CORE37_LIVE=coreLive37;
 installCss37();
 hideOwnerImmediately37();setInterval(ownerVisible37,1000);
 setInterval(bossGate37,250);
 patchBoss37();
 if(Array.isArray(achievements)){addMoreAchievements36?.();renderAchievements37();}
 const btn=document.getElementById('startBtn');if(btn)btn.setAttribute('data-outlast-start-guard','v3.37.0');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire37,{once:true});else wire37();
})();