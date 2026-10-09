const fs=require('fs'),assert=require('assert'),path=require('path'),vm=require('vm');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const systems=fs.readFileSync(path.join(root,'outlast-v3370-game-systems.js'),'utf8');
const library=fs.readFileSync(path.join(root,'outlast-v33015-upgrade-library.js'),'utf8');
assert(html.includes("const BUILD='3.37.3',ACK='outlast_update_ack_v3.37.3'"),'mandatory update check must use v3.37.3');
assert(html.includes("window.authoritativeUpgradeChoice37==='function'"),'level-up choices must use the rarity-aware chooser');
assert(html.includes('return ranked;'),'the rarity-aware result must replace the old label-only choices');
assert(!html.includes('if(u&&byName[u[0]])u[3]=byName[u[0]];'),'the old label-only rarity override must be removed');
assert(html.includes('How do upgrade rarity labels stay accurate?'),'How-To must explain rarity integrity');
assert(systems.includes("const VERSION='3.37.3';"),'runtime system version must be current');
assert(systems.includes('Divine:4,Celestial:5,Transcendent:6,Eternal:7,Omega:8'),'high-rarity multipliers must remain unchanged');
assert(library.includes("const V='3.37.3';"),'upgrade library must be current');
assert(!library.includes('apply:v=>()=>'),'new library effects must not be accidentally double-wrapped');
const names=['Common','Uncommon','Rare','Epic','Legendary','Mythic','Divine','Celestial','Transcendent','Eternal','Omega'];
const mults=[1,1.15,1.35,1.6,1.9,2.25,4,5,6,7,8];
const pools=Object.fromEntries(names.map(n=>[n,[]]));
const sandbox={window:{OUTLAST_UPGRADE_RARITY_POOLS:pools,OUTLAST_UPGRADE_RARITY_BY_NAME:{}},document:{readyState:'complete',title:'',querySelectorAll:()=>[],addEventListener:()=>{}},tempUp:[],game:{player:{}},save:{},helpArticles:[],upgradeRarities:{},setTimeout:()=>{},console};
sandbox.window.window=sandbox.window;
vm.runInNewContext(library,sandbox,{timeout:1500});
assert.strictEqual(sandbox.tempUp.length,220,'all 220 upgrade cards should install');
assert.strictEqual(sandbox.window.OUTLAST_UPGRADE_LIBRARY_COUNT,220,'all 220 cards should be registered in their rarity pools');
for(const tier of names)assert.strictEqual(pools[tier].length,20,tier+' must have 20 cards');
const intValue=sandbox.window.OUTLAST_UPGRADE_TIER_INTEGER;
assert.deepStrictEqual(mults.map(m=>intValue(1,m)),[1,2,3,4,5,6,7,8,9,10,11],'integer-only bonuses must increase at every rarity');
function collect(family,stat){
  const vals=[];
  for(let i=0;i<names.length;i++){
    const item=sandbox.tempUp.find(x=>x&&x[0]===names[i]+' '+family);
    assert(item,'missing '+names[i]+' '+family);
    const player={damage:0,pierce:0,multiShot:0,shield:0,regen:0,fireRate:.45,speed:300,speedCap:500,max:100,hp:100,magnet:0};
    sandbox.game.player=player;
    const desc=item[1](mults[i]);
    const applyResult=item[2](mults[i]);
    if(typeof applyResult==='function')applyResult();
    vals.push({desc,value:player[stat]});
  }
  return vals;
}
for(const [family,stat] of [['Might 01','damage'],['Breach 07','pierce'],['Volley 08','multiShot'],['Aegis 20','shield'],['Renewal 06','regen']]){
  const values=collect(family,stat);
  for(let i=1;i<values.length;i++)assert(values[i].value>values[i-1].value,family+' applied value must strictly increase from '+names[i-1]+' to '+names[i]);
  for(const item of values)assert(item.desc.includes('+'),'each '+family+' card must describe its bonus');
}
const might=collect('Might 01','damage');
for(let i=0;i<might.length;i++){
  const shown=Number(might[i].desc.match(/\+([\d.]+)/)[1]);
  assert(Math.abs(shown-might[i].value)<.051,'Might description must match the actual applied effect for '+names[i]);
}
assert(html.includes('v3.37.3 • SURVIVOR HUB'),'visible version marker must be current');
console.log('OUTLAST v3.37.3 rarity integrity tests passed');
