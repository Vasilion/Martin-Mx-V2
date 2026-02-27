# Testing Guide

## Test layers
- Unit tests: form schemas, stores, utility logic.
- Integration tests: API route behavior and idempotency flow.
- Contract tests: email payload completeness and CMS data contracts.
- E2E tests: route-level browser journeys.

## Run tests
- Full suite: `npm run test`
- Contract-only suite: `npm run test:contracts`
- E2E suite: `npm run test:e2e`
- CI-equivalent local run: `npm run lint && npm run typecheck && npm run test && npm run test:e2e`

## CI gates
`master` merges should require passing:
- lint
- typecheck
- unit/integration/contract tests
- e2e tests

## Adding tests for new features
1. Add schema test if new payload/content fields were introduced.
2. Add contract test if the feature affects outgoing email or CMS model.
3. Add integration test for route handlers.
4. Add e2e path coverage for user-facing flows.

## Current contract coverage checklist
- Signup email payload contracts include all submitted fields.
- CMS content loaders validate settings, home, track-info, contact, pricing, schedule, sponsors, and gallery.
- Form API integration tests cover valid payloads, invalid payloads, honeypot behavior, and rate limiting.
