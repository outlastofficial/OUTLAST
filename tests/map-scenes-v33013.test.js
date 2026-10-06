const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync(require('path').join(__dirname, '..', 'index.html'), 'utf8');

assert.match(html, /OUTLAST_MAP_SCENE_VERSION/);
assert.match(html, /3\.30\.13/);
assert.match(html, /OUTLAST_MAP_SCENE_THEMES/);

const requiredMaps = [
  'Forest','Desert','Snow','Lava','City','Hospital','Laboratory','Subway',
  'Prison','MilitaryBase','RuinedTown','Harbor','Bunker','Swamp','Skyscraper',
  'Wasteland','Seizure','Ribhouse'
];
for (const map of requiredMaps) {
  assert.match(html, new RegExp(map + '[^\\n]*OUTLAST_MAP_SCENE_THEMES', 's'));
}

console.log('OUTLAST v3.30.13 map-scene regression checks passed');
