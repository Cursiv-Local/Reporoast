import { describe,it,expect } from 'vitest';
import { analyze } from '../src/shared/engine';
import { VALIDATION } from './fixtures/validation';
describe('manually labeled cross-repository matrix',()=>{
 for(const fixture of VALIDATION)describe(fixture.name,()=>{
  const report=analyze(fixture.after,fixture.profile,'fixed');
  if(fixture.expectedProfile)it('detects the expected profile',()=>expect(report.detectedProfile).toBe(fixture.expectedProfile));
  for(const [id,state] of Object.entries(fixture.expected))it(id+' = '+state,()=>expect(report.checks.find(c=>c.rule.id===id)!.state).toBe(state));
  it('repeats score, range, gains and evidence for a fixed snapshot',()=>expect(analyze(fixture.after,fixture.profile,'fixed')).toEqual(report));
 });
});
