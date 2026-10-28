# Prepared custom domain: roast.cursiv.us

Production remains undeployed. Staging remains at https://reporoast-staging.joshua-1993-winkler.workers.dev. This U2 revision has not been deployed publicly. Do not alter Cursiv routes or DNS, and do not enable checkout, as part of domain preparation.

## Read-only inventory — 2026-10-28

The existing Cloudflare OAuth login can read the active cursiv.us zone, matching Worker routes and account Worker custom domains. It returned existing cursiv.us/veterans and cursiv.us/veterans/* routes to cursiv-veterans, which are unrelated and unchanged. No roast.cursiv.us Worker custom-domain binding was returned. DNS-record API inspection returned 403 Authentication error; **existing target DNS records are not verified**. No mutation was attempted. Reproduce with `node scripts/inventory-cloudflare.mjs`; the credential stays in memory, and sanitized results go to ignored .wrangler/audit.

Public resolver queries for CNAME, A and AAAA returned ENOTFOUND on 2026-10-28. This supports that the hostname is not publicly resolving from the test environment; it does not replace the denied dashboard-record inventory. The production example config passed Wrangler dry-run without deployment, with scans disabled.

## Prepared configuration, not activation

`wrangler.production.example.jsonc` contains the candidate production-only Custom Domain route `{pattern:"roast.cursiv.us",custom_domain:true}`, separate production Worker/namespace, HTTPS public origin, canonical redirects and disabled scans. It is intentionally not the default deployment config; no command in ordinary tests deploys it. Do not deploy it before approval and a successful DNS-record inventory.

`wrangler.jsonc` keeps staging and production separate and leaves production without an active custom-domain route. Homepage HTML canonical/OG URL tags come from the environment's validated PUBLIC_ORIGIN. Share URLs and OG/canonical tags use that same origin and preserve their analyzed commit/scoring versions. A server-side optional 308 redirect uses only configured origin, preserving path/query and rejecting credential/query/path-bearing origin configuration. Redirects remain disabled in staging. Candidate production runs the Worker before assets to apply redirects; this adds Worker request usage and must be included in account monitoring. Static asset security headers remain in public/_headers.

## Approval sequence

1. Obtain DNS-read access or have the owner inspect the target record. Resolve collisions explicitly; do not delete/replace any Cursiv record implicitly. A public DNS response alone is not a complete Cloudflare dashboard inventory.
2. Review local U2 verification, labeled validation limits and existing staging smoke. Obtain approval to deploy the corrected staging revision; test it externally before production.
3. Obtain explicit production/custom-domain approval against the candidate config. Provision production-only HMAC/admin secrets separately. Keep scans disabled initially; no staging secrets copied blindly and no new paid plan enabled.
4. After approval, deploy with the candidate config and production environment. Cloudflare Custom Domains manage target DNS/HTTPS as part of activation: that is a real external change, not a read-only preparation command. Do not change zone-wide SSL/redirect settings or apex records.
5. Verify HTTPS certificate, apex/other Cursiv routes unchanged, production canonical URLs and path-preserving redirects, security headers, health/scan limits and deliberate share/removal. Enable scans only after verification; payments stay unavailable.
6. Record deployed version/commit and owner approval in HANDOFF.md. Use Worker rollback for code incidents, disable scans first if necessary, and review domain rollback separately without removing unrelated records.
