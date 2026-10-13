/* OUTLAST v4.3.9 — Active Skill Repair + Menu and Upgrade Choice Refresh */
(function(){
'use strict';
const VERSION='4.3.9';
const TIER_COLORS={Common:'#9aaab8',Uncommon:'#66dfa0',Rare:'#65caff',Epic:'#c394ff',Legendary:'#ffdc79',Mythic:'#ff83df',Divine:'#fff1a4',Celestial:'#83efff',Transcendent:'#b9a4ff',Eternal:'#ffcfe9',Omega:'#ffad73'};
const SKILL_GLYPHS={Nova:'✺',Blink:'➤',Fortify:'⬡',TimeStop:'❄',Meteor:'☄'};
const tierScale={Common:1,Uncommon:1.15,Rare:1.35,Epic:1.6,Legendary:1.9,Mythic:2.25,Divine:4,Celestial:4.8,Transcendent:5.6,Eternal:6.8,Omega:8};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const getSave=()=>{try{return typeof save!=='undefined'?save:null}catch(_){return null}};
const getGame=()=>{try{return typeof game!=='undefined'?game:null}catch(_){return null}};
function say(s){try{if(typeof toast==='function')toast(s)}catch(_){}}
function persistSave(){try{if(typeof persist==='function')persist()}catch(_){}}
function cooldownFor(p,def){const mult=Math.max(.25,Math.min(1.5,Number(p.skillCooldownMult)||1));return Math.max(.5,(Number(def.cool)||18)*mult)}
function skillDef(name){try{return typeof activeSkills!=='undefined'&&activeSkills?activeSkills[name]:null}catch(_){}}
function killIfNeeded(e){try{if(e&&Number(e.hp)<=0&&typeof killEnemy==='function'){const g=getGame(),i=g&&Array.isArray(g.enemies)?g.enemies.indexOf(e):-1;if(i>=0)killEnemy(i)}}catch(_){}}
function hit(e,power){if(!e||!Number.isFinite(Number(e.hp)))return;try{if(typeof damageEnemy==='function')damageEnemy(e,power);else e.hp-=power;killIfNeeded(e)}catch(err){window.OUTLAST_SKILL_DAMAGE_ERROR=String(err&&err.message||err)}}
function activateSkillV439(){
 const g=getGame(),sv=getSave(),p=g&&g.player;
 if(!g||!g.running||g.over||g.paused||g.upgradeOpen||!p)return false;
 const name=p.activeSkill||(sv&&sv.activeSkill)||'Nova',def=skillDef(name);
 if(!def||Number(p.skillCooldown)>0)return false;
 let used=true;
 if(name==='Nova'){
  const radius=220+Math.max(0,Number(p.explosionRadius)||0),enemies=Array.isArray(g.enemies)?g.enemies:[];
  for(let i=enemies.length-1;i>=0;i--){const e=enemies[i];if(e&&Math.hypot(Number(e.x)-p.x,Number(e.y)-p.y)<=radius)hit(e,Math.max(0,Number(p.damage)||0)*4)}
  if(Array.isArray(g.effects))g.effects.push({x:p.x,y:p.y,t:.8,r:radius,color:'#87f3e0',fill:false});
 }else if(name==='Blink'){
  let dx=0,dy=0;try{dx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0);dy=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0)}catch(_){}
  try{if(typeof keyCodes!=='undefined'){dx+=(keyCodes.KeyD||keyCodes.ArrowRight?1:0)-(keyCodes.KeyA||keyCodes.ArrowLeft?1:0);dy+=(keyCodes.KeyS||keyCodes.ArrowDown?1:0)-(keyCodes.KeyW||keyCodes.ArrowUp?1:0)}}catch(_){}
  if(!dx&&!dy)dy=-1;
  const len=Math.hypot(dx,dy)||1,distance=450*Math.max(.25,Number(p.dashDistanceMult)||1);
  let w=3200,h=2400;try{if(typeof W!=='undefined')w=Number(W)||w;if(typeof H!=='undefined')h=Number(H)||h}catch(_){}
  const beforeX=p.x,beforeY=p.y;p.x=Math.max(30,Math.min(w-30,p.x+dx/len*distance));p.y=Math.max(30,Math.min(h-30,p.y+dy/len*distance));
  if(Array.isArray(g.effects))g.effects.push({x:p.x,y:p.y,t:.45,r:55,color:'#71efff',fill:false});
 }else if(name==='Fortify'){
  if(typeof outlastGrantTempShield==='function')outlastGrantTempShield(8);else p.shield=Math.max(Number(p.shield)||0,8);
  if(Array.isArray(g.effects))g.effects.push({x:p.x,y:p.y,t:.7,r:95,color:'#8edcff',fill:false});
 }else if(name==='TimeStop'){
  const duration=5,enemies=Array.isArray(g.enemies)?g.enemies:[];
  for(const e of enemies)if(e)e.stunTimer=Math.max(Number(e.stunTimer)||0,duration);
  if(Array.isArray(g.effects))g.effects.push({x:p.x,y:p.y,t:.7,r:300,color:'#b8e7ff',fill:false});
 }else if(name==='Meteor'){
  const radius=600,enemies=Array.isArray(g.enemies)?g.enemies:[];
  for(let i=enemies.length-1;i>=0;i--){const e=enemies[i];if(e&&Math.hypot(Number(e.x)-p.x,Number(e.y)-p.y)<=radius){if(Array.isArray(g.effects))g.effects.push({x:e.x,y:e.y,t:.6,r:78,color:'#ff916c',fill:true});hit(e,Math.max(0,Number(p.damage)||0)*6)}}
 }else used=false;
 if(!used)return false;
 p.skillCooldown=cooldownFor(p,def);g.lastSkillUsed=name;say('◉ '+name+' activated!');return true;
}
function selectSkillV439(name){
 const s=getSave(),g=getGame(),def=skillDef(name);if(!s||!def)return false;
 s.ownedSkills=s.ownedSkills||{Nova:true};
 if(!s.ownedSkills[name]){const cost=Math.max(0,Number(def.cost)||0);if((Number(s.coins)||0)<cost){say('Need '+cost.toLocaleString()+' coins to unlock '+name+'.');return false;}s.coins=Math.max(0,Number(s.coins)-cost);s.ownedSkills[name]=true;}
 s.activeSkill=name;if(g&&g.player)g.player.activeSkill=name;persistSave();
 try{if(typeof updateMenuSummary==='function')updateMenuSummary()}catch(_){}
 window.OUTLAST_ACTIVE_SKILL_SELECTION=name;renderSkillsV439();say(name+' equipped — press Q during a run.');return true;
}
function renderSkillsV439(){
 const s=getSave();if(!s)return;s.ownedSkills=s.ownedSkills||{Nova:true};
 let defs={};try{defs=typeof activeSkills!=='undefined'&&activeSkills?activeSkills:{}}catch(_){}
 const cards=Object.entries(defs).map(([name,d])=>{
  const owned=!!s.ownedSkills[name],selected=s.activeSkill===name,cost=Math.max(0,Number(d.cost)||0),action=owned?'EQUIP SKILL':'UNLOCK • '+cost.toLocaleString()+' COINS';
  return '<button type="button" class="option outlast-v439-skill-card '+(selected?'is-selected':'')+'" data-action="skill" data-value="'+esc(name)+'" data-owned="'+(owned?'true':'false')+'" aria-pressed="'+(selected?'true':'false')+'"><span class="outlast-v439-skill-glyph">'+esc(SKILL_GLYPHS[name]||'✦')+'</span><span class="outlast-v439-skill-card-copy"><b>'+esc(name)+'</b><small>'+esc(d.desc||'Active skill')+'</small><small class="outlast-v439-skill-cool">COOLDOWN · '+Math.max(.5,Number(d.cool)||18)+'s</small></span><span class="outlast-v439-skill-action">'+(selected?'✓ EQUIPPED':action)+'</span></button>';
 }).join('');
 const panel='<div class="outlast-v439-skill-screen"><div class="outlast-v439-skill-intro"><div><span class="outlast-v439-eyebrow">LOADOUT / COMBAT</span><h3>Choose your active skill</h3><p>Unlock once with coins, then equip it freely. Press <b>Q</b> or use the in-game Skill button.</p></div><div class="outlast-v439-selected-skill"><small>EQUIPPED</small><b>'+esc(s.activeSkill||'Nova')+'</b></div></div><div class="outlast-v439-skill-grid">'+cards+'</div><div class="outlast-v439-skill-foot">Skills trigger during active gameplay. Cooldowns appear on the in-run HUD.</div></div>';
 try{if(typeof openSub==='function')openSub('◉ Active Skills',panel);else{const root=document.getElementById('subPanel');if(root){root.innerHTML=panel;root.style.display='block'}}}catch(err){window.OUTLAST_SKILL_RENDER_ERROR=String(err&&err.message||err)}
 const root=document.getElementById('subPanel');if(root)root.classList.add('outlast-v439-subpanel');
 window.OUTLAST_SKILL_UI_V439={ready:true,version:VERSION,audit:()=>({ready:true,buttonCount:document.querySelectorAll('#subPanel button[data-action="skill"]').length,selected:getSave()?.activeSkill||null,activation:typeof window.useActiveSkill==='function',renderError:window.OUTLAST_SKILL_RENDER_ERROR||null})};
}
function injectMenuStyles(){
 if(document.getElementById('outlast-v439-ui-style'))return;
 const style=document.createElement('style');style.id='outlast-v439-ui-style';
 const css=[
"#menu{background:radial-gradient(1000px 540px at 82% -5%,rgba(25,106,99,.23),transparent 63%),linear-gradient(145deg,#070d13,#0b131c 62%,#101d26)!important;color:#eef8fb!important}",
"#menu .menu-side{background:linear-gradient(180deg,#0c1820,#080e14)!important;border-right:1px solid #23404a!important;box-shadow:10px 0 34px rgba(0,0,0,.18)!important}",
"#menu .menu-side-title{color:#c6fff1!important;letter-spacing:.18em!important;text-shadow:0 0 22px rgba(83,221,187,.2)}",
"#menu .menu-side-bottom{color:#91a8b7!important;line-height:1.55}",
"#menu .menu-main{background:radial-gradient(800px 430px at 65% 0%,rgba(41,107,114,.11),transparent 70%)!important}",
"#menu .menu-topbar{background:linear-gradient(135deg,rgba(19,36,45,.94),rgba(11,20,29,.86))!important;border:1px solid #213b46!important;border-radius:19px!important;padding:15px 18px!important;box-shadow:0 12px 34px rgba(0,0,0,.15)!important}",
"#menu .title{color:#f1fffb!important;letter-spacing:.05em!important}#menu .subtitle{color:#91b5ba!important}",
"#menu .menu-page-title{font-size:clamp(24px,2vw,31px)!important;letter-spacing:-.025em!important;color:#f3fbff!important}#menu .menu-page-sub{color:#9ab0bf!important;line-height:1.5!important}",
"#menu .menu-cards{gap:13px!important;align-items:stretch}",
"#menu .menu-card{position:relative;overflow:hidden;background:linear-gradient(145deg,rgba(20,34,44,.98),rgba(11,19,27,.98))!important;border:1px solid #263e4a!important;border-radius:17px!important;padding:15px!important;box-shadow:0 9px 24px rgba(0,0,0,.13)!important;transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease!important}",
"#menu .menu-card:before{content:\"\";position:absolute;left:0;right:0;top:0;height:2px;background:linear-gradient(90deg,transparent,#4ac7ae,transparent);opacity:.34}",
"#menu .menu-card:hover{transform:translateY(-2px)!important;border-color:#3d827b!important;box-shadow:0 15px 30px rgba(0,0,0,.24)!important}",
"#menu .menu-card h3{font-size:15px!important;font-weight:800!important;letter-spacing:.01em!important;color:#e8fcf7!important;margin-bottom:10px!important}#menu .menu-card p{color:#91a8b8!important;line-height:1.5!important}",
"#menu .menu-btn,#menu .menu-nav-btn{border-radius:12px!important;font-weight:800!important;letter-spacing:.01em!important;transition:transform .14s ease,border-color .14s ease,filter .14s ease!important}",
"#menu .menu-btn{background:linear-gradient(135deg,#173a3b,#10252e)!important;border:1px solid #2b6563!important;color:#d8fff5!important;min-height:40px!important;box-shadow:inset 0 1px rgba(255,255,255,.035)!important}",
"#menu .menu-btn:hover{filter:brightness(1.16)!important;transform:translateY(-1px)!important;border-color:#5bcbb2!important}",
"#menu .menu-nav-btn{background:rgba(13,24,32,.92)!important;border:1px solid transparent!important;color:#9bb0bd!important}",
"#menu .menu-nav-btn.active{background:linear-gradient(100deg,#153f3b,#10252e)!important;border-color:#3b7e73!important;color:#effff9!important;box-shadow:inset 3px 0 #67e0bd,0 8px 22px rgba(0,0,0,.13)!important}#menu .menu-nav-btn:hover{color:#eafffa!important;border-color:#315b61!important}",
"#menu .menu-help,#menu .menu-note{color:#8ca4b3!important}",
"#subPanel.outlast-v439-subpanel{background:linear-gradient(155deg,#101e29,#081119)!important;border:1px solid #31515c!important;border-radius:21px!important;box-shadow:0 25px 90px rgba(0,0,0,.65)!important;color:#effaff!important}#subPanel.outlast-v439-subpanel .sub-title,#subPanel.outlast-v439-subpanel h2{color:#e9fffa!important}#subPanel.outlast-v439-subpanel .option{border-radius:14px!important}",
".outlast-v439-skill-screen{padding:4px 2px 2px}.outlast-v439-skill-intro{display:flex;gap:14px;align-items:flex-start;justify-content:space-between;margin:0 0 15px;padding:15px;background:linear-gradient(120deg,#17353a,#10212c);border:1px solid #315c60;border-radius:16px}",
".outlast-v439-eyebrow{font-size:10px;font-weight:900;letter-spacing:.15em;color:#7ce2c6}.outlast-v439-skill-intro h3{margin:5px 0 4px;color:#f1fffb;font-size:19px}.outlast-v439-skill-intro p{margin:0;color:#9db6c3;font-size:12px;line-height:1.45}",
".outlast-v439-selected-skill{min-width:98px;text-align:right;display:grid;gap:4px}.outlast-v439-selected-skill small{font-size:9px;letter-spacing:.12em;color:#8db8b3}.outlast-v439-selected-skill b{color:#dffff5;font-size:15px}",
".outlast-v439-skill-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}#subPanel .outlast-v439-skill-card{position:relative;display:grid;grid-template-columns:42px minmax(0,1fr);gap:10px;align-items:center;text-align:left;padding:13px!important;min-height:111px;background:linear-gradient(145deg,#14242f,#0c1720)!important;border:1px solid #28434f!important;border-radius:15px!important;color:#eaf9ff!important;white-space:normal!important}",
"#subPanel .outlast-v439-skill-card:hover{border-color:#62cbb5!important;transform:translateY(-1px)!important}#subPanel .outlast-v439-skill-card.is-selected{border-color:#63dabe!important;background:linear-gradient(145deg,#153f3b,#10242c)!important;box-shadow:inset 0 0 0 1px rgba(99,218,190,.15)!important}",
".outlast-v439-skill-glyph{width:40px;height:40px;display:grid;place-items:center;border-radius:12px;background:#203b46;color:#8af1d3;font-size:23px}.outlast-v439-skill-card-copy{min-width:0;display:grid;gap:4px}.outlast-v439-skill-card-copy b{font-size:15px;color:#f2fffb}.outlast-v439-skill-card-copy small{font-size:11px;line-height:1.35;color:#9eb5c2}.outlast-v439-skill-card-copy .outlast-v439-skill-cool{font-size:9px;font-weight:900;letter-spacing:.09em;color:#6fd6c0}",
".outlast-v439-skill-action{grid-column:1/-1;border-top:1px solid rgba(112,172,181,.18);padding-top:8px;margin-top:1px;color:#8de7d0;font-size:10px;font-weight:900;letter-spacing:.09em}.outlast-v439-skill-foot{padding:12px 3px 0;color:#91a9b7;font-size:11px;line-height:1.4}",
"@media (max-width: 760px){#menu .menu-topbar{padding:11px!important;border-radius:15px!important}#menu .menu-card{padding:13px!important}#menu .menu-cards{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:9px!important}#menu .menu-card h3{font-size:13px!important}.outlast-v439-skill-grid{grid-template-columns:1fr}.outlast-v439-skill-intro{padding:12px}.outlast-v439-selected-skill{min-width:72px}}"
 ];
 style.textContent=css.join('\n');document.head.appendChild(style);
}
function round(c,x,y,w,h,r){c.beginPath();if(typeof c.roundRect==='function')c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h)}
function wrapText(c,text,maxWidth,maxLines){const words=String(text||'').trim().split(/\s+/),lines=[];let line='';for(const word of words){const test=(line+' '+word).trim();if(line&&c.measureText(test).width>maxWidth){lines.push(line);line=word;if(lines.length>=maxLines)break}else line=test}if(line&&lines.length<maxLines)lines.push(line);if(lines.length===maxLines&&lines.join(' ')!==String(text||'').trim()){let last=lines[lines.length-1]||'';while(last&&c.measureText(last+'…').width>maxWidth)last=last.slice(0,-1);lines[lines.length-1]=last+'…'}return lines}
function rarityFor(choice){const r=String(choice&&choice[3]||'Common');return Object.prototype.hasOwnProperty.call(TIER_COLORS,r)?r:'Common'}
function paintRarityMotion(c,cx,cy,color,rank,t){c.save();c.strokeStyle=color;c.fillStyle=color;c.lineWidth=1.5;c.globalAlpha=.75;if(rank>=7){for(let k=0;k<4;k++){const a=t*(.7+rank*.07)+k*Math.PI/2;c.beginPath();c.moveTo(cx+Math.cos(a)*17,cy+Math.sin(a)*17);c.lineTo(cx+Math.cos(a)*34,cy+Math.sin(a)*34);c.stroke();c.beginPath();c.arc(cx+Math.cos(a)*34,cy+Math.sin(a)*34,2.6,0,Math.PI*2);c.fill()}}else if(rank>=4){for(let k=0;k<3;k++){c.beginPath();c.arc(cx,cy,18+k*7,t*(1+k*.12)+k,t*(1+k*.12)+k+Math.PI*1.4);c.stroke()}}else{for(let k=0;k<Math.min(5,rank+2);k++){const a=t*(.45+rank*.1)+k*Math.PI*2/Math.min(5,rank+2);c.beginPath();c.arc(cx+Math.cos(a)*23,cy+Math.sin(a)*23,2.2,0,Math.PI*2);c.fill()}}c.restore()}
function paintCard(c,choice,i,t){
 const x=45+i*350,y=180,w=325,h=285,r=rarityFor(choice),rank=Object.keys(TIER_COLORS).indexOf(r),col=TIER_COLORS[r],mult=Number(tierScale[r])||1,title=String(choice&&choice[0]||'Unknown Upgrade').replace(/\s*\[[^\]]+\]\s*$/,''),desc=String(choice&&choice[1]||'Choose this upgrade to improve your build.'),rolling=!!(getGame()?.__upgradeRollActive&&rank>0),pulse=.5+.5*Math.sin(t*2.8+i*.9);
 c.save();c.globalAlpha=1;const bg=c.createLinearGradient(x,y,x+w,y+h);bg.addColorStop(0,'#1b2c39');bg.addColorStop(.5,'#0e1821');bg.addColorStop(1,'#101c27');
 c.fillStyle='rgba(2,7,12,.94)';round(c,x-5,y-5,w+10,h+10,22);c.fill();c.fillStyle=bg;round(c,x,y,w,h,18);c.fill();
 c.save();round(c,x+1,y+1,w-2,h-2,17);c.clip();c.fillStyle=col;c.globalAlpha=.11;c.fillRect(x,y,w,47);c.globalAlpha=.9;c.fillStyle=col;c.fillRect(x,y,w,3);c.restore();
 c.strokeStyle=col;c.lineWidth=rank>=4?2+1.2*pulse:1.7;c.globalAlpha=rank>=4?.72+.24*pulse:.85;round(c,x+1,y+1,w-2,h-2,17);c.stroke();c.globalAlpha=1;
 c.textAlign='center';c.textBaseline='alphabetic';c.fillStyle='rgba(6,12,18,.84)';round(c,x+15,y+12,Math.min(190,Math.max(112,c.measureText(r.toUpperCase()).width+40)),25,12);c.fill();
 c.strokeStyle=col;c.globalAlpha=.55;round(c,x+15,y+12,Math.min(190,Math.max(112,c.measureText(r.toUpperCase()).width+40)),25,12);c.stroke();c.globalAlpha=1;
 const badgeW=Math.min(190,Math.max(112,c.measureText(r.toUpperCase()).width+40));c.fillStyle=col;c.font='bold 11px Arial';c.fillText((rolling?'✧ REVEALING ':'✦ ')+r.toUpperCase(),x+15+badgeW/2,y+28);
 c.fillStyle='#12242e';c.beginPath();c.arc(x+w-28,y+25,14,0,Math.PI*2);c.fill();c.strokeStyle=col;c.stroke();c.fillStyle='#f6ffff';c.font='bold 14px Arial';c.fillText(String(i+1),x+w-28,y+30);
 const cx=x+w/2,cy=y+79;c.fillStyle=col;c.globalAlpha=.09;c.beginPath();c.arc(cx,cy,36,0,Math.PI*2);c.fill();c.globalAlpha=1;c.strokeStyle=col;c.globalAlpha=.65;c.beginPath();c.arc(cx,cy,31,0,Math.PI*2);c.stroke();c.globalAlpha=1;paintRarityMotion(c,cx,cy,col,rank,t);
 const glyph=/shield|armor|guard/i.test(title)?'⬡':/heal|regen|health/i.test(title)?'✚':/coin|treasure|loot/i.test(title)?'◉':/boss|elite/i.test(title)?'♜':/skill|ultimate|energy/i.test(title)?'ϟ':/xp|experience|luck|crit/i.test(title)?'✦':'⚔';
 c.fillStyle=col;c.font='bold 29px "Segoe UI Symbol",Arial';c.fillText(SKILL_GLYPHS[title]||glyph,cx,cy+10);
 c.fillStyle='#f3fbff';c.font='bold '+(title.length>33?13:title.length>24?14:title.length>16?16:18)+'px Arial';let tl=wrapText(c,title,w-34,2);if(tl.some(line=>c.measureText(line).width>w-35)){c.font='bold 12px Arial';tl=wrapText(c,title,w-36,2)}const titleY=tl.length>1?y+126:y+132;tl.forEach((line,j)=>c.fillText(line,cx,titleY+j*15));
 c.save();c.beginPath();c.rect(x+18,y+145,w-36,65);c.clip();c.fillStyle='#c9dae3';c.font='13px Arial';const dl=wrapText(c,desc,w-42,3),dy=tl.length>1?y+165:y+157;dl.forEach((line,j)=>c.fillText(line,cx,dy+j*15));c.restore();
 c.globalAlpha=.32;c.strokeStyle=col;c.beginPath();c.moveTo(x+23,y+215);c.lineTo(x+w-23,y+215);c.stroke();c.globalAlpha=1;c.fillStyle=col;c.font='bold 10px Arial';c.fillText(r==='Common'?'FOUNDATION TIER':r.toUpperCase()+' TIER',cx,y+235);c.fillStyle='#b8cbd6';c.font='10px Arial';c.fillText('RARITY SCALE  ×'+mult.toFixed(2),cx,y+251);c.fillStyle=rolling?'#ffdf89':'#8fb0be';c.font='bold 10px Arial';c.fillText(rolling?'WAIT FOR REVEAL':'PRESS '+(i+1)+'  /  CLICK CARD',cx,y+272);c.restore();
}
function repaintUpgradeDeck(c){
 const g=getGame();if(!g||!g.upgradeOpen||!Array.isArray(g.upgradeChoices)||g.upgradeChoices.length!==3)return false;
 const t=(typeof performance!=='undefined'&&performance.now?performance.now():Date.now())/1000;c.save();c.globalAlpha=1;
 const curtain=c.createLinearGradient(0,140,0,490);curtain.addColorStop(0,'rgba(5,11,17,.86)');curtain.addColorStop(1,'rgba(5,11,17,.94)');c.fillStyle=curtain;round(c,22,151,1086,326,22);c.fill();c.strokeStyle='rgba(104,206,193,.25)';c.lineWidth=1;round(c,22,151,1086,326,22);c.stroke();c.textAlign='center';c.fillStyle='#b6fff0';c.font='bold 11px Arial';c.fillText('BUILD YOUR RUN  /  CHOOSE ONE UPGRADE',565,169);
 g.upgradeChoices.forEach((u,i)=>paintCard(c,u,i,t));c.restore();c.textAlign='left';return true;
}
function installUpgradeDeck(){
 const canvas=document.getElementById('game');if(!canvas||!canvas.getContext||window.__OUTLAST_V439_CARD_REDRAW)return;const previous=window.draw;if(typeof previous!=='function')return;
 const wrapped=function(){const result=previous.apply(this,arguments);try{repaintUpgradeDeck(canvas.getContext('2d'))}catch(err){window.OUTLAST_UPGRADE_CARD_V439_ERROR=String(err&&err.message||err)}return result};
 wrapped.__outlastV439UpgradeDeck=true;window.draw=wrapped;try{draw=wrapped}catch(_){}window.__OUTLAST_V439_CARD_REDRAW=true;
}
function updateBuild(){
 const current=String(window.OUTLAST_BUILD||'0').split('.').map(v=>Number(v)||0),next=VERSION.split('.').map(v=>Number(v)||0);
 for(let i=0;i<Math.max(current.length,next.length);i++){if((current[i]||0)>(next[i]||0))return;if((current[i]||0)<(next[i]||0))break}
 window.OUTLAST_BUILD=VERSION;window.OUTLAST_VERSION='v'+VERSION;window.OUTLAST_UI_SYSTEM_VERSION=VERSION;document.title='OUTLAST v'+VERSION;
 ['meta[name="outlast-build"]','meta[name="build-version"]'].forEach(q=>{const el=document.querySelector(q);if(el)el.content=VERSION});
 document.querySelectorAll('.menu-chip,[data-outlast-version]').forEach(el=>{if(el.classList.contains('menu-chip'))el.textContent='v'+VERSION+' • SURVIVOR HUB';else el.textContent='v'+VERSION});
}
function installNotes(){
 try{
  if(typeof updates!=='undefined'&&Array.isArray(updates)&&!updates.some(x=>Array.isArray(x)&&String(x[0]).includes('v4.3.9 — Skills & UI Refresh')))updates.unshift(['v4.3.9 — Skills & UI Refresh','Repaired active skill selection and activation, made Time Stop truly stop enemies, refreshed level-up cards with clearer tier/effect hierarchy, and modernized menu panels for desktop and mobile.']);
  if(typeof helpArticles!=='undefined'&&Array.isArray(helpArticles)){
   const text='Open Loadout → Active Skills to unlock or equip Nova, Blink, Fortify, Time Stop, or Meteor. Unlock each skill once with coins, then equip it freely. During an active run, press Q or use the in-game Skill button; the HUD shows its cooldown. Nova damages nearby enemies, Blink teleports in your movement direction (up if none is held), Fortify grants an 8-second shield, Time Stop immobilizes enemies for 5 seconds, and Meteor strikes enemies within its blast radius. Level-up cards show the actual rarity, readable effect, multiplier, and selection key; click one or press 1, 2, or 3.';
   const article=helpArticles.find(x=>Array.isArray(x)&&String(x[0]).includes('How do I use active skills?'));if(article)article[2]=text;else helpArticles.unshift(['How do I use active skills?','Controls & Loadout',text]);
   if(!helpArticles.some(x=>Array.isArray(x)&&String(x[0]).includes('How does the redesigned menu work?')))helpArticles.unshift(['How does the redesigned menu work?','Menus & Navigation','The menu uses Play, Loadout, Gear, Progress, and More. Existing cards still open their existing systems, and the layout reflows for mobile. Upgrade choice cards show their rarity, effect text, multiplier, and pick key; keyboard 1/2/3 selection remains supported.']);
  }
 }catch(err){window.OUTLAST_V439_NOTES_ERROR=String(err&&err.message||err)}
}
function install(){
 try{
  injectMenuStyles();updateBuild();installNotes();
  window.selectSkill=selectSkillV439;try{selectSkill=selectSkillV439}catch(_){}
  window.renderSkills=renderSkillsV439;try{renderSkills=renderSkillsV439}catch(_){}
  const skillBtn=document.getElementById('skillBtn');if(skillBtn)skillBtn.onclick=renderSkillsV439;
  document.addEventListener('click',function(e){const b=e.target&&e.target.closest?e.target.closest('button[data-action="skill"][data-value]'):null;if(!b)return;e.preventDefault();e.stopPropagation();if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();selectSkillV439(b.getAttribute('data-value'))},true);
  window.useActiveSkill=activateSkillV439;try{useActiveSkill=activateSkillV439}catch(_){}
  installUpgradeDeck();
  window.OUTLAST_SKILL_UI_V439={ready:true,version:VERSION,audit:()=>({ready:true,buttonCount:document.querySelectorAll('#subPanel button[data-action="skill"]').length,selected:getSave()?.activeSkill||null,activation:typeof window.useActiveSkill==='function',renderError:window.OUTLAST_SKILL_RENDER_ERROR||null})};
  window.OUTLAST_MENU_REDESIGN_V439={ready:true,version:VERSION,audit:()=>({ready:true,styled:!!document.getElementById('outlast-v439-ui-style'),cards:document.querySelectorAll('#menu .menu-card').length,navButtons:document.querySelectorAll('#menu .menu-nav-btn').length})};
  window.OUTLAST_UPGRADE_CARD_DESIGN_V439={ready:true,version:VERSION,threeCards:true,clickRegionsPreserved:true,keyboardKeys:['1','2','3'],audit:()=>({ready:true,active:!!(getGame()?.upgradeOpen),choices:Array.isArray(getGame()?.upgradeChoices)?getGame().upgradeChoices.length:0,drawHook:!!window.__OUTLAST_V439_CARD_REDRAW,error:window.OUTLAST_UPGRADE_CARD_V439_ERROR||null})};
  updateBuild();
 }catch(err){window.OUTLAST_V439_INSTALL_ERROR=String(err&&err.message||err)}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.addEventListener('load',install,{once:true});setTimeout(install,0);setTimeout(install,150);setTimeout(install,600);setTimeout(updateBuild,2200);
})();