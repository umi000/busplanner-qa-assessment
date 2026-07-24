const { BasePage, expect } = require('./base.page');

class ProductPage extends BasePage {
  constructor(page) {
    super(page);
    // data-test first (live: product-name, unit-price, quantity, add-to-cart)
    this.name = this.testId('product-name');
    this.unitPrice = this.testId('unit-price');
    this.quantity = this.testId('quantity');
    this.addToCartButton = this.testId('add-to-cart');
    // Toast has no reliable data-test → role/text fallback
    this.addedToast = page
      .locator('.toast, [role="alert"]')
      .filter({ hasText: /cart|added/i })
      .first();
  }

  async addToCart() {
    const productName = (await this.name.textContent()).trim();
    await this.addToCartButton.click();
    await expect(this.addedToast).toBeVisible();
    return productName;
  }
}

module.exports = { ProductPage };
