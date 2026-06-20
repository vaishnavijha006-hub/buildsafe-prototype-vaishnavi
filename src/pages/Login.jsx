import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { HardHat, LogIn, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to={user.role === "contractor" ? "/contractor" : "/worker"} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const session = await login(email, password);
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
            <h1 className="font-display text-xl text-bitumen mb-1">Sign in</h1>
            <p className="text-sm text-steel mb-6">Access your worker portal or contractor dashboard</p>

            {error && (
              <div className="flex items-center gap-2 bg-rust/10 border border-rust/30 text-rust text-sm rounded-lg px-3 py-2.5 mb-4">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="••••••••"
                  required
                  className="w-full text-sm border border-bitumen/15 rounded-lg p-2.5 focus:outline-none focus:border-safety"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-safety disabled:opacity-50 text-bitumen font-display text-sm py-3 rounded-lg"
              >
                <LogIn size={16} /> {submitting ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <p className="text-center text-sm text-steel mt-5">
              No account?{" "}
              <Link to="/signup" className="text-tarp font-medium hover:underline">
                Create one
              </Link>
            </p>
          </div>

          <div className="mt-5 bg-bitumen/5 border border-bitumen/10 rounded-xl p-4">
            <p className="text-[11px] font-mono text-steel mb-2">Demo accounts</p>
            <p className="text-xs text-bitumen">
              Contractor: <span className="font-mono">contractor@buildsafe.in</span> / demo123
            </p>
            <p className="text-xs text-bitumen mt-1">
              Worker: <span className="font-mono">ramesh@buildsafe.in</span> / demo123
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
