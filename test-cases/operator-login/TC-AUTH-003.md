**ID:** TC-AUTH-003

**Title:** Login with a wrong password does not create a session

**Doc ref:** 03-api-contract.md §Authentication & authorisation (POST /auth/login, GET /auth/me)

**Role:** Not logged in

**Priority:** High

**Preconditions:**

- An operator exists whose email and password you know
- The HTTP client keeps cookies between requests

**Steps:**

1. Send `POST /api/v1/auth/login` with a JSON body:
   - email: the email of the existing operator
   - password: any password that is not that operator's password (e.g. the real one with one character changed)
2. Send `GET /api/v1/auth/me` with the same cookie jar and no other credentials

**Expected result:**

- `GET /auth/me` returns 401
