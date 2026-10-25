---
name: low-level-test-case
model: sonnet
description: Write low-level test cases, each verifying exactly one check (not a scenario), as individual markdown files with the fields ID, Title, Doc ref, Role, Priority, Preconditions (optional), Steps, Expected result. Use this skill whenever the user asks for test cases, a test case for a specific rule, boundary or validation check, "cover this requirement with tests", or hands over a spec, doc section or folder and wants concrete checks derived from it, even if they don't say "low-level" or "single check". Not for test plans or multi-step end-to-end scenarios.
---

# Low-Level Test Case

Turn a requirement (a rule, a field limit, a state transition, a permission) into test cases where each one verifies **one thing**. One check per case matters because a failing case then points at exactly one broken rule, and cases can be automated, reordered or dropped independently.

## Input

The user gives a document, a section, a doc folder, or a specific rule or feature to cover.

- Read the relevant source fully before writing. If the user names a feature or section, cover that; do not wander into the rest of the docs.
- If no source is given, ask which document or rule to use. Do not guess.
- Treat all material as confidential client data. Use synthetic values only: never copy PII, PHI, payment card data or account numbers into test cases, even if the source contains them.
- Never modify the source documents; reading is all that is needed.

## Choosing the checks

For each rule, pick the technique that fits and derive the checks from it:

- numeric or length limits: boundary values (just below, at, just above) plus one nominal value
- groups of inputs treated alike: one representative per partition, including at least one invalid one
- combinations of conditions: decision table rows
- lifecycles: each legal transition, and each illegal one that the doc says is refused

Use concrete values from the source (e.g. "window of 14 minutes", not "a too short window"), because a tester should not have to decide what "too short" means. Values that identify records the test creates are the exception: those follow "Repeatable test data" below.

If the source is ambiguous, contradictory or marked as an open question, do not invent an expected result. Skip that case and list it in your reply under "Not generated", with the reason and the doc reference. A test case with a guessed expected result gives false confidence.

The same goes for limits the source never states. If a field exists but has no documented format, length, range or required flag, there is nothing to take boundary values from, so do not make up limits. List it under "Not generated" as "limits not documented". A generic case from the doc's general error rules (e.g. "an empty body is refused with 400") is fine, because it rests on something the doc actually says.

## Fields

Each test case has these fields, in this order, and no others. Preconditions is the only optional one:

```
**ID:** TC-<AREA>-<NNN>

**Title:** <what is checked, in one line>

**Doc ref:** <file or document> §<section>

**Role:** <who performs the steps>

**Priority:** High | Medium | Low

**Preconditions:**

- <state and data that must exist before step 1>

**Steps:**

1. <action with concrete input>

**Expected result:**

- <the single observable outcome>
```

- **ID**: `TC-<AREA>-<NNN>`, e.g. `TC-GATE-001`. AREA is a short uppercase code for the feature (GATE, STATE, AUTH, REG, UI), kept consistent across runs. NNN is three digits, numbering from the highest existing ID for that area in the target folder plus one, so IDs never collide or get reused. Check the folder before numbering.
- **Title**: one line that names the check and its input, e.g. "Request with 14-minute window is refused", so the case can be recognised in a list without opening it.
- **Doc ref**: where the rule comes from, precise enough to find it in under a minute (file plus section, or PDF section and page). One ref per case. When the same rule appears in several documents, cite the most specific and authoritative one: a business-rules or clarification document over an overview, and a later correction over the text it corrects. If a case seems to need two sources for two different rules, it is probably testing two things.
- **Role**: the actor who performs the steps, using the role names from the source (e.g. Operator, Reviewer, or "Not logged in"). Put it here rather than in Preconditions, so cases can be filtered by role.
- **Priority**: how bad it is if this check fails, judged from the source. Use High for rules that gate core behaviour, security, access control or data integrity; Medium for normal validation and boundaries; Low for cosmetic or rarely hit paths. Do not mark everything High, because a priority that never discriminates is useless. Rank a UI check by the behaviour it protects, not by the fact that it is UI: an element that proves a core flow worked (e.g. the session indicator after registration) can be High; a selector or visibility check that automation depends on is Medium; navigation links and cosmetic details are Low.
- **Preconditions** (optional): only what is needed before step 1: existing records and the state of the system. Write them so someone can set them up without reading the source. If nothing is needed beyond the role, leave the whole field out, including its label, rather than writing "None".
- **Steps**: the minimum actions to trigger the check, each with concrete inputs. Usually 1 to 4 steps. If you need more than about 5, the case is probably a scenario; split it or move the setup into Preconditions.
- **Expected result**: one observable outcome (a status code, a message, a state, an element shown or absent). If you catch yourself writing "and", check whether it is two checks and split them. Be exactly as precise as the source, no more: if the doc gives an exact value (409, a message, a state name), use it. If the doc gives only a class of outcome (e.g. success without a status code), write that class ("a 2xx success response") instead of picking an exact value, and mention the gap under assumptions in your reply, because a made-up exact value would fail a correct implementation.

