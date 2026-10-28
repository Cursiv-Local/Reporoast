# Scoring specification — 2.0.0

Analyzer 0.2.0. A deterministic **structural practices score**, not code quality, execution evidence, security certification or a test result. The frozen 1.0.0 specification remains in docs/history/SCORING-v1.0.0.md and its engine in src/shared/legacy/v1.ts.

## Evidence and interpretation

Presence means a path exists. Configuration means a bounded data parser or stated text rubric inspected structure. Invocation means configuration/docs reference a recognized command; it has not run. Actual execution evidence and verified behavior are not ingested and both remain zero. GitHub metadata is a scan-time API snapshot, not historical commit settings. The README section rubric measures content length/structure, not adequate teaching. Test declarations do not prove passing tests. Workflow parsing is a supported structural subset, not full GitHub schema validation or service activation.

## Categories

- Documentation: 200
- Testing and CI: 200
- Project Structure: 150
- Security Hygiene: 150
- Maintainability: 150
- Contributor Readiness: 100
- Repository Metadata: 50

All budgets total 1000. There are 24 stable IDs: 22 scored practices and 2 explicitly unscored informational signals. Largest-remainder allocations use stable category/rule order for ties.

## Deterministic normalization and unknown evidence

1. Detect profile from parsed Node/Python/Rust/Go metadata, GUI dependencies, entry points and a complete documentation tree. Explicit corrections are visible and scores across profiles are not directly equivalent. Ambiguous projects remain general. There are no owner-name, popularity or payment inputs.
2. Exclude ineligible rules. Within each category redistribute original maxima over eligible rules; redistribute completely empty categories over remaining category budgets. Every allocation uses floor plus descending fractional remainders, ties in stable rule/category order.
3. Coverage is the applicable integer weight with known evidence divided by 1000. It is **not** source-code coverage or merely the fraction of checks executed. Unknown rules have null awards, null conditional maxima and no gain. Incomplete trees cannot establish missing paths. Required uninspected/oversized/opaque content remains unknown.
4. For the headline **conditional score**, apportion 1000 across known weights; award round(effectiveMaximum × satisfactionRatio) per rule and sum. Withhold the number below 80% weighted evidence, 8 known checks or 3 known categories.
5. Also display the **possible score interval**: minimum = sum(round(originalApplicableWeight × knownRatio)); maximum = minimum + all unknown applicable weights. This interval uses original applicable weights, not the conditional allocation. It exposes uncertainty; it is not a verified behavior guarantee.
6. Potential gain = conditional effectiveMaximum − conditional awardedPoints. Gains are integers from the same allocation, conditional estimates, and exclude unknown/ineligible rules. Sort importance, gain, effort and stable ID. MET02 is retired, so there is no duplicate licensing gain. Multiple independent practices can change in one commit; each rule is counted once.

## Applicability

Code checks TST01–04, STR02, SEC02–04 and MNT01–03 are excluded for documentation-only profiles. Dependency rules require observed third-party dependencies in supported manifests/requirements; unavailable applicability is unknown. MNT03 is excluded for library profiles rather than imposing an application lock convention. GitHub-specific TST03/SEC04 are excluded when a complete tree has no GitHub workflow; other CI providers are not penalized for GitHub-only settings. SEC03 applies only when tracked .env or example/template paths show environment-file use. No .env use is assumed from language or repository size. CON03 and MET02 are always unscored; no compulsory community code of conduct or SPDX-recognition penalty.

## Bounded data interpretation

YAML 1.2 rejects duplicates, aliases, merges and unknown executable tags. TOML/JSON/JSON5 are parsed as data. Input cap 96 KB/file, 400 KB total, 24 blobs, 30 HTTP calls, 20-second abort. Decoded object traversal caps depth at 40 and nodes at 12000. No repository JS/Python config is imported. Tool scripts are followed only through literal tree-allowlisted references; commands are never run. Script aliases are bounded to depth 5 and cycle checked. Echoes/comments, disabled steps and help/version-only test commands are not test invocation evidence. Reusable/external/dynamic indirection that cannot be resolved remains unknown.

## Rule rubric

Common conditions: pass = ratio 1; fail = observed supported evidence yields 0 or a required path is absent from a complete tree; partial = explicit fraction; unknown = required evidence unavailable/unsupported; ineligible = documented scope exclusion. Known observations have medium confidence for their limited structural conclusion; unknown has low confidence. Exact blob/tree links pin commits. Line anchors are supplied for direct section/tool/permission matches when identifiable. No source snippets or suspected credentials are displayed.

