**ID:** TC-REG-005

**Title:** POST /operators with an empty JSON body is refused with 400

**Doc ref:** 03-api-contract.md §Error semantics (400 Malformed request body)

**Role:** Not logged in

**Priority:** Medium

**Steps:**

1. Send `POST /api/v1/operators` with body `{}`

**Expected result:**

- The response status is 400 with validation detail in the body
