const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'live-content-schedule.js'), 'utf8');

assert.match(source, /outlast-test-server\.onrender\.com\/api\/live-content/);
assert.match(source, /outlast-server\.onrender\.com\/api\/live-content/);
assert.match(source, /5 \* 60 \* 1000/);
assert.match(source, /v4\.6\.12 — Live Event Countdowns/);
assert.match(source, /How does the OUTLAST Live Content schedule work\?/);
assert.match(source, /cache: 'no-store'/);
assert.match(source, /OUTLAST LIVE OPERATIONS/);
assert.match(source, /syncReleaseBadge/);
assert.match(source, /MutationObserver/);
console.log('Live content UI integration checks passed.');

assert.match(source, /Saturday-to-Saturday weekly updates/);
assert.match(source, /data\.weeklyEvent/);
assert.doesNotMatch(source, /data\.weekendEvent/);

assert.match(source, /function formatCountdown/);
assert.match(source, /function updateCountdowns/);
assert.match(source, /Next content drop in/);
assert.match(source, /Weekly update starts in|Next weekly chapter in/);
assert.match(source, /Monthly event ends in|Monthly event starts in/);
assert.match(source, /window\.setInterval\(updateCountdowns, 1000\)/);

assert.match(source, /midnight Eastern/);
