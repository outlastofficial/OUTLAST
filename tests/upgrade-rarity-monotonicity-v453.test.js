const fs=require('fs'),assert=require('assert'),path=require('path'),vm=require('vm');
const root=path.join(__dirname,'..'),read=name=>fs.readFileSync(path.join(root,name),'utf8');
const html=read('index.html'),system=read('outlast-v3370-game-systems.js'),library=read('outlast-v33015-upgrade-library.js'),balance=read('outlast-v441-skill-upgrade-balance-ui.js'),authority=read('outlast-v327108-rarity-card-authority.js');
const tiers=['Common','Uncommon','Rare','Epic','Legendary','Mythic','Divine','Celestial','Transcendent','Eternal','Omega'];
const expected={Common:1,Uncommon:1.15,Rare:1.35,Epic:1.6,Legendary:1.9,Mythic:2.25,Divine:4,Celestial:5,Transcendent:6,Eternal:7,Omega:8};
function readScale(src,re,label){const match=src.match(re);assert(match,label+' scale declaration exists');const value=Object.fromEntries(match[1].split(',').map(part=>{const kv=part.trim().split(':');return [kv[0],Number(kv[1])]}));assert.deepStrictEqual(value,expected,label+' must match the canonical scale');return value}
readScale(system,/const SCALE=Object\.freeze\(\{([^}]+)\}\)/,'gameplay');readScale(library,/const TIER_SCALE=Object\.freeze\(\{([^}]+)\}\)/,'upgrade library');readScale(balance,/const MULT=\{([^}]+)\}/,'upgrade UI');
assert(authority.includes('const authoritative=!!(u[4]&&u[4].rarity===real&&Number.isFinite(Number(u[4].multiplier)))'),'authoritative choice metadata must be recognized');assert(authority.includes("if(!authoritative&&item&&typeof upgradeRarities!=='undefined'"),'sanitizer must not overwrite authoritative descriptions');
assert(html.includes('<meta name="outlast-build" content="4.5.26">'),'visible version must be v4.5.26');assert(html.includes('outlast-v3370-game-systems.js?v=4.5.26')&&html.includes('outlast-v441-skill-upgrade-balance-ui.js?v=4.5.26')&&html.includes('outlast-v327108-rarity-card-authority.js?v=4.5.26'),'patched scripts must have cache-busting refs');assert(html.includes('How is upgrade rarity scaling kept consistent?')&&html.includes('OUTLAST_RARITY_MONOTONICITY_AUDIT_V453'),'How To and live audit must exist');assert(balance.includes('Celestial 5×, Transcendent 6×, Eternal 7×'),'How To scale must match the live scale');
const makePlayer=()=>({damage:0,fireRate:.45,max:100,hp:100,speed:300,speedCap:500,magnet:0,regen:0,pierce:0,multiShot:0,range:0,projectileSpeed:1,crit:0,coinMult:1,xpBonus:1,armorPierce:0,bossMult:1,ultDamage:1,healMult:1,upgradeLuck:0,lootLuck:0,treasureLuck:0,shield:0,chain:1,vampire:0,bulletSize:1,slowPower:1,armor:1,critMult:1.8,effects:[]});
const pools=Object.fromEntries(tiers.map(t=>[t,[]])),doc={readyState:'complete',title:'OUTLAST v4.5.3',querySelectorAll:()=>[],querySelector:()=>null,addEventListener:()=>{},getElementById:()=>null,head:{appendChild:()=>{}},body:{classList:{toggle:()=>{}},appendChild:()=>{}},documentElement:{classList:{toggle:()=>{}},dataset:{}}};
const s={window:{OUTLAST_UPGRADE_RARITY_POOLS:pools,OUTLAST_UPGRADE_RARITY_BY_NAME:{},upgradeRarities:{},addEventListener:()=>{}},document:doc,tempUp:[],game:{player:makePlayer(),effects:[],running:false,upgrades:{}},save:{records:{},skillTree:{},upgrades:{}},updates:[],helpArticles:[],upgradeRarities:{},setTimeout:()=>{},setInterval:()=>{},console};s.window.window=s.window;s.outlastGrantTempShield=seconds=>{s.game.player.shield=Math.max(Number(s.game.player.shield)||0,seconds)};
const libCut=library.indexOf('function install()');assert(libCut>0,'library installer exists');vm.runInNewContext(library.slice(0,libCut)+'window.__lib={LIBRARY,TIER_SCALE,tierInteger};})();',s,{timeout:1500});const lib=s.window.__lib;assert(lib&&lib.LIBRARY.length===220,'all 220 rarity-family cards must load');for(const card of lib.LIBRARY){assert.strictEqual(card.mult,expected[card.rarity],card.name+' must use the canonical rarity multiplier');}s.tempUp=lib.LIBRARY.map(d=>[d.name,d.desc,d.apply]);for(const d of lib.LIBRARY){pools[d.rarity].push(d.name);s.window.OUTLAST_UPGRADE_RARITY_BY_NAME[d.name]=d.rarity}
const sysCut=system.indexOf('function zombieAISeed37');assert(sysCut>0,'gameplay scaler exists');vm.runInNewContext(system.slice(0,sysCut)+'window.__sys={upgradeBase37,authoritativeUpgradeChoice37,SCALE,TIER_ORDER,scaledInteger37};})();',s,{timeout:1500});const game=s.window.__sys;assert(game&&typeof game.upgradeBase37==='function','scaler loads');
const families=[['Might 01',p=>p.damage],['Haste 02',p=>1/p.fireRate],['Vital Core 03',p=>p.max-100],['Fleet 04',p=>p.speed-300],['Magnet 05',p=>p.magnet],['Renewal 06',p=>p.regen],['Breach 07',p=>p.pierce],['Volley 08',p=>p.multiShot],['Velocity 09',p=>p.projectileSpeed-1],['Deadeye 10',p=>p.crit],['Fortune 11',p=>p.coinMult-1],['Scholar 12',p=>p.xpBonus-1],['Piercer 13',p=>p.armorPierce],['Bossbane 14',p=>p.bossMult-1],['Arcane 15',p=>p.ultDamage-1],['Medic 16',p=>p.healMult-1],['Luck 17',p=>p.upgradeLuck],['Cache 18',p=>p.lootLuck],['Treasure 19',p=>p.treasureLuck],['Aegis 20',p=>p.shield]];
for(const [family,metric] of families){let previous=-Infinity;for(const tier of tiers){const name=tier+' '+family,card=lib.LIBRARY.find(x=>x.name===name);assert(card,name+' exists');s.game.player=makePlayer();const fx=game.upgradeBase37(card.name,card.desc,card.apply,tier);fx.apply();const value=Number(metric(s.game.player));assert(Number.isFinite(value)&&value>=previous,name+' must never get weaker at a higher rarity');if(!['Breach 07','Volley 08'].includes(family))assert(value>previous,name+' continuous effect must strictly scale upward');if(family==='Breach 07')assert(value<=8,name+' pierce bonus must be capped at 8');if(family==='Volley 08')assert(value<=5,name+' extra projectiles must be capped at 5');assert(String(fx.desc)===String(card.desc(expected[tier])),name+' description matches applied multiplier');previous=value}}
s.game.player=makePlayer();let legacy=game.upgradeBase37('Multi-Shot','',()=>{},'Omega');legacy.apply();assert.strictEqual(s.game.player.multiShot,5,'Omega multi-shot must cap at five extra projectiles');
s.game.player=makePlayer();legacy=game.upgradeBase37('Piercing','',()=>{},'Omega');legacy.apply();assert.strictEqual(s.game.player.pierce,8,'Omega pierce must cap at eight');
s.game.player=makePlayer();legacy=game.upgradeBase37('Treasure Radar','',()=>{},'Omega');legacy.apply();assert.strictEqual(s.game.player.treasureDropMultiplier,3,'Omega treasure drop multiplier must cap at 3x');assert(legacy.desc.includes('+200%'),'Treasure Radar description matches its applied effect');
s.game.player=makePlayer();legacy=game.upgradeBase37('XP Boost','',()=>{},'Omega');legacy.apply();assert(Math.abs(s.game.player.xpBonus-1.32)<1e-9,'Omega XP boost must apply 32%, not 64%');
s.window.rollUpgradeRarity=()=> 'Celestial';const choices=game.authoritativeUpgradeChoice37();assert.strictEqual(choices.length,3,'picker returns three choices');assert(choices.every(x=>x[3]==='Celestial'&&x[4]&&x[4].rarity==='Celestial'&&x[4].multiplier===5),'rarity metadata and multiplier agree');
const signatureProfiles=[
 ['Big Bullets','Uncommon',p=>p.bulletSize>1&&p.bulletSize<1.2,d=>/projectile size/i.test(d)],
 ['Projectile Speed','Uncommon',p=>p.projectileSpeed>1&&p.projectileSpeed<1.2,d=>/projectile speed/i.test(d)],
 ['Elite Hunter','Epic',p=>p.executioner>0&&p.crit>0&&p.speed>300,d=>/elite damage/i.test(d)],
 ['Void Arsenal','Epic',p=>p.multiShot>0&&p.pierce>0&&p.damage>0&&p.projectileSpeed>1,d=>/projectiles/i.test(d)],
 ['Abyssal Core','Mythic',p=>p.damage>0&&p.fireRate<.45&&p.pierce>0&&p.bossMult>1,d=>/damage/i.test(d)],
 ['Divine Aegis','Divine',p=>p.max>100&&p.shield>0&&p.damageTakenMult<1,d=>/damage reduction/i.test(d)],
 ['Celestial Barrage','Celestial',p=>p.multiShot>0&&p.pierce>0&&p.damage>0&&p.projectileSpeed>1&&p.crit>0,d=>/projectiles/i.test(d)],
 ['Transcendent Fury','Transcendent',p=>p.damage>0&&p.fireRate<.45&&p.crit>0&&p.pierce>0&&p.bossDamageBonus>0&&p.ultDamage>1,d=>/ultimate damage/i.test(d)],
 ['Eternal Rebirth','Eternal',p=>p.max>100&&p.regen>0&&p.damage>0&&p.damageTakenMult<1&&p.phoenixRevives>0,d=>/revive/i.test(d)],
 ['Omega Ascension','Omega',p=>p.damage>0&&p.fireRate<.45&&p.crit>0&&p.multiShot>0&&p.pierce>0&&p.ultDamage>1&&p.bossDamageBonus>0&&p.shockwave===true,d=>/shockwave/i.test(d)]
];
for(const [name,tier,metric,descCheck] of signatureProfiles){
 s.game.player=makePlayer();s.game.player.damage=20;s.game.player.executioner=0;s.game.player.bossDamageBonus=0;s.game.player.phoenixRevives=0;s.game.player.shield=0;
 let fallbackCalled=false;
 const fx=game.upgradeBase37(name,'',()=>{fallbackCalled=true;},tier);
 assert(descCheck(String(fx.desc)),name+' has a rarity-matched, accurate description');
 fx.apply();
 assert(!fallbackCalled,name+' must use its explicit balance profile rather than the raw legacy handler');
 assert(metric(s.game.player),name+' applies its described rarity-tier effect');
}
const activeLegacy=read('outlast-v327101-all-upgrade-balance.js');
const legacyNames=[...activeLegacy.matchAll(/^\s*'([^']+)'\s*:\s*\[/gm)].map(m=>m[1]);
for(const name of legacyNames)assert(system.includes("name==='"+name+"'"),name+' must have an explicit rarity-scaled profile');
assert(html.includes('<meta name="outlast-build" content="4.6.0">'),'visible release version must be v4.6.0');
assert(html.includes('outlast-v3370-game-systems.js?v=4.6.0')&&html.includes('outlast-v441-skill-upgrade-balance-ui.js?v=4.6.0'),'balanced runtime scripts must use the release cache key');

console.log('OUTLAST v4.6.0 rarity regression passed: 220 family cards, every legacy signature profile, rarity monotonicity, and matching descriptions.');
