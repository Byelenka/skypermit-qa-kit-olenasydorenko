**ID:** TC-AUTH-005

**Title:** GET /auth/me without a session is refused with 401

**Doc ref:** 03-api-contract.md §Authentication & authorisation (GET /auth/me)

**Role:** Not logged in

**Priority:** High

**Steps:**

1. Send `GET /api/v1/auth/me` with no session cookie and no `X-Reviewer-Id` header

**Expected result:**

- The response status is 401
