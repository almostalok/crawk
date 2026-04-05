import { useState, useCallback } from "react";
import { GlobalStyle }   from "./components/GlobalStyle";
import AnalyzeTab   from "./tabs/AnalyzeTab";
import DashboardTab from "./tabs/DashboardTab";
import RecordsTab   from "./tabs/RecordsTab";

const TABS = [
  { id: "analyze",   label: "Analyze"     },
  { id: "dashboard", label: "Dashboard"   },
  { id: "records",   label: "All Records" },
];

function LandingPage({ onEnter }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHJlY3Qgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==')", textAlign: "center", padding: 20 }}>
      <div style={{ background: "#fff", border: "4px solid #000", boxShadow: "12px 12px 0px 0px #000", padding: "60px 40px", maxWidth: 800, width: "100%" }}>
        <h1 style={{ fontSize: "clamp(3rem, 8vw, 6rem)", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.9, letterSpacing: "-0.04em", margin: "0 0 20px 0" }}>
          Unstructured Data<br/>
          <span style={{ color: "#ff003c" }}>Demolished.</span>
        </h1>
        <p style={{ fontSize: 20, fontFamily: "var(--font-mono)", maxWidth: 500, margin: "0 auto 40px", fontWeight: 700 }}>
          CRAWK Platform. <br/>Raw Text → Queryable JSON Arrays. <br/>Powered by Google Gemini.
        </p>
        <button onClick={onEnter} className="tab-btn" style={{ fontSize: 24, padding: "20px 40px", background: "#e2ff00", letterSpacing: "0.05em" }}>
          [ ENTER PIPELINE ]
        </button>
      </div>
    </div>
  );
}

export default function App() {
  /* Session store — every analyzed record lives here */
  const [session, setSession] = useState([]);
  const [activeTab, setActiveTab] = useState("analyze");
  const [hasStarted, setHasStarted] = useState(false);

  const addRecord = useCallback((record) => {
    setSession((prev) => [record, ...prev]);
  }, []);

  if (!hasStarted) return (
    <>
      <GlobalStyle />
      <LandingPage onEnter={() => setHasStarted(true)} />
    </>
  );

  return (
    <>
      <GlobalStyle />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px 60px", fontFamily: "var(--font-body)" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
            <div style={{ width: 44, height: 44, border: "3px solid #000", background: "#e2ff00", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "4px 4px 0 0 #000" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 900, fontSize: 24 }}>//</span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em", margin: 0 }}>
              CRAWK
            </h1>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", borderBottom: "4px solid #000", marginBottom: 24, gap: 10 }}>
          {TABS.map((t) => (
            <button key={t.id} className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: "10px 20px", fontSize: 14,
                marginBottom: -4, 
              }}>
              {t.label}
              {t.id === "records" && session.length > 0 && (
                <span style={{ marginLeft: 8, fontSize: 13, border: "2px solid #000", background: "#fff", padding: "1px 6px", color: "#000", fontWeight: 900, fontFamily: "var(--font-mono)", boxShadow: "2px 2px 0 0 #000" }}>
                  {session.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "analyze"   && <AnalyzeTab session={session} onNewRecord={addRecord} />}
        {activeTab === "dashboard" && <DashboardTab session={session} />}
        {activeTab === "records"   && <RecordsTab session={session} />}
      </div>
    </>
  );
}
