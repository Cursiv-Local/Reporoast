export class AppError extends Error {
  constructor(public code: string, message: string, public status = 400) { super(message); }
}
export function parseRepository(input: string): { owner: string; name: string; fullName: string } {
  if (typeof input !== 'string' || input.length > 300 || /[%\\\x00-\x20]/.test(input.trim())) throw new AppError('INVALID_URL', 'Enter a public github.com/owner/repository URL.');
  let url: URL;
  try { url = new URL(input.trim()); } catch { throw new AppError('INVALID_URL', 'Enter a complete https://github.com/owner/repository URL.'); }
  if (url.protocol !== 'https:' || url.hostname !== 'github.com' || url.port || url.username || url.password || url.search || url.hash) throw new AppError('INVALID_URL', 'Only HTTPS GitHub repository URLs without query strings are supported.');
  const parts = url.pathname.replace(/\/$/, '').split('/');
  if (parts.length !== 3) throw new AppError('INVALID_URL', 'Use the repository URL, without a file, branch, or issue path.');
  const owner = parts[1], name = parts[2].replace(/\.git$/, '');
  if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(owner) || !/^[a-z\d_.-]{1,100}$/i.test(name) || ['.', '..'].includes(name) || ['settings','features','topics','collections','marketplace','orgs','users','login','explore','search','sponsors','notifications'].includes(owner.toLowerCase())) throw new AppError('INVALID_URL', 'Invalid GitHub owner or repository identifier.');
  return { owner, name, fullName: owner + '/' + name };
}
export function evidenceUrl(fullName: string, sha: string, path?: string, line?: number) {
  const base = 'https://github.com/' + fullName + (path ? '/blob/' : '/tree/') + sha;
  return base + (path ? '/' + path.split('/').map(encodeURIComponent).join('/') : '') + (line ? '#L' + line : '');
}
