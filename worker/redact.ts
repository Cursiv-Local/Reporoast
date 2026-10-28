export function redact(value:string) { return value
  .replace(/(?:gh[pousr]_[A-Za-z0-9_]{16,}|github_pat_[A-Za-z0-9_]{16,}|AKIA[A-Z0-9]{16})/g,'[REDACTED]')
  .replace(/-----BEGIN[ A-Z]*PRIVATE KEY-----[\s\S]*?(?:-----END[ A-Z]*PRIVATE KEY-----|$)/g,'[REDACTED]')
  .replace(/\b(?:password|secret|token|api[_-]?key)\s*[:=]\s*["']?[^\s"',;]{8,}/gi,'[REDACTED]')
  .replace(/https?:\/\/[^\s/@]+:[^\s/@]+@[^\s]+/g,'[REDACTED]');
}
export function safePath(path:string){ return redact(path).slice(0,300); }

import type { Report } from '../src/shared/engine';
import { evidenceUrl } from '../src/shared/url';
export function sanitizeReport(report:Report):Report {
 const result=structuredClone(report);
 const evidenceLists=[...result.checks.map(c=>c.evidence),...result.findings.map(c=>c.evidence),...result.improvements.map(c=>c.evidence)];
 for(const list of evidenceLists)for(const e of list)if(e.path&&redact(e.path)!==e.path){e.path=null;e.url=evidenceUrl(result.repository.fullName,result.sha);delete e.lines;e.status='potential concern';e.confidence='low';}
 function walk(value:unknown):unknown { if(typeof value==='string')return redact(value);if(Array.isArray(value))return value.map(walk);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,walk(v)]));return value; }
 return walk(result) as Report;
}
