/* OUTLAST v3.14.19 — Unified Juice / Animation System
   Safe visual layer: gameplay rules stay unchanged. Exposes OUTLASTFX for existing systems.
*/
(function(){
  'use strict';
  if(window.OUTLASTFX && window.OUTLASTFX.version==='3.14.19') return;

  const state={last:0, reduced:false};
  try{state.reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches}catch(_){}

  const css = `
  #outlastFxLayer{position:fixed;inset:0;pointer-events:none;z-index:9990;overflow:hidden}
  .olf-flash{position:absolute;inset:0;opacity:0;background:radial-gradient(circle at 50% 50%,rgba(255,255,255,.2),transparent 55%);animation:olfFlash .28s ease-out forwards}
  .olf-flash.gold{background:radial-gradient(circle,rgba(255,220,110,.3),transparent 55%)}
  .olf-flash.danger{background:radial-gradient(circle,rgba(255,70,70,.24),transparent 60%)}
  .olf-ring{position:absolute;width:24px;height:24px;border:2px solid rgba(130,210,255,.95);border-radius:50%;transform:translate(-50%,-50%);animation:olfRing .48s cubic-bezier(.2,.7,.2,1) forwards}
  .olf-ring.gold{border-color:rgba(255,215,90,.98)}
  .olf-ring.danger{border-color:rgba(255,100,100,.95)}
  .olf-particle{position:absolute;width:7px;height:7px;border-radius:50%;background:#fff;transform:translate(-50%,-50%);animation:olfParticle .65s ease-out forwards}
  .olf-particle.gold{background:#ffd85a}.olf-particle.blue{background:#73cfff}.olf-particle.green{background:#65e59b}
  .olf-text{position:absolute;transform:translate(-50%,-50%);font:900 20px Arial,sans-serif;letter-spacing:.04em;text-shadow:0 2px 8px #000;animation:olfText .72s ease-out forwards;white-space:nowrap}
  .olf-text.crit{font-size:28px}.olf-text.gold{color:#ffe16b}.olf-text.blue{color:#83d8ff}.olf-text.green{color:#7ff0a9}.olf-text.red{color:#ff8b8b}
  .olf-level{position:absolute;left:50%;top:42%;transform:translate(-50%,-50%) scale(.7);font:1000 46px Arial,sans-serif;letter-spacing:.12em;color:#fff;text-shadow:0 0 26px rgba(110,205,255,.9),0 4px 20px #000;animation:olfLevel .9s cubic-bezier(.12,.8,.18,1) forwards;white-space:nowrap}
  .olf-reveal{position:absolute;left:50%;top:50%;width:min(430px,80vw);padding:24px;border-radius:20px;text-align:center;background:linear-gradient(145deg,rgba(24,37,51,.97),rgba(8,14,20,.97));border:1px solid rgba(120,190,240,.65);box-shadow:0 25px 80px rgba(0,0,0,.55);transform:translate(-50%,-50%) scale(.82);opacity:0;animation:olfReveal .8s cubic-bezier(.15,.8,.2,1) forwards;box-sizing:border-box}
  .olf-reveal .k{font:900 11px Arial,sans-serif;letter-spacing:.18em;color:#8bcfff}.olf-reveal .v{font:1000 30px Arial,sans-serif;margin-top:8px}
  .olf-boss{position:absolute;left:50%;top:10%;transform:translateX(-50%) translateY(-20px);width:min(720px,88vw);text-align:center;opacity:0;animation:olfBoss .8s ease-out forwards}
  .olf-boss .label{font:1000 12px Arial,sans-serif;letter-spacing:.25em;color:#ff9a9a}.olf-boss .name{font:1000 34px Arial,sans-serif;margin:4px 0;text-shadow:0 4px 18px #000}.olf-boss .bar{height:9px;border-radius:999px;background:rgba(255,255,255,.12);overflow:hidden;border:1px solid rgba(255,120,120,.35)}.olf-boss .bar i{display:block;width:100%;height:100%;background:linear-gradient(90deg,#d94a4a,#ffb04a)}
  .olf-chest{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(.6);font-size:72px;opacity:0;animation:olfChest .9s cubic-bezier(.15,.85,.2,1) forwards;filter:drop-shadow(0 0 24px rgba(255,210,80,.55))}
  .olf-synergy{position:absolute;left:50%;top:34%;transform:translate(-50%,-50%);font:1000 26px Arial,sans-serif;letter-spacing:.1em;color:#9de7ff;text-shadow:0 0 24px rgba(90,200,255,.9),0 4px 15px #000;animation:olfSynergy 1s ease-out forwards;white-space:nowrap}
  .olf-dash{position:absolute;height:3px;width:90px;background:linear-gradient(90deg,transparent,#9be2ff,transparent);transform-origin:center;opacity:.8;animation:olfDash .28s ease-out forwards}
  .olf-ripple{position:absolute;width:10px;height:10px;border:2px solid rgba(145,215,255,.7);border-radius:50%;transform:translate(-50%,-50%);animation:olfRipple .45s ease-out forwards}
  .olf-shake{animation:olfShake .24s linear}
  .olf-card-in{animation:olfCardIn .42s cubic-bezier(.15,.8,.2,1) both}
  .olf-card-selected{animation:olfCardSelected .55s ease-out both}
  .olf-flip{animation:olfFlip .55s ease-in-out both}
  @keyframes olfFlash{0%{opacity:0}18%{opacity:1}100%{opacity:0}}
  @keyframes olfRing{0%{width:16px;height:16px;opacity:1}100%{width:150px;height:150px;opacity:0}}
  @keyframes olfParticle{0%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(.2)}}
  @keyframes olfText{0%{opacity:0;transform:translate(-50%,-30%) scale(.65)}18%{opacity:1}100%{opacity:0;transform:translate(-50%,-145%) scale(1.08)}}
  @keyframes olfLevel{0%{opacity:0;transform:translate(-50%,-50%) scale(.55)}18%{opacity:1;transform:translate(-50%,-50%) scale(1.12)}70%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-72%) scale(1.04)}}
  @keyframes olfReveal{0%{opacity:0;transform:translate(-50%,-50%) scale(.72) rotateX(18deg)}35%{opacity:1;transform:translate(-50%,-50%) scale(1.04) rotateX(0)}100%{opacity:0;transform:translate(-50%,-50%) scale(1) rotateX(0)}}
  @keyframes olfBoss{0%{opacity:0;transform:translateX(-50%) translateY(-24px) scale(.94)}25%{opacity:1}100%{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}}
  @keyframes olfChest{0%{opacity:0;transform:translate(-50%,-50%) scale(.5) rotate(-8deg)}25%{opacity:1;transform:translate(-50%,-50%) scale(1.08) rotate(5deg)}65%{opacity:1;transform:translate(-50%,-50%) scale(1) rotate(0)}100%{opacity:0;transform:translate(-50%,-65%) scale(1.05)}}
  @keyframes olfSynergy{0%{opacity:0;transform:translate(-50%,-50%) scale(.7)}20%{opacity:1;transform:translate(-50%,-50%) scale(1.08)}75%{opacity:1}100%{opacity:0;transform:translate(-50%,-80%) scale(1)}}
  @keyframes olfShake{0%,100%{transform:translate(0)}25%{transform:translate(-4px,2px)}50%{transform:translate(4px,-2px)}75%{transform:translate(-2px,-1px)}}
  @keyframes olfCardIn{from{opacity:0;transform:translateY(14px) scale(.96)}to{opacity:1;transform:none}}
  @keyframes olfCardSelected{0%{transform:scale(1)}25%{transform:scale(1.06);filter:brightness(1.3)}100%{transform:scale(1);filter:none}}
  @keyframes olfFlip{0%{transform:perspective(500px) rotateY(0)}50%{transform:perspective(500px) rotateY(90deg);filter:brightness(1.5)}100%{transform:perspective(500px) rotateY(0)}}
  @keyframes olfDash{from{opacity:0;transform:rotate(var(--rot)) scaleX(.2)}35%{opacity:.9}to{opacity:0;transform:rotate(var(--rot)) translateX(70px) scaleX(1)}}
  @keyframes olfRipple{from{opacity:.8;width:8px;height:8px}to{opacity:0;width:80px;height:80px}}
  @media(prefers-reduced-motion:reduce){.olf-flash,.olf-ring,.olf-particle,.olf-text,.olf-level,.olf-reveal,.olf-boss,.olf-chest,.olf-synergy,.olf-dash,.olf-ripple,.olf-shake,.olf-card-in,.olf-card-selected,.olf-flip{animation-duration:.01ms!important;animation-iteration-count:1!important}}
  `;

  function install(){
    if(!document.getElementById('outlastFxStyle')){
      const s=document.createElement('style');s.id='outlastFxStyle';s.textContent=css;document.head.appendChild(s);
    }
    if(!document.getElementById('outlastFxLayer')){
      const d=document.createElement('div');d.id='outlastFxLayer';document.body.appendChild(d);
    }
  }
  function layer(){install();return document.getElementById('outlastFxLayer')}
  function pos(x,y){
    if(typeof x==='object'&&x){return {x:Number(x.clientX??x.x??innerWidth/2),y:Number(x.clientY??x.y??innerHeight/2)}}
    return {x:Number(x??innerWidth/2),y:Number(y??innerHeight/2)}
  }
  function once(el,cls,ms=650){if(!el)return;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);setTimeout(()=>el.classList.remove(cls),ms)}
  function flash(kind){const d=document.createElement('div');d.className='olf-flash '+(kind||'');layer().appendChild(d);setTimeout(()=>d.remove(),360)}
  function ring(x,y,kind){const p=pos(x,y),d=document.createElement('div');d.className='olf-ring '+(kind||'');d.style.left=p.x+'px';d.style.top=p.y+'px';layer().appendChild(d);setTimeout(()=>d.remove(),550)}
  function particles(x,y,count=12,kind='blue'){const p=pos(x,y),root=layer();for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,dist=35+Math.random()*90,d=document.createElement('div');d.className='olf-particle '+kind;d.style.left=p.x+'px';d.style.top=p.y+'px';d.style.setProperty('--dx',Math.cos(a)*dist+'px');d.style.setProperty('--dy',Math.sin(a)*dist+'px');root.appendChild(d);setTimeout(()=>d.remove(),720)}}
  function text(v,x,y,kind='blue',extra=''){const p=pos(x,y),d=document.createElement('div');d.className='olf-text '+kind+' '+extra;d.textContent=String(v);d.style.left=p.x+'px';d.style.top=p.y+'px';layer().appendChild(d);setTimeout(()=>d.remove(),800)}
  function pulse(el){once(el,'olf-card-selected',600)}
  function screenShake(){once(document.documentElement,'olf-shake',260)}
  function levelUp(){flash('gold');ring(innerWidth/2,innerHeight*.44,'gold');particles(innerWidth/2,innerHeight*.44,24,'gold');const d=document.createElement('div');d.className='olf-level';d.textContent='LEVEL UP!';layer().appendChild(d);setTimeout(()=>d.remove(),1000)}
  function reveal(title,rarity='LEGENDARY'){const d=document.createElement('div');d.className='olf-reveal';d.innerHTML='<div class="k">'+String(rarity).toUpperCase()+' REVEAL</div><div class="v"></div>';d.querySelector('.v').textContent=String(title);layer().appendChild(d);setTimeout(()=>d.remove(),950)}
  function boss(name='BOSS'){flash('danger');screenShake();const d=document.createElement('div');d.className='olf-boss';d.innerHTML='<div class="label">WARNING • ELITE THREAT</div><div class="name"></div><div class="bar"><i></i></div>';d.querySelector('.name').textContent=String(name);layer().appendChild(d);setTimeout(()=>d.remove(),1800)}
  function reward(kind='CHEST'){flash('gold');particles(innerWidth/2,innerHeight/2,28,'gold');const d=document.createElement('div');d.className='olf-chest';d.textContent=kind==='chest'?'🎁':'✦';layer().appendChild(d);setTimeout(()=>d.remove(),1000)}
  function synergy(name='SYNERGY ACTIVATED'){particles(innerWidth/2,innerHeight*.34,20,'blue');const d=document.createElement('div');d.className='olf-synergy';d.textContent=String(name);layer().appendChild(d);setTimeout(()=>d.remove(),1100)}
  function dash(){flash();for(let i=0;i<4;i++){const d=document.createElement('div');d.className='olf-dash';d.style.left=(innerWidth*.5+Math.random()*100-50)+'px';d.style.top=(innerHeight*.55+Math.random()*100-50)+'px';d.style.setProperty('--rot',(Math.random()*80-40)+'deg');layer().appendChild(d);setTimeout(()=>d.remove(),320)}}
  function hit(x,y,amount){ring(x,y);if(amount!==undefined)text('-'+amount,x,y,'red');}
  function crit(x,y,amount){flash();ring(x,y,'gold');particles(x,y,14,'gold');text('CRIT '+(amount??''),x,y,'gold','crit');screenShake()}
  function coin(x,y){particles(x,y,8,'gold');text('+COINS',x,y,'gold')}
  function xp(x,y){particles(x,y,7,'blue');text('+XP',x,y,'blue')}
  function pickup(x,y,type='coin'){type==='xp'?xp(x,y):coin(x,y)}
  function menuTransition(el){once(el,'olf-card-in',430)}
  function chest(){reward('chest')}
  function bossDefeat(){flash('gold');particles(innerWidth/2,innerHeight*.45,35,'gold');screenShake();text('BOSS DEFEATED',innerWidth/2,innerHeight*.42,'gold')}
  function ultimate(){flash('gold');ring(innerWidth/2,innerHeight*.55,'gold');particles(innerWidth/2,innerHeight*.55,35,'blue');screenShake()}
  function eventStart(name='EVENT'){flash();reveal(name,'EVENT')}
  const api={version:'3.14.19',install,flash,ring,particles,text,pulse,screenShake,levelUp,reveal,boss,bossDefeat,reward,chest,synergy,dash,hit,crit,coin,xp,pickup,menuTransition,ultimate,eventStart};

  function hook(){
    document.addEventListener('pointerdown',e=>{
      const b=e.target.closest?.('button,.option,.menu-card,.menu-nav-btn');
      if(!b)return;
      const r=b.getBoundingClientRect();const x=r.left+r.width/2,y=r.top+r.height/2;
      const q=document.createElement('div');q.className='olf-ripple';q.style.left=x+'px';q.style.top=y+'px';layer().appendChild(q);setTimeout(()=>q.remove(),500);
      if(b.matches('.option'))pulse(b);
      if(b.matches('.menu-nav-btn,.menu-card'))menuTransition(b);
    },true);
    document.addEventListener('click',e=>{
      const b=e.target.closest?.('button,.option');
      if(!b)return;
      const t=(b.textContent||'').trim().toLowerCase();
      if(/level up|upgrade/.test(t))levelUp();
      if(/legendary/.test(t))reveal('LEGENDARY','LEGENDARY');
      if(/mythic/.test(t))reveal('MYTHIC','MYTHIC');
      if(/chest|reward|claim|daily/.test(t))reward('chest');
      if(/ultimate/.test(t))ultimate();
      if(/dash/.test(t))dash();
      if(/synergy/.test(t))synergy();
    },true);
    document.addEventListener('keydown',e=>{
      if(e.repeat)return;
      if(e.key==='Shift')dash();
      else if(e.key===' ')ultimate();
    },true);
    document.addEventListener('outlast:levelup',levelUp);
    document.addEventListener('outlast:boss-spawn',e=>boss(e.detail?.name||'BOSS'));
    document.addEventListener('outlast:boss-defeat',bossDefeat);
    document.addEventListener('outlast:hit',e=>hit(e.detail?.x,e.detail?.y,e.detail?.amount));
    document.addEventListener('outlast:crit',e=>crit(e.detail?.x,e.detail?.y,e.detail?.amount));
    document.addEventListener('outlast:xp',e=>xp(e.detail?.x,e.detail?.y));
    document.addEventListener('outlast:coin',e=>coin(e.detail?.x,e.detail?.y));
    document.addEventListener('outlast:upgrade-reveal',e=>reveal(e.detail?.name||'UPGRADE',e.detail?.rarity||'LEGENDARY'));
    document.addEventListener('outlast:synergy',e=>synergy(e.detail?.name||'SYNERGY ACTIVATED'));
    document.addEventListener('outlast:event-start',e=>eventStart(e.detail?.name||'EVENT'));
    document.addEventListener('outlast:reward',e=>reward(e.detail?.kind||'chest'));
    document.addEventListener('outlast:dash',dash);
    document.addEventListener('outlast:ultimate',ultimate);
    const observer=new MutationObserver(list=>{
      for(const m of list){
        for(const n of m.addedNodes||[]){
          if(n.nodeType!==1)continue;
          const s=(n.textContent||'').trim().toLowerCase();
          if(s==='level up!'||s==='level up')levelUp();
          if(/boss (spawn|incoming|appeared)/.test(s))boss('BOSS');
          if(/boss defeated|boss down/.test(s))bossDefeat();
          if(/synergy activated/.test(s))synergy(s.replace(/synergy activated/i,'').trim()||'SYNERGY ACTIVATED');
        }
      }
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{install();hook()},{once:true});else{install();hook()}
  window.OUTLASTFX=api;
})();