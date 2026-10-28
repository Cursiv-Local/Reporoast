import { Miniflare, convertV4MiniflareOptions, Response } from 'miniflare';
import assert from 'node:assert/strict';
let requests=0,commit='a'.repeat(40),fail=false;
const origin='http://localhost';
const files={'README.md':'# Demo\n## Installation\nnpm ci\n## Usage\nnpm start\n## Limitations\nExample','package.json':'{"scripts":{"start":"node src/main.js"}}','.gitignore':'.env\nnode_modules/','src/main.js':'// demo','tests/main.test.js':'// demo'};
const paths=Object.keys(files),tree=paths.map((path,n)=>({path,type:'blob',sha:String(n+1).padStart(40,'0'),size:Buffer.byteLength(files[path]),mode:'100644'}));
const mock=async request=>{
 requests++;const u=new URL(request.url);assert.equal(u.hostname,'api.github.com');
 await new Promise(resolve=>setTimeout(resolve,10));
 if(fail)return Response.json({message:'Unavailable'},{status:503});
 if(u.pathname==='/repos/demo/project')return Response.json({id:42,private:false,full_name:'demo/project',default_branch:'main',description:'<script>alert(1)</script> ghp_'+ 'z'.repeat(36),language:'JavaScript',license:null});
 if(u.pathname.includes('/commits/'))return Response.json({sha:commit,commit:{tree:{sha:'c'.repeat(40)}}});
 if(u.pathname.includes('/git/trees/'))return Response.json({tree,truncated:false});
 if(u.pathname.includes('/git/blobs/')){const entry=tree.find(e=>u.pathname.endsWith(e.sha));assert.ok(entry);return Response.json({encoding:'base64',content:Buffer.from(files[entry.path]).toString('base64')});}
 throw new Error('Unexpected GitHub path '+u.pathname);
};
const bindings={SCANS_ENABLED:'true',DAILY_LIMIT:'4',IP_LIMIT:'3',MAX_CONCURRENT:'2',PUBLIC_ORIGIN:origin,IP_HASH_SECRET:'i'.repeat(40),ADMIN_TOKEN:'a'.repeat(40)};
const mf=new Miniflare(convertV4MiniflareOptions({name:'test',unsafeInspectDurableObjects:true,modules:true,scriptPath:'.wrangler/dry-run/index.js',compatibilityDate:'2026-10-01',bindings,durableObjects:{COORDINATOR:{className:'Coordinator',useSQLite:true}},serviceBindings:{ASSETS:()=>new Response('<!doctype html><html><head></head><body>Static fixture</body></html>',{headers:{'content-type':'text/html'}})},outboundService:mock}));
let checks=0;
const ok=(condition,message)=>{assert.ok(condition,message);checks++;};
async function call(path,body,options={}){const method=options.method||(body?'POST':'GET');return mf.dispatchFetch(origin+path,{method,headers:{origin, ...(body?{'content-type':'application/json'}:{}),...options.headers},...(body?{body:JSON.stringify(body)}:{})});}
try{
 const health=await call('/api/health');ok(health.status===200,'health');
 const homepage=await call('/');ok((await homepage.text()).includes('rel="canonical" href="http://localhost/"'),'environment-specific canonical homepage');
 ok((await call('/api/scan',{url:'https://evil.test/a/b'})).status===400,'URL SSRF validation');
 ok((await call('/api/scan',{url:'https://github.com/demo/project'},{headers:{origin:'https://evil.test'}})).status===403,'origin protection');
 ok((await call('/api/admin/metrics')).status===401,'admin authorization');
 const [a,b]=await Promise.all([call('/api/scan',{url:'https://github.com/demo/project'}),call('/api/scan',{url:'https://github.com/demo/project'})]);assert.equal(a.status,200,await a.clone().text());assert.equal(b.status,200,await b.clone().text());const report=await a.json();ok((await b.json()).id===report.id,'duplicate coalescing');
 ok(requests>0&&requests<=30&&report.inspection.inspected.includes('tests/main.test.js'),'bounded requests and sampled test evidence');
 ok(report.ruleVersion==='2.0.0'&&report.evidenceSummary.executionChecks===0,'versioned structural-only scoring');
 ok(!JSON.stringify(report).includes('ghp_'),'metadata secrets redacted');
 ok(!('files' in report),'no source response');
 ok(report.sha===commit&&report.findings.every(f=>f.evidence.every(e=>e.url.includes(commit))),'commit evidence');
 const before=requests,cached=await call('/api/scan',{url:'https://github.com/demo/project'});assert.equal(cached.status,200,await cached.clone().text());ok((await cached.json()).id===report.id&&requests===before+1,'commit-keyed cache reuse');
 ok((await call('/api/share',{reportId:report.id})).status===400,'share consent required');
 const created=await call('/api/share',{reportId:report.id,consent:true});assert.equal(created.status,201,await created.clone().text());const share=await created.json(),id=share.url.split('/').pop();
 const shared=await call('/api/share/'+id),summary=await shared.json();ok(!summary.findings&&!summary.inspection&&!summary.description,'public summary privacy');
 const html=await call('/s/'+id),text=await html.text();ok(html.headers.get('x-robots-tag').includes('noindex')&&text.includes('og:title'),'OG and noindex');
 ok(html.headers.get('content-security-policy').includes("frame-ancestors 'none'"),'security headers');
 ok(!text.includes('<script>'),'HTML escaped');
 ok((await call('/api/share/'+id,{removalToken:'wrong'},{method:'DELETE'})).status===401,'removal authorization');
 ok((await call('/api/share/'+id,{removalToken:share.removalToken},{method:'DELETE'})).status===200,'token removal');
 ok((await call('/s/'+id)).status===404,'share removal effective');
 commit='b'.repeat(40);const updated=await call('/api/scan',{url:'https://github.com/demo/project'});assert.equal(updated.status,200,await updated.clone().text());ok((await updated.json()).id!==report.id,'commit invalidates cached results');
 ok((await call('/api/scan',{url:'https://github.com/demo/project'})).status===429,'per-IP quota');
 const metrics=await call('/api/admin/metrics',undefined,{headers:{authorization:'Bearer '+bindings.ADMIN_TOKEN}});const data=await metrics.json();ok(data.metrics.some(m=>m.name==='cacheHits')&&data.metrics.some(m=>m.name==='coalesced'),'admin metrics');
 // Direct DO access is available only to the binding. Use distinct hashed client keys to test global limits.
 const namespace=await mf.getDurableObjectNamespace('COORDINATOR'),stub=namespace.get(namespace.idFromName('global-v1'));
 async function direct(ip,name='demo/project',profile){return stub.fetch(origin+'/api/scan',{method:'POST',headers:{'content-type':'application/json','x-client-key':ip},body:JSON.stringify({url:'https://github.com/'+name,...(profile?{profile}:{})})});}
 assert.equal((await direct('second')).status,200);
 ok((await direct('third')).status===429,'atomic global daily quota');
 // Exercise expiration at the storage layer without changing the host clock.
 const storage=await mf.unsafeGetDurableObjectStorage('test','Coordinator',{name:'global-v1'});
 const historicalId='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
 await storage.exec('INSERT OR REPLACE INTO records(key,data,expires) VALUES(?,?,?)','share:'+historicalId,JSON.stringify({summary:{...summary,score:671,ruleVersion:'1.0.0',analyzerVersion:'0.1.0',scoreRange:undefined},removalHash:'old-hash'}),Date.now()+60000);
 const historical=await (await call('/api/share/'+historicalId)).json();
 ok(historical.score===671&&historical.ruleVersion==='1.0.0','historical share score/version preserved without rescoring');
 await storage.exec('UPDATE records SET expires=0');
 ok((await call('/api/share',{reportId:report.id,consent:true})).status===410,'expired report cannot be shared');
 await storage.exec('DELETE FROM quotas');
 const concurrent=await Promise.all([direct('one','demo/project','application'),direct('two','demo/project','library'),direct('three','demo/project','cli')]);
 ok(concurrent.filter(r=>r.status===200).length===2&&concurrent.filter(r=>r.status===429).length===1,'concurrency cap');
 await storage.exec('UPDATE records SET expires=0');await storage.exec('DELETE FROM quotas');
 fail=true;const failure=await direct('failed');ok(failure.status===502&&!(await failure.json()).score,'GitHub failures never fabricate scores');fail=false;
 const noConsent=await call('/api/share',{reportId:report.id,consent:false});ok(noConsent.status===400,'negative consent is rejected');
 const oversized=await mf.dispatchFetch(origin+'/api/scan',{method:'POST',headers:{origin,'content-type':'application/json'},body:' '.repeat(2049)});ok(oversized.status===413,'request body cap');
 const malformed=await mf.dispatchFetch(origin+'/api/scan',{method:'POST',headers:{origin,'content-type':'application/json'},body:'{'});ok(malformed.status===400,'malformed JSON');
 ok((await call('/api/scan',{url:'https://github.com/demo/project',profile:'invented'})).status===400,'unsupported profile');
 await storage.exec('DELETE FROM quotas');
 const [last]=await Promise.all([direct('fresh')]);ok(last.status===200,'quota reset remains usable');
 const config=convertV4MiniflareOptions({name:'disabled',modules:true,scriptPath:'.wrangler/dry-run/index.js',compatibilityDate:'2026-10-01',bindings:{...bindings,SCANS_ENABLED:'false'},durableObjects:{COORDINATOR:{className:'Coordinator',useSQLite:true}},serviceBindings:{ASSETS:()=>new Response('static')},outboundService:mock});
 const disabled=new Miniflare(config);try{const blocked=await disabled.dispatchFetch(origin+'/api/scan',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify({url:'https://github.com/demo/project'})});ok(blocked.status===503,'emergency scan disable switch');}finally{await disabled.dispose();}
 console.log('Worker integration: '+checks+' checks passed with mocked GitHub; no network repository access.');
}finally{await mf.dispose();}
