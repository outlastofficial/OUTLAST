/* OUTLAST v3.14.22 — Event Build-Up System */
(function(){
  'use strict';
  if(window.__OUTLAST_EVENT_BUILDUP__) return;
  window.__OUTLAST_EVENT_BUILDUP__=true;
  const EVENT_AT=new Date('2026-10-03T15:00:00Z').getTime();
  const FINAL_WINDOW=24*60*60*1000;
  const KEY='outlastEventBuildupV320';
  const state=JSON.parse(localStorage.getItem(KEY)||'{"clues":0,"contrib":0,"rewardClaimed":false,"broadcasts":[]}');
  const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
  const pad=n=>String(n).padStart(2,'0');
  const remaining=()=>Math.max(0,EVENT_AT-Date.now());
  const phase=()=>remaining()===0?'LIVE':remaining()<=FINAL_WINDOW?'FINAL':'BUILDUP';
  const broadcasts=[
    ['SIGNAL DETECTED...','Something has started transmitting beneath the OUTLAST network.'],
    ['...CAN ANYONE HEAR THIS?','The signal is getting stronger. Stay alert.'],
    ['THEY KNOW WE\'RE HERE.','Unknown activity has been detected near the event access point.'],
    ['PROTOCOL ACTIVATION PENDING.','All survivors: prepare for an incoming event.']
  ];
  const clueNames=['Broken Signal Fragment','Unknown Coordinate','Damaged Access Key','Encrypted Warning','Strange Symbol'];
  const rewards=['EVENT SCOUT','Signal Frame','Event Coin Cache'];
  function css(){
    if(document.getElementById('eventBuildCss'))return;
    const s=document.createElement('style');s.id='eventBuildCss';s.textContent=`
      #outlastEventBuild{position:fixed;right:12px;bottom:14px;width:auto;z-index:99980;font-family:inherit;color:#eaf5ff;pointer-events:none}
      .oeb-card{display:flex;align-items:center;gap:7px;background:rgba(8,18,29,.88);border:1px solid rgba(49,91,115,.75);border-radius:999px;padding:5px 6px 5px 9px;box-shadow:0 5px 18px rgba(0,0,0,.22);backdrop-filter:blur(6px);max-width:210px;pointer-events:auto}
      .oeb-kicker{display:none}.oeb-title{font-size:10px;font-weight:900;white-space:nowrap;letter-spacing:.3px}.oeb-count{font-size:10px;font-weight:800;letter-spacing:.2px;white-space:nowrap;color:#9eb8ca}.oeb-sub,.oeb-bar,.oeb-fill,.oeb-muted{display:none}
      .oeb-row{display:flex;gap:4px;margin:0}.oeb-btn{border:1px solid #37627a;background:#142738;color:#eaf5ff;border-radius:999px;padding:5px 7px;cursor:pointer;font-size:9px;font-weight:800;white-space:nowrap}.oeb-btn:hover{filter:brightness(1.15)}
      .oeb-overlay{position:fixed;inset:0;background:rgba(2,7,12,.78);z-index:99990;display:flex;align-items:center;justify-content:center;padding:18px}.oeb-modal{width:min(620px,100%);max-height:88vh;overflow:auto;background:#0b1722;border:1px solid #41677b;border-radius:20px;padding:22px;box-shadow:0 20px 80px #000}.oeb-clue{padding:10px;border:1px solid #284456;border-radius:10px;margin:7px 0;background:#101f2c}
      .oeb-glitch{animation:oebPulse 1.2s infinite}@keyframes oebPulse{50%{filter:brightness(1.35);transform:translateY(-1px)}}
      @media(max-width:700px){#outlastEventBuild{right:8px;bottom:64px;left:auto}.oeb-card{max-width:180px}.oeb-title{font-size:9px}.oeb-count{font-size:9px}.oeb-btn{padding:5px 6px}}
    `;document.head.appendChild(s);
  }
  function format(ms){let sec=Math.floor(ms/1000),d=Math.floor(sec/86400);sec%=86400;let h=Math.floor(sec/3600);sec%=3600;let m=Math.floor(sec/60);sec%=60;return d+'d '+pad(h)+'h '+pad(m)+'m '+pad(sec)+'s'}
  function currentBroadcast(){
    const days=Math.ceil(remaining()/86400000);
    return broadcasts[Math.min(3,Math.max(0,3-days))];
  }
  function openModal(title,body){
    const o=document.createElement('div');o.className='oeb-overlay';o.innerHTML='<div class="oeb-modal"><div class="oeb-kicker">OUTLAST EVENT PROTOCOL</div><h2>'+title+'</h2><div>'+body+'</div><div class="oeb-row"><button class="oeb-btn" data-close>CLOSE</button></div></div>';
    document.body.appendChild(o);o.addEventListener('click',e=>{if(e.target===o||e.target.closest('[data-close]'))o.remove()});
  }
  function addClue(){
    if(remaining()===0){openModal('EVENT ACTIVE','The investigation phase is over. The event access point is now active.');return}
    const last=Number(localStorage.getItem(KEY+'_clueTime')||0);
    if(Date.now()-last<6*60*60*1000){openModal('NO NEW SIGNAL','The scanner needs time to recover. Check back later.');return}
    const clue=clueNames[Math.min(state.clues,clueNames.length-1)];
    state.clues=Math.min(5,state.clues+1);state.contrib=Math.min(100,state.contrib+5);
    localStorage.setItem(KEY+'_clueTime',String(Date.now()));save();
    openModal('CLUE RECOVERED','<div class="oeb-clue"><b>'+clue+'</b><br><span class="oeb-muted">A new piece of the event mystery has been added to your investigation.</span></div><p>Investigation progress: <b>'+state.clues+'/5</b></p>');
    render();
  }
  function investigate(){
    const list=clueNames.map((x,i)=>'<div class="oeb-clue">'+(i<state.clues?'✓ ':'? ')+x+'</div>').join('');
    const reward=state.clues>=5?'<p><b>Investigation complete.</b> Your pre-event reward is ready.</p>':'<p>Find all 5 clues to complete the investigation.</p>';
    openModal('EVENT INVESTIGATION',list+reward+'<div class="oeb-row"><button class="oeb-btn" data-clue>SCAN FOR CLUE</button></div>');
    const m=document.querySelector('.oeb-overlay:last-child');m?.querySelector('[data-clue]')?.addEventListener('click',()=>{m.remove();addClue()});
  }
  function showBroadcast(){
    const b=currentBroadcast()||broadcasts[3];
    openModal('INCOMING TRANSMISSION','<div class="oeb-clue oeb-glitch"><b>'+b[0]+'</b><br>'+b[1]+'</div><p class="oeb-muted">More transmissions unlock as the countdown approaches zero.</p>');
  }
  function trailer(){
    openModal('PROTOCOL ACTIVATION','<div class="oeb-clue oeb-glitch"><b>SIGNAL LOCKED.</b><br><br>ACCESS POINT ONLINE.<br>ALL SYSTEMS STANDBY.<br><br><b>EVENT STARTING...</b></div><p>This sequence is the final pre-event transmission.</p>');
  }
  function reward(){
    if(state.clues<5){openModal('REWARD LOCKED','Complete the Event Investigation first.');return}
    if(state.rewardClaimed){openModal('ALREADY CLAIMED','Your event preparation reward has already been claimed.');return}
    state.rewardClaimed=true;save();openModal('REWARD UNLOCKED','<div class="oeb-clue"><b>'+rewards[0]+'</b><br>Investigation completed. Your event preparation reward has been recorded.</div>');
    render();
  }
  function render(){
    css();
    let root=document.getElementById('outlastEventBuild');
    if(!root){root=document.createElement('div');root.id='outlastEventBuild';document.body.appendChild(root)}
    const p=phase(),r=remaining();
    const title=p==='LIVE'?'EVENT LIVE':p==='FINAL'?'FINAL WARNING':'EVENT';
    root.innerHTML='<div class="oeb-card '+(p==='FINAL'?'oeb-glitch':'')+'"><span class="oeb-title">'+title+'</span><span class="oeb-count">'+(p==='LIVE'?'LIVE':format(r))+'</span><div class="oeb-row"><button class="oeb-btn" data-open>DETAILS</button></div></div>';
    root.querySelector('[data-open]').onclick=()=>openDetails();
  }
  function openDetails(){
    const p=phase(),r=remaining(),pct=Math.min(100,state.contrib),b=currentBroadcast();
    openModal('EVENT PROTOCOL','<p><b>'+(p==='LIVE'?'EVENT ACTIVE':p==='FINAL'?'FINAL 24-HOUR WARNING':'EVENT INCOMING')+'</b></p><p>Countdown: <b>'+(p==='LIVE'?'LIVE':format(r))+'</b></p><div class="oeb-clue">Investigation: <b>'+state.clues+'/5 clues</b></div><div class="oeb-clue">Community progress: <b>'+pct+'%</b></div><p class="oeb-muted" style="display:block">'+(b?b[0]:'SIGNAL STANDBY')+'</p><div class="oeb-row"><button class="oeb-btn" data-investigate>INVESTIGATE</button><button class="oeb-btn" data-signal>BROADCAST</button><button class="oeb-btn" data-reward>REWARD</button><button class="oeb-btn" data-trailer>ACCESS</button></div>');
    const m=document.querySelector('.oeb-overlay:last-child');
    if(!m)return;
    m.querySelector('[data-investigate]').onclick=()=>{m.remove();investigate()};
    m.querySelector('[data-signal]').onclick=()=>{m.remove();showBroadcast()};
    m.querySelector('[data-reward]').onclick=()=>{m.remove();reward()};
    m.querySelector('[data-trailer]').onclick=()=>{m.remove();trailer()};
  }
  let last=0;
  function tick(){render();if(phase()==='LIVE'&&last!=='LIVE'){last='LIVE';trailer()}else last=phase()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{tick();setInterval(tick,1000)},{once:true});else{tick();setInterval(tick,1000)}
  window.OUTLAST_EVENT_BUILDUP={investigate,showBroadcast,addClue};
})();