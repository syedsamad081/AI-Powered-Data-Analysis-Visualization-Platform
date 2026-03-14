/**
 * ProfilingPage.jsx – Page 2: Dataset Profiling
 * Fetches /analyze and displays stats cards, missing value bars, dtype table.
 */
import React, { useState } from "react";
import axios from "axios";
import StatsCard from "../components/StatsCard";
import Loader from "../components/Loader";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000";

export default function ProfilingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  const runAnalysis = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await axios.post(`${API}/analyze`);
      setData(res.data);
      sessionStorage.setItem("profile_result", JSON.stringify(res.data));
    } catch (err) {
      setError(err.response?.data?.error || "Analysis failed. Upload a dataset first.");
    } finally {
      setLoading(false);
    }
  };

  const totalMissing = data
    ? Object.values(data.missing_values || {}).reduce((s, v) => s + v.count, 0)
    : 0;

  return (
    <div className="animate-fade-in">
      {loading && <Loader message="Profiling dataset…" />}

      <div className="page-header flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title"><span className="text-gradient">Data Profile</span></h1>
          <p className="page-subtitle">Automatic statistical analysis of your dataset.</p>
        </div>
        <button id="btn-analyze" className="btn-primary" onClick={runAnalysis} disabled={loading}>
          {loading ? "Analyzing…" : "▶ Run Analysis"}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
          ⚠️ {error}
        </div>
      )}

      {!data && !loading && (
        <div className="card p-16 text-center text-slate-500 text-sm">
          Click <strong className="text-slate-300">"Run Analysis"</strong> after uploading a dataset to view the profile.
        </div>
      )}

      {data && (
        <div className="space-y-8 animate-slide-up">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatsCard icon="🔢" label="Total Rows" value={data.rows?.toLocaleString()} color="violet" />
            <StatsCard icon="📋" label="Columns" value={data.cols} color="cyan" />
            <StatsCard icon="🔴" label="Missing Cells" value={totalMissing.toLocaleString()} color="red"
              sub={`across ${Object.values(data.missing_values || {}).filter(v => v.count > 0).length} columns`} />
            <StatsCard icon="🔁" label="Duplicates" value={data.duplicate_rows?.toLocaleString()} color="amber" />
            <StatsCard icon="📊" label="Numeric Cols" value={data.numeric_columns?.length} color="emerald" />
          </div>

          {/* Column Categories */}
          <div className="grid md:grid-cols-3 gap-4">
            <InfoCard title="🔢 Numeric" items={data.numeric_columns} color="cyan" />
            <InfoCard title="🏷️ Categorical" items={data.categorical_columns} color="amber" />
            <InfoCard title="📅 Datetime" items={data.datetime_columns} color="emerald" />
          </div>

          {/* Missing Values */}
          {Object.keys(data.missing_values || {}).length > 0 && (
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-white mb-4">Missing Values per Column</h2>
              <div className="space-y-3">
                {Object.entries(data.missing_values).map(([col, info]) => (
                  <div key={col} className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-mono w-36 truncate flex-shrink-0">{col}</span>
                    <div className="flex-1 progress-bar">
                      <div
                        className={`progress-fill ${info.pct > 50 ? "bg-red-500" : info.pct > 20 ? "bg-amber-500" : "bg-violet-500"}`}
                        style={{ width: `${info.pct}%` }}
                      />
                    </div>
                    <span className={`text-xs font-mono w-14 text-right flex-shrink-0
                      ${info.pct > 50 ? "text-red-400" : info.pct > 20 ? "text-amber-400" : "text-slate-400"}`}>
                      {info.pct}%
                    </span>
                    <span className="text-xs text-slate-600 w-16 text-right flex-shrink-0">
                      {info.count.toLocaleString()} cells
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Descriptive Statistics */}
          {Object.keys(data.describe || {}).length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-white/8">
                <h2 className="text-sm font-semibold text-white">Statistical Summary</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Statistic</th>
                      {Object.keys(data.describe).map((col) => <th key={col}>{col}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {["count", "mean", "std", "min", "25%", "50%", "75%", "max"].map((stat) => (
                      <tr key={stat}>
                        <td className="text-violet-300 font-semibold">{stat}</td>
                        {Object.values(data.describe).map((colStats, i) => (
                          <td key={i}>{colStats[stat] !== null && colStats[stat] !== undefined
                            ? Number(colStats[stat]).toLocaleString(undefined, { maximumFractionDigits: 4 })
                            : "—"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Navigate */}
          <div className="flex justify-end">
            <button className="btn-primary" onClick={() => navigate("/clean")}>
              Continue to Data Cleaning →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({ title, items = [], color }) {
  const colorMap = {
    cyan: "bg-cyan-500/20 text-cyan-300 border-cyan-500/20",
    amber: "bg-amber-500/20 text-amber-300 border-amber-500/20",
    emerald: "bg-emerald-500/20 text-emerald-300 border-emerald-500/20",
  };
  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold text-white mb-3">{title}</h3>
      {items.length === 0
        ? <p className="text-xs text-slate-600">None detected</p>
        : <div className="flex flex-wrap gap-1.5">
            {items.map((col) => (
              <span key={col} className={`badge text-xs border ${colorMap[color]}`}>{col}</span>
            ))}
          </div>
      }
    </div>
  );
}
