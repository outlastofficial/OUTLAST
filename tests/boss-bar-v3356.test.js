const fs=require('fs'),assert=require('assert');
const html=fs.readFileSync('index.html','utf8');
assert(html.includes('outlastBossBar'),'persistent boss bar element must exist');
assert(html.includes('outlast-boss-bar-v3356'),'boss bar styles/logic must exist');
assert(html.includes('syncBossBar'),'boss bar must sync from live boss state');
assert(html.includes('boss.hp'),'boss bar must read live boss HP');
assert(html.includes('boss.max'),'boss bar must read live boss max HP');
console.log('Boss bar persistence regression test passed');
