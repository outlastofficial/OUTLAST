/* OUTLAST v3.8.0 — Owner panel: coin gifting + player directory */
(() => {
  'use strict';
  const VERSION = '3.8.0';
  const API_BASE = 'https://outlast-server.onrender.com';
  const OWNER_USERNAMES = ['BestGamer', 'Landon'];
  const cleanUsername = value => String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, 18);
  const isOwnerAdmin = () => typeof adminUnlocked !== 'undefined' && adminUnlocked === true && typeof currentUsername !== 'undefined' && OWNER_USERNAMES.some(name => String(currentUsername).trim().toLowerCase() === name.toLowerCase());

  async function claimPendingCoins(username) {
    const name = cleanUsername(username); if (!/^[A-Za-z0-9 _-]{2,18}$/.test(name)) return;
    try {
      const response = await fetch(API_BASE + '/api/coins/claim', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:name})});
      if (!response.ok) return; const result = await response.json(); const amount = Math.max(0, Math.floor(Number(result.coins)||0));
      if (!amount || typeof save === 'undefined' || !save) return; save.coins = Math.max(0,Math.floor(Number(save.coins)||0))+amount;
      if (typeof persist === 'function') persist(); if (typeof toast === 'function') toast('🪙 You received +' + amount.toLocaleString() + ' gifted coins!');
    } catch (_) {}
  }

  async function ownerRequest(path, body) {
    const response = await fetch(API_BASE + path, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const result = await response.json().catch(()=>({}));
    if (!response.ok || !result.ok) throw new Error(result.error || 'Owner request failed.'); return result;
  }

  function ownerPanel() {
    if (!isOwnerAdmin()) { if(typeof toast==='function') toast('Owner access required.'); return; }
    openSub('👑 OWNER PANEL', '<div class="option"><b>OWNER-ONLY CONTROLS</b><div class="small">Only BestGamer and Landon can access these controls.</div></div>' +
      '<button id="ownerGiftOpen" class="option gold" type="button">👑 Give Coins to Player</button>' +
      '<button id="ownerPlayersOpen" class="option" type="button">👥 All Online / Offline Players</button>' +
      '<div id="ownerPanelStatus" class="small" style="min-height:20px;margin-top:8px"></div>' +
      '<button id="ownerPanelBack" type="button" style="margin-top:12px">← BACK</button>');
    document.getElementById('ownerPanelBack')?.addEventListener('click',()=>document.getElementById('adminBtn')?.click());
    document.getElementById('ownerGiftOpen')?.addEventListener('click', ownerGiftPanel);
    document.getElementById('ownerPlayersOpen')?.addEventListener('click', ownerPlayersPanel);
  }

  function ownerGiftPanel() {
    if (!isOwnerAdmin()) return;
    openSub('👑 Give Coins to a Player', '<div class="option"><b>OWNER-ONLY COIN TRANSFER</b><div class="small">Give coins to another OUTLAST username. The gift is saved until claimed.</div></div>' +
      '<label class="small" style="display:block;margin-top:12px">PLAYER USERNAME</label><input id="ownerGiftUsername" type="text" maxlength="18" autocomplete="off" placeholder="Enter username" style="width:100%;box-sizing:border-box;padding:13px;border-radius:10px;border:2px solid #3b4d60;background:#0f151c;color:#fff;font-size:17px;margin-top:6px">' +
      '<label class="small" style="display:block;margin-top:12px">COINS</label><input id="ownerGiftAmount" type="number" min="1" max="10000000" step="1" inputmode="numeric" placeholder="Enter amount" style="width:100%;box-sizing:border-box;padding:13px;border-radius:10px;border:2px solid #3b4d60;background:#0f151c;color:#fff;font-size:17px;margin-top:6px">' +
      '<div id="ownerGiftStatus" class="small" style="min-height:20px;margin-top:9px"></div><div class="row" style="margin-top:12px"><button id="ownerGiftSendBtn" class="gold" type="button">👑 GIVE COINS</button><button id="ownerGiftBackBtn" type="button">← BACK</button></div>');
    const userInput=document.getElementById('ownerGiftUsername'), amountInput=document.getElementById('ownerGiftAmount'), status=document.getElementById('ownerGiftStatus'), sendButton=document.getElementById('ownerGiftSendBtn');
    document.getElementById('ownerGiftBackBtn')?.addEventListener('click',ownerPanel);
    sendButton?.addEventListener('click',async()=>{
      if(!isOwnerAdmin()) return; const targetUsername=cleanUsername(userInput?.value), amount=Math.floor(Number(amountInput?.value));
      if(!/^[A-Za-z0-9 _-]{2,18}$/.test(targetUsername)){if(status)status.textContent='Enter a valid player username (2–18 characters).';return;}
      if(!Number.isSafeInteger(amount)||amount<1||amount>10000000){if(status)status.textContent='Enter a whole-number amount from 1 to 10,000,000.';return;}
      sendButton.disabled=true;if(status)status.textContent='Sending gift…';
      try { const result=await ownerRequest('/api/owner/gift-coins',{ownerUsername:String(currentUsername).trim(),password:typeof ADMIN_PASSWORD==='string'?ADMIN_PASSWORD:'',targetUsername,amount}); if(status)status.textContent='✅ '+amount.toLocaleString()+' coins queued for '+targetUsername+'. Pending total: '+Number(result.pending||amount).toLocaleString()+'.'; if(typeof toast==='function')toast('👑 Coins sent to '+targetUsername+'!'); if(userInput)userInput.value='';if(amountInput)amountInput.value=''; }
      catch(error){if(status)status.textContent='⚠️ '+(error?.message||'Coin transfer failed.');} finally {sendButton.disabled=false;}
    });
  }

  async function ownerPlayersPanel() {
    if (!isOwnerAdmin()) return;
    openSub('👥 Online / Offline Players','<div id="ownerPlayersList" class="option">Loading players…</div><button id="ownerPlayersRefresh" type="button">↻ REFRESH</button><button id="ownerPlayersBack" type="button">← BACK</button>');
    const load=async()=>{
      const list=document.getElementById('ownerPlayersList'); if(!list||!isOwnerAdmin())return; list.textContent='Loading players…';
      try { const result=await ownerRequest('/api/owner/players',{ownerUsername:String(currentUsername).trim(),password:typeof ADMIN_PASSWORD==='string'?ADMIN_PASSWORD:''}); const players=Array.isArray(result.players)?result.players:[];
        if(!players.length){list.innerHTML='<b>No players recorded yet.</b>';return;}
        list.innerHTML=players.map(p=>'<div style="display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid #263442"><span>👤 '+escapeHtml(p.username)+'</span><b>'+ (p.online?'🟢 ONLINE':'⚪ OFFLINE') +'</b></div>').join('');
      } catch(error){list.textContent='⚠️ '+(error?.message||'Could not load players.');}
    };
    document.getElementById('ownerPlayersBack')?.addEventListener('click',ownerPanel); document.getElementById('ownerPlayersRefresh')?.addEventListener('click',load); load();
  }

  function escapeHtml(value){return String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

  function installOwnerButton(){
    if(!isOwnerAdmin())return; const container=document.getElementById('subContent'); if(!container)return;
    if(!/TEMPORARY TEST MODE|Admin Panel/i.test(container.textContent||''))return; if(container.querySelector('#ownerPanelBtn'))return;
    const button=document.createElement('button'); button.id='ownerPanelBtn';button.type='button';button.className='option gold';button.textContent='👑 OWNER PANEL';button.addEventListener('click',ownerPanel);
    const grid=container.querySelector('.grid'); if(grid)grid.insertBefore(button,grid.firstChild);else container.appendChild(button);
  }
  function wrapAdminPanel(){if(typeof window.openSub!=='function'||window.openSub.__outlastOwnerWrapped)return;const original=window.openSub;const wrapped=function(title,html){const result=original.apply(this,arguments);if(/Admin Panel/i.test(String(title)))setTimeout(installOwnerButton,0);return result;};wrapped.__outlastOwnerWrapped=true;window.openSub=wrapped;}
  function wrapLogin(){if(typeof window.finishUsernameLogin!=='function'||window.finishUsernameLogin.__outlastGiftWrapped)return;const original=window.finishUsernameLogin;const wrapped=function(){const result=original.apply(this,arguments);if(result&&typeof currentUsername!=='undefined')setTimeout(()=>claimPendingCoins(currentUsername),120);return result;};wrapped.__outlastGiftWrapped=true;window.finishUsernameLogin=wrapped;}
  function init(){wrapAdminPanel();wrapLogin();if(typeof currentUsername!=='undefined'&&currentUsername)setTimeout(()=>claimPendingCoins(currentUsername),500);setInterval(()=>{wrapAdminPanel();wrapLogin();installOwnerButton();},1000);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
