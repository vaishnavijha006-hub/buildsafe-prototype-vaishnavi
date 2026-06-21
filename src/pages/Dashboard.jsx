import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { HardHat, LayoutDashboard, ShieldCheck, LogOut, ExternalLink, Languages, GitBranch, X, History, Landmark } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import WorkerView from "../components/WorkerView";
import ContractorView from "../components/ContractorView";
import BuilderView from "../components/BuilderView";
import ArmorPayGate from "../components/ArmorPayGate";
import Toast from "../components/Toast";
import {
  appendToChain, armorPayPolicyCheck, genTxnId, raiseDispute,
  resolveDispute, getOpenDisputes, genWorkerId, appendOnboarding,
} from "../lib/ledger";
import { WORKERS, PROJECTS } from "../lib/seedData";
import {
  getSyncStatus, syncWorkersFromStore, syncWorkerRoster,
  syncProject, syncLedgerEntry,
} from "../lib/syncStore";

export default function Dashboard({ view }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Strict role-based guards (RBAC) - complete view segregation
  if (!user) return <Navigate to="/login" replace />;
  if (view !== user.role) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  const [lang, setLang] = useState(() => {
    return localStorage.getItem("buildsafe_lang") || "en";
  });
  const [showBuildLog, setShowBuildLog] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const LANG_ORDER = ["en", "hi", "ta", "bn"];
  const LANG_LABELS = { en: "English", hi: "हिंदी", ta: "தமிழ்", bn: "বাংলা" };
  const toggleLang = () => {
    setLang((prev) => {
      const idx = LANG_ORDER.indexOf(prev);
      const next = LANG_ORDER[(idx + 1) % LANG_ORDER.length];
      localStorage.setItem("buildsafe_lang", next);
      return next;
    });
  };

  const [chain, setChain] = useState(() => {
    try {
      const stored = localStorage.getItem("buildsafe_chain");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [lastPayout, setLastPayout] = useState(null);
  const [gateStatus, setGateStatus] = useState(null);
  const [policyResult, setPolicyResult] = useState(null);
  const [tamperFlash, setTamperFlash] = useState(false);
  const [syncStatus, setSyncStatus] = useState({ connected: false });
  const [syncMsg, setSyncMsg] = useState(null);

  const [workers, setWorkers] = useState(() => {
    try {
      const stored = localStorage.getItem("buildsafe_workers");
      return stored ? JSON.parse(stored) : WORKERS;
    } catch {
      return WORKERS;
    }
  });
  const [projects, setProjects] = useState(() => {
    try {
      const stored = localStorage.getItem("buildsafe_projects");
      return stored ? JSON.parse(stored) : PROJECTS;
    } catch {
      return PROJECTS;
    }
  });

  const [contractors, setContractors] = useState(() => {
    try {
      const stored = localStorage.getItem("buildsafe_contractors");
      if (stored) return JSON.parse(stored);
    } catch {}
    const initial = [
      {
        id: "usr-contractor-1",
        name: "Rajesh Sharma",
        email: "contractor@buildsafe.in",
        projectId: "PRJ-101",
        masterBudget: 500000,
      },
      {
        id: "usr-contractor-2",
        name: "Vikram Singh",
        email: "vikram@buildsafe.in",
        projectId: "PRJ-102",
        masterBudget: 300000,
      }
    ];
    localStorage.setItem("buildsafe_contractors", JSON.stringify(initial));
    return initial;
  });

  const [activeWorkerId, setActiveWorkerId] = useState(() => {
    if (user.workerId) return user.workerId;
    return workers[0]?.id || "";
  });
  const [activeProjectId, setActiveProjectId] = useState(() => {
    return projects[0]?.id || "";
  });

  useEffect(() => {
    localStorage.setItem("buildsafe_workers", JSON.stringify(workers));
  }, [workers]);

  useEffect(() => {
    localStorage.setItem("buildsafe_projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("buildsafe_contractors", JSON.stringify(contractors));
  }, [contractors]);

  useEffect(() => {
    localStorage.setItem("buildsafe_chain", JSON.stringify(chain));
  }, [chain]);

  useEffect(() => {
    getSyncStatus().then(setSyncStatus);
    if (view === "contractor") {
      syncWorkersFromStore()
        .then((storedWorkers) => {
          if (storedWorkers?.length) {
            setWorkers((prev) => {
              const existing = new Set(prev.map((w) => w.id));
              const merged = [...prev];
              for (const sw of storedWorkers) {
                if (!existing.has(sw.id)) merged.push(sw);
              }
              return merged;
            });
            setSyncMsg(`Synced ${storedWorkers.length} workers from local record`);
          }
        })
        .catch(() => {});
    }
  }, [view]);

  // Ledger auto-seeding if empty (persists default attendance/payouts so due wages are non-zero)
  useEffect(() => {
    const seed = async () => {
      if (chain.length > 0) return;
      
      let seeded = [];
      // 1. Genesis/Project Created
      seeded = await appendToChain(seeded, "PROJECT_CREATED", {
        projectId: "PRJ-101",
        projectName: "Sector-21 Metro Extension — Site B",
        wageLocked: 187000,
      });
      // 2. Onboard Ramesh Kumar
      seeded = await appendOnboarding(seeded, {
        workerId: "BSW-4821",
        workerName: "Ramesh Kumar",
        role: "Mason",
        projectId: "PRJ-101",
        dailyWage: 650,
      });
      // 3. Onboard Sunita Devi
      seeded = await appendOnboarding(seeded, {
        workerId: "BSW-4822",
        workerName: "Sunita Devi",
        role: "Helper",
        projectId: "PRJ-101",
        dailyWage: 480,
      });
      // 4. Attendance Day 1 Ramesh
      seeded = await appendToChain(seeded, "ATTENDANCE", {
        workerId: "BSW-4821",
        workerName: "Ramesh Kumar",
        project: "Sector-21 Metro Extension — Site B",
        gps: "28.5921°N, 77.2547°E",
        method: "QR_SCAN",
      });
      // 5. Payout Day 1 Ramesh
      seeded = await appendToChain(seeded, "PAYOUT", {
        workerId: "BSW-4821",
        workerName: "Ramesh Kumar",
        amount: 650,
        txnId: "UPI98231456100",
        method: "UPI",
        armorPayVerified: true,
      });
      // 6. Attendance Day 2 Ramesh (Ramesh has 1 unpaid check-in)
      seeded = await appendToChain(seeded, "ATTENDANCE", {
        workerId: "BSW-4821",
        workerName: "Ramesh Kumar",
        project: "Sector-21 Metro Extension — Site B",
        gps: "28.5921°N, 77.2547°E",
        method: "QR_SCAN",
      });
      // 7. Attendance Day 1 Sunita (Sunita has 1 unpaid check-in)
      seeded = await appendToChain(seeded, "ATTENDANCE", {
        workerId: "BSW-4822",
        workerName: "Sunita Devi",
        project: "Sector-21 Metro Extension — Site B",
        gps: "28.5921°N, 77.2547°E",
        method: "QR_SCAN",
      });
      
      setChain(seeded);
      localStorage.setItem("buildsafe_chain", JSON.stringify(seeded));
    };
    
    if (chain.length === 0) {
      seed();
    }
  }, []);
   const worker = workers.find((w) => w.id === activeWorkerId) || workers[0];
  const project = projects.find((p) => p.id === worker?.projectId);

  // Sync lastPayout from chain if state is null but chain has today's payout
  useEffect(() => {
    if (!lastPayout && worker) {
      const activeWorkerPayouts = chain.filter(
        (b) => b.type === "PAYOUT" && b.data.workerId === worker.id
      );
      const lastBlock = activeWorkerPayouts[activeWorkerPayouts.length - 1];
      if (lastBlock && (Date.now() - lastBlock.timestamp < 12 * 60 * 60 * 1000)) {
        setLastPayout({ amount: lastBlock.data.amount, txnId: lastBlock.data.txnId });
      }
    }
  }, [chain, worker, lastPayout]);

 

  const syncLedgerToStore = async (updatedChain) => {
    if (!syncStatus.connected) return;
    const latest = updatedChain[updatedChain.length - 1];
    if (latest) syncLedgerEntry(latest).catch(() => {});
  };

  const handleSwitchWorker = (id) => {
    setActiveWorkerId(id);
    setLastPayout(null);
    setPolicyResult(null);
  };

  const handleAddContractor = async (name, email, projectId, masterBudget) => {
    const id = `usr-contractor-${Date.now()}`;
    const newContractor = {
      id,
      name,
      email: email.toLowerCase(),
      projectId,
      masterBudget: Number(masterBudget),
    };
    
    setContractors((prev) => [...prev, newContractor]);
    
    // Stage contractor user profile in buildsafe_users
    try {
      const storedUsers = localStorage.getItem("buildsafe_users");
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      if (!users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        users.push({
          id,
          email: email.toLowerCase(),
          password: "demo123",
          name,
          role: "contractor",
        });
        localStorage.setItem("buildsafe_users", JSON.stringify(users));
      }
    } catch (e) {
      console.error(e);
    }
    
    // Add to blockchain
    const updated = await appendToChain(chain, "CONTRACTOR_ONBOARDED", {
      contractorId: id,
      contractorName: name,
      projectId,
      masterBudget: Number(masterBudget),
    });
    setChain(updated);
    syncLedgerToStore(updated);
    showToast(`Contractor "${name}" onboarded & credentials created`, "success");
  };

  const handleScanComplete = async () => {
    const updated = await appendToChain(chain, "ATTENDANCE", {
      workerId: worker.id,
      workerName: worker.name,
      project: project?.name,
      gps: "28.5921°N, 77.2547°E",
      method: "QR_SCAN",
    });
    setChain(updated);
    syncLedgerToStore(updated);
    showToast("Attendance marked & registered to ledger", "success");
  };

  const handleClaimWage = () => {
    setGateStatus("checking");
    setTimeout(async () => {
      const payoutsToday = chain.filter(
        (b) => b.type === "PAYOUT" && b.data.workerId === worker.id
      ).length;

      const result = armorPayPolicyCheck({
        amount: worker.dailyWage,
        dailyWage: worker.dailyWage,
        recipientId: worker.id,
        payoutsToday,
      });
      setPolicyResult(result);
      setGateStatus("result");

      if (result.allPass) {
        const txnId = genTxnId();
        const updated = await appendToChain(chain, "PAYOUT", {
          workerId: worker.id,
          workerName: worker.name,
          amount: worker.dailyWage,
          txnId,
          method: "UPI",
          armorPayVerified: true,
        });
        setChain(updated);
        setLastPayout({ amount: worker.dailyWage, txnId });
        syncLedgerToStore(updated);
        showToast("Wage released! Payment sent via UPI", "success");
      } else {
        showToast("ArmorPay policy violation: payment blocked", "error");
      }
    }, 1400);
  };

  const handleTamperDemo = () => {
    if (chain.length === 0) return;
    const tampered = chain.map((b, i) =>
      i === 0 ? { ...b, data: { ...b.data, gps: "TAMPERED_LOCATION" } } : b
    );
    setChain(tampered);
    setTamperFlash(true);
    showToast("Simulating past record editing...", "info");
    setTimeout(() => setTamperFlash(false), 2500);
  };

  const handleRaiseDispute = async (reason) => {
    const updated = await raiseDispute(chain, {
      workerId: worker.id,
      workerName: worker.name,
      reason,
    });
    setChain(updated);
    syncLedgerToStore(updated);
    showToast("Dispute logged immutably on-chain", "success");
  };

  const handleResolveDispute = async (disputeId, resolutionNote, outcome) => {
    const updated = await resolveDispute(chain, { disputeId, resolutionNote, outcome });
    setChain(updated);
    syncLedgerToStore(updated);
    showToast(`Dispute resolved on-chain: ${outcome}`, "success");
  };

  const handleCreateProject = async (name, wageLocked) => {
    const id = `PRJ-${Math.floor(100 + Math.random() * 900)}`;
    const newProject = { id, name, location: "—", wageLocked, startDate: new Date().toISOString().slice(0, 10) };
    setProjects((prev) => [...prev, newProject]);
    const updated = await appendToChain(chain, "PROJECT_CREATED", {
      projectId: id,
      projectName: name,
      wageLocked,
    });
    setChain(updated);
    syncProject(newProject).catch(() => {});
    syncLedgerToStore(updated);
    setActiveProjectId(id);
    showToast(`New site "${name}" registered`, "success");
  };

  const handleAddWorker = async (name, role, dailyWage, projectId, biometricSessionId) => {
    const id = genWorkerId();
    const newWorker = {
      id,
      name,
      role,
      projectId,
      dailyWage,
      phone: "—",
      joinedOn: new Date().toISOString().slice(0, 10),
    };
    setWorkers((prev) => [...prev, newWorker]);
    const updated = await appendOnboarding(chain, {
      workerId: id,
      workerName: name,
      role,
      projectId,
      dailyWage,
      biometricVerified: Boolean(biometricSessionId),
      biometricSessionId: biometricSessionId || null,
    });
    setChain(updated);

    try {
      await syncWorkerRoster(newWorker);
      setSyncMsg(`Worker ${name} synced to local record`);
    } catch {
      setSyncMsg(`Worker ${name} added locally (Sync pending)`);
    }
    syncLedgerToStore(updated);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const openDisputeForWorker = (workerId) => getOpenDisputes(chain).some((d) => d.data.workerId === workerId);

  return (
    <div className="min-h-screen bg-cement2">
      <header className="bg-bitumen text-cement sticky top-0 z-40 shadow-md">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-3 sm:py-3.5 flex items-center justify-between gap-2">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-safety p-1.5 rounded-lg">
              <HardHat size={18} className="text-bitumen" />
            </div>
            <div>
              <p className="font-display text-base leading-none">BuildSafe</p>
              <p className="text-[10px] text-steel font-mono hidden sm:block">Wage protection, on the chain</p>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Build Log — icon only on mobile */}
            <button
              onClick={() => setShowBuildLog(true)}
              className="flex items-center gap-1 text-[10px] font-mono text-steel hover:text-cement hover:bg-white/5 border border-steel/30 rounded-full px-2 sm:px-2.5 py-1 hover:scale-[1.02] active:scale-[0.96] active:bg-white/10 transition-all duration-150"
              title="Build Log"
            >
              <GitBranch size={11} className="text-safety" />
              <span className="hidden sm:inline">Build Log</span>
            </button>
            {/* Language toggle */}
            <button
              onClick={toggleLang}
              title="Toggle Language / भाषा बदलें"
              className="flex items-center gap-1 text-[10px] font-mono bg-tarp/10 hover:bg-tarp/25 active:bg-tarp/40 text-tarpLight border border-tarp/30 hover:border-tarp/50 rounded-full px-2 sm:px-2.5 py-1 transition-all duration-150 hover:scale-[1.02] active:scale-[0.96]"
            >
              <Languages size={11} className="text-safety" />
              <span className="hidden xs:inline sm:inline">{LANG_LABELS[lang]}</span>
            </button>
            {/* User name — hidden on xs */}
            <span className="hidden sm:inline text-[11px] text-steel font-mono truncate max-w-[100px]">
              {user.name}
            </span>
            {/* Role badge — text hidden on mobile, icon only */}
            <div className="flex bg-bitumen2 rounded-full p-0.5 sm:p-1">
              {user.role === "worker" ? (
                <span className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-xs font-medium bg-safety text-bitumen">
                  <HardHat size={13} />
                  <span className="hidden sm:inline">Worker</span>
                </span>
              ) : user.role === "builder" ? (
                <span className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-xs font-medium bg-tarp text-white">
                  <Landmark size={13} />
                  <span className="hidden sm:inline">Builder</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-xs font-medium bg-safety text-bitumen">
                  <LayoutDashboard size={13} />
                  <span className="hidden sm:inline">Contractor</span>
                </span>
              )}
            </div>
            {/* Logout */}
            <button
              onClick={handleLogout}
              title="Sign out"
              className="text-steel hover:text-cement hover:bg-white/10 active:bg-white/20 p-1.5 rounded-lg transition-all duration-150"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {syncMsg && (
        <div className="bg-tarp/10 border-b border-tarp/20 text-center text-xs font-mono text-tarp py-1.5 chain-drop">
          {syncMsg}
        </div>
      )}

      {tamperFlash && (
        <div className="bg-rust text-white text-center text-xs font-mono py-2 chain-drop">
          ⚠ Tamper attempt detected — chain hash mismatch flagged below
        </div>
      )}

      <main className="px-3 sm:px-4 py-5 sm:py-8">
        {view === "worker" ? (
          <WorkerView
            key={worker?.id}
            worker={worker}
            workers={workers}
            project={project}
            chain={chain}
            lang={lang}
            onSwitchWorker={handleSwitchWorker}
            onScanComplete={handleScanComplete}
            onClaimWage={handleClaimWage}
            lastPayout={lastPayout}
            policyResult={policyResult}
            onRaiseDispute={handleRaiseDispute}
            openDisputeForWorker={openDisputeForWorker}
          />
        ) : view === "builder" ? (
          <BuilderView
            chain={chain}
            workers={workers}
            projects={projects}
            contractors={contractors}
            onAddContractor={handleAddContractor}
            syncStatus={syncStatus}
            lang={lang}
          />
        ) : (
          <ContractorView
            chain={chain}
            workers={workers}
            projects={projects}
            activeProjectId={activeProjectId}
            onSwitchProject={setActiveProjectId}
            onTamperDemo={handleTamperDemo}
            onResolveDispute={handleResolveDispute}
            onCreateProject={handleCreateProject}
            onAddWorker={handleAddWorker}
            syncStatus={syncStatus}
            lang={lang}
          />
        )}
      </main>

      <footer className="text-center py-6 text-[11px] text-steel font-mono flex items-center justify-center gap-1.5">
        <ShieldCheck size={12} />
        Hash-chained ledger · ArmorPay policy-gated payouts
        {syncStatus.connected && " · Local sync active"}
      </footer>

      {gateStatus && (
        <ArmorPayGate
          status={gateStatus}
          result={policyResult}
          onClose={() => setGateStatus(null)}
        />
      )}

      {showBuildLog && (
        <div className="fixed inset-0 bg-bitumen/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 chain-drop shadow-2xl border border-bitumen/10">
            <div className="flex items-center justify-between border-b border-bitumen/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <GitBranch className="text-tarp" size={20} />
                <h3 className="font-display text-base text-bitumen">BuildSafe Project Iteration Log</h3>
              </div>
              <button onClick={() => setShowBuildLog(false)} className="text-steel hover:text-bitumen">
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              <div className="relative pl-6 border-l border-bitumen/10 space-y-4">
                {/* Release 1.2.0 */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-safety border-2 border-white ring-2 ring-safety/20" />
                  <span className="text-[10px] font-mono text-steel block">JUNE 20, 2026</span>
                  <span className="font-display text-xs text-bitumen block font-bold">v1.2.0 — Localized Access & Receipts (Current)</span>
                  <p className="text-xs text-steel mt-1 font-normal leading-relaxed">
                    Added Hindi bilingual localization for front-line workers. Implemented secure role-based access checks (RBAC) preventing cross-view access. Rendered dynamic SVG-based site check-in QR codes. Created downloadable, printable smart contract payment receipts with cryptographic hashes and ArmorPay stamps. Protected by ArmorIQ biometric session security.
                  </p>
                </div>

                {/* Release 1.1.0 */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-tarp border-2 border-white" />
                  <span className="text-[10px] font-mono text-steel block">JUNE 15, 2026</span>
                  <span className="font-display text-xs text-bitumen block font-bold">v1.1.0 — ArmorPay Policy Gates</span>
                  <p className="text-xs text-steel mt-1 font-normal leading-relaxed">
                    Integrated automated compliance checks via ArmorPay policy gate (wage bounds, duplicate attendance block velocity bounds, and identity verification checks) before releasing payments.
                  </p>
                </div>

                {/* Release 1.0.0 */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-steel border-2 border-white" />
                  <span className="text-[10px] font-mono text-steel block">JUNE 05, 2026</span>
                  <span className="font-display text-xs text-bitumen block font-bold">v1.0.0 — Immutable Ledger & Local Storage Sync</span>
                  <p className="text-xs text-steel mt-1 font-normal leading-relaxed">
                    Engineered client-side cryptographic ledger chain mimicking Hyperledger Fabric tamper-proof validations. Completed local storage integration for syncing worker profiles and logging real-time ledger blocks.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-bitumen/10 flex items-center justify-between text-[10px] font-mono text-steel">
              <span>Local Sync Active</span>
              <span className="text-steel italic">Local Mock Mode</span>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
