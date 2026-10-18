# Not generated: operator login

Rules that were skipped because the source docs do not define an expected result. Generated cases are `TC-AUTH-001` to `TC-AUTH-012` in this folder.

| Item | Reason | Doc ref |
|---|---|---|
| Status code and body for failed credentials (wrong password, unknown email) | 401 is defined as "no operator session and no reviewer header"; no doc says what POST /auth/login returns for bad credentials. `TC-AUTH-003` and `-004` check only that no session is created. | 03-api-contract.md (Error semantics) |
| Success status code and body of POST /auth/login | Only "sets the session cookie" is stated. `TC-AUTH-001` expects a 2xx class only. | 03-api-contract.md (Authentication & authorisation) |
| Suspended operator logging in | The suspended-operator response is an open question and is described as a precondition on write operations, so login behaviour is undefined. | 05-open-questions.md §1; 07-clarifications.md item 3 |
| Password rules, lockout after failed attempts, rate limiting | None documented. | 03-api-contract.md (Authentication & authorisation) |
| Session cookie name, lifetime, expiry and flags | Docs say only "session cookie"; no properties are given. | 03-api-contract.md; 04-frontend-spec.md |
| Email matching rules (letter case, surrounding spaces) | Not documented. | 01-data-model.md (Operator) |
| Redirect after login, and what a logged-out visitor sees on a portal page | The portal "requires login", but where the user is sent is not defined. | 04-frontend-spec.md §Operator portal |
| Error message shown on the Login page for bad credentials | Not documented; `TC-AUTH-011` checks only that the session info is absent. | 04-frontend-spec.md §Operator portal |
