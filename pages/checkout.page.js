const { BasePage, expect } = require('./base.page');

class CheckoutPage extends BasePage {
  constructor(page) {
    super(page);
    // data-test first across cart → sign-in → address → payment steps
    this.proceedCart = this.testId('proceed-1');
    this.proceedSignIn = this.testId('proceed-2');
    this.proceedAddress = this.testId('proceed-3');
    this.country = this.testId('country');
    this.postalCode = this.testId('postal_code');
    this.houseNumber = this.testId('house_number');
    this.street = this.testId('street');
    this.city = this.testId('city');
    this.state = this.testId('state');
    this.paymentMethod = this.testId('payment-method');
    this.finishButton = this.testId('finish');
    this.creditCardNumber = this.testId('credit_card_number');
    this.expirationDate = this.testId('expiration_date');
    this.cvv = this.testId('cvv');
    this.cardHolder = this.testId('card_holder_name');
    this.creditCardFields = [
      this.creditCardNumber,
      this.expirationDate,
      this.cvv,
      this.cardHolder,
    ];
    // Payment validation messages do not expose stable data-test hooks.
    this.validationErrors = page.locator('.alert-danger, .invalid-feedback, [role="alert"]');
    // Confirmation copy has no dedicated data-test → text fallback
    this.confirmation = page.getByText(/payment (was )?successful|thank you/i).first();
  }

  async proceedFromCart() {
    await this.proceedCart.click();
    await this.proceedSignIn.click();

    await expect(this.country).toBeVisible();
    await this.country.selectOption({ label: 'Canada' });
    await this.postalCode.fill('A1A 1A1');
    await this.houseNumber.fill('42');
    await this.street.fill('Test Street');
    await this.city.fill('Toronto');
    await this.state.fill('Ontario');
    await this.proceedAddress.click();
    await expect(this.paymentMethod).toBeVisible();
  }

  async selectPaymentMethod(label) {
    await this.paymentMethod.selectOption({ label });
  }

  async fillCreditCard({ number, expiration, cvv, holder }) {
    await this.creditCardNumber.fill(number);
    await this.expirationDate.fill(expiration);
    await this.cvv.fill(cvv);
    await this.cardHolder.fill(holder);
  }

  async placeOrder() {
    await this.finishButton.click();
  }

  async payByCreditCard() {
    await this.selectPaymentMethod('Credit Card');
    await Promise.all(this.creditCardFields.map((field) => expect(field).toBeVisible()));
    await this.fillCreditCard({
      number: '1111-2222-3333-4444',
      expiration: '12/2030',
      cvv: '123',
      holder: 'BusPlanner QA',
    });
    await this.placeOrder();
  }

  async expectConfirmation() {
    await expect(this.confirmation).toBeVisible();
  }
}

module.exports = { CheckoutPage };