### DOC01 — Provide a substantive root README

Category: Documentation. Base maximum: 40. Method: content. Version: 2.0.0.

Root README substantive nonheading prose ≥100 characters; nonempty outline gets 1/4.

Fix: Describe project purpose and entry points in the root README; replace placeholders with useful prose. Difficulty: Easy (practice-level estimate, not a code-specific prediction). Priority 2/5. Evidence/applicability/unknown/rounding follow the common contract above.

### DOC02 — Describe concrete setup steps

Category: Documentation. Base maximum: 60. Method: content. Version: 2.0.0.

Root README or contributor setup/get-started/build section with ≥60 characters of supporting nonheading content; heading-only outline 1/4.

Fix: Add concrete prerequisites and setup steps to the root README or contributor guide. Difficulty: Easy (practice-level estimate, not a code-specific prediction). Priority 2/5. Evidence/applicability/unknown/rounding follow the common contract above.

### DOC03 — Explain usage or document navigation

Category: Documentation. Base maximum: 60. Method: content. Version: 2.0.0.

Root usage/examples/navigation/what-you-can-do section with ≥60 characters; outline 1/4.

Fix: Describe a usage example, get-started workflow or document navigation with supporting content. Difficulty: Easy (practice-level estimate, not a code-specific prediction). Priority 2/5. Evidence/applicability/unknown/rounding follow the common contract above.

### DOC04 — Describe scope or supported requirements

Category: Documentation. Base maximum: 40. Method: content. Version: 2.0.0.

Root scope/limits/requirements/platform/privacy section with ≥60 characters; outline 1/4.

Fix: Explain supported platforms, requirements, scope or limitations beneath the appropriate heading. Difficulty: Easy (practice-level estimate, not a code-specific prediction). Priority 2/5. Evidence/applicability/unknown/rounding follow the common contract above.

### TST01 — Include recognizable test declarations

Category: Testing and CI. Base maximum: 40. Method: content. Version: 2.0.0.

Selected non-vendor test file has anchored supported Python/JS/Go/Rust/Java test declarations. Uninspected required test content is unknown.

Fix: Include tests with recognizable assertions or declarations. This does not establish that tests pass. Difficulty: Moderate (practice-level estimate, not a code-specific prediction). Priority 4/5. Evidence/applicability/unknown/rounding follow the common contract above.

### TST02 — Provide parseable CI job configuration

Category: Testing and CI. Base maximum: 30. Method: content. Version: 2.0.0.

At least one parsed supported CI config has nonempty trigger/job/step structures; unsupported or malformed configs unknown. GitHub runner declaration required for local-step jobs.

Fix: Provide valid supported CI jobs/steps. Configuration is not evidence of a successful run. Difficulty: Moderate (practice-level estimate, not a code-specific prediction). Priority 4/5. Evidence/applicability/unknown/rounding follow the common contract above.

### TST03 — Reference a test invocation in CI

Category: Testing and CI. Base maximum: 90. Method: content. Version: 2.0.0.

At least one recognized test command in inspected relevant run steps; bounded manifest/local-script tracing. Non-test workflows do not enter a test denominator. Unresolved indirection without positive evidence unknown.

Fix: Reference the actual test command from at least one relevant CI job. Deployment-only workflows do not each need tests. Difficulty: Moderate (practice-level estimate, not a code-specific prediction). Priority 4/5. Evidence/applicability/unknown/rounding follow the common contract above.

### TST04 — Document verification commands

Category: Testing and CI. Base maximum: 40. Method: content. Version: 2.0.0.

Recognized concrete test commands in README or contributor lines/inline code; no uninspected nested README denominator.

Fix: Document concrete verification commands and their prerequisites in the README or contributor guide. Difficulty: Easy (practice-level estimate, not a code-specific prediction). Priority 3/5. Evidence/applicability/unknown/rounding follow the common contract above.

### STR01 — Publish substantive root license terms

Category: Project Structure. Base maximum: 80. Method: content. Version: 2.0.0.

Substantive root license body ≥150 characters with recognizable terms language; no SPDX or compatibility conclusion.

