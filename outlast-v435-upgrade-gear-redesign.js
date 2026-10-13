/* OUTLAST v4.3.6 — Upgrade text-fit + overlay spacing */
(function(){
'use strict';
const VERSION='4.3.6';
const TIERS=['Common','Uncommon','Rare','Epic','Legendary','Mythic','Divine','Celestial','Transcendent','Eternal','Omega'];
const COLORS={Common:'#93a6b5',Uncommon:'#63d98b',Rare:'#61c7ff',Epic:'#bc8cff',Legendary:'#ffd66e',Mythic:'#ff70d7',Divine:'#fff0a0',Celestial:'#85ebff',Transcendent:'#b0a0ff',Eternal:'#ffd2ed',Omega:'#ff9f65'};
const num=v=>Number.isFinite(Number(v))?Number(v):0, txt=v=>String(v==null?'':v).replace(/\s+/g,' ').trim();
function active(){try{return typeof game!=='undefined'&&!!game.upgradeOpen&&Array.isArray(game.upgradeChoices)&&game.upgradeChoices.length===3}catch(_){return false}}
function rr(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r)}
function wrap(c,s,maxWidth,maxLines){
 const input=txt(s),raw=input.split(/\s+/).filter(Boolean),words=[];
 for(const w of raw){if(c.measureText(w).width<=maxWidth){words.push(w);continue}let part='';for(const ch of Array.from(w)){if(part&&c.measureText(part+ch).width>maxWidth){words.push(part);part=ch}else part+=ch}if(part)words.push(part)}
 const out=[];let line='',used=0,truncated=false;
 for(let i=0;i<words.length;i++){const test=(line+' '+words[i]).trim();if(line&&c.measureText(test).width>maxWidth){out.push(line);line=words[i];if(out.length>=maxLines){truncated=true;break}}else line=test;used=i+1}
 if(line&&out.length<maxLines)out.push(line);if(used<words.length)truncated=true;if(out.length>maxLines){out.length=maxLines;truncated=true}
 if(truncated&&out.length){let last=out[out.length-1]||'';while(last&&c.measureText(last+'…').width>maxWidth)last=last.slice(0,-1).trimEnd();out[out.length-1]=(last||'').replace(/[\s.,;:!?-]+$/,'')+'…'}return out;
}

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
 const x=45+i*350,y=180,w=325,h=296,cx=x+w/2,rarity=TIERS.includes(u&&u[3])?u[3]:'Common',rank=TIERS.indexOf(rarity),col=color(rarity),mult=scaleFor(rarity);
 let rolling=false;try{rolling=!!game.__upgradeRollActive&&rank>0}catch(_){}
 const pulse=.5+.5*Math.sin(t*2.3+i*.8),title=titleFor(u&&u[0],rarity),desc=txt(u&&u[1]);
 c.save();c.globalAlpha=1;c.shadowBlur=0;c.shadowColor='transparent';
 const bg=c.createLinearGradient(x,y,x+w,y+h);bg.addColorStop(0,'#172735');bg.addColorStop(.56,'#0b141d');bg.addColorStop(1,'#101925');
 c.fillStyle='#04090e';rr(c,x-5,y-5,w+10,h+10,21);c.fill();c.fillStyle=bg;rr(c,x,y,w,h,18);c.fill();
 c.globalAlpha=rank>=4?.76+.18*pulse:.98;c.strokeStyle=col;c.lineWidth=rank>=4?2.2+1.0*pulse:2.1;rr(c,x+1,y+1,w-2,h-2,17);c.stroke();c.globalAlpha=1;
 c.fillStyle=col;c.globalAlpha=.1;rr(c,x+4,y+4,w-8,50,14);c.fill();c.globalAlpha=1;
 const badgeText=(rolling?'✧ REVEALING ':'✦ ')+rarity.toUpperCase(),badgeW=Math.min(218,Math.max(130,c.measureText(badgeText).width+36));
 c.fillStyle=col;c.globalAlpha=.14;rr(c,cx-badgeW/2,y+13,badgeW,25,12);c.fill();c.globalAlpha=1;c.strokeStyle=col;c.globalAlpha=.55;c.lineWidth=1;rr(c,cx-badgeW/2,y+13,badgeW,25,12);c.stroke();c.globalAlpha=1;
 c.textAlign='center';c.textBaseline='alphabetic';c.fillStyle=col;c.font='bold 12px Arial';c.fillText(badgeText,cx,y+30);
 c.fillStyle='#09121a';c.beginPath();c.arc(x+w-27,y+26,14,0,Math.PI*2);c.fill();c.strokeStyle=col;c.globalAlpha=.8;c.lineWidth=1.5;c.stroke();c.globalAlpha=1;c.fillStyle='#ffe16b';c.font='bold 16px Arial';c.fillText(String(i+1),x+w-27,y+31);
 const iy=y+78;c.fillStyle=col;c.globalAlpha=.11;c.beginPath();c.arc(cx,iy,30,0,Math.PI*2);c.fill();c.globalAlpha=1;c.strokeStyle=col;c.globalAlpha=.65;c.lineWidth=1.4;c.beginPath();c.arc(cx,iy,30,0,Math.PI*2);c.stroke();c.globalAlpha=1;
 if(rolling){rollingFX(c,cx,iy,col,rank,t,i);c.fillStyle='#fff';c.font='bold 13px Arial';c.fillText('ROLLING…',cx,iy+4)}else{c.fillStyle=col;c.font='bold 32px "Segoe UI Symbol",Arial';c.fillText(glyphFor(title,desc),cx,iy+11)}
 c.fillStyle='#f4f7fb';let titleSize=17,tl=[];
 for(;titleSize>=12;titleSize--){c.font='bold '+titleSize+'px Arial';tl=wrap(c,title,w-42,3);if(tl.every(line=>c.measureText(line).width<=w-42)&&tl.length<=3&&!tl.some(line=>line.endsWith('…')))break}
 const titleStep=tl.length>=3?14:16,titleY=tl.length===1?y+132:tl.length===2?y+124:y+120;tl.forEach((line,j)=>c.fillText(line,cx,titleY+j*titleStep));
 const descTop=y+(tl.length>=3?164:tl.length===2?158:153);
 c.save();c.beginPath();c.rect(x+16,y+146,w-32,67);c.clip();c.fillStyle='#cfdae5';c.font='13px Arial';
 const dl=wrap(c,desc,w-44,3);dl.forEach((line,j)=>c.fillText(line,cx,descTop+j*15));c.restore();
 c.globalAlpha=.38;c.strokeStyle=col;c.lineWidth=1;c.beginPath();c.moveTo(x+22,y+221);c.lineTo(x+w-22,y+221);c.stroke();c.globalAlpha=1;
 c.fillStyle=col;c.font='bold 11px Arial';c.fillText(rarity==='Common'?'BASE TIER':rarity.toUpperCase()+' TIER',cx,y+239);
 c.fillStyle='#b9c8d5';c.font='11px Arial';c.fillText('RARITY MULTIPLIER  ×'+mult.toFixed(2),cx,y+256);
 c.fillStyle=rolling?'#f4d67a':'#8fa5b6';c.font='bold 10px Arial';c.fillText(rolling?'WAIT FOR REVEAL':'PRESS '+(i+1)+'  OR  CLICK CARD',cx,y+278);
 c.restore();
}

