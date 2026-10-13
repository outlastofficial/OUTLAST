const fs=require('fs'),assert=require('assert');
const html=fs.readFileSync('index.html','utf8');
const system=fs.readFileSync('outlast-v3370-game-systems.js','utf8');
const roller=fs.readFileSync('outlast-v438-upgrade-boss-balance.js','utf8');
const rarityScales={
  Common:1,Uncommon:1.15,Rare:1.35,Epic:1.6,Legendary:1.9,Mythic:2.25,
  Divine:4,Celestial:4.8,Transcendent:5.6,Eternal:6.8,Omega:8
};
for(const [rarity,mult] of Object.entries(rarityScales)){
  assert(system.includes(rarity+':'+mult),rarity+' rarity must use the approved '+mult+'x scale');
  assert(roller.includes(rarity+':'+mult),rarity+' must be available to the runtime rarity roller at '+mult+'x');
}
assert(system.includes("const SCALE=Object.freeze({Common:1,Uncommon:1.15,Rare:1.35,Epic:1.6,Legendary:1.9,Mythic:2.25,Divine:4,Celestial:4.8,Transcendent:5.6,Eternal:6.8,Omega:8})"),
  'active level-up effects must share the approved eleven-tier scale');
assert(roller.includes('window.rollUpgradeRarity=roll'),'the eleven-tier roller must be installed as the live rarity roller');
assert(roller.includes('window.OUTLAST_ROLL_UPGRADE_RARITY_AT=rollAt'),'rarity intervals must be directly testable');
assert(roller.includes('Omega:.03')&&roller.includes('Divine:.45'),'all premium tiers have non-zero base probability');
assert(roller.includes('window.OUTLAST_RARITY_AUDIT_WEIGHTS_FOR_LUCK=weightsFor'),'Upgrade Luck weighting must be exposed for regression tests');
assert(system.includes('window.makeChoices=authoritativeUpgradeChoice37'),'rarity-aware choice generation is the final active choice generator');

assert(html.includes('function fmtPct(base,mult)'),'rarity percentage boosts must be displayed with scaled values');
assert(html.includes('function outlastTakePlayerDamage('),'all normal player damage should pass through one damage boundary');
assert(html.includes('outlastOmegaShieldBlock(amount)'),'shared damage handling must consume Omega Shield charges before HP damage');
assert(html.includes("Number(player.shield||0)>0"),'temporary shield must absorb incoming hits');
assert(html.includes('function outlastGrantTempShield(seconds)'),'temporary shield grants use a shared efficiency-aware helper');
assert(html.includes("Number(p.shield||0)>0)p.shield=Math.max(0,Number(p.shield)-dt)"),'temporary shield must expire instead of becoming permanent');
assert(html.includes('outlastTakePlayerDamage(game.player,hz.damage'),'map hazards must respect Omega Shield');
assert(html.includes('outlastTakePlayerDamage(p,b.dmg'),'enemy projectiles must respect Omega Shield');
assert(html.includes('outlastTakePlayerDamage(p,p2.damage*.8*dt'),'player-contact damage must respect Omega Shield');

assert(html.includes('id="outlast-mandatory-update-check"'),'mandatory update check must exist');
assert(html.includes('outlast_update_ack_v4.3.8'),'update acknowledgement must match the current build');
assert(html.includes("const BUILD='4.3.8',ACK='outlast_update_ack_v4.3.8'"),'mandatory updater must use v4.3.8');
assert(html.includes('RELOAD TO UPDATE'),'a newer served version must offer a cache-busting reload');
assert(html.includes('OUTLAST UPDATE REQUIRED'),'the update check must gate the page until acknowledged');
assert(html.includes('outlast-v3377-final-marker'),'legacy marker writer must be synchronized');
assert(html.includes('outlast-v438-upgrade-boss-balance.js?v=4.3.8'),'new balance patch is loaded last');

console.log('v4.3.8 rarity, shield, and mandatory-update regression checks passed');
