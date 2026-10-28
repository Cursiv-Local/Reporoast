import { AppError, parseRepository } from '../src/shared/url';
export interface Metadata { id: number; fullName: string; description: string; language: string | null; defaultBranch: string; license: string | null; archived: boolean }
export interface Entry { path: string; type: string; sha: string; size?: number; mode: string }
export interface Inspection { metadata: Metadata; sha: string; tree: Entry[]; treeComplete: boolean; files: Record<string, string>; skipped: {path: string; reason: string}[]; unavailable: string[]; bytes: number; requests: number; truncated: boolean }
export const LIMITS = { files: 5000, selected: 24, fileBytes: 48000, bytes: 400000, requests: 30, timeout: 20000, responseBytes: 2000000 };
export class GitHub {
  requests = 0;
  constructor(private token?: string, private fetcher: typeof fetch = fetch, private signal?: AbortSignal) {}
  async get(path: string): Promise<any> {

    let url = new URL('https://api.github.com' + path);
    for (let hop = 0; hop < 4; hop++) {
      if (this.requests >= LIMITS.requests) throw new AppError('REQUEST_BUDGET', 'GitHub inspection request budget exhausted.', 422);
      this.requests++;
      if (url.origin !== 'https://api.github.com' || !/^\/repos\/[a-z\d_.-]+\/[a-z\d_.-]+(?:\/|$)/i.test(url.pathname) && !/^\/repositories\/\d+(?:\/|$)/.test(url.pathname)) throw new AppError('UNSAFE_REDIRECT', 'GitHub returned an unsupported redirect.', 502);
      let response: Response;
      try { response = await this.fetcher.call(globalThis, url.toString(), {headers: {Accept:'application/vnd.github+json','User-Agent':'RepoRoast/0.1','X-GitHub-Api-Version':'2022-11-28',...(this.token ? {Authorization:'Bearer ' + this.token}: {})}, redirect:'manual', signal:this.signal}); }
      catch { throw new AppError('API_UNAVAILABLE', 'GitHub is unavailable or inspection timed out. Try again later.', 503); }
      if ([301,302,307,308].includes(response.status)) {
        const location = response.headers.get('location');
        if (!location) throw new AppError('API_UNAVAILABLE','Invalid GitHub redirect.',502);
        url = new URL(location, url); continue;
      }
      if (response.status === 404) throw new AppError('NOT_FOUND', 'Repository not found. It may be private; only public repositories are supported.', 404);
      if (response.status === 429 || response.status === 403 && (response.headers.get('x-ratelimit-remaining') === '0' || response.headers.has('retry-after'))) throw new AppError('RATE_LIMITED','GitHub API rate limit reached. Try again later.',429);
      if (response.status === 409) throw new AppError('EMPTY_REPOSITORY','This repository has no analyzable commit yet.',422);
      if (!response.ok) throw new AppError('API_UNAVAILABLE','GitHub could not provide the requested evidence.',502);
      const reader = response.body?.getReader(); const chunks: Uint8Array[] = []; let size = 0;
      if (!reader) throw new AppError('API_UNAVAILABLE','GitHub returned an empty response.',502);
      while (true) { const next = await reader.read(); if (next.done) break; size += next.value.byteLength; if (size > LIMITS.responseBytes) { await reader.cancel(); throw new AppError('TOO_LARGE','Repository response exceeds inspection capacity.',422); } chunks.push(next.value); }
      const data = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { data.set(chunk, offset); offset += chunk.length; }
      try { return JSON.parse(new TextDecoder().decode(data)); } catch { throw new AppError('API_UNAVAILABLE','GitHub returned invalid data.',502); }
    }
    throw new AppError('UNSAFE_REDIRECT','Too many GitHub redirects.',502);
  }
  async metadata(fullName: string): Promise<Metadata> {
    const data = await this.get('/repos/' + fullName);
    if (data.private !== false) throw new AppError('PRIVATE_REPOSITORY','Only public repositories can be analyzed.',403);
    const canonical = parseRepository('https://github.com/' + data.full_name).fullName;
    if (!Number.isSafeInteger(data.id) || typeof data.default_branch !== 'string') throw new AppError('UNSUPPORTED_STRUCTURE','Repository metadata is incomplete.',422);
    return {id:data.id, fullName:canonical, description:String(data.description || '').slice(0,500), language:data.language || null, defaultBranch:data.default_branch, license:data.license?.spdx_id || null, archived:!!data.archived};
  }
  async inspect(metadata: Metadata, resolvedCommit?: any): Promise<Inspection> {
    const base = '/repos/' + metadata.fullName;
    const commit = resolvedCommit || await this.get(base + '/commits/' + encodeURIComponent(metadata.defaultBranch));
    if (!/^[a-f0-9]{40}$/.test(commit.sha) || !/^[a-f0-9]{40}$/.test(commit.commit?.tree?.sha)) throw new AppError('UNSUPPORTED_STRUCTURE','GitHub did not return an exact commit and tree.',422);
    const data = await this.get(base + '/git/trees/' + commit.commit.tree.sha + '?recursive=1');
    if (!Array.isArray(data.tree)) throw new AppError('UNSUPPORTED_STRUCTURE','GitHub did not return a repository tree.',422);
    const inspection: Inspection = {metadata, sha:commit.sha, tree:data.tree.slice(0,LIMITS.files), treeComplete:!data.truncated && data.tree.length <= LIMITS.files, files:{}, skipped:[], unavailable:[], bytes:0, requests:this.requests, truncated:!!data.truncated || data.tree.length > LIMITS.files};
    const candidates = inspection.tree.filter((entry: Entry) => entry.type === 'blob').sort((a: Entry,b: Entry) => priority(b.path)-priority(a.path) || a.path.localeCompare(b.path, 'en'));
    for (const entry of candidates) {
      let reason = '';
      if (entry.mode === '120000' || entry.mode === '160000') reason = 'Symlink or submodule';
      else if (/(^|\/)(node_modules|vendor|dist|build|coverage|\.git|\.venv)\//i.test(entry.path) || /(?:\.min\.[cm]?js|\.map|\.lock|\.(png|jpe?g|gif|pdf|zip|wasm|svg))$/i.test(entry.path)) reason = 'Dependency, generated, lockfile content, or binary';
      else if ((entry.size ?? LIMITS.fileBytes + 1) > LIMITS.fileBytes) reason = 'Individual file size cap';
      else if (priority(entry.path) === 0) reason = 'Outside selected evidence scope';
      else if (Object.keys(inspection.files).length + inspection.unavailable.length >= LIMITS.selected || inspection.bytes + (entry.size || 0) > LIMITS.bytes) reason = 'Inspection budget';
      if (reason) { inspection.skipped.push({path:entry.path,reason}); continue; }
      try {
        if (!/^[a-f0-9]{40}$/.test(entry.sha)) throw new Error('Invalid blob');
        const blob = await this.get(base + '/git/blobs/' + entry.sha);
        if (blob.encoding !== 'base64' || typeof blob.content !== 'string' || blob.content.length > LIMITS.fileBytes * 1.5) throw new Error('Unsupported blob');
        const raw = Uint8Array.from(atob(blob.content.replace(/\s/g,'')), c => c.charCodeAt(0));
        if (raw.byteLength > LIMITS.fileBytes || inspection.bytes + raw.byteLength > LIMITS.bytes) throw new Error('Size cap');
        inspection.bytes += raw.byteLength;
        inspection.files[entry.path] = new TextDecoder('utf-8',{fatal:true}).decode(raw);
      } catch (error) { if (this.signal?.aborted || error instanceof AppError && ['RATE_LIMITED','REQUEST_BUDGET'].includes(error.code)) throw error; inspection.unavailable.push(entry.path); }
    }
    inspection.requests = this.requests;
    return inspection;
  }
}
function priority(path: string) {
  if (/^(readme(?:\.[\w-]+)?|package\.json|pyproject\.toml|cargo\.toml|go\.mod)$/i.test(path)) return 4;
  if (/^\.github\/workflows\/[^/]+\.ya?ml$/i.test(path)) return 3;
  if (/(^|\/)(security|contributing|code_of_conduct|license|changelog)(\.[\w-]+)?$/i.test(path) || /(?:eslint|prettier|tsconfig|editorconfig|dependabot|renovate|vitest|pytest|jest|gitignore)/i.test(path)) return 2;
  return 0;
}
