import { Facts } from './inspection-facts';
import { V2_RULES, evaluateRule } from './rules-v2';
import type { Inspection } from '../../worker/github';
import { evidenceUrl } from './url';
export const ANALYZER_VERSION = '0.2.0';
export const RULE_VERSION = '2.0.0';
export const PROFILES = ['library','application','cli','documentation','general'] as const;
export type Profile = typeof PROFILES[number];
export type Category = 'Documentation'|'Testing and CI'|'Project Structure'|'Security Hygiene'|'Maintainability'|'Contributor Readiness'|'Repository Metadata';
export const WEIGHTS: Record<Category,number> = {'Documentation':200,'Testing and CI':200,'Project Structure':150,'Security Hygiene':150,'Maintainability':150,'Contributor Readiness':100,'Repository Metadata':50};
export type State = 'pass'|'partial'|'fail'|'unknown'|'not-applicable';
export interface Evidence { path: string | null; url: string; status: 'confirmed condition'|'potential concern'|'improvement suggestion'|'insufficient evidence'; confidence: 'high'|'medium'|'low'; level?: 'presence'|'configuration'|'invocation'|'execution'|'verified-behavior'|'metadata'; lines?: [number,number] }
export interface Rule { id:string; category:Category; title:string; max:number; method:'tree'|'content'|'metadata'; pattern?:string; content?:string; scope?:'code'|'package'|'typescript'|'cli'; fix:string; steps:string[]; difficulty:'Easy'|'Moderate'|'Advanced'; importance:number; roast:[string,string]; version:string }
export const RULES = V2_RULES;
export interface Check { rule:Rule; state:State; ratio:number|null; awarded:number|null; maximum:number|null; evidence:Evidence[]; explanation:string; level?: Evidence['level'] }
export interface Finding { id:string; ruleId:string; category:Category; severity:'warning'|'info'; title:string; description:string; evidence:Evidence[]; evidenceStatus:Evidence['status']; confidence:Evidence['confidence']; recommendedImprovement:string }
export interface Improvement { ruleId:string; title:string; category:Category; current:number; maximum:number; potentialGain:number; difficulty:Rule['difficulty']; explanation:string; evidence:Evidence[]; steps:string[]; importance:number }
export interface Report { id:string; analyzerVersion:string; ruleVersion:string; repository:Inspection['metadata']; sha:string; timestamp:string; profile:Profile; detectedProfile:Profile; score:number|null; tier:string; coverage:number; categories:{name:Category; maximum:number; awarded:number; coverage:number}[]; checks:Check[]; findings:Finding[]; improvements:Improvement[]; inspection:{inspected:string[]; skipped:Inspection['skipped']; unavailable:string[]; bytes:number; requests:number; treeComplete:boolean; truncated:boolean}; limitations:string[]; scoreRange?:{minimum:number;maximum:number}; evidenceSummary?:{structuralOnly:true;executionChecks:0;verifiedBehaviorChecks:0}; diagnostics?:string[] }
export function detectProfile(i:Inspection):Profile { return new Facts(i).profile(); }
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
  const facts=new Facts(i);
  const checks=RULES.map(rule=>evaluateRule(rule,facts,profile));
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
  const findings:Finding[]=checks.filter(x=>x.state!=='pass'&&x.state!=='not-applicable').map(x=>({id:x.rule.id+'-'+i.sha.slice(0,12),ruleId:x.rule.id,category:x.rule.category,severity:x.rule.importance>=4?'warning':'info',title:x.rule.title,description:x.explanation,evidence:x.evidence,evidenceStatus:x.state==='unknown'?'insufficient evidence':'improvement suggestion',confidence:x.state==='unknown'?'low':'medium',recommendedImprovement:x.rule.fix}));
  const improvements:Improvement[]=checks.filter(x=>x.state==='fail'||x.state==='partial').map(x=>({ruleId:x.rule.id,title:x.rule.title,category:x.rule.category,current:x.awarded!,maximum:x.maximum!,potentialGain:x.maximum!-x.awarded!,difficulty:x.rule.difficulty,explanation:x.rule.fix,evidence:x.evidence,steps:[x.rule.fix,"Review "+x.evidence.map(e=>e.path||"the analyzed commit tree").join(", ")+" using the documented "+(facts.ecosystems.join("/")||"project")+" tools. Paths are evidence, not invented patch targets.","Run verification yourself, commit changes and rescan. Applicability and other rules may change."],importance:x.rule.importance})).filter(x=>x.potentialGain>0).sort((a,b)=>b.importance-a.importance||b.potentialGain-a.potentialGain||(['Easy','Moderate','Advanced'].indexOf(a.difficulty)-['Easy','Moderate','Advanced'].indexOf(b.difficulty))||a.ruleId.localeCompare(b.ruleId));
  const minimum=known.reduce((s,c)=>s+Math.round((base.get(c.rule.id)||0)*c.ratio!),0);
  return {id:i.metadata.id+':'+i.sha+':'+ANALYZER_VERSION+':'+RULE_VERSION+':'+profile,analyzerVersion:ANALYZER_VERSION,ruleVersion:RULE_VERSION,repository:i.metadata,sha:i.sha,timestamp,profile,detectedProfile,score,scoreRange:{minimum,maximum:minimum+1000-knownWeight},evidenceSummary:{structuralOnly:true,executionChecks:0,verifiedBehaviorChecks:0},diagnostics:['GitHub license recognition and community conduct policies are informational and unscored.'],tier:tier(score),coverage,categories:categories.map(name=>{const group=checks.filter(x=>x.rule.category===name), max=group.reduce((s,x)=>s+(base.get(x.rule.id)||0),0);return {name,maximum:group.reduce((s,x)=>s+(x.maximum||0),0),awarded:group.reduce((s,x)=>s+(x.awarded||0),0),coverage:max?group.filter(x=>x.ratio!==null).reduce((s,x)=>s+(base.get(x.rule.id)||0),0)/max:1};}),checks,findings,improvements,inspection:{inspected:Object.keys(i.files),skipped:i.skipped,unavailable:i.unavailable,bytes:i.bytes,requests:i.requests,treeComplete:i.treeComplete,truncated:i.truncated},limitations:['Structural practices score only; not a security audit, certification or behavior verification.','Files and configuration presence do not prove tests pass, code works, or software is secure.','Inspection is bounded. Unavailable evidence remains unknown. Pattern recognition may miss valid alternatives.','Profiles use different applicability and are not directly comparable. Correct the profile when appropriate.','Potential gains are conditional estimates. Repository changes can affect applicability, coverage, and other rules.','No tests, builds or repository commands were executed. Execution/verified-behavior coverage is zero. No AI or payment status affects scoring.']};
}
export function commentary(report:Report,ruleId:string,mode:'roast'|'serious'):string {
  const check=report.checks.find(x=>x.rule.id===ruleId.split('+')[0]);
  if(!check)return '';
  if(mode==='serious'||check.state==='unknown')return check.rule.fix;
  let hash=2166136261; for(const c of report.repository.id+report.sha+ruleId)hash=Math.imul(hash^c.charCodeAt(0),16777619);
  return check.rule.roast[(hash>>>0)%2];
}
