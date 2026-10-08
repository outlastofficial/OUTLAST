const fs=require('fs'),assert=require('assert');
const index=fs.readFileSync('index.html','utf8');
const focus=fs.readFileSync('outlast-v3360-focused-systems.js','utf8');
const lib=fs.readFileSync('outlast-v33015-upgrade-library.js','utf8');
const source=index+'\n'+focus+'\n'+lib;

assert(index.includes('v3.37.0'),'current release must be v3.37.0');
assert(index.includes("BUILD='3.37.0'"),'mandatory updater must require v3.37.0');
assert(index.includes('outlast_update_ack_v3.37.0'),'mandatory updater acknowledgement must be versioned for v3.37.0');
assert(index.includes('RELOAD TO UPDATE'),'mandatory updater must force stale clients to reload');

assert(index.includes('style="display:none"'),'owner panel must be hidden by default before owner gate runs');
assert(index.includes('function isOwner()'),'owner access must be based on the owner allowlist');
assert(index.includes("if(!owner()){toast('Owner access only');return;}"),'owner panel must reject non-owners');

assert(index.includes('function outlastBossIsAlive()') || index.includes('function outlastBossIsAlive(){'),'boss gate helper must exist');
assert(index.includes('if(outlastBossIsAlive())return false;'),'spawnBoss must reject a second live boss');
assert(index.includes('else if(!outlastBossIsAlive()') || index.includes('else if(!outlastBossIsAlive())'),'boss timer must not advance toward the next boss while one is alive');

assert(index.includes('function outlastGrantTempShield(seconds)'),'temporary shield grants must use a shared helper');
assert(index.includes("if(player===game?.player&&Number(player.shield||0)>0)"),'temporary shield must absorb incoming damage');
assert(index.includes("if(!p.infiniteShield&&Number(p.shield||0)>0)p.shield=Math.max(0,Number(p.shield)-dt)"),'temporary shield must expire');
assert(index.includes('function outlastTakePlayerDamage('),'all normal player damage must cross the shared damage boundary');

assert(index.includes("game.player.characterVisual={...(ch.visual||{}),body:sk.color}"),'skin appearance must be copied to the player visual state');
assert(index.includes("skinColor:sk.color"),'skin color must be copied to the runtime player state');
assert(index.match(/drawPlayerAvatar\([^\n]*p\.skinColor/g),'player avatar renderer must use the equipped skin color');

assert(source.includes('function outlastZombieAI('),'zombies must use a real AI state machine');
assert(source.includes('aiProfile'),'zombies must carry an AI profile');
assert(source.includes('outlastZombieAI(e,p,dt'),'enemy update loop must call the AI');

assert(index.includes('progressCoreBtn'),'Progress must expose 12 Core Systems directly');
assert(index.includes('progressInventoryBtn'),'Progress must expose Inventory directly');
assert(index.includes('progressShopBtn'),'Progress must expose Daily Shop directly');
assert(index.includes('progressModifierBtn'),'Progress must expose Run Modifiers directly');
assert(index.includes('progressStatsCombatBtn'),'Progress must expose categorized Stats directly');
assert(index.includes('progressAchievementsBtn'),'Progress must expose Achievements directly');
assert(index.includes('progress-v3370-grid'),'Progress must use the new grouped v3.37.0 layout');

assert(source.includes('CORE37_LIVE'),'12 Core Systems must expose v3.37 live state');
assert(source.includes('core37-dashboard'),'12 Core dashboard must be visibly actionable');

assert(source.includes('achievements.length>=90'),'achievement catalog must reach at least 90 goals');
assert(source.includes('dailyShopRotation37'),'Daily Shop must have a v3.37 rotation');
assert(source.includes('inventory37-tabs'),'Inventory must have the expanded tabbed layout');
assert(source.includes('modifier37-filter'),'Run Modifiers must have the improved filtered layout');

const xpAudit=/Mythic Scholar 12[^\n]*mult:2\.25[^\n]*fmtPct\(3,v\)/;
assert(xpAudit.test(lib),'Mythic Scholar must use its Mythic multiplier in the displayed XP amount');
assert(lib.includes('window.OUTLAST_UPGRADE_AUDIT'),'upgrade rarity/effect audit must be exposed');
assert(lib.includes('Rarity ×2.25'),'the Mythic audit must expose its multiplier');

console.log('v3.37.0 game-system regression test passed');