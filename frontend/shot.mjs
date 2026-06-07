import { chromium } from 'file:///C:/Users/user/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs';
import http from 'node:http';import {readFileSync,existsSync,statSync} from 'node:fs';import {join,extname} from 'node:path';
const ROOT=join(process.cwd(),'dist');const MIME={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.mp4':'video/mp4','.woff2':'font/woff2','.woff':'font/woff','.ico':'image/x-icon'};
const server=http.createServer((q,r)=>{let u=(q.url||'/').split('?')[0];if(u.startsWith('/api/')||u.startsWith('/auth/')){r.setHeader('Content-Type','application/json');return r.end('[]');}let f=join(ROOT,decodeURIComponent(u));if(existsSync(f)&&statSync(f).isDirectory())f=join(f,'index.html');if(!existsSync(f)){r.statusCode=404;return r.end('x');}r.setHeader('Content-Type',MIME[extname(f).toLowerCase()]||'application/octet-stream');r.end(readFileSync(f));});
await new Promise(r=>server.listen(0,r));const base=`http://localhost:${server.address().port}`;
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:2});
await p.goto(`${base}/admission-v3-dark.html`,{waitUntil:'networkidle'});
await p.waitForTimeout(1500);
await p.screenshot({path:'shot-intro.png'});
// crop the 목차 nav
const nav=await p.$('.index');
if(nav) await nav.screenshot({path:'shot-toc.png'});
// also mobile
await p.setViewportSize({width:390,height:844});
await p.waitForTimeout(600);
await p.screenshot({path:'shot-mobile.png',fullPage:false});
await b.close();server.close();
console.log('done');
