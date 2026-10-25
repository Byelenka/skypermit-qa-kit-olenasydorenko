---
name: cover-gaps
disable-model-invocation: true
allowed-tools: Read Grep Glob Write(test-cases/**)
argument-hint: "[max] [PILOT|AIRCRAFT|ZONE|TIME_WINDOW|REGISTRATION|all]"
description: Close the gaps in SkyPermit business-rule coverage. Finds the rules from 06-business-rules.md §6 (as corrected by 07-clarifications.md) that have no test case in test-cases/, writes a test case for each with the low-level-test-case skill, has every new case checked by the tc-verifier subagent, drops cases that contradict or are not backed by the docs, and returns a JSON summary. Use whenever the user asks to cover the uncovered rules, find or close coverage gaps, or says "what business rules have no tests". Takes optional arguments - a maximum number of rules and a gate.
---

# Cover Gaps

Generate and verify test cases for business rules that no test case covers yet. Everything this skill writes (test cases, NOT-GENERATED rows, the JSON summary, your replies) is in English, whatever language the user wrote in.

`../skypermit` is read-only. All output goes into this repo.

## Arguments

`/cover-gaps [max] [gate]`, in any order:

- `max`: a positive integer, the maximum number of rules to cover in this run. Default 5.
- `gate`: `PILOT`, `AIRCRAFT`, `ZONE`, `TIME_WINDOW`, `REGISTRATION` (the aircraft weight check at registration, which is not a gate) or `all`. Default `all`. Case-insensitive.

A token that is a number is `max`; any other token is `gate`. If a token is neither (a typo like `ZON`), stop and ask; do not guess.

## Step 1: List the gaps

Run the script. It reads `../skypermit/docs/06-business-rules.md` §6, applies the corrections from `07-clarifications.md`, compares with the `Doc ref` of every case in `test-cases/`, and prints JSON:

```bash
node scripts/uncovered-rules.mjs --max <max> --gate <gate>
```

Omit `--gate` for `all`. Read the output:

- `groups`: the uncovered rules selected for this run, grouped by gate in evaluation order (PILOT, AIRCRAFT, ZONE, TIME_WINDOW, REGISTRATION). Each rule has `id`, `condition`, `rule_reference` and `citation_unconfirmed`.
- `ambiguous`: rules whose `rule_reference` is shared with another rule, where an existing case matches the reference and gate but not the condition. Do not generate for these; copy them into the final JSON for a human to check.
- `totals`: use it for the summary.

If the script exits non-zero, show its message and stop. If `groups` is empty, skip steps 2 and 3, and return the JSON summary with zero counts.

## Step 2: Write the test cases

Process the rules one at a time, gate by gate (not in parallel, so case IDs are never numbered twice). For each rule, call the `low-level-test-case` skill (Skill tool) with the rule as the request. The skill runs on Sonnet because its own frontmatter sets `model: sonnet`. Give it:

- the source: `../skypermit/docs/06-business-rules.md`, the section behind the rule (§1.1 to §1.4 for the gate logic, §2 to §5 for the thresholds), and `07-clarifications.md`. Where 07 and 06 disagree, 07 governs. Also name `03-api-contract.md` for the `422` shape (`failing_gate`, `rule_reference`, `message`);
- the folder and area: gate rules go to `test-cases/flight-request-gates/` with area `GATE` (`TC-GATE-NNN`); the `REGISTRATION` rule goes to `test-cases/aircraft-registration/` with area `ACFT` (`TC-ACFT-NNN`). Number from the highest existing ID in that folder;
- the **Doc ref**, in exactly this form, because the script uses it to detect coverage:

  `**Doc ref:** 06-business-rules.md §6 (<GATE> — <condition>; rule_reference <rule_reference>)`

  with `<GATE>`, `<condition>` and `<rule_reference>` copied verbatim from the script output. The skill allows one ref per case; this one ref is the rule's row in §6;
- the checks to derive: boundary values where the rule has a threshold (§2 pilot currency 18 months against `window_start`, §3 weight bands, §4 zone catalogue, §5 cancellation deadline, TSD-4 lead time and duration limits), one representative per partition otherwise. Where the evaluation order matters (§ Evaluation order), set up each case so only the gate under test can fail; otherwise an earlier gate would mask the result.

Rules for the cases:

- One check per case. A rule with a threshold usually gives several cases (below, at, above).
- If `citation_unconfirmed` is true (zone inactive: the citation `ZC-2026.1 §4` is not confirmed, `05-open-questions.md` row 5), assert only `failing_gate` in the expected result, not the `rule_reference` value.
- If the docs do not define the expected result for a rule or a value (marked open in `05-open-questions.md`, or no limit given), do not generate a case for it. Collect it as an item (Item, Reason, Doc ref) for that folder's `NOT-GENERATED.md`, which step 4 generates, and count it as `docs_silent` in the summary. Tell the `low-level-test-case` skill not to write `NOT-GENERATED.md` itself and to return its "Not generated" items in the reply instead.
- The low-level-test-case skill asks for replies in the user's language; in this repo that is overridden: English only.

Keep a list of every file this step created: the new cases per rule.

## Step 3: Verify every new case

Launch the `tc-verifier` subagent (Agent tool, `subagent_type: "tc-verifier"`) for the new cases. The agent runs on Haiku because its own frontmatter sets `model: haiku`. Send all the launches for one batch in a single message so they run in parallel. One agent per case, with a prompt that names the case ID and its file path, for example: "Verify test-cases/flight-request-gates/TC-GATE-003.md." The verifier is read-only, so it never changes the case.

Read each verdict. The verifier gives one verdict for Steps and one for Expected result. Decide per case:

| Steps and Expected result | Action |
|---|---|
| both CORRESPONDS | Keep the file. Verdict `verified`. |
| either DOES NOT CORRESPOND | Delete the case file from `test-cases/`. Verdict `rejected`. Do not fix and retry; record the reason (what the docs say instead) in the summary. |
| none DOES NOT CORRESPOND, either NOT DOCUMENTED | Delete the case file. Verdict `docs_silent`. Collect an item for that folder's `NOT-GENERATED.md` (step 4): Item = the check, Reason = what the docs do not say (and the open-question row if there is one), Doc ref = the verifier's reference. |

DOES NOT CORRESPOND wins over NOT DOCUMENTED when a case has both. Delete only the case files this run created, only by exact path, and only under `test-cases/`. Never delete a pre-existing case, and never touch `../skypermit`.

If the verifier flags a conflict between docs and code, keep the docs verdict and put the conflict in the `notes` of the summary entry, because either side may be wrong and a person should look.

Rules whose cases were all deleted stay uncovered, so they show up again in the next run. That is intended: the docs must change first.

## Step 4: Return the JSON summary

First, for every folder that got a "not generated" item in this run (`test-cases/flight-request-gates/`, `test-cases/aircraft-registration/`), create or update `NOT-GENERATED.md` in it: one table with the columns Item, Reason, Doc ref, under a heading such as `# Not generated: <feature>`. If the file does not exist, create it with the items collected in this run. If it exists, Read it first and write it back with every existing row kept unchanged plus this run's new rows at the end, so no earlier information is lost. Skip an item whose Item and Doc ref already match an existing row, rather than adding a duplicate. Skip a folder with no items, and do not touch other folders.

Then write the summary to `test-cases/cover-gaps-<YYYY-MM-DD>.json` (if the file exists, add `-2`, `-3`, and so on) and print the same JSON as the end of your reply. Print it in a fenced `json` block, with one short English sentence before it. Use this shape:

```json
{
  "run": { "date": "YYYY-MM-DD", "max": 5, "gate": "all" },
  "totals": { "rules_in_docs": 0, "covered_before": 0, "uncovered_before": 0, "selected": 0 },
  "rules": [
    {
      "id": "PILOT-02",
      "gate": "PILOT",
      "condition": "Certification not current",
      "rule_reference": "OH-1 §2.3",
      "cases": [
        { "id": "TC-GATE-004", "file": "test-cases/flight-request-gates/TC-GATE-004.md", "verdict": "verified", "notes": "" }
      ]
    }
  ],
  "counts": { "generated": 0, "verified": 0, "rejected": 0, "docs_silent": 0 },
  "rejected": [ { "id": "TC-GATE-005", "reason": "docs state 422 with failing_gate ZONE, case expects AIRCRAFT" } ],
  "docs_silent": [ { "item": "…", "reason": "…", "recorded_in": "test-cases/flight-request-gates/NOT-GENERATED.md" } ],
  "ambiguous": [],
  "still_uncovered": [ "ids of selected rules that ended with no kept case" ]
}
```

`rejected` entries refer to deleted files, so keep their `id` and reason here: the file will not exist any more. `counts.generated` is the number of cases written in step 2, so `generated = verified + rejected + docs_silent`.

Do not paste test case contents into the reply. Do not commit; leave the changes in the working tree for the user to review.
