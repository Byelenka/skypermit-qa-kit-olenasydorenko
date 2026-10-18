---
name: one-page-test-plan
description: Generate a concise, one-page test plan (scope in/out, risks, test strategy split into manual vs automated, environments, entry and exit criteria) from a requirements document or a documentation folder. Output is markdown, with an optional .docx. Use this skill whenever the user asks for a test plan, test approach, QA plan, "what do we test and how", a one-pager for QA, or hands over a spec, PRD, user story, or docs folder and wants to know how to test it, even if they don't say "one-page" or "test plan" explicitly.
---

# One-Page Test Plan

Turn a requirements document (or a folder of docs) into a test plan that fits on a single page. A one-pager is useful because stakeholders actually read it: it forces prioritisation instead of listing everything that could be tested.

## Input

The user provides either a file (uploaded or by path) or a documentation folder.

- If a folder: list it, then read every doc that describes behaviour (requirements, data model, state machine, API contract, business rules, UI spec, clarifications). Skim diagrams and changelogs only for facts that affect risk.
- If no input is given, ask which document or folder to use. Do not guess.
- Treat all material as confidential client data. Never copy PII, PHI, payment card data or account numbers into the plan; use anonymised placeholders if an example is needed.

## Before writing

1. Find open questions, TBDs, contradictions and ambiguous rules (look for files named like `open-questions` or `clarifications`). These go into Risks, not into guesses. If the docs are unclear, say so rather than inventing behaviour.
2. Decide the 3-6 things that matter most. A page has room for judgment, not for completeness.

## Output structure

Use exactly these sections, in this order. Target about 450 words in total (hard cap 500), counting every word in tables and bullets, because that is what decides whether it fits one printed page. The row and bullet limits below exist to keep you under that cap: when in doubt, merge or drop the least severe item rather than shortening every item a little.

```
# Test Plan: <feature / product name>
<one line: source documents, date, author left blank for the user>

## 1. Scope
**In scope:**

- 3-5 bullets (features, flows, roles, integrations), one line each

**Out of scope:**

- 2-3 bullets, with the reason (e.g. "owned by another team")

## 2. Risks
Table: Risk | Likelihood (H/M/L) | Impact (H/M/L) | Mitigation / test focus
Max 5 rows, ordered by severity, one short line per cell. Include documentation gaps and open questions as risks.

## 3. Test Strategy
| Area | Manual | Automated |
Max 6 rows, grouped by area (e.g. core business flows, state transitions, API contract, validation/boundaries, UI, exploratory).
Give a short reason for each manual/automated split.
If the docs have unresolved open questions, make one of the rows "Open items": manual only,
deferred until the requirement is clarified. Tests written against an undefined rule would just encode a guess.
Add one line naming the test design techniques used (EP, BVA, decision table, state transition) and where.

## 4. Environments
2-3 bullets: which environments are used for what (dev, staging, ...), test data approach
(anonymised or synthetic only), and any roles, browsers or external systems that must be available or mocked.

## 5. Entry Criteria
3-4 checkable bullets (requirements reviewed, open questions resolved or accepted,
test data and environment available, build deployed and smoke-tested, ...)

## 6. Exit Criteria
3-4 checkable bullets (planned tests executed, no open Critical/High defects,
regression passed, automation stable in CI, ...)

**Needs your input:** (max 3 lines, see "Commitments and thresholds")
```

Keep entry and exit criteria checkable (someone can answer yes/no), because vague criteria cannot be used to decide whether to start or stop testing.

## Deciding manual vs automated

Explain the split, because that is the part readers question. A reasonable default:

- **Automate** what is stable, repetitive, high-volume or regression-critical: API contract checks, validation and boundary cases, state-machine transitions, smoke and regression suites.
- **Keep manual** what needs human judgment or changes often: new or unstable features, exploratory testing, usability and visual checks, one-off scenarios, anything whose requirements are still ambiguous.

Do not write automation scripts or detailed test cases here. This skill only plans; say which areas should be automated, not how.

## Commitments and thresholds

Numbers like "95% pass rate", "zero open High defects" or "regression within 2 days" become commitments once the plan is shared with a client, and exit criteria are where they usually appear. Mark any such figure as `(proposed)`. Do not write a separate commitments note: list the figures to confirm, together with any open questions that blocked a decision, in the single "Needs your input" block at the end of the plan (max 3 lines).

## Output

- Reply in the language the user wrote in.
- Save the plan as markdown in `test-plans/` at the project root (create the folder if missing) as `test-plan-<short-name>.md`, and show the content in the reply too.
- If the user asks for a Word document (.docx), or the plan is going to a client or stakeholder who will not open markdown, offer it; when they say yes, build it from the final markdown with the bundled compact template, because default Word/pandoc styling (1" margins, 12pt text, loose spacing) pushes a 450-word plan onto 1.5 pages:
  `pandoc <plan>.md -f gfm --reference-doc=<this skill's directory>/assets/compact-reference.docx -o <plan>.docx`
  The template is A4, 0.5" margins, 9.5pt body, bordered tables. Do not use the network (no `npm install`) for this.
- Keep a blank line before and after every bold label and list in the markdown (e.g. before `**Out of scope:**`), otherwise pandoc merges the label into the previous bullet.
- Trace risks and scope items to the source doc/section in parentheses, e.g. `(06-business-rules §2)`, so reviewers can verify them without re-reading everything.
- Never modify the source documents. Reading them is all that is needed.