function redraw(c){if(!active())return;let choices;try{choices=game.upgradeChoices}catch(_){return}if(!Array.isArray(choices)||choices.length!==3)return;const t=(typeof performance!=='undefined'&&performance.now?performance.now():Date.now())/1000;c.save();c.globalAlpha=1;c.textAlign='center';choices.forEach((u,i)=>drawCard(c,u,i,t));c.restore();c.textAlign='left'}
function notes(){try{if(typeof updates!=='undefined'&&Array.isArray(updates)&&!updates.some(x=>Array.isArray(x)&&String(x[0]).includes('v4.3.6')))updates.unshift(['v4.3.6 — Upgrade Text Fit Fix','Fixed cut-off upgrade text: names support measured wrapping across up to three lines, long words are split to fit card width, descriptions stay in their own clipped box, and the footer has extra bottom clearance. The October event, threat and AFK badges are independently detected and hidden while choosing. Rarity animations and 1/2/3 selection remain.']);if(typeof helpArticles!=='undefined'&&Array.isArray(helpArticles)&&!helpArticles.some(x=>x&&String(x[0]).includes('Why were some upgrade words cut off?')))helpArticles.unshift(['Why were some upgrade words cut off?','Upgrades & Rarities','Upgrade names use measured wrapping and can span up to three lines. Long words are split to fit the card width, descriptions are clipped to a dedicated text area, and the footer has extra spacing. The event, threat and AFK overlays hide while choosing. Click a card or press 1, 2, or 3.'])}catch(_){}}
function version(){const cur=String(window.OUTLAST_BUILD||'0').split('.').map(x=>Number(x)||0),next=VERSION.split('.').map(x=>Number(x)||0);for(let i=0;i<Math.max(cur.length,next.length);i++){if((cur[i]||0)>(next[i]||0))return;if((cur[i]||0)<(next[i]||0))break}window.OUTLAST_BUILD=VERSION;window.OUTLAST_VERSION='v'+VERSION;document.title='OUTLAST v'+VERSION;['meta[name="outlast-build"]','meta[name="build-version"]'].forEach(q=>{const e=document.querySelector(q);if(e)e.content=VERSION});document.querySelectorAll('.menu-chip').forEach(e=>{if(/SURVIVOR HUB/i.test(e.textContent||''))e.textContent='v'+VERSION+' • SURVIVOR HUB'})}

