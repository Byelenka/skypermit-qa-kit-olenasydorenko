**ID:** TC-AUTH-009

**Title:** Login link is hidden after login through the Login page

**Doc ref:** 04-frontend-spec.md §Two contracts to hold exactly (operator-login-link shown when logged out)

**Role:** Not logged in

**Priority:** Low

**Preconditions:**

- An operator exists whose email and password you know

**Steps:**

1. Open `/login`
2. Enter the email and password of the existing operator
3. Submit the form once

**Expected result:**

- The element `operator-login-link` is not present in the header
