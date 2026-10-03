/* OUTLAST v3.27.101 — authoritative version marker */
(function(){
  'use strict';
  const VERSION='v3.27.101';
  function apply(){
    document.querySelectorAll('.menu-chip').forEach(el=>{
      if(/SURVIVOR HUB/i.test(el.textContent||''))el.textContent=VERSION+' • SURVIVOR HUB';
    });
    document.querySelectorAll('[data-outlast-version]').forEach(el=>{el.textContent=VERSION;});
    const m=document.querySelector('meta[name="outlast-build"]');if(m)m.content=VERSION.slice(1);
    const m2=document.querySelector('meta[name="build-version"]');if(m2)m2.content=VERSION.slice(1);
    document.title='OUTLAST '+VERSION;
    window.OUTLAST_BUILD=VERSION.slice(1);
    window.OUTLAST_VERSION=VERSION;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
  [0,100,500,1500,3000,5000].forEach(ms=>setTimeout(apply,ms));
})();