import { useState, useEffect } from "react";
import {
  ScanLine, CheckCircle2, MapPin, Clock, ShieldCheck, IndianRupee,
  Hash, ChevronDown, AlertTriangle, History, Briefcase,
} from "lucide-react";
import { buildWorkHistory } from "../lib/ledger";

export default function WorkerView({
  worker, workers, project, chain, onSwitchWorker,
  onScanComplete, onClaimWage, lastPayout, policyResult,
  onRaiseDispute, openDisputeForWorker,
}) {
  const [scanState, setScanState] = useState("idle");
  const [now, setNow] = useState(new Date());
  const [showHistory, setShowHistory] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [showDisputeForm, setShowDisputeForm] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const todayStr = now.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const handleScan = () => {
    setScanState("scanning");
    setTimeout(() => {
      setScanState("done");
      onScanComplete();
    }, 1600);
  };

  const todaysAttendance = chain.filter(
    (b) => b.type === "ATTENDANCE" && b.data.workerId === worker.id
  ).length;
  const alreadyMarked = todaysAttendance > 0;
  const history = buildWorkHistory(chain, worker.id);

  return (
    <div className="max-w-sm mx-auto">
      {/* Worker switcher */}
      <div className="relative mb-4">
        <button
          onClick={() => setShowSwitcher((s) => !s)}
          className="w-full flex items-center justify-between bg-white border border-bitumen/10 rounded-xl px-4 py-2.5 text-sm text-bitumen"
        >
          <span className="font-mono text-xs text-steel">Viewing as: <span className="text-bitumen font-medium">{worker.name}</span></span>
          <ChevronDown size={16} className="text-steel" />
        </button>
        {showSwitcher && (
          <div className="absolute z-30 top-full mt-1 w-full bg-white border border-bitumen/10 rounded-xl shadow-lg overflow-hidden chain-drop">
            {workers.map((w) => (
              <button
                key={w.id}
                onClick={() => { onSwitchWorker(w.id); setShowSwitcher(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-cement flex items-center justify-between ${
                  w.id === worker.id ? "bg-cement2" : ""
                }`}
              >
                <span>{w.name} <span className="text-steel text-xs">· {w.role}</span></span>
                {openDisputeForWorker?.(w.id) && (
                  <AlertTriangle size={13} className="text-rust" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Digital ID badge */}
      <div className="relative bg-bitumen text-cement rounded-2xl p-5 shadow-xl mb-5 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-safety" />
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[10px] tracking-[0.2em] text-safety font-mono uppercase mb-1">
              Digital Worker ID
            </p>
            <h2 className="font-display text-xl leading-tight">{worker.name}</h2>
            <p className="text-xs text-steel mt-0.5">{worker.role} · {project?.name}</p>
          </div>
          <div className="bg-tarp/20 border border-tarp rounded-lg p-1.5">
            <ShieldCheck size={20} className="text-tarpLight" />
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-white/10 pt-3">
          <span className="font-mono text-xs text-steel">{worker.id}</span>
          <span className="font-mono text-xs text-steel">₹{worker.dailyWage}/day</span>
        </div>
        <div className="absolute -bottom-2 left-0 right-0 flex justify-around px-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-cement" />
          ))}
        </div>
      </div>

      {/* Scan card */}
      <div className="bg-cement border-2 border-bitumen/10 rounded-2xl p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <p className="font-display text-sm text-bitumen">Today&apos;s Attendance</p>
          <span className="font-mono text-xs text-steel">{todayStr}</span>
        </div>

        {!alreadyMarked && scanState === "idle" && (
          <button
            onClick={handleScan}
            className="w-full bg-safety hover:bg-safetyDark transition-colors text-bitumen font-display text-sm py-4 rounded-xl flex items-center justify-center gap-2 shadow-md"
          >
            <ScanLine size={20} />
            SCAN QR TO MARK ATTENDANCE
          </button>
        )}

        {scanState === "scanning" && (
          <div className="w-full bg-bitumen text-cement py-6 rounded-xl flex flex-col items-center gap-2 scanline">
            <ScanLine size={28} className="text-safety scan-pulse" />
            <p className="font-mono text-xs text-steel">Verifying GPS + timestamp…</p>
          </div>
        )}

        {(scanState === "done" || alreadyMarked) && (
          <div className="w-full bg-tarp/10 border border-tarp text-tarp py-4 rounded-xl flex flex-col items-center gap-1.5">
            <CheckCircle2 size={24} />
            <p className="font-display text-xs">ATTENDANCE VERIFIED</p>
            <div className="flex items-center gap-3 mt-1 text-[11px] font-mono text-tarp/80">
              <span className="flex items-center gap-1"><Clock size={11} />{timeStr}</span>
              <span className="flex items-center gap-1"><MapPin size={11} />Site geo-fence OK</span>
            </div>
          </div>
        )}
      </div>

      {/* Wage claim */}
      {(scanState === "done" || alreadyMarked) && (
        <div className="bg-white border-2 border-bitumen/10 rounded-2xl p-5 mb-5 chain-drop">
          <p className="font-display text-sm text-bitumen mb-3">Wage Status</p>
          {!lastPayout ? (
            <button
              onClick={onClaimWage}
              className="w-full bg-tarp hover:bg-tarpLight transition-colors text-white font-display text-sm py-3.5 rounded-xl flex items-center justify-center gap-2"
            >
              <IndianRupee size={18} />
              RELEASE WAGE (₹{worker.dailyWage})
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-tarp text-sm font-medium">
                <CheckCircle2 size={16} /> ₹{lastPayout.amount} sent via UPI
              </div>
              <div className="bg-cement rounded-lg p-2.5 font-mono text-[11px] text-steel flex items-center gap-1.5">
                <Hash size={11} /> {lastPayout.txnId}
              </div>
              {policyResult && (
                <div className="flex items-center gap-1.5 text-[11px] text-tarp font-mono">
                  <ShieldCheck size={12} /> Verified by ArmorPay policy gate
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Dispute */}
      <div className="bg-white border-2 border-bitumen/10 rounded-2xl p-5 mb-5">
        <div className="flex items-center justify-between mb-2">
          <p className="font-display text-sm text-bitumen flex items-center gap-1.5">
            <AlertTriangle size={15} className="text-rust" /> Dispute
          </p>
          {!showDisputeForm && (
            <button
              onClick={() => setShowDisputeForm(true)}
              className="text-[11px] font-mono text-rust border border-rust/40 rounded-full px-3 py-1 hover:bg-rust/5"
            >
              Raise a dispute
            </button>
          )}
        </div>
        {showDisputeForm && (
          <div className="space-y-2 chain-drop">
            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="e.g. Worked on 18 June but wage was never released"
              className="w-full text-xs border border-bitumen/15 rounded-lg p-2.5 resize-none h-20 focus:outline-none focus:border-rust"
            />
            <button
              disabled={!disputeReason.trim()}
              onClick={() => {
                onRaiseDispute(disputeReason.trim());
                setDisputeReason("");
                setShowDisputeForm(false);
              }}
              className="w-full bg-rust disabled:opacity-40 text-white text-xs font-display py-2.5 rounded-lg"
            >
              SUBMIT DISPUTE TO LEDGER
            </button>
          </div>
        )}
        {!showDisputeForm && (
          <p className="text-[11px] text-steel">
            Disputes are written to the same immutable ledger — they can&apos;t be quietly buried.
          </p>
        )}
      </div>

      {/* Work history toggle */}
      <button
        onClick={() => setShowHistory((s) => !s)}
        className="w-full flex items-center justify-between bg-bitumen2/5 border border-bitumen/10 rounded-2xl px-5 py-3.5 text-sm text-bitumen"
      >
        <span className="flex items-center gap-2 font-display text-xs">
          <History size={15} /> Work history
        </span>
        <ChevronDown size={16} className={`text-steel transition-transform ${showHistory ? "rotate-180" : ""}`} />
      </button>

      {showHistory && (
        <div className="bg-white border-2 border-bitumen/10 rounded-2xl p-5 mt-3 chain-drop">
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center">
              <p className="font-display text-lg text-bitumen">{history.attendanceDays}</p>
              <p className="text-[10px] text-steel">Days verified</p>
            </div>
            <div className="text-center">
              <p className="font-display text-lg text-bitumen">₹{history.totalEarned}</p>
              <p className="text-[10px] text-steel">Total earned</p>
            </div>
            <div className="text-center">
              <p className="font-display text-lg text-bitumen">{history.disputesRaised}</p>
              <p className="text-[10px] text-steel">Disputes</p>
            </div>
          </div>
          <p className="text-[11px] text-steel flex items-center gap-1.5 border-t border-bitumen/10 pt-3">
            <Briefcase size={12} /> Portable across contractors — usable for loan applications and welfare scheme access.
          </p>
        </div>
      )}
    </div>
  );
}
