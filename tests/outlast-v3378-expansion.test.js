const fs=require('fs'),assert=require('assert'),path=require('path'),vm=require('vm');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const expansion=fs.readFileSync(path.join(root,'outlast-v3378-expansion.js'),'utf8');
const mapPicker=fs.readFileSync(path.join(root,'outlast-v3377-map-boss-rebuild.js'),'utf8');
const mapCreator=fs.readFileSync(path.join(root,'outlast-v33018-map-creator.js'),'utf8');
const corePopup=fs.readFileSync(path.join(root,'outlast-v33500-core-content-engine.js'),'utf8');
const eventHelpRemoved=!html.includes('How does the October Event work?');
new vm.Script(expansion,{filename:'outlast-v3378-expansion.js'});
assert(mapPicker.includes('outlast3377MapPickerModal'),'map picker uses a dedicated overlay');
assert(mapPicker.includes('data-outlast3377-map-close'),'map picker has a close button');
assert(mapPicker.includes('window.OUTLAST_MAP_PICKER_AUDIT'),'map picker exposes a runtime audit');
assert(mapPicker.includes('window.OUTLAST_OPEN_MAP_PICKER_3377=openMapPicker'),'normal map picker has its own global route');
assert(html.includes('window.OUTLAST_OPEN_MAP_PICKER_3377||window.openMapSelector'),'main menu routes map button to dedicated picker first');
assert(mapPicker.includes('window.addEventListener(\'load\',install,{once:true})'),'map picker restores its route after the load event');
assert(mapCreator.includes('window.OUTLAST_OPEN_MAP_CREATOR_33018=openMapSelector'),'Map Creator exports an explicit launcher');
assert(mapPicker.includes('closeMapPickerModal();openLegacyCreator();'),'Map Creator button opens existing creator after closing picker');
assert(corePopup.includes('function currentBuildIsNewer()'),'legacy popup compares its version to the current build');
assert(corePopup.includes('if(currentBuildIsNewer()){markSeen();return false;}'),'old v3.35 popup is suppressed on newer releases');
assert(!html.includes('outlast-v3.14.23-event-expansion.js'),'obsolete October-event overlay module is not loaded');
assert(!html.includes('event-expansion-compact-ui'),'obsolete bottom event chip styles are removed');
assert(eventHelpRemoved,'How To no longer instructs players to use the removed event terminal');
assert(expansion.includes("const VERSION='3.37.14'"),'expansion runtime version is current');
assert(expansion.includes('v3.37.13 — Remove Forced Event Popup'),'current bug fix is written to the Update Log');
assert(expansion.includes('Why was the old event overlay removed?'),'How To documents the event overlay removal');
assert(expansion.includes('v3.37.14 — Fix Floating Chat Layering'),'release log records the chat fix');
assert(expansion.includes('Why is Chat at the top of the screen?'),'How To documents the chat placement');
assert(html.includes('<meta name="outlast-build" content="3.37.14">'),'current version metadata');
assert(html.includes("const BUILD='3.37.14',ACK='outlast_update_ack_v3.37.14'"),'mandatory update check uses the current build');
assert(html.includes('outlast-v3378-expansion.js?v=3.37.14'),'expansion script is loaded');
assert(!html.includes('v3.14.1 — Menu Organization</b>'),'stray release-note block removed from bottom of the page');
assert(html.includes('#outlastEverywhereChat .gec-toggle{position:fixed;right:18px;top:118px;bottom:auto;border-radius:999px;font-weight:800;pointer-events:auto!important;z-index:2147483001!important}'),'chat launcher is touchable and moved above overlays');
assert(html.includes('document.body.appendChild(root)'),'chat escapes menu stacking contexts');
assert(html.includes('W=4000,H=3000'),'arena world dimensions expanded');
assert(html.includes('x:Math.min(W/2,1600),y:Math.min(H/2,1200)'),'starting position remains in the old safe central area');
assert(html.includes('const bossTarget=(Number(game.bossCount)||0)===0?15:30;'),'boss HUD and scheduler use the same 15/30 second cadence');
assert(html.includes('game.bossSpawnFailures'),'failed boss spawns retry rather than silently stalling');
assert(html.includes('const baseAng=Math.random()*Math.PI*2;'),'new bosses spawn near the player instead of at the far map edge');
assert(html.includes('const cardRolling=rank>=1&&rollProgress<1;'),'Uncommon and better choices animate');
assert(html.includes('ctx.scale(reelSquash,1);ctx.translate(-cx,-cy);'),'animated upgrade cards rotate around their own center');
for(const effect of ['rank===1','rank===2','rank===3','rank===4','rank===5','rank===6','rank===7','rank===8','rank===9','rank===10'])assert(html.includes(effect),'missing rarity-specific animation '+effect);
assert(expansion.includes('name:\'Thorns\''),'Thorns upgrade family exists');
assert(expansion.includes('window.OUTLAST_UPGRADE_LIBRARY_COUNT=unique.length'),'upgrade count is recomputed after adding the new cards');

