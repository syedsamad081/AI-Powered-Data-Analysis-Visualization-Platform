import { BrowserRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import UploadPage from "./pages/UploadPage";
import ProfilingPage from "./pages/ProfilingPage";
import CleaningPage from "./pages/CleaningPage";
import VisualizationPage from "./pages/VisualizationPage";
import ReportPage from "./pages/ReportPage";

const NAV_ITEMS = [
  { path: "/",          label: "Upload",        icon: "📁", step: 1 },
  { path: "/profile",   label: "Data Profile",  icon: "📊", step: 2 },
  { path: "/clean",     label: "Data Cleaning", icon: "🧹", step: 3 },
  { path: "/visualize", label: "Visualize",     icon: "📈", step: 4 },
  { path: "/report",    label: "AI Report",     icon: "🤖", step: 5 },
];

function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 w-64 flex flex-col border-r border-white/8 z-30"
      style={{ background: "rgba(7,11,20,0.95)", backdropFilter: "blur(20px)" }}>
      
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-lg shadow-glow-violet">
            ⚡
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">AI Data Platform</p>
            <p className="text-xs text-slate-500">Clean · Visualize · Report</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.path} to={item.path} end={item.path === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
               ${isActive
                 ? "bg-violet-600/20 border border-violet-500/30 text-violet-300"
                 : "text-slate-400 hover:text-slate-200 hover:bg-white/5"}`
            }>
            <span className="text-base">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            <span className="text-xs text-slate-600 group-hover:text-slate-400">{item.step}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/8">
        <p className="text-xs text-slate-600 text-center">
          Powered by <span className="text-violet-400">Gemini AI</span>
        </p>
      </div>
    </aside>
  );
}

function Layout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen">
        <div className="max-w-7xl mx-auto px-8 py-8 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/"          element={<UploadPage />} />
          <Route path="/profile"   element={<ProfilingPage />} />
          <Route path="/clean"     element={<CleaningPage />} />
          <Route path="/visualize" element={<VisualizationPage />} />
          <Route path="/report"    element={<ReportPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
