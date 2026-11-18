import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

function extractFunction(source, name) {
  const marker = 'function ' + name + '(';
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, 'Missing function: ' + name);
  const open = source.indexOf('{', start);
  assert.notEqual(open, -1, 'Missing function body: ' + name);

  let depth = 0;
  let quote = '';
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = open; i < source.length; i += 1) {
    const ch = source[i];
    const next = source[i + 1];

    if (lineComment) {
      if (ch === '\n') lineComment = false;
      continue;
    }
    if (blockComment) {
      if (ch === '*' && next === '/') {
        blockComment = false;
        i += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) quote = '';
      continue;
    }
    if (ch === '/' && next === '/') {
      lineComment = true;
      i += 1;
      continue;
    }
    if (ch === '/' && next === '*') {
      blockComment = true;
      i += 1;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === String.fromCharCode(96)) {
      quote = ch;
      continue;
    }
    if (ch === '{') depth += 1;
    if (ch === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  assert.fail('Unclosed function body: ' + name);
}

function damageHarness(options = {}) {
  const player = {
    hp: 100,
    max: 100,
    shield: 0,
    damageTakenMult: 1,
    emergencyShieldChance: 0,
    reviveChance: 0
  };
  const sandbox = {
    game: { player, running: true, time: options.time ?? 0, oneHitWonder: false },
    save: { mode: 'QA' },
    window: null,
    coopLaunchActive: options.coop ?? true,
    outlastOmegaShieldBlock: () => false,
    ring: () => {},
    burst: () => {},
    toast: () => {},
    Math: Object.assign(Object.create(Math), { random: () => 1 })
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  const fn = extractFunction(html, 'outlastTakePlayerDamage');
  vm.runInContext(fn + '; globalThis.__outlastDamage = outlastTakePlayerDamage;', sandbox);
  return { player, damage: sandbox.__outlastDamage, sandbox };
}

test('co-op launch protection prevents damage during the first ten seconds', () => {
  const h = damageHarness({ time: 9.99, coop: true });
  const result = h.damage(h.player, 25, 'qa');
  assert.equal(result, true);
  assert.equal(h.player.hp, 100);
});

test('co-op launch protection expires at ten seconds', () => {
  const h = damageHarness({ time: 10, coop: true });
  const result = h.damage(h.player, 25, 'qa');
  assert.equal(result, false);
  assert.equal(h.player.hp, 75);
});

test('solo runs do not receive the co-op-only launch protection', () => {
  const h = damageHarness({ time: 1, coop: false });
  h.damage(h.player, 20, 'qa');
  assert.equal(h.player.hp, 80);
});

test('normal shield still absorbs damage after the launch window', () => {
  const h = damageHarness({ time: 20, coop: true });
  h.player.shield = 2;
  const result = h.damage(h.player, 20, 'qa');
  assert.equal(result, true);
  assert.equal(h.player.hp, 100);
});

test('invalid damage values and god mode do not reduce health', () => {
  const h = damageHarness({ time: 20, coop: true });
  h.damage(h.player, -5, 'qa');
  h.player.godMode = true;
  h.damage(h.player, 30, 'qa');
  assert.equal(h.player.hp, 100);
});

test('map hazards use safe placement and a warning window before resolution', () => {
  const trigger = extractFunction(html, 'triggerMapEvent');
  assert.match(trigger, /outlastChooseSafeHazardPoint/);
  assert.match(trigger, /pendingMapHazards\.push/);
  assert.match(trigger, /warning:true/);
  assert.doesNotMatch(trigger, /outlastTakePlayerDamage/);
  assert.match(html, /function resolvePendingMapHazards\(/);
  assert.match(html, /resolvePendingMapHazards\(dt\)/);
});

test('authoritative version markers agree', () => {
  const release = html.match(/<meta\s+name=["']outlast-build["']\s+content=["']([^"']+)/i);
  const build = html.match(/<meta\s+name=["']build-version["']\s+content=["']([^"']+)/i);
  const title = html.match(/<title>\s*OUTLAST v([^<]+)<\/title>/i);
  assert.ok(release, 'Missing outlast-build metadata');
  assert.ok(build, 'Missing build-version metadata');
  assert.ok(title, 'Missing versioned page title');
  assert.equal(release[1], build[1]);
  assert.equal(release[1], title[1]);
});

test('all inline JavaScript blocks parse successfully', () => {
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)];
  let checked = 0;
  for (const match of scripts) {
    const attrs = match[1] || '';
    const body = match[2] || '';
    if (!body.trim() || /type=["']application\/json["']/i.test(attrs)) continue;
    checked += 1;
    assert.doesNotThrow(
      () => new vm.Script(body, { filename: 'index.html:inline-script-' + checked }),
      'Inline script ' + checked + ' must parse'
    );
  }
  assert.ok(checked > 0, 'Expected to parse at least one inline JavaScript block');
});

test('map hazards route every player through the central damage handler', () => {
  assert.match(html, /outlastTakePlayerDamage\(target,h\.damage,'map hazard'\)/);
  assert.doesNotMatch(html, /target\.hp\s*=\s*Math\.max\(0,\(Number\(target\.hp\)\|\|0\)-h\.damage\)/);
});

test('1v1 Arena projectiles route player damage through the central handler', () => {
  assert.match(html, /outlastTakePlayerDamage\(target,b\.dmg,'1v1 arena projectile'\)/);
  assert.doesNotMatch(html, /target\.hp\s*-\s*=\s*b\.dmg/);
});

test('Survival player contact routes both players through the central handler', () => {
  assert.match(html, /outlastTakePlayerDamage\(p2,p\.damage\*\.35\*dt,'survival player contact'\)/);
  assert.doesNotMatch(html, /p2\.hp\s*=\s*Math\.max\(0,p2\.hp-p\.damage\*\.35\*dt\)/);
});

test('damage audit records source, mode, amount, and before/after health', () => {
  const h = damageHarness({ time: 20, coop: true });
  h.damage(h.player, 25, 'qa source');
  const events = h.sandbox.__outlastDamageAudit;
  assert.equal(events.length, 1);
  assert.equal(events[0].source, 'qa source');
  assert.equal(events[0].mode, 'QA');
  assert.equal(events[0].amount, 25);
  assert.equal(events[0].before, 100);
  assert.equal(events[0].after, 75);
  assert.equal(events[0].prevented, false);
});

test('damage audit records protected hits without reducing health', () => {
  const h = damageHarness({ time: 1, coop: true });
  h.damage(h.player, 25, 'co-op start protection');
  const events = h.sandbox.__outlastDamageAudit;
  assert.equal(events.length, 1);
  assert.equal(events[0].source, 'co-op start protection');
  assert.equal(events[0].before, 100);
  assert.equal(events[0].after, 100);
  assert.equal(events[0].prevented, true);
});

test('damage audit keeps only the most recent 100 events', () => {
  const h = damageHarness({ time: 20, coop: true });
  for (let i = 0; i < 110; i += 1) h.damage(h.player, 0.01, 'event ' + i);
  const events = h.sandbox.__outlastDamageAudit;
  assert.equal(events.length, 100);
  assert.equal(events[0].source, 'event 10');
  assert.equal(events[99].source, 'event 109');
});