const tiers=['Common','Uncommon','Rare','Epic','Legendary','Mythic','Divine','Celestial','Transcendent','Eternal','Omega'];
const scales=[1,1.15,1.35,1.6,1.9,2.25,4,5,6,7,8];
const maps=['Forest','Desert','Snow','Lava','City','Hospital','Laboratory','Subway','Prison','MilitaryBase','RuinedTown','Harbor','Bunker','Swamp','Skyscraper','Wasteland','Seizure','Ribhouse'];
const rarityPools=Object.fromEntries(tiers.map(t=>[t,[]]));
const sandbox={
 console,Date,Math,Number,String,Object,Array,Set,JSON,performance:{now:()=>1000},W:4000,H:3000,CW:1280,CH:720,
 document:{readyState:'complete',title:'',querySelectorAll:()=>[],querySelector:()=>null,getElementById:()=>null,addEventListener:()=>{},head:{appendChild:()=>{}},body:{appendChild:()=>{}},createElement:()=>({style:{},appendChild:()=>{}})},
 setTimeout:fn=>{if(typeof fn==="function")fn();return 0;},clearTimeout:()=>{},updates:[],helpArticles:[],tempUp:[],
 upgradeRarities:Object.fromEntries(tiers.map((t,i)=>[t,{mult:scales[i],label:t.toUpperCase(),weight:1,glow:'#fff'}])),
 game:{running:true,paused:false,upgradeOpen:false,time:16,bossClock:16,bossCount:0,bossDefeatedCount:0,enemies:[],effects:[],particles:[],shake:0,
  player:{x:1600,y:1200,hp:100,max:100,damage:100,thorns:0,ult:100,ultDamage:1,ultGain:1,damageTakenMult:1,bossMult:1,critMult:1.8,magnet:100,coinMult:1,xpBonus:1,fireRate:.45,range:500}},
 save:{map:'Forest',mode:'Classic'},mapObstacles:Object.fromEntries(maps.map(m=>[m,[]])),
 damageEnemy:(e,d)=>{e.hp-=d;},killEnemy:(i)=>{sandbox.game.enemies.splice(i,1);},
 ring:()=>{},burst:()=>{},toast:(msg)=>{sandbox.lastToast=msg;},
 outlastTakePlayerDamage:(p,amount)=>{p.hp=Math.max(0,p.hp-amount);return false;},
 useUltimate:()=>{throw new Error('original ultimate must be replaced');},
 OUTLAST_UPGRADE_RARITY_POOLS:rarityPools,OUTLAST_UPGRADE_RARITY_BY_NAME:{}
};
sandbox.window=sandbox;
vm.createContext(sandbox);
vm.runInContext(expansion,sandbox,{timeout:1500});
assert.strictEqual(sandbox.OUTLAST_THORNS_READY,true,'Thorns damage hook is installed');
assert.strictEqual(sandbox.OUTLAST_ULTIMATE_READY,true,'ultimate hook is installed');
assert.strictEqual(sandbox.OUTLAST_V3378_ADDED_UPGRADES,133,'132 tier-specific cards and the named Thorns card are registered');
assert(sandbox.OUTLAST_UPGRADE_LIBRARY_COUNT>=133,'upgrade card count is updated');
for(const map of maps){
 assert.strictEqual(sandbox.mapObstacles[map].length,11,'expanded map object count: '+map);
 for(const o of sandbox.mapObstacles[map])assert(o[1]+o[3]<=4000&&o[2]+o[4]<=3000,'objects fit expanded map: '+map);
}
const tierThorns=tiers.map(t=>sandbox.tempUp.find(x=>x&&x[0]===t+' Thorns'));
assert(tierThorns.every(Boolean),'Thorns exists in every rarity tier');
const thornsValues=tierThorns.map((item,i)=>{sandbox.game.player.thorns=0;item[2](scales[i]);return sandbox.game.player.thorns;});
for(let i=1;i<thornsValues.length;i++)assert(thornsValues[i]>thornsValues[i-1],'Thorns value must increase with rarity');
sandbox.game.player={x:1600,y:1200,hp:100,max:100,damage:100,thorns:.25,thornsRadius:180,ult:0,ultDamage:1,ultGain:1,damageTakenMult:1,bossMult:1,critMult:1.8,magnet:100,coinMult:1,xpBonus:1,fireRate:.45,range:500};
sandbox.game.enemies=[{x:1620,y:1200,hp:10000,max:10000,boss:false}];
const hpBefore=sandbox.game.enemies[0].hp;
sandbox.outlastTakePlayerDamage(sandbox.game.player,10,'test hit');
assert(sandbox.game.player.hp<100,'incoming hit still reduces HP');
assert(sandbox.game.enemies[0].hp<hpBefore,'Thorns retaliates against a nearby enemy');
sandbox.game.player.ult=100;
sandbox.game.enemies=[{x:1600,y:1200,hp:10000,max:10000,boss:false}];
const enemyBefore=sandbox.game.enemies[0].hp;
assert.strictEqual(sandbox.useUltimate(),true,'fully charged ultimate fires');
assert(sandbox.game.enemies[0].hp<enemyBefore,'ultimate damages enemies');
assert.strictEqual(sandbox.game.player.ult,0,'ultimate spends its charge');
assert(String(sandbox.lastToast).includes('ULTIMATE RELEASED'),'ultimate gives visible confirmation');
console.log('OUTLAST v3.37.14 expansion, thorns, upgrade ladder, map dimensions, and ultimate checks passed');