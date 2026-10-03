/* OUTLAST v3.27.100 — lower-rarity balance rebuild */
(function(){
  'use strict';
  if(window.__outlastLowerRarityBalance327100)return;
  window.__outlastLowerRarityBalance327100=true;

  const defs={
    'Berserker':['Berserker',()=>'+30% damage while below 50% HP',()=>{game.player.berserk=true}],
    'Big Bullets':['Big Bullets',()=>'+20% larger shots',()=>{game.player.bulletSize=(game.player.bulletSize||1)*1.20}],
    'Multi-Shot':['Multi-Shot',()=>'+2 projectiles',()=>{game.player.multiShot=(game.player.multiShot||0)+2}],
    'Elite Hunter':['Elite Hunter',()=>'+30% elite damage and +8% crit and +5% move speed',()=>{const p=game?.player;if(!p)return;p.executioner=(p.executioner||0)+.30;p.crit=Math.min(.95,(p.crit||0)+.08);p.speed=Math.min(p.speedCap||Infinity,p.speed*1.05)}],
    'Deadeye':['Deadeye',()=>'+10% crit chance',()=>{game.player.crit=Math.min(.95,(game.player.crit||0)+.10)}],
    'Lucky Hunter':['Lucky Hunter',()=>'+25% chance for double XP',()=>{game.player.lucky=true}],
    'Lucky Coins':['Lucky Coins',()=>'+25% coins',()=>{game.player.coinMult*=1.25}],
    'Double Tap':['Double Tap',()=>'+25% chance to fire an extra shot',()=>{game.player.doubleTap=true}],
    'Treasure Radar':['Treasure Radar',()=>'+2x power-up drop chance',()=>{game.player.treasure=true}],
    'Lucky Charm':['Lucky Charm',()=>'+8 Upgrade Luck',()=>{const p=game.player;p.upgradeLuck=(p.upgradeLuck||0)+8;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}],
    'Fortune':['Fortune',()=>'+18 Loot Luck',()=>{const p=game.player;p.lootLuck=(p.lootLuck||0)+18;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}],
    'Treasure Luck':['Treasure Luck',()=>'+25 Treasure Luck',()=>{const p=game.player;p.treasureLuck=(p.treasureLuck||0)+25;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}],
    'Scavenger Luck':['Scavenger Luck',()=>'+6 Loot Luck',()=>{const p=game.player;p.lootLuck=(p.lootLuck||0)+6;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}]
  };

  function install(){
    if(typeof tempUp!=='undefined'&&Array.isArray(tempUp)){
      for(const [name,def] of Object.entries(defs)){
        const i=tempUp.findIndex(x=>x&&x[0]===name);
        if(i>=0)tempUp.splice(i,1,def);
      }
    }
    if(typeof updates!=='undefined'&&Array.isArray(updates)&&!updates.some(x=>Array.isArray(x)&&String(x[0]).includes('Lower Rarity Balance'))){
      updates.unshift(['v3.27.100 — Lower Rarity Balance','Rebalanced lower-tier upgrades so Common through Mythic choices have clearer power steps without oversized progression spikes.']);
    }
    if(typeof helpArticles!=='undefined'&&Array.isArray(helpArticles)&&!helpArticles.some(x=>Array.isArray(x)&&String(x[0]).includes('lower-rarity upgrades'))){
      helpArticles.unshift(['How were lower-rarity upgrades balanced?','Upgrades','Common through Mythic outliers were reduced individually, including Berserker, Big Bullets, Multi-Shot, Elite Hunter, Deadeye, Lucky Hunter, Lucky Coins, Double Tap, Treasure Radar, and several luck upgrades.']);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  setTimeout(install,0);
})();