// Generates staging-only service secrets. Local backup is Git-ignored.
// Never imports GitHub login credentials or changes a Cloudflare plan.
import { readFile, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
const file = '.dev.vars.staging';
let secrets;
try {
  const text = await readFile(file, 'utf8');
  secrets = Object.fromEntries(['IP_HASH_SECRET', 'ADMIN_TOKEN'].map(name => {
    const value = text.match(new RegExp('^' + name + '="([a-f0-9]{64})"$', 'm'))?.[1];
    if (!value) throw new Error('Existing staging secret file has an unexpected format; refusing to replace it.');
    return [name, value];
  }));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
  secrets = { IP_HASH_SECRET: randomBytes(32).toString('hex'), ADMIN_TOKEN: randomBytes(32).toString('hex') };
  await writeFile(file, Object.entries(secrets).map(([key, value]) => key + '="' + value + '"').join('\n') + '\n', { flag: 'wx', mode: 0o600 });
}
const result = spawnSync(process.execPath, ['node_modules/wrangler/bin/wrangler.js', 'secret', 'bulk', '--env', 'staging'], { input: JSON.stringify(secrets), encoding: 'utf8', env: { ...process.env, WRANGLER_SEND_METRICS: 'false' } });
process.stdout.write(result.stdout || '');
process.stderr.write(result.stderr || '');
if (result.status !== 0) process.exit(result.status || 1);
console.log('Staging secrets configured. Local backup remains in Git-ignored .dev.vars.staging; values were not printed.');
