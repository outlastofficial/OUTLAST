/* OUTLAST v3.14.18 upgrade expansion */
(function(){
const M={'Power Shot':'Damage','Rapid Fire':'Weapon','Vitality':'Survival','Swift Feet':'Survival','Piercing':'Weapon','Multi-Shot':'Weapon','Lucky Hunter':'Luck','Lucky Charm':'Luck','Fortune':'Luck','Treasure Luck':'Luck','Overdrive':'Ability','Shield Core':'Survival','Final Swarm':'Weapon','Glass Reactor':'Damage','Guardian Core':'Survival','Treasure Hunter':'Economy','Weapon Mastery':'Weapon'};
const N=[
['Final Swarm',v=>`+${Math.max(3,Math.round(3*v))} shots • +${Math.round(12*v)}% damage`,v=>{game.player.multiShot=(game.player.multiShot||0)+Math.max(3,Math.round(3*v));game.player.damage*=1+.12*v}],
['Glass Reactor',v=>`+${Math.round(25*v)}% damage • +${Math.round(15*v)}% attack speed • -${Math.round(8*v)}% max HP`,v=>{game.player.damage*=1+.25*v;game.player.fireRate=Math.max(.16,(game.player.fireRate||.45)*(1-.15*v));game.player.max=Math.max(1,game.player.max*(1-.08*v));game.player.hp=Math.min(game.player.hp,game.player.max)}],
['Overdrive',v=>`+${Math.round(35*v)}% ultimate damage • +${Math.round(10*v)}% attack speed`,v=>{game.player.ultDamage=(game.player.ultDamage||1)*(1+.35*v);game.player.fireRate=Math.max(.16,(game.player.fireRate||.45)*(1-.10*v))}],
['Guardian Core',v=>`+${Math.round(65*v)} max HP • stronger shields`,v=>{game.player.max+=65*v;game.player.hp=Math.min(game.player.max,game.player.hp+65*v);game.player.guardianCore=(game.player.guardianCore||0)+1}],
['Treasure Hunter',v=>`+${Math.round(30*v)}% coins • +${Math.round(20*v)} Treasure Luck`,v=>{game.player.coinMult*=1+.30*v;game.player.treasureLuck=(game.player.treasureLuck||0)+20*v;game.player.luck=(game.player.upgradeLuck||0)+(game.player.lootLuck||0)+(game.player.treasureLuck||0)}],
['Weapon Mastery',v=>`+${Math.round(30*v)}% weapon damage • +${Math.max(1,Math.round(v))} pierce`,v=>{game.player.damage*=1+.30*v;game.player.pierce=(game.player.pierce||0)+Math.max(1,Math.round(v))}]
];
N.forEach(x=>{if(!tempUp.some(y=>y[0]===x[0]))tempUp.push(x)});
const oldMake=makeChoices;
makeChoices=function(){
const used=new Set(),out=[],cat=n=>M[n]||'Special';
if(game.level<=3)['Damage','Survival','Weapon'].forEach(k=>{const p=tempUp.filter(x=>cat(x[0])===k&&!used.has(x[0]));if(p.length){const x=p[Math.floor(Math.random()*p.length)],r=rollUpgradeRarity(),m=upgradeRarities[r].mult;used.add(x[0]);out.push([x[0],x[1](m),()=>x[2](m),r,k])}});
while(out.length<3){const p=tempUp.filter(x=>!used.has(x[0]));if(!p.length)break;const x=p[Math.floor(Math.random()*p.length)],r=rollUpgradeRarity(),m=upgradeRarities[r].mult;used.add(x[0]);out.push([x[0],x[1](m),()=>x[2](m),r,cat(x[0])])}
return out.length===3?out:oldMake();
};
const oldChoose=chooseUpgrade;
chooseUpgrade=function(n){
const u=game.upgradeChoices?.[n];if(!u)return;const name=u[0];oldChoose(n);
const b=game.__upgradeBuild||(game.__upgradeBuild={});b[name]=(b[name]||0)+1;
const once=(k,fn,msg)=>{if(!b[k]){b[k]=1;fn();toast(msg)}};
if(b['Multi-Shot']&&b['Piercing'])once('split',()=>{game.player.multiShot+=2;game.player.pierce+=1},'BUILD SYNERGY: SPLITSHOT');
if(b['Power Shot']&&b['Rapid Fire'])once('overclock',()=>{game.player.damage*=1.15;game.player.fireRate=Math.max(.16,game.player.fireRate*.9)},'BUILD SYNERGY: OVERCLOCK');
if(b['Vitality']&&b['Shield Core'])once('guardian',()=>{game.player.max+=40;game.player.hp=Math.min(game.player.max,game.player.hp+40)},'BUILD SYNERGY: GUARDIAN');
if(b['Treasure Hunter']&&(b['Lucky Charm']||b['Fortune']))once('treasure',()=>{game.player.coinMult*=1.2;game.player.treasureLuck+=15},'BUILD SYNERGY: TREASURE ENGINE');
if(b['Overdrive']&&b['Final Swarm'])once('apex',()=>{game.player.ultDamage*=1.2;game.player.damage*=1.1},'BUILD SYNERGY: APEX');
};
})();
