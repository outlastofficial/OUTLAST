const fs=require('fs'),assert=require('assert');
const index=fs.readFileSync('index.html','utf8');
const core=fs.readFileSync('outlast-v33500-core-content-engine.js','utf8');

assert(index.includes("window.OUTLAST_BUILD='3.36.2';window.OUTLAST_VERSION='v3.36.2';"),'current release must publish v3.36.2');
assert(core.includes("window.OUTLAST_CORE_CONTENT"),'12-core engine must still install its content container');
assert(core.includes("window.OUTLAST_CORE_CONTENT_VERSION=VERSION"),'12-core engine should expose its own version without changing global build state');
assert(!core.includes("window.OUTLAST_BUILD=VERSION"),'12-core engine must not overwrite the global game build');
assert(!core.includes("window.OUTLAST_VERSION='v'+VERSION"),'12-core engine must not overwrite the global version');
assert(!core.includes("document.title='OUTLAST v'+VERSION"),'12-core engine must not overwrite the page title');
assert(index.includes("chip36.textContent='v3.36.2 • SURVIVOR HUB'"),'Progress chip must show the current build marker');
assert(!index.includes("document.title='OUTLAST v3.36.1';window.OUTLAST_BUILD='3.36.1';window.OUTLAST_VERSION='v3.36.1'"),'index must not contain the stale v3.36.1 final override');
console.log('v3.36.2 version synchronization regression test passed');
