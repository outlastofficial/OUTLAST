/* OUTLAST v4.7.4 — authoritative Upgrade Luck roller.
   Loaded after legacy upgrade scripts so later updates cannot silently replace the active rarity calculation. */
(function(){
  'use strict';
  if (window.__OUTLAST_UPGRADE_LUCK_AUTHORITY_474) return;
  var tiers = ['Common','Uncommon','Rare','Epic','Legendary','Mythic','Divine','Celestial','Transcendent','Eternal','Omega'];
  var base = {Common:52,Uncommon:25,Rare:13,Epic:6.5,Legendary:2.5,Mythic:0.5,Divine:0.2,Celestial:0.08,Transcendent:0.03,Eternal:0.01,Omega:0.005};
  function roll(luck, randomValue){
    var value=Number(luck); if(!Number.isFinite(value))value=0;
    value=Math.max(0,Math.min(100,value));
    var scale=Math.min(2,value/20);
    var weights={Common:base.Common*(1-.45*scale),Uncommon:base.Uncommon*(1-.25*scale),Rare:base.Rare*(1+.35*scale),Epic:base.Epic*(1+.9*scale),Legendary:base.Legendary*(1+2*scale),Mythic:base.Mythic*(1+4*scale),Divine:base.Divine*(1+5*scale),Celestial:base.Celestial*(1+7*scale),Transcendent:base.Transcendent*(1+9*scale),Eternal:base.Eternal*(1+12*scale),Omega:base.Omega*(1+15*scale)};
    var total=tiers.reduce(function(sum,tier){return sum+weights[tier];},0);
    var r=Number(randomValue); if(!Number.isFinite(r))r=Math.random();
    r=Math.max(0,Math.min(.999999999999,r))*total;
    for(var i=0;i<tiers.length;i++){r-=weights[tiers[i]];if(r<0)return tiers[i];}
    return 'Omega';
  }
  window.OUTLAST_ROLL_UPGRADE_RARITY=roll;
  window.rollUpgradeRarity=function(){
    var activeGame=window.game;
    try{if(typeof game!=='undefined'&&game)activeGame=game;}catch(_){}
    var player=activeGame&&activeGame.player;
    return roll(player?player.upgradeLuck:0,Math.random());
  };
  window.OUTLAST_UPGRADE_LUCK_AUDIT=function(){
    var activeGame=window.game;
    try{if(typeof game!=='undefined'&&game)activeGame=game;}catch(_){}
    var player=activeGame&&activeGame.player||{};
    return {version:'4.7.4',installed:true,upgradeLuck:Math.max(0,Math.min(100,Number(player.upgradeLuck)||0)),rarityCount:tiers.length,supportedRarities:tiers.slice(),source:'authoritative-final-roll'};
  };
  window.__OUTLAST_UPGRADE_LUCK_AUTHORITY_474=true;
  if(Array.isArray(window.updates)&&!window.updates.some(function(x){return x&&String(x[0]).indexOf('v4.7.4 — Upgrade Luck Authority Fix')===0;}))
    window.updates.unshift(['v4.7.4 — Upgrade Luck Authority Fix','Fixed the final Upgrade Luck rarity roller so the active player stat affects all 11 rarity tiers from Common through Omega. Prevented the older six-tier override from replacing the live roll. Existing accounts, saves, and records are preserved.']);
  if(Array.isArray(window.helpArticles)&&!window.helpArticles.some(function(x){return x&&x[0]==='How does Upgrade Luck affect rarity?';}))
    window.helpArticles.unshift(['How does Upgrade Luck affect rarity?','Upgrades & Luck','Upgrade Luck is read from your active player each time a level-up offer is rolled. It shifts probability away from Common and Uncommon toward Rare and higher rarities across all 11 tiers, including Omega. It improves odds; it does not guarantee a specific rarity. Upgrade Luck is capped at 100 for rarity calculations.']);
})();