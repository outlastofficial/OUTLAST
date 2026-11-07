const fs = require('node:fs');
const assert = require('node:assert/strict');

const html = fs.readFileSync('index.html', 'utf8');
const schedule = fs.readFileSync('live-content-schedule.js', 'utf8');
const chatRuntime = fs.readFileSync('tests/global-chat-runtime-v451.e2e.cjs', 'utf8');
const liveRuntime = fs.readFileSync('tests/live-runtime-v3361.e2e.cjs', 'utf8');
const afk = fs.readFileSync('outlast-v443-reliability-afk.js', 'utf8');
const currentBuild = (html.match(/<meta name="outlast-build" content="([^"]+)"/) || [])[1];
assert.ok(currentBuild, 'current build metadata must exist');
const finalLockStart = html.indexOf('<script id="outlast-v466-absolute-final-version-lock">');
assert.ok(finalLockStart >= 0, 'final version lock must exist');
const finalLockEnd = html.indexOf('</script>', finalLockStart);
const finalLock = html.slice(finalLockStart, finalLockEnd);
assert.ok(finalLock.includes("var meta=document.querySelector('meta[name=\"outlast-build\"]')"),
  'final version lock must read the current build metadata');
assert.ok(finalLock.includes('var V=String(window.OUTLAST_CURRENT_RELEASE&&window.OUTLAST_CURRENT_RELEASE.version||meta&&meta.content'),
  'final version lock must prefer current release metadata over stale metadata left by legacy scripts');
assert.ok(html.includes("window.OUTLAST_CURRENT_RELEASE={version:'"+currentBuild+"'"),
  'current release metadata must match the build marker');
assert.ok(schedule.includes('var existingRelease = window.OUTLAST_CURRENT_RELEASE || {};'),
  'live schedule must preserve the release metadata set by the current page');
assert.ok(schedule.includes('var releaseVersion = String(existingRelease.version || releaseMeta'),
  'live schedule must derive its version from the active release metadata');
assert.ok(!/version:\\s*['"]4\\.6\\.12['"]/.test(schedule),
  'live schedule must not pin a newer release back to v4.6.12');
assert.ok(chatRuntime.includes('runtimeBuild===lastVersionState.metaBuild') && chatRuntime.includes("lastVersionState.title.includes('v'+lastVersionState.metaBuild)"),
  'Global Chat smoke must validate version consistency without hard-coding a release number');
assert.ok(!chatRuntime.includes("lastBuild==='4.5.26'") && !chatRuntime.includes("lastTitle.includes('v4.5.26')"),
  'Global Chat smoke must not pin the runtime test to the old v4.5.26 release');
assert.ok(liveRuntime.includes("localStorage.setItem('outlast_update_log_seen',build);"),
  'Start Run smoke must acknowledge the current update popup before exercising gameplay');
assert.ok(afk.includes('@media(max-width:760px){#outlastV443AFK{right:10px;top:58px;bottom:auto;z-index:34'),
  'AFK Lounge must move above the mobile action area on phone/tablet widths');
assert.ok(html.includes('outlast-v443-reliability-afk.js?v=4.6.13-mobile-afk-layout'),
  'the updated mobile AFK layout must use a fresh script cache key');
assert.ok(liveRuntime.includes('AFK Lounge must remain visible without covering mobile ULT'),
  'Mobile browser smoke must protect the AFK Lounge and ULT control from overlap');
assert.ok(!finalLock.includes('var V="4.6.'),
  'final version lock must not pin the app to a stale hard-coded release');

assert.ok(!html.includes("var CHIP='v4.6.4 • UPGRADE LUCK FIX'"),
  'legacy Survivor Hub observer must not force the v4.6.4 chip');
assert.ok(!html.includes("var BUILD='4.6.4', LABEL='v4.6.4 • UPGRADE LUCK FIX'"),
  'legacy mandatory update checker must not advertise v4.6.4 as the current build');
assert.ok(!html.includes("var V='4.6.4';"),
  'legacy final-version guard must not pin the whole app to v4.6.4');

const marker = html.lastIndexOf('outlast-authoritative-version-marker');
assert.ok(marker >= 0, 'one authoritative marker must be installed at the end of the page');
const tail = html.slice(marker);
assert.match(tail, /meta\[name="outlast-build"\]/,
  'authoritative marker must read the actual build metadata');
assert.match(tail, /#menu \.menu-chip/,
  'authoritative marker must synchronize the menu chip');
assert.match(tail, /MutationObserver/,
  'authoritative marker must correct late legacy DOM rewrites');
assert.match(tail, /pageshow/,
  'authoritative marker must resync after browser page restores');
assert.ok(html.includes('window.OUTLAST_MANDATORY_UPDATE_CHECK'),
  'release acknowledgement must use the current build instead of a hard-coded old version');

console.log('PASS: stale v4.6.4 locks are absent and the final dynamic marker owns version display.');
