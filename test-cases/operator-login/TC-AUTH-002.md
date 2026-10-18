**ID:** TC-AUTH-002

**Title:** After a successful login the caller's profile is returned by /auth/me

**Doc ref:** 03-api-contract.md §Authentication & authorisation (POST /auth/login, GET /auth/me)

**Role:** Not logged in

**Priority:** High

**Preconditions:**

- An operator exists whose email and password you know
- The HTTP client keeps cookies between requests

**Steps:**

1. Send `POST /api/v1/auth/login` with a JSON body:
   - email: the email of the existing operator
   - password: that operator's password
2. Send `GET /api/v1/auth/me` with the same cookie jar and no other credentials

**Expected result:**

- `GET /auth/me` returns 200 with an operator profile whose email is the email used in step 1
