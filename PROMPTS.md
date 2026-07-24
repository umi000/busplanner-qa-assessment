# AI Process Log

This is the working log of the AI-assisted session, kept as key turns rather than a
polished retrospective.

## 1. Workspace Review

**Human direction:** Review the directory and files.

**Agent action:** Inspected the workspace and read the supplied assessment PDF. Found
that the folder contained only the brief and no implementation. Extracted the required
flows, featured checkout arithmetic, negative coverage, documentation, and AI assets.

**Verification:** Cross-checked the extracted checklist against all four PDF pages.

## 2. Implementation Direction

**Human direction:** Implement the requirements from the file with all deliverables in
the standard format.

**Agent action:** Scaffolded a JavaScript Playwright project; added configuration,
fixtures, page objects, authentication/catalog/cart/checkout tests, and the required
README, observations, prompt log, handoff, and reusable AI instruction file.

**Judgement applied:**

- Used the public URL and credentials from the brief as overridable defaults.
- Kept browser interactions in page objects and scenario intent in specs.
- Preferred stable `data-test` hooks.
- Calculated line and cart totals from displayed values with decimal-aware assertions.
- Configured failure-only traces, screenshots, and video.
- Kept tests serial in CI due to the shared public environment.

## 3. Live Verification and Refinement

**Prompt to agent:** Run focused tests against the live site. Diagnose failures using
DOM evidence and Playwright output; do not add fixed waits or weaken assertions.

**Agent action:** Executed the suite, corrected selectors and workflow assumptions based
on the current application, and reran focused failures followed by the full suite.

**Verification standard:** A change was accepted only after the relevant test passed.
Any application behavior or shared-environment limitation observed during this stage
was recorded in `OBSERVATIONS.md`.

## 4. Submission Check

**Prompt to agent:** Confirm every assessment deliverable exists, run the complete suite,
check generated diagnostics, and package the project without dependencies or reports.

**Verification result:** The complete Chromium suite passed with 9/9 tests. The archive
contains all requested Markdown files and reusable AI instructions, and was inspected
to confirm that `node_modules` and generated test results are excluded.

## 5. Assessment Cross-Check and Gap Fix

**Human direction:** Review the assessment PDF against the code and fix anything that
does not align.

**Agent action:** Compared each deliverable to the brief. The featured checkout, sign-in
(valid/invalid), search/sort, cart verification, and empty-payment negative case were all
present. The one explicit example missing from the negative section was quantity edge
cases (zero / very large number), so it was added.

**Verification (live DOM first, per CLAUDE.md):**

- Inspected the cart quantity control on the live app: `type=number`, `min=1`, and a
  hidden two-digit cap. Entering `0` clamps to `1`; entering `999999` truncates to `99`;
  line/cart totals recompute correctly for the accepted value.
- Added `tests/cart-quantity-negative.spec.js` (data-driven) that reads the accepted
  quantity and asserts real outcomes plus arithmetic, instead of hard-coding behavior.
- Recorded the silent-clamping validation gap in `OBSERVATIONS.md`.

**Robustness fix:** While running against the live SPA, `page.goto('/')` intermittently
threw `net::ERR_ABORTED` when Angular performed a client-side route transition. Switched
the page-object navigations to `waitUntil: 'domcontentloaded'` and kept the existing
visible-element assertions, which removed the flake source.

**Environment note:** The Playwright browser CDN was blocked by a proxy in this
environment, so the suite was executed against an installed Google Chrome via
`PLAYWRIGHT_CHANNEL=chrome` (already supported by the config). Full run: 11/11 green
(one environmental timeout absorbed by the configured retry).

## 6. Strict POM Scaffold / data-test-first Locators

**Human direction:** Scaffold / harden POM with baseURL, parallel execution, HTML
reporting, and a strict locator policy prioritizing `data-test`, falling back to roles.

**Agent action:**

- Scraped live DOM hooks on home, login, product, cart, and payment steps.
- Set `testIdAttribute: 'data-test'` and `fullyParallel: true` in `playwright.config.js`.
- Added `pages/base.page.js` with `testId()` helper; rewrote Login/Products/Product/Cart/
  Checkout page objects onto verified `data-test` hooks; role/CSS only where hooks are
  absent (toast, login error, cart remove).
- Updated catalog/auth/checkout-negative specs to consume the new POM locators.

**Verification:** Full suite 11/11 green (shared-demo flakes absorbed by retries).

## 7. Featured Multi-Item Checkout Implementation

**Human direction:** Implement `tests/checkout.spec.js` with two distinct products,
quantity update/removal, regex-based dynamic arithmetic, payment-field toggling, and
order confirmation.

**Agent action:** Added raw cart-value accessors to `CartPage`; kept all price,
quantity, line-total, and grand-total calculations in the test; split payment selection,
card entry, and order placement into reusable `CheckoutPage` methods. Replaced the old
featured spec with `tests/checkout.spec.js` and updated `npm run test:featured`.

**Verification:** Focused test passed; full parallel Chromium suite passed 11/11.

## 8. Data-Driven Negative and Edge Cases

**Human direction:** Create `tests/negative-tests.spec.js` for an invalid-login matrix,
cart quantity boundaries, and blank checkout submission with clean failure reporting.

**Agent action:** Consolidated the previous negative specs into one data-driven file.
Added wrong-password, missing-email, and malformed-email cases; zero, negative, and
`9999` quantity cases; and empty Credit Card submission. Added named `test.step` blocks
and assertion messages so failures identify the input and expected outcome. Updated the
existing cart-clamping observation with the verified negative and `9999` behavior.

**Verification:** Negative suite passed 7/7 against the live application.
