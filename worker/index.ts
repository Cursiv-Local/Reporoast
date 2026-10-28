import { DurableObject } from 'cloudflare:workers';
import { AppError, parseRepository } from '../src/shared/url';
import { analyze, ANALYZER_VERSION, RULE_VERSION, PROFILES, type Profile, type Report } from '../src/shared/engine';
import { GitHub, LIMITS } from './github';
import { redact, sanitizeReport } from './redact';
import { publicOrigin, canonicalRedirect } from './origin';
export interface Env { ASSETS:Fetcher; COORDINATOR:DurableObjectNamespace<Coordinator>; GITHUB_TOKEN?:string; IP_HASH_SECRET?:string; ADMIN_TOKEN?:string; SCANS_ENABLED:string; DAILY_LIMIT:string; IP_LIMIT:string; MAX_CONCURRENT:string; PUBLIC_ORIGIN:string; CANONICAL_REDIRECTS?:string }
export const SECURITY_HEADERS = {'Strict-Transport-Security':'max-age=31536000','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY','Permissions-Policy':'camera=(), microphone=(), geolocation=()','Content-Security-Policy':"default-src 'self'; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",'X-Robots-Tag':'noindex, noarchive','Cache-Control':'no-store'};
export function json(data:unknown,status=200){return new Response(JSON.stringify(data),{status,headers:{...SECURITY_HEADERS,'Content-Type':'application/json; charset=utf-8'}});}
function wrap(response:Response){const result=new Response(response.body,response);for(const [k,v]of Object.entries(SECURITY_HEADERS))result.headers.set(k,v);return result;}
async function digest(value:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),b=>b.toString(16).padStart(2,'0')).join('');}
async function ipHash(ip:string,secret:string){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(new Date().toISOString().slice(0,10)+ip))),b=>b.toString(16).padStart(2,'0')).join('');}
export async function readBody(request:Request):Promise<any>{
 if(!request.headers.get('content-type')?.startsWith('application/json'))throw new AppError('INVALID_BODY','Send a JSON request.',415);
 const reader=request.body?.getReader(); if(!reader)throw new AppError('INVALID_BODY','Request body is required.');
 let raw='',size=0;const decoder=new TextDecoder();
 while(true){const next=await reader.read();if(next.done)break;size+=next.value.byteLength;if(size>2048){await reader.cancel();throw new AppError('INVALID_BODY','Request exceeds 2 KB.',413);}raw+=decoder.decode(next.value,{stream:true});}
 try{const value=JSON.parse(raw);if(!value||typeof value!=='object'||Array.isArray(value))throw new Error();return value;}catch{throw new AppError('INVALID_BODY','Invalid JSON object.');}
}
export function errorResponse(error:unknown){return error instanceof AppError?json({error:{code:error.code,message:error.message}},error.status):json({error:{code:'INTERNAL_ERROR',message:'The scan could not finish. Please try again later.'}},500);}
export default {
 async fetch(request:Request,env:Env):Promise<Response>{
  try{
   const url=new URL(request.url);
   const target=canonicalRedirect(request.url,env.PUBLIC_ORIGIN,env.CANONICAL_REDIRECTS==='true');
   if(target)return new Response(null,{status:308,headers:{...SECURITY_HEADERS,Location:target}});
   if(url.pathname==='/api/health')return json({service:'RepoRoast',version:ANALYZER_VERSION,scansEnabled:env.SCANS_ENABLED==='true'});
   if(url.pathname.startsWith('/api/')||url.pathname.startsWith('/s/')){
    if(['POST','DELETE'].includes(request.method)&&request.headers.get('origin')!==url.origin)throw new AppError('ORIGIN_REJECTED','Use RepoRoast from its own website.',403);
    if(url.pathname==='/api/scan'&&env.SCANS_ENABLED!=='true')throw new AppError('SCANS_DISABLED','New scans are temporarily disabled.',503);
    if(!env.IP_HASH_SECRET||env.IP_HASH_SECRET.length<32)throw new AppError('CONFIGURATION','Service configuration is incomplete.',503);
    const headers=new Headers(request.headers);headers.delete('x-client-key');
    headers.set('x-client-key',await ipHash(request.headers.get('CF-Connecting-IP')||'local',env.IP_HASH_SECRET));
    const stub=env.COORDINATOR.get(env.COORDINATOR.idFromName('global-v1'));
    return wrap(await stub.fetch(new Request(request,{headers})));
   }
   const asset=await env.ASSETS.fetch(request);
   if(asset.headers.get('content-type')?.includes('text/html')){
    const canonical=publicOrigin(env.PUBLIC_ORIGIN)+url.pathname;
    return wrap(new HTMLRewriter().on('head',{element(element){element.append('<link rel="canonical" href="'+escapeHtml(canonical)+'"><meta property="og:url" content="'+escapeHtml(canonical)+'">',{html:true});}}).transform(asset));
   }
   return wrap(asset);
  }catch(error){return errorResponse(error);}
 }
};
type Stored = { data:string; expires:number }
interface Share { repository:string; sha:string; timestamp:string; score:number|null; tier:string; coverage:number; profile:Profile; analyzerVersion:string; ruleVersion:string; categories:Report['categories']; scoreRange?:Report['scoreRange'] }
function publicSummary(r:Report):Share{return {repository:r.repository.fullName,sha:r.sha,timestamp:r.timestamp,score:r.score,tier:r.tier,coverage:r.coverage,profile:r.profile,analyzerVersion:r.analyzerVersion,ruleVersion:r.ruleVersion,categories:r.categories,scoreRange:r.scoreRange};}
export class Coordinator extends DurableObject<Env>{
 private pending=new Map<string,Promise<Report>>();
 private metadata=new Map<string,{expires:number;value:Awaited<ReturnType<GitHub['metadata']>>}>();
 constructor(ctx:DurableObjectState,env:Env){super(ctx,env);
  ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS records (key TEXT PRIMARY KEY, data TEXT NOT NULL, expires INTEGER NOT NULL)');
  ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS quotas (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL)');
  ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS metrics (day TEXT NOT NULL, name TEXT NOT NULL, count INTEGER NOT NULL, PRIMARY KEY(day,name))');
 }
 private metric(name:string,n=1){this.ctx.storage.sql.exec('INSERT INTO metrics(day,name,count) VALUES(?,?,?) ON CONFLICT(day,name) DO UPDATE SET count=count+excluded.count',new Date().toISOString().slice(0,10),name,n);}
 private get<T>(key:string):T|undefined {const row=this.ctx.storage.sql.exec<Stored>('SELECT data,expires FROM records WHERE key=?',key).toArray()[0];return row&&row.expires>Date.now()?JSON.parse(row.data):undefined;}
 private put(key:string,data:unknown,ttl:number){this.ctx.storage.sql.exec('INSERT OR REPLACE INTO records(key,data,expires) VALUES(?,?,?)',key,JSON.stringify(data),Date.now()+ttl);}
 private limit(key:string,max:number,expires:number){const row=this.ctx.storage.sql.exec<{count:number}>('SELECT count FROM quotas WHERE key=? AND expires>?',key,Date.now()).toArray()[0];if(row&&row.count>=max)throw new AppError('CAPACITY','Scan capacity exhausted. Try again after the quota window resets.',429);this.ctx.storage.sql.exec('INSERT INTO quotas(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires<=? THEN 1 ELSE count+1 END, expires=excluded.expires',key,expires,Date.now());}
 private cleanup(){const now=Date.now();this.ctx.storage.sql.exec('DELETE FROM records WHERE expires<=?',now);this.ctx.storage.sql.exec('DELETE FROM quotas WHERE expires<=?',now);this.ctx.storage.sql.exec("DELETE FROM metrics WHERE day < date('now','-7 days')");}
 async alarm(){this.cleanup();await this.ctx.storage.setAlarm(Date.now()+3600000);}
 private authorized(request:Request){const expected='Bearer '+this.env.ADMIN_TOKEN,actual=request.headers.get('authorization')||'';let diff=expected.length^actual.length;for(let n=0;n<expected.length;n++)diff|=expected.charCodeAt(n)^(actual.charCodeAt(n)||0);return !!this.env.ADMIN_TOKEN&&this.env.ADMIN_TOKEN.length>=32&&diff===0;}
 async fetch(request:Request):Promise<Response>{
  try{
   const url=new URL(request.url),ip=request.headers.get('x-client-key')||'unknown',now=Date.now(),day=new Date().toISOString().slice(0,10),tomorrow=Date.parse(day)+86400000;
   if(!await this.ctx.storage.getAlarm())await this.ctx.storage.setAlarm(now+3600000);
   if(url.pathname==='/api/admin/metrics'&&request.method==='GET'){
    if(!this.authorized(request))throw new AppError('UNAUTHORIZED','Administrative access required.',401);
    return json({metrics:this.ctx.storage.sql.exec('SELECT * FROM metrics ORDER BY day DESC').toArray(),active:this.pending.size,limits:{daily:this.env.DAILY_LIMIT,perIp:this.env.IP_LIMIT,concurrent:this.env.MAX_CONCURRENT,inspection:LIMITS},costs:{estimate:'No paid plan is enabled by this application. Configure and monitor account usage in Cloudflare; request counts are not a billing quote.',retentionHours:24,shareDays:7}});
   }
   if(url.pathname==='/api/scan'&&request.method==='POST'){
    if(this.env.SCANS_ENABLED!=='true')throw new AppError('SCANS_DISABLED','New scans are temporarily disabled.',503);
    const body=await readBody(request),repo=parseRepository(body.url),profile=body.profile as Profile|undefined;
    if(profile!==undefined&&!PROFILES.includes(profile))throw new AppError('INVALID_PROFILE','Choose a supported repository profile.');
    this.limit('requests:'+day+':'+ip,40,tomorrow);
    const key=repo.fullName.toLowerCase()+':'+(profile||'auto');
    if(this.pending.has(key)){this.metric('coalesced');return json(await this.pending.get(key));}
    if(this.pending.size>=bounded(this.env.MAX_CONCURRENT,2,1,4))throw new AppError('CAPACITY','Scan concurrency capacity exhausted. Try again shortly.',429);
    // No await inside this transaction: quota checks and reservations are atomic.
    this.ctx.storage.transactionSync(()=>{this.limit('ip:'+day+':'+ip,bounded(this.env.IP_LIMIT,5,1,50),tomorrow);this.limit('global:'+day,bounded(this.env.DAILY_LIMIT,100,1,500),tomorrow);});
    const promise=this.scan(repo.fullName,profile);this.pending.set(key,promise);
    try{return json(await promise);}finally{this.pending.delete(key);}
   }
   if(url.pathname==='/api/share'&&request.method==='POST'){
    this.ctx.storage.transactionSync(()=>{this.limit('share:'+day+':'+ip,10,tomorrow);this.limit('shares:'+day,200,tomorrow);});
    const body=await readBody(request);if(body.consent!==true||typeof body.reportId!=='string'||body.reportId.length>200)throw new AppError('CONSENT_REQUIRED','Explicitly consent to publishing the score summary.');
    const report=this.get<Report>('report:'+body.reportId);if(!report)throw new AppError('EXPIRED','This report expired. Scan again before sharing.',410);
    const id=crypto.randomUUID(),token=crypto.randomUUID()+crypto.randomUUID(),removalHash=await digest(token);
    this.put('share:'+id,{summary:publicSummary(report),removalHash},7*86400000);this.metric('shares');
    return json({url:publicOrigin(this.env.PUBLIC_ORIGIN)+'/s/'+id,removalToken:token,expires:new Date(now+7*86400000).toISOString()},201);
   }
   const shareMatch=url.pathname.match(/^\/(?:s|api\/share)\/([a-f\d-]{36})$/);
   if(shareMatch){
    if(request.method==='GET')this.ctx.storage.transactionSync(()=>{this.limit('read:'+day+':'+ip,200,tomorrow);this.limit('reads:'+day,10000,tomorrow);});
    const key='share:'+shareMatch[1],share=this.get<{summary:Share;removalHash:string}>(key);if(!share)throw new AppError('NOT_FOUND','Shared report not found or expired.',404);
    if(request.method==='DELETE'&&url.pathname.startsWith('/api/')){
     const body=await readBody(request);
     if(!this.authorized(request)&&(typeof body.removalToken!=='string'||body.removalToken.length>100||await digest(body.removalToken)!==share.removalHash))throw new AppError('UNAUTHORIZED','The report removal token is required.',401);
     this.ctx.storage.sql.exec('DELETE FROM records WHERE key=?',key);return json({removed:true});
    }
    if(request.method==='GET'){
     if(url.pathname.startsWith('/api/'))return json(share.summary);
     return new Response(shareHtml(share.summary,this.env.PUBLIC_ORIGIN,url.pathname),{headers:{...SECURITY_HEADERS,'Content-Type':'text/html; charset=utf-8'}});
    }
   }
   throw new AppError('NOT_FOUND','Endpoint not found.',404);
  }catch(error){if(error instanceof AppError&&error.status===429)this.metric('rateLimitRejections');return errorResponse(error);}
 }
 private async scan(fullName:string,profile?:Profile):Promise<Report>{
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),LIMITS.timeout),github=new GitHub(this.env.GITHUB_TOKEN,fetch,controller.signal);this.metric('submissions');
  try{
   let meta=this.metadata.get(fullName.toLowerCase());
   if(!meta||meta.expires<Date.now()){const value=await github.metadata(fullName);meta={value,expires:Date.now()+60000};if(this.metadata.size>=100)this.metadata.clear();this.metadata.set(fullName.toLowerCase(),meta);}
   const m=meta.value;
   if(redact(m.fullName)!==m.fullName)throw new AppError('UNSUPPORTED_STRUCTURE','Repository identifier resembles a credential and cannot be displayed safely.',422);
   const commit=await github.get('/repos/'+m.fullName+'/commits/'+encodeURIComponent(m.defaultBranch));
   if(!/^[a-f0-9]{40}$/.test(commit.sha))throw new AppError('UNSUPPORTED_STRUCTURE','No exact commit found.',422);
   const cacheKey='scan:'+m.id+':'+commit.sha+':'+ANALYZER_VERSION+':'+RULE_VERSION+':'+(profile||'auto');
   const cached=this.get<Report>(cacheKey);
   if(cached){this.metric('cacheHits');return cached;}
   const inspection=await github.inspect(m,commit);
   // Raw file text never enters persistent storage or HTTP responses.
   const report=analyze(inspection,profile);
   const existing=this.get<Report>('report:'+report.id);
   const safe=existing||sanitizeReport(report);
   this.put(cacheKey,safe,86400000);this.put('report:'+safe.id,safe,86400000);this.metric('scans');return safe;
  }catch(error){this.metric('failures');throw error;}finally{clearTimeout(timer);this.metric('githubRequests',github.requests);}
 }
}
function bounded(value:string,fallback:number,min:number,max:number){const n=Number(value);return Number.isInteger(n)&&n>=min&&n<=max?n:fallback;}
export function escapeHtml(value:unknown){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));}
export function shareHtml(s:Share,origin:string,path:string){const title=escapeHtml(s.repository+' — '+(s.score??'Insufficient evidence')+'/1000 | RepoRoast'),description=escapeHtml(s.tier+'. Evidence coverage '+Math.round(s.coverage*100)+'%. Commit '+s.sha.slice(0,12)+'.');
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,noarchive"><title>'+title+'</title><link rel="canonical" href="'+escapeHtml(origin+path)+'"><meta property="og:type" content="website"><meta property="og:title" content="'+title+'"><meta property="og:description" content="'+description+'"><meta property="og:url" content="'+escapeHtml(origin+path)+'"><meta name="description" content="'+description+'"></head><body style="background:#111110;color:#faf6ed;font:18px system-ui;max-width:850px;padding:40px;margin:auto"><a style="color:#ff9955" href="/">RepoRoast by Cursiv</a><p>Explicitly shared score summary · expires after 7 days</p><h1>'+escapeHtml(s.repository)+'</h1><p style="font-size:72px;margin:0">'+(s.score??'Insufficient evidence')+' <small style="font-size:22px">/ 1000</small></p><h2>'+escapeHtml(s.tier)+'</h2><p>Structural practices only. No tests or repository commands executed. '+(s.scoreRange?'Possible score range: '+s.scoreRange.minimum+'–'+s.scoreRange.maximum+'. ':'')+'</p><p>Coverage: '+Math.round(s.coverage*100)+'% · Profile: '+escapeHtml(s.profile)+'</p><ul>'+s.categories.map(c=>'<li>'+escapeHtml(c.name)+': '+c.awarded+'/'+c.maximum+'</li>').join('')+'</ul><p>Commit: <a style="color:#ff9955" href="https://github.com/'+escapeHtml(s.repository)+'/tree/'+s.sha+'">'+s.sha+'</a></p><p>Analyzed '+escapeHtml(s.timestamp)+' · Analyzer '+s.analyzerVersion+' · Rules '+s.ruleVersion+'</p><p>Heuristic health assessment, not a security audit. Tier names are entertainment. Different profiles are not directly comparable. No source contents or detailed findings are published.</p><p>To remove this report, use the removal token from its creation in the sharing controls on the homepage. Without a token, open an issue in <a style="color:#ff9955" href="https://github.com/Cursiv-Local/Reporoast/issues">RepoRoast</a> with this share ID; never publish the token.</p></body></html>';
}
