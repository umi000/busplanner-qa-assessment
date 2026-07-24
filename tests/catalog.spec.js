const { test, expect } = require('../fixtures/test');
const { money } = require('../pages/cart.page');

test.describe('Product discovery and cart', () => {
  test('finds products using search', async ({ productsPage }) => {
    await productsPage.goto();
    await productsPage.search('hammer');

    const names = productsPage.productCards.getByTestId('product-name');
    await expect(names.first()).toBeVisible();
    await expect.poll(async () => {
      const productNames = await names.allTextContents();
      return productNames.length > 0 && productNames.every((name) => /hammer/i.test(name));
    }).toBe(true);
  });

  test('sorts products by price from low to high', async ({ productsPage }) => {
    await productsPage.goto();
    await productsPage.sort('Price (Low - High)');

    await expect(productsPage.productCards.first()).toBeVisible();
    await expect.poll(async () => {
      const priceTexts = await productsPage.productCards.getByTestId('product-price').allTextContents();
      const prices = priceTexts.map((text) => money(text));
      return prices.length > 0
        && prices.join(',') === [...prices].sort((a, b) => a - b).join(',');
    }).toBe(true);
  });

  test('adds a product from its detail page and verifies the cart', async ({
    productsPage,
    productPage,
    cartPage,
  }) => {
    await productsPage.goto();
    const productName = await productsPage.openProductAt(0);
    await productPage.addToCart();
    await cartPage.goto();

    await expect(cartPage.rowByName(productName)).toBeVisible();
    await cartPage.assertArithmetic();
  });
});
