**ID:** TC-REG-002

**Title:** Caller is signed in right after a successful registration

**Doc ref:** 03-api-contract.md §Authentication & authorisation (POST /operators)

**Role:** Not logged in

**Priority:** High

**Preconditions:**

- No operator exists with the email or national ID that will be entered in step 1
- The HTTP client keeps cookies between requests

**Steps:**

1. Send `POST /api/v1/operators` with a JSON body containing every field, valid values of your own choice:
   - email: a valid address not registered yet (e.g. `name@example.com`)
   - password: a password the system accepts (e.g. `Test-Pass-1234`)
   - legal_name: any full name of a person (e.g. `Test Operator`)
   - national_id: an ID not registered yet (e.g. `TEST-NID-1234`)
   - phone, address_line, city, postal_code: any plausible values (e.g. `+000000000000`, `1 Test Street`, `Testville`, `00000`)
2. Send `GET /api/v1/auth/me` with the same cookie jar and no other credentials

**Expected result:**

- `GET /auth/me` returns 200 with an operator profile whose email is the email entered in step 1
