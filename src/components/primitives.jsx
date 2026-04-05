import { getRecColor } from "../utils/colors";

/* ── SLabel — uppercase section heading ───────────────────────────────────── */
export const SLabel = ({ children, mb = 8, style = {} }) => (
  <div style={{
    fontSize: 11, fontWeight: 500, letterSpacing: "0.08em",
    textTransform: "uppercase", color: "var(--color-text-secondary)",
    marginBottom: mb, ...style,
  }}>
    {children}
  </div>
);

/* ── Card — bordered content container ───────────────────────────────────── */
export const Card = ({ children, style = {}, padding = "1rem 1.25rem" }) => (
  <div style={{
    background: "#ffffff",
    border: "3px solid #000",
    borderRadius: "0",
    boxShadow: "6px 6px 0px 0px #000",
    padding, ...style,
  }}>
    {children}
  </div>
);

/* ── MetricCard — KPI tile ───────────────────────────────────────────────── */
export const MetricCard = ({ label, value, sub }) => (
  <div style={{
    background: "#fff",
    border: "3px solid #000",
    borderRadius: "0",
    boxShadow: "4px 4px 0px 0px #000",
    padding: "1rem", minWidth: 0,
  }}>
    <SLabel mb={4}>{label}</SLabel>
    <div style={{ fontSize: 28, fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1 }}>
      {value}
    </div>
    {sub && <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 5 }}>{sub}</div>}
  </div>
);

/* ── RecBadge — coloured recommendation pill ─────────────────────────────── */
export const RecBadge = ({ rec }) => {
  if (!rec) return null;
  const c = getRecColor(rec);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: c.bg, color: c.text,
      border: "2px solid #000",
      boxShadow: "2px 2px 0px 0px #000",
      borderRadius: 0, padding: "3px 10px 3px 8px",
      fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", textTransform: "uppercase"
    }}>
      <span style={{ width: 8, height: 8, border: "2px solid #000", background: c.dot, flexShrink: 0 }} />
      {rec}
    </span>
  );
};

/* ── ConfPill — confidence level badge ───────────────────────────────────── */
export const ConfPill = ({ conf }) => (
  <span style={{
    fontSize: 12, color: "#000", fontWeight: 700,
    background: "#fff", border: "2px solid #000",
    boxShadow: "2px 2px 0px 0px #000",
    borderRadius: 0, padding: "3px 10px", whiteSpace: "nowrap", textTransform: "uppercase"
  }}>
    {conf} confidence
  </span>
);

/* ── ScoreBar — labelled horizontal bar 1-5 ─────────────────────────────── */
export const ScoreBar = ({ label, value }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
      <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", fontWeight: 700, textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", fontWeight: 700, color: value != null ? "#000" : "var(--color-text-secondary)" }}>
        {value != null ? `${Math.round(value * 10) / 10}/5` : "—"}
      </span>
    </div>
    <div style={{ height: 10, background: "#fff", border: "2px solid #000", overflow: "hidden" }}>
      {value != null && (
        <div className="score-bar-fill"
          style={{ height: "100%", width: `${(value / 5) * 100}%`, background: "#e2ff00", borderRight: "2px solid #000" }} />
      )}
    </div>
  </div>
);

/* ── StatusChip — pipeline item status ───────────────────────────────────── */
export const StatusChip = ({ status }) => {
  const map = {
    pending: { bg: "#fff", text: "#000",  label: "Pending"  },
    running: { bg: "#e2ff00", text: "#000",  label: "Running…" },
    done:    { bg: "#000", text: "#fff",  label: "Done"     },
    error:   { bg: "#ff003c", text: "#fff",  label: "Error"    },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)", textTransform: "uppercase",
      background: s.bg, color: s.text, border: "2px solid #000",
      boxShadow: "2px 2px 0px 0px #000",
      borderRadius: 0, padding: "2px 9px",
    }}>
      {s.label}
    </span>
  );
};
