import { useState, useMemo } from "react";
import { DOC_TYPES } from "../constants";
import { Card, SLabel, RecBadge } from "../components/primitives";
import ScorecardCard from "../components/ScorecardCard";
import GenericCard   from "../components/GenericCard";
import { download }  from "../utils/export";

const TYPE_ORDER = ["all", "interview_notes", "job_description", "candidate_response", "internal_feedback"];
const selStyle = { padding: "6px 10px", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, fontSize: 13, color: "var(--color-text-primary)", background: "var(--color-background-primary)", fontFamily: "var(--font-sans)" };

export default function RecordsTab({ session }) {
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch]         = useState("");
  const [expanded, setExpanded]     = useState(null);

  const filtered = useMemo(() => {
    let list = [...session].sort((a, b) => b._ts - a._ts);
    if (typeFilter !== "all") list = list.filter(r => r._type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r => JSON.stringify(r).toLowerCase().includes(q));
    }
    return list;
  }, [session, typeFilter, search]);

  if (!session.length) return (
    <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--color-text-secondary)" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: "var(--color-text-primary)" }}>No records yet</div>
      <div style={{ fontSize: 14 }}>Analyze documents in the <strong>Analyze</strong> tab — every result is stored here.</div>
    </div>
  );

  const handleExport = (format) => {
    const data = filtered.map(r => {
      const { _input, ...rest } = r;
      return rest;
    });
    if (format === "json") {
      download(JSON.stringify(data, null, 2), `session_${Date.now()}.json`, "application/json");
    } else {
      const cols = [...new Set(data.flatMap(r => Object.keys(r)))];
      const esc = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
      const csv = [cols.join(","), ...data.map(r => cols.map(c => {
        const v = r[c];
        return esc(Array.isArray(v) ? v.join(" | ") : typeof v === "object" && v ? JSON.stringify(v) : v);
      }).join(","))].join("\n");
      download(csv, `session_${Date.now()}.csv`, "text/csv");
    }
  };

  const getLabel = (r) => {
    if (r._type === "interview_notes") return r.candidate_name || r.role || "Interview";
    if (r._type === "job_description") return r.job_title || "Job Description";
    if (r._type === "candidate_response") return r.candidate_name || "Candidate";
    if (r._type === "internal_feedback") return r.subject || "Feedback";
    return "Record";
  };

  const getBadge = (r) => {
    if (r._type === "interview_notes") return r.overall_recommendation;
    if (r._type === "job_description") return r.seniority_level;
    if (r._type === "candidate_response") return r.response_quality;
    if (r._type === "internal_feedback") return r.sentiment;
    return null;
  };

  const getSub = (r) => {
    if (r._type === "interview_notes") return `${r.confidence || ""} conf · ${r.seniority_signal || ""}`;
    if (r._type === "job_description") return `${r.remote_policy || ""} · ${r.employment_type || ""}`;
    if (r._type === "candidate_response") return `${r.experience_level || ""} · comm: ${r.communication_score || "?"}/5`;
    if (r._type === "internal_feedback") return `${r.urgency || ""} urgency · ${r.category || ""}`;
    return "";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input placeholder="Search records…" value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ ...selStyle, flex: "1 1 200px", minWidth: 180 }} />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={selStyle}>
          <option value="all">All types</option>
          {TYPE_ORDER.slice(1).map(t => <option key={t} value={t}>{DOC_TYPES[t].label}</option>)}
        </select>
        <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button onClick={() => handleExport("json")} style={{ fontSize: 11, padding: "5px 12px", background: "#3266ad", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontFamily: "var(--font-sans)" }}>↓ JSON</button>
          <button onClick={() => handleExport("csv")} style={{ fontSize: 11, padding: "5px 12px", background: "#059669", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontFamily: "var(--font-sans)" }}>↓ CSV</button>
        </div>
      </div>

      {/* Records list */}
      {filtered.map((r) => {
        const isExpanded = expanded === r._id;
        const typeInfo = DOC_TYPES[r._type] || {};
        return (
          <div key={r._id}>
            <Card style={{ cursor: "pointer", transition: "border-color 0.15s" }}
              onClick={() => setExpanded(isExpanded ? null : r._id)}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{typeInfo.icon || "📄"}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{getLabel(r)}</span>
                    {r._type === "interview_notes" && getBadge(r) && <RecBadge rec={getBadge(r)} />}
                    {r._type !== "interview_notes" && getBadge(r) && (
                      <span style={{ fontSize: 11, background: "#f3f4f6", color: "#374151", borderRadius: 20, padding: "2px 9px", fontWeight: 500 }}>{getBadge(r)}</span>
                    )}
                    <span style={{ fontSize: 11, color: "var(--color-text-secondary)", background: "var(--color-background-secondary)", borderRadius: 20, padding: "2px 8px" }}>{typeInfo.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 3 }}>{getSub(r)}</div>
                </div>
                <span style={{ fontSize: 11, color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>
                  {new Date(r._ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span style={{ fontSize: 16, color: "var(--color-text-secondary)", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▾</span>
              </div>
            </Card>

            {isExpanded && (
              <div style={{ marginTop: -8, padding: "16px 14px", background: "var(--color-background-secondary)", borderRadius: "0 0 12px 12px", borderTop: "none" }}>
                {r._type === "interview_notes" && <ScorecardCard record={r} />}
                {r._type !== "interview_notes" && <GenericCard docType={r._type} result={r} />}
                {r._input && (
                  <details style={{ marginTop: 12 }}>
                    <summary style={{ fontSize: 12, color: "#3266ad", cursor: "pointer", fontFamily: "var(--font-sans)" }}>View original input</summary>
                    <pre style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.6, whiteSpace: "pre-wrap", marginTop: 8, padding: 12, background: "var(--color-background-primary)", borderRadius: 8, border: "0.5px solid var(--color-border-tertiary)" }}>{r._input}</pre>
                  </details>
                )}
              </div>
            )}
          </div>
        );
      })}

      {!filtered.length && (
        <div style={{ textAlign: "center", padding: 40, color: "var(--color-text-secondary)" }}>
          No records match your search/filter
        </div>
      )}
    </div>
  );
}
