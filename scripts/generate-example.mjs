import {createServer} from 'vite';
import {writeFile} from 'node:fs/promises';
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
try{
 const {analyze}=await server.ssrLoadModule('/src/shared/engine.ts');
 const {exampleInspection}=await server.ssrLoadModule('/src/shared/example.ts');
 const {README}=await server.ssrLoadModule('/tests/fixtures/validation.ts');
 const i=exampleInspection();
 i.files['README.md']=README+'\n## Testing\nRun `npm test` before contributing changes.\n';
 i.files['.github/workflows/test.yml']='on: [push]\npermissions: {contents: read}\njobs:\n  verify:\n    runs-on: ubuntu-latest\n    steps:\n      - run: npm test\n';
 i.files['tests/main.test.ts']="test('illustrative example', () => { expect(true).toBe(true); });";
 i.files['.prettierrc']='{"singleQuote":true}';
 i.files['CONTRIBUTING.md']='# Contributing\n'+README+'\nRun `npm test` before proposing a change, describe the behavior you verified and keep the review focused on that change.\n';
 for(const entry of i.tree)entry.size=i.files[entry.path]?.length||entry.size;
 i.bytes=Object.values(i.files).reduce((s,t)=>s+Buffer.byteLength(t),0);
 await writeFile('src/shared/example-report.json',JSON.stringify(analyze(i,undefined,'2026-10-28T12:00:00.000Z'),null,2));
}finally{await server.close();}
