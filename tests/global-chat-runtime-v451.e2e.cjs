const { chromium } = require('playwright');
const assert = require('node:assert/strict');

(async()=>{
  const browser=await chromium.launch({headless:true});
  try{
    const baseUrl=process.env.OUTLAST_CHAT_TEST_URL||'https://outlastofficial.github.io/OUTLAST/index.html';
    for(const viewport of [{width:1280,height:900},{width:390,height:844}]){
      const context=await browser.newContext({viewport});
      const page=await context.newPage();
      let posted=null, refreshes=0;
      let fakeMessages=[
        {id:'chat-e2e-owner',username:'BestGamer',role:'OWNER',message:'owner badge smoke test',at:Date.now()},
        {id:'chat-e2e-tester',username:'SS',role:'TESTER',message:'tester badge smoke test',at:Date.now()+1}
      ];
      await page.addInitScript(()=>{
        localStorage.setItem('outlastUsername','E2EPlayer');
        localStorage.setItem('outlastDeviceMode','pc');
        localStorage.setItem('outlastJoystickMode','off');
        localStorage.setItem('outlast_update_ack_v4.5.1','1');
        localStorage.setItem('outlast_v451_release_popup_ack','1');
        localStorage.setItem('outlastSeenUpdateVersion','4.5.1');
        localStorage.setItem('outlast_update_ack_v4.0.0','1');
        localStorage.setItem('outlastNewPlayerTutorialV317','1');
      });
      await page.route(/^https:\/\/outlast(?:-test)?-server\.onrender\.com\/api\/chat(?:\?.*)?$/,async route=>{
        const req=route.request();
        if(req.method()==='POST'){
          posted=await req.postDataJSON();
          const username=String(posted.username||'Player');
          const norm=username.toLowerCase().replace(/[^a-z0-9]/g,'');
          const role=['bestgamer','landon','phonelandon','poke','billybimbo'].includes(norm)?'OWNER':['max','ss'].includes(norm)?'TESTER':'PLAYER';
          const entry={id:'chat-e2e-posted',username,role,message:String(posted.message||''),at:Date.now()};
          fakeMessages.push(entry);
          await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,entry})});
        }else{
          refreshes++;
          await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,messages:fakeMessages.slice(-80)})});
        }
      });
      let served=false,lastBuild=null,lastTitle='';
      for(let attempt=0;attempt<20;attempt++){
        const sep=baseUrl.includes('?')?'&':'?';
        await page.goto(baseUrl+sep+'chatE2E='+Date.now()+'-'+attempt,{waitUntil:'domcontentloaded',timeout:45000});
        await page.waitForTimeout(350);
        lastBuild=await page.evaluate(()=>window.OUTLAST_BUILD||null).catch(()=>null);
        lastTitle=await page.title().catch(()=> '');
        if(lastBuild==='4.5.1'&&lastTitle.includes('v4.5.1')){served=true;break;}
        if(attempt<19)await page.waitForTimeout(2500);
      }
      assert.ok(served,'Expected v4.5.1 page was not served: '+JSON.stringify({lastBuild,lastTitle,baseUrl}));
      // The page has a legacy release gate from v4.0.0 that can sit above the chat launcher.
      // Clear it in this isolated smoke test so the test can exercise chat rather than click interception.
      await page.evaluate(()=>{
        const ok=document.getElementById('outlastV4000GotIt');
        if(ok)ok.click();
        const legacy=document.getElementById('outlastV4000UpdatePopup');
        if(legacy&&getComputedStyle(legacy).display!=='none')legacy.remove();
      });
      await page.waitForTimeout(100);
      const routing=await page.evaluate(()=>{
        const f=window.OUTLAST_CHAT_BACKEND_FOR_HOST;
        return {active:window.OUTLAST_CHAT_HTTP_BASE,prod:f('outlastofficial.github.io').http,test:f('outlast-test.onrender.com').http,
          prodWs:f('outlastofficial.github.io').ws,testWs:f('outlast-test.onrender.com').ws};
      });
      assert.equal(routing.prod,'https://outlast-server.onrender.com','Production chat uses the production server');
      assert.equal(routing.test,'https://outlast-test-server.onrender.com','Tester chat uses the tester server');
      assert.equal(routing.prodWs,'wss://outlast-server.onrender.com','Production WebSocket uses the production server');
      assert.equal(routing.testWs,'wss://outlast-test-server.onrender.com','Tester WebSocket uses the tester server');
      const liveHost=new URL(baseUrl).hostname.toLowerCase();
      assert.equal(routing.active,liveHost.includes('outlast-test')?'https://outlast-test-server.onrender.com':'https://outlast-server.onrender.com','Page selects its matching backend');

      await page.waitForSelector('#gecToggle',{state:'visible',timeout:20000});
      await page.waitForFunction(()=>{const el=document.getElementById('gecMessages');const t=el?el.innerText:'';return t.includes('OWNER')&&t.includes('TESTER');},null,{timeout:15000});
      await page.locator('#gecToggle').click();
      const floatingText=await page.locator('#gecMessages').innerText();
      assert.ok(floatingText.includes('BestGamer')&&floatingText.includes('OWNER'),'Floating chat shows the owner username and tag');
      assert.ok(floatingText.includes('SS')&&floatingText.includes('TESTER'),'Floating chat shows the tester username and tag');
      await page.locator('#gecInput').fill('E2E global chat send check');
      await page.locator('#gecSend').click();
      await page.waitForFunction(()=>document.querySelector('#gecMessages')?.innerText.includes('E2E global chat send check'),null,{timeout:15000});
      assert.ok(posted,'Floating chat sends through the chat API');
      assert.equal(posted.username,'E2EPlayer','Floating chat sends the active player username');
      assert.equal(posted.message,'E2E global chat send check','Floating chat sends entered message text');
      assert.ok(refreshes>0,'Floating chat loads server message history');

      // Main/in-run chat is intentionally closed from the menu; the role-preservation
      // and badge rendering logic is covered by the source regression test. This runtime
      // test targets the floating Global Chat panel that previously hung on Connecting.
      const toggleBox=await page.locator('#gecToggle').boundingBox();
      assert.ok(toggleBox&&toggleBox.width>0&&toggleBox.height>0,'Global Chat control is visible at desktop/mobile viewport sizes');
      await context.close();
    }
    console.log('OUTLAST v4.5.1 Global Chat runtime checks passed on desktop and mobile.');
  }finally{await browser.close();}
})().catch(err=>{console.error(err);process.exitCode=1;});
