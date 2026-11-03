# Deployment

Production is live at **https://roast.cursiv.us**.

| Environment | Worker | Public origin |
|---|---|---|
| Production | reporoast-production | https://roast.cursiv.us |
| Staging | reporoast-staging | https://reporoast-staging.joshua-1993-winkler.workers.dev |

Production runs analyzer 0.2.0 / rules 2.0.0. Staging now runs the same scoring rules with the rate-limit incident fixes; see RATE_LIMIT_AUDIT.md. The owner explicitly authorized production and the roast subdomain on 2026-10-28. Live payments remain unimplemented and disabled.

## Account and domain

Cloudflare account: 4d696ef5a03fc9671ee6e99df25a9ba1. Active cursiv.us zone: 08a275b81c4a8ba471461d3a0b50d96b.

wrangler.jsonc is the deployment source of truth. Production has workers_dev:false, preview_urls:false and exactly one Custom Domain: roast.cursiv.us. No wildcard route, apex replacement, manual DNS record or zone-wide redirect/SSL change was made.

Direct DNS-record listing is denied by the current OAuth scopes. Cloudflare's non-applying Custom Domain changeset preflight confirmed a clean addition: no updated, removed or conflicting records. The isolated Worker was first uploaded disabled with no public target so preflight could run. Wrangler then created the managed DNS/HTTPS connection.

Installed Wrangler can auto-override conflicts in non-TTY mode. The production deploy script requires an interactive terminal and preserves conflict prompts. Never accept replacement of another origin/record without explicit authorization; never bypass conflict checks with --yes.

Code deployment: 8876c7d5-3b25-4b2e-8158-497b28a0df25. Initial disabled bootstrap: 4a75e635-d082-487b-94d6-1cb718c922a5.

## Isolation and configuration

Each Worker owns its own SQLite Coordinator Durable Object namespace and ASSETS binding. Live namespace IDs differ. A production test share was absent from staging. No KV, D1, R2, queue or payment database is required.

Production variables: PUBLIC_ORIGIN=https://roast.cursiv.us, CANONICAL_REDIRECTS=true, SCANS_ENABLED=true, DAILY_LIMIT=100, IP_LIMIT=5, MAX_CONCURRENT=2. Staging keeps its own origin, 30/day global limit, 10/IP/day and two concurrent scans. UTC reservations include cache hits/failures.

Each environment needs independent IP_HASH_SECRET and ADMIN_TOKEN values (at least 32 random bytes). Production values were freshly generated, checked for non-reuse against staging, and uploaded through stdin. Local backups are Git-ignored .dev.vars.production and .dev.vars.staging; never commit or print them.

GITHUB_TOKEN is supported as a minimal public-read server credential. The initial unauthenticated production smoke passed, but subsequent testing exhausted the 60/hour upstream quota. Configure a dedicated Worker secret before authenticated release verification. No personal GitHub OAuth credential was copied. See the incident report below and RATE_LIMIT_AUDIT.md.

## Required Cloudflare permissions

Worker Editor / Workers Scripts Write for the relevant Worker, Zone Workers Routes Write for cursiv.us, and Zone Read for discovery. Secret binding updates use Worker script permissions. DNS Read is optional for direct inventory; managed Custom Domains provision the target record/certificate without manual DNS Edit. No paid plan was enabled. References: https://developers.cloudflare.com/workers/authorization/workers/ and https://developers.cloudflare.com/workers/configuration/routing/custom-domains/.

If login expires or Cloudflare requires owner authentication/approval, stop for the owner. Do not import another application's credential or broaden permissions silently.

## Deployment commands

Use Node 24 and npm ci --ignore-scripts.

- npm run deploy:staging — verifies then deploys staging.
- npm run smoke:staging — live staging browser test; creates/removes one test share.
- npm run deploy:production — from an interactive terminal; verifies, checks scope and deploys production with conflict prompts.
- node scripts/provision-production.mjs — generates or reuses independent production HMAC/admin secrets for the existing Worker.
- npm run smoke:production — live production HTTPS, ingestion, cache repeat, modes, PNG, share/removal, isolation, mobile and axe checks.
- node scripts/production-postflight.mjs — compares existing sites/bindings with the recorded initial preflight baseline.

