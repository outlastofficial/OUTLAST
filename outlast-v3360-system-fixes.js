/* OUTLAST v3.36.0 — system bug pass */
(function(){
'use strict';
const VERSION='3.36.0',SERVER='https://outlast-server.onrender.com';
const OWNER_NAMES=new Set(['bestgamer','landon','phone landon','poke','billybimbo']);
const esc=v=>String(v??'').replace(/[&<>"]/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));
const sv=v=>String(v||'0').replace(/^v/i,'').split('.').slice(0,3).map(x=>parseInt(x,10)||0);
const cmp=(a,b)=>{const A=sv(a),B=sv(b);for(let i=0;i<3;i++)if(A[i]!==B[i])return A[i]-B[i];return 0};
const owner=()=>OWNER_NAMES.has(String(window.currentUsername||'').trim().toLowerCase());

/* mandatory server update gate */
function gate(){
 let r=document.getElementById('outlast-v3360-mandatory-update');if(r)return r;
 const st=document.createElement('style');st.id='outlast-v3360-mandatory-update-style';st.textContent='#outlast-v3360-mandatory-update{position:fixed!important;inset:0!important;display:none!important;align-items:center!important;justify-content:center!important;padding:18px!important;box-sizing:border-box!important;background:rgba(2,6,11,.95)!important;backdrop-filter:blur(10px)!important;z-index:2147483646!important;font-family:Arial,sans-serif!important}#outlast-v3360-mandatory-update.show{display:flex!important}#outlast-v3360-mandatory-update .card{width:min(640px,94vw);background:#111b25;border:2px solid #4d8fbe;border-radius:22px;padding:24px;color:#fff;box-shadow:0 30px 100px #000b}#outlast-v3360-mandatory-update .state{margin:14px 0;padding:12px;border:1px solid #294153;border-radius:11px;background:#091118;color:#bfd0dc}#outlast-v3360-mandatory-update button{padding:11px 18px;border:0;border-radius:10px;background:#3da96b;color:#fff;font:700 15px Arial;cursor:pointer;box-shadow:0 4px 0 #23673f}';document.head.appendChild(st);
 r=document.createElement('div');r.id='outlast-v3360-mandatory-update';r.innerHTML='<div class="card" role="dialog" aria-modal="true"><div style="font-size:11px;font-weight:900;letter-spacing:.15em;color:#8ed0ff">OUTLAST • UPDATE CHECK</div><h2 id="v3360GateTitle">Checking for updates…</h2><p id="v3360GateCopy">Verifying this client against the live server.</p><div class="state" id="v3360GateState">Checking…</div><button id="v3360GateButton" style="display:none">UPDATE / RELOAD</button></div>';document.body.appendChild(r);return r;
}
function showGate(t,c,s,b){
 const r=gate();r.classList.add('show');r.querySelector('#v3360GateTitle').textContent=t;r.querySelector('#v3360GateCopy').textContent=c;r.querySelector('#v3360GateState').textContent=s;
 const x=r.querySelector('#v3360GateButton');x.style.display=b?'inline-block':'none';if(b)x.onclick=()=>location.href=location.pathname+'?outlastUpdate='+Date.now()+(location.hash||'');
}
function hideGate(){gate().classList.remove('show')}
async function checkMandatoryUpdate(){
 showGate('Checking for updates…','The game is verifying the current build.','Client: v'+VERSION);
 try{
  const res=await fetch(SERVER+'/api/version?clientVersion='+encodeURIComponent(VERSION)+'&t='+Date.now(),{cache:'no-store'});
  const d=await res.json(),required=String(d.requiredClientVersion||VERSION);
  if(cmp(VERSION,required)<0){showGate('Update Required','This build is too old to safely continue. Load the newest build first.','Client: v'+VERSION+' • Required: v'+required,true);return false;}
  hideGate();return true;
 }catch(_){showGate('Update Check Unavailable','The server could not be reached. The check still ran, so local/offline play is not blocked.','Offline fallback active.');setTimeout(hideGate,1800);return true;}
}

/* authoritative in-run rarity balance */
const RARITIES={Common:{mult:1,weight:48,label:'COMMON'},Uncommon:{mult:1.25,weight:26,label:'UNCOMMON'},Rare:{mult:1.55,weight:14,label:'RARE'},Epic:{mult:1.9,weight:7,label:'EPIC'},Legendary:{mult:2.35,weight:3.5,label:'LEGENDARY'},Mythic:{mult:3,weight:1,label:'MYTHIC'}};
window.OUTLAST_INRUN_RARITIES=RARITIES;
try{Object.keys(RARITIES).forEach(k=>{if(typeof upgradeRarities==='object'&&upgradeRarities[k])Object.assign(upgradeRarities[k],RARITIES[k])})}catch(_){}
function balancedRarity(){
 const luck=Math.max(0,Number(game?.player?.upgradeLuck||0)),b=Math.min(.9,luck/120);
 const w={Common:48*(1-b*.5),Uncommon:26*(1-b*.18),Rare:14*(1+b*.45),Epic:7*(1+b*.85),Legendary:3.5*(1+b*1.75),Mythic:1*(1+b*3)};
 let n=Math.random()*Object.values(w).reduce((a,x)=>a+x,0);for(const k of Object.keys(w)){n-=w[k];if(n<=0)return k}return'Common';
}
window.rollUpgradeRarity=balancedRarity;
function specialDesc(n,m,raw){
 const x=(name,val)=>String(name).replace('{x}',val);
 if(/^(Berserker|Bloodrush)$/.test(n))return x('{x}% damage below 50% HP',Math.round(50*m))+' • Rarity x'+m.toFixed(2);
 if(n==='Lucky Hunter')return x('{x}% chance for double XP',Math.round(25+10*(m-1)))+' • Rarity x'+m.toFixed(2);
 if(n==='Adrenaline')return x('{x}% speed below 50% HP',Math.round(20*m))+' • Rarity x'+m.toFixed(2);
 if(n==='Poison Rounds')return Math.round(11*m)+'% damage/sec poison for '+Math.max(1,Math.round(3*m))+'s • Rarity x'+m.toFixed(2);
 if(n==='Stun Rounds')return Math.round(Math.min(.9,.12+.1*(m-1))*100)+'% stun chance • '+(1.5+.35*(m-1)).toFixed(1)+'s • Rarity x'+m.toFixed(2);
 if(/^(Double Tap|Lucky Barrage)$/.test(n))return Math.round(20*m)+'% extra-shot chance • Rarity x'+m.toFixed(2);
 if(n==='Treasure Radar')return(3*m).toFixed(1)+'x power-up drop chance • Rarity x'+m.toFixed(2);
 if(n==='Shockwave')return'Every '+Math.max(3,Math.round(12/m))+'th kill can blast nearby enemies • Rarity x'+m.toFixed(2);
 return String(raw||'')+' • Rarity x'+m.toFixed(2);
}
function enhance(n,m){
 const p=game?.player;if(!p)return;
 if(n==='Berserker'||n==='Bloodrush'){p.berserk=true;p.berserkBonus=Math.max(Number(p.berserkBonus)||0,.5*m)}
 else if(n==='Lucky Hunter'){p.lucky=true;p.luckyChance=Math.min(.9,.25+.1*(m-1))}
 else if(n==='Adrenaline'){p.adrenaline=true;p.adrenalineBonus=.2*m}
 else if(n==='Poison Rounds'){p.poison=true;p.poisonDuration=3*m;p.poisonDps=.11*m}
 else if(n==='Stun Rounds'){p.stun=true;p.stunChance=Math.min(.9,.12+.1*(m-1));p.stunDuration=1.5+.35*(m-1)}
 else if(n==='Double Tap'||n==='Lucky Barrage'){p.doubleTap=true;p.doubleTapChance=Math.min(.9,.2*m)}
 else if(n==='Treasure Radar'){p.treasure=true;p.treasureMult=3*m}
 else if(n==='Shockwave'){p.shockwave=true;p.shockwaveInterval=Math.max(3,Math.round(12/m))}
}
try{
 if(typeof makeChoices==='function'&&!window.__v3360MakeChoicesPatched){
  makeChoices=function(){const pool=[...tempUp],out=[];while(out.length<3&&pool.length){const i=Math.floor(Math.random()*pool.length),e=pool.splice(i,1)[0];if(!e)continue;const n=e[0],rarity=game?.level===3&&out.length===0?'Legendary':balancedRarity(),m=(RARITIES[rarity]||RARITIES.Common).mult,raw=typeof e[1]==='function'?e[1](m):String(e[1]||''),desc=specialDesc(n,m,raw);out.push([n,desc,()=>{try{e[2](m)}finally{enhance(n,m)}},rarity])}return out};
  window.__v3360MakeChoicesPatched=true;
 }
}catch(_){}

/* boss must be killed before next boss */
try{
 if(!window.__v3360BossSequence){
  window.__v3360BossSequence=true;
  const liveBoss=()=>Array.isArray(game?.enemies)&&game.enemies.some(e=>e&&e.boss&&!e.__dead&&Number(e.hp)>0);
  window.outlastHasLiveBoss=liveBoss;
  if(typeof spawnBoss==='function'){const old=spawnBoss;spawnBoss=function(){if(liveBoss()){toast?.('♛ DEFEAT THE ACTIVE BOSS FIRST');return false}const r=old.apply(this,arguments);if(r!==false&&game){game.bossActive=true;game.bossClock=0}return r}}
  if(typeof killEnemy==='function'){const old=killEnemy;killEnemy=function(t){const e=typeof t==='number'?game?.enemies?.[t]:t,wasBoss=!!e?.boss,r=old.apply(this,arguments);if(wasBoss&&!liveBoss()&&game){game.bossActive=false;game.bossClock=0}return r}}
  if(typeof startGame==='function'){const old=startGame;startGame=function(){const r=old.apply(this,arguments);if(game){game.bossActive=false;game.bossClock=0}return r}}
 }
}catch(_){}

/* owner access: recognized owner names only; passwordless */
try{
 function syncOwner(){const ok=owner(),c=document.getElementById('ownerPanelCard'),b=document.getElementById('ownerBtn');if(c)c.style.display=ok?'':'none';if(b)b.style.display=ok?'':'none'}
 syncOwner();setInterval(syncOwner,1000);
 const s=window.updateMenuSummary;if(typeof s==='function'&&!window.__v3360OwnerSummary){window.updateMenuSummary=function(){const r=s.apply(this,arguments);syncOwner();return r};window.__v3360OwnerSummary=true}
}catch(_){}

/* skins: fixes Divine+ rarity crash and applies skin immediately */
function repairSkin(){save.skins=save.skins&&typeof save.skins==='object'?save.skins:{Classic:true};save.skins.Classic=true;if(!skins?.[save.selectedSkin]||!save.skins[save.selectedSkin])save.selectedSkin='Classic'}
function equipSkin(n){repairSkin();if(!skins?.[n])return toast('Skin not found');if(!save.skins[n])return toast('Open a Skin Case to unlock it');save.selectedSkin=n;const sk=skins[n]||skins.Classic;if(game?.player){game.player.skinColor=sk.color||'#5e9fff';game.player.characterVisual={...(game.player.characterVisual||{}),body:sk.color||'#5e9fff'}}persist();updateMenuSummary?.();toast('✦ Equipped '+n);fixedSkinMenu()}
function fixedSkinMenu(){
 repairSkin();const own=Object.keys(skins||{}).filter(n=>!!save.skins[n]),locked=Object.keys(skins||{}).filter(n=>!save.skins[n]);
 const card=n=>{const v=skins[n]||{},sel=save.selectedSkin===n;return'<button type="button" class="option '+(sel?'selected':'')+'" data-action="skin" data-value="'+esc(n)+'" '+(!save.skins[n]?'disabled':'')+'><b>'+esc(n)+'</b><div class="small">'+esc(v.rarity||'Common')+' • '+esc(v.bonus||'Cosmetic')+'</div><div class="small">'+(sel?'✓ EQUIPPED':'OWNED • CLICK TO EQUIP')+'</div></button>'};
 openSub('✦ Skins & Cases','<div class="option"><b>Equipped: '+esc(save.selectedSkin)+'</b><div class="small">Skin bonuses apply to the run and to the live survivor immediately.</div><button class="gold" data-action="case">OPEN CASE — 250 ● / 1 Voucher</button></div><h3>Owned</h3><div class="grid">'+own.map(card).join()+'</div><h3>Locked</h3><div class="grid">'+locked.slice(0,20).map(card).join()+'</div>');
}
try{window.selectSkin=equipSkin;window.openSkinMenu=fixedSkinMenu;document.getElementById('skinBtn')?.addEventListener('click',fixedSkinMenu,true)}catch(_){}

/* 12 Core Systems become real Progress buttons */
const CORE=[
 ['combat','⚔ Combat','120 generated combat entries'],['enemies','☠ Enemies','150 generated enemy entries'],['bosses','♛ Bosses','60 generated boss entries'],['world','🌎 World','40 generated map entries'],['events','⚡ Events','50 generated event entries'],['progression','★ Progression','120 progression entries'],['cosmetics','🎨 Cosmetics','120 generated cosmetic entries'],['objectives','🎯 Objectives','120 objective entries'],['economy','🛒 Economy','80 reward entries'],['modes','🎲 Game Modes','10 core modes'],['support','⚙ Support','Save, chat, settings, tutorial, How To'],['generation','✦ Content Generation','Procedural generation audit']];
function openCore(k){
 const d=window.OUTLAST_CORE_CONTENT?.data||{};
 if(k==='progression')return renderProgression();
 if(k==='cosmetics')return fixedSkinMenu();
 if(k==='objectives')return renderQuestBoard();
 if(k==='economy')return dailyShopOpen();
 if(k==='modes')return modifierOpen();
 const list=k==='economy'?(d.economy?.rewards||[]):(Array.isArray(d[k])?d[k]:[]);
 const title=CORE.find(x=>x[0]===k)?.[1]||k,s=list.slice(0,18).map(x=>'<div class="option"><b>'+esc(x.name||x.id||'Entry')+'</b><div class="small">'+esc([x.theme,x.role,x.modifier,x.biome,x.behavior,x.projectile,x.attack].filter(Boolean).join(' • '))+'</div></div>').join('');
 openSub(title,'<div class="option"><b>'+Number(list.length||0).toLocaleString()+' entries connected</b><div class="small">This core is now exposed as a real player-facing system.</div></div><div class="grid">'+(s||'<div class="small">No generated entries loaded.</div>')+'</div>');
}
function installCore(){
 const page=document.querySelector('.menu-page[data-page-content="progress"]'),cards=page?.querySelector('.menu-cards');if(!cards||cards.querySelector('[data-v3360-core]'))return;
 document.getElementById('extrasBtn')?.closest('.menu-card')?.setAttribute('hidden','hidden');
 CORE.forEach(x=>{const d=document.createElement('div');d.className='menu-card';d.dataset.v3360Core='1';d.innerHTML='<h3>'+x[1]+'</h3><button type="button" class="menu-btn" id="v3360-'+x[0]+'">OPEN</button><div class="small">'+x[2]+'</div>';cards.appendChild(d);d.querySelector('button').onclick=()=>openCore(x[0])});
}
setTimeout(installCore,0);setTimeout(installCore,600);

/* achievements */
const EXTRA=[
 ['Combo Rookie','Best combo 10+',s=>Number(save.records?.bestCombo||0)>=10],['Combo Master','Best combo 25+',s=>Number(save.records?.bestCombo||0)>=25],
 ['Chest Seeker','Open 10+ chests',s=>Number(save.records?.totalChests||0)>=10],['Master Crafter','Craft 10+ items',s=>Number(save.records?.totalCrafted||0)>=10],
 ['Skin Collector','Own 5+ skins',s=>Object.values(save.skins||{}).filter(Boolean).length>=5],['Arsenal Builder','Unlock 10+ weapons',s=>Object.values(save.unlockedWeapons||{}).filter(Boolean).length>=10],
 ['Relic Keeper','Own 5+ relics',s=>Object.values(save.relics||{}).filter(Boolean).length>=5],['Charm Collector','Own 5+ charms',s=>Object.values(save.charms||{}).filter(Boolean).length>=5],
 ['Pet Tamer','Own 5+ pets',s=>Object.values(save.pets||{}).filter(Boolean).length>=5],['Codex Scholar','Discover 10+ enemies',s=>Object.keys(save.codex||{}).length>=10],
 ['Evolutionist','Unlock 3+ weapon evolutions',s=>Object.keys(save.weaponEvolutions||{}).length>=3],['Prestige I','Reach Prestige 1',s=>Number(save.prestige||0)>=1],
 ['Battle Pass Grinder','Earn 1,000 Battle Pass XP',s=>Number(save.battlePassXP||0)>=1000],['Upgrade Architect','Buy 100 permanent upgrade levels',s=>Object.values(save.upgrades||{}).reduce((a,b)=>a+Number(b||0),0)>=100],
 ['Deep Run','Survive 45 minutes',s=>Number(s.bestTime||0)>=2700],['Boss Veteran','Defeat 100 bosses',s=>Number(s.bosses||0)>=100],
 ['Full Loadout','Equip pet + relic + charm + non-Classic skin',s=>save.selectedPet!=='None'&&save.selectedRelic!=='None'&&save.selectedCharm!=='None'&&save.selectedSkin!=='Classic'],
 ['Collector Vault','Own 25+ cosmetic/gear entries',s=>Object.values(save.skins||{}).filter(Boolean).length+Object.values(save.pets||{}).filter(Boolean).length+Object.values(save.relics||{}).filter(Boolean).length+Object.values(save.charms||{}).filter(Boolean).length>=25]
];
try{EXTRA.forEach(a=>{if(!achievements.some(x=>x[0]===a[0]))achievements.push(a)})}catch(_){}
function enhancedAchievements(){const got=achievements.filter(a=>save.ach[a[0]]).length;openSub('★ Achievements+','<div class="option"><b>'+got+'/'+achievements.length+' unlocked</b><div class="small">Expanded collection, build, combo, boss and progression milestones.</div></div><div class="grid">'+achievements.map(a=>'<div class="option '+(save.ach[a[0]]?'selected':'')+'"><b>'+(save.ach[a[0]]?'✓':'□')+' '+esc(a[0])+'</b><div class="small">'+esc(a[1])+'</div></div>').join('')+'</div>')}
function enhancedStats(){const s=save.stats||{},p=game?.player||{},perm=Object.values(save.upgrades||{}).reduce((a,b)=>a+Number(b||0),0);openSub('▤ Stats+','<div class="stat-grid-v3360"><div class="option"><b>Combat</b><div class="small">Kills: '+Number(s.kills||0).toLocaleString()+'</div><div class="small">Bosses: '+Number(s.bosses||0).toLocaleString()+'</div><div class="small">Best combo: '+Number(save.records?.bestCombo||0)+'</div></div><div class="option"><b>Runs</b><div class="small">Games: '+Number(s.games||0)+'</div><div class="small">Best level: '+Number(s.bestLevel||1)+'</div><div class="small">Best time: '+Math.floor(Number(s.bestTime||0))+'s</div><div class="small">High score: '+Number(s.highScore||0).toLocaleString()+'</div></div><div class="option"><b>Economy</b><div class="small">Coins earned: '+Number(s.totalCoins||0).toLocaleString()+'</div><div class="small">Current coins: '+Number(save.coins||0).toLocaleString()+'</div><div class="small">Forge cores: '+Number(save.forgeCores||0)+'</div><div class="small">Materials: '+Number(save.materials||0)+'</div></div><div class="option"><b>Build</b><div class="small">Permanent levels: '+perm+'</div><div class="small">Upgrade Luck: '+Math.floor(p.upgradeLuck||0)+'</div><div class="small">XP boost: '+Number(p.xpBonus||1).toFixed(2)+'x</div><div class="small">Damage: '+Math.floor(p.damage||0)+'</div></div></div>')}
try{document.getElementById('achBtn').onclick=enhancedAchievements;document.getElementById('statsBtn').onclick=enhancedStats}catch(_){}

/* Daily shop expansion */
const EXTRA_SHOP=[
 {id:'corePack5',name:'Forge Core Stack',price:1000,tag:'FORGE',desc:'+5 Forge Cores'}, {id:'keyPack5',name:'World Key Stack',price:1800,tag:'WORLD',desc:'+5 World Keys'},
 {id:'materialsXL',name:'Industrial Material Box',price:1400,tag:'CRAFT',desc:'+50 crafting materials'}, {id:'dust10',name:'Mythic Dust Chest',price:1900,tag:'RARE',desc:'+10 Mythic Dust'},
 {id:'case2',name:'Twin Skin Vouchers',price:1050,tag:'COSMETIC',desc:'+2 Skin Case Vouchers'}, {id:'luck50',name:'Fortune Cache',price:1600,tag:'LUCK',desc:'+50 Luck for your next run'},
 {id:'upgrade2',name:'Double Upgrade Voucher',price:3200,tag:'UPGRADE',desc:'+2 random permanent upgrade levels'}, {id:'supply',name:'Full Supply Crate',price:2500,tag:'SUPPLY',desc:'+3 Forge Cores, +3 Keys, +25 Materials'}
];
try{
 EXTRA_SHOP.forEach(x=>{if(!DAILY_SHOP_POOL.some(y=>y.id===x.id))DAILY_SHOP_POOL.push(x)});
 ensureDailyShopStock=function(){const day=todayKey();if(save.shopStockDay===day&&save.shopStockRotation==='3.36.0'&&Array.isArray(save.shopStockIds)&&save.shopStockIds.length===8)return;let seed=dailyShopSeedFor(day),pool=DAILY_SHOP_POOL.slice(),ids=[];while(ids.length<8&&pool.length){seed=seededShopNumber(seed);ids.push(pool.splice(seed%pool.length,1)[0].id)}save.shopStockDay=day;save.shopStockRotation='3.36.0';save.shopStockIds=ids;if(save.shopDay!==day){save.shopDay=day;save.shopPurchases={}}persist()};
 dailyShopOpen=function(){ensureDailyShopStock();const p=save.shopPurchases||{},cards=getDailyShopItems().map((x,i)=>'<button class="option daily-shop-card '+(p[x.id]?'daily-shop-bought':'')+'" data-action="shop" data-value="'+esc(x.id)+'" '+(p[x.id]?'disabled':'')+'><b>'+esc(x.name)+'</b><div class="small">'+esc(x.tag)+' • '+esc(x.desc)+'</div><div class="daily-shop-price">'+(p[x.id]?'✓ CLAIMED':'🪙 '+Number(x.price).toLocaleString())+'</div></button>').join('');openSub('🛒 DAILY SHOP+','<div class="option"><b>8 daily offers</b><div class="small">Rotation v3.36.0 • each offer once per day.</div></div><div class="daily-shop-grid">'+cards+'</div>')};
 const oldBuy=window.buyShop||buyShop;
 window.buyShop=function(k){const x=DAILY_SHOP_POOL.find(v=>v.id===k);if(!x)return oldBuy(k);ensureDailyShopStock();save.shopPurchases=save.shopPurchases||{};if(save.shopPurchases[k])return toast('Already purchased today');if(Number(save.coins||0)<x.price)return toast('Not enough coins');save.coins-=x.price;
  if(k==='corePack5')save.forgeCores=(save.forgeCores||0)+5;else if(k==='keyPack5')save.worldKeys=(save.worldKeys||0)+5;else if(k==='materialsXL')save.materials=(save.materials||0)+50;else if(k==='dust10')save.mythicDust=(save.mythicDust||0)+10;else if(k==='case2')save.caseCredits=(save.caseCredits||0)+2;else if(k==='luck50')save.nextRunLuck=(save.nextRunLuck||0)+50;else if(k==='upgrade2'){const q=typeof permanent!=='undefined'?permanent.filter(v=>(save.upgrades[v[0]]||0)<5):[];for(let i=0;i<2&&q.length;i++){const n=q[Math.floor(Math.random()*q.length)][0];save.upgrades[n]=(save.upgrades[n]||0)+1}}else if(k==='supply'){save.forgeCores=(save.forgeCores||0)+3;save.worldKeys=(save.worldKeys||0)+3;save.materials=(save.materials||0)+25}
  save.shopPurchases[k]=true;save.shopDay=todayKey();persist();toast('🛒 '+x.name+' purchased!');dailyShopOpen()
 };
}catch(_){}

/* clean inventory overview */
function inventoryPlus(){repairSkin();const cnt=(o)=>Object.values(o||{}).filter(Boolean).length;openSub('🎒 Inventory+','<div class="inventory-summary-v3360"><div class="option"><b>Equipped</b><div class="small">Character: '+esc(save.selectedChar)+'</div><div class="small">Weapon: '+esc(save.selectedWeapon)+'</div><div class="small">Skin: '+esc(save.selectedSkin)+'</div><div class="small">Pet: '+esc(save.selectedPet)+'</div><div class="small">Relic: '+esc(save.selectedRelic)+'</div><div class="small">Charm: '+esc(save.selectedCharm)+'</div></div><div class="option"><b>Collection Counts</b><div class="small">Characters: '+cnt(save.unlockedChars)+'</div><div class="small">Weapons: '+cnt(save.unlockedWeapons)+'</div><div class="small">Skins: '+cnt(save.skins)+'</div><div class="small">Pets: '+cnt(save.pets)+'</div><div class="small">Relics: '+cnt(save.relics)+'</div><div class="small">Charms: '+cnt(save.charms)+'</div></div></div><div class="grid"><button class="option" id="v3360InvSkin">🎨 Skins</button><button class="option" id="v3360InvWeapon">⚔ Weapons</button><button class="option" id="v3360InvPet">🐾 Pets</button><button class="option" id="v3360InvRelic">🧿 Relics</button><button class="option" id="v3360InvCharm">🪬 Charms</button><button class="option" id="v3360InvShop">🛒 Daily Shop</button></div>');document.getElementById('v3360InvSkin').onclick=fixedSkinMenu;document.getElementById('v3360InvWeapon').onclick=()=>renderInventoryTab('weapon');document.getElementById('v3360InvPet').onclick=()=>renderInventoryTab('pet');document.getElementById('v3360InvRelic').onclick=()=>renderInventoryTab('relic');document.getElementById('v3360InvCharm').onclick=()=>renderInventoryTab('charm');document.getElementById('v3360InvShop').onclick=dailyShopOpen}
try{renderInventory=inventoryPlus;document.getElementById('inventoryBtn').onclick=inventoryPlus}catch(_){}

/* modifier layout */
function modifierPlus(){const chosen=new Set(save.builderMods||[]),rows=Object.entries(runModifiers||{}).map(([n,v])=>'<div class="option '+(save.selectedModifier===n?'selected':'')+'"><b>'+esc(n)+'</b><div class="small">'+esc(v.desc||'')+'</div><div class="small">Reward +'+Math.max(0,(Number(v.reward||1)-1)*100).toFixed(0)+'% • Enemy pressure +'+Math.max(0,(Number(v.enemy||1)-1)*100).toFixed(0)+'%</div><button data-action="modifier" data-value="'+esc(n)+'">'+(save.selectedModifier===n?'EQUIPPED':'SELECT')+'</button><button data-action="builder" data-value="'+esc(n)+'">'+(chosen.has(n)?'✓ BUILDER SLOT':'＋ BUILDER SLOT')+'</button></div>').join('');openSub('🎲 RUN MODIFIERS+','<div class="option"><b>Primary: '+esc(save.selectedModifier||'None')+'</b><div class="small">Builder slots '+chosen.size+'/2</div></div><div class="grid">'+rows+'</div>')}
try{modifierOpen=modifierPlus;document.getElementById('modifierBtn').onclick=modifierPlus}catch(_){}

/* UI + metadata */
const css=document.createElement('style');css.id='outlast-v3360-ui';css.textContent='.stat-grid-v3360,.inventory-summary-v3360{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.menu-page[data-page-content="progress"] .menu-cards{grid-template-columns:repeat(4,minmax(0,1fr))!important;overflow:auto!important;max-height:calc(100vh - 210px)!important}@media(max-width:900px){.stat-grid-v3360,.inventory-summary-v3360{grid-template-columns:1fr 1fr}.menu-page[data-page-content="progress"] .menu-cards{grid-template-columns:repeat(2,minmax(0,1fr))!important}}@media(max-width:560px){.stat-grid-v3360,.inventory-summary-v3360{grid-template-columns:1fr}.menu-page[data-page-content="progress"] .menu-cards{grid-template-columns:1fr!important}}#ownerPanelCard{display:none}';document.head.appendChild(css);
try{document.querySelector('meta[name="outlast-build"]').content=VERSION;document.querySelector('meta[name="build-version"]').content=VERSION}catch(_){}
window.OUTLAST_BUILD=VERSION;window.OUTLAST_VERSION='v'+VERSION;document.title='OUTLAST v'+VERSION;
function start(){repairSkin();syncOwner();installCore();checkMandatoryUpdate()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
setInterval(checkMandatoryUpdate,300000);window.addEventListener('focus',()=>checkMandatoryUpdate());
window.OUTLAST_V3360={version:VERSION,checkMandatoryUpdate,rarities:RARITIES,ownerNames:[...OWNER_NAMES]};
})();