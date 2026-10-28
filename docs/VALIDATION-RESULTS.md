# Cross-repository scoring validation

Rules 1.0.0 → 2.0.0. Metadata snapshots are fixed; real references pin exact commits. Synthetic fixtures are not claimed to be real projects. No repository code was run.

| Case | Source | Before | After conditional | Evidence | Possible range |
|---|---|---:|---:|---:|---|
| Cursiv (Python desktop application) | real | 671 | 885 | 91.1% | 805–894 |
| python-library (Python library) | synthetic | 505 | 639 | 100.0% | 639–639 |
| RepoRoast (TypeScript application) | real | 600 | 580 | 95.0% | 550–600 |
| javascript-package (JavaScript package) | synthetic | 509 | 561 | 92.5% | 519–594 |
| rust-project (Rust project) | synthetic | 545 | 649 | 100.0% | 649–649 |
| go-application (Go application) | synthetic | 495 | 649 | 100.0% | 649–649 |
| cli-tool (CLI tool) | synthetic | 335 | 500 | 100.0% | 500–500 |
| documentation (Documentation-only repository) | synthetic | 366 | 375 | 100.0% | 375–375 |
| Hello-World (Small hobby repository) | real | 85 | 60 | 100.0% | 60–60 |
| mature-monorepo (Large mature project (synthetic, not popularity-calibrated)) | synthetic | 475 | 599 | 100.0% | 599–599 |
| empty-shell-project (Adversarial: presence without substance) | synthetic | 531 | 130 | 100.0% | 130–130 |
| deceptive-ci (Adversarial: echoed/quoted test names and broad token) | synthetic | 455 | 320 | 100.0% | 320–320 |

## Labeled outcomes

Rules 2.0.0:

{
  "tp": 51,
  "fp": 0,
  "tn": 19,
  "fn": 0,
  "abstained": 0,
  "nonbinary": 20,
  "stateCorrect": 90,
  "labeled": 90,
  "falsePositiveRate": 0,
  "falseNegativeRate": 0,
  "note": "Full-credit pass versus labeled pass/fail; unknown/ineligible predictions abstain. Nonbinary labels and exact state accuracy are separate. Hand-selected small, authored fixtures do not estimate population error rates."
}

Frozen rules 1.0.0 against the same target labels (changed rule semantics included):

{
  "tp": 34,
  "fp": 10,
  "tn": 9,
  "fn": 16,
  "abstained": 1,
  "nonbinary": 20,
  "stateCorrect": 48,
  "labeled": 90,
  "falsePositiveRate": 0.5263157894736842,
  "falseNegativeRate": 0.32
}

These are labeled-check rates on this finite selected set, not production accuracy estimates. Expected states were written in tests/fixtures/validation.ts before aggregate reporting; see validation/EXPECTED-OUTCOMES.md. Same-author labels are not independent review. Frozen v1 tests remain unchanged in semantics.

## Cursiv

Commit efc2f961049b767f0fe49e38304e9e70f25a6955; profiles general → application. Each point change includes effective-weight/coverage rounding, so an unchanged pass can change points. Comparisons across these scoring versions are not rankings.

| Rule | Before → after | Point delta | Explanation |
|---|---|---:|---|
| DOC01 | pass → pass | -18 | Root README prose was inspected; documentation adequacy is not verified. |
| DOC02 | pass → pass | +14 | Recognized section and supporting content inspected; a heading alone earns only outline credit, not an adequacy claim. |
| DOC03 | pass → pass | +14 | Recognized section and supporting content inspected; a heading alone earns only outline credit, not an adequacy claim. |
| DOC04 | pass → pass | +3 | Recognized section and supporting content inspected; a heading alone earns only outline credit, not an adequacy claim. |
| TST01 | pass → pass | -18 | Recognizable test declarations inspected. Tests were not run. |
| TST02 | pass → pass | -19 | GitHub Actions jobs/steps parse; actual execution and success are unverified. |
| TST03 | partial → pass | +58 | At least one job references a recognized test invocation. Non-test workflows do not enter a test-workflow denominator. No execution outcome verified. |
| TST04 | unknown → pass | +44 | README/contributor guidance references a recognized verification command; it was not executed. |
| STR01 | pass → pass | +26 | Substantive root license terms inspected; no legal compatibility/identification claim. |
| STR02 | pass → pass | -8 | Noncomment ignore entries exist; completeness is not established. |
| STR03 | pass → pass | -7 | A flat or grouped entry point is discoverable; layout is not proof of quality. |
| SEC03 | pass → not-applicable | -31 | No environment-file use observed; .env is not mandatory. |
| SEC04 | partial → unknown | -21 | Unspecified/malformed/dynamic/unavailable permissions: organization/repository defaults were not inspected. No insecure-default claim. |
| MNT01 | fail → pass | +33 | Supported tool settings parsed from pyproject.toml; execution unverified. |
| MNT02 | fail → pass | +55 | Supported tool settings parsed from pyproject.toml; execution unverified. |
| MNT03 | fail → pass | +55 | Ecosystem pin/hash/checksum structure inspected; Go checksums are not a lockfile. No install/test executed. |
| MNT04 | pass → unknown | -36 | Required evidence is unavailable or outside supported static interpretation; no failure is inferred. |
| CON01 | pass → pass | +41 | Substantive contributor process/setup guidance inspected; onboarding success not verified. |
| CON03 | fail → not-applicable | +0 | Optional informational signal; no numerical penalty or gain in 2.0.0. |
| MET01 | pass → pass | +29 | Scan-time GitHub description snapshot, not a commit-pinned technical-quality fact. |
| MET02 | fail → not-applicable | +0 | Optional informational signal; no numerical penalty or gain in 2.0.0. |

