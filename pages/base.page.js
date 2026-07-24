const { expect } = require('@playwright/test');

/**
 * Base page object. Locator policy (strict):
 * 1. data-test via testId() / getByTestId  →  [data-test="..."]
 * 2. User-visible role / accessible name   →  getByRole / getByLabel
 * 3. Scoped CSS only when neither exists
 *
 * Never use fixed sleeps; wait with Playwright assertions on visible outcomes.
 */
class BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  /**
   * Prefer this helper for every known data-test hook.
   * Equivalent to: page.locator('[data-test="nav-sign-in"]')
   * @param {string} id
   */
  testId(id) {
    return this.page.getByTestId(id);
  }

  async gotoPath(path) {
    // Angular SPA can abort a full "load" navigation; wait for DOM + caller assertions.
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }
}

module.exports = { BasePage, expect };
