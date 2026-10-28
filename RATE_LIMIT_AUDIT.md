# GitHub rate-limit incident — 2026-10-28

## Root cause and evidence

Live Cloudflare settings inspection found **GITHUB_TOKEN absent in both production and staging**; only ADMIN_TOKEN and IP_HASH_SECRET were bound. No token value was read or exposed. The original application's RATE_LIMITED error is emitted for upstream GitHub responses, whereas internal abuse limits emit CAPACITY.

A staging scan after diagnostic instrumentation reproduced the failure at 2026-10-28T22:59:06Z. GitHub returned HTTP **403**, x-ratelimit-limit **60**, x-ratelimit-remaining **0**, x-ratelimit-reset **1793229640** (2026-10-28T23:20:40Z), x-ratelimit-resource **core**, and no Retry-After header. Authentication was false. One HTTP request was made, with zero retries. This establishes **primary unauthenticated GitHub quota exhaustion** in the reproduced incident. No secondary-limit evidence was observed. Historical production error responses did not record these headers, so their exact upstream headers cannot be reconstructed retrospectively.

GitHub documents the unauthenticated 60-request hourly allowance and the distinction between primary and secondary errors: [rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api), [retry guidance](https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api).

Production's coordinator namespace is 58e45905254e42159c4058d982fb8ef0; staging's is 40f82b244fba4c5095f8d0e9178641e6. Their app quotas, caches and HMAC/admin secrets are independent. Neither initially had a GitHub credential. Unauthenticated requests may encounter shared Cloudflare egress limits; an exact shared egress IP was not measured. Configuring different tokens for the same GitHub user does not isolate that user's primary allowance.

## Requests per scan

| Path | Before | After |
| --- | --- | --- |
| Cold exact-commit inspection | 3 + N selected files, plus redirects | Unchanged: 3 + N, plus redirects |
| Immediate successful repeat | 1 with warm metadata, otherwise 2 | **0** for 60 seconds |
| Unchanged commit after recent-head expiry | 1–2, then immutable result reuse | 1–2, then immutable result reuse |
| Attempt during known GitHub cooldown | At least 1 failed request per submission | **0**, unless serving a recent cached report |
| Automatic retries | 0 | 0 |

The original live octocat/Hello-World smoke used **4** calls (metadata, commit, tree, README). The mocked representative repository uses **8** calls (3 setup + 5 selected files); new integration assertions measure 8 for its cold scan and zero for its recent rescan, including duplicate coalescing. All paths remain capped at 30 HTTP attempts including redirects. No API-rate polling or speculative retries were introduced. Report inspection.requests is the original scan's immutable count; protected lastScan.requests measures the current submission.

## Changes and safety

- Existing 24-hour immutable cache keys include repository ID, exact SHA, profile, analyzer and rules versions. Separate 60-second head pointers allow useful cache reads without upstream availability. Exact analyzed SHA/timestamp remain visible; new heads can take up to 60 seconds to appear.
- Identical normalized repository/profile requests coalesce. Files are retrieved serially; existing two-scan concurrency is preserved.
- Persistent, credential-scoped upstream cooldowns honor Retry-After and primary reset. Secondary failures back off across submissions from 60 seconds to 32 minutes. No IP/account rotation or delayed automatic retries.
- Public errors identify GitHub primary/secondary/unclassified, invalid service credentials or local app quotas, with Retry-After and retryAt when available. Missing upstream classification evidence is explicitly unclassified.
- Protected diagnostics record safe rate headers, authentication presence and actual HTTP counts, never token values, source bodies or upstream messages.
- All per-IP/global scan quotas, request/byte/file caps, kill switch, sharing protections and payment configuration remain unchanged. Failed/cached submissions continue consuming the existing scan reservations. No paid services were enabled.
- Dedicated server-secret setup and verification are documented in DEPLOYMENT.md. The existing broad developer GitHub CLI credential was not copied into the service.

## Verification status

Local unit/integration/browser checks and live authenticated staging/production outcomes are recorded in HANDOFF.md. Staging's first live test correctly surfaced the exhausted primary quota and its retry deadline. A second live submission at 23:03:56Z returned the same primary cooldown with **zero** additional GitHub calls (Retry-After 1004 seconds). All 306 unit tests, 45 Worker integration assertions and 8 desktop/mobile tests passed; branch CI and GitGuardian passed. Draft PR: https://github.com/Cursiv-Local/Reporoast/pull/2. Successful live scan/cache validation must follow secure owner provisioning of GITHUB_TOKEN; production deployment remains gated on staging success.
