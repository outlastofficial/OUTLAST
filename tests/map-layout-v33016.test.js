const fs=require('fs'),assert=require('assert'),path=require('path');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const scene=fs.readFileSync(path.join(root,'outlast-v33013-map-scenes.js'),'utf8');
// RED: current build has no full-arena layout module yet.
assert.match(html,/outlast-v33016-map-layout\.js\?v=3\.30\.16/,'full-arena map layout module is missing');
assert.match(scene,/sceneForest/);
console.log('v3.30.16 map distribution regression test passed');
