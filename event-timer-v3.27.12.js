/* OUTLAST v3.27.104 — tester event countdown */
(() => {
  'use strict';
  const TEST_TARGET_MS=Date.now()+60000;
  window.OUTLAST_EVENT_TARGET_MS=TEST_TARGET_MS;
  window.OUTLAST_EVENT_TARGET_ISO=new Date(TEST_TARGET_MS).toISOString();
  function formatCountdown(ms){ms=Math.max(0,Number(ms)||0);if(ms<=0)return '🎃 TEST EVENT LIVE!';const total=Math.floor(ms/1000),m=Math.floor(total/60),sec=total%60;return String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0');}
  function ensureBox(id,html,style){let el=document.getElementById(id);if(!el){el=document.createElement('div');el.id=id;el.style.cssText=style;el.innerHTML=html;document.body.appendChild(el);}return el;}
  function install(){
    ['outlastEventCountdown','outlastMenuCountdown'].forEach(id=>{const old=document.getElementById(id);if(old)old.remove();});
    try{if(window.__outlastCountdownTimer)clearInterval(window.__outlastCountdownTimer);}catch(_){}
    const top=ensureBox('outlastEventCountdown','', 'position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:99999;background:rgba(10,14,20,.97);border:2px solid #d6a84f;border-radius:12px;padding:8px 14px;color:#fff;font:700 14px Arial,sans-serif;text-align:center;box-shadow:0 5px 22px rgba(0,0,0,.45);pointer-events:none;min-width:210px;display:block;visibility:visible;opacity:1;');
    const menu=document.getElementById('menu');
    if(menu){
      const box=ensureBox('outlastMenuCountdown','<div style="font-weight:900;letter-spacing:1.5px;color:#d6a84f;font-size:12px">🧪 OUTLAST EVENT TEST</div><div id="outlastMenuEventTime" style="font-size:21px;font-weight:900;margin-top:4px">01:00</div><div style="font-size:11px;color:#9eb0c1;margin-top:3px">1-minute tester countdown</div>', 'margin:10px 0 12px;padding:12px 14px;border:2px solid #d6a84f;border-radius:14px;background:#111820;box-shadow:0 8px 28px rgba(0,0,0,.25);text-align:center;display:block;visibility:visible;opacity:1;position:relative;z-index:5;pointer-events:none;');
      const summary=document.getElementById('menuSummary');if(summary&&box.parentNode===document.body)summary.insertAdjacentElement('afterend',box);
    }
    const update=()=>{const value=formatCountdown(TEST_TARGET_MS-Date.now());top.innerHTML='<div style="color:#d6a84f;font-size:11px;letter-spacing:1px">OUTLAST EVENT TEST</div><div style="font-size:18px;margin-top:2px">'+value+'</div>';const mini=document.getElementById('outlastMenuEventTime');if(mini)mini.textContent=value;};
    update();window.__outlastCountdownTimer=setInterval(update,1000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();