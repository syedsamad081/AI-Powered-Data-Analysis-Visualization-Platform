/**
 * StatsCard.jsx – Glassmorphic metric card for dashboard stats.
 */
import React from "react";

export default function StatsCard({ label, value, icon, color = "violet", sub }) {
  const colorMap = {
    violet: {
      icon: "bg-violet-500/20 text-violet-400",
      glow: "hover:shadow-glow-violet",
      border: "hover:border-violet-500/30",
    },
    cyan: {
      icon: "bg-cyan-500/20 text-cyan-400",
      glow: "hover:shadow-glow-cyan",
      border: "hover:border-cyan-500/30",
    },
    emerald: {
      icon: "bg-emerald-500/20 text-emerald-400",
      glow: "",
      border: "hover:border-emerald-500/30",
    },
    amber: {
      icon: "bg-amber-500/20 text-amber-400",
      glow: "",
      border: "hover:border-amber-500/30",
    },
    red: {
      icon: "bg-red-500/20 text-red-400",
      glow: "",
      border: "hover:border-red-500/30",
    },
  };

  const c = colorMap[color] || colorMap.violet;

  return (
    <div className={`card p-5 transition-all duration-300 border border-transparent ${c.glow} ${c.border} animate-slide-up`}>
      <div className="flex items-start gap-4">
        {icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${c.icon}`}>
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">{label}</p>
          <p className="text-2xl font-bold text-white leading-tight truncate">{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
      </div>
    </div>
  );
}
