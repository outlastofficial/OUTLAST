/* OUTLAST v4.3.1 — Upgrade-card text, rarity footer and overlay collision hotfix */
(function(){
'use strict';
const VERSION='4.3.1';
const $=s=>document.querySelector(s);
const num=v=>Number.isFinite(Number(v))?Number(v):0;
function activeUpgrade(){try{return typeof game!=='undefined'&&!!game.upgradeOpen&&Array.isArray(game.upgradeChoices)}catch(_){return false}}
function setVersion(){
 window.OUTLAST_BUILD=VERSION;window.OUTLAST_VERSION='v'+VERSION;document.title='OUTLAST v'+VERSION;
 ['meta[name="outlast-build"]','meta[name="build-version"]'].forEach(s=>{const e=$(s);if(e)e.content=VERSION});
 document.querySelectorAll('.menu-chip').forEach(e=>{if(/SURVIVOR HUB/i.test(e.textContent||''))e.textContent='v'+VERSION+' • SURVIVOR HUB'});
}
function installCanvasTextFix(){
 const canvas=$('#game');if(!canvas||!canvas.getContext)return false;
 const c=canvas.getContext('2d');if(c.__outlastV431FillText)return true;
 const native=c.fillText.bind(c);
 c.fillText=function(text,x,y,maxWidth){
  if(activeUpgrade()){
   const str=String(text==null?'':text), yy=Number(y);
   let choices;try{choices=game.upgradeChoices}catch(_){choices=[]}
   const idx=Array.isArray(choices)?choices.findIndex(u=>u&&String(u[0])===str):-1;
   if(idx>=0&&Number.isFinite(yy)&&yy>270&&yy<340)return;
   if(Number.isFinite(yy)&&yy>=420&&yy<=456)return;
   if((/^MYTHIC DROP$/i.test(str)||(/^✦\s*(COMMON|UNCOMMON|RARE|EPIC|LEGENDARY|MYTHIC|DIVINE|CELESTIAL|TRANSCENDENT|ETERNAL|OMEGA)\s*✦$/i.test(str)))&&yy>60&&yy<480)return;
  }
  return native(text,x,y,maxWidth);
 };
 c.__outlastV431FillText=true;c.__outlastV431NativeFillText=native;
 if(typeof window.draw==='function'&&!window.__OUTLAST_V431_DRAW_WRAPPER){
  const base=window.draw;
  const wrapped=function(){const out=base.apply(this,arguments);try{drawCleanUpgradeText(c,native)}catch(e){window.OUTLAST_V431_CARD_RENDER_ERROR=String(e&&e.message||e)}return out};
  wrapped.__outlastV431=true;window.draw=wrapped;try{draw=wrapped}catch(_){}window.__OUTLAST_V431_DRAW_WRAPPER=true;
 }
 return true;
}
function wrapLines(ctx,text,maxWidth,maxLines){
 const words=String(text==null?'':text).split(/\s+/).filter(Boolean),out=[];let line='';
 for(const word of words){const t=(line+' '+word).trim();if(line&&ctx.measureText(t).width>maxWidth){out.push(line);line=word;if(out.length>=maxLines){line='';break}}else line=t}
 if(line&&out.length<maxLines)out.push(line);
 if(out.length===maxLines&&words.join(' ')!==out.join(' ')){
  let last=out[out.length-1]||'';while(last&&ctx.measureText(last+'…').width>maxWidth)last=last.slice(0,-1).trimEnd();out[out.length-1]=last+'…';
 }
 return out;
}
function drawCleanUpgradeText(ctx,native){
 if(!activeUpgrade())return;
 let roll=false;try{roll=!!game.__upgradeRollActive}catch(_){}
 if(roll)return;
 let choices;try{choices=game.upgradeChoices}catch(_){return}
 if(!Array.isArray(choices)||choices.length!==3)return;
 const rarityRanks={Common:0,Uncommon:1,Rare:2,Epic:3,Legendary:4,Mythic:5,Divine:6,Celestial:7,Transcendent:8,Eternal:9,Omega:10};
 const rarityMult={Common:1,Uncommon:1.15,Rare:1.35,Epic:1.6,Legendary:1.9,Mythic:2.25,Divine:4,Celestial:4.8,Transcendent:5.6,Eternal:6.8,Omega:8};
 ctx.save();ctx.textAlign='center';ctx.textBaseline='alphabetic';
 choices.forEach((u,i)=>{
  if(!u)return;
  const x=45+i*350,y=180,w=325,h=285,cx=x+w/2,rarity=String(u[3]||'Common'),rank=rarityRanks[rarity]||0;
  // Quiet text zones cover legacy labels that used to spill across card boundaries and overlap the footer.
  ctx.save();ctx.fillStyle='rgba(10,17,24,.82)';
  ctx.beginPath();ctx.roundRect(x+9,y+103,w-18,103,10);ctx.fill();
  ctx.beginPath();ctx.roundRect(x+9,y+226,w-18,53,10);ctx.fill();
  ctx.restore();

  let titleFont=17,titleLines=[];
  ctx.textAlign='center';ctx.fillStyle='#f5f8fb';
  do{ctx.font='bold '+titleFont+'px Arial';titleLines=wrapLines(ctx,u[0],w-44,2);if(titleLines.every(t=>ctx.measureText(t).width<=w-44))break;titleFont--}while(titleFont>13);
  const titleStart=titleLines.length>1?y+119:y+131;
  titleLines.forEach((line,j)=>native(line,cx,titleStart+j*18));

  ctx.font='15px Arial';ctx.fillStyle='#cbd7e2';
  const descLines=wrapLines(ctx,u[1],w-44,titleLines.length>1?2:3);
  const descStart=titleLines.length>1?y+159:y+158;
  descLines.forEach((line,j)=>native(line,cx,descStart+j*18));

  ctx.fillStyle=({Common:'#9fb0be',Uncommon:'#6bd88a',Rare:'#64c8ff',Epic:'#bc8cff',Legendary:'#ffd66e',Mythic:'#ff72d5',Divine:'#fff1a0',Celestial:'#90eaff',Transcendent:'#9f9bff',Eternal:'#ffd0f0',Omega:'#ff9b67'})[rarity]||'#cbd7e2';
  ctx.font='bold 12px Arial';native((rank===0?'BASE POWER':rarity.toUpperCase()+' POWER'),cx,y+242);
  ctx.font='10px Arial';native('RARITY SCALE ×'+Number(rarityMult[rarity]||1).toFixed(2),cx,y+257);
  ctx.strokeStyle='rgba(180,200,218,.36)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+25,y+263);ctx.lineTo(x+w-25,y+263);ctx.stroke();
  ctx.font='bold 10px Arial';ctx.fillStyle='#b8c8d5';native('SELECT TO CLAIM',cx,y+276);
 });
 ctx.restore();ctx.textAlign='left';
}
function overlayPolicy(){
 if(!$('#outlastV431OverlayStyle')){const st=document.createElement('style');st.id='outlastV431OverlayStyle';st.textContent='#outlastPinkToy{display:none!important}#outlastV431HideForUpgrade{display:none!important}';document.head.appendChild(st)}
 const candidates=[];
 document.querySelectorAll('body *').forEach(el=>{
  if(el===document.body||el===document.documentElement||el.id==='outlastV431OverlayStyle')return;
  const txt=String(el.textContent||'').replace(/\s+/g,' ').trim().toUpperCase();
  if(!txt.includes('OCTOBER EVENT')||!txt.includes('LIVE NOW'))return;
  let cur=el;
  for(let k=0;k<5&&cur&&cur!==document.body;k++,cur=cur.parentElement){
   const r=cur.getBoundingClientRect(),cs=getComputedStyle(cur);
   if(r.top<145&&r.width>=100&&r.width<=520&&r.height>=25&&r.height<=140&&(['fixed','absolute','sticky'].includes(cs.position)||Number(cs.zIndex)>15)){
    candidates.push({el:cur,area:r.width*r.height});break;
   }
  }
 });
 candidates.sort((a,b)=>a.area-b.area);
 let banner=candidates[0]?.el||null;
 if(banner&&banner.id!=='outlastV431OverlayStyle')banner.classList.add('outlastV431EventBanner');
 if(!document.getElementById('outlastV431BannerStyle')){const st=document.createElement('style');st.id='outlastV431BannerStyle';st.textContent='.outlastV431EventBanner.outlastV431HiddenUpgrade{display:none!important}';document.head.appendChild(st)}
 const all=document.querySelectorAll('.outlastV431EventBanner');
 all.forEach(e=>e.classList.toggle('outlastV431HiddenUpgrade',activeUpgrade()));
 const afk=$('#outlastAFKSpotButton');if(afk)afk.style.setProperty('visibility',activeUpgrade()?'hidden':'visible','important');
}
function releaseNotes(){try{if(typeof updates!=='undefined'&&Array.isArray(updates)&&!updates.some(x=>Array.isArray(x)&&String(x[0]).includes('v4.3.1')))updates.unshift(['v4.3.1 — Upgrade UI Collision Fix','Wrapped long upgrade names within their cards, separated rarity footer labels, stopped duplicate rarity overlays from covering text, hid the October event badge during upgrade selection, and removed the unwanted pink corner toy. Owner tools and map catalog remain enabled.']);if(typeof helpArticles!=='undefined'&&Array.isArray(helpArticles)&&!helpArticles.some(x=>x&&String(x[0]).includes('Why were upgrade cards overlapping?')))helpArticles.unshift(['Why were upgrade cards overlapping?','Upgrades & Rarities','Upgrade titles are now wrapped and clipped to each card. The rarity footer has separate rows for power tier, multiplier and selection, and duplicate animation labels are suppressed. The October event banner and AFK shortcut are hidden while selecting upgrades so they do not cover the level-up heading.']);}catch(_){}}
function install(){
 releaseNotes();setVersion();installCanvasTextFix();overlayPolicy();window.OUTLAST_UI_HOTFIX_V431=true;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.addEventListener('load',install,{once:true});
setTimeout(install,0);setTimeout(install,100);setTimeout(install,300);setInterval(installCanvasTextFix,1000);
let overlayTimer=setInterval(overlayPolicy,350);setTimeout(()=>{if(overlayTimer){clearInterval(overlayTimer);overlayTimer=setInterval(overlayPolicy,800)}},12000);
})();