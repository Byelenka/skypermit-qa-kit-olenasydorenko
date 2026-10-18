**ID:** TC-REG-001

**Title:** POST /operators with a complete valid payload is accepted

**Doc ref:** 03-api-contract.md §Authentication & authorisation (POST /operators)

**Role:** Not logged in

**Priority:** High

**Preconditions:**

- No operator exists with the email, legal name or national ID that will be entered in step 1

**Steps:**

1. Send `POST /api/v1/operators` with a JSON body containing every field, valid values of your own choice:
   - email: a valid address not registered yet (e.g. `name@example.com`)
   - password: a password the system accepts (e.g. `Test-Pass-1234`)
   - legal_name: a company name not registered yet (e.g. `Test Aero Ltd`)
   - national_id: an ID not registered yet (e.g. `TEST-NID-1234`)
   - phone, address_line, city, postal_code: any plausible values (e.g. `+000000000000`, `1 Test Street`, `Testville`, `00000`)

**Expected result:**

- The response has a 2xx status code
