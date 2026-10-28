# RepoRoast by Cursiv

**Your repo is public. Here’s the evidence.**

An independent, zero-AI public GitHub repository health analyzer. React/Vite frontend, TypeScript Worker, and one SQLite-backed Durable Object. No Python backend, OAuth, accounts, repository code execution, or Cursiv package dependencies.

Production: **https://roast.cursiv.us** — analyzer 0.2.0 / rules 2.0.0 report structural practices, evidence levels and an uncertainty interval. See [accuracy audit](docs/SCORING-AUDIT.md), [Cursiv investigation](docs/CURSIV-671-INVESTIGATION.md) and [cross-repository results](docs/VALIDATION-RESULTS.md). Historical scoring versions are preserved. Staging remains independent at https://reporoast-staging.joshua-1993-winkler.workers.dev.

## Included

- 24 stable versioned checks (22 scored, two informational), across seven categories, scored out of 1000.
- Five profiles, explicit applicability, weighted evidence coverage, and insufficient-evidence results.
- Commit-pinned findings, partial credit, effective-weight point gains, and overlapping-license recommendation merging.
- Deterministic Roast / Serious commentary with instant local switching.
- Bounded GitHub inspection, atomic quotas, duplicate coalescing, short-lived caching, redaction, and admin metrics.
- Local clipboard/PNG scorecards and explicit expiring public summaries with removal tokens.
- Responsive, keyboard-accessible interface, reduced motion, and tested mobile layouts.

This is a heuristic assessment, not a security audit, test runner, certification, or proof of correctness. Scores across different profiles or evidence snapshots are not directly comparable.

## Development

Use Node 24 (minimum 22.12) and npm.

```sh
npm ci --ignore-scripts
npm run build
npm run dev:worker
```

In a second terminal run `npm run dev`, then open the URL printed by Vite. Its /api proxy points to Wrangler on 127.0.0.1:8787. The homepage and example work without GitHub access. Live scans default to disabled.

For local scanning, put IP_HASH_SECRET (at least 32 random characters), optional GITHUB_TOKEN (minimal public-read permissions), and optional ADMIN_TOKEN (32+ random characters) in ignored .dev.vars. Start the local Worker with `npm run dev:worker -- --var SCANS_ENABLED:true`. Secrets never belong in frontend environment variables.

## Verification

```sh
npm run verify
npm audit
```

verify runs the unit/scoring/cross-language/security/payment regression suite, TypeScript/build checks, 34 Worker integration assertions in Miniflare, and 8 desktop/mobile Edge Playwright tests. Tests mock GitHub and need no API access. Browser tests run axe accessibility checks on the landing page and results. If Edge is unavailable, install it using `npx playwright install --with-deps msedge`.

`npm run validate:scoring` regenerates the scoring specification, Cursiv investigation, before/after comparison and labeled-check error rates from pinned fixtures. `npm run test:scoring` and `npm run test:premium` run isolated suites. `npm run generate:example` refreshes precomputed browser example data. Premium preparation is test-only and disabled; see [readiness](docs/PREMIUM-READINESS.md). No live checkout is connected.

`npm run smoke:live` is a separate opt-in check of octocat/Hello-World using unauthenticated GitHub requests. It is not run in CI and publishes nothing. Its local report is ignored under .wrangler/smoke.

## Documentation

- [Architecture](ARCHITECTURE.md): ingestion, quotas, cache, API and retention.
- [Scoring](SCORING.md): every rule, applicability, rounding, coverage, evidence and conditional gains.
- [Security](SECURITY.md) and [Privacy](PRIVACY.md).
- [Deployment](DEPLOYMENT.md): local setup, staging/production secrets, DNS/HTTPS and rollback.
- [Roadmap](ROADMAP.md) and [Handoff](HANDOFF.md): verified work and release gates.

## Deployment status

Production Worker **reporoast-production** is live at https://roast.cursiv.us. Staging Worker **reporoast-staging** remains at https://reporoast-staging.joshua-1993-winkler.workers.dev with separate persistent storage and secrets.

The owner authorized production on 2026-10-28. Live production checks passed for HTTPS, real GitHub analysis, deterministic caching, both modes, scorecard download, production-domain sharing/removal, mobile and accessibility. Cursiv/www/staging homepage responses and existing bindings were verified unchanged. Live payments remain disabled. See [deployment](DEPLOYMENT.md) for configuration, permissions and rollback.

Production allows 5 submissions/IP/day, 100 globally/day and 2 concurrent scans. Staging retains 10/IP/day, 30 globally/day and 2 concurrent scans. Run `npm run smoke:production` or `npm run smoke:staging` to verify the selected environment; each uses real public GitHub access and creates/removes one temporary test share.

Independent service secrets are backed up only in Git-ignored `.dev.vars.production` and `.dev.vars.staging`; never commit or print them. Each environment's provision script reuses its own backup. Production does not depend on staging secrets or databases.

Use `npm run deploy:production` from an interactive terminal for verified, scope-checked production updates; use `npm run deploy:staging` for staging. Cloudflare manages only the `roast.cursiv.us` Custom Domain and certificate. The apex/www Cursiv website was not changed. Broader heuristic calibration and paid-recommendation readiness work remain separate from hosting; no live checkout is connected.

Built independently for Cursiv. The Cursiv repository has not been modified.
