/* OUTLAST v3.27.104 — Event Launch Readiness Preflight */
(() => {
  'use strict';
  if (window.__OUTLAST_EVENT_PREFLIGHT__) return;
  window.__OUTLAST_EVENT_PREFLIGHT__ = true;
  const API='https://outlast-test-server.onrender.com';
  const checks={};
  const tester=/outlast-test(?:\.onrender\.com)?$/i.test(location.hostname);
  async function checkEndpoint(name,path){
    try{
      const r=await fetch(API+path+(path.includes('?')?'&':'?')+'preflight='+Date.now(),{cache:'no-store',headers:{'Cache-Control':'no-cache'}});
      const data=await r.json().catch(()=>null);
      checks[name]={ok:r.ok,status:r.status,data};
      return checks[name];
    }catch(error){checks[name]={ok:false,error:String(error?.message||error)};return checks[name];}
  }
  async function run(){
    const target=Number(window.OUTLAST_EVENT_TARGET_MS||0),remaining=target-Date.now();
    checks.mode={tester,ok:true};
    checks.canonicalTarget={ok:Number.isFinite(target)&&target>0,targetMs:target,targetIso:target>0?new Date(target).toISOString():null};
    checks.countdown={ok:typeof window.OUTLAST_EVENT_TARGET_MS==='number',timerInstalled:!!window.__outlastCountdownTimer,testerOneMinute:tester?remaining<=60000: true};
    if(!tester)await checkEndpoint('eventState','/api/event/state');
    await checkEndpoint('health','/api/health');
    checks.overall=Object.values(checks).every(v=>v?.ok!==false);
    window.OUTLAST_EVENT_READINESS={version:'3.27.104',checkedAt:Date.now(),checks:{...checks}};
    return window.OUTLAST_EVENT_READINESS;
  }
  window.OUTLAST_EVENT_PREFLIGHT={run,checks};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{run().catch(()=>{});},{once:true});else run().catch(()=>{});
})();