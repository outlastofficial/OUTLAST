/* OUTLAST v3.30.15 — 220 new functional upgrade cards */
(function(){
'use strict';
const V='3.30.15';
const LIBRARY=[
  {name:"Common Might 01",rarity:"Common",mult:1,desc:v=>`+${Math.round(3*v)} damage`,apply:v=>()=>game.player.damage+=3*v},
  {name:"Common Haste 02",rarity:"Common",mult:1,desc:v=>`+${Math.round(2.2*v)}% attack speed`,apply:v=>()=>game.player.fireRate=Math.max(.045,(game.player.fireRate||.45)*(1-.022*v))},
  {name:"Common Vital Core 03",rarity:"Common",mult:1,desc:v=>`+${Math.round(15*v)} max HP`,apply:v=>()=>{const p=game.player;p.max+=15*v;p.hp=Math.min(p.max,p.hp+15*v)}},
  {name:"Common Fleet 04",rarity:"Common",mult:1,desc:v=>`+${Math.round(2*v)}% move speed`,apply:v=>()=>{const p=game.player;p.speed=Math.min(p.speedCap,p.speed*(1+.02*v))}},
  {name:"Common Magnet 05",rarity:"Common",mult:1,desc:v=>`+${Math.round(12*v)} pickup range`,apply:v=>()=>game.player.magnet+=12*v},
  {name:"Common Renewal 06",rarity:"Common",mult:1,desc:v=>`+${(.30*v).toFixed(1)} HP/s`,apply:v=>()=>game.player.regen+=.3*v},
  {name:"Common Breach 07",rarity:"Common",mult:1,desc:v=>`+${Math.max(1,Math.floor(v/4))} pierce`,apply:v=>()=>game.player.pierce=(game.player.pierce||0)+Math.max(1,Math.floor(v/4))},
  {name:"Common Volley 08",rarity:"Common",mult:1,desc:v=>`+${v>=4?2:1} projectile${v>=4?"s":""}`,apply:v=>()=>game.player.multiShot=(game.player.multiShot||0)+(v>=4?2:1)},
  {name:"Common Velocity 09",rarity:"Common",mult:1,desc:v=>`+${Math.round(3*v)}% projectile speed`,apply:v=>()=>game.player.projectileSpeed=(game.player.projectileSpeed||1)*(1+.03*v)},
  {name:"Common Deadeye 10",rarity:"Common",mult:1,desc:v=>`+${Math.round(v)}% crit chance`,apply:v=>()=>game.player.crit=Math.min(.99,(game.player.crit||0)+.01*v)},
  {name:"Common Fortune 11",rarity:"Common",mult:1,desc:v=>`+${Math.round(3*v)}% coins`,apply:v=>()=>game.player.coinMult*=1+.03*v},
  {name:"Common Scholar 12",rarity:"Common",mult:1,desc:v=>`+${Math.round(3*v)}% XP`,apply:v=>()=>game.player.xpBonus*=1+.03*v},
  {name:"Common Piercer 13",rarity:"Common",mult:1,desc:v=>`+${Math.round(2*v)}% armor pierce`,apply:v=>()=>game.player.armorPierce=(game.player.armorPierce||0)+.02*v},
  {name:"Common Bossbane 14",rarity:"Common",mult:1,desc:v=>`+${Math.round(3*v)}% boss damage`,apply:v=>()=>game.player.bossMult=(game.player.bossMult||1)*(1+.03*v)},
  {name:"Common Arcane 15",rarity:"Common",mult:1,desc:v=>`+${Math.round(4*v)}% ultimate damage`,apply:v=>()=>game.player.ultDamage=(game.player.ultDamage||1)*(1+.04*v)},
  {name:"Common Medic 16",rarity:"Common",mult:1,desc:v=>`+${Math.round(5*v)}% healing`,apply:v=>()=>game.player.healMult=(game.player.healMult||1)*(1+.05*v)},
  {name:"Common Luck 17",rarity:"Common",mult:1,desc:v=>`+${Math.round(2*v)} Upgrade Luck`,apply:v=>()=>{const p=game.player;p.upgradeLuck=(p.upgradeLuck||0)+2*v;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}},
  {name:"Common Cache 18",rarity:"Common",mult:1,desc:v=>`+${Math.round(2*v)} Loot Luck`,apply:v=>()=>{const p=game.player;p.lootLuck=(p.lootLuck||0)+2*v;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}},
  {name:"Common Treasure 19",rarity:"Common",mult:1,desc:v=>`+${Math.round(2*v)} Treasure Luck`,apply:v=>()=>{const p=game.player;p.treasureLuck=(p.treasureLuck||0)+2*v;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}},
  {name:"Common Aegis 20",rarity:"Common",mult:1,desc:v=>`+${Math.max(1,Math.round(.65*v))}s shield`,apply:v=>()=>game.player.shield=Math.max(game.player.shield||0,.65*v)},
  {name:"Uncommon Might 01",rarity:"Uncommon",mult:1.5,desc:v=>`+${Math.round(3*v)} damage`,apply:v=>()=>game.player.damage+=3*v},
  {name:"Uncommon Haste 02",rarity:"Uncommon",mult:1.5,desc:v=>`+${Math.round(2.2*v)}% attack speed`,apply:v=>()=>game.player.fireRate=Math.max(.045,(game.player.fireRate||.45)*(1-.022*v))},
  {name:"Uncommon Vital Core 03",rarity:"Uncommon",mult:1.5,desc:v=>`+${Math.round(15*v)} max HP`,apply:v=>()=>{const p=game.player;p.max+=15*v;p.hp=Math.min(p.max,p.hp+15*v)}},
  {name:"Uncommon Fleet 04",rarity:"Uncommon",mult:1.5,desc:v=>`+${Math.round(2*v)}% move speed`,apply:v=>()=>{const p=game.player;p.speed=Math.min(p.speedCap,p.speed*(1+.02*v))}},
  {name:"Uncommon Magnet 05",rarity:"Uncommon",mult:1.5,desc:v=>`+${Math.round(12*v)} pickup range`,apply:v=>()=>game.player.magnet+=12*v},
  {name:"Uncommon Renewal 06",rarity:"Uncommon",mult:1.5,desc:v=>`+${(.30*v).toFixed(1)} HP/s`,apply:v=>()=>game.player.regen+=.3*v},
  {name:"Uncommon Breach 07",rarity:"Uncommon",mult:1.5,desc:v=>`+${Math.max(1,Math.floor(v/4))} pierce`,apply:v=>()=>game.player.pierce=(game.player.pierce||0)+Math.max(1,Math.floor(v/4))},
  {name:"Uncommon Volley 08",rarity:"Uncommon",mult:1.5,desc:v=>`+${v>=4?2:1} projectile${v>=4?"s":""}`,apply:v=>()=>game.player.multiShot=(game.player.multiShot||0)+(v>=4?2:1)},
  {name:"Uncommon Velocity 09",rarity:"Uncommon",mult:1.5,desc:v=>`+${Math.round(3*v)}% projectile speed`,apply:v=>()=>game.player.projectileSpeed=(game.player.projectileSpeed||1)*(1+.03*v)},
  {name:"Uncommon Deadeye 10",rarity:"Uncommon",mult:1.5,desc:v=>`+${Math.round(v)}% crit chance`,apply:v=>()=>game.player.crit=Math.min(.99,(game.player.crit||0)+.01*v)},
  {name:"Uncommon Fortune 11",rarity:"Uncommon",mult:1.5,desc:v=>`+${Math.round(3*v)}% coins`,apply:v=>()=>game.player.coinMult*=1+.03*v},
  {name:"Uncommon Scholar 12",rarity:"Uncommon",mult:1.5,desc:v=>`+${Math.round(3*v)}% XP`,apply:v=>()=>game.player.xpBonus*=1+.03*v},
  {name:"Uncommon Piercer 13",rarity:"Uncommon",mult:1.5,desc:v=>`+${Math.round(2*v)}% armor pierce`,apply:v=>()=>game.player.armorPierce=(game.player.armorPierce||0)+.02*v},
  {name:"Uncommon Bossbane 14",rarity:"Uncommon",mult:1.5,desc:v=>`+${Math.round(3*v)}% boss damage`,apply:v=>()=>game.player.bossMult=(game.player.bossMult||1)*(1+.03*v)},
  {name:"Uncommon Arcane 15",rarity:"Uncommon",mult:1.5,desc:v=>`+${Math.round(4*v)}% ultimate damage`,apply:v=>()=>game.player.ultDamage=(game.player.ultDamage||1)*(1+.04*v)},
  {name:"Uncommon Medic 16",rarity:"Uncommon",mult:1.5,desc:v=>`+${Math.round(5*v)}% healing`,apply:v=>()=>game.player.healMult=(game.player.healMult||1)*(1+.05*v)},
  {name:"Uncommon Luck 17",rarity:"Uncommon",mult:1.5,desc:v=>`+${Math.round(2*v)} Upgrade Luck`,apply:v=>()=>{const p=game.player;p.upgradeLuck=(p.upgradeLuck||0)+2*v;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}},
  {name:"Uncommon Cache 18",rarity:"Uncommon",mult:1.5,desc:v=>`+${Math.round(2*v)} Loot Luck`,apply:v=>()=>{const p=game.player;p.lootLuck=(p.lootLuck||0)+2*v;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}},
  {name:"Uncommon Treasure 19",rarity:"Uncommon",mult:1.5,desc:v=>`+${Math.round(2*v)} Treasure Luck`,apply:v=>()=>{const p=game.player;p.treasureLuck=(p.treasureLuck||0)+2*v;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}},
  {name:"Uncommon Aegis 20",rarity:"Uncommon",mult:1.5,desc:v=>`+${Math.max(1,Math.round(.65*v))}s shield`,apply:v=>()=>game.player.shield=Math.max(game.player.shield||0,.65*v)},
  {name:"Rare Might 01",rarity:"Rare",mult:2,desc:v=>`+${Math.round(3*v)} damage`,apply:v=>()=>game.player.damage+=3*v},
  {name:"Rare Haste 02",rarity:"Rare",mult:2,desc:v=>`+${Math.round(2.2*v)}% attack speed`,apply:v=>()=>game.player.fireRate=Math.max(.045,(game.player.fireRate||.45)*(1-.022*v))},
  {name:"Rare Vital Core 03",rarity:"Rare",mult:2,desc:v=>`+${Math.round(15*v)} max HP`,apply:v=>()=>{const p=game.player;p.max+=15*v;p.hp=Math.min(p.max,p.hp+15*v)}},
  {name:"Rare Fleet 04",rarity:"Rare",mult:2,desc:v=>`+${Math.round(2*v)}% move speed`,apply:v=>()=>{const p=game.player;p.speed=Math.min(p.speedCap,p.speed*(1+.02*v))}},
  {name:"Rare Magnet 05",rarity:"Rare",mult:2,desc:v=>`+${Math.round(12*v)} pickup range`,apply:v=>()=>game.player.magnet+=12*v},
  {name:"Rare Renewal 06",rarity:"Rare",mult:2,desc:v=>`+${(.30*v).toFixed(1)} HP/s`,apply:v=>()=>game.player.regen+=.3*v},
  {name:"Rare Breach 07",rarity:"Rare",mult:2,desc:v=>`+${Math.max(1,Math.floor(v/4))} pierce`,apply:v=>()=>game.player.pierce=(game.player.pierce||0)+Math.max(1,Math.floor(v/4))},
  {name:"Rare Volley 08",rarity:"Rare",mult:2,desc:v=>`+${v>=4?2:1} projectile${v>=4?"s":""}`,apply:v=>()=>game.player.multiShot=(game.player.multiShot||0)+(v>=4?2:1)},
  {name:"Rare Velocity 09",rarity:"Rare",mult:2,desc:v=>`+${Math.round(3*v)}% projectile speed`,apply:v=>()=>game.player.projectileSpeed=(game.player.projectileSpeed||1)*(1+.03*v)},
  {name:"Rare Deadeye 10",rarity:"Rare",mult:2,desc:v=>`+${Math.round(v)}% crit chance`,apply:v=>()=>game.player.crit=Math.min(.99,(game.player.crit||0)+.01*v)},
  {name:"Rare Fortune 11",rarity:"Rare",mult:2,desc:v=>`+${Math.round(3*v)}% coins`,apply:v=>()=>game.player.coinMult*=1+.03*v},
  {name:"Rare Scholar 12",rarity:"Rare",mult:2,desc:v=>`+${Math.round(3*v)}% XP`,apply:v=>()=>game.player.xpBonus*=1+.03*v},
  {name:"Rare Piercer 13",rarity:"Rare",mult:2,desc:v=>`+${Math.round(2*v)}% armor pierce`,apply:v=>()=>game.player.armorPierce=(game.player.armorPierce||0)+.02*v},
  {name:"Rare Bossbane 14",rarity:"Rare",mult:2,desc:v=>`+${Math.round(3*v)}% boss damage`,apply:v=>()=>game.player.bossMult=(game.player.bossMult||1)*(1+.03*v)},
  {name:"Rare Arcane 15",rarity:"Rare",mult:2,desc:v=>`+${Math.round(4*v)}% ultimate damage`,apply:v=>()=>game.player.ultDamage=(game.player.ultDamage||1)*(1+.04*v)},
  {name:"Rare Medic 16",rarity:"Rare",mult:2,desc:v=>`+${Math.round(5*v)}% healing`,apply:v=>()=>game.player.healMult=(game.player.healMult||1)*(1+.05*v)},
  {name:"Rare Luck 17",rarity:"Rare",mult:2,desc:v=>`+${Math.round(2*v)} Upgrade Luck`,apply:v=>()=>{const p=game.player;p.upgradeLuck=(p.upgradeLuck||0)+2*v;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}},
  {name:"Rare Cache 18",rarity:"Rare",mult:2,desc:v=>`+${Math.round(2*v)} Loot Luck`,apply:v=>()=>{const p=game.player;p.lootLuck=(p.lootLuck||0)+2*v;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}},
  {name:"Rare Treasure 19",rarity:"Rare",mult:2,desc:v=>`+${Math.round(2*v)} Treasure Luck`,apply:v=>()=>{const p=game.player;p.treasureLuck=(p.treasureLuck||0)+2*v;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}},
  {name:"Rare Aegis 20",rarity:"Rare",mult:2,desc:v=>`+${Math.max(1,Math.round(.65*v))}s shield`,apply:v=>()=>game.player.shield=Math.max(game.player.shield||0,.65*v)},
  {name:"Epic Might 01",rarity:"Epic",mult:2.75,desc:v=>`+${Math.round(3*v)} damage`,apply:v=>()=>game.player.damage+=3*v},
  {name:"Epic Haste 02",rarity:"Epic",mult:2.75,desc:v=>`+${Math.round(2.2*v)}% attack speed`,apply:v=>()=>game.player.fireRate=Math.max(.045,(game.player.fireRate||.45)*(1-.022*v))},
  {name:"Epic Vital Core 03",rarity:"Epic",mult:2.75,desc:v=>`+${Math.round(15*v)} max HP`,apply:v=>()=>{const p=game.player;p.max+=15*v;p.hp=Math.min(p.max,p.hp+15*v)}},
  {name:"Epic Fleet 04",rarity:"Epic",mult:2.75,desc:v=>`+${Math.round(2*v)}% move speed`,apply:v=>()=>{const p=game.player;p.speed=Math.min(p.speedCap,p.speed*(1+.02*v))}},
  {name:"Epic Magnet 05",rarity:"Epic",mult:2.75,desc:v=>`+${Math.round(12*v)} pickup range`,apply:v=>()=>game.player.magnet+=12*v},
  {name:"Epic Renewal 06",rarity:"Epic",mult:2.75,desc:v=>`+${(.30*v).toFixed(1)} HP/s`,apply:v=>()=>game.player.regen+=.3*v},
  {name:"Epic Breach 07",rarity:"Epic",mult:2.75,desc:v=>`+${Math.max(1,Math.floor(v/4))} pierce`,apply:v=>()=>game.player.pierce=(game.player.pierce||0)+Math.max(1,Math.floor(v/4))},
  {name:"Epic Volley 08",rarity:"Epic",mult:2.75,desc:v=>`+${v>=4?2:1} projectile${v>=4?"s":""}`,apply:v=>()=>game.player.multiShot=(game.player.multiShot||0)+(v>=4?2:1)},
  {name:"Epic Velocity 09",rarity:"Epic",mult:2.75,desc:v=>`+${Math.round(3*v)}% projectile speed`,apply:v=>()=>game.player.projectileSpeed=(game.player.projectileSpeed||1)*(1+.03*v)},
  {name:"Epic Deadeye 10",rarity:"Epic",mult:2.75,desc:v=>`+${Math.round(v)}% crit chance`,apply:v=>()=>game.player.crit=Math.min(.99,(game.player.crit||0)+.01*v)},
  {name:"Epic Fortune 11",rarity:"Epic",mult:2.75,desc:v=>`+${Math.round(3*v)}% coins`,apply:v=>()=>game.player.coinMult*=1+.03*v},
  {name:"Epic Scholar 12",rarity:"Epic",mult:2.75,desc:v=>`+${Math.round(3*v)}% XP`,apply:v=>()=>game.player.xpBonus*=1+.03*v},
  {name:"Epic Piercer 13",rarity:"Epic",mult:2.75,desc:v=>`+${Math.round(2*v)}% armor pierce`,apply:v=>()=>game.player.armorPierce=(game.player.armorPierce||0)+.02*v},
  {name:"Epic Bossbane 14",rarity:"Epic",mult:2.75,desc:v=>`+${Math.round(3*v)}% boss damage`,apply:v=>()=>game.player.bossMult=(game.player.bossMult||1)*(1+.03*v)},
  {name:"Epic Arcane 15",rarity:"Epic",mult:2.75,desc:v=>`+${Math.round(4*v)}% ultimate damage`,apply:v=>()=>game.player.ultDamage=(game.player.ultDamage||1)*(1+.04*v)},
  {name:"Epic Medic 16",rarity:"Epic",mult:2.75,desc:v=>`+${Math.round(5*v)}% healing`,apply:v=>()=>game.player.healMult=(game.player.healMult||1)*(1+.05*v)},
  {name:"Epic Luck 17",rarity:"Epic",mult:2.75,desc:v=>`+${Math.round(2*v)} Upgrade Luck`,apply:v=>()=>{const p=game.player;p.upgradeLuck=(p.upgradeLuck||0)+2*v;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}},
  {name:"Epic Cache 18",rarity:"Epic",mult:2.75,desc:v=>`+${Math.round(2*v)} Loot Luck`,apply:v=>()=>{const p=game.player;p.lootLuck=(p.lootLuck||0)+2*v;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}},
  {name:"Epic Treasure 19",rarity:"Epic",mult:2.75,desc:v=>`+${Math.round(2*v)} Treasure Luck`,apply:v=>()=>{const p=game.player;p.treasureLuck=(p.treasureLuck||0)+2*v;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}},
  {name:"Epic Aegis 20",rarity:"Epic",mult:2.75,desc:v=>`+${Math.max(1,Math.round(.65*v))}s shield`,apply:v=>()=>game.player.shield=Math.max(game.player.shield||0,.65*v)},
  {name:"Legendary Might 01",rarity:"Legendary",mult:3.75,desc:v=>`+${Math.round(3*v)} damage`,apply:v=>()=>game.player.damage+=3*v},
  {name:"Legendary Haste 02",rarity:"Legendary",mult:3.75,desc:v=>`+${Math.round(2.2*v)}% attack speed`,apply:v=>()=>game.player.fireRate=Math.max(.045,(game.player.fireRate||.45)*(1-.022*v))},
  {name:"Legendary Vital Core 03",rarity:"Legendary",mult:3.75,desc:v=>`+${Math.round(15*v)} max HP`,apply:v=>()=>{const p=game.player;p.max+=15*v;p.hp=Math.min(p.max,p.hp+15*v)}},
  {name:"Legendary Fleet 04",rarity:"Legendary",mult:3.75,desc:v=>`+${Math.round(2*v)}% move speed`,apply:v=>()=>{const p=game.player;p.speed=Math.min(p.speedCap,p.speed*(1+.02*v))}},
  {name:"Legendary Magnet 05",rarity:"Legendary",mult:3.75,desc:v=>`+${Math.round(12*v)} pickup range`,apply:v=>()=>game.player.magnet+=12*v},
  {name:"Legendary Renewal 06",rarity:"Legendary",mult:3.75,desc:v=>`+${(.30*v).toFixed(1)} HP/s`,apply:v=>()=>game.player.regen+=.3*v},
  {name:"Legendary Breach 07",rarity:"Legendary",mult:3.75,desc:v=>`+${Math.max(1,Math.floor(v/4))} pierce`,apply:v=>()=>game.player.pierce=(game.player.pierce||0)+Math.max(1,Math.floor(v/4))},
  {name:"Legendary Volley 08",rarity:"Legendary",mult:3.75,desc:v=>`+${v>=4?2:1} projectile${v>=4?"s":""}`,apply:v=>()=>game.player.multiShot=(game.player.multiShot||0)+(v>=4?2:1)},
  {name:"Legendary Velocity 09",rarity:"Legendary",mult:3.75,desc:v=>`+${Math.round(3*v)}% projectile speed`,apply:v=>()=>game.player.projectileSpeed=(game.player.projectileSpeed||1)*(1+.03*v)},
  {name:"Legendary Deadeye 10",rarity:"Legendary",mult:3.75,desc:v=>`+${Math.round(v)}% crit chance`,apply:v=>()=>game.player.crit=Math.min(.99,(game.player.crit||0)+.01*v)},
  {name:"Legendary Fortune 11",rarity:"Legendary",mult:3.75,desc:v=>`+${Math.round(3*v)}% coins`,apply:v=>()=>game.player.coinMult*=1+.03*v},
  {name:"Legendary Scholar 12",rarity:"Legendary",mult:3.75,desc:v=>`+${Math.round(3*v)}% XP`,apply:v=>()=>game.player.xpBonus*=1+.03*v},
  {name:"Legendary Piercer 13",rarity:"Legendary",mult:3.75,desc:v=>`+${Math.round(2*v)}% armor pierce`,apply:v=>()=>game.player.armorPierce=(game.player.armorPierce||0)+.02*v},
  {name:"Legendary Bossbane 14",rarity:"Legendary",mult:3.75,desc:v=>`+${Math.round(3*v)}% boss damage`,apply:v=>()=>game.player.bossMult=(game.player.bossMult||1)*(1+.03*v)},
  {name:"Legendary Arcane 15",rarity:"Legendary",mult:3.75,desc:v=>`+${Math.round(4*v)}% ultimate damage`,apply:v=>()=>game.player.ultDamage=(game.player.ultDamage||1)*(1+.04*v)},
  {name:"Legendary Medic 16",rarity:"Legendary",mult:3.75,desc:v=>`+${Math.round(5*v)}% healing`,apply:v=>()=>game.player.healMult=(game.player.healMult||1)*(1+.05*v)},
  {name:"Legendary Luck 17",rarity:"Legendary",mult:3.75,desc:v=>`+${Math.round(2*v)} Upgrade Luck`,apply:v=>()=>{const p=game.player;p.upgradeLuck=(p.upgradeLuck||0)+2*v;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}},
  {name:"Legendary Cache 18",rarity:"Legendary",mult:3.75,desc:v=>`+${Math.round(2*v)} Loot Luck`,apply:v=>()=>{const p=game.player;p.lootLuck=(p.lootLuck||0)+2*v;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}},
  {name:"Legendary Treasure 19",rarity:"Legendary",mult:3.75,desc:v=>`+${Math.round(2*v)} Treasure Luck`,apply:v=>()=>{const p=game.player;p.treasureLuck=(p.treasureLuck||0)+2*v;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}},
  {name:"Legendary Aegis 20",rarity:"Legendary",mult:3.75,desc:v=>`+${Math.max(1,Math.round(.65*v))}s shield`,apply:v=>()=>game.player.shield=Math.max(game.player.shield||0,.65*v)},
  {name:"Mythic Might 01",rarity:"Mythic",mult:5.5,desc:v=>`+${Math.round(3*v)} damage`,apply:v=>()=>game.player.damage+=3*v},
  {name:"Mythic Haste 02",rarity:"Mythic",mult:5.5,desc:v=>`+${Math.round(2.2*v)}% attack speed`,apply:v=>()=>game.player.fireRate=Math.max(.045,(game.player.fireRate||.45)*(1-.022*v))},
  {name:"Mythic Vital Core 03",rarity:"Mythic",mult:5.5,desc:v=>`+${Math.round(15*v)} max HP`,apply:v=>()=>{const p=game.player;p.max+=15*v;p.hp=Math.min(p.max,p.hp+15*v)}},
  {name:"Mythic Fleet 04",rarity:"Mythic",mult:5.5,desc:v=>`+${Math.round(2*v)}% move speed`,apply:v=>()=>{const p=game.player;p.speed=Math.min(p.speedCap,p.speed*(1+.02*v))}},
  {name:"Mythic Magnet 05",rarity:"Mythic",mult:5.5,desc:v=>`+${Math.round(12*v)} pickup range`,apply:v=>()=>game.player.magnet+=12*v},
  {name:"Mythic Renewal 06",rarity:"Mythic",mult:5.5,desc:v=>`+${(.30*v).toFixed(1)} HP/s`,apply:v=>()=>game.player.regen+=.3*v},
  {name:"Mythic Breach 07",rarity:"Mythic",mult:5.5,desc:v=>`+${Math.max(1,Math.floor(v/4))} pierce`,apply:v=>()=>game.player.pierce=(game.player.pierce||0)+Math.max(1,Math.floor(v/4))},
  {name:"Mythic Volley 08",rarity:"Mythic",mult:5.5,desc:v=>`+${v>=4?2:1} projectile${v>=4?"s":""}`,apply:v=>()=>game.player.multiShot=(game.player.multiShot||0)+(v>=4?2:1)},
  {name:"Mythic Velocity 09",rarity:"Mythic",mult:5.5,desc:v=>`+${Math.round(3*v)}% projectile speed`,apply:v=>()=>game.player.projectileSpeed=(game.player.projectileSpeed||1)*(1+.03*v)},
  {name:"Mythic Deadeye 10",rarity:"Mythic",mult:5.5,desc:v=>`+${Math.round(v)}% crit chance`,apply:v=>()=>game.player.crit=Math.min(.99,(game.player.crit||0)+.01*v)},
  {name:"Mythic Fortune 11",rarity:"Mythic",mult:5.5,desc:v=>`+${Math.round(3*v)}% coins`,apply:v=>()=>game.player.coinMult*=1+.03*v},
  {name:"Mythic Scholar 12",rarity:"Mythic",mult:5.5,desc:v=>`+${Math.round(3*v)}% XP`,apply:v=>()=>game.player.xpBonus*=1+.03*v},
  {name:"Mythic Piercer 13",rarity:"Mythic",mult:5.5,desc:v=>`+${Math.round(2*v)}% armor pierce`,apply:v=>()=>game.player.armorPierce=(game.player.armorPierce||0)+.02*v},
  {name:"Mythic Bossbane 14",rarity:"Mythic",mult:5.5,desc:v=>`+${Math.round(3*v)}% boss damage`,apply:v=>()=>game.player.bossMult=(game.player.bossMult||1)*(1+.03*v)},
  {name:"Mythic Arcane 15",rarity:"Mythic",mult:5.5,desc:v=>`+${Math.round(4*v)}% ultimate damage`,apply:v=>()=>game.player.ultDamage=(game.player.ultDamage||1)*(1+.04*v)},
  {name:"Mythic Medic 16",rarity:"Mythic",mult:5.5,desc:v=>`+${Math.round(5*v)}% healing`,apply:v=>()=>game.player.healMult=(game.player.healMult||1)*(1+.05*v)},
  {name:"Mythic Luck 17",rarity:"Mythic",mult:5.5,desc:v=>`+${Math.round(2*v)} Upgrade Luck`,apply:v=>()=>{const p=game.player;p.upgradeLuck=(p.upgradeLuck||0)+2*v;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}},
  {name:"Mythic Cache 18",rarity:"Mythic",mult:5.5,desc:v=>`+${Math.round(2*v)} Loot Luck`,apply:v=>()=>{const p=game.player;p.lootLuck=(p.lootLuck||0)+2*v;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}},
  {name:"Mythic Treasure 19",rarity:"Mythic",mult:5.5,desc:v=>`+${Math.round(2*v)} Treasure Luck`,apply:v=>()=>{const p=game.player;p.treasureLuck=(p.treasureLuck||0)+2*v;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}},
  {name:"Mythic Aegis 20",rarity:"Mythic",mult:5.5,desc:v=>`+${Math.max(1,Math.round(.65*v))}s shield`,apply:v=>()=>game.player.shield=Math.max(game.player.shield||0,.65*v)},
  {name:"Divine Might 01",rarity:"Divine",mult:7,desc:v=>`+${Math.round(3*v)} damage`,apply:v=>()=>game.player.damage+=3*v},
  {name:"Divine Haste 02",rarity:"Divine",mult:7,desc:v=>`+${Math.round(2.2*v)}% attack speed`,apply:v=>()=>game.player.fireRate=Math.max(.045,(game.player.fireRate||.45)*(1-.022*v))},
  {name:"Divine Vital Core 03",rarity:"Divine",mult:7,desc:v=>`+${Math.round(15*v)} max HP`,apply:v=>()=>{const p=game.player;p.max+=15*v;p.hp=Math.min(p.max,p.hp+15*v)}},
  {name:"Divine Fleet 04",rarity:"Divine",mult:7,desc:v=>`+${Math.round(2*v)}% move speed`,apply:v=>()=>{const p=game.player;p.speed=Math.min(p.speedCap,p.speed*(1+.02*v))}},
  {name:"Divine Magnet 05",rarity:"Divine",mult:7,desc:v=>`+${Math.round(12*v)} pickup range`,apply:v=>()=>game.player.magnet+=12*v},
  {name:"Divine Renewal 06",rarity:"Divine",mult:7,desc:v=>`+${(.30*v).toFixed(1)} HP/s`,apply:v=>()=>game.player.regen+=.3*v},
  {name:"Divine Breach 07",rarity:"Divine",mult:7,desc:v=>`+${Math.max(1,Math.floor(v/4))} pierce`,apply:v=>()=>game.player.pierce=(game.player.pierce||0)+Math.max(1,Math.floor(v/4))},
  {name:"Divine Volley 08",rarity:"Divine",mult:7,desc:v=>`+${v>=4?2:1} projectile${v>=4?"s":""}`,apply:v=>()=>game.player.multiShot=(game.player.multiShot||0)+(v>=4?2:1)},
  {name:"Divine Velocity 09",rarity:"Divine",mult:7,desc:v=>`+${Math.round(3*v)}% projectile speed`,apply:v=>()=>game.player.projectileSpeed=(game.player.projectileSpeed||1)*(1+.03*v)},
  {name:"Divine Deadeye 10",rarity:"Divine",mult:7,desc:v=>`+${Math.round(v)}% crit chance`,apply:v=>()=>game.player.crit=Math.min(.99,(game.player.crit||0)+.01*v)},
  {name:"Divine Fortune 11",rarity:"Divine",mult:7,desc:v=>`+${Math.round(3*v)}% coins`,apply:v=>()=>game.player.coinMult*=1+.03*v},
  {name:"Divine Scholar 12",rarity:"Divine",mult:7,desc:v=>`+${Math.round(3*v)}% XP`,apply:v=>()=>game.player.xpBonus*=1+.03*v},
  {name:"Divine Piercer 13",rarity:"Divine",mult:7,desc:v=>`+${Math.round(2*v)}% armor pierce`,apply:v=>()=>game.player.armorPierce=(game.player.armorPierce||0)+.02*v},
  {name:"Divine Bossbane 14",rarity:"Divine",mult:7,desc:v=>`+${Math.round(3*v)}% boss damage`,apply:v=>()=>game.player.bossMult=(game.player.bossMult||1)*(1+.03*v)},
  {name:"Divine Arcane 15",rarity:"Divine",mult:7,desc:v=>`+${Math.round(4*v)}% ultimate damage`,apply:v=>()=>game.player.ultDamage=(game.player.ultDamage||1)*(1+.04*v)},
  {name:"Divine Medic 16",rarity:"Divine",mult:7,desc:v=>`+${Math.round(5*v)}% healing`,apply:v=>()=>game.player.healMult=(game.player.healMult||1)*(1+.05*v)},
  {name:"Divine Luck 17",rarity:"Divine",mult:7,desc:v=>`+${Math.round(2*v)} Upgrade Luck`,apply:v=>()=>{const p=game.player;p.upgradeLuck=(p.upgradeLuck||0)+2*v;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}},
  {name:"Divine Cache 18",rarity:"Divine",mult:7,desc:v=>`+${Math.round(2*v)} Loot Luck`,apply:v=>()=>{const p=game.player;p.lootLuck=(p.lootLuck||0)+2*v;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}},
  {name:"Divine Treasure 19",rarity:"Divine",mult:7,desc:v=>`+${Math.round(2*v)} Treasure Luck`,apply:v=>()=>{const p=game.player;p.treasureLuck=(p.treasureLuck||0)+2*v;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}},
  {name:"Divine Aegis 20",rarity:"Divine",mult:7,desc:v=>`+${Math.max(1,Math.round(.65*v))}s shield`,apply:v=>()=>game.player.shield=Math.max(game.player.shield||0,.65*v)},
  {name:"Celestial Might 01",rarity:"Celestial",mult:9,desc:v=>`+${Math.round(3*v)} damage`,apply:v=>()=>game.player.damage+=3*v},
  {name:"Celestial Haste 02",rarity:"Celestial",mult:9,desc:v=>`+${Math.round(2.2*v)}% attack speed`,apply:v=>()=>game.player.fireRate=Math.max(.045,(game.player.fireRate||.45)*(1-.022*v))},
  {name:"Celestial Vital Core 03",rarity:"Celestial",mult:9,desc:v=>`+${Math.round(15*v)} max HP`,apply:v=>()=>{const p=game.player;p.max+=15*v;p.hp=Math.min(p.max,p.hp+15*v)}},
  {name:"Celestial Fleet 04",rarity:"Celestial",mult:9,desc:v=>`+${Math.round(2*v)}% move speed`,apply:v=>()=>{const p=game.player;p.speed=Math.min(p.speedCap,p.speed*(1+.02*v))}},
  {name:"Celestial Magnet 05",rarity:"Celestial",mult:9,desc:v=>`+${Math.round(12*v)} pickup range`,apply:v=>()=>game.player.magnet+=12*v},
  {name:"Celestial Renewal 06",rarity:"Celestial",mult:9,desc:v=>`+${(.30*v).toFixed(1)} HP/s`,apply:v=>()=>game.player.regen+=.3*v},
  {name:"Celestial Breach 07",rarity:"Celestial",mult:9,desc:v=>`+${Math.max(1,Math.floor(v/4))} pierce`,apply:v=>()=>game.player.pierce=(game.player.pierce||0)+Math.max(1,Math.floor(v/4))},
  {name:"Celestial Volley 08",rarity:"Celestial",mult:9,desc:v=>`+${v>=4?2:1} projectile${v>=4?"s":""}`,apply:v=>()=>game.player.multiShot=(game.player.multiShot||0)+(v>=4?2:1)},
  {name:"Celestial Velocity 09",rarity:"Celestial",mult:9,desc:v=>`+${Math.round(3*v)}% projectile speed`,apply:v=>()=>game.player.projectileSpeed=(game.player.projectileSpeed||1)*(1+.03*v)},
  {name:"Celestial Deadeye 10",rarity:"Celestial",mult:9,desc:v=>`+${Math.round(v)}% crit chance`,apply:v=>()=>game.player.crit=Math.min(.99,(game.player.crit||0)+.01*v)},
  {name:"Celestial Fortune 11",rarity:"Celestial",mult:9,desc:v=>`+${Math.round(3*v)}% coins`,apply:v=>()=>game.player.coinMult*=1+.03*v},
  {name:"Celestial Scholar 12",rarity:"Celestial",mult:9,desc:v=>`+${Math.round(3*v)}% XP`,apply:v=>()=>game.player.xpBonus*=1+.03*v},
  {name:"Celestial Piercer 13",rarity:"Celestial",mult:9,desc:v=>`+${Math.round(2*v)}% armor pierce`,apply:v=>()=>game.player.armorPierce=(game.player.armorPierce||0)+.02*v},
  {name:"Celestial Bossbane 14",rarity:"Celestial",mult:9,desc:v=>`+${Math.round(3*v)}% boss damage`,apply:v=>()=>game.player.bossMult=(game.player.bossMult||1)*(1+.03*v)},
  {name:"Celestial Arcane 15",rarity:"Celestial",mult:9,desc:v=>`+${Math.round(4*v)}% ultimate damage`,apply:v=>()=>game.player.ultDamage=(game.player.ultDamage||1)*(1+.04*v)},
  {name:"Celestial Medic 16",rarity:"Celestial",mult:9,desc:v=>`+${Math.round(5*v)}% healing`,apply:v=>()=>game.player.healMult=(game.player.healMult||1)*(1+.05*v)},
  {name:"Celestial Luck 17",rarity:"Celestial",mult:9,desc:v=>`+${Math.round(2*v)} Upgrade Luck`,apply:v=>()=>{const p=game.player;p.upgradeLuck=(p.upgradeLuck||0)+2*v;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}},
  {name:"Celestial Cache 18",rarity:"Celestial",mult:9,desc:v=>`+${Math.round(2*v)} Loot Luck`,apply:v=>()=>{const p=game.player;p.lootLuck=(p.lootLuck||0)+2*v;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}},
  {name:"Celestial Treasure 19",rarity:"Celestial",mult:9,desc:v=>`+${Math.round(2*v)} Treasure Luck`,apply:v=>()=>{const p=game.player;p.treasureLuck=(p.treasureLuck||0)+2*v;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}},
  {name:"Celestial Aegis 20",rarity:"Celestial",mult:9,desc:v=>`+${Math.max(1,Math.round(.65*v))}s shield`,apply:v=>()=>game.player.shield=Math.max(game.player.shield||0,.65*v)},
  {name:"Transcendent Might 01",rarity:"Transcendent",mult:12,desc:v=>`+${Math.round(3*v)} damage`,apply:v=>()=>game.player.damage+=3*v},
  {name:"Transcendent Haste 02",rarity:"Transcendent",mult:12,desc:v=>`+${Math.round(2.2*v)}% attack speed`,apply:v=>()=>game.player.fireRate=Math.max(.045,(game.player.fireRate||.45)*(1-.022*v))},
  {name:"Transcendent Vital Core 03",rarity:"Transcendent",mult:12,desc:v=>`+${Math.round(15*v)} max HP`,apply:v=>()=>{const p=game.player;p.max+=15*v;p.hp=Math.min(p.max,p.hp+15*v)}},
  {name:"Transcendent Fleet 04",rarity:"Transcendent",mult:12,desc:v=>`+${Math.round(2*v)}% move speed`,apply:v=>()=>{const p=game.player;p.speed=Math.min(p.speedCap,p.speed*(1+.02*v))}},
  {name:"Transcendent Magnet 05",rarity:"Transcendent",mult:12,desc:v=>`+${Math.round(12*v)} pickup range`,apply:v=>()=>game.player.magnet+=12*v},
  {name:"Transcendent Renewal 06",rarity:"Transcendent",mult:12,desc:v=>`+${(.30*v).toFixed(1)} HP/s`,apply:v=>()=>game.player.regen+=.3*v},
  {name:"Transcendent Breach 07",rarity:"Transcendent",mult:12,desc:v=>`+${Math.max(1,Math.floor(v/4))} pierce`,apply:v=>()=>game.player.pierce=(game.player.pierce||0)+Math.max(1,Math.floor(v/4))},
  {name:"Transcendent Volley 08",rarity:"Transcendent",mult:12,desc:v=>`+${v>=4?2:1} projectile${v>=4?"s":""}`,apply:v=>()=>game.player.multiShot=(game.player.multiShot||0)+(v>=4?2:1)},
  {name:"Transcendent Velocity 09",rarity:"Transcendent",mult:12,desc:v=>`+${Math.round(3*v)}% projectile speed`,apply:v=>()=>game.player.projectileSpeed=(game.player.projectileSpeed||1)*(1+.03*v)},
  {name:"Transcendent Deadeye 10",rarity:"Transcendent",mult:12,desc:v=>`+${Math.round(v)}% crit chance`,apply:v=>()=>game.player.crit=Math.min(.99,(game.player.crit||0)+.01*v)},
  {name:"Transcendent Fortune 11",rarity:"Transcendent",mult:12,desc:v=>`+${Math.round(3*v)}% coins`,apply:v=>()=>game.player.coinMult*=1+.03*v},
  {name:"Transcendent Scholar 12",rarity:"Transcendent",mult:12,desc:v=>`+${Math.round(3*v)}% XP`,apply:v=>()=>game.player.xpBonus*=1+.03*v},
  {name:"Transcendent Piercer 13",rarity:"Transcendent",mult:12,desc:v=>`+${Math.round(2*v)}% armor pierce`,apply:v=>()=>game.player.armorPierce=(game.player.armorPierce||0)+.02*v},
  {name:"Transcendent Bossbane 14",rarity:"Transcendent",mult:12,desc:v=>`+${Math.round(3*v)}% boss damage`,apply:v=>()=>game.player.bossMult=(game.player.bossMult||1)*(1+.03*v)},
  {name:"Transcendent Arcane 15",rarity:"Transcendent",mult:12,desc:v=>`+${Math.round(4*v)}% ultimate damage`,apply:v=>()=>game.player.ultDamage=(game.player.ultDamage||1)*(1+.04*v)},
  {name:"Transcendent Medic 16",rarity:"Transcendent",mult:12,desc:v=>`+${Math.round(5*v)}% healing`,apply:v=>()=>game.player.healMult=(game.player.healMult||1)*(1+.05*v)},
  {name:"Transcendent Luck 17",rarity:"Transcendent",mult:12,desc:v=>`+${Math.round(2*v)} Upgrade Luck`,apply:v=>()=>{const p=game.player;p.upgradeLuck=(p.upgradeLuck||0)+2*v;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}},
  {name:"Transcendent Cache 18",rarity:"Transcendent",mult:12,desc:v=>`+${Math.round(2*v)} Loot Luck`,apply:v=>()=>{const p=game.player;p.lootLuck=(p.lootLuck||0)+2*v;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}},
  {name:"Transcendent Treasure 19",rarity:"Transcendent",mult:12,desc:v=>`+${Math.round(2*v)} Treasure Luck`,apply:v=>()=>{const p=game.player;p.treasureLuck=(p.treasureLuck||0)+2*v;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}},
  {name:"Transcendent Aegis 20",rarity:"Transcendent",mult:12,desc:v=>`+${Math.max(1,Math.round(.65*v))}s shield`,apply:v=>()=>game.player.shield=Math.max(game.player.shield||0,.65*v)},
  {name:"Eternal Might 01",rarity:"Eternal",mult:16,desc:v=>`+${Math.round(3*v)} damage`,apply:v=>()=>game.player.damage+=3*v},
  {name:"Eternal Haste 02",rarity:"Eternal",mult:16,desc:v=>`+${Math.round(2.2*v)}% attack speed`,apply:v=>()=>game.player.fireRate=Math.max(.045,(game.player.fireRate||.45)*(1-.022*v))},
  {name:"Eternal Vital Core 03",rarity:"Eternal",mult:16,desc:v=>`+${Math.round(15*v)} max HP`,apply:v=>()=>{const p=game.player;p.max+=15*v;p.hp=Math.min(p.max,p.hp+15*v)}},
  {name:"Eternal Fleet 04",rarity:"Eternal",mult:16,desc:v=>`+${Math.round(2*v)}% move speed`,apply:v=>()=>{const p=game.player;p.speed=Math.min(p.speedCap,p.speed*(1+.02*v))}},
  {name:"Eternal Magnet 05",rarity:"Eternal",mult:16,desc:v=>`+${Math.round(12*v)} pickup range`,apply:v=>()=>game.player.magnet+=12*v},
  {name:"Eternal Renewal 06",rarity:"Eternal",mult:16,desc:v=>`+${(.30*v).toFixed(1)} HP/s`,apply:v=>()=>game.player.regen+=.3*v},
  {name:"Eternal Breach 07",rarity:"Eternal",mult:16,desc:v=>`+${Math.max(1,Math.floor(v/4))} pierce`,apply:v=>()=>game.player.pierce=(game.player.pierce||0)+Math.max(1,Math.floor(v/4))},
  {name:"Eternal Volley 08",rarity:"Eternal",mult:16,desc:v=>`+${v>=4?2:1} projectile${v>=4?"s":""}`,apply:v=>()=>game.player.multiShot=(game.player.multiShot||0)+(v>=4?2:1)},
  {name:"Eternal Velocity 09",rarity:"Eternal",mult:16,desc:v=>`+${Math.round(3*v)}% projectile speed`,apply:v=>()=>game.player.projectileSpeed=(game.player.projectileSpeed||1)*(1+.03*v)},
  {name:"Eternal Deadeye 10",rarity:"Eternal",mult:16,desc:v=>`+${Math.round(v)}% crit chance`,apply:v=>()=>game.player.crit=Math.min(.99,(game.player.crit||0)+.01*v)},
  {name:"Eternal Fortune 11",rarity:"Eternal",mult:16,desc:v=>`+${Math.round(3*v)}% coins`,apply:v=>()=>game.player.coinMult*=1+.03*v},
  {name:"Eternal Scholar 12",rarity:"Eternal",mult:16,desc:v=>`+${Math.round(3*v)}% XP`,apply:v=>()=>game.player.xpBonus*=1+.03*v},
  {name:"Eternal Piercer 13",rarity:"Eternal",mult:16,desc:v=>`+${Math.round(2*v)}% armor pierce`,apply:v=>()=>game.player.armorPierce=(game.player.armorPierce||0)+.02*v},
  {name:"Eternal Bossbane 14",rarity:"Eternal",mult:16,desc:v=>`+${Math.round(3*v)}% boss damage`,apply:v=>()=>game.player.bossMult=(game.player.bossMult||1)*(1+.03*v)},
  {name:"Eternal Arcane 15",rarity:"Eternal",mult:16,desc:v=>`+${Math.round(4*v)}% ultimate damage`,apply:v=>()=>game.player.ultDamage=(game.player.ultDamage||1)*(1+.04*v)},
  {name:"Eternal Medic 16",rarity:"Eternal",mult:16,desc:v=>`+${Math.round(5*v)}% healing`,apply:v=>()=>game.player.healMult=(game.player.healMult||1)*(1+.05*v)},
  {name:"Eternal Luck 17",rarity:"Eternal",mult:16,desc:v=>`+${Math.round(2*v)} Upgrade Luck`,apply:v=>()=>{const p=game.player;p.upgradeLuck=(p.upgradeLuck||0)+2*v;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}},
  {name:"Eternal Cache 18",rarity:"Eternal",mult:16,desc:v=>`+${Math.round(2*v)} Loot Luck`,apply:v=>()=>{const p=game.player;p.lootLuck=(p.lootLuck||0)+2*v;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}},
  {name:"Eternal Treasure 19",rarity:"Eternal",mult:16,desc:v=>`+${Math.round(2*v)} Treasure Luck`,apply:v=>()=>{const p=game.player;p.treasureLuck=(p.treasureLuck||0)+2*v;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}},
  {name:"Eternal Aegis 20",rarity:"Eternal",mult:16,desc:v=>`+${Math.max(1,Math.round(.65*v))}s shield`,apply:v=>()=>game.player.shield=Math.max(game.player.shield||0,.65*v)},
  {name:"Omega Might 01",rarity:"Omega",mult:22,desc:v=>`+${Math.round(3*v)} damage`,apply:v=>()=>game.player.damage+=3*v},
  {name:"Omega Haste 02",rarity:"Omega",mult:22,desc:v=>`+${Math.round(2.2*v)}% attack speed`,apply:v=>()=>game.player.fireRate=Math.max(.045,(game.player.fireRate||.45)*(1-.022*v))},
  {name:"Omega Vital Core 03",rarity:"Omega",mult:22,desc:v=>`+${Math.round(15*v)} max HP`,apply:v=>()=>{const p=game.player;p.max+=15*v;p.hp=Math.min(p.max,p.hp+15*v)}},
  {name:"Omega Fleet 04",rarity:"Omega",mult:22,desc:v=>`+${Math.round(2*v)}% move speed`,apply:v=>()=>{const p=game.player;p.speed=Math.min(p.speedCap,p.speed*(1+.02*v))}},
  {name:"Omega Magnet 05",rarity:"Omega",mult:22,desc:v=>`+${Math.round(12*v)} pickup range`,apply:v=>()=>game.player.magnet+=12*v},
  {name:"Omega Renewal 06",rarity:"Omega",mult:22,desc:v=>`+${(.30*v).toFixed(1)} HP/s`,apply:v=>()=>game.player.regen+=.3*v},
  {name:"Omega Breach 07",rarity:"Omega",mult:22,desc:v=>`+${Math.max(1,Math.floor(v/4))} pierce`,apply:v=>()=>game.player.pierce=(game.player.pierce||0)+Math.max(1,Math.floor(v/4))},
  {name:"Omega Volley 08",rarity:"Omega",mult:22,desc:v=>`+${v>=4?2:1} projectile${v>=4?"s":""}`,apply:v=>()=>game.player.multiShot=(game.player.multiShot||0)+(v>=4?2:1)},
  {name:"Omega Velocity 09",rarity:"Omega",mult:22,desc:v=>`+${Math.round(3*v)}% projectile speed`,apply:v=>()=>game.player.projectileSpeed=(game.player.projectileSpeed||1)*(1+.03*v)},
  {name:"Omega Deadeye 10",rarity:"Omega",mult:22,desc:v=>`+${Math.round(v)}% crit chance`,apply:v=>()=>game.player.crit=Math.min(.99,(game.player.crit||0)+.01*v)},
  {name:"Omega Fortune 11",rarity:"Omega",mult:22,desc:v=>`+${Math.round(3*v)}% coins`,apply:v=>()=>game.player.coinMult*=1+.03*v},
  {name:"Omega Scholar 12",rarity:"Omega",mult:22,desc:v=>`+${Math.round(3*v)}% XP`,apply:v=>()=>game.player.xpBonus*=1+.03*v},
  {name:"Omega Piercer 13",rarity:"Omega",mult:22,desc:v=>`+${Math.round(2*v)}% armor pierce`,apply:v=>()=>game.player.armorPierce=(game.player.armorPierce||0)+.02*v},
  {name:"Omega Bossbane 14",rarity:"Omega",mult:22,desc:v=>`+${Math.round(3*v)}% boss damage`,apply:v=>()=>game.player.bossMult=(game.player.bossMult||1)*(1+.03*v)},
  {name:"Omega Arcane 15",rarity:"Omega",mult:22,desc:v=>`+${Math.round(4*v)}% ultimate damage`,apply:v=>()=>game.player.ultDamage=(game.player.ultDamage||1)*(1+.04*v)},
  {name:"Omega Medic 16",rarity:"Omega",mult:22,desc:v=>`+${Math.round(5*v)}% healing`,apply:v=>()=>game.player.healMult=(game.player.healMult||1)*(1+.05*v)},
  {name:"Omega Luck 17",rarity:"Omega",mult:22,desc:v=>`+${Math.round(2*v)} Upgrade Luck`,apply:v=>()=>{const p=game.player;p.upgradeLuck=(p.upgradeLuck||0)+2*v;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}},
  {name:"Omega Cache 18",rarity:"Omega",mult:22,desc:v=>`+${Math.round(2*v)} Loot Luck`,apply:v=>()=>{const p=game.player;p.lootLuck=(p.lootLuck||0)+2*v;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}},
  {name:"Omega Treasure 19",rarity:"Omega",mult:22,desc:v=>`+${Math.round(2*v)} Treasure Luck`,apply:v=>()=>{const p=game.player;p.treasureLuck=(p.treasureLuck||0)+2*v;p.luck=(p.upgradeLuck||0)+(p.lootLuck||0)+(p.treasureLuck||0)}},
  {name:"Omega Aegis 20",rarity:"Omega",mult:22,desc:v=>`+${Math.max(1,Math.round(.65*v))}s shield`,apply:v=>()=>game.player.shield=Math.max(game.player.shield||0,.65*v)},
];
function install(){
  for(const d of LIBRARY){
    const entry=[d.name,d.desc,d.apply(d.mult)];
    if(Array.isArray(tempUp)&&!tempUp.some(x=>x&&x[0]===d.name))tempUp.push(entry);
    const pools=window.OUTLAST_UPGRADE_RARITY_POOLS;
    if(pools&&Array.isArray(pools[d.rarity])&&!pools[d.rarity].includes(d.name))pools[d.rarity].push(d.name);
    if(window.OUTLAST_UPGRADE_RARITY_BY_NAME)window.OUTLAST_UPGRADE_RARITY_BY_NAME[d.name]=d.rarity;
  }
  if(typeof upgradeRarities!=='undefined'){
    upgradeRarities.Divine={mult:7,label:'DIVINE',weight:.9,glow:'#ffffff'};
    upgradeRarities.Celestial={mult:9,label:'CELESTIAL',weight:.55,glow:'#7ce7ff'};
    upgradeRarities.Transcendent={mult:12,label:'TRANSCENDENT',weight:.25,glow:'#ff9cf2'};
    upgradeRarities.Eternal={mult:16,label:'ETERNAL',weight:.12,glow:'#b8a7ff'};
    upgradeRarities.Omega={mult:22,label:'OMEGA',weight:.05,glow:'#ff6b6b'};
  }
  const pools=window.OUTLAST_UPGRADE_RARITY_POOLS||{};
  window.OUTLAST_UPGRADE_LIBRARY_COUNT=[...new Set(Object.values(pools).flat().filter(Boolean))].length;
  window.OUTLAST_UPGRADE_LIBRARY_VERSION=V;
}
function installRoll(){
  window.rollUpgradeRarity=function(){
    const luck=Math.max(0,Number(game.player&&game.player.upgradeLuck||0));
    const boost=Math.min(.85,luck/150);
    const weights={Common:42,Uncommon:25,Rare:14,Epic:7,Legendary:4,Mythic:1.8,Divine:.9,Celestial:.55,Transcendent:.25,Eternal:.12,Omega:.05};
    const adjusted={};
    for(const [r,w] of Object.entries(weights)){
      const high=['Divine','Celestial','Transcendent','Eternal','Omega'].includes(r);
      adjusted[r]=w*(high?(1+boost*3):(r==='Common'?1-boost*.15:1));
    }
    const keys=Object.keys(adjusted),total=keys.reduce((a,r)=>a+adjusted[r],0);
    let roll=Math.random()*total;
    for(const r of keys){roll-=adjusted[r];if(roll<=0)return r;}
    return 'Common';
  };
}
function hook(){
  install();installRoll();
  try{
    document.title='OUTLAST v3.30.15';
    window.OUTLAST_BUILD='3.30.15';window.OUTLAST_VERSION='v3.30.15';
    document.querySelectorAll('[data-outlast-version]').forEach(e=>e.textContent='v3.30.15');
    if(Array.isArray(helpArticles)&&!helpArticles.some(x=>x&&x[0]==='How many upgrade choices are there?')){
      helpArticles.unshift(['How many upgrade choices are there?','Upgrades & Luck','OUTLAST now has more than 200 distinct level-up upgrade cards across every rarity tier.']);
    }
  }catch(_){}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hook,{once:true});else hook();
setTimeout(hook,0);
})();