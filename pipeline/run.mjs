#!/usr/bin/env node
/**
 * Interview Intelligence — Universal Data Pipeline
 * ══════════════════════════════════════════════════════════════════════
 *
 * Reads ANY unstructured text files and extracts structured output.
 * Supports 4 document types: interview notes, job descriptions,
 * candidate responses, and internal feedback.
 *
 * USAGE
 * ─────
 *   # Process all files in pipeline/inbox/ (auto-detects type):
 *   node pipeline/run.mjs
 *
 *   # Process a specific file:
 *   node pipeline/run.mjs --file pipeline/inbox/jd_senior_fullstack.txt
 *
 *   # Override detected type:
 *   node pipeline/run.mjs --file myfile.txt --type job_description
 *
 *   # No API key? Run in mock mode:
 *   node pipeline/run.mjs --mock
 *
 * NAMING CONVENTIONS (auto-detection)
 * ─────────────────────────────────────
 *   jd_*.txt          → job_description
 *   candidate_*.txt   → candidate_response
 *   feedback_*.txt    → internal_feedback
 *   interview_*.txt   → interview_notes  (default)
 *
 * OUTPUT (pipeline/output/)
 * ──────────────────────────
 *   results_latest.json              All records, all types
 *   job_descriptions_latest.csv      Type-specific flat tables
 *   candidate_responses_latest.csv
 *   interview_notes_latest.csv
 *   internal_feedback_latest.csv
 *   results_<timestamp>.json         Timestamped copies
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "fs";
import { join, dirname, basename }                                          from "path";
import { fileURLToPath }                                                    from "url";
import { PROMPTS, SCHEMAS, detectType }                                     from "./prompts.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

/* ── Load .env ────────────────────────────────────────────────────────────── */
try {
  for (const line of readFileSync(join(__dirname, "../.env"), "utf-8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq > 0) process.env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
  }
} catch (_) {}

/* ── CLI flags ────────────────────────────────────────────────────────────── */
const args     = process.argv.slice(2);
const MOCK     = args.includes("--mock");
const fileFlag = args.indexOf("--file");
const typeFlag = args.indexOf("--type");
const FORCED_TYPE = typeFlag !== -1 ? args[typeFlag + 1] : null;
const SINGLE_FILE = fileFlag !== -1 ? args[fileFlag + 1] : null;
const API_KEY  = process.env.VITE_GEMINI_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;
const INBOX    = join(__dirname, "inbox");
const OUT_DIR  = join(__dirname, "output");

/* ── ANSI colours ─────────────────────────────────────────────────────────── */
const C = {
  reset: "\x1b[0m", bold: "\x1b[1m", dim: "\x1b[2m",
  green: "\x1b[32m", yellow: "\x1b[33m", blue: "\x1b[34m",
  red: "\x1b[31m",  cyan: "\x1b[36m",   magenta: "\x1b[35m",
  bBlue: "\x1b[44m",
};
const paint = (col, s) => `${col}${s}${C.reset}`;

const TYPE_COLORS = {
  interview_notes:   C.blue,
  job_description:   C.magenta,
  candidate_response:C.cyan,
  internal_feedback: C.yellow,
};

const TYPE_LABELS = {
  interview_notes:   "Interview Notes",
  job_description:   "Job Description",
  candidate_response:"Candidate Response",
  internal_feedback: "Internal Feedback",
};

/* ── Collect files to process ─────────────────────────────────────────────── */
function collectFiles() {
  if (SINGLE_FILE) {
    const abs = SINGLE_FILE.startsWith("/") || /^[A-Z]:/i.test(SINGLE_FILE)
      ? SINGLE_FILE
      : join(process.cwd(), SINGLE_FILE);
    if (!existsSync(abs)) { console.error(paint(C.red, `  ✗ File not found: ${abs}`)); process.exit(1); }
    return [abs];
  }
  if (!existsSync(INBOX)) {
    console.log(paint(C.yellow, `\n  No inbox folder found. Creating pipeline/inbox/ — drop your .txt files there.\n`));
    mkdirSync(INBOX, { recursive: true });
    return [];
  }
  return readdirSync(INBOX)
    .filter(f => f.endsWith(".txt") && !f.startsWith("."))
    .map(f => join(INBOX, f));
}

/* ── Anthropic API call ───────────────────────────────────────────────────── */
async function callAPI(text, type) {
  const prompt = PROMPTS[type] || PROMPTS.interview_notes;
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: prompt }] },
      contents: [{ parts: [{ text }] }],
      generationConfig: { responseMimeType: "application/json" }
    })
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const raw = data.candidates[0].content.parts[0].text;
  
  // Clean markdown formatting if present
  const cleanRaw = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  return JSON.parse(cleanRaw);
}

