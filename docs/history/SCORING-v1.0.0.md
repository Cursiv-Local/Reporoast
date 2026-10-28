# Scoring specification

Analyzer 0.1.0 · Rule set 1.0.0. The source of truth is src/shared/engine.ts. Scores measure recognized repository practices, not code correctness, security, popularity, or project size. No AI. No code execution.

## Formula and evidence

Base category budgets: Documentation 200; Testing and CI 200; Project Structure 150; Security Hygiene 150; Maintainability 150; Contributor Readiness 100; Repository Metadata 50 (total 1000).

1. Determine profile from observable evidence or accept an explicit supported override.
2. Exclude not-applicable rules. An unknown rule stays applicable for coverage.
3. Within each nonempty category, redistribute its budget proportionally to eligible rules' base maxima. If a category is entirely ineligible, redistribute its category budget across remaining categories proportionally to their original budgets.
4. All apportionments use largest remainders: floor each exact allocation, then award remaining whole points by descending fractional remainder, ties by stable category/rule order. Coverage weights sum to 1000.
5. Coverage = sum of weights with known evidence / 1000. This is weighted evidence availability, not simply number of executed rules or a fraction of source bytes reviewed.
6. For a conditional score, exclude unknown checks and proportionally apportion their weights across known checks, again with largest remainders. These effective maxima sum to 1000. Award round(effectiveMaximum × satisfactionRatio) for each known check. Unknown checks have null awards/maxima and never become failures or improvement gains. Show coverage alongside every score.
7. A numerical total requires at least 80% weighted coverage, 8 known checks, and 3 known categories. Otherwise show “Insufficient evidence”; partial findings remain available. A complete tree is required for negative path claims, not for every positive finding. Individual evidence can remain unknown even with a complete tree.

The conditional score is reproducible for a fixed commit, metadata snapshot, versions, profile, and ingestion outcome. Missing API evidence can change coverage and effective weights, so compare only equivalent evidence snapshots/profiles. Repository description and GitHub license recognition are scan-time metadata rather than commit-pinned historical facts. Links to the analyzed commit provide repository context for those metadata checks.

## Applicability and profiles

- library: package exports/main/module found in readable root package.json. Lockfile rule MNT03 is excluded because lockfile expectations vary for libraries.
- cli: root package.json has bin; evaluated before library/application.
- application: root package.json has start/dev scripts or React/Next dependency evidence.
- documentation: complete tree is entirely recognized document/static/config extensions, with no recognized package manifest. Heuristic; static sites may need correction.
- general: fallback for unsupported, ambiguous or unreadable manifests. Users can correct this profile.

Code-scoped checks (TST01–04, STR02, SEC03–04, MNT01–02) and package-scoped checks (SEC02, MNT03) are excluded for documentation. Package-scoped checks apply only if a supported manifest path is observed (package.json, pyproject.toml, Cargo.toml, go.mod, requirements.txt, pom.xml, csproj). No recognized manifest in a complete tree makes them ineligible; incomplete tree makes applicability unknown. Not-applicable rules receive no numerical gains. No scoring inputs use stars, followers, forks, activity or popularity.

## Common evaluation contract (every rule, version 1.0.0)

Each row below defines stable ID, category, description, base maximum, method, scope, exact recognition pattern, fix, difficulty and security/reliability priority. Rule definitions include professional copy, two deterministic humorous variants and recommended steps. All tests are pattern heuristics, not semantic audits.

Tree method: match case-insensitive eligible blob paths (excluding symlinks and vendor/generated/dependency directories). At least one match = pass, ratio 1; no matches in a complete tree = fail, ratio 0; incomplete tree with no match = unknown.

Content method: required matching paths must be readable for negative claims. Match the configured case-insensitive, multiline text expression. One successful inspected file = pass for ordinary content checks. No successful text and all recognized matching files read in a complete tree = fail. No matching path in a complete tree = fail. Unavailable/malformed/oversized/skipped required evidence = unknown. DOC01 requires nonempty content. DOC02–04 and TST04 recognize headings or words anywhere in a README; presence is not a review of their adequacy. Nested READMEs may count. Line references point to the matching line when identifiable; no source snippets are returned.

