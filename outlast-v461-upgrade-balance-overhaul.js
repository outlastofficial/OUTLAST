/* OUTLAST v4.6.2 — Upgrade Balance Overhaul
   Keeps rarity labels/multipliers intact while applying a softer effect curve and run-stat safety caps.
   No account, save, leaderboard, login, or server data is reset. */
(function () {
  'use strict';
  if (window.__OUTLAST_UPGRADE_BALANCE_462) return;

  const VERSION = '4.6.2';
  const TIERS = ['Common','Uncommon','Rare','Epic','Legendary','Mythic','Divine','Celestial','Transcendent','Eternal','Omega'];
  // Rarity labels still use the established 1× / 1.15× / ... / 8× ladder.
  // Actual repeated stat bonuses use diminishing power so top rarities are exciting without breaking runs.
  const EFFECT_SCALE = {
    Common:1, Uncommon:1.1, Rare:1.2, Epic:1.35, Legendary:1.5,
    Mythic:1.7, Divine:2, Celestial:2.2, Transcendent:2.4, Eternal:2.6, Omega:2.8
  };
  const DISCRETE = /\b(Breach|Volley)\b/i;
  const CAPS = {
    crit:0.75, regen:8, shield:8, multiShot:12, pierce:10,
    xpBonus:3, coinMult:3, bossMult:3, ultDamage:3, healMult:2.5,
    projectileSpeed:3, armorPierce:0.75, upgradeLuck:100, lootLuck:100, treasureLuck:100
  };
  const n = v => Number.isFinite(Number(v)) ? Number(v) : 0;
  const rarityOf = (name) => {
    const map = window.OUTLAST_UPGRADE_RARITY_BY_NAME || {};
    if (map[name] && EFFECT_SCALE[map[name]]) return map[name];
    const match = String(name || '').match(/^(Common|Uncommon|Rare|Epic|Legendary|Mythic|Divine|Celestial|Transcendent|Eternal|Omega)\b/i);
    return match ? TIERS.find(t => t.toLowerCase() === match[1].toLowerCase()) || 'Common' : 'Common';
  };
  // Convert the game's real rarity multiplier into a softer effect multiplier.
  // The original multiplier is supplied by makeChoices(); never infer rarity from the upgrade name.
  const MULTIPLIER_CURVE = [
    [1,1], [1.15,1.1], [1.35,1.2], [1.6,1.35], [1.9,1.5],
    [2.25,1.7], [4,2], [5,2.2], [6,2.4], [7,2.6], [8,2.8]
  ];
  function effective(name, mult) {
    const raw = Math.max(1, n(mult));
    let nearest = MULTIPLIER_CURVE[0];
    let distance = Infinity;
    MULTIPLIER_CURVE.forEach(pair => {
      const d = Math.abs(pair[0] - raw);
      if (d < distance) { distance = d; nearest = pair; }
    });
    if (distance <= 0.06) return nearest[1];
    return Math.min(2.8, Math.max(1, 1 + Math.log(raw) * 0.8));
  }
  function capRunStats() {
    let g = window.game;
    try { if (typeof game !== 'undefined' && game) g = game; } catch (_) {}
    const p = g && g.player;
    if (!p) return;
    Object.keys(CAPS).forEach(k => {
      if (Number.isFinite(Number(p[k]))) p[k] = Math.max(k === 'crit' || k === 'armorPierce' ? 0 : 0, Math.min(CAPS[k], Number(p[k])));
    });
    if (Number.isFinite(Number(p.speed)) && Number.isFinite(Number(p.speedCap))) p.speed = Math.min(p.speed, p.speedCap);
    // Keep fire rate above a safe floor; lower values mean faster firing in OUTLAST.
    if (Number.isFinite(Number(p.fireRate))) p.fireRate = Math.max(0.09, Number(p.fireRate));
  }
  function install() {
    const list = Array.isArray(window.tempUp) ? window.tempUp : (typeof tempUp !== 'undefined' && Array.isArray(tempUp) ? tempUp : null);
    if (!list) return false;
    let wrapped = 0;
    list.forEach(entry => {
      if (!Array.isArray(entry) || typeof entry[0] !== 'string') return;
      const name = entry[0];
      if (typeof entry[1] === 'function' && !entry[1].__outlastBalance461) {
        const original = entry[1];
        const desc = function (mult) { return original.call(this, effective(name, mult)); };
        desc.__outlastBalance461 = true;
        desc.__original = original;
        entry[1] = desc;
        wrapped++;
      }
      if (typeof entry[2] === 'function' && !entry[2].__outlastBalance461) {
        const original = entry[2];
        const apply = function (mult) {
          const result = original.call(this, effective(name, mult));
          capRunStats();
          return result;
        };
        apply.__outlastBalance461 = true;
        apply.__original = original;
        entry[2] = apply;
        wrapped++;
      }
    });
    window.__OUTLAST_UPGRADE_BALANCE_462 = true;
    window.OUTLAST_UPGRADE_BALANCE_AUDIT_V462 = function () {
      const counts = {};
      TIERS.forEach(t => counts[t] = 0);
      const map = window.OUTLAST_UPGRADE_RARITY_BY_NAME || {};
      Object.keys(map).forEach(name => { if (counts[map[name]] !== undefined) counts[map[name]]++; });
      return {
        version: VERSION, installed: true, wrappedFunctions: wrapped,
        totalUpgradeEntries: list.length, mappedUpgradeNames: Object.keys(map).length,
        effectScale: Object.assign({}, EFFECT_SCALE),
        rarityLabelsPreserved: true, accountDataTouched: false, tierCounts: counts,
        statCaps: Object.assign({}, CAPS, {fireRateMin:0.09})
      };
    };
    if (Array.isArray(window.updates) && !window.updates.some(x => x && String(x[0]).includes('v4.6.2'))) {
      window.updates.unshift(['v4.6.2 — Upgrade Balance Overhaul', 'Balanced upgrade effects across all rarity tiers, softened repeated percentage bonuses, and added safety caps for runaway combat, healing, shield, and economy stats. Existing accounts and records are preserved.']);
    }
    const help = window.helpArticles;
    if (Array.isArray(help) && !help.some(x => x && x[0] === 'How are upgrades balanced in v4.6.2?')) {
      help.unshift(['How are upgrades balanced in v4.6.2?', 'Upgrades & Luck', 'Rarity labels retain the established multiplier ladder, while repeated stat bonuses use diminishing effect scaling. Critical chance, regeneration, shield duration, projectile count, pierce, XP, coins, and other runaway stats have safety caps. Existing player accounts, progress, and leaderboard records are preserved.']);
    }
    return true;
  }
  function boot() {
    if (install()) return;
    // A few legacy scripts populate the upgrade list late; retry briefly without changing saved data.
    [0, 100, 350, 900, 1800].forEach(ms => setTimeout(install, ms));
  }
  window.OUTLAST_BUILD = VERSION;
  window.OUTLAST_VERSION = 'v' + VERSION;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true});
  else boot();
})();