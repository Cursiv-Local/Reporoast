# Privacy and retention

Public repositories only; no accounts or OAuth. Submitting a scan does not publish or index a report. No analytics cookies, tracking SDK, leaderboards, or historical comparisons.

We request public repository metadata, a commit/tree, and selected relevant files from GitHub. Raw source contents are processed in memory and not stored by default. Cached structured reports include repository identity, commit, metadata snapshot, findings without source snippets, evidence paths, inspection accounting, and scores for 24 hours.

Operational quotas retain a daily HMAC of the connecting IP, with a server secret and UTC date. Raw IPs are not persisted by application code. Daily quota records expire at UTC midnight; hourly storage cleanup may lag expiry by up to one hour. Aggregate operational metrics retain 7 days. Metadata memory caches last 60 seconds.

Public links are created only after explicit consent. The summary publishes repository name, exact commit, scan timestamp, score/tier, coverage, profile, versions and category totals. It excludes description, source contents, filenames, detailed findings and recommendations. Links expire after 7 days, enforce noindex/noarchive and Cache-Control:no-store, and are purged by hourly cleanup. Someone with access can still copy a summary.

Remove a share using its creation token in the homepage removal form. The server stores only the token hash. If you lose it, open a RepoRoast issue with the share ID, never a credential or sensitive finding; operators verify requests and can remove via their admin token. Scan caches expire automatically; operators can purge the coordinator's records during incident response. Revoking a public link cannot revoke downloaded images or third-party copies.

GitHub and Cloudflare process requests under their own policies. Cloudflare can process IPs and request data at its edge independently of this application's storage policy. Keep Workers observability disabled unless a reviewed logging/retention configuration is adopted.
