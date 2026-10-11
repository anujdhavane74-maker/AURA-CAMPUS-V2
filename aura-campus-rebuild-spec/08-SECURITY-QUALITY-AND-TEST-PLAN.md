# Security, Quality Gates, and Test Plan

## 1. Security baseline

- Supabase Auth owns password/session management. Never store raw passwords in localStorage or application tables.
- RLS is enabled on every user-data table and tested using owner, second-user, and anonymous clients.
- No service-role key, database password, email-provider secret, or private API token in frontend code or committed files.
- Validate and authorize every mutation server-side; client-side hidden controls do not count as security.
- Escape/render user content safely; do not use `dangerouslySetInnerHTML` with untrusted input.
- Validate uploads and external URLs; apply size limits and safe content types.
- Rate-limit auth-adjacent operations, discovery, contact forms, share creation, and handle changes.
- Protect against IDOR, XSS, CSRF where applicable, open redirects, token leakage, enumeration, spam, and malicious file uploads.
- Apply secure headers, HTTPS, dependency updates, and production error handling.

## 2. Automated quality gates

Every phase must pass:
1. Formatting/lint.
2. `tsc --noEmit` or equivalent strict typecheck.
3. Unit tests for domain logic and validation.
4. Integration tests for database repositories and RLS.
5. Production build.
6. Relevant Playwright end-to-end tests.
7. Accessibility checks for core journeys.

Do not silence tests, lower assertions, remove lint rules, or skip failing suites just to mark a phase complete. Record known non-blocking limitations explicitly.

## 3. Required test suites

### Authentication
- Signup, verification, sign-in, sign-out, password reset, expired session, account deletion.
- No access to app-only routes without a valid session.
- No custom local plaintext password store.

### Profile CRUD
- Create/update profile; optional sections; field validation; image changes.
- Public profile displays only allowed fields.
- Private profile is unavailable to anonymous and other-user clients.
- Hidden sections are absent from response payloads, not merely hidden by CSS.

### Portfolio
- Create/save draft, refresh, edit, preview, publish, update, unpublish, delete.
- Public page reflects published data only.
- Simulate failed save, slow network, duplicate clicks, and stale responses.

### Privacy/RLS
- User A cannot select/update/delete User B's private records.
- Anonymous user cannot read private records.
- Public access returns an allowlisted shape only.
- Storage policies prevent cross-user object access.
- Share token scope and revocation are enforced server-side.

### Discovery/sharing
- Private profiles excluded from every directory/search surface.
- Pagination, query validation, and rate limiting.
- Copy link, native share fallback, QR, canonical URLs, social preview metadata.
- Unlisted URL cannot be guessed from the owner's ID/handle and is revocable.

### Responsive/accessibility
- Viewports 320, 375, 768, 1024, 1440.
- Keyboard-only navigation, focus states, form labels, dialog focus, reduced motion, contrast, screen-reader status messages.

## 4. Definition of Done

A feature is done only when:
- Acceptance criteria are checked against real behavior.
- Unit/integration/E2E tests pass for its risk level.
- RLS/storage permissions are verified when data is involved.
- Loading, empty, error, success, and permission states exist.
- Mobile and keyboard flows are tested.
- No secret or private field leaks in HTML, JSON, logs, URLs, or metadata.
- Documentation and migration files are updated.
- Build and lint pass on the new codebase.

## 5. Manual release checklist

- [ ] New test account can sign up and verify email.
- [ ] Private by default is confirmed in database and UI.
- [ ] Owner saves profile and portfolio, reloads, and sees persisted data.
- [ ] Second account cannot access or mutate private data.
- [ ] Public profile can be discovered only when intended.
- [ ] Share link/QR/social preview uses the correct public resource.
- [ ] Unpublish/revoke makes content inaccessible through the public route.
- [ ] No fake analytics, demo login, or misleading delivery status remains.
- [ ] Production environment variables and RLS are verified.
