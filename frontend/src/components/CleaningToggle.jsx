/**
 * CleaningToggle.jsx – Toggle card for selecting a cleaning operation.
 */
import React from "react";

export default function CleaningToggle({ id, label, description, icon, selected, onToggle }) {
  return (
    <div
      id={`toggle-${id}`}
      className={`toggle-card ${selected ? "selected" : ""}`}
      onClick={() => onToggle(id)}
    >
      {/* Checkbox */}
      <div className={`w-5 h-5 mt-0.5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-all
        ${selected ? "bg-violet-500 border-violet-500" : "border-slate-600"}`}>
        {selected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>}
      </div>

      {/* Icon */}
      <div className="text-2xl flex-shrink-0">{icon}</div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold transition-colors ${selected ? "text-violet-300" : "text-slate-200"}`}>
          {label}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
    </div>
  );
}
