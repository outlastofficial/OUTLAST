(function(){
  'use strict';
  const VERSION='v3.28.1';
  function forceVersion(){
    document.querySelectorAll('.menu-chip').forEach(el=>{
      if(/SURVIVOR HUB/i.test(el.textContent||'')) el.textContent=VERSION+' • SURVIVOR HUB';
    });
    document.querySelectorAll('[data-outlast-version]').forEach(el=>{el.textContent=VERSION;});
    const meta=document.querySelector('meta[name="outlast-build"]');if(meta)meta.content=VERSION.slice(1);
    const meta2=document.querySelector('meta[name="build-version"]');if(meta2)meta2.content=VERSION.slice(1);
    document.title='OUTLAST '+VERSION;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',forceVersion,{once:true});else forceVersion();
  setTimeout(forceVersion,0);
  setTimeout(forceVersion,500);
  setTimeout(forceVersion,1500);
  setTimeout(forceVersion,3000);
})();