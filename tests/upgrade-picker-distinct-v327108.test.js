const fs=require('node:fs');
const assert=require('node:assert/strict');
const path=require('node:path');
const vm=require('node:vm');

const root=path.join(__dirname,'..');
const authority=fs.readFileSync(path.join(root,'outlast-v327108-rarity-card-authority.js'),'utf8');
const applied=[];
const active=new Set(['Power Shot']);
const tempUp=[
  ['Power Shot',m=>'Power Shot '+m,m=>applied.push(['Power Shot',m])],
  ['Vitality',m=>'Vitality '+m,m=>applied.push(['Vitality',m])],
  ['Rapid Fire',m=>'Rapid Fire '+m,m=>applied.push(['Rapid Fire',m])],
  ['Multi-Shot',m=>'Multi-Shot '+m,m=>applied.push(['Multi-Shot',m])]
];
const upgradeRarities={
  Common:{mult:1,weight:1},
  Uncommon:{mult:1.15,weight:1},
  Rare:{mult:1.35,weight:1}
};
const deterministicMath=Object.create(Math);
deterministicMath.random=()=>0;
const window={};
const context={
  window,tempUp,upgradeRarities,
  upgradeAlreadyActive:name=>active.has(name),
  upgradeCategory:name=>name,
  rollUpgradeRarity:()=> 'Common',
  game:{upgradeChoices:[]},
  updates:[],helpArticles:[],
  setTimeout:()=>0,console,Math:deterministicMath
};
vm.runInNewContext(authority,context,{timeout:2000});

assert.strictEqual(typeof window.makeChoices,'function','authoritative picker is installed');
const choices=window.makeChoices();
assert.strictEqual(choices.length,3,'picker returns three choices when three eligible upgrades exist');
const names=choices.map(choice=>choice[0]);
assert.strictEqual(new Set(names).size,3,'all three choices have distinct names');
assert.deepStrictEqual([...names].sort(),['Multi-Shot','Rapid Fire','Vitality'].sort(),'picker excludes active upgrades and keeps searching across rarity pools');
for(const choice of choices){
  const rarity=window.OUTLAST_UPGRADE_RARITY_BY_NAME[choice[0]];
  assert.strictEqual(choice[3],rarity,choice[0]+' card shows its authoritative rarity');
  const multiplier=upgradeRarities[rarity].mult;
  assert.strictEqual(choice[1],choice[0]+' '+multiplier,choice[0]+' description uses the displayed multiplier');
  choice[2]();
}
assert.deepStrictEqual(applied.map(x=>x[0]).sort(),['Multi-Shot','Rapid Fire','Vitality'].sort(),'each displayed choice applies exactly its own upgrade');
assert(applied.every(x=>x[1]===upgradeRarities[window.OUTLAST_UPGRADE_RARITY_BY_NAME[x[0]]].mult),'applied multipliers match the card rarity');

tempUp.splice(0,tempUp.length,
  ['Vitality',m=>'Vitality '+m,()=>{}],
  ['Rapid Fire',m=>'Rapid Fire '+m,()=>{}]
);
const limited=window.makeChoices();
assert.strictEqual(limited.length,2,'picker does not duplicate or invent a third choice when only two eligible upgrades remain');
assert.strictEqual(new Set(limited.map(choice=>choice[0])).size,2,'limited pool still contains no duplicates');

console.log('OUTLAST authoritative upgrade picker regression passed: three distinct eligible choices, active-upgrade filtering, matching multipliers, and safe small-pool behavior.');
