# Observations

Findings are separated into verified behavior and environment/testability risks. This
avoids reporting a potential concern as a product defect without reproduction evidence.

## Environment and Testability Risks

### Shared customer account can create cross-user interference

**Context:** The supplied customer credentials are public and may be used concurrently.

**Risk:** Account-backed cart/order state could be changed by another user during a run,
causing non-deterministic assertions or accidental checkout of unexpected items.

**Mitigation:** Each test uses a fresh browser context, reads catalog values at runtime,
and avoids relying on previous orders. A dedicated per-run user would provide stronger
isolation if the environment supported reliable registration and cleanup.

### Periodic resets make persistent identifiers unsafe

**Context:** The assessment states that application data resets periodically.

**Risk:** Tests tied to fixed product IDs, order numbers, or previously created records
can fail despite unchanged behavior.

**Mitigation:** Product selection starts from current visible search results, and prices
and totals are read from the page.

### Public live dependency limits failure ownership

**Context:** The suite has no control over application deployment, network availability,
or test data reset timing.

**Risk:** A failure may be caused by the environment rather than a product regression.

**Mitigation:** Failure-only trace, screenshot, and video capture are enabled. CI retries
are limited to two and should not replace root-cause review.

## Verified Product Findings

### Cart remove control has no accessible name or button semantics

- **Severity:** Medium (accessibility and testability)
- **Steps to reproduce:** Add a product, open the cart, and inspect the remove `X`
  control using the browser accessibility tree or keyboard navigation.
- **Expected:** The control is exposed as a button with a name such as
  `Remove <product name>` and can be reached/activated from the keyboard.
- **Actual:** The accessibility tree exposes only an unnamed clickable image inside an
  empty table cell. No button or accessible name is available.
- **Why it matters:** Screen-reader and keyboard users cannot identify the action.
  Automation must fall back to a structural image selector instead of a resilient
  user-facing locator.
- **Evidence/date:** Reproduced in Toolshop v2.3 on 2026-07-24.

### Cart quantity field silently clamps out-of-range values with no feedback

- **Severity:** Low (validation UX and testability)
- **Steps to reproduce:** Add a product, open the cart, and set the quantity field to
  `0`, `-1`, or a high value such as `9999`, then press Enter.
- **Expected:** The user is told the entry was adjusted, or the field visibly enforces a
  documented range.
- **Actual:** `0` and `-1` are silently changed to `1`; `9999` is silently truncated to
  `99` (the field caps at two digits via `maxlength`). No message explains the change.
  Line and cart totals do recompute correctly for the accepted quantity.
- **Why it matters:** Users can believe they ordered a quantity the system quietly
  altered. The hidden `99` upper bound is not discoverable, which also complicates
  boundary testing. The negative test asserts the accepted quantity stays valid and the
  totals remain arithmetically consistent.
- **Evidence/date:** Reproduced in Toolshop v2.3 on 2026-07-24.

### Empty credit-card form can be submitted before validation

- **Severity:** Low (validation UX)
- **Steps to reproduce:** Reach checkout payment, choose `Credit Card`, leave all four
  card fields empty, and observe/click `Confirm`.
- **Expected:** Required fields are marked before submission or `Confirm` remains
  disabled until the form is minimally valid.
- **Actual:** `Confirm` is enabled with every card field empty. Validation errors appear
  only after it is clicked; the order is correctly not completed.
- **Why it matters:** Users receive delayed feedback and can attempt a predictably
  invalid submission. The negative test verifies that checkout still rejects it.
- **Evidence/date:** Reproduced in Toolshop v2.3 on 2026-07-24.