scripts/production-preflight.mjs is for initial clean activation and intentionally refuses an already-bound target. It calculates a plan without applying it. Initial bootstrap and operational evidence are ignored under .wrangler/production. Future normal updates retain the existing Custom Domain through interactive Wrangler.

Local: npm run build, npm run dev:worker, and npm run dev in separate terminals. Local scans default disabled; see README.md.

## Verified live, 2026-10-28

Passed HTTPS certificate validation in Node and Edge; homepage/canonical URL/CSP; health 0.2.0; actual octocat/Hello-World analysis at 7fd1a60b01f91b314f59955a4e4d4e80d8edf11d (60/1000, full rule-evidence coverage, four original API calls); immutable deterministic cache repeat; Roast/Serious modes; desktop/mobile axe; PNG download; production-domain share/OG URLs and removal; production share absent from staging; zero page errors; unauthenticated admin rejected; generated secrets absent from public responses. Built production assets contain no staging URL.

cursiv.us and www.cursiv.us remain on the original cursiv-web production binding. Their homepage SHA-256 values and the staging response were byte-identical before/after. Existing veterans routes were unchanged. Temporary test shares were removed.

Evidence: ignored .wrangler/production/preflight.json, postflight.json, and .wrangler/production-smoke/result.json plus screenshots/PNG. Automated verification is summarized in HANDOFF.md. No submitted repository code was executed.

## Rollback and operations

Disable scans first: set production SCANS_ENABLED=false and deploy the verified config, preserving the domain/storage. Inspect wrangler deployments list --env production, then use wrangler rollback <verified-version-id> --env production for a known good version. Confirm health, variable values, secret bindings and the domain afterward; the initial disabled bootstrap predates secret provisioning.

Code rollback is not a DNS/domain rollback. Never delete an unrelated route, the production namespace or SQLite data to repair code. Retain original scoring versions and expiry on cached reports/shares. Rotate secrets after suspected exposure.

GET /api/admin/metrics requires ADMIN_TOKEN and exposes aggregate quotas/cache/failure/API counts, not raw IPs/source. Monitor account usage and public GitHub quotas; application limits are not a currency billing cap. Live checkout requires separate future owner approval.


## GitHub authentication and rate-limit diagnostics

Both deployed environments were initially missing GITHUB_TOKEN. Configure a dedicated GitHub public-repository read credential as a Worker **secret**, never a Wrangler plaintext variable, Vite variable, browser setting or committed file. Use only the permissions needed to read public repository metadata and contents. Do not copy a developer's broad GitHub CLI credential. A token with private access does not enable private scanning: the application still rejects private metadata.

From a trusted interactive terminal in this repository, use the hidden Wrangler secret input:

```powershell
npx wrangler secret put GITHUB_TOKEN --env staging
# Verify staging first, then configure the production binding:
npx wrangler secret put GITHUB_TOKEN --env production
```

Alternatively use each Worker's Cloudflare Settings / Variables and Secrets, type Secret. Do not paste tokens in chat or shell command arguments. Secret updates can deploy a Worker revision; record that revision and test staging before production. No account plan, subscription, billing or cost limit change is required. A token is not created by this repository. Provisioning the HMAC/admin secrets does not overwrite GITHUB_TOKEN.

Verify presence using `npx wrangler secret list --env staging` (then production). Verify actual authenticated requests through the protected `/api/admin/metrics`: github.authenticated must be true, and github.lastResponse.authenticated must be true after a scan. Never print the Authorization header. Look at lastResponse.status, remaining, limit, reset (UTC epoch seconds), retryAfter and kind. lastScan.requests includes redirect attempts and all actual HTTP calls; automaticRetries is zero. Existing githubRequests is the aggregate. Diagnostics expire after 24 hours and are not published in share previews. Primary reset and secondary cooldown errors include Retry-After plus a UTC retryAt; local daily quota errors identify RepoRoast explicitly and reset at UTC midnight. Do not clear quotas to make smoke tests pass or make requests before GitHub's deadline. Two service tokens owned by the same GitHub user still share its primary quota.

Run `npm run verify`, deploy staging, then run `npm run smoke:staging`. Only deploy production after staging passes. Keep the production terminal guard; do not use --yes. Run `npm run smoke:production` and inspect protected metrics afterward. A cached response retains the original scan's request count; use lastScan.requests or aggregate deltas to measure the resubmission cost. Head changes may take up to 60 seconds to appear.