## python-library

Commit cccccccccccccccccccccccccccccccccccccccc; profiles general → library. Each point change includes effective-weight/coverage rounding, so an unchanged pass can change points. Comparisons across these scoring versions are not rankings.

| Rule | Before → after | Point delta | Explanation |
|---|---|---:|---|
| DOC01 | pass → pass | -20 | Root README prose was inspected; documentation adequacy is not verified. |
| DOC02 | pass → pass | +10 | Recognized section and supporting content inspected; a heading alone earns only outline credit, not an adequacy claim. |
| DOC03 | pass → pass | +10 | Recognized section and supporting content inspected; a heading alone earns only outline credit, not an adequacy claim. |
| TST01 | pass → pass | -20 | Recognizable test declarations inspected. Tests were not run. |
| TST02 | pass → pass | -20 | GitHub Actions jobs/steps parse; actual execution and success are unverified. |
| TST03 | pass → pass | +30 | At least one job references a recognized test invocation. Non-test workflows do not enter a test-workflow denominator. No execution outcome verified. |
| TST04 | pass → fail | -30 | README/contributor guidance references a recognized verification command; it was not executed. |
| STR03 | pass → pass | -10 | A flat or grouped entry point is discoverable; layout is not proof of quality. |
| SEC03 | fail → not-applicable | +0 | No environment-file use observed; .env is not mandatory. |
| SEC04 | pass → pass | +39 | Explicit workflow/job-level scopes inspected; scoped writes can be intentional. This is not proof of least privilege or workflow security. |
| MNT01 | fail → pass | +45 | Supported tool settings parsed from pyproject.toml; execution unverified. |
| MNT02 | fail → pass | +75 | Supported tool settings parsed from pyproject.toml; execution unverified. |
| MNT03 | fail → not-applicable | +0 | Library publication lock conventions vary; no universal lockfile requirement. |
| CON03 | fail → not-applicable | +0 | Optional informational signal; no numerical penalty or gain in 2.0.0. |
| MET01 | pass → pass | +25 | Scan-time GitHub description snapshot, not a commit-pinned technical-quality fact. |
| MET02 | fail → not-applicable | +0 | Optional informational signal; no numerical penalty or gain in 2.0.0. |

## RepoRoast

Commit 587466ebc2cd8ca04b79234f26ea7366f46fc0ae; profiles application → application. Each point change includes effective-weight/coverage rounding, so an unchanged pass can change points. Comparisons across these scoring versions are not rankings.

