// Wrangler's non-TTY mode can auto-replace conflicting domains/DNS records.
// Preserve its interactive conflict prompts rather than silently enabling overrides.
import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
if(!process.stdout.isTTY||!process.stdin.isTTY)throw new Error('Production deployment requires an interactive terminal to preserve Cloudflare conflict checks. Do not use --yes or non-interactive domain replacement.');
const config=JSON.parse(await readFile('wrangler.jsonc','utf8')),production=config.env.production;
if(production.name!=='reporoast-production'||production.routes?.length!==1||production.routes[0].pattern!=='roast.cursiv.us'||production.routes[0].custom_domain!==true||production.vars.PUBLIC_ORIGIN!=='https://roast.cursiv.us')throw new Error('Unexpected production scope. Only roast.cursiv.us is authorized.');
const result=spawnSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','deploy','--env','production'],{stdio:'inherit'});
if(result.error)throw result.error;
process.exit(result.status??1);
