const { test, expect } = require('../fixtures/test');

const validEmail = process.env.CUSTOMER_EMAIL || 'customer@practicesoftwaretesting.com';
const validPassword = process.env.CUSTOMER_PASSWORD || 'welcome01';

const invalidLoginCases = [
  {
    name: 'wrong password',
    email: validEmail,
    password: 'incorrect-password',
  },
  {
    name: 'missing email',
    email: '',
    password: validPassword,
  },
  {
    name: 'invalid email format',
    email: 'not-an-email',
    password: validPassword,
  },
];

test.describe('Invalid login matrix', () => {
  for (const loginCase of invalidLoginCases) {
    test(`rejects ${loginCase.name}`, async ({ loginPage, page }) => {
      await test.step(
        `Submit email="${loginCase.email || '<blank>'}" and the configured password`,
        async () => {
          await loginPage.goto();
          await loginPage.login(loginCase.email, loginCase.password);
        },
      );

      await test.step('Remain signed out and show actionable validation', async () => {
        await expect(
          page,
          `${loginCase.name}: invalid credentials must not leave the login page`,
        ).toHaveURL(/auth\/login/);
        await expect(
          loginPage.validationErrors.first(),
          `${loginCase.name}: expected a visible validation message`,
        ).toBeVisible();
      });
    });
  }
});

const quantityCases = [
  {
    name: 'zero',
    requested: 0,
    assertAccepted: (accepted) => {
      expect(accepted, 'zero must be clamped to a purchasable quantity').toBeGreaterThanOrEqual(1);
    },
  },
  {
    name: 'negative value',
    requested: -1,
    assertAccepted: (accepted) => {
      expect(accepted, 'negative quantity must not be retained').toBeGreaterThanOrEqual(1);
    },
  },
  {
    name: 'high boundary value',
    requested: 9999,
    assertAccepted: (accepted) => {
      expect(accepted, 'accepted quantity must remain positive').toBeGreaterThanOrEqual(1);
      expect(accepted, '9999 should be bounded by the cart input limit').toBeLessThan(9999);
    },
  },
];

test.describe('Cart quantity boundaries', () => {
  for (const quantityCase of quantityCases) {
    test(`handles ${quantityCase.name} (${quantityCase.requested})`, async ({
      page,
      loginPage,
      productsPage,
      productPage,
      cartPage,
    }) => {
      await test.step('Create a cart with one current catalog product', async () => {
        await loginPage.goto();
        await loginPage.login(validEmail, validPassword);
        await expect(page).toHaveURL(/account/);

        await productsPage.goto();
        const product = await productsPage.openProductAt(0);
        await productPage.addToCart();
        await cartPage.goto();

        await test.step(`Request quantity ${quantityCase.requested}`, async () => {
          await cartPage.setQuantityRaw(product, quantityCase.requested);
          const accepted = await cartPage.quantityOf(product);
          quantityCase.assertAccepted(accepted);
        });
      });

      await test.step('Keep line and grand totals mathematically consistent', async () => {
        await cartPage.assertArithmetic();
      });
    });
  }
});

test('blank credit-card fields cannot complete checkout', async ({
  page,
  loginPage,
  productsPage,
  productPage,
  cartPage,
  checkoutPage,
}) => {
  await test.step('Reach the Credit Card payment form', async () => {
    await loginPage.goto();
    await loginPage.login(validEmail, validPassword);
    await expect(page).toHaveURL(/account/);

    await productsPage.goto();
    await productsPage.openProductAt(0);
    await productPage.addToCart();
    await cartPage.goto();
    await checkoutPage.proceedFromCart();
    await checkoutPage.selectPaymentMethod('Credit Card');
  });

  await test.step('Submit all payment fields blank', async () => {
    for (const field of checkoutPage.creditCardFields) {
      await expect(field, 'payment field should start blank').toHaveValue('');
    }
    await checkoutPage.placeOrder();
  });

  await test.step('Reject the order and display validation feedback', async () => {
    await expect(
      checkoutPage.confirmation,
      'blank payment details must not produce order confirmation',
    ).toHaveCount(0);
    await expect(
      checkoutPage.validationErrors.first(),
      'blank payment submission should display validation feedback',
    ).toBeVisible();
  });
});
