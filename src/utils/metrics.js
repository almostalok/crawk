import { isHire } from "./colors";

export const computeMetrics = (records) => {
  const total = records.length;
  if (!total) return { total: 0, hireRate: 0, avgScore: "—", highConf: 0 };
  const hires    = records.filter((r) => isHire(r.overall_recommendation)).length;
  const highConf = records.filter((r) => r.confidence === "High").length;
  const allScores = records.flatMap((r) => Object.values(r.scores).filter((v) => v != null));
  const avgScore  = allScores.length
    ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1)
    : "—";
  return { total, hireRate: Math.round((hires / total) * 100), avgScore, highConf };
};

export const computeAvgByDimension = (records) => {
  const keys   = ["technical_skill", "communication", "problem_solving", "culture_fit", "leadership"];
  const labels = ["Technical", "Communication", "Problem Solving", "Culture Fit", "Leadership"];
  return keys.map((k, i) => {
    const vals = records.map((r) => r.scores[k]).filter((v) => v != null);
    return {
      key: k,
      label: labels[i],
      avg: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null,
    };
  });
};

export const computeRecDist = (records) => {
  const order  = ["Strong Hire", "Hire", "Lean Hire", "Lean No Hire", "No Hire", "Strong No Hire"];
  const counts = Object.fromEntries(order.map((r) => [r, 0]));
  records.forEach((r) => { if (counts[r.overall_recommendation] != null) counts[r.overall_recommendation]++; });
  return order.map((r) => ({ label: r, count: counts[r] }));
};

export const fmtDate = (ts) =>
  new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export const avgOf = (r) => {
  const vals = Object.values(r.scores).filter((v) => v != null);
  return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : "—";
};
