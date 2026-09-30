/* OUTLAST v3.13.2 — Unified Owner Control Center */
(() => {
  'use strict';
  const VERSION = '3.13.2';
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
    const targetTime=()=>new Date(2026,9,1,10,0,0,0).getTime();
    const format=()=>{const ms=Math.max(0,targetTime()-Date.now());if(ms<=0)return '🎃 LIVE NOW!';const d=Math.floor(ms/86400000),h=Math.floor(ms/3600000)%24,m=Math.floor(ms/60000)%60,s=Math.floor(ms/1000)%60;return d+'d '+String(h).padStart(2,'0')+'h '+String(m).padStart(2,'0')+'m '+String(s).padStart(2,'0')+'s';};
    let box=document.getElementById('outlastEventCountdown');
    if(!box){box=document.createElement('div');box.id='outlastEventCountdown';box.style.cssText='position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:99999;background:rgba(10,14,20,.97);border:2px solid #d6a84f;border-radius:12px;padding:8px 14px;color:#fff;font:700 14px Arial,sans-serif;text-align:center;box-shadow:0 5px 22px rgba(0,0,0,.45);pointer-events:none;min-width:210px;display:block!important;visibility:visible!important;opacity:1!important';document.body.appendChild(box);}
    const menu=document.getElementById('menu');
    let menuBox=document.getElementById('outlastMenuCountdown');
    if(menu&& !menuBox){menuBox=document.createElement('div');menuBox.id='outlastMenuCountdown';menuBox.style.cssText='margin:10px 0 12px;padding:12px 14px;border:2px solid #d6a84f;border-radius:14px;background:#111820;box-shadow:0 8px 28px rgba(0,0,0,.25);text-align:center;display:block!important;visibility:visible!important;opacity:1!important;position:relative;z-index:5;pointer-events:none';menuBox.innerHTML='<div style="font-weight:900;letter-spacing:1.5px;color:#d6a84f;font-size:12px">🎃 NIGHTFALL EVENT</div><div id="outlastMenuEventTime" style="font-size:21px;font-weight:900;margin-top:4px">Loading…</div><div style="font-size:11px;color:#9eb0c1;margin-top:3px">October 1, 2026 • 10:00 AM local time</div>';const summary=document.getElementById('menuSummary');if(summary)summary.insertAdjacentElement('afterend',menuBox);}
    const update=()=>{const value=format();box.innerHTML='<div style="color:#d6a84f;font-size:11px;letter-spacing:1px">OUTLAST OCTOBER EVENT</div><div style="font-size:18px;margin-top:2px">'+value+'</div>';const el=document.getElementById('outlastMenuEventTime');if(el)el.textContent=value;};
    update();
    if(!window.__outlastCountdownTimer)window.__outlastCountdownTimer=setInterval(update,1000);
  };
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



/* OUTLAST v3.12.3 — UI cleanup + multiplayer room client. */
(function(){
'use strict';
const SERVER_WS='wss://outlast-server.onrender.com';
let socket=null,room=null,selfId='',reconnectTimer=null,pingTimer=null,stateTimer=null;
const remotePlayers=new Map();
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
function version(){const v='3.12.3';document.querySelector('meta[name="outlast-build"]')?.setAttribute('content',v);document.querySelector('meta[name="build-version"]')?.setAttribute('content',v);document.title='OUTLAST v'+v}
function removeDuplicateStatus(){document.querySelectorAll('#playerStatusBar').forEach(x=>x.remove())}
function installExit(){let b=$('exitGameBtn');if(!b){b=document.createElement('button');b.id='exitGameBtn';b.type='button';b.textContent='✕ EXIT GAME';b.className='danger';Object.assign(b.style,{position:'fixed',right:'18px',top:'18px',display:'none',zIndex:'70',minWidth:'132px',minHeight:'46px',fontWeight:'900',cursor:'pointer',touchAction:'manipulation'});b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();try{if(typeof window.exitGame==='function')window.exitGame();else if(typeof window.closeAllOverlays==='function')window.closeAllOverlays()}catch(err){console.error('OUTLAST exit:',err)}});document.body.appendChild(b)}return b}
function playerName(){return String(window.currentUsername||window.save?.username||'Player').trim()||'Player'}
function send(payload){if(socket&&socket.readyState===WebSocket.OPEN)socket.send(JSON.stringify(payload))}
function setOnlineStatus(text,ok){const e=$('coopConnectionStatus');if(e){e.textContent=text;e.style.color=ok?'#69d7bd':'#ffb36b'}}
function connectOutlastServer(){
 if(socket&&(socket.readyState===WebSocket.OPEN||socket.readyState===WebSocket.CONNECTING)){updateRoomUI();return}
 setOnlineStatus('CONNECTING…',false);
 try{socket=new WebSocket(SERVER_WS)}catch(_){setOnlineStatus('CONNECTION FAILED',false);return}
 socket.onopen=()=>{setOnlineStatus('ONLINE',true);send({type:'player_join',username:playerName()});if(pingTimer)clearInterval(pingTimer);pingTimer=setInterval(()=>send({type:'player_ping',username:playerName()}),5000);updateRoomUI()};
 socket.onmessage=e=>{
  let msg;try{msg=JSON.parse(e.data)}catch(_){return}
  if(msg.type==='welcome'){selfId=msg.id||selfId;return}
  if(msg.type==='room_created'||msg.type==='room_joined'){room={code:msg.code,started:Boolean(msg.started),players:Array.isArray(msg.players)?msg.players:[]};selfId=msg.selfId||selfId;updateRemote(room.players);updateRoomUI();return}
  if(msg.type==='room_state'){room={code:msg.code,started:Boolean(msg.started),players:Array.isArray(msg.players)?msg.players:[]};updateRemote(room.players);updateRoomUI();return}
  if(msg.type==='room_game_start'){if(room)room.started=true;updateRoomUI();window.coopLaunchActive=true;window.roomStarted=true;try{if(typeof closeAllOverlays==='function')closeAllOverlays()}catch(_){}try{if(typeof window.startGame==='function'&&!window.game?.running)window.startGame(false)}catch(err){console.error(err)}return}
  if(msg.type==='player_state'){remotePlayers.set(msg.id,msg);window.outlastRemotePlayers=remotePlayers;document.dispatchEvent(new CustomEvent('outlast:remote-player',{detail:msg}));return}
  if(msg.type==='room_error'){if(typeof window.toast==='function')window.toast('⚠️ '+msg.error);updateRoomUI()}
 };
 socket.onerror=()=>setOnlineStatus('CONNECTION ERROR',false);
 socket.onclose=()=>{if(pingTimer)clearInterval(pingTimer);pingTimer=null;setOnlineStatus('OFFLINE',false);room=null;remotePlayers.clear();updateRoomUI();if(reconnectTimer)clearTimeout(reconnectTimer);reconnectTimer=setTimeout(()=>{if(document.visibilityState!=='hidden')connectOutlastServer()},4000)}
}
function disconnectOutlastServer(){if(reconnectTimer)clearTimeout(reconnectTimer);if(pingTimer)clearInterval(pingTimer);pingTimer=null;room=null;remotePlayers.clear();if(socket){try{socket.close()}catch(_){}}socket=null;updateRoomUI();setOnlineStatus('OFFLINE',false)}
function createRoom(){connectOutlastServer();setTimeout(()=>send({type:'create_room',username:playerName()}),200)}
function joinRoom(){connectOutlastServer();const code=String($('coopRoomCode')?.value||'').trim().toUpperCase();if(code.length!==4){if(typeof window.toast==='function')window.toast('Enter the 4-character room code.');return}setTimeout(()=>send({type:'join_room',code,username:playerName()}),200)}
function leaveRoom(){send({type:'leave_room'});room=null;remotePlayers.clear();updateRoomUI()}
function startRoom(){if(!room){if(typeof window.toast==='function')window.toast('Create or join a room first.');return}send({type:'start_run'})}
function updateRemote(players){const seen=new Set();for(const p of players||[]){seen.add(p.id);if(p.id!==selfId)remotePlayers.set(p.id,p)}for(const id of [...remotePlayers.keys()])if(!seen.has(id))remotePlayers.delete(id);window.outlastRemotePlayers=remotePlayers}
function localState(){const p=window.game?.player||window.player||window.game?.p;if(!p)return null;const x=Number(p.x),y=Number(p.y);if(!Number.isFinite(x)||!Number.isFinite(y))return null;return{type:'player_state',username:playerName(),x,y,skinColor:p.skinColor||'#69d7bd',characterVisual:p.visual||{},level:Math.max(1,Number(window.save?.stats?.bestLevel)||1)}}
function stateTick(){if(!room||!room.started)return;const s=localState();if(s)send(s)}
function renderPlayerList(){const box=$('coopPlayers');if(!box)return;const players=room?.players||[];box.innerHTML=players.length?players.map(p=>'<div class="option" style="padding:9px 11px"><b>'+esc(p.username||'Player')+'</b>'+(p.id===selfId?' <b style="color:#69d7bd">(YOU)</b>':'')+'<span class="small" style="float:right">LV '+esc(p.level||1)+'</span></div>').join(''):'<div class="small">No room members yet.</div>'}
function updateRoomUI(){const code=$('coopRoomCodeDisplay'),state=$('coopRoomState'),create=$('coopCreateBtn'),join=$('coopJoinBtn'),leave=$('coopLeaveBtn'),start=$('coopStartBtn');if(code)code.textContent=room?.code||'----';if(state)state.textContent=room?(room.started?'RUN STARTED':'ROOM READY'):'CREATE OR JOIN A ROOM';if(create)create.style.display=room?'none':'inline-flex';if(join)join.style.display=room?'none':'inline-flex';if(leave)leave.style.display=room?'inline-flex':'none';if(start)start.style.display=room&&!room.started?'inline-flex':'none';renderPlayerList()}
function renderOnlinePanel(){
 connectOutlastServer();
 const body=`
<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><div><h2 style="margin:0">🌐 MULTIPLAYER</h2><div class="small">Create a room or join another player with a 4-character code.</div></div><div id="coopConnectionStatus" style="font-weight:900;color:#ffb36b">CONNECTING…</div></div>
<div class="option" style="margin-top:12px;text-align:center"><div class="small">ROOM CODE</div><div id="coopRoomCodeDisplay" style="font-size:30px;letter-spacing:.18em;font-weight:900;margin:5px 0 12px">----</div><div id="coopRoomState" class="small">CREATE OR JOIN A ROOM</div></div>
<div class="grid" style="margin-top:12px"><button id="coopCreateBtn" type="button">CREATE ROOM</button><button id="coopJoinBtn" type="button">JOIN ROOM</button></div>
<div style="display:flex;gap:8px;margin-top:10px;align-items:center;flex-wrap:wrap"><input id="coopRoomCode" maxlength="4" autocomplete="off" placeholder="ROOM CODE" style="flex:1;min-width:130px;text-transform:uppercase"><button id="coopLeaveBtn" type="button" style="display:none">LEAVE</button><button id="coopStartBtn" type="button" style="display:none">START RUN</button></div>
<div style="margin-top:12px"><h3 style="margin:0 0 7px">PLAYERS</h3><div id="coopPlayers"><div class="small">No room members yet.</div></div></div>
<div class="small" style="margin-top:12px">Up to 4 players can share a room. Room membership, start state, and player positions are synchronized through the OUTLAST server.</div>`;
 if(typeof window.openSub==='function')window.openSub('🌐 MULTIPLAYER',body);else{const p=$('subContent');if(p)p.innerHTML=body;const panel=$('subPanel');if(panel)panel.style.display='flex'}
 setTimeout(()=>{$('coopCreateBtn')?.addEventListener('click',createRoom);$('coopJoinBtn')?.addEventListener('click',joinRoom);$('coopLeaveBtn')?.addEventListener('click',leaveRoom);$('coopStartBtn')?.addEventListener('click',startRoom);$('coopRoomCode')?.addEventListener('input',e=>e.target.value=e.target.value.replace(/[^A-Za-z0-9]/g,'').slice(0,4).toUpperCase());updateRoomUI()},0)
}
window.connectOutlastServer=connectOutlastServer;
window.disconnectOutlastServer=disconnectOutlastServer;
window.sendOnlinePing=()=>send({type:'player_ping',username:playerName()});
window.createRoom=createRoom;window.joinRoom=joinRoom;window.leaveRoom=leaveRoom;window.broadcastRoomStart=startRoom;window.renderOnlinePanel=renderOnlinePanel;
window.coopLaunchActive=false;window.roomStarted=false;
version();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{removeDuplicateStatus();installExit()},{once:true});else{removeDuplicateStatus();installExit()}
stateTimer=setInterval(stateTick,100);
setInterval(()=>{try{const b=$('exitGameBtn');if(b&&window.game)b.style.display=window.game.running?'block':'none';removeDuplicateStatus()}catch(_){}},1000);
})();

