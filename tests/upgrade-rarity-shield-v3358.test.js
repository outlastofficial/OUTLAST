const fs=require('fs'),assert=require('assert');
const html=fs.readFileSync('index.html','utf8');
const lib=fs.readFileSync('outlast-v33015-upgrade-library.js','utf8');

const rarityScales={
  Common:1,
  Uncommon:1.15,
  Rare:1.35,
  Epic:1.6,
  Legendary:1.9,
  Mythic:2.25,
  Divine:2.7,
  Celestial:3.2,
  Transcendent:3.8,
  Eternal:4.6,
  Omega:5.5
};

for(const [rarity,mult] of Object.entries(rarityScales)){
  if(['Common','Uncommon','Rare','Epic','Legendary','Mythic'].includes(rarity)){
    assert(html.includes(`${rarity}:{mult:${mult},`),`${rarity} rarity multiplier must match the approved scale`);
  }else{
    assert(lib.includes(`upgradeRarities.${rarity}={mult:${mult},`),`${rarity} rarity multiplier must match the approved scale`);
  }
}

assert(lib.includes('const entry=[d.name,d.desc,d.apply];'),'upgrade library must store the effect factory, not a pre-scaled effect');
assert(!lib.includes('const entry=[d.name,d.desc,d.apply(d.mult)];'),'upgrade library must not pre-apply its source rarity multiplier');

assert(html.includes('function outlastTakePlayerDamage('),'all normal player damage should pass through one damage boundary');
assert(html.includes('outlastOmegaShieldBlock(amount)'),'the shared damage boundary must consume Omega Shield charges before HP damage');
assert(html.includes("Number(player.shield||0)>0"),'temporary shield must absorb incoming hits');
assert(html.includes('function outlastGrantTempShield(seconds)'),'temporary shield grants must use one shared efficiency-aware helper');
assert(html.includes("Number(p.shield||0)>0)p.shield=Math.max(0,Number(p.shield)-dt)"),'temporary shield must expire instead of becoming permanent');
assert(html.includes('outlastTakePlayerDamage(game.player,hz.damage'),'map hazards must respect Omega Shield');
assert(html.includes('outlastTakePlayerDamage(p,b.dmg'),'enemy projectiles must respect Omega Shield');
assert(html.includes('outlastTakePlayerDamage(p,p2.damage*.8*dt'),'player-contact damage must respect Omega Shield');

assert(html.includes('id="outlast-mandatory-update-check"'),'mandatory update check must exist');
assert(html.includes('outlast_update_ack_v3.35.8'),'update acknowledgement must be versioned');
assert(html.includes('RELOAD TO UPDATE'),'a newer served version must offer a cache-busting reload');
assert(html.includes('UPDATE REQUIRED'),'the update check must gate the page until acknowledged');
assert(html.includes('outlast-v3358-final-marker'),'release marker must identify v3.35.8');

console.log('v3.35.8 rarity, shield, and mandatory-update regression checks passed');
