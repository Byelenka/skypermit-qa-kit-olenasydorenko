**ID:** TC-AUTH-004

**Title:** Login with an unregistered email does not create a session

**Doc ref:** 03-api-contract.md §Authentication & authorisation (POST /auth/login, GET /auth/me)

**Role:** Not logged in

**Priority:** High

**Preconditions:**

- No operator exists with the email that will be entered in step 1
- The HTTP client keeps cookies between requests

**Steps:**

1. Send `POST /api/v1/auth/login` with a JSON body:
   - email: a valid address not registered yet (e.g. `name@example.com`)
   - password: any password (e.g. `Test-Pass-1234`)
2. Send `GET /api/v1/auth/me` with the same cookie jar and no other credentials

**Expected result:**

- `GET /auth/me` returns 401
