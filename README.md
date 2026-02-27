# Martin MX V2

Next.js rebuild for Martin MX Park with Decap CMS, Amplify hosting, SES email delivery, and a minimal transactional store for signup reliability.

## Stack
- Next.js App Router + TypeScript
- Decap CMS (`/admin`)
- AWS SES for submitter confirmation emails
- DynamoDB (or memory fallback) for idempotent signup records and spot counters
- Vitest + Playwright testing
- API anti-spam safeguards (honeypot + rate limiting)

## Local setup
1. Install dependencies:
   - `npm install`
2. Copy env template:
   - `copy .env.example .env.local` (Windows PowerShell: `Copy-Item .env.example .env.local`)
3. Run dev server:
   - `npm run dev`
4. Open:
   - Site: `http://localhost:3000`
   - CMS: `http://localhost:3000/admin`

## Environment variables
- `AWS_REGION`
- `SES_FROM_EMAIL`
- `SIGNUP_STORE_PROVIDER` (`dynamodb` or `memory`)
- `SIGNUP_TABLE_NAME` (required for `dynamodb`)
- `OAUTH_GITHUB_CLIENT_ID`
- `OAUTH_GITHUB_CLIENT_SECRET`

## Commands
- `npm run dev`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run test:contracts`
- `npm run test:e2e`
- `npm run build`

## CMS editable content
- `content/site/settings.json`
- `content/site/home.json`
- `content/site/track-info.json`
- `content/site/contact.json`
- `content/site/navigation.json`
- `content/site/announcements.json`
- `content/site/operations.json`
- `content/site/success.json`
- `content/forms/pricing.json`
- `content/schedule/events.json`
- `content/sponsors/sponsors.json`
- `content/gallery/gallery.json`

## Operations tools
- Print and filter signups at `/print`
- Export filtered CSV via UI button on `/print`
- Filters supported by APIs: `selectedDate`, `bikeClass`, `formType`

## Testing and maintenance docs
- `docs/testing.md`
- `docs/maintenance.md`
- `docs/content-ops.md`
- `docs/troubleshooting.md`
- `docs/runbooks/forms-email.md`
- `docs/release-checklist.md`
