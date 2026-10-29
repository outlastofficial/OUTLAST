/* OUTLAST v4.4.3 — Reliability Guards, AFK Lounge, Runtime Audit */
(function(){
'use strict';
const VERSION='4.4.3';
const num=v=>Number.isFinite(Number(v))?Number(v):0;
const getSave=()=>{try{return typeof save!=='undefined'?save:(window.save||null)}catch(_){return window.save||null}};
const getGame=()=>{try{return typeof game!=='undefined'?game:(window.game||null)}catch(_){return window.game||null}};
const say=t=>{try{if(typeof window.showToast==='function')window.showToast(t);else if(typeof window.toast==='function')window.toast(t);else{const el=document.getElementById('toast');if(el){el.textContent=t;el.style.display='block';setTimeout(()=>el.style.display='none',2200)}}}catch(_){}};
function persistSafe(){try{if(typeof persist==='function')persist();else if(typeof window.persist==='function')window.persist();return true}catch(e){window.OUTLAST_V443_SAVE_ERROR=String(e&&e.message||e);return false}}
function chooseSkill(name){
 const s=getSave(),g=getGame();let defs={};try{defs=typeof activeSkills!=='undefined'?activeSkills:(window.activeSkills||{})}catch(_){defs=window.activeSkills||{}}
 if(!s||!defs||!defs[name]){say('That skill is unavailable right now.');return false}
 s.ownedSkills=Object.assign({Nova:true},s.ownedSkills||{});
 if(!s.ownedSkills[name]){const cost=Math.max(0,num(defs[name].cost));if(num(s.coins)<cost){say('Need '+cost.toLocaleString()+' coins to unlock '+name+'.');return false}s.coins=Math.max(0,num(s.coins)-cost);s.ownedSkills[name]=true}
 s.activeSkill=name;if(g&&g.player)g.player.activeSkill=name;
 const saved=persistSafe();try{if(typeof window.updateMenuSummary==='function')window.updateMenuSummary()}catch(_){}
 try{if(typeof window.renderSkills==='function')window.renderSkills()}catch(_){}
 window.OUTLAST_V443_SKILL_AUDIT={selected:name,owned:!!s.ownedSkills[name],runUpdated:!!(g&&g.player&&g.player.activeSkill===name),saved,time:Date.now()};
 say(name+' equipped. Press Q during a run.');
 return true;
}
function installSkillRoute(){
 document.addEventListener('click',e=>{
  const b=e.target&&e.target.closest?e.target.closest('[data-action="skill"]'):null;if(!b)return;
  if(typeof window.selectSkill==='function'&&window.__OUTLAST_V443_SKILL_ROUTE_READY)return;
  const name=b.getAttribute('data-value');if(!name)return;
  e.preventDefault();e.stopPropagation();chooseSkill(name);
 },true);
 const original=window.selectSkill;
 if(typeof original==='function'&&!original.__outlastV443){
  const wrapped=function(name,options){const result=original.call(this,name,options);try{const s=getSave(),g=getGame();if(result!==false&&s&&s.activeSkill===name&&g&&g.player)g.player.activeSkill=name;window.OUTLAST_V443_SKILL_AUDIT={selected:s&&s.activeSkill||null,runUpdated:!!(g&&g.player&&g.player.activeSkill===(s&&s.activeSkill)),saved:true,time:Date.now()}}catch(_){}return result};
  wrapped.__outlastV443=true;window.selectSkill=wrapped;try{selectSkill=wrapped}catch(_){}
 }
 window.__OUTLAST_V443_SKILL_ROUTE_READY=true;
}
function installMapRoute(){
 document.addEventListener('click',e=>{
  const b=e.target&&e.target.closest?e.target.closest('[data-outlast3377-map]'):null;if(!b)return;
  if(b.dataset.outlastV443Handled)return;
  const key=b.getAttribute('data-outlast3377-map');if(!key)return;
  const s=getSave();if(!s)return;
  let ok=false;try{ok=typeof window.OUTLAST_SELECT_MAP_3377==='function'?window.OUTLAST_SELECT_MAP_3377(key):false}catch(_){}
  if(ok){b.dataset.outlastV443Handled='1';return}
  // The existing picker owns normal map selection; this route only repairs a missed delegated click.
  if(typeof window.OUTLAST_MAP_PICKER_AUDIT==='function'&&window.OUTLAST_MAP_PICKER_AUDIT().open){
   const builtins=['Seizure','Ribhouse','Forest','Desert','Snow','Lava','City','Hospital','Laboratory','Subway','Prison','MilitaryBase','RuinedTown','Harbor','Bunker','Swamp','Skyscraper','Wasteland'];
   if(builtins.includes(key)||key.startsWith('CustomMap:')){
    s.map=key;persistSafe();try{if(typeof window.updateMenuSummary==='function')window.updateMenuSummary()}catch(_){}
    try{document.getElementById('outlast3377MapPickerModal')?.remove()}catch(_){}
    say('Map selected: '+key.replace(/^CustomMap:/,'Custom '));
   }
  }
 },true);
}
function addAFKLounge(){
 if(document.getElementById('outlastV443AFK'))return;
 const style=document.createElement('style');style.id='outlastV443AFKStyle';style.textContent='#outlastV443AFK{position:fixed;left:14px;right:auto;bottom:16px;z-index:39;background:#142b36;border:1px solid #4b8aa0;color:#e9fbff;border-radius:12px;padding:10px 13px;font:800 12px Arial;box-shadow:0 5px 18px #0008;display:none}#outlastV443AFKPanel{position:fixed;inset:0;z-index:2147482000;background:#061019eF;display:none;align-items:center;justify-content:center;padding:16px;box-sizing:border-box}#outlastV443AFKPanel .afk-card{width:min(560px,96vw);padding:22px;border:1px solid #3d7185;border-radius:18px;background:linear-gradient(145deg,#172a36,#0c151e);color:#f1f8fc;box-shadow:0 20px 70px #0009}#outlastV443AFKPanel p{color:#b4c8d5;line-height:1.5}#outlastV443AFKPanel button{margin:5px}@media(max-width:650px){#outlastV443AFK{left:auto;right:8px;top:58px;bottom:auto;padding:9px;font-size:11px}}';
 document.head.appendChild(style);
 const btn=document.createElement('button');btn.id='outlastV443AFK';btn.type='button';btn.textContent='☕ AFK LOUNGE';btn.title='Open the safe AFK lounge';document.body.appendChild(btn);
 const panel=document.createElement('div');panel.id='outlastV443AFKPanel';panel.innerHTML='<div class="afk-card"><h2 style="margin:0 0 8px">☕ AFK Lounge</h2><p>Take a break without accidentally spending coins or changing your loadout. Earn 100 coins for every complete minute you remain in the AFK Lounge. Coins are saved through your existing game save; AFK time does not grant XP, score, or boss progress.</p><p><b>Safety:</b> entering the lounge pauses your current run when supported. Resume only when you are ready to play again.</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" id="outlastV443AFKEnter">ENTER LOUNGE</button><button type="button" id="outlastV443AFKResume">RESUME RUN</button><button type="button" id="outlastV443AFKClose">BACK</button></div><div id="outlastV443AFKStatus" class="small" style="margin-top:8px"></div></div>';document.body.appendChild(panel);
 function open(){panel.style.display='flex'}function close(){panel.style.display='none'}
 btn.addEventListener('click',open);panel.addEventListener('click',e=>{if(e.target===panel)close()});panel.querySelector('#outlastV443AFKClose').addEventListener('click',close);panel.querySelector('#outlastV443AFKResume').addEventListener('click',()=>{const g=getGame();if(g&&'paused'in g)g.paused=false;window.OUTLAST_AFK_LOUNGE={active:false,exitedAt:Date.now(),rewarding:false};close();say('Back in the run. Good luck!')});
 panel.querySelector('#outlastV443AFKEnter').addEventListener('click',()=>{
  const g=getGame(),status=panel.querySelector('#outlastV443AFKStatus');
  if(g&&g.running){if('paused'in g)g.paused=true;else if(typeof window.togglePause==='function'){try{window.togglePause()}catch(_){}}}
  window.OUTLAST_AFK_LOUNGE={active:true,enteredAt:Date.now(),rewarding:false};
  status.textContent='AFK Lounge active. You earn 100 coins per complete minute. Use Resume Run when ready.';
  say('AFK Lounge active — 100 coins per minute.');
 });
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&panel.style.display==='flex')close()});
 // Show only after a run begins or while the main menu is visible; never cover primary controls.
 const sync=()=>{const g=getGame(),menu=document.getElementById('menu');btn.style.display=(g&&g.running)|| (menu&&getComputedStyle(menu).display!=='none')?'block':'none'};
 setInterval(()=>{try{sync()}catch(_){}},1200);sync();
}

