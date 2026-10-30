const fs = require('node:fs');
const assert = require('node:assert/strict');

const html = fs.readFileSync('index.html', 'utf8');

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
