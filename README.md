# RepoRoast by Cursiv

**Your repo is public. Here’s the evidence.**

An independent, zero-AI public GitHub repository health analyzer. React/Vite frontend, TypeScript Worker, and one SQLite-backed Durable Object. No Python backend, OAuth, accounts, repository code execution, or Cursiv package dependencies.

## Included

- 24 versioned deterministic rules across seven categories, scored out of 1000.
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

verify runs 103 unit tests, TypeScript/build checks, 31 Worker integration assertions in Miniflare, and 8 desktop/mobile Edge Playwright tests. Tests mock GitHub and need no API access. Browser tests run axe accessibility checks on the landing page and results. If Edge is unavailable, install it using `npx playwright install --with-deps msedge`.

`npm run smoke:live` is a separate opt-in check of octocat/Hello-World using unauthenticated GitHub requests. It is not run in CI and publishes nothing. Its local report is ignored under .wrangler/smoke.

## Documentation

- [Architecture](ARCHITECTURE.md): ingestion, quotas, cache, API and retention.
- [Scoring](SCORING.md): every rule, applicability, rounding, coverage, evidence and conditional gains.
- [Security](SECURITY.md) and [Privacy](PRIVACY.md).
- [Deployment](DEPLOYMENT.md): local setup, staging/production secrets, DNS/HTTPS and rollback.
- [Roadmap](ROADMAP.md) and [Handoff](HANDOFF.md): verified work and release gates.

## Deployment status

Staging is live: https://reporoast-staging.joshua-1993-winkler.workers.dev

Live scans are enabled on staging with limits of 10 submissions/IP/day, 30 globally/day and 2 concurrent scans. A real browser smoke verified scanning, modes, desktop/mobile accessibility, downloads, explicit sharing and removal. Run `npm run smoke:staging` to repeat it; the script consumes a small number of GitHub requests and creates/removes one temporary test share.

Staging service secrets were generated and uploaded without exposing their values. The local backup is in Git-ignored `.dev.vars.staging`; never commit it. `node scripts/provision-staging.mjs` reuses that backup rather than rotating existing values.

Production remains disabled and no DNS was changed. Broader ecosystem calibration remains a public-beta release gate. Production deployment and cursiv.us DNS changes require explicit authorization.

Built independently for Cursiv. The Cursiv repository has not been modified.
