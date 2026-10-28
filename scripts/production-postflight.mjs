import {readFile,writeFile} from 'node:fs/promises';
import {homedir} from 'node:os';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const before=JSON.parse(await readFile('.wrangler/production/preflight.json','utf8'));
const token=(await readFile(homedir()+'/.wrangler/config/default.toml','utf8')).match(/^oauth_token\s*=\s*"([^"]+)"/m)?.[1];
async function api(path){const r=await fetch('https://api.cloudflare.com/client/v4'+path,{headers:{Authorization:'Bearer '+token}});const d=await r.json();assert.ok(r.ok&&d.success,'Cloudflare verification read failed');return d.result;}
const routes=await api('/zones/'+before.zoneId+'/workers/routes');
assert.deepEqual([...routes].sort((a,b)=>a.id.localeCompare(b.id)),[...before.routes].sort((a,b)=>a.id.localeCompare(b.id)),'Existing Worker routes changed');
const domains=await api('/accounts/'+before.accountId+'/workers/domains');
for(const domain of before.domains){const current=domains.find(d=>d.hostname===domain.hostname);assert.deepEqual(current,domain,'Existing Cursiv custom-domain binding changed');}
const productionDomain=domains.find(d=>d.hostname==='roast.cursiv.us');assert.equal(productionDomain?.service,'reporoast-production');assert.equal(productionDomain?.enabled,true);
const sites=[];
for(const baseline of before.baseline){const r=await fetch(baseline.origin,{signal:AbortSignal.timeout(20000)}),text=await r.text(),hash=createHash('sha256').update(text).digest('hex');assert.equal(r.status,baseline.status);assert.equal(r.url,baseline.finalUrl);assert.equal(hash,baseline.sha256,'Existing website response changed');sites.push({origin:baseline.origin,status:r.status,bodyUnchanged:true});}
const bindings=[];
for(const worker of ['reporoast-staging','reporoast-production']){
 const settings=await api('/accounts/'+before.accountId+'/workers/scripts/'+worker+'/settings');
 const object=settings.bindings.find(b=>b.name==='COORDINATOR');assert.equal(object?.type,'durable_object_namespace');
 assert.ok(!settings.bindings.some(b=>['d1','kv_namespace'].includes(b.type)),'Unexpected persistent service');
 bindings.push({worker,namespaceId:object.namespace_id,secretNames:settings.bindings.filter(b=>b.type==='secret_text').map(b=>b.name).sort(),publicOrigin:settings.bindings.find(b=>b.name==='PUBLIC_ORIGIN')?.text});
}
assert.notEqual(bindings[0].namespaceId,bindings[1].namespaceId,'Storage must be isolated');
assert.equal(bindings[1].publicOrigin,'https://roast.cursiv.us');assert.ok(bindings[1].secretNames.includes('IP_HASH_SECRET')&&bindings[1].secretNames.includes('ADMIN_TOKEN'));
const response=await fetch('https://roast.cursiv.us',{signal:AbortSignal.timeout(20000)}),html=await response.text();assert.equal(response.status,200);assert.ok(html.includes('rel="canonical" href="https://roast.cursiv.us/"'));
const health=await (await fetch('https://roast.cursiv.us/api/health')).json();assert.equal(health.version,'0.2.0');assert.equal(health.scansEnabled,true);
assert.equal((await fetch('https://roast.cursiv.us/api/admin/metrics')).status,401);
const configText=await readFile('.dev.vars.production','utf8');const secretValues=[...configText.matchAll(/="([a-f0-9]{64})"/g)].map(m=>m[1]);assert.equal(secretValues.length,2);
for(const path of ['/','/.dev.vars.production','/.env','/api/health']){const r=await fetch('https://roast.cursiv.us'+path),body=await r.text();assert.ok(secretValues.every(s=>!body.includes(s)),'Secret exposed in public response');}
const result={timestamp:new Date().toISOString(),production:'https://roast.cursiv.us',httpsVerified:true,health,productionDomain,existingRoutesUnchanged:true,sites,bindings,publicSecretsCheck:'passed'};
await writeFile('.wrangler/production/postflight.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
