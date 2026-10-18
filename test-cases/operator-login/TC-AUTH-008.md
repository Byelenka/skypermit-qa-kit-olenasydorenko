**ID:** TC-AUTH-008

**Title:** Logout button is shown after login through the Login page

**Doc ref:** 04-frontend-spec.md §Two contracts to hold exactly (Selector stability, operator-logout-button)

**Role:** Not logged in

**Priority:** Medium

**Preconditions:**

- An operator exists whose email and password you know

**Steps:**

1. Open `/login`
2. Enter the email and password of the existing operator
3. Submit the form once

**Expected result:**

- The element `operator-logout-button` is displayed
