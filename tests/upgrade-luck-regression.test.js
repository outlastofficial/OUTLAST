const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '..', 'outlast-upgrade-luck-authority.js'), 'utf8');
function load(luck=0,random=()=>0.6){const window={game:{player:{upgradeLuck:luck}}};const math=Object.create(Math);math.random=random;vm.runInNewContext(source,{window,Math:math,console});return window;}
test('all eleven rarity tiers remain reachable, including Omega',()=>{const w=load(100);const tiers=new Set();for(let i=0;i<50000;i++)tiers.add(w.OUTLAST_ROLL_UPGRADE_RARITY(100,(i*.6180339887498949)%1));for(const tier of ['Common','Uncommon','Rare','Epic','Legendary','Mythic','Divine','Celestial','Transcendent','Eternal','Omega'])assert.ok(tiers.has(tier),tier+' should be reachable');});
test('higher Upgrade Luck increases Rare-or-better probability',()=>{const w=load(0);function sample(luck){let n=0;for(let i=0;i<100000;i++){const t=w.OUTLAST_ROLL_UPGRADE_RARITY(luck,(i*.7548776662466927)%1);if(['Rare','Epic','Legendary','Mythic','Divine','Celestial','Transcendent','Eternal','Omega'].includes(t))n++;}return n/100000;}assert.ok(sample(100)>sample(0));});
test('live roller reads the current Upgrade Luck value on every roll',()=>{const w=load(0,()=>.6);const low=w.rollUpgradeRarity();w.game.player.upgradeLuck=100;assert.equal(low,'Uncommon');assert.equal(w.rollUpgradeRarity(),'Epic');});