Fix: Publish actual root license terms. Review licensing choices yourself; GitHub recognition is not required. Difficulty: Easy (practice-level estimate, not a code-specific prediction). Priority 2/5. Evidence/applicability/unknown/rounding follow the common contract above.

### STR02 — Declare useful ignore entries

Category: Project Structure. Base maximum: 30. Method: content. Version: 2.0.0.

Root .gitignore has noncomment entries. Completeness unverified.

Fix: Declare relevant noncomment ignore entries for local/generated files used by the project. Difficulty: Easy (practice-level estimate, not a code-specific prediction). Priority 2/5. Evidence/applicability/unknown/rounding follow the common contract above.

### STR03 — Make an implementation entry point discoverable

Category: Project Structure. Base maximum: 40. Method: tree. Version: 2.0.0.

Recognized flat or grouped source/document entry point exists. This is the explicitly labeled presence check; flat projects are supported.

Fix: Expose an implementation or document entry point. A flat layout is valid; do not add directories for points. Difficulty: Moderate (practice-level estimate, not a code-specific prediction). Priority 1/5. Evidence/applicability/unknown/rounding follow the common contract above.

### SEC01 — Explain private vulnerability reporting

Category: Security Hygiene. Base maximum: 40. Method: content. Version: 2.0.0.

Substantive private vulnerability-reporting guidance with contact/advisory or reporting instructions; service responsiveness unverified.

Fix: Describe a private vulnerability-reporting channel and responsible-disclosure instructions. Difficulty: Easy (practice-level estimate, not a code-specific prediction). Priority 5/5. Evidence/applicability/unknown/rounding follow the common contract above.

### SEC02 — Configure applicable dependency updates

Category: Security Hygiene. Base maximum: 30. Method: content. Version: 2.0.0.

Supported parsed Dependabot v2 updates cover observed ecosystem names and directory/schedule; partial credit is the fraction of observed ecosystems covered; zero coverage earns zero. Renovate uses a declared extends policy; unsupported dynamic configuration unknown.

Fix: Configure supported dependency update tooling for the ecosystems actually used; service activation is not verified. Difficulty: Moderate (practice-level estimate, not a code-specific prediction). Priority 4/5. Evidence/applicability/unknown/rounding follow the common contract above.

### SEC03 — Ignore observed local environment files

Category: Security Hygiene. Base maximum: 20. Method: content. Version: 2.0.0.

Observed environment convention covered by supported ordered .env patterns; exceptions respected; complex negations unknown. Tracked environment paths limit credit to 1/2 even if ignored.

Fix: Ignore observed environment-file paths and review ordered exceptions. Ignore rules do not remove already tracked files. Difficulty: Easy (practice-level estimate, not a code-specific prediction). Priority 5/5. Evidence/applicability/unknown/rounding follow the common contract above.

### SEC04 — Declare scoped workflow token policies

Category: Security Hygiene. Base maximum: 60. Method: content. Version: 2.0.0.

Every inspected job has a valid known-scope permission map inherited or overridden at job level. Scoped reads/writes/none receive declaration credit; read-all 1/2, write-all 0. Unspecified/malformed defaults unknown, never assumed insecure.

Fix: Declare workflow or job-level permissions; review broad grants. Scoped release writes are not automatically unsafe. Difficulty: Moderate (practice-level estimate, not a code-specific prediction). Priority 5/5. Evidence/applicability/unknown/rounding follow the common contract above.

### MNT01 — Declare formatting settings or commands

Category: Maintainability. Base maximum: 30. Method: content. Version: 2.0.0.

Native formatter invocation or supported parsed formatting settings (including pyproject tool sections). Empty native JSON default configuration 1/2; opaque executable JS unknown.

Fix: Configure native formatting settings or declare a formatting command. Repository JS configuration is never executed. Difficulty: Easy (practice-level estimate, not a code-specific prediction). Priority 1/5. Evidence/applicability/unknown/rounding follow the common contract above.

### MNT02 — Declare static analysis settings or commands

Category: Maintainability. Base maximum: 50. Method: content. Version: 2.0.0.

Native static-analysis invocation or supported parsed settings, including Ruff/mypy/Python sections, TypeScript tsc --noEmit, go vet and cargo clippy. Opaque JS unknown.

Fix: Declare applicable lint/static-analysis settings or commands, including native ecosystem tools. Difficulty: Moderate (practice-level estimate, not a code-specific prediction). Priority 3/5. Evidence/applicability/unknown/rounding follow the common contract above.

