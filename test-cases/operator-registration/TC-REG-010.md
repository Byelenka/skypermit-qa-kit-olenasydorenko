**ID:** TC-REG-010

**Title:** Register link in the header opens the /register page

**Doc ref:** 04-frontend-spec.md §Two contracts to hold exactly (operator-register-link shown when logged out); 04-frontend-spec.md §Operator portal (register page)

**Role:** Not logged in

**Priority:** Low

**Steps:**

1. Open the application home page
2. Click the element `operator-register-link`

**Expected result:**

- The browser location is `/register`

**Note:** The docs name the element and when it is shown, but do not say where it links. `/register` is the destination in the implementation; the page itself is in 04-frontend-spec.md §Operator portal.
