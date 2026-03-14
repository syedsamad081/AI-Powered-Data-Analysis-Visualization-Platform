/**
 * ChartRenderer.jsx
 * Displays a server-rendered chart image (base64 PNG from Seaborn/Matplotlib).
 * Also provides a PNG download button for each chart.
 */
import React from "react";

export default function ChartRenderer({ chart }) {
  const downloadPNG = () => {
    if (!chart.image) return;
    const a = document.createElement("a");
    a.href = chart.image;
    a.download = `${chart.id || "chart"}.png`;
    a.click();
  };

  return (
    <div className="card p-5 flex flex-col gap-4 animate-slide-up">
      {/* Card header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-white text-sm">{chart.title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{chart.description}</p>
        </div>
        <button onClick={downloadPNG}
          className="btn-secondary py-1.5 px-3 text-xs flex-shrink-0">
          ⬇ PNG
        </button>
      </div>

      {/* Chart image */}
      <div className="flex items-center justify-center min-h-[280px]">
        {chart.image ? (
          <img
            src={chart.image}
            alt={chart.title}
            className="max-w-full h-auto rounded-lg"
            style={{ maxHeight: 400 }}
          />
        ) : (
          <p className="text-slate-500 text-sm">No chart data available</p>
        )}
      </div>
    </div>
  );
}
