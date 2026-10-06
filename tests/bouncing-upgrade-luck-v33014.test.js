const fs = require('fs');
const assert = require('assert');
const path = require('path');

const root = path.join(__dirname,'..');
const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
const authority = fs.readFileSync(path.join(root,'outlast-v327108-rarity-card-authority.js'),'utf8');

assert.match(html,/Upgrade Luck/);
assert.match(html,/bouncingBullets/);
assert.match(html,/bounceRemaining/);
assert.match(html,/bounceDamage/);
assert.match(html,/bouncedThisFrame/);
assert.match(html,/bounceTargets/);
assert.match(authority,/Common:\[[^\]]*['"]Upgrade Luck['"]/);
assert.doesNotMatch(html,/outlast-v33014-bounce-luck\.js\?v=3\.30\.14/);
console.log('OUTLAST v3.30.14 bounce + Upgrade Luck regression checks passed');
