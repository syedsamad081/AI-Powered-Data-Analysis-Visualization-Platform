import React from "react";

/**
 * Loader.jsx – Full-screen or inline loading overlay
 */
export default function Loader({ message = "Processing…", inline = false }) {
  if (inline) {
    return (
      <div className="flex items-center gap-3 text-slate-400 text-sm py-4">
        <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        {message}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: "rgba(7,11,20,0.85)", backdropFilter: "blur(8px)" }}>
      <div className="card p-8 flex flex-col items-center gap-6 max-w-xs w-full text-center">
        {/* Spinning rings */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-violet-500/30 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-violet-500 rounded-full animate-spin" />
          <div className="absolute inset-2 border-4 border-t-cyan-400 rounded-full animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
        </div>
        <div>
          <p className="text-white font-semibold mb-1">{message}</p>
          <p className="text-slate-500 text-xs">This may take a moment…</p>
        </div>
      </div>
    </div>
  );
}
