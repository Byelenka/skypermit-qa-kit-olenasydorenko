# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This is a QA kit for the **skypermit** project (the application lives in `../skypermit`). Claude is used here for:

- **Test case generation** from the skypermit specification docs
- **Test plan generation** from the same docs

Claude does **not** write automation test scripts in this repo. Deliverables are documents (test cases, test plans), not executable tests.

Apply the QA methodology from `~/.claude/CLAUDE.md` (EP, BVA, decision table, state transition) when designing test cases.

## Source of truth

Requirements come from `../skypermit/docs/`:

- `01-data-model.md`, `02-state-machine.md`, `03-api-contract.md`, `04-frontend-spec.md`
- `05-open-questions.md`, `06-business-rules.md`, `07-clarifications.md`, `08-uml-diagrams.md`

Read the relevant docs before generating anything, and trace each test case back to a doc/section. If docs are ambiguous or listed in `05-open-questions.md`, flag it in the output rather than guessing.

## Planned folder structure

```
test-cases/        # generated test cases and test plans (markdown)
.claude/skills/    # project skills for test case / test plan generation
```

Folders are planned and may not exist yet; create them when first needed.

## Restrictions on `../skypermit`

`../skypermit` is **strictly read-only**. Claude must NOT:

- Create, edit, delete, move, or rename any file there (including its `docs/`, `tests/`, `CLAUDE.md`, `AGENTS.md`, `.claude/`)
- Run git write operations there (commit, checkout, reset, stash, branch, etc.)
- Run installs, builds, dev servers, migrations, or its test suite there (`npm install`, `npm run ...`, `supabase ...`), since these can modify files or state
- Write temp/output files into it; all output goes in this repo

Reading files there (docs, code, existing tests) is allowed for understanding behavior.
