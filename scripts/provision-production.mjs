// Production-only service secrets. Never copy staging or personal GitHub credentials.
import {readFile,writeFile} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const config=JSON.parse(await readFile('wrangler.jsonc','utf8'));
if(config.env.production.name!=='reporoast-production'||config.env.production.vars.PUBLIC_ORIGIN!=='https://roast.cursiv.us')throw new Error('Unexpected production target.');
const file='.dev.vars.production';let secrets;
try{const text=await readFile(file,'utf8');secrets=Object.fromEntries(['IP_HASH_SECRET','ADMIN_TOKEN'].map(name=>{const value=text.match(new RegExp('^'+name+'="([a-f0-9]{64})"$','m'))?.[1];if(!value)throw new Error('Unexpected existing production secret format; refusing replacement.');return[name,value];}));}
catch(error){if(error.code!=='ENOENT')throw error;secrets={IP_HASH_SECRET:randomBytes(32).toString('hex'),ADMIN_TOKEN:randomBytes(32).toString('hex')};await writeFile(file,Object.entries(secrets).map(([key,value])=>key+'="'+value+'"').join('\n')+'\n',{flag:'wx',mode:0o600});}
try{const staging=await readFile('.dev.vars.staging','utf8');for(const value of Object.values(secrets))if(staging.includes(value))throw new Error('Production must not reuse staging secrets.');}catch(error){if(error.code!=='ENOENT')throw error;}
const result=spawnSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','secret','bulk','--env','production'],{input:JSON.stringify(secrets),encoding:'utf8',env:{...process.env,WRANGLER_SEND_METRICS:'false'}});
process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');if(result.status!==0)process.exit(result.status||1);
console.log('Independent production secrets configured; values were not printed. Local backup remains Git-ignored.');
