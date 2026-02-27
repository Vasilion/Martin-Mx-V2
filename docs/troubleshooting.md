# Troubleshooting

## CMS auth fails
- Confirm `OAUTH_GITHUB_CLIENT_ID` and `OAUTH_GITHUB_CLIENT_SECRET` are set in Amplify and local env.
- Confirm callback URL points to `/api/callback`.

## Form submit returns 400
- Validate payload against the corresponding schema in `src/lib/forms/schemas.ts`.
- Check missing required fields in browser request payload.

## Form submit returns 429
- Rate limit was exceeded for IP + form type.
- Retry after the returned `retryAfterMs` window.

## Email not delivered
- Confirm `SES_FROM_EMAIL` is verified in SES.
- Confirm SES account is production-enabled and not sandbox-limited.
- Check CloudWatch logs for SES send failures.

## Spot counter not updating
- Confirm `SIGNUP_STORE_PROVIDER=dynamodb`.
- Confirm `SIGNUP_TABLE_NAME` exists and IAM permissions allow `PutItem`, `GetItem`, and `UpdateItem`.

## Build failures
- Run `npm run lint`, `npm run typecheck`, and `npm run test` locally.
- Fix schema mismatch between content files and zod schemas.