/* OUTLAST v3.13.1 — responsive UI polish + interaction safeguards. */
(function(){
  'use strict';
  const VERSION='3.13.1';
  const $=id=>document.getElementById(id);

  function injectStyle(){
    if($('outlast-v3131-style')) return;
    const style=document.createElement('style');
    style.id='outlast-v3131-style';
    style.textContent=`
      :root{--ol-gap:clamp(8px,2vw,14px);--ol-pad:clamp(10px,3vw,22px)}
      html{overflow-x:hidden;text-size-adjust:100%;-webkit-text-size-adjust:100%}
      body{overflow-x:hidden;overflow-y:auto;min-height:100dvh;box-sizing:border-box}
      button,[role="button"],input,select,textarea{box-sizing:border-box;max-width:100%}
      button,[role="button"]{min-height:44px;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
      .outlast-start-run{min-height:52px!important;min-width:min(240px,100%)!important;width:auto!important;padding:12px 22px!important;font-size:clamp(15px,3.8vw,19px)!important;line-height:1.15!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:10px!important;white-space:nowrap!important}
      .outlast-start-run *{margin:0!important;line-height:1.15!important}
      .outlast-profile-avatar{object-fit:contain!important;object-position:center!important;overflow:hidden!important;flex:0 0 auto!important}
      .outlast-profile-wrap{overflow:visible!important;min-width:0!important}
      .outlast-username{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .outlast-ui-box{box-sizing:border-box;max-width:100%;min-width:0}
      .outlast-ui-row{display:flex;flex-wrap:wrap;gap:var(--ol-gap);align-items:center}
      .outlast-ui-row>*{min-width:0}
      .outlast-bottom-safe{padding-bottom:max(90px,env(safe-area-inset-bottom) + 72px)!important}
      .outlast-readable,.small,.muted,.label,.description{overflow-wrap:anywhere}
      @media(max-width:480px){
        :root{--ol-pad:12px}
        .outlast-start-run{width:100%!important;min-width:0!important;padding:11px 16px!important}
        button{font-size:clamp(12px,3.6vw,16px)}
      }
      @media(min-width:481px) and (max-width:900px){
        .outlast-start-run{min-width:min(260px,90vw)!important}
      }
      @media(min-width:901px){
        .outlast-start-run{min-width:220px!important}
      }
      @media(orientation:landscape) and (max-height:520px){
        .outlast-start-run{min-height:46px!important;padding:9px 16px!important}
      }
      @media(prefers-reduced-motion:reduce){
        *,*::before,*::after{scroll-behavior:auto!important;animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}
      }
    `;
    document.head.appendChild(style);
  }

  function normalizeViewport(){
    let meta=document.querySelector('meta[name="viewport"]');
    if(!meta){
      meta=document.createElement('meta');
      meta.name='viewport';
      document.head.appendChild(meta);
    }
    meta.content='width=device-width, initial-scale=1, viewport-fit=cover';
  }

  function textOf(el){return String(el?.textContent||'').replace(/\s+/g,' ').trim()}
  function buttonsByText(pattern){
    return [...document.querySelectorAll('button,[role="button"]')].filter(b=>pattern.test(textOf(b)));
  }

  function polishStartRun(){
    buttonsByText(/^START RUN(?:\s*[→›>])?$/i).forEach(btn=>{
      btn.classList.add('outlast-start-run');
      btn.setAttribute('type','button');
      const children=[...btn.children];
      children.forEach(child=>{child.style.margin='0';child.style.lineHeight='1.15'});
    });
  }

  function cleanSwitchUsername(){
    buttonsByText(/^SWITCH USERNAME(?:\s*[•·|:;,.…→›>✦✧★☆])?$/i).forEach(btn=>{
      if(textOf(btn)!=='SWITCH USERNAME') btn.textContent='SWITCH USERNAME';
      btn.setAttribute('type',btn.getAttribute('type')||'button');
    });
  }

  function polishAvatar(){
    const candidates=[...document.querySelectorAll(
      '.profile-avatar,.avatar,[data-avatar],img[alt*="avatar" i],img[alt*="profile" i],img[src*="avatar" i]'
    )];
    const switchButton=buttonsByText(/^SWITCH USERNAME$/i)[0];
    if(switchButton){
      const parent=switchButton.closest('header,.profile,.profile-card,.menu-header,.menu-top,.card,section,div');
      if(parent){
        parent.querySelectorAll('img').forEach(img=>{if(!candidates.includes(img))candidates.push(img)});
      }
    }
    candidates.forEach(img=>{
      img.classList.add('outlast-profile-avatar');
      img.style.maxWidth='100%';
      img.style.height='auto';
      img.style.display='block';
      img.style.borderRadius=img.style.borderRadius||'50%';
    });
  }

  function improveTopSpacing(){
    const switchButton=buttonsByText(/^SWITCH USERNAME$/i)[0];
    if(!switchButton)return;
    const profile=switchButton.closest('header,.profile,.profile-card,.menu-header,.menu-top,section');
    if(profile){
      profile.classList.add('outlast-ui-box');
      profile.style.maxWidth='100%';
      profile.style.minWidth='0';
      profile.style.boxSizing='border-box';
      profile.style.gap='clamp(8px,2vw,14px)';
    }
    const avatar=profile?.querySelector('.outlast-profile-avatar');
    if(avatar){
      avatar.style.marginRight='clamp(6px,2vw,12px)';
    }
  }

  function protectBottomNavigation(){
    const candidates=[...document.querySelectorAll(
      'nav,.bottom-nav,.menu-nav,.menu-navigation,[class*="bottom-menu" i],[class*="bottom-nav" i]'
    )];
    candidates.forEach(nav=>{
      nav.style.boxSizing='border-box';
      nav.style.maxWidth='100vw';
      nav.style.paddingBottom='max(8px, env(safe-area-inset-bottom))';
      [...nav.querySelectorAll('button,[role="button"],a')].forEach(b=>{
        b.style.minWidth='0';
        b.style.maxWidth='100%';
        b.style.flex='1 1 0';
      });
    });
    document.body.classList.add('outlast-bottom-safe');
  }

  function improveReadableText(){
    document.querySelectorAll('.small,.muted,.label,.description,[class*="subtitle" i]').forEach(el=>{
      if(!el.closest('button')) el.style.overflowWrap='anywhere';
    });
  }

  function wholeButtonAndDoubleTapGuard(){
    document.querySelectorAll('button,[role="button"]').forEach(btn=>{
      if(btn.dataset.ol3131Guard)return;
      btn.dataset.ol3131Guard='1';
      btn.setAttribute('type',btn.getAttribute('type')||'button');
      btn.style.touchAction='manipulation';
      let last=0;
      btn.addEventListener('click',event=>{
        const now=Date.now();
        if(now-last<420){
          event.preventDefault();
          event.stopImmediatePropagation();
          return;
        }
        last=now;
      },true);
    });
  }

  function startRunGuard(){
    buttonsByText(/^START RUN(?:\s*[→›>])?$/i).forEach(btn=>{
      if(btn.dataset.olStartGuard)return;
      btn.dataset.olStartGuard='1';
      btn.addEventListener('click',()=>{
        const now=Date.now();
        const previous=Number(btn.dataset.olLastStart||0);
        if(now-previous<650)return;
        btn.dataset.olLastStart=String(now);
        btn.setAttribute('aria-busy','true');
        setTimeout(()=>btn.removeAttribute('aria-busy'),650);
      },true);
    });
  }

  function persistAfterChoice(){
    document.addEventListener('click',event=>{
      const btn=event.target.closest?.('button,[role="button"]');
      if(!btn)return;
      const label=textOf(btn);
      if(/^(MAP|DIFFICULTY|GAME MODE|MODE|SAVE|APPLY|SWITCH USERNAME)/i.test(label)){
        setTimeout(()=>{
          try{
            if(typeof persist==='function')persist();
            else if(typeof saveGame==='function')saveGame();
          }catch(_){}
        },80);
      }
    },true);
  }

  function normalizeUsernameOnSave(){
    const normalize=value=>{
      let s=String(value??'').trim().replace(/\s+/g,' ');
      const chars=Array.from(s).slice(0,18);
      return chars.join('');
    };
    try{
      if(typeof window.currentUsername!=='undefined'){
        const n=normalize(window.currentUsername);
        window.currentUsername=n||'Player';
      }
      if(window.save&&typeof window.save==='object'){
        const raw=window.save.username??window.save.name;
        if(raw!==undefined){
          const n=normalize(raw);
          window.save.username=n||'Player';
          if('name' in window.save)window.save.name=n||'Player';
        }
      }
    }catch(_){}
  }

  function installPersistenceSafety(){
    normalizeUsernameOnSave();
    const originalPersist=window.persist;
    if(typeof originalPersist==='function'&&!originalPersist.__ol3131Wrapped){
      const wrapped=function(){
        normalizeUsernameOnSave();
        return originalPersist.apply(this,arguments);
      };
      wrapped.__ol3131Wrapped=true;
      window.persist=wrapped;
    }
  }

  function apply(){
    injectStyle();
    normalizeViewport();
    polishStartRun();
    cleanSwitchUsername();
    polishAvatar();
    improveTopSpacing();
    protectBottomNavigation();
    improveReadableText();
    wholeButtonAndDoubleTapGuard();
    startRunGuard();
    installPersistenceSafety();
  }

  function init(){
    document.title='OUTLAST v'+VERSION;
    apply();
    if(!window.__outlast3131Observer){
      window.__outlast3131Observer=new MutationObserver(()=>apply());
      window.__outlast3131Observer.observe(document.body,{childList:true,subtree:true});
    }
    if(!window.__outlast3131PersistenceListener){
      window.__outlast3131PersistenceListener=true;
      persistAfterChoice();
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
  setTimeout(apply,500);
  setTimeout(apply,1500);
  setTimeout(apply,3000);
})();