/* v4.6.1 AFK Lounge rewards: 100 coins per complete minute actively in the lounge. */
function installAFKCoinRewards(){
 if(window.__OUTLAST_AFK_COIN_REWARDS_INSTALLED)return;
 window.__OUTLAST_AFK_COIN_REWARDS_INSTALLED=true;
 var lastPaidEntry=0,lastMinute=0;
 function tick(){
  try{
   var afk=window.OUTLAST_AFK_LOUNGE;
   if(!afk||afk.active!==true||!afk.enteredAt)return;
   if(lastPaidEntry!==afk.enteredAt){lastPaidEntry=afk.enteredAt;lastMinute=0;}
   var elapsed=Math.max(0,Date.now()-afk.enteredAt);
   var completed=Math.floor(elapsed/60000);
   if(completed<=lastMinute)return;
   var count=completed-lastMinute;
   var s=getSave();if(!s)return;
   s.coins=Math.max(0,num(s.coins))+100*count;
   lastMinute=completed;
   var saved=persistSafe();
   try{if(typeof window.updateMenuSummary==='function')window.updateMenuSummary()}catch(_){}
   try{if(typeof window.renderShop==='function')window.renderShop()}catch(_){}
   try{if(typeof window.renderProgress==='function')window.renderProgress()}catch(_){}
   say('AFK reward: +'+(100*count).toLocaleString()+' coins!');
   window.OUTLAST_AFK_REWARD_AUDIT={active:true,minutesPaid:completed,totalPaid:100*completed,coinsAdded:100*count,saved:saved,at:Date.now()};
  }catch(e){window.OUTLAST_AFK_REWARD_ERROR=String(e&&e.message||e)}
 }
 setInterval(tick,1000);
 window.OUTLAST_AFK_REWARD_AUDIT={active:false,rate:100,intervalMs:60000,totalPaid:0};
}

