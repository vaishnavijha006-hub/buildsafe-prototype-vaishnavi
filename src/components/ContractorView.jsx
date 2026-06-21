import { useState, useEffect } from "react";
import {
  Link2, ShieldCheck, ShieldAlert, Users, IndianRupee, Activity,
  ChevronDown, ChevronUp, AlertTriangle, Plus, X, CheckCircle2, XCircle,
  FileText,
} from "lucide-react";
import { verifyChain, getOpenDisputes, detectAnomalies } from "../lib/ledger";

const dict = {
  en: {
    addWorker: "Add new worker",
    notionActive: "Notion Sync Active",
    notionOffline: "Notion Ledger (Offline)",
    newSite: "New site",
    registerProject: "Register new project",
    projectNamePlaceholder: "Project name, e.g. Riverside Bridge — Phase 1",
    wageTermsPlaceholder: "Wage terms to lock (₹)",
    lockWageOnChain: "LOCK WAGE TERMS ON-CHAIN",
    onboardWorker: "Onboard new worker",
    workerNamePlaceholder: "Worker name, e.g. Mahesh Yadav",
    rolePlaceholder: "Role, e.g. Mason, Helper, Electrician",
    dailyWagePlaceholder: "Daily wage (₹)",
    onboardDesc: "Onboards to",
    onboardDescSuffix: ". A Digital Worker ID is issued, the event is written to the ledger, and the roster syncs to Notion.",
    issueDigitalId: "ISSUE DIGITAL WORKER ID",
    activeWorkers: "Active workers",
    attendanceMarks: "Attendance marks",
    wagesDisbursed: "Wages disbursed",
    totalBlocks: "total blocks",
    wageLocked: "wage locked",
    chainVerified: "Chain verified",
    tamperedAt: "Tampered at",
    activeWorkersRoster: "Active Workers Roster",
    noWorkersYet: "No workers onboarded yet",
    noWorkersDesc: "Add a new worker above to start building the crew roster for this project.",
    thWorker: "Worker",
    thRole: "Role",
    thContact: "Contact",
    thDailyWage: "Daily Wage",
    thDueWage: "Due Wage",
    thPaidWage: "Paid Wage",
    anomalyFlags: "Anomaly detection flags",
    openDisputes: "Open disputes",
    releaseWageBtn: "Release wage",
    rejectBtn: "Reject",
    resolutionPlaceholder: "Resolution note…",
    noActiveDisputes: "No active disputes",
    noDisputesDesc: "All worker attendance records are aligned. No wage claims are currently flagged as contested.",
    workLedger: "Work Ledger",
    tryTampering: "⚠ Try tampering (demo)",
    ledgerEmpty: "No blocks yet",
    ledgerEmptyDesc: "Mark attendance to begin writing the immutable ledger.",
  },
  hi: {
    addWorker: "नया कर्मचारी जोड़ें",
    notionActive: "नोशन सिंक सक्रिय",
    notionOffline: "नोशन बहीखाता (ऑफ़लाइन)",
    newSite: "नई साइट",
    registerProject: "नई परियोजना पंजीकृत करें",
    projectNamePlaceholder: "परियोजना का नाम, जैसे नदी पुल — चरण 1",
    wageTermsPlaceholder: "लॉक करने के लिए मज़दूरी शर्तें (₹)",
    lockWageOnChain: "मज़दूरी शर्तें चेन पर लॉक करें",
    onboardWorker: "नया कर्मचारी जोड़ें",
    workerNamePlaceholder: "कर्मचारी का नाम, जैसे महेश यादव",
    rolePlaceholder: "भूमिका, जैसे मिस्त्री, हेल्पर, इलेक्ट्रीशियन",
    dailyWagePlaceholder: "दैनिक मज़दूरी (₹)",
    onboardDesc: "इसमें जोड़ा जाएगा",
    onboardDescSuffix: ". एक डिजिटल कर्मचारी आईडी जारी होगी, घटना बहीखाते में दर्ज होगी, और रोस्टर नोशन से सिंक होगा।",
    issueDigitalId: "डिजिटल कर्मचारी आईडी जारी करें",
    activeWorkers: "सक्रिय कर्मचारी",
    attendanceMarks: "उपस्थिति चिह्न",
    wagesDisbursed: "वितरित मज़दूरी",
    totalBlocks: "कुल ब्लॉक",
    wageLocked: "मज़दूरी लॉक",
    chainVerified: "चेन सत्यापित",
    tamperedAt: "छेड़छाड़ ब्लॉक",
    activeWorkersRoster: "सक्रिय कर्मचारी सूची",
    noWorkersYet: "अभी कोई कर्मचारी नहीं",
    noWorkersDesc: "इस परियोजना में क्रू रोस्टर शुरू करने के लिए ऊपर नया कर्मचारी जोड़ें।",
    thWorker: "कर्मचारी",
    thRole: "भूमिका",
    thContact: "संपर्क",
    thDailyWage: "दैनिक मज़दूरी",
    thDueWage: "बकाया मज़दूरी",
    thPaidWage: "भुगतान मज़दूरी",
    anomalyFlags: "विसंगति पहचान चिह्न",
    openDisputes: "खुले विवाद",
    releaseWageBtn: "मज़दूरी जारी करें",
    rejectBtn: "अस्वीकार",
    resolutionPlaceholder: "समाधान टिप्पणी…",
    noActiveDisputes: "कोई सक्रिय विवाद नहीं",
    noDisputesDesc: "सभी कर्मचारी उपस्थिति रिकॉर्ड संरेखित हैं। कोई मज़दूरी दावा वर्तमान में विवादित नहीं है।",
    workLedger: "कार्य बहीखाता",
    tryTampering: "⚠ छेड़छाड़ करें (डेमो)",
    ledgerEmpty: "अभी कोई ब्लॉक नहीं",
    ledgerEmptyDesc: "अपरिवर्तनीय बहीखाता शुरू करने के लिए उपस्थिति दर्ज करें।",
  },
  ta: {
    addWorker: "புதிய தொழிலாளர் சேர்க்கவும்",
    notionActive: "Notion ஒத்திசைவு செயலில்",
    notionOffline: "Notion பேரேடு (ஆஃப்லைன்)",
    newSite: "புதிய தளம்",
    registerProject: "புதிய திட்டத்தை பதிவு செய்யவும்",
    projectNamePlaceholder: "திட்டப் பெயர், எ.கா. ஆற்றங்கரை பாலம் — கட்டம் 1",
    wageTermsPlaceholder: "பூட்ட வேண்டிய கூலி விதிமுறைகள் (₹)",
    lockWageOnChain: "கூலி விதிமுறைகளை சங்கிலியில் பூட்டவும்",
    onboardWorker: "புதிய தொழிலாளரை சேர்க்கவும்",
    workerNamePlaceholder: "தொழிலாளர் பெயர், எ.கா. மகேஷ் யாதவ்",
    rolePlaceholder: "பணி, எ.கா. கொத்தனார், உதவியாளர், மின்னுரிகர்",
    dailyWagePlaceholder: "தினசரி கூலி (₹)",
    onboardDesc: "இதில் சேர்க்கப்படும்",
    onboardDescSuffix: ". ஒரு டிஜிட்டல் தொழிலாளர் அடையாளம் வழங்கப்படும், நிகழ்வு பேரேட்டில் பதிவாகும், மற்றும் பட்டியல் Notion-உடன் ஒத்திசைக்கப்படும்.",
    issueDigitalId: "டிஜிட்டல் தொழிலாளர் அடையாளம் வழங்கவும்",
    activeWorkers: "செயலில் உள்ள தொழிலாளர்கள்",
    attendanceMarks: "வருகை பதிவுகள்",
    wagesDisbursed: "வழங்கிய கூலி",
    totalBlocks: "மொத்த தொகுதிகள்",
    wageLocked: "கூலி பூட்டப்பட்டது",
    chainVerified: "சங்கிலி சரிபார்க்கப்பட்டது",
    tamperedAt: "சீர்குலைக்கப்பட்டது",
    activeWorkersRoster: "செயலில் உள்ள தொழிலாளர் பட்டியல்",
    noWorkersYet: "இதுவரை தொழிலாளர்கள் இல்லை",
    noWorkersDesc: "இந்தத் திட்டத்தில் குழுவை தொடங்க மேலே புதிய தொழிலாளரை சேர்க்கவும்.",
    thWorker: "தொழிலாளர்",
    thRole: "பணி",
    thContact: "தொடர்பு",
    thDailyWage: "தினசரி கூலி",
    thDueWage: "நிலுவைக் கூலி",
    thPaidWage: "செலுத்திய கூலி",
    anomalyFlags: "முரண்பாடு கண்டறிதல் குறிகள்",
    openDisputes: "நிலுவை தகராறுகள்",
    releaseWageBtn: "கூலி வெளியிடுக",
    rejectBtn: "நிராகரிக்கவும்",
    resolutionPlaceholder: "தீர்வு குறிப்பு…",
    noActiveDisputes: "செயலில் தகராறுகள் இல்லை",
    noDisputesDesc: "அனைத்து தொழிலாளர் வருகை பதிவுகளும் சீரமைக்கப்பட்டுள்ளன. எந்த கூலி கோரிக்கையும் தற்போது மறுக்கப்படவில்லை.",
    workLedger: "பணி பேரேடு",
    tryTampering: "⚠ சீர்குலைக்க முயற்சிக்கவும் (டெமோ)",
    ledgerEmpty: "இன்னும் தொகுதிகள் இல்லை",
    ledgerEmptyDesc: "மாற்ற முடியாத பேரேட்டை தொடங்க வருகையை பதிவு செய்யுங்கள்.",
  },
  bn: {
    addWorker: "নতুন শ্রমিক যোগ করুন",
    notionActive: "Notion সিঙ্ক সক্রিয়",
    notionOffline: "Notion খতিয়ান (অফলাইন)",
    newSite: "নতুন সাইট",
    registerProject: "নতুন প্রকল্প নিবন্ধন করুন",
    projectNamePlaceholder: "প্রকল্পের নাম, যেমন নদীতীর সেতু — পর্ব ১",
    wageTermsPlaceholder: "লক করার জন্য মজুরি শর্তাবলী (₹)",
    lockWageOnChain: "মজুরি শর্ত চেইনে লক করুন",
    onboardWorker: "নতুন শ্রমিক যুক্ত করুন",
    workerNamePlaceholder: "শ্রমিকের নাম, যেমন মহেশ যাদব",
    rolePlaceholder: "পদবী, যেমন রাজমিস্ত্রি, হেল্পার, ইলেকট্রিশিয়ান",
    dailyWagePlaceholder: "দৈনিক মজুরি (₹)",
    onboardDesc: "এতে যুক্ত হবে",
    onboardDescSuffix: ". একটি ডিজিটাল শ্রমিক আইডি জারি হবে, ঘটনাটি খতিয়ানে লেখা হবে, এবং তালিকা Notion-এ সিঙ্ক হবে।",
    issueDigitalId: "ডিজিটাল শ্রমিক আইডি জারি করুন",
    activeWorkers: "সক্রিয় শ্রমিক",
    attendanceMarks: "উপস্থিতি চিহ্ন",
    wagesDisbursed: "বিতরিত মজুরি",
    totalBlocks: "মোট ব্লক",
    wageLocked: "মজুরি লক",
    chainVerified: "চেইন যাচাইকৃত",
    tamperedAt: "পরিবর্তন করা হয়েছে",
    activeWorkersRoster: "সক্রিয় শ্রমিক তালিকা",
    noWorkersYet: "এখনও কোনো শ্রমিক নেই",
    noWorkersDesc: "এই প্রকল্পের দল শুরু করতে উপরে নতুন শ্রমিক যোগ করুন।",
    thWorker: "শ্রমিক",
    thRole: "পদবী",
    thContact: "যোগাযোগ",
    thDailyWage: "দৈনিক মজুরি",
    thDueWage: "বকেয়া মজুরি",
    thPaidWage: "প্রদত্ত মজুরি",
    anomalyFlags: "অসামঞ্জস্য সনাক্তকরণ চিহ্ন",
    openDisputes: "অমীমাংসিত বিরোধ",
    releaseWageBtn: "মজুরি ছাড় করুন",
    rejectBtn: "প্রত্যাখ্যান",
    resolutionPlaceholder: "সমাধান নোট…",
    noActiveDisputes: "কোনো সক্রিয় বিরোধ নেই",
    noDisputesDesc: "সমস্ত শ্রমিকের উপস্থিতি নথি সামঞ্জস্যপূর্ণ। কোনো মজুরি দাবি বর্তমানে বিতর্কিত নয়।",
    workLedger: "কাজের খতিয়ান",
    tryTampering: "⚠ পরিবর্তন করুন (ডেমো)",
    ledgerEmpty: "এখনও কোনো ব্লক নেই",
    ledgerEmptyDesc: "অপরিবর্তনীয় খতিয়ান শুরু করতে উপস্থিতি চিহ্নিত করুন।",
  },
};