/* ── Mock extractor (works offline, no API key) ───────────────────────────── */
function mockExtract(type, text) {
  const t   = text.toLowerCase();
  const pos = (t.match(/strong|excellent|great|good|solid|impressive|clean|clear|yes|recommend|best|well|capable|impressive/g) || []).length;
  const neg = (t.match(/not|gap|weak|poor|issue|problem|concern|struggle|fail|error|miss|unclear|no hire|thin|pass/g) || []).length;
  const r   = pos / Math.max(1, pos + neg);

  if (type === "job_description") {
    const salaryMatch = text.match(/\$?([\d,]+)\s*[–\-—to]+\s*\$?([\d,]+)/);
    return {
      job_title:              text.split("\n").find(l => l.length > 5 && l.length < 80)?.trim() || null,
      company_name:           null,
      location:               t.includes("remote") ? "Remote" : null,
      remote_policy:          t.includes("remote-first") ? "Remote" : t.includes("hybrid") ? "Hybrid" : "Unclear",
      employment_type:        t.includes("contract") ? "Contract" : "Full-time",
      seniority_level:        t.includes("senior") ? "Senior" : t.includes("lead") ? "Lead" : t.includes("junior") ? "Junior" : "Unclear",
      department:             null,
      reports_to:             null,
      team_size:              null,
      salary_min:             salaryMatch ? parseInt(salaryMatch[1].replace(/,/g, "")) : null,
      salary_max:             salaryMatch ? parseInt(salaryMatch[2].replace(/,/g, "")) : null,
      salary_currency:        t.includes("$") ? "USD" : null,
      salary_period:          "annual",
      required_skills:        ["[MOCK — run real pipeline for extracted skills]"],
      preferred_skills:       [],
      key_responsibilities:   ["[MOCK — run real pipeline for responsibilities]"],
      required_qualifications:[],
      benefits_mentioned:     [],
      application_contact:    text.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0] || null,
      summary:                "[MOCK MODE] heuristic extraction. Set VITE_ANTHROPIC_API_KEY for full semantic extraction.",
    };
  }

  if (type === "candidate_response") {
    const nameMatch = text.match(/^(?:from:|hi,?\s+i'?m\s+|my name is\s+)?([A-Z][a-z]+ [A-Z][a-z]+)/m);
    return {
      candidate_name:          nameMatch?.[1] || null,
      role_applied:            null,
      response_quality:        r > 0.65 ? "Strong" : r > 0.45 ? "Good" : r > 0.3 ? "Average" : "Weak",
      experience_level:        t.includes("senior") ? "Senior" : t.includes("lead") ? "Senior" : "Mid",
      years_of_experience:     (text.match(/(\d+)\s+years?/)?.[1] || null),
      claimed_skills:          ["[MOCK — run real pipeline for skill extraction]"],
      communication_score:     Math.round(2 + r * 3),
      key_themes:              ["[MOCK — run real pipeline for theme extraction]"],
      green_flags:             r > 0.5 ? ["Shows relevant experience", "Quantifies impact"] : [],
      red_flags:               r < 0.4 ? ["Vague claims", "Missing context"] : [],
      quantified_achievements: [],
      recommended_follow_up:   ["Tell me more about your most complex project.", "How do you approach technical disagreements?"],
      current_company:         null,
      contact_info:            text.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0] || null,
      summary:                 "[MOCK MODE] heuristic extraction. Set VITE_ANTHROPIC_API_KEY for full semantic extraction.",
    };
  }

  if (type === "internal_feedback") {
    return {
      subject:         text.split("\n").find(l => l.toLowerCase().startsWith("subject:"))?.replace(/subject:/i,"").trim()
                       || text.split("\n").find(l => l.length > 10 && l.length < 80)?.trim() || "Team feedback",
      about_category:  t.includes("hiring") || t.includes("interview") ? "Hiring"
                       : t.includes("morale") || t.includes("culture") ? "Culture"
                       : t.includes("process") ? "Process" : "Team",
      sentiment:       r > 0.55 ? "Positive" : r > 0.35 ? "Mixed" : "Negative",
      urgency:         neg > 4 ? "High" : neg > 2 ? "Medium" : "Low",
      category:        t.includes("burn") || t.includes("morale") ? "Morale"
                       : t.includes("hiring") ? "Hiring" : "Process",
      mentioned_people:  (text.match(/\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)?\b/g) || []).slice(0, 5),
      mentioned_teams:   [],
      key_points:      ["[MOCK — run real pipeline for key point extraction]"],
      action_items:    ["[MOCK — run real pipeline for action item extraction]"],
      risks_flagged:   neg > 3 ? ["Potential attrition risk mentioned"] : [],
      positive_signals:r > 0.4 ? ["Some positive outcomes noted"] : [],
      author_role:     null,
      summary:         "[MOCK MODE] heuristic extraction. Set VITE_ANTHROPIC_API_KEY for full semantic extraction.",
    };
  }

  // interview_notes default
  const tier = r > 0.70 ? 0 : r > 0.55 ? 1 : r > 0.44 ? 2 : r > 0.33 ? 3 : r > 0.20 ? 4 : 5;
  const RECS  = ["Strong Hire","Hire","Lean Hire","Lean No Hire","No Hire","Strong No Hire"];
  const base  = [5, 4, 3, 3, 2, 1][tier];
  return {
    overall_recommendation: RECS[tier], confidence: ["High","High","Medium","Medium","High","High"][tier],
    scores: { technical_skill: base, communication: Math.max(1, base - (tier < 2 ? 0 : 1)), problem_solving: base, culture_fit: tier < 4 ? base - 1 : null, leadership: tier < 3 ? base - 1 : null },
    key_strengths: tier < 3 ? ["Domain knowledge evident", "Good communication"] : ["Some domain familiarity"],
    key_concerns:  tier >= 3 ? ["Gaps identified"] : [],
    standout_quote: text.split(/[.!?]/).find(s => s.trim().length > 40)?.trim() || null,
    seniority_signal: ["Senior","Senior","Mid","Mid","Junior","Junior"][tier],
    feedback_quality: text.length > 300 ? "Detailed" : text.length > 150 ? "Moderate" : "Thin",
    candidate_name: null, role: null,
    reasoning: `[MOCK MODE] Positive signal ratio ${(r*100).toFixed(0)}%. Set VITE_ANTHROPIC_API_KEY for Claude extraction.`,
  };
}

