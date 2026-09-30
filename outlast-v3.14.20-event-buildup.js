/* OUTLAST v3.14.20 — Event Build-Up System */
(function(){
  'use strict';
  if(window.__OUTLAST_EVENT_BUILDUP__) return;
  window.__OUTLAST_EVENT_BUILDUP__=true;
  const EVENT_AT=new Date('2026-10-01T00:00:00').getTime();
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
      #outlastEventBuild{position:fixed;right:18px;bottom:18px;width:min(370px,calc(100vw - 36px));z-index:99980;font-family:inherit;color:#eaf5ff}
      .oeb-card{background:linear-gradient(145deg,rgba(8,18,29,.98),rgba(13,30,43,.98));border:1px solid #315b73;border-radius:18px;box-shadow:0 16px 50px rgba(0,0,0,.45);padding:16px;backdrop-filter:blur(10px)}
      .oeb-kicker{font-size:11px;letter-spacing:2px;color:#70d7c7;font-weight:800}.oeb-title{font-size:22px;font-weight:900;margin:5px 0}.oeb-count{font-size:26px;font-weight:900;letter-spacing:1px}.oeb-sub{font-size:12px;color:#9eb2c2;margin:5px 0 12px}.oeb-bar{height:9px;background:#101b25;border-radius:99px;overflow:hidden}.oeb-fill{height:100%;width:0;background:linear-gradient(90deg,#4fc7b5,#b8e66c);transition:width .5s}.oeb-row{display:flex;gap:8px;margin-top:10px}.oeb-btn{flex:1;border:1px solid #37627a;background:#142738;color:#eaf5ff;border-radius:10px;padding:9px;cursor:pointer;font-weight:800}.oeb-btn:hover{filter:brightness(1.18)}.oeb-muted{font-size:11px;color:#849aaa}.oeb-overlay{position:fixed;inset:0;background:rgba(2,7,12,.78);z-index:99990;display:flex;align-items:center;justify-content:center;padding:18px}.oeb-modal{width:min(620px,100%);max-height:88vh;overflow:auto;background:#0b1722;border:1px solid #41677b;border-radius:20px;padding:22px;box-shadow:0 20px 80px #000}.oeb-clue{padding:10px;border:1px solid #284456;border-radius:10px;margin:7px 0;background:#101f2c}.oeb-glitch{animation:oebPulse 1.2s infinite}@keyframes oebPulse{50%{filter:brightness(1.35);transform:translateY(-1px)}}`;
    document.head.appendChild(s);
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
    const p=phase(),r=remaining(),pct=Math.min(100,state.contrib);
    const b=currentBroadcast();
    let title=p==='LIVE'?'EVENT ACTIVE':p==='FINAL'?'FINAL WARNING':'EVENT INCOMING';
    let sub=p==='LIVE'?'The access point is active.':p==='FINAL'?'Final 24-hour phase is active.':'Prepare the hub. Something is coming.';
    root.innerHTML='<div class="oeb-card '+(p==='FINAL'?'oeb-glitch':'')+'"><div class="oeb-kicker">'+title+'</div><div class="oeb-title">EVENT COUNTDOWN</div><div class="oeb-count">'+(p==='LIVE'?'00d 00h 00m 00s':format(r))+'</div><div class="oeb-sub">'+sub+'</div><div class="oeb-kicker">COMMUNITY PROGRESS</div><div class="oeb-bar"><div class="oeb-fill" style="width:'+pct+'%"></div></div><div class="oeb-sub">'+pct+'% • Investigation clues '+state.clues+'/5</div><div class="oeb-row"><button class="oeb-btn" data-investigate>INVESTIGATE</button><button class="oeb-btn" data-signal>BROADCAST</button></div><div class="oeb-row"><button class="oeb-btn" data-reward>REWARDS</button><button class="oeb-btn" data-trailer>'+(p==='LIVE'?'EVENT ACCESS':'FINAL TRANSMISSION')+'</button></div><div class="oeb-muted" style="margin-top:9px">'+(b?b[0]:'SIGNAL STANDBY')+'</div></div>';
    root.querySelector('[data-investigate]').onclick=investigate;root.querySelector('[data-signal]').onclick=showBroadcast;root.querySelector('[data-reward]').onclick=reward;root.querySelector('[data-trailer]').onclick=trailer;
  }
  function injectHub(){
    const menu=document.querySelector('#menu');
    if(!menu||document.getElementById('oebHubCard'))return;
    const host=document.createElement('div');host.id='oebHubCard';host.className='quick-card';host.innerHTML='<h3>⚠ EVENT PROTOCOL</h3><p>Something is approaching. Track the countdown, investigate signals, and prepare for activation.</p><div class="oeb-row"><button class="oeb-btn" id="oebHubInvestigate">OPEN INVESTIGATION</button></div>';
    menu.prepend(host);host.querySelector('button').onclick=investigate;
  }
  let last=0;
  function tick(){render();injectHub();if(phase()==='LIVE'&&last!=='LIVE'){last='LIVE';trailer()}else last=phase()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{tick();setInterval(tick,1000)},{once:true});else{tick();setInterval(tick,1000)}
  window.OUTLAST_EVENT_BUILDUP={investigate,showBroadcast,addClue};
})();