TST03 and SEC04 are excluded when a complete tree has no recognized GitHub Actions workflow. This avoids penalizing alternative CI providers for GitHub-specific settings. Otherwise they are multi-workflow content checks: require a complete tree and every recognized GitHub Actions workflow readable, otherwise unknown. Satisfaction ratio = matching workflows / recognized workflows. Zero = fail; fraction between 0 and 1 = partial; 1 = pass. They recognize textual test references/top-level permission declarations, do not parse all YAML semantics, execute CI or prove least privilege. Valid unsupported alternatives may not match. CI provider presence in TST02 can match GitLab/CircleCI; TST03/SEC04 inspect GitHub Actions only and are ineligible for complete trees without those workflows.

Metadata method: MET01 passes for a nonempty description; MET02 passes for a non-null GitHub SPDX ID other than NOASSERTION. Fail means metadata is observed but unsatisfied; GitHub API failures abort metadata acquisition and never become missing metadata.

Known rule evidence confidence is high for the observed pattern only, never for inferred software correctness. Unknown evidence confidence is low. Failed checks are improvement suggestions; incomplete checks are insufficient evidence. Evidence points to exact commit blobs with line ranges when available, or the exact commit tree for a negative path claim. A missing file is never fabricated as a blob link. Rule descriptions explicitly limit claims to recognized patterns. Credential-like filenames fall back to commit-root evidence.

## Rule registry

### DOC01 — Provide a README

Category: Documentation. Base maximum: 60. Method: content. Scope: all profiles. Version: 1.0.0.

Path expression: `(^|/)readme(\.[\w-]+)?$`.

Text/metadata expression: `\S`.

Evaluation, applicability, evidence, and pass/fail/partial conditions: common evaluation contract above. No partial credit; known satisfaction ratio is 0 or 1.

Fix: Add a README describing the project and its purpose.

Difficulty: Easy, a rough implementation-effort estimate for this practice, not a repository-specific code-change prediction. Priority: 2/5. Suggested steps: implement this fix with the project’s documented tools; rescan the new commit and review applicability.

### DOC02 — Document setup or installation

Category: Documentation. Base maximum: 50. Method: content. Scope: all profiles. Version: 1.0.0.

Path expression: `(^|/)readme(\.[\w-]+)?$`.

Text/metadata expression: `\b(install(?:ation)?|setup|getting started|prerequisites)\b`.

Evaluation, applicability, evidence, and pass/fail/partial conditions: common evaluation contract above. No partial credit; known satisfaction ratio is 0 or 1.

Fix: Document setup prerequisites and installation steps in the README.

Difficulty: Easy, a rough implementation-effort estimate for this practice, not a repository-specific code-change prediction. Priority: 2/5. Suggested steps: implement this fix with the project’s documented tools; rescan the new commit and review applicability.

### DOC03 — Document usage

Category: Documentation. Base maximum: 50. Method: content. Scope: all profiles. Version: 1.0.0.

Path expression: `(^|/)readme(\.[\w-]+)?$`.

Text/metadata expression: `\b(usage|quick start|example|how to use|reading|navigation)\b`.

Evaluation, applicability, evidence, and pass/fail/partial conditions: common evaluation contract above. No partial credit; known satisfaction ratio is 0 or 1.

Fix: Add a concrete usage example or a navigation guide in the README.

Difficulty: Easy, a rough implementation-effort estimate for this practice, not a repository-specific code-change prediction. Priority: 2/5. Suggested steps: implement this fix with the project’s documented tools; rescan the new commit and review applicability.

### DOC04 — Document project scope and limitations

Category: Documentation. Base maximum: 40. Method: content. Scope: all profiles. Version: 1.0.0.

Path expression: `(^|/)readme(\.[\w-]+)?$`.

