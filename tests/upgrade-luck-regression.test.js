const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'outlast-upgrade-luck-authority.js'), 'utf8');

function load(luck = 0, random = () => 0.6) {
  const window = { game: { player: { upgradeLuck: luck } } };
  const math = Object.create(Math);
  math.random = random;
  vm.runInNewContext(source, { window, Math: math, console }, { filename: 'outlast-upgrade-luck-authority.js' });
  return window;
}

test('all eleven rarity tiers remain reachable, including Omega', () => {
  const w = load(100);
  const tiers = new Set();
  for (let i = 0; i < 50000; i++) tiers.add(w.OUTLAST_ROLL_UPGRADE_RARITY(100, (i * 0.6180339887498949) % 1));
  for (const tier of ['Common','Uncommon','Rare','Epic','Legendary','Mythic','Divine','Celestial','Transcendent','Eternal','Omega']) {
    assert.ok(tiers.has(tier), tier + ' should be reachable');
  }
});

test('higher Upgrade Luck increases Rare-or-better probability', () => {
  const w = load(0);
  function sample(luck) {
    let rareOrBetter = 0;
    const count = 100000;
    for (let i = 0; i < count; i++) {
      const tier = w.OUTLAST_ROLL_UPGRADE_RARITY(luck, (i * 0.7548776662466927) % 1);
      if (['Rare','Epic','Legendary','Mythic','Divine','Celestial','Transcendent','Eternal','Omega'].includes(tier)) rareOrBetter++;
    }
    return rareOrBetter / count;
  }
  assert.ok(sample(100) > sample(0), '100 Upgrade Luck must improve Rare-or-better odds');
});

test('the live roller reads the current player Upgrade Luck value on every roll', () => {
  const w = load(0, () => 0.6);
  const low = w.rollUpgradeRarity();
  w.game.player.upgradeLuck = 100;
  const high = w.rollUpgradeRarity();
  assert.notEqual(low, high);
  assert.equal(low, 'Uncommon');
  assert.equal(high, 'Epic');
});
