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
  },
  ta: {
    digitalId: "டிஜிட்டல் தொழிலாளர் அடையாளம்",
    role: "பணி",
    project: "தளம் / திட்டம்",
    wage: "தினசரி கூலி",
    attendance: "இன்றைய வருகை",
    scanPrompt: "தள QR குறியீடு",
    scanButton: "வருகை பதிவு செய்ய QR-ஐ தட்டவும்",
    scanning: "GPS மற்றும் நேர முத்திரை சரிபார்க்கப்படுகிறது…",
    verified: "வருகை சரிபார்க்கப்பட்டது",
    geoFence: "தள புவி-வேலி சரி",
    wageStatus: "கூலி நிலை",
    releaseWage: "கூலி வெளியிடுக (₹{wage})",
    sentUpi: "₹{amount} UPI வழியாக அனுப்பப்பட்டது",
    txnId: "பரிவர்த்தனை எண்",
    verifiedArmorPay: "ArmorPay கொள்கை வாயில் மூலம் சரிபார்க்கப்பட்டது",
    dispute: "தகராறு",
    raiseDispute: "தகராறு பதிவு செய்க",
    submitDispute: "பேரேட்டில் தகராறை சமர்ப்பிக்கவும்",
    disputeDesc: "அனைத்து தகராறுகளும் மாற்ற முடியாத பேரேட்டில் பதிவாகும் — மறைக்க இயலாது.",
    workHistory: "பணி வரலாறு",
    daysVerified: "சரிபார்க்கப்பட்ட நாட்கள்",
    totalEarned: "மொத்த வருமானம்",
    disputesCount: "தகராறுகள்",
    historyDesc: "ஒப்பந்ததாரர்கள் இடையே கொண்டு செல்லக்கூடியது — கடன் விண்ணப்பங்கள் மற்றும் நலத்திட்ட அணுகலுக்கு பயன்படும்.",
    creditScoreTitle: "தொழிலாளர் கடன் மதிப்பு (பீட்டா)",
    creditScoreSub: "நிலை-1 நுண்-மதிப்பெண் (785/850)",
    creditScoreDesc: "மாற்ற முடியாத வருகை மற்றும் கட்டண வரலாற்றின் அடிப்படையில். ஈடு இல்லா கடனுக்கு நிதி நிறுவனங்களுடன் பகிரலாம்.",
    downloadReceipt: "ரசீதை பதிவிறக்கவும்",
    securedArmorIQ: "ArmorIQ™ தகவமைப்பு சரிபார்ப்பால் பாதுகாக்கப்பட்டது",
  },
  bn: {
    digitalId: "ডিজিটাল শ্রমিক পরিচয়পত্র",
    role: "পদবী",
    project: "সাইট / প্রকল্প",
    wage: "দৈনিক মজুরি",
    attendance: "আজকের উপস্থিতি",
    scanPrompt: "সাইট QR কোড",
    scanButton: "উপস্থিতি নথিভুক্ত করতে QR ট্যাপ করুন",
    scanning: "GPS ও টাইমস্ট্যাম্প যাচাই হচ্ছে…",
    verified: "উপস্থিতি যাচাই সম্পন্ন",
    geoFence: "সাইট জিও-ফেন্স ঠিক আছে",
    wageStatus: "মজুরির অবস্থা",
    releaseWage: "মজুরি ছাড় করুন (₹{wage})",
    sentUpi: "₹{amount} UPI-র মাধ্যমে পাঠানো হয়েছে",
    txnId: "লেনদেন নম্বর",
    verifiedArmorPay: "ArmorPay নীতি গেট দ্বারা যাচাইকৃত",
    dispute: "বিরোধ",
    raiseDispute: "বিরোধ দায়ের করুন",
    submitDispute: "খতিয়ানে বিরোধ জমা দিন",
    disputeDesc: "সমস্ত বিরোধ অপরিবর্তনীয় খতিয়ানে লেখা হয় — চাপা দেওয়া সম্ভব নয়।",
    workHistory: "কাজের ইতিহাস",
    daysVerified: "যাচাইকৃত দিন",
    totalEarned: "মোট আয়",
    disputesCount: "বিরোধ",
    historyDesc: "ঠিকাদারদের মধ্যে বহনযোগ্য — ঋণ আবেদন ও কল্যাণ প্রকল্পে ব্যবহারযোগ্য।",
    creditScoreTitle: "শ্রমিক ক্রেডিট সুনাম (বিটা)",
    creditScoreSub: "স্তর-১ মাইক্রো-স্কোর (৭৮৫/৮৫০)",
    creditScoreDesc: "অপরিবর্তনীয় উপস্থিতি ও পেমেন্ট ইতিহাসের উপর ভিত্তি করে। জামানতবিহীন ঋণের জন্য ব্যাংকের সাথে শেয়ার করা যায়।",
    downloadReceipt: "রসিদ ডাউনলোড করুন",
    securedArmorIQ: "ArmorIQ™ অভিযোজিত যাচাই দ্বারা সুরক্ষিত",
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
      <div className="relative bg-surface border border-border rounded-2xl p-5 shadow-xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[10px] tracking-[0.2em] text-primary font-mono uppercase mb-1">
              {t.digitalId}
            </p>
            <h2 className="font-display text-xl text-white leading-tight">{worker.name}</h2>
            <p className="text-xs text-textSecondary mt-0.5">{worker.role} · {project?.name}</p>
          </div>
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-1.5">
            <ShieldCheck size={20} className="text-primary" />
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-3 gap-2">
          <span className="font-mono text-xs text-textMuted truncate min-w-0">{worker.id}</span>
          <span className="font-mono text-xs text-primary shrink-0">₹{worker.dailyWage}/day</span>
        </div>
        <div className="absolute -bottom-2 left-0 right-0 flex justify-around px-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-dark" />
          ))}
        </div>
      </div>

      {/* Attendance & Site QR Card */}
      <div className="bg-surface2 border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="font-display text-sm text-white">{t.attendance}</p>
          <span className="font-mono text-xs text-textMuted">{todayStr}</span>
        </div>

        {!alreadyMarked && scanState === "idle" && (
          <div className="flex flex-col items-center gap-4">
            {/* Real SVG QR code */}
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-border group">
              <svg 
                width="130" 
                height="130" 
                viewBox="0 0 29 29" 
                className="text-black cursor-pointer hover:scale-[1.03] active:scale-[0.98] transition-all duration-200" 
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
              className="w-full bg-primary hover:bg-primaryDark transition-all text-dark font-display text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-[0.99]"
            >
              <ScanLine size={16} />
              {t.scanButton}
            </button>
          </div>
        )}

        {scanState === "scanning" && (
          <div className="w-full bg-surface border border-border text-white py-8 rounded-xl flex flex-col items-center gap-2.5 scanline">
            <ScanLine size={28} className="text-primary scan-pulse" />
            <p className="font-mono text-xs text-textMuted">{t.scanning}</p>
          </div>
        )}

        {(scanState === "done" || alreadyMarked) && (
          <div className="w-full bg-primary/10 border border-primary/20 text-primary py-4 rounded-xl flex flex-col items-center gap-1.5">
            <CheckCircle2 size={24} />
            <p className="font-display text-xs">{t.verified}</p>
            <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-primary/80">
              <span className="flex items-center gap-1"><Clock size={11} />{timeStr}</span>
              <span className="flex items-center gap-1"><MapPin size={11} />{t.geoFence}</span>
            </div>
          </div>
        )}
      </div>

      {/* Wage claim */}
      {(scanState === "done" || alreadyMarked) && (
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm chain-drop">
          <p className="font-display text-sm text-white mb-3">{t.wageStatus}</p>
          {!lastPayout ? (
            <button
              onClick={onClaimWage}
              className="w-full bg-primary hover:bg-primaryDark transition-all text-dark font-display text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
            >
              <IndianRupee size={16} />
              {t.releaseWage.replace("{wage}", worker.dailyWage)}
            </button>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary text-xs font-semibold">
                  <CheckCircle2 size={16} /> 
                  <span>{t.sentUpi.replace("{amount}", lastPayout.amount)}</span>
                </div>
                
                <button
                  onClick={() => setShowReceipt(true)}
                  className="flex items-center gap-1 bg-primaryMuted hover:bg-primary/20 text-primary font-mono text-[10px] px-2.5 py-1 rounded-full transition-colors hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Printer size={10} />
                  <span>{t.downloadReceipt}</span>
                </button>
              </div>
              <div className="bg-surface2 rounded-lg p-2.5 font-mono text-[10px] text-textMuted flex items-center gap-1.5 border border-border">
                <Hash size={11} /> 
                <span>{t.txnId}: {lastPayout.txnId}</span>
              </div>
              {policyResult && (
                <div className="flex items-center gap-1.5 text-[10px] text-primary font-mono">
                  <ShieldCheck size={12} /> {t.verifiedArmorPay}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Worker Credit Reputation score teaser */}
      <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm">
        <h4 className="font-display text-sm text-white mb-2 flex items-center gap-2">
          <Landmark size={16} className="text-primary" />
          <span>{t.creditScoreTitle}</span>
        </h4>
        <div className="bg-surface2 rounded-xl p-3 mb-2 flex items-center justify-between border border-border">
          <div>
            <p className="text-[11px] font-mono text-textMuted uppercase leading-none mb-1">REPUTATION LEVEL</p>
            <p className="font-display text-xs text-primary font-bold">{t.creditScoreSub}</p>
          </div>
          <span className="text-lg font-black text-primary font-mono">785</span>
        </div>
        <p className="text-[10px] text-textMuted leading-relaxed">
          {t.creditScoreDesc}
        </p>
      </div>

      {/* Dispute */}
      <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <p className="font-display text-sm text-white flex items-center gap-1.5">
            <AlertTriangle size={15} className="text-danger" /> {t.dispute}
          </p>
          {!showDisputeForm && (
            <button
              onClick={() => setShowDisputeForm(true)}
              className="text-[10px] font-mono text-danger border border-danger/40 rounded-full px-3 py-1 hover:bg-danger/10 hover:border-danger/60 hover:scale-[1.02] active:scale-[0.97] transition-all duration-150 shadow-sm"
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
              className="w-full text-xs border border-border bg-surface2 text-white rounded-lg p-2.5 resize-none h-20 focus:outline-none focus:border-danger placeholder-textMuted"
            />
            <button
              disabled={!disputeReason.trim()}
              onClick={() => {
                onRaiseDispute(disputeReason.trim());
                setDisputeReason("");
                setShowDisputeForm(false);
              }}
              className="w-full bg-danger disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-display py-2.5 rounded-lg hover:bg-danger/90 hover:scale-[1.01] active:scale-[0.98] transition-all duration-150"
            >
              {t.submitDispute}
            </button>
          </div>
        )}
        {!showDisputeForm && (
          <p className="text-[10px] text-textMuted">
            {t.disputeDesc}
          </p>
        )}
      </div>

      {/* Work history toggle */}
      <button
        onClick={() => setShowHistory((s) => !s)}
        className="w-full flex items-center justify-between bg-surface2 border border-border rounded-2xl px-5 py-3.5 text-sm text-white hover:bg-surface3 transition-colors"
      >
        <span className="flex items-center gap-2 font-display text-xs">
          <History size={15} /> {t.workHistory}
        </span>
        <ChevronDown size={16} className={`text-textMuted transition-transform ${showHistory ? "rotate-180" : ""}`} />
      </button>

      {showHistory && (
        <div className="bg-surface border border-border rounded-2xl p-5 mt-3 chain-drop shadow-sm">
          {history.attendanceDays === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
              <div className="bg-surface2 p-3 rounded-full">
                <History size={18} className="text-textMuted" />
              </div>
              <p className="font-display text-xs text-white">No work history yet</p>
              <p className="text-[10px] text-textMuted max-w-[220px]">Mark attendance to start building your portable work record.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center">
                  <p className="font-display text-lg text-white">{history.attendanceDays}</p>
                  <p className="text-[10px] text-textMuted">{t.daysVerified}</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-lg text-primary">₹{history.totalEarned}</p>
                  <p className="text-[10px] text-textMuted">{t.totalEarned}</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-lg text-white">{history.disputesRaised}</p>
                  <p className="text-[10px] text-textMuted">{t.disputesCount}</p>
                </div>
              </div>
              <p className="text-[10px] text-textMuted flex items-center gap-1.5 border-t border-border pt-3">
                <Briefcase size={12} className="shrink-0" /> {t.historyDesc}
              </p>
            </>
          )}
        </div>
      )}

      {/* ArmorIQ security label at the bottom */}
      <div className="flex items-center justify-center gap-1.5 text-[9px] font-mono text-textMuted">
        <ShieldCheck size={11} className="text-primary" />
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
