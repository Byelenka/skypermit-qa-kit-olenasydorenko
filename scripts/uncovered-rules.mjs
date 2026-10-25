#!/usr/bin/env node
// Lists SkyPermit business rules (06-business-rules.md §6) that no test case in test-cases/ covers yet.
// Read-only: reads ../skypermit/docs and test-cases/, writes only to stdout.
//
// Usage: node scripts/uncovered-rules.mjs [--gate PILOT|AIRCRAFT|ZONE|TIME_WINDOW|REGISTRATION|all] [--max N]
//
// A rule is identified by gate + condition + rule_reference (a row of §6). A test case covers a rule when its
// "Doc ref" line contains the rule_reference and the gate name. When a rule_reference is shared by several
// rules (e.g. "ZC-2026.1 §2"), the condition text must appear in the Doc ref as well; if only the reference
// and gate match, the rule is reported as ambiguous instead of covered.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = resolve(ROOT, '../skypermit/docs');
const CASES = join(ROOT, 'test-cases');
const GATE_ORDER = ['PILOT', 'AIRCRAFT', 'ZONE', 'TIME_WINDOW', 'REGISTRATION'];

// Corrections from 07-clarifications.md that must win over the literal text of 06 (07 governs on conflict).
// Weight band belongs to AIRCRAFT, not ZONE (07 §1). Zone `active` citation is not confirmed (07 §4, 05 row 5).
const GATE_OVERRIDES = [{ match: /weight band/i, gate: 'AIRCRAFT' }];
const UNCONFIRMED_CITATION = [/zone inactive/i];

function fail(message) {
  console.error(`uncovered-rules: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const opts = { gate: 'all', max: Infinity };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--gate') opts.gate = (argv[++i] ?? '').toUpperCase();
    else if (argv[i] === '--max') opts.max = Number(argv[++i]);
    else fail(`unknown argument ${argv[i]}`);
  }
  if (opts.gate !== 'ALL' && opts.gate !== 'all' && !GATE_ORDER.includes(opts.gate)) fail(`unknown gate "${opts.gate}"`);
  if (!(opts.max > 0)) fail('--max must be a positive number');
  return opts;
}

const clean = (s) => s.replace(/`/g, '').replace(/\s+/g, ' ').trim();

function parseRules() {
  const file = join(DOCS, '06-business-rules.md');
  if (!existsSync(file)) fail(`${file} not found`);
  const lines = readFileSync(file, 'utf8').split('\n');
  const start = lines.findIndex((l) => /^## 6\./.test(l));
  if (start < 0) fail('section "## 6." not found in 06-business-rules.md');
  const rules = [];
  const perGate = {};
  for (const line of lines.slice(start + 1)) {
    if (/^---\s*$/.test(line)) break;
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length < 3 || cells[0] === 'Gate' || /^-+$/.test(cells[0].replace(/[\s:|]/g, ''))) continue;
    let gate = /n\/a/i.test(cells[0]) ? 'REGISTRATION' : clean(cells[0]);
    const condition = clean(cells[1]);
    const refMatch = cells[2].match(/`([^`]+)`/);
    if (!refMatch) continue;
    for (const o of GATE_OVERRIDES) if (o.match.test(condition)) gate = o.gate;
    perGate[gate] = (perGate[gate] ?? 0) + 1;
    rules.push({
      id: `${gate}-${String(perGate[gate]).padStart(2, '0')}`,
      gate,
      condition,
      rule_reference: refMatch[1].trim(),
      citation_unconfirmed: UNCONFIRMED_CITATION.some((re) => re.test(condition)),
    });
  }
  if (rules.length === 0) fail('no rules parsed from §6 — has the table format changed?');
  return rules;
}

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : /^TC-.*\.md$/.test(name) ? [p] : [];
  });
}

function docRefs() {
  return walk(CASES).map((p) => {
    const m = readFileSync(p, 'utf8').match(/^\*\*Doc ref:\*\*(.*)$/m);
    return { file: p.slice(ROOT.length + 1), text: m ? clean(m[1]).toLowerCase() : '' };
  });
}

const opts = parseArgs(process.argv.slice(2));
const rules = parseRules();
const refs = docRefs();
const refCount = {};
for (const r of rules) refCount[r.rule_reference] = (refCount[r.rule_reference] ?? 0) + 1;

const covered = [];
const ambiguous = [];
const uncovered = [];
for (const r of rules) {
  const ref = r.rule_reference.toLowerCase();
  const withRefAndGate = refs.filter((c) => c.text.includes(ref) && c.text.includes(r.gate.toLowerCase()));
  if (refCount[r.rule_reference] === 1) {
    (withRefAndGate.length ? covered : uncovered).push({ ...r, cases: withRefAndGate.map((c) => c.file) });
    continue;
  }
  const exact = withRefAndGate.filter((c) => c.text.includes(r.condition.toLowerCase()));
  if (exact.length) covered.push({ ...r, cases: exact.map((c) => c.file) });
  else if (withRefAndGate.length) ambiguous.push({ ...r, cases: withRefAndGate.map((c) => c.file) });
  else uncovered.push({ ...r, cases: [] });
}

const inScope = (r) => opts.gate.toUpperCase() === 'ALL' || r.gate === opts.gate;
const selected = uncovered
  .filter(inScope)
  .sort((a, b) => GATE_ORDER.indexOf(a.gate) - GATE_ORDER.indexOf(b.gate))
  .slice(0, opts.max);

const groups = {};
for (const r of selected) (groups[r.gate] ??= []).push({ id: r.id, condition: r.condition, rule_reference: r.rule_reference, citation_unconfirmed: r.citation_unconfirmed });

console.log(
  JSON.stringify(
    {
      source: '../skypermit/docs/06-business-rules.md §6, corrected by 07-clarifications.md',
      filter: { gate: opts.gate.toUpperCase(), max: Number.isFinite(opts.max) ? opts.max : null },
      totals: {
        rules: rules.length,
        covered: covered.length,
        ambiguous: ambiguous.length,
        uncovered: uncovered.length,
        selected: selected.length,
      },
      groups,
      ambiguous: ambiguous.filter(inScope).map(({ id, gate, condition, rule_reference, cases }) => ({ id, gate, condition, rule_reference, cases })),
    },
    null,
    2,
  ),
);
