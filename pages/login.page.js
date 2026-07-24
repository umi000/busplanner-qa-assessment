const { BasePage, expect } = require('./base.page');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    // data-test first (live: email, password, login-submit, nav-sign-in)
    this.signInLink = this.testId('nav-sign-in');
    this.email = this.testId('email');
    this.password = this.testId('password');
    this.submit = this.testId('login-submit');
    // No stable data-test on validation messages → role/CSS fallback
    this.validationErrors = page.locator(
      '.alert-danger, .invalid-feedback, [role="alert"], [data-test="login-error"]',
    );
    this.error = this.validationErrors.first();
    this.accountHeading = page.getByRole('heading', { name: /my account/i });
  }

  async goto() {
    await this.gotoPath('/auth/login');
    await expect(this.email).toBeVisible();
  }

  async openFromNav() {
    await this.gotoPath('/');
    await this.signInLink.click();
    await expect(this.email).toBeVisible();
  }

  async login(email, password) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }

  async expectSignedIn() {
    await expect(this.accountHeading).toBeVisible();
  }

  async expectStillOnLogin() {
    await expect(this.page).toHaveURL(/auth\/login/);
    await expect(this.error).toBeVisible();
  }
}

module.exports = { LoginPage };
