# Test Plan: SkyPermit Frontend (operator portal and reviewer queue)

Source: skypermit/docs/04-frontend-spec.md, 2026-10-18. Author: ______

## 1. Scope

**In scope:**

- Operator register and login, session-based identity, registration starts at L1 (04, Operator portal)
- Pilot and aircraft registry pages with create forms (04)
- Request creation, "Check before submitting" dry run, My requests list, detail view (04)
- Reviewer queue: sorted pending table, gate results, approve, reject with note (04)
- Stable `data-testid` on every interactive element (04, Two contracts)

**Out of scope:**

- Visual design and styling: intentionally minimal (04)
- Backend gate rules and API behaviour: covered by the API test plan (03, 06)

## 2. Risks

| Risk | L | I | Mitigation / test focus |
|---|---|---|---|
| Missing or renamed `data-testid` breaks automation; `operator-id-input` already removed (04) | M | H | Selector inventory check on every build |
| Pickers must not pre-filter; ineligible combinations must stay selectable (04) | M | H | Pick an ineligible combination; failure appears only at check/submit |
| Dry run must not change request state (04) | M | H | Compare state before and after the check |
| Identity from session, not typed input; logged-in and logged-out controls differ (04) | M | H | Login, logout, registration flows; pickers show only own pilots and aircraft |
| Field limits, role switcher selectors and browser support not specified (04) | H | M | Exploratory; raise as questions |

## 3. Test Strategy

| Area | Manual | Automated |
|---|---|---|
| Auth pages | Session expiry behaviour | Register with auto-login, login, logout, L1 start: stable flows |
| Registries | Input validation by exploration | Create pilot and aircraft, per-operator scoping |
| Requests | Wording of rejection reasons | Create, dry run, submit, state filter, rejection reason and rule reference |
| Reviewer queue | Header ID entry, role switcher | Queue order, approve, reject requires note |
| Selector contract | None | Every interactive element has its expected stable id |
| Unspecified behaviour | Field limits, layout, browsers | None until specified |

Techniques: state transition (request states in the list), decision table (role by page access), EP and BVA on form inputs once limits exist.

## 4. Environments

- Staging with Supabase Auth live; dev for smoke only (assumed)
- Synthetic operators, pilots, aircraft; no real national IDs or emails
- Both roles; Chrome plus one other browser (assumed)

## 5. Entry Criteria

- Frontend spec reviewed; `data-testid` list available to QA
- Build deployed and smoke-tested on staging
- API from doc 03 reachable, or mocked
- Synthetic data and both roles ready

## 6. Exit Criteria

- All planned tests executed; no open Critical/High defects (proposed)
- Every interactive element verified against its selector
- UI regression green in CI for 3 consecutive runs (proposed)
- Unspecified items answered or recorded as known risks

**Needs your input:** confirm thresholds marked (proposed); spec gives no field limits, role switcher selectors or supported browsers; environments and browsers are assumed.