| Rule | Before → after | Point delta | Explanation |
|---|---|---:|---|
| DOC01 | pass → pass | -18 | Root README prose was inspected; documentation adequacy is not verified. |
| DOC02 | pass → fail | -50 | Recognized section and supporting content inspected; a heading alone earns only outline credit, not an adequacy claim. |
| DOC03 | pass → fail | -50 | Recognized section and supporting content inspected; a heading alone earns only outline credit, not an adequacy claim. |
| TST01 | pass → pass | -18 | Recognizable test declarations inspected. Tests were not run. |
| TST02 | pass → pass | -18 | GitHub Actions jobs/steps parse; actual execution and success are unverified. |
| TST03 | pass → pass | +35 | At least one job references a recognized test invocation. Non-test workflows do not enter a test-workflow denominator. No execution outcome verified. |
| TST04 | pass → pass | +12 | README/contributor guidance references a recognized verification command; it was not executed. |
| STR02 | pass → pass | -8 | Noncomment ignore entries exist; completeness is not established. |
| STR03 | pass → pass | -8 | A flat or grouped entry point is discoverable; layout is not proof of quality. |
| SEC01 | pass → pass | -2 | Private reporting contact/instructions inspected; responsiveness and security unverified. |
| SEC03 | pass → not-applicable | -30 | No environment-file use observed; .env is not mandatory. |
| SEC04 | pass → pass | +43 | Explicit workflow/job-level scopes inspected; scoped writes can be intentional. This is not proof of least privilege or workflow security. |
| MNT02 | fail → pass | +53 | Recognized native tool invocation declared, not executed. |
| MNT03 | pass → unknown | -40 | Required evidence is unavailable or outside supported static interpretation; no failure is inferred. |
| CON01 | fail → pass | +79 | Substantive contributor process/setup guidance inspected; onboarding success not verified. |
| CON03 | fail → not-applicable | +0 | Optional informational signal; no numerical penalty or gain in 2.0.0. |
| MET02 | fail → not-applicable | +0 | Optional informational signal; no numerical penalty or gain in 2.0.0. |

## javascript-package

Commit cccccccccccccccccccccccccccccccccccccccc; profiles library → library. Each point change includes effective-weight/coverage rounding, so an unchanged pass can change points. Comparisons across these scoring versions are not rankings.

| Rule | Before → after | Point delta | Explanation |
|---|---|---:|---|
| DOC01 | pass → pass | -17 | Root README prose was inspected; documentation adequacy is not verified. |
| DOC02 | pass → pass | +15 | Recognized section and supporting content inspected; a heading alone earns only outline credit, not an adequacy claim. |
| DOC03 | pass → pass | +15 | Recognized section and supporting content inspected; a heading alone earns only outline credit, not an adequacy claim. |
| DOC04 | pass → pass | +3 | Recognized section and supporting content inspected; a heading alone earns only outline credit, not an adequacy claim. |
| TST01 | pass → pass | -17 | Recognizable test declarations inspected. Tests were not run. |
| TST02 | pass → pass | -17 | GitHub Actions jobs/steps parse; actual execution and success are unverified. |
| TST03 | pass → pass | +37 | At least one job references a recognized test invocation. Non-test workflows do not enter a test-workflow denominator. No execution outcome verified. |
| TST04 | pass → fail | -30 | README/contributor guidance references a recognized verification command; it was not executed. |
| STR03 | fail → pass | +43 | A flat or grouped entry point is discoverable; layout is not proof of quality. |
| SEC03 | fail → not-applicable | +0 | No environment-file use observed; .env is not mandatory. |
| SEC04 | pass → pass | +45 | Explicit workflow/job-level scopes inspected; scoped writes can be intentional. This is not proof of least privilege or workflow security. |
| MNT02 | pass → unknown | -54 | Required evidence is unavailable or outside supported static interpretation; no failure is inferred. |
| CON03 | fail → not-applicable | +0 | Optional informational signal; no numerical penalty or gain in 2.0.0. |
| MET01 | pass → pass | +29 | Scan-time GitHub description snapshot, not a commit-pinned technical-quality fact. |
| MET02 | fail → not-applicable | +0 | Optional informational signal; no numerical penalty or gain in 2.0.0. |

## rust-project

Commit cccccccccccccccccccccccccccccccccccccccc; profiles general → application. Each point change includes effective-weight/coverage rounding, so an unchanged pass can change points. Comparisons across these scoring versions are not rankings.

