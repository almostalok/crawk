import { computeAvgByDimension } from "../utils/metrics";
import { Card, SLabel, RecBadge, ConfPill, ScoreBar } from "./primitives";

export default function ScorecardCard({ record, isNew = false }) {
  const dims = computeAvgByDimension([record]);

  return (
    <Card style={isNew ? { animation: "fadeSlideIn 0.35s ease forwards" } : {}}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 2, fontFamily: "var(--font-body)", textTransform: "uppercase" }}>
            {record.candidate_name || (
              <span style={{ color: "#000", fontWeight: 900 }}>Unknown Candidate</span>
            )}
          </div>
          {record.role && <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{record.role}</div>}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <RecBadge rec={record.overall_recommendation} />
          <ConfPill conf={record.confidence} />
        </div>
      </div>

      {/* Scores */}
      <SLabel>Scores</SLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0 28px", marginBottom: 16 }}>
        {dims.map((d) => <ScoreBar key={d.key} label={d.label} value={d.avg} />)}
      </div>

      {/* Strengths + Concerns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div>
          <SLabel>Strengths</SLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {(record.key_strengths || []).map((s, i) => (
              <span key={i} style={{ fontSize: 12, background: "#e2ff00", color: "#000", border: "2px solid #000", borderRadius: 0, padding: "2px 8px", fontWeight: 900, textTransform: "uppercase" }}>{s}</span>
            ))}
          </div>
        </div>
        {(record.key_concerns || []).length > 0 && (
          <div>
            <SLabel>Concerns</SLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {record.key_concerns.map((c, i) => (
                <span key={i} style={{ fontSize: 12, background: "#ff003c", color: "#fff", border: "2px solid #000", borderRadius: 0, padding: "2px 8px", fontWeight: 900, textTransform: "uppercase" }}>{c}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Standout quote */}
      {record.standout_quote && (
        <div style={{ borderLeft: "6px solid #000", background: "#f0f0f0", padding: "10px 14px", marginBottom: 14, fontSize: 14, color: "#000", fontFamily: "var(--font-mono)", fontWeight: 700, lineHeight: 1.6 }}>
          "{record.standout_quote}"
        </div>
      )}

      {/* Reasoning */}
      {record.reasoning && (
        <>
          <SLabel>Reasoning</SLabel>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65, marginBottom: 12 }}>
            {record.reasoning}
          </p>
        </>
      )}

      {/* Meta footer */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", borderTop: "4px solid #000", paddingTop: 14, marginTop: 14 }}>
        {[["Seniority", record.seniority_signal], ["Feedback quality", record.feedback_quality]].map(([k, v]) => (
          <div key={k}>
            <span style={{ fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-text-secondary)", fontWeight: 500 }}>
              {k}:{" "}
            </span>
            <span style={{ fontSize: 12, fontWeight: 500 }}>{v}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
