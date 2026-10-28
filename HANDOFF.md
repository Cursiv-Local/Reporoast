# Handoff

Updated 2026-10-28. Manuscript v3.0. Git origin is https://github.com/Cursiv-Local/Reporoast.git; it was empty at initial inspection. No pre-existing history or Cursiv code was overwritten. Initial implementation was local; the user subsequently authorized pushing, deployment and a real test.

## Authorized staging follow-up — 2026-10-28

Staging is live at https://reporoast-staging.joshua-1993-winkler.workers.dev. Latest application deployment: 0cf40752-7fcf-4e2c-9474-8f5df80a4fd6. Real GitHub scan of octocat/Hello-World at 7fd1a60b01f91b314f59955a4e4d4e80d8edf11d returned 85/1000 with 100% rule-evidence coverage and four original inspection API calls. This is a heuristic result, not a security finding.

Live Edge smoke passed HTTPS/homepage CSP, a real scan, mode consistency, desktop/mobile axe, PNG download, explicit share creation with OG metadata, share removal, mobile overflow and absence of browser errors. The temporary public share was removed. Artifacts are ignored under .wrangler/staging-smoke. Run npm run smoke:staging to repeat.

Staging quotas: 10 submissions/IP/day, 30 globally/day, 2 concurrent scans. Generated staging-only HMAC/admin secrets were uploaded through stdin; the local backup is Git-ignored .dev.vars.staging. No GitHub OAuth credential was copied to the Worker. Account subscription inspection was denied by the existing OAuth scope; no billing/plan changes were attempted.

Live testing caught and fixed static asset responses bypassing Worker security headers: public/_headers now secures directly served assets. Production stays disabled, no production domain route was created, and DNS is unchanged. Broader live calibration remains a release gate. Source delivery targets origin/main; generated artifacts and secrets are excluded.

## Milestone 1 — Foundation: implemented
React 19 / Vite / Tailwind 4 frontend and TypeScript Worker, strict public GitHub URL parsing, normalized metadata retrieval, canonical rename handling, API errors, branding and landing page. Chose the smallest independent architecture; no AI SDK, Python backend or Cursiv imports.

## Milestone 2 — Inspection: implemented
Exact commit and tree resolution; bounded selected blobs; 5,000 entries, 24 files, 48 KB/file, 400 KB total, 30 HTTP calls including redirects, 2 MB API response cap, 20-second deadline. Dependency/generated/binary skips; symlink/submodule avoidance; inspected/skipped/unavailable/truncated/byte/request accounting. API failure never becomes a missing-file claim.

## Milestone 3 — Scoring: implemented
24 stable versioned rules and documented recognition patterns; seven weights total 1000; library/application/CLI/documentation/general profiles and corrections; applicable/ineligible/unknown states; largest-remainder normalization; partial workflow satisfaction; weighted coverage threshold of 80%, 8 known checks and 3 categories. GitHub-specific settings are ineligible when a complete tree has no GitHub Actions workflow.

## Milestone 4 — Results: implemented
Repository metadata, commit, timestamp, score/tier or insufficient-evidence status, weighted coverage, categories, top findings with severity/uncertainty/confidence, full check/evidence listing, inspection accounting and explicit limitations. Unknown evidence is excluded from a clearly conditional score.

## Milestone 5 — Improvement opportunities: implemented
Every known failed/partial rule has effective current/max/gain, rough effort estimate, priority, explanation, commit evidence and implementation steps. Integer gains use max minus award; overlapping license improvements merge their distinct contributions once. Unknown/ineligible rules have no numerical gains. Changes can affect other rules, applicability and coverage.

## Milestone 6 — Modes: implemented
Two reviewed humorous variants per rule, selected by stable repository/commit/rule hash. Professional explanations use the same structured report. Switching modes never reruns analysis or changes score/gains. People and protected characteristics are not targets.

## Milestone 7 — Security/cost: implemented
Atomic daily IP/global scan reservations and publication/read quotas in a singleton SQLite Durable Object. Defaults: 5 submissions/IP/day, 100 global/day, 2 concurrent scans; coalesced requests avoid another reservation; 40 submit requests/IP/day. Shares: 10/IP/day, 200/day global. Summary reads: 200/IP/day, 10,000/day global.

24-hour immutable report cache keyed by repository identity, commit, analyzer/rule versions and effective profile (auto lookup alias documented); 60-second metadata memory cache. Existing reports preserve original snapshot across equivalent profile aliases. Hourly cleanup, UTC daily HMAC IP quotas, aggregate metrics, fail-closed scan switch, bounded same-origin JSON, fixed GitHub endpoint construction, safe redirects, credential redaction and fallback commit evidence for credential-like filenames. Worker observability is disabled by default. No paid infrastructure has been enabled.

