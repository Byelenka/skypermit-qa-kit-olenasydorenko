**ID:** TC-REG-008

**Title:** Register link is hidden after registration through the Register page

**Doc ref:** 04-frontend-spec.md §Two contracts to hold exactly (operator-register-link shown when logged out)

**Role:** Not logged in

**Priority:** Low

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

- The element `operator-register-link` is not present in the header
