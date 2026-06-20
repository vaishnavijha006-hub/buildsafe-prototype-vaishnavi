import { ShieldCheck, ShieldAlert, Loader2, X } from "lucide-react";

export default function ArmorPayGate({ status, result, onClose }) {
  // status: 'checking' | 'result'
  return (
    <div className="fixed inset-0 bg-bitumen/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 chain-drop">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-steel/10 p-1.5 rounded-lg">
              <ShieldCheck size={18} className="text-steel" />
            </div>
            <div>
              <p className="font-display text-sm text-bitumen leading-none">ArmorPay</p>
              <p className="text-[10px] text-steel font-mono">Payment Policy Gate</p>
            </div>
          </div>
          {status === "result" && (
            <button onClick={onClose} className="text-steel hover:text-bitumen">
              <X size={18} />
            </button>
          )}
        </div>

        {status === "checking" && (
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 size={28} className="text-safety animate-spin" />
            <p className="text-sm text-steel font-mono">Running compliance checks…</p>
          </div>
        )}

        {status === "result" && result && (
          <div className="space-y-3">
            {result.checks.map((c) => (
              <div
                key={c.id}
                className={`flex items-start gap-2.5 p-3 rounded-xl border ${
                  c.pass ? "border-tarp/30 bg-tarp/5" : "border-rust/30 bg-rust/5"
                }`}
              >
                {c.pass ? (
                  <ShieldCheck size={16} className="text-tarp mt-0.5 shrink-0" />
                ) : (
                  <ShieldAlert size={16} className="text-rust mt-0.5 shrink-0" />
                )}
                <div>
                  <p className={`text-xs font-semibold ${c.pass ? "text-tarp" : "text-rust"}`}>
                    {c.label}
                  </p>
                  <p className="text-[11px] text-steel mt-0.5">{c.detail}</p>
                </div>
              </div>
            ))}

            <div
              className={`mt-2 rounded-xl p-3 text-center font-display text-xs ${
                result.allPass ? "bg-tarp text-white" : "bg-rust text-white"
              }`}
            >
              {result.allPass ? "✅ ALL POLICIES PASSED — RELEASING PAYOUT" : "🚫 POLICY VIOLATION — PAYOUT BLOCKED"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
