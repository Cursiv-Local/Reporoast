# Manual expected-outcome matrix

Hand-authored labels in tests/fixtures/validation.ts, not generated from predictions. Same-author labels are not independent blinded review. Real snapshots are pinned; remaining cases are synthetic structural controls. Unknown/ineligible/partial labels are included separately from binary error denominators.

| Case | Type | Source | Rule | Expected state |
|---|---|---|---|---|
| Cursiv | Python desktop application | real | DOC01 | pass |
| Cursiv | Python desktop application | real | DOC02 | pass |
| Cursiv | Python desktop application | real | DOC03 | pass |
| Cursiv | Python desktop application | real | DOC04 | pass |
| Cursiv | Python desktop application | real | TST01 | pass |
| Cursiv | Python desktop application | real | TST02 | pass |
| Cursiv | Python desktop application | real | TST03 | pass |
| Cursiv | Python desktop application | real | TST04 | pass |
| Cursiv | Python desktop application | real | STR01 | pass |
| Cursiv | Python desktop application | real | SEC01 | fail |
| Cursiv | Python desktop application | real | SEC02 | fail |
| Cursiv | Python desktop application | real | SEC04 | unknown |
| Cursiv | Python desktop application | real | MNT01 | pass |
| Cursiv | Python desktop application | real | MNT02 | pass |
| Cursiv | Python desktop application | real | MNT03 | pass |
| Cursiv | Python desktop application | real | MNT04 | unknown |
| Cursiv | Python desktop application | real | CON01 | pass |
| Cursiv | Python desktop application | real | CON02 | fail |
| Cursiv | Python desktop application | real | CON03 | not-applicable |
| Cursiv | Python desktop application | real | MET02 | not-applicable |
| python-library | Python library | synthetic | DOC01 | pass |
| python-library | Python library | synthetic | TST01 | pass |
| python-library | Python library | synthetic | TST03 | pass |
| python-library | Python library | synthetic | MNT01 | pass |
| python-library | Python library | synthetic | MNT02 | pass |
| python-library | Python library | synthetic | MNT03 | not-applicable |
| python-library | Python library | synthetic | SEC04 | pass |
| RepoRoast | TypeScript application | real | DOC01 | pass |
| RepoRoast | TypeScript application | real | TST01 | pass |
| RepoRoast | TypeScript application | real | TST03 | pass |
| RepoRoast | TypeScript application | real | TST04 | pass |
| RepoRoast | TypeScript application | real | STR01 | fail |
| RepoRoast | TypeScript application | real | SEC04 | pass |
| RepoRoast | TypeScript application | real | MNT01 | fail |
| RepoRoast | TypeScript application | real | MNT02 | pass |
| RepoRoast | TypeScript application | real | CON03 | not-applicable |
| RepoRoast | TypeScript application | real | MET02 | not-applicable |
| javascript-package | JavaScript package | synthetic | TST01 | pass |
| javascript-package | JavaScript package | synthetic | TST03 | pass |
| javascript-package | JavaScript package | synthetic | MNT02 | unknown |
| javascript-package | JavaScript package | synthetic | MNT03 | not-applicable |
| javascript-package | JavaScript package | synthetic | SEC04 | pass |
| rust-project | Rust project | synthetic | TST01 | pass |
| rust-project | Rust project | synthetic | TST03 | pass |
| rust-project | Rust project | synthetic | MNT01 | pass |
| rust-project | Rust project | synthetic | MNT02 | pass |
| rust-project | Rust project | synthetic | MNT03 | pass |
| go-application | Go application | synthetic | TST01 | pass |
| go-application | Go application | synthetic | TST03 | pass |
| go-application | Go application | synthetic | MNT01 | pass |
| go-application | Go application | synthetic | MNT02 | pass |
| go-application | Go application | synthetic | MNT03 | pass |
| go-application | Go application | synthetic | SEC03 | not-applicable |
| cli-tool | CLI tool | synthetic | TST03 | pass |
| cli-tool | CLI tool | synthetic | SEC04 | pass |
| cli-tool | CLI tool | synthetic | STR03 | pass |
| cli-tool | CLI tool | synthetic | MNT03 | not-applicable |
| cli-tool | CLI tool | synthetic | SEC02 | not-applicable |
| documentation | Documentation-only repository | synthetic | DOC01 | pass |
| documentation | Documentation-only repository | synthetic | DOC03 | pass |
| documentation | Documentation-only repository | synthetic | TST01 | not-applicable |
| documentation | Documentation-only repository | synthetic | SEC03 | not-applicable |
| documentation | Documentation-only repository | synthetic | MNT03 | not-applicable |
| documentation | Documentation-only repository | synthetic | STR03 | pass |
| Hello-World | Small hobby repository | real | DOC01 | partial |
| Hello-World | Small hobby repository | real | DOC02 | fail |
| Hello-World | Small hobby repository | real | TST01 | fail |
| Hello-World | Small hobby repository | real | STR01 | fail |
| Hello-World | Small hobby repository | real | STR03 | fail |
| Hello-World | Small hobby repository | real | MNT03 | not-applicable |
| mature-monorepo | Large mature project (synthetic, not popularity-calibrated) | synthetic | TST01 | pass |
| mature-monorepo | Large mature project (synthetic, not popularity-calibrated) | synthetic | TST02 | pass |
| mature-monorepo | Large mature project (synthetic, not popularity-calibrated) | synthetic | TST03 | pass |
| mature-monorepo | Large mature project (synthetic, not popularity-calibrated) | synthetic | MNT01 | pass |
| mature-monorepo | Large mature project (synthetic, not popularity-calibrated) | synthetic | MNT02 | pass |
| mature-monorepo | Large mature project (synthetic, not popularity-calibrated) | synthetic | STR03 | pass |
| mature-monorepo | Large mature project (synthetic, not popularity-calibrated) | synthetic | SEC04 | pass |
| empty-shell-project | Adversarial: presence without substance | synthetic | DOC01 | fail |
| empty-shell-project | Adversarial: presence without substance | synthetic | DOC02 | partial |
| empty-shell-project | Adversarial: presence without substance | synthetic | DOC03 | partial |
| empty-shell-project | Adversarial: presence without substance | synthetic | DOC04 | partial |
| empty-shell-project | Adversarial: presence without substance | synthetic | TST01 | fail |
| empty-shell-project | Adversarial: presence without substance | synthetic | STR01 | fail |
| empty-shell-project | Adversarial: presence without substance | synthetic | CON01 | fail |
| empty-shell-project | Adversarial: presence without substance | synthetic | CON02 | fail |
| empty-shell-project | Adversarial: presence without substance | synthetic | MNT03 | fail |
| empty-shell-project | Adversarial: presence without substance | synthetic | SEC02 | fail |
| deceptive-ci | Adversarial: echoed/quoted test names and broad token | synthetic | TST01 | fail |
| deceptive-ci | Adversarial: echoed/quoted test names and broad token | synthetic | TST03 | fail |
| deceptive-ci | Adversarial: echoed/quoted test names and broad token | synthetic | SEC04 | fail |
