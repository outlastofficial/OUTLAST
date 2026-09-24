/* OUTLAST v3.3.0 reliability + Daily Challenge layer */
(() => {
  'use strict';
  const VERSION='3.3.0';
  const SERVER_KEY='outlastServerUrl';
  const QUEUE_KEY='outlastLeaderboardQueueV2';
  const CHALLENGE_KEY='outlastDailyChallengeV1';

  const serverUrl=()=>{try{return localStorage.getItem(SERVER_KEY)||''}catch(_){return ''}};
  const clean=(v,n)=>String(v??'').trim().slice(0,n);

  function dayKey(d=new Date()){
    return d.getUTCFullYear()+'-'+String(d.getUTCMonth()+1).padStart(2,'0')+'-'+String(d.getUTCDate()).padStart(2,'0');
  }
  function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
  function todayChallenge(){
    const key=dayKey(), seed=hash('OUTLAST:'+key);
    const modifiers=[
      ['Blackout Protocol','Visibility is reduced during blackout events.'],
      ['Elite Surge','Elite encounters appear more frequently.'],
      ['Rapid Waves','Wave pacing is increased.'],
      ['Fragile Run','Healing is less effective; pickups remain unchanged.'],
      ['Treasure Hunt','Extra pickup opportunities appear.'],
      ['Endurance','The goal is to survive as long as possible.']
    ];
    const m=modifiers[seed%modifiers.length];
    return {date:key,seed,modifier:m[0],description:m[1],version:VERSION};
  }

  function queueRead(){try{const q=JSON.parse(localStorage.getItem(QUEUE_KEY)||'[]');return Array.isArray(q)?q:[]}catch(_){return[]}}
  function queueWrite(q){try{localStorage.setItem(QUEUE_KEY,JSON.stringify(q.slice(-20)))}catch(_){}}
  async function flushQueue(){
    const base=serverUrl(); if(!base||!navigator.onLine)return;
    const q=queueRead(); if(!q.length)return;
    const keep=[];
    for(const item of q){
      try{
        const r=await fetch(base.replace(/\/$/,'')+'/api/leaderboard',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(item)});
        if(!r.ok)throw new Error('HTTP '+r.status);
      }catch(_){keep.push(item)}
    }
    queueWrite(keep);
  }

  const nativeFetch=window.fetch;
  if(nativeFetch&&!window.__outlastV330FetchWrapped){
    window.__outlastV330FetchWrapped=true;
    window.fetch=async function(input,init){
      const url=typeof input==='string'?input:(input&&input.url)||'';
      const result=await nativeFetch.apply(this,arguments);
      if(/\/api\/leaderboard$/.test(url)&&init&&String(init.method||'GET').toUpperCase()==='POST'&&!result.ok){
        try{
          const body=typeof init.body==='string'?JSON.parse(init.body):null;
          if(body){const q=queueRead();q.push({...body,queuedAt:Date.now()});queueWrite(q)}
        }catch(_){}
      }
      return result;
    };
  }

  function challengeCard(){
    const c=todayChallenge();
    const old=document.getElementById('outlastDailyChallengeV330');
    if(old)old.remove();
    const wrap=document.createElement('div');
    wrap.id='outlastDailyChallengeV330';
    wrap.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;padding:18px;box-sizing:border-box';
    wrap.innerHTML='<div style="max-width:520px;width:100%;background:#10151b;border:1px solid #3c4652;border-radius:16px;padding:22px;box-shadow:0 20px 70px rgba(0,0,0,.5);color:#fff;font-family:Arial,sans-serif"><div style="font-size:12px;opacity:.65">OUTLAST DAILY CHALLENGE · '+c.date+'</div><h2 style="margin:7px 0 8px">🎯 '+c.modifier+'</h2><p style="opacity:.9;line-height:1.45;margin:0 0 16px">'+c.description+'</p><div style="font-size:12px;opacity:.65;margin-bottom:14px">Challenge seed: '+c.seed+'</div><button id="outlastDailyClose330" style="width:100%;padding:12px;border:0;border-radius:10px;background:#2d7cff;color:#fff;font-weight:700;cursor:pointer">Close</button></div>';
    document.body.appendChild(wrap);
    const close=()=>wrap.remove();
    document.getElementById('outlastDailyClose330').onclick=close;
    wrap.addEventListener('click',e=>{if(e.target===wrap)close()});
    try{localStorage.setItem(CHALLENGE_KEY,JSON.stringify(c))}catch(_){}
  }

  function wire(){
    const candidates=[...document.querySelectorAll('#dailyChallengeBtn,[data-action="daily-challenge"],button')];
    const btn=candidates.find(x=>/daily challenge|today challenge/i.test(x.textContent||''));
    if(btn&&!btn.__v330){btn.__v330=true;btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();challengeCard()})}
    const discord=[...document.querySelectorAll('#discordBtn,a')].find(x=>/discord/i.test(x.textContent||''));
    if(discord){discord.href='https://discord.gg/bCMdZfggQ';discord.target='_blank';discord.rel='noopener noreferrer'}
  }

  function outsideClose(){
    document.addEventListener('click',e=>{
      const t=e.target;
      if(!(t instanceof Element))return;
      const panel=t.closest('.modal,.popup,.overlay,[role="dialog"],.dialog');
      if(!panel||panel===document.body)return;
      if(e.target!==panel&&panel.contains(e.target))return;
      if(e.target===panel){
        const close=panel.querySelector('[data-close],.close-btn,.close,[aria-label*="close" i]');
        if(close)close.click();
      }
    },true);
  }

  window.OUTLAST_V330={version:VERSION,todayChallenge,flushLeaderboardQueue:flushQueue,showDailyChallenge:challengeCard};
  window.addEventListener('online',flushQueue);
  document.addEventListener('DOMContentLoaded',()=>{wire();outsideClose();flushQueue()});
  setTimeout(wire,1000);
  setTimeout(wire,3000);
})();
