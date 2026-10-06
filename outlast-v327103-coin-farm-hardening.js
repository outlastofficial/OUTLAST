/* OUTLAST v3.27.103 — repeat-run coin farm hardening */
(function(){
  'use strict';
  if(window.__outlastCoinFarmGuard327103)return;
  window.__outlastCoinFarmGuard327103=true;
  const MIN_REWARD_TIME=20,MIN_REWARD_KILLS=6,FAST_REPEAT_WINDOW=25000,FAST_RUN_LIMIT=90;
  function storage(){try{return typeof outlastStorage!=='undefined'?outlastStorage:localStorage;}catch(_){return null;}}
  function lastPayout(){const st=storage();try{return Number(st?.getItem('outlastCoinGuardLastPayoutAt')||0)||0;}catch(_){return Number(window.__outlastCoinGuardLastPayoutAt)||0;}}
  function setLastPayout(t){window.__outlastCoinGuardLastPayoutAt=t;const st=storage();try{st?.setItem('outlastCoinGuardLastPayoutAt',String(t));}catch(_){}}
  function install(){
    if(typeof endRun!=='function'||window.__outlastCoinFarmGuardInstalled)return;
    window.__outlastCoinFarmGuardInstalled=true;
    const originalEndRun=endRun;
    window.endRun=function(victory,recordScore=true,showEnd=true){
      if(typeof game==='undefined'||typeof run==='undefined'||!game?.running)return originalEndRun(victory,recordScore,showEnd);
      const duration=Math.max(0,Number(game.time)||0),kills=Math.max(0,Number(run.kills)||0),payout=Math.max(0,Number(run.coins)||0),now=Date.now();
      const last=lastPayout();
      const rapidRepeat=(last>0&&now-last<FAST_REPEAT_WINDOW&&duration<FAST_RUN_LIMIT);
      const meaningfulRun=duration>=MIN_REWARD_TIME&&kills>=MIN_REWARD_KILLS;
      if(payout>0&&(!meaningfulRun||rapidRepeat)){
        run.coins=0;game.__coinGuardSuppressed=true;
        try{toast('● Run coin payout blocked: '+(rapidRepeat?'rapid repeat run':'very short run')+'. Play a little longer before farming coins.');}catch(_){}
      }else if(payout>0){
        setLastPayout(now);game.__coinGuardSuppressed=false;
      }
      if(typeof updates!=='undefined'&&Array.isArray(updates)&&!updates.some(x=>Array.isArray(x)&&String(x[0]).includes('Coin Farm Hardening'))){
        updates.unshift(['v3.27.103 — Coin Farm Hardening','Hardened rapid repeat-run coin rewards so very short farming loops do not generate normal run coin payouts.']);
      }
      if(typeof helpArticles!=='undefined'&&Array.isArray(helpArticles)&&!helpArticles.some(x=>Array.isArray(x)&&String(x[0]).includes('repeat-run coin farming'))){
        helpArticles.unshift(['How are repeat-run coin farms handled?','Progression','Very short runs and rapid repeat runs may have their run coin payout blocked. Normal-length runs continue to earn coins normally.']);
      }
      return originalEndRun(victory,recordScore,showEnd);
    };
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  [0,100,500,1500].forEach(ms=>setTimeout(install,ms));
})();