function BlockCard({ block }) {
  const [open, setOpen] = useState(false);
  const typeColorMap = {
    PAYOUT: "border-tarp",
    ATTENDANCE: "border-safety",
    DISPUTE_RAISED: "border-rust",
    DISPUTE_RESOLVED: "border-steel",
    PROJECT_CREATED: "border-steel",
    WORKER_ONBOARDED: "border-tarp",
  };
  const typeLabelMap = {
    PAYOUT: "WAGE PAYOUT",
    ATTENDANCE: "ATTENDANCE",
    DISPUTE_RAISED: "DISPUTE RAISED",
    DISPUTE_RESOLVED: "DISPUTE RESOLVED",
    PROJECT_CREATED: "PROJECT EVENT",
    WORKER_ONBOARDED: "WORKER ONBOARDED",
  };
  const typeColor = typeColorMap[block.type] || "border-steel";
  const typeLabel = typeLabelMap[block.type] || block.type;

  return (
    <div className="relative chain-drop">
      <div
        className={`bg-white rounded-xl border-2 ${typeColor} p-3.5 cursor-pointer hover:shadow-md hover:scale-[1.005] active:scale-[0.998] transition-all duration-150`}
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-[10px] bg-bitumen text-cement px-1.5 py-0.5 rounded shrink-0">
              #{block.index}
            </span>
            <span className="font-display text-[11px] text-bitumen truncate">{typeLabel}</span>
          </div>
          {open ? <ChevronUp size={14} className="text-steel shrink-0" /> : <ChevronDown size={14} className="text-steel shrink-0" />}
        </div>
        <p className="text-[11px] text-steel mt-1 truncate">
          {block.data.workerName || block.data.projectName || "—"} ·{" "}
          {new Date(block.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        </p>
        {open && (
          <div className="mt-2.5 pt-2.5 border-t border-bitumen/10 space-y-1 font-mono text-[10px] text-steel break-all">
            <p><span className="text-bitumen/50">prevHash:</span> {block.prevHash.slice(0, 24)}…</p>
            <p><span className="text-bitumen/50">hash:</span> {block.hash.slice(0, 24)}…</p>
            <pre className="bg-cement rounded-lg p-2 mt-1 whitespace-pre-wrap text-[9px]">
              {JSON.stringify(block.data, null, 2)}
            </pre>
          </div>
        )}
      </div>
      <div className="flex justify-center -my-1 relative z-10">
        <div className="w-px h-4 bg-steel/40" />
      </div>
    </div>
  );
}

function DisputeCard({ dispute, onResolve, lang = "en" }) {
  const t = dict[lang] || dict.en;
  const [note, setNote] = useState("");
  return (
    <div className="bg-rust/5 border border-rust/30 rounded-xl p-4 chain-drop">
      <div className="flex items-center justify-between mb-1.5 gap-2">
        <span className="font-mono text-[10px] bg-rust text-white px-1.5 py-0.5 rounded shrink-0">
          {dispute.data.disputeId}
        </span>
        <span className="text-[11px] text-steel truncate">{dispute.data.workerName}</span>
      </div>
      <p className="text-xs text-bitumen mb-3">{dispute.data.reason}</p>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={t.resolutionPlaceholder}
        className="w-full text-xs border border-bitumen/15 rounded-lg p-2 mb-2 focus:outline-none focus:border-tarp"
      />
      <div className="flex gap-2">
        <button
          onClick={() => onResolve(dispute.data.disputeId, note || "Wage released after verification", "WAGE_RELEASED")}
          className="flex-1 flex items-center justify-center gap-1 bg-tarp text-white text-[11px] font-display py-2 rounded-lg hover:bg-tarpLight hover:shadow-md hover:scale-[1.02] active:scale-[0.97] active:shadow-none transition-all duration-150"
        >
          <CheckCircle2 size={13} /> {t.releaseWageBtn}
        </button>
        <button
          onClick={() => onResolve(dispute.data.disputeId, note || "Claim rejected after review", "REJECTED")}
          className="flex-1 flex items-center justify-center gap-1 bg-steel text-white text-[11px] font-display py-2 rounded-lg hover:bg-steel/80 hover:shadow-sm hover:scale-[1.02] active:scale-[0.97] active:shadow-none transition-all duration-150"
        >
          <XCircle size={13} /> {t.rejectBtn}
        </button>
      </div>
    </div>
  );
}

export default function ContractorView({
  chain, workers, projects, activeProjectId, onSwitchProject,
  onTamperDemo, onResolveDispute, onCreateProject, onAddWorker,
  notionStatus, lang = "en",
}) {
  const t = dict[lang] || dict.en;
  const [chainStatus, setChainStatus] = useState(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newName, setNewName] = useState("");
  const [newWage, setNewWage] = useState("");
  const [showNewWorker, setShowNewWorker] = useState(false);
  const [workerName, setWorkerName] = useState("");
  const [workerRole, setWorkerRole] = useState("");
  const [workerWage, setWorkerWage] = useState("");
  const [biometricStatus, setBiometricStatus] = useState("idle"); // idle | scanning | verified
  const [biometricSessionId, setBiometricSessionId] = useState("");

  useEffect(() => {
    verifyChain(chain).then(setChainStatus);
  }, [chain]);

  const project = projects.find((p) => p.id === activeProjectId);
  const projectWorkers = workers.filter((w) => w.projectId === activeProjectId);
  const projectWorkerIds = new Set(projectWorkers.map((w) => w.id));
  const projectChain = chain.filter((b) => {
    if (b.data.workerId) return projectWorkerIds.has(b.data.workerId);
    if (b.data.projectId) return b.data.projectId === activeProjectId;
    return true;
  });

  const totalPaid = projectChain
    .filter((b) => b.type === "PAYOUT")
    .reduce((sum, b) => sum + b.data.amount, 0);
  const attendanceToday = projectChain.filter((b) => b.type === "ATTENDANCE").length;
  const openDisputes = getOpenDisputes(projectChain);
  const anomalies = detectAnomalies(chain);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Actions bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <button
          onClick={() => setShowNewWorker(true)}
          className="flex items-center gap-2 bg-tarp text-white text-sm font-display px-4 py-2.5 rounded-xl hover:bg-tarpLight hover:shadow-lg hover:scale-[1.02] active:scale-[0.97] active:shadow-none transition-all duration-150 shrink-0 shadow-md"
        >
          <Plus size={16} /> {t.addWorker}
        </button>
        {notionStatus?.connected ? (
          <span className="text-[10px] font-mono text-tarp bg-tarp/10 border border-tarp/20 rounded-full px-3 py-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-tarp animate-pulse" />
            {t.notionActive}
          </span>
        ) : (
          <span className="text-[10px] font-mono text-steel bg-bitumen/5 border border-bitumen/10 rounded-full px-3 py-1.5 flex items-center gap-1.5 cursor-help" title="BuildSafe runs in local-first secure offline mode. Connect Notion database in production.">
            <span className="w-1.5 h-1.5 rounded-full bg-steel/60" />
            {t.notionOffline}
          </span>
        )}
      </div>

      {/* Project switcher */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => onSwitchProject(p.id)}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium border whitespace-nowrap transition-all duration-150 ${
              p.id === activeProjectId
                ? "bg-bitumen text-cement border-bitumen shadow-md"
                : "bg-white text-steel border-bitumen/10 hover:border-bitumen/30 hover:text-bitumen hover:shadow-sm active:scale-[0.97]"
            }`}
          >
            {p.name}
          </button>
        ))}
        <button
          onClick={() => setShowNewProject(true)}
          className="shrink-0 px-3 py-2 rounded-full text-xs font-medium border border-dashed border-steel/40 text-steel hover:bg-bitumen/5 hover:border-steel/60 hover:text-bitumen hover:scale-[1.02] active:scale-[0.97] transition-all duration-150 flex items-center gap-1"
        >
          <Plus size={13} /> {t.newSite}
        </button>
      </div>

      {showNewProject && (
        <div className="bg-white border-2 border-bitumen/10 rounded-2xl p-5 mb-5 chain-drop shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="font-display text-sm text-bitumen">{t.registerProject}</p>
            <button onClick={() => setShowNewProject(false)} className="text-steel hover:text-bitumen hover:bg-bitumen/5 rounded-lg p-1 transition-colors"><X size={16} /></button>
          </div>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t.projectNamePlaceholder}
            className="w-full text-sm border border-bitumen/15 rounded-lg p-2.5 mb-2 focus:outline-none focus:border-safety focus:ring-1 focus:ring-safety/20 transition-all"
          />
          <input
            value={newWage}
            onChange={(e) => setNewWage(e.target.value)}
            type="number"
            placeholder={t.wageTermsPlaceholder}
            className="w-full text-sm border border-bitumen/15 rounded-lg p-2.5 mb-3 focus:outline-none focus:border-safety focus:ring-1 focus:ring-safety/20 transition-all"
          />
          <button
            disabled={!newName.trim() || !newWage}
            onClick={() => {
              onCreateProject(newName.trim(), Number(newWage));
              setNewName(""); setNewWage(""); setShowNewProject(false);
            }}
            className="w-full bg-safety disabled:opacity-40 disabled:cursor-not-allowed text-bitumen text-sm font-display py-3 rounded-lg hover:bg-safetyDark hover:shadow-md hover:scale-[1.01] active:scale-[0.98] active:shadow-none transition-all duration-150 shadow-md"
          >
            {t.lockWageOnChain}
          </button>
        </div>
      )}

      {showNewWorker && (
        <div className="bg-white border-2 border-bitumen/10 rounded-2xl p-5 mb-5 chain-drop shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="font-display text-sm text-bitumen">{t.onboardWorker}</p>
            <button onClick={() => setShowNewWorker(false)} className="text-steel hover:text-bitumen hover:bg-bitumen/5 rounded-lg p-1 transition-colors"><X size={16} /></button>
          </div>
          <input
            value={workerName}
            onChange={(e) => setWorkerName(e.target.value)}
            placeholder={t.workerNamePlaceholder}
            className="w-full text-sm border border-bitumen/15 rounded-lg p-2.5 mb-2 focus:outline-none focus:border-safety focus:ring-1 focus:ring-safety/20 transition-all"
          />
          <input
            value={workerRole}
            onChange={(e) => setWorkerRole(e.target.value)}
            placeholder={t.rolePlaceholder}
            className="w-full text-sm border border-bitumen/15 rounded-lg p-2.5 mb-2 focus:outline-none focus:border-safety focus:ring-1 focus:ring-safety/20 transition-all"
          />
          <input
            value={workerWage}
            onChange={(e) => setWorkerWage(e.target.value)}
            type="number"
            placeholder={t.dailyWagePlaceholder}
            className="w-full text-sm border border-bitumen/15 rounded-lg p-2.5 mb-3 focus:outline-none focus:border-safety focus:ring-1 focus:ring-safety/20 transition-all"
          />
          <p className="text-[11px] text-steel mb-3">
            {t.onboardDesc} <span className="text-bitumen font-medium">{project?.name}</span>{t.onboardDescSuffix}
          </p>

          {/* Biometric Verification Step */}
          <div className="mb-4">
            <p className="text-xs font-medium text-bitumen mb-2 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-tarp" /> Biometric verification
            </p>
            {biometricStatus === "idle" ? (
              <button
                onClick={() => {
                  setBiometricStatus("scanning");
                  setTimeout(() => {
                    setBiometricStatus("verified");
                    setBiometricSessionId(`BIO-${Math.floor(100000 + Math.random() * 900000)}`);
                  }, 1800);
                }}
                className="w-full flex items-center justify-center gap-2 border border-bitumen/15 bg-cement2/30 hover:bg-cement2 hover:border-bitumen/30 text-bitumen text-xs font-display py-2.5 rounded-lg transition-all duration-150"
              >
                <Activity size={14} /> Capture biometric session
              </button>
            ) : biometricStatus === "scanning" ? (
              <div className="w-full flex flex-col items-center justify-center border border-tarp/30 bg-tarp/5 py-3 rounded-lg scanline relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-tarp opacity-50 scan-pulse" />
                <Activity size={16} className="text-tarp animate-pulse mb-1" />
                <span className="text-[10px] font-mono text-tarp">Verifying via ArmorIQ...</span>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center justify-center border border-tarp/30 bg-tarp/10 py-2.5 rounded-lg">
                <div className="flex items-center gap-1.5 text-tarp text-xs font-medium mb-0.5">
                  <CheckCircle2 size={14} /> Biometric session verified · ArmorIQ
                </div>
                <span className="text-[9px] font-mono text-tarp/70">Session ID: {biometricSessionId}</span>
              </div>
            )}
          </div>

          <button
            disabled={!workerName.trim() || !workerRole.trim() || !workerWage || biometricStatus !== "verified"}
            onClick={() => {
              onAddWorker(workerName.trim(), workerRole.trim(), Number(workerWage), activeProjectId, biometricSessionId);
              setWorkerName(""); setWorkerRole(""); setWorkerWage(""); 
              setBiometricStatus("idle"); setBiometricSessionId("");
              setShowNewWorker(false);
            }}
            className="w-full bg-tarp disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-display py-3 rounded-lg hover:bg-tarpLight hover:shadow-md hover:scale-[1.01] active:scale-[0.98] active:shadow-none transition-all duration-150 shadow-md"
          >
            {t.issueDigitalId}
          </button>
        </div>
      )}

      {/* Stat strip */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-bitumen/10">
          <div className="flex items-center justify-between mb-2">
            <Users size={16} className="text-steel" />
            <button
              onClick={() => setShowNewWorker(true)}
              title={t.addWorker}
              className="text-steel hover:text-bitumen hover:bg-bitumen/5 rounded p-0.5 transition-all"
            >
              <Plus size={14} />
            </button>
          </div>
          <p className="font-display text-xl text-bitumen">{projectWorkers.length}</p>
          <p className="text-[10px] sm:text-[11px] text-steel">{t.activeWorkers}</p>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-bitumen/10">
          <Activity size={16} className="text-safety mb-2" />
          <p className="font-display text-xl text-bitumen">{attendanceToday}</p>
          <p className="text-[10px] sm:text-[11px] text-steel">{t.attendanceMarks}</p>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-bitumen/10">
          <IndianRupee size={16} className="text-tarp mb-2" />
          <p className="font-display text-xl text-bitumen">₹{totalPaid}</p>
          <p className="text-[10px] sm:text-[11px] text-steel">{t.wagesDisbursed}</p>
        </div>
      </div>

      {/* Project + chain integrity */}
      <div className="bg-bitumen text-cement rounded-2xl p-4 sm:p-5 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-sm truncate">{project?.name}</p>
          <p className="text-[11px] text-steel font-mono mt-0.5">
            {chain.length} {t.totalBlocks} · {t.wageLocked} ₹{project?.wageLocked}
          </p>
        </div>
        {chainStatus && (
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono shrink-0 ${
              chainStatus.valid ? "bg-tarp/20 text-tarpLight" : "bg-rust/20 text-rust"
            }`}
          >
            {chainStatus.valid ? <ShieldCheck size={13} /> : <ShieldAlert size={13} />}
            {chainStatus.valid ? t.chainVerified : `${t.tamperedAt} #${chainStatus.brokenAt}`}
          </div>
        )}
      </div>

      {/* Active Workers Roster */}
      <div className="bg-white rounded-2xl border-2 border-bitumen/10 p-4 sm:p-5 mb-6 chain-drop">
        <h3 className="font-display text-sm text-bitumen mb-3 flex items-center gap-2">
          <Users size={16} /> {t.activeWorkersRoster}
        </h3>
        {projectWorkers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
            <div className="bg-bitumen/5 p-3 rounded-full">
              <Users size={20} className="text-steel" />
            </div>
            <p className="font-display text-xs text-bitumen">{t.noWorkersYet}</p>
            <p className="text-[10px] text-steel max-w-[280px]">{t.noWorkersDesc}</p>
            <button
              onClick={() => setShowNewWorker(true)}
              className="mt-1 flex items-center gap-1.5 text-[11px] font-display text-tarp border border-tarp/30 rounded-full px-3 py-1.5 hover:bg-tarp/5 hover:border-tarp/60 hover:scale-[1.02] active:scale-[0.97] transition-all duration-150"
            >
              <Plus size={12} /> {t.addWorker}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full min-w-[480px] text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-bitumen/10 font-mono text-steel text-[10px] uppercase">
                  <th className="py-2.5 px-1">{t.thWorker}</th>
                  <th className="py-2.5 px-1">{t.thRole}</th>
                  <th className="py-2.5 px-1 hidden sm:table-cell">{t.thContact}</th>
                  <th className="py-2.5 px-1 text-right">{t.thDailyWage}</th>
                  <th className="py-2.5 px-1 text-right">{t.thDueWage}</th>
                  <th className="py-2.5 px-1 text-right">{t.thPaidWage}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bitumen/5">
                {projectWorkers.map((w) => {
                  const workerEvents = projectChain.filter((b) => b.data.workerId === w.id);
                  const paidWage = workerEvents
                    .filter((b) => b.type === "PAYOUT")
                    .reduce((sum, b) => sum + b.data.amount, 0);
                  const attendanceDays = workerEvents.filter((b) => b.type === "ATTENDANCE").length;
                  const dueWage = Math.max(0, (attendanceDays * w.dailyWage) - paidWage);

                  return (
                    <tr key={w.id} className="hover:bg-bitumen/[0.02] transition-colors">
                      <td className="py-3 px-1 font-medium text-bitumen">
                        <div className="truncate max-w-[100px]">{w.name}</div>
                        <div className="font-mono text-[9px] text-steel truncate max-w-[100px]">{w.id}</div>
                      </td>
                      <td className="py-3 px-1 text-steel">{w.role}</td>
                      <td className="py-3 px-1 font-mono text-steel hidden sm:table-cell">{w.phone || "—"}</td>
                      <td className="py-3 px-1 text-right font-mono text-bitumen">₹{w.dailyWage}</td>
                      <td className="py-3 px-1 text-right font-mono font-medium text-rust">₹{dueWage}</td>
                      <td className="py-3 px-1 text-right font-mono text-tarp">₹{paidWage}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Anomaly flags */}
      {anomalies.length > 0 && (
        <div className="bg-rust/10 border border-rust/30 rounded-2xl p-4 mb-6">
          <p className="font-display text-xs text-rust flex items-center gap-1.5 mb-2">
            <AlertTriangle size={14} /> {t.anomalyFlags}
          </p>
          {anomalies.map((a, i) => (
            <p key={i} className="text-[11px] text-rust/80 font-mono">
              Blocks #{a.blocks[0]} &amp; #{a.blocks[1]} — {a.reason}
            </p>
          ))}
        </div>
      )}

      {/* Open disputes */}
      <div className="mb-6">
        <p className="font-display text-sm text-bitumen flex items-center gap-1.5 mb-3">
          <AlertTriangle size={15} className="text-rust" /> {t.openDisputes} ({openDisputes.length})
        </p>
        {openDisputes.length > 0 ? (
          <div className="space-y-3">
            {openDisputes.map((d) => (
              <DisputeCard key={d.data.disputeId} dispute={d} onResolve={onResolveDispute} lang={lang} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-bitumen/10 rounded-xl p-5 text-center shadow-sm flex flex-col items-center justify-center gap-1.5 py-8">
            <div className="bg-tarp/10 p-2.5 rounded-full text-tarp">
              <ShieldCheck size={20} />
            </div>
            <p className="font-display text-xs text-bitumen">{t.noActiveDisputes}</p>
            <p className="text-[10px] text-steel max-w-[300px]">{t.noDisputesDesc}</p>
          </div>
        )}
      </div>

      {/* Ledger chain visual */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <p className="font-display text-sm text-bitumen flex items-center gap-1.5">
          <Link2 size={15} /> {t.workLedger}
        </p>
        <button
          onClick={onTamperDemo}
          className="text-[11px] font-mono text-rust border border-rust/40 rounded-full px-3 py-1 hover:bg-rust/10 hover:border-rust/60 hover:scale-[1.02] active:scale-[0.97] transition-all duration-150"
          title="Demo: simulate a contractor trying to edit a past record"
        >
          {t.tryTampering}
        </button>
      </div>

      <div className="space-y-0 max-h-[420px] overflow-y-auto pr-1">
        {chain.length === 0 ? (
          <div className="bg-white border border-bitumen/10 rounded-xl p-6 text-center shadow-sm flex flex-col items-center justify-center gap-2 py-10">
            <div className="bg-safety/15 p-3 rounded-full text-bitumen">
              <FileText size={22} className="text-steel" />
            </div>
            <p className="font-display text-sm text-bitumen">{t.ledgerEmpty}</p>
            <p className="text-[10px] text-steel max-w-[260px] leading-relaxed">{t.ledgerEmptyDesc}</p>
          </div>
        ) : (
          chain.map((block) => (
            <BlockCard key={block.hash} block={block} />
          ))
        )}
      </div>
    </div>
  );
}