# Production Release Checklist

## Required before merge to `master`
- CI workflow passed (lint, typecheck, unit/integration/contract tests, e2e tests).
- Form email contract tests passed.
- Redirect and metadata checks completed for impacted routes.
- Manual smoke test completed on local build for changed features.

## Required before deployment verification
- Open `/`, `/register`, `/schedule`, `/track-info`, `/gallery`, `/sponsors`, `/hiring`, `/daily-signup`.
- Submit test payloads for practice, membership, contact, hiring, and daily forms.
- Verify submitter confirmation email includes all submitted fields.
- Verify managed store decrement behavior for practice and daily signups.
- Verify SES delivery metrics and no errors in logs.

## GitHub branch protection settings
- Protect `master`.
- Require pull request approvals.
- Require status checks: `CI / validate`.
- Require branches to be up to date before merging.
