/* OUTLAST v4.3.0 — 82 new arenas, hazards and map-specific functions */
(function(){
'use strict';
const V='4.3.0',BASE=['Seizure','Ribhouse','Forest','Desert','Snow','Lava','City','Hospital','Laboratory','Subway','Prison','MilitaryBase','RuinedTown','Harbor','Bunker','Swamp','Skyscraper','Wasteland'];
const R=[
'The Void|Rift Collapse|A rift pulse grants a protective shield window.|shield',
'Neon District|Grid Overload|Neon junctions surge and award score.|score',
'Clockwork Factory|Gearstorm|Factory gears briefly improve firing tempo.|haste',
'Crystal Caverns|Crystal Resonance|Resonating crystals restore health.|heal',
'The Abyss|Pressure Wave|Pressure waves grant a protective ward.|shield',
'Overgrown Mall|Supply Sweep|Mall supply caches add coins to the current run.|coins',
'Power Plant|Power Surge|A generator pulse increases weapon damage.|attack',
'Frozen Research Base|Cryo Bloom|Cryo vents heal and clear movement slow.|cleanse',
'The Catacombs|Echo Pulse|Crypt echoes strike nearby enemies.|pulse',
'Biohazard Lab|Decon Cycle|Decontamination restores survivor health.|heal',
'Sky Fortress|Aerial Cache|A supply drone drops bonus run coins.|coins',
'The Colosseum|Champion Rally|The crowd rally adds survival score.|score',
'Graveyard District|Grave Lanterns|Grave lanterns strengthen thorn retaliation.|thorns',
'Toxic Marsh|Marsh Bloom|A clean-air pocket restores health.|heal',
'Magma Core|Magma Pulse|The core releases a controlled damage surge.|attack',
'The Sunken City|Tidal Cache|A tide washes coins toward the survivor.|coins',
'Desert Temple|Relic Guard|Ancient relics grant temporary protection.|shield',
'Cyber Prison|Security Override|A security override improves firing tempo.|haste',
'The Hive|Swarm Break|A resonant burst strikes nearby enemies.|pulse',
'Abandoned Carnival|Prize Drop|Carnival prize lockers award bonus coins.|coins',
'Storm Island|Lightning Reflex|A storm pulse improves movement speed.|speed',
'The Backrooms|Exit Sign|A rare exit sign heals and clears slow.|cleanse',
'Orbital Station|Zero-G Cache|Floating salvage awards bonus coins.|coins',
'The Museum|Curator Focus|Artifact energy sharpens critical-hit chance.|crit',
'Wasteland Highway|Roadside Salvage|A roadside supply pulse awards coins.|coins',
'The Clocktower|Pendulum Tempo|The tower bell briefly improves firing tempo.|haste',
'Dreamscape|Lucid Recovery|A lucid pulse restores health and clears slow.|cleanse',
'The Dungeon|Prisoner Guard|An ancient ward grants temporary protection.|shield',
'Frozen Ship|Icebreaker Charge|A cold-front pulse bolsters thorn retaliation.|thorns',
'The Final Frontier|Frontier Signal|An alien signal strikes nearby enemies.|pulse',
'Volcanic Observatory|Solar Flare|Observatory instruments focus a damage surge.|attack',
'Glasshouse|Prism Recovery|Prism gardens restore health.|heal',
'Rail Yard|Freight Cache|A freight container opens with coin salvage.|coins',
'Sunken Temple|Deep Ward|Temple wards grant temporary protection.|shield',
'Lunar Crater|Moonshot Focus|Lunar alignment improves critical-hit chance.|crit',
'Solar Array|Photon Tempo|Solar tracking accelerates firing cadence.|haste',
'Acid Refinery|Neutralizer|Neutralizer mist clears slow and heals.|cleanse',
'Black Ice Pass|Iceguard|The pass forms a brief protective ice shell.|shield',
'Redwood Sanctuary|Ancient Sap|Old-growth energy restores survivor health.|heal',
'Bone Orchard|Bone Thorns|Bone branches strengthen thorn retaliation.|thorns',
'Rust Cathedral|Resonance Bell|The rust bell shocks nearby enemies.|pulse',
'Magnetic Fields|Magnet Storm|A magnetic pulse expands pickup reach.|magnet',
'Echo Canyon|Echo Salvage|Resonant rocks reveal coin caches.|coins',
'Shardfall Basin|Shard Burst|Falling shards strike nearby enemies.|pulse',
'Flooded Metro|Transit Cache|A sealed platform cache awards coins.|coins',
'Steamworks|Pressure Valve|Steam pressure increases firing cadence.|haste',
'Frozen Observatory|Aurora Guard|An aurora pulse grants protection.|shield',
'Deep Core Mine|Ore Vein|An exposed ore vein yields bonus coins.|coins',
'Skybridge|Wind Draft|A controlled wind draft improves movement.|speed',
'Mirage Bazaar|Mirage Trade|A mirage trader awards a coin cache.|coins',
'Monsoon Port|Storm Recovery|Monsoon air restores health and clears slow.|cleanse',
'Thunder Plains|Thunder Focus|A thunderclap sharpens critical-hit chance.|crit',
'Cursed Library|Forbidden Knowledge|A page-flip pulse strikes nearby enemies.|pulse',
'Clockwork Vault|Vault Tempo|Vault gears briefly improve firing cadence.|haste',
'Parasite Nursery|Bio-Armor|Bio-armor strengthens thorn retaliation.|thorns',
'Fallen Kingdom|Royal Treasury|A hidden treasury awards run coins.|coins',
'Warzone Outpost|Field Medic|An outpost supply pulse restores health.|heal',
'Ghost Town|Spirit Ward|A ghost-light ward grants protection.|shield',
'Mirror Maze|Mirror Focus|Reflections sharpen critical-hit chance.|crit',
'Red Sand Rift|Rift Salvage|Rift debris deposits bonus coins.|coins',
'The Furnace|Furnace Heart|A furnace pulse boosts weapon damage.|attack',
'Starship Graveyard|Scrap Magnet|A salvage magnet expands pickup reach.|magnet',
'Quantum Lab|Quantum Pulse|A quantum pulse strikes nearby enemies.|pulse',
'The Spiral|Spiral Tempo|The spiral rhythm improves firing cadence.|haste',
'Drowned Prison|Flood Ward|A pressure ward grants protection.|shield',
'Iron Foundry|Foundry Forge|A forge surge increases weapon damage.|attack',
'Puppet Theater|Backstage Cache|Hidden backstage coins join the run.|coins',
'Carnival Underground|Lucky Ticket|A rare ticket awards bonus coins.|coins',
'Acid Rain City|Rain Neutralizer|Neutralizer rain heals and clears slow.|cleanse',
'The Maw|Devourer Pulse|The Maw emits a pulse against nearby enemies.|pulse',
'Glass Desert|Glassheart Focus|Glass dunes sharpen critical-hit chance.|crit',
'Arctic Trench|Trench Guard|A deep-freeze ward grants protection.|shield',
'Sunken Cathedral|Choir Recovery|A deep choir restores survivor health.|heal',
'Fallen Satellite|Satellite Salvage|A wrecked satellite yields salvage coins.|coins',
'Reactor Zero|Reactor Override|A reactor surge boosts weapon damage.|attack',
'Blood Moon Village|Moonlit Thorns|Moonlit roots strengthen thorn retaliation.|thorns',
'The Bone Pit|Bone Cache|A buried cache yields bonus run coins.|coins',
'Wyrm Nest|Wyrm Roar|A contained roar pulse strikes nearby enemies.|pulse',
'The Silent Forest|Quiet Recovery|A silent clearing heals and removes slow.|cleanse',
'The Endless Bridge|Bridge Tempo|The bridge rhythm improves firing cadence.|haste',
'Rift Garden|Rift Blossom|Rift blossoms restore survivor health.|heal',
'Frozen Abyss|Abyssal Guard|A deep-ice ward grants temporary protection.|shield'
].map(x=>x.split('|'));
const TYPES=[['PrismBlock','Anchor','Pillar','Rock'],['Generator','Console','Container','Barrier'],['Column','Wall','Crate','Pillar'],['Crystal','PrismBlock','Rock','Pillar'],['Anchor','Container','Rubble','Wall'],['Booth','Crate','Bench','Barrier'],['Generator','Console','Tank','Pillar'],['CryoPod','Cabinet','Generator','Barrier'],['Pillar','Rubble','Wall','Crate'],['Containment','Console','Cabinet','Generator'],['Pillar','Anchor','Wall','Container'],['Pillar','Barrier','Crate','Column'],['DeadTree','Rubble','Pillar','Rock'],['ReedBed','MudPatch','DeadTree','Rock'],['LavaRock','ObsidianPillar','Rock','Pillar'],['Container','DockWall','Wall','Rock'],['Pillar','Ruins','Crate','Anchor'],['Console','Barrier','Pillar','Generator'],['Crate','Containment','Rubble','Pillar'],['Booth','Crate','Bench','Wall'],['Rock','DeadTree','Pillar','Anchor'],['Wall','Column','Crate','Pillar'],['Console','Container','Anchor','Pillar'],['Column','Cabinet','PrismBlock','Pillar'],['Vehicle','Barrier','Crate','Rock'],['ClockGear','Column','Pillar','Wall']];
const POS=[[220,220],[800,250],[1380,260],[2020,230],[2660,260],[3310,230],[3750,260],[260,850],[900,900],[1410,880],[2110,850],[2780,920],[3500,870],[230,1640],[850,1740],[1390,1810],[2130,1650],[2820,1740],[3530,1640],[250,2350],[850,2470],[1390,2500],[2160,2390],[2820,2500],[3510,2430],[3760,2780]];
const SZ={Rock:[120,85],Crate:[90,75],Wall:[190,55],Barrier:[180,45],Pillar:[65,160],Column:[90,170],Vehicle:[160,80],Container:[170,90],Ruins:[180,75],DeadTree:[110,125],ReedBed:[160,65],MudPatch:[130,75],Generator:[105,100],Console:[95,65],Tank:[115,100],CryoPod:[90,120],Containment:[160,110],Booth:[150,85],Bench:[100,55],PrismBlock:[135,90],Anchor:[115,95],ClockGear:[115,115],Crystal:[85,115],DockWall:[190,55],Rubble:[130,90],ObsidianPillar:[65,170],Cabinet:[80,110]};
const N=v=>Number.isFinite(Number(v))?Number(v):0, getS=()=>{try{return typeof save!=='undefined'&&save?save:window.save||null}catch(_){return null}}, getG=()=>{try{return typeof game!=='undefined'&&game?game:window.game||null}catch(_){return null}};
const msg=t=>{try{if(typeof toast==='function')toast(t)}catch(_){}};
function layout(i){const set=TYPES[i%TYPES.length],a=[];for(let j=0;j<15;j++){const p=POS[(i*11+j*7)%POS.length],t=set[(j+i)%set.length],z=SZ[t]||[115,80],x=p[0]+((i+j*3)%5-2)*12,y=p[1]+((i*3+j)%5-2)*10;if(Math.abs(x-1600)<170&&Math.abs(y-1200)<240)continue;a.push([t,Math.max(70,Math.min(3930-z[0],x)),Math.max(70,Math.min(2930-z[1],y)),z[0],z[1]])}return a}
function register(){if(typeof mapDefs==='undefined'||typeof mapObstacles==='undefined'||typeof mapHazards==='undefined')return false;R.forEach((r,i)=>{const h=(215+i*47)%360,c=(h+70+i%33)%360,n=r[0];mapDefs[n]={bg:'hsl('+h+' 25% 8%)',grid:'hsl('+h+' 32% 18%)',accent:'hsl('+c+' 70% 61%)',desc:r[2]+' Hazard: '+r[1]+'. Function: '+r[2]};mapObstacles[n]=layout(i);mapHazards[n]={name:r[1],color:'hsl('+c+' 78% 62%)',interval:12+i%9,damage:5+i%6,slow:i%4===0?.18:i%4===1?.08:i%4===2?0:.12,outlastEffect:r[3],mapIndex:i}});window.OUTLAST_MAP_CATALOG=BASE.concat(R.map(r=>r[0]));window.OUTLAST_MAP_CATALOG_COUNT=window.OUTLAST_MAP_CATALOG.length;window.OUTLAST_MAP_CATALOG_UNIQUE=new Set(window.OUTLAST_MAP_CATALOG).size;window.OUTLAST_MAP_CATALOG_V430=V;return window.OUTLAST_MAP_CATALOG_COUNT===100&&window.OUTLAST_MAP_CATALOG_UNIQUE===100}
function special(name){const r=R.find(x=>x[0]===name);if(!r)return;const i=R.findIndex(x=>x[0]===name),kind=r[3],g=getG(),p=g&&g.player;if(!g||!p)return;const fx=()=>{try{if(typeof ring==='function')ring(p.x,p.y,mapDefs[name].accent,42,.32);if(typeof burst==='function')burst(p.x,p.y,mapDefs[name].accent,7,80)}catch(_){}};
if(kind==='heal'){p.hp=Math.min(N(p.max)||100,N(p.hp)+Math.max(5,(N(p.max)||100)*(.035+i%3*.01)));fx();msg('✚ '+name+': health restored.')}
else if(kind==='coins'){const a=18+i%7*7;try{if(typeof run!=='undefined'&&run)run.coins=Math.max(0,N(run.coins))+a}catch(_){}g.score=N(g.score)+a*12;fx();msg('🪙 '+name+': +'+a+' run coins.')}
else if(kind==='shield'){p.shield=Math.max(N(p.shield),2+i%3);fx();msg('🛡️ '+name+': protective ward activated.')}
else if(kind==='attack'){p.__mapBoosts=N(p.__mapBoosts);if(p.__mapBoosts<4){p.damage=Math.max(1,N(p.damage))*1.04;p.__mapBoosts++}fx();msg('⚔️ '+name+': weapon surge '+p.__mapBoosts+'/4.')}
else if(kind==='speed'){p.speed=Math.min(N(p.speedCap)||9,Math.max(.1,N(p.speed)||1)*1.035);fx();msg('💨 '+name+': movement boosted.')}
else if(kind==='magnet'){p.magnet=Math.min(5000,N(p.magnet)+28);fx();msg('🧲 '+name+': pickup reach expanded.')}
else if(kind==='thorns'){p.thorns=Math.min(.75,N(p.thorns)+.025);p.thornsRadius=Math.max(N(p.thornsRadius),180);fx();msg('🌵 '+name+': thorn retaliation strengthened.')}
else if(kind==='score'){const a=350+i%8*90;g.score=N(g.score)+a;fx();msg('🏆 '+name+': +'+a+' score.')}
else if(kind==='crit'){p.crit=Math.min(.95,N(p.crit)+.006);fx();msg('🎯 '+name+': critical chance improved.')}
else if(kind==='pulse'){let es=Array.isArray(g.enemies)?g.enemies.filter(e=>e&&!e.boss&&N(e.hp)>0):[];es.sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));es.slice(0,3).forEach(e=>{try{if(typeof damageEnemy==='function')damageEnemy(e,Math.max(2,N(p.damage)*.85));else e.hp=Math.max(0,N(e.hp)-Math.max(2,N(p.damage)))}catch(_){e.hp=Math.max(0,N(e.hp)-Math.max(2,N(p.damage)))}});fx();msg('〰️ '+name+': nearby enemies struck.')}
else if(kind==='haste'){p.fireRate=Math.max(.05,N(p.fireRate||.45)*.965);fx();msg('⏱️ '+name+': weapon cadence accelerated.')}
else if(kind==='cleanse'){p.hp=Math.min(N(p.max)||100,N(p.hp)+Math.max(4,(N(p.max)||100)*.025));if(N(p.tempSpeed)<0)p.tempSpeed=0;fx();msg('✨ '+name+': recovered and movement cleared.')}
g.__mapSpecialCount=N(g.__mapSpecialCount)+1;window.OUTLAST_LAST_MAP_SPECIAL={map:name,hazard:r[1],effect:kind,at:Date.now(),count:g.__mapSpecialCount}}
function guardStart(){if(window.__OUTLAST_V430_START_GUARD)return;const old=window.startGame;if(typeof old!=='function')return;const set=new Set(R.map(r=>r[0]));const wrap=function(){const s=getS(),n=String(s&&s.map||'Forest');if(!set.has(n))return old.apply(this,arguments);s.map='Forest';let out;try{out=old.apply(this,arguments)}finally{s.map=n}const g=getG();if(g){g.map=n;g.mapEventTimer=(mapHazards[n]||mapHazards.Forest).interval;g.mapEvent=null;g.__mapSpecialCount=0;g.__mapBoosts=0}window.OUTLAST_LAST_STARTED_MAP=n;return out};wrap.__outlastV430StartGuard=true;window.startGame=wrap;try{startGame=wrap}catch(_){}window.__OUTLAST_V430_START_GUARD=true}
function guardHazard(){if(window.__OUTLAST_V430_HAZARDS)return;const old=window.triggerMapEvent;if(typeof old!=='function')return;const wrap=function(){const n=String(getS()?.map||'Forest'),out=old.apply(this,arguments);if(R.some(r=>r[0]===n)){try{special(n)}catch(e){window.OUTLAST_MAP_SPECIAL_ERROR=String(e&&e.message||e)}}return out};window.triggerMapEvent=wrap;try{triggerMapEvent=wrap}catch(_){}window.__OUTLAST_V430_HAZARDS=true}
function version(){window.OUTLAST_BUILD=V;window.OUTLAST_VERSION='v'+V;document.title='OUTLAST v'+V;for(const q of ['meta[name="outlast-build"]','meta[name="build-version"]']){const el=document.querySelector(q);if(el)el.content=V}document.querySelectorAll('[data-outlast-version]').forEach(e=>e.textContent='v'+V);document.querySelectorAll('.menu-chip').forEach(e=>{if(/SURVIVOR HUB/i.test(e.textContent||''))e.textContent='v'+V+' • SURVIVOR HUB'})}
function notes(){try{if(typeof updates!=='undefined'&&Array.isArray(updates)&&!updates.some(x=>Array.isArray(x)&&String(x[0]).includes('v4.3.0')))updates.unshift(['v4.3.0 — 100 Maps + Owner Center','The catalog now has 100 selectable arenas, each with its own palette, distributed layout, named timed hazard and map-specific effect. The Owner Control Center adds a map lab, gameplay controls, server tools and diagnostics.']);if(typeof helpArticles!=='undefined'&&Array.isArray(helpArticles)){const a=[['Where are all 100 maps?','Maps','Open Play → Choose Map. The catalog includes the original 18 and 82 additional arenas. Every new map has a named hazard, its own distributed object layout and a map-specific event function. Use the Owner Map Lab to search, select or test any arena.'],['What do map hazards do?','Maps','Each new map has its own named scheduled hazard and special event effect, including healing, coin caches, shields, weapon surges, movement speed, pickup reach, thorns, score, critical-hit chance, enemy pulses, firing tempo or slow-clearing recovery.'],['What is new in the Owner Control Center?','Owner Tools','The owner-only panel includes a dashboard, 100-map lab, local gameplay tools, server health, registered players, event and admin-abuse controls, coin gifts, announcements, save export and diagnostics. No additional password prompt is added.']];for(let i=a.length-1;i>=0;i--)if(!helpArticles.some(x=>x&&x[0]===a[i][0]))helpArticles.unshift(a[i])}}catch(_){}}
function audit(){const all=window.OUTLAST_MAP_CATALOG||[],maps=all.map(n=>({name:n,definition:!!mapDefs[n],layout:Array.isArray(mapObstacles[n])&&mapObstacles[n].length>=10,hazard:!!mapHazards[n],description:String(mapDefs[n]?.desc||'').length>15}));return {version:V,count:all.length,unique:new Set(all).size,ready:all.length===100&&new Set(all).size===100&&maps.every(m=>m.definition&&m.layout&&m.hazard&&m.description),maps}}
function install(){try{const ok=register();version();notes();guardStart();guardHazard();window.OUTLAST_MAP_PLAYABILITY_AUDIT_V430=audit;window.OUTLAST_MAP_PLAYABILITY_AUDIT=audit;window.OUTLAST_MAP_SELECTION_AUDIT_V430=()=>({version:V,count:window.OUTLAST_MAP_CATALOG_COUNT,unique:window.OUTLAST_MAP_CATALOG_UNIQUE,selected:String(getS()?.map||'Forest'),startGuard:!!window.__OUTLAST_V430_START_GUARD,specials:R.length,ready:ok});window.__OUTLAST_V430_MAPS_READY=!!ok}catch(e){window.OUTLAST_MAPS_INSTALL_ERROR=String(e&&e.message||e)}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();window.addEventListener('load',install,{once:true});setTimeout(install,0);setTimeout(install,100);setTimeout(install,400);
})();