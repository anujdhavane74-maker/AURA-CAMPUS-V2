# UX, Navigation, and Design System

## 1. Information architecture

### Public navigation
- Home / product overview
- Explore students (only discoverable profiles)
- Public profile
- Public portfolio / project case study
- Sign in / sign up

### Authenticated navigation
- Dashboard
- My Profile
- My Portfolio
- Projects
- Skills and credentials
- Growth timeline
- Preview / Publish
- Discovery
- Sharing links
- Settings and privacy

Keep the mobile navigation concise and thumb-friendly. Do not duplicate routes under multiple competing navigation systems.

## 2. Key user journeys

### First-time student
1. Open landing page and understand the product.
2. Create account and verify email.
3. Complete minimum profile fields.
4. Review default-private privacy notice.
5. Save profile and portfolio draft.
6. Preview as owner and as visitor.
7. Choose profile and portfolio visibility independently.
8. Publish only after explicit confirmation.

### Public discovery
1. Visitor opens Explore.
2. Search/filter profiles.
3. Results include only discoverable public profiles.
4. Visitor opens a profile and sees only public sections.
5. Visitor can share the profile URL or a permitted portfolio URL.

### Private profile owner
1. Owner sets profile to Private.
2. Public profile URL returns a privacy-preserving unavailable response or a generic not-found response.
3. Profile is absent from search, suggestions, sitemaps, public counts, and metadata.
4. Owner's dashboard remains accessible to the owner.

### Share and revoke
1. Owner chooses profile, portfolio, or specific project.
2. UI shows exact destination and audience.
3. Owner copies link, uses native share, or displays QR.
4. If link is unlisted/token-based, owner can revoke it in settings.
5. Revoked URL no longer returns content.

## 3. UI states every page must support

- Initial loading / skeleton.
- Successful populated state.
- Empty state with a useful next action.
- Validation errors tied to fields.
- Network/server failure with retry.
- Permission denied / private content.
- Expired session and re-authentication.
- Save-in-progress and confirmed-save state.
- Unsaved changes warning where leaving would lose edits.

## 4. Visual direction

- Warm neutral surfaces, strong readable text, teal as the default accent, generous whitespace, clear hierarchy, and restrained motion.
- App palettes: Teal, Ocean, Indigo, Emerald, Coral. Store the selected palette as a user preference; ensure contrast in every palette.
- Portfolio themes: use a theme registry with 12 documented themes inspired by the reference artifact: Studio, Noir, Canvas, Midnight, Brutalist, Sunset, Minimal, Sticker, Resume, Ocean, Editorial, and Aurora. If design exploration changes names, update this list and acceptance tests together.
- Portfolio themes change the public portfolio presentation, not app-wide controls or privacy behavior.
- Use shared tokens for spacing, radii, typography, shadows, breakpoints, focus rings, and motion.
- Respect `prefers-reduced-motion`; never rely on animation to convey status.

## 5. Accessibility requirements

- All controls keyboard accessible with visible focus.
- Use labels and appropriate input types; do not use placeholders as labels.
- Dialogs trap focus, support Escape when safe, and restore focus on close.
- Images have meaningful alt text or empty alt for decorative media.
- Status updates are announced accessibly; error messages are specific and actionable.
- Text and controls meet WCAG 2.2 AA contrast targets.
- Provide accessible names for icon-only buttons.

## 6. Copy rules

- Distinguish “Save draft”, “Publish”, “Unpublish”, “Make profile public”, and “Create share link”; do not collapse them into one vague action.
- Explain visibility in plain language: “Public profiles can appear in Explore and can be viewed by anyone.”
- Explain unlisted links: “Anyone with this link can view it. It will not appear in Explore. You can revoke the link.”
- Never claim “sent”, “saved”, “published”, or “deleted” until the server confirms success.
- Avoid fake user counts, fake testimonials, and fictional achievement examples presented as real.

## 7. Responsive breakpoints

Define tokens centrally and test at 320, 375, 768, 1024, and 1440 CSS pixels. Layouts must reflow; do not merely scale desktop UI down. Profile headers, project grids, share dialogs, and settings controls need dedicated mobile layouts.
