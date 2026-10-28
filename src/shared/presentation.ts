// Browser presentation is independent of parsing, inspection and payments.
import type {Report} from './engine';
export type {Report,Profile} from './engine';
export const PROFILES=['library','application','cli','documentation','general'] as const;
export const WEIGHTS={'Documentation':200,'Testing and CI':200,'Project Structure':150,'Security Hygiene':150,'Maintainability':150,'Contributor Readiness':100,'Repository Metadata':50};
export function commentary(report:Report,ruleId:string,mode:'roast'|'serious'){
 const check=report.checks.find(c=>c.rule.id===ruleId.split('+')[0]);if(!check)return '';
 if(mode==='serious'||check.state==='unknown')return check.rule.fix;
 let hash=2166136261;for(const c of report.repository.id+report.sha+ruleId)hash=Math.imul(hash^c.charCodeAt(0),16777619);
 return check.rule.roast[(hash>>>0)%2];
}