function audit(){
 const s=getSave(),g=getGame(),defs=(()=>{try{return typeof activeSkills!=='undefined'?activeSkills:(window.activeSkills||{})}catch(_){return window.activeSkills||{}}})();
 let mapPicker=null;try{mapPicker=window.OUTLAST_MAP_PICKER_AUDIT?window.OUTLAST_MAP_PICKER_AUDIT():null}catch(_){}
 let rarity=null;try{rarity=window.OUTLAST_RARITY_AUDIT_V441?window.OUTLAST_RARITY_AUDIT_V441():(window.OUTLAST_UPGRADE_RARITY_SCALING||null)}catch(_){}
 return {version:VERSION,skill:{selected:s&&s.activeSkill||null,owned:Object.keys(s&&s.ownedSkills||{}).filter(k=>s.ownedSkills[k]),available:Object.keys(defs),runSkill:g&&g.player&&g.player.activeSkill||null},map:{selected:s&&s.map||null,picker:mapPicker},boss:{running:!!(g&&g.running),alive:(g&&Array.isArray(g.enemies)?g.enemies:[]).filter(e=>e&&e.boss&&!e.__dead&&num(e.hp)>0).length,bossClock:g&&num(g.bossClock),interval:g&&num(g.bossIntervalMult)},rarity,afk:window.OUTLAST_AFK_LOUNGE||{active:false},saveError:window.OUTLAST_V443_SAVE_ERROR||null};
}
function install(){
 if(window.__OUTLAST_V443_INSTALLED)return;
 if(!getSave()||!getGame()||typeof window.startGame!=='function'){window.__OUTLAST_V443_RETRIES=num(window.__OUTLAST_V443_RETRIES)+1;if(window.__OUTLAST_V443_RETRIES<100)setTimeout(install,120);return}
 try{installSkillRoute();installMapRoute();addAFKLounge();installAFKCoinRewards();window.OUTLAST_V443_AUDIT=audit;window.__OUTLAST_V443_INSTALLED=true;
  if(typeof updates!=='undefined'&&Array.isArray(updates)&&!updates.some(x=>x&&String(x[0]||'').includes('v4.4.3')))updates.unshift(['v4.4.3 — Reliability & AFK Lounge','Added runtime checks for equipped skills, map selection, rarity scaling and boss state; reinforced skill click routing and introduced a safe AFK Lounge; it grants 100 coins for each complete minute spent in the lounge.']);
  if(typeof helpArticles!=='undefined'&&Array.isArray(helpArticles)&&!helpArticles.some(x=>x&&String(x[0]||'').includes('How does the AFK Lounge work?')))helpArticles.unshift(['How does the AFK Lounge work?','Controls & Safety','Open AFK Lounge from the lower-right button. It is designed for breaks and grants 100 coins per complete minute while active. It does not generate score, XP, or boss progress. The lounge attempts to pause an active run when the game exposes pause state.']);
 }catch(e){window.OUTLAST_V443_INSTALL_ERROR=String(e&&e.message||e)}
}
window.OUTLAST_V443_AUDIT=audit;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
setTimeout(install,250);setTimeout(install,1000);setTimeout(install,2500);
})();