| Rule | Before → after | Point delta | Explanation |
|---|---|---:|---|
| DOC01 | pass → pass | -20 | Root README prose was inspected; documentation adequacy is not verified. |
| DOC02 | pass → pass | +10 | Recognized section and supporting content inspected; a heading alone earns only outline credit, not an adequacy claim. |
| DOC03 | pass → pass | +10 | Recognized section and supporting content inspected; a heading alone earns only outline credit, not an adequacy claim. |
| TST01 | pass → pass | -20 | Recognizable test declarations inspected. Tests were not run. |
| TST02 | pass → pass | -20 | GitHub Actions jobs/steps parse; actual execution and success are unverified. |
| TST03 | pass → pass | +30 | At least one job references a recognized test invocation. Non-test workflows do not enter a test-workflow denominator. No execution outcome verified. |
| TST04 | pass → fail | -30 | README/contributor guidance references a recognized verification command; it was not executed. |
| STR03 | pass → pass | -10 | A flat or grouped entry point is discoverable; layout is not proof of quality. |
| SEC03 | fail → not-applicable | +0 | No environment-file use observed; .env is not mandatory. |
| SEC04 | pass → pass | +39 | Explicit workflow/job-level scopes inspected; scoped writes can be intentional. This is not proof of least privilege or workflow security. |
| MNT01 | fail → pass | +30 | Recognized native tool invocation declared, not executed. |
| MNT02 | fail → pass | +50 | Recognized native tool invocation declared, not executed. |
| MNT03 | pass → pass | +10 | Ecosystem pin/hash/checksum structure inspected; Go checksums are not a lockfile. No install/test executed. |
| CON03 | fail → not-applicable | +0 | Optional informational signal; no numerical penalty or gain in 2.0.0. |
| MET01 | pass → pass | +25 | Scan-time GitHub description snapshot, not a commit-pinned technical-quality fact. |
| MET02 | fail → not-applicable | +0 | Optional informational signal; no numerical penalty or gain in 2.0.0. |

## go-application

Commit cccccccccccccccccccccccccccccccccccccccc; profiles general → application. Each point change includes effective-weight/coverage rounding, so an unchanged pass can change points. Comparisons across these scoring versions are not rankings.

| Rule | Before → after | Point delta | Explanation |
|---|---|---:|---|
| DOC01 | pass → pass | -20 | Root README prose was inspected; documentation adequacy is not verified. |
| DOC02 | pass → pass | +10 | Recognized section and supporting content inspected; a heading alone earns only outline credit, not an adequacy claim. |
| DOC03 | pass → pass | +10 | Recognized section and supporting content inspected; a heading alone earns only outline credit, not an adequacy claim. |
| TST01 | pass → pass | -20 | Recognizable test declarations inspected. Tests were not run. |
| TST02 | pass → pass | -20 | GitHub Actions jobs/steps parse; actual execution and success are unverified. |
| TST03 | pass → pass | +30 | At least one job references a recognized test invocation. Non-test workflows do not enter a test-workflow denominator. No execution outcome verified. |
| TST04 | pass → fail | -30 | README/contributor guidance references a recognized verification command; it was not executed. |
| STR03 | fail → pass | +40 | A flat or grouped entry point is discoverable; layout is not proof of quality. |
| SEC03 | fail → not-applicable | +0 | No environment-file use observed; .env is not mandatory. |
| SEC04 | pass → pass | +39 | Explicit workflow/job-level scopes inspected; scoped writes can be intentional. This is not proof of least privilege or workflow security. |
| MNT01 | fail → pass | +30 | Recognized native tool invocation declared, not executed. |
| MNT02 | fail → pass | +50 | Recognized native tool invocation declared, not executed. |
| MNT03 | pass → pass | +10 | Ecosystem pin/hash/checksum structure inspected; Go checksums are not a lockfile. No install/test executed. |
| CON03 | fail → not-applicable | +0 | Optional informational signal; no numerical penalty or gain in 2.0.0. |
| MET01 | pass → pass | +25 | Scan-time GitHub description snapshot, not a commit-pinned technical-quality fact. |
| MET02 | fail → not-applicable | +0 | Optional informational signal; no numerical penalty or gain in 2.0.0. |

## cli-tool

Commit cccccccccccccccccccccccccccccccccccccccc; profiles cli → cli. Each point change includes effective-weight/coverage rounding, so an unchanged pass can change points. Comparisons across these scoring versions are not rankings.

| Rule | Before → after | Point delta | Explanation |
|---|---|---:|---|
| DOC01 | pass → pass | -20 | Root README prose was inspected; documentation adequacy is not verified. |
| DOC02 | pass → pass | +10 | Recognized section and supporting content inspected; a heading alone earns only outline credit, not an adequacy claim. |
| DOC03 | pass → pass | +10 | Recognized section and supporting content inspected; a heading alone earns only outline credit, not an adequacy claim. |
| TST02 | pass → pass | -20 | GitHub Actions jobs/steps parse; actual execution and success are unverified. |
| TST03 | fail → pass | +90 | At least one job references a recognized test invocation. Non-test workflows do not enter a test-workflow denominator. No execution outcome verified. |
| TST04 | pass → fail | -30 | README/contributor guidance references a recognized verification command; it was not executed. |
| STR03 | fail → pass | +40 | A flat or grouped entry point is discoverable; layout is not proof of quality. |
| SEC02 | fail → not-applicable | +0 | No declared third-party dependencies in supported complete evidence. |
| SEC03 | fail → not-applicable | +0 | No environment-file use observed; .env is not mandatory. |
| SEC04 | pass → pass | +60 | Explicit workflow/job-level scopes inspected; scoped writes can be intentional. This is not proof of least privilege or workflow security. |
| MNT03 | fail → not-applicable | +0 | No declared third-party dependencies in supported complete evidence. |
| CON03 | fail → not-applicable | +0 | Optional informational signal; no numerical penalty or gain in 2.0.0. |
| MET01 | pass → pass | +25 | Scan-time GitHub description snapshot, not a commit-pinned technical-quality fact. |
| MET02 | fail → not-applicable | +0 | Optional informational signal; no numerical penalty or gain in 2.0.0. |

