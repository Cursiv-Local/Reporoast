import type { Inspection } from '../../worker/github';
import { evidenceUrl } from './url';
export const ANALYZER_VERSION = '0.1.0';
export const RULE_VERSION = '1.0.0';
export const PROFILES = ['library','application','cli','documentation','general'] as const;
export type Profile = typeof PROFILES[number];
export type Category = 'Documentation'|'Testing and CI'|'Project Structure'|'Security Hygiene'|'Maintainability'|'Contributor Readiness'|'Repository Metadata';
export const WEIGHTS: Record<Category,number> = {'Documentation':200,'Testing and CI':200,'Project Structure':150,'Security Hygiene':150,'Maintainability':150,'Contributor Readiness':100,'Repository Metadata':50};
export type State = 'pass'|'partial'|'fail'|'unknown'|'not-applicable';
export interface Evidence { path: string | null; url: string; status: 'confirmed condition'|'potential concern'|'improvement suggestion'|'insufficient evidence'; confidence: 'high'|'medium'|'low'; lines?: [number,number] }
export interface Rule { id:string; category:Category; title:string; max:number; method:'tree'|'content'|'metadata'; pattern?:string; content?:string; scope?:'code'|'package'|'typescript'|'cli'; fix:string; steps:string[]; difficulty:'Easy'|'Moderate'|'Advanced'; importance:number; roast:[string,string]; version:string }
type Spec = [string,Category,string,number,Rule['method'],string,string,string,Rule['difficulty'],number,string,string,Rule['scope']?];
const specs: Spec[] = [
['DOC01','Documentation','Provide a README',60,'content','(^|/)readme(\\.[\\w-]+)?$','\\S','Add a README describing the project and its purpose.','Easy',2,'Your repository has entered its silent era.','The README is playing hide-and-seek. It is winning.'],
['DOC02','Documentation','Document setup or installation',50,'content','(^|/)readme(\\.[\\w-]+)?$','\\b(install(?:ation)?|setup|getting started|prerequisites)\\b','Document setup prerequisites and installation steps in the README.','Easy',2,'Your installation guide currently requires psychic abilities.','Getting started should not require a séance.'],
['DOC03','Documentation','Document usage',50,'content','(^|/)readme(\\.[\\w-]+)?$','\\b(usage|quick start|example|how to use|reading|navigation)\\b','Add a concrete usage example or a navigation guide in the README.','Easy',2,'The user manual appears to be a trust exercise.','Usage instructions are apparently an escape-room puzzle.'],
['DOC04','Documentation','Document project scope and limitations',40,'content','(^|/)readme(\\.[\\w-]+)?$','\\b(limitations?|non-goals?|scope|supported|requirements)\\b','Explain supported use cases and known limitations in the README.','Easy',2,'Your scope is currently set to: surprise.','Even software needs to establish boundaries.'],
['TST01','Testing and CI','Include recognized test files',60,'tree','(^|/)(__tests__|tests?|spec)/|[._](test|spec)\\.[^/]+$','','Add tests covering meaningful project behavior; their presence does not prove they pass.','Moderate',4,'Your test suite called. It could not find itself.','Confidence is a bold testing framework.','code'],
['TST02','Testing and CI','Include a recognized CI configuration',50,'tree','^\\.github/workflows/[^/]+\\.ya?ml$|^\\.gitlab-ci\\.yml$|^\\.circleci/config\\.yml$','','Configure CI for your documented verification commands.','Moderate',4,'Your pipeline appears to run on optimism.','The push button is doing a lot of emotional labor.','code'],
['TST03','Testing and CI','Reference tests in GitHub Actions',60,'content','^\\.github/workflows/[^/]+\\.ya?ml$','\\b(npm (?:run )?test|pnpm (?:run )?test|yarn test|pytest|cargo test|go test|vitest|jest|dotnet test|bun test)\\b','Add the actual test command to GitHub Actions. This check does not verify execution.','Moderate',4,'The CI robot is still waiting for its test assignment.','Automated testing has apparently been left on read.','code'],
['TST04','Testing and CI','Document verification commands',30,'content','(^|/)readme(\\.[\\w-]+)?$','\\b(testing|run tests|npm test|pytest|cargo test|go test|verification)\\b','Document how contributors run verification locally.','Easy',3,'Running tests should not require oral tradition.','The test command is not a family secret.','code'],
['STR01','Project Structure','Include a license file',60,'tree','(^|/)(license|licence|copying)(\\.[\\w-]+)?$','','Choose an appropriate license and include its text.','Easy',2,'Your license is currently a legal shrug.','Open source works better with the permission slip attached.'],
['STR02','Project Structure','Include an ignore configuration',40,'tree','(^|/)\\.gitignore$','','Add an ignore configuration appropriate to your tools.','Easy',2,'Your repository has no bouncer for build leftovers.','The working directory appears to have an open-door policy.','code'],
['STR03','Project Structure','Group implementation files',50,'tree','(^|/)(src|lib|app|cmd|internal|packages|docs|content)/','','Group related implementation or documentation files in clear directories.','Moderate',1,'The project structure could use a few street signs.','Your files deserve more than a communal junk drawer.'],
['SEC01','Security Hygiene','Publish a security reporting policy',50,'tree','(^|/)security\\.md$','','Add a SECURITY.md describing a private vulnerability reporting channel.','Easy',5,'Vulnerability reports currently need a carrier pigeon.','Security reporters should not need a treasure map.'],
['SEC02','Security Hygiene','Configure dependency update tooling',40,'tree','^\\.github/dependabot\\.ya?ml$|(^|/)(renovate\\.json5?|\\.renovaterc(\\.json)?)$','','Configure dependency update tooling for the package ecosystems you use.','Moderate',4,'Your dependencies are aging without adult supervision.','Dependency updates are not a geological process.','package'],
['SEC03','Security Hygiene','Ignore local environment files',30,'content','(^|/)\\.gitignore$','^\\s*(?:/)?\\.env(?:\\*|\\.\\*|/)?\\s*$','Ignore local environment files and keep credentials outside version control. This does not detect leaked secrets.','Easy',5,'Your environment files would appreciate a privacy curtain.','Local credentials should not audition for public visibility.','code'],
['SEC04','Security Hygiene','Declare workflow permissions',30,'content','^\\.github/workflows/[^/]+\\.ya?ml$','^permissions\\s*:','Declare top-level GitHub Actions token permissions and review least privilege. Presence alone does not prove safety.','Moderate',5,'Your workflow token could use a written job description.','Permissions deserve a deliberate decision, not a default shrug.','code'],
['MNT01','Maintainability','Include formatter configuration',35,'tree','(^|/)(\\.prettierrc(\\.[\\w-]+)?|prettier\\.config\\.[cm]?js|\\.editorconfig|rustfmt\\.toml|\\.rustfmt\\.toml|biome\\.jsonc?)$','','Configure a formatter or shared editor settings appropriate to the project.','Easy',1,'Whitespace negotiations appear to happen by hand.','Tabs and spaces should not need couples counseling.','code'],
['MNT02','Maintainability','Include lint configuration',40,'tree','(^|/)(eslint\\.config\\.[cm]?[jt]s|\\.eslintrc(\\.[\\w-]+)?|ruff\\.toml|\\.golangci\\.ya?ml|clippy\\.toml|biome\\.jsonc?)$','','Configure suitable static checks and document the command.','Moderate',3,'Your linter is enjoying an indefinite vacation.','Static analysis has not received an invitation.','code'],
['MNT03','Maintainability','Include a dependency lockfile',40,'tree','(^|/)(package-lock\\.json|pnpm-lock\\.yaml|yarn\\.lock|bun\\.lockb?|cargo\\.lock|poetry\\.lock|uv\\.lock|go\\.sum)$','','Use a suitable dependency lockfile where reproducible application installs are expected.','Easy',3,'Your dependency versions are doing improv.','Reproducibility would like something in writing.','package'],
['MNT04','Maintainability','Record notable changes',35,'tree','(^|/)(changelog|changes|history)(\\.[\\w-]+)?$|^\\.changeset/[^/]+\\.md$','','Maintain a concise changelog or change notes.','Easy',1,'Your release notes are apparently archaeological work.','A changelog saves future you a git-log expedition.'],
['CON01','Contributor Readiness','Provide contributor guidance',40,'tree','(^|/)contributing(\\.[\\w-]+)?$','','Document how to propose and verify a contribution.','Easy',2,'Contributors are currently onboarding by echolocation.','The contribution entrance could use a welcome mat.'],
['CON02','Contributor Readiness','Provide issue templates',30,'tree','^\\.github/issue_template/[^/]+\\.(md|ya?ml)$','','Add focused issue templates for useful bug reports and requests.','Easy',1,'Your bug reports are operating on a bring-your-own-context basis.','Issue templates: because “broken” needs a little elaboration.'],
['CON03','Contributor Readiness','Provide a code of conduct',30,'tree','(^|/)code_of_conduct(\\.[\\w-]+)?$','','Publish appropriate community participation expectations.','Easy',1,'The community handbook appears to be telepathic.','Community expectations work better when written down.'],
['MET01','Repository Metadata','Provide a repository description',25,'metadata','','description','Add a concise repository description in GitHub settings.','Easy',1,'The repository bio has perfected minimalism.','A blank description is a very quiet elevator pitch.'],
['MET02','Repository Metadata','Identify a license in GitHub metadata',25,'metadata','','license','Use a recognizable license and verify GitHub identifies it correctly.','Easy',2,'GitHub is still waiting for the licensing paperwork.','The license badge has not received its lines.']
];
export const RULES: Rule[] = specs.map(([id,category,title,max,method,pattern,content,fix,difficulty,importance,r1,r2,scope]) => ({id,category,title,max,method,pattern,content,fix,steps:[fix,'Re-scan the new commit and review evidence and applicability.'],difficulty,importance,roast:[r1,r2],scope,version:RULE_VERSION}));
export interface Check { rule:Rule; state:State; ratio:number|null; awarded:number|null; maximum:number|null; evidence:Evidence[]; explanation:string }
export interface Finding { id:string; ruleId:string; category:Category; severity:'warning'|'info'; title:string; description:string; evidence:Evidence[]; evidenceStatus:Evidence['status']; confidence:Evidence['confidence']; recommendedImprovement:string }
export interface Improvement { ruleId:string; title:string; category:Category; current:number; maximum:number; potentialGain:number; difficulty:Rule['difficulty']; explanation:string; evidence:Evidence[]; steps:string[]; importance:number }
export interface Report { id:string; analyzerVersion:string; ruleVersion:string; repository:Inspection['metadata']; sha:string; timestamp:string; profile:Profile; detectedProfile:Profile; score:number|null; tier:string; coverage:number; categories:{name:Category; maximum:number; awarded:number; coverage:number}[]; checks:Check[]; findings:Finding[]; improvements:Improvement[]; inspection:{inspected:string[]; skipped:Inspection['skipped']; unavailable:string[]; bytes:number; requests:number; treeComplete:boolean; truncated:boolean}; limitations:string[] }
function sortedPaths(i:Inspection) { return i.tree.filter(x=>x.type==='blob' && x.mode!=='120000' && !/(^|\/)(node_modules|vendor|dist|build|coverage|\.git|\.venv)\//i.test(x.path)).map(x=>x.path).sort(); }
function packageStatus(i:Inspection): boolean|null { const yes = sortedPaths(i).some(p=>/(^|\/)(package\.json|pyproject\.toml|cargo\.toml|go\.mod|requirements\.txt|pom\.xml|.*\.csproj)$/i.test(p)); return yes ? true : i.treeComplete ? false : null; }
export function detectProfile(i:Inspection):Profile {
  try { const pkg = JSON.parse(i.files['package.json'] || '{}'); if (pkg.bin) return 'cli'; if (pkg.exports || pkg.main || pkg.module) return 'library'; if (pkg.scripts?.start || pkg.scripts?.dev || pkg.dependencies?.react || pkg.dependencies?.next) return 'application'; } catch { /* malformed manifests are unverified */ }
  const paths = sortedPaths(i);
  if (i.treeComplete && paths.length > 0 && paths.every(p=>/\.(md|mdx|txt|rst|adoc|png|jpe?g|svg|gif|ya?ml|json|css|html)$|(^|\/)(license|\.gitignore)$/i.test(p)) && !paths.some(p=>/(^|\/)(package\.json|cargo\.toml|pyproject\.toml|go\.mod)$/.test(p))) return 'documentation';
  return 'general';
}
function evaluate(rule:Rule,i:Inspection,profile:Profile):Check {
  const paths = sortedPaths(i), root = evidenceUrl(i.metadata.fullName,i.sha);
  const evidence:Evidence[] = [];
  let state:State='unknown', ratio:number|null=null;
  let explanation = '';
  if (profile==='documentation' && (rule.scope==='code'||rule.scope==='package') || rule.id==='MNT03' && profile==='library') state='not-applicable';
  else if (['TST03','SEC04'].includes(rule.id) && i.treeComplete && !paths.some(p=>/^\.github\/workflows\/[^/]+\.ya?ml$/i.test(p))) state='not-applicable';
  else if (rule.scope==='package' && packageStatus(i)===false) state='not-applicable';
  else if (rule.scope==='package' && packageStatus(i)===null) state='unknown';
  else if (rule.method==='metadata') {
    const value = rule.content==='description' ? i.metadata.description.trim() : i.metadata.license && i.metadata.license!=='NOASSERTION';
    state=value ? 'pass':'fail'; ratio=value?1:0;
    evidence.push({path:null,url:root,status:'confirmed condition',confidence:'high'});
  } else {
    const matches = paths.filter(p=>new RegExp(rule.pattern!,'i').test(p));
    if (rule.method==='tree') {
      if (matches.length) { state='pass'; ratio=1; evidence.push(...matches.slice(0,3).map(path=>({path,url:evidenceUrl(i.metadata.fullName,i.sha,path),status:'confirmed condition' as const,confidence:'high' as const}))); }
      else if(i.treeComplete) { state='fail'; ratio=0; }
    } else {
      const known = matches.filter(p=>Object.hasOwn(i.files,p));
      const successful = known.filter(p=>new RegExp(rule.content!,'im').test(i.files[p]));
      // Multi-workflow checks require every recognized workflow to be readable.
      const multi = rule.id==='TST03'||rule.id==='SEC04';
      if (multi && (known.length < matches.length || !i.treeComplete)) {state='unknown';}
      else if (successful.length) { ratio=multi ? successful.length/matches.length:1; state=ratio===1?'pass':'partial'; }
      else if (matches.length===0 && i.treeComplete || known.length===matches.length && known.length>0 && i.treeComplete) { state='fail'; ratio=0; }
      for (const path of (successful.length?successful:known).slice(0,3)) {
        const lines=i.files[path].split('\n'), index=lines.findIndex(line=>new RegExp(rule.content!,'i').test(line));
        evidence.push({path,url:evidenceUrl(i.metadata.fullName,i.sha,path,index>=0?index+1:undefined),status:'confirmed condition',confidence:'high',...(index>=0?{lines:[index+1,index+1] as [number,number]}:{})});
      }
    }
  }
  if (!evidence.length && state!=='not-applicable') evidence.push({path:null,url:root,status:state==='unknown'?'insufficient evidence':'confirmed condition',confidence:state==='unknown'?'low':'high'});
  explanation = state==='unknown' ? 'Required evidence was not available. No pass, failure, or point gain is inferred.' : state==='not-applicable' ? 'Excluded for this repository profile or observed package structure.' : state==='pass' ? 'Recognized evidence satisfies this heuristic. It does not verify behavior or correctness.' : state==='partial' ? 'Only some inspected workflows satisfy this check.' : rule.method==='tree' ? 'No recognized matching path was found in the complete inspected tree.' : 'The inspected evidence does not satisfy this documented heuristic.';
  return {rule,state,ratio,awarded:null,maximum:null,evidence,explanation};
}
function apportion(values:number[],total:number):number[] {
  const sum=values.reduce((a,b)=>a+b,0); if(!sum)return values.map(()=>0);
  const exact=values.map(v=>v/sum*total), result=exact.map(Math.floor);
  let remaining=total-result.reduce((a,b)=>a+b,0);
  const order=exact.map((v,n)=>({n,remainder:v-result[n]})).sort((a,b)=>b.remainder-a.remainder||a.n-b.n);
  for(let n=0;n<remaining;n++) result[order[n].n]++;
  return result;
}
export function tier(score:number|null) {return score===null?'Insufficient evidence':score<200?'Digital Crime Scene':score<400?'Spaghetti Factory':score<600?'Held Together by Hope':score<750?'Certified Spaghetti':score<900?'Actually Pretty Solid':'Suspiciously Competent';}
export function analyze(i:Inspection,override?:Profile,timestamp=new Date().toISOString()):Report {
  const detectedProfile=detectProfile(i), profile=override||detectedProfile;
  const checks=RULES.map(rule=>evaluate(rule,i,profile));
  // Reallocate ineligible weights within categories, then across empty categories.
  const categories=Object.keys(WEIGHTS) as Category[];
  const active=categories.filter(c=>checks.some(x=>x.rule.category===c&&x.state!=='not-applicable'));
  const categoryBudgets=apportion(active.map(c=>WEIGHTS[c]),1000);
  const base=new Map<string,number>();
  active.forEach((c,index)=>{ const eligible=checks.filter(x=>x.rule.category===c&&x.state!=='not-applicable'); const weights=apportion(eligible.map(x=>x.rule.max),categoryBudgets[index]); eligible.forEach((x,n)=>base.set(x.rule.id,weights[n])); });
  const known=checks.filter(x=>x.ratio!==null);
  const knownWeight=known.reduce((s,x)=>s+(base.get(x.rule.id)||0),0), coverage=knownWeight/1000;
  // Unknown evidence is excluded from the conditional score, with its lost coverage explicit.
  const effective=apportion(known.map(x=>base.get(x.rule.id)||0),1000);
  known.forEach((x,n)=>{x.maximum=effective[n];x.awarded=Math.round(effective[n]*x.ratio!);});
  const score=coverage>=0.8 && known.length>=8 && new Set(known.map(x=>x.rule.category)).size>=3 ? known.reduce((s,x)=>s+x.awarded!,0):null;
  const findings:Finding[]=checks.filter(x=>x.state!=='pass'&&x.state!=='not-applicable').map(x=>({id:x.rule.id+'-'+i.sha.slice(0,12),ruleId:x.rule.id,category:x.rule.category,severity:x.rule.importance>=4?'warning':'info',title:x.rule.title,description:x.explanation,evidence:x.evidence,evidenceStatus:x.state==='unknown'?'insufficient evidence':'improvement suggestion',confidence:x.state==='unknown'?'low':'high',recommendedImprovement:x.rule.fix}));
  const improvements:Improvement[]=checks.filter(x=>x.state==='fail'||x.state==='partial').map(x=>({ruleId:x.rule.id,title:x.rule.title,category:x.rule.category,current:x.awarded!,maximum:x.maximum!,potentialGain:x.maximum!-x.awarded!,difficulty:x.rule.difficulty,explanation:x.rule.fix,evidence:x.evidence,steps:x.rule.steps,importance:x.rule.importance})).filter(x=>x.potentialGain>0).sort((a,b)=>b.importance-a.importance||b.potentialGain-a.potentialGain||(['Easy','Moderate','Advanced'].indexOf(a.difficulty)-['Easy','Moderate','Advanced'].indexOf(b.difficulty))||a.ruleId.localeCompare(b.ruleId));
  // License file and metadata are one implementation opportunity; preserve both rule contributions.
  const license=improvements.find(x=>x.ruleId==='STR01'), metadata=improvements.find(x=>x.ruleId==='MET02');
  if(license&&metadata){license.potentialGain+=metadata.potentialGain;license.current+=metadata.current;license.maximum+=metadata.maximum;license.title='Add a recognizable license (STR01 + MET02)';license.ruleId='STR01+MET02';improvements.splice(improvements.indexOf(metadata),1);}
  return {id:i.metadata.id+':'+i.sha+':'+ANALYZER_VERSION+':'+RULE_VERSION+':'+profile,analyzerVersion:ANALYZER_VERSION,ruleVersion:RULE_VERSION,repository:i.metadata,sha:i.sha,timestamp,profile,detectedProfile,score,tier:tier(score),coverage,categories:categories.map(name=>{const group=checks.filter(x=>x.rule.category===name), max=group.reduce((s,x)=>s+(base.get(x.rule.id)||0),0);return {name,maximum:group.reduce((s,x)=>s+(x.maximum||0),0),awarded:group.reduce((s,x)=>s+(x.awarded||0),0),coverage:max?group.filter(x=>x.ratio!==null).reduce((s,x)=>s+(base.get(x.rule.id)||0),0)/max:1};}),checks,findings,improvements,inspection:{inspected:Object.keys(i.files),skipped:i.skipped,unavailable:i.unavailable,bytes:i.bytes,requests:i.requests,treeComplete:i.treeComplete,truncated:i.truncated},limitations:['Heuristic repository health assessment; not a security audit or certification.','Files and configuration presence do not prove tests pass, code works, or software is secure.','Inspection is bounded. Unavailable evidence remains unknown. Pattern recognition may miss valid alternatives.','Profiles use different applicability and are not directly comparable. Correct the profile when appropriate.','Potential gains are conditional estimates. Repository changes can affect applicability, coverage, and other rules.','No repository code is executed. No AI services are used.']};
}
export function commentary(report:Report,ruleId:string,mode:'roast'|'serious'):string {
  const check=report.checks.find(x=>x.rule.id===ruleId.split('+')[0]);
  if(!check)return '';
  if(mode==='serious'||check.state==='unknown')return check.rule.fix;
  let hash=2166136261; for(const c of report.repository.id+report.sha+ruleId)hash=Math.imul(hash^c.charCodeAt(0),16777619);
  return check.rule.roast[(hash>>>0)%2];
}
