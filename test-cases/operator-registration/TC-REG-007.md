**ID:** TC-REG-007

**Title:** Logout button is shown after registration through the Register page

**Doc ref:** 04-frontend-spec.md §Two contracts to hold exactly (Selector stability, operator-logout-button)

**Role:** Not logged in

**Priority:** Medium

**Preconditions:**

- No operator exists with the email or national ID that will be entered in step 2

**Steps:**

1. Open `/register`
2. Fill every field of the form with valid values of your own choice:
   - email: a valid address not registered yet (e.g. `name@example.com`)
   - password: a password the system accepts (e.g. `Test-Pass-1234`)
   - legal_name: any full name of a person (e.g. `Test Operator`)
   - national_id: an ID not registered yet (e.g. `TEST-NID-1234`)
   - phone, address_line, city, postal_code: any plausible values (e.g. `+000000000000`, `1 Test Street`, `Testville`, `00000`)
3. Submit the form once

**Expected result:**

- After the redirect to the operator area, the element `operator-logout-button` is displayed

**Note:** The docs do not say where the user lands after submit. The implementation redirects to `/operator/pilots`, and `operator-logout-button` is shown only on `/operator*` paths. The redirect is not documented.
