**ID:** TC-AUTH-011

**Title:** Login page with a wrong password does not show the session info

**Doc ref:** 04-frontend-spec.md §Operator portal (Login and register pages)

**Role:** Not logged in

**Priority:** Medium

**Preconditions:**

- An operator exists whose email and password you know

**Steps:**

1. Open `/login`
2. Enter the email of the existing operator and a password that is not that operator's password (e.g. the real one with one character changed)
3. Submit the form once

**Expected result:**

- The element `operator-session-info` is not displayed
