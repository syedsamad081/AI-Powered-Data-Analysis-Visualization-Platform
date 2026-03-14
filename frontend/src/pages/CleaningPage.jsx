/**
 * CleaningPage.jsx – Page 3: Data Cleaning Panel
 * Toggle cleaning operations and apply them to the dataset.
 */
import React, { useState } from "react";
import axios from "axios";
import CleaningToggle from "../components/CleaningToggle";
import DataTable from "../components/DataTable";
import Loader from "../components/Loader";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000";

const OPERATIONS = [
  {
    id: "drop_duplicates",
    label: "Remove Duplicate Rows",
    description: "Drop all exact duplicate rows using pandas drop_duplicates().",
    icon: "🔁",
  },
  {
    id: "fill_missing_mean",
    label: "Fill Missing Values (Mean)",
    description: "Replace numeric nulls with the column mean. Use for normally distributed data.",
    icon: "📊",
  },
  {
    id: "fill_missing_median",
    label: "Fill Missing Values (Median)",
    description: "Replace numeric nulls with the column median. Robust to outliers.",
    icon: "📐",
  },
  {
    id: "fill_missing_mode",
    label: "Fill Missing Values (Mode)",
    description: "Replace nulls with the most frequent value. Good for categorical columns.",
    icon: "🏆",
  },
  {
    id: "remove_outliers_iqr",
    label: "Remove Outliers (IQR Method)",
    description: "Remove rows outside Q1-1.5×IQR and Q3+1.5×IQR fences.",
    icon: "📍",
  },
  {
    id: "drop_high_null_cols",
    label: "Drop High-Null Columns",
    description: "Remove columns where more than 50% of values are missing.",
    icon: "🗑️",
  },
  {
    id: "normalize_numeric",
    label: "Normalize Numeric Columns",
    description: "Min-max scale all numeric columns to [0, 1] using sklearn MinMaxScaler.",
    icon: "⚖️",
  },
  {
    id: "convert_dtypes",
    label: "Smart Type Conversion",
    description: "Auto-convert columns to the best possible dtype (pandas convert_dtypes).",
    icon: "🔄",
  },
];

export default function CleaningPage() {
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const toggleOp = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const applyClean = async () => {
    if (selected.length === 0) return;
    setError(null);
    setLoading(true);
    try {
      const res = await axios.post(`${API}/clean`, { operations: selected });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Cleaning failed. Upload a dataset first.");
    } finally {
      setLoading(false);
    }
  };

  const downloadCleaned = () => {
    window.open(`${API}/download-cleaned`, "_blank");
  };

  return (
    <div className="animate-fade-in">
      {loading && <Loader message="Applying cleaning operations…" />}

      <div className="page-header">
        <h1 className="page-title"><span className="text-gradient">Data Cleaning</span></h1>
        <p className="page-subtitle">Select the operations to apply, then click Apply Cleaning.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Operations panel */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Select Operations</p>
            <span className="badge bg-violet-500/20 text-violet-300 text-xs">
              {selected.length} selected
            </span>
          </div>
          {OPERATIONS.map((op) => (
            <CleaningToggle key={op.id} {...op}
              selected={selected.includes(op.id)}
              onToggle={toggleOp} />
          ))}
        </div>

        {/* Sidebar: apply + result */}
        <div className="space-y-4">
          <div className="card p-5 sticky top-6">
            <h3 className="text-sm font-semibold text-white mb-4">Apply Cleaning</h3>

            <div className="space-y-2 mb-5 min-h-[60px]">
              {selected.length === 0
                ? <p className="text-xs text-slate-500">No operations selected.</p>
                : selected.map((id) => {
                    const op = OPERATIONS.find((o) => o.id === id);
                    return (
                      <div key={id} className="flex items-center gap-2 text-xs text-slate-300">
                        <span>{op?.icon}</span> {op?.label}
                      </div>
                    );
                  })}
            </div>

            <button id="btn-apply-clean" onClick={applyClean}
              disabled={selected.length === 0 || loading}
              className="btn-primary w-full justify-center">
              ✨ Apply Cleaning
            </button>

            {result && (
              <div className="mt-4 space-y-3">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                  <p className="text-emerald-300 font-semibold mb-2">✅ Cleaning complete</p>
                  <div className="text-slate-400 space-y-1">
                    <p>Rows removed: <span className="text-white">{result.rows_removed}</span></p>
                    <p>Cols removed: <span className="text-white">{result.columns_removed?.length || 0}</span></p>
                    <p>New shape: <span className="text-white font-mono">
                      {result.cleaned_shape?.rows} × {result.cleaned_shape?.cols}
                    </span></p>
                  </div>
                </div>
                <button onClick={downloadCleaned} className="btn-cyan w-full justify-center text-xs">
                  ⬇ Download Cleaned CSV
                </button>
                <button onClick={() => navigate("/visualize")} className="btn-primary w-full justify-center text-xs">
                  Continue to Visualization →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cleaned preview */}
      {result?.preview && (
        <div className="mt-8 animate-slide-up">
          <h2 className="text-sm font-semibold text-white mb-3">Cleaned Dataset Preview</h2>
          <DataTable rows={result.preview} columns={Object.keys(result.preview[0] || {})} />
        </div>
      )}
    </div>
  );
}