/* ── Flatten record for CSV ───────────────────────────────────────────────── */
function flattenRecord(type, extracted) {
  const schema = SCHEMAS[type] || [];
  const row    = {};
  for (const col of schema) {
    const val = extracted[col] ?? extracted.scores?.[col];
    if (Array.isArray(val)) row[col] = val.join(" | ");
    else row[col] = val ?? "";
  }
  return row;
}

function toCSV(records) {
  if (!records.length) return "";
  const cols = Object.keys(records[0]);
  const esc  = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [cols.join(","), ...records.map(r => cols.map(c => esc(r[c])).join(","))].join("\n");
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN
   ══════════════════════════════════════════════════════════════════════════ */
async function main() {
  console.log(`\n${C.bBlue}${C.bold}${C.cyan}  Interview Intelligence — Universal Data Pipeline  ${C.reset}`);
  console.log(paint(C.dim, "  Unstructured text → Structured, queryable output\n"));
  console.log(paint(C.dim, "  Supports: Interview Notes · Job Descriptions · Candidate Responses · Internal Feedback\n"));

  if (MOCK) {
    console.log(paint(C.yellow, "  ⚡ MOCK MODE — heuristic extraction, no API calls"));
    console.log(paint(C.dim, "  Set VITE_GEMINI_API_KEY in .env and remove --mock for Gemini extraction\n"));
  } else if (!API_KEY) {
    console.log(paint(C.red, "  ✗  VITE_GEMINI_API_KEY not set."));
    console.log(paint(C.dim, "  Add it to .env, or run with --mock for a demonstration\n"));
    process.exit(1);
  } else {
    console.log(paint(C.green, "  ✓  API key loaded — gemini-2.5-flash\n"));
  }

  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  const files = collectFiles();
  if (!files.length) {
    console.log(paint(C.yellow, `  No .txt files found in pipeline/inbox/`));
    console.log(paint(C.dim, "  Drop your text files there (see naming conventions in run.mjs header)\n"));
    console.log(paint(C.dim, "  Or use: node pipeline/run.mjs --file path/to/yourfile.txt\n"));
    return;
  }

  console.log(`${C.bold}  Processing ${files.length} file${files.length !== 1 ? "s" : ""}…${C.reset}\n`);

  const allResults = [];
  const byType     = {};
  const errors     = [];

  for (let i = 0; i < files.length; i++) {
    const filePath = files[i];
    const fname    = basename(filePath);
    const text     = readFileSync(filePath, "utf-8");
    const type     = FORCED_TYPE || detectType(fname, text);
    const typeCol  = TYPE_COLORS[type] || C.white;
    const typeLabel = TYPE_LABELS[type] || type;

    const num = String(i + 1).padStart(2, " ");
    process.stdout.write(
      `  ${C.dim}[${num}/${files.length}]${C.reset}  ` +
      `${fname.padEnd(38)}  ${typeCol}${typeLabel.padEnd(20)}${C.reset}  `
    );

    try {
      let extractedArray;
      if (MOCK) {
        await new Promise(r => setTimeout(r, 50));
        extractedArray = [mockExtract(type, text)];
      } else {
        const parsedRaw = await callAPI(text, type);
        extractedArray = Array.isArray(parsedRaw) ? parsedRaw : [parsedRaw];
        if (i < files.length - 1) await new Promise(r => setTimeout(r, 350));
      }

      for (let j = 0; j < extractedArray.length; j++) {
        const extracted = extractedArray[j];
        const record = {
          source_file: extractedArray.length > 1 ? `${fname} (pt ${j+1})` : fname,
          doc_type:    type,
          analyzed_at: new Date().toISOString(),
          ...extracted,
        };

        allResults.push(record);
        if (!byType[type]) byType[type] = [];
        byType[type].push(flattenRecord(type, record));

        // Print result summary per type
        if (type === "interview_notes") {
          console.log(paint(C.green, "✓") + `  ${record.overall_recommendation} (${record.confidence})`);
        } else if (type === "job_description") {
          console.log(paint(C.green, "✓") + `  ${record.job_title || "Unknown title"} — ${record.seniority_level || "?"}`);
        } else if (type === "candidate_response") {
          console.log(paint(C.green, "✓") + `  ${record.candidate_name || "Candidate"} — ${record.response_quality}`);
        } else if (type === "internal_feedback") {
          console.log(paint(C.green, "✓") + `  ${record.sentiment} · Urgency: ${record.urgency}`);
        }
      }

    } catch (e) {
      errors.push({ file: fname, type, error: e.message });
      console.log(paint(C.red, `✗  ${e.message}`));
    }
  }

  /* Write output */
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const jsonFile = join(OUT_DIR, `results_${stamp}.json`);
  writeFileSync(jsonFile,                            JSON.stringify(allResults, null, 2));
  writeFileSync(join(OUT_DIR, "results_latest.json"), JSON.stringify(allResults, null, 2));

  const typeFileMap = {
    interview_notes:   "interview_notes",
    job_description:   "job_descriptions",
    candidate_response:"candidate_responses",
    internal_feedback: "internal_feedback",
  };
  for (const [type, rows] of Object.entries(byType)) {
    const slug = typeFileMap[type] || type;
    writeFileSync(join(OUT_DIR, `${slug}_latest.csv`),     toCSV(rows));
    writeFileSync(join(OUT_DIR, `${slug}_${stamp}.csv`),   toCSV(rows));
  }

  /* Summary */
  console.log(`\n${C.bold}  ─────────────────────────────────────────────────────────${C.reset}`);
  console.log(`${C.bold}  Pipeline Complete${C.reset}`);
  console.log(`  Files processed : ${C.bold}${allResults.length}${C.reset} / ${files.length}`);
  console.log(`  Errors          : ${errors.length}`);
  console.log(`\n  ${C.bold}Breakdown by type:${C.reset}`);
  for (const [type, rows] of Object.entries(byType)) {
    const col = TYPE_COLORS[type] || C.white;
    console.log(`  ${col}${TYPE_LABELS[type].padEnd(22)}${C.reset}  ${rows.length} record${rows.length !== 1 ? "s" : ""}`);
  }
  console.log(`\n  ${C.bold}Output files:${C.reset}`);
  console.log(`  ${paint(C.blue, jsonFile)}  (all records)`);
  for (const [type] of Object.entries(byType)) {
    const slug = typeFileMap[type] || type;
    console.log(`  ${paint(C.blue, join(OUT_DIR, `${slug}_${stamp}.csv`))}  (${TYPE_LABELS[type]})`);
  }
  console.log();

  if (errors.length) {
    console.log(paint(C.yellow, "  Failed files:"));
    errors.forEach(e => console.log(`  ${C.red}✗${C.reset}  ${e.file}: ${e.error}`));
    console.log();
  }
}

main().catch(e => { console.error(paint(C.red, `\n  Fatal: ${e.message}\n`)); process.exit(1); });
