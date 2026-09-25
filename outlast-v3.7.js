/* OUTLAST v3.7.0 — Owner coin gifting */
(() => {
  'use strict';

  const VERSION = '3.7.0';
  const API_BASE = 'https://outlast-server.onrender.com';
  const OWNER_USERNAME = 'BestGamer';

  const cleanUsername = value => String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, 18);
  const isOwnerAdmin = () =>
    typeof adminUnlocked !== 'undefined' &&
    adminUnlocked === true &&
    typeof currentUsername !== 'undefined' &&
    String(currentUsername).trim().toLowerCase() === OWNER_USERNAME.toLowerCase();

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

  function ownerGiftPanel() {
    if (!isOwnerAdmin()) {
      if (typeof toast === 'function') toast('Owner access required.');
      return;
    }

    openSub('👑 Give Coins to a Player',
      '<div class="option">' +
        '<b>OWNER-ONLY COIN TRANSFER</b>' +
        '<div class="small">Give coins to another OUTLAST username. The gift is saved on the server until that player claims it.</div>' +
      '</div>' +
      '<label class="small" style="display:block;margin-top:12px">PLAYER USERNAME</label>' +
      '<input id="ownerGiftUsername" type="text" maxlength="18" autocomplete="off" placeholder="Enter username" ' +
        'style="width:100%;box-sizing:border-box;padding:13px;border-radius:10px;border:2px solid #3b4d60;background:#0f151c;color:#fff;font-size:17px;margin-top:6px">' +
      '<label class="small" style="display:block;margin-top:12px">COINS</label>' +
      '<input id="ownerGiftAmount" type="number" min="1" max="10000000" step="1" inputmode="numeric" placeholder="Enter amount" ' +
        'style="width:100%;box-sizing:border-box;padding:13px;border-radius:10px;border:2px solid #3b4d60;background:#0f151c;color:#fff;font-size:17px;margin-top:6px">' +
      '<div id="ownerGiftStatus" class="small" style="min-height:20px;margin-top:9px;color:#9bdcff"></div>' +
      '<div class="row" style="margin-top:12px">' +
        '<button id="ownerGiftSendBtn" class="gold" type="button">👑 GIVE COINS</button>' +
        '<button id="ownerGiftBackBtn" type="button">← BACK</button>' +
      '</div>');

    const userInput = document.getElementById('ownerGiftUsername');
    const amountInput = document.getElementById('ownerGiftAmount');
    const status = document.getElementById('ownerGiftStatus');
    const sendButton = document.getElementById('ownerGiftSendBtn');
    const backButton = document.getElementById('ownerGiftBackBtn');

    backButton?.addEventListener('click', () => {
      document.getElementById('adminBtn')?.click();
    });

    sendButton?.addEventListener('click', async () => {
      if (!isOwnerAdmin()) {
        if (status) status.textContent = 'Owner access required.';
        return;
      }

      const targetUsername = cleanUsername(userInput?.value);
      const amount = Math.floor(Number(amountInput?.value));

      if (!/^[A-Za-z0-9 _-]{2,18}$/.test(targetUsername)) {
        if (status) status.textContent = 'Enter a valid player username (2–18 characters).';
        userInput?.focus();
        return;
      }

      if (!Number.isSafeInteger(amount) || amount < 1 || amount > 10000000) {
        if (status) status.textContent = 'Enter a whole-number amount from 1 to 10,000,000.';
        amountInput?.focus();
        return;
      }

      sendButton.disabled = true;
      if (status) status.textContent = 'Sending gift…';

      try {
        const response = await fetch(API_BASE + '/api/owner/gift-coins', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ownerUsername: OWNER_USERNAME,
            password: ADMIN_PASSWORD,
            targetUsername,
            amount
          })
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.ok) {
          throw new Error(result.error || 'The server rejected the coin gift.');
        }

        if (status) {
          status.textContent =
            '✅ ' + amount.toLocaleString() + ' coins queued for ' +
            targetUsername + '. Pending total: ' +
            Number(result.pending || amount).toLocaleString() + '.';
        }
        if (typeof toast === 'function') {
          toast('👑 Coins sent to ' + targetUsername + '!');
        }
        if (userInput) userInput.value = '';
        if (amountInput) amountInput.value = '';
      } catch (error) {
        if (status) status.textContent = '⚠️ ' + (error?.message || 'Coin transfer failed.');
      } finally {
        sendButton.disabled = false;
      }
    });

    setTimeout(() => userInput?.focus(), 0);
  }

  function installOwnerGiftButton() {
    if (!isOwnerAdmin()) return;
    const container = document.getElementById('subContent');
    if (!container) return;
    if (!/TEMPORARY TEST MODE|Admin Panel/i.test(container.textContent || '')) return;
    if (container.querySelector('#ownerCoinGiftBtn')) return;

    const button = document.createElement('button');
    button.id = 'ownerCoinGiftBtn';
    button.type = 'button';
    button.className = 'option gold';
    button.textContent = '👑 Give Coins to Player';
    button.addEventListener('click', ownerGiftPanel);

    const grid = container.querySelector('.grid');
    if (grid) grid.insertBefore(button, grid.firstChild);
    else container.appendChild(button);
  }

  function wrapAdminPanel() {
    if (typeof window.openSub !== 'function' || window.openSub.__outlastOwnerGiftWrapped) return;
    const originalOpenSub = window.openSub;
    const wrapped = function(title, html) {
      const result = originalOpenSub.apply(this, arguments);
      if (/Admin Panel/i.test(String(title))) {
        setTimeout(installOwnerGiftButton, 0);
      }
      return result;
    };
    wrapped.__outlastOwnerGiftWrapped = true;
    window.openSub = wrapped;
  }

  function wrapLogin() {
    if (typeof window.finishUsernameLogin !== 'function' || window.finishUsernameLogin.__outlastOwnerGiftWrapped) return;
    const originalLogin = window.finishUsernameLogin;
    const wrapped = function() {
      const result = originalLogin.apply(this, arguments);
      if (result && typeof currentUsername !== 'undefined') {
        setTimeout(() => claimPendingCoins(currentUsername), 120);
      }
      return result;
    };
    wrapped.__outlastOwnerGiftWrapped = true;
    window.finishUsernameLogin = wrapped;
  }

  function init() {
    wrapAdminPanel();
    wrapLogin();

    const observerTarget = document.getElementById('subContent');
    if (observerTarget && !observerTarget.__outlastOwnerGiftObserver) {
      const observer = new MutationObserver(() => installOwnerGiftButton());
      observer.observe(observerTarget, { childList: true, subtree: true });
      observerTarget.__outlastOwnerGiftObserver = observer;
    }

    if (typeof currentUsername !== 'undefined' && currentUsername) {
      setTimeout(() => claimPendingCoins(currentUsername), 500);
    }

    setInterval(() => {
      wrapAdminPanel();
      wrapLogin();
      installOwnerGiftButton();
    }, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
