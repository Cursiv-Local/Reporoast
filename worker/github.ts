import { AppError, parseRepository } from '../src/shared/url';
export interface Metadata { id: number; fullName: string; description: string; language: string | null; defaultBranch: string; license: string | null; archived: boolean }
export interface Entry { path: string; type: string; sha: string; size?: number; mode: string }
export interface Inspection { metadata: Metadata; sha: string; tree: Entry[]; treeComplete: boolean; files: Record<string, string>; skipped: {path: string; reason: string}[]; unavailable: string[]; bytes: number; requests: number; truncated: boolean }
export const LIMITS = { files: 5000, selected: 24, fileBytes: 96000, bytes: 400000, requests: 30, timeout: 20000, responseBytes: 2000000 };
export interface GitHubResponseInfo { status:number; authenticated:boolean; remaining:number|null; limit:number|null; reset:number|null; retryAfter:string|null; resource:string|null; kind?:'primary'|'secondary'|'unclassified'; retryAt?:number }
function numberHeader(headers:Headers,name:string){const raw=headers.get(name);return raw!==null&&/^\d+$/.test(raw)&&Number.isSafeInteger(Number(raw))?Number(raw):null;}
export class GitHub {
  requests = 0;
  constructor(private token?: string, private fetcher: typeof fetch = fetch, private signal?: AbortSignal, private observe?:(info:GitHubResponseInfo)=>void, private beforeRequest?:()=>void) {}
  async get(path: string): Promise<any> {

    let url = new URL('https://api.github.com' + path);
    for (let hop = 0; hop < 4; hop++) {
      if (this.requests >= LIMITS.requests) throw new AppError('REQUEST_BUDGET', 'GitHub inspection request budget exhausted.', 422);
      this.beforeRequest?.();
      if (url.origin !== 'https://api.github.com' || !/^\/repos\/[a-z\d_.-]+\/[a-z\d_.-]+(?:\/|$)/i.test(url.pathname) && !/^\/repositories\/\d+(?:\/|$)/.test(url.pathname)) throw new AppError('UNSAFE_REDIRECT', 'GitHub returned an unsupported redirect.', 502);
      this.requests++;
      let response: Response;
      try { response = await this.fetcher.call(globalThis, url.toString(), {headers: {Accept:'application/vnd.github+json','User-Agent':'RepoRoast/0.1','X-GitHub-Api-Version':'2022-11-28',...(this.token ? {Authorization:'Bearer ' + this.token}: {})}, redirect:'manual', signal:this.signal}); }
      catch { throw new AppError('API_UNAVAILABLE', 'GitHub is unavailable or inspection timed out. Try again later.', 503); }
      const info:GitHubResponseInfo={status:response.status,authenticated:!!this.token,remaining:numberHeader(response.headers,'x-ratelimit-remaining'),limit:numberHeader(response.headers,'x-ratelimit-limit'),reset:numberHeader(response.headers,'x-ratelimit-reset'),retryAfter:response.headers.get('retry-after'),resource:response.headers.get('x-ratelimit-resource')};
      if ([301,302,307,308].includes(response.status)) {
        this.observe?.(info);
        const location = response.headers.get('location');
        if (!location) throw new AppError('API_UNAVAILABLE','Invalid GitHub redirect.',502);
        url = new URL(location, url); continue;
      }
      const reader = response.body?.getReader(); const chunks: Uint8Array[] = []; let size = 0;
      try { while (reader) { const next = await reader.read(); if (next.done) break; size += next.value.byteLength; if (size > LIMITS.responseBytes) { await reader.cancel(); throw new AppError('TOO_LARGE','Repository response exceeds inspection capacity.',422); } chunks.push(next.value); } }
      catch(error){if(error instanceof AppError)throw error;throw new AppError('API_UNAVAILABLE','GitHub evidence could not be read before the scan deadline.',503);}
      const data = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { data.set(chunk, offset); offset += chunk.length; }
      const text=new TextDecoder().decode(data);
      if(response.status===429 || response.status===403 && (info.remaining===0 || info.retryAfter!==null || /secondary rate limit|abuse detection|API rate limit exceeded/i.test(text))){
        info.kind=info.remaining===0?'primary':info.retryAfter!==null||/secondary rate limit|abuse detection/i.test(text)?'secondary':'unclassified';
        const retry=info.retryAfter===null?NaN:/^\d+$/.test(info.retryAfter)?Date.now()+Number(info.retryAfter)*1000:Date.parse(info.retryAfter);
        const deadline=(value:number)=>Number.isFinite(value)&&value<=8640000000000000?value:0;
        info.retryAt=Math.max(Date.now()+60000,deadline(retry),info.remaining===0&&info.reset?deadline(info.reset*1000):0);
        this.observe?.(info);
        throw new AppError('RATE_LIMITED','GitHub’s '+info.kind+' API limit was reached. Retry after '+new Date(info.retryAt).toISOString()+'. Recent cached reports may still be available.',429,info.retryAt,'github_'+info.kind);
      }
      this.observe?.(info);
      if(response.status===401)throw new AppError('GITHUB_AUTHENTICATION','GitHub rejected the service credential. The operator must update its server-side token.',503,undefined,'github_authentication');
      if(response.status===404)throw new AppError('NOT_FOUND','Repository not found. It may be private; only public repositories are supported.',404);
      if(response.status===409)throw new AppError('EMPTY_REPOSITORY','This repository has no analyzable commit yet.',422);
      if(!response.ok)throw new AppError('API_UNAVAILABLE','GitHub could not provide the requested evidence.',502);
      try{return JSON.parse(text);}catch{throw new AppError('API_UNAVAILABLE','GitHub returned invalid data.',502);}
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
    const valid=data.tree.filter((e:any)=>e&&typeof e.path==='string'&&e.path.length<=4096&&!/[\\\x00-\x1f]/.test(e.path)&&!e.path.startsWith('/')&&!e.path.split('/').some((p:string)=>p==='..'||p==='.')&&/^[a-f0-9]{40}$/.test(e.sha)&&['blob','tree','commit'].includes(e.type)&&['100644','100755','040000','120000','160000'].includes(e.mode));
    const incomplete=!!data.truncated||data.tree.length>LIMITS.files||valid.length!==data.tree.length;
    const inspection: Inspection = {metadata, sha:commit.sha, tree:valid.slice(0,LIMITS.files), treeComplete:!incomplete, files:{}, skipped:valid.length!==data.tree.length?[{path:'[invalid tree entry]',reason:'Malformed API entries excluded; absence cannot be established.'}]:[], unavailable:[], bytes:0, requests:this.requests, truncated:incomplete};
    const candidates = inspection.tree.filter((entry: Entry) => entry.type === 'blob').sort((a: Entry,b: Entry) => priority(b.path)-priority(a.path) || (a.path<b.path?-1:a.path>b.path?1:0));
    const visited = new Set<string>(), referenced = new Set<string>(); let sampledTests = 0;
    for (const entry of candidates) {
      if (visited.has(entry.path)) continue;
      visited.add(entry.path);
      let reason = '';
      if (entry.mode === '120000' || entry.mode === '160000') reason = 'Symlink or submodule';
      else if (/(^|\/)(node_modules|vendor|dist|build|coverage|\.git|\.venv|venv|__pycache__)\//i.test(entry.path) || /(?:\.min\.[cm]?js|\.map|\.lockb|\.(png|jpe?g|gif|pdf|zip|wasm|svg))$/i.test(entry.path)) reason = 'Dependency, generated, or binary';
      else if ((entry.size ?? LIMITS.fileBytes + 1) > LIMITS.fileBytes) reason = 'Individual file size cap';
      else if (priority(entry.path) === 0 && !referenced.has(entry.path)) reason = 'Outside selected evidence scope';
      else if (priority(entry.path) === 1 && sampledTests++ >= 4) reason = 'Representative test sample cap';
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
        // Follow only bounded literal local script references from inspected configuration/docs.
        // Scripts are read, never invoked; insertion uses the existing bounded tree allowlist.
        if (priority(entry.path) >= 4) {
          const refs = [...inspection.files[entry.path].matchAll(/(?:python[\d.]*|node|bash|sh)\s+(?:\.\/)?([\w/.-]+\.(?:py|[cm]?js|sh))\b/g)].slice(0,4);
          for (const match of refs) {
            const target = inspection.tree.find(e=>e.path===match[1]&&e.type==='blob');
            if (target && !visited.has(target.path)) {
              referenced.add(target.path);
              const position = candidates.indexOf(entry);
              candidates.splice(position+1,0,{...target});
            }
          }
        }
      } catch (error) { if (this.signal?.aborted || error instanceof AppError && ['RATE_LIMITED','REQUEST_BUDGET','GITHUB_AUTHENTICATION'].includes(error.code)) throw error; inspection.unavailable.push(entry.path); }
    }
    inspection.requests = this.requests;
    return inspection;
  }
}
export function priority(path: string) {
  if (/^(readme(?:\.[\w-]+)?|package\.json|pyproject\.toml|Cargo\.toml|go\.mod|requirements[^/]*\.(?:txt|in))$/i.test(path)) return 6;
  if (/^\.github\/workflows\/[^/]+\.ya?ml$/.test(path) || /^(?:\.github\/)?(?:contributing|security)(?:\.md)?$/i.test(path) || /^(?:license|licence|copying)(?:\.[\w-]+)?$|^\.gitignore$/i.test(path)) return 5;
  if (/^(?:requirements[^/]*\.lock|poetry\.lock|uv\.lock|Pipfile\.lock|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lock|Cargo\.lock|go\.sum|CHANGELOG\.md|CHANGES\.md|HISTORY\.md|\.prettierrc.*|\.editorconfig|(?:eslint|prettier)\.config\.[cm]?[jt]s|\.eslintrc.*|\.?ruff\.toml|rustfmt\.toml|\.rustfmt\.toml|clippy\.toml|\.golangci\.ya?ml|biome\.jsonc?|mypy\.ini|\.flake8|setup\.cfg|\.renovaterc(?:\.json)?|renovate\.json5?)$/.test(path) || /^\.github\/dependabot\.ya?ml$/.test(path)) return 4;
  if (/^\.github\/ISSUE_TEMPLATE\/[^/]+\.(md|ya?ml)$/.test(path)) return 3;
  if (/^(?:tests?|spec|__tests__)\/.*\.(py|[cm]?[jt]sx?|go|rs)$|(?:^|\/)test_[^/]+\.py$|[._](?:test|spec)\.[^/]+$|_test\.go$/.test(path)) return 1;
  return 0;
}
