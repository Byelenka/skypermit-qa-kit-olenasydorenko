# Not generated: operator registration

Rules that were skipped because the source docs do not define an expected result. Generated cases are `TC-REG-001` to `TC-REG-010` in this folder.

| Item | Reason | Doc ref |
|---|---|---|
| Duplicate email, duplicate `national_id` | Both are marked unique, but no doc defines the status code or response body for a duplicate. The 409 in the API contract is described for state and scheduling conflicts only. | 01-data-model.md (Operator); 03-api-contract.md (Error semantics) |
| Required fields, field formats, length limits | Fields are listed, but no required flags, formats, minimum or maximum lengths or error messages are given, so no boundary values can be derived. `TC-REG-005` uses only the generic 400 rule. | 01-data-model.md (Operator); 03-api-contract.md (Error semantics) |
| Password rules (length, complexity) | None documented, and Supabase Auth defaults are not in the docs. | 03-api-contract.md (Authentication & authorisation) |
| Operator `id` equals the Supabase Auth user id | Stated in the data model, but the auth user id cannot be observed from the client. | 01-data-model.md (Operator) |
| Default `status` = ACTIVE and `registered_on` = today | The docs do not say what registration sets for either field. | 01-data-model.md (Operator) |
| Registration is atomic (auth user and profile created together) | Failure behaviour is not documented and the internals are not observable. | 04-frontend-spec.md (Operator portal) |
| Login with the new credentials after registering | A multi-step scenario that belongs to the login feature, not a single check. | 03-api-contract.md (Authentication & authorisation) |
| Suspended operator behaviour | Open question, and it is not tied to registration. | 05-open-questions.md §1 |
