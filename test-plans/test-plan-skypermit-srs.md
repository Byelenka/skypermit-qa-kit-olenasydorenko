# Test Plan: SkyPermit (drone flight authorisation)

Source: SkyPermit_SRS.pdf v1.0 (7 pp), 2026-10-18. Author: ______

## 1. Scope

**In scope:**

- Four-gate check, fixed order Pilot, Aircraft, Zone, Time window; first failure only (SRS §5)
- Flight request lifecycle: seven states, illegal moves refused, cancel up to 2 h before start (§4)
- Operator portal: registration, pilot/aircraft registries, requests, dry-run check (§7)
- Reviewer queue: ID-based access, approve, reject with mandatory note (§2, §7)
- Access control and failure responses (§2, §8)

**Out of scope:**

- Zone administration and raising authorisation tiers: done outside the app (§2, §6)
- Performance, load and penetration testing: no requirements in the SRS

## 2. Risks

| Risk | L | I | Mitigation / test focus |
|---|---|---|---|
| Suspended-operator block response undefined (§9) | H | H | Test only that creating and submitting are blocked |
| Time rules: 6 h lead, 60 days, 15-240 min, continuous curfew, touching windows allowed (§5) | M | H | BVA on each limit; curfew edges |
| Only the first failing gate is reported; zone-inactive citation is a placeholder (§5, §9) | M | H | Multi-failure requests; do not assert that citation |
| Currency (18 months, no grace) checked at flight time; weight band and currency derived, not stored (§3, §5) | M | H | Boundary dates; edit data and recheck |
| Operators must see only their own data; reviewer sees all (§2, §8) | M | H | Cross-operator access matrix |

## 3. Test Strategy

| Area | Manual | Automated |
|---|---|---|
| Gate logic | Exploratory on cross-gate combinations | Per-gate pass/fail, order, limits: stable, high-volume |
| State transitions | Races such as cancel versus approve | Every legal and illegal move, 2 h cancel cutoff: deterministic |
| Access control | Reviewer ID entry | Operator isolation, not-logged-in versus not-permitted |
| Registries, derived values | None | Weight bands (900 g, 3.5, 12, 30 kg), 30 kg refusal, recalculation |
| UI | Dry-run usability, reviewer queue, pickers deliberately unfiltered | Smoke of core flows once stable |
| Open items | Suspended-operator response, zone-inactive citation | None until clarified |

Techniques: EP (ratings by zone class), BVA (limits above), decision table (gates by zone), state transition (§4).

## 4. Environments

- Staging with the six seeded zones (§6); dev for smoke only (assumed, not in SRS)
- Synthetic operators, pilots, aircraft; no real national IDs or contact details
- Operator and reviewer roles; controllable clock for lead time, currency, curfew

## 5. Entry Criteria

- SRS reviewed with QA; open items (§9) accepted as known gaps
- Build deployed and smoke-tested on staging
- Synthetic data and both roles available

## 6. Exit Criteria

- All planned tests executed; no open Critical/High defects (proposed)
- Every state transition and gate rule covered at least once
- Regression suite green in CI for 3 consecutive runs (proposed)
- Open items resolved or recorded as known risks

**Needs your input:** confirm thresholds marked (proposed); SRS gives no environments, status codes or non-functional targets, so those are assumed; suspended-operator response (§9).
