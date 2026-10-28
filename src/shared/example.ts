import { analyze } from './engine';
import type { Inspection } from '../../worker/github';
export function exampleInspection():Inspection {
 const files:Record<string,string>={'README.md':'# Kindling\nA fictional example application.\n## Installation\nnpm ci\n## Usage\nnpm start\n## Testing\nnpm test\n## Limitations\nThis is illustrative.','package.json':'{"scripts":{"dev":"vite","test":"vitest"}}','.github/workflows/test.yml':'name: Verify\npermissions: read-all\njobs:\n  test:\n    steps:\n      - run: npm test','.gitignore':'node_modules/\n.env\ndist/','LICENSE':'Illustrative license text','src/main.ts':'// illustrative','tests/main.test.ts':'// illustrative','.prettierrc':'{}','package-lock.json':'{}','CONTRIBUTING.md':'Contribution guide'};
 return {metadata:{id:0,fullName:'example/kindling',description:'A fictional project demonstrating an evidence-backed report.',language:'TypeScript',defaultBranch:'main',license:'MIT',archived:false},sha:'a'.repeat(40),tree:Object.keys(files).map((path,n)=>({path,type:'blob',sha:String(n).padStart(40,'0'),mode:'100644',size:files[path].length})),treeComplete:true,files,skipped:[],unavailable:[],bytes:500,requests:0,truncated:false};
}
export const EXAMPLE = analyze(exampleInspection(),undefined,'2026-10-28T12:00:00.000Z');
