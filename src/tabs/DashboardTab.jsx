import { useRef } from "react";
import { Card, SLabel } from "../components/primitives";
import { DOC_TYPES } from "../constants";
import { useChart } from "../hooks/useChart";
import { CHART_COLORS } from "../utils/colors";

const TYPE_ORDER = ["interview_notes", "job_description", "candidate_response", "internal_feedback"];
const TYPE_LABELS = { interview_notes: "Interview Notes", job_description: "Job Descriptions", candidate_response: "Candidate Responses", internal_feedback: "Internal Feedback" };

export default function DashboardTab({ session }) {
  if (!session.length) return (
    <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--color-text-secondary)" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: "var(--color-text-primary)" }}>No data yet</div>
      <div style={{ fontSize: 14 }}>Go to the <strong>Analyze</strong> tab to extract records. Charts will appear here automatically.</div>
    </div>
  );

  const byType = {};
  TYPE_ORDER.forEach(t => { byType[t] = session.filter(r => r._type === t); });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
        <Stat label="Total records" value={session.length} />
        {TYPE_ORDER.map(t => byType[t].length > 0 && (
          <Stat key={t} label={DOC_TYPES[t].label} value={byType[t].length} icon={DOC_TYPES[t].icon} />
        ))}
      </div>

      {/* Type distribution */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 16 }}>
        <Card><SLabel>Records by Type</SLabel><TypePieChart session={session} /></Card>
        <Card><SLabel>Extraction Timeline</SLabel><TimelineChart session={session} /></Card>
      </div>

      {/* Interview-specific */}
      {byType.interview_notes.length > 0 && (
        <>
          <SLabel style={{ fontSize: 14, fontWeight: 600, marginBottom: -8 }}>📝 Interview Notes Analytics</SLabel>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 16 }}>
            <Card><SLabel>Recommendation Distribution</SLabel><RecChart records={byType.interview_notes} /></Card>
            <Card><SLabel>Average Scores by Dimension</SLabel><DimChart records={byType.interview_notes} /></Card>
          </div>
        </>
      )}

      {/* JD-specific */}
      {byType.job_description.length > 0 && (
        <>
          <SLabel style={{ fontSize: 14, fontWeight: 600, marginBottom: -8 }}>📋 Job Descriptions Analytics</SLabel>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 16 }}>
            <Card><SLabel>Seniority Distribution</SLabel><JDSeniorityChart records={byType.job_description} /></Card>
            <Card><SLabel>Remote Policy</SLabel><JDRemoteChart records={byType.job_description} /></Card>
          </div>
        </>
      )}

      {/* Candidate-specific */}
      {byType.candidate_response.length > 0 && (
        <>
          <SLabel style={{ fontSize: 14, fontWeight: 600, marginBottom: -8 }}>👤 Candidate Response Analytics</SLabel>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 16 }}>
            <Card><SLabel>Response Quality</SLabel><CandidateQualityChart records={byType.candidate_response} /></Card>
            <Card><SLabel>Experience Level</SLabel><CandidateExpChart records={byType.candidate_response} /></Card>
          </div>
        </>
      )}

      {/* Feedback-specific */}
      {byType.internal_feedback.length > 0 && (
        <>
          <SLabel style={{ fontSize: 14, fontWeight: 600, marginBottom: -8 }}>💬 Internal Feedback Analytics</SLabel>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 16 }}>
            <Card><SLabel>Sentiment</SLabel><FeedbackSentimentChart records={byType.internal_feedback} /></Card>
            <Card><SLabel>Urgency</SLabel><FeedbackUrgencyChart records={byType.internal_feedback} /></Card>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */
const Stat = ({ label, value, icon }) => (
  <div style={{ background: "#fff", border: "3px solid #000", boxShadow: "4px 4px 0 0 #000", borderRadius: 0, padding: "0.9rem 1rem" }}>
    <div style={{ fontSize: 10, fontWeight: 900, fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textTransform: "uppercase", color: "#000", marginBottom: 3 }}>
      {icon && <span style={{ marginRight: 4 }}>{icon}</span>}{label}
    </div>
    <div style={{ fontSize: 28, fontFamily: "var(--font-mono)", fontWeight: 900 }}>{value}</div>
  </div>
);

