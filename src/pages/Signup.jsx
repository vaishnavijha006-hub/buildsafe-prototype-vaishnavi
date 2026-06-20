import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import {
  HardHat,
  Building2,
  UserPlus,
  AlertCircle,
  ShieldCheck,
  QrCode,
  FileCheck,
  Wallet,
  Users,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { WORKERS, PROJECTS } from "../lib/seedData";
import { genWorkerId, appendOnboarding } from "../lib/ledger";
import { pushWorkerToNotion } from "../lib/notionClient";

const STATS = [
  { value: "50M+", label: "Workers" },
  { value: "92%", label: "Unorganized Workforce" },
  { value: "100%", label: "Transparent Records" },
];

const TRUST_BADGES = [
  { icon: ShieldCheck, label: "Blockchain Verified" },
  { icon: QrCode, label: "QR Attendance" },
  { icon: FileCheck, label: "Smart Contracts" },
  { icon: Wallet, label: "Wage Protection" },
];

export default function Signup() {
  const { signup, user, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("worker");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // New worker registration fields
  const [workerRole, setWorkerRole] = useState("Mason");
  const [phone, setPhone] = useState("");
  const [dailyWage, setDailyWage] = useState("500");
  const [projects] = useState(() => {
    try {
      const stored = localStorage.getItem("buildsafe_projects");
      return stored ? JSON.parse(stored) : PROJECTS;
    } catch {
      return PROJECTS;
    }
  });
  const [projectId, setProjectId] = useState(() => {
    return projects[0]?.id || "";
  });

  if (loading) return null;
  if (user) return <Navigate to={user.role === "contractor" ? "/contractor" : "/worker"} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      let generatedWorkerId = undefined;
      
      if (role === "worker") {
        generatedWorkerId = genWorkerId();
        
        const newWorker = {
          id: generatedWorkerId,
          name,
          role: workerRole,
          projectId,
          dailyWage: parseFloat(dailyWage) || 500,
          phone: phone || "—",
          joinedOn: new Date().toISOString().slice(0, 10),
        };
        
        // Save new worker profile in localStorage
        const storedWorkers = localStorage.getItem("buildsafe_workers");
        const workersList = storedWorkers ? JSON.parse(storedWorkers) : WORKERS;
        workersList.push(newWorker);
        localStorage.setItem("buildsafe_workers", JSON.stringify(workersList));
        
        // Create onboarding event in the ledger chain
        const storedChain = localStorage.getItem("buildsafe_chain");
        const chain = storedChain ? JSON.parse(storedChain) : [];
        const updatedChain = await appendOnboarding(chain, {
          workerId: generatedWorkerId,
          workerName: name,
          role: workerRole,
          projectId,
          dailyWage: parseFloat(dailyWage) || 500,
        });
        localStorage.setItem("buildsafe_chain", JSON.stringify(updatedChain));
        
        // Try syncing to Notion
        try {
          await pushWorkerToNotion(newWorker);
        } catch (err) {
          console.warn("[Notion Sync Failed]", err);
        }
      }

      const session = await signup({ name, email, password, role, workerId: generatedWorkerId });
      navigate(session.role === "contractor" ? "/contractor" : "/worker");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const roleOptions = [
    {
      value: "worker",
      icon: HardHat,
      title: "Worker",
      desc: "Track attendance and wages",
    },
    {
      value: "contractor",
      icon: Building2,
      title: "Contractor",
      desc: "Manage workers and payroll",
    },
  ];

  return (
    <div className="min-h-screen bg-cement2 lg:grid lg:grid-cols-2">
      {/* Left hero section */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#0F172A] p-10 text-cement lg:flex xl:p-14">
        <div className="scanline pointer-events-none absolute inset-0 opacity-40" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-safety/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-tarp/20 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-safety p-2.5 shadow-lg shadow-safety/20">
              <HardHat size={24} className="text-[#0F172A]" />
            </div>
            <div>
              <p className="font-display text-lg leading-none tracking-wide">BuildSafe</p>
              <p className="font-mono text-[11px] text-steel">Wage protection, on the chain</p>
            </div>
          </div>
        </div>

        <div className="relative max-w-lg">
          <h2 className="font-display text-4xl leading-[1.1] tracking-tight xl:text-5xl">
            Protecting Construction Workers From{" "}
            <span className="text-safety">Wage Theft</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-cement/70">
            Tamper-proof QR attendance and blockchain-backed wage records bring
            full transparency to every shift — so workers always get paid what
            they earned.
          </p>

          <div className="mt-9 grid grid-cols-3 gap-3">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
              >
                <p className="font-display text-2xl text-safety xl:text-3xl">{stat.value}</p>
                <p className="mt-1 text-[11px] font-medium leading-snug text-cement/60">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex flex-wrap gap-4 text-[11px] text-cement/50">
          <span className="flex items-center gap-1.5">
            <Users size={14} className="text-safety" /> Built for the field
          </span>
          <span className="flex items-center gap-1.5">
            <TrendingUp size={14} className="text-safety" /> Verifiable payouts
          </span>
        </div>
      </aside>

      {/* Right form section */}
      <main className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:min-h-0">
        <div className="w-full max-w-lg">
          {/* Mobile brand header */}
          <div className="mb-7 flex items-center gap-3 lg:hidden">
            <div className="rounded-xl bg-[#0F172A] p-2.5">
              <HardHat size={22} className="text-safety" />
            </div>
            <div>
              <p className="font-display text-lg leading-none text-bitumen">BuildSafe</p>
              <p className="font-mono text-[11px] text-steel">Wage protection, on the chain</p>
            </div>
          </div>

          <div className="chain-drop rounded-3xl border border-white/60 bg-white/80 p-7 shadow-xl shadow-bitumen/5 backdrop-blur-xl sm:p-9">
            <h1 className="font-display text-2xl tracking-tight text-bitumen sm:text-3xl">
              Create your account
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-steel">
              Register as a contractor or worker. New accounts sync to your
              Notion workspace automatically.
            </p>

            {error && (
              <div className="mt-5 flex items-center gap-2 rounded-xl border border-rust/30 bg-rust/10 px-3.5 py-3 text-sm text-rust">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-bitumen">
                  Full name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full rounded-xl border border-bitumen/15 bg-white/70 p-3 text-sm focus:border-safety focus:outline-none focus:ring-2 focus:ring-safety/30"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-bitumen">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-xl border border-bitumen/15 bg-white/70 p-3 text-sm focus:border-safety focus:outline-none focus:ring-2 focus:ring-safety/30"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-bitumen">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-bitumen/15 bg-white/70 p-3 text-sm focus:border-safety focus:outline-none focus:ring-2 focus:ring-safety/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-bitumen">
                  I am a…
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {roleOptions.map((opt) => {
                    const Icon = opt.icon;
                    const active = role === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setRole(opt.value)}
                        className={`group flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all ${
                          active
                            ? "border-safety bg-safety/10 shadow-md shadow-safety/10"
                            : "border-bitumen/15 bg-white/60 hover:border-safety/50 hover:bg-white"
                        }`}
                      >
                        <span
                          className={`rounded-xl p-2 transition-colors ${
                            active ? "bg-safety text-bitumen" : "bg-bitumen/5 text-steel group-hover:text-bitumen"
                          }`}
                        >
                          <Icon size={20} />
                        </span>
                        <span className="font-display text-sm text-bitumen">{opt.title}</span>
                        <span className="text-[11px] leading-snug text-steel">{opt.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {role === "worker" && (
                <div className="chain-drop rounded-2xl border border-bitumen/10 bg-cement/40 p-5">
                  <p className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-steel">
                    <HardHat size={14} className="text-safety" /> Worker Profile Details
                  </p>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-bitumen">
                        Work Role
                      </label>
                      <select
                        value={workerRole}
                        onChange={(e) => setWorkerRole(e.target.value)}
                        className="w-full rounded-xl border border-bitumen/15 bg-white p-3 text-sm focus:border-safety focus:outline-none focus:ring-2 focus:ring-safety/30"
                      >
                        <option value="Mason">Mason</option>
                        <option value="Helper">Helper</option>
                        <option value="Electrician">Electrician</option>
                        <option value="Welder">Welder</option>
                        <option value="Supervisor">Supervisor</option>
                        <option value="Carpenter">Carpenter</option>
                        <option value="Plumber">Plumber</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-bitumen">
                        Daily Wage (₹)
                      </label>
                      <input
                        type="number"
                        min="100"
                        max="5000"
                        value={dailyWage}
                        onChange={(e) => setDailyWage(e.target.value)}
                        required
                        className="w-full rounded-xl border border-bitumen/15 bg-white p-3 text-sm focus:border-safety focus:outline-none focus:ring-2 focus:ring-safety/30"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-bitumen">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="10-digit number"
                        required
                        pattern="[0-9]{10}"
                        className="w-full rounded-xl border border-bitumen/15 bg-white p-3 text-sm focus:border-safety focus:outline-none focus:ring-2 focus:ring-safety/30"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-bitumen">
                        Assigned Project
                      </label>
                      <select
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        className="w-full rounded-xl border border-bitumen/15 bg-white p-3 text-sm focus:border-safety focus:outline-none focus:ring-2 focus:ring-safety/30"
                      >
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-safety to-safetyDark py-3.5 font-display text-sm text-bitumen shadow-lg shadow-safety/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-safety/40 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <UserPlus size={16} /> {submitting ? "Creating account…" : "Create account"}
              </button>
            </form>

            <div className="mt-6 grid grid-cols-2 gap-2.5 border-t border-bitumen/10 pt-5 sm:grid-cols-4">
              {TRUST_BADGES.map((badge) => {
                const Icon = badge.icon;
                return (
                  <div
                    key={badge.label}
                    className="flex flex-col items-center gap-1.5 rounded-xl bg-bitumen/[0.03] p-2.5 text-center"
                  >
                    <Icon size={16} className="text-tarp" />
                    <span className="text-[10px] font-medium leading-tight text-steel">
                      {badge.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="mt-6 text-center text-sm text-steel">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-tarp hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
