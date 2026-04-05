import { useEffect, useRef } from "react";

/* ── Singleton CDN loader ─────────────────────────────────────────────────── */
let _ready = false;
let _queue = [];

export const loadChart = () => {
  if (_ready || window.Chart) { _ready = true; return Promise.resolve(); }
  return new Promise((resolve) => {
    _queue.push(resolve);
    if (document.querySelector("[data-cjs]")) return;
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js";
    s.setAttribute("data-cjs", "1");
    s.onload = () => {
      _ready = true;
      _queue.forEach((cb) => cb());
      _queue = [];
    };
    document.head.appendChild(s);
  });
};

/**
 * useChart — creates and destroys a Chart.js instance tied to a canvas ref.
 * @param {React.RefObject} canvasRef
 * @param {() => object} buildFn  — returns a Chart.js config object (or null to skip)
 * @param {any[]} deps — re-runs when any dep changes (like React's useEffect)
 */
export const useChart = (canvasRef, buildFn, deps) => {
  const inst = useRef(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    loadChart().then(() => {
      if (!canvasRef.current) return;
      if (inst.current) { inst.current.destroy(); inst.current = null; }
      const cfg = buildFn();
      if (cfg) inst.current = new window.Chart(canvasRef.current, cfg);
    });
    return () => {
      if (inst.current) { inst.current.destroy(); inst.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
