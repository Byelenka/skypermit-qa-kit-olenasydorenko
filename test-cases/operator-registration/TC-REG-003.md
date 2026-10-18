**ID:** TC-REG-003

**Title:** Newly registered operator has authorisation level L1

**Doc ref:** 03-api-contract.md §Authentication & authorisation (authorisation_level is no longer self-service); 04-frontend-spec.md §Operator portal (registration always starts an operator at L1)

**Role:** Not logged in

**Priority:** High

**Preconditions:**

- No operator exists with the email or national ID that will be entered in step 1
- The HTTP client keeps cookies between requests

**Steps:**

1. Send `POST /api/v1/operators` with a JSON body containing the fields below and no `authorisation_level`, valid values of your own choice (only email, password, legal_name and national_id are required per the implementation; this is not stated in the docs, so phone, address_line, city and postal_code are sent as well):
   - email: a valid address not registered yet (e.g. `name@example.com`)
   - password: a password the system accepts (e.g. `Test-Pass-1234`)
   - legal_name: any full name of a person (e.g. `Test Operator`)
   - national_id: an ID not registered yet (e.g. `TEST-NID-1234`)
   - phone, address_line, city, postal_code: any plausible values (e.g. `+000000000000`, `1 Test Street`, `Testville`, `00000`)
2. Send `GET /api/v1/auth/me` with the same cookie jar

**Expected result:**

- The returned profile has `authorisation_level` equal to `L1`
