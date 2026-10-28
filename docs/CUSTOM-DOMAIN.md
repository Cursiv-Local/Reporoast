# Custom domain: roast.cursiv.us — live

Production is deployed and verified at https://roast.cursiv.us on reporoast-production following explicit owner authorization on 2026-10-28. Staging remains separate at https://reporoast-staging.joshua-1993-winkler.workers.dev. Cursiv/apex/www and existing routes were verified unchanged. Checkout remains disabled. Current commands, permissions and rollback are in DEPLOYMENT.md.

## Initial read-only inventory — before activation

The existing Cloudflare OAuth login can read the active cursiv.us zone, matching Worker routes and account Worker custom domains. It returned existing cursiv.us/veterans and cursiv.us/veterans/* routes to cursiv-veterans, which are unrelated and unchanged. No roast.cursiv.us Worker custom-domain binding was returned. DNS-record API inspection returned 403 Authentication error; **existing target DNS records are not verified**. No mutation was attempted. Reproduce with `node scripts/inventory-cloudflare.mjs`; the credential stays in memory, and sanitized results go to ignored .wrangler/audit.

Initial public DNS queries returned ENOTFOUND. After a disabled/no-route Worker bootstrap, Cloudflare's supported non-applying domain changeset confirmed one clean addition with no updated/removed/conflicting records. Interactive Wrangler attached the domain and managed its DNS/HTTPS. Live Node/Edge certificate, hostname, analysis and sharing checks then passed. Direct DNS listing remains permission-limited; the clean conflict preflight supplied the no-replacement check. No manual DNS record was created.

## Active configuration

`wrangler.jsonc` now contains the production-only route `{pattern:"roast.cursiv.us",custom_domain:true}`, separate reporoast-production namespace, HTTPS origin, canonical redirects and enabled scans. The example config mirrors this setup. No ordinary test deploys it. Use the guarded interactive `npm run deploy:production` command for future verified updates.

Homepage canonical/OG URL tags and share URLs use each environment's validated PUBLIC_ORIGIN and preserve report commits/versions. Production 308 redirects target only its configured origin. Staging redirects remain disabled and its existing deployment is unchanged. Production runs the Worker before assets to apply canonical behavior; monitor Worker usage. Static asset security headers remain in public/_headers. Live production and staging namespace IDs differ and a production test share was confirmed absent from staging.

## Historical activation approval sequence and future safeguards

1. Obtain DNS-read access or have the owner inspect the target record. Resolve collisions explicitly; do not delete/replace any Cursiv record implicitly. A public DNS response alone is not a complete Cloudflare dashboard inventory.
2. Review local U2 verification, labeled validation limits and existing staging smoke. Obtain approval to deploy the corrected staging revision; test it externally before production.
3. Obtain explicit production/custom-domain approval against the candidate config. Provision production-only HMAC/admin secrets separately. Keep scans disabled initially; no staging secrets copied blindly and no new paid plan enabled.
4. After approval, deploy with the candidate config and production environment. Cloudflare Custom Domains manage target DNS/HTTPS as part of activation: that is a real external change, not a read-only preparation command. Do not change zone-wide SSL/redirect settings or apex records.
5. Verify HTTPS certificate, apex/other Cursiv routes unchanged, production canonical URLs and path-preserving redirects, security headers, health/scan limits and deliberate share/removal. Enable scans only after verification; payments stay unavailable.
6. Record deployed version/commit and owner approval in HANDOFF.md. Use Worker rollback for code incidents, disable scans first if necessary, and review domain rollback separately without removing unrelated records.
