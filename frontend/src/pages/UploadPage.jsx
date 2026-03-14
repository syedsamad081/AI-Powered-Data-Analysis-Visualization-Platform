/**
 * UploadPage.jsx – Page 1: Dataset Upload
 * Drag-and-drop or click-to-browse file upload with animated preview.
 */
import React, { useState, useRef, useCallback } from "react";
import axios from "axios";
import DataTable from "../components/DataTable";
import Loader from "../components/Loader";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000";

export default function UploadPage() {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const inputRef = useRef();
  const navigate = useNavigate();

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    setError(null);
    setResult(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${API}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
      // Store in sessionStorage for cross-page use
      sessionStorage.setItem("upload_result", JSON.stringify(res.data));
    } catch (err) {
      setError(err.response?.data?.error || "Upload failed. Is the Flask server running?");
    } finally {
      setLoading(false);
    }
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  return (
    <div className="animate-fade-in">
      {loading && <Loader message="Uploading & parsing dataset…" />}

      {/* Page header */}
      <div className="page-header">
        <h1 className="page-title">
          <span className="text-gradient">Upload Dataset</span>
        </h1>
        <p className="page-subtitle">
          Upload a CSV, Excel, or DOCX file to begin. We'll instantly preview your data.
        </p>
      </div>

      {/* Upload zone */}
      <div
        id="upload-dropzone"
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`relative rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-300
          ${dragging
            ? "border-violet-500 bg-violet-500/10 shadow-glow-violet"
            : "border-white/15 hover:border-violet-500/50 hover:bg-white/3"}`}
      >
        <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls,.docx"
          className="hidden" onChange={(e) => handleFile(e.target.files[0])} />

        <div className="flex flex-col items-center gap-4">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl
            transition-all duration-300 ${dragging ? "bg-violet-500/20 scale-110" : "bg-white/5"}`}>
            📁
          </div>
          <div>
            <p className="text-white font-semibold text-lg mb-1">
              {dragging ? "Drop your file here!" : "Drag & drop your dataset"}
            </p>
            <p className="text-slate-400 text-sm">
              or <span className="text-violet-400 underline underline-offset-2">browse files</span>
            </p>
          </div>
          <div className="flex gap-2 mt-2">
            {[".CSV", ".XLSX", ".XLS", ".DOCX"].map((ext) => (
              <span key={ext} className="badge bg-white/8 text-slate-400 text-xs font-mono">{ext}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-8 space-y-6 animate-slide-up">
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat icon="📄" label="File" value={result.filename} />
            <Stat icon="🔢" label="Rows" value={result.rows.toLocaleString()} color="cyan" />
            <Stat icon="📋" label="Columns" value={result.cols} color="emerald" />
            <Stat icon="🏷️" label="Features" value={result.columns?.length || "—"} color="amber" />
          </div>

          {/* Preview table */}
          <DataTable
            rows={result.preview}
            columns={result.columns}
            dtypes={result.dtypes}
          />

          {/* Navigation */}
          <div className="flex justify-end">
            <button className="btn-primary" onClick={() => navigate("/profile")}>
              Continue to Data Profiling →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ icon, label, value, color = "violet" }) {
  const colorMap = {
    violet: "bg-violet-500/20 text-violet-400",
    cyan: "bg-cyan-500/20 text-cyan-400",
    emerald: "bg-emerald-500/20 text-emerald-400",
    amber: "bg-amber-500/20 text-amber-400",
  };
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0 ${colorMap[color]}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-semibold text-white truncate">{value}</p>
      </div>
    </div>
  );
}
