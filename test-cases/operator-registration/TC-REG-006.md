**ID:** TC-REG-006

**Title:** Register page submit with valid values shows the logged-in session info

**Doc ref:** 04-frontend-spec.md §Operator portal (Login and register pages)

**Role:** Not logged in

**Priority:** High

**Preconditions:**

- No operator exists with the email, legal name or national ID that will be entered in step 2

**Steps:**

1. Open `/register`
2. Fill every field of the form with valid values of your own choice:
   - email: a valid address not registered yet (e.g. `name@example.com`)
   - password: a password the system accepts (e.g. `Test-Pass-1234`)
   - legal_name: a company name not registered yet (e.g. `Test Aero Ltd`)
   - national_id: an ID not registered yet (e.g. `TEST-NID-1234`)
   - phone, address_line, city, postal_code: any plausible values (e.g. `+000000000000`, `1 Test Street`, `Testville`, `00000`)
3. Submit the form once

**Expected result:**

- After the redirect to the operator area, the element `operator-session-info` is displayed without a separate login step

**Note:** The docs do not say where the user lands after submit. The implementation redirects to `/operator/pilots`, and `operator-session-info` is shown only on `/operator*` paths, not on `/register` itself. The redirect is not documented.
