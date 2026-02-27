# Architecture

## Core Stack
- Next.js App Router (single repo)
- Decap CMS for Git-backed content management
- AWS Amplify for hosting and deployments
- Amazon SES for outbound emails
- Minimal managed store for transactional reliability only
- API middleware for request ID propagation
- API anti-spam layer with honeypot and per-IP rate limiting

## Managed Store Choice
The transactional layer uses DynamoDB as a tiny managed store so signup writes and spot decrements are safe under concurrent requests.

### Table: `SIGNUP_TABLE_NAME`
- Partition key: `pk` (string)
- Sort key: `sk` (string)

### Item shapes
- Signup record:
  - `pk`: `SIGNUP#{idempotencyKey}`
  - `sk`: `FORM#{formType}`
  - `referenceId`: UUID
  - `payload`: form payload object
  - `createdAt`: ISO timestamp
- Spot counter:
  - `pk`: `COUNTER#{dateKey}`
  - `sk`: `CLASS#{bikeClass}`
  - `spotsLeft`: number

### Why this split
- Git remains authoritative for editorial content.
- DynamoDB is only used where idempotency and atomic updates matter.

## API safeguards
- Honeypot field (`website`) silently drops bot submissions.
- Form routes enforce per-IP rate limits.
- Idempotency keys prevent duplicate signup records and side effects.
