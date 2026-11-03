import { describe,it,expect,vi } from 'vitest';
import { GitHub, LIMITS } from '../worker/github';
import { exampleInspection } from '../src/shared/example';
import { redact } from '../worker/redact';
const metadata={id:1,private:false,full_name:'new/repo',default_branch:'main',description:'Example',language:'TypeScript',license:{spdx_id:'MIT'}};
function sequence(...values:(object|Response)[]){return vi.fn(async()=>{const next=values.shift();if(!next)throw new Error('Unexpected request');return next instanceof Response?next:Response.json(next);}) as unknown as typeof fetch;}
describe('GitHub bounded ingestion',()=>{
 it('resolves canonical names after a rename',async()=>{const f=sequence(new Response(null,{status:301,headers:{location:'https://api.github.com/repos/new/repo'}}),metadata);expect((await new GitHub(undefined,f).metadata('old/repo')).fullName).toBe('new/repo');});
 it('rejects redirects to arbitrary hosts before forwarding credentials',async()=>{const f=sequence(new Response(null,{status:301,headers:{location:'https://evil.test/steal'}}));await expect(new GitHub('secret',f).metadata('o/r')).rejects.toMatchObject({code:'UNSAFE_REDIRECT'});expect(f).toHaveBeenCalledTimes(1);});
 it.each([[404,'NOT_FOUND'],[500,'API_UNAVAILABLE'],[409,'EMPTY_REPOSITORY'],[429,'RATE_LIMITED']])('handles error %s',async(status,code)=>{const f=sequence(new Response(null,{status:status as number}));await expect(new GitHub(undefined,f).metadata('o/r')).rejects.toMatchObject({code});});
 it('recognizes rate exhausted 403',async()=>{await expect(new GitHub(undefined,sequence(new Response(null,{status:403,headers:{'x-ratelimit-remaining':'0'}}))).metadata('o/r')).rejects.toMatchObject({code:'RATE_LIMITED'});});
 it('rejects private repos even with an available token',async()=>{await expect(new GitHub('secret',sequence({...metadata,private:true})).metadata('o/r')).rejects.toMatchObject({code:'PRIVATE_REPOSITORY'});});
 it('tracks unavailable files without inventing absence',async()=>{const entry={path:'README.md',size:10,type:'blob',sha:'b'.repeat(40),mode:'100644'};const f=sequence({tree:[entry],truncated:false},new Response(null,{status:500}));const r=await new GitHub(undefined,f).inspect(exampleInspection().metadata,{sha:'a'.repeat(40),commit:{tree:{sha:'c'.repeat(40)}}});expect(r.unavailable).toEqual(['README.md']);expect(r.treeComplete).toBe(true);expect(r.files).toEqual({});});
 it('caps oversized files, generated directories and incomplete trees',async()=>{const tree=[{path:'README.md',size:LIMITS.fileBytes+1,type:'blob',sha:'b'.repeat(40),mode:'100644'},{path:'node_modules/readme.md',size:3,type:'blob',sha:'b'.repeat(40),mode:'100644'}];const r=await new GitHub(undefined,sequence({tree,truncated:true})).inspect(exampleInspection().metadata,{sha:'a'.repeat(40),commit:{tree:{sha:'c'.repeat(40)}}});expect(r.treeComplete).toBe(false);expect(r.skipped).toHaveLength(2);expect(r.requests).toBe(1);});
 it('bounds tree count',async()=>{const tree=Array.from({length:LIMITS.files+1},(_,n)=>({path:'file'+n,type:'blob',sha:'a'.repeat(40),size:1,mode:'100644'}));const r=await new GitHub(undefined,sequence({tree})).inspect(exampleInspection().metadata,{sha:'a'.repeat(40),commit:{tree:{sha:'c'.repeat(40)}}});expect(r.tree).toHaveLength(LIMITS.files);expect(r.treeComplete).toBe(false);});
 it('decodes UTF8 base64 and tracks inspected bytes',async()=>{const text='# Hello 🔥';const entry={path:'README.md',type:'blob',sha:'b'.repeat(40),size:15,mode:'100644'};const f=sequence({tree:[entry]}, {encoding:'base64',content:btoa(String.fromCharCode(...new TextEncoder().encode(text)))});const r=await new GitHub(undefined,f).inspect(exampleInspection().metadata,{sha:'a'.repeat(40),commit:{tree:{sha:'c'.repeat(40)}}});expect(r.files['README.md']).toBe(text);expect(r.bytes).toBe(new TextEncoder().encode(text).length);});
 it('enforces response and request budgets',async()=>{await expect(new GitHub(undefined,sequence(new Response('a'.repeat(LIMITS.responseBytes+1)))).metadata('o/r')).rejects.toMatchObject({code:'TOO_LARGE'});const g=new GitHub(undefined,sequence(metadata));g.requests=LIMITS.requests;await expect(g.metadata('o/r')).rejects.toMatchObject({code:'REQUEST_BUDGET'});});
 it('keeps rate errors fatal rather than missing evidence',async()=>{const entry={path:'README.md',type:'blob',sha:'b'.repeat(40),size:15,mode:'100644'};await expect(new GitHub(undefined,sequence({tree:[entry]},new Response(null,{status:429}))).inspect(exampleInspection().metadata,{sha:'a'.repeat(40),commit:{tree:{sha:'c'.repeat(40)}}})).rejects.toMatchObject({code:'RATE_LIMITED'});});
});
describe('secret redaction',()=>{
 it.each(['ghp_'+'a'.repeat(36),'github_pat_'+'a'.repeat(60),'AKIA'+'A'.repeat(16),'token=super-secret-value','-----BEGIN PRIVATE KEY-----\nsensitive\n-----END PRIVATE KEY-----','https://user:password@host.test'])('redacts common credential patterns',value=>expect(redact(value)).toBe('[REDACTED]'));
});

