const fs = require('fs');
const assert = require('assert');
const path = require('path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const systems = fs.readFileSync(path.join(root, 'outlast-v3370-game-systems.js'), 'utf8');
const library = fs.readFileSync(path.join(root, 'outlast-v33015-upgrade-library.js'), 'utf8');
const roller = fs.readFileSync(path.join(root, 'outlast-v438-upgrade-boss-balance.js'), 'utf8');

const spawnStart = html.indexOf('function spawnBoss');
const spawnEnd = html.indexOf('function normalizeWeaponForFire', spawnStart);
assert(spawnStart >= 0 && spawnEnd > spawnStart, 'boss spawn function must be found');
const spawnBoss = html.slice(spawnStart, spawnEnd);
assert(!/damage:\s*42\s*\*\s*game\.player\.bossMult/.test(spawnBoss),
  'Player boss-damage bonus must not increase the boss’s damage against the player');

assert(/if\(e\.boss\)\{dmg\*=Number\(p\.bossMult\)\|\|1;dmg\*=Math\.max\(0,Number\(game\.stats\?\.bossDamageTakenMult\)\|\|1\);\}/.test(html),
  'Boss Armor resistance must be consumed by the player-to-boss damage calculation');
assert(/bossDamageTakenMult:modifiers\.reduce\(\(a,v\)=>a\*\(v\.bossDamageTakenMult\|\|1\),1\)/.test(html),
  'Boss Armor modifier must be copied into live run combat stats');
assert(/BossArmor:\{desc:'Bosses take longer to defeat\.[^}]*bossDamageTakenMult:\.70/.test(systems),
  'Boss Armor must retain its documented resistance value');

assert(/modBossEvery=modifiers\.reduce\(\(a,v\)=>a\*\(Number\(v\.bossEveryMult\|\|v\.bossEvery\)\|\|1\),1\)/.test(html),
  'Both bossEveryMult and bossEvery run-modifier properties must affect boss timing');
assert(/bossEvery:\(cm\.bossEvery\|\|m\.bossEvery\|\|60\)\*modBossEvery/.test(html),
  'Run boss cadence must combine the selected mode/challenge with boss-speed modifiers');
assert(/BossGauntlet:\{desc:'Boss every 45 seconds, 2\.5x score\/rewards',enemy:1\.15,spawn:\.8,reward:2\.5,bossEvery:45\}/.test(html),
  'Boss Gauntlet description, reward multiplier, and interval must agree');
assert(/function outlastBossTargetSeconds\(\)\{const base=Math\.max\(1,Number\(game\?\.stats\?\.bossEvery\)\|\|60\);if\(save\?\.challengeMode==='BossGauntlet'\)return base;return \(Number\(game\?\.bossCount\)\|\|0\)===0\?Math\.min\(15,base\):Math\.max\(1,base\/2\);\}/.test(html),
  'Boss scheduler must use mode timing, preserve early spawns, and apply modifier cadence');
assert((html.match(/const bossTarget=outlastBossTargetSeconds\(\);/g)||[]).length===2,
  'The actual scheduler and displayed boss timer must share the same interval function');

const expected = { Common: 1, Uncommon: 1.15, Rare: 1.35, Epic: 1.6, Legendary: 1.9,
  Mythic: 2.25, Divine: 4, Celestial: 4.8, Transcendent: 5.6, Eternal: 6.8, Omega: 8 };
for (const [label, source] of [['systems', systems], ['library', library]]) {
  for (const [tier, mult] of Object.entries(expected)) {
    assert(new RegExp(tier + ':' + mult.toString().replace('.', '\\.') + '(?:,|})').test(source),
      label + ' must use the approved ' + tier + ' multiplier ' + mult);
  }
}
assert(systems.includes('window.makeChoices=authoritativeUpgradeChoice37'),
  'The checked rarity authority must remain the final active choice generator');
assert(html.includes('outlast-v438-upgrade-boss-balance.js?v=4.3.9') &&
  html.indexOf('outlast-v438-upgrade-boss-balance.js?v=4.3.9') > html.indexOf('outlast-v435-upgrade-gear-redesign.js?v=4.3.6'),
  'Balance patch must load after older UI and rarity patches');
new (require('vm').Script)(roller, { filename: 'outlast-v438-upgrade-boss-balance.js' });
const win = { addEventListener: () => {} };
const document = { readyState: 'loading', addEventListener: () => {}, querySelector: () => null, querySelectorAll: () => [] };
require('vm').runInNewContext(roller, { window: win, document, setTimeout: () => {}, game: { player: { upgradeLuck: 0 } } });
const tiers = Object.keys(win.OUTLAST_RARITY_AUDIT_SCALE);
assert.strictEqual(tiers.length, 11, 'all eleven tiers must be supported by the live roller');
const base = win.OUTLAST_RARITY_AUDIT_WEIGHTS;
assert(tiers.every(t => Number(base[t]) > 0), 'all eleven tiers must have a non-zero roll weight');
const total = tiers.reduce((n, t) => n + base[t], 0);
let before = 0;
for (const tier of tiers) {
  const midpoint = (before + base[tier] / 2) / total;
  assert.strictEqual(win.OUTLAST_ROLL_UPGRADE_RARITY_AT(midpoint, 0), tier, tier + ' must be reachable by a real roll interval');
  before += base[tier];
}
const basePremium = tiers.slice(6).reduce((n, t) => n + base[t], 0) / total;
const luckWeights = win.OUTLAST_RARITY_AUDIT_WEIGHTS_FOR_LUCK(90);
const luckTotal = Object.values(luckWeights).reduce((n, v) => n + v, 0);
const luckPremium = tiers.slice(6).reduce((n, t) => n + luckWeights[t], 0) / luckTotal;
assert(luckPremium > basePremium, 'Upgrade Luck must improve combined Divine-through-Omega odds');
console.log('OUTLAST boss/modifier and eleven-tier rarity regression checks passed');
