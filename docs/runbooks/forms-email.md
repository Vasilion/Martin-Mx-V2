# Forms and Email Runbook

## Purpose
Operational runbook for public form submissions and submitter confirmation emails.

## Required payload behavior
Each form confirmation email must include all submitted fields. This is enforced by contract tests under `src/tests/contracts`.

## Forms covered
- practice
- membership
- contact
- hiring
- daily

## Incident response
1. Reproduce with a known payload from local or production logs.
2. Verify route validation result in `src/app/api/forms/[formType]/route.ts`.
3. Verify honeypot and rate limit behavior for suspicious traffic.
4. Verify template output from `src/lib/forms/email.ts`.
5. Verify SES send success and delivery metrics.
6. Patch and run:
   - `npm run test:contracts`
   - `npm run test`
7. Deploy and verify with live test submission.

## Related operations endpoint checks
- `GET /api/signups` supports `selectedDate`, `bikeClass`, and `formType` filters.
- `GET /api/signups/export` returns CSV for the same filters and is used by `/print`.
