const fs=require('fs'),assert=require('assert');

const html=fs.readFileSync('index.html','utf8');
assert(html.includes('content="3.36.0"'),'release must be v3.36.0');
assert(html.includes('outlast-mandatory-update-check'),'mandatory update check must exist');
assert(html.includes("BUILD='3.36.0'"),'mandatory updater must check v3.36.0');
assert(html.includes('outlast_update_ack_v3.36.0'),'mandatory acknowledgement must be versioned');
assert(html.includes('RELOAD TO UPDATE'),'mandatory updater must handle stale clients');

assert(html.includes('if(player===game?.player&&Number(player.shield||0)>0)'),'temporary shield must absorb hits');
assert(html.includes('function outlastGrantTempShield(seconds)'),'temporary shield grants must be shared');
assert(html.includes('!p.infiniteShield&&Number(p.shield||0)>0'),'temporary shield must expire');
assert(html.includes("outlastTakePlayerDamage(p,actual*dt,'enemy contact')"),'enemy contact must use shared damage boundary');

assert(html.includes("if(outlastBossIsAlive())return false;"),'spawnBoss must reject a second live boss');
assert(html.includes("if(!outlastBossIsAlive()&&game.bossClock>=bossTarget)"),'next boss must wait until previous boss is dead');

assert(!html.includes('ownerPasswordInput'),'owner panel must not request a password');
assert(html.includes("if(!owner()){toast('Owner access only');return;}"),'owner panel must gate non-owners');
assert(html.includes("ownerBtn');if(btn)btn.style.display=isOwner()"),'owner launcher must be hidden from non-owners');

assert(html.includes('sk.hp||0'),'skin HP bonus must affect player stats');
assert(html.includes('sk.damage||0'),'skin damage bonus must affect player stats');
assert(html.includes('sk.speed||0'),'skin speed bonus must affect player stats');
assert(html.includes('sk.xp||0'),'skin XP bonus must affect player stats');
assert(html.includes('sk.boss||0'),'skin boss bonus must affect player stats');
assert(html.includes("byRarity[skins[n].rarity]"),'skin rarity groups must handle all rarity values');

assert(html.includes("data-page-content=\"progress\""),'progress page must exist');
for(const id of ['coreBtn','weaponTreeBtn','codexBtn','battlePassBtn','prestigeBtn','raritiesBtn','worldBossBtn','setsBtn','roomsBtn']){
  assert(html.includes('id="'+id+'"'),'progress needs button '+id);
}
assert(html.includes('function renderCoreSystems()'),'core systems UI must exist');
assert(html.includes('OUTLAST_CORE_CONTENT.audit()'),'core systems UI must use the 12-core engine');
assert(html.includes('function renderExpandedStats()'),'expanded stats UI must exist');
assert(html.includes('function renderExpandedInventory()'),'expanded inventory UI must exist');
assert(html.includes('function renderExpandedModifiers()'),'expanded modifier UI must exist');

assert(html.includes("shopStockRotation==='3.36.0'"),'daily shop rotation must be refreshed for this release');
assert(html.includes('shopStockIds.length===8'),'daily shop must stock 8 offers');

assert(html.includes("['NoHealing'"),'run modifiers must contain additional modifier choices');
assert(html.includes("['FastBosses'"),'run modifiers must contain boss-focused modifier choices');

assert(html.includes("achievements.push"),'expanded achievements must be appended');
assert(html.includes('achievements.length>=35'),'achievement catalog must be expanded');

console.log('v3.36.0 systems regression test passed');
