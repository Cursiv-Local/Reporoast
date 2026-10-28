// Read-only custom-domain conflict plan and public-site baseline. No DNS writes.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {homedir} from 'node:os';
import {createHash} from 'node:crypto';
const config=JSON.parse(await readFile('wrangler.jsonc','utf8'));
const auth=await readFile(homedir()+'/.wrangler/config/default.toml','utf8');
const token=auth.match(/^oauth_token\s*=\s*"([^"]+)"/m)?.[1];
if(!token)throw new Error('Existing Cloudflare login unavailable. Interactive owner authentication is required.');
const account=config.account_id;
async function api(path,method='GET',body){const r=await fetch('https://api.cloudflare.com/client/v4'+path,{method,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});const data=await r.json();if(!r.ok||!data.success)throw new Error(JSON.stringify({status:r.status,errors:data.errors?.map(e=>({code:e.code,message:e.message}))}));return data.result;}
const zones=await api('/zones?name=cursiv.us');const zone=zones.find(z=>z.name==='cursiv.us');
if(!zone||zone.account?.id!==account)throw new Error('The expected zone/account relationship was not confirmed.');
const routes=await api('/zones/'+zone.id+'/workers/routes');
const domains=await api('/accounts/'+account+'/workers/domains');
if(domains.some(d=>d.hostname==='roast.cursiv.us')||routes.some(r=>r.pattern.includes('roast.cursiv.us')))throw new Error('Target already has a Worker binding. Refusing replacement.');
// Wrangler's own changeset endpoint computes conflicts without applying records.
const plan=await api('/accounts/'+account+'/workers/scripts/reporoast-production/domains/changeset?replace_state=true','POST',[{hostname:'roast.cursiv.us',zone_id:zone.id}]);
if(plan.conflicting?.length||plan.updated?.length||plan.removed?.length)throw new Error('Custom-domain conflict plan is not a clean addition. No replacement is authorized.');
if(!plan.added?.some(d=>d.hostname==='roast.cursiv.us'))throw new Error('Custom-domain clean-add plan was not confirmed.');
const baseline=[];
for(const origin of ['https://cursiv.us','https://www.cursiv.us','https://reporoast-staging.joshua-1993-winkler.workers.dev']){
 const r=await fetch(origin,{signal:AbortSignal.timeout(20000)}),text=await r.text();if(!r.ok)throw new Error('Baseline unavailable: '+origin+' '+r.status);
 baseline.push({origin,finalUrl:r.url,status:r.status,title:text.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1],sha256:createHash('sha256').update(text).digest('hex')});
}
const result={timestamp:new Date().toISOString(),accountId:account,zoneId:zone.id,zoneName:zone.name,plan,routes,domains:domains.filter(d=>['cursiv.us','www.cursiv.us','roast.cursiv.us'].includes(d.hostname)),baseline};
await mkdir('.wrangler/production',{recursive:true});await writeFile('.wrangler/production/preflight.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
