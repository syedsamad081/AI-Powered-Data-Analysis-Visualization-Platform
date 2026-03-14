/**
 * DataTable.jsx – Paginated data preview table with column type badges.
 */
import React, { useState } from "react";

const TYPE_COLORS = {
  int64: "bg-cyan-500/20 text-cyan-300",
  float64: "bg-emerald-500/20 text-emerald-300",
  object: "bg-amber-500/20 text-amber-300",
  bool: "bg-violet-500/20 text-violet-300",
  default: "bg-slate-500/20 text-slate-300",
};

export default function DataTable({ rows = [], columns = [], dtypes = {}, pageSize = 10 }) {
  const [page, setPage] = useState(0);
  if (!rows.length || !columns.length) return null;

  const totalPages = Math.ceil(rows.length / pageSize);
  const visible = rows.slice(page * pageSize, (page + 1) * pageSize);

  const typeColor = (col) => {
    const dtype = dtypes[col] || "";
    for (const [key, cls] of Object.entries(TYPE_COLORS)) {
      if (dtype.includes(key)) return cls;
    }
    return TYPE_COLORS.default;
  };

  return (
    <div className="card overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
        <span className="text-sm font-semibold text-white">
          Dataset Preview <span className="text-slate-500 font-normal text-xs ml-1">({rows.length} rows × {columns.length} cols)</span>
        </span>
        <div className="text-xs text-slate-500">
          Page {page + 1}/{totalPages}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col} className="whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    <span>{col}</span>
                    <span className={`badge text-[10px] font-mono ${typeColor(col)}`}>
                      {dtypes[col] || "—"}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row, idx) => (
              <tr key={idx}>
                {columns.map((col) => (
                  <td key={col} className="whitespace-nowrap max-w-[180px] truncate">
                    {row[col] === null || row[col] === undefined
                      ? <span className="text-red-400/70 italic">null</span>
                      : String(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-5 py-3 border-t border-white/8 flex items-center gap-2 justify-end">
          <button onClick={() => setPage(0)} disabled={page === 0}
            className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-30">«</button>
          <button onClick={() => setPage(p => p - 1)} disabled={page === 0}
            className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-30">‹</button>
          <span className="text-xs text-slate-500">{page + 1} / {totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages - 1}
            className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-30">›</button>
          <button onClick={() => setPage(totalPages - 1)} disabled={page === totalPages - 1}
            className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-30">»</button>
        </div>
      )}
    </div>
  );
}