## Milestone 8 — Sharing: implemented
Copy scorecard, copy roast, PNG download. Explicit consent is required to publish a minimal server-owned score summary, with 7-day expiry and hashed removal token. Token-based and authorized admin removal; removal form on homepage. Public links pin the analyzed commit and carry OG title/description/URL metadata, noindex/noarchive and no-store. They exclude detailed findings, filenames, descriptions and source contents. OG metadata is currently text-only; client PNG downloads are supported.

## Milestone 9 — Verification: local checks passed
- 103 Vitest unit tests: URL/SSRF validation; every rule positive case; 0/1000 boundaries; profiles/ecosystems; weighted coverage; partial credit; reweighting; missing evidence; integer gains; overlap; deterministic commentary; commit evidence; GitHub errors/renames/limits; redaction and scoring-doc registry.
- 31 local Worker assertions: actual workerd + SQLite via Miniflare, mocked GitHub, coalescing, quotas, concurrency, API failures, cache hits/invalidation, errors, secret redaction, sharing consent/privacy/headers/removal/expiry, administrative authorization, emergency switch, malformed/oversized input.
- 8 Playwright tests: desktop (1440×1000) and mobile (390×844) Edge; landing/results axe checks have zero reported violations; mode numbers/gains agree; XSS descriptions stay text; consent; downloads; keyboard/reduced motion; no horizontal overflow.
- TypeScript and Vite production build passed. Wrangler dry-run bundle passed; no deployment.
- npm audit: zero known vulnerabilities at verification time.
- Live opt-in smoke: octocat/Hello-World at 7fd1a60b01f91b314f59955a4e4d4e80d8edf11d, four GitHub calls, README inspected, full rule-evidence coverage. No public report created. Local-only report under ignored .wrangler/smoke.
- Representative offline fixtures: application, library, CLI, documentation, Rust, Go and Python. Broader live ecosystem calibration and external staging smoke remain public-beta release gates.
- Browser screenshots: ignored test-results/desktop-report.png and mobile-report.png. Visual layout inspected.

Runtime testing exposed and fixed a Worker global fetch receiver bug that unit mocks missed. Additional fairness testing exposed and fixed uppercase Cargo manifest recognition. Dependency tooling was upgraded to eliminate reported advisories; Miniflare is pinned to the same patched 5.x beta runtime already used by Wrangler.

## Milestone 10 — Deployment preparation: implemented; staging now tested
Separate staging/production Wrangler config, secrets guidance, health endpoint, admin metrics, CI tests, explicit deployment scripts that run full verification, rollback and DNS/HTTPS instructions. Staging PUBLIC_ORIGIN is configured and scanning enabled. Production remains disabled with workers_dev:false and requires an authorized custom-domain configuration.

## Known limits and remaining actions
1. Staging account/origin, HMAC/admin secrets and live end-to-end verification are complete. Optional minimal public-read GitHub credentials can raise GitHub API capacity; current staging uses unauthenticated access.
2. Obtain explicit authorization before production deployment or cursiv.us DNS changes.
3. Calibrate heuristic recognition against more real ecosystems. Text/presence checks do not establish semantic adequacy, running CI, passing tests, least privilege or secure code. Unsupported valid alternatives may be missed.
4. Profile detection is strongest for readable root package.json; static sites and ambiguous repositories can need manual corrections. Large responses fail safely; incomplete trees withhold unsupported absence claims.
5. GitHub description/license recognition/language are API metadata snapshots, not historical Git objects. File/tree links pin the exact commit; metadata links provide repository context. Compare equivalent profiles and evidence snapshots only.
6. Conditional scores can be high with some unknown evidence. Coverage and minimum thresholds are explicit. No authoritative cross-project rankings.
7. Effort labels are rough practice-level estimates. No fabricated code-specific fixes.
8. Application quotas bound scanning/publication but cannot cap all incoming HTTP platform work. Keep the account on a reviewed Free plan and monitor dashboard/aggregate metrics; no paid plan is enabled by this code.
9. Removal tokens must be saved by users. Operator removal requests use GitHub issues with share ID only; private vulnerability reports belong in GitHub Security Advisories if configured.
10. Initial repository was empty. Source delivery targets origin/main; all secrets, runtime data and browser artifacts remain Git-ignored.

## Next commands
npm ci --ignore-scripts
npm run verify
npm audit

See DEPLOYMENT.md for staging and production procedures. Staging is deployed and externally tested; broader calibration and production setup remain before a public-beta release.
