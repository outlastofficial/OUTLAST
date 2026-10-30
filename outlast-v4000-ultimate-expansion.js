(function () {
  'use strict';

  const VERSION = '4.0.0';
  const STORAGE_KEY = 'outlastSeenUpdateVersion';
  const MILESTONES = [
    { kills: 1, coins: 250, title: 'First Trophy' },
    { kills: 5, coins: 1000, title: 'Boss Breaker' },
    { kills: 10, coins: 2500, title: 'Boss Hunter' },
    { kills: 25, coins: 7500, title: 'Apex Survivor' },
    { kills: 50, coins: 15000, title: 'Nightmare Legend' }
  ];

  let killHookInstalled = false;
  let trophyCardInstalled = false;
  let updateLogHookInstalled = false;
  let popupInstalled = false;
  let trophyCardRetries = 0;

  function currentSave() {
    try { if (typeof save !== 'undefined' && save) return save; } catch (_) {}
    return window.save || null;
  }

  function currentGame() {
    try { if (typeof game !== 'undefined' && game) return game; } catch (_) {}
    return window.game || null;
  }

  function safePersist() {
    try { if (typeof persist === 'function') persist(); } catch (error) {
      window.OUTLAST_V4000_LAST_ERROR = String(error && error.message || error);
    }
  }

  function safeToast(message) {
    try { if (typeof toast === 'function') toast(message); } catch (_) {}
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function ensureTrophySave(s) {
    if (!s) return null;
    s.bossTrophies = Math.max(0, Math.floor(Number(s.bossTrophies) || 0));
    if (!s.bossTrophyRewards || typeof s.bossTrophyRewards !== 'object' || Array.isArray(s.bossTrophyRewards)) {
      s.bossTrophyRewards = {};
    }
    return s;
  }

  function awardBossDefeat(enemy) {
    const s = ensureTrophySave(currentSave());
    if (!s || !enemy || enemy.__outlastV4000TrophyRecorded) return;
    enemy.__outlastV4000TrophyRecorded = true;
    s.bossTrophies += 1;

    let rewardTotal = 0;
    const newlyUnlocked = [];
    for (const milestone of MILESTONES) {
      const key = String(milestone.kills);
      if (s.bossTrophies >= milestone.kills && s.bossTrophyRewards[key] !== true) {
        s.bossTrophyRewards[key] = true;
        s.coins = Math.max(0, Number(s.coins) || 0) + milestone.coins;
        rewardTotal += milestone.coins;
        newlyUnlocked.push(milestone);
      }
    }

    safePersist();
    if (newlyUnlocked.length) {
      const titles = newlyUnlocked.map(m => m.title).join(', ');
      safeToast('🏆 BOSS TROPHY UNLOCKED: ' + titles + ' • +' + rewardTotal.toLocaleString() + ' COINS');
    }
  }

  function wrapKillEnemy() {
    if (killHookInstalled) return;
    let original = null;
    try { original = window.killEnemy || (typeof killEnemy === 'function' ? killEnemy : null); } catch (_) {}
    if (typeof original !== 'function' || original.__outlastV4000BossTrophyHook) return;

    const wrapped = function (target) {
      const g = currentGame();
      const enemies = g && Array.isArray(g.enemies) ? g.enemies : null;
      const enemy = enemies ? (typeof target === 'number' ? enemies[target] : target) : null;
      const wasLiveBoss = !!(enemy && enemy.boss && enemies.includes(enemy) && !enemy.__dead);
      const result = original.apply(this, arguments);
      if (wasLiveBoss && (enemy.__dead || !enemies.includes(enemy))) awardBossDefeat(enemy);
      return result;
    };
    wrapped.__outlastV4000BossTrophyHook = true;
    window.killEnemy = wrapped;
    try { killEnemy = wrapped; } catch (_) {}
    killHookInstalled = true;
  }

  function trophyPanelHtml() {
    const s = ensureTrophySave(currentSave()) || { bossTrophies: 0, bossTrophyRewards: {} };
    const cards = MILESTONES.map(m => {
      const claimed = s.bossTrophyRewards[String(m.kills)] === true;
      const progress = Math.min(m.kills, s.bossTrophies);
      const percent = Math.max(0, Math.min(100, progress / m.kills * 100));
      return '<div class="option ' + (claimed ? 'selected' : '') + '">' +
        '<b>' + (claimed ? '✓ ' : '') + escapeHtml(m.title) + '</b>' +
        '<div class="small">Defeat ' + m.kills + ' bosses • Reward: 🪙 ' + m.coins.toLocaleString() + ' coins</div>' +
        '<div class="small">Progress: ' + progress + '/' + m.kills + ' • ' + (claimed ? 'Reward claimed' : 'Reward unlocks automatically') + '</div>' +
        '<div style="height:6px;border-radius:99px;background:#1b2630;overflow:hidden;margin-top:7px"><div style="height:100%;width:' + percent + '%;background:#e9bb54"></div></div>' +
        '</div>';
    }).join('');
    return '<div class="option"><b>Bosses defeated: ' + s.bossTrophies + '</b>' +
      '<div class="small">Boss trophies are saved to this player account. Milestone rewards are granted once and never reset between runs.</div></div>' +
      '<div class="grid">' + cards + '</div>';
  }

  function openTrophyPanel() {
    const html = trophyPanelHtml();
    try {
      if (typeof openSub === 'function') {
        openSub('🏆 Boss Trophies', html);
        return;
      }
    } catch (_) {}
    const panel = document.getElementById('subPanel');
    if (panel) {
      panel.innerHTML = '<h2>🏆 Boss Trophies</h2>' + html;
      panel.style.display = 'block';
    }
  }

  function installTrophyCard() {
    if (trophyCardInstalled) return true;
    const existing = document.getElementById('outlastV4000BossTrophiesBtn');
    if (existing) {
      existing.addEventListener('click', openTrophyPanel);
      trophyCardInstalled = true;
      return true;
    }
    const progress = document.querySelector('[data-page-content="progress"]');
    let cards = progress && progress.querySelector('.menu-cards');
    if (!cards && progress) {
      // Some menu variants render the Progress heading but omit its original card grid.
      // Create the grid inside the existing Progress page instead of dropping the feature.
      cards = document.createElement('div');
      cards.className = 'menu-cards';
      progress.appendChild(cards);
    }
    if (!cards) {
      const statsButton = document.getElementById('statsBtn');
      if (statsButton && typeof statsButton.closest === 'function') cards = statsButton.closest('.menu-cards');
    }
    if (!cards) {
      const candidates = Array.from(document.querySelectorAll('.menu-cards'));
      cards = candidates.find(node => node.querySelector('#statsBtn')) || null;
    }
    if (!cards) {
      window.OUTLAST_V4000_TROPHY_CARD_ERROR = 'Progress card container not ready';
      return false;
    }
    const card = document.createElement('div');
    card.className = 'menu-card';
    card.innerHTML = '<h3>Boss Trophies</h3><button class="menu-btn" id="outlastV4000BossTrophiesBtn" type="button">🏆 View Boss Trophies</button>';
    cards.appendChild(card);
    const button = card.querySelector('#outlastV4000BossTrophiesBtn') || document.getElementById('outlastV4000BossTrophiesBtn');
    if (button) button.addEventListener('click', openTrophyPanel);
    trophyCardInstalled = !!button;
    return trophyCardInstalled;
  }

  function retryTrophyCard() {
    if (trophyCardInstalled) return;
    if (installTrophyCard()) return;
    trophyCardRetries += 1;
    if (trophyCardRetries <= 40) setTimeout(retryTrophyCard, 250);
  }

  function removeLegacyProgressSystems() {
    // The v3.36 installer can run on DOMContentLoaded after v3.37 has built its newer deck.
    // Remove only the obsolete v3.36 group wrapper, leaving the current v3.37 deck and v4 Trophy card intact.
    const page = document.querySelector('[data-page-content="progress"]');
    const legacy = (page && page.querySelector('#progressSystems36')) || document.getElementById('progressSystems36');
    if (legacy && legacy.parentNode) legacy.parentNode.removeChild(legacy);
    if (page) page.querySelectorAll('.progress-v3360-stack').forEach(node => {
      if (node.id === 'progressSystems36' && node.parentNode) node.parentNode.removeChild(node);
    });
    return !document.getElementById('progressSystems36');
  }

  function installVersionAndHelp() {
    window.OUTLAST_BUILD = VERSION;
    window.OUTLAST_VERSION = 'v' + VERSION;
    document.title = 'OUTLAST v' + VERSION;
    const meta = document.querySelector('meta[name="outlast-build"]');
    if (meta) meta.content = VERSION;
    const buildMeta = document.querySelector('meta[name="build-version"]');
    if (buildMeta) buildMeta.content = VERSION;
    document.querySelectorAll('[data-outlast-version]').forEach(el => { el.textContent = 'v' + VERSION; });
    document.querySelectorAll('.menu-chip').forEach(el => {
      if (/SURVIVOR HUB/i.test(String(el.textContent || ''))) el.textContent = 'v' + VERSION + ' • SURVIVOR HUB';
    });

    try {
      if (typeof helpArticles !== 'undefined' && Array.isArray(helpArticles)) {
        const entries = [
          ['How do Boss Trophies work?', 'Bosses & Progression', 'Every boss defeat adds to your lifetime Boss Trophies total. Milestone rewards unlock automatically at 1, 5, 10, 25, and 50 boss defeats. The trophy count and one-time coin rewards are saved to your existing player save.'],
          ['What is new in OUTLAST v4.0.0?', 'Updates & Features', 'Ultimate Expansion brings the current boss, combat, map, upgrade, rarity animation, weapon evolution, and progression systems together; adds lifetime Boss Trophies with one-time coin milestones; restores a current-version release notice; and keeps your existing login and saved progress.'],
          ['Where can I view Boss Trophies?', 'Bosses & Progression', 'Open Progress → Boss Trophies. The panel shows your lifetime boss defeats, milestone progress, and which one-time coin rewards have already been claimed.']
        ];
        for (let i = entries.length - 1; i >= 0; i--) {
          if (!helpArticles.some(row => row && row[0] === entries[i][0])) helpArticles.unshift(entries[i]);
        }
      }
    } catch (_) {}
  }

  function installUpdateLog() {
    if (updateLogHookInstalled) return;
    const button = document.getElementById('updatesBtn');
    let original = button && typeof button.onclick === 'function' ? button.onclick : null;
    if (!original) {
      try { if (typeof renderUpdates === 'function') original = renderUpdates; } catch (_) {}
    }
    if (typeof original !== 'function' || original.__outlastV4000UpdateLogHook) return;
    const wrapped = function () {
      const result = original.apply(this, arguments);
      try {
        const panel = document.getElementById('subPanel');
        if (panel && !panel.innerHTML.includes('OUTLAST: Ultimate Expansion')) {
          panel.innerHTML = '<div class="option" data-outlast-v4000-update-note="true"><b>v4.0.0 — OUTLAST: Ultimate Expansion</b>' +
            '<div class="small">Added lifetime Boss Trophies and one-time milestone coin rewards; consolidated the boss, combat, expanded-map, rarity-animation, upgrade, weapon-evolution, and progression expansion; refreshed the version marker, release popup, and How-To guide.</div></div>' +
            panel.innerHTML;
        }
      } catch (_) {}
      return result;
    };
    wrapped.__outlastV4000UpdateLogHook = true;
    if (button) button.onclick = wrapped;
    try { window.renderUpdates = wrapped; renderUpdates = wrapped; } catch (_) {}
    updateLogHookInstalled = true;
  }

  function installPopup() {
    if (popupInstalled || !document.body) return;
    if (!window.OUTLAST_MANDATORY_UPDATE_CHECK) window.OUTLAST_MANDATORY_UPDATE_CHECK = true;

    const oldPopup = document.getElementById('updatePopup');
    if (oldPopup) oldPopup.style.display = 'none';
    const oldMandatoryPopup = document.getElementById('outlastMandatoryUpdate');
    if (oldMandatoryPopup) oldMandatoryPopup.style.display = 'none';

    let modal = document.getElementById('outlastV4000UpdatePopup');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'outlastV4000UpdatePopup';
      if (typeof modal.setAttribute === 'function') {
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'outlastV4000UpdateTitle');
      }
      modal.style.cssText = 'position:fixed;inset:0;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(0,0,0,.82);z-index:2147483005;font-family:Arial,sans-serif;color:#f3f7fb;box-sizing:border-box;';
      modal.innerHTML = '<div style="width:min(720px,100%);max-height:90vh;overflow:auto;background:#101923;border:1px solid #41576b;border-radius:18px;padding:22px;box-shadow:0 24px 90px rgba(0,0,0,.65)">' +
        '<div style="display:flex;gap:12px;align-items:flex-start;justify-content:space-between"><div><div style="font-size:12px;letter-spacing:.12em;color:#9fb7ca;font-weight:800">MAJOR RELEASE</div><h2 id="outlastV4000UpdateTitle" style="margin:6px 0 10px;font-size:clamp(22px,4vw,32px)">OUTLAST v4.0.0 — Ultimate Expansion</h2></div>' +
        '<button id="outlastV4000Close" type="button" aria-label="Close update notice" style="font:700 20px Arial;background:#243240;color:#fff;border:1px solid #4d6274;border-radius:9px;padding:5px 12px;cursor:pointer">×</button></div>' +
        '<p style="line-height:1.55;color:#d8e2ea">A major expansion is here. Your existing account, login, and saved progress are preserved.</p>' +
        '<div style="display:grid;gap:9px;margin:16px 0">' +
        '<div style="padding:12px;border-radius:10px;background:#182633"><b>👹 Boss progression</b><div style="margin-top:4px;color:#c2d1dc">Boss Trophies, permanent milestone tracking, and one-time coin rewards at 1, 5, 10, 25, and 50 defeats.</div></div>' +
        '<div style="padding:12px;border-radius:10px;background:#182633"><b>⚡ Bigger builds</b><div style="margin-top:4px;color:#c2d1dc">400+ in-run upgrade choices, rarity-specific reveal animations, the permanent upgrade tree, Thorns, and a repaired Ultimate.</div></div>' +
        '<div style="padding:12px;border-radius:10px;background:#182633"><b>🌎 Maps and combat</b><div style="margin-top:4px;color:#c2d1dc">Expanded arenas, restored map selection, boss-spawn retries, and more room for each run to develop.</div></div>' +
        '<div style="padding:12px;border-radius:10px;background:#182633"><b>💬 Online and progression</b><div style="margin-top:4px;color:#c2d1dc">Updated Global Chat connection handling and username tags, plus the current release notes and How-To entries.</div></div></div>' +
        '<p style="margin:0 0 14px;color:#9fb7ca;font-size:12px">Tip: Progress → Boss Trophies tracks your lifetime boss milestones.</p>' +
        '<button id="outlastV4000GotIt" type="button" style="width:100%;font:800 15px Arial;background:#2b6cff;color:#fff;border:0;border-radius:10px;padding:13px;cursor:pointer">GOT IT — ENTER OUTLAST</button></div>';
      document.body.appendChild(modal);
    }

    let storage = null;
    try { storage = typeof outlastStorage !== 'undefined' ? outlastStorage : window.localStorage; } catch (_) {}
    const wasSeen = () => {
      try { return !!storage && storage.getItem(STORAGE_KEY) === VERSION; } catch (_) { return false; }
    };
    const close = () => {
      try { if (storage) storage.setItem(STORAGE_KEY, VERSION); } catch (_) {}
      modal.style.display = 'none';
    };
    const closeButton = document.getElementById('outlastV4000Close');
    const gotItButton = document.getElementById('outlastV4000GotIt');
    if (closeButton) closeButton.onclick = close;
    if (gotItButton) gotItButton.onclick = close;
    modal.addEventListener('click', event => { if (event.target === modal) close(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && modal.style.display !== 'none') close(); });
    modal.style.display = wasSeen() ? 'none' : 'flex';
    popupInstalled = true;
  }

  function install() {
    installVersionAndHelp();
    wrapKillEnemy();
    // Enforce one source of Progress entry buttons after legacy DOMContentLoaded installers run.
    removeLegacyProgressSystems();
    setTimeout(removeLegacyProgressSystems, 0);
    setTimeout(removeLegacyProgressSystems, 100);
    setTimeout(removeLegacyProgressSystems, 500);
    installTrophyCard();
    installUpdateLog();
    if (!trophyCardInstalled) setTimeout(retryTrophyCard, 250);
    installPopup();
    window.OUTLAST_ULTIMATE_EXPANSION_AUDIT = function () {
      const s = ensureTrophySave(currentSave()) || {};
      return {
        version: VERSION,
        bossTrophiesReady: killHookInstalled,
        bossTrophies: Number(s.bossTrophies) || 0,
        trophyCardReady: trophyCardInstalled,
        updateLogReady: updateLogHookInstalled,
        popupReady: popupInstalled,
        mandatoryUpdateCheck: !!window.OUTLAST_MANDATORY_UPDATE_CHECK,
        legacyProgressRemoved: removeLegacyProgressSystems()
      };
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  setTimeout(install, 0);
})();