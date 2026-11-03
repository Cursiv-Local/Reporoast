import { parseDocument } from 'yaml';
import { parse as toml } from 'smol-toml';
import JSON5 from 'json5';
import type { Inspection } from '../../worker/github';
import type { Profile } from './legacy/v1';

export type ObjectValue = Record<string, any>;
export function object(value: unknown): value is ObjectValue {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
export function eligible(path: string) {
  return !/(^|\/)(node_modules|vendor|dist|build|coverage|\.git|\.venv|venv|__pycache__)\//i.test(path);
}
// Source files in any common language. A repository containing these is never a documentation-only profile.
export const SOURCE = /\.(?:py|[cm]?[jt]sx?|rs|go|java|kts?|scala|groovy|cs|fs|vb|rb|php|swift|m|mm|c|cc|cpp|cxx|h|hpp|ex|exs|erl|dart|hs|ml|clj|lua|pl|r|jl|zig|nim|cr|sh|ps1|sql|sol|vue|svelte|html)$/i;
// Test files whose declarations the analyzer can recognize. Anything else is unsupported, not absent.
const TESTABLE_EXT = 'py|[cm]?[jt]sx?|rs|go|java|kts?|scala|cs|rb|php|swift|c|cc|cpp|cxx|ex|exs|dart';
const TEST_DIR = new RegExp('(?:^|/)(?:tests?|specs?|__tests__)/.*\\.(?:' + TESTABLE_EXT + ')$', 'i');
const TEST_NAME = new RegExp('(?:^|/)test_[^/]+\\.py$|[._-](?:test|spec|tests)\\.(?:' + TESTABLE_EXT + ')$', 'i');
const TEST_CLASS = /\wTests?\.(?:java|kts?|scala|cs|php|swift)$/;
export const TESTABLE = new RegExp('\\.(?:' + TESTABLE_EXT + ')$', 'i');
/** 2 = file name declares a test, 1 = file under a test directory, 0 = not a test candidate. */
export function testRank(path: string) { return TEST_NAME.test(path) || TEST_CLASS.test(path) ? 2 : TEST_DIR.test(path) ? 1 : 0; }
export const TEST_DECLARATION = new RegExp('^\\s*(?:' + [
  '(?:async\\s+)?def\\s+test_\\w*', 'class\\s+\\w+\\((?:unittest\\.)?TestCase\\)', 'class\\s+\\w+\\s*<\\s*Minitest::Test', // Python, Ruby minitest
  '(?:it|test|describe|context|specify)(?:\\.\\w+)*\\s*\\(', // JS/TS, Dart
  '(?:RSpec\\.)?(?:it|test|describe|context|specify)\\s+[\'"]', // RSpec, ExUnit
  'func\\s+Test\\w*\\s*\\(', 'func\\s+test\\w*\\s*\\(', // Go, Swift XCTest
  '#\\[(?:\\w+::)*test\\]', '@(?:Test|ParameterizedTest|TestFactory)\\b', '#\\[Test\\]', // Rust, JVM/Swift Testing, PHP attributes
  '\\[(?:Fact|Theory|Test|TestMethod|TestCase)\\b', // .NET
  '(?:public\\s+)?function\\s+test\\w*\\s*\\(', '\\*\\s*@test\\b', // PHPUnit
  '(?:TEST|TEST_F|TEST_P|TEST_CASE)\\s*\\(', // GoogleTest, Catch2
].join('|') + ')', 'm');
// Root license/changelog names, including dual-license (LICENSE-MIT, UNLICENSE) and any extension.
export const LICENSE_PATH = /^(?:(?:un)?licen[cs]e|copying)(?:[.-][\w.-]+)?$/i;
export const CHANGELOG_PATH = /^(?:changelog|changes|history|news)(?:\.[\w-]+)?$|^\.changeset\/[^/]+\.md$/i;
// Native lint/format configuration recognized as data (never executed). JVM build files are read for plugins.
export const FORMAT_CONFIG = /^(?:\.prettierrc(?:\.json5?|\.ya?ml)?|prettier\.config\.[cm]?js|\.editorconfig|rustfmt\.toml|\.rustfmt\.toml|biome\.jsonc?|\.swiftformat|\.clang-format|\.scalafmt\.conf|dprint\.jsonc?|\.php-cs-fixer(?:\.dist)?\.php)$/;
export const LINT_CONFIG = /^(?:eslint\.config\.[cm]?[jt]s|\.eslintrc(?:\.[\w-]+)?|ruff\.toml|\.ruff\.toml|mypy\.ini|\.flake8|setup\.cfg|\.golangci\.ya?ml|clippy\.toml|biome\.jsonc?|\.rubocop\.ya?ml|\.swiftlint\.ya?ml|phpstan\.neon(?:\.dist)?|psalm\.xml(?:\.dist)?|\.?phpcs\.xml(?:\.dist)?|checkstyle\.xml|config\/checkstyle\/checkstyle\.xml|detekt\.ya?ml|analysis_options\.yaml|\.credo\.exs|\.clang-tidy|\.scalafix\.conf)$/;
export const JVM_BUILD = /^(?:pom\.xml|build\.gradle(?:\.kts)?)$/;
export const TOOL_CONFIG = new RegExp(FORMAT_CONFIG.source + '|' + LINT_CONFIG.source + '|' + JVM_BUILD.source);
const WRAPPER = /^(?:(?:poetry|pipenv|pdm|uv|rye)\s+run(?:\s+(?:--(?:group|extra|with|python|package|env-file|directory|project|only-group)|-[pE])\s+\S+|\s+-{1,2}[\w-]+(?:=\S+)?)*\s+|bundle\s+exec\s+|xvfb-run(?:\s+-a)?\s+|(?:python[\d.]*\s+-m\s+)?coverage\s+run(?:\s+-m)?\s+|timeout\s+\d+[smh]?\s+|time\s+|env\s+|[A-Z_][A-Z\d_]*=\S*\s+)/;
const TEST_RUNNER = /^(?:(?:python[\d.]*|py)\s+-m\s+(?:pytest|unittest)\b|(?:npx\s+|pnpm\s+exec\s+|yarn\s+dlx\s+)?(?:pytest|vitest|jest|mocha|ava)\b|cargo\s+(?:test|nextest\s+run)\b|go\s+test\b|(?:node|deno|bun)\s+(?:--)?test\b|dotnet\s+test\b|rspec\b|rake\s+(?:test|spec)\b|(?:\.?\/?vendor\/bin\/)?(?:phpunit|pest)\b|(?:\.\/)?mvnw?\b.*\s(?:test|verify|install|package)\b|(?:\.\/)?gradlew?\b.*\s(?:test|check|build)\b|swift\s+test\b|ctest\b|mix\s+test\b|(?:flutter|dart)\s+test\b|sbt\b.*\btest\b|xcodebuild\b.*\stest\b)/;
const JVM_TASK = (tasks: string) => '(?:\\./)?(?:gradlew?|mvnw?)\\b.*[\\s:](?:' + tasks + ')\\b';
const LINT_RUNNER = new RegExp('^(?:(?:python[\\d.]*\\s+-m\\s+|npx\\s+|pnpm\\s+exec\\s+)?(?:ruff\\s+check|flake8|pylint|mypy|pyright|eslint|xo|standard|oxlint|tsc\\s+--noEmit|biome\\s+(?:check|lint))\\b|go\\s+vet\\b|golangci-lint\\s+run\\b|staticcheck\\b|cargo\\s+clippy\\b|rubocop\\b|standardrb\\b|(?:vendor/bin/)?(?:phpstan|psalm|phpcs)\\b|swiftlint\\b|ktlint\\b|detekt\\b|deno\\s+lint\\b|mix\\s+credo\\b|(?:dart|flutter)\\s+analyze\\b|shellcheck\\b|clang-tidy\\b|cppcheck\\b|' + JVM_TASK('checkstyle\\w*|detekt|ktlintCheck|lint|pmd\\w*|spotbugs\\w*') + ')');
const FORMAT_RUNNER = new RegExp('^(?:(?:python[\\d.]*\\s+-m\\s+|npx\\s+|pnpm\\s+exec\\s+)?(?:black|isort|ruff\\s+format|prettier|dprint|biome\\s+format)\\b|cargo\\s+fmt\\b|rustfmt\\b|gofmt\\b|gofumpt\\b|goimports\\b|go\\s+fmt\\b|swiftformat\\b|(?:vendor/bin/)?php-cs-fixer\\b|dotnet\\s+format\\b|mix\\s+format\\b|dart\\s+format\\b|clang-format\\b|scalafmt\\b|deno\\s+fmt\\b|' + JVM_TASK('spotless\\w*|ktlintFormat|scalafmt\\w*') + ')');
const PACKAGE_BUILTINS =new Set(['ci','install','i','add','remove','uninstall','audit','publish','pack','version','link','prune','dedupe','outdated','cache','config','init','login','whoami','why','list','ls','set','exec','dlx','fetch','rebuild','update','up','upgrade','help','--version','-v']);
// Dependency manifests the analyzer cannot yet interpret. Their presence makes "no dependencies" unknowable.
const UNSUPPORTED_MANIFEST = /(?:^|\/)(?:Gemfile|composer\.json|pom\.xml|build\.gradle(?:\.kts)?|[^/]+\.(?:cs|fs|vb)proj|packages\.config|Package\.swift|Podfile|mix\.exs|pubspec\.yaml|build\.sbt|stack\.yaml|[^/]+\.cabal|rebar\.config|conanfile\.(?:txt|py)|vcpkg\.json|deno\.jsonc?)$/;
export function meaningful(text: string, minimum = 60) {
  const prose = text.replace(/<!--[\s\S]*?-->/g, '').split('\n').filter(line => !/^\s*(?:#|\/\/|;|$)/.test(line)).join(' ').trim();
  return prose.length >= minimum && !/^(?:todo|tbd|placeholder|coming soon)[.!\s]*$/i.test(prose);
}
// Parsing is data-only. Never import a repository's executable configuration.
export function parseConfig(path: string, text: string): ObjectValue | null {
  if (text.length > 96000 || text.split('\n').length > 6000) return null;
  try {
    let value: unknown;
    if (/\.ya?ml$/i.test(path)) {
      const doc = parseDocument(text, { version: '1.2', uniqueKeys: true, merge: false, strict: true });
      if (doc.errors.length || doc.warnings.length) return null;
      value = doc.toJS({ maxAliasCount: 0 });
    } else if (/\.toml$/i.test(path)) value = toml(text);
    else value = /(?:json5|jsonc|\.prettierrc)$/.test(path) ? JSON5.parse(text) : JSON.parse(text);
    if (!object(value)) return null;
    const queue: [unknown, number][] = [[value, 0]];
    let nodes = 0;
    while (queue.length) {
      const [item, depth] = queue.pop()!;
      if (++nodes > 12000 || depth > 40) return null;
      if (item && typeof item === 'object') for (const [key, child] of Object.entries(item)) {
        if (['__proto__', 'constructor', 'prototype', '<<'].includes(key)) return null;
        queue.push([child, depth + 1]);
      }
    }
    return value;
  } catch { return null; }
}

export interface Workflow {
  path: string;
  data: ObjectValue | null;
  commands: string[];
  jobs: ObjectValue[];
  unresolved: boolean;
}
export type Ecosystem = 'node' | 'python' | 'rust' | 'go';
export class Facts {
  paths: string[];
  docs: string[];
  workflows: Workflow[];
  cache = new Map<string, ObjectValue | null>();
  constructor(public input: Inspection) {
    this.paths = input.tree.filter(e => e.type === 'blob' && e.mode !== '120000' && eligible(e.path)).map(e => e.path).sort();
    this.docs = this.paths.filter(p => /^(?:readme(?:\.[\w-]+)?|contributing(?:\.[\w-]+)?|\.github\/contributing\.md)$/i.test(p));
    this.workflows = this.paths.filter(p => /^\.github\/workflows\/[^/]+\.ya?ml$/.test(p)).map(path => {
      const config = this.config(path);
      const jobs: ObjectValue[] = config && object(config.jobs) ? Object.values(config.jobs).filter(object) : [];
      const trigger=config?.on,validTrigger=typeof trigger==='string'&&!!trigger.trim()||Array.isArray(trigger)&&trigger.length>0&&trigger.every(x=>typeof x==='string')||object(trigger)&&Object.keys(trigger).length>0;
      const disabled=(entry:ObjectValue)=>entry.if===false||typeof entry.if==='string'&&/^(?:false|\$\{\{\s*false\s*\}\})$/.test(entry.if.trim());
      const valid = !!config && !!validTrigger && jobs.length > 0 && jobs.every(j => typeof j.uses === 'string' || !!j['runs-on'] && Array.isArray(j.steps) && j.steps.length > 0 && j.steps.every((s: unknown) => object(s) && (typeof s.run === 'string' && !!s.run.trim() || typeof s.uses === 'string' && !!s.uses.trim())));
      return { path, data: valid ? config : null, jobs, commands: valid ? jobs.filter(j=>!disabled(j)).flatMap(j => (j.steps || []).filter(object).filter((s:ObjectValue)=>!disabled(s)).map((s: ObjectValue) => s.run).filter((s: unknown) => typeof s === 'string')) : [], unresolved: !valid || jobs.some(j => typeof j.uses === 'string') };
    });
  }
  /** Project source files. CI helper scripts under .github/ do not make a repository a code project. */
  get sources() { return this.paths.filter(p => SOURCE.test(p) && !p.startsWith('.github/')); }
  text(path: string): string | undefined { return Object.hasOwn(this.input.files, path) ? this.input.files[path] : undefined; }
  config(path: string): ObjectValue | null {
    if (!this.cache.has(path)) this.cache.set(path, this.text(path) === undefined ? null : parseConfig(path, this.text(path)!));
    return this.cache.get(path)!;
  }
  matches(pattern: RegExp) { return this.paths.filter(path => pattern.test(path)); }
  get ecosystems(): Ecosystem[] {
    return [this.paths.includes('package.json') && 'node', this.paths.some(p => /^(pyproject\.toml|setup\.(py|cfg)|requirements[^/]*\.(txt|in|lock))$/.test(p)) && 'python', this.paths.includes('Cargo.toml') && 'rust', this.paths.includes('go.mod') && 'go'].filter(Boolean) as Ecosystem[];
  }
  get dependencies(): boolean | null {
    let known = this.ecosystems.length === 0, present = false;
    for (const ecosystem of this.ecosystems) {
      if (ecosystem === 'node') {
        const p = this.config('package.json'); if (!p) return null;
        if(['dependencies','devDependencies','peerDependencies','optionalDependencies'].some(k=>p[k]!==undefined&&!object(p[k])))return null;
        present ||= ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'].some(k => object(p[k]) && Object.keys(p[k]).length > 0); known = true;
      } else if (ecosystem === 'python') {
        const p = this.paths.includes('pyproject.toml') ? this.config('pyproject.toml') : null;
        const req = this.matches(/^requirements[^/]*\.(?:txt|in)$/);
        if(p?.project?.dependencies!==undefined&&!Array.isArray(p.project.dependencies))return null;
        if (p?.project?.dependencies?.length || object(p?.project?.['optional-dependencies']) || p?.tool?.poetry?.dependencies) return true;
        if (this.paths.includes('pyproject.toml') && !p || req.some(p => this.text(p) === undefined)) return null;
        present ||= !!p?.project?.dependencies?.length || object(p?.project?.['optional-dependencies']) || !!p?.tool?.poetry?.dependencies || req.some(p => meaningful(this.text(p)!, 1)); known = true;
        if (this.paths.includes('setup.py') && !p && !req.length) return null;
      } else if (ecosystem === 'rust') {
        const p = this.config('Cargo.toml'); if (!p) return null;
        present ||= ['dependencies', 'dev-dependencies', 'build-dependencies'].some(k => object(p[k]) && Object.keys(p[k]).length > 0) || !!p.workspace?.dependencies; known = true;
      } else {
        const text = this.text('go.mod'); if (text === undefined) return null;
        present ||= /^\s*require\s/m.test(text); known = true;
      }
    }
    return present ? true : known && this.input.treeComplete && !this.paths.some(p => UNSUPPORTED_MANIFEST.test(p)) ? false : null;
  }
  profile(): Profile {
    const node = this.config('package.json'), py = this.config('pyproject.toml'), cargo = this.config('Cargo.toml');
    const pyDeps = [...(Array.isArray(py?.project?.dependencies)?py.project.dependencies.filter((x:unknown)=>typeof x==='string'):[]), ...Object.keys(py?.tool?.poetry?.dependencies || {})].join(' ');
    const requirements = this.matches(/^requirements[^/]*\.(txt|in)$/).map(p => this.text(p) || '').join(' ');
    if (/\b(pyqt[56]?|pyside[26]?|wxpython|kivy|tkinter)\b/i.test(pyDeps + ' ' + requirements) || py?.project?.['gui-scripts']) return 'application';
    if (node?.bin || py?.project?.scripts || py?.tool?.poetry?.scripts) return 'cli';
    if (node?.exports || node?.main || node?.module) return 'library';
    if (node?.scripts?.start || node?.scripts?.dev || node?.dependencies?.react || node?.dependencies?.next) return 'application';
    // A named, versioned, non-private package is published for reuse even without an explicit entry field.
    if (typeof node?.name === 'string' && typeof node.version === 'string' && node.private !== true) return 'library';
    if (this.paths.some(p => /^[^/]+\.gemspec$/.test(p))) return 'library';
    const composer = this.config('composer.json');
    if (composer?.type === 'library') return 'library';
    if (composer?.type === 'project') return 'application';
    if (cargo) return this.paths.includes('src/main.rs') || cargo.bin ? 'application' : 'library';
    if (this.ecosystems.includes('go')) return this.paths.some(p => /(^|\/)main\.go$/.test(p)) ? 'application' : 'library';
    if (this.paths.some(p => /^(?:main\.py|__main__\.py|[^/]+\/__main__\.py)$/.test(p))) return 'application';
    if (py?.project || py?.tool?.poetry) return 'library';
    const hasCode = this.sources.length > 0;
    if (!hasCode && this.input.treeComplete && this.paths.some(p => /\.(md|rst|adoc)$/.test(p))) return 'documentation';
    return 'general';
  }
  commands(): { path: string; command: string }[] {
    const result = this.workflows.flatMap(w => w.commands.map(command => ({ path: w.path, command })));
    const scripts = this.config('package.json')?.scripts;
    if (object(scripts)) for (const command of Object.values(scripts)) if (typeof command === 'string') result.push({ path: 'package.json', command });
    return result;
  }
  trace(command: string, kind: 'test' | 'lint' | 'format', seen = new Set<string>(), depth = 0): { found: boolean; unknown: boolean; paths: string[] } {
    if (depth > 5 || command.length > 16000) return { found: false, unknown: true, paths: [] };
    let found = false, unknown = false; const paths: string[] = [];
    // Treat shell parsing conservatively. Echoes, comments, expressions and arbitrary code are not commands.
    for (let line of command.split(/\n|&&|\|\|/)) {
      line = line.trim(); if (!line || /^(#|echo\b|printf\b|Write-Output\b)/i.test(line)) continue;
      if (line.includes('${{')) { unknown = true; continue; }
      // Environment/runner wrappers change how a command starts, not what it runs.
      for (let previous = ''; previous !== line;) { previous = line; line = line.replace(WRAPPER, ''); }
      const direct = kind === 'test' ? TEST_RUNNER : kind === 'lint' ? LINT_RUNNER : FORMAT_RUNNER;
      // Explicitly named task-runner targets (make test, just lint) are accepted as invocation evidence;
      // the target body is not traced. tox/nox count as tests unless a non-test environment is selected.
      const target = line.match(/^(?:make|just|task)\s+(?:-\S+\s+)*([\w:-]+)\s*$/);
      if (target && (kind === 'test' ? /^(?:test|tests|check|unit|spec)$/ : kind === 'lint' ? /^(?:lint|typecheck|check-types|static|vet)$/ : /^(?:fmt|format|format-check|fmt-check)$/).test(target[1])) { found = true; continue; }
      if (kind === 'test' && /^(?:tox|nox)\b/.test(line)) { if (!/\s(?:-e|-s|--sessions?|--env|-m|-f)[\s=]/.test(line) || /\s(?:-e|-s|--env)[\s=]+(?:py\d*|tests?)\b/.test(line)) found = true; else unknown = true; continue; }
      if (direct.test(line)) { if(kind==='test'&&/\s(?:--help|--version|--collect-only|--listTests|-list|-DskipTests|-Dmaven\.test\.skip=true|-x\s+test)(?:\s|=|$)/.test(line))continue;found = true; continue; }
      const alias = line.match(/^(?:npm|pnpm|yarn)\s+(run\s+)?([\w:.-]+)/);
      if (alias) {
        // Package-manager built-ins (npm ci, pnpm install, ...) are not script aliases.
        if (!alias[1] && PACKAGE_BUILTINS.has(alias[2])) continue;
        const key = !alias[1] && alias[2] === 't' ? 'test' : alias[2], value = this.config('package.json')?.scripts?.[key];
        if (typeof value !== 'string' || seen.has(key)) { unknown = true; continue; }
        const nested = this.trace(value, kind, new Set([...seen, key]), depth + 1);
        found ||= nested.found; unknown ||= nested.unknown; paths.push('package.json', ...nested.paths); continue;
      }
      const local = line.match(/^(?:(?:python[\d.]*|py|node|bash|sh)\s+|\.\/)([\w./-]+\.(?:py|[cm]?js|sh))\b/);
      if (local) {
        const path = local[1].replace(/^\.\//, ''); const text = this.text(path);
        if (!text) { unknown = true; continue; }
        // Evidence of a referenced local test entry point, not proof it executes successfully.
        if (kind === 'test' && /(^|\/)test[^/]*\.(py|[cm]?js)$/.test(path) && /(?:def test_|unittest|pytest|\btest\s*\(|\bit\s*\()/m.test(text)) { found = true; paths.push(path); }
        else if (/\.sh$/.test(path) && !seen.has(path)) { const r = this.trace(text, kind, new Set([...seen, path]), depth + 1); found ||= r.found; unknown ||= r.unknown; paths.push(path, ...r.paths); }
        else unknown = true;
      } else if (/^(?:make|hatch|just|task|nx|turbo)\b/.test(line)) unknown = true;
    }
    return { found, unknown, paths: [...new Set(paths)] };
  }
}
