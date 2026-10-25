**ID:** TC-GATE-005

**Title:** Submit with a 14-minute window is refused

**Doc ref:** 06-business-rules.md §6 (TIME_WINDOW — Duration out of range; rule_reference TSD-4 §3)

**Role:** Operator

**Priority:** High

**Preconditions:**

- The operator is logged in (operator level `L1`, as set at registration)
- The operator has a pilot with rating `R_BASIC` and `certified_on` set to today
- The operator has an aircraft with `mtom_grams` 500 (band `C0`)
- Zone `DNI-OPN-1` is used (class `OPEN`, ceiling 120 m, bands C0–C3, no curfew, level `L1`)
- No other request exists for this aircraft
- A `DRAFT` flight request exists with these values, created right before step 1:
  - `zone_code`: `DNI-OPN-1`
  - `window_start`: 7 hours after the moment of step 1 (UTC)
  - `window_end`: 14 minutes after `window_start`
  - `requested_altitude_metres`: 50
  - `flight_purpose`: any short text (e.g. `Test flight`)

**Steps:**

1. Send `POST /api/v1/flight-requests/{id}/submit` for the `DRAFT` request

**Expected result:**

- The response is 422 with `failing_gate` `TIME_WINDOW` and `rule_reference` `TSD-4 §3`
