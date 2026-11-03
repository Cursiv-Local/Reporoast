// Live cross-repository validation using the production inspector and engine.
// Usage: GITHUB_TOKEN=$(gh auth token) node scripts/validate-live.mjs [--repeat]
// Records derived results only (states, scores, coverage); no repository file contents are written.
// The token is read from the environment for this process only and is never persisted.
import { createServer } from 'vite';
import { mkdir, writeFile } from 'node:fs/promises';

export const LIVE_REPOSITORIES = [
  ['Cursiv-Local/Cursiv', 'Python desktop application'],
  ['octocat/Hello-World', 'Minimal placeholder'],
  ['kelseyhightower/nocode', 'Intentionally empty joke project'],
  ['psf/requests', 'Python library'],
  ['pallets/click', 'Python CLI library'],
  ['karpathy/nanoGPT', 'Research / ML scripts'],
  ['expressjs/express', 'JavaScript library'],
  ['sindresorhus/ky', 'TypeScript library'],
  ['BurntSushi/ripgrep', 'Rust CLI'],
  ['spf13/cobra', 'Go library'],
  ['sinatra/sinatra', 'Ruby library'],
  ['slimphp/Slim', 'PHP framework'],
  ['google/gson', 'Java library'],
  ['JamesNK/Newtonsoft.Json', 'C# library'],
  ['Alamofire/Alamofire', 'Swift library'],
  ['sindresorhus/awesome', 'Documentation list'],
  ['mathiasbynens/dotfiles', 'Configuration / dotfiles'],
  ['torvalds/linux', 'Very large tree (failure-mode check)'],
];

const token = process.env.GITHUB_TOKEN;
if (!token) { console.error('Set GITHUB_TOKEN (for example from `gh auth token`). It is never written to disk.'); process.exit(1); }
const repeat = process.argv.includes('--repeat');
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' });
try {
  const { GitHub } = await server.ssrLoadModule('/worker/github.ts');
  const { analyze, RULE_VERSION, ANALYZER_VERSION } = await server.ssrLoadModule('/src/shared/engine.ts');
  const results = [];
  for (const [fullName, kind] of LIVE_REPOSITORIES) {
    const runs = [];
    for (let n = 0; n < (repeat ? 2 : 1); n++) {
      const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 20000);
      const github = new GitHub(token, fetch, controller.signal);
      try {
        const metadata = await github.metadata(fullName);
        const inspection = await github.inspect(metadata);
        const r = analyze(inspection, undefined, 'live');
        runs.push({ sha: r.sha, profile: r.detectedProfile, score: r.score, coverage: Math.round(r.coverage * 1000) / 1000, range: r.scoreRange, requests: inspection.requests, treeComplete: inspection.treeComplete, inspected: Object.keys(inspection.files).length, unavailable: inspection.unavailable.length, states: Object.fromEntries(r.checks.map(c => [c.rule.id, c.state + (c.state === 'partial' ? ':' + c.ratio.toFixed(2) : '')])), explanations: Object.fromEntries(r.checks.filter(c => c.state === 'fail' || c.state === 'unknown').map(c => [c.rule.id, c.explanation])) });
      } catch (error) {
        runs.push({ error: error.code || 'ERROR', message: String(error.message).slice(0, 200), requests: github.requests });
      } finally { clearTimeout(timer); }
    }
    const [first, second] = runs;
    const stable = !second || JSON.stringify({ ...first, requests: 0 }) === JSON.stringify({ ...second, requests: 0 });
    results.push({ repository: fullName, kind, ...first, ...(repeat ? { stableAcrossRuns: stable } : {}) });
    console.log(fullName.padEnd(26), (first.error || first.profile).padEnd(14), String(first.score ?? '—').padStart(5), first.coverage !== undefined ? (first.coverage * 100).toFixed(1) + '%' : '', repeat ? (stable ? 'stable' : 'UNSTABLE') : '');
  }
  await mkdir('docs/validation', { recursive: true });
  await writeFile('docs/validation/live-results.json', JSON.stringify({ analyzerVersion: ANALYZER_VERSION, ruleVersion: RULE_VERSION, capturedAt: new Date().toISOString(), note: 'Live default-branch snapshots. Results are derived states only; re-running later analyzes newer commits.', results }, null, 2) + '\n');
} finally { await server.close(); }
