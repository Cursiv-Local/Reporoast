# Premium readiness assessment

Status: **not ready for paid recommendations**. Proposed configurable price: **USD $4.99/report** (499 integer cents). Live checkout is not implemented, no payment provider is connected, no API can grant entitlements, and there is no paywall or purchase button.

The U2 score is independent of payment status. All free findings, evidence, recommended basic fixes and conditional point gains remain free. `worker/premium.ts` imports no scoring engine and is not connected to the Worker routes. Its quote/receipt logic exists only for isolated tests; supplying an owner approval reference cannot turn live checkout on.

## What is ready

- Versioned structural scoring with explicit limits, evidence levels and intervals.
- More accurate free recommendations identify observed evidence paths, applicability and uncertainty; no fabricated patch targets or execution results.
- Configurable integer-cent proposal, disabled by default, explicit test mode only.
- Test-only signed receipts reject forged signatures, wrong amount/currency/report/quote, stale events and expired payments; event consumption is idempotent through a store contract.
- Report- and capability-scoped test access checks, authenticated refund revocation, and terminal revocation transition tests that reject late payment reactivation and cross-report scope changes. A production store must apply the transition and event consumption atomically.
- No card details, billing data, customer accounts or provider secrets are collected.

## What is not ready (payment blockers)

Current fixes are deliberately practice-level advice plus inspected context. They are not a validated repository-specific diagnosis product worth charging for. No precise patch generation, verified ecosystem example library, real provider webhook verification, persistent order/entitlement state machine, or post-payment support/refund workflow is connected. These omissions are explicit blockers, not features implied by test receipts.

Before paid recommendations, manually review a diagnosis sample across the ten repository types: each recommendation must name a real inspected file/setting, explain what it proves, state unsupported alternatives, give an applicable conditional example, document how the owner can verify it, and disclose uncertainty and conditional score impact. Unknown evidence must ask for verification rather than invent a problem. No secret/source snippet may be exposed in public previews. Keep a review rubric and correction log; do not use score increases as a quality metric.

## Owner gate

Require a new explicit owner approval before live checkout, separate from staging deployment or production-domain approval. A configuration switch alone is insufficient. Implement and review the provider adapter, durable entitlement transaction, access capabilities, retention/refund policy and signed-webhook security tests first. Update the readiness assessment with those observed results, then request approval against that concrete reviewed release.

See PAYMENT-IMPLEMENTATION-PLAN.md. Test receipts are a local protocol for preparation, not an implementation of Stripe or another provider's signature standard.
