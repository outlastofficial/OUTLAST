const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const source = fs.readFileSync('outlast-v33500-update-popup.js','utf8');
const context = {
  window: {},
  document: {
    readyState: 'complete',
    createElement: () => ({id:'',style:{},className:'',innerHTML:'',appendChild(){},addEventListener(){}}),
    body: {appendChild(){}},
    getElementById: () => null,
  },
  localStorage: {getItem(){return null},setItem(){}},
  setTimeout(fn){ fn(); return 1; },
  clearTimeout(){},
};
context.window = context;
vm.runInNewContext(source, context);

assert.equal(typeof context.OUTLAST_UPDATE_POPUP, 'object');
assert.equal(context.OUTLAST_UPDATE_POPUP.version, '3.35.0');
assert.equal(typeof context.OUTLAST_UPDATE_POPUP.show, 'function');
assert.equal(context.OUTLAST_UPDATE_POPUP.storageKey, 'outlastUpdatePopupV3350');
console.log('v3.35.0 update popup contract: PASS');
