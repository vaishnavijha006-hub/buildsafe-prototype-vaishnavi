import React, { useState } from "react";
import { 
  Users, Landmark, ShieldCheck, AlertTriangle, Plus, X, 
  TrendingUp, Activity, CheckCircle2, Link2, ExternalLink 
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
    thContractor: "Contractor",
    thSiteProject: "Site / Project",
    thActiveWorkers: "Active Workers",
    thDisbursedWages: "Disbursed Wages",
    thDisputes: "Disputes",
    thCompliance: "Compliance",
    anomalyFlagged: "⚠ Anomaly Flagged",
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
    thContractor: "ठेकेदार",
    thSiteProject: "साइट / परियोजना",
    thActiveWorkers: "सक्रिय कर्मचारी",
    thDisbursedWages: "वितरित मज़दूरी",
    thDisputes: "विवाद",
    thCompliance: "अनुपालन",
    anomalyFlagged: "⚠ विसंगति चिह्नित",
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
    thContractor: "ஒப்பந்ததாரர்",
    thSiteProject: "தளம் / திட்டம்",
    thActiveWorkers: "செயலில் தொழிலாளர்",
    thDisbursedWages: "வழங்கிய கூலி",
    thDisputes: "தகராறுகள்",
    thCompliance: "இணக்கம்",
    anomalyFlagged: "⚠ முரண்பாடு குறிக்கப்பட்டது",
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
    thContractor: "ঠিকাদার",
    thSiteProject: "সাইট / প্রকল্প",
    thActiveWorkers: "সক্রিয় শ্রমিক",
    thDisbursedWages: "বিতরিত মজুরি",
    thDisputes: "বিরোধ",
    thCompliance: "সম্মতি",
    anomalyFlagged: "⚠ অসামঞ্জস্য চিহ্নিত",
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

  // Aggregate stats
  const totalAllocated = projects.reduce((sum, p) => sum + p.wageLocked, 0);
  const totalMasterBudget = contractors.reduce((sum, c) => sum + c.masterBudget, 0);
  const totalDisbursed = chain
    .filter((b) => b.type === "PAYOUT")
    .reduce((sum, b) => sum + b.data.amount, 0);
  
  const openDisputes = getOpenDisputes(chain);
  const anomalies = detectAnomalies(chain);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !projectId || !budget) return;
    onAddContractor(name.trim(), email.trim(), projectId, Number(budget));
    setName("");
    setEmail("");
    setBudget("");
    setShowForm(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Action Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg text-bitumen leading-none font-bold">{t.builderOps}</h2>
          <p className="text-xs text-steel font-mono mt-1">{t.builderSubtitle}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-tarp text-white text-xs font-display px-4 py-2.5 rounded-xl hover:bg-tarpLight hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md shrink-0"
        >
          <Plus size={14} /> {t.onboardContractor}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-bitumen/10 shadow-sm">
          <Landmark size={16} className="text-tarp mb-2" />
          <p className="font-display text-xl text-bitumen">₹{totalMasterBudget.toLocaleString("en-IN")}</p>
          <p className="text-[10px] text-steel">{t.masterBudget}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-bitumen/10 shadow-sm">
          <TrendingUp size={16} className="text-safety mb-2" />
          <p className="font-display text-xl text-bitumen">₹{totalAllocated.toLocaleString("en-IN")}</p>
          <p className="text-[10px] text-steel font-mono">{t.lockedOnChain}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-bitumen/10 shadow-sm">
          <Users size={16} className="text-steel mb-2" />
          <p className="font-display text-xl text-bitumen">{workers.length}</p>
          <p className="text-[10px] text-steel">{t.crewsEnrolled}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-bitumen/10 shadow-sm">
          <Activity size={16} className="text-rust mb-2" />
          <p className="font-display text-xl text-bitumen">{anomalies.length}</p>
          <p className="text-[10px] text-steel">{t.riskAnomalyFlags}</p>
        </div>
      </div>

      {/* Master Wage Budget Drawdown Progress */}
      <div className="bg-white rounded-2xl border border-bitumen/10 p-5 shadow-sm space-y-4">
        <h3 className="font-display text-sm text-bitumen flex items-center gap-2">
          <Landmark size={16} className="text-tarp" />
          <span>{t.masterWageLock}</span>
        </h3>
        
        <div className="space-y-4 divide-y divide-bitumen/5">
          {projects.map((p) => {
            const projectContractor = contractors.find((c) => c.projectId === p.id);
            const budgetMax = projectContractor ? projectContractor.masterBudget : 300000;
            const percent = Math.min(100, Math.round((p.wageLocked / budgetMax) * 100));
            
            return (
              <div key={p.id} className="pt-3 first:pt-0 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-bitumen">{p.name}</span>
                    <p className="text-[10px] text-steel font-mono">
                      {t.contractorLabel}: {projectContractor?.name || t.unassigned}
                    </p>
                  </div>
                  <span className="font-mono font-semibold text-bitumen">
                    ₹{p.wageLocked.toLocaleString("en-IN")} {t.of} ₹{budgetMax.toLocaleString("en-IN")} {t.locked} ({percent}%)
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-3 bg-cement rounded-full overflow-hidden border border-bitumen/5">
                  <div 
                    className={`h-full transition-all duration-500 rounded-full ${
                      percent > 85 ? "bg-rust" : percent > 50 ? "bg-tarp" : "bg-safety"
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-Contractor rollups */}
      <div className="bg-white rounded-2xl border border-bitumen/10 p-5 shadow-sm">
        <h3 className="font-display text-sm text-bitumen mb-3 flex items-center gap-2">
          <Users size={16} /> {t.multiContractorOps}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-bitumen/10 font-mono text-steel text-[10px] uppercase">
                <th className="py-2.5">{t.thContractor}</th>
                <th className="py-2.5">{t.thSiteProject}</th>
                <th className="py-2.5 text-center">{t.thActiveWorkers}</th>
                <th className="py-2.5 text-right">{t.thDisbursedWages}</th>
                <th className="py-2.5 text-center">{t.thDisputes}</th>
                <th className="py-2.5 text-center">{t.thCompliance}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bitumen/5">
              {contractors.map((c) => {
                const proj = projects.find((p) => p.id === c.projectId);
                const activeWorkers = workers.filter((w) => w.projectId === c.projectId);
                
                // wages paid
                const payouts = chain
                  .filter((b) => b.type === "PAYOUT" && activeWorkers.some((w) => w.id === b.data.workerId))
                  .reduce((sum, b) => sum + b.data.amount, 0);

                // disputes
                const contractorDisputes = openDisputes.filter((d) => 
                  activeWorkers.some((w) => w.id === d.data.workerId)
                ).length;

                // check if anomaly flags exist for their workers
                const hasAnomalies = anomalies.some((a) => {
                  const b0 = chain[a.blocks[0]];
                  const b1 = chain[a.blocks[1]];
                  return (
                    (b0 && activeWorkers.some((w) => w.id === b0.data.workerId)) ||
                    (b1 && activeWorkers.some((w) => w.id === b1.data.workerId))
                  );
                });

                return (
                  <tr key={c.id} className="hover:bg-bitumen/[0.01] transition-colors">
                    <td className="py-3 font-semibold text-bitumen">
                      <div>{c.name}</div>
                      <div className="font-mono text-[9px] text-steel">{c.email}</div>
                    </td>
                    <td className="py-3 text-steel">{proj?.name || "—"}</td>
                    <td className="py-3 text-center font-mono">{activeWorkers.length}</td>
                    <td className="py-3 text-right font-mono font-medium text-tarp">₹{payouts.toLocaleString("en-IN")}</td>
                    <td className="py-3 text-center">
                      <span className={`font-mono px-2 py-0.5 rounded-full text-[10px] ${
                        contractorDisputes > 0 ? "bg-rust/10 text-rust font-bold" : "bg-cement text-steel"
                      }`}>
                        {contractorDisputes}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium font-mono ${
                        hasAnomalies 
                          ? "bg-rust/10 text-rust" 
                          : "bg-tarp/10 text-tarp"
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
      </div>

      {/* Compliance Rollup & Anomaly Patterns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Anomaly Pattern Detection */}
        <div className="bg-white rounded-2xl border border-bitumen/10 p-5 shadow-sm">
          <p className="font-display text-xs text-rust flex items-center gap-1.5 mb-3 font-bold">
            <AlertTriangle size={14} /> {t.complianceFraud}
          </p>
          {anomalies.length > 0 ? (
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {anomalies.map((a, i) => (
                <div key={i} className="bg-rust/5 border border-rust/15 p-2.5 rounded-lg font-mono text-[10px] text-rust/80 leading-relaxed">
                  <span className="font-bold block">{t.anomalyFlagLabel} #{i+1} ({t.gpsTimestampCollision})</span>
                  Blocks #{a.blocks[0]} & #{a.blocks[1]} — {a.reason}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-steel border border-dashed border-bitumen/10 rounded-xl">
              <CheckCircle2 size={20} className="text-tarp mx-auto mb-2" />
              <span>{t.noAnomalies}</span>
            </div>
          )}
        </div>

        {/* Ledger Integrity & rollup summary */}
        <div className="bg-white rounded-2xl border border-bitumen/10 p-5 shadow-sm space-y-4">
          <p className="font-display text-xs text-bitumen flex items-center gap-1.5 font-bold">
            <Link2 size={14} className="text-tarp" /> {t.cryptoIntegrity}
          </p>
          
          <div className="bg-bitumen text-cement rounded-xl p-4 space-y-3 font-mono text-[10px]">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <span className="text-steel">{t.chainHealth}</span>
              <span className="text-safetyLight font-bold">{t.excellent}</span>
            </div>
            <div className="space-y-1">
              <p>· {t.activeLedgerBlocks} <span className="text-white font-bold">{chain.length} {t.blocksUnit}</span></p>
              <p>· {t.enrolledContractors} <span className="text-white font-bold">{contractors.length} {t.activeUnit}</span></p>
              <p>· {t.genesisVerification} <span className="text-safetyLight font-semibold">{t.validated}</span></p>
              <p>· {t.lastHash}</p>
              <p className="bg-bitumen2 p-1.5 rounded text-[8px] break-all select-all text-steel leading-tight">
                {chain[chain.length - 1]?.hash || t.genesisHashOnly}
              </p>
            </div>
          </div>
          
          {chainStatus && (
            <div className="flex items-center gap-2 justify-center text-xs font-mono">
              {chainStatus.valid ? (
                <span className="text-tarp flex items-center gap-1 font-semibold">
                  <ShieldCheck size={14} /> {t.chainValidated}
                </span>
              ) : (
                <span className="text-rust flex items-center gap-1 font-bold">
                  <AlertTriangle size={14} /> {t.ledgerTampered} #{chainStatus.brokenAt}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Onboard Contractor Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-bitumen/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-bitumen/10 chain-drop">
            <div className="flex items-center justify-between border-b border-bitumen/10 pb-3 mb-4">
              <h3 className="font-display text-sm text-bitumen font-bold">{t.onboardTitle}</h3>
              <button onClick={() => setShowForm(false)} className="text-steel hover:text-bitumen">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-bitumen mb-1.5">{t.contractorName}</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.contractorNamePlaceholder}
                  required
                  className="w-full text-xs border border-bitumen/15 rounded-lg p-2.5 focus:outline-none focus:border-safety"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-bitumen mb-1.5">{t.emailLabel}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  required
                  className="w-full text-xs border border-bitumen/15 rounded-lg p-2.5 focus:outline-none focus:border-safety"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-bitumen mb-1.5">{t.assignedProject}</label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full text-xs border border-bitumen/15 rounded-lg p-2.5 focus:outline-none focus:border-safety bg-white"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-bitumen mb-1.5">{t.allocationBudget}</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder={t.budgetPlaceholder}
                    required
                    className="w-full text-xs border border-bitumen/15 rounded-lg p-2.5 focus:outline-none focus:border-safety"
                  />
                </div>
              </div>

              <p className="text-[10px] text-steel leading-relaxed">
                {t.onboardDesc} <span className="font-mono font-bold text-bitumen">demo123</span>.
              </p>

              <button
                type="submit"
                className="w-full bg-tarp text-white text-xs font-display py-3 rounded-lg hover:bg-tarpLight hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md"
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
