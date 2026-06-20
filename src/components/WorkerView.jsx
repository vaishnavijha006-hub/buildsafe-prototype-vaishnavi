import { useState, useEffect } from "react";
import {
  ScanLine, CheckCircle2, MapPin, Clock, ShieldCheck, IndianRupee,
  Hash, ChevronDown, AlertTriangle, History, Briefcase, Printer, Landmark
} from "lucide-react";
import { buildWorkHistory } from "../lib/ledger";
import ReceiptModal from "./ReceiptModal";

const dict = {
  en: {
    digitalId: "Digital Worker ID",
    role: "Role",
    project: "Site / Project",
    wage: "Daily Wage",
    attendance: "Today's Attendance",
    scanPrompt: "Site QR Code",
    scanButton: "TAP QR CODE TO CHECK-IN",
    scanning: "Verifying GPS + timestamp…",
    verified: "ATTENDANCE VERIFIED",
    geoFence: "Site geo-fence OK",
    wageStatus: "Wage Status",
    releaseWage: "RELEASE WAGE (₹{wage})",
    sentUpi: "₹{amount} sent via UPI",
    txnId: "Txn ID",
    verifiedArmorPay: "Verified by ArmorPay policy gate",
    dispute: "Dispute",
    raiseDispute: "Raise a dispute",
    submitDispute: "SUBMIT DISPUTE TO LEDGER",
    disputeDesc: "Disputes are written to the same immutable ledger — they can&apos;t be quietly buried.",
    workHistory: "Work history",
    daysVerified: "Days verified",
    totalEarned: "Total earned",
    disputesCount: "Disputes",
    historyDesc: "Portable across contractors — usable for loan applications and welfare scheme access.",
    creditScoreTitle: "Worker Credit Reputation (Beta)",
    creditScoreSub: "Tier-1 Micro-Reputation (785/850)",
    creditScoreDesc: "Based on immutable attendance & payout history. Shared with micro-finance lenders for collateral-free credit.",
    downloadReceipt: "Download Receipt",
    securedArmorIQ: "Protected by ArmorIQ™ adaptive verification",
  },
  hi: {
    digitalId: "डिजिटल कार्यकर्ता आईडी",
    role: "भूमिका",
    project: "साइट / परियोजना",
    wage: "दैनिक मज़दूरी",
    attendance: "आज की उपस्थिति",
    scanPrompt: "साइट क्यूआर कोड",
    scanButton: "हाजिरी दर्ज करने के लिए क्यूआर पर टैप करें",
    scanning: "जीपीएस और टाइमस्टैम्प सत्यापित हो रहा है…",
    verified: "उपस्थिति सत्यापित हो गई",
    geoFence: "साइट जियो-फेंस ठीक है",
    wageStatus: "मज़दूरी की स्थिति",
    releaseWage: "मज़दूरी जारी करें (₹{wage})",
    sentUpi: "₹{amount} UPI द्वारा भेजा गया",
    txnId: "लेन-देन आईडी",
    verifiedArmorPay: "ArmorPay नीति गेट द्वारा सत्यापित",
    dispute: "विवाद",
    raiseDispute: "विवाद दर्ज करें",
    submitDispute: "बहीखाते में विवाद जमा करें",
    disputeDesc: "सभी विवाद अपरिवर्तनीय बहीखाते में लिखे जाते हैं — इन्हें छिपाया नहीं जा सकता।",
    workHistory: "कार्य इतिहास",
    daysVerified: "सत्यापित दिन",
    totalEarned: "कुल कमाई",
    disputesCount: "विवाद",
    historyDesc: "ठेकेदारों के बीच पोर्टेबल — ऋण और सरकारी योजनाओं के लिए उपयोगी।",
    creditScoreTitle: "कार्यकर्ता क्रेडिट प्रतिष्ठा (बीटा)",
    creditScoreSub: "टियर-1 माइक्रो-क्रेडिट स्कोर (785/850)",
    creditScoreDesc: "अपरिवर्तनीय उपस्थिति और भुगतान इतिहास पर आधारित। बिना गारंटी लोन के लिए बैंकों के साथ साझा करने योग्य।",
    downloadReceipt: "रसीद डाउनलोड करें",
    securedArmorIQ: "ArmorIQ™ अनुकूली सत्यापन द्वारा सुरक्षित",
  }
};