Text/metadata expression: `\b(limitations?|non-goals?|scope|supported|requirements)\b`.

Evaluation, applicability, evidence, and pass/fail/partial conditions: common evaluation contract above. No partial credit; known satisfaction ratio is 0 or 1.

Fix: Explain supported use cases and known limitations in the README.

Difficulty: Easy, a rough implementation-effort estimate for this practice, not a repository-specific code-change prediction. Priority: 2/5. Suggested steps: implement this fix with the project’s documented tools; rescan the new commit and review applicability.

### TST01 — Include recognized test files

Category: Testing and CI. Base maximum: 60. Method: tree. Scope: code. Version: 1.0.0.

Path expression: `(^|/)(__tests__|tests?|spec)/|[._](test|spec)\.[^/]+$`.

Evaluation, applicability, evidence, and pass/fail/partial conditions: common evaluation contract above. No partial credit; known satisfaction ratio is 0 or 1.

Fix: Add tests covering meaningful project behavior; their presence does not prove they pass.

Difficulty: Moderate, a rough implementation-effort estimate for this practice, not a repository-specific code-change prediction. Priority: 4/5. Suggested steps: implement this fix with the project’s documented tools; rescan the new commit and review applicability.

### TST02 — Include a recognized CI configuration

Category: Testing and CI. Base maximum: 50. Method: tree. Scope: code. Version: 1.0.0.

Path expression: `^\.github/workflows/[^/]+\.ya?ml$|^\.gitlab-ci\.yml$|^\.circleci/config\.yml$`.

Evaluation, applicability, evidence, and pass/fail/partial conditions: common evaluation contract above. No partial credit; known satisfaction ratio is 0 or 1.

Fix: Configure CI for your documented verification commands.

Difficulty: Moderate, a rough implementation-effort estimate for this practice, not a repository-specific code-change prediction. Priority: 4/5. Suggested steps: implement this fix with the project’s documented tools; rescan the new commit and review applicability.

### TST03 — Reference tests in GitHub Actions

Category: Testing and CI. Base maximum: 60. Method: content. Scope: code. Version: 1.0.0.

Path expression: `^\.github/workflows/[^/]+\.ya?ml$`.

Text/metadata expression: `\b(npm (?:run )?test|pnpm (?:run )?test|yarn test|pytest|cargo test|go test|vitest|jest|dotnet test|bun test)\b`.

Evaluation, applicability, evidence, and pass/fail/partial conditions: common evaluation contract above. Multi-workflow partial credit applies.

Fix: Add the actual test command to GitHub Actions. This check does not verify execution.

Difficulty: Moderate, a rough implementation-effort estimate for this practice, not a repository-specific code-change prediction. Priority: 4/5. Suggested steps: implement this fix with the project’s documented tools; rescan the new commit and review applicability.

### TST04 — Document verification commands

Category: Testing and CI. Base maximum: 30. Method: content. Scope: code. Version: 1.0.0.

Path expression: `(^|/)readme(\.[\w-]+)?$`.

Text/metadata expression: `\b(testing|run tests|npm test|pytest|cargo test|go test|verification)\b`.

Evaluation, applicability, evidence, and pass/fail/partial conditions: common evaluation contract above. No partial credit; known satisfaction ratio is 0 or 1.

Fix: Document how contributors run verification locally.

Difficulty: Easy, a rough implementation-effort estimate for this practice, not a repository-specific code-change prediction. Priority: 3/5. Suggested steps: implement this fix with the project’s documented tools; rescan the new commit and review applicability.

### STR01 — Include a license file

Category: Project Structure. Base maximum: 60. Method: tree. Scope: all profiles. Version: 1.0.0.

Path expression: `(^|/)(license|licence|copying)(\.[\w-]+)?$`.

Evaluation, applicability, evidence, and pass/fail/partial conditions: common evaluation contract above. No partial credit; known satisfaction ratio is 0 or 1.

Fix: Choose an appropriate license and include its text.

