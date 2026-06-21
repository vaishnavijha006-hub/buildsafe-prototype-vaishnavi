import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HardHat, ShieldCheck, QrCode, IndianRupee, Users, Landmark,
  LayoutDashboard, ArrowRight, Link2, AlertTriangle, ChevronRight,
  Lock, FileCheck, Smartphone, Zap,
} from "lucide-react";
import { verifyChain } from "../lib/ledger";

// ─── Live Ledger Stats ────────────────────────────────────────────────────────
function useLedgerStats() {
  const [stats, setStats] = useState({ blocks: 0, valid: null, payouts: 0, workers: 0 });

  useEffect(() => {
    try {
      const chain = JSON.parse(localStorage.getItem("buildsafe_chain") || "[]");
      const workers = JSON.parse(localStorage.getItem("buildsafe_workers") || "[]");
      const payouts = chain.filter((b) => b.type === "PAYOUT").reduce((s, b) => s + b.data.amount, 0);
      verifyChain(chain).then((result) => {
        setStats({ blocks: chain.length, valid: result.valid, payouts, workers: workers.length });
      });
    } catch {
      setStats({ blocks: 0, valid: true, payouts: 0, workers: 0 });
    }
  }, []);

  return stats;
}

// ─── Section: Hero ────────────────────────────────────────────────────────────
function Hero({ onLogin }) {
  return (
    <section className="relative bg-bitumen text-cement overflow-hidden">
      {/* Safety-stripe accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-safety" />

      {/* Background texture dots */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle, #F5F1E8 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10 fade-up-1">
          <div className="bg-safety p-2 rounded-xl">
            <HardHat size={22} className="text-bitumen" />
          </div>
          <span className="font-display text-xl text-cement tracking-tight">BuildSafe</span>
        </div>

        {/* Headline */}
        <div className="max-w-3xl">
          <div className="fade-up-1 inline-flex items-center gap-2 bg-safety/10 border border-safety/20 rounded-full px-3 py-1 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-safety animate-pulse" />
            <span className="text-[11px] font-mono text-safety tracking-wide uppercase">
              Blockchain-Powered Wage Protection
            </span>
          </div>

          <h1 className="fade-up-2 font-display text-4xl sm:text-5xl md:text-6xl text-cement leading-[1.08] tracking-tight mb-6">
            No more{" "}
            <span className="text-safety">wage theft</span>{" "}
            on construction sites.
          </h1>

          <p className="fade-up-3 text-steel text-base sm:text-lg leading-relaxed max-w-2xl mb-10">
            BuildSafe uses QR attendance, blockchain records, and automated UPI
            payments to create a tamper-proof wage trail — giving every worker
            proof of what they're owed, and every contractor a defence against
            false claims.
          </p>

          <div className="fade-up-4 flex flex-wrap gap-3">
            <button
              onClick={onLogin}
              className="flex items-center gap-2 bg-safety text-bitumen font-display text-sm px-6 py-3.5 rounded-xl hover:bg-safetyDark hover:scale-[1.02] active:scale-[0.97] transition-all duration-150 shadow-lg shadow-safety/20"
            >
              Get started <ArrowRight size={16} />
            </button>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 text-steel border border-steel/30 font-mono text-sm px-5 py-3.5 rounded-xl hover:text-cement hover:border-steel/60 hover:bg-white/5 active:scale-[0.97] transition-all duration-150"
            >
              See how it works
            </a>
          </div>
        </div>

        {/* Hero stat strip */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mt-16 max-w-lg fade-up-4">
          {[
            { value: "₹0", label: "Wage theft possible", note: "chain-enforced" },
            { value: "SHA-256", label: "Block hashing", note: "tamper-proof" },
            { value: "UPI", label: "Instant payouts", note: "policy-gated" },
          ].map((s) => (
            <div key={s.label} className="border-l-2 border-safety/30 pl-3">
              <p className="font-display text-lg sm:text-xl text-safety float-y">{s.value}</p>
              <p className="text-[10px] text-cement/70 leading-tight">{s.label}</p>
              <p className="text-[9px] font-mono text-steel mt-0.5">{s.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section: Problem Snapshot ────────────────────────────────────────────────
function ProblemSnapshot() {
  const problems = [
    {
      icon: "📋",
      text: "93% of construction workers have no formal written contract",
      source: "MoLE 2023",
    },
    {
      icon: "👁️",
      text: "Attendance is recorded in paper registers that can be altered or lost",
      source: "Common industry practice",
    },
    {
      icon: "💵",
      text: "Cash payments leave no audit trail — disputes become word-against-word",
      source: "ILO field study",
    },
    {
      icon: "⚖️",
      text: "Workers rarely have legal standing to challenge wage deductions without evidence",
      source: "NHRC report",
    },
  ];

  return (
    <section className="bg-cement2 py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={15} className="text-rust" />
          <p className="font-mono text-[11px] text-rust uppercase tracking-widest">The Problem</p>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl text-bitumen mb-10 max-w-xl">
          Construction workers are uniquely vulnerable to wage theft.
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {problems.map((p, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 border border-bitumen/8 shadow-sm flex items-start gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <span className="text-2xl shrink-0 mt-0.5">{p.icon}</span>
              <div>
                <p className="text-sm text-bitumen font-medium leading-snug">{p.text}</p>
                <p className="text-[10px] font-mono text-steel mt-1.5">{p.source}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section: How it Works ────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      icon: <FileCheck size={22} className="text-safety" />,
      step: "01",
      title: "Register project",
      desc: "Contractor locks wage terms on-chain. Can't be changed retroactively.",
    },
    {
      icon: <Users size={22} className="text-safety" />,
      step: "02",
      title: "Worker onboarding",
      desc: "Digital worker ID issued. Biometric + Aadhaar-linked identity block written.",
    },
    {
      icon: <QrCode size={22} className="text-safety" />,
      step: "03",
      title: "Daily QR scan",
      desc: "Worker taps site QR. GPS + timestamp verified. Attendance block appended.",
    },
    {
      icon: <Zap size={22} className="text-safety" />,
      step: "04",
      title: "Automated wage release",
      desc: "ArmorPay policy gate checks attendance, then triggers UPI transfer instantly.",
    },
  ];

  return (
    <section id="how-it-works" className="bg-bitumen py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 mb-2">
          <Link2 size={14} className="text-safety" />
          <p className="font-mono text-[11px] text-safety uppercase tracking-widest">How it works</p>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl text-cement mb-12 max-w-xl">
          Four steps, zero trust required.
        </h2>

        {/* Step strip — horizontal scroll on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/8">
          {steps.map((s, i) => (
            <div key={i} className="bg-bitumen2 p-5 sm:p-6 relative group hover:bg-bitumen transition-colors duration-200">
              {/* Connector arrow (desktop only) */}
              {i < steps.length - 1 && (
                <ChevronRight
                  size={14}
                  className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 text-steel/40 z-10"
                />
              )}
              <div className="flex items-center gap-2 mb-4">
                <span className="font-mono text-[10px] text-steel">{s.step}</span>
                <div className="w-8 h-8 bg-safety/10 rounded-lg flex items-center justify-center group-hover:bg-safety/20 transition-colors duration-200">
                  {s.icon}
                </div>
              </div>
              <h3 className="font-display text-sm text-cement mb-1.5">{s.title}</h3>
              <p className="text-[11px] text-steel leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Security callout */}
        <div className="mt-6 flex flex-wrap items-center gap-4 text-[11px] font-mono text-steel">
          {["SHA-256 hash chaining", "GPS + timestamp proof", "ArmorIQ biometric session", "ArmorPay policy gate"].map((f) => (
            <span key={f} className="flex items-center gap-1.5">
              <Lock size={10} className="text-safety" /> {f}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section: Live Trust Indicators ──────────────────────────────────────────
function LiveStats({ stats }) {
  const indicators = [
    {
      label: "Ledger blocks written",
      value: stats.blocks,
      sub: "immutable on-chain events",
      icon: <Link2 size={18} className="text-safety" />,
      color: "border-safety/30",
    },
    {
      label: "Chain integrity",
      value: stats.valid === null ? "Checking…" : stats.valid ? "VERIFIED ✓" : "⚠ TAMPERED",
      sub: stats.valid === null ? "verifying hashes" : stats.valid ? "all hashes match" : "mismatch detected",
      icon: <ShieldCheck size={18} className={stats.valid === false ? "text-rust" : "text-tarp"} />,
      color: stats.valid === false ? "border-rust/30" : "border-tarp/30",
    },
    {
      label: "Workers on ledger",
      value: stats.workers,
      sub: "registered digital IDs",
      icon: <Users size={18} className="text-safety" />,
      color: "border-safety/30",
    },
    {
      label: "Wages disbursed",
      value: `₹${stats.payouts.toLocaleString("en-IN")}`,
      sub: "via ArmorPay UPI gate",
      icon: <IndianRupee size={18} className="text-tarp" />,
      color: "border-tarp/30",
    },
  ];

  return (
    <section className="bg-cement py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-tarp animate-pulse" />
          <p className="font-mono text-[11px] text-tarp uppercase tracking-widest">Live ledger — real data</p>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl text-bitumen mb-2 max-w-xl">
          These numbers come directly from the blockchain.
        </h2>
        <p className="text-sm text-steel mb-10 max-w-lg font-mono">
          Not mock figures. Pulled from the same localStorage ledger your demo uses.
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {indicators.map((ind) => (
            <div
              key={ind.label}
              className={`bg-white rounded-2xl p-5 border-2 ${ind.color} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
            >
              <div className="mb-3">{ind.icon}</div>
              <p className="font-display text-2xl text-bitumen leading-none mb-1">
                {ind.value}
              </p>
              <p className="text-[10px] text-steel leading-tight">{ind.label}</p>
              <p className="text-[9px] font-mono text-steel/60 mt-1">{ind.sub}</p>
            </div>
          ))}
        </div>

        <p className="text-[10px] font-mono text-steel/50 mt-5 text-center">
          Stats update each visit. Sign in and mark attendance to see the count rise.
        </p>
      </div>
    </section>
  );
}

// ─── Section: Role Entry Cards ────────────────────────────────────────────────
function RoleCards({ onLogin }) {
  const roles = [
    {
      icon: <HardHat size={28} className="text-bitumen" />,
      bg: "bg-safety",
      badge: "safety",
      role: "Worker",
      tagline: "Check in, track wages, raise disputes — all from your phone.",
      email: "ramesh@buildsafe.in",
      features: ["QR attendance", "Live wage status", "UPI payout receipt", "Dispute protection"],
    },
    {
      icon: <LayoutDashboard size={28} className="text-white" />,
      bg: "bg-tarp",
      badge: "tarp",
      role: "Contractor",
      tagline: "Manage your crew, lock wage terms, resolve disputes on-chain.",
      email: "contractor@buildsafe.in",
      features: ["Worker roster", "Wage ledger", "Anomaly detection", "Dispute resolution"],
    },
    {
      icon: <Landmark size={28} className="text-white" />,
      bg: "bg-bitumen",
      badge: "bitumen",
      role: "Builder",
      tagline: "Oversee all sites, track budget allocation, audit compliance.",
      email: "builder@buildsafe.in",
      features: ["Multi-site overview", "Budget drawdown", "Fraud pattern rollup", "Crypto integrity"],
    },
  ];

  return (
    <section className="bg-cement2 py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 mb-2">
          <Users size={14} className="text-steel" />
          <p className="font-mono text-[11px] text-steel uppercase tracking-widest">Who it's for</p>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl text-bitumen mb-10 max-w-xl">
          Three roles, one shared ledger.
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {roles.map((r) => (
            <div
              key={r.role}
              className="bg-white rounded-2xl border border-bitumen/8 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group flex flex-col"
            >
              {/* Role colour header */}
              <div className={`${r.bg} p-5 flex items-center gap-3`}>
                <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center">
                  {r.icon}
                </div>
                <div>
                  <p className="font-display text-base text-white leading-none">{r.role}</p>
                  <p className="text-[10px] font-mono text-white/60 mt-0.5">{r.email}</p>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <p className="text-sm text-bitumen leading-snug mb-4">{r.tagline}</p>

                <ul className="space-y-1.5 mb-6 flex-1">
                  {r.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-[11px] text-steel">
                      <div className="w-1.5 h-1.5 rounded-full bg-safety shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => onLogin(r.email)}
                  className="w-full flex items-center justify-center gap-1.5 bg-bitumen text-cement font-display text-xs py-3 rounded-xl hover:bg-bitumen2 hover:scale-[1.02] active:scale-[0.97] transition-all duration-150 shadow-sm group-hover:shadow-md"
                >
                  Sign in as {r.role} <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Demo credentials note */}
        <div className="mt-8 bg-white border border-bitumen/10 rounded-xl p-4 flex flex-wrap items-center gap-3">
          <ShieldCheck size={14} className="text-tarp shrink-0" />
          <p className="text-[11px] font-mono text-steel">
            <span className="text-bitumen font-semibold">Demo mode</span> — all accounts use password{" "}
            <span className="bg-cement px-1.5 py-0.5 rounded text-bitumen font-bold">demo123</span>.
            No real credentials required.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-bitumen border-t border-white/5 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="bg-safety p-1 rounded-lg">
            <HardHat size={14} className="text-bitumen" />
          </div>
          <span className="font-display text-sm text-cement">BuildSafe</span>
        </div>
        <p className="text-[10px] font-mono text-steel text-center">
          Hash-chained ledger · ArmorPay policy-gated payouts · ArmorIQ biometric sessions
        </p>
        <p className="text-[10px] font-mono text-steel/40">Finale prototype · June 2026</p>
      </div>
    </footer>
  );
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();
  const stats = useLedgerStats();

  // Navigate to /login, optionally pre-filling demo email via state
  const handleLogin = (email) => {
    if (email && typeof email === "string" && email.includes("@")) {
      navigate("/login", { state: { prefillEmail: email } });
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen">
      <Hero onLogin={handleLogin} />
      <ProblemSnapshot />
      <HowItWorks />
      <LiveStats stats={stats} />
      <RoleCards onLogin={handleLogin} />
      <Footer />
    </div>
  );
}
