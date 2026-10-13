const fs=require('fs'),assert=require('assert'),path=require('path'),vm=require('vm');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8'),system=fs.readFileSync(path.join(root,'outlast-v3370-game-system.js'),'utf8'),library=fs.readFileSync(path.join(root,'outlast-v33015-upgrade-library.js'),'utf8'),expansion=fs.readFileSync(path.join(root,'outlast-v3378-expansion.js'),'utf8'),legacyBalance=fs.readFileSync(path.join(root,'outlast-v327101-all-upgrade-balance.js'),'utf8');
assert(html.includes('<meta name="outlast-build" content="4.3.8">'),'current metadata');
assert(html.includes('outlast-v438-upgrade-boss-balance.js?v=4.3.8'),'final balance patch loads after legacy modules');
assert(html.includes("const BUILD='4.3.8',ACK='outlast_update_ack_v4.3.8'"),'mandatory update');
assert(expansion.includes('v3.37.16 — Thorns, 133 Extra Upgrades, Expanded Maps + Combat Fixes')&&expansion.includes("window.OUTLAST_VERSION='v'+VERSION"),'current release marker and log');
assert(!html.includes('id="coreBtn"')&&!system.includes("['progressCore37','🧩 12 Core Systems','core']"),'remove the one-button core hub');
assert(system.includes("weaponBtn:'combat'")&&system.includes("codexBtn:'enemies'")&&system.includes("worldBossBtn:'bosses'")&&system.includes("mapBtn:'world'")&&system.includes("shopBtn:'economy'")&&system.includes("missionBtn:'objectives'"),'route core content into existing feature areas');
assert(system.includes("const VERSION='3.37.16';")&&library.includes("const V='3.37.16';"),'runtime script versions');
assert(system.includes('Divine:4,Celestial:4.8,Transcendent:5.6,Eternal:6.8,Omega:8'),'preserve approved high rarity multipliers');
assert(html.includes('const bossAlive=outlastBossIsAlive();')&&html.includes('function outlastBossTargetSeconds()')&&html.includes('const bossTarget=outlastBossTargetSeconds();')&&html.includes('game.bossSpawnFailures'),'mode-aware boss scheduler cadence and retries');
assert(html.includes('if(game)game.activeBossId=null;')&&html.includes('game.bossCount=(Number(game.bossCount)||0)+1;'),'clear stale locks and count each spawn');
assert(!html.includes('if(spawnBoss())game.bossCount=(game.bossCount||0)+1'),'no double boss count');
const tiers=['Common','Uncommon','Rare','Epic','Legendary','Mythic','Divine','Celestial','Transcendent','Eternal','Omega'],mult=[1,1.15,1.35,1.6,1.9,2.25,4,4.8,5.6,6.8,8],pools=Object.fromEntries(tiers.map(t=>[t,[]]));
const doc={readyState:'complete',title:'',querySelectorAll:()=>[],querySelector:()=>null,addEventListener:()=>{},getElementById:()=>null,head:{appendChild:()=>{}},body:{classList:{toggle:()=>{}},appendChild:()=>{}},documentElement:{classList:{toggle:()=>{}},dataset:{}}};
const s={window:{OUTLAST_UPGRADE_RARITY_POOLS:pools,OUTLAST_UPGRADE_RARITY_BY_NAME:{}},document:doc,tempUp:[],game:{player:{}},save:{records:{}},run:{kills:0},helpArticles:[],upgradeRarities:{},setTimeout:()=>{},setInterval:()=>{},console,outlastGrantTempShield:v=>{s.shieldSeconds=v;}};s.window.window=s.window;
vm.runInNewContext(library,s,{timeout:1500});assert.strictEqual(s.tempUp.length,220);for(const t of tiers)assert.strictEqual(pools[t].length,20,t);assert.deepStrictEqual(mult.map(v=>s.window.OUTLAST_UPGRADE_TIER_INTEGER(1,v)),[1,2,3,4,5,6,7,8,9,10,11]);
const cut=system.indexOf('\nfunction zombieAISeed37');assert(cut>0);vm.runInNewContext(system.slice(0,cut)+'\n})();',s,{timeout:1500});const upgrade=s.window.OUTLAST_UPGRADE_BASE37;assert.strictEqual(typeof upgrade,'function');
function p(){return {damage:0,fireRate:.45,max:100,hp:100,speed:300,speedCap:500,magnet:0,regen:0,pierce:0,multiShot:0,range:0,projectileSpeed:1,crit:0,coinMult:1,xpBonus:1,armorPierce:0,bossMult:1,ultDamage:1,healMult:1,upgradeLuck:0,lootLuck:0,treasureLuck:0,shield:0,chain:1,vampire:0,bulletSize:1,slowPower:1,armor:1,critMult:1.8,effects:[]};}
function apply(name,tier){s.game.player=p();s.game.effects=[];s.shieldSeconds=0;const o=upgrade(name,()=>'',()=>{},tier);o.apply();return {desc:String(o.desc),p:s.game.player,shield:Number(s.shieldSeconds)||0};}
const cases=[['Power Shot',x=>x.p.damage],['Rapid Fire',x=>1/x.p.fireRate],['Vitality',x=>x.p.max-100],['Second Heart',x=>x.p.max-100],['Swift Feet',x=>x.p.speed-300],['Magnet',x=>x.p.magnet],['Regeneration',x=>x.p.regen],['Second Wind',x=>x.p.regen],['Piercing',x=>x.p.pierce],['Multi-Shot',x=>x.p.multiShot],['Ammo Surge',x=>x.p.multiShot],['XP Boost',x=>x.p.xpBonus-1],['XP Burst',x=>x.p.xpBonus-1],['Crit Chance',x=>x.p.crit],['Lucky Coins',x=>x.p.coinMult-1],['Adrenaline',x=>x.p.adrenalineSpeedBonus],['Berserker',x=>x.p.berserkDamageBonus],['Poison Rounds',x=>x.p.poisonDpsMultiplier],['Poison Rounds',x=>x.p.poisonDuration],['Stun Rounds',x=>x.p.stunChance],['Stun Rounds',x=>x.p.stunDuration],['Double Tap',x=>x.p.doubleTapChance],['Lucky Hunter',x=>x.p.luckyXpChance],['Treasure Radar',x=>x.p.treasureDropMultiplier],['Shockwave',x=>x.p.shockwaveRadius],['Shockwave',x=>1/x.p.shockwaveEvery],['Upgrade Luck',x=>x.p.upgradeLuck],['Fortune',x=>x.p.lootLuck],['Treasure Luck',x=>x.p.treasureLuck],['Overheat',x=>1/x.p.fireRate],['Rift Pierce',x=>x.p.pierce],['Coin Magnetism',x=>x.p.magnet],['Heavy Impact',x=>x.p.damage],['XP Hunter',x=>x.p.xpBonus-1],['Combat Medic',x=>x.p.regen],['Bloodrush',x=>x.p.berserkDamageBonus],['Fortress',x=>x.p.max-100],['Fortress',x=>1-x.p.armor],['Adrenal Core',x=>x.p.speed-300],['Salvager',x=>x.p.magnet],['XP Reactor',x=>x.p.xpBonus-1],['Quick Reload',x=>1/x.p.fireRate],['Ricochet',x=>x.p.pierce],['Executioner',x=>x.p.executioner],['Bossbreaker',x=>x.p.bossDamageBonus],['Cryo Burst',x=>x.p.frostAuraRadius],['Chain Reaction',x=>x.p.chain-1],['Shock Circuit',x=>x.p.chain-1],['Vampire Core',x=>x.p.vampire],['Lucky Barrage',x=>x.p.doubleTapChance],['Shield Nova',x=>x.shield],['Overclock',x=>x.p.damage],['Last Stand',x=>x.p.lastStandBonus],['Treasure Engine',x=>x.p.treasureDropMultiplier],['Deadly Precision',x=>x.p.crit],['Armor Pierce',x=>x.p.armorPierce],['Frost Aura',x=>x.p.frostAuraRadius],['Cryo Core',x=>x.p.slowPower-1]];
const regenCommon=apply('Regeneration','Common').p.regen;
const windCommon=apply('Second Wind','Common').p.regen;
assert(windCommon>regenCommon,'Second Wind must not be a duplicate of Regeneration');
assert.strictEqual(regenCommon,.5,'Common Regeneration must use its documented 0.5 HP/s baseline');
assert.strictEqual(windCommon,1,'Common Second Wind must use its distinct 1 HP/s baseline');
assert.strictEqual(apply('Shield Core','Legendary').shield,5,'Legendary Shield Core must grant its documented 5-second shield');
assert.strictEqual(apply('Emergency Shield','Divine').shield,7,'Divine Emergency Shield must grant its documented 7-second shield');
assert.strictEqual(apply('Ammo Surge','Divine').p.multiShot,8,'Divine Ammo Surge must provide more projectiles than the Rare Multi-Shot baseline');
assert.strictEqual(apply('Berserker','Common').p.berserkDamageBonus,.2,'Common Berserker must not overpower the low-rarity baseline');
assert(Math.abs(apply('Adrenaline','Legendary').p.adrenalineSpeedBonus-.38)<1e-9,'Legendary Adrenaline must match its 20% rarity-scaled baseline');
assert(Math.abs(apply('Bloodrush','Celestial').p.berserkDamageBonus-.864)<1e-9,'Celestial Bloodrush must use its distinct rarity-scaled effect');
assert(Math.abs(apply('Lucky Hunter','Legendary').p.luckyXpChance-.285)<1e-9,'Legendary Lucky Hunter must improve on the default 25% double-XP chance');
assert(Math.abs(apply('Cryo Core','Divine').p.frostSlow-.82)<1e-9,'Divine Cryo Core must strengthen the frost aura stat that gameplay actually reads');
assert.strictEqual(apply('Cryo Core','Divine').p.slowPower,1,'Cryo Core must not write only to the unrelated slowTimer stat');
assert(system.includes("Relentless:{desc:'Enemy HP +10%; spawn interval -22%. 2.2x rewards.'"),'Relentless must describe real implemented effects, not a nonexistent recovery-window mechanic');
assert(html.includes("armor:(kind==='armored'?0.25:(kind==='juggernaut'?0.35:0))"),'armored enemy classes must have actual armor for Armor Pierce to ignore');
assert(html.includes('if(Number(e.armor)>0){const enemyArmor=')&&html.includes('armorIgnore=Math.max(0,Math.min(1,Number(p.armorPierce)||0))'),'Armor Pierce must reduce enemy armor instead of increasing damage against every target');
assert(system.includes("if(name==='Armor Pierce')return {desc:'+'+np(15)+'% enemy defense ignored',apply:()=>add('armorPierce',.15*mult)};"),'Armor Pierce must match the documented 15% base');
assert(html.includes("e.stunTimer=Math.max(Number(e.stunTimer)||0,Number(p.stunDuration)||1.5)")&&html.includes("if(Number(e.stunTimer)>0){e.stunTimer=Math.max(0,Number(e.stunTimer)-dt);continue}"),'Stun Rounds must immobilize enemies during the stun timer');
const effectBody=system.slice(system.indexOf('function upgradeBase37'),system.indexOf('function authoritativeUpgradeChoice37'));
const branchCounts={};for(const match of effectBody.matchAll(/if\(name===['"]([^'"]+)['"]/g))branchCounts[match[1]]=(branchCounts[match[1]]||0)+1;
assert(Object.entries(branchCounts).every(([,count])=>count===1),'each upgrade name must have one authoritative active effect branch');
assert(!effectBody.includes('doubleTapBonus')&&!effectBody.includes('extraShotLuck'),'Lucky Barrage must not write unused duplicate extra-shot stats');

const commonXP=apply('XP Boost','Common').p.xpBonus-1;
const mythicXP=apply('XP Hunter','Mythic').p.xpBonus-1;
assert(mythicXP>commonXP,'Mythic XP must be stronger than Common XP for the same effect');
const families=[['Might 01',p=>p.damage],['Haste 02',p=>1/p.fireRate],['Vital Core 03',p=>p.max-100],['Fleet 04',p=>p.speed-300],['Magnet 05',p=>p.magnet],['Renewal 06',p=>p.regen],['Breach 07',p=>p.pierce],['Volley 08',p=>p.multiShot],['Velocity 09',p=>p.projectileSpeed-1],['Deadeye 10',p=>p.crit],['Fortune 11',p=>p.coinMult-1],['Scholar 12',p=>p.xpBonus-1],['Piercer 13',p=>p.armorPierce],['Bossbane 14',p=>p.bossMult-1],['Arcane 15',p=>p.ultDamage-1],['Medic 16',p=>p.healMult-1],['Luck 17',p=>p.upgradeLuck],['Cache 18',p=>p.lootLuck],['Treasure 19',p=>p.treasureLuck],['Aegis 20',p=>p.shield]];
for(const [name,metric] of families){const vals=tiers.map((t,i)=>{const card=s.tempUp.find(x=>x&&x[0]===t+' '+name);assert(card,'missing '+t+' '+name);s.game.player=p();const d=String(card[1](mult[i]));const result=card[2](mult[i]);if(typeof result==='function')result();return {value:metric(s.game.player),desc:d};});for(let i=1;i<vals.length;i++)assert(vals[i].value>vals[i-1].value,name+' applied effect ties at '+tiers[i]);}
const legacyContext={window:{},document:{readyState:'complete',addEventListener:()=>{}},setTimeout:()=>{},console,updates:[],helpArticles:[],game:{player:{}},tempUp:[['Abyssal Core',()=>'',()=>{}],['Transcendent Fury',()=>'',()=>{}],['Omega Ascension',()=>'',()=>{}]]};
vm.runInNewContext(legacyBalance,legacyContext,{timeout:1500});
for(const [name,factor] of [['Abyssal Core',1.20],['Transcendent Fury',1.60],['Omega Ascension',1.80]]){
  legacyContext.game.player={damage:1,fireRate:.45,pierce:0,bossMult:1,crit:0,ultDamage:1,multiShot:0,chain:1};
  const card=legacyContext.tempUp.find(x=>x&&x[0]===name);assert(card,'missing legacy high-tier upgrade '+name);card[2]();
  assert(Math.abs(legacyContext.game.player.fireRate-(.45/factor))<1e-9,name+' attack speed must match its displayed percentage');
}
assert(/const faster=b=>\{const q=p\(\);if\(q\)q\.fireRate=Math\.max\(\.045,\(Number\(q\.fireRate\)\|\|\.45\)\/\(1\+b\*mult\/100\)\);\}/.test(system),'percent attack-speed upgrades must convert speed to shot interval correctly');
assert(/p\.fireRate=Math\.max\(\.065,\(p\.fireRate\|\|\.45\)\/1\.60\)/.test(legacyBalance),'Transcendent Fury speed math');
assert(/p\.fireRate=Math\.max\(\.045,\(p\.fireRate\|\|\.45\)\/1\.80\)/.test(legacyBalance),'Omega Ascension speed math');
console.log('OUTLAST v4.1.0 rarity, boss reliability, and core placement checks passed');
