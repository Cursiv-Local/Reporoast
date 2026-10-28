// Read-only inventory. OAuth credential stays in memory and is never printed.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { homedir } from 'node:os';
const config = JSON.parse(await readFile('wrangler.jsonc','utf8'));
const auth = await readFile(homedir()+'/.wrangler/config/default.toml','utf8');
const token = auth.match(/^oauth_token\s*=\s*"([^"]+)"/m)?.[1];
if(!token) throw new Error('Cloudflare login unavailable');
const inventory={timestamp:new Date().toISOString(),readOnly:true,results:[]};
async function get(path,label,filter=x=>x){const response=await fetch('https://api.cloudflare.com/client/v4'+path,{headers:{Authorization:'Bearer '+token}});const data=await response.json();const value={label,status:response.status,result:response.ok?filter(data.result):undefined,errors:response.ok?undefined:data.errors?.map(e=>e.message)};inventory.results.push(value);return data.result;}
const zones=await get('/zones?name=cursiv.us','target zone',x=>x.map(z=>({id:z.id,name:z.name,status:z.status})));
const zone=zones?.find(z=>z.name==='cursiv.us');
if(zone){await get('/zones/'+zone.id+'/workers/routes','matching routes',x=>x.filter(r=>r.pattern.includes('cursiv.us')));await get('/zones/'+zone.id+'/dns_records?name=roast.cursiv.us','target DNS records',x=>x.map(r=>({id:r.id,name:r.name,type:r.type,content:r.content,proxied:r.proxied})));}
await get('/accounts/'+config.account_id+'/workers/domains','target custom domains',x=>x.filter(d=>d.hostname==='roast.cursiv.us'));
await mkdir('.wrangler/audit',{recursive:true});await writeFile('.wrangler/audit/cloudflare-inventory.json',JSON.stringify(inventory,null,2));
console.log(JSON.stringify(inventory,null,2));
