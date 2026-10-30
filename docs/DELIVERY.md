# Multiuser delivery — 2026-10-29

## Reading panel follow-up — 2026-10-30

Replaced sprite-driven text sizing with a reserved reading area and native-column pagination. Compact layouts use one speaker panel with a portrait, compact health/coin values and a scene strip. Code blocks, code choices and workshop content open in a native dialog with a controlled scroll region. Dialogue continuation visits remaining reading pages before advancing the lesson. Reading page changes use the existing revision-controlled checkpoint queue. Sprite sizes compensate for canvas scaling. Removed per-frame bubble measurements and the fixed 420px short-screen height.

Validation: frontend TypeScript/Vite build and ESLint passed; the web container was rebuilt independently of API/database services. No automated test suites ran. Browser Use is disabled in Work settings, so these changes have not received fresh visual verification; all-size, keyboard and real-device acceptance remains outstanding. No TicketHub files or database migrations changed.

Implemented PostgreSQL 18, independent verified-email accounts, cryptographically random single-use OTP, shared durable 120-second resend gate, per-code and hourly limits, cookie sessions, CSRF, player ownership and transaction locks. Removed runtime Studio, Revenge Hall and player backup import. Added server checkpoints, 48 pixel avatars, in-scene controls, responsive layout and word-by-word dialogue.

Curriculum: all original 308 rooms remain, plus four authored pilot rooms (S01/S02/S04/S05), totaling 312 across 44 stages. The three-round boss saves only server-validated round advances. Public projections remove answer keys. Reference workshop files are gated until completion.

Verified: 18 backend tests on isolated PostgreSQL 18, including every room and boss round; 18 browser checks across Chrome/Firefox/WebKit and responsive sizes; 12 media/avatar checks; build, TypeScript, architecture lint and deterministic content generation. SMTP STARTTLS and authentication succeeded without sending any email.

The local Compose install uses a restricted runtime database role and a separate migration container. Public database ports are absent. Development is bound to loopback; public hosting requires HTTPS and Production. TicketHub files and services were not changed.

Legacy source, SQLite schema/test history and WAL-compatible database backups are in backups/. Old runtime images have before-multiuser-20261029 tags. The old SQLite volume remains. The new PostgreSQL dump is backups/after-multiuser-20261029.dump. Cookie key material and .env must also be protected in operational backups.

Limits: real inbox delivery and physical phones were not tested. Public-domain HTTPS cannot be validated without deployment/domain configuration. Browser API fixtures and real backend integration tests are separate; the local installation receives an additional anonymous smoke check.

Verified installed smoke: health 200, anonymous game access 401, signup renders 48 avatars, desktop and 320px screenshots inspected. PostgreSQL pg_dump was restored into a fresh temporary database and all 312 rooms were present; the temporary restored database was removed.

## Entry flow update — 2026-10-30
Public welcome now precedes signup/login; returning players explicitly choose Continue. Protected room URLs preserve the intended destination. Session errors remain distinct from guest state, SMTP failures stay visible, verification typing matches the API, unopened clues are filtered server-side, and incorrect-answer replay does not report node completion. No database migration or TicketHub change was required.


## Persian copy and account layout — 2026-10-30
Technical labels such as C# and .NET use isolated LTR text inside Persian UI. Presentation copy uses friendly Persian while stored questions, answer values and source code stay unchanged. Login, signup and verification share a centered responsive card. Welcome actions have equal dimensions and typography. Custom accessible Persian field errors replace browser validation balloons on account/profile forms; OTP accepts Persian digits.

Validation: 27 browser tests passed across Chrome, Firefox and WebKit, covering 320–2560px, plus a focused OTP validation test and 13 media/copy tests. TypeScript build, ESLint and formatting passed. Compose rebuilt with existing database volumes; installed smoke verified health, anonymous access rejection, avatars and desktop/mobile login layout. Screenshots inspected. No additional email sent; the earlier live OTP reached the recipient's Spam folder. Physical phones and public HTTPS remain unverified.


## Scene UI and password accounts — 2026-10-30
Source and PostgreSQL rollback snapshot: backups/before-ui-password-20261030/. The additive PasswordAccounts migration adds nullable password hashes, one-use password grants and durable login failure records; player IDs and saves remain unchanged. TicketHub was not edited.

Email verification now grants only a 10-minute, one-use password capability. Password login uses ASP.NET Core IdentityV3 PasswordHasher with 220,000 iterations; email and IP failure gates are durable and serialized. Password reset revokes all existing sessions. First password setup creates a non-persistent session; subsequent login accepts rememberMe, default false, with a seven-day absolute/24-hour idle server limit. User-selected password policy supersedes the original plan: 6–128 characters, at least one letter, decimal digit and punctuation/symbol. Six-character passwords are weaker than the initially proposed length. Existing valid legacy sessions remain valid until expiry/logout; old accounts set a password through email verification.

Scene changes: actual header/toolbar/control measurements size the arena; NPC and player bubbles have separate presentation areas, separate scrollable bodies and persistent action footers. Bubble tails track rendered sprite coordinates, including motion and resizing. Short landscape screens use side-pointing bubbles between sprites. Inventory, timer, save notice and title have separate reserved areas. Added dark scrollbars, compact mobile HUD, paginated avatars with selected preview, phase-grouped map and balanced welcome layout. Code and selected puzzle/minigame boards stay in the player workspace.

Validation performed without running automated suites: frontend TypeScript/Vite build, ESLint, API build, Compose health; direct browser inspection of production welcome/map/profile/lesson and a separate loopback-only fixture preview of question choices, long code, three pilot types and three boss rounds. Representative scene geometry at 320x568, 390x844, 768x1024, 1366x768, 1920x1080, 2560x1440 and 844x390 showed no overlap among visible toolbar, speech bubbles, HUD and scene controls after corrections. The isolated preview never accesses production PostgreSQL or SMTP; its outcomes are illustrative, not backend correctness verification.

Still not verified: a full real-inbox password setup/recovery/login cycle after this change (new credentials must be entered by the user), real phone keyboards and native Firefox/Safari. Existing authentication test setup was updated for password grants but no tests were executed.

Final collision corrections also reserve independent toolbar slots for inventory/title/map and a notice row for timer/save feedback. Primary speech actions stay outside the scrolling text. Mobile HUD was compacted without dropping health/coins/experience values. Manual fixture inspection covered incorrect-answer feedback and a timed code room in addition to the earlier pilot/boss views; no production progress was unlocked for inspection. Guest-form layout and custom empty-field errors were inspected on a second isolated preview without entering real credentials or sending mail. Browser automation fixtures were aligned with the new password/setup and paginated-avatar flow but not executed.

Installed final verification: production lesson layout was inspected at 1366x768 and 320x568 with no visible toolbar/bubble/control intersections or page overflow. Final evidence is in docs/screenshots/scene-ui-desktop-20261030.jpg and scene-ui-mobile-20261030.jpg. The user replied that the password-flow result was okay; credentials were not entered or collected by the agent. Table privileges for the restricted runtime role were checked read-only and were present on both new authentication tables. Full automated suites and physical-device/cross-browser checks remain unexecuted. Temporary visual-preview servers were shut down after review.
