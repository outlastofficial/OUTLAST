const fs=require('fs'),assert=require('assert');
const index=fs.readFileSync('index.html','utf8');
const core=fs.readFileSync('outlast-v33500-core-content-engine.js','utf8');
const focus=fs.readFileSync('outlast-v3360-focused-systems.js','utf8');

assert(index.includes("window.OUTLAST_BUILD='3.36.2';window.OUTLAST_VERSION='v3.36.2';"),'current release must publish v3.36.2');
assert(core.includes("window.OUTLAST_CORE_CONTENT"),'12-core engine must still install its content container');
assert(!core.includes("window.OUTLAST_BUILD=VERSION"),'12-core engine must not overwrite the global game build');
assert(!core.includes("window.OUTLAST_VERSION='v'+VERSION"),'12-core engine must not overwrite the global version');
assert(!core.includes("document.title='OUTLAST v'+VERSION"),'12-core engine must not overwrite the page title');
assert(focus.includes("chip36.textContent='v3.36.2 • SURVIVOR HUB'"),'focused systems UI must show the current build marker');
console.log('v3.36.2 version synchronization regression test passed');