Difficulty: Easy, a rough implementation-effort estimate for this practice, not a repository-specific code-change prediction. Priority: 2/5. Suggested steps: implement this fix with the project’s documented tools; rescan the new commit and review applicability.

### STR02 — Include an ignore configuration

Category: Project Structure. Base maximum: 40. Method: tree. Scope: code. Version: 1.0.0.

Path expression: `(^|/)\.gitignore$`.

Evaluation, applicability, evidence, and pass/fail/partial conditions: common evaluation contract above. No partial credit; known satisfaction ratio is 0 or 1.

Fix: Add an ignore configuration appropriate to your tools.

Difficulty: Easy, a rough implementation-effort estimate for this practice, not a repository-specific code-change prediction. Priority: 2/5. Suggested steps: implement this fix with the project’s documented tools; rescan the new commit and review applicability.

### STR03 — Group implementation files

Category: Project Structure. Base maximum: 50. Method: tree. Scope: all profiles. Version: 1.0.0.

Path expression: `(^|/)(src|lib|app|cmd|internal|packages|docs|content)/`.

Evaluation, applicability, evidence, and pass/fail/partial conditions: common evaluation contract above. No partial credit; known satisfaction ratio is 0 or 1.

Fix: Group related implementation or documentation files in clear directories.

Difficulty: Moderate, a rough implementation-effort estimate for this practice, not a repository-specific code-change prediction. Priority: 1/5. Suggested steps: implement this fix with the project’s documented tools; rescan the new commit and review applicability.

### SEC01 — Publish a security reporting policy

Category: Security Hygiene. Base maximum: 50. Method: tree. Scope: all profiles. Version: 1.0.0.

Path expression: `(^|/)security\.md$`.

Evaluation, applicability, evidence, and pass/fail/partial conditions: common evaluation contract above. No partial credit; known satisfaction ratio is 0 or 1.

Fix: Add a SECURITY.md describing a private vulnerability reporting channel.

Difficulty: Easy, a rough implementation-effort estimate for this practice, not a repository-specific code-change prediction. Priority: 5/5. Suggested steps: implement this fix with the project’s documented tools; rescan the new commit and review applicability.

### SEC02 — Configure dependency update tooling

Category: Security Hygiene. Base maximum: 40. Method: tree. Scope: package. Version: 1.0.0.

Path expression: `^\.github/dependabot\.ya?ml$|(^|/)(renovate\.json5?|\.renovaterc(\.json)?)$`.

Evaluation, applicability, evidence, and pass/fail/partial conditions: common evaluation contract above. No partial credit; known satisfaction ratio is 0 or 1.

Fix: Configure dependency update tooling for the package ecosystems you use.

Difficulty: Moderate, a rough implementation-effort estimate for this practice, not a repository-specific code-change prediction. Priority: 4/5. Suggested steps: implement this fix with the project’s documented tools; rescan the new commit and review applicability.

### SEC03 — Ignore local environment files

Category: Security Hygiene. Base maximum: 30. Method: content. Scope: code. Version: 1.0.0.

Path expression: `(^|/)\.gitignore$`.

Text/metadata expression: `^\s*(?:/)?\.env(?:\*|\.\*|/)?\s*$`.

Evaluation, applicability, evidence, and pass/fail/partial conditions: common evaluation contract above. No partial credit; known satisfaction ratio is 0 or 1.

Fix: Ignore local environment files and keep credentials outside version control. This does not detect leaked secrets.

Difficulty: Easy, a rough implementation-effort estimate for this practice, not a repository-specific code-change prediction. Priority: 5/5. Suggested steps: implement this fix with the project’s documented tools; rescan the new commit and review applicability.

### SEC04 — Declare workflow permissions

Category: Security Hygiene. Base maximum: 30. Method: content. Scope: code. Version: 1.0.0.

Path expression: `^\.github/workflows/[^/]+\.ya?ml$`.

Text/metadata expression: `^permissions\s*:`.

