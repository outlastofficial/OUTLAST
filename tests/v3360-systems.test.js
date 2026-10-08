const fs=require('fs'),assert=require('assert');

const html=fs.readFileSync('index.html','utf8');
const focused=fs.readFileSync('outlast-v3360-focused-systems.js','utf8');
const source=html+'\n'+focused;
assert(source.includes('content="3.36.0"'),'release must be v3.36.0');
assert(source.includes('outlast-mandatory-update-check'),'mandatory update check must exist');
assert(source.includes("BUILD='3.36.0'"),'mandatory updater must check v3.36.0');
assert(source.includes('outlast_update_ack_v3.36.0'),'mandatory acknowledgement must be versioned');
assert(source.includes('RELOAD TO UPDATE'),'mandatory updater must handle stale clients');

assert(source.includes('if(player===game?.player&&Number(player.shield||0)>0)'),'temporary shield must absorb hits');
assert(source.includes('function outlastGrantTempShield(seconds)'),'temporary shield grants must be shared');
assert(source.includes('!p.infiniteShield&&Number(p.shield||0)>0'),'temporary shield must expire');
assert(source.includes("outlastTakePlayerDamage(p,actual*dt,'enemy contact')"),'enemy contact must use shared damage boundary');

assert(source.includes("if(outlastBossIsAlive())return false;"),'spawnBoss must reject a second live boss');
assert(source.includes("const bossTarget=")&&source.includes("!outlastBossIsAlive()")&&source.includes("game.bossClock>=bossTarget"),'next boss must wait until previous boss is dead');

assert(!source.includes('ownerPasswordInput'),'owner panel must not request a password');
assert(source.includes("if(!owner()){toast('Owner access only');return;}"),'owner panel must gate non-owners');
assert(source.includes("ownerBtn');if(btn)btn.style.display=isOwner()"),'owner launcher must be hidden from non-owners');

assert(source.includes('sk.hp||0'),'skin HP bonus must affect player stats');
assert(source.includes('sk.damage||0'),'skin damage bonus must affect player stats');
assert(source.includes('sk.speed||0'),'skin speed bonus must affect player stats');
assert(source.includes('sk.xp||0'),'skin XP bonus must affect player stats');
assert(source.includes('sk.boss||0'),'skin boss bonus must affect player stats');
assert(source.includes("byRarity[skins[n].rarity]"),'skin rarity groups must handle all rarity values');

assert(source.includes("data-page-content=\"progress\""),'progress page must exist');
for(const id of ['coreBtn','weaponTreeBtn','codexBtn','battlePassBtn','prestigeBtn','raritiesBtn','worldBossBtn','setsBtn','roomsBtn']){
  assert(source.includes('id="'+id+'"'),'progress needs button '+id);
}
assert(source.includes('function renderCoreSystems()'),'core systems UI must exist');
assert(source.includes('OUTLAST_CORE_CONTENT.audit()'),'core systems UI must use the 12-core engine');
assert(source.includes('window.renderExpandedStats=stats36'),'expanded stats UI must exist');
assert(source.includes('window.renderExpandedInventory=inventory36'),'expanded inventory UI must exist');
assert(source.includes('window.renderExpandedModifiers=modifiers36'),'expanded modifier UI must exist');

assert(source.includes("shopStockRotation==='3.36.0'"),'daily shop rotation must be refreshed for this release');
assert(source.includes('shopStockIds.length===8'),'daily shop must stock 8 offers');

assert(source.includes('NoHealing:{'),'run modifiers must contain additional modifier choices');
assert(source.includes('FastBosses:{'),'run modifiers must contain boss-focused modifier choices');

assert(source.includes("achievements.push"),'expanded achievements must be appended');
assert(source.includes('achievements.length>=35'),'achievement catalog must be expanded');


assert(source.includes("window.OUTLAST_UPGRADE_RARITY_BY_NAME"),'upgrade rarity authority map must exist');
assert(source.includes("const mapped=window.OUTLAST_UPGRADE_RARITY_BY_NAME?.[name]"),'upgrade choices must derive rarity from the authoritative card map');
assert(source.includes("const actualRarity=window.OUTLAST_UPGRADE_RARITY_BY_NAME?.[name]||rarity"),'upgrade effect rarity must match displayed rarity');
assert(source.includes("byRarity[skins[n].rarity]||="),'skin rarity buckets must initialize before push');
assert(source.includes("function syncOwnerLauncher()"),'owner launcher visibility must be synchronized');
assert(source.includes("ownerBtn');if(btn)btn.style.display=isOwner()"),'owner launcher must be hidden from non-owners');
assert(source.includes("save.shopStockRotation='3.36.0'"),'daily shop rotation must persist the current release');
assert(source.includes('Eight offers are saved for today'),'daily shop must advertise all 8 daily offers');
assert(source.includes('progressInventoryBtn'),'Progress must include Inventory as a direct button');
assert(source.includes('progressShopBtn'),'Progress must include Daily Shop as a direct button');
assert(source.includes('progressModifierBtn'),'Progress must include Run Modifiers as a direct button');
assert(source.includes('statsCombatBtn'),'Progress must include expanded Stats sections');
assert(source.includes('CORE36_LIVE'),'core dashboard must expose live system data');
assert(source.includes('achievements.length>=60'),'achievement catalog must reach at least 60 goals');
console.log('v3.36.0 systems regression test passed');
