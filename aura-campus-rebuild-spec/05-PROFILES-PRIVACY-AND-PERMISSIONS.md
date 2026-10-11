# Student Profiles, Privacy, and Permissions

## 1. Separate identity, profile, and portfolio

- **Account identity:** Supabase Auth identity and login credentials.
- **Student profile:** a person's Aura Campus identity and selected public biography.
- **Portfolio:** a curated collection of work, projects, credentials, and presentation choices.

These are related but not interchangeable. Making a profile public must not automatically publish every portfolio or project. Publishing a portfolio must not reveal hidden profile fields.

## 2. Visibility model

### Profile visibility
- `private` — visible to the owner in authenticated screens only. Excluded from Explore, public routes, search suggestions, sitemaps, and public counts.
- `public` — selected public-safe fields can be viewed by anyone; discovery is separately controlled by the `discoverable` preference.

If `restricted` access is later added, it must have a real access-list/relationship model, tests, revocation behavior, and server-side authorization. Do not add a UI-only “connections only” mode.

### Portfolio and project visibility
- `private` — owner only.
- `public` — visible by canonical public URL and eligible for search/indexing according to policy.
- `unlisted_link` — accessible to holders of a revocable random token, not listed in discovery. This is not equivalent to private; warn the owner that the link can be forwarded.

Visibility must be checked independently at each resource boundary. A public profile containing a private project must not expose that project.

## 3. Field-level visibility

Profile owner can control optional sections such as education, experience, skills, achievements, certificates, external links, and contact availability. A field hidden in the editor must also be absent from the public API response, HTML, JSON-LD, social metadata, and cached response.

Email address is private by default. Use an opt-in contact form or explicitly enabled contact address rather than exposing the account login email by default. Avoid precise home address, date of birth, personal phone, or other unnecessary personal data.

## 4. Permission matrix

| Action | Owner | Other authenticated user | Anonymous visitor |
|---|---|---|---|
| Read private profile | Yes | No | No |
| Edit own profile | Yes | No | No |
| Read public profile fields | Yes | Yes | Yes |
| Read private portfolio | Yes | No | No |
| Read public portfolio | Yes | Yes | Yes |
| Read unlisted resource | Yes | Only with valid token, if policy allows | Only with valid token |
| Publish/unpublish | Yes | No | No |
| Create/revoke share token | Yes | No | No |
| View private drafts | Yes | No | No |
| Modify another user's project | No | No | No |

## 5. Privacy UX

- Provide a dedicated privacy settings page with current state, audience explanation, and a preview action.
- Use separate controls for profile discoverability and portfolio visibility.
- Show a warning before public publication: public content may be indexed, copied, or captured by others.
- After unpublishing or switching to private, invalidate cached public data and revoke public delivery paths where possible. Explain that search engine caches and previously copied screenshots/links cannot be recalled instantly.
- If user selects public profile but private portfolio, show that difference clearly.
- When sharing a link, label whether it is public, unlisted, or owner-only.

## 6. Safety and abuse

- Add a report-profile/project mechanism and a documented moderation queue before opening broad public discovery.
- Rate-limit profile creation, handle changes, share-link generation, and contact submissions.
- Prevent impersonation signals: reserve official Aura Campus names and show verification only when actually verified.
- Sanitize user-generated text and validate external links. Never render untrusted HTML directly.
- Protect against enumeration, spam, scraping, XSS, open redirects, malicious file uploads, and oversized images.

## 7. Privacy acceptance tests

1. New account cannot be fetched by anonymous API.
2. Private profile is absent from Explore and search results.
3. Changing a URL/handle never grants access to private content.
4. User B cannot read, update, delete, or publish User A's rows.
5. Public API never returns private email, hidden sections, draft projects, or private storage URLs.
6. A revoked unlisted token fails immediately on the next server request.
7. Unpublishing removes the resource from the public route and public discovery query.
8. Every test runs against the database/RLS boundary, not only mocked UI behavior.