Evaluation, applicability, evidence, and pass/fail/partial conditions: common evaluation contract above. Multi-workflow partial credit applies.

Fix: Declare top-level GitHub Actions token permissions and review least privilege. Presence alone does not prove safety.

Difficulty: Moderate, a rough implementation-effort estimate for this practice, not a repository-specific code-change prediction. Priority: 5/5. Suggested steps: implement this fix with the project’s documented tools; rescan the new commit and review applicability.

### MNT01 — Include formatter configuration

Category: Maintainability. Base maximum: 35. Method: tree. Scope: code. Version: 1.0.0.

Path expression: `(^|/)(\.prettierrc(\.[\w-]+)?|prettier\.config\.[cm]?js|\.editorconfig|rustfmt\.toml|\.rustfmt\.toml|biome\.jsonc?)$`.

Evaluation, applicability, evidence, and pass/fail/partial conditions: common evaluation contract above. No partial credit; known satisfaction ratio is 0 or 1.

Fix: Configure a formatter or shared editor settings appropriate to the project.

Difficulty: Easy, a rough implementation-effort estimate for this practice, not a repository-specific code-change prediction. Priority: 1/5. Suggested steps: implement this fix with the project’s documented tools; rescan the new commit and review applicability.

### MNT02 — Include lint configuration

Category: Maintainability. Base maximum: 40. Method: tree. Scope: code. Version: 1.0.0.

Path expression: `(^|/)(eslint\.config\.[cm]?[jt]s|\.eslintrc(\.[\w-]+)?|ruff\.toml|\.golangci\.ya?ml|clippy\.toml|biome\.jsonc?)$`.

Evaluation, applicability, evidence, and pass/fail/partial conditions: common evaluation contract above. No partial credit; known satisfaction ratio is 0 or 1.

Fix: Configure suitable static checks and document the command.

Difficulty: Moderate, a rough implementation-effort estimate for this practice, not a repository-specific code-change prediction. Priority: 3/5. Suggested steps: implement this fix with the project’s documented tools; rescan the new commit and review applicability.

### MNT03 — Include a dependency lockfile

Category: Maintainability. Base maximum: 40. Method: tree. Scope: package. Version: 1.0.0.

Path expression: `(^|/)(package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb?|cargo\.lock|poetry\.lock|uv\.lock|go\.sum)$`.

Evaluation, applicability, evidence, and pass/fail/partial conditions: common evaluation contract above. No partial credit; known satisfaction ratio is 0 or 1.

Fix: Use a suitable dependency lockfile where reproducible application installs are expected.

Difficulty: Easy, a rough implementation-effort estimate for this practice, not a repository-specific code-change prediction. Priority: 3/5. Suggested steps: implement this fix with the project’s documented tools; rescan the new commit and review applicability.

### MNT04 — Record notable changes

Category: Maintainability. Base maximum: 35. Method: tree. Scope: all profiles. Version: 1.0.0.

Path expression: `(^|/)(changelog|changes|history)(\.[\w-]+)?$|^\.changeset/[^/]+\.md$`.

Evaluation, applicability, evidence, and pass/fail/partial conditions: common evaluation contract above. No partial credit; known satisfaction ratio is 0 or 1.

Fix: Maintain a concise changelog or change notes.

Difficulty: Easy, a rough implementation-effort estimate for this practice, not a repository-specific code-change prediction. Priority: 1/5. Suggested steps: implement this fix with the project’s documented tools; rescan the new commit and review applicability.

### CON01 — Provide contributor guidance

Category: Contributor Readiness. Base maximum: 40. Method: tree. Scope: all profiles. Version: 1.0.0.

Path expression: `(^|/)contributing(\.[\w-]+)?$`.

Evaluation, applicability, evidence, and pass/fail/partial conditions: common evaluation contract above. No partial credit; known satisfaction ratio is 0 or 1.

Fix: Document how to propose and verify a contribution.

