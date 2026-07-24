# Toolshop Playwright Automation

JavaScript/Playwright UI automation for the BusPlanner QA technical assessment. The
suite targets the public Practice Software Testing (Toolshop) application and covers
authentication, catalog discovery, cart behavior, checkout, and negative validation.

## Prerequisites

- Node.js 18 or newer
- npm

## Setup

```bash
npm install
npx playwright install chromium
```

If a proxy or offline environment blocks the Playwright browser download, you can drive
an already-installed Google Chrome instead:

```powershell
$env:PLAYWRIGHT_CHANNEL="chrome"; npm test
```

Configuration defaults to the public demo credentials supplied in the assessment.
For local overrides, copy `.env.example` to `.env` and change the values:

```dotenv
BASE_URL=https://practicesoftwaretesting.com
CUSTOMER_EMAIL=customer@practicesoftwaretesting.com
CUSTOMER_PASSWORD=welcome01
```

## Run

```bash
npm test                 # all tests, Chromium
npm run test:featured    # required multi-item checkout only
npm run test:negative    # invalid login, cart boundaries, blank payment
npm run test:headed      # visible browser
npm run test:debug       # Playwright inspector
npm run report           # last HTML report
```

## Structure

```text
playwright.config.js      baseURL, parallel runs, HTML reporter, data-test id attr
fixtures/
  test.js                 POM fixtures (loginPage, productsPage, …)
pages/
  base.page.js            Shared BasePage + testId() helper
  login.page.js           LoginPage
  products.page.js        ProductsPage (catalog search/sort)
  product.page.js         ProductPage (detail + add to cart)
  cart.page.js            CartPage (qty, remove, arithmetic)
  checkout.page.js        CheckoutPage (address + payment)
  index.js                Barrel exports
tests/                    User-journey and negative specs
CLAUDE.md                 Reusable AI working agreement
PROMPTS.md                Session / prompt log
OBSERVATIONS.md           Product and testability findings
HANDOFF.md                Maintenance and extension guide
```

## Test Design

- Strict locator policy: `data-test` first (`getByTestId` / `[data-test="…"]`), then
  accessible role/name, then scoped CSS only when neither exists.
- Currency is parsed from the UI. The featured test calculates each line total and
  the overall cart total rather than hard-coding prices.
- Negative coverage is data-driven: invalid logins, an empty credit-card payment, and
  cart quantity edge cases (zero and a very large number) that assert the app's real,
  clamped outcome rather than a hard-coded expectation.
- Every test gets an isolated browser context. Tests do not depend on execution order.
- Traces and screenshots are retained on failure for diagnosis.
- CI runs serially and retries twice because the target is a shared public demo.

## Important Environment Note

The application is shared and periodically reset. Catalog and account state can change
outside this suite. A failed test should be diagnosed from its trace before being
classified as a test defect.

## Submission Packaging

Create the zip with the supplied script, which excludes dependencies, generated reports,
local secrets, and previous zip files:

```powershell
.\scripts\package-submission.ps1
```

The archive is written beside the project as `busplanner-qa-assessment.zip`.
