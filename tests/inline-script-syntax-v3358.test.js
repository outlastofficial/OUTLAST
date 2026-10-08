const fs=require('fs'),vm=require('vm'),assert=require('assert');

function inlineScripts(html){
  const out=[];const re=/<script\b([^>]*)>([\s\S]*?)<\/script>/gi;let m;
  while((m=re.exec(html))){
    if(/\bsrc\s*=/.test(m[1]))continue;
    const code=m[2].trim();
    if(code)out.push({attrs:m[1],code});
  }
  return out;
}
function check(file){
  const html=fs.readFileSync(file,'utf8');
  const scripts=inlineScripts(html);
  assert(scripts.length>0,'HTML must contain inline JavaScript');
  scripts.forEach((s,i)=>{
    try{new vm.Script(s.code,{filename:file+' inline-script-'+(i+1)+'.js'});}
    catch(err){
      err.message=file+' inline script '+(i+1)+': '+err.message;
      throw err;
    }
  });
  return scripts.length;
}
const scripts=check('index.html');
const focused=fs.readFileSync('outlast-v3360-focused-systems.js','utf8');
new vm.Script(focused,{filename:'outlast-v3360-focused-systems.js'});
console.log('Focused v3.36.0 systems JavaScript syntax passed');
console.log('Inline JavaScript syntax regression test passed:',scripts,'scripts parsed');
