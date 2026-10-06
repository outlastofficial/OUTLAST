const fs = require('fs');
const assert = require('assert');
const path = require('path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const scene = fs.readFileSync(path.join(root, 'outlast-v33013-map-scenes.js'), 'utf8');

assert.match(html, /outlast-v33013-map-scenes\.js\?v=3\.30\.13/);
assert.match(scene, /OUTLAST_MAP_SCENE_VERSION=['"]3\.30\.13['"]/);
assert.match(scene, /OUTLAST_MAP_SCENE_THEMES/);
assert.match(scene, /Hospital:\s*\{[^}]*bg:'#101821'/s);

const requiredMaps = [
  'Forest','Desert','Snow','Lava','City','Hospital','Laboratory','Subway',
  'Prison','MilitaryBase','RuinedTown','Harbor','Bunker','Swamp','Skyscraper',
  'Wasteland','Seizure','Ribhouse'
];
for (const map of requiredMaps) {
  assert.match(scene, new RegExp('^\\s*' + map.replace(/[.*+?^$\\{\\}()|[\\]\\]/g,'\\$&') + ':', 'm'));
}

assert(!/Hospital:\s*\{[^}]*bg:'#fff/i.test(scene));
console.log('OUTLAST v3.30.13 map-scene regression checks passed');
