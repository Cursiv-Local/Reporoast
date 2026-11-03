// Regressions for false negatives found by live validation (scripts/validate-live.mjs, rules 2.1.0).
// Each case mirrors a structure observed in a real public repository; see docs/REPOROAST-HANDOFF.md.
import { describe, expect, it } from 'vitest';
import { analyze } from '../src/shared/engine';
import { GitHub } from '../worker/github';
import type { Inspection } from '../worker/github';
import { make, README, CI } from './fixtures/validation';

const check = (i: Inspection, id: string) => analyze(i, undefined, 'fixed').checks.find(c => c.rule.id === id)!;
const state = (files: Record<string, string>, id: string) => check(make(files), id).state;
const src = { 'README.md': README, 'src/app.py': 'print(1)\n' };

describe('recognition gaps observed in live repositories', () => {
  it('recognizes prompted commands in README verification docs (ripgrep)', () => {
    expect(state({ ...src, 'README.md': README + '\n## Testing\n\n```\n$ cargo test --all\n```\n' }, 'TST04')).toBe('pass');
  });
  it.each([
    ['uv run --locked --no-default-groups --group dev tox run', 'pass'], // click
    ['tox -e py312', 'pass'],
    ['tox -e lint', 'unknown'],
    ['make test', 'pass'],
    ['make docs', 'unknown'],
  ])('traces %s as %s', (run, expected) => expect(state({ ...src, '.github/workflows/ci.yml': CI(run) }, 'TST03')).toBe(expected));
  it('ignores CI helper scripts when deciding a documentation profile (awesome)', () => {
    expect(analyze(make({ 'README.md': README, 'awesome.md': '# List\n', '.github/workflows/lint.sh': 'echo hi\n' }), undefined, 'fixed').detectedProfile).toBe('documentation');
  });
  it.each(['source/index.ts', 'gson/src/main/java/com/Gson.java', 'Src/Newtonsoft.Json/JsonConvert.cs', 'bootstrap.sh'])('finds nested entry point %s', path => {
    expect(state({ 'README.md': README, [path]: 'x\n' }, 'STR03')).toBe('pass');
  });
  it('does not treat test files alone as an implementation entry point', () => {
    expect(state({ 'README.md': README, 'tests/test_x.py': 'def test_x():\n    pass\n' }, 'STR03')).toBe('fail');
  });
  const mit = 'Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files, to deal in the Software without restriction. Copyright (c) the authors.';
  it.each(['LICENSE-MIT', 'LICENSE-MIT.txt', 'UNLICENSE', 'license.md'])('recognizes license file %s', path => expect(state({ ...src, [path]: mit }, 'STR01')).toBe('pass'));
  it.each(['History.md', 'NEWS', 'changes.rst'])('recognizes changelog %s', path => {
    expect(state({ ...src, [path]: '# 1.0.0\n\n' + 'Fixed a defect in request parsing and documented the change for maintainers. '.repeat(2) }, 'MNT04')).toBe('pass');
  });
  it.each([
    ['.rubocop.yml', 'AllCops:\n  TargetRubyVersion: 3.2\n', 'MNT02'],
    ['.swiftlint.yml', 'disabled_rules:\n  - line_length\n', 'MNT02'],
    ['pom.xml', '<project><build><plugins><plugin><artifactId>maven-checkstyle-plugin</artifactId></plugin></plugins></build></project>', 'MNT02'],
    ['build.gradle', 'plugins { id "com.diffplug.spotless" }\n', 'MNT01'],
    ['.swiftformat', '--indent 4\n', 'MNT01'],
  ])('recognizes %s for %s', (path, body, id) => expect(state({ ...src, [path]: body }, id)).toBe('pass'));
  it('does not credit a JVM build file without lint/format plugins', () => {
    expect(state({ ...src, 'pom.xml': '<project><artifactId>x</artifactId></project>' }, 'MNT02')).toBe('fail');
  });
  it.each([['golangci-lint run', 'MNT02'], ['bundle exec rubocop', 'MNT02'], ['./gradlew spotlessCheck', 'MNT01'], ['dotnet format --verify-no-changes', 'MNT01']])('recognizes CI tool %s', (run, id) => {
    expect(state({ ...src, '.github/workflows/ci.yml': CI(run) }, id)).toBe('pass');
  });
  it('counts a fenced usage example but not install-only snippets for DOC03 (requests)', () => {
    const base = '# Lib\n\nA small library for parsing request headers in long-running services and command-line tools.\n\n';
    expect(state({ ...src, 'README.md': base + '```python\n>>> import lib\n>>> lib.parse("a: b")\n```\n' }, 'DOC03')).toBe('pass');
    expect(state({ ...src, 'README.md': base + '```\npip install lib\n```\n' }, 'DOC03')).toBe('fail');
  });
  it('does not treat a "Deployment status" heading as scope documentation', () => {
    expect(state({ ...src, 'README.md': '# X\n\n## Deployment status\n\nStaging is deployed and production is waiting for approval from the owner of the project.\n' }, 'DOC04')).toBe('fail');
  });
  it('detects published packages and gems as libraries (express, sinatra)', () => {
    const profile = (files: Record<string, string>) => analyze(make(files), undefined, 'fixed').detectedProfile;
    expect(profile({ 'README.md': README, 'package.json': JSON.stringify({ name: 'x', version: '1.0.0' }), 'index.js': '' })).toBe('library');
    expect(profile({ 'README.md': README, 'package.json': JSON.stringify({ name: 'x', version: '1.0.0', private: true }), 'index.js': '' })).toBe('general');
    expect(profile({ 'README.md': README, 'x.gemspec': 'Gem::Specification.new', 'lib/x.rb': '' })).toBe('library');
  });
});

