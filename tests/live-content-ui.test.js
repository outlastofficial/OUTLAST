const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'live-content-schedule.js'), 'utf8');

assert.match(source, /outlast-test-server\.onrender\.com\/api\/live-content/);
assert.match(source, /outlast-server\.onrender\.com\/api\/live-content/);
assert.match(source, /5 \* 60 \* 1000/);
assert.match(source, /v4\.9\.2 — Live Content Cycle/);
assert.match(source, /How does the OUTLAST Live Content schedule work\?/);
assert.match(source, /cache: 'no-store'/);
assert.match(source, /OUTLAST LIVE OPERATIONS/);\nassert.match(source, /syncReleaseBadge/);\nassert.match(source, /MutationObserver/);
console.log('Live content UI integration checks passed.');