## documentation

Commit cccccccccccccccccccccccccccccccccccccccc; profiles documentation → documentation. Each point change includes effective-weight/coverage rounding, so an unchanged pass can change points. Comparisons across these scoring versions are not rankings.

| Rule | Before → after | Point delta | Explanation |
|---|---|---:|---|
| DOC01 | pass → pass | -25 | Root README prose was inspected; documentation adequacy is not verified. |
| DOC02 | pass → pass | +12 | Recognized section and supporting content inspected; a heading alone earns only outline credit, not an adequacy claim. |
| DOC03 | pass → pass | +13 | Recognized section and supporting content inspected; a heading alone earns only outline credit, not an adequacy claim. |
| STR03 | pass → pass | -22 | A flat or grouped entry point is discoverable; layout is not proof of quality. |
| CON03 | fail → not-applicable | +0 | Optional informational signal; no numerical penalty or gain in 2.0.0. |
| MET01 | pass → pass | +31 | Scan-time GitHub description snapshot, not a commit-pinned technical-quality fact. |
| MET02 | fail → not-applicable | +0 | Optional informational signal; no numerical penalty or gain in 2.0.0. |

## Hello-World

Commit 7fd1a60b01f91b314f59955a4e4d4e80d8edf11d; profiles general → general. Each point change includes effective-weight/coverage rounding, so an unchanged pass can change points. Comparisons across these scoring versions are not rankings.

| Rule | Before → after | Point delta | Explanation |
|---|---|---:|---|
| DOC01 | pass → partial | -50 | Root README prose was inspected; documentation adequacy is not verified. |
| SEC03 | fail → not-applicable | +0 | No environment-file use observed; .env is not mandatory. |
| CON03 | fail → not-applicable | +0 | Optional informational signal; no numerical penalty or gain in 2.0.0. |
| MET01 | pass → pass | +25 | Scan-time GitHub description snapshot, not a commit-pinned technical-quality fact. |
| MET02 | fail → not-applicable | +0 | Optional informational signal; no numerical penalty or gain in 2.0.0. |

## mature-monorepo

Commit cccccccccccccccccccccccccccccccccccccccc; profiles general → general. Each point change includes effective-weight/coverage rounding, so an unchanged pass can change points. Comparisons across these scoring versions are not rankings.

| Rule | Before → after | Point delta | Explanation |
|---|---|---:|---|
| DOC01 | pass → pass | -20 | Root README prose was inspected; documentation adequacy is not verified. |
| DOC02 | pass → pass | +10 | Recognized section and supporting content inspected; a heading alone earns only outline credit, not an adequacy claim. |
| DOC03 | pass → pass | +10 | Recognized section and supporting content inspected; a heading alone earns only outline credit, not an adequacy claim. |
| TST01 | pass → pass | -20 | Recognizable test declarations inspected. Tests were not run. |
| TST02 | pass → pass | -20 | GitHub Actions jobs/steps parse; actual execution and success are unverified. |
| TST03 | partial → pass | +60 | At least one job references a recognized test invocation. Non-test workflows do not enter a test-workflow denominator. No execution outcome verified. |
| TST04 | pass → fail | -30 | README/contributor guidance references a recognized verification command; it was not executed. |
| STR03 | pass → pass | -10 | A flat or grouped entry point is discoverable; layout is not proof of quality. |
| SEC03 | fail → not-applicable | +0 | No environment-file use observed; .env is not mandatory. |
| SEC04 | pass → pass | +39 | Explicit workflow/job-level scopes inspected; scoped writes can be intentional. This is not proof of least privilege or workflow security. |
| MNT01 | fail → pass | +30 | Recognized native tool invocation declared, not executed. |
| MNT02 | fail → pass | +50 | Recognized native tool invocation declared, not executed. |
| CON03 | fail → not-applicable | +0 | Optional informational signal; no numerical penalty or gain in 2.0.0. |
| MET01 | pass → pass | +25 | Scan-time GitHub description snapshot, not a commit-pinned technical-quality fact. |
| MET02 | fail → not-applicable | +0 | Optional informational signal; no numerical penalty or gain in 2.0.0. |

