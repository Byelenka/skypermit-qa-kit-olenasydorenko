**ID:** TC-AUTH-001

**Title:** Login with valid credentials is accepted

**Doc ref:** 03-api-contract.md §Authentication & authorisation (POST /auth/login)

**Role:** Not logged in

**Priority:** High

**Preconditions:**

- An operator exists whose email and password you know

**Steps:**

1. Send `POST /api/v1/auth/login` with a JSON body:
   - email: the email of the existing operator
   - password: that operator's password

**Expected result:**

- The response has a 2xx status code