const barOpts = () => ({
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { 
    x: { grid: { color: "#000", lineWidth: 2, drawBorder: true }, border: { color: "#000", width: 2 }, ticks: { font: { size: 11, family: "Space Mono", weight: "bold" }, color: "#000", maxRotation: 30 } }, 
    y: { grid: { color: "#000", lineWidth: 2, drawBorder: true }, border: { color: "#000", width: 2 }, ticks: { stepSize: 1, font: { size: 11, family: "Space Mono", weight: "bold" }, color: "#000" }, beginAtZero: true } 
  },
});

const countBy = (arr, key) => {
  const m = {};
  arr.forEach(r => { const v = r[key] || "Unknown"; m[v] = (m[v] || 0) + 1; });
  return m;
};

/* ── Chart components ────────────────────────────────────────────────────── */
function TypePieChart({ session }) {
  const ref = useRef(null);
  const counts = {};
  TYPE_ORDER.forEach(t => { const c = session.filter(r => r._type === t).length; if (c) counts[DOC_TYPES[t].label] = c; });
  useChart(ref, () => ({
    type: "doughnut",
    data: { labels: Object.keys(counts), datasets: [{ data: Object.values(counts), backgroundColor: CHART_COLORS.slice(0, Object.keys(counts).length), borderColor: "#000", borderWidth: 3 }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: "50%", plugins: { legend: { position: "right", labels: { font: { size: 12, family: "Space Mono", weight: 700 }, boxWidth: 16, padding: 12, color: "#000" } } } },
  }), [session.length]);
  return <div style={{ position: "relative", height: 200 }}><canvas ref={ref} /></div>;
}

function TimelineChart({ session }) {
  const ref = useRef(null);
  useChart(ref, () => {
    const sorted = [...session].sort((a, b) => a._ts - b._ts);
    return {
      type: "line",
      data: { labels: sorted.map((_, i) => i + 1), datasets: [{ data: sorted.map((_, i) => i + 1), borderColor: "#000", borderWidth: 3, fill: true, backgroundColor: "#e2ff00", tension: 0, pointRadius: 5, pointBackgroundColor: "#000" }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { title: { display: true, text: "Record #", font: { size: 10, family: "Space Mono", weight: "bold" }, color: "#000" }, grid: { color: "#000", lineWidth: 1 } }, y: { title: { display: true, text: "Cumulative", font: { size: 10, family: "Space Mono", weight: "bold" }, color: "#000" }, grid: { color: "#000", lineWidth: 1 }, beginAtZero: true } } },
    };
  }, [session.length]);
  return <div style={{ position: "relative", height: 200 }}><canvas ref={ref} /></div>;
}

export function RecChart({ records }) {
  const ref = useRef(null);
  const order = ["Strong Hire","Hire","Lean Hire","Lean No Hire","No Hire","Strong No Hire"];
  const counts = Object.fromEntries(order.map(r => [r, 0]));
  records.forEach(r => { if (counts[r.overall_recommendation] != null) counts[r.overall_recommendation]++; });
  useChart(ref, () => ({
    type: "bar",
    data: { labels: order, datasets: [{ data: order.map(r => counts[r]), backgroundColor: CHART_COLORS, borderColor: "#000", borderWidth: 3, borderRadius: 0, borderSkipped: false }] },
    options: barOpts(),
  }), [records.length]);
  return <div style={{ position: "relative", height: 180 }}><canvas ref={ref} /></div>;
}

export function DimChart({ records }) {
  const ref = useRef(null);
  const keys = ["technical_skill","communication","problem_solving","culture_fit","leadership"];
  const labels = ["Technical","Communication","Problem Solving","Culture Fit","Leadership"];
  const avgs = keys.map(k => {
    const vals = records.map(r => r.scores?.[k]).filter(v => v != null);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  });
  useChart(ref, () => ({
    type: "radar",
    data: { labels, datasets: [{ data: avgs, fill: true, backgroundColor: "#e2ff00", borderColor: "#000", borderWidth: 3, pointBackgroundColor: "#000", pointBorderColor: "#000", pointRadius: 4 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { r: { min: 0, max: 5, grid: { color: "#000" }, angleLines: { color: "#000" }, ticks: { stepSize: 1, font: { size: 10, family: "Space Mono", weight: "bold" }, color: "#000", backdropColor: "transparent" }, pointLabels: { font: { size: 10, family: "Space Mono", weight: "bold" }, color: "#000" } } } },
  }), [records.length]);
  return <div style={{ position: "relative", height: 200 }}><canvas ref={ref} /></div>;
}

export function JDSeniorityChart({ records }) {
  const ref = useRef(null);
  const data = countBy(records, "seniority_level");
  useChart(ref, () => ({ type: "bar", data: { labels: Object.keys(data), datasets: [{ data: Object.values(data), backgroundColor: "#00d0ff", borderColor: "#000", borderWidth: 3, borderRadius: 0, borderSkipped: false }] }, options: barOpts() }), [records.length]);
  return <div style={{ position: "relative", height: 180 }}><canvas ref={ref} /></div>;
}

export function JDRemoteChart({ records }) {
  const ref = useRef(null);
  const data = countBy(records, "remote_policy");
  useChart(ref, () => ({ type: "doughnut", data: { labels: Object.keys(data), datasets: [{ data: Object.values(data), backgroundColor: CHART_COLORS.slice(0, Object.keys(data).length), borderColor: "#000", borderWidth: 3 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: "50%", plugins: { legend: { position: "right", labels: { font: { size: 12, family: "Space Mono", weight: 700 }, boxWidth: 16, padding: 12, color: "#000" } } } } }), [records.length]);
  return <div style={{ position: "relative", height: 180 }}><canvas ref={ref} /></div>;
}

export function CandidateQualityChart({ records }) {
  const ref = useRef(null);
  const order = ["Strong","Good","Average","Weak"];
  const counts = Object.fromEntries(order.map(r => [r, 0]));
  records.forEach(r => { if (counts[r.response_quality] != null) counts[r.response_quality]++; });
  useChart(ref, () => ({ type: "bar", data: { labels: order, datasets: [{ data: order.map(r => counts[r]), backgroundColor: ["#e2ff00","#00d0ff","#7900ff","#ff003c"], borderColor: "#000", borderWidth: 3, borderRadius: 0, borderSkipped: false }] }, options: barOpts() }), [records.length]);
  return <div style={{ position: "relative", height: 180 }}><canvas ref={ref} /></div>;
}

export function CandidateExpChart({ records }) {
  const ref = useRef(null);
  const data = countBy(records, "experience_level");
  useChart(ref, () => ({ type: "bar", data: { labels: Object.keys(data), datasets: [{ data: Object.values(data), backgroundColor: "#e2ff00", borderColor: "#000", borderWidth: 3, borderRadius: 0, borderSkipped: false }] }, options: barOpts() }), [records.length]);
  return <div style={{ position: "relative", height: 180 }}><canvas ref={ref} /></div>;
}

export function FeedbackSentimentChart({ records }) {
  const ref = useRef(null);
  const order = ["Positive","Mixed","Neutral","Negative"];
  const counts = Object.fromEntries(order.map(r => [r, 0]));
  records.forEach(r => { if (counts[r.sentiment] != null) counts[r.sentiment]++; });
  useChart(ref, () => ({ type: "bar", data: { labels: order, datasets: [{ data: order.map(r => counts[r]), backgroundColor: ["#e2ff00","#7900ff","#fff","#ff003c"], borderColor: "#000", borderWidth: 3, borderRadius: 0, borderSkipped: false }] }, options: barOpts() }), [records.length]);
  return <div style={{ position: "relative", height: 180 }}><canvas ref={ref} /></div>;
}

export function FeedbackUrgencyChart({ records }) {
  const ref = useRef(null);
  const order = ["High","Medium","Low"];
  const counts = Object.fromEntries(order.map(r => [r, 0]));
  records.forEach(r => { if (counts[r.urgency] != null) counts[r.urgency]++; });
  useChart(ref, () => ({ type: "doughnut", data: { labels: order, datasets: [{ data: order.map(r => counts[r]), backgroundColor: ["#ff003c","#e2ff00","#7900ff"], borderColor: "#000", borderWidth: 3 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: "50%", plugins: { legend: { position: "right", labels: { font: { size: 12, family: "Space Mono", weight: 700 }, boxWidth: 16, padding: 12, color: "#000" } } } } }), [records.length]);
  return <div style={{ position: "relative", height: 180 }}><canvas ref={ref} /></div>;
}
