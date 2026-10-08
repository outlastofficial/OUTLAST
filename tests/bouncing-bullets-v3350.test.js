const fs=require('fs'),assert=require('assert');
const html=fs.readFileSync('index.html','utf8');
const marker='for(let i=game.bullets.length-1;i>=0;i--){const b=game.bullets[i];if(b.enemy)continue;';
const start=html.indexOf(marker);assert(start>=0,'player projectile loop must exist');
const end=html.indexOf('\n for(const e of game.enemies)',start);assert(end>start,'player projectile loop boundary must exist');
const loop=html.slice(start,end);
assert(loop.includes('!b.bounceTargets||!b.bounceTargets.has(e)') || loop.includes('!b.bounceTargets || !b.bounceTargets.has(e)'),'bouncing bullets must ignore enemies already hit by this bullet');
assert(loop.includes('if(bouncedThisFrame)break'),'a successful bounce must stop the current collision pass');
console.log('Bouncing Bullets regression test passed');
