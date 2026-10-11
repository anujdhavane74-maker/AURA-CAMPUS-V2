# Technical Architecture

## 1. Architectural decision

Build a new, maintainable web application in a fresh directory. The previous single-file HTML prototype is a reference only and must not be used as the application codebase.

## 2. Proposed stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, a small accessible component system, and React Router.
- **Backend/data:** Supabase Auth, PostgreSQL, Supabase Storage, and Row Level Security. Use Edge Functions or a trusted server layer for operations requiring secrets, token creation, moderation, or crawler-ready page rendering.
- **Validation:** Zod schemas shared between forms and server-side boundaries where practical.
- **Testing:** Vitest + React Testing Library for components/logic; Playwright for end-to-end flows; Supabase local/test project for RLS and integration tests.
- **Quality:** ESLint, formatting, strict TypeScript, CI build and test gates.

If the project toolchain has a reason to choose a different stack, document the decision before implementation. Do not silently mix multiple frameworks.

## 3. High-level boundaries

1. **Presentation layer:** routes, accessible components, forms, loading/error/empty states.
2. **Domain layer:** profile rules, visibility resolution, portfolio publication state, share-link lifecycle, validation.
3. **Data-access layer:** typed repository functions; no ad hoc Supabase calls scattered throughout UI components.
4. **Persistence layer:** PostgreSQL tables, indexes, constraints, RLS, migrations, storage policies.
5. **Trusted operations:** server/Edge Functions for token generation and hashing, rate-limited contact delivery, account deletion orchestration, abuse reporting, and server-rendered social metadata as required.

## 4. Core routes

- `/` — marketing landing page.
- `/auth/sign-up`, `/auth/sign-in`, `/auth/forgot-password`, `/auth/callback`.
- `/app` — authenticated dashboard.
- `/app/profile` — edit own student profile.
- `/app/portfolio` — portfolio editor.
- `/app/projects` — project management.
- `/app/privacy` — visibility controls.
- `/app/sharing` — share links and QR.
- `/explore` — public discoverable profiles.
- `/u/:handle` — public profile route; resolves visibility before returning data.
- `/p/:slug` — published portfolio route, if kept separate from profile.
- `/s/:token` — unlisted share route; validates a revocable token.
- `/projects/:projectSlug` — optional public project route.

Route names can change during planning, but canonical routes must be documented once and used consistently.

## 5. State and data flow

- Server/database is authoritative for persisted user data and visibility.
- Client cache may improve responsiveness but cannot be an authorization boundary.
- Mutations use typed services, validate input, handle optimistic updates only where rollback is safe, and refresh authoritative state after success.
- Autosave, if implemented, needs debouncing, per-record serialization, visible save status, retry behavior, and protection against stale writes overwriting newer data.
- Never store passwords, session tokens, or sensitive profile data in custom localStorage records. Use the supported Supabase client session mechanism.

## 6. Configuration and environments

- `.env.example` lists variable names only, never real credentials.
- Browser may contain Supabase URL and publishable/anon key only; all data security depends on RLS and trusted functions.
- Service-role key and third-party secrets remain server-side.
- Use separate development, test, and production Supabase projects where feasible.
- Migrations are version-controlled and reproducible. Do not manually patch production schema without a migration.

## 7. Error handling and observability

- Convert backend errors into user-safe messages; preserve diagnostic details in protected logs without logging secrets or private profile payloads.
- Track request IDs and operational errors where infrastructure supports it.
- Do not expose SQL, stack traces, auth internals, or policy details to visitors.
- Do not report a save/publish success until the authoritative operation is confirmed.

## 8. Architecture decision records

Write a short ADR before changing: framework, authentication strategy, profile/portfolio separation, visibility semantics, storage strategy, or sharing-token design. Record decision, alternatives, consequences, and migration implications.
