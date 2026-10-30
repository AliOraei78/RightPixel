# Architecture

Domain contains game entities and pure evaluators. Application contains access rules, public projections, progression and rewards. Infrastructure owns PostgreSQL, transactions, bundled content and SMTP. API owns cookie authentication, antiforgery, OTP delivery reservations, rate limits and current-player identity.

Each workspace loads only the current player's profile, attempts, receipts, progress and checkpoints. Shared content is loaded separately. Writes lock that player's database row; reads use repeatable-read transactions. Email reservations use transaction advisory locks, consistently IP before email. No process-wide semaphore coordinates players.

The session cookie is protected by ASP.NET Core Data Protection. Its session ID is checked against the database on every request. Logout revokes the record. Authentication is required before all game routes. Every JSON write checks an antiforgery token, including login and logout. Only the fixed Nginx proxy is trusted for forwarded headers.

Public node projections remove answer keys recursively, including boss rounds, and do not send unpaid hint text. Room lists contain metadata and lock state only. Starting, answering and hint purchases check prerequisite completion on the server. Workshop downloads omit reference solutions until the workshop is complete.

Checkpoint revision is optimistic concurrency control for presentation state. Checkpoint JSON never sets completion, rewards or the authoritative boss round. Every successful boss round resolves its own attempt and advances the separate server-controlled round field. Final success alone unlocks the next room and pays rewards. Resending the same attempt and answer replays the recorded outcome.

Frontend features depend on core ports and ui/platform. HTTP, pixel avatars, audio and scene rendering are injected from app/bootstrap. A view owns cancellation and disposal. Checkpoint writes are serialized and copy their input. Account state is cleared on logout or 401. Draft code now lives in the account checkpoint instead of shared browser storage; sound/motion preferences remain device-local.

PostgreSQL migrations are new and separate from the archived SQLite history. Compose initializes a restricted runtime role; migrations and initial curriculum installation run in a separate one-shot container. Never run the new provider against the archived SQLite file. Backups and rollback images are described in README.md.
