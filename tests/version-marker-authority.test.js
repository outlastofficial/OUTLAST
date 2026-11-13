const fs = require('node:fs');
const assert = require('node:assert/strict');

const html = fs.readFileSync('index.html', 'utf8');
const currentBuild = (html.match(/<meta name="outlast-build" content="([^"]+)"/) || [])[1];
assert.ok(currentBuild, 'current build metadata must exist');

assert.ok(!html.includes("var CHIP='v4.6.4 • UPGRADE LUCK FIX'"),
  'legacy Survivor Hub observer must not force the v4.6.4 chip');
assert.ok(!html.includes("var BUILD='4.6.4', LABEL='v4.6.4 • UPGRADE LUCK FIX'"),
  'legacy mandatory update checker must not advertise v4.6.4 as the current build');
assert.ok(html.includes("typeof window.OUTLAST_MANDATORY_UPDATE_CHECK==='object'"),
  'update notice sync must guard the optional state object before writing its version');
assert.ok(html.includes("var V='"+currentBuild+"'"),
  'final-version guard must match the current build metadata');
assert.ok(!html.includes("var V='4.7.4';"),
  'old Upgrade Luck marker must not roll the app back from the current release');
assert.ok(!html.includes("window.OUTLAST_BUILD='3.37.15'")&&!html.includes("a.content='3.37.15'"),
  'legacy v3.37.15 marker must not overwrite current build metadata');

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
assert.match(tail, /window\.OUTLAST_VERSION_MARKER_READY=BUILD/,
  'runtime smoke tests can wait for the authoritative marker to finish');
assert.ok(html.includes('How do shield duration upgrades stack?') && html.includes('Shield Nova at 4 seconds'),
  'How To explains additive Shield Nova duration');
assert.ok(html.includes('How does the OUTLAST Live Content schedule work?'),
  'How To explains the live content schedule');
assert.match(tail, /OUTLAST_VERSION_MARKER_READY=BUILD/,
  'authoritative marker exposes a readiness signal after applying the current release');
assert.match(tail, /#outlastMandatoryUpdateCheck \.ver/,
  'authoritative marker must synchronize the mandatory popup version line');
assert.match(tail, /CURRENT BUILD/,
  'mandatory popup version line must use the current build label');
assert.match(tail, /typeof helpArticles!=='undefined'/,
  'authoritative marker must update the How To guide through the shared help list');

const popupVersion=(html.match(/const CURRENT_UPDATE_VERSION='([^']+)'/)||[])[1];
assert.strictEqual(popupVersion,currentBuild,'mandatory update popup version must match the visible build');
const popupTitle=(html.match(/const CURRENT_UPDATE_INFO=\\{title:'([^']+)'/)||[])[1];
assert.ok(popupTitle&&popupTitle.indexOf('v'+currentBuild+' — ')===0,'mandatory update popup title must match the visible build');
const scheduleVersion=(html.match(/live-content-schedule\\.js\\?v=([^"]+)/)||[])[1];
assert.strictEqual(scheduleVersion,currentBuild,'live-content schedule cache key must match the visible build');

console.log('PASS: final version marker matches OUTLAST '+currentBuild+' and owns version display.');
