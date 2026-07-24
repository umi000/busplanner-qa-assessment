# Handoff

## Start Here

1. Read `CLAUDE.md` for the suite's AI working agreement.
2. Install dependencies and Chromium using the commands in `README.md`.
3. Copy `.env.example` to `.env` only when overriding the public demo defaults.
4. Run `npm run test:featured`, then `npm test`.

## Maintaining Tests with an AI Agent

Give the agent a narrow user outcome and require it to inspect the live DOM, reuse page
objects, run the changed test, and explain the assertions. A useful prompt is:

> Add a test for [behavior]. Follow CLAUDE.md, inspect existing page objects and the
> live UI, prefer data-test hooks, add outcome assertions, run the focused test, and
> record verified product findings in OBSERVATIONS.md.

Do not accept fixed sleeps, positional selectors without justification, hard-coded
prices, or changes made only to silence a failing assertion. Use Playwright traces to
separate application, environment, and automation failures.

## Adding a Journey

1. Identify the user outcome and its preconditions.
2. Inspect existing fixtures and page objects before adding abstractions.
3. Add reusable interactions to `pages/<area>.page.js`.
4. Add the scenario under `tests/` with `test.step` for long workflows.
5. Add at least one assertion on persisted or computed behavior.
6. Run the test alone three times, then run the full suite.
7. Update `README.md` or `OBSERVATIONS.md` if setup or known behavior changes.

## Suggested Next Automation

1. API-assisted setup/cleanup if the demo exposes a stable supported API.
2. Customer registration using unique timestamp/UUID data.
3. Category and brand filter combinations, including no-results behavior.
4. Address-field boundary and format validation.
5. Admin authorization and product-management smoke tests.
6. A second browser project after Chromium is stable.
7. CI workflow with environment-injected credentials and report retention.

## Troubleshooting

- Open `playwright-report/index.html` with `npm run report`.
- Inspect `test-results/**/trace.zip` using `npx playwright show-trace <path>`.
- Re-run one test with `npx playwright test <file> --headed`.
- If the shared account or catalog was reset, confirm behavior manually before changing
  selectors or expectations.
