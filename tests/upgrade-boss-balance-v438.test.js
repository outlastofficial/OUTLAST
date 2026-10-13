const fs = require('fs');
const assert = require('assert');
const path = require('path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const systems = fs.readFileSync(path.join(root, 'outlast-v3370-game-systems.js'), 'utf8');
const library = fs.readFileSync(path.join(root, 'outlast-v33015-upgrade-library.js'), 'utf8');

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

assert(/const modBossEvery=modifiers\.reduce\(\(a,v\)=>a\*\(Number\(v\.bossEveryMult\|\|v\.bossEvery\)\|\|1\),1\)/.test(html),
  'Both bossEveryMult and bossEvery run-modifier properties must affect boss timing');
assert(/bossEvery:\(cm\.bossEvery\|\|m\.bossEvery\|\|60\)\*modBossEvery/.test(html),
  'Run boss cadence must combine the selected mode/challenge with boss-speed modifiers');
assert(/BossGauntlet:\{desc:'Boss every 45 seconds, 2\.5x score\/rewards',enemy:1\.15,spawn:\.8,reward:2\.5,bossEvery:45\}/.test(html),
  'Boss Gauntlet description, reward multiplier, and interval must agree');
assert(/const bossTarget=save\.challengeMode==='BossGauntlet'\?Math\.max\(1,Number\(game\.stats\?\.bossEvery\)\|\|45\):Math\.max\(1,\(\(Number\(game\.bossCount\)\|\|0\)===0\?15:30\)\*\(\(Number\(game\.stats\?\.bossEvery\)\|\|60\)\/60\)\)/.test(html),
  'Boss scheduler must use mode cadence and preserve the 15/30 second default cadence');

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
console.log('OUTLAST boss/modifier/rarity regression checks passed');
