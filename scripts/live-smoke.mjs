// Opt-in public GitHub smoke evaluation. Never part of ordinary tests or CI.
// Run npm run smoke:live; this consumes a few unauthenticated GitHub API requests.
import { Miniflare,convertV4MiniflareOptions,Response as MFResponse } from 'miniflare';
import { mkdir,writeFile } from 'node:fs/promises';
const origin='http://localhost';
const mf=new Miniflare(convertV4MiniflareOptions({name:'live-smoke',modules:true,scriptPath:'.wrangler/dry-run/index.js',compatibilityDate:'2026-10-01',bindings:{SCANS_ENABLED:'true',DAILY_LIMIT:'5',IP_LIMIT:'5',MAX_CONCURRENT:'1',PUBLIC_ORIGIN:origin,IP_HASH_SECRET:crypto.randomUUID()},durableObjects:{COORDINATOR:{className:'Coordinator',useSQLite:true}},serviceBindings:{ASSETS:()=>new MFResponse('static')},outboundService:async req=>{
 const url=new URL(req.url);if(url.origin!=='https://api.github.com')throw new Error('Only GitHub API allowed');
 const response=await fetch(req.url,{headers:req.headers,redirect:'manual'});
 return new MFResponse(response.body,{status:response.status,headers:response.headers});
}}));
try{
 const response=await mf.dispatchFetch(origin+'/api/scan',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify({url:'https://github.com/octocat/Hello-World'})});
 const report=await response.json();if(!response.ok)throw new Error(JSON.stringify(report));
 await mkdir('.wrangler/smoke',{recursive:true});await writeFile('.wrangler/smoke/public-report.json',JSON.stringify(report,null,2));
 console.log(JSON.stringify({repository:report.repository.fullName,sha:report.sha,score:report.score,coverage:report.coverage,requests:report.inspection.requests,inspected:report.inspection.inspected},null,2));
}finally{await mf.dispose();}
