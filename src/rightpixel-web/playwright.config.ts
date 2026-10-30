import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests/e2e',timeout:60000,workers:1,retries:0,use:{baseURL:'http://127.0.0.1:5179',screenshot:'only-on-failure',trace:'retain-on-failure'},projects:[
{name:'chrome-desktop',use:{browserName:'chromium',channel:'chrome',viewport:{width:1366,height:768}}},
{name:'firefox-desktop',use:{browserName:'firefox',viewport:{width:1366,height:768}}},
{name:'webkit-desktop',use:{browserName:'webkit',viewport:{width:1366,height:768}}},
{name:'chrome-mobile',use:{browserName:'chromium',channel:'chrome',viewport:{width:390,height:844},isMobile:true,hasTouch:true}},
{name:'firefox-narrow',use:{browserName:'firefox',viewport:{width:390,height:844}}},
{name:'webkit-mobile',use:{browserName:'webkit',viewport:{width:390,height:844},isMobile:true,hasTouch:true}}
],webServer:{command:'npm run dev -- --host 127.0.0.1 --port 5179',url:'http://127.0.0.1:5179',reuseExistingServer:false}});
