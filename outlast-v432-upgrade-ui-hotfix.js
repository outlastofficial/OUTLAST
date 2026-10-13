/* OUTLAST v4.3.2 — Upgrade-card text, rarity footer and overlay collision hotfix */
(function(){
'use strict';
const VERSION='4.3.6';
const $=s=>document.querySelector(s);
const num=v=>Number.isFinite(Number(v))?Number(v):0;
function activeUpgrade(){try{return typeof game!=='undefined'&&!!game.upgradeOpen&&Array.isArray(game.upgradeChoices)}catch(_){return false}}
function setVersion(){
 const parse=v=>{const match=String(v==null?'':v).match(/\d+(?:\.\d+){1,3}/);return match?match[0].split('.').map(n=>Number(n)||0):[0]};
 const normalize=v=>parse(v).join('.');
 const compare=(a,b)=>{const x=parse(a),y=parse(b);for(let i=0;i<Math.max(x.length,y.length);i++){if((x[i]||0)!==(y[i]||0))return (x[i]||0)>(y[i]||0)?1:-1}return 0};
 const meta=document.querySelector('meta[name="outlast-build"]'),buildMeta=document.querySelector('meta[name="build-version"]');
 const titleVersion=(document.title.match(/v(\d+(?:\.\d+){1,3})/i)||[])[1]||'0';
 const candidates=[VERSION,window.OUTLAST_BUILD,meta&&meta.content,buildMeta&&buildMeta.content,titleVersion];
 let release=normalize(VERSION);
 for(const candidate of candidates)if(candidate&&compare(candidate,release)>0)release=normalize(candidate);
 window.OUTLAST_BUILD=release;window.OUTLAST_VERSION='v'+release;document.title='OUTLAST v'+release;
 if(meta)meta.content=release;if(buildMeta)buildMeta.content=release;
 document.querySelectorAll('[data-outlast-version]').forEach(el=>el.textContent='v'+release);
 document.querySelectorAll('.menu-chip').forEach(el=>{if(/SURVIVOR HUB/i.test(el.textContent||''))el.textContent='v'+release+' • SURVIVOR HUB'});
}
function installCanvasTextFix(){
 const canvas=$('#game');if(!canvas||!canvas.getContext)return false;
 const c=canvas.getContext('2d');if(c.__outlastV431FillText)return true;
 const native=c.fillText.bind(c);
 c.fillText=function(text,x,y,maxWidth){
  if(activeUpgrade()&&!window.__OUTLAST_CUSTOM_UPGRADE_RENDER){
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
let outlastRememberedEventBadge=null,outlastRememberedThreatBadge=null;
function overlayPolicy(){
 if(!$('#outlastV431OverlayStyle')){const st=document.createElement('style');st.id='outlastV431OverlayStyle';st.textContent='#outlastPinkToy{display:none!important}.outlastV431HiddenUpgrade{display:none!important}';document.head.appendChild(st)}
 function findBadges(predicate,klass,positionCheck){
  const found=[];
  document.querySelectorAll('body *').forEach(el=>{
   if(el===document.body||el===document.documentElement||el.id==='outlastV431OverlayStyle'||el.classList?.contains(klass))return;
   const txt=String(el.textContent||'').replace(/\s+/g,' ').trim().toUpperCase();
   if(!predicate(txt))return;
   let cur=el;
   for(let k=0;k<5&&cur&&cur!==document.body;k++,cur=cur.parentElement){
    const r=cur.getBoundingClientRect(),cs=getComputedStyle(cur);
    const floating=['fixed','absolute','sticky'].includes(cs.position)||Number(cs.zIndex)>15;
    if(r.top<150&&r.width>=75&&r.width<=540&&r.height>=20&&r.height<=145&&floating&&positionCheck(r)){
     found.push({el:cur,area:r.width*r.height});break;
    }
   }
  });
  found.sort((a,b)=>a.area-b.area);
  const chosen=found[0]?.el||null;
  if(chosen)chosen.classList.add(klass);
  return chosen;
 }
 const eventCandidate=findBadges(t=>t.includes('OCTOBER EVENT')&&t.includes('LIVE NOW'),'outlastV431EventBanner',r=>true);
 const threatCandidate=findBadges(t=>t.includes('THREAT')&&t.includes('HIGH'),'outlastV431ThreatBanner',r=>r.right>window.innerWidth*.52);
 if(eventCandidate)outlastRememberedEventBadge=eventCandidate;
 if(threatCandidate)outlastRememberedThreatBadge=threatCandidate;
 const hidden=activeUpgrade();
 [outlastRememberedEventBadge,outlastRememberedThreatBadge].filter(el=>el&&el.isConnected).forEach(el=>el.classList.toggle('outlastV431HiddenUpgrade',hidden));
 const afk=$('#outlastAFKSpotButton');if(afk)afk.style.setProperty('visibility',hidden?'hidden':'visible','important');
}
function releaseNotes(){try{if(typeof updates!=='undefined'&&Array.isArray(updates)&&!updates.some(x=>Array.isArray(x)&&String(x[0]).includes('v4.3.1')))updates.unshift(['v4.3.1 — Upgrade UI Collision Fix','Wrapped long upgrade names within their cards, separated rarity footer labels, stopped duplicate rarity overlays from covering text, hid the October event and threat badges during upgrade selection, and removed the unwanted pink corner toy. Owner tools and map catalog remain enabled.']);if(typeof helpArticles!=='undefined'&&Array.isArray(helpArticles)&&!helpArticles.some(x=>x&&String(x[0]).includes('Why were upgrade cards overlapping?')))helpArticles.unshift(['Why were upgrade cards overlapping?','Upgrades & Rarities','Upgrade titles are now wrapped and clipped to each card. The rarity footer has separate rows for power tier, multiplier and selection, and duplicate animation labels are suppressed. The October event and threat banners and AFK shortcut are hidden while selecting upgrades so they do not cover the level-up heading.']);}catch(_){}}
function releaseNotesV432(){try{
 if(typeof updates!=='undefined'&&Array.isArray(updates)&&!updates.some(x=>Array.isArray(x)&&String(x[0]).includes('v4.3.2')))updates.unshift(['v4.3.2 — Clean Level-Up Overlay','Also hide the floating THREAT • HIGH pill during upgrade selection, keep the October event badge out of the level-up header, and retain the cleaned-up card title/footer layout.']);
 if(typeof helpArticles!=='undefined'&&Array.isArray(helpArticles)&&!helpArticles.some(x=>x&&String(x[0]).includes('Which overlays hide during level-up?')))helpArticles.unshift(['Which overlays hide during level-up?','Upgrades & Rarities','While choosing an upgrade, the October event banner, floating threat badge and AFK Spot shortcut hide so the three cards and level-up heading have clear space. They return when the upgrade choice closes.']);
}catch(_){}}
function install(){
 releaseNotes();releaseNotesV432();setVersion();installCanvasTextFix();overlayPolicy();installPickerVersionSync();window.OUTLAST_UI_HOTFIX_V432=true;
}
function installPickerVersionSync(){
 const picker=window.OUTLAST_OPEN_MAP_PICKER_3377;
 if(typeof picker==='function'&&!picker.__outlastV432BuildGuard){
  const wrapped=function(){const result=picker.apply(this,arguments);setVersion();return result};
  wrapped.__outlastV432BuildGuard=true;
  wrapped.__outlastV423BuildMarker=true;
  window.OUTLAST_OPEN_MAP_PICKER_3377=wrapped;
  const button=document.getElementById('mapBtn');if(button)button.onclick=wrapped;
 }
 if(!window.__OUTLAST_V432_PICKER_VERSION_SYNC){
  window.__OUTLAST_V432_PICKER_VERSION_SYNC=true;
  document.addEventListener('click',e=>{
   if(!e.target?.closest?.('#mapBtn'))return;
   setTimeout(setVersion,0);setTimeout(setVersion,35);setTimeout(setVersion,80);setTimeout(setVersion,150);
  },true);
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.addEventListener('load',install,{once:true});
setTimeout(install,0);setTimeout(install,100);setTimeout(install,300);setInterval(installCanvasTextFix,1000);
let overlayTimer=setInterval(overlayPolicy,350);setTimeout(()=>{if(overlayTimer){clearInterval(overlayTimer);overlayTimer=setInterval(overlayPolicy,800)}},12000);
})();