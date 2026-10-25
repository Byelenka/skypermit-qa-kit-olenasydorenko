#!/usr/bin/env node
// SessionEnd hook: summarizes token usage per model (main session + subagents)
// and writes reports/ws2/<date>-<session_id>.md. Never fails the session.
import { readFileSync, writeFileSync, appendFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

// USD per 1M tokens, from the price table. Only input/output are known;
// cache tokens are reported but not priced.
const PRICES = {
  'claude-haiku-5-5': { name: 'Haiku 5.5', input: 0.1, output: 0.5 },
  'claude-sonnet-5-5': { name: 'Sonnet 5.5', input: 2, output: 10 },
  'claude-opus-5-5': { name: 'Opus 5.5', input: 4, output: 20 },
  'claude-fable-5-1': { name: 'Fable 5.1', input: 10, output: 50 },
};

const priceFor = (model) => {
  if (PRICES[model]) return PRICES[model];
  const key = Object.keys(PRICES).find((k) => model.startsWith(k + '-'));
  return key ? PRICES[key] : null;
};

const readJsonl = (path) =>
  readFileSync(path, 'utf8')
    .split('\n')
    .filter(Boolean)
    .flatMap((line) => {
      try {
        return [JSON.parse(line)];
      } catch {
        return [];
      }
    });

// One API message is written once per content block with the same message.id;
// keep a single record per id (the one with the most output tokens).
function usageByModel(records) {
  const byId = new Map();
  for (const r of records) {
    const m = r.message;
    if (r.type !== 'assistant' || !m?.usage || !m.model || m.model === '<synthetic>') continue;
    const key = m.id ?? r.uuid;
    const prev = byId.get(key);
    if (!prev || (m.usage.output_tokens ?? 0) >= (prev.usage.output_tokens ?? 0)) {
      byId.set(key, { model: m.model, usage: m.usage });
    }
  }
  const totals = {};
  for (const { model, usage: u } of byId.values()) {
    const t = (totals[model] ??= { calls: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0 });
    t.calls += 1;
    t.input += u.input_tokens ?? 0;
    t.output += u.output_tokens ?? 0;
    t.cacheRead += u.cache_read_input_tokens ?? 0;
    t.cacheWrite += u.cache_creation_input_tokens ?? 0;
  }
  return totals;
}

const merge = (into, from) => {
  for (const [model, t] of Object.entries(from)) {
    const x = (into[model] ??= { calls: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0 });
    for (const k of Object.keys(x)) x[k] += t[k];
  }
};

const cost = (model, t) => {
  const p = priceFor(model);
  return p ? (t.input * p.input + t.output * p.output) / 1e6 : null;
};

const n = (v) => v.toLocaleString('en-US');
const usd = (v) => (v === null ? '—' : '$' + v.toFixed(4));

function modelTable(totals) {
  const models = Object.keys(totals).sort();
  if (!models.length) return '_No model calls._\n';
  const rows = [
    '| Model | Calls | Input | Output | Cache read | Cache write | $ (input+output) |',
    '|---|---:|---:|---:|---:|---:|---:|',
  ];
  let sum = 0;
  let unpriced = false;
  for (const m of models) {
    const t = totals[m];
    const c = cost(m, t);
    if (c === null) unpriced = true;
    else sum += c;
    rows.push(`| ${priceFor(m)?.name ?? m} | ${n(t.calls)} | ${n(t.input)} | ${n(t.output)} | ${n(t.cacheRead)} | ${n(t.cacheWrite)} | ${usd(c)} |`);
  }
  rows.push(`| **Total** | | | | | | **${usd(sum)}**${unpriced ? ' (excluding models without prices)' : ''} |`);
  return rows.join('\n') + '\n';
}

function main(payload) {
  const transcript = payload.transcript_path;
  if (!transcript || !existsSync(transcript)) return;
  const sessionId = payload.session_id ?? basename(transcript, '.jsonl');

  const records = readJsonl(transcript);
  const compacts = records.filter((r) => r.type === 'system' && r.subtype === 'compact_boundary');
  const main = usageByModel(records);
  const all = {};
  merge(all, main);

  const subDir = join(dirname(transcript), sessionId, 'subagents');
  const agents = [];
  if (existsSync(subDir)) {
    for (const f of readdirSync(subDir).filter((f) => f.endsWith('.jsonl'))) {
      let meta = {};
      try {
        meta = JSON.parse(readFileSync(join(subDir, f.replace(/\.jsonl$/, '.meta.json')), 'utf8'));
      } catch {}
      const totals = usageByModel(readJsonl(join(subDir, f)));
      merge(all, totals);
      agents.push({ id: f.replace(/^agent-|\.jsonl$/g, ''), meta, totals });
    }
  }

  const date = new Date().toISOString().slice(0, 10);
  const out = [`# Usage report — ${sessionId}`, '', `- Date: ${date}`, `- Transcript: \`${transcript}\``, '',
    '## Total (session + subagents)', '', modelTable(all),
    '## Main session', '', modelTable(main),
    `## Subagents (${agents.length})`, ''];
  if (agents.length) {
    out.push('| Agent | Type | Description | Calls | Input | Output | $ |', '|---|---|---|---:|---:|---:|---:|');
    for (const a of agents) {
      const ts = Object.entries(a.totals);
      const calls = ts.reduce((s, [, t]) => s + t.calls, 0);
      const input = ts.reduce((s, [, t]) => s + t.input, 0);
      const output = ts.reduce((s, [, t]) => s + t.output, 0);
      const costs = ts.map(([m, t]) => cost(m, t));
      const c = costs.length && costs.every((x) => x !== null) ? costs.reduce((s, x) => s + x, 0) : null;
      out.push(`| ${a.id} | ${a.meta.agentType ?? '—'} | ${a.meta.description ?? '—'} | ${n(calls)} | ${n(input)} | ${n(output)} | ${usd(c)} |`);
    }
  } else {
    out.push('_No subagents._');
  }
  out.push('', `## Compact (${compacts.length})`, '');
  if (compacts.length) {
    out.push('| Time | Trigger | Tokens before | Tokens after | Duration |', '|---|---|---:|---:|---:|');
    for (const c of compacts) {
      const m = c.compactMetadata ?? {};
      const dur = m.durationMs == null ? '—' : (m.durationMs / 1000).toFixed(1) + ' s';
      out.push(`| ${c.timestamp ?? '—'} | ${m.trigger ?? '—'} | ${m.preTokens == null ? '—' : n(m.preTokens)} | ${m.postTokens == null ? '—' : n(m.postTokens)} | ${dur} |`);
    }
    out.push('', '_The call that generates the summary has no `usage` in the transcript, so its cost is not included in this report._');
  } else {
    out.push('_No compacts._');
  }
  out.push('', '## Notes', '',
    '- Prices are USD per 1M tokens (assumed units), input and output only.',
    '- Cache read/write are shown in tokens and not included in the cost: no prices are available.',
    '- Records with the same `message.id` are counted once.', '');

  const root = process.env.CLAUDE_PROJECT_DIR ?? payload.cwd ?? process.cwd();
  const dir = join(root, 'reports', 'ws2');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${date}-${sessionId}.md`), out.join('\n'));
}

try {
  let raw = '';
  for await (const chunk of process.stdin) raw += chunk;
  main(JSON.parse(raw || '{}'));
} catch (e) {
  console.error('usage-report:', e?.message ?? e);
  try {
    const dir = join(process.env.CLAUDE_PROJECT_DIR ?? process.cwd(), 'reports', 'ws2');
    mkdirSync(dir, { recursive: true });
    appendFileSync(join(dir, 'errors.log'), `${new Date().toISOString()} ${e?.stack ?? e}\n`);
  } catch {}
}
process.exit(0);
