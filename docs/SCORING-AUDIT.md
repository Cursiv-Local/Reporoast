# RepoRoast U2 scoring audit

Audit baseline: `587466e`, analyzer 0.1.0, rules 1.0.0. This audit precedes implementation. Frozen source: `src/shared/legacy/v1.ts`; historical specification: `docs/history/SCORING-v1.0.0.md`.

## Principal findings

The original score overstates what path/keyword recognition establishes. Empty files, commented commands and bare README headings can earn credit. Tests prove recognition, not accuracy against labeled evidence. Python/native-tool conventions are missed. Every GitHub workflow is expected to test, including deployment workflows. Security confidence is overstated. License metadata duplicates the license-file penalty. Unknown evidence reallocates its weight to known checks, potentially turning missing evidence into a higher conditional score. Source sampling ignores contributor verification instructions and all lockfile bodies. The tree is case-folded for many checks despite Git being case-sensitive.

The correction must describe a **structural practices score**, distinguish observed paths, parsed configuration, referenced execution and actual execution/verified behavior, and never claim to have run tests. An execution API or test artifact is not currently ingested: execution and verified-behavior coverage must stay zero. Absence of a parsed setting does not establish an insecure platform default.

## All 24 rules

| ID | v1 max | What v1 actually proves | Defect / gaming opportunity | Proposed correction |
|---|---:|---|---|---|
| DOC01 | 60 | Some readable matching README has nonwhitespace text | One character and nested unrelated README count | Root README with substantive prose; smaller weight; no adequacy claim |
| DOC02 | 50 | Keyword occurs anywhere | Bare heading, badge or unrelated setup word passes | Meaningful setup section with steps/command; root README and linked contributor docs; distinguish partial outline |
| DOC03 | 50 | Singular usage/example keyword occurs | Actual “What you can do” guidance missed; empty examples pass | Meaningful usage/navigation/get-started section; prose/steps needed |
| DOC04 | 40 | Scope/requirements keyword occurs | Empty heading passes; synonyms missed | Content under supported-platform/limits/scope heading; structural completeness only |
| TST01 | 60 | A test-like path exists | Empty/comment-only files pass; Python test_ prefix incomplete | Bounded test declarations/content or configured native test target; no claim tests pass |
| TST02 | 50 | Recognized provider filename exists | Empty/invalid YAML passes | Parse supported CI syntax and require jobs/steps, classify unsupported semantics as unknown |
| TST03 | 60 | Every inspected workflow contains test regex | Deployment/docs workflows penalized; aliases, python test scripts and node --test missed; comments can pass | At least one reachable test invocation in valid steps; follow bounded local scripts/manifest aliases without executing; dynamic/external indirection unknown |
| TST04 | 30 | README text matches test keyword | CONTRIBUTING ignored; uninspected nested README makes evidence unknown | Actual verification commands in root README or contributor guidance; distinguish references from execution |
| STR01 | 60 | A license-like filename exists | Empty license and dependency licenses count | Read root license body; identify available terms without legal compatibility claims |
| STR02 | 40 | .gitignore path exists | Empty/comment-only file passes | Noncomment ignore entries or applicable native policy; not proof all generated files ignored |
| STR03 | 50 | A conventional directory exists | Flat small projects penalized, empty scaffolds rewarded | Accept flat implementation entry files and manifest entry points; assess discoverability only |
| SEC01 | 50 | SECURITY.md filename exists | Empty policy passes; no actual private channel | Meaningful private reporting guidance/contact; not a claim of response or security |
| SEC02 | 40 | Dependabot/Renovate filename exists | Empty config passes; dependency-free projects penalized | Parse supported configuration, check active ecosystem coverage; unknown dependency applicability stays unknown |
| SEC03 | 30 | .env ignore regex matches | Assumes every project uses .env; negations missed | Applicable only with observable environment-file use; ordered root ignore evaluation for supported patterns, complex patterns unknown |
| SEC04 | 30 | Top-level permissions key exists in every workflow | Job policies missed; write-all, null and invalid values pass; unknown default penalized | Parse inheritance and job-level policies; broad grants flagged; scoped release writes explicitly not called unsafe; unspecified defaults unknown |
| MNT01 | 35 | Known standalone formatter/editor path exists | pyproject sections and native defaults missed; empty files pass | Parsed Python/JSON/editor settings or real CI/manifest formatting command; JS config never evaluated |
| MNT02 | 40 | Known standalone lint path exists | Embedded Ruff/mypy and native go vet/clippy missed | Parse embedded tools and inspect explicit lint/static-analysis invocations; distinguish opaque executable config |
| MNT03 | 40 | A short allowlist lock filename exists | requirements-release.lock missed; Go sum misrepresented as lock; empty/generated files earn all points | Ecosystem-specific dependency reproducibility checks; Python exact pins/hashes, Go module/checksum evidence, native lock syntax; library conventions and missing bodies explicit |
| MNT04 | 35 | Changelog-like path exists | Empty file passes; large unread changelog awarded full credit | Substantive change notes; oversized required content unknown |
| CON01 | 40 | Contributor filename exists | Empty guide passes; relevant README instructions missed | Substantive contributor setup/verification guidance with precise evidence |
| CON02 | 30 | Issue template extension/path exists | Empty templates rewarded; template service availability unverified | Parse structured forms or meaningful Markdown questions; structural only |
| CON03 | 30 | Code-of-conduct filename exists | Mandatory community policy unfair for personal/hobby repos; empty file passes | Retire numerical penalty; optional community guidance remains informational |
| MET01 | 25 | Nonempty API description | One word earns full points; mutable metadata not pinned | Explicitly label scan-time metadata, small contextual signal; never infer code quality |
| MET02 | 25 | GitHub reports a recognized SPDX ID | NOASSERTION penalized even with license text; duplicates STR01 | Retire numerical penalty; keep API recognition as informational diagnostic, no legal inference |

