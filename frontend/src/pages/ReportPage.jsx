/**
 * ReportPage.jsx – Page 5: AI-Generated Report
 * Calls /generate-report, renders Markdown, and supports CSV/PDF/MD export.
 */
import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import Loader from "../components/Loader";

const API = "http://localhost:5000";

export default function ReportPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportMd, setReportMd] = useState(null);
  const [meta, setMeta] = useState(null);

  const generateReport = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await axios.post(`${API}/generate-report`);
      setReportMd(res.data.report);
      setMeta(res.data.profile_summary);
    } catch (err) {
      setError(err.response?.data?.error || "Report generation failed. Upload a dataset first.");
    } finally {
      setLoading(false);
    }
  };

  const exportMd = () => {
    const blob = new Blob([reportMd], { type: "text/markdown;charset=utf-8" });
    saveAs(blob, "ai_report.md");
  };

  const exportPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const lines = doc.splitTextToSize(
      reportMd.replace(/[#*`>_]/g, ""),
      doc.internal.pageSize.getWidth() - 80
    );
    doc.setFont("Helvetica");
    doc.setFontSize(10);
    let y = 40;
    lines.forEach((line) => {
      if (y > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage();
        y = 40;
      }
      doc.text(line, 40, y);
      y += 14;
    });
    doc.save("ai_report.pdf");
  };

  return (
    <div className="animate-fade-in">
      {loading && <Loader message="Gemini is generating your AI report…" />}

      <div className="page-header flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-title"><span className="text-gradient">AI Report</span></h1>
          <p className="page-subtitle">Gemini-powered structured analysis of your dataset.</p>
        </div>
        <button id="btn-generate-report" className="btn-primary" onClick={generateReport} disabled={loading}>
          {loading ? "Generating…" : "🤖 Generate AI Report"}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
          ⚠️ {error}
        </div>
      )}

      {!reportMd && !loading && (
        <div className="card p-16 text-center text-slate-500 text-sm">
          Click <strong className="text-slate-300">"Generate AI Report"</strong> to get a Gemini-powered analysis.
          <p className="mt-2 text-xs text-slate-600">
            Requires a valid <code className="text-slate-400">GEMINI_API_KEY</code> in <code className="text-slate-400">backend/.env</code>.
            Without it, a basic auto-generated report will be shown.
          </p>
        </div>
      )}

      {reportMd && (
        <div className="space-y-6 animate-slide-up">
          {/* Meta strip */}
          {meta && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                ["Rows", meta.rows?.toLocaleString(), "🔢", "violet"],
                ["Columns", meta.cols, "📋", "cyan"],
                ["Numeric", meta.numeric_columns?.length, "📊", "emerald"],
                ["Duplicates", meta.duplicate_rows, "🔁", "amber"],
              ].map(([label, value, icon, color]) => (
                <MetaChip key={label} icon={icon} label={label} value={value} color={color} />
              ))}
            </div>
          )}

          {/* Export buttons */}
          <div className="flex gap-3 flex-wrap">
            <button onClick={exportMd} className="btn-secondary text-sm">
              ⬇ Export Markdown
            </button>
            <button onClick={exportPdf} className="btn-secondary text-sm">
              ⬇ Export PDF
            </button>
            <a href={`${API}/download-cleaned`} target="_blank" rel="noreferrer" className="btn-cyan text-sm">
              ⬇ Download Cleaned CSV
            </a>
          </div>

          {/* Report content */}
          <div className="card p-8">
            <div className="prose prose-invert prose-sm max-w-none
              prose-headings:text-white prose-headings:font-bold
              prose-h1:text-2xl prose-h1:text-gradient prose-h1:border-b prose-h1:border-white/10 prose-h1:pb-3
              prose-h2:text-lg prose-h2:text-violet-300 prose-h2:mt-8
              prose-h3:text-base prose-h3:text-cyan-300
              prose-p:text-slate-300 prose-p:leading-relaxed
              prose-li:text-slate-300
              prose-strong:text-white
              prose-code:text-cyan-300 prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-blockquote:border-l-violet-500 prose-blockquote:text-slate-400
              prose-hr:border-white/10">
              <ReactMarkdown>{reportMd}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetaChip({ icon, label, value, color }) {
  const colorMap = {
    violet: "bg-violet-500/15 border-violet-500/20 text-violet-300",
    cyan: "bg-cyan-500/15 border-cyan-500/20 text-cyan-300",
    emerald: "bg-emerald-500/15 border-emerald-500/20 text-emerald-300",
    amber: "bg-amber-500/15 border-amber-500/20 text-amber-300",
  };
  return (
    <div className={`card p-4 flex items-center gap-3 border ${colorMap[color]}`}>
      <span className="text-lg">{icon}</span>
      <div>
        <p className="text-[10px] uppercase tracking-wider opacity-70">{label}</p>
        <p className="font-bold text-white text-lg leading-tight">{value ?? "—"}</p>
      </div>
    </div>
  );
}