Difficulty: Easy, a rough implementation-effort estimate for this practice, not a repository-specific code-change prediction. Priority: 2/5. Suggested steps: implement this fix with the project’s documented tools; rescan the new commit and review applicability.

### CON02 — Provide issue templates

Category: Contributor Readiness. Base maximum: 30. Method: tree. Scope: all profiles. Version: 1.0.0.

Path expression: `^\.github/issue_template/[^/]+\.(md|ya?ml)$`.

Evaluation, applicability, evidence, and pass/fail/partial conditions: common evaluation contract above. No partial credit; known satisfaction ratio is 0 or 1.

Fix: Add focused issue templates for useful bug reports and requests.

Difficulty: Easy, a rough implementation-effort estimate for this practice, not a repository-specific code-change prediction. Priority: 1/5. Suggested steps: implement this fix with the project’s documented tools; rescan the new commit and review applicability.

### CON03 — Provide a code of conduct

Category: Contributor Readiness. Base maximum: 30. Method: tree. Scope: all profiles. Version: 1.0.0.

Path expression: `(^|/)code_of_conduct(\.[\w-]+)?$`.

Evaluation, applicability, evidence, and pass/fail/partial conditions: common evaluation contract above. No partial credit; known satisfaction ratio is 0 or 1.

Fix: Publish appropriate community participation expectations.

Difficulty: Easy, a rough implementation-effort estimate for this practice, not a repository-specific code-change prediction. Priority: 1/5. Suggested steps: implement this fix with the project’s documented tools; rescan the new commit and review applicability.

### MET01 — Provide a repository description

Category: Repository Metadata. Base maximum: 25. Method: metadata. Scope: all profiles. Version: 1.0.0.

Text/metadata expression: `description`.

Evaluation, applicability, evidence, and pass/fail/partial conditions: common evaluation contract above. No partial credit; known satisfaction ratio is 0 or 1.

Fix: Add a concise repository description in GitHub settings.

Difficulty: Easy, a rough implementation-effort estimate for this practice, not a repository-specific code-change prediction. Priority: 1/5. Suggested steps: implement this fix with the project’s documented tools; rescan the new commit and review applicability.

### MET02 — Identify a license in GitHub metadata

Category: Repository Metadata. Base maximum: 25. Method: metadata. Scope: all profiles. Version: 1.0.0.

Text/metadata expression: `license`.

Evaluation, applicability, evidence, and pass/fail/partial conditions: common evaluation contract above. No partial credit; known satisfaction ratio is 0 or 1.

Fix: Use a recognizable license and verify GitHub identifies it correctly.

Difficulty: Easy, a rough implementation-effort estimate for this practice, not a repository-specific code-change prediction. Priority: 2/5. Suggested steps: implement this fix with the project’s documented tools; rescan the new commit and review applicability.

## Improvement opportunities and commentary

For each failed/partial check: potentialGain = effectiveMaximum − awardedPoints, both integer values from the same report. Unknown and ineligible checks have no gains. Merged license opportunity combines STR01 and MET02 contributions once; no rule gain is counted twice. Other checks reward distinct observed practices even if one commit satisfies several. Prioritize security/reliability importance, then potential gain, then Easy/Moderate/Advanced effort, then stable rule ID. All current known-evidence confidence levels are equal; future confidence levels must be sorted explicitly after effort.

Even without a total score, available conditional rule gains use the known-evidence allocation and must be presented with the insufficient-evidence warning; they do not predict an authoritative total. Changes may alter other checks, metadata, profiles, weights and coverage. Both modes read identical report numbers. Humor uses a stable FNV-1a hash of numeric repository identity, commit, and rule ID to choose one of two reviewed templates. Unknown findings always use professional uncertainty copy.

## Tiers (entertainment only)

0–199 Digital Crime Scene; 200–399 Spaghetti Factory; 400–599 Held Together by Hope; 600–749 Certified Spaghetti; 750–899 Actually Pretty Solid; 900–1000 Suspiciously Competent. No formal certification or cross-profile ranking is implied.
