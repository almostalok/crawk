/* ── Recommendation color system ──────────────────────────────────────────── */
export const REC_COLORS = {
  "Strong Hire":    { bg: "#e2ff00", text: "#000", dot: "#000" }, /* Neon Yellow */
  "Hire":           { bg: "#fff", text: "#000", dot: "#000" },
  "Lean Hire":      { bg: "#f0f0f0", text: "#000", dot: "#000" },
  "Lean No Hire":   { bg: "#000", text: "#fff", dot: "#fff" },
  "No Hire":        { bg: "#ff003c", text: "#fff", dot: "#fff" }, /* Stark Red */
  "Strong No Hire": { bg: "#7900ff", text: "#fff", dot: "#fff" }, /* Deep Purple */
};

export const CHART_COLORS = ["#e2ff00", "#ff003c", "#000000", "#00d0ff", "#7900ff", "#ffffff"];

export const getRecColor = (rec) =>
  REC_COLORS[rec] || { bg: "#fff", text: "#000", dot: "#000" };

export const isHire = (rec) => ["Strong Hire", "Hire", "Lean Hire"].includes(rec);
