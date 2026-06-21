import React, { useState } from "react";
import { 
  Users, Landmark, ShieldCheck, AlertTriangle, Plus, X, 
  TrendingUp, Activity, CheckCircle2, Link2, BarChart3
} from "lucide-react";
import { getOpenDisputes, detectAnomalies, verifyChain } from "../lib/ledger";

const dict = {
  en: {
    builderOps: "Builder Operations",
    builderSubtitle: "Multi-site wage allocation & compliance audit",
    onboardContractor: "Onboard Contractor",
    masterBudget: "Master Budget",
    lockedOnChain: "Locked On-Chain",
    crewsEnrolled: "Crews Enrolled",
    riskAnomalyFlags: "Risk Anomaly Flags",
    masterWageLock: "Master Wage Lock Budget Tracking",
    contractorLabel: "Contractor",
    unassigned: "Unassigned",
    locked: "locked",
    of: "of",
    multiContractorOps: "Multi-Contractor Operations",
    noContractorsYet: "No contractors enrolled yet",
    noContractorsDesc: "Onboard a contractor above to begin multi-site oversight.",
    thContractor: "Contractor",
    thSiteProject: "Site / Project",
    thActiveWorkers: "Workers",
    thDisbursedWages: "Disbursed",
    thDisputes: "Disputes",
    thCompliance: "Compliance",
    anomalyFlagged: "⚠ Anomaly",
    compliant: "✓ Compliant",
    complianceFraud: "Compliance & Fraud Patterns (Rollup)",
    anomalyFlagLabel: "ANOMALY FLAG",
    gpsTimestampCollision: "GPS + TIMESTAMP COLLISION",
    noAnomalies: "No GPS proxy check-ins or biometric spoofing anomalies detected.",
    cryptoIntegrity: "Cryptographic Integrity Summary",
    chainHealth: "CHAIN HEALTH:",
    excellent: "EXCELLENT (100% SECURE)",
    activeLedgerBlocks: "Active Ledger Blocks:",
    blocksUnit: "blocks",
    enrolledContractors: "Enrolled Contractors:",
    activeUnit: "active",
    genesisVerification: "Genesis Block Verification:",
    validated: "VALIDATED",
    lastHash: "Last Cryptographic Block Hash:",
    genesisHashOnly: "Genesis Hash Only",
    chainValidated: "Chain validated across all contractors",
    ledgerTampered: "Ledger tampered at block",
    onboardTitle: "Onboard New Contractor",
    contractorName: "Contractor Full Name",
    contractorNamePlaceholder: "e.g. Vikram Singh",
    emailLabel: "Email Address (Login ID)",
    emailPlaceholder: "e.g. vikram@buildsafe.in",
    assignedProject: "Assigned Project",
    allocationBudget: "Allocation Budget (₹)",
    budgetPlaceholder: "e.g. 300000",
    onboardDesc: "Onboarding creates a Contractor digital identity, records it to the ledger block, and sets up sign-in credentials with default password",
    recordOnChain: "RECORD ON-CHAIN & ONBOARD",
  },
  hi: {
    builderOps: "बिल्डर संचालन",
    builderSubtitle: "बहु-साइट मज़दूरी आवंटन और अनुपालन ऑडिट",
    onboardContractor: "ठेकेदार जोड़ें",
    masterBudget: "मास्टर बजट",
    lockedOnChain: "चेन पर लॉक",
    crewsEnrolled: "पंजीकृत दल",
    riskAnomalyFlags: "जोखिम विसंगति चिह्न",
    masterWageLock: "मास्टर मज़दूरी लॉक बजट ट्रैकिंग",
    contractorLabel: "ठेकेदार",
    unassigned: "असाइन नहीं",
    locked: "लॉक",
    of: "का",
    multiContractorOps: "बहु-ठेकेदार संचालन",
    noContractorsYet: "अभी कोई ठेकेदार नहीं",
    noContractorsDesc: "बहु-साइट निगरानी शुरू करने के लिए ऊपर ठेकेदार जोड़ें।",
    thContractor: "ठेकेदार",
    thSiteProject: "साइट / परियोजना",
    thActiveWorkers: "कर्मचारी",
    thDisbursedWages: "वितरित",
    thDisputes: "विवाद",
    thCompliance: "अनुपालन",
    anomalyFlagged: "⚠ विसंगति",
    compliant: "✓ अनुपालक",
    complianceFraud: "अनुपालन और धोखाधड़ी पैटर्न (रोलअप)",
    anomalyFlagLabel: "विसंगति चिह्न",
    gpsTimestampCollision: "जीपीएस + टाइमस्टैम्प टकराव",
    noAnomalies: "कोई जीपीएस प्रॉक्सी चेक-इन या बायोमेट्रिक स्पूफिंग विसंगति नहीं पाई गई।",
    cryptoIntegrity: "क्रिप्टोग्राफिक अखंडता सारांश",
    chainHealth: "चेन स्वास्थ्य:",
    excellent: "उत्कृष्ट (100% सुरक्षित)",
    activeLedgerBlocks: "सक्रिय बहीखाता ब्लॉक:",
    blocksUnit: "ब्लॉक",
    enrolledContractors: "पंजीकृत ठेकेदार:",
    activeUnit: "सक्रिय",
    genesisVerification: "जेनेसिस ब्लॉक सत्यापन:",
    validated: "सत्यापित",
    lastHash: "अंतिम क्रिप्टोग्राफिक ब्लॉक हैश:",
    genesisHashOnly: "केवल जेनेसिस हैश",
    chainValidated: "सभी ठेकेदारों में चेन सत्यापित",
    ledgerTampered: "बहीखाते में छेड़छाड़ ब्लॉक",
    onboardTitle: "नया ठेकेदार जोड़ें",
    contractorName: "ठेकेदार का पूरा नाम",
    contractorNamePlaceholder: "जैसे विक्रम सिंह",
    emailLabel: "ईमेल पता (लॉगिन आईडी)",
    emailPlaceholder: "जैसे vikram@buildsafe.in",
    assignedProject: "निर्धारित परियोजना",
    allocationBudget: "आवंटन बजट (₹)",
    budgetPlaceholder: "जैसे 300000",
    onboardDesc: "ऑनबोर्डिंग ठेकेदार की डिजिटल पहचान बनाती है, इसे बहीखाता ब्लॉक में दर्ज करती है, और डिफ़ॉल्ट पासवर्ड के साथ साइन-इन क्रेडेंशियल सेट करती है",
    recordOnChain: "चेन पर रिकॉर्ड करें और जोड़ें",
  },
  ta: {
    builderOps: "கட்டுநர் நடவடிக்கைகள்",
    builderSubtitle: "பல-தள கூலி ஒதுக்கீடு & இணக்க தணிக்கை",
    onboardContractor: "ஒப்பந்ததாரர் சேர்க்கவும்",
    masterBudget: "மொத்த பட்ஜெட்",
    lockedOnChain: "சங்கிலியில் பூட்டப்பட்டது",
    crewsEnrolled: "பதிவான குழுக்கள்",
    riskAnomalyFlags: "ஆபத்து முரண்பாடு குறிகள்",
    masterWageLock: "மொத்த கூலி பூட்டு பட்ஜெட் கண்காணிப்பு",
    contractorLabel: "ஒப்பந்ததாரர்",
    unassigned: "ஒதுக்கப்படவில்லை",
    locked: "பூட்டப்பட்டது",
    of: "இல்",
    multiContractorOps: "பல-ஒப்பந்ததாரர் நடவடிக்கைகள்",
    noContractorsYet: "இன்னும் ஒப்பந்ததாரர்கள் இல்லை",
    noContractorsDesc: "பல-தள கண்காணிப்பு தொடங்க மேலே ஒப்பந்ததாரர் சேர்க்கவும்.",
    thContractor: "ஒப்பந்ததாரர்",
    thSiteProject: "தளம் / திட்டம்",
    thActiveWorkers: "தொழிலாளர்கள்",
    thDisbursedWages: "வழங்கியது",
    thDisputes: "தகராறுகள்",
    thCompliance: "இணக்கம்",
    anomalyFlagged: "⚠ முரண்பாடு",
    compliant: "✓ இணக்கமானது",
    complianceFraud: "இணக்கம் & மோசடி வடிவங்கள் (தொகுப்பு)",
    anomalyFlagLabel: "முரண்பாடு குறி",
    gpsTimestampCollision: "GPS + நேரமுத்திரை மோதல்",
    noAnomalies: "GPS பிராக்சி செக்-இன் அல்லது பயோமெட்ரிக் ஏமாற்று முரண்பாடுகள் கண்டறியப்படவில்லை.",
    cryptoIntegrity: "குறியாக்க ஒருமைப்பாடு சுருக்கம்",
    chainHealth: "சங்கிலி நிலை:",
    excellent: "சிறப்பு (100% பாதுகாப்பு)",
    activeLedgerBlocks: "செயலில் பேரேடு தொகுதிகள்:",
    blocksUnit: "தொகுதிகள்",
    enrolledContractors: "பதிவான ஒப்பந்ததாரர்கள்:",
    activeUnit: "செயலில்",
    genesisVerification: "ஜெனிசிஸ் தொகுதி சரிபார்ப்பு:",
    validated: "சரிபார்க்கப்பட்டது",
    lastHash: "கடைசி குறியாக்கத் தொகுதி ஹாஷ்:",
    genesisHashOnly: "ஜெனிசிஸ் ஹாஷ் மட்டும்",
    chainValidated: "அனைத்து ஒப்பந்ததாரர்களிடையே சங்கிலி சரிபார்க்கப்பட்டது",
    ledgerTampered: "பேரேடு சீர்குலைக்கப்பட்டது தொகுதி",
    onboardTitle: "புதிய ஒப்பந்ததாரர் சேர்க்கவும்",
    contractorName: "ஒப்பந்ததாரர் முழு பெயர்",
    contractorNamePlaceholder: "எ.கா. விக்ரம் சிங்",
    emailLabel: "மின்னஞ்சல் முகவரி (உள்நுழைவு ஐடி)",
    emailPlaceholder: "எ.கா. vikram@buildsafe.in",
    assignedProject: "ஒதுக்கப்பட்ட திட்டம்",
    allocationBudget: "ஒதுக்கீடு பட்ஜெட் (₹)",
    budgetPlaceholder: "எ.கா. 300000",
    onboardDesc: "ஒப்பந்ததாரர் டிஜிட்டல் அடையாத்தை உருவாக்கி, பேரேடு தொகுதியில் பதிவு செய்து, இயல்புநிலை கடவுச்சொல்லுடன் உள்நுழைவு சான்றுகளை அமைக்கிறது",
    recordOnChain: "சங்கிலியில் பதிவு செய்து சேர்க்கவும்",
  },
  bn: {
    builderOps: "বিল্ডার কার্যক্রম",
    builderSubtitle: "বহু-সাইট মজুরি বরাদ্দ ও সম্মতি নিরীক্ষা",
    onboardContractor: "ঠিকাদার যুক্ত করুন",
    masterBudget: "মাস্টার বাজেট",
    lockedOnChain: "চেইনে লক",
    crewsEnrolled: "নিবন্ধিত দল",
    riskAnomalyFlags: "ঝুঁকি অসামঞ্জস্য চিহ্ন",
    masterWageLock: "মাস্টার মজুরি লক বাজেট ট্র্যাকিং",
    contractorLabel: "ঠিকাদার",
    unassigned: "নির্ধারিত নয়",
    locked: "লক",
    of: "এর",
    multiContractorOps: "বহু-ঠিকাদার কার্যক্রম",
    noContractorsYet: "এখনও কোনো ঠিকাদার নেই",
    noContractorsDesc: "বহু-সাইট তদারকি শুরু করতে উপরে ঠিকাদার যুক্ত করুন।",
    thContractor: "ঠিকাদার",
    thSiteProject: "সাইট / প্রকল্প",
    thActiveWorkers: "শ্রমিক",
    thDisbursedWages: "বিতরিত",
    thDisputes: "বিরোধ",
    thCompliance: "সম্মতি",
    anomalyFlagged: "⚠ অসামঞ্জস্য",
    compliant: "✓ সম্মত",
    complianceFraud: "সম্মতি ও জালিয়াতি ধরন (সারাংশ)",
    anomalyFlagLabel: "অসামঞ্জস্য চিহ্ন",
    gpsTimestampCollision: "GPS + টাইমস্ট্যাম্প সংঘর্ষ",
    noAnomalies: "কোনো GPS প্রক্সি চেক-ইন বা বায়োমেট্রিক প্রতারণা অসামঞ্জস্য সনাক্ত হয়নি।",
    cryptoIntegrity: "ক্রিপ্টোগ্রাফিক অখণ্ডতা সারাংশ",
    chainHealth: "চেইন অবস্থা:",
    excellent: "চমৎকার (১০০% নিরাপদ)",
    activeLedgerBlocks: "সক্রিয় খতিয়ান ব্লক:",
    blocksUnit: "ব্লক",
    enrolledContractors: "নিবন্ধিত ঠিকাদার:",
    activeUnit: "সক্রিয়",
    genesisVerification: "জেনেসিস ব্লক যাচাই:",
    validated: "যাচাইকৃত",
    lastHash: "শেষ ক্রিপ্টোগ্রাফিক ব্লক হ্যাশ:",
    genesisHashOnly: "শুধু জেনেসিস হ্যাশ",
    chainValidated: "সমস্ত ঠিকাদার জুড়ে চেইন যাচাইকৃত",
    ledgerTampered: "খতিয়ান পরিবর্তিত ব্লক",
    onboardTitle: "নতুন ঠিকাদার যুক্ত করুন",
    contractorName: "ঠিকাদারের পুরো নাম",
    contractorNamePlaceholder: "যেমন বিক্রম সিং",
    emailLabel: "ইমেইল ঠিকানা (লগইন আইডি)",
    emailPlaceholder: "যেমন vikram@buildsafe.in",
    assignedProject: "নির্ধারিত প্রকল্প",
    allocationBudget: "বরাদ্দ বাজেট (₹)",
    budgetPlaceholder: "যেমন ৩০০০০০",
    onboardDesc: "অনবোর্ডিং ঠিকাদারের ডিজিটাল পরিচয় তৈরি করে, খতিয়ান ব্লকে নথিভুক্ত করে, এবং ডিফল্ট পাসওয়ার্ড দিয়ে সাইন-ইন শংসাপত্র সেট করে",
    recordOnChain: "চেইনে রেকর্ড করুন ও যুক্ত করুন",
  },
};

