**ID:** TC-GATE-011

**Title:** Submit a window starting inside the curfew and ending after it (04:30–05:30) is refused

**Doc ref:** 06-business-rules.md §6 (TIME_WINDOW — Falls within curfew — KBP-CTR-3/ODS-CTR-5; rule_reference A-7 §1)

**Role:** Operator

**Priority:** High

**Preconditions:**

- The operator is logged in with operator level `L2`
- The operator has a pilot with rating `R_ADVANCED` and `certified_on` set to today
- The operator has an aircraft with `mtom_grams` 500 (band `C0`)
- Zone `KBP-CTR-3` is used (class `CONTROLLED`, bands C0–C2, curfew 23:00–05:00 zone-local time, level `L2`)
- No other request exists for this aircraft
- A `DRAFT` flight request exists with these values, created right before step 1:
  - `zone_code`: `KBP-CTR-3`
  - `window_start`: 04:30 zone-local time on a day between 2 and 30 days after today (the tester converts it to UTC; avoid a day when daylight saving time changes)
  - `window_end`: 05:30 zone-local time on the same day, or the next day where the window passes midnight
  - `requested_altitude_metres`: 50
  - `flight_purpose`: any short text (e.g. `Test flight`)

**Steps:**

1. Send `POST /api/v1/flight-requests/{id}/submit` for the `DRAFT` request

**Expected result:**

- The response is 422 with `failing_gate` `TIME_WINDOW` and `rule_reference` `A-7 §1`
