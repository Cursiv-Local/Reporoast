# RepoRoast — development handoff

Last updated: 2026-11-02. Branch: `fix/github-rate-limits` (draft PR https://github.com/Cursiv-Local/Reporoast/pull/2).
This file is the entry point for the next contributor. The older root `HANDOFF.md` is the historical log of the
earlier milestones (U1/U2, production deployment, the 2026-10-28 rate-limit incident) and remains accurate for that history.

**Status of this session's work: implemented and verified locally, NOT committed, NOT deployed.**
Production (https://roast.cursiv.us) still runs analyzer 0.2.0 / rules 2.0.0 from the earlier deployment.

## 1. Current project state

| Area | State |
|---|---|
| Analyzer / rules | 0.2.0 / **2.1.0** (this branch, uncommitted). Production: 2.0.0. |
| Unit / regression tests | **396 passed** (10 files), `npx vitest run` |
| Worker integration (Miniflare + workerd + SQLite DO, mocked GitHub) | **48 checks passed**, `npm run test:integration` |
| Browser e2e (Playwright, desktop + mobile, axe) | **8 passed**, `npm run test:e2e` |
| TypeScript + Vite build | passed (`npm run build`) |
| `npm audit` | 0 known vulnerabilities |
| Live validation (18 public repos, 2 runs each) | all runs reproducible; results in `docs/validation/live-results.json` |
| Deployment | none performed this session. Staging/production unchanged. |
| GITHUB_TOKEN in Workers | per the 2026-10-28 log, owner provisioning was in progress; not re-checked this session |

## 2. Architecture overview

- `src/main.tsx` — React 19 single page (Tailwind 4). Single `fetch` per action, **no automatic retries**.
- `worker/index.ts` — Cloudflare Worker entry + `Coordinator` SQLite Durable Object (singleton `global-v1`):
  quotas, coalescing, report cache (24 h, keyed by repo id + exact SHA + analyzer/rules version + profile),
  60 s recent-head pointers, GitHub cooldowns, shares, admin metrics.
- `worker/github.ts` — bounded GitHub REST client (fixed host, validated redirects, 30 calls, 24 blobs,
  96 KB/file, 400 KB total, 2 MB response, 20 s) and the inspector (file prioritization and sampling).
- `src/shared/inspection-facts.ts` — data-only parsing (YAML/TOML/JSON5), profile detection, ecosystem and
  dependency facts, bounded command tracing (never executes anything).
- `src/shared/rules-v2.ts` — 24 rule evaluators (22 scored, 2 informational).
- `src/shared/engine.ts` — weights, applicability reallocation, largest-remainder normalization, coverage gate
  (≥80 % weighted evidence, ≥8 known checks, ≥3 categories), score interval, findings, improvements, commentary.
- `src/shared/legacy/v1.ts` — frozen 1.0.0 engine (reproduces Cursiv 671 exactly).
- Docs generated from code: `SCORING.md`, `docs/CURSIV-671-INVESTIGATION.md`, `docs/VALIDATION-RESULTS.md`,
  `docs/validation/*` via `npm run validate:scoring`. Do not hand-edit those; edit `scripts/document-scoring.mjs`.

## 3. Audit findings (prioritized)

Severity: **High** = misleading score or user-visible failure for ordinary use; **Medium** = systematic
false negative for a class of repositories; **Low** = minor/cosmetic.

| # | Severity | Finding | Evidence | Status |
|---|---|---|---|---|
| 1 | High | **Cached results consumed scan quota.** Quota was reserved before cache lookup, so 5 repeat scans of an unchanged repo exhausted a visitor's 5/day allowance (`CAPACITY` 429). Matches the "rate limit after repeated tests" report independently of GitHub limits. | `worker/index.ts` reserved `ip:`/`global:` in `fetch` before `scan()` checked caches; `RATE_LIMIT_AUDIT.md` stated cached submissions keep consuming reservations. | **Fixed** |
| 2 | High | **Non-JS/Python/Go/Rust repos misclassified as documentation-only.** `hasCode` only knew 9 extensions, so a Ruby/PHP/Swift/Kotlin/Elixir/Haskell repo with Markdown became a `documentation` profile and every code, test and dependency rule was switched off, which inflated the score. | `profile()` regex `\.(py\|js…\|cs\|html)$`; reproduced in `tests/ecosystems.test.ts`. | **Fixed** |
| 3 | High | **"No dependencies" claimed for unsupported manifests.** A repo with only `Gemfile`/`pom.xml`/`composer.json`/`.csproj`/Gradle/etc. was told SEC02/MNT03 were not applicable because it had no third-party dependencies. | `Facts.dependencies` returned `false` when no supported ecosystem existed. | **Fixed** (now unknown) |
| 4 | Medium | **TST01 test recognition limited to Python/JS/Go/Rust/Java.** Ruby (RSpec/minitest), PHPUnit, xUnit/NUnit, XCTest/Swift Testing, Kotlin, GoogleTest/Catch2, ExUnit, Dart produced a definitive "fail". | Test path + declaration regexes; 8 failing ecosystem cases. | **Fixed** |
| 5 | Medium | **Test sampling could pick only helpers** (`tests/fixtures/*`) ahead of `test_*.py`. | Alphabetical sort within one priority. | **Fixed** (named test files rank first) |
| 6 | Medium | **TST03 false "no test invocation"** for wrapped runners (`poetry run pytest`, `uv run --group dev tox`, `coverage run -m pytest`, `xvfb-run`), Maven/Gradle/RSpec/PHPUnit/Swift/ctest/mix/deno/flutter/sbt, tox/nox and `make test`. `npm ci` was treated as an unresolved script alias. | `Facts.trace`; live: pallets/click. | **Fixed** |
| 7 | Medium | **Org-level default SECURITY.md ignored.** GitHub applies `owner/.github/SECURITY.md` to repos without their own; RepoRoast reported SEC01 "fail". | Live: pallets/click, expressjs/express, google/gson (3 of 8 SEC01 failures checked). | **Fixed** (1–2 extra API calls only when needed) |
| 8 | Medium | **Inspector skipped `CONTRIBUTING.rst`, `docs/SECURITY.md`, lower-case `History.md`/`NEWS`, `LICENSE-MIT`, `UNLICENSE`.** | `priority()` and STR01/MNT04 path regexes; live: ripgrep, dotfiles, express. | **Fixed** |
| 9 | Medium | **STR03 entry point** required `src|lib|app|…` lower-case or root files in 6 languages; failed `source/`, `Slim/`, `gson/src/main/java`, `Src/`, `bootstrap.sh`. | Live: ky, Slim, gson, Newtonsoft.Json, dotfiles. | **Fixed** |
| 10 | Medium | **MNT01/MNT02 lint/format** recognized only JS/Python/Go/Rust tools. RuboCop, PHPStan/Psalm/PHPCS, SwiftLint/SwiftFormat, Checkstyle/Spotless (Maven/Gradle), ktlint/detekt, xo, golangci-lint, dotnet format, etc. were missed. | Live: Slim, gson, Alamofire, ky, sinatra. | **Fixed** |
| 11 | Medium | **DOC03/DOC04** missed common headings ("Using X", "Documentation", "Requirements"/"Goals"/"Philosophy"/"Why…") and README code examples without a "Usage" heading. | Live: requests, gson, Alamofire, express, ripgrep. | **Fixed** (narrowly; see §5) |
| 12 | Medium | **TST04** missed shell-prompted commands (`$ cargo test --all`). | Live: ripgrep README. | **Fixed** |
| 13 | Low | Published npm packages without `main`/`exports` (express) and Ruby gems were `general`, not `library`, so they got an application-style lockfile deduction. | `profile()`. | **Fixed** |
| 14 | Low | Generator scripts hard-coded "2.0.0" in generated docs. | `scripts/*.mjs`. | **Fixed** (use `RULE_VERSION`) |
| — | Info | Org-level default **issue templates** (CON02) and CONTRIBUTING (CON01) are still not resolved from `owner/.github`. | | Open |
| — | Info | Ruby/PHP/JVM/.NET/Swift **dependency** evidence (SEC02 Dependabot ecosystems, MNT03 lockfiles) is unsupported, so those rules are unknown and coverage drops (sinatra is withheld at 75.6 %). | | Open |

Regression I introduced and fixed during this session (recorded for honesty): widening the test-sample cap to
`priority <= 2` briefly let CI-referenced priority-0 scripts consume the 4-file test sample, so live Cursiv had
zero test files inspected. Caught by live validation; fixed (`testRank(path) > 0` guard) and covered by
`tests/live-regressions.test.ts`.

## 4. Completed fixes (this session)

Rate limiting / cost (`worker/index.ts`):
- Recent-head (zero-request) hits are answered before the concurrency check and quota reservation.
- Scan quota is reserved immediately before the first GitHub call, after the cooldown check, so GitHub-cooldown
  rejections cost nothing. Exact-commit cache reuse refunds the reservation (`quotaRefunds` metric).
- Unchanged: 40 submissions/IP/day, per-IP and global daily scan quotas, 2-scan concurrency, coalescing,
  cooldown/backoff, kill switch, all inspection budgets. Nothing was disabled.

Scoring (rules 2.1.0; per-rule versions bumped for DOC03, DOC04, TST01, TST03, TST04, STR01, STR03, SEC01, SEC02,
MNT01–MNT04): findings 2–14 above. All rules remain deterministic, data-only and non-executing.

Validation tooling:
- `scripts/validate-live.mjs` — runs the production inspector and engine against 18 diverse public repositories,
  optionally twice (`--repeat`) to check stability, and writes derived states only (no third-party file contents) to
  `docs/validation/live-results.json`. It needs a token in `GITHUB_TOKEN`, which is held in process memory only.
- Regression tests: `tests/ecosystems.test.ts` (50) and `tests/live-regressions.test.ts` (40).

## 5. Scoring methodology changes and calibration evidence

Normalization, weights, coverage gate, rounding and score interval are **unchanged** (see `SCORING.md`).
Only recognition (what counts as evidence) and applicability (profile, dependency applicability) changed.

Offline labelled set (12 cases, 90 hand labels): 90/90 states still agree. Score changes: **only RepoRoast's own
pinned fixture moved, 580 → 643, from DOC03 fail → pass.** Its README has a substantive "Documentation"
navigation section and a non-install command example. An earlier draft also passed DOC04 via "## Deployment
status". I judged that a false positive and narrowed the rule, so only a heading that is exactly
"Status"/"Project status" counts. Cursiv stays 885 (no change) and Hello-World stays 60.

Live validation (default branch at capture time, 2026-11-02; both runs identical for every repo):

| Repository | Kind | Profile | Before fixes | After | Coverage | Main changes (each verified against the real repo) |
|---|---|---|---:|---:|---:|---|
| Cursiv-Local/Cursiv | Python desktop app | application | 878 | 885 | 91.1 % | TST01 unknown→pass (test sampling bug) |
| octocat/Hello-World | placeholder | general | 60 | 60 | 100 % | — |
| kelseyhightower/nocode | empty joke repo | documentation | 406 | 469 | 100 % | STR03: README is the document entry point |
| psf/requests | Python lib | library | 852 | 918 | 91.0 % | DOC03: README `>>> import requests` example |
| pallets/click | Python CLI lib | library | 685 | 835 | 100 % | TST03 (`uv run … tox run`), SEC01 (pallets/.github) |
| karpathy/nanoGPT | research scripts | general | 435 | 435 | 100 % | — (no tests/CI: deductions stand) |
| expressjs/express | JS lib | general→library | 819 | 972 | 88.0 % | DOC04 "Philosophy", SEC01 org policy, MNT03 n/a for library |
| sindresorhus/ky | TS lib | library | 655 | 779 | 93.1 % | STR03 `source/`, MNT02 `xo` |
| BurntSushi/ripgrep | Rust CLI | application | 680 | 856 | 91.0 % | TST04 `$ cargo test`, STR01 `LICENSE-MIT`, DOC04 "Why…" |
| spf13/cobra | Go lib | library | 846 | 846 | 91.0 % | — |
| sinatra/sinatra | Ruby lib | general→library | withheld | withheld | 75.6 % | Ruby dependency evidence unsupported → withheld (correct) |
| slimphp/Slim | PHP framework | general→library | 691 | 873 | 82.5 % | DOC03, STR03 `Slim/`, MNT02 phpstan/psalm/phpcs |
| google/gson | Java lib | general | 720 | 950 | 91.5 % | DOC03/04, STR03, Spotless/Checkstyle in build |
| JamesNK/Newtonsoft.Json | C# lib | general | 453 | 497 | 91.5 % | STR03 `Src/` |
| Alamofire/Alamofire | Swift lib | general | 671 | 780 | 82.6 % | DOC03 "Using Alamofire", MNT01 `.swiftformat` |
| sindresorhus/awesome | Markdown list | general→documentation | withheld | 444 | 100 % | `.github/*.sh` no longer makes it a code project |
| mathiasbynens/dotfiles | config | general | 324 | 518 | 92.7 % | STR01 `LICENSE-MIT.txt`, STR03 `bootstrap.sh`, DOC03 |
| torvalds/linux | huge tree | — | TOO_LARGE | TOO_LARGE | — | fails safely, no score fabricated |

Interpretation and caveats:
- The higher scores come from fixed false negatives, each traced to a concrete file. No owner name, popularity
  or target score was used. Spot checks found no new false positives in this sample. That is not proof of absence:
  the sample is 18 hand-picked repos and the labels are mine (same-author, not blinded).
- Scores are a **structural practices** measure. Mature projects now cluster at 780–970, minimal or placeholder
  ones at 60–520. Read every score together with its coverage and possible range.
- Cursiv's live score (885, 91.1 %) now matches the curated fixture result exactly. Its remaining deductions
  are valid: no private vulnerability-reporting policy, no dependency-update config, no issue templates, and
  unknown workflow permissions / an oversized changelog.

## 6. Security review (this session)

Reviewed: URL parsing (`src/shared/url.ts`), GitHub client host/redirect/path allowlist, response and parser
bounds, origin checks on POST/DELETE, 2 KB body cap, HMAC-hashed IP keys, admin token comparison, CSP and security
headers, share HTML escaping, report sanitization/redaction, React rendering (no `dangerouslySetInnerHTML`).
- No new vulnerabilities found. Repository content is parsed as data only and never executed; there is no LLM,
  so prompt injection through repository content has nothing to act on.
- The new owner-defaults lookup uses the same validated host and path allowlist (`/repos/{owner}/.github/...`), and
  the owner comes from GitHub's canonical, re-validated repository name. Its evidence link is the first one not pinned
  to the analyzed commit; it is labelled as a scan-time snapshot (`blob/HEAD`).
- Minor, unchanged: the Worker falls back to client key `local` if `CF-Connecting-IP` is missing, which only happens
  outside Cloudflare. HSTS has no `includeSubDomains`, which is deliberate so other cursiv.us hosts are unaffected.

## 7. Rate-limit investigation summary

Two independent causes, both now addressed in code:
1. **GitHub primary quota** (confirmed live 2026-10-28: unauthenticated limit 60/h exhausted; see `RATE_LIMIT_AUDIT.md`).
   Code-side mitigations were already on this branch: cooldowns, zero-request cached rescans, and precise errors.
   The real fix is the owner provisioning a minimal public-read `GITHUB_TOKEN` Worker secret (5,000/h).
2. **RepoRoast's own per-IP quota counted cache hits** (finding #1 above). This alone produces 429 after 5 repeat
   scans per visitor per day, even with a healthy GitHub quota. Fixed this session.

The frontend does not retry automatically. Concurrent identical requests are coalesced.
Cost: cold scans now make 1–2 more calls when a repo lacks SECURITY.md (owner-default lookup). Cached repeats are cheaper for users and unchanged for GitHub.

## 8. Not done / outstanding technical debt

- **Not committed, not pushed, not deployed.** Review the diff, then commit to `fix/github-rate-limits` (draft PR #2) or a new branch.
- Production still needs the authenticated staging smoke from `HANDOFF.md` before any deploy (`npm run smoke:staging`).
- UI (Phase 5) was not redesigned this session. Only regression-tested (8 e2e passes, zero axe violations). Ideas:
  show the `retryAt` countdown for 429s, explain withheld scores with the specific unknown rules, and label
  owner-level evidence in the evidence list.
- Recommendations (Phase 4) still use generic per-rule steps. Next step: ecosystem-specific snippets (for example a
  Dependabot block listing the ecosystems actually detected, or a CI test step using the detected runner).
- Unsupported: Ruby/PHP/JVM/.NET/Swift dependency evidence; CON01/CON02 org-level defaults; Makefile target bodies;
  GitLab/CircleCI test-invocation tracing; monorepo sub-package layouts.
- Live validation labels are same-author. An independent reviewer should label 10+ repos blind.
- `scripts/validate-live.mjs` output reflects moving default branches. Pin SHAs if exact reproducibility over time matters.

## 9. Recommended next tasks (roadmap for the next release)

1. Review and commit this work. Rerun `npm run verify`. Provision `GITHUB_TOKEN` on staging, run
   `npm run smoke:staging`, then request explicit approval for a production deploy (rules 2.1.0 changes scores;
   existing shares keep their original versions).
2. Ruby/PHP/JVM/.NET dependency evidence (Gemfile.lock, composer.lock, Gradle/Maven, packages.lock.json) plus Dependabot
   ecosystem names (bundler, composer, maven, gradle, nuget, swift), so these repos stop being withheld.
3. Org-level CONTRIBUTING and issue templates (CON01/CON02), reusing the owner-defaults request.
4. Actionable recommendations with generated, ecosystem-aware snippets; the potential gain already comes from the real allocation.
5. UI clarity: a withheld-score explainer, a retry countdown, and owner-level evidence labels.
6. Blind external labelling of 10–20 repos; publish the error rates per rule.

## 10. Monetization recommendation (not implemented)

Keep free: the score, categories, all evidence and findings, both modes, and share cards. Trust depends on the evidence being free.
Charge later only for things that cost more to produce or save real time:
(a) a remediation pack with ecosystem-specific config snippets and an ordered fix plan;
(b) private-repo analysis via a GitHub App with least-privilege read access;
(c) score history and rescans on push for a repo, plus a README badge;
(d) org-wide dashboards across many repos.
(a) and (c) are cheapest to build on today's architecture. (b) needs an auth and privacy review. The disabled
$4.99 proposal in `docs/PREMIUM-READINESS.md` correctly remains NOT ready: generic recommendations are not worth paying for yet.

## 11. Commands

```bash
npm ci --ignore-scripts
npx vitest run                 # 396 unit/regression tests
npm run test:integration       # Worker + Durable Object integration (48 checks)
npm run test:e2e               # Playwright desktop/mobile + axe (8 tests)
npm run verify                 # all of the above + build
npm run validate:scoring       # regenerate SCORING.md and validation docs from code
GITHUB_TOKEN=$(gh auth token) node scripts/validate-live.mjs --repeat   # live cross-repo validation
npm run generate:example       # regenerate the homepage example report
```

Deployment requirements are unchanged; see `DEPLOYMENT.md`. Never deploy without explicit owner approval; never
overwrite existing Worker secrets.