describe('owner-level default security policy (click, express, gson)', () => {
  const policy = 'Please report vulnerabilities privately through GitHub security advisories rather than public issues. We respond to every report and coordinate disclosure.';
  const inherit = (files: Record<string, string>, unresolved = false): Inspection => ({ ...make({ 'README.md': README, 'src/a.py': '' }), inherited: { repository: 'validation/.github', checked: true, unresolved, files } });
  it('credits an inherited policy with an owner-level evidence link', () => {
    const c = check(inherit({ 'SECURITY.md': policy }), 'SEC01');
    expect(c.state).toBe('pass');
    expect(c.evidence[0].url).toBe('https://github.com/validation/.github/blob/HEAD/SECURITY.md');
  });
  it('fails only after owner defaults were checked and found absent', () => expect(check(inherit({}), 'SEC01').state).toBe('fail'));
  it('is unknown when the owner default location is unresolved', () => expect(check(inherit({}, true), 'SEC01').state).toBe('unknown'));
  it('keeps prior behavior for inspections that never checked owner defaults', () => expect(state({ 'README.md': README, 'src/a.py': '' }, 'SEC01')).toBe('fail'));
});

describe('inspector sampling and owner defaults', () => {
  const meta = { id: 1, fullName: 'own/repo', description: 'x', language: null, defaultBranch: 'main', license: null, archived: false };
  const commit = { sha: 'a'.repeat(40), commit: { tree: { sha: 'c'.repeat(40) } } };
  function server(files: Record<string, string>, extra: Record<string, unknown> = {}) {
    const tree = Object.keys(files).map((path, n) => ({ path, type: 'blob', mode: '100644', sha: String(n + 1).padStart(40, '0'), size: files[path].length }));
    const calls: string[] = [];
    const fetcher = (async (url: string) => {
      const u = new URL(url); calls.push(u.pathname);
      if (u.pathname.includes('/git/trees/')) return Response.json({ tree, truncated: false });
      const blob = tree.find(e => u.pathname.endsWith('/git/blobs/' + e.sha));
      if (blob) return Response.json({ encoding: 'base64', content: btoa(files[blob.path]) });
      if (u.pathname in extra) return Response.json(extra[u.pathname]);
      return new Response(null, { status: 404 });
    }) as unknown as typeof fetch;
    return { fetcher, calls };
  }
  it('does not let CI-referenced scripts consume the test sample (Cursiv)', async () => {
    const files: Record<string, string> = { 'README.md': README, '.github/workflows/ci.yml': CI('python scripts/a.py && python scripts/b.py && python scripts/c.py && python scripts/d.py') };
    for (const n of ['a', 'b', 'c', 'd']) files['scripts/' + n + '.py'] = 'print(1)\n';
    files['tests/test_core.py'] = 'def test_core():\n    assert True\n';
    const inspection = await new GitHub(undefined, server(files).fetcher).inspect(meta, commit);
    expect(Object.keys(inspection.files)).toContain('tests/test_core.py');
  });
  it('reads an owner default SECURITY.md only when the repository has none', async () => {
    const policy = 'Report vulnerabilities privately via security@example.org. Do not open public issues for security problems; we coordinate disclosure.';
    const { fetcher } = server({ 'README.md': README }, { '/repos/own/.github/contents': [{ type: 'file', name: 'SECURITY.md', size: policy.length }], '/repos/own/.github/contents/SECURITY.md': { encoding: 'base64', content: btoa(policy) } });
    const inspection = await new GitHub(undefined, fetcher).inspect(meta, commit);
    expect(inspection.inherited).toMatchObject({ checked: true, unresolved: false });
    expect(inspection.inherited!.files['SECURITY.md']).toBe(policy);
    const own = server({ 'README.md': README, 'SECURITY.md': policy });
    await new GitHub(undefined, own.fetcher).inspect(meta, commit);
    expect(own.calls.some(c => c.includes('/.github/contents'))).toBe(false);
  });
  it('records a checked absence when the owner has no .github repository', async () => {
    const inspection = await new GitHub(undefined, server({ 'README.md': README }).fetcher).inspect(meta, commit);
    expect(inspection.inherited).toMatchObject({ checked: true, unresolved: false, files: {} });
  });
  it('marks owner defaults unresolved when the policy may live in a nested folder', async () => {
    const { fetcher } = server({ 'README.md': README }, { '/repos/own/.github/contents': [{ type: 'dir', name: '.github' }] });
    const inspection = await new GitHub(undefined, fetcher).inspect(meta, commit);
    expect(inspection.inherited).toMatchObject({ checked: true, unresolved: true });
  });
});
