/* OUTLAST v3.9.3 — reliable leaderboard saving */
(() => {
  'use strict';
  const API='https://outlast-server.onrender.com';
  const KEY='outlastLeaderboardSubmitQueueV393';
  const read=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v:[]}catch(_){return[]}};
  const write=v=>{try{localStorage.setItem(KEY,JSON.stringify(v.slice(-50)))}catch(_){}};
  const sig=e=>[e?.name,e?.score,e?.level,e?.kills,e?.mode,e?.difficulty].map(x=>String(x??'')).join('|').toLowerCase();
  async function send(entry){
    const r=await fetch(API+'/api/leaderboard',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(entry),cache:'no-store'});
    if(!r.ok) throw new Error('HTTP '+r.status);
    return r.json();
  }
  async function flush(){
    const q=read(); if(!q.length)return;
    const keep=[];
    for(const entry of q){
      try{await send(entry)}catch(_){keep.push(entry)}
    }
    write(keep);
  }
  window.submitServerLeaderboard=async function(entry){
    try{return await send(entry)}
    catch(_){
      const q=read(), s=sig(entry);
      if(!q.some(x=>sig(x)===s)){q.push(entry);write(q)}
      try{toast('Leaderboard save queued — it will retry automatically.')}catch(_){}
      return null;
    }
  };
  window.OUTLAST_FLUSH_LEADERBOARD=flush;
  const start=()=>{flush();setInterval(flush,15000)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  window.addEventListener('online',flush);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)flush()});
})();
