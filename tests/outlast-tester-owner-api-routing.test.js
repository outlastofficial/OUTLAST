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
  assert.match(html, /outlast-v430-owner-control-center\.js/);
});

test('tester Owner Panel uses the tester server, never the tester static site', () => {
  const declaration = panel.match(/const apiBase=\(\)=>String\(location\.hostname\|\|''\)\.includes\('outlast-test'\)\?'[^']+':'[^']+';/);
  assert.ok(declaration, 'Owner API resolver is present');
  const fn = vm.runInNewContext(declaration[0].replace('const apiBase=', ''), {
    location: { hostname: 'outlast-test.onrender.com' }
  });
  assert.equal(fn(), 'https://outlast-test-server.onrender.com');
});

test('production Owner Panel keeps its production server route', () => {
  const declaration = panel.match(/const apiBase=\(\)=>String\(location\.hostname\|\|''\)\.includes\('outlast-test'\)\?'[^']+':'[^']+';/);
  assert.ok(declaration, 'Owner API resolver is present');
  const fn = vm.runInNewContext(declaration[0].replace('const apiBase=', ''), {
    location: { hostname: 'outlast-game.onrender.com' }
  });
  assert.equal(fn(), 'https://outlast-server.onrender.com');
});

const ai = fs.readFileSync(path.join(root, 'outlast-ai-assistant.js'), 'utf8');
const liveContent = fs.readFileSync(path.join(root, 'live-content-schedule.js'), 'utf8');
const e2e = fs.readFileSync(path.join(root, 'tests', 'live-content-ui.e2e.cjs'), 'utf8');

test('shared API resolver selects the isolated tester backend and production backend by host', () => {
  const declaration = html.match(/function outlastApiBaseForHost\(hostname\)\s*\{[\s\S]*?\n\}/);
  assert.ok(declaration, 'Shared backend resolver is present');
  const resolve = vm.runInNewContext(declaration[0] + ';outlastApiBaseForHost', {
    window: { location: { hostname: 'outlast-test.onrender.com' } }
  });
  assert.equal(resolve('outlast-test.onrender.com'), 'https://outlast-test-server.onrender.com');
  assert.equal(resolve('outlast-game.onrender.com'), 'https://outlast-server.onrender.com');
});

test('non-auth inline API clients use the shared host-aware backend resolver', () => {
  const leaderboard = html.match(/async function leaderboardFetch[\s\S]*?\n\}/);
  assert.ok(leaderboard, 'Leaderboard API client is present');
  assert.match(leaderboard[0], /outlastApiBaseForHost\(\)\+path/);
  assert.doesNotMatch(leaderboard[0], /https:\/\/outlast-server\.onrender\.com/);
  assert.match(html, /const OWNER_API=outlastApiBaseForHost\(\);/);
  assert.match(html, /const OUTLAST_HTTP_SERVER=outlastApiBaseForHost\(\);/);
  assert.match(html, /const API_BASE=outlastApiBaseForHost\(\);/);
});

test('AI assistant selects the backend matching the current site instead of always using tester', () => {
  assert.match(ai, /const API=String\(window\.location&&window\.location\.hostname\|\|''\)\.toLowerCase\(\)\.indexOf\('outlast-test'\)!==-1\?'https:\/\/outlast-test-server\.onrender\.com':'https:\/\/outlast-server\.onrender\.com'/);
});

test('live-content API routing remains host-aware for production and tester', () => {
  assert.match(liveContent, /https:\/\/outlast-test-server\.onrender\.com\/api\/live-content/);
  assert.match(liveContent, /https:\/\/outlast-server\.onrender\.com\/api\/live-content/);
});

test('tester browser E2E blocks every production backend request before login setup', () => {
  const guard = e2e.indexOf("page.route('https://outlast-server.onrender.com/**'");
  const navigation = e2e.indexOf('page.goto(baseUrl');
  assert.ok(guard >= 0, 'Production backend requests are blocked in the tester browser context');
  assert.ok(navigation >= 0 && guard < navigation, 'The production API guard is installed before the tester page loads');
});

test('tester browser E2E fails if the tested flow attempts a production backend request', () => {
  assert.match(
    e2e,
    /assert\.equal\(\s*blockedProductionRequests\.length,\s*0,/,
    'Blocked production requests must fail the tester E2E instead of being silently logged'
  );
});

test('tester live-content E2E passes timeout options in the Playwright options slot', () => {
  const calls = e2e.match(/page\.waitForFunction\(/g) || [];
  const optionSlots = e2e.match(/\}, null, \{ timeout: \d+ \}\);/g) || [];
  assert.equal(calls.length, 3, 'All three browser waits remain covered');
  assert.equal(optionSlots.length, 3, 'Every wait uses the third options argument instead of a page-function argument');
});
