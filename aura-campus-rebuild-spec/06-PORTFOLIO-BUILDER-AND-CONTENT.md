# Portfolio Builder and Content Model

## 1. Builder lifecycle

`empty → draft → previewed → published → updated/unpublished → deleted`

- Draft is private by default.
- Preview never changes visibility.
- Publish is an explicit server-confirmed operation.
- Editing a published portfolio creates a new saved version or updates the live version according to a clearly documented model. Prefer saving drafts and requiring an explicit “Publish updates” action so unfinished edits do not unexpectedly go live.
- Unpublish makes the canonical public route unavailable to visitors without deleting the owner's content.
- Delete requires confirmation and a clear statement of what is removed.

## 2. Guided onboarding steps

1. **Introduction:** name, headline, short bio, optional avatar.
2. **Student background:** institution/program, education, broad location, graduation year (all optional except display name).
3. **Work and skills:** projects, skills, experience, certificates, achievements. Empty sections are allowed.
4. **Presentation:** select one of the twelve registered portfolio themes, choose an accent, order sections, hide selected sections.
5. **Preview and visibility:** visitor preview, profile visibility, portfolio visibility, publish confirmation.

Users can skip optional fields, leave and return, and edit everything later. Progress is based on real saved fields and never blocks saving because an optional section is empty.

## 3. Project/case-study schema

Each project supports:
- Title (required), short summary, detailed description.
- Problem / goal, personal contribution, approach, outcome, learnings.
- Technology tags and role/team context.
- Status: planning, in progress, completed, archived.
- Repository URL, live demo URL, article URL, media/cover image.
- Optional collaboration credits with consent and correct attribution.
- Visibility, sort order, created/updated timestamps.

Do not imply a project is complete or deployed unless the owner says so. Do not fabricate metrics, user counts, performance improvements, awards, or business outcomes.

## 4. Other profile sections

- Skills: name, optional self-assessed level, optional evidence/project links.
- Education: institution, qualification, field/program, start/end dates, description.
- Experience: organization, role, date range, description, optional link.
- Credentials: type, title, issuer, issue date, credential URL.
- Growth timeline: milestones, projects, certificates, internships, hackathons, learning goals, reflections. Every timeline entry must originate from owner input or a clearly identified imported source.
- External links: label + validated URL.
- Recommendations: do not ship as “endorsements” without attribution, consent, edit/delete controls, and anti-abuse policy. If supported, distinguish a draft quote from a verified recommendation.

## 5. Import features

### Resume import (phase 2)
- Accept explicitly supported file types and size limits.
- Parse locally when practical; explain if any file is sent to a service.
- Show detected fields for review before applying.
- Never replace existing profile values silently.
- Do not publish imported content automatically.
- Remove temporary uploaded files after processing according to a documented retention policy.

### GitHub import (phase 2)
- Request a public username or explicitly authorised OAuth connection; never request a GitHub password.
- Fetch public repositories through a trusted or rate-limited path.
- Let the user select repositories.
- Label imported items as imported drafts and let the owner correct descriptions and attribution.
- Handle API limits, deleted repositories, and private repositories without pretending the import succeeded.

## 6. Resume output

Generate a print-friendly resume from selected profile fields. Preview before printing/export. Respect hidden/private field selections; do not accidentally include account email or private projects. A PDF export must be tested on desktop and mobile print flows.

## 7. Media handling

- Use Supabase Storage or an explicitly selected object-storage provider, not large base64 images in profile JSON.
- Validate MIME type, extension, file size, and image dimensions; consider server-side re-encoding.
- Generate thumbnails and responsive sizes if supported.
- Public assets are served only for public resources; private assets require authenticated or signed access.
- Deleting/replacing a photo cleans up orphaned objects safely.

## 8. Save and publish acceptance criteria

- Reloading after save restores the exact saved draft.
- Network failure never displays false success and does not erase the draft.
- Repeated submit cannot create duplicate projects or portfolios.
- Publishing is confirmed by a read-after-write check of the expected owner, resource ID, and visibility state.
- A second user cannot update the record even by calling the database API directly.
- Public view displays the latest published version, not unsaved draft changes.
