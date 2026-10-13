/* OUTLAST v4.3.3 — Complete level-up card redesign */
(function(){
'use strict';
const VERSION='4.3.3';
const TIERS=['Common','Uncommon','Rare','Epic','Legendary','Mythic','Divine','Celestial','Transcendent','Eternal','Omega'];
const COLORS={Common:'#93a6b5',Uncommon:'#63d98b',Rare:'#61c7ff',Epic:'#bc8cff',Legendary:'#ffd66e',Mythic:'#ff70d7',Divine:'#fff0a0',Celestial:'#85ebff',Transcendent:'#b0a0ff',Eternal:'#ffd2ed',Omega:'#ff9f65'};
const num=v=>Number.isFinite(Number(v))?Number(v):0, txt=v=>String(v==null?'':v).replace(/\s+/g,' ').trim();
function active(){try{return typeof game!=='undefined'&&!!game.upgradeOpen&&Array.isArray(game.upgradeChoices)&&game.upgradeChoices.length===3}catch(_){return false}}
function rr(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r)}
function wrap(c,s,maxWidth,maxLines){const words=txt(s).split(' '),out=[];let line='';for(const word of words){const test=(line+' '+word).trim();if(line&&c.measureText(test).width>maxWidth){out.push(line);line=word;if(out.length>=maxLines)break}else line=test}if(line&&out.length<maxLines)out.push(line);if(out.length===maxLines&&out.join(' ')!==txt(s)){let last=out[out.length-1];while(last&&c.measureText(last+'…').width>maxWidth)last=last.slice(0,-1).trimEnd();out[out.length-1]=last+'…'}return out}
function titleFor(title,rarity){let s=txt(title);const m=s.match(/\s*\[([^\]]+)\]\s*$/);if(m&&m[1].toLowerCase()===rarity.toLowerCase())s=s.slice(0,m.index).trim();return s||'Unknown Upgrade'}
function color(r){return COLORS[r]||COLORS.Common}
function scaleFor(r){try{const x=typeof upgradeRarities!=='undefined'&&upgradeRarities[r];if(x&&Number.isFinite(Number(x.mult)))return Number(x.mult)}catch(_){}try{const x=window.OUTLAST_UPGRADE_RARITY_SCALING37;if(x&&Number.isFinite(Number(x[r])))return Number(x[r])}catch(_){}return ({Common:1,Uncommon:1.15,Rare:1.35,Epic:1.6,Legendary:1.9,Mythic:2.25,Divine:4,Celestial:5,Transcendent:6,Eternal:7,Omega:8})[r]||1}
function glyphFor(a,b){const s=(txt(a)+' '+txt(b)).toLowerCase();if(/heal|health|hp|regen|recovery/.test(s))return '✚';if(/shield|guard|armor|defen/.test(s))return '⬡';if(/damage|attack|weapon|bullet|fire|shot|pierce|thorn/.test(s))return '⚔';if(/crit|luck|rarity|chance|precision/.test(s))return '✦';if(/coin|gold|treasure|cash/.test(s))return '◉';if(/xp|experience|level/.test(s))return '✧';if(/speed|dash|move|haste/.test(s))return '➤';if(/magnet|pickup|collect/.test(s))return '◎';if(/boss|elite|summon/.test(s))return '♜';if(/ultimate|skill|energy|cooldown/.test(s))return 'ϟ';if(/pet|companion/.test(s))return '♧';return '✥'}
function rollingFX(c,cx,cy,col,rank,t,i){
 const pulse=.55+.35*(.5+.5*Math.sin(t*5+i));c.save();c.globalAlpha=pulse;c.strokeStyle=col;c.fillStyle=col;c.lineWidth=2;const r=28+Math.sin(t*4+i)*2.5;
 if(rank===1){for(let k=0;k<3;k++){c.beginPath();c.moveTo(cx-20+k*10,cy+Math.sin(t*5+k)*5);c.lineTo(cx-8+k*10,cy-7);c.stroke()}}
 else if(rank===2){for(let k=0;k<2;k++){c.beginPath();c.arc(cx,cy,10+k*10+(t*7%5),t*1.7+k,t*1.7+k+Math.PI*1.3);c.stroke()}}
 else if(rank===3){for(let k=0;k<3;k++){const a=t*1.5+k*Math.PI*2/3;c.beginPath();c.moveTo(cx+Math.cos(a)*12,cy+Math.sin(a)*12);c.lineTo(cx+Math.cos(a+.7)*r,cy+Math.sin(a+.7)*r);c.stroke()}}
 else if(rank===4){c.beginPath();c.arc(cx,cy,r,t*1.8,t*1.8+Math.PI*1.35);c.stroke();c.beginPath();c.arc(cx,cy,18,-t,t+Math.PI*1.2);c.stroke()}
 else if(rank===5){for(let k=0;k<3;k++){const a=t*1.7+k*Math.PI*2/3;c.beginPath();c.arc(cx+Math.cos(a)*22,cy+Math.sin(a)*16,3.2,0,Math.PI*2);c.fill()}}
 else if(rank===6){for(let k=0;k<3;k++){c.beginPath();c.arc(cx,cy,12+k*8,t*1.3+k,t*1.3+k+Math.PI*1.45);c.stroke()}}
 else if(rank===7){for(let k=0;k<4;k++){const a=t*1.1+k*Math.PI/2;c.beginPath();c.moveTo(cx+Math.cos(a)*12,cy+Math.sin(a)*12);c.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);c.stroke();c.beginPath();c.arc(cx+Math.cos(a)*r,cy+Math.sin(a)*r,2.8,0,Math.PI*2);c.fill()}}
 else if(rank===8){c.globalAlpha=.23;c.fillRect(cx-28,cy-17,56,4);c.fillRect(cx-23,cy-4,46,3);c.fillRect(cx-28,cy+10,56,4);c.globalAlpha=pulse;c.strokeRect(cx-27,cy-24+(t*12%40),54,9)}
 else if(rank===9){c.beginPath();c.arc(cx,cy,r,t,t+Math.PI*1.7);c.stroke();c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.cos(t*2)*23,cy+Math.sin(t*2)*23);c.stroke()}
 else {for(let k=0;k<9;k++){const a=t*2+k*Math.PI*2/9;c.beginPath();c.moveTo(cx+Math.cos(a)*8,cy+Math.sin(a)*8);c.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);c.stroke()}}
 c.restore()
}
function drawCard(c,u,i,t){
 const x=45+i*350,y=180,w=325,h=285,cx=x+w/2,rarity=TIERS.includes(u&&u[3])?u[3]:'Common',rank=TIERS.indexOf(rarity),col=color(rarity),mult=scaleFor(rarity);
 let rolling=false;try{rolling=!!game.__upgradeRollActive&&rank>0}catch(_){}
 const pulse=.5+.5*Math.sin(t*2.3+i*.8),title=titleFor(u&&u[0],rarity),desc=txt(u&&u[1]);
 c.save();c.globalAlpha=1;c.shadowBlur=0;c.shadowColor='transparent';
 // Opaque repaint clears all old, overlapping title/footer and rarity FX in this card.
 const bg=c.createLinearGradient(x,y,x+w,y+h);bg.addColorStop(0,'#172735');bg.addColorStop(.56,'#0b141d');bg.addColorStop(1,'#101925');
 c.fillStyle='#04090e';rr(c,x-5,y-5,w+10,h+10,21);c.fill();c.fillStyle=bg;rr(c,x,y,w,h,18);c.fill();
 c.globalAlpha=rank>=4?.72+.22*pulse:.96;c.strokeStyle=col;c.lineWidth=rank>=4?2.2+1.1*pulse:2.1;rr(c,x+1,y+1,w-2,h-2,17);c.stroke();c.globalAlpha=1;
 c.fillStyle=col;c.globalAlpha=.1;rr(c,x+4,y+4,w-8,50,14);c.fill();c.globalAlpha=1;
 const badgeW=Math.min(190,Math.max(130,c.measureText(rarity.toUpperCase()).width+38));
 c.fillStyle=col;c.globalAlpha=.14;rr(c,cx-badgeW/2,y+13,badgeW,25,12);c.fill();c.globalAlpha=1;c.strokeStyle=col;c.globalAlpha=.55;c.lineWidth=1;rr(c,cx-badgeW/2,y+13,badgeW,25,12);c.stroke();c.globalAlpha=1;
 c.textAlign='center';c.textBaseline='alphabetic';c.fillStyle=col;c.font='bold 12px Arial';c.fillText((rolling?'✧ REVEALING ':'✦ ')+rarity.toUpperCase(),cx,y+30);
 c.fillStyle='#09121a';c.beginPath();c.arc(x+w-27,y+26,14,0,Math.PI*2);c.fill();c.strokeStyle=col;c.globalAlpha=.8;c.lineWidth=1.5;c.stroke();c.globalAlpha=1;c.fillStyle='#ffe16b';c.font='bold 16px Arial';c.fillText(String(i+1),x+w-27,y+31);
 const iy=y+80;c.fillStyle=col;c.globalAlpha=.11;c.beginPath();c.arc(cx,iy,31,0,Math.PI*2);c.fill();c.globalAlpha=1;c.strokeStyle=col;c.globalAlpha=.65;c.lineWidth=1.4;c.beginPath();c.arc(cx,iy,31,0,Math.PI*2);c.stroke();c.globalAlpha=1;
 if(rolling){rollingFX(c,cx,iy,col,rank,t,i);c.fillStyle='#fff';c.font='bold 13px Arial';c.fillText('ROLLING…',cx,iy+4)}else{c.fillStyle=col;c.font='bold 32px "Segoe UI Symbol",Arial';c.fillText(glyphFor(title,desc),cx,iy+11)}
 c.fillStyle='#f4f7fb';c.font='bold '+(title.length>33?14:title.length>23?15:title.length>16?16:18)+'px Arial';
 let tl=wrap(c,title,w-34,2);if(tl.some(s=>c.measureText(s).width>w-36)){c.font='bold 13px Arial';tl=wrap(c,title,w-36,2)}
 const titleY=tl.length>1?y+121:y+130;tl.forEach((s,j)=>c.fillText(s,cx,titleY+j*16));
 c.save();c.beginPath();c.rect(x+17,y+148,w-34,62);c.clip();c.fillStyle='#cfdae5';c.font='14px Arial';
 const dl=wrap(c,desc,w-40,3),descY=tl.length>1?y+164:y+157;dl.forEach((s,j)=>c.fillText(s,cx,descY+j*16));c.restore();
 c.globalAlpha=.38;c.strokeStyle=col;c.lineWidth=1;c.beginPath();c.moveTo(x+22,y+216);c.lineTo(x+w-22,y+216);c.stroke();c.globalAlpha=1;
 c.fillStyle=col;c.font='bold 11px Arial';c.fillText(rarity==='Common'?'BASE TIER':rarity.toUpperCase()+' TIER',cx,y+235);
 c.fillStyle='#b9c8d5';c.font='11px Arial';c.fillText('RARITY MULTIPLIER  ×'+mult.toFixed(2),cx,y+252);
 c.fillStyle=rolling?'#f4d67a':'#8fa5b6';c.font='bold 10px Arial';c.fillText(rolling?'WAIT FOR REVEAL':'PRESS '+(i+1)+'  OR  CLICK CARD',cx,y+274);
 c.restore()
}
function redraw(c){if(!active())return;let choices;try{choices=game.upgradeChoices}catch(_){return}if(!Array.isArray(choices)||choices.length!==3)return;const t=(typeof performance!=='undefined'&&performance.now?performance.now():Date.now())/1000;c.save();c.globalAlpha=1;c.textAlign='center';choices.forEach((u,i)=>drawCard(c,u,i,t));c.restore();c.textAlign='left'}
function notes(){try{if(typeof updates!=='undefined'&&Array.isArray(updates)&&!updates.some(x=>Array.isArray(x)&&String(x[0]).includes('v4.3.3')))updates.unshift(['v4.3.3 — Level-Up Choice Redesign','Redesigned level-up cards with clean typography, wrapped upgrade names and descriptions, distinct rarity colors, tier-specific rolling animations, the game’s actual rarity multiplier, and a single uncluttered footer. Card positions and 1/2/3 selection controls are preserved.']);if(typeof helpArticles!=='undefined'&&Array.isArray(helpArticles)&&!helpArticles.some(x=>x&&String(x[0]).includes('How do I read the redesigned upgrade cards?')))helpArticles.unshift(['How do I read the redesigned upgrade cards?','Upgrades & Rarities','Each level-up card shows rarity and selection number at the top, an upgrade icon and wrapped name, a readable effect description, and a footer with the rarity multiplier. Click a card or press 1, 2, or 3. Higher-rarity rolls use distinct animations and show the effect after revealing.'])}catch(_){}}
function version(){const cur=String(window.OUTLAST_BUILD||'0').split('.').map(x=>Number(x)||0),next=VERSION.split('.').map(x=>Number(x)||0);for(let i=0;i<Math.max(cur.length,next.length);i++){if((cur[i]||0)>(next[i]||0))return;if((cur[i]||0)<(next[i]||0))break}window.OUTLAST_BUILD=VERSION;window.OUTLAST_VERSION='v'+VERSION;document.title='OUTLAST v'+VERSION;['meta[name="outlast-build"]','meta[name="build-version"]'].forEach(q=>{const e=document.querySelector(q);if(e)e.content=VERSION});document.querySelectorAll('.menu-chip').forEach(e=>{if(/SURVIVOR HUB/i.test(e.textContent||''))e.textContent='v'+VERSION+' • SURVIVOR HUB'})}
function install(){try{notes();version();const canvas=document.getElementById('game');if(!canvas||!canvas.getContext)return;const c=canvas.getContext('2d');if(!c)return;if(!window.__OUTLAST_V433_CARD_REDRAW){const previous=window.draw;if(typeof previous!=='function')return;const wrapped=function(){const res=previous.apply(this,arguments);try{redraw(c)}catch(e){window.OUTLAST_V433_CARD_ERROR=String(e&&e.message||e)}return res};wrapped.__outlastV433UpgradeRedesign=true;window.draw=wrapped;try{draw=wrapped}catch(_){}window.__OUTLAST_V433_CARD_REDRAW=true}window.OUTLAST_UPGRADE_CARD_DESIGN_V433={version:VERSION,ready:true,threeCards:true,clickRegionsPreserved:true,keyboardKeys:['1','2','3'],audit:()=>({active:active(),choices:(typeof game!=='undefined'&&Array.isArray(game.upgradeChoices))?game.upgradeChoices.length:0,renderHook:!!window.__OUTLAST_V433_CARD_REDRAW,error:window.OUTLAST_V433_CARD_ERROR||null})}}catch(e){window.OUTLAST_V433_INSTALL_ERROR=String(e&&e.message||e)}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();window.addEventListener('load',install,{once:true});setTimeout(install,0);setTimeout(install,100);setTimeout(install,350);
})();