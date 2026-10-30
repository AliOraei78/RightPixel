# Browser checks

Run `npm run test:e2e --prefix src/rightpixel-web`. The suite starts isolated Vite on port 5179 and mocks API requests inside each browser context. It never sends email or writes to the installed game. Backend integration tests separately exercise real PostgreSQL and the complete 312-room curriculum.

Six projects cover Chrome, Firefox and WebKit at desktop and narrow/mobile widths. Chrome desktop additionally checks 320, 360, 390, 768, 1024, 1366, 1920 and 2560 pixels, plus 844×390 landscape. Screenshots are retained for 320, 1366 and 2560. Runtime errors and horizontal overflow fail the scene test.

Scenarios: signup, 48-character picker, email verification countdown, minimal profile, removed menus, click-to-reveal dialogue, database checkpoint acknowledgement through the gateway, resume after refresh, pilot card arrangement and authoritative boss-round resume. No real device claim is made by emulated mobile projects.

A live installation smoke check should read health, anonymous session and authentication enforcement, render the signup form without submitting it, and inspect the viewport. Actual email delivery requires an inbox controlled by the project owner; automated tests replace the sender and expose no test-code endpoint in production.
