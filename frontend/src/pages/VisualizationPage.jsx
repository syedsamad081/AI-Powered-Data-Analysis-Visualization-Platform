/**
 * VisualizationPage.jsx – Page 4: Visualization Builder
 * Fetches recommended charts from /visualize and renders them with Chart.js.
 */
import React, { useState } from "react";
import axios from "axios";
import ChartRenderer from "../components/ChartRenderer";
import Loader from "../components/Loader";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000";

const TYPE_ICONS = {
  histogram: "📊", bar: "📉", scatter: "⚡", line: "📈", pie: "🥧", heatmap: "🔥",
};

export default function VisualizationPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [charts, setCharts] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const navigate = useNavigate();

  const loadCharts = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await axios.post(`${API}/visualize`);
      setCharts(res.data.charts || []);
      // Auto-select all by default
      setSelected(new Set((res.data.charts || []).map((c) => c.id)));
    } catch (err) {
      setError(err.response?.data?.error || "Visualization failed. Upload a dataset first.");
    } finally {
      setLoading(false);
    }
  };

  const toggleChart = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const visibleCharts = charts.filter((c) => selected.has(c.id));

  return (
    <div className="animate-fade-in">
      {loading && <Loader message="Generating visualizations…" />}

      <div className="page-header flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-title"><span className="text-gradient">Visualization Builder</span></h1>
          <p className="page-subtitle">Auto-recommended charts based on your dataset structure.</p>
        </div>
        <button id="btn-generate-charts" className="btn-primary" onClick={loadCharts} disabled={loading}>
          {loading ? "Generating…" : "▶ Generate Charts"}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
          ⚠️ {error}
        </div>
      )}

      {!charts.length && !loading && (
        <div className="card p-16 text-center text-slate-500 text-sm">
          Click <strong className="text-slate-300">"Generate Charts"</strong> to auto-detect and render recommended visualizations.
        </div>
      )}

      {charts.length > 0 && (
        <div className="space-y-6 animate-slide-up">
          {/* Chart selector */}
          <div className="card p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">
              {charts.length} charts recommended — click to toggle visibility
            </p>
            <div className="flex flex-wrap gap-2">
              {charts.map((chart) => (
                <button
                  key={chart.id}
                  onClick={() => toggleChart(chart.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border
                    ${selected.has(chart.id)
                      ? "bg-violet-600/20 border-violet-500/40 text-violet-300"
                      : "border-white/10 text-slate-500 hover:text-slate-300"}`}>
                  <span>{TYPE_ICONS[chart.type] || "📊"}</span>
                  {chart.type.charAt(0).toUpperCase() + chart.type.slice(1)}
                  <span className="text-slate-600 max-w-[120px] truncate">— {chart.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Rendered charts grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {visibleCharts.map((chart) => (
              <ChartRenderer key={chart.id} chart={chart} />
            ))}
          </div>

          {visibleCharts.length === 0 && (
            <div className="card p-8 text-center text-slate-500 text-sm">
              No charts selected. Click the toggles above to display charts.
            </div>
          )}

          <div className="flex justify-end">
            <button className="btn-primary" onClick={() => navigate("/report")}>
              Continue to AI Report →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
