# Architecture

React 19 + Vite + Tailwind 4 frontend; a TypeScript Worker serves static assets and a small same-origin JSON API. No accounts, AI, Python backend, queues, D1, KV, or source-code execution.

Production 0.2.0/rules 2.0.0: src/shared/inspection-facts.ts parses bounded YAML/TOML/JSON5 data and traces declared commands without executing them. src/shared/rules-v2.ts evaluates the documented structural rubric; src/shared/legacy/v1.ts freezes historical behavior for audit/regression. The browser imports presentation helpers and a precomputed fictional example, so parsers and payment preparation are not in the frontend runtime. worker/premium.ts is an unconnected test-only payment domain, disabled by default, and never imports scoring.

Production reporoast-production serves only roast.cursiv.us. Staging reporoast-staging retains its workers.dev origin and separate secrets/SQLite namespace. No binding points production to staging. The guarded production deployment command requires a terminal to preserve Cloudflare's conflict prompts; no Cursiv source or apex/www Worker is part of this deployment.

Static requests normally bypass the Worker. Their security headers are therefore defined in public/_headers (copied by Vite to dist), while API/share responses attach headers in worker/index.ts. The live staging smoke asserts the homepage CSP to catch deployment-routing gaps. See https://developers.cloudflare.com/workers/static-assets/headers/.

## Why one Durable Object

A singleton SQLite-backed Durable Object is the simplest way to enforce global reservations atomically, coalesce in-progress scans, retain expiring summaries, and record aggregate metrics. It is a throughput bottleneck by design for a small beta (default two concurrent scans). SQLite-backed Durable Objects are supported on Workers Free; do not enable a paid plan automatically. See https://developers.cloudflare.com/durable-objects/platform/pricing/.

## Data flow

URL validation → public metadata → exact branch commit → immutable cache lookup → bounded recursive tree and selected blobs → applicability/evidence evaluation → deterministic weighted score → redacted structured report. Profile correction submits another scan; commentary switches locally.

The metadata cache lasts 60 seconds in memory (up to 100 entries); commit SHA is resolved every submission. Results are keyed by stable numeric repository ID, exact commit, analyzer version, rule version, and profile override (auto is a detected-profile alias for that exact scan). A result's own ID always contains its effective profile. Duplicate same-input in-flight scans share one promise. Renamed canonical repositories resolve through same-origin GitHub API redirects. Failed scans are not cached.

GitHub metadata is a timestamped API snapshot, not a historical Git object: description/language/license metadata may change independently of the commit. Cached scores preserve the original snapshot for 24 hours. All file/tree evidence links pin the commit. Metadata evidence links use that commit as repository context; they are not proof of historical settings.

## Limits and evidence

5,000 tree entries; 24 selected blobs; 96,000 bytes/file; 400,000 inspected bytes; 30 HTTP API requests including redirect hops (up to 4 hops per logical request); 2 MB decoded JSON response cap; 20-second abort timer. Generated/dependency/binary paths are skipped. Selected text lockfiles, supported configuration, root/contributor documents, four representative test files and bounded literal local script references are inspected. Required missing bodies are unknown; a filename is not full configuration credit. No arbitrary code is executed. Unavailable blobs are tracked separately. Invalid/truncated trees cannot establish missing paths. A large response is rejected; smaller truncated trees produce partial evidence.

JSON includes inspected/skipped/unavailable paths, byte counts, truncation, SHA, and logical API use. Raw file bodies live only in scan memory. Source manifests can affect applicability and profile detection; unrecognized ecosystems fall back to general.

## API

- POST /api/scan: {url, profile?}; no arbitrary fetch URL.
- POST /api/share: {reportId, consent:true}; accepts only a cached server report.
- GET /s/:id: nonindexed, server-rendered public score summary and OG text metadata.
- GET /api/share/:id: public summary only.
- DELETE /api/share/:id: {removalToken}; admin bearer token is an alternate removal path.
- GET /api/health: public service version and scan switch.
- GET /api/admin/metrics: authenticated aggregate counts and configured limits.

Mutations require a matching Origin header and JSON body capped at 2 KB. Browser requests use same origin. The edge hashes trusted CF-Connecting-IP using HMAC with a daily date component and server secret before sending it to the coordinator. It ignores incoming x-client-key. No IP is stored raw.

## Operational bounds

Default per-IP daily reservations: 5; global daily: 100; max configured global: 500; simultaneous scans: 2 (max 4). Cache hits also consume submission quotas to bound metadata/commit traffic. Coalesced submissions do not consume another scan reservation, but count against 40 submissions/IP/day. Defaults cap logical GitHub scan traffic at 3,000 HTTP requests/day including redirects. Shares: 10/IP/day and 200 global/day. Public summary reads: 200/IP/day and 10,000 global/day. Both are enforced atomically. UTC midnight resets quotas.

Immutable report entries: 24 hours; explicit shares: 7 days; IP quota records: current UTC day; metrics: 7 days. Hourly alarms purge expired rows; every read enforces expiration. Configuration is fail-closed: scans disabled and secrets required. Detailed errors never log repository text or credentials.


## GitHub throttling and recent-head cache

A completed report remains immutable for 24 hours under repository ID, exact commit SHA, analyzer version, rule-set version and selected profile. A separate 60-second pointer keyed by normalized submitted repository, both versions and requested profile allows immediate repeat scans without GitHub access. It can show a head up to 60 seconds old; the displayed commit and original timestamp remain explicit. After expiration, resolve the current commit again; never apply evidence from an older commit to a new one. Changed profiles and versions cannot use that pointer. Cache hits still consume existing abuse/cost reservations.

Each scan performs GitHub requests serially. At most MAX_CONCURRENT scans run in each environment (currently 2), bounding active GitHub fetches to 2. Identical case-normalized inputs/profile coalesce into one scan. A cold scan costs metadata + commit + tree + selected blobs (3 + N, plus redirect hops), capped at 30 actual requests. Warm immutable-cache lookups after the head pointer expires cost 1 commit request with warm metadata, otherwise 2. There are no automatic HTTP retries, so retries contribute zero requests. No rate-limit preflight polling is added.

Primary exhaustion (remaining=0), secondary throttles (403/429 plus upstream signals), invalid credentials (401), and local quota errors are distinct. Admin-only metrics include authentication presence, last response status/remaining/reset/retry-after, and actual requests in the last submission. Header diagnostics contain no token, source, IP, or upstream message. GitHub cooldown state persists in the environment's coordinator, scoped to a one-way credential digest. Every new upstream request checks it, including already-running scans. Retry-After and primary reset deadlines are respected; secondary failures back off across submissions from at least 60 seconds to 32 minutes. No waiting/retry occurs inside the 20-second scan. Recently cached reports remain available subject to existing app quotas. Changing credentials invalidates a cooldown scope; credentials are never rotated automatically. Staging and production coordinators are separate; tokens belonging to the same GitHub user share that user's primary allowance even when the token strings differ. Unauthenticated calls may share Cloudflare egress allowances; they do not share the app's quotas or cache.
