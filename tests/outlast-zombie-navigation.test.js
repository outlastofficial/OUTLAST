const test=require('node:test');const assert=require('node:assert/strict');const nav=require('../outlast-zombie-navigation.js');
test('caches failed paths as well as successful paths',()=>{const cache={map:'forest',goal:'4,5',path:[],at:10};assert.equal(nav.isCacheFresh(cache,'forest','4,5',10.2,.45),true);});
test('invalidates navigation cache when map, goal, or age changes',()=>{const cache={map:'forest',goal:'4,5',path:[],at:10};assert.equal(nav.isCacheFresh(cache,'desert','4,5',10.2),false);assert.equal(nav.isCacheFresh(cache,'forest','5,5',10.2),false);assert.equal(nav.isCacheFresh(cache,'forest','4,5',10.6),false);});
test('detects a stuck enemy after sustained blocked movement',()=>{const e={};assert.equal(nav.trackStuck(e,10,10,10,10,.2,8),false);assert.equal(nav.trackStuck(e,10,10,10,10,.3,8),true);assert.equal(e.__zStuckTime,.5);});
test('resets stuck timer when enemy makes progress',()=>{const e={__zStuckTime:.7};assert.equal(nav.trackStuck(e,10,10,12,10,.1,8),false);assert.equal(e.__zStuckTime,0);});
test('does not call an enemy stuck when intended movement is negligible',()=>{const e={__zStuckTime:.3};assert.equal(nav.trackStuck(e,10,10,10,10,1,.1),false);assert.equal(e.__zStuckTime,0);});
test('chooses a safe recovery step around an obstacle',()=>{const blocked=(x,y)=>x>14&&x<26&&y<25;const step=nav.pickRecoveryStep(10,10,40,10,8,4,blocked);assert.ok(step);assert.ok(Math.abs(step.y-10)>1);assert.equal(blocked(step.x,10),false);assert.equal(blocked(step.x,step.y),false);});
test('returns no recovery step when all movement directions are blocked',()=>{const step=nav.pickRecoveryStep(10,10,40,10,8,4,()=>true);assert.equal(step,null);});
test('does not return a step when movement distance is too small',()=>{assert.equal(nav.pickRecoveryStep(10,10,40,10,.1,4,()=>false),null);});

test('maps special zombie types to behavior matching their new kind',()=>{assert.equal(nav.behaviorForKind('Charger'),'Rammer');assert.equal(nav.behaviorForKind('Siren'),'Support');assert.equal(nav.behaviorForKind('Mimic'),'Ambusher');assert.equal(nav.behaviorForKind('Warden'),'Chaser');assert.equal(nav.behaviorForKind('normal'),'Hunter');});
