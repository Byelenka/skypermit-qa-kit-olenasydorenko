**ID:** TC-AUTH-012

**Title:** Operator-scoped endpoint without a session is refused with 401

**Doc ref:** 03-api-contract.md §Authentication & authorisation (Enforcement: a caller with no session gets 401)

**Role:** Not logged in

**Priority:** Medium

**Steps:**

1. Send `GET /api/v1/pilots` with no session cookie and no `X-Reviewer-Id` header

**Expected result:**

- The response status is 401