it('marks malformed tree entries incomplete rather than inventing absence',async()=>{const f=sequence({tree:[{path:'../outside.py',type:'blob',mode:'100644',sha:'a'.repeat(40)}],truncated:false});const r=await new GitHub(undefined,f).inspect(exampleInspection().metadata,{sha:'a'.repeat(40),commit:{tree:{sha:'c'.repeat(40)}}});expect(r.treeComplete).toBe(false);expect(r.tree).toEqual([]);expect(r.skipped[0].reason).toContain('absence cannot be established');});
it('classifies interrupted response bodies as unavailable API evidence',async()=>{const stream=new ReadableStream({start(controller){controller.error(new Error('Interrupted'));}});await expect(new GitHub(undefined,sequence(new Response(stream))).metadata('o/r')).rejects.toMatchObject({code:'API_UNAVAILABLE'});});

it('sends authentication only server-side and records safe response headers',async()=>{
 const f=vi.fn(async(_url:unknown,init:RequestInit)=>{expect((init.headers as Record<string,string>).Authorization).toBe('Bearer service-token');return Response.json(metadata,{headers:{'x-ratelimit-remaining':'4999','x-ratelimit-limit':'5000','x-ratelimit-reset':'2000000000'}});});
 const observed:unknown[]=[];const g=new GitHub('service-token',f as typeof fetch,undefined,info=>observed.push(info));await g.metadata('o/r');
 expect(g.requests).toBe(1);expect(observed[0]).toMatchObject({status:200,authenticated:true,remaining:4999,limit:5000,reset:2000000000,retryAfter:null});expect(JSON.stringify(observed)).not.toContain('service-token');
});
it.each([403,429])('distinguishes primary exhaustion %s without retries',async status=>{
 const reset=Math.floor(Date.now()/1000)+3600;const f=sequence(Response.json({message:'API rate limit exceeded'},{status,headers:{'x-ratelimit-remaining':'0','x-ratelimit-reset':String(reset)}}));
 const g=new GitHub(undefined,f);await expect(g.metadata('o/r')).rejects.toMatchObject({code:'RATE_LIMITED',source:'github_primary',retryAt:reset*1000});expect(g.requests).toBe(1);
});
it.each([403,429])('recognizes secondary limits %s even with primary capacity',async status=>{
 const f=sequence(Response.json({message:'You have exceeded a secondary rate limit'},{status,headers:{'x-ratelimit-remaining':'48'}}));const g=new GitHub(undefined,f);
 await expect(g.metadata('o/r')).rejects.toMatchObject({source:'github_secondary',status:429});expect(g.requests).toBe(1);
});
it('honors Retry-After and reset together',async()=>{
 const now=Date.now(),reset=Math.floor(now/1000)+120;const f=sequence(new Response(null,{status:403,headers:{'x-ratelimit-remaining':'0','x-ratelimit-reset':String(reset),'retry-after':'600'}}));
 try{await new GitHub(undefined,f).metadata('o/r');throw new Error('Expected rate limit');}catch(error:any){expect(error.retryAt).toBeGreaterThanOrEqual(now+600000);}
});
it('recognizes an invalid credential without pretending evidence is missing',async()=>{
 await expect(new GitHub('expired',sequence(new Response(null,{status:401}))).metadata('o/r')).rejects.toMatchObject({code:'GITHUB_AUTHENTICATION',status:503});
});

it('does not guess secondary when upstream classification evidence is absent',async()=>{
 await expect(new GitHub(undefined,sequence(new Response(null,{status:429}))).metadata('o/r')).rejects.toMatchObject({source:'github_unclassified'});
});
it('does not count blocked or unsafe requests as HTTP calls',async()=>{
 const g=new GitHub(undefined,sequence(metadata),undefined,undefined,()=>{throw new Error('cooldown');});
 await expect(g.metadata('o/r')).rejects.toThrow('cooldown');expect(g.requests).toBe(0);
 const redirected=new GitHub('secret',sequence(new Response(null,{status:301,headers:{location:'https://evil.test/steal'}})));
 await expect(redirected.metadata('o/r')).rejects.toMatchObject({code:'UNSAFE_REDIRECT'});expect(redirected.requests).toBe(1);
});
it('bounds malformed upstream date headers without crashing error handling',async()=>{
 await expect(new GitHub(undefined,sequence(new Response(null,{status:403,headers:{'x-ratelimit-remaining':'0','x-ratelimit-reset':'9007199254740991','retry-after':'9'.repeat(1000)}}))).metadata('o/r')).rejects.toMatchObject({code:'RATE_LIMITED',source:'github_primary'});
});
