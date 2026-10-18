**ID:** TC-REG-004

**Title:** Client-supplied authorisation_level L3 is not honoured at registration

**Doc ref:** 03-api-contract.md §Authentication & authorisation (Registration always creates an operator at L1)

**Role:** Not logged in

**Priority:** High

**Preconditions:**

- No operator exists with the email, legal name or national ID that will be entered in step 1
- The HTTP client keeps cookies between requests

**Steps:**

1. Send `POST /api/v1/operators` with a JSON body containing the fields below with valid values of your own choice, plus the exact extra field `"authorisation_level": "L3"`:
   - email: a valid address not registered yet (e.g. `name@example.com`)
   - password: a password the system accepts (e.g. `Test-Pass-1234`)
   - legal_name: a company name not registered yet (e.g. `Test Aero Ltd`)
   - national_id: an ID not registered yet (e.g. `TEST-NID-1234`)
   - phone, address_line, city, postal_code: any plausible values (e.g. `+000000000000`, `1 Test Street`, `Testville`, `00000`)
2. Send `GET /api/v1/auth/me` with the same cookie jar

**Expected result:**

- The returned profile has `authorisation_level` equal to `L1`