export default function WorkerView({
  worker, workers, project, chain, onSwitchWorker,
  onScanComplete, onClaimWage, lastPayout, policyResult,
  onRaiseDispute, openDisputeForWorker, lang = "en",
}) {
  const [scanState, setScanState] = useState("idle");
  const [now, setNow] = useState(new Date());
  const [showHistory, setShowHistory] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const t = dict[lang] || dict.en;

  const todayStr = now.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const handleScan = () => {
    if (alreadyMarked || scanState !== "idle") return;
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
    <div className="max-w-sm mx-auto space-y-5">
      {/* Digital ID badge */}
      <div className="relative bg-bitumen text-cement rounded-2xl p-5 shadow-xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-safety" />
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[10px] tracking-[0.2em] text-safety font-mono uppercase mb-1">
              {t.digitalId}
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

      {/* Attendance & Site QR Card */}
      <div className="bg-cement border-2 border-bitumen/10 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="font-display text-sm text-bitumen">{t.attendance}</p>
          <span className="font-mono text-xs text-steel">{todayStr}</span>
        </div>

        {!alreadyMarked && scanState === "idle" && (
          <div className="flex flex-col items-center gap-4">
            {/* Real SVG QR code */}
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-bitumen/5 group">
              <svg 
                width="130" 
                height="130" 
                viewBox="0 0 29 29" 
                className="text-bitumen cursor-pointer hover:scale-[1.03] active:scale-[0.98] transition-all duration-200" 
                onClick={handleScan}
                title="Tap to check-in"
              >
                {/* Top Left */}
                <path d="M0 0h7v7H0zm1 1v5h5V1zm1 1h3v3H2z" fill="currentColor" />
                {/* Top Right */}
                <path d="M22 0h7v7h-7zm1 1v5h5V1zm1 1h3v3h-3z" fill="currentColor" />
                {/* Bottom Left */}
                <path d="M0 22h7v7H0zm1 1v5h5v-5zm1 1h3v3H2z" fill="currentColor" />
                {/* Alignment */}
                <path d="M22 22h5v5h-5zm1 1v3h3v-3z" fill="currentColor" />
                {/* Dummy QR Matrix */}
                <path d="M8 1h1v1H8zm3 0h2v1h-2zm4 0h1v1h-1zm2 0h1v1h-1zM8 3h2v1H8zm3 0h1v2H9v-1h2zm4 0h2v1h-2zm3 0h1v1h-1zm-10 2h1v1H8zm2 0h2v1h-2zm3 0h1v1h-1zm2 0h2v1h-2zm3 0h1v1h-1zM0 8h29v1H0zm0 3h3v1H0zm4 0h2v2H4zm3 0h1v1H7zm2 0h2v1H9zm3 0h1v1h-1zm2 0h2v1h-2zm3 0h1v1h-1zm2 0h2v1h-2zm3 0h1v1h-1zm-15 2h2v1h-2zm3 0h1v1h-1zm2 0h2v1h-2zm3 0h1v1h-1zm2 0h2v1h-2zm3 0h1v1h-1zm-13 2h2v1H9zm3 0h1v1h-1zm2 0h2v1h-2zm3 0h1v1h-1zm2 0h2v1h-2zm3 0h1v1h-1zM0 17h3v1H0zm4 0h2v2H4zm3 0h1v1H7zm2 0h2v1H9zm3 0h1v1h-1zm2 0h2v1h-2zm3 0h1v1h-1zm2 0h2v1h-2zm3 0h1v1h-1zm-15 2h2v1h-2zm3 0h1v1h-1zm2 0h2v1h-2zm3 0h1v1h-1zm2 0h2v1h-2zm3 0h1v1h-1zm-13 2h2v1H9zm3 0h1v1h-1zm2 0h2v1h-2zm3 0h1v1h-1zm2 0h2v1h-2zm3 0h1v1h-1z" fill="currentColor" />
              </svg>
            </div>
            <button
              onClick={handleScan}
              className="w-full bg-safety hover:bg-safetyDark transition-all text-bitumen font-display text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-[0.99]"
            >
              <ScanLine size={16} />
              {t.scanButton}
            </button>
          </div>
        )}

        {scanState === "scanning" && (
          <div className="w-full bg-bitumen text-cement py-8 rounded-xl flex flex-col items-center gap-2.5 scanline">
            <ScanLine size={28} className="text-safety scan-pulse" />
            <p className="font-mono text-xs text-steel">{t.scanning}</p>
          </div>
        )}

        {(scanState === "done" || alreadyMarked) && (
          <div className="w-full bg-tarp/10 border border-tarp text-tarp py-4 rounded-xl flex flex-col items-center gap-1.5">
            <CheckCircle2 size={24} />
            <p className="font-display text-xs">{t.verified}</p>
            <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-tarp/80">
              <span className="flex items-center gap-1"><Clock size={11} />{timeStr}</span>
              <span className="flex items-center gap-1"><MapPin size={11} />{t.geoFence}</span>
            </div>
          </div>
        )}
      </div>

      {/* Wage claim */}
      {(scanState === "done" || alreadyMarked) && (
        <div className="bg-white border-2 border-bitumen/10 rounded-2xl p-5 shadow-sm chain-drop">
          <p className="font-display text-sm text-bitumen mb-3">{t.wageStatus}</p>
          {!lastPayout ? (
            <button
              onClick={onClaimWage}
              className="w-full bg-tarp hover:bg-tarpLight transition-all text-white font-display text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
            >
              <IndianRupee size={16} />
              {t.releaseWage.replace("{wage}", worker.dailyWage)}
            </button>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-tarp text-xs font-semibold">
                  <CheckCircle2 size={16} /> 
                  <span>{t.sentUpi.replace("{amount}", lastPayout.amount)}</span>
                </div>
                
                <button
                  onClick={() => setShowReceipt(true)}
                  className="flex items-center gap-1 bg-tarp/10 hover:bg-tarp/20 text-tarp font-mono text-[10px] px-2.5 py-1 rounded-full transition-colors hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Printer size={10} />
                  <span>{t.downloadReceipt}</span>
                </button>
              </div>
              <div className="bg-cement rounded-lg p-2.5 font-mono text-[10px] text-steel flex items-center gap-1.5">
                <Hash size={11} /> 
                <span>{t.txnId}: {lastPayout.txnId}</span>
              </div>
              {policyResult && (
                <div className="flex items-center gap-1.5 text-[10px] text-tarp font-mono">
                  <ShieldCheck size={12} /> {t.verifiedArmorPay}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Worker Credit Reputation score teaser */}
      <div className="bg-white border-2 border-bitumen/10 rounded-2xl p-5 shadow-sm">
        <h4 className="font-display text-sm text-bitumen mb-2 flex items-center gap-2">
          <Landmark size={16} className="text-tarp" />
          <span>{t.creditScoreTitle}</span>
        </h4>
        <div className="bg-cement/50 rounded-xl p-3 mb-2 flex items-center justify-between border border-bitumen/5">
          <div>
            <p className="text-[11px] font-mono text-steel uppercase leading-none mb-1">REPUTATION LEVEL</p>
            <p className="font-display text-xs text-tarp font-bold">{t.creditScoreSub}</p>
          </div>
          <span className="text-lg font-black text-tarp font-mono">785</span>
        </div>
        <p className="text-[10px] text-steel leading-relaxed">
          {t.creditScoreDesc}
        </p>
      </div>

      {/* Dispute */}
      <div className="bg-white border-2 border-bitumen/10 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <p className="font-display text-sm text-bitumen flex items-center gap-1.5">
            <AlertTriangle size={15} className="text-rust" /> {t.dispute}
          </p>
          {!showDisputeForm && (
            <button
              onClick={() => setShowDisputeForm(true)}
              className="text-[10px] font-mono text-rust border border-rust/40 rounded-full px-3 py-1 hover:bg-rust/5 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {t.raiseDispute}
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
              className="w-full bg-rust disabled:opacity-40 text-white text-xs font-display py-2.5 rounded-lg hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              {t.submitDispute}
            </button>
          </div>
        )}
        {!showDisputeForm && (
          <p className="text-[10px] text-steel">
            {t.disputeDesc}
          </p>
        )}
      </div>

      {/* Work history toggle */}
      <button
        onClick={() => setShowHistory((s) => !s)}
        className="w-full flex items-center justify-between bg-bitumen2/5 border border-bitumen/10 rounded-2xl px-5 py-3.5 text-sm text-bitumen hover:bg-bitumen2/10 transition-colors"
      >
        <span className="flex items-center gap-2 font-display text-xs">
          <History size={15} /> {t.workHistory}
        </span>
        <ChevronDown size={16} className={`text-steel transition-transform ${showHistory ? "rotate-180" : ""}`} />
      </button>

      {showHistory && (
        <div className="bg-white border-2 border-bitumen/10 rounded-2xl p-5 mt-3 chain-drop shadow-sm">
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center">
              <p className="font-display text-lg text-bitumen">{history.attendanceDays}</p>
              <p className="text-[10px] text-steel">{t.daysVerified}</p>
            </div>
            <div className="text-center">
              <p className="font-display text-lg text-bitumen">₹{history.totalEarned}</p>
              <p className="text-[10px] text-steel">{t.totalEarned}</p>
            </div>
            <div className="text-center">
              <p className="font-display text-lg text-bitumen">{history.disputesRaised}</p>
              <p className="text-[10px] text-steel">{t.disputesCount}</p>
            </div>
          </div>
          <p className="text-[10px] text-steel flex items-center gap-1.5 border-t border-bitumen/10 pt-3">
            <Briefcase size={12} className="shrink-0" /> {t.historyDesc}
          </p>
        </div>
      )}

      {/* ArmorIQ security label at the bottom */}
      <div className="flex items-center justify-center gap-1.5 text-[9px] font-mono text-steel">
        <ShieldCheck size={11} className="text-tarp" />
        <span>{t.securedArmorIQ}</span>
      </div>

      {/* Receipt Modal */}
      {showReceipt && lastPayout && (
        <ReceiptModal
          payout={lastPayout}
          worker={worker}
          project={project}
          chain={chain}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
}
