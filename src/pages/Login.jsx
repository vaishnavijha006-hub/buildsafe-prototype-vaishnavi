import { useState } from "react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { HardHat, LogIn, AlertCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, user, loading, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = location.state?.prefillEmail || "";
  const [email, setEmail] = useState(prefill);
  const [password, setPassword] = useState(prefill ? "demo123" : "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Forgot password flow states
  const [mode, setMode] = useState("login"); // "login" | "forgot" | "code"
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  if (loading) return null;
 if (user) return <Navigate to={`/${user.role}`} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const session = await login(email, password);
     navigate(`/${session.role}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setError("");
    setSubmitting(true);
    try {
      const session = await login(demoEmail, demoPassword);
      navigate(`/${session.role}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendCode = (e) => {
    e.preventDefault();
    setError("");
    if (!forgotEmail.trim()) {
      setError("Please enter a valid email address");
      return;
    }
    setMode("code");
  };

  const handleVerifyAndReset = async (e) => {
    e.preventDefault();
    setError("");
    if (resetCode !== "882194") {
      setError("Invalid verification code. Use demo code: 882194");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(forgotEmail, newPassword);
      // Auto sign-in
      const session = await login(forgotEmail, newPassword);
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
            {mode === "login" && (
              <>
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
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-medium text-bitumen">Password</label>
                      <button
                        type="button"
                        onClick={() => { setMode("forgot"); setError(""); }}
                        className="text-[11px] text-tarp font-medium hover:underline focus:outline-none"
                      >
                        Forgot password?
                      </button>
                    </div>
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
                    className="w-full flex items-center justify-center gap-2 bg-safety disabled:opacity-50 text-bitumen font-display text-sm py-3 rounded-lg hover:bg-safetyDark transition-colors hover:scale-[1.01] active:scale-[0.99] duration-150"
                  >
                    <LogIn size={16} /> {submitting ? "Signing in…" : "Sign in"}
                  </button>
                </form>

                <div className="mt-4 flex items-center gap-1.5 justify-center text-[10px] text-steel font-mono">
                  <ShieldCheck size={12} className="text-tarp" />
                  <span>Session secured by ArmorIQ™ Adaptive Auth</span>
                </div>

                <p className="text-center text-sm text-steel mt-5">
                  No account?{" "}
                  <Link to="/signup" className="text-tarp font-medium hover:underline">
                    Create one
                  </Link>
                </p>
              </>
            )}

            {mode === "forgot" && (
              <>
                <h1 className="font-display text-xl text-bitumen mb-1">Reset password</h1>
                <p className="text-sm text-steel mb-6">Enter your registered email address to receive a recovery code</p>

                {error && (
                  <div className="flex items-center gap-2 bg-rust/10 border border-rust/30 text-rust text-sm rounded-lg px-3 py-2.5 mb-4">
                    <AlertCircle size={16} /> {error}
                  </div>
                )}

                <form onSubmit={handleSendCode} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-bitumen mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full text-sm border border-bitumen/15 rounded-lg p-2.5 focus:outline-none focus:border-safety"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-safety text-bitumen font-display text-sm py-3 rounded-lg hover:bg-safetyDark transition-colors hover:scale-[1.01] active:scale-[0.99] duration-150"
                  >
                    Send Reset Code
                  </button>
                </form>

                <p className="text-center text-sm text-steel mt-5">
                  <button
                    type="button"
                    onClick={() => { setMode("login"); setError(""); }}
                    className="text-tarp font-medium hover:underline"
                  >
                    Back to Sign in
                  </button>
                </p>
              </>
            )}

            {mode === "code" && (
              <>
                <h1 className="font-display text-xl text-bitumen mb-1">Verify code</h1>
                <p className="text-sm text-steel mb-4">Enter the 6-digit recovery code sent to your email.</p>
                <div className="bg-tarp/5 border border-tarp/20 rounded-xl p-3 text-[11px] font-mono text-tarp text-center mb-5">
                  Demo Mode: verification code is <strong className="text-base select-all">882194</strong>
                </div>

                {error && (
                  <div className="flex items-center gap-2 bg-rust/10 border border-rust/30 text-rust text-sm rounded-lg px-3 py-2.5 mb-4">
                    <AlertCircle size={16} /> {error}
                  </div>
                )}

                <form onSubmit={handleVerifyAndReset} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-bitumen mb-1.5">Verification Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="e.g. 123456"
                      required
                      className="w-full text-center text-lg font-mono tracking-widest border border-bitumen/15 rounded-lg p-2.5 focus:outline-none focus:border-safety"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-bitumen mb-1.5">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      required
                      minLength={6}
                      className="w-full text-sm border border-bitumen/15 rounded-lg p-2.5 focus:outline-none focus:border-safety"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 bg-safety disabled:opacity-50 text-bitumen font-display text-sm py-3 rounded-lg hover:bg-safetyDark transition-colors hover:scale-[1.01] active:scale-[0.99] duration-150"
                  >
                    Reset & Sign In
                  </button>
                </form>

                <p className="text-center text-sm text-steel mt-5">
                  <button
                    type="button"
                    onClick={() => { setMode("login"); setError(""); }}
                    className="text-tarp font-medium hover:underline"
                  >
                    Back to Sign in
                  </button>
                </p>
              </>
            )}
          </div>

          <div className="mt-5 bg-white border border-bitumen/10 rounded-xl p-4 shadow-sm">
            <p className="text-[11px] font-mono text-steel mb-2.5 flex items-center justify-between">
              <span>QUICK DEMO LOGIN</span>
              <span className="text-[9px] bg-safety/20 text-bitumen px-1.5 py-0.5 rounded font-bold">ARMORIQ ENABLED</span>
            </p>
            <div className="space-y-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleQuickLogin("contractor@buildsafe.in", "demo123")}
                className="w-full flex items-center justify-between text-left text-xs bg-cement hover:bg-cement2 transition-all border border-bitumen/10 p-2.5 rounded-lg font-medium text-bitumen hover:scale-[1.01] active:scale-[0.99]"
              >
                <div>
                  <span className="font-semibold">Rajesh Sharma</span>
                  <p className="text-[10px] text-steel font-normal">Contractor (Sector-21 Metro)</p>
                </div>
                <span className="text-[10px] text-tarp font-mono font-bold">Sign In →</span>
              </button>
              
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleQuickLogin("ramesh@buildsafe.in", "demo123")}
                className="w-full flex items-center justify-between text-left text-xs bg-cement hover:bg-cement2 transition-all border border-bitumen/10 p-2.5 rounded-lg font-medium text-bitumen hover:scale-[1.01] active:scale-[0.99]"
              >
                <div>
                  <span className="font-semibold">Ramesh Kumar</span>
                  <p className="text-[10px] text-steel font-normal">Worker · Mason (₹650/day)</p>
                </div>
                <span className="text-[10px] text-tarp font-mono font-bold">Sign In →</span>
              </button>
              
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleQuickLogin("sunita@buildsafe.in", "demo123")}
                className="w-full flex items-center justify-between text-left text-xs bg-cement hover:bg-cement2 transition-all border border-bitumen/10 p-2.5 rounded-lg font-medium text-bitumen hover:scale-[1.01] active:scale-[0.99]"
              >
                <div>
                  <span className="font-semibold">Sunita Devi</span>
                  <p className="text-[10px] text-steel font-normal">Worker · Helper (₹480/day)</p>
                </div>
                <span className="text-[10px] text-tarp font-mono font-bold">Sign In →</span>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleQuickLogin("builder@buildsafe.in", "demo123")}
                className="w-full flex items-center justify-between text-left text-xs bg-cement hover:bg-cement2 transition-all border border-bitumen/10 p-2.5 rounded-lg font-medium text-bitumen hover:scale-[1.01] active:scale-[0.99]"
              >
                <div>
                  <span className="font-semibold">Amit Verma</span>
                  <p className="text-[10px] text-steel font-normal">Builder (Metro Operations)</p>
                </div>
                <span className="text-[10px] text-tarp font-mono font-bold">Sign In →</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
