# Aura Campus — connected campus demo

A working student identity and club operations demo for the fictional **Aura Institute of Technology**. Students choose what to publish. Clubs can confirm a specific contribution after actual participation. Registration alone never creates an achievement.

**Demo data only — not an official college verification.** The role switcher simulates users; it is not authentication. Use fictional information only.

## Open locally in Antigravity

Use Node.js 22.12+ (tested using Node 24) and npm. Open the directory containing **this README and `package.json`** as a folder in Antigravity. Open its integrated terminal:

```bash
npm ci
npm run dev
```

Open the local URL Vite prints (normally `http://localhost:5173`). No API keys, `.env` file, database, or backend server are required. The lockfile makes dependency installation reproducible. Node/npm and a network connection are needed for the first install; the running demo does not depend on external fonts, images, or APIs.

If using the GitHub branch:

```bash
git clone --single-branch --branch demo/connected-campus-20261030 https://github.com/anujdhavane74-maker/AURA-CAMPUS-V2.git
cd AURA-CAMPUS-V2/working-demo
npm ci
npm run dev
```

## Five-minute founder walkthrough

1. Open **Explore demo → Enter as Anuj**. In **My profile**, edit the introduction. In **Projects**, add a project. Use **View public profile** to see the result.
2. Open **Explore campus**, choose **Campus Build Sprint** and select **Count me in**. The registration panel shows Anuj’s status. Try cancellation and re-registration if desired.
3. Choose **Change demo role → Enter as Riya**. Open **Events → Campus Build Sprint → Manage**. The roster lists Anuj but participation is not recorded.
4. Choose **Mark event completed → Complete event** to simulate the event having taken place. Check **Participated** for Anuj. This updates attendance only.
5. Choose **Confirm contribution** for Anuj. Select a type and describe what he did. Choose **Review confirmation**, inspect the exact wording and named issuer, then **Issue confirmation**.
6. Use the workspace **Demo role** selector to return to Student. Open **Activity records**. Accept the new record privately first; then check **Show on my public profile**. The public profile labels it **Club-confirmed**, separately from student-entered achievements.
7. As the club organizer, open **Confirmations**, revoke the new record and supply a correction reason. It remains in the record history with a revoked label. The student can hide even this corrected record.

To test creating a new event instead, use **Club admin → Events → Create event**, fill in the details and select **Published** and **Accept registrations**. The default **Draft** does not accept sign-ups.

## Other working flows

- Create a fictional student or club from the demo access page. New student profiles start private. New clubs start pending issuer review.
- Explore the public student directory, club pages, announcements, event directory, unique profile links and record details.
- Add, edit and remove education, projects, experience, achievements, and certificates. Evidence is a link; binary file uploads are intentionally excluded. Edit skills as a comma-separated list.
- Edit club identity, create/edit/publish/delete events, close registration, review rosters and export CSV. An event with registration or issuance history can be cancelled but not deleted.
- Manage members and committee permissions. On a seeded club with all three students already enrolled, create another fictional student to test adding a new member, or use the Entrepreneurship Club.
- **Ownership handover:** the current owner nominates another member; switch to Student, select the nominee in **Exploring as**, and accept on the dashboard. The former owner becomes an admin. Inspect the audit entry.
- **Issuer review:** Entrepreneurship Club begins pending. Platform admin can approve or suspend it. Club admins cannot issue for themselves. Switch acting admin when appropriate.
- **Disputes:** from a student’s record detail, report a correction. A platform admin can document a resolution. Resolving a report does not automatically revoke a club’s statement.
- **Privacy:** hide an entire profile, individual sections or accepted records. Export the acting student’s synthetic data as JSON.
- **Reset:** Platform admin → Demo settings → Reset demo data → type `RESET`. This replaces only this origin’s local demo database.

## Architecture

React + TypeScript + Vite, Tailwind CSS, Lucide icons, and React Router. Hash routing keeps deep links usable on plain static hosting. `/#/u/anuj-dhavane` is an example public route. Public here refers to the demo’s profile view, not a guarantee of hosting access or global storage.

```text
src/
  App.tsx                 Public, student, organizer and admin routes
  main.tsx                React entry point
  state.tsx               React store subscription, session and feedback
  components/Layout.tsx   Public navigation, workspace shell, role controls
  components/ui.tsx       Shared forms, dialogs, event, project and record cards
  domain/types.ts         Typed relational entities
  domain/seed.ts          Synthetic institution, students, clubs and activity
  domain/service.ts       Transactional actions, permissions and public projection
  pages/Public.tsx        Landing, discovery, profiles, public records and demo access
  pages/Student.tsx       Personal content, privacy, memberships and acceptance
  pages/Club.tsx          Event lifecycle, attendance, issuance and club operations
  pages/Admin.tsx         Issuer review, user status, disputes, audit and reset
  styles.css              Design tokens, responsive layouts and reduced motion
tests/
  workflow.test.ts        Domain transitions, guards, privacy and persistence
  interface.test.tsx      Rendered React workflows in a DOM test environment
```

`DemoService` is independent of React. A `Persistence` interface supplies read/write operations. Accepted commands clone state, validate, commit to storage, then notify subscribers. Failed writes do not change the live state. The browser implementation uses localStorage for the database and sessionStorage for the acting identity. Dates are stored as ISO instants and displayed in the browser’s timezone.

## Important boundaries

- The demo is for **one browser and one active tab**. Different visitors get their own sample database. A link to a newly created or edited profile will not carry those local edits to a different device. Multiple tabs are not synchronized and can overwrite each other.
- Role and visibility checks model behavior; they are **not security**. All synthetic records exist in browser storage. A developer can inspect or modify them. Do not enter personal information or real credentials.
- Notifications are in-app. No emails, messages or actual invitations are sent. Club issuer approval and all event records are simulated.
- Records are not silently deleted after issuance. Revocation is separate from student acceptance and public visibility. An accepted, visible revoked record explicitly shows its correction.
- The seeded upcoming event is dated relative to the first load/reset. Registration closes if the event date passes. Reset for a fresh demo.
- For production: move business rules and permission checks to an authenticated API, store records in PostgreSQL, enforce capacity/uniqueness atomically, and implement durable audit and privacy controls before collecting real data.

## Development commands

```bash
npm test           # Domain and rendered component integration tests
npm run build      # Type-check and produce dist/
npm run preview    # Serve the production build locally
npm run format     # Format source, tests and documentation
```

See `QA.md` for verification details and manual checks. A static host can serve `dist/` after building. No database provisioning or server deployment is needed for this demo.
