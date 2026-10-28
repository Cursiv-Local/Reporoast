# Security

Report vulnerabilities privately using the repository's GitHub Security Advisory feature if enabled. Do not post credentials, private code, or exploit payloads publicly. If private reporting is unavailable, open an issue requesting a private contact without vulnerability details.

Only public GitHub repositories are accepted. A configured token must have minimal public read access; private:true metadata is always rejected. Requests use fixed api.github.com endpoints, redirect:manual, validated redirect hosts and repository endpoint paths, fixed request budgets, response size caps, abort deadlines, and bounded blob selection. No user-provided raw content URL is fetched.

No repository code is run, imported, built, or installed. Symlinks and submodules are not followed. React escapes text; raw Markdown/HTML is never rendered. Public share HTML escapes values. Security headers prohibit scripts from other origins, framing, object URLs for scripts, and external connections. Findings contain no source snippets.

U2 parses only bounded data configurations: YAML aliases/merges/duplicate keys and object prototype keys are rejected, depth/node counts capped, and executable JS configuration remains unknown. Command references are traced through bounded literal tree paths and static manifest aliases; recursion is checked and no command runs. Malformed API tree entries mark evidence incomplete. Premium code is test-only, has no HTTP routes/provider credentials and cannot enable live checkout. Production custom-domain configuration is an inactive example pending explicit approval and completed DNS inspection.

Known credential formats are redacted from metadata and report strings. Redaction is defense in depth, not a secret scanner; the application must never claim no secrets exist. Filenames containing credential patterns are omitted from evidence links and replaced with commit-root context.

Mutation APIs require same-origin requests and bounded JSON. Scans and publication are separately limited by atomic coordinator transactions. Administrative metrics and override removals require a server-side token of at least 32 characters. Secrets belong in Cloudflare secret bindings or ignored local .dev.vars. Public share removal tokens are shown once, stored hashed on the server, and never logged.

Use npm ci --ignore-scripts for application dependency installation. Test fixtures never execute submitted repository commands. Test and build dependencies run only as developer tooling. Use Cloudflare's account request limits, usage dashboard, and edge controls in addition to application scan quotas; quotas cannot eliminate the platform cost of receiving abusive HTTP requests.

No personal developer computer is required after deployment. This project is not a security audit service.
