const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync('index.html','utf8');
function extractFunction(source,name){
  const start=source.indexOf('function '+name+'(');
  assert(start>=0,name+' must exist');
  const brace=source.indexOf('{',start);let depth=0,quote='',escape=false;
  for(let i=brace;i<source.length;i++){
    const c=source[i];
    if(quote){if(escape)escape=false;else if(c==='\\\\')escape=true;else if(c===quote)quote='';continue;}
    if(c==='"'||c==="'"||c==='\x60'){quote=c;continue;}
    if(c==='{')depth++;else if(c==='}'&&--depth===0)return source.slice(start,i+1);
  }
  throw new Error('Unclosed function '+name);
}
const navSource=extractFunction(html,'zombieNavWaypoint');
function makeWorld(obstacles){
  const sandbox={W:4000,H:3000,game:{time:0},save:{map:'Test'},blocked(x,y,r){
    return obstacles.some(o=>{const cx=Math.max(o.x,Math.min(x,o.x+o.w)),cy=Math.max(o.y,Math.min(y,o.y+o.h));return Math.hypot(x-cx,y-cy)<r;});
  }};
  vm.createContext(sandbox);vm.runInContext(navSource+';this.nav=zombieNavWaypoint;',sandbox);return sandbox;
}
function stepToward(a,b,max){const d=Math.hypot(b.x-a.x,b.y-a.y)||1;return{x:a.x+(b.x-a.x)/d*Math.min(max,d),y:a.y+(b.y-a.y)/d*Math.min(max,d)};}
{
  const wall=[{x:340,y:240,w:100,h:320}],world=makeWorld(wall),enemy={x:100,y:400,r:18};
  let collided=false;
  for(let i=0;i<500;i++){
    world.game.time+=1/30;
    const waypoint=world.nav(enemy,700,400);
    const next=stepToward(enemy,waypoint,4);
    if(world.blocked(next.x,next.y,enemy.r)){collided=true;break;}
    enemy.x=next.x;enemy.y=next.y;
    if(Math.hypot(700-enemy.x,400-enemy.y)<30)break;
  }
  assert.equal(collided,false,'zombie navigation must never steer into a blocked obstacle');
  assert(Math.hypot(700-enemy.x,400-enemy.y)<30,'zombie must route around a wall and reach the target');
}
{
  const world=makeWorld([]),enemy={x:120,y:160,r:18};
  const waypoint=world.nav(enemy,600,160);
  assert(Math.abs(waypoint.x-600)<1&&Math.abs(waypoint.y-160)<1,'clear paths should retain direct pursuit');
}
console.log('Zombie navigation obstacle-routing regression tests passed');
