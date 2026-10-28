# Handoff

Updated 2026-10-28. Manuscript v3.0. Git origin is https://github.com/Cursiv-Local/Reporoast.git; it was empty at initial inspection. No pre-existing history or Cursiv code was overwritten. Initial implementation was local; the user subsequently authorized pushing, deployment and a real test.

## U2 — accuracy audit and readiness candidate

Local candidate: analyzer/package 0.2.0, rules 2.0.0. Existing staging is still the original deployment described below; no U2 public deployment, production activation, DNS modification or live payment was performed. This update is prepared for review under the new approval constraint.

Deliverables: docs/SCORING-AUDIT.md audits all 24 IDs; docs/CURSIV-671-INVESTIGATION.md explains each deduction; SCORING.md is the versioned corrected contract; docs/VALIDATION-RESULTS.md and docs/validation/ contain before/after scores, a manual expected-outcome matrix and reproducible machine results. docs/PREMIUM-READINESS.md and docs/PAYMENT-IMPLEMENTATION-PLAN.md document the disabled $4.99 proposal; docs/CUSTOM-DOMAIN.md and wrangler.production.example.jsonc prepare the target hostname without activation.

The frozen v1 engine/spec remain in src/shared/legacy/v1.ts and docs/history/SCORING-v1.0.0.md. Original 671/1000 for Cursiv efc2f961049b767f0fe49e38304e9e70f25a6955 reproduces exactly. Corrected candidate: 885 conditional, 91.1% rule-evidence coverage, possible original-weight interval 805–894. This is not a quality improvement or execution result. RepoRoast's pinned initial commit changes 600→580; Hello-World 85→60. Fixture enrichment (test bodies and dependency evidence) and all point/allocation changes are disclosed. No scoring branch uses owner names or popularity, and Cursiv was not modified or executed.

Validation: ten representative repository types plus two adversarial controls (12 cases; three real pinned references, nine synthetic). Ninety manually authored state labels: 51 binary positives, 19 binary negatives and 20 partial/unknown/ineligible states; 90/90 candidate state agreement. Candidate sample FP=0/19, FN=0/51. This small same-author selected set is not independent/population accuracy evidence. Frozen v1 against these target labels has separately reported false negatives, false positives and abstentions; semantics changed across versions, so rates are explicitly conditional on this rubric.

Implementation: bounded data-only YAML/TOML/JSON5 parsing; root/contributor documentation inspection; bounded alias/local-script tracing without execution; job-level permission inheritance; platform-default uncertainty; Python GUI/native tool/requirements-lock recognition; meaningful content checks; flat layouts; optional environment-file applicability; retired conduct/SPDX penalties; explicit structural-only and zero execution/verified-behavior coverage; possible score intervals; free evidence-context recommendations. Sampling remains 24 blobs/400 KB/30 HTTP calls/20 seconds; individual cap increased to 96 KB for realistic Python lockfiles. Required oversized or unavailable content is unknown, including Cursiv's 176 KB changelog. Malformed trees/field shapes cannot establish absence or crash classification. Parser code is excluded from the browser bundle through precomputed example data.

Payment preparation is an unconnected test-only module: disabled quotes by default, proposed USD 499 cents, signed test receipts, amount/currency/report/quote/capability scope, replay idempotency and refund revocation tests. No checkout/provider/API or production entitlement store is connected. Readiness is explicitly NOT ready to charge for generic recommendations; provider integration, persistent monotone event state and human diagnosis validation remain required before a separate owner approval.

Domain inventory: target custom-domain list empty, unrelated existing veterans routes unchanged; DNS-record API read denied (403). Public CNAME/A/AAAA returned ENOTFOUND but do not replace dashboard verification. Prepared production config passed dry-run; scans remain disabled there. Canonical homepage/share metadata and optional redirects use validated environment-specific origins. No target DNS or custom-domain route was activated.

Final local verification: 281 unit/regression/cross-language/payment/security tests pass; Worker integration passes 34 assertions including historical 1.0.0 share preservation and canonical metadata; eight desktop/mobile browser checks pass, with zero axe violations in tested views. TypeScript/Vite and staging/production-example dry-run bundles pass; npm audit reports zero known vulnerabilities. Full existing-staging live smoke was attempted but blocked by GitHub HTTP 429 RATE_LIMITED before report creation. Homepage/CSP and health checks passed beforehand; no temporary share was created in that failed run. Do not claim a successful U2 external staging rollout. Resolve the public GitHub quota or configure a minimal public-read service credential, then repeat smoke after an approved rollout.

Review branch: u2/scoring-accuracy-readiness. Source delivery is a draft PR for review, not a production or staging deployment. Generated runtime artifacts, credentials and operational inventory stay Git-ignored. CI/PR links and exact pushed commit are reported in the task result.

Next: review the source/validation and approve rollout as required by the U2 request; verify DNS records with sufficient read permission before domain activation. Production and live checkout require explicit owner approval. The proposed premium price never changes scores, coverage or free recommendations.

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
