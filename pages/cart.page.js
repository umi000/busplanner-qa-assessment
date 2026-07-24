const { BasePage, expect } = require('./base.page');

function money(text) {
  const value = Number(String(text).replace(/[^0-9.-]/g, ''));
  if (!Number.isFinite(value)) throw new Error(`Unable to parse currency value: "${text}"`);
  return value;
}

class CartPage extends BasePage {
  constructor(page) {
    super(page);
    // data-test first (live: product-title, product-quantity, product-price, line-price, cart-total)
    this.rows = page.locator('tr').filter({ has: page.getByTestId('product-quantity') });
    this.cartTotal = this.testId('cart-total');
    this.proceedButton = this.testId('proceed-1');
    this.navCart = this.testId('nav-cart');
  }

  async goto() {
    await this.gotoPath('/checkout');
    await expect(this.rows.first()).toBeVisible();
  }

  rowByName(name) {
    return this.rows.filter({
      has: this.page.getByTestId('product-title').getByText(name, { exact: true }),
    });
  }

  quantityInput(name) {
    return this.rowByName(name).getByTestId('product-quantity');
  }

  async quantityOf(name) {
    return Number(await this.quantityInput(name).inputValue());
  }

  async setQuantity(name, quantity) {
    const input = this.quantityInput(name);
    await input.fill(String(quantity));
    await input.press('Enter');
    await expect(input).toHaveValue(String(quantity));
  }

  /**
   * Set a quantity without asserting the value stuck. Edge-case inputs (0, huge numbers)
   * are clamped/bounded by the app; wait until line total matches accepted qty × unit price.
   */
  async setQuantityRaw(name, quantity) {
    const row = this.rowByName(name);
    const input = row.getByTestId('product-quantity');
    await input.fill(String(quantity));
    await input.press('Enter');
    await expect.poll(async () => {
      const accepted = Number(await input.inputValue());
      const unitPrice = money(await row.getByTestId('product-price').textContent());
      const lineTotal = money(await row.getByTestId('line-price').textContent());
      return Math.abs(lineTotal - Number((unitPrice * accepted).toFixed(2))) < 0.01;
    }, { message: `line total did not settle for "${name}"` }).toBe(true);
  }

  async remove(name) {
    const row = this.rowByName(name);
    // Remove control has no accessible name or data-test (see OBSERVATIONS.md)
    await row.getByRole('cell').last().locator('svg, img, a, button').first().click();
    await expect(row).toHaveCount(0);
  }

  async lineValues() {
    const values = [];
    const rowCount = await this.rows.count();

    for (let index = 0; index < rowCount; index += 1) {
      const row = this.rows.nth(index);
      values.push({
        product: (await row.getByTestId('product-title').textContent()).trim(),
        unitPriceText: (await row.getByTestId('product-price').textContent()).trim(),
        quantityText: await row.getByTestId('product-quantity').inputValue(),
        lineTotalText: (await row.getByTestId('line-price').textContent()).trim(),
      });
    }

    return values;
  }

  async grandTotalText() {
    return (await this.cartTotal.textContent()).trim();
  }

  async assertArithmetic() {
    const lines = await this.lineValues();
    expect(lines.length).toBeGreaterThan(0);
    let expectedCartTotal = 0;

    for (let index = 0; index < lines.length; index += 1) {
      const unitPrice = money(lines[index].unitPriceText);
      const quantity = money(lines[index].quantityText);
      const displayedLineTotal = money(lines[index].lineTotalText);
      const expectedLineTotal = Number((unitPrice * quantity).toFixed(2));

      expect(displayedLineTotal, `line ${index + 1} total`).toBeCloseTo(expectedLineTotal, 2);
      expectedCartTotal += displayedLineTotal;
    }

    const displayedCartTotal = money(await this.grandTotalText());
    expect(displayedCartTotal, 'cart total').toBeCloseTo(expectedCartTotal, 2);
  }
}

module.exports = { CartPage, money };
