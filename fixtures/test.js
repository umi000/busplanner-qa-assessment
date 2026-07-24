const base = require('@playwright/test');
const { LoginPage } = require('../pages/login.page');
const { ProductsPage } = require('../pages/products.page');
const { ProductPage } = require('../pages/product.page');
const { CartPage } = require('../pages/cart.page');
const { CheckoutPage } = require('../pages/checkout.page');

const test = base.test.extend({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  productsPage: async ({ page }, use) => use(new ProductsPage(page)),
  productPage: async ({ page }, use) => use(new ProductPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
});

module.exports = { test, expect: base.expect };
