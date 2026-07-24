const { test, expect } = require('../fixtures/test');

const email = process.env.CUSTOMER_EMAIL || 'customer@practicesoftwaretesting.com';
const password = process.env.CUSTOMER_PASSWORD || 'welcome01';

function numericValue(rawText) {
  const match = String(rawText).match(/-?\d[\d,]*(?:\.\d+)?/);
  if (!match) throw new Error(`No numeric value found in "${rawText}"`);
  return Number(match[0].replace(/,/g, ''));
}

test('featured multi-item checkout verifies dynamic totals and payment fields', async ({
  page,
  loginPage,
  productsPage,
  productPage,
  cartPage,
  checkoutPage,
}) => {
  await test.step('Sign in and add two distinct products from their product pages', async () => {
    await loginPage.goto();
    await loginPage.login(email, password);
    await expect(page).toHaveURL(/account/);

    await productsPage.goto();
    const firstProduct = await productsPage.openProductAt(0);
    await productPage.addToCart();

    await productsPage.goto();
    const secondProduct = await productsPage.openProductAt(1);
    expect(secondProduct).not.toBe(firstProduct);
    await productPage.addToCart();

    await cartPage.goto();
    await expect(cartPage.rowByName(firstProduct)).toBeVisible();
    await expect(cartPage.rowByName(secondProduct)).toBeVisible();

    await cartPage.setQuantity(firstProduct, 2);
    await cartPage.remove(secondProduct);
    await expect(cartPage.rowByName(secondProduct)).toHaveCount(0);
  });

  await test.step('Calculate line and grand totals from raw UI text', async () => {
    const lines = await cartPage.lineValues();
    expect(lines.length).toBeGreaterThan(0);

    let sumOfDisplayedLineTotals = 0;
    for (const line of lines) {
      const unitPrice = numericValue(line.unitPriceText);
      const quantity = numericValue(line.quantityText);
      const displayedLineTotal = numericValue(line.lineTotalText);

      expect(
        displayedLineTotal,
        `${line.product}: line total should equal unit price × quantity`,
      ).toBeCloseTo(unitPrice * quantity, 2);

      sumOfDisplayedLineTotals += displayedLineTotal;
    }

    const displayedGrandTotal = numericValue(await cartPage.grandTotalText());
    expect(
      displayedGrandTotal,
      'grand total should equal the sum of displayed line totals',
    ).toBeCloseTo(sumOfDisplayedLineTotals, 2);
  });

  await test.step('Verify Credit Card fields toggle, then place the order', async () => {
    await checkoutPage.proceedFromCart();

    for (const field of checkoutPage.creditCardFields) {
      await expect(field).toBeHidden();
    }

    await checkoutPage.selectPaymentMethod('Credit Card');

    for (const field of checkoutPage.creditCardFields) {
      await expect(field).toBeVisible();
    }

    await checkoutPage.fillCreditCard({
      number: '1111-2222-3333-4444',
      expiration: '12/2030',
      cvv: '123',
      holder: 'BusPlanner QA',
    });
    await checkoutPage.placeOrder();
    await checkoutPage.expectConfirmation();
  });
});
