import { SLabel, Card, ScoreBar } from "./primitives";
import { download } from "../utils/export";

/* ── Renders ANY structured extraction result as a formatted card ─────────── */
export default function GenericCard({ docType, result, isNew = false }) {
  if (!result) return null;

  const handleDownload = () => {
    download(JSON.stringify(result, null, 2), `${docType}_${Date.now()}.json`, "application/json");
  };

  /* Sentiment / quality colour helpers */
  const sentimentColor = {
    Positive: { bg: "#dcfce7", text: "#15803d" },
    Negative: { bg: "#fee2e2", text: "#b91c1c" },
    Mixed:    { bg: "#fef9c3", text: "#92400e" },
    Neutral:  { bg: "#f3f4f6", text: "#374151" },
  };
  const qualityColor = {
    Strong:  { bg: "#dcfce7", text: "#15803d" },
    Good:    { bg: "#eaf3de", text: "#3b6d11" },
    Average: { bg: "#fef9c3", text: "#92400e" },
    Weak:    { bg: "#fee2e2", text: "#b91c1c" },
  };
  const urgencyColor = {
    High:   { bg: "#fee2e2", text: "#b91c1c" },
    Medium: { bg: "#fef9c3", text: "#92400e" },
    Low:    { bg: "#f3f4f6", text: "#374151" },
  };

  const badge = (value, colorMap) => {
    const c = colorMap[value] || { bg: "#000", text: "#fff" };
    return (
      <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", fontWeight: 900, background: c.bg, color: c.text,
        border: "2px solid #000", borderRadius: 0, padding: "2px 8px", textTransform: "uppercase" }}>{value}</span>
    );
  };

  const tagList = (items, bg, text) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
      {(items || []).map((s, i) => (
        <span key={i} style={{ fontSize: 12, background: bg, color: text, border: "2px solid #000", borderRadius: 0, padding: "2px 8px", fontWeight: 900, textTransform: "uppercase" }}>{s}</span>
      ))}
    </div>
  );

  const field = (label, value) => {
    if (value == null || value === "" || (Array.isArray(value) && !value.length)) return null;
    return (
      <div style={{ marginBottom: 12 }}>
        <SLabel mb={4}>{label}</SLabel>
        {Array.isArray(value)
          ? tagList(value, "var(--color-background-secondary)", "var(--color-text-primary)")
          : <div style={{ fontSize: 14, color: "var(--color-text-primary)", lineHeight: 1.6 }}>{String(value)}</div>
        }
      </div>
    );
  };

  /* ── JOB DESCRIPTION ── */
  const JDCard = () => (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 3 }}>{result.job_title || "Untitled Role"}</div>
          <div style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>
            {[result.company_name, result.location].filter(Boolean).join(" · ")}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {result.remote_policy && badge(result.remote_policy, { Remote: { bg: "#dcfce7", text: "#15803d" }, Hybrid: { bg: "#eaf3de", text: "#3b6d11" }, "On-site": { bg: "#f3f4f6", text: "#374151" }, Unclear: { bg: "#f3f4f6", text: "#6b7280" } })}
          {result.seniority_level && <span style={{ fontSize: 12, fontWeight: 500, background: "#dbeafe", color: "#1d4ed8", borderRadius: 20, padding: "3px 11px" }}>{result.seniority_level}</span>}
          {result.employment_type && result.employment_type !== "Unclear" && <span style={{ fontSize: 12, background: "#f3f4f6", color: "#374151", borderRadius: 20, padding: "3px 11px" }}>{result.employment_type}</span>}
        </div>
      </div>

      {(result.salary_min || result.salary_max) && (
        <div style={{ background: "#e2ff00", border: "3px solid #000", padding: "10px 14px", marginBottom: 14, display: "flex", gap: 16, flexWrap: "wrap", boxShadow: "4px 4px 0 0 #000" }}>
          <span style={{ fontSize: 14, fontFamily: "var(--font-mono)", fontWeight: 900, color: "#000" }}>
            💰 {result.salary_currency}{result.salary_min?.toLocaleString()} – {result.salary_currency}{result.salary_max?.toLocaleString()} {result.salary_period || ""}
          </span>
        </div>
      )}

      <SLabel>Required Skills</SLabel>
      {tagList(result.required_skills, "#fee2e2", "#7f1d1d")}
      {result.preferred_skills?.length > 0 && <div style={{ marginTop: 6 }}>{tagList(result.preferred_skills, "#f3f4f6", "#374151")}</div>}
      <div style={{ marginTop: 14 }} />

      {field("Key Responsibilities", result.key_responsibilities)}
      {field("Required Qualifications", result.required_qualifications)}
      {field("Benefits", result.benefits_mentioned)}
      {result.summary && (
        <div style={{ borderLeft: "6px solid #000", background: "#f0f0f0", padding: "10px 14px", fontSize: 14, color: "#000", fontFamily: "var(--font-mono)", fontWeight: 700, lineHeight: 1.6, marginTop: 8 }}>
          {result.summary}
        </div>
      )}
      {result.application_contact && (
        <div style={{ marginTop: 12, fontSize: 13 }}>
          <SLabel mb={3}>Apply via</SLabel>
          <span style={{ color: "#3266ad" }}>{result.application_contact}</span>
        </div>
      )}
    </>
  );

  /* ── CANDIDATE RESPONSE ── */
  const CandidateCard = () => (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 3 }}>{result.candidate_name || "Unknown Candidate"}</div>
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
            {[result.role_applied, result.current_company, result.years_of_experience ? `${result.years_of_experience} yrs exp` : null].filter(Boolean).join(" · ")}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          {result.response_quality && badge(result.response_quality, qualityColor)}
          {result.experience_level && <span style={{ fontSize: 12, background: "#dbeafe", color: "#1d4ed8", borderRadius: 20, padding: "3px 11px" }}>{result.experience_level}</span>}
        </div>
      </div>

      {result.communication_score != null && (
        <div style={{ marginBottom: 14 }}>
          <SLabel>Communication Quality</SLabel>
          <ScoreBar label="Writing clarity & professionalism" value={result.communication_score} />
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        {result.green_flags?.length > 0 && (
          <div>
            <SLabel>Green Flags</SLabel>
            {tagList(result.green_flags, "#dcfce7", "#15803d")}
          </div>
        )}
        {result.red_flags?.length > 0 && (
          <div>
            <SLabel>Red Flags</SLabel>
            {tagList(result.red_flags, "#fee2e2", "#b91c1c")}
          </div>
        )}
      </div>

      {field("Claimed Skills", result.claimed_skills)}
      {field("Key Themes", result.key_themes)}
      {result.quantified_achievements?.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <SLabel>Quantified Achievements</SLabel>
          {(result.quantified_achievements).map((a, i) => (
            <div key={i} style={{ fontSize: 13, padding: "6px 0", borderBottom: "0.5px solid var(--color-border-tertiary)", color: "var(--color-text-primary)" }}>
              • {a}
            </div>
          ))}
        </div>
      )}

      {result.recommended_follow_up?.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <SLabel>Recommended Screen Questions</SLabel>
          {result.recommended_follow_up.map((q, i) => (
            <div key={i} style={{ fontSize: 13, padding: "5px 12px", marginBottom: 5, background: "#f0f7ff", borderRadius: 6, color: "#1e3a5f", borderLeft: "3px solid #3266ad" }}>
              {q}
            </div>
          ))}
        </div>
      )}

      {result.summary && (
        <div style={{ borderLeft: "6px solid #000", background: "#f0f0f0", padding: "10px 14px", fontSize: 14, color: "#000", fontFamily: "var(--font-mono)", fontWeight: 700, lineHeight: 1.6, marginTop: 8 }}>
          "{result.summary}"
        </div>
      )}
      {result.contact_info && <div style={{ marginTop: 10, fontSize: 12, color: "var(--color-text-secondary)" }}>Contact: {result.contact_info}</div>}
    </>
  );

  /* ── INTERNAL FEEDBACK ── */
  const FeedbackCard = () => (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 3 }}>{result.subject || "Team Feedback"}</div>
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
            {[result.about_category, result.category].filter(Boolean).join(" · ")}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {result.sentiment && badge(result.sentiment, sentimentColor)}
          {result.urgency && badge(`Urgency: ${result.urgency}`, urgencyColor)}
        </div>
      </div>

      {result.key_points?.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <SLabel>Key Points</SLabel>
          {result.key_points.map((p, i) => (
            <div key={i} style={{ display: "flex", gap: 8, padding: "7px 0", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
              <span style={{ color: "#3266ad", fontWeight: 600, flexShrink: 0 }}>→</span>
              <span style={{ fontSize: 13, lineHeight: 1.55 }}>{p}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        {result.action_items?.length > 0 && (
          <div>
            <SLabel>Action Items</SLabel>
            {result.action_items.map((a, i) => (
              <div key={i} style={{ fontSize: 12, padding: "4px 0", color: "#1d4ed8" }}>☐ {a}</div>
            ))}
          </div>
        )}
        {result.risks_flagged?.length > 0 && (
          <div>
            <SLabel>Risks Flagged</SLabel>
            {tagList(result.risks_flagged, "#fee2e2", "#b91c1c")}
          </div>
        )}
      </div>

      {result.positive_signals?.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <SLabel>What's Working</SLabel>
          {tagList(result.positive_signals, "#dcfce7", "#15803d")}
        </div>
      )}

      {(result.mentioned_people?.length > 0 || result.mentioned_teams?.length > 0) && (
        <div style={{ display: "flex", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
          {result.mentioned_people?.length > 0 && (
            <div><SLabel mb={3}>People</SLabel>{tagList(result.mentioned_people, "#f3f4f6", "#374151")}</div>
          )}
          {result.mentioned_teams?.length > 0 && (
            <div><SLabel mb={3}>Teams</SLabel>{tagList(result.mentioned_teams, "#ede9fe", "#5b21b6")}</div>
          )}
        </div>
      )}

      {result.summary && (
        <div style={{ borderLeft: "6px solid #000", background: "#f0f0f0", padding: "10px 14px", fontSize: 14, color: "#000", fontFamily: "var(--font-mono)", fontWeight: 700, lineHeight: 1.6, marginTop: 8 }}>
          {result.summary}
        </div>
      )}
    </>
  );

  return (
    <Card style={isNew ? { animation: "fadeSlideIn 0.35s ease forwards" } : {}}>
      {docType === "job_description"    && <JDCard />}
      {docType === "candidate_response" && <CandidateCard />}
      {docType === "internal_feedback"  && <FeedbackCard />}

      {/* Download button */}
      <div style={{ borderTop: "4px solid #000", paddingTop: 14, marginTop: 14 }}>
        <button onClick={handleDownload}
          style={{ fontSize: 14, fontWeight: 900, color: "#fff", background: "#000", border: "2px solid #000",
            borderRadius: 0, padding: "8px 16px", cursor: "pointer", fontFamily: "var(--font-mono)", textTransform: "uppercase", boxShadow: "4px 4px 0 0 #e2ff00" }}>
          ↓ Download JSON
        </button>
      </div>
    </Card>
  );
}