### MNT03 — Record ecosystem dependency reproducibility

Category: Maintainability. Base maximum: 50. Method: content. Version: 2.0.0.

Ecosystem-specific pins/hashes/checksums in inspected content. Python exact requirements pins 1/2, all declaration hashes full; Rust parsed package version/checksum structure; Go checksum records (not a lockfile); Node declared direct dependency lock entries/integrities. No install or dependency-resolution verification. Unsupported formats/bodies unknown.

Fix: Use ecosystem-appropriate dependency pins/hashes/checksums. Their presence does not prove installs succeed. Difficulty: Easy (practice-level estimate, not a code-specific prediction). Priority 3/5. Evidence/applicability/unknown/rounding follow the common contract above.

### MNT04 — Record substantive change notes

Category: Maintainability. Base maximum: 20. Method: content. Version: 2.0.0.

Root changelog/change notes have substantive nonheading content ≥100 characters; required unread content unknown.

Fix: Record concrete changes instead of a placeholder. Required unreadable content remains unknown. Difficulty: Easy (practice-level estimate, not a code-specific prediction). Priority 1/5. Evidence/applicability/unknown/rounding follow the common contract above.

### CON01 — Explain contributor setup or verification

Category: Contributor Readiness. Base maximum: 75. Method: content. Version: 2.0.0.

Root README/contributor guidance ≥150 characters describing contributing/development/verification process; no onboarding success claim.

Fix: Explain contributor setup, verification and the contribution process using substantive guidance. Difficulty: Easy (practice-level estimate, not a code-specific prediction). Priority 2/5. Evidence/applicability/unknown/rounding follow the common contract above.

### CON02 — Provide substantive issue templates

Category: Contributor Readiness. Base maximum: 25. Method: content. Version: 2.0.0.

Meaningful Markdown issue questions ≥100 characters or parsed named YAML form with labeled input controls.

Fix: Provide useful issue questions or structured fields. Template presence does not prove responsiveness. Difficulty: Easy (practice-level estimate, not a code-specific prediction). Priority 1/5. Evidence/applicability/unknown/rounding follow the common contract above.

### CON03 — Optional community conduct guidance (unscored)

Category: Contributor Readiness. Base maximum: 0. Method: tree. Version: 2.0.0.

Optional conduct guidance. Always excluded from numerical score/gains.

Fix: Community conduct policies are optional and carry no numerical penalty. Difficulty: Easy (practice-level estimate, not a code-specific prediction). Priority 1/5. Evidence/applicability/unknown/rounding follow the common contract above.

### MET01 — Provide a repository description snapshot

Category: Repository Metadata. Base maximum: 50. Method: metadata. Version: 2.0.0.

Nonempty scan-time description ≥12 characters. Contextual metadata only, not technical quality.

Fix: Provide a concise GitHub repository description; this is mutable scan-time metadata. Difficulty: Easy (practice-level estimate, not a code-specific prediction). Priority 1/5. Evidence/applicability/unknown/rounding follow the common contract above.

### MET02 — GitHub license recognition (unscored)

Category: Repository Metadata. Base maximum: 0. Method: metadata. Version: 2.0.0.

GitHub SPDX recognition recorded informationally only; always excluded from numerical score/gains.

Fix: GitHub license recognition is informational, unscored and not a legal conclusion. Difficulty: Easy (practice-level estimate, not a code-specific prediction). Priority 2/5. Evidence/applicability/unknown/rounding follow the common contract above.

## Commentary and tiers

Mode switching is a presentation operation over one report. Template selection uses stable repository identity/commit/rule FNV-1a hash. Unknown findings use professional text. 0–199 Digital Crime Scene; 200–399 Spaghetti Factory; 400–599 Held Together by Hope; 600–749 Certified Spaghetti; 750–899 Actually Pretty Solid; 900–1000 Suspiciously Competent. Labels are entertainment, not certifications.

## Known bounds

This is not a semantic documentation reviewer, a full YAML/CI validator, legal license classifier, dependency resolver, secret scanner or execution verifier. Native/version-specific and monorepo alternatives can remain unsupported. Reviewed fixtures test a finite recognition set, not all projects. Profile corrections are user declarations; disclose them rather than treating cross-profile scores as rankings. Existing reports retain their original versions and retention periods.
