/**
 * toCSV — converts an array of scorecard records to CSV string.
 * Columns: id, candidate_name, role, overall_recommendation, confidence,
 *          technical_skill, communication, problem_solving, culture_fit, leadership,
 *          key_strengths, key_concerns, seniority_signal, feedback_quality,
 *          standout_quote, reasoning, analyzed_at
 */
export const toCSV = (records) => {
  const cols = [
    "id", "candidate_name", "role", "overall_recommendation", "confidence",
    "technical_skill", "communication", "problem_solving", "culture_fit", "leadership",
    "key_strengths", "key_concerns", "seniority_signal", "feedback_quality",
    "standout_quote", "reasoning", "analyzed_at",
  ];
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = records.map((r) =>
    [
      r.id,
      r.candidate_name ?? "",
      r.role ?? "",
      r.overall_recommendation,
      r.confidence,
      r.scores?.technical_skill ?? "",
      r.scores?.communication   ?? "",
      r.scores?.problem_solving  ?? "",
      r.scores?.culture_fit      ?? "",
      r.scores?.leadership       ?? "",
      (r.key_strengths || []).join(" | "),
      (r.key_concerns  || []).join(" | "),
      r.seniority_signal,
      r.feedback_quality,
      r.standout_quote ?? "",
      r.reasoning      ?? "",
      new Date(r.ts).toISOString(),
    ].map(esc).join(",")
  );
  return [cols.join(","), ...rows].join("\n");
};

/** Trigger a browser file download. */
export const download = (content, filename, mime) => {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};
