# Deployment

Staging is deployed at https://reporoast-staging.joshua-1993-winkler.workers.dev with scans enabled, generated HMAC/admin secrets, and test limits of 10 submissions/IP/day, 30 globally/day and 2 concurrent scans. A live Edge smoke passed for HTTPS/CSP, GitHub ingestion, modes, desktop/mobile accessibility, PNG download, explicit sharing/OG, removal, and mobile layout. Test shares were removed. Repeat with npm run smoke:staging.

No production service, Cloudflare account plan, DNS record, or cursiv.us configuration was changed. The application deploys independently of Cursiv. The current OAuth login could not read account subscription details (403); no plan or billing change was attempted. Review account billing in the dashboard before increasing test capacity.

## Local

Node 22.12+ (CI uses 24). npm ci --ignore-scripts; npm run check. Run npm run dev:worker and npm run dev in separate terminals after building dist. Default scans are disabled. For a local live test only, supply SCANS_ENABLED=true through Wrangler's local variable override and set ignored .dev.vars with IP_HASH_SECRET (32+ random characters), optional minimal-read GITHUB_TOKEN, and ADMIN_TOKEN (32+ random characters). Never commit .dev.vars or print tokens.

npm run test:e2e exercises installed Edge on desktop/mobile viewports. CI installs Edge explicitly. npm run test:integration bundles the Worker in dry-run and starts Miniflare with mocked GitHub; it does not deploy or use GitHub credentials.

## Review before staging

1. Verify npm run check, npm run test:integration, npm run test:e2e, npm audit.
2. Review SCORING.md and limitations with representative repository fixtures; real-world calibration remains required before public beta.
3. Configure a Cloudflare account on Workers Free. SQLite Durable Objects have free-plan support; no paid plan is needed or automatically enabled. Review current platform allowances at https://developers.cloudflare.com/workers/platform/pricing/.
4. The staging PUBLIC_ORIGIN in wrangler.jsonc is configured to the verified workers.dev URL above; update it if moving accounts.
5. Set secrets independently with wrangler secret put IP_HASH_SECRET --env staging, GITHUB_TOKEN if desired, and ADMIN_TOKEN. Use the secret prompt; do not embed values in commands.
6. Staging deployment and testing were authorized on 2026-10-28. Reproduce with npm run deploy:staging, then npm run smoke:staging. Keep production disabled until its separate release checks are complete.

The Git-ignored .dev.vars.staging stores a local backup of the generated staging HMAC/admin secrets. node scripts/provision-staging.mjs uploads them through stdin and reuses existing values. No personal GitHub OAuth token was copied to the service; staging currently uses unauthenticated public GitHub access and can encounter GitHub rate limits.

Bindings and variables are explicit in each environment because Wrangler does not inherit them. SQLite migrations use the new_sqlite_classes migration. No route or custom domain is configured automatically. Deployment scripts run unit tests, Worker integration tests, browser checks, and build first.

## Production (requires explicit authorization)

Configure production secrets separately. Keep SCANS_ENABLED=false until acceptance checks and representative live evaluations pass. The production Worker has workers_dev:false and no automatic route. After explicit approval for production and DNS, associate roast.cursiv.us as a Worker Custom Domain using Cloudflare's domain UI (requires the cursiv.us zone and managed HTTPS). Do not change apex or other Cursiv records. Set the exact HTTPS PUBLIC_ORIGIN, verify TLS and origin checks, then enable scans and redeploy if authorized.

Per-IP=5/day; global=100/day; concurrency=2. Submission reservations include cache hits and failures. Max global limit enforced by code=500/day. Configure conservative GitHub public-read credentials and monitor rate exhaustion. Public links have separate daily quotas; metrics expose configured limits and API use. The app enforces scan capacity, not a monetary billing cap. Use the Free plan to prevent silently enabling paid usage and inspect the Cloudflare dashboard. With no paid plan enabled, estimated incremental paid infrastructure cost is $0; free quota exhaustion can stop service.

## Admin

GET /api/admin/metrics with Authorization: Bearer ADMIN_TOKEN. Contains aggregate scans, failures, cache hits, duplicate coalescing, GitHub usage and rate rejections, never raw IPs, source bodies or secret values. Use a local authenticated client; never place this token in frontend code.

## Emergency and rollback

Set SCANS_ENABLED=false and deploy the current verified version to disable new scans while retaining shares. For code rollback use wrangler rollback --env staging or --env production and select the last verified deployment; production actions still require authorization. Avoid destructive SQLite migration rollback; v1 adds tables only. Confirm health and switch state after rollback. Rotate GitHub/admin/HMAC secrets after suspected exposure. Existing share tokens can be revoked by deleting shares or the coordinator records; do not delete the Durable Object namespace casually.
