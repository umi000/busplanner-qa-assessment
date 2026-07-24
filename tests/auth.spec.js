const { test, expect } = require('../fixtures/test');

const validEmail = process.env.CUSTOMER_EMAIL || 'customer@practicesoftwaretesting.com';
const validPassword = process.env.CUSTOMER_PASSWORD || 'welcome01';

test.describe('Authentication', () => {
  test('customer can sign in with valid credentials', async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(validEmail, validPassword);

    await expect(page).toHaveURL(/account/);
    await loginPage.expectSignedIn();
  });
});
