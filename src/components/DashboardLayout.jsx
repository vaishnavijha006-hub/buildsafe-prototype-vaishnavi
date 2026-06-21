import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HardHat, LayoutDashboard, Users, Landmark, ShieldCheck,
  LogOut, Bell, Search, Languages, GitBranch, X, Menu,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  {
    role: "worker",
    icon: HardHat,
    label: "Worker",
    description: "Attendance & earnings",
    path: "/worker",
  },
  {
    role: "contractor",
    icon: LayoutDashboard,
    label: "Contractor",
    description: "Payroll & sites",
    path: "/contractor",
  },
  {
    role: "builder",
    icon: Landmark,
    label: "Builder",
    description: "Master budget & rollup",
    path: "/builder",
  },
  {
    role: "regulator",
    icon: ShieldCheck,
    label: "Gov Audit",
    description: "Read-only compliance",
    path: "/regulator",
  },
];

const ROLE_LABELS = {
  worker: "Field Worker",
  contractor: "Site Contractor",
  builder: "Builder / Developer",
  regulator: "Labour Regulator",
};

export default function DashboardLayout({
  children,
  lang,
  toggleLang,
  LANG_LABELS,
  showBuildLog,
  setShowBuildLog,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const activePath = location.hash.replace("#", "") || "/";

  return (
    <div className="flex h-screen bg-dark overflow-hidden">
      {/* ── Sidebar ──────────────────────────────────── */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:relative z-50 flex flex-col w-64 h-full bg-surface border-r border-border transition-transform duration-200 shrink-0`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
          <div className="bg-primary p-1.5 rounded-lg shrink-0">
            <HardHat size={16} className="text-dark" />
          </div>
          <div>
            <p className="font-display text-sm text-white leading-none">BuildSafe</p>
            <p className="text-[10px] text-textMuted font-mono mt-0.5">Wage protection</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="text-[9px] font-mono text-textMuted uppercase tracking-widest px-2 mb-3">
            Workspaces
          </p>
          <div className="space-y-1">
            {NAV_ITEMS.filter((item) => item.role === user?.role || user?.role === "regulator" || user?.role === "builder").map(
              (item) => {
                // Show only own role for worker/contractor, all for builder/regulator
                if (
                  user?.role === "worker" && item.role !== "worker"
                ) return null;
                if (
                  user?.role === "contractor" && item.role !== "contractor"
                ) return null;

                const isActive = activePath === item.path;
                const Icon = item.icon;
                return (
                  <button
                    key={item.role}
                    onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                      isActive
                        ? "bg-primaryMuted border border-primary/30 text-primary"
                        : "text-textSecondary hover:bg-surface3 hover:text-white border border-transparent"
                    }`}
                  >
                    <Icon size={15} className={isActive ? "text-primary" : "text-textMuted"} />
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold ${isActive ? "text-primary" : "text-white"}`}>
                        {item.label}
                      </p>
                      <p className="text-[10px] text-textMuted truncate">{item.description}</p>
                    </div>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    )}
                  </button>
                );
              }
            )}
          </div>
        </nav>

        {/* User info at bottom */}
        <div className="px-3 py-4 border-t border-border">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-surface3">
            <div className="w-7 h-7 rounded-full bg-primaryMuted border border-primary/30 flex items-center justify-center shrink-0">
              <span className="text-[11px] font-bold text-primary">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-textMuted">{ROLE_LABELS[user?.role] || user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="text-textMuted hover:text-danger p-1 rounded transition-colors"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main column ─────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 py-3 bg-surface border-b border-border shrink-0">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-textMuted hover:text-white p-1 rounded"
          >
            <Menu size={18} />
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
            <input
              type="text"
              placeholder="Search workers, sites, tx..."
              className="w-full pl-8 pr-3 py-2 bg-surface3 border border-border rounded-lg text-xs text-white placeholder-textMuted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Language toggle */}
            <button
              onClick={toggleLang}
              title="Toggle Language"
              className="flex items-center gap-1.5 text-[11px] font-mono text-textSecondary hover:text-primary border border-border hover:border-primary/30 bg-surface3 rounded-lg px-2.5 py-1.5 transition-all"
            >
              <Languages size={12} />
              <span className="hidden sm:inline">{LANG_LABELS[lang]}</span>
            </button>

            {/* Build log */}
            <button
              onClick={() => setShowBuildLog(true)}
              title="Build Log"
              className="flex items-center gap-1.5 text-[11px] font-mono text-textSecondary hover:text-primary border border-border hover:border-primary/30 bg-surface3 rounded-lg px-2.5 py-1.5 transition-all"
            >
              <GitBranch size={12} className="text-primary" />
              <span className="hidden sm:inline">Log</span>
            </button>

            {/* Notification bell */}
            <button className="relative text-textMuted hover:text-white p-2 rounded-lg border border-border bg-surface3 transition-all">
              <Bell size={14} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-dark">
          {children}
        </main>
      </div>
    </div>
  );
}
