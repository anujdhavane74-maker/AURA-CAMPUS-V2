# Verification and demo acceptance checks

## Checks run

- **Production build:** TypeScript type-check plus Vite production bundling. The output is a static application.
- **Domain tests:** 22 scenarios in `tests/workflow.test.ts`. The service is used without React, including a persistent storage adapter, reload/rehydration and write-failure behavior.
- **Rendered UI integration:** 2 scenarios in `tests/interface.test.tsx` exercise the actual React components, forms, buttons, role switcher, router, and persistence adapter using React Testing Library and jsdom. These are not real-browser end-to-end or visual regression tests.
- **Browser inspection:** the desktop landing page was rendered and visually inspected. Mobile navigation was operated in a 390-pixel browser frame and the event directory opened. A subsequent browser session timed out during the multi-step workflow. The complete mobile visual walkthrough, cross-browser/device testing, and real-device touch behavior are **not verified**.

## Coverage

| Requirement                                                      | Evidence                                                                                            |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Edit a student, unique profile handles, add/edit/remove projects | Domain tests and rendered editor/project flow                                                       |
| New synthetic student and club creation                          | Domain tests for private profiles, issuer review, and club ownership                                |
| Hide sections and entire profiles                                | Domain public projection and rendered profile visibility checks                                     |
| Create, edit, publish and delete events                          | Draft → published domain test; rendered organizer form                                              |
| Register, cancel and re-register                                 | Domain and rendered event page                                                                      |
| Prevent duplicates; enforce capacity                             | Domain tests with multiple students and cancellation                                                |
| Registration is not attendance                                   | Both suites check the initial unmarked state                                                        |
| Actual attendance and reviewed issuance                          | Rendered roster → review dialog → issue; service rejects invalid transitions                        |
| Accept privately, opt into display, decline                      | Public profile projection plus rendered records and profile pages                                   |
| Revoked records are recognizable                                 | Domain revocation and history tests; rendered public revoked label                                  |
| Preserve on refresh                                              | Service re-created from serialized storage; edits visible from the new instance                     |
| Reset restores seed                                              | Domain storage test and rendered typed reset confirmation                                           |
| Committee authority, handover, permissions                       | Domain tests including explicit successor acceptance and single-owner invariant                     |
| Issuer review, suspensions and disputes                          | Domain tests for approval, role checks, status and dispute resolution                               |
| Mobile menu and event discovery                                  | Browser interaction at 390 px; other mobile routes have responsive layouts but incomplete visual QA |

## Manual mobile pass on a phone

1. Open the demo, expand the mobile menu, and visit Student stories → Anuj. Check the project cards and public record details.
2. Visit Clubs → Coding Club → Campus Build Sprint. Register as Anuj; reload and confirm the registration persists.
3. Switch to the club organizer. Open the event roster. Complete the event, mark Anuj’s participation and review a contribution before issuing it.
4. Switch back to Student; accept, publish and hide the record. Verify each choice on the public profile.
5. Edit a project, open the profile preview, check for horizontal overflow, and navigate the menu using touch or keyboard.
6. As Platform admin, reset the demo. The original pending, accepted and revoked records should return.

## What this demo does not establish

This is not a penetration test, audited verification system, concurrent database, production accessibility certification, or a multi-user hosted backend. The browser role switcher intentionally allows exploring all roles.
