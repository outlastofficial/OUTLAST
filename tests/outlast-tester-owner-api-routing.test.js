'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const panel = fs.readFileSync(path.join(root, 'outlast-v430-owner-control-center.js'), 'utf8');

test('Owner Control Center script is included by the game page', () => {
  assert.match(html, /outlast-v430-owner-control-center\\.js/);
});

test('tester Owner Panel uses the tester server, never the tester static site', () => {
  const declaration = panel.match(/const apiBase=\\(\\)=>String\\(location\\.hostname\\|\\|''\\)\\.includes\\('outlast-test'\\)\\?'[^']+':'[^']+';/);
  assert.ok(declaration, 'Owner API resolver is present');
  const fn = vm.runInNewContext(declaration[0].replace('const apiBase=', ''), {
    location: { hostname: 'outlast-test.onrender.com' }
  });
  assert.equal(fn(), 'https://outlast-test-server.onrender.com');
});

test('production Owner Panel keeps its production server route', () => {
  const declaration = panel.match(/const apiBase=\\(\\)=>String\\(location\\.hostname\\|\\|''\\)\\.includes\\('outlast-test'\\)\\?'[^']+':'[^']+';/);
  assert.ok(declaration, 'Owner API resolver is present');
  const fn = vm.runInNewContext(declaration[0].replace('const apiBase=', ''), {
    location: { hostname: 'outlast-game.onrender.com' }
  });
  assert.equal(fn(), 'https://outlast-server.onrender.com');
});
