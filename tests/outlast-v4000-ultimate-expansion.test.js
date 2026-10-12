const fs = require('fs');
const assert = require('assert');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'outlast-v4000-ultimate-expansion.js'), 'utf8');
assert(source.includes("const VERSION='4.0.0'"), 'major expansion exposes the 4.0.0 release');
assert(source.includes('function awardBossDefeat'), 'boss trophy awards are implemented');
assert(source.includes('outlastV4000BossTrophiesBtn'), 'Boss Trophies is reachable from Progress');
assert(source.includes('outlastSeenUpdateVersion'), 'the update notice is remembered per version');

const nodes = Object.create(null);
const storage = Object.create(null);
const document = {
  title: 'OUTLAST',
  readyState: 'complete',
  querySelector: () => null,
  querySelectorAll: () => [],
  getElementById: id => nodes[id] || null,
  createElement: tag => ({
    tagName: tag.toUpperCase(), id: '', className: '', innerHTML: '',
    style: {}, children: [],
    addEventListener() {},
    appendChild(node) { this.children.push(node); },
    querySelector() { return null; }
  }),
  body: { appendChild(node) { if (node.id) nodes[node.id] = node; } },
  addEventListener() {}
};
const game = { enemies: [], running: true, paused: false, player: { hp: 100 }, score: 0 };
const save = { coins: 0, stats: { bosses: 0 } };
let saves = 0;
const sandbox = {
  console, Date, Math, Number, String, Object, Array, Set, JSON,
  document, game, save, run: { kills: 0, bosses: 0 },
  localStorage: {
    getItem(key) { return Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null; },
    setItem(key, value) { storage[key] = String(value); }
  },
  persist() { saves++; },
  toast(message) { sandbox.lastToast = String(message); },
  killEnemy(target) {
    const i = typeof target === 'number' ? target : game.enemies.indexOf(target);
    const enemy = game.enemies[i];
    if (!enemy || enemy.__dead) return;
    enemy.__dead = true;
    game.enemies.splice(i, 1);
  },
  setTimeout(fn) { if (typeof fn === 'function') fn(); return 0; },
  clearTimeout() {},
  helpArticles: [],
  updates: []
};
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(source, sandbox, { timeout: 1500 });

assert.strictEqual(sandbox.OUTLAST_ULTIMATE_EXPANSION_AUDIT().version, '4.0.0');
assert.strictEqual(document.title, 'OUTLAST v4.0.0');
assert(nodes.outlastV4000UpdatePopup, 'the new release popup is created');
assert.strictEqual(nodes.outlastV4000UpdatePopup.style.display, 'flex', 'first visit sees the mandatory release notice');
assert(sandbox.helpArticles.some(row => row[0] === 'How do Boss Trophies work?'), 'How-To has the new boss trophy guide');

function killBoss() {
  const boss = { boss: true, hp: 0, x: 100, y: 100 };
  game.enemies.push(boss);
  sandbox.killEnemy(game.enemies.length - 1);
}
killBoss();
assert.strictEqual(save.bossTrophies, 1, 'boss defeat increments persistent trophy progress');
assert.strictEqual(save.coins, 250, 'first boss milestone awards its coins once');
assert.strictEqual(save.bossTrophyRewards['1'], true, 'first milestone is marked claimed');
for (let i = 0; i < 4; i++) killBoss();
assert.strictEqual(save.bossTrophies, 5, 'trophy progress counts five boss defeats');
assert.strictEqual(save.coins, 1250, 'five-boss milestone awards exactly 1000 more coins');
for (let i = 0; i < 5; i++) killBoss();
assert.strictEqual(save.bossTrophies, 10, 'trophy progress counts ten boss defeats');
assert.strictEqual(save.coins, 3750, 'ten-boss milestone awards exactly 2500 more coins');
const afterMilestones = save.coins;
const minion = { boss: false, hp: 0 };
game.enemies.push(minion);
sandbox.killEnemy(game.enemies.length - 1);
assert.strictEqual(save.bossTrophies, 10, 'ordinary enemies do not increment boss trophies');
assert.strictEqual(save.coins, afterMilestones, 'ordinary kills do not claim boss rewards');
assert(saves >= 10, 'boss trophy progress is persisted as bosses are defeated');

console.log('OUTLAST v4.0.0 boss trophy and release gate tests passed');
