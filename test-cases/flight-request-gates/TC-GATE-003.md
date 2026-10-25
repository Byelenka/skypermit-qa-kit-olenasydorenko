**ID:** TC-GATE-003

**Title:** Submit with a window starting 59 days 23 hours 55 minutes from now passes the advance-booking check

**Doc ref:** 06-business-rules.md §6 (TIME_WINDOW — Booked too far in advance; rule_reference TSD-4 §2.2)

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
  - `window_start`: 59 days 23 hours 55 minutes after the moment of step 1 (UTC)
  - `window_end`: 60 minutes after `window_start`
  - `requested_altitude_metres`: 50
  - `flight_purpose`: any short text (e.g. `Test flight`)

**Steps:**

1. Send `POST /api/v1/flight-requests/{id}/submit` for the `DRAFT` request

**Expected result:**

- The request is not refused at the `TIME_WINDOW` gate: its state becomes `UNDER_REVIEW`

**Note:** The 5-minute margin below 60 days keeps the case repeatable, because the lead time only shrinks between creating the request and submitting it. The exact 60-day boundary cannot be hit repeatably, so it is not covered (see NOT-GENERATED items in the run reply).
