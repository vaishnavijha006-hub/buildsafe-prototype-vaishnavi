import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { HardHat, UserPlus, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { WORKERS, PROJECTS } from "../lib/seedData";
import { genWorkerId, appendOnboarding } from "../lib/ledger";
import { syncWorkerRoster } from "../lib/syncStore";

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
        
        // Try syncing to local storage
        try {
          await syncWorkerRoster(newWorker);
        } catch (err) {
          console.warn("[Local Sync Failed]", err);
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

  return (
    <div className="min-h-screen bg-cement2 flex flex-col">
      <header className="bg-bitumen text-cement px-4 py-4">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <div className="bg-safety p-1.5 rounded-lg">
            <HardHat size={18} className="text-bitumen" />
          </div>
          <div>
            <p className="font-display text-base leading-none">BuildSafe</p>
            <p className="text-[10px] text-steel font-mono">Wage protection, on the chain</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border-2 border-bitumen/10 p-7 shadow-sm chain-drop">
            <h1 className="font-display text-xl text-bitumen mb-1">Create account</h1>
            <p className="text-sm text-steel mb-6">
              Register as a contractor or worker. New accounts sync to your local storage record.
            </p>

            {error && (
              <div className="flex items-center gap-2 bg-rust/10 border border-rust/30 text-rust text-sm rounded-lg px-3 py-2.5 mb-4">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-bitumen mb-1.5">Full name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full text-sm border border-bitumen/15 rounded-lg p-2.5 focus:outline-none focus:border-safety"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-bitumen mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full text-sm border border-bitumen/15 rounded-lg p-2.5 focus:outline-none focus:border-safety"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-bitumen mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                  className="w-full text-sm border border-bitumen/15 rounded-lg p-2.5 focus:outline-none focus:border-safety"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-bitumen mb-1.5">I am a…</label>
                <div className="flex gap-2">
                  {["worker", "contractor", "builder"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`flex-1 py-2.5 rounded-lg text-xs font-medium border capitalize ${
                        role === r
                          ? "bg-bitumen text-cement border-bitumen"
                          : "bg-white text-steel border-bitumen/15"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {role === "worker" && (
                <div className="space-y-4 border-t border-bitumen/5 pt-4 mt-2">
                  <p className="text-[11px] font-mono text-steel uppercase tracking-wider">Worker Profile Details</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-bitumen mb-1.5">Work Role</label>
                      <select
                        value={workerRole}
                        onChange={(e) => setWorkerRole(e.target.value)}
                        className="w-full text-sm border border-bitumen/15 rounded-lg p-2.5 focus:outline-none focus:border-safety bg-white"
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
                      <label className="block text-xs font-medium text-bitumen mb-1.5">Daily Wage (₹)</label>
                      <input
                        type="number"
                        min="100"
                        max="5000"
                        value={dailyWage}
                        onChange={(e) => setDailyWage(e.target.value)}
                        required
                        className="w-full text-sm border border-bitumen/15 rounded-lg p-2.5 focus:outline-none focus:border-safety"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-bitumen mb-1.5">Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="10-digit number"
                        required
                        pattern="[0-9]{10}"
                        className="w-full text-sm border border-bitumen/15 rounded-lg p-2.5 focus:outline-none focus:border-safety"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-bitumen mb-1.5">Assigned Project</label>
                      <select
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        className="w-full text-sm border border-bitumen/15 rounded-lg p-2.5 focus:outline-none focus:border-safety bg-white"
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
                className="w-full flex items-center justify-center gap-2 bg-tarp disabled:opacity-50 text-white font-display text-sm py-3 rounded-lg"
              >
                <UserPlus size={16} /> {submitting ? "Creating account…" : "Create account"}
              </button>
            </form>

            <p className="text-center text-sm text-steel mt-5">
              Already have an account?{" "}
              <Link to="/login" className="text-tarp font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
