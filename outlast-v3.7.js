/* OUTLAST v3.7.0 — pending coin claim support */
(() => {
  'use strict';

  const API_BASE = 'https://outlast-server.onrender.com';

  const cleanUsername = value => String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, 18);

  async function claimPendingCoins(username) {
    const name = cleanUsername(username);
    if (!/^[A-Za-z0-9 _-]{2,18}$/.test(name)) return;
    try {
      const response = await fetch(API_BASE + '/api/coins/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name })
      });
      if (!response.ok) return;
      const result = await response.json();
      const amount = Math.max(0, Math.floor(Number(result.coins) || 0));
      if (!amount || typeof save === 'undefined' || !save) return;
      save.coins = Math.max(0, Math.floor(Number(save.coins) || 0)) + amount;
      if (typeof persist === 'function') persist();
      if (typeof toast === 'function') toast('🪙 You received +' + amount.toLocaleString() + ' gifted coins!');
    } catch (_) {
      // The game remains usable when the server is temporarily unavailable.
    }
  }

  function wrapLogin() {
    if (typeof window.finishUsernameLogin !== 'function' || window.finishUsernameLogin.__outlastGiftWrapped) return;
    const originalLogin = window.finishUsernameLogin;
    const wrapped = function() {
      const result = originalLogin.apply(this, arguments);
      if (result && typeof currentUsername !== 'undefined') {
        setTimeout(() => claimPendingCoins(currentUsername), 120);
      }
      return result;
    };
    wrapped.__outlastGiftWrapped = true;
    window.finishUsernameLogin = wrapped;
  }

  function init() {
    wrapLogin();
    if (typeof currentUsername !== 'undefined' && currentUsername) {
      setTimeout(() => claimPendingCoins(currentUsername), 500);
    }
    setInterval(wrapLogin, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
