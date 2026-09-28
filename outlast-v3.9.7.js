/* OUTLAST v3.13.0 — Unified Owner Control Center */
(() => {
  'use strict';
  const VERSION = '3.13.0';
  const API_BASE = 'https://outlast-server.onrender.com';
  const OWNER_USERNAMES = ['BestGamer', 'Landon'];
  const cleanUsername = value => String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, 18);
  const isOwnerAdmin = () => typeof currentUsername !== 'undefined' && OWNER_USERNAMES.some(name => String(currentUsername).trim().toLowerCase() === name.toLowerCase());

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
    openSub('👑 OWNER TOOLS & PANEL',
      '<div class="option"><b>OWNER CONTROL CENTER</b><div class="small">Owner-only controls for OUTLAST. Event Preview remains in the Admin Panel.</div></div>' +
      '<div class="grid" style="margin-top:12px">' +
      '<button id="ownerStatusOpen" class="option" type="button">👑 Owner Status</button>' +
      '<button id="ownerGiftOpen" class="option gold" type="button">🪙 Give Coins</button>' +
      '<button id="ownerPlayersOpen" class="option" type="button">👥 Player Directory</button>' +
      '<button id="ownerEventsOpen" class="option gold" type="button">🌎 Global Events</button>' +
      '<button id="ownerAbuseOpen" class="option" type="button">⚡ Admin Abuse</button>' +
      '<button id="ownerRewardsOpen" class="option" type="button">🎁 Global Rewards</button>' +
      '<button id="ownerAnnounceOpen" class="option" type="button">📢 Global Announcement</button>' +
      '<button id="ownerServerOpen" class="option" type="button">📊 Server Status</button>' +
      '</div>' +
      '<div id="ownerPanelStatus" class="option" style="margin-top:12px"><b>Owner Control Center Ready</b><div class="small">Choose a tool above.</div></div>' +
      '<button id="ownerPanelBack" type="button" style="margin-top:12px">← BACK</button>');
    document.getElementById('ownerStatusOpen')?.addEventListener('click',()=>{const el=document.getElementById('ownerPanelStatus');if(el)el.innerHTML='<b>👑 Owner Access Active</b><div class="small">Owner-only controls are active for '+escapeHtml(String(currentUsername||'')) +'.</div>';});
    document.getElementById('ownerPanelBack')?.addEventListener('click',()=>{closeSub();document.getElementById('menu').style.display='flex';if(typeof updateMenuSummary==='function')updateMenuSummary();});
    document.getElementById('ownerGiftOpen')?.addEventListener('click', ownerGiftPanel);
    document.getElementById('ownerPlayersOpen')?.addEventListener('click', ownerPlayersPanel);
    document.getElementById('ownerEventsOpen')?.addEventListener('click', ownerGlobalEventsPanel);
    document.getElementById('ownerAbuseOpen')?.addEventListener('click', ownerAdminAbusePanel);
    document.getElementById('ownerRewardsOpen')?.addEventListener('click', ownerGlobalRewardsPanel);
    document.getElementById('ownerAnnounceOpen')?.addEventListener('click', ownerAnnouncementPanel);
    document.getElementById('ownerServerOpen')?.addEventListener('click', ownerServerStatusPanel);
  }

  async function ownerGlobalEventsPanel() {
    if(!isOwnerAdmin()) return;
    openSub('🌎 GLOBAL EVENTS',
      '<div class="option"><b>Global Event Control</b><div class="small">Start or stop a synchronized event for connected players.</div></div>' +
      '<label class="small" style="display:block;margin-top:12px">EVENT</label>' +
      '<select id="ownerEventType" style="width:100%;padding:12px;border-radius:10px;margin-top:6px"><option value="october">🎃 October Event</option><option value="double_coins">🪙 Double Coins</option><option value="double_xp">⭐ Double XP</option><option value="chaos">⚡ Global Chaos</option><option value="blackout">🌑 Global Blackout</option><option value="boss_rush">👹 Boss Rush</option></select>' +
      '<label class="small" style="display:block;margin-top:12px">DURATION (MINUTES)</label><input id="ownerEventMinutes" type="number" min="1" max="1440" value="30" inputmode="numeric" style="width:100%;padding:12px;border-radius:10px;box-sizing:border-box;margin-top:6px">' +
      '<div class="row" style="margin-top:12px"><button id="ownerEventStart" class="gold" type="button">🌎 START EVENT</button><button id="ownerEventStop" type="button">■ STOP EVENT</button></div>' +
      '<div id="ownerEventStatus" class="small" style="margin-top:10px">Loading current event…</div><button id="ownerEventBack" type="button" style="margin-top:12px">← BACK</button>');
    const status=document.getElementById('ownerEventStatus');
    const refresh=async()=>{try{const r=await fetch(API_BASE+'/api/owner/global-event');const x=await r.json();status.textContent=x.active?'🟢 '+x.label+' — '+Math.max(0,Math.ceil((x.endsAt-Date.now())/60000))+' min left':'⚪ No global event running.';}catch(e){status.textContent='⚠️ Server unavailable.';}};
    document.getElementById('ownerEventStart')?.addEventListener('click',async()=>{const type=document.getElementById('ownerEventType')?.value,minutes=Math.max(1,Math.min(1440,Math.floor(Number(document.getElementById('ownerEventMinutes')?.value)||30)));status.textContent='Starting…';try{const r=await ownerRequest('/api/owner/global-event',{ownerUsername:String(currentUsername).trim(),password:typeof ADMIN_PASSWORD==='string'?ADMIN_PASSWORD:'',action:'start',eventType:type,durationMinutes:minutes});status.textContent='✅ '+r.event.label+' started for '+minutes+' minutes.';}catch(e){status.textContent='⚠️ '+(e.message||'Could not start event.');}});
    document.getElementById('ownerEventStop')?.addEventListener('click',async()=>{status.textContent='Stopping…';try{await ownerRequest('/api/owner/global-event',{ownerUsername:String(currentUsername).trim(),password:typeof ADMIN_PASSWORD==='string'?ADMIN_PASSWORD:'',action:'stop'});status.textContent='✅ Global event stopped.';}catch(e){status.textContent='⚠️ '+(e.message||'Could not stop event.');}});
    document.getElementById('ownerEventBack')?.addEventListener('click',ownerPanel); refresh();
  }

  async function ownerAdminAbusePanel() {
    if(!isOwnerAdmin()) return;
    openSub('⚡ ADMIN ABUSE',
      '<div class="option"><b>CONTROLLED ADMIN ABUSE</b><div class="small">Fun/testing effects synchronized to the active game. Use STOP ALL to clear temporary effects.</div></div>' +
      '<div class="grid" style="margin-top:12px"><button data-abuse="boss" class="option" type="button">👹 Spawn Boss</button><button data-abuse="blackout" class="option" type="button">🌑 Blackout</button><button data-abuse="speed" class="option" type="button">💨 Speed Up Enemies</button><button data-abuse="chaos" class="option" type="button">⚡ Chaos</button><button data-abuse="powerup" class="option" type="button">✨ Power-Up Rain</button><button data-abuse="waves" class="option" type="button">🧟 Rapid Waves</button></div>' +
      '<div class="row" style="margin-top:12px"><button id="ownerAbuseStop" type="button">■ STOP ALL ABUSE</button><button id="ownerAbuseBack" type="button">← BACK</button></div><div id="ownerAbuseStatus" class="small" style="margin-top:10px">Ready.</div>');
    const status=document.getElementById('ownerAbuseStatus');
    document.querySelectorAll('[data-abuse]').forEach(btn=>btn.addEventListener('click',async()=>{status.textContent='Activating…';try{const r=await ownerRequest('/api/owner/admin-abuse',{ownerUsername:String(currentUsername).trim(),password:typeof ADMIN_PASSWORD==='string'?ADMIN_PASSWORD:'',action:btn.dataset.abuse,durationMinutes:5});status.textContent='✅ '+r.label+' activated.';}catch(e){status.textContent='⚠️ '+(e.message||'Could not activate.');}}));
    document.getElementById('ownerAbuseStop')?.addEventListener('click',async()=>{try{await ownerRequest('/api/owner/admin-abuse',{ownerUsername:String(currentUsername).trim(),password:typeof ADMIN_PASSWORD==='string'?ADMIN_PASSWORD:'',action:'stop'});status.textContent='✅ All admin-abuse effects stopped.';}catch(e){status.textContent='⚠️ '+(e.message||'Could not stop effects.');}});
    document.getElementById('ownerAbuseBack')?.addEventListener('click',ownerPanel);
  }

  async function ownerGlobalRewardsPanel() {
    if(!isOwnerAdmin()) return;
    openSub('🎁 GLOBAL REWARDS','<div class="option"><b>Global Reward</b><div class="small">Queue a coin reward for every known player.</div></div><label class="small" style="display:block;margin-top:12px">COINS PER PLAYER</label><input id="ownerRewardAmount" type="number" min="1" max="100000" value="100" style="width:100%;padding:12px;box-sizing:border-box;margin-top:6px"><button id="ownerRewardSend" class="gold" type="button" style="margin-top:12px">🎁 SEND TO EVERYONE</button><div id="ownerRewardStatus" class="small" style="margin-top:10px"></div><button id="ownerRewardBack" type="button">← BACK</button>');
    const status=document.getElementById('ownerRewardStatus');
    document.getElementById('ownerRewardSend')?.addEventListener('click',async()=>{const amount=Math.floor(Number(document.getElementById('ownerRewardAmount')?.value)||0);if(amount<1||amount>100000){status.textContent='Enter 1–100,000 coins.';return;}try{const r=await ownerRequest('/api/owner/global-reward',{ownerUsername:String(currentUsername).trim(),password:typeof ADMIN_PASSWORD==='string'?ADMIN_PASSWORD:'',amount});status.textContent='✅ Reward queued for '+r.players+' players.';}catch(e){status.textContent='⚠️ '+(e.message||'Reward failed.');}});
    document.getElementById('ownerRewardBack')?.addEventListener('click',ownerPanel);
  }

  async function ownerAnnouncementPanel() {
    if(!isOwnerAdmin()) return;
    openSub('📢 GLOBAL ANNOUNCEMENT','<div class="option"><b>Message all online players</b></div><textarea id="ownerAnnouncementText" maxlength="240" placeholder="Enter announcement..." style="width:100%;min-height:100px;box-sizing:border-box;margin-top:10px;padding:12px;border-radius:10px"></textarea><button id="ownerAnnouncementSend" class="gold" type="button" style="margin-top:10px">📢 SEND</button><div id="ownerAnnouncementStatus" class="small" style="margin-top:8px"></div><button id="ownerAnnouncementBack" type="button">← BACK</button>');
    const status=document.getElementById('ownerAnnouncementStatus');
    document.getElementById('ownerAnnouncementSend')?.addEventListener('click',async()=>{const message=String(document.getElementById('ownerAnnouncementText')?.value||'').trim();if(!message){status.textContent='Enter a message.';return;}try{await ownerRequest('/api/owner/announcement',{ownerUsername:String(currentUsername).trim(),password:typeof ADMIN_PASSWORD==='string'?ADMIN_PASSWORD:'',message});status.textContent='✅ Announcement sent.';document.getElementById('ownerAnnouncementText').value='';}catch(e){status.textContent='⚠️ '+(e.message||'Announcement failed.');}});
    document.getElementById('ownerAnnouncementBack')?.addEventListener('click',ownerPanel);
  }

  async function ownerServerStatusPanel() {
    if(!isOwnerAdmin()) return;
    openSub('📊 SERVER STATUS','<div id="ownerServerStatus" class="option">Loading…</div><button id="ownerServerRefresh" type="button">↻ REFRESH</button><button id="ownerServerBack" type="button">← BACK</button>');
    const load=async()=>{const el=document.getElementById('ownerServerStatus');try{const r=await fetch(API_BASE+'/api/health');const x=await r.json();el.innerHTML='<b>🟢 '+escapeHtml(x.status||'online')+'</b><div class="small">Version: '+escapeHtml(x.version||'?')+' · Players: '+Number(x.players||0)+' · Rooms: '+Number(x.rooms||0)+' · Event: '+(x.globalEvent?.active?'🟢 ACTIVE':'⚪ OFF')+'</div>';}catch(e){el.textContent='🔴 Server unavailable.';}};document.getElementById('ownerServerRefresh')?.addEventListener('click',load);document.getElementById('ownerServerBack')?.addEventListener('click',ownerPanel);load();
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

  function wrapLogin(){if(typeof window.finishUsernameLogin!=='function'||window.finishUsernameLogin.__outlastGiftWrapped)return;const original=window.finishUsernameLogin;const wrapped=function(){const result=original.apply(this,arguments);if(result&&typeof currentUsername!=='undefined')setTimeout(()=>claimPendingCoins(currentUsername),120);return result;};wrapped.__outlastGiftWrapped=true;window.finishUsernameLogin=wrapped;}
  window.ownerPanel = ownerPanel;
  function installOwnerRealtimeBridge(){
    if(window.__outlastOwnerRealtimeBridge)return; window.__outlastOwnerRealtimeBridge=true;
    try{const wsProto=API_BASE.startsWith('https:')?'wss:':'ws:'; const ws=new WebSocket(wsProto+'//'+API_BASE.replace(/^https?:\/\//,'') ); ws.addEventListener('message',event=>{try{const msg=JSON.parse(event.data);if(msg.type==='owner_announcement'&&typeof toast==='function')toast('📢 '+msg.message);if(msg.type==='owner_global_event'&&typeof window.dispatchEvent==='function')window.dispatchEvent(new CustomEvent('outlast:global-event',{detail:msg}));if(msg.type==='owner_admin_abuse'&&typeof window.dispatchEvent==='function')window.dispatchEvent(new CustomEvent('outlast:admin-abuse',{detail:msg}));}catch(_){}});}catch(_){}
  }
  function installEventCountdown(){
    if(document.getElementById('outlastEventCountdown')) return;
    const box=document.createElement('div'); box.id='outlastEventCountdown';
    box.style.cssText='position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:9998;background:rgba(10,14,20,.94);border:2px solid #d6a84f;border-radius:12px;padding:8px 14px;color:#fff;font:700 14px Arial,sans-serif;text-align:center;box-shadow:0 5px 22px rgba(0,0,0,.45);pointer-events:none;min-width:210px';
    box.innerHTML='<div style="color:#d6a84f;font-size:11px;letter-spacing:1px">OUTLAST OCTOBER EVENT</div><div id="outlastEventTime" style="font-size:18px;margin-top:2px">Loading…</div>';
    document.body.appendChild(box);
    const update=()=>{const now=new Date();const target=new Date(now.getFullYear(),9,1,0,0,0,0);if(now>=target){box.innerHTML='<div style="color:#d6a84f;font-size:11px;letter-spacing:1px">OUTLAST OCTOBER EVENT</div><div style="font-size:18px;margin-top:2px">🎃 LIVE NOW!</div>';return;}const ms=target-now;const d=Math.floor(ms/86400000),h=Math.floor(ms/3600000)%24,m=Math.floor(ms/60000)%60,s=Math.floor(ms/1000)%60;const el=document.getElementById('outlastEventTime');if(el)el.textContent=d+'d '+String(h).padStart(2,'0')+'h '+String(m).padStart(2,'0')+'m '+String(s).padStart(2,'0')+'s';};update();setInterval(update,1000);};
  function bindOwnerButton(){
    const btn=document.getElementById('ownerBtn');
    if(!btn)return;
    if(btn.__outlastOwnerBound===VERSION)return;
    btn.__outlastOwnerBound=VERSION;
    btn.onclick=(event)=>{event.preventDefault();event.stopPropagation();ownerPanel();};
  }
  function init(){document.title='OUTLAST v'+VERSION;installEventCountdown();installOwnerRealtimeBridge();wrapLogin();bindOwnerButton();if(typeof currentUsername!=='undefined'&&currentUsername)setTimeout(()=>claimPendingCoins(currentUsername),500);setInterval(()=>{wrapLogin();bindOwnerButton();},1000);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