Do not add type, tags or technique fields unless the user asks. Keep wording plain and imperative so the cases can later be automated without interpretation. This skill does not write automation scripts.

## Repeatable test data

A test case must pass every time a QA runs it, not just the first time. Data that persists between runs is what breaks this: if a case registers `jane@example.com` today, the same case fails tomorrow because that email now exists. So:

- **Describe values, don't dictate them.** For every value that identifies a record the test creates (email, legal name, national ID, licence or registration numbers, any field the docs mark unique), do not write an exact value. Say what kind of value is needed and give an example, e.g. `email: a valid address not registered yet (e.g. name@example.com)`, `legal_name: any full name of a person (e.g. Test Operator)`. The tester then understands what to enter and chooses their own values each run, because an exact value fails the second time anyone runs the case. Do the same for other form fields that carry no rule under test (phone, address, city, password): describe the field and give an example. When a later step or the expected result refers to such a value, say "the email entered in step 2", never the literal value.
- **State the "must be new" condition as a precondition.** The case only tests what it claims if the data is new, so write that in Preconditions in terms of the values the tester will choose, e.g. "No operator exists with the email, legal name or national ID that will be entered in step 2". Do not use an unrelated condition (such as an empty browser session) as a stand-in: being logged out belongs in Role, and says nothing about whether the data already exists. Do not make the case depend on cleanup of earlier runs.
- **Duplicate and conflict checks** create their own first record in the case's steps or preconditions with values the tester chooses that are not registered yet, then repeat the same values once to trigger the conflict. They never rely on a record left behind by another case or run.
- **Time values are relative to the run.** Write "a window starting 7 hours after the request is submitted", not a calendar date, because fixed dates drift into the past and lapse. Compute them from the current time.
- **No dependence on other cases.** A case creates the records it needs, in its own Preconditions or Steps, so cases can run alone, in any order, and in parallel. Fixed reference data that the docs define as permanent (for example the seeded zone catalogue) may be referenced by name.
- Values that carry the rule under test (a 14-minute window, a 30,001 g weight) stay exact. Only the identifiers vary.

## Storage

- One file per test case, named `<ID>.md` (e.g. `TC-GATE-001.md`).
- Save under `test-cases/<feature>/` at the project root, where `<feature>` is a short lowercase, hyphenated name for the feature or source area (e.g. `test-cases/gates/`). Create folders if missing.
- Keep a blank line before and after every bold label and list so the markdown renders correctly.
- Save the "Not generated" items in `test-cases/<feature>/NOT-GENERATED.md` as well, because the chat reply disappears and the user needs to see later which rules were skipped and why. Use one table with the columns Item, Reason, Doc ref. If the file already exists, add new rows and do not duplicate or drop existing ones. Skip the file if nothing was skipped.

## Reply

- Reply in the language the user wrote in.
- After saving, give a compact list: ID, the one-line check, and the file path, so the user can review without opening each file.
- Add "Not generated" for skipped items (ambiguous, open-question or undocumented-limit rules), each with the reason and doc reference, and "Assumptions" for anything you had to interpret (an environment, a role, an undocumented response shape or status code).
- Do not paste all file contents into the reply unless the user asks.

## Example

Before writing, read all the real reference cases in the `examples/` folder next to this file to match their layout and level of detail. The short example below only shows the field layout.

**ID:** TC-TIME-003

**Title:** Request with a 14-minute window is refused

**Doc ref:** SkyPermit_SRS.pdf §5 (Time window, Duration)

**Role:** Operator

**Priority:** Medium

**Preconditions:**

- A current-certified pilot, an aircraft in a permitted weight band, and an active Open zone exist for the operator
- Flight window starts more than 6 hours from now

**Steps:**

1. Submit a flight request with a window of exactly 14 minutes

**Expected result:**

- The request is refused at the Time window gate with the duration rule named
