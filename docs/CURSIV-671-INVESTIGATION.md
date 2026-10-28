# Cursiv 671/1000 investigation

Exact commit: efc2f961049b767f0fe49e38304e9e70f25a6955. Frozen rules 1.0.0 reproduce **671/1000 at 97% evidence coverage**. Rules 2.0.0 produce **885/1000 conditional**, coverage 91.1%, possible original-weight range 805–894. No tests or Cursiv code executed. No Cursiv files changed. API metadata is a fixed captured snapshot, not historical settings.

Profile changes general → application from parsed PyQt6/runtime declarations, not the repository name. Renaming the fixture owner/repository leaves scoring unchanged. The library lock exclusion no longer accidentally substitutes for desktop-app identification. Higher score is not a quality improvement: it reflects corrected recognition, retired penalties, different weights and explicit unknowns.

| Rule | v1 state/points | v2 state/points | Audit conclusion |
|---|---|---|---|
| DOC01 | pass 62/62 | pass 44/44 | Observed practice retained or refined. Point changes follow versioned weights and known-evidence normalization, not a repository-specific bonus. |
| DOC02 | pass 52/52 | pass 66/66 | Observed practice retained or refined. Point changes follow versioned weights and known-evidence normalization, not a repository-specific bonus. |
| DOC03 | pass 52/52 | pass 66/66 | Observed practice retained or refined. Point changes follow versioned weights and known-evidence normalization, not a repository-specific bonus. |
| DOC04 | pass 41/41 | pass 44/44 | Observed practice retained or refined. Point changes follow versioned weights and known-evidence normalization, not a repository-specific bonus. |
| TST01 | pass 62/62 | pass 44/44 | Observed practice retained or refined. Point changes follow versioned weights and known-evidence normalization, not a repository-specific bonus. |
| TST02 | pass 52/52 | pass 33/33 | Observed practice retained or refined. Point changes follow versioned weights and known-evidence normalization, not a repository-specific bonus. |
| TST03 | partial 41/62 | pass 99/99 | Misleading deduction: non-test workflows should not all run tests. |
| TST04 | unknown —/— | pass 44/44 | Misleading unknown: contributor guide contains explicit verification commands. |
| STR01 | pass 62/62 | pass 88/88 | Observed practice retained or refined. Point changes follow versioned weights and known-evidence normalization, not a repository-specific bonus. |
| STR02 | pass 41/41 | pass 33/33 | Observed practice retained or refined. Point changes follow versioned weights and known-evidence normalization, not a repository-specific bonus. |
| STR03 | pass 51/51 | pass 44/44 | Observed practice retained or refined. Point changes follow versioned weights and known-evidence normalization, not a repository-specific bonus. |
| SEC01 | fail 0/51 | fail 0/50 | Valid limited deduction: no recognized private reporting policy path in the complete tree; no insecurity claim. |
| SEC02 | fail 0/41 | fail 0/38 | Valid limited deduction: no supported dependency update config; not proof dependencies are stale. |
| SEC03 | pass 31/31 | not-applicable —/— | Observed practice retained or refined. Point changes follow versioned weights and known-evidence normalization, not a repository-specific bonus. |
| SEC04 | partial 21/31 | unknown —/— | Partially valid observation, misleading conclusion: some policies unspecified; defaults unknown, scoped release writes intentional. |
| MNT01 | fail 0/36 | pass 33/33 | Misleading false negative: shared Ruff settings are in pyproject.toml; format execution remains unverified. |
| MNT02 | fail 0/41 | pass 55/55 | Misleading false negative: parsed [tool.ruff] exists. |
| MNT03 | fail 0/41 | pass 55/55 | Misleading ecosystem false negative: inspected hashed requirements-release.lock exists. |
| MNT04 | pass 36/36 | unknown —/— | v1 overstated evidence: changelog path exists, but body exceeds the per-file cap; now unknown. |
| CON01 | pass 41/41 | pass 82/82 | Observed practice retained or refined. Point changes follow versioned weights and known-evidence normalization, not a repository-specific bonus. |
| CON02 | fail 0/31 | fail 0/27 | Valid limited deduction: no recognized issue templates. |
| CON03 | fail 0/31 | not-applicable —/— | Unfair universal policy requirement: retired. |
| MET01 | pass 26/26 | pass 55/55 | Observed practice retained or refined. Point changes follow versioned weights and known-evidence normalization, not a repository-specific bonus. |
| MET02 | fail 0/26 | not-applicable —/— | Misleading duplicate deduction: license terms exist although GitHub reports NOASSERTION. |

## Exact references and remaining uncertainty

- [Tests workflow](https://github.com/Cursiv-Local/Cursiv/blob/efc2f961049b767f0fe49e38304e9e70f25a6955/.github/workflows/tests.yml) invokes python -m pytest; no top-level/job policy was observed there.
- [Mac workflow](https://github.com/Cursiv-Local/Cursiv/blob/efc2f961049b767f0fe49e38304e9e70f25a6955/.github/workflows/mac-build.yml) requests scoped contents:write for release publication.
- [Python settings](https://github.com/Cursiv-Local/Cursiv/blob/efc2f961049b767f0fe49e38304e9e70f25a6955/pyproject.toml) declare PyQt6 and [tool.ruff].
- [Contributor guide](https://github.com/Cursiv-Local/Cursiv/blob/efc2f961049b767f0fe49e38304e9e70f25a6955/CONTRIBUTING.md) supplies verification commands and hashed-install instructions.
- [Hashed release requirements](https://github.com/Cursiv-Local/Cursiv/blob/efc2f961049b767f0fe49e38304e9e70f25a6955/requirements-release.lock) are inspected as text, never installed.
- [License](https://github.com/Cursiv-Local/Cursiv/blob/efc2f961049b767f0fe49e38304e9e70f25a6955/LICENSE) has MIT terms and third-party notices; this does not establish legal compatibility.

The changelog body is 176,467 bytes, beyond the 96 KB cap. Organization defaults, actual CI outcomes, provider activation, licensing compatibility and behavior remain unverified. The fixture is an evidence subset: live bounded inspection can differ if budgets or API availability change. Every numeric delta is also listed in docs/VALIDATION-RESULTS.md and docs/validation/results.json.
