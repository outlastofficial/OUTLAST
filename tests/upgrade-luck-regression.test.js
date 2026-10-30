const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(require('node:path').join(__dirname, '..', 'outlast-upgrade-luck-authority.js'), 'utf8');

function load(luck = 0) {
  const window = { game: { player: { upgradeLuck: luck } } };
  const context = { window, Math, console };
  vm.runInNewContext(source, context, { filename: 'outlast-upgrade-luck-authority.js' });
  return window;
}

test('all eleven rarity tiers remain reachable, including Omega', () => {
  const w = load(100);
  const tiers = new Set();
  for (let i = 0; i < 50000; i++) {
    const x = (i * 0.6180339887498949) % 1;
    tiers.add(w.OUTLAST_ROLL_UPGRADE_RARITY(100, x));
  }
  for (const tier of ['Common','Uncommon','Rare','Epic','Legendary','Mythic','Divine','Celestial','Transcendent','Eternal','Omega']) {
    assert.ok(tiers.has(tier), tier + ' should be reachable');
  }
});

test('higher Upgrade Luck increases the weighted chance of Rare-or-better choices', () => {
  const w = load(0);
  function sample(luck) {
    let rareOrBetter = 0;
    const count = 100000;
    for (let i = 0; i < count; i++) {
      const x = (i * 0.7548776662466927) % 1;
      const tier = w.OUTLAST_ROLL_UPGRADE_RARITY(luck, x);
      if (['Rare','Epic','Legendary','Mythic','Divine','Celestial','Transcendent','Eternal','Omega'].includes(tier)) rareOrBetter++;
    }
    return rareOrBetter / count;
  }
  assert.ok(sample(100) > sample(0), '100 Upgrade Luck must improve Rare-or-better odds');
});

test('the live game roller reads the current player Upgrade Luck value', () => {
  const w = load(0);
  assert.equal(typeof w.rollUpgradeRarity, 'function');
  assert.equal(w.OUTLAST_ROLL_UPGRADE_RARITY(0, 0.999999), 'Omega' === w.OUTLAST_ROLL_UPGRADE_RARITY(100, 0.999999) ? 'Omega' : w.OUTLAST_ROLL_UPGRADE_RARITY(100, 0.999999));
  w.game.player.upgradeLuck = 100;
  const high = [];
  for (let i = 0; i < 20000; i++) high.push(w.rollUpgradeRarity());
  assert.ok(high.some(t => ['Divine','Celestial','Transcendent','Eternal','Omega'].includes(t)));
});
