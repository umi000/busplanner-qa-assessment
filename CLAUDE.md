# AI Instructions for This Test Suite

## Mission

Maintain a durable Playwright JavaScript suite for `https://practicesoftwaretesting.com`.
Prioritize observable user outcomes, stable `data-test` selectors, and tests that remain
independent on a shared, periodically-reset environment.

## Working Agreement

1. Read `README.md`, `HANDOFF.md`, and the affected page object before changing tests.
2. Inspect the live DOM before adding or changing a selector.
3. Locator policy (strict): `data-test` via `getByTestId` / `testId()` first
   (config sets `testIdAttribute: 'data-test'`), then accessible role/name, then
   scoped CSS only when neither exists.
4. Keep interaction logic in `pages/`; keep business assertions and intent in `tests/`.
5. Never hard-code catalog prices, order IDs, or state created by a previous run.
6. Use environment variables for credentials and URLs.
7. Run the smallest affected test first, then `npm test`.
8. Review traces/screenshots for failures before changing waits or adding retries.
9. Do not use fixed sleeps. Wait for a user-visible state or network-backed UI outcome.
10. Add verified product issues or testability risks to `OBSERVATIONS.md`.

## Useful Commands

```bash
npm test
npm run test:featured
npm run test:headed
npm run report
```

## Definition of Done

- New behavior has a meaningful outcome assertion and a negative case where valuable.
- Tests pass independently and as a suite in Chromium.
- No secrets, generated reports, videos, screenshots, or `node_modules` are committed.
- Documentation reflects any new setup, known risk, or extension point.