## empty-shell-project

Commit cccccccccccccccccccccccccccccccccccccccc; profiles application → application. Each point change includes effective-weight/coverage rounding, so an unchanged pass can change points. Comparisons across these scoring versions are not rankings.

| Rule | Before → after | Point delta | Explanation |
|---|---|---:|---|
| DOC01 | pass → fail | -60 | Root README prose was inspected; documentation adequacy is not verified. |
| DOC02 | pass → partial | -35 | Recognized section and supporting content inspected; a heading alone earns only outline credit, not an adequacy claim. |
| DOC03 | pass → partial | -35 | Recognized section and supporting content inspected; a heading alone earns only outline credit, not an adequacy claim. |
| DOC04 | pass → partial | -30 | Recognized section and supporting content inspected; a heading alone earns only outline credit, not an adequacy claim. |
| TST01 | pass → fail | -86 | Recognizable test declarations inspected. Tests were not run. |
| STR01 | pass → fail | -60 | Substantive root license terms inspected; no legal compatibility/identification claim. |
| STR03 | fail → pass | +40 | A flat or grouped entry point is discoverable; layout is not proof of quality. |
| SEC02 | pass → fail | -50 | Supported update configuration covers observed ecosystems; service activity is not verified. |
| SEC03 | fail → not-applicable | +0 | No environment-file use observed; .env is not mandatory. |
| MNT03 | pass → fail | -40 | Observed ecosystem reproducibility structure; exact pins without hashes earn partial credit. |
| CON01 | pass → fail | -40 | Substantive contributor process/setup guidance inspected; onboarding success not verified. |
| CON02 | pass → fail | -30 | Issue questions/form structure inspected; availability/community response unverified. |
| CON03 | fail → not-applicable | +0 | Optional informational signal; no numerical penalty or gain in 2.0.0. |
| MET01 | pass → pass | +25 | Scan-time GitHub description snapshot, not a commit-pinned technical-quality fact. |
| MET02 | fail → not-applicable | +0 | Optional informational signal; no numerical penalty or gain in 2.0.0. |

## deceptive-ci

Commit cccccccccccccccccccccccccccccccccccccccc; profiles application → application. Each point change includes effective-weight/coverage rounding, so an unchanged pass can change points. Comparisons across these scoring versions are not rankings.

| Rule | Before → after | Point delta | Explanation |
|---|---|---:|---|
| DOC01 | pass → pass | -20 | Root README prose was inspected; documentation adequacy is not verified. |
| DOC02 | pass → pass | +10 | Recognized section and supporting content inspected; a heading alone earns only outline credit, not an adequacy claim. |
| DOC03 | pass → pass | +10 | Recognized section and supporting content inspected; a heading alone earns only outline credit, not an adequacy claim. |
| TST01 | pass → fail | -60 | Recognizable test declarations inspected. Tests were not run. |
| TST02 | pass → pass | -20 | GitHub Actions jobs/steps parse; actual execution and success are unverified. |
| TST03 | pass → fail | -60 | No supported test invocation in inspected workflow run steps. |
| TST04 | pass → fail | -30 | README/contributor guidance references a recognized verification command; it was not executed. |
| STR03 | fail → pass | +40 | A flat or grouped entry point is discoverable; layout is not proof of quality. |
| SEC02 | fail → not-applicable | +0 | No declared third-party dependencies in supported complete evidence. |
| SEC03 | fail → not-applicable | +0 | No environment-file use observed; .env is not mandatory. |
| SEC04 | pass → fail | -30 | Explicit workflow/job-level scopes inspected; scoped writes can be intentional. This is not proof of least privilege or workflow security. |
| MNT03 | fail → not-applicable | +0 | No declared third-party dependencies in supported complete evidence. |
| CON03 | fail → not-applicable | +0 | Optional informational signal; no numerical penalty or gain in 2.0.0. |
| MET01 | pass → pass | +25 | Scan-time GitHub description snapshot, not a commit-pinned technical-quality fact. |
| MET02 | fail → not-applicable | +0 | Optional informational signal; no numerical penalty or gain in 2.0.0. |
