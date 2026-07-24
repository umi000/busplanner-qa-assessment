const { BasePage, expect } = require('./base.page');

class ProductsPage extends BasePage {
  constructor(page) {
    super(page);
    // data-test first (live: search-query, search-submit, sort, product-<id>)
    this.searchInput = this.testId('search-query');
    this.searchButton = this.testId('search-submit');
    this.sortSelect = this.testId('sort');
    // Cards are anchors with data-test="product-<ulid>"; filter out product-name/price nodes.
    this.productCards = page
      .locator('a[data-test^="product-"]')
      .filter({ has: page.getByTestId('product-name') });
  }

  async goto() {
    await this.gotoPath('/');
    await expect(this.searchInput).toBeVisible();
    await expect(this.productCards.first()).toBeVisible();
  }

  async search(term) {
    await this.searchInput.fill(term);
    await this.searchButton.click();
  }

  async sort(option) {
    await this.sortSelect.selectOption({ label: option });
  }

  productNameIn(card) {
    return card.getByTestId('product-name');
  }

  productPriceIn(card) {
    return card.getByTestId('product-price');
  }

  async openProductAt(index) {
    const card = this.productCards.nth(index);
    const name = (await this.productNameIn(card).textContent()).trim();
    await card.click();
    await expect(this.page.getByTestId('product-name')).toHaveText(name);
    return name;
  }
}

module.exports = { ProductsPage };
