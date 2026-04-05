import { useState, useCallback } from "react";
import { DOC_TYPES } from "../constants";
import { Card, SLabel } from "../components/primitives";
import ScorecardCard from "../components/ScorecardCard";
import GenericCard   from "../components/GenericCard";
import { 
  RecChart, DimChart, 
  JDSeniorityChart, JDRemoteChart, 
  CandidateQualityChart, CandidateExpChart, 
  FeedbackSentimentChart, FeedbackUrgencyChart 
} from "./DashboardTab";
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const TYPE_ORDER = ["interview_notes", "job_description", "candidate_response", "internal_feedback"];

const fieldStyle = {
  padding: "8px 10px", border: "2px solid #000",
  borderRadius: "0", fontSize: 13, width: "100%",
  color: "var(--color-text-primary)", background: "var(--color-background-primary)",
  fontFamily: "var(--font-mono)",
  boxShadow: "2px 2px 0 0 #000",
};

export default function AnalyzeTab({ session, onNewRecord }) {
  const [docTypeId, setDocTypeId]     = useState("interview_notes");
  const [inputText, setInputText]     = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [roleText, setRoleText]       = useState("");
  const [loading, setLoading]         = useState(false);
  const [lastResult, setLastResult]   = useState(null);
  const [lastDocType, setLastDocType] = useState(null);
  const [error, setError]             = useState(null);

  const docType = DOC_TYPES[docTypeId];

  const switchType = (id) => { setDocTypeId(id); setInputText(""); setCandidateName(""); setRoleText(""); setLastResult(null); setError(null); };

  const analyze = useCallback(async () => {
    if (!inputText.trim()) return;
    setLoading(true); setError(null); setLastResult(null);
    try {
      const parts = [
        candidateName ? `Candidate: ${candidateName}` : "",
        roleText ? `Role: ${roleText}` : "",
        inputText.trim(),
      ].filter(Boolean);

      if (!API_KEY) throw new Error("GEMINI API Key is missing. Add VITE_GEMINI_API_KEY to your .env file.");

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: docType.prompt }] },
          contents: [{ parts: [{ text: parts.join("\n") }] }],
          generationConfig: { responseMimeType: "application/json" }
        }),
      });
      if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
      const data = await res.json();
      const raw = data.candidates[0].content.parts[0].text;
      
      // Clean markdown formatting if present
      const cleanRaw = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      const parsedRaw = JSON.parse(cleanRaw);
      
      const parsedArray = Array.isArray(parsedRaw) ? parsedRaw : [parsedRaw];

      const newRecords = parsedArray.map((parsed, i) => {
        if (docTypeId === "interview_notes") {
          if (candidateName && !parsed.candidate_name) parsed.candidate_name = `${candidateName}${parsedArray.length > 1 ? ` (${i+1})` : ""}`;
          if (roleText && !parsed.role) parsed.role = roleText;
        }
        return { ...parsed, _id: Date.now() + i, _ts: Date.now() + i, _type: docTypeId, _input: inputText.trim() };
      });

      setLastResult(newRecords);
      setLastDocType(docTypeId);
      newRecords.forEach(r => onNewRecord(r));
    } catch (e) {
      setError(e.message || "Extraction failed");
    } finally { setLoading(false); }
  }, [inputText, candidateName, roleText, docTypeId, docType, onNewRecord]);

  const isInterview = docTypeId === "interview_notes";
  const sessionCount = session.filter(r => r._type === docTypeId).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Type selector */}
      <Card>
        <SLabel mb={8}>Document Type</SLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 10 }}>
          {TYPE_ORDER.map((id) => {
            const t = DOC_TYPES[id];
            const active = docTypeId === id;
            const count = session.filter(r => r._type === id).length;
            return (
              <button key={id} onClick={() => switchType(id)} style={{
                padding: "10px 6px", cursor: "pointer",
                border: `3px solid #000`,
                boxShadow: active ? "inset 0 0 0 3px #000" : "4px 4px 0 0 #000",
                borderRadius: 0, background: active ? "#e2ff00" : "#fff",
                fontFamily: "var(--font-body)", textAlign: "center", transition: "all 0.1s", position: "relative",
                transform: active ? "translate(2px, 2px)" : "none",
              }}>
                <div style={{ fontSize: 20, marginBottom: 3 }}>{t.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 900, color: "#000", lineHeight: 1.3, textTransform: "uppercase" }}>{t.label}</div>
                {count > 0 && (
                  <span style={{ position: "absolute", top: 4, right: 6, fontSize: 10, background: "#000", color: "#e2ff00", padding: "2px 6px", fontWeight: 900, fontFamily: "var(--font-mono)" }}>{count}</span>
                )}
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{docType.description}</div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,360px)", gap: 20, alignItems: "start" }}>
        {/* Left: input */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Paste Raw Text</div>

            {isInterview && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                <input placeholder="Candidate name (optional)" value={candidateName} onChange={(e) => setCandidateName(e.target.value)} style={fieldStyle} />
                <input placeholder="Role (optional)" value={roleText} onChange={(e) => setRoleText(e.target.value)} style={fieldStyle} />
              </div>
            )}

            <SLabel mb={8}>Examples</SLabel>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              {(docType.examples || []).map((chip) => (
                <button key={chip.label} className="chip-btn" onClick={() => setInputText(chip.text)}
                  style={{ fontSize: 12, padding: "4px 13px", border: "2px solid #000", borderRadius: 0, color: "#000", background: "#fff" }}>
                  {chip.label}
                </button>
              ))}
            </div>

            <textarea rows={7} value={inputText} onChange={(e) => setInputText(e.target.value)}
              placeholder={
                docTypeId === "job_description"   ? "Paste raw job posting text — from an email, doc, job board, or spreadsheet…" :
                docTypeId === "candidate_response" ? "Paste a cover letter, application email, self-assessment, or candidate response…" :
                docTypeId === "internal_feedback"  ? "Paste team feedback, retro notes, manager comments, or Slack threads…" :
                "Paste any unstructured interview notes, feedback, or recruiter comments here…"
              }
              style={{ ...fieldStyle, minHeight: 150, marginBottom: 14, display: "block", lineHeight: 1.6 }} />

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button disabled={loading || !inputText.trim()} onClick={analyze} style={{
                display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px",
                background: loading || !inputText.trim() ? "#e2e8f0" : "#ff003c",
                color: loading || !inputText.trim() ? "#000" : "#fff", border: "3px solid #000", borderRadius: "0",
                fontSize: 16, fontWeight: 900, cursor: loading || !inputText.trim() ? "not-allowed" : "pointer",
                fontFamily: "var(--font-body)", textTransform: "uppercase", boxShadow: loading || !inputText.trim() ? "none" : "4px 4px 0 0 #000",
              }}>
                {loading && <span className="spinner" />}
                {loading ? "Extracting…" : `Extract ${docType.icon} →`}
              </button>
              {inputText.trim() && (
                <button onClick={() => { setInputText(""); setLastResult(null); setError(null); }}
                  style={{ fontSize: 14, color: "#000", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", fontWeight: 700, textTransform: "uppercase" }}>[ Clear ]</button>
              )}
            </div>
          </Card>

          {error && (
            <Card style={{ background: "#000" }}>
              <div style={{ color: "#ff003c", fontSize: 16, fontWeight: 900, marginBottom: 4, fontFamily: "var(--font-body)", textTransform: "uppercase" }}>⚠ Extraction failed</div>
              <div style={{ color: "#fff", fontSize: 14, lineHeight: 1.55, fontFamily: "var(--font-mono)" }}>{error}</div>
              <button onClick={() => setError(null)} style={{ marginTop: 12, fontSize: 14, color: "#e2ff00", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", fontWeight: 900, padding: 0 }}>[ Dismiss ]</button>
            </Card>
          )}

          {lastResult && lastDocType === "interview_notes" && lastResult.map(r => <ScorecardCard key={r._id} record={r} isNew />)}
          {lastResult && lastDocType && lastDocType !== "interview_notes" && lastResult.map(r => <GenericCard key={r._id} docType={lastDocType} result={r} isNew />)}

          {/* Batch Dashboard */}
          {lastResult && lastResult.length > 1 && (
            <Card style={{ marginTop: 8, background: "#f0f0f0", borderTop: "6px solid #000" }}>
              <SLabel style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 16 }}>Batch Dashboard ({lastResult.length} extracted)</SLabel>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 16 }}>
                {lastDocType === "interview_notes" && (
                  <>
                    <div><SLabel style={{fontSize: 10, marginBottom: 4}}>Recommendation Breakdown</SLabel><RecChart records={lastResult} /></div>
                    <div><SLabel style={{fontSize: 10, marginBottom: 4}}>Average Scores</SLabel><DimChart records={lastResult} /></div>
                  </>
                )}
                {lastDocType === "job_description" && (
                  <>
                    <div><SLabel style={{fontSize: 10, marginBottom: 4}}>Seniority Distribution</SLabel><JDSeniorityChart records={lastResult} /></div>
                    <div><SLabel style={{fontSize: 10, marginBottom: 4}}>Remote Policy</SLabel><JDRemoteChart records={lastResult} /></div>
                  </>
                )}
                {lastDocType === "candidate_response" && (
                  <>
                    <div><SLabel style={{fontSize: 10, marginBottom: 4}}>Response Quality</SLabel><CandidateQualityChart records={lastResult} /></div>
                    <div><SLabel style={{fontSize: 10, marginBottom: 4}}>Experience Level</SLabel><CandidateExpChart records={lastResult} /></div>
                  </>
                )}
                {lastDocType === "internal_feedback" && (
                  <>
                    <div><SLabel style={{fontSize: 10, marginBottom: 4}}>Sentiment</SLabel><FeedbackSentimentChart records={lastResult} /></div>
                    <div><SLabel style={{fontSize: 10, marginBottom: 4}}>Urgency</SLabel><FeedbackUrgencyChart records={lastResult} /></div>
                  </>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Right: session summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card>
            <SLabel mb={6}>Session</SLabel>
            <div style={{ fontSize: 42, fontFamily: "var(--font-mono)", fontWeight: 900, marginBottom: 4 }}>{session.length}</div>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)" }}>records extracted this session</div>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 5 }}>
              {TYPE_ORDER.map(id => {
                const c = session.filter(r => r._type === id).length;
                if (!c) return null;
                return (
                  <div key={id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span style={{ color: "var(--color-text-secondary)" }}>{DOC_TYPES[id].icon} {DOC_TYPES[id].label}</span>
                    <span style={{ fontWeight: 600 }}>{c}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <SLabel mb={12}>How to use</SLabel>
            <div style={{ fontSize: 14, fontFamily: "var(--font-mono)", color: "#000", lineHeight: 1.7, fontWeight: 700 }}>
              <div>[1] Select a document type</div>
              <div>[2] Paste your raw text</div>
              <div>[3] Click Extract</div>
              <div>[4] See Dashboard for analytics</div>
              <div>[5] Query records in All Records</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
