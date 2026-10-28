import type { Rule, Profile, State, Evidence, Check } from './engine';
import { RULES as V1 } from './legacy/v1';
import { Facts, meaningful, object, parseConfig, type Ecosystem } from './inspection-facts';
import { evidenceUrl } from './url';
const points=[40,60,60,40,40,30,90,40,80,30,40,40,30,20,60,30,50,50,20,75,25,0,50,0];
const names=['Provide a substantive root README','Describe concrete setup steps','Explain usage or document navigation','Describe scope or supported requirements','Include recognizable test declarations','Provide parseable CI job configuration','Reference a test invocation in CI','Document verification commands','Publish substantive root license terms','Declare useful ignore entries','Make an implementation entry point discoverable','Explain private vulnerability reporting','Configure applicable dependency updates','Ignore observed local environment files','Declare scoped workflow token policies','Declare formatting settings or commands','Declare static analysis settings or commands','Record ecosystem dependency reproducibility','Record substantive change notes','Explain contributor setup or verification','Provide substantive issue templates','Optional community conduct guidance (unscored)','Provide a repository description snapshot','GitHub license recognition (unscored)'];
const fixes=[
'Describe project purpose and entry points in the root README; replace placeholders with useful prose.',
'Add concrete prerequisites and setup steps to the root README or contributor guide.',
'Describe a usage example, get-started workflow or document navigation with supporting content.',
'Explain supported platforms, requirements, scope or limitations beneath the appropriate heading.',
'Include tests with recognizable assertions or declarations. This does not establish that tests pass.',
'Provide valid supported CI jobs/steps. Configuration is not evidence of a successful run.',
'Reference the actual test command from at least one relevant CI job. Deployment-only workflows do not each need tests.',
'Document concrete verification commands and their prerequisites in the README or contributor guide.',
'Publish actual root license terms. Review licensing choices yourself; GitHub recognition is not required.',
'Declare relevant noncomment ignore entries for local/generated files used by the project.',
'Expose an implementation or document entry point. A flat layout is valid; do not add directories for points.',
'Describe a private vulnerability-reporting channel and responsible-disclosure instructions.',
'Configure supported dependency update tooling for the ecosystems actually used; service activation is not verified.',
'Ignore observed environment-file paths and review ordered exceptions. Ignore rules do not remove already tracked files.',
'Declare workflow or job-level permissions; review broad grants. Scoped release writes are not automatically unsafe.',
'Configure native formatting settings or declare a formatting command. Repository JS configuration is never executed.',
'Declare applicable lint/static-analysis settings or commands, including native ecosystem tools.',
'Use ecosystem-appropriate dependency pins/hashes/checksums. Their presence does not prove installs succeed.',
'Record concrete changes instead of a placeholder. Required unreadable content remains unknown.',
'Explain contributor setup, verification and the contribution process using substantive guidance.',
'Provide useful issue questions or structured fields. Template presence does not prove responsiveness.',
'Community conduct policies are optional and carry no numerical penalty.',
'Provide a concise GitHub repository description; this is mutable scan-time metadata.',
'GitHub license recognition is informational, unscored and not a legal conclusion.'
];
export const V2_RULES:Rule[]=V1.map((r,n)=>({...r,method:r.id.startsWith('MET')?'metadata':r.id==='STR03'||r.id==='CON03'?'tree':'content',pattern:undefined,content:undefined,scope:undefined,max:points[n],title:names[n],fix:fixes[n],version:'2.0.0',steps:[fixes[n],'Run the documented verification yourself, commit the change and rescan.'],roast:[`The evidence for “${names[n]}” needs another commit.`,`“${names[n]}” is waiting for its supporting paperwork.`]}));
export function evaluateRule(rule:Rule,f:Facts,profile:Profile):Check {
 const i=f.input;let ratio:number|null=null,state:State='unknown',level:NonNullable<Evidence['level']>='configuration';
 let explanation='Required evidence is unavailable or outside supported static interpretation; no failure is inferred.';
 const evidence:Evidence[]=[];
 const ev=(path?:string)=>{
  const anchors:Record<string,RegExp>={DOC01:/\S/,DOC02:/^#+\s+.*(?:install|set.?up|get started|run and check)/i,DOC03:/^#+\s+.*(?:usage|example|what you can do|get started|navigation)/i,DOC04:/^#+\s+.*(?:scope|limit|support|requirement|privacy)/i,SEC04:/^\s*permissions\s*:/,MNT01:/^\[tool\.(ruff|black|isort)/,MNT02:/^\[tool\.(ruff|mypy|pylint|flake8)/};
  const anchor=anchors[rule.id],index=path&&anchor?f.text(path)?.split('\n').findIndex(l=>anchor.test(l)):undefined;
  const line=typeof index==='number'&&index>=0?index+1:undefined;
  evidence.push({path:path||null,url:evidenceUrl(i.metadata.fullName,i.sha,path,line),status:'confirmed condition',confidence:'medium',level,...(line?{lines:[line,line] as [number,number]}:{})});
 };
 const result=(value:number,why:string,paths:string[]=[])=>{ratio=value;state=value===1?'pass':value===0?'fail':'partial';explanation=why;paths.forEach(p=>ev(p));};
 const na=(why:string)=>{state='not-applicable';explanation=why;};
 const select=(re:RegExp)=>f.matches(re);
 const content=(paths:string[],test:(text:string,path:string)=>number|null,why:string)=>{
  let unavailable=!i.treeComplete;const read:{p:string;v:number}[]=[];
  for(const p of paths){const t=f.text(p);if(t===undefined){unavailable=true;continue;}const v=test(t,p);if(v===null)unavailable=true;else read.push({p,v});}
  const best=read.filter(x=>x.v>0).sort((a,b)=>b.v-a.v)[0];
  if(best)result(best.v,why,[best.p]);else if(!unavailable)result(0,why,read.map(x=>x.p).slice(0,2));
 };
 const guides=f.docs,readmes=guides.filter(p=>/^readme/i.test(p)),workflows=f.workflows.map(w=>w.path);
 const codeScoped=['TST01','TST02','TST03','TST04','STR02','SEC02','SEC03','SEC04','MNT01','MNT02','MNT03'];
 if(rule.max===0)na('Optional informational signal; no numerical penalty or gain in 2.0.0.');
 else if(profile==='documentation'&&codeScoped.includes(rule.id))na('Code/dependency practice is ineligible for this documentation profile.');
 else if(['SEC02','MNT03'].includes(rule.id)&&f.dependencies===false)na('No declared third-party dependencies in supported complete evidence.');
 else if(['SEC02','MNT03'].includes(rule.id)&&f.dependencies===null){/* unknown applicability */}
 else switch(rule.id){
 case 'DOC01':content(readmes,t=>meaningful(t,100)?1:meaningful(t,1)?.25:0,'Root README prose was inspected; documentation adequacy is not verified.');break;
 case 'DOC02':case 'DOC03':case 'DOC04':{
  const heading=rule.id==='DOC02'?/(install|set.?up|get(?:ting)? started|quick.?start|prerequisites|build|run and check)/i:rule.id==='DOC03'?/(usage|examples?|what you can do|how to|navigation|get started|quick.?start)/i:/(scope|limit|support|requirement|platform|privacy)/i;
  content(rule.id==='DOC02'?guides:readmes,t=>{const sections=[...t.matchAll(/^#{1,6}\s+(.+)\n([\s\S]*?)(?=^#{1,6}\s|$(?![\s\S]))/gm)].filter(m=>heading.test(m[1]));return sections.some(m=>meaningful(m[2],60))?1:sections.length?.25:0;},'Recognized section and supporting content inspected; a heading alone earns only outline credit, not an adequacy claim.');break;
 }
 case 'TST01':content(select(/(?:^|\/)(?:tests?|spec|__tests__)\/.*\.(?:py|[cm]?[jt]sx?|rs|go|java|cs)$|(?:^|\/)test_[^/]+\.py$|[._](?:test|spec)\.[^/]+$|_test\.go$/),t=>/^\s*(?:(?:async\s+)?def\s+test_\w+\s*\(|(?:it|test|describe)\s*\(|func\s+Test\w*\s*\(|class\s+\w+\(unittest\.TestCase\)|#\[test\]\s*\n\s*fn\s+|@Test\b)/m.test(t)?1:0,'Recognizable test declarations inspected. Tests were not run.');break;
 case 'TST02':{
  if(f.workflows.some(w=>w.data))result(1,'GitHub Actions jobs/steps parse; actual execution and success are unverified.',f.workflows.filter(w=>w.data).slice(0,2).map(w=>w.path));
  else if(!workflows.length)content(select(/^\.gitlab-ci\.ya?ml$|^\.circleci\/config\.ya?ml$/),(_,p)=>{const c=f.config(p);return c?(object(c.jobs)||Object.values(c).some(v=>object(v)&&v.script)?1:0):null;},'Supported provider job structure, not a successful run.');break;
 }
 case 'TST03':{
  level='invocation';if(!workflows.length){if(i.treeComplete)na('GitHub-specific check; no GitHub Actions workflows observed.');break;}
  let unresolved=!i.treeComplete;const matched:string[]=[];
  for(const w of f.workflows){unresolved||=w.unresolved;for(const c of w.commands){const r=f.trace(c,'test');unresolved||=r.unknown;if(r.found)matched.push(w.path,...r.paths);}}
  if(matched.length)result(1,'At least one job references a recognized test invocation. Non-test workflows do not enter a test-workflow denominator. No execution outcome verified.',[...new Set(matched)].slice(0,6));
  else if(!unresolved)result(0,'No supported test invocation in inspected workflow run steps.',workflows.slice(0,3));break;
 }
 case 'TST04':level='invocation';content(guides,t=>[...t.split('\n'),...Array.from(t.matchAll(/`([^`\n]+)`/g),m=>m[1])].some(l=>f.trace(l.replace(/^\s*(?:[-*]\s+|\d+\.\s+)?/,'').replace(/`/g,''),'test').found)?1:0,'README/contributor guidance references a recognized verification command; it was not executed.');break;
 case 'STR01':content(select(/^(license|licence|copying)(?:\.[\w-]+)?$/i),t=>meaningful(t,150)&&/permission|redistribution|licensed|copyright|public domain/i.test(t)?1:0,'Substantive root license terms inspected; no legal compatibility/identification claim.');break;
 case 'STR02':content(select(/^\.gitignore$/),t=>t.split('\n').some(l=>l.trim()&&!l.trim().startsWith('#'))?1:0,'Noncomment ignore entries exist; completeness is not established.');break;
 case 'STR03':{level='presence';const paths=select(/^(?:[^/]+\.(?:py|[cm]?[jt]sx?|go|rs|c|cpp)|(?:src|lib|app|cmd|internal|packages|docs|content)\/[^/].*)$/);if(paths.length)result(1,'A flat or grouped entry point is discoverable; layout is not proof of quality.',paths.slice(0,2));else if(i.treeComplete)result(0,'No supported implementation/document entry point observed.');break;}
 case 'SEC01':content(select(/^(?:security\.md|\.github\/security\.md|docs\/security\.md)$/i),t=>meaningful(t,100)&&/(?:[\w.+-]+@[\w.-]+\.[a-z]{2,}|security\/advisories|private vulnerability reporting|privately.{0,80}report|report.{0,80}privately)/is.test(t)?1:0,'Private reporting contact/instructions inspected; responsiveness and security unverified.');break;
 case 'SEC02':content(select(/^\.github\/dependabot\.ya?ml$|^(?:renovate\.json5?|\.renovaterc(?:\.json)?)$/),(_,p)=>{const c=f.config(p);if(!c)return null;if(p.includes('dependabot')){if(c.version!==2||!Array.isArray(c.updates))return 0;const names:Record<Ecosystem,string>={node:'npm',python:'pip',rust:'cargo',go:'gomod'};const covered=f.ecosystems.filter(e=>c.updates.some((u:any)=>u?.['package-ecosystem']===names[e]&&typeof u.directory==='string'&&object(u.schedule)&&typeof u.schedule.interval==='string'));return f.ecosystems.length?covered.length/f.ecosystems.length:null;}return c.enabled===false?0:Array.isArray(c.extends)&&c.extends.length>0?1:null;},'Supported update configuration covers observed ecosystems; service activity is not verified.');break;
 case 'SEC03':{
  const tracked=select(/(^|\/)\.env(?:\.[^/]+)?$/).filter(p=>!/(?:example|sample|template|dist)$/.test(p)),examples=select(/(^|\/)\.env\.(?:example|sample|template)$/);
  if(!tracked.length&&!examples.length){if(i.treeComplete)na('No environment-file use observed; .env is not mandatory.');break;}
  content(select(/^\.gitignore$/),t=>{let ignored=false;for(const p of t.split('\n').map(x=>x.trim()).filter(x=>x&&!x.startsWith('#'))){if(/^!?\/?\.env(?:\*|\.\*)?$/.test(p))ignored=!p.startsWith('!');else if(p.startsWith('!')&&/env/.test(p))return null;}return ignored?1:0;},'Root ignore convention inspected, not a secret scan.');
  if(tracked.length){explanation+=' Environment-file paths are tracked; ignore rules do not untrack them.';if(ratio===1){ratio=.5;state='partial';}}break;
 }
 case 'SEC04':{
  if(!workflows.length){if(i.treeComplete)na('No GitHub Actions workflows in complete tree.');break;}
  let total=0,credit=0,unresolved=!i.treeComplete;const paths:string[]=[];
  const scopes=['actions','artifact-metadata','attestations','checks','contents','deployments','discussions','id-token','issues','models','packages','pages','pull-requests','security-events','statuses'];
  for(const w of f.workflows){if(!w.data){unresolved=true;continue;}for(const j of w.jobs){total++;const p=Object.hasOwn(j,'permissions')?j.permissions:w.data.permissions;if(p===undefined){unresolved=true;continue;}if(p==='write-all'){paths.push(w.path);continue;}if(p==='read-all'){credit+=.5;paths.push(w.path);continue;}if(!object(p)||!Object.entries(p).every(([k,v])=>scopes.includes(k)&&['read','write','none'].includes(String(v)))){unresolved=true;continue;}credit++;paths.push(w.path);}}
  if(!unresolved&&total)result(credit/total,'Explicit workflow/job-level scopes inspected; scoped writes can be intentional. This is not proof of least privilege or workflow security.',[...new Set(paths)]);
  else explanation='Unspecified/malformed/dynamic/unavailable permissions: organization/repository defaults were not inspected. No insecure-default claim.';break;
 }
 case 'MNT01':case 'MNT02':{
  const kind=rule.id==='MNT01'?'format':'lint',commands=f.commands().map(c=>({...c,r:f.trace(c.command,kind)})).filter(c=>c.r.found);
  if(commands.length){level='invocation';result(1,'Recognized native tool invocation declared, not executed.',[...new Set(commands.flatMap(c=>[c.path,...c.r.paths]))].slice(0,4));break;}
  const py=f.config('pyproject.toml'),tools=kind==='format'?['ruff','black','isort']:['ruff','mypy','pylint','flake8'];
  if(tools.some(t=>object(py?.tool?.[t]))){result(1,'Supported tool settings parsed from pyproject.toml; execution unverified.',['pyproject.toml']);break;}
  const paths=select(kind==='format'?/^(?:\.prettierrc(?:\.json5?)?|prettier\.config\.[cm]?js|\.editorconfig|rustfmt\.toml|\.rustfmt\.toml|biome\.jsonc?)$/:/^(?:eslint\.config\.[cm]?[jt]s|\.eslintrc(?:\.[\w-]+)?|ruff\.toml|\.ruff\.toml|mypy\.ini|\.flake8|setup\.cfg|\.golangci\.ya?ml|clippy\.toml|biome\.jsonc?)$/);
  if(f.paths.includes('pyproject.toml')&&!py&&!paths.length)break;
  content(paths,(t,p)=>{if(/\.[cm]?[jt]s$/.test(p))return null;if(/(?:editorconfig|\.ini|\.cfg|flake8)$/.test(p))return /\[[^\]]+\]/.test(t)&&/^[\w-]+\s*=/m.test(t)?1:0;const c=f.config(p);return c?Object.keys(c).length?1:.5:null;},'Supported tool configuration inspected; opaque executable configuration is unknown and never run.');break;
 }
 case 'MNT03':{
  if(profile==='library'){na('Library publication lock conventions vary; no universal lockfile requirement.');break;}
  const outcomes:{v:number;paths:string[]}[]=[];let unresolved=false;
  for(const e of f.ecosystems){
   const paths=select(e==='python'?/^(?:requirements[^/]*\.(?:lock|txt)|poetry\.lock|uv\.lock|Pipfile\.lock)$/:e==='node'?/^(?:package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb?)$/:e==='rust'?/^Cargo\.lock$/:/^go\.(?:mod|sum)$/);
   let best=0,proof:string[]=[];
   for(const p of paths){const t=f.text(p);if(t===undefined){unresolved=true;continue;}let v:number|null=0;
    if(e==='python'&&/^requirements/.test(p)){const lines=t.replace(/\\\r?\n\s*/g,' ').split('\n').map(x=>x.replace(/\s+#.*$/,'').trim()).filter(x=>x&&!x.startsWith('#')&&!x.startsWith('--'));if(lines.length&&lines.every(l=>/^[\w.-]+(?:\[[\w,.-]+\])?==[^\s;]+/.test(l)))v=lines.every(l=>/--hash=sha256:[a-f\d]{64}/i.test(l))?1:.5;}
    else if(e==='go')v=p==='go.sum'&&/^\S+\s+v[^\s]+\s+h1:[A-Za-z0-9+/]{43}=$/m.test(t)?1:0;
    else if(e==='rust'){const lock=parseConfig(p+'.toml',t);v=lock&&typeof lock.version==='number'&&Array.isArray(lock.package)&&lock.package.some((q:any)=>typeof q.name==='string'&&typeof q.version==='string'&&/^[a-f\d]{64}$/i.test(q.checksum))?1:lock?0:null;}
    else if(e==='python')v=/^\[\[package\]\]/m.test(t)&&/(?:hash|checksum|sdist|wheels)\s*=/.test(t)?1:null;
    else if(p==='yarn.lock')v=/^\s*integrity\s+/m.test(t)?1:null;
    else {const c=f.config(p);if(!c)v=null;else if(!c.lockfileVersion)v=0;else if(p==='package-lock.json'){const declared=f.config('package.json');const deps=Object.keys({...declared?.dependencies,...declared?.devDependencies});v=deps.length&&deps.every(name=>{const d=c.packages?.['node_modules/'+name]||c.dependencies?.[name];return d&&(d.link===true||typeof d.version==='string'&&typeof d.integrity==='string'&&/^sha(?:256|384|512)-[A-Za-z0-9+/]+=*$/.test(d.integrity));})?1:0;}else v=object(c.packages)&&Object.keys(c.packages).length>0?1:0;}
    if(v===null)unresolved=true;else if(v>best){best=v;proof=[p];}
   }
   outcomes.push({v:best,paths:proof});if(!paths.length&&!i.treeComplete)unresolved=true;
  }
  if(outcomes.length&&outcomes.every(o=>o.v===1))result(1,'Ecosystem pin/hash/checksum structure inspected; Go checksums are not a lockfile. No install/test executed.',outcomes.flatMap(o=>o.paths));
  else if(!unresolved)result(outcomes.length?outcomes.reduce((s,o)=>s+o.v,0)/outcomes.length:0,'Observed ecosystem reproducibility structure; exact pins without hashes earn partial credit.',outcomes.flatMap(o=>o.paths));break;
 }
 case 'MNT04':content(select(/^(?:changelog|changes|history)(?:\.[\w-]+)?$|^\.changeset\/[^/]+\.md$/i),t=>meaningful(t,100)?1:0,'Substantive change notes inspected, not release correctness.');break;
 case 'CON01':content(guides,t=>meaningful(t,150)&&/(contribut|pull request|before committing|development|run and check)/i.test(t)?1:0,'Substantive contributor process/setup guidance inspected; onboarding success not verified.');break;
 case 'CON02':content(select(/^\.github\/ISSUE_TEMPLATE\/[^/]+\.(?:md|ya?ml)$/i),(t,p)=>{if(/\.md$/.test(p))return meaningful(t,100)&&/[?#]/.test(t)?1:0;const c=f.config(p);return c&&typeof c.name==='string'&&Array.isArray(c.body)&&c.body.some((b:any)=>['input','textarea','dropdown','checkboxes'].includes(b.type)&&b.attributes?.label)?1:c?0:null;},'Issue questions/form structure inspected; availability/community response unverified.');break;
 case 'MET01':level='metadata';result(i.metadata.description.trim().length>=12?1:0,'Scan-time GitHub description snapshot, not a commit-pinned technical-quality fact.');break;
 }
 if(!evidence.length&&(state as State)!=='not-applicable')ev();
 if(state==='unknown')for(const e of evidence){e.status='insufficient evidence';e.confidence='low';}
 return {rule,state,ratio,awarded:null,maximum:null,evidence,explanation,level};
}
