# Product Requirements Document (PRD)

## 1. Personas

- **Student creator:** wants a professional identity, project showcase, resume-ready content, and a stable share link.
- **Student explorer:** wants to discover classmates, collaborators, and projects without exposing their own private profile.
- **Recruiter / visitor:** wants to view information the owner intentionally made public, without needing an account.
- **Profile owner:** needs clear controls for visibility, fields, links, and portfolio publication.
- **Administrator:** needs abuse-report handling and operational oversight, not unrestricted casual access to private profile content.

## 2. Core product areas

### A. Account and onboarding
- Email/password authentication through Supabase Auth; email verification and password reset are required.
- Use provider-supported OAuth only if explicitly configured and tested.
- Profile setup collects a display name and optional student/career details. Do not require college, phone, birth date, or other unnecessary personal data.
- New profiles and portfolios are private by default.
- A user can sign out and delete their account; deletion behavior and retention must be documented.

### B. Student profile (LinkedIn-inspired)
- Required: stable internal user ID, display name, unique public handle only when needed, profile visibility, created/updated timestamps.
- Optional: avatar, cover image, headline, short bio, location at a broad level, institution, degree/program, graduation year, skills, education, experience, projects, certificates, achievements, interests, external links, and contact preferences.
- Sections can be reordered and selectively hidden from the public profile.
- Owner can preview the profile exactly as a visitor sees it.
- Editing a profile must not automatically make it public.

### C. Portfolio builder
- Guided creation flow plus editable dashboard after onboarding.
- Portfolio fields: introduction, headline, biography, skills, projects, achievements, certificates, experience/education timeline, external links, theme, accent, section order, section visibility, and contact setting.
- Projects support title, description, problem, approach, outcome, technology tags, status, image/media, source-code URL, live-demo URL, and optional case-study sections.
- Resume import and public GitHub repository import may be added after core CRUD. Imported content is always a draft and requires review; never publish imports automatically.
- Portfolio save, preview, publish, unpublish, and delete states must be explicit.

### D. Discovery and connections
- Public directory/search for profiles whose visibility allows discovery.
- Search by name/handle and optional public filters such as skills, institution, program, and interests.
- Profile cards expose only public fields and link to the profile.
- Optional follow/connection requests are a later phase. Do not silently create social connections or imply a connection exists without persisted state.
- Private profiles must not appear in public search results, counts, autocomplete, recommendations, sitemap, or public APIs.

### E. Visibility and privacy
- Profile visibility: `private`, `public`, `restricted` (restricted is available only when a real access-list model is implemented; do not simulate it).
- Portfolio visibility is independent from profile visibility: `private`, `unlisted_link`, `public`.
- Default profile visibility is `private`; default portfolio visibility is `private`.
- `public`: eligible for directory/search and accessible by anyone.
- `private`: owner only, except explicitly authorised platform operations.
- `unlisted_link`: accessible only by possession of a revocable share token; not indexed or discoverable. Token must be high entropy, stored hashed server-side, and revocable.
- The app must explain the consequences before a user changes visibility.
- Private email, auth identifiers, private notes, draft content, and hidden fields never appear in public payloads.

### F. Sharing
- Copy profile link and portfolio link.
- Native share via Web Share API where available, with copy-link fallback.
- QR code for the current canonical URL.
- Share a single project/case study only when its visibility allows it.
- Open Graph/Twitter metadata must be generated in a crawler-readable way for public URLs; client-only metadata is insufficient for reliable social previews.
- Owner can revoke unlisted links and unpublish content.
- Shared public views are read-only and must not expose edit controls or private API data.

### G. Dashboard and settings
- Dashboard overview: profile completion based on real saved fields, draft/published status, quick actions, and recent changes.
- Settings: profile visibility, portfolio visibility, hidden sections, contact permissions, account/security, data export/delete, and active share links.
- Analytics must be accurate, privacy-aware, and server-backed if shown across devices. Never display invented counts.

## 3. Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-001 | Register, verify, sign in, sign out, reset password | P0 |
| FR-002 | Persist profile and portfolio data per authenticated user | P0 |
| FR-003 | Private-by-default profile and portfolio | P0 |
| FR-004 | Enforce profile visibility server-side and in database policies | P0 |
| FR-005 | Create/edit/delete profile sections and projects | P0 |
| FR-006 | Draft preview and explicit publish/unpublish | P0 |
| FR-007 | Public profile route with stable handle | P0 |
| FR-008 | Public directory/search excludes private profiles | P0 |
| FR-009 | Copy link and native share fallback | P1 |
| FR-010 | Revoke unlisted share tokens | P1 |
| FR-011 | QR code and social preview metadata | P1 |
| FR-012 | Responsive five-palette app theme system | P1 |
| FR-013 | Twelve portfolio presentation themes | P1 |
| FR-014 | Resume import and GitHub public repository import | P2 |
| FR-015 | Privacy-safe, server-backed analytics | P2 |
| FR-016 | Follow/connection graph | P2; only after privacy foundation |

## 4. Non-functional requirements

- Type-safe implementation with strict TypeScript.
- Server-side validation for all writes; client validation is for usability only.
- No secrets or service-role keys in browser code.
- Database indexes for handles, visibility-aware discovery, ownership, and share-token lookups.
- Paginated search and directory results; no unbounded table reads.
- Reasonable loading, empty, error, and retry states on all network-backed screens.
- Target WCAG 2.2 AA for core user flows.
- Mobile layout at 320px width; no horizontal overflow in core screens.
- Critical actions have automated tests and a documented manual verification path.

## 5. Acceptance summary

The feature is not complete because the UI looks correct. It is complete only when its persisted behavior, access control, failure handling, mobile usability, and tests all pass.
