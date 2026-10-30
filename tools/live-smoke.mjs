import {chromium} from '../src/rightpixel-web/node_modules/@playwright/test/index.mjs';
import {mkdir} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome'});
try {
 const context=await browser.newContext({viewport:{width:1366,height:768}});
 const errors=[];const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 const health=await context.request.get('http://127.0.0.1:8085/api/health');if(health.status()!==200)throw new Error('Health failed');
 const player=await context.request.get('http://127.0.0.1:8085/api/player');if(player.status()!==401)throw new Error('Anonymous game access was not rejected');
 await page.goto('http://127.0.0.1:8085');await page.getByRole('heading',{name:'C# رو با حل معما و شکست نگهبان‌ها یاد بگیر'}).waitFor();await page.screenshot({path:'E:/Products/RightPixel/docs/screenshots/welcome-desktop.png',fullPage:true});await page.getByRole('button',{name:'شروع سفر',exact:true}).click();
 const avatars=page.locator('.avatar-picker button');if(await avatars.count()!==48)throw new Error('Missing account avatars');
 await mkdir(new URL('../docs/screenshots/',import.meta.url),{recursive:true});
 await page.screenshot({path:new URL('../docs/screenshots/signup-desktop.png',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1'),fullPage:true});
 await page.setViewportSize({width:320,height:568});
 if(!(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)))throw new Error('Mobile overflow');
 await page.screenshot({path:new URL('../docs/screenshots/signup-mobile.png',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1'),fullPage:true});
 await page.goto('http://127.0.0.1:8085/#/login');
 await page.getByRole('heading',{name:'ورود به سفر',exact:true}).waitFor();
 for(const [width,height] of [[320,568],[1366,768]]){
  await page.setViewportSize({width,height});
  if(!(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1&&document.documentElement.scrollHeight<=innerHeight+1)))throw new Error('Login overflow');
  await page.screenshot({path:`E:/Products/RightPixel/docs/screenshots/login-${width}.png`,fullPage:true});
 }
 if(errors.length)throw new Error(errors.join('\n'));
 console.log('Installed application: healthy; anonymous access rejected; 48 avatars; desktop/mobile layout passed. No registration submitted or email sent.');
} finally {await browser.close();}