## Priority and fairness decisions

Keep seven published category budgets for continuity; version all within-category allocations and exclusions. Reduce pure presence checks and increase substantive documentation, test-command traceability and configuration inspection. Retire mandatory code-of-conduct and GitHub license-recognition scoring. No repository-specific IDs, owner names, stars, popularity or Cursiv exceptions may enter evaluation.

Unknown evidence must have no awarded or missing points. Use a known-evidence conditional score **and a possible score interval** over the fixed applicable weights; show both and require existing evidence thresholds. Point gains must use that same conditional allocation, never unknown checks. This makes the conditioning visible rather than presenting an incomplete score as final. Preserve all old cached reports/share summaries under their versions; never rescore a historical record in place.

## Cursiv investigation protocol

Reference commit: `efc2f961049b767f0fe49e38304e9e70f25a6955`. Pinned tree and public configuration/docs are captured as fixtures; nothing in Cursiv is modified or executed. API metadata is recorded as a current snapshot, not reconstructed historical state. The supplied 671/1000 report is a claim to reproduce, not a target. If snapshot/ingestion differences prevent exact reproduction, document them and show the reproducible baseline instead of inventing a reconciliation.

Initial source observations: Python `pyproject.toml` contains `[tool.ruff]`, runtime PyQt6 and a setuptools project; `requirements-release.lock` is 68,848 bytes; CONTRIBUTING documents pytest and hashed pip installation; deployment and test workflows have distinct responsibilities. The mac release workflow deliberately requests scoped `contents: write`; the tests workflow omits permissions. A root LICENSE includes MIT terms plus third-party notices; GitHub currently returns NOASSERTION. No root SECURITY.md, update-tool config or issue-template path was observed in the complete pinned tree. Final per-rule decisions and scores follow in the generated validation report.

## Validation requirements

Use independently labeled positive/negative/unknown/ineligible checks across ten repository types, not an expected score per popularity. Report TP/FP/TN/FN and unknown/abstention separately, conditional FPR/FNR denominators and fixture limitations. Include adversarial comments, headings-only docs, empty files, aliases, recursive scripts, malformed/aliased YAML, workflow role differences, lock formats and missing blobs. Store exact commit/provenance for real references. Synthetic fixtures are labeled synthetic, not real-repository evaluations.

## Sources

- [GitHub workflow syntax, jobs, steps and permissions](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax).
- [Bounded YAML parsing and alias controls](https://eemeli.org/yaml/).
- [smol-toml parser](https://github.com/squirrelchat/smol-toml).
- [Pinned Cursiv configuration](https://github.com/Cursiv-Local/Cursiv/tree/efc2f961049b767f0fe49e38304e9e70f25a6955).
