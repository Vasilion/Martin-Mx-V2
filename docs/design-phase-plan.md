# Design Phase Plan

## Goal
Ship a standout visual experience while preserving all current behavior, CMS controls, and signup reliability.

## Current Design Pass Scope
- Home page cinematic hierarchy, stronger media storytelling, and premium section rhythm
- High-impact route polish for register, schedule, gallery, track info, contact, daily signup, and hiring
- Visual consistency for navigation, cards, call-to-actions, and status elements
- Motion and interaction polish that stays performant and accessible

## Quality Bar For Design Lock
- Brand alignment with original Martin color direction (green, black, white; red only for error/cancel states)
- No stretched or distorted media rendering on any major route
- Every core route feels intentional, premium, and equally polished
- CTA hierarchy is clear on all routes and supports core flows (practice, membership, contact)
- Mobile and desktop layouts both feel refined

## Phase Checklist
- [x] Establish premium design language and animation utilities
- [x] Upgrade home route to cinematic composition
- [x] Upgrade register route storytelling and trust blocks
- [x] Upgrade sponsors visual impact with marquee treatment
- [x] Upgrade contact, daily signup, and hiring route hierarchy
- [ ] Final polish for schedule, gallery, and track info
- [ ] Global micro-interaction pass (hover, focus, transitions, consistency)
- [ ] Final cross-route visual consistency sweep
- [ ] Design lock review and handoff notes

## Return To Original Master Plan
After design lock, resume the core roadmap in this order:
1. Final regression verification for feature parity and CMS flows
2. Operational hardening checks (forms, emails, dashboard, print tools)
3. Documentation sweep and release readiness updates
4. Final launch checklist and deployment verification

## Guardrails During Design
- Keep all existing feature behavior intact
- Keep CMS-editable architecture unchanged
- Preserve testing reliability (`lint`, `typecheck`, `test:e2e`)
- Prefer additive UI refinement over structural backend changes
