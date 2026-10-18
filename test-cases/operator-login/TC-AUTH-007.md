**ID:** TC-AUTH-007

**Title:** Login page with valid credentials shows the logged-in session info

**Doc ref:** 04-frontend-spec.md §Operator portal (Login and register pages)

**Role:** Not logged in

**Priority:** High

**Preconditions:**

- An operator exists whose email and password you know

**Steps:**

1. Open `/login`
2. Enter the email and password of the existing operator
3. Submit the form once

**Expected result:**

- The element `operator-session-info` is displayed