function gearEsc(v){return String(v==null?'':v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
function gearSave(){try{return typeof save!=='undefined'&&save?save:window.save||null}catch(_){return null}}
function gearToast(s){try{if(typeof toast==='function')toast(s)}catch(_){}}
function gearPersist(){try{if(typeof persist==='function')persist()}catch(_){}}
function gearCurrent(){const s=gearSave()||{};return {character:s.selectedChar||'Survivor',weapon:s.selectedWeapon||'Blaster',skin:s.selectedSkin||'Classic',pet:s.selectedPet||'None',relic:s.selectedRelic||'None',charm:s.selectedCharm||'None',skill:s.activeSkill||'Nova',element:s.element||'Fire'}}
function gearOwnCount(obj){return Object.keys(obj||{}).filter(k=>obj[k]).length}
function gearScore(s){s=s||gearSave()||{};const wl=s.weaponLevels||{},sum=Object.values(wl).reduce((n,v)=>n+Math.max(0,Number(v)||0),0);return 100+sum*120+Math.max(0,(s.relicLevels&&s.relicLevels[s.selectedRelic]||1)-1)*50+Math.max(0,(s.charmLevels&&s.charmLevels[s.selectedCharm]||1)-1)*40+Math.max(0,(s.petLevels&&s.petLevels[s.selectedPet]||1)-1)*35+Math.max(0,gearOwnCount(s.unlockedWeapons)-1)*25}
function gearPanelOpen(title,body){if(typeof openSub==='function')openSub(title,body);else gearToast('Gear menu is not ready yet.')}
function gearPresetSnapshot(){const s=gearSave();if(!s)return null;const c=gearCurrent();return Object.assign({},c,{savedAt:new Date().toISOString()})}
function gearPresetsOpen(){
 const s=gearSave();if(!s)return;
 s.gearLoadouts=s.gearLoadouts&&typeof s.gearLoadouts==='object'?s.gearLoadouts:{};
 const slots=[['alpha','A — All-Rounder'],['bravo','B — Boss Hunter'],['charlie','C — Scavenger']];
 const rows=slots.map(([key,label])=>{const p=s.gearLoadouts[key];return '<article class="option"><b>📦 '+label+'</b><div class="small">'+(p?gearEsc([p.character,p.weapon,p.skin,p.pet,p.relic,p.charm].join(' • ')):'Empty slot — save your current gear here.')+'</div><div class="small">'+(p&&p.savedAt?'Saved '+gearEsc(new Date(p.savedAt).toLocaleString()):'Not saved yet')+'</div><div class="row" style="gap:8px;flex-wrap:wrap"><button type="button" data-outlast-gear-action="savePreset" data-gear-slot="'+key+'">SAVE CURRENT</button><button type="button" data-outlast-gear-action="equipPreset" data-gear-slot="'+key+'" '+(p?'':'disabled')+'>EQUIP BUILD</button></div></article>'}).join('');
 gearPanelOpen('🧰 Saved Gear Builds','<p class="note">Save three complete equipment snapshots locally. Loading a preset only equips items already owned by this save.</p><div class="grid">'+rows+'</div><div class="small">Includes character, weapon, skin, pet, relic, charm, active skill and element. Saved builds stay with this player’s local save.</div>');
}
function gearApplyPreset(slot){
 const s=gearSave(),p=s&&s.gearLoadouts&&s.gearLoadouts[slot];if(!s||!p){gearToast('That gear preset is empty.');return}
 const skipped=[];
 const apply=(field,owned,key)=>{const value=p[key];if(value&&owned&&owned[value])s[field]=value;else if(value&&(!owned||!owned[value]))skipped.push(value)};
 apply('selectedChar',s.unlockedChars,'character');
 apply('selectedWeapon',s.unlockedWeapons,'weapon');
 apply('selectedSkin',s.skins,'skin');
 apply('selectedPet',s.pets,'pet');
 apply('selectedRelic',s.relics,'relic');
 apply('selectedCharm',s.charms,'charm');
 if(p.skill&&s.ownedSkills&&s.ownedSkills[p.skill])s.activeSkill=p.skill;else if(p.skill)skipped.push(p.skill);
 if(p.element)s.element=p.element;
 gearPersist();
 gearToast('Gear build equipped.'+(skipped.length?' Locked items skipped: '+skipped.join(', '):''));
 gearPresetsOpen();
}
function gearReportOpen(){
 const s=gearSave();if(!s)return;const c=gearCurrent(),w=(typeof weapons!=='undefined'&&weapons[c.weapon])||{},wl=(s.weaponLevels&&s.weaponLevels[c.weapon])||0;
 const slots=[['Character',c.character],['Weapon',c.weapon+' • Evolution Lv '+wl+'/5'],['Skin',c.skin],['Pet',c.pet+' • Lv '+((s.petLevels&&s.petLevels[c.pet])||1)],['Relic',c.relic+' • Lv '+((s.relicLevels&&s.relicLevels[c.relic])||1)],['Charm',c.charm+' • Lv '+((s.charmLevels&&s.charmLevels[c.charm])||1)],['Active Skill',c.skill],['Element',c.element]];
 const list=slots.map(([a,b])=>'<div class="row"><b>'+gearEsc(a)+'</b><span>'+gearEsc(b)+'</span></div>').join('');
 const owned=[['Characters',s.unlockedChars],['Weapons',s.unlockedWeapons],['Skins',s.skins],['Pets',s.pets],['Relics',s.relics],['Charms',s.charms]].map(([name,obj])=>name+': '+gearOwnCount(obj)).join(' • ');
 gearPanelOpen('📊 Gear Profile & Score','<div class="option"><div class="small">GEAR SCORE <b style="font-size:25px;color:#69ddbd;margin-left:8px">'+gearScore(s).toLocaleString()+'</b></div><div class="small">A collection/evolution progress score, not a hidden damage multiplier.</div></div><div class="option">'+list+'</div><div class="option"><b>Collection</b><div class="small">'+gearEsc(owned)+'</div><div class="small">🪙 '+(Number(s.coins)||0).toLocaleString()+' coins • 🔑 '+(Number(s.worldKeys)||0).toLocaleString()+' keys • ◇ '+(Number(s.forgeCores)||0).toLocaleString()+' forge cores • ◆ '+(Number(s.materials)||0).toLocaleString()+' materials</div></div><div class="row" style="gap:8px;flex-wrap:wrap"><button type="button" data-outlast-gear-action="presets">MANAGE BUILDS</button><button type="button" data-outlast-gear-action="inventory">OPEN INVENTORY</button></div>');
}
function gearRunExisting(action){
 const calls={inventory:['renderExpandedInventory','renderInventory'],forge:['forgeOpen'],craft:['renderCrafting'],shop:['dailyShopOpen','shopOpen'],progression:['renderProgression'],sets:['renderSets'],weapons:['openWeapons'],pets:['openPets'],relics:['openRelics'],charms:['openCharms'],modifiers:['modifierOpen']};
 const names=calls[action]||[];
 for(const name of names){try{if(typeof window[name]==='function'){window[name]();return true}if(typeof globalThis[name]==='function'){globalThis[name]();return true}}catch(e){gearToast('Could not open '+action+': '+String(e.message||e));return true}}
 const ids={inventory:'inventoryBtn',weapons:'weaponBtn',pets:'petBtn',relics:'relicBtn',charms:'charmBtn',sets:'setsBtn',shop:'shopBtn',progression:'progressionBtn',modifiers:'modifierBtn'};
 const btn=ids[action]&&document.getElementById(ids[action]);if(btn){btn.click();return true}
 gearToast('That gear tool is not available in this build yet.');return false;
}
function gearMount(){
 const page=document.querySelector('[data-page-content="systems"]'),grid=page&&page.querySelector('.menu-cards');if(!page||!grid||document.getElementById('outlastGearRoom435'))return;
 const style=document.createElement('style');style.id='outlastGearRoom435Style';style.textContent='.outlast-gear-heading{margin:18px 0 8px;font-size:17px;font-weight:900;color:#d7e9f4}.outlast-gear-sub{margin:0 0 10px;color:#829aaa;font-size:12px}.outlast-gear-lab{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:12px}.outlast-gear-card{min-width:0;padding:14px;border:1px solid #294451;border-radius:15px;background:linear-gradient(145deg,#101e28,#0b131a);box-shadow:inset 0 1px rgba(255,255,255,.02)}.outlast-gear-card h3{margin:0 0 6px;font-size:14px;color:#e0eef6}.outlast-gear-card p{margin:0 0 10px;color:#8da4b4;font-size:11px;line-height:1.5}.outlast-gear-actions{display:flex;flex-wrap:wrap;gap:7px}.outlast-gear-actions button{margin:0;min-width:0;padding:8px 10px;font-size:11px;background:#142732;border:1px solid #2a4d5d;box-shadow:none}.outlast-gear-actions button.primary{background:#1c4b3c;border-color:#3b8d6b}@media(max-width:850px){.outlast-gear-lab{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:560px){.outlast-gear-lab{grid-template-columns:1fr}.outlast-gear-card{padding:12px}}';
 document.head.appendChild(style);
 const section=document.createElement('section');section.id='outlastGearRoom435';section.innerHTML='<div class="outlast-gear-heading">GEAR ROOM <span style="font-size:10px;color:#65c9b5;letter-spacing:.1em">• EXPANDED</span></div><p class="outlast-gear-sub">Save builds, inspect your equipped kit, and jump straight into the systems that improve it.</p><div class="outlast-gear-lab">'+
 '<article class="outlast-gear-card"><h3>📦 Saved Gear Builds</h3><p>Store three full equipment setups and swap to a known build without reselecting every item.</p><div class="outlast-gear-actions"><button class="primary" data-outlast-gear-action="presets">MANAGE PRESETS</button></div></article>'+
 '<article class="outlast-gear-card"><h3>📊 Gear Score & Profile</h3><p>See equipped weapon, evolution level, pet, relic, charm, skill, resources, and collection counts in one place.</p><div class="outlast-gear-actions"><button data-outlast-gear-action="report">VIEW GEAR REPORT</button></div></article>'+
 '<article class="outlast-gear-card"><h3>⚒ Weapon Forge</h3><p>Evolve your selected weapon, spend Forge Cores, buy bundles, and refine materials.</p><div class="outlast-gear-actions"><button data-outlast-gear-action="forge">OPEN FORGE</button><button data-outlast-gear-action="weapons">CHANGE WEAPON</button></div></article>'+
 '<article class="outlast-gear-card"><h3>🧿 Relic / Charm / Pet Vault</h3><p>Open the existing collection managers to unlock equipment and switch equipped bonuses.</p><div class="outlast-gear-actions"><button data-outlast-gear-action="relics">RELICS</button><button data-outlast-gear-action="charms">CHARMS</button><button data-outlast-gear-action="pets">PETS</button></div></article>'+
 '<article class="outlast-gear-card"><h3>🔨 Crafting Bench</h3><p>Convert materials into useful items and resources through the real crafting recipes. Use the single Inventory entry in Progress for item management.</p><div class="outlast-gear-actions"><button data-outlast-gear-action="craft">OPEN CRAFTING</button></div></article>'+
 '<article class="outlast-gear-card"><h3>🧩 Gear Sets & Evolutions</h3><p>Check relic-set bonuses and explore the existing weapon evolution tree.</p><div class="outlast-gear-actions"><button data-outlast-gear-action="sets">GEAR SETS</button><button data-outlast-gear-action="progression">SKILL TREE</button></div></article>'+
 '<article class="outlast-gear-card"><h3>🛒 Daily Gear Shop</h3><p>The Daily Shop and Run Modifiers each have one main launcher in Progress, keeping the menu tidy while using their existing real currency and pricing.</p><div class="outlast-gear-actions"><button data-outlast-gear-action="report">VIEW GEAR REPORT</button></div></article>'+
 '</div>';
 grid.insertAdjacentElement('afterend',section);
}
function gearHandleClick(e){
 const b=e.target&&e.target.closest&&e.target.closest('[data-outlast-gear-action]');if(!b)return;
 e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
 const a=b.getAttribute('data-outlast-gear-action'),slot=b.getAttribute('data-gear-slot');
 if(a==='presets'){gearPresetsOpen();return}
 if(a==='report'){gearReportOpen();return}
 if(a==='savePreset'){const s=gearSave();if(!s)return;s.gearLoadouts=s.gearLoadouts&&typeof s.gearLoadouts==='object'?s.gearLoadouts:{};s.gearLoadouts[slot]=gearPresetSnapshot();gearPersist();gearToast('Saved current gear in preset '+String(slot||'').toUpperCase()+'.');gearPresetsOpen();return}
 if(a==='equipPreset'){gearApplyPreset(slot);return}
 gearRunExisting(a);
}
function installGear(){
 gearMount();
 if(!window.__OUTLAST_GEAR_ROOM_435_EVENTS){document.addEventListener('click',gearHandleClick,true);window.__OUTLAST_GEAR_ROOM_435_EVENTS=true}
 window.OUTLAST_GEAR_ROOM_V435={version:VERSION,ready:!!document.getElementById('outlastGearRoom435'),audit:()=>{const s=gearSave()||{};return {ready:!!document.getElementById('outlastGearRoom435'),presets:Object.keys(s.gearLoadouts||{}).length,score:gearScore(s),weapon:s.selectedWeapon||'Blaster',cards:document.querySelectorAll('#outlastGearRoom435 .outlast-gear-card').length}}};
}
function overlayCollisionFix(){
 const up=active(),styleId='outlastV435OverlayStyle';
 if(!document.getElementById(styleId)){const st=document.createElement('style');st.id=styleId;st.textContent='.outlastV435HideOnUpgrade{display:none!important}#outlastPinkToy{display:none!important}';document.head.appendChild(st)}
 const kinds={event:[],threat:[],afk:[]};
 if(!up)document.querySelectorAll('.outlastV435HideOnUpgrade').forEach(el=>el.classList.remove('outlastV435HideOnUpgrade'));
 document.querySelectorAll('body *').forEach(el=>{
  if(el===document.body||el===document.documentElement||el.id===styleId||el.classList.contains('outlastV435HideOnUpgrade'))return;
  const text=txt(el.textContent).toUpperCase();
  const type=text.includes('OCTOBER EVENT')||text.includes('LIVE NOW')?'event':(text.includes('THREAT')&&(text.includes('HIGH')||text.includes('STABLE'))?'threat':(text.includes('AFK SPOT')?'afk':null));
  if(!type)return;let cur=el;
  for(let n=0;n<7&&cur&&cur!==document.body;n++,cur=cur.parentElement){
   const r=cur.getBoundingClientRect(),cs=window.getComputedStyle(cur),floating=['fixed','absolute','sticky'].includes(cs.position)||Number(cs.zIndex)>10;
   if(r.top<180&&r.width>=65&&r.width<=580&&r.height>=18&&r.height<=170&&floating){
    const t=txt(cur.textContent).toUpperCase(),full=type==='event'?(t.includes('OCTOBER EVENT')&&t.includes('LIVE NOW')):(type==='threat'?t.includes('THREAT')&&(t.includes('HIGH')||t.includes('STABLE')):t.includes('AFK SPOT'));
    kinds[type].push({el:cur,area:r.width*r.height,full});break;
   }
  }
 });
 for(const type of Object.keys(kinds)){
  const list=[...new Map(kinds[type].map(x=>[x.el,x])).values()],full=list.filter(x=>x.full),pool=full.length?full:list;
  const target=pool.sort((a,b)=>b.area-a.area)[0]?.el;if(target)target.classList.toggle('outlastV435HideOnUpgrade',up);
 }
 const afk=document.getElementById('outlastAFKSpotButton');if(afk)afk.style.setProperty('visibility',up?'hidden':'visible','important');
 const toy=document.getElementById('outlastPinkToy');if(toy)toy.style.setProperty('display','none','important');
 const badge=document.getElementById('outlastQualityBadge');if(badge)badge.textContent='v'+VERSION+' • SURVIVOR HUB';
 window.OUTLAST_UPGRADE_OVERLAY_AUDIT_V436={upgradeOpen:up,hiddenCandidates:Object.values(kinds).reduce((n,a)=>n+a.length,0),qualityBadgeCorrect:!!badge&&badge.textContent==='v'+VERSION+' • SURVIVOR HUB'};
}

function installOverlayFix(){
 overlayCollisionFix();
 if(!window.__OUTLAST_V435_OVERLAY_TIMER){window.__OUTLAST_V435_OVERLAY_TIMER=setInterval(overlayCollisionFix,450)}
}

function gearNotes(){try{if(typeof helpArticles!=='undefined'&&Array.isArray(helpArticles)&&!helpArticles.some(x=>x&&String(x[0]).includes('How do Gear Room presets work?')))helpArticles.unshift(['How do Gear Room presets work?','Gear','Open Gear → Gear Room → Manage Presets. Save up to three snapshots of your character, weapon, skin, pet, relic, charm, active skill, and element. Equipping a snapshot only applies items already unlocked in this save. Gear Profile shows your current equipment, collection totals, currencies, and an at-a-glance Gear Score.']);}catch(_){}}

function keepLatestBuild(){
 if(window.__OUTLAST_V435_BUILD_GUARD)return;
 window.__OUTLAST_V435_BUILD_GUARD=true;
 const settle=()=>{try{version();const badge=document.getElementById('outlastQualityBadge');if(badge)badge.textContent='v'+VERSION+' • SURVIVOR HUB'}catch(_){}};
 document.addEventListener('click',e=>{
  if(!e.target||!e.target.closest||!e.target.closest('#mapBtn'))return;
  [0,20,45,80,130,220,400,700,1100].forEach(ms=>setTimeout(settle,ms));
 },true);
 setInterval(()=>{
  if(window.OUTLAST_BUILD!==VERSION||document.title!=='OUTLAST v'+VERSION)settle();
  else {const badge=document.getElementById('outlastQualityBadge');if(badge&&badge.textContent!=='v'+VERSION+' • SURVIVOR HUB')badge.textContent='v'+VERSION+' • SURVIVOR HUB'}
 },250);
}
function install(){try{notes();gearNotes();version();keepLatestBuild();installGear();installOverlayFix();const canvas=document.getElementById('game');if(!canvas||!canvas.getContext)return;const c=canvas.getContext('2d');if(!c)return;if(!window.__OUTLAST_V435_CARD_REDRAW){const previous=window.draw;if(typeof previous!=='function')return;const wrapped=function(){const res=previous.apply(this,arguments);try{window.__OUTLAST_CUSTOM_UPGRADE_RENDER=true;redraw(c)}catch(e){window.OUTLAST_V435_CARD_ERROR=String(e&&e.message||e)}finally{window.__OUTLAST_CUSTOM_UPGRADE_RENDER=false}return res};wrapped.__outlastV435UpgradeRedesign=true;window.draw=wrapped;try{draw=wrapped}catch(_){}window.__OUTLAST_V435_CARD_REDRAW=true}window.OUTLAST_UPGRADE_CARD_DESIGN_V435={version:VERSION,ready:true,threeCards:true,clickRegionsPreserved:true,keyboardKeys:['1','2','3'],audit:()=>({active:active(),choices:(typeof game!=='undefined'&&Array.isArray(game.upgradeChoices))?game.upgradeChoices.length:0,renderHook:!!window.__OUTLAST_V435_CARD_REDRAW,error:window.OUTLAST_V435_CARD_ERROR||null})}}catch(e){window.OUTLAST_V435_INSTALL_ERROR=String(e&&e.message||e)}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();window.addEventListener('load',install,{once:true});setTimeout(install,0);setTimeout(install,100);setTimeout(install,350);
})();