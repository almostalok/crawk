import { useRef } from "react";
import { useChart } from "../hooks/useChart";
import { computeAvgByDimension, computeRecDist } from "../utils/metrics";
import { CHART_COLORS } from "../utils/colors";
import { SLabel } from "./primitives";

/* ── Shared base options for bar charts ──────────────────────────────────── */
const barOpts = () => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: "rgba(128,128,128,0.1)" }, ticks: { font: { size: 10 }, maxRotation: 30 } },
    y: { grid: { color: "rgba(128,128,128,0.1)" }, ticks: { stepSize: 1 }, beginAtZero: true },
  },
});

/* ── Mini bar — recommendation distribution (Analyze sidebar) ─────────────  */
export const MiniBarChart = ({ records }) => {
  const ref  = useRef(null);
  const data = computeRecDist(records);
  useChart(ref, () => ({
    type: "bar",
    data: { labels: data.map((d) => d.label), datasets: [{ data: data.map((d) => d.count), backgroundColor: CHART_COLORS, borderRadius: 4, borderSkipped: false }] },
    options: barOpts(),
  }), [records.length]);
  return <div style={{ position: "relative", height: 145 }}><canvas ref={ref} /></div>;
};

/* ── Mini radar — avg scores by dimension (Analyze sidebar) ──────────────── */
export const MiniRadarChart = ({ records }) => {
  const ref  = useRef(null);
  const dims = computeAvgByDimension(records);
  useChart(ref, () => ({
    type: "radar",
    data: {
      labels: dims.map((d) => d.label),
      datasets: [{ data: dims.map((d) => d.avg ?? 0), fill: true, backgroundColor: "rgba(50,102,173,0.15)", borderColor: "#3266ad", pointBackgroundColor: "#3266ad", pointRadius: 3 }],
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { r: { min: 0, max: 5, ticks: { stepSize: 1, font: { size: 10 } }, pointLabels: { font: { size: 10 } } } } },
  }), [records.length]);
  return <div style={{ position: "relative", height: 165 }}><canvas ref={ref} /></div>;
};

/* ── Doughnut — recommendation distribution with legend (Dashboard) ──────── */
export const DoughnutChart = ({ records }) => {
  const ref = useRef(null);
  const raw = computeRecDist(records).filter((d) => d.count > 0);
  useChart(ref, () => ({
    type: "doughnut",
    data: { labels: raw.map((d) => d.label), datasets: [{ data: raw.map((d) => d.count), backgroundColor: CHART_COLORS.slice(0, raw.length), borderWidth: 0 }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: "62%", plugins: { legend: { display: true, position: "right", labels: { font: { size: 11 }, boxWidth: 12, padding: 10 } } } },
  }), [records.length]);
  return <div style={{ position: "relative", height: 200 }}><canvas ref={ref} /></div>;
};

/* ── Confidence bar chart ─────────────────────────────────────────────────── */
export const ConfidenceChart = ({ records }) => {
  const ref    = useRef(null);
  const counts = { High: 0, Medium: 0, Low: 0 };
  records.forEach((r) => { if (counts[r.confidence] != null) counts[r.confidence]++; });
  useChart(ref, () => ({
    type: "bar",
    data: { labels: ["High", "Medium", "Low"], datasets: [{ data: [counts.High, counts.Medium, counts.Low], backgroundColor: ["#3a8a4a", "#ba7517", "#e24b4a"], borderRadius: 4, borderSkipped: false }] },
    options: barOpts(),
  }), [records.length]);
  return <div style={{ position: "relative", height: 165 }}><canvas ref={ref} /></div>;
};

/* ── Seniority bar chart ──────────────────────────────────────────────────── */
export const SeniorityChart = ({ records }) => {
  const ref  = useRef(null);
  const lbls = ["Junior", "Mid", "Senior", "Staff/Principal", "Unclear"];
  const cnt  = Object.fromEntries(lbls.map((l) => [l, 0]));
  records.forEach((r) => { if (cnt[r.seniority_signal] != null) cnt[r.seniority_signal]++; });
  useChart(ref, () => ({
    type: "bar",
    data: { labels: lbls, datasets: [{ data: lbls.map((l) => cnt[l]), backgroundColor: "#3266ad", borderRadius: 4, borderSkipped: false }] },
    options: barOpts(),
  }), [records.length]);
  return <div style={{ position: "relative", height: 165 }}><canvas ref={ref} /></div>;
};

/* ── Full rec bar chart (Dashboard bottom) ───────────────────────────────── */
export const RecBarChart = ({ records }) => {
  const ref  = useRef(null);
  const data = computeRecDist(records);
  useChart(ref, () => ({
    type: "bar",
    data: { labels: data.map((d) => d.label), datasets: [{ data: data.map((d) => d.count), backgroundColor: CHART_COLORS, borderRadius: 4, borderSkipped: false }] },
    options: barOpts(),
  }), [records.length]);
  return <div style={{ position: "relative", height: 185 }}><canvas ref={ref} /></div>;
};
