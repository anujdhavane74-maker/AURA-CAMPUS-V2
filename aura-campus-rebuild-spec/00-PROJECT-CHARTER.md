# Aura Campus — Project Charter

**Status:** Authoritative brief for the fresh rebuild  
**Version:** 2.0 planning baseline  
**Date:** 11 October 2026

## 1. Non-negotiable direction

Aura Campus is being **rebuilt from scratch in a new project directory**. This is not a repair, refactor, continuation, or patch of the previous `index.html` prototype. Do not copy its application code, append scripts to it, or modify the old project. The old file is a product-reference artifact only: it communicates feature intent, visual direction, and lessons learned.

Before creating files, confirm the active working directory is the new rebuild directory. Keep the old prototype and its existing deployment/database untouched until the owner explicitly approves any migration or change.

## 2. Product vision

Aura Campus is a student identity and career-presence platform. Every student can create a rich profile, document growth, showcase projects, and publish a portfolio. Students can discover one another, view profiles according to each owner's privacy settings, and share profiles or individual portfolio items through reliable links.

The product combines:
- A LinkedIn-inspired student profile and discovery layer.
- A portfolio builder with customisable presentation.
- Project, skills, education, experience, achievements, certificates, and growth records.
- Explicit profile and portfolio privacy controls.
- Safe sharing, copy-link, native share, QR, and social-preview support.
- An owner dashboard for editing, publishing, and managing visibility.

Aura Campus is **not** a clone of LinkedIn. It should have its own student-first experience and visual identity.

## 3. Primary outcomes

1. Students can register, verify their account, sign in, recover access, and manage a profile.
2. Profile owners can choose public, private, or restricted visibility without accidental exposure.
3. Public profiles can be discovered and shared; private profiles are not exposed by search, directory, APIs, or public URLs.
4. Students can create, preview, save, publish, unpublish, and update portfolios without losing data.
5. Project/profile edits persist across sessions and devices.
6. Every critical flow is covered by automated tests and verified against database permissions.

## 4. Product principles

- **Privacy by default:** a new account and unfinished portfolio are private.
- **Owner control:** no public change happens silently; publishing and privacy changes require clear confirmation where risk is meaningful.
- **Real persistence:** no fake login, local-only account security, seeded visitor counts, or success messages without confirmed server results.
- **Honest content:** never invent student achievements, metrics, endorsements, skills, or credentials.
- **Mobile-first:** all primary flows work at narrow widths and with touch input.
- **Accessible:** semantic HTML, keyboard operation, visible focus, sufficient contrast, reduced-motion support, and labelled controls.
- **Incremental delivery:** define, build, test, and verify one phase at a time.

## 5. Visual baseline from the reference artifact

Retain the product's calm, polished, student-friendly design language rather than its implementation: teal-forward accents, spacious cards, readable typography, rounded surfaces, restrained shadows, light/dark support, and responsive layouts. The reference supports five global palettes: **Teal, Ocean, Indigo, Emerald, Coral**. Treat these as application-wide palettes, separate from portfolio presentation themes. The reference also contains twelve portfolio themes; document and implement a validated theme registry instead of hardcoding theme behavior across pages.

## 6. Definition of success

A new student can sign up, complete a profile, set it to private, save a portfolio draft, preview it, publish only selected content, switch the profile to public, find another public student, share a profile link, and later revoke public access. A second account cannot read or modify private data by changing a URL or calling the API directly.

## 7. Explicitly out of scope for the first production milestone

- Direct messages, group chat, and real-time presence.
- A public activity feed with algorithmic ranking.
- Paid plans, payments, and subscription entitlements.
- AI-generated content that publishes without human review.
- University verification or identity-document collection.
- Importing old production records automatically.

These may be planned later after core privacy, identity, and portfolio flows are reliable.