export default function BuilderView({
  chain, workers, projects, contractors, onAddContractor,
  onUpdateBudget, notionStatus, lang = "en"
}) {
  const t = dict[lang] || dict.en;
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id || "");
  const [budget, setBudget] = useState("");
  const [chainStatus, setChainStatus] = useState(null);

  React.useEffect(() => {
    verifyChain(chain).then(setChainStatus);
  }, [chain]);

  const totalAllocated = projects.reduce((sum, p) => sum + p.wageLocked, 0);
  const totalMasterBudget = contractors.reduce((sum, c) => sum + c.masterBudget, 0);

  const openDisputes = getOpenDisputes(chain);
  const anomalies = detectAnomalies(chain);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !projectId || !budget) return;
    onAddContractor(name.trim(), email.trim(), projectId, Number(budget));
    setName(""); setEmail(""); setBudget(""); setShowForm(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg text-white leading-none font-bold">{t.builderOps}</h2>
          <p className="text-xs text-textMuted font-mono mt-1">{t.builderSubtitle}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary text-dark text-xs font-display px-4 py-2.5 rounded-xl hover:bg-primaryDark hover:scale-[1.02] active:scale-[0.97] transition-all duration-150 shadow-md shrink-0"
        >
          <Plus size={14} /> {t.onboardContractor}
        </button>
      </div>

      {/* Stats Grid — 2 cols on mobile, 4 on md+ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-surface rounded-xl p-3 sm:p-4 border border-border shadow-sm">
          <Landmark size={16} className="text-primary mb-2" />
          <p className="font-display text-lg sm:text-xl text-white">₹{totalMasterBudget.toLocaleString("en-IN")}</p>
          <p className="text-[10px] text-textMuted">{t.masterBudget}</p>
        </div>
        <div className="bg-surface rounded-xl p-3 sm:p-4 border border-border shadow-sm">
          <TrendingUp size={16} className="text-primary mb-2" />
          <p className="font-display text-lg sm:text-xl text-white">₹{totalAllocated.toLocaleString("en-IN")}</p>
          <p className="text-[10px] text-textMuted font-mono">{t.lockedOnChain}</p>
        </div>
        <div className="bg-surface rounded-xl p-3 sm:p-4 border border-border shadow-sm">
          <Users size={16} className="text-textMuted mb-2" />
          <p className="font-display text-lg sm:text-xl text-white">{workers.length}</p>
          <p className="text-[10px] text-textMuted">{t.crewsEnrolled}</p>
        </div>
        <div className="bg-surface rounded-xl p-3 sm:p-4 border border-border shadow-sm">
          <Activity size={16} className="text-danger mb-2" />
          <p className="font-display text-lg sm:text-xl text-white">{anomalies.length}</p>
          <p className="text-[10px] text-textMuted">{t.riskAnomalyFlags}</p>
        </div>
      </div>

      {/* Master Wage Budget Drawdown */}
      <div className="bg-surface rounded-2xl border border-border p-4 sm:p-5 shadow-sm space-y-4">
        <h3 className="font-display text-sm text-white flex items-center gap-2">
          <Landmark size={16} className="text-primary" />
          <span>{t.masterWageLock}</span>
        </h3>
        <div className="space-y-4 divide-y divide-border/50">
          {projects.map((p) => {
            const projectContractor = contractors.find((c) => c.projectId === p.id);
            const budgetMax = projectContractor ? projectContractor.masterBudget : 300000;
            const percent = Math.min(100, Math.round((p.wageLocked / budgetMax) * 100));
            return (
              <div key={p.id} className="pt-3 first:pt-0 space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-1 text-xs">
                  <div className="min-w-0">
                    <span className="font-bold text-white block truncate">{p.name}</span>
                    <p className="text-[10px] text-textMuted font-mono">
                      {t.contractorLabel}: {projectContractor?.name || t.unassigned}
                    </p>
                  </div>
                  <span className="font-mono font-semibold text-white text-right shrink-0 text-[11px]">
                    ₹{p.wageLocked.toLocaleString("en-IN")} {t.of} ₹{budgetMax.toLocaleString("en-IN")} {t.locked} ({percent}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-surface2 rounded-full overflow-hidden border border-border">
                  <div
                    className={`h-full transition-all duration-700 rounded-full ${
                      percent > 85 ? "bg-danger" : percent > 50 ? "bg-primary/80" : "bg-primary"
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-Contractor table */}
      <div className="bg-surface rounded-2xl border border-border p-4 sm:p-5 shadow-sm">
        <h3 className="font-display text-sm text-white mb-3 flex items-center gap-2">
          <Users size={16} /> {t.multiContractorOps}
        </h3>
        {contractors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
            <div className="bg-surface2 p-3 rounded-full">
              <Users size={22} className="text-textMuted" />
            </div>
            <p className="font-display text-xs text-white">{t.noContractorsYet}</p>
            <p className="text-[10px] text-textMuted max-w-[260px]">{t.noContractorsDesc}</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-1 flex items-center gap-1.5 text-[11px] font-display text-primary border border-primary/30 rounded-full px-3 py-1.5 hover:bg-primary/10 hover:border-primary/60 hover:scale-[1.02] active:scale-[0.97] transition-all duration-150"
            >
              <Plus size={12} /> {t.onboardContractor}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full min-w-[520px] text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border font-mono text-textMuted text-[10px] uppercase">
                  <th className="py-2.5 px-1">{t.thContractor}</th>
                  <th className="py-2.5 px-1 hidden sm:table-cell">{t.thSiteProject}</th>
                  <th className="py-2.5 px-1 text-center">{t.thActiveWorkers}</th>
                  <th className="py-2.5 px-1 text-right">{t.thDisbursedWages}</th>
                  <th className="py-2.5 px-1 text-center">{t.thDisputes}</th>
                  <th className="py-2.5 px-1 text-center">{t.thCompliance}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {contractors.map((c) => {
                  const proj = projects.find((p) => p.id === c.projectId);
                  const activeWorkers = workers.filter((w) => w.projectId === c.projectId);
                  const payouts = chain
                    .filter((b) => b.type === "PAYOUT" && activeWorkers.some((w) => w.id === b.data.workerId))
                    .reduce((sum, b) => sum + b.data.amount, 0);
                  const contractorDisputes = openDisputes.filter((d) =>
                    activeWorkers.some((w) => w.id === d.data.workerId)
                  ).length;
                  const hasAnomalies = anomalies.some((a) => {
                    const b0 = chain[a.blocks[0]];
                    const b1 = chain[a.blocks[1]];
                    return (
                      (b0 && activeWorkers.some((w) => w.id === b0.data.workerId)) ||
                      (b1 && activeWorkers.some((w) => w.id === b1.data.workerId))
                    );
                  });
                  return (
                    <tr key={c.id} className="hover:bg-surface2/50 transition-colors">
                      <td className="py-3 px-1 font-semibold text-white">
                        <div className="truncate max-w-[110px]">{c.name}</div>
                        <div className="font-mono text-[9px] text-textMuted truncate max-w-[110px]">{c.email}</div>
                      </td>
                      <td className="py-3 px-1 text-textMuted hidden sm:table-cell truncate max-w-[120px]">{proj?.name || "—"}</td>
                      <td className="py-3 px-1 text-center font-mono text-white">{activeWorkers.length}</td>
                      <td className="py-3 px-1 text-right font-mono font-medium text-primary">₹{payouts.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-1 text-center">
                        <span className={`font-mono px-2 py-0.5 rounded-full text-[10px] ${
                          contractorDisputes > 0 ? "bg-danger/10 text-danger font-bold" : "bg-surface2 text-textMuted"
                        }`}>
                          {contractorDisputes}
                        </span>
                      </td>
                      <td className="py-3 px-1 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium font-mono ${
                          hasAnomalies ? "bg-danger/10 text-danger" : "bg-primary/10 text-primary"
                        }`}>
                          {hasAnomalies ? t.anomalyFlagged : t.compliant}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Compliance Rollup & Anomaly Patterns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Anomaly Pattern Detection */}
        <div className="bg-surface rounded-2xl border border-border p-4 sm:p-5 shadow-sm">
          <p className="font-display text-xs text-danger flex items-center gap-1.5 mb-3 font-bold">
            <AlertTriangle size={14} /> {t.complianceFraud}
          </p>
          {anomalies.length > 0 ? (
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {anomalies.map((a, i) => (
                <div key={i} className="bg-danger/5 border border-danger/30 p-2.5 rounded-lg font-mono text-[10px] text-danger/80 leading-relaxed">
                  <span className="font-bold block">{t.anomalyFlagLabel} #{i+1} ({t.gpsTimestampCollision})</span>
                  Blocks #{a.blocks[0]} & #{a.blocks[1]} — {a.reason}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-textMuted border border-dashed border-border rounded-xl">
              <CheckCircle2 size={20} className="text-primary mx-auto mb-2" />
              <span>{t.noAnomalies}</span>
            </div>
          )}
        </div>

        {/* Ledger Integrity summary */}
        <div className="bg-surface rounded-2xl border border-border p-4 sm:p-5 shadow-sm space-y-4">
          <p className="font-display text-xs text-white flex items-center gap-1.5 font-bold">
            <Link2 size={14} className="text-primary" /> {t.cryptoIntegrity}
          </p>
          <div className="bg-surface2 text-dark rounded-xl p-4 space-y-3 font-mono text-[10px]">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-textMuted">{t.chainHealth}</span>
              <span className="text-primary font-bold">{t.excellent}</span>
            </div>
            <div className="space-y-1">
              <p className="text-textMuted">· {t.activeLedgerBlocks} <span className="text-white font-bold">{chain.length} {t.blocksUnit}</span></p>
              <p className="text-textMuted">· {t.enrolledContractors} <span className="text-white font-bold">{contractors.length} {t.activeUnit}</span></p>
              <p className="text-textMuted">· {t.genesisVerification} <span className="text-primary font-semibold">{t.validated}</span></p>
              <p className="text-textMuted">· {t.lastHash}</p>
              <p className="bg-surface3 p-1.5 rounded text-[8px] break-all select-all text-textMuted leading-tight">
                {chain[chain.length - 1]?.hash || t.genesisHashOnly}
              </p>
            </div>
          </div>
          {chainStatus && (
            <div className="flex items-center gap-2 justify-center text-xs font-mono">
              {chainStatus.valid ? (
                <span className="text-primary flex items-center gap-1 font-semibold">
                  <ShieldCheck size={14} /> {t.chainValidated}
                </span>
              ) : (
                <span className="text-danger flex items-center gap-1 font-bold">
                  <AlertTriangle size={14} /> {t.ledgerTampered} #{chainStatus.brokenAt}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Onboard Contractor Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-dark/80 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-t-2xl sm:rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border chain-drop">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="font-display text-sm text-white font-bold">{t.onboardTitle}</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-textMuted hover:text-white hover:bg-surface2 rounded-lg p-1 transition-all"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white mb-1.5">{t.contractorName}</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.contractorNamePlaceholder}
                  required
                  className="ds-input"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white mb-1.5">{t.emailLabel}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  required
                  className="ds-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white mb-1.5">{t.assignedProject}</label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="ds-input bg-dark"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white mb-1.5">{t.allocationBudget}</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder={t.budgetPlaceholder}
                    required
                    className="ds-input"
                  />
                </div>
              </div>
              <p className="text-[10px] text-textMuted leading-relaxed">
                {t.onboardDesc} <span className="font-mono font-bold text-white">demo123</span>.
              </p>
              <button
                type="submit"
                className="w-full bg-primary text-dark text-xs font-display py-3 rounded-lg hover:bg-primaryDark hover:shadow-md hover:scale-[1.01] active:scale-[0.98] transition-all duration-150 shadow-md"
              >
                {t.recordOnChain}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
