// Regression tests for recognition gaps that previously produced definitive failures
// (or false "no dependencies" claims) for ecosystems the analyzer did not understand.
import { describe, expect, it } from 'vitest';
import { analyze } from '../src/shared/engine';
import { make, README, CI } from './fixtures/validation';

const state = (files: Record<string, string>, id: string) => analyze(make(files), undefined, 'fixed').checks.find(c => c.rule.id === id)!;

describe('test declaration recognition across ecosystems', () => {
  it.each([
    ['Ruby RSpec', 'spec/widget_spec.rb', "RSpec.describe Widget do\n  it 'renders' do\n    expect(1).to eq(1)\n  end\nend\n"],
    ['Ruby minitest', 'test/widget_test.rb', "class WidgetTest < Minitest::Test\n  def test_renders\n    assert true\n  end\nend\n"],
    ['PHPUnit', 'tests/WidgetTest.php', "<?php\nclass WidgetTest extends TestCase {\n  public function testRenders(): void { $this->assertTrue(true); }\n}\n"],
    ['xUnit C#', 'Widget.Tests/WidgetTests.cs', 'public class WidgetTests {\n  [Fact]\n  public void Renders() { Assert.True(true); }\n}\n'],
    ['Swift XCTest', 'Tests/WidgetTests/WidgetTests.swift', 'import XCTest\nfinal class WidgetTests: XCTestCase {\n  func testRenders() { XCTAssertTrue(true) }\n}\n'],
    ['Kotlin JUnit', 'src/test/kotlin/WidgetTest.kt', 'class WidgetTest {\n  @Test\n  fun renders() { assertTrue(true) }\n}\n'],
    ['GoogleTest', 'tests/widget_test.cpp', '#include <gtest/gtest.h>\nTEST(Widget, Renders) { EXPECT_TRUE(true); }\n'],
    ['Elixir ExUnit', 'test/widget_test.exs', 'defmodule WidgetTest do\n  use ExUnit.Case\n  test "renders" do\n    assert true\n  end\nend\n'],
  ])('%s declarations pass TST01', (_name, path, body) => {
    expect(state({ 'README.md': README, [path]: body, 'lib/widget.txt': 'x' }, 'TST01').state).toBe('pass');
  });

  it('prefers named test files over helpers when sampling', () => {
    const files: Record<string, string> = { 'README.md': README, 'pkg/__init__.py': '' };
    for (const n of ['a', 'b', 'c', 'd', 'e']) files['tests/fixtures/' + n + '.py'] = 'DATA = 1\n';
    files['tests/test_widget.py'] = 'def test_renders():\n    assert True\n';
    // Simulate the inspector's sampling order with the real priority function.
    return import('../worker/github').then(({ priority }) => {
      const ranked = Object.keys(files).filter(p => p.startsWith('tests/')).sort((a, b) => priority(b) - priority(a) || (a < b ? -1 : 1));
      expect(ranked[0]).toBe('tests/test_widget.py');
    });
  });

  it('does not claim absent tests when no supported source language is observed', () => {
    const check = state({ 'README.md': README, 'src/widget.hs': 'main = pure ()\n', 'test/Spec.hs': 'main = hspec $ pure ()\n' }, 'TST01');
    expect(check.state).toBe('unknown');
  });

  it('still fails when supported source exists without any test files', () => {
    expect(state({ 'README.md': README, 'src/index.js': 'export default 1;\n' }, 'TST01').state).toBe('fail');
  });
});

describe('documentation profile requires the absence of source code', () => {
  it.each(['lib/widget.rb', 'src/Widget.php', 'Sources/Widget.swift', 'src/Widget.kt', 'lib/widget.ex', 'src/Main.hs', 'bin/run.sh', 'lib/widget.lua', 'src/main.zig', 'lib/widget.dart', 'src/Widget.scala'])('%s keeps code rules applicable', path => {
    const report = analyze(make({ 'README.md': README, 'docs/guide.md': '# Guide\n', [path]: 'code\n' }), undefined, 'fixed');
    expect(report.detectedProfile).not.toBe('documentation');
  });
  it('still detects a Markdown-only repository as documentation', () => {
    expect(analyze(make({ 'README.md': README, 'docs/guide.md': '# Guide\n' }), undefined, 'fixed').detectedProfile).toBe('documentation');
  });
});

describe('dependency applicability for unsupported manifests', () => {
  it.each(['Gemfile', 'composer.json', 'pom.xml', 'build.gradle', 'Widget.csproj', 'Package.swift', 'mix.exs'])('%s is not reported as "no dependencies"', manifest => {
    const files = { 'README.md': README, [manifest]: 'dependency declarations\n', 'lib/widget.rb': 'x' };
    expect(state(files, 'SEC02').state).toBe('unknown');
    expect(state(files, 'MNT03').state).toBe('unknown');
  });
});

describe('CI test invocation tracing', () => {
  const node = (run: string) => ({ 'README.md': README, 'package.json': JSON.stringify({ scripts: { test: 'vitest run', build: 'vite build' }, devDependencies: { vitest: '1' } }), 'src/index.js': 'export {};\n', '.github/workflows/ci.yml': CI(run) });
  const py = (run: string) => ({ 'README.md': README, 'pyproject.toml': '[project]\nname="w"\ndependencies=["requests"]\n', 'tests/test_w.py': 'def test_w():\n    assert True\n', '.github/workflows/ci.yml': CI(run) });
  it.each([
    'poetry run pytest -q', 'uv run pytest', 'pipenv run pytest', 'pdm run pytest', 'coverage run -m pytest', 'xvfb-run -a pytest', 'python -m coverage run -m pytest',
  ])('recognizes wrapped Python runner: %s', run => expect(state(py(run), 'TST03').state).toBe('pass'));
  it.each(['mvn -B verify', './gradlew build', 'bundle exec rspec', 'bundle exec rake test', 'vendor/bin/phpunit', 'swift test', 'ctest --output-on-failure', 'mix test', 'deno test', 'flutter test', 'sbt test'])('recognizes ecosystem runner: %s', run => {
    expect(state({ 'README.md': README, 'src/app.c': 'int main(){}\n', '.github/workflows/ci.yml': CI(run) }, 'TST03').state).toBe('pass');
  });
  it('does not treat skipped Maven/Gradle tests as test invocations', () => {
    expect(state({ 'README.md': README, 'src/app.c': 'x', '.github/workflows/ci.yml': CI('mvn -B package -DskipTests') }, 'TST03').state).toBe('fail');
    expect(state({ 'README.md': README, 'src/app.c': 'x', '.github/workflows/ci.yml': CI('./gradlew build -x test') }, 'TST03').state).toBe('fail');
  });
  it('treats npm built-in commands as non-test steps rather than unresolved aliases', () => {
    expect(state(node('npm ci && npm run build'), 'TST03').state).toBe('fail');
    expect(state(node('npm ci && npm test'), 'TST03').state).toBe('pass');
  });
});
