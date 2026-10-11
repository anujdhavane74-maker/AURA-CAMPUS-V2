# Implementation Roadmap and Antigravity Operating Rules

## 1. Absolute workspace rule

**Build Aura Campus from scratch in a new directory.** Before any command that edits files, print and verify the current working directory and list its contents. If it points to the old prototype/repository, stop. Do not edit, delete, overwrite, or “fix” the old Aura Campus files. Do not reuse the old `index.html` as the new app shell. Use it only as a reference for product requirements and design ideas.

Do not run destructive database commands against the existing Supabase project. Create a separate development/test project and new migrations unless the owner explicitly authorizes a migration.

## 2. First Antigravity instruction

Read all ten markdown files before writing application code. Treat `00-PROJECT-CHARTER.md` as the project direction and this file as execution policy. Summarize the requirements and identify unresolved decisions. Do not start coding until the new directory, stack, route map, data model, and first-phase acceptance criteria are agreed.

Do not invent credentials, project IDs, deployment URLs, user IDs, IP addresses, or secrets. If a tool asks for an IP address, determine why it needs one and whether it is a local bind address, allowlist entry, or deployment setting; ask the owner if a real external address is required. Never fabricate one.

## 3. GSD workflow

Use the installed GSD workflow to plan and verify the new project, not to resume a previous repair task. Follow the actual CLI's help/output; do not assume command names or flags beyond what the tool reports.

Suggested order:
1. Inspect GSD help and initialise state inside the new project directory.
2. Ingest these specification files as project requirements.
3. Create the project/roadmap and phase plans.
4. Execute one bounded phase at a time.
5. Run verification against the phase acceptance criteria.
6. Commit/document the completed phase before moving forward.

The user has previously used these workflow intents: new project initialization, phase planning, phase execution, and work verification. Use the current installed GSD command syntax rather than blindly replaying commands from another folder.

## 4. Delivery phases

### Phase 0 — Foundation and decisions
- Create a new app in a clean directory.
- Confirm stack, folder structure, environment strategy, design tokens, route map, and test commands.
- Add `.env.example`, lint, typecheck, test runner, CI/build baseline, and architecture decision records.
- **Exit:** clean install, lint, typecheck, tests, and build pass.

### Phase 1 — Database and auth
- Create a separate Supabase dev/test project.
- Add migrations for profiles, visibility, storage rules, and initial RLS tests.
- Implement signup, verification, sign-in/out, reset password, and account route guards.
- **Exit:** anonymous/owner/second-user access tests pass; new profile is private.

### Phase 2 — Profile system and privacy
- Profile CRUD, sections, avatar/cover, field visibility, preview, privacy settings.
- Public-safe profile resolver and public handle route.
- **Exit:** private profile is not retrievable through any public path; field-level visibility verified.

### Phase 3 — Portfolio builder
- Guided onboarding, project CRUD, skills/credentials, themes, section order, draft persistence, preview.
- **Exit:** save/reload/edit works and drafts remain private.

### Phase 4 — Publish, discovery, and sharing
- Explicit publish/unpublish, Explore/search, copy/native share, tokenized unlisted links, revocation, QR, crawler-ready metadata.
- **Exit:** visibility matrix and sharing tests pass with anonymous and second-user clients.

### Phase 5 — Growth and career extras
- Growth timeline, resume output, resume/GitHub imports as reviewed drafts, privacy-safe analytics if approved.
- **Exit:** no imported content publishes automatically; no fabricated analytics.

### Phase 6 — Hardening and release
- Responsive/accessibility, security review, abuse report flow, production config, backup/migration plan, deployment verification.
- **Exit:** release checklist in `08-SECURITY-QUALITY-AND-TEST-PLAN.md` is complete.

## 5. Working rules

- Plan before implementation; do not generate the entire application in one opaque step.
- Use small modules and typed services, not a giant component or one-file app.
- Never append a “fix layer” to work around a broken architecture; identify the root cause and correct the owning module.
- No fake/demo auth in production paths. Demo fixtures may exist only in isolated tests/storybooks and must never be confused with real accounts.
- No success toast until the server confirms success.
- Do not invent test results. Run commands and report their actual exit status.
- Keep migrations, `.env.example`, README, route documentation, and tests synchronized.
- Ask before destructive actions, external publication, database resets, or changes to existing deployments.
- When a requirement is ambiguous, state the ambiguity and propose a decision rather than silently guessing.

## 6. Final handoff format

At the end of each phase report:
- What was implemented.
- Files/modules created or changed.
- Commands actually run and their results.
- Tests that passed/failed and unresolved issues.
- Security/privacy assumptions verified.
- The next phase and any decision needed from the owner.

## 7. Overall acceptance gate

Do not call Aura Campus complete until the product can demonstrate the core end-to-end flow with two distinct accounts and an anonymous visitor: private signup → profile/portfolio creation → saved draft → preview → explicit publication → public discovery/share → privacy change/unpublish → verified denial of access. The old prototype must remain untouched throughout the rebuild.
