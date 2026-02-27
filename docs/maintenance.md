# Maintenance Guide

## Routine updates
- Keep dependencies current monthly.
- Verify `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run test:e2e` pass before release.
- Review `docs/release-checklist.md` before each production deploy.

## Updating operational logic
- CMS content changes: update files under `content/` and related schemas in `src/lib/content/schemas.ts`.
- Signup logic changes: update form schemas in `src/lib/forms/schemas.ts` and route logic in `src/app/api/forms/[formType]/route.ts`.
- Counter behavior changes: update store adapters under `src/lib/store/`.
- Anti-spam settings: update thresholds in `src/lib/forms/rate-limit.ts` and honeypot handling in `src/app/api/forms/[formType]/route.ts`.

## Deployment and rollback
- Deploy via Amplify on `master`.
- If production regression appears, rollback to previous Amplify build and revert offending commit.

## Monthly maintenance checklist
- Rotate and verify OAuth/SES credentials.
- Validate `/api/health` response.
- Submit test payloads for all public forms.
- Confirm CMS publish still updates content files correctly.
