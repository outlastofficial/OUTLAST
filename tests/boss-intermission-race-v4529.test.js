const fs=require('fs'),assert=require('assert'),path=require('path'),vm=require('vm');
const root=path.join(__dirname,'..'),boss=fs.readFileSync(path.join(root,'outlast-v4527-upgrade-boss-rebuild.js'),'utf8');
const clock={now:100000};class FakeDate extends Date{static now(){return clock.now}}
let intervalFn=null,spawnCalls=0;
const game={running:true,paused:false,over:false,time:20,player:{x:100,y:100,hp:100,max:100,r:16},enemies:[{boss:true,hp:100,max:100,speed:100,r:42,x:400,y:400}],bullets:[],effects:[],bossClock:0,bossSpawnRetryTimer:0};
const save={mode:'Classic',practiceMode:false};
const window={game,save,toast:()=>{},addEventListener:()=>{}};
function spawnBoss(){spawnCalls++;game.enemies.push({boss:true,hp:100,max:100,speed:100,r:42,x:400,y:400});return true}
window.spawnBoss=spawnBoss;
const document={readyState:'complete',addEventListener:()=>{}};
const ctx={window,document,game,save,spawnBoss,Date:FakeDate,Math,console,setInterval:fn=>{intervalFn=fn;return 1},setTimeout:()=>1,toast:()=>{},W:1000,H:1000};
vm.createContext(ctx);vm.runInContext(boss,ctx,{timeout:2000});
assert.strictEqual(typeof intervalFn,'function','boss scheduler installs');
assert.strictEqual(window.OUTLAST_BOSS_UNIQUE_AUDIT().profiles,8,'eight distinct boss profiles are available');
game.enemies=[]; // boss is defeated between controller ticks
const immediate=window.spawnBoss();
assert.strictEqual(immediate,false,'a same-frame spawn attempt must be blocked after the defeat');
assert.strictEqual(spawnCalls,0,'the native spawn function must not run during the intermission');
clock.now+=29999;
assert.strictEqual(window.spawnBoss(),false,'the next boss remains blocked for the full 30 seconds');
assert.strictEqual(spawnCalls,0,'no early spawn slips through the intermission');
clock.now+=2;
assert.strictEqual(window.spawnBoss(),true,'a boss may spawn after the full intermission');
assert.strictEqual(spawnCalls,1,'exactly one spawn attempt is allowed after the intermission');
assert.strictEqual(game.enemies.filter(e=>e&&e.boss&&e.hp>0).length,1,'the scheduler must not create duplicate living bosses');
console.log('OUTLAST boss intermission race regression passed (current build v4.6.6).');
