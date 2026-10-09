const fs=require('fs'),assert=require('assert'),path=require('path'),vm=require('vm');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const mod=fs.readFileSync(path.join(root,'outlast-v3370-game-systems.js'),'utf8');
const library=fs.readFileSync(path.join(root,'outlast-v33015-upgrade-library.js'),'utf8');
new vm.Script(mod,{filename:'outlast-v3370-game-systems.js'}); // Fail CI on malformed external runtime modules.

assert.match(html,/outlast-v3370-game-systems\.js\?v=3\.37\.\d+/,'current v3.37 systems module is loaded with a cache-busting version');
assert(html.includes('v3.37.0'),'game version marker must be 3.37.0');
assert(html.includes("const BUILD='3.37.15'"),'mandatory update check must target 3.37.0');
assert(html.includes("outlast_update_ack_v3.37.15"),'mandatory update acknowledgement must be versioned');
assert(html.includes('game.upgradeChoices=(typeof window.makeChoices===\'function\'?window.makeChoices():makeChoices())'),'level-up must use the authoritative rarity-aware choice generator');

assert(mod.includes('function authoritativeUpgradeChoice37'), 'authoritative upgrade choice resolver must exist');
assert(mod.includes('window.OUTLAST_UPGRADE_RARITY_SCALING37'), 'authoritative rarity scale must be published');
assert(mod.includes('Common:1') && mod.includes('Mythic:2.25'), 'legacy low-tier scaling remains intact');
assert(library.includes('const TIER_SCALE=Object.freeze({Common:1,Uncommon:1.15,Rare:1.35,Epic:1.6,Legendary:1.9,Mythic:2.25,Divine:2.7,Celestial:3.2,Transcendent:3.8,Eternal:4.6,Omega:5.5})'), 'current high-rarity ladder must match the active upgrade library');
assert(mod.includes("if(name==='XP Boost')") && mod.includes('Math.round(8*mult)'), 'fixed XP Boost values must be rarity-scaled');

assert(mod.includes('function zombieAI37'), 'zombie AI controller must exist');
assert(mod.includes('Flanker') && mod.includes('Ambusher') && mod.includes('Sniper') && mod.includes('Rammer'), 'zombie AI must include multiple behaviors');
assert(html.includes('zombieAI37(e,p,dt)'), 'game update must route zombie movement through the AI controller');

assert(html.includes('game.activeBossId'), 'active boss lock state must exist');
assert(html.includes('if(outlastBossIsAlive())return false;'), 'boss spawn must refuse when a live boss is already active');
assert(html.includes('if(e.boss&&game.activeBossId===e.id)'), 'boss death must clear active boss lock');
assert(html.includes('game.activeBossId=null'), 'boss death must release the active boss lock');

assert(mod.includes('applySkin37'), 'skin resolver must exist');
assert(mod.includes("xp:Number(skin.xp||0)") && mod.includes("coins:Number(skin.coins||0)") && mod.includes("boss:Number(skin.boss||0)") && mod.includes("damage:Number(skin.damage||0)") && mod.includes("speed:Number(skin.speed||0)"), 'skin resolver must capture all supported bonus categories');

for(const id of ['progressStats37','progressAchievements37','progressStatsDetails37','progressShop37','progressInventory37','progressModifiers37','progressCore37','progressSkins37','progressCodex37','progressBattlePass37','progressPrestige37','progressRarity37','progressWorldBoss37']){
  assert(mod.includes(id),id+' must be a dedicated Progress button');
}
assert(mod.includes('DAILY SHOP') && mod.includes('12 OFFERS'), 'daily shop must be expanded and visibly presented as a larger shop');
assert(mod.includes('achievement37Extra'), 'additional achievements must be installed');
assert(mod.includes('stats37'), 'expanded stats dashboard must exist');
assert(mod.includes('inventory37'), 'clean inventory dashboard must exist');
assert(mod.includes('modifiers37'), 'expanded run modifiers must exist');
assert(mod.includes('core37'), '12-core dashboard must exist');

assert(mod.includes('syncOwnerLauncher37'),'owner launcher must be owner-only');
assert(mod.includes("card.style.display=ok?'':'none'")||mod.includes("card.style.display=(typeof isOwner==='function'&&isOwner())?'':'none'"),'non-owners must not see the Owner Panel card');
assert(!mod.match(/ownerPassword|OWNER_PASSWORD/i),'owner panel must not use a password');

console.log('OUTLAST v3.37.0 systems regression checks passed');
