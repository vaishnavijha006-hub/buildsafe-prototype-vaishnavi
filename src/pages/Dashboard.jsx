import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { HardHat, LayoutDashboard, ShieldCheck, LogOut, ExternalLink, Languages, GitBranch, X, History } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import WorkerView from "../components/WorkerView";
import ContractorView from "../components/ContractorView";
import ArmorPayGate from "../components/ArmorPayGate";
import Toast from "../components/Toast";
import {
  appendToChain, armorPayPolicyCheck, genTxnId, raiseDispute,
  resolveDispute, getOpenDisputes, genWorkerId, appendOnboarding,
} from "../lib/ledger";
import { WORKERS, PROJECTS } from "../lib/seedData";
import {
  getNotionStatus, syncWorkersFromNotion, pushWorkerToNotion,
  pushProjectToNotion, pushLedgerEventToNotion,
} from "../lib/notionClient";

export default function Dashboard({ view }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Strict role-based guards (RBAC)
  if (!user) return <Navigate to="/login" replace />;
  if (view === "worker" && user.role !== "worker") {
    return <Navigate to="/contractor" replace />;
  }
  if (view === "contractor" && user.role !== "contractor") {
    return <Navigate to="/worker" replace />;
  }

  const [lang, setLang] = useState(() => {
    return localStorage.getItem("buildsafe_lang") || "en";
  });
  const [showBuildLog, setShowBuildLog] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const toggleLang = () => {
    setLang((prev) => {
      const next = prev === "en" ? "hi" : "en";
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
  const [notionStatus, setNotionStatus] = useState({ connected: false });
  const [notionSyncMsg, setNotionSyncMsg] = useState(null);

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

  const [activeWorkerId, setActiveWorkerId] = useState(() => {
    if (user.workerId) return user.workerId;
    return workers[0]?.id || "";
  });
  const [activeProjectId, setActiveProjectId] = useState(() => {
    return projects[0]?.id || "";
  });

  const worker = workers.find((w) => w.id === activeWorkerId) || workers[0];
  const project = projects.find((p) => p.id === worker?.projectId);

  useEffect(() => {
    localStorage.setItem("buildsafe_workers", JSON.stringify(workers));
  }, [workers]);

  useEffect(() => {
    localStorage.setItem("buildsafe_projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("buildsafe_chain", JSON.stringify(chain));
  }, [chain]);

  useEffect(() => {
    getNotionStatus().then(setNotionStatus);
    if (view === "contractor") {
      syncWorkersFromNotion()
        .then((notionWorkers) => {
          if (notionWorkers?.length) {
            setWorkers((prev) => {
              const existing = new Set(prev.map((w) => w.id));
              const merged = [...prev];
              for (const nw of notionWorkers) {
                if (!existing.has(nw.id)) merged.push(nw);
              }
              return merged;
            });
            setNotionSyncMsg(`Synced ${notionWorkers.length} workers from Notion`);
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

  const syncLedgerToNotion = async (updatedChain) => {
    if (!notionStatus.connected) return;
    const latest = updatedChain[updatedChain.length - 1];
    if (latest) pushLedgerEventToNotion(latest).catch(() => {});
  };

  const handleSwitchWorker = (id) => {
    setActiveWorkerId(id);
    setLastPayout(null);
    setPolicyResult(null);
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
    syncLedgerToNotion(updated);
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
        syncLedgerToNotion(updated);
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
    syncLedgerToNotion(updated);
    showToast("Dispute logged immutably on-chain", "success");
  };

  const handleResolveDispute = async (disputeId, resolutionNote, outcome) => {
    const updated = await resolveDispute(chain, { disputeId, resolutionNote, outcome });
    setChain(updated);
    syncLedgerToNotion(updated);
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
    pushProjectToNotion(newProject).catch(() => {});
    syncLedgerToNotion(updated);
    setActiveProjectId(id);
    showToast(`New site "${name}" registered`, "success");
  };

  const handleAddWorker = async (name, role, dailyWage, projectId) => {
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
    });
    setChain(updated);

    try {
      await pushWorkerToNotion(newWorker);
      setNotionSyncMsg(`Worker ${name} synced to Notion`);
    } catch {
      setNotionSyncMsg(`Worker ${name} added locally (Notion sync pending)`);
    }
    syncLedgerToNotion(updated);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const openDisputeForWorker = (workerId) => getOpenDisputes(chain).some((d) => d.data.workerId === workerId);

  return (
    <div className="min-h-screen bg-cement2">
      <header className="bg-bitumen text-cement sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="bg-safety p-1.5 rounded-lg">
              <HardHat size={18} className="text-bitumen" />
            </div>
            <div>
              <p className="font-display text-base leading-none">BuildSafe</p>
              <p className="text-[10px] text-steel font-mono">Wage protection, on the chain</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {notionStatus.connected && (
              <a
                href={notionStatus.workspaceUrl || "https://notion.so"}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-steel hover:text-cement border border-steel/30 rounded-full px-2.5 py-1"
              >
                <ExternalLink size={11} /> Notion
              </a>
            )}
            <button
              onClick={() => setShowBuildLog(true)}
              className="flex items-center gap-1 text-[10px] font-mono text-steel hover:text-cement border border-steel/30 rounded-full px-2.5 py-1 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <GitBranch size={11} className="text-safety" /> Build Log
            </button>
            <button
              onClick={toggleLang}
              title="Toggle Language / भाषा बदलें"
              className="flex items-center gap-1 text-[10px] font-mono bg-tarp/10 hover:bg-tarp/20 text-tarpLight border border-tarp/30 rounded-full px-2.5 py-1 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <Languages size={11} className="text-safety" /> {lang === "en" ? "हिंदी" : "English"}
            </button>
            <span className="hidden sm:inline text-[11px] text-steel font-mono truncate max-w-[120px]">
              {user.name}
            </span>
            <div className="flex bg-bitumen2 rounded-full p-1 gap-1">
              {user.role === "worker" ? (
                <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-safety text-bitumen">
                  <HardHat size={14} /> Worker
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-safety text-bitumen">
                  <LayoutDashboard size={14} /> Contractor
                </span>
              )}
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="text-steel hover:text-cement p-1.5"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {notionSyncMsg && (
        <div className="bg-tarp/10 border-b border-tarp/20 text-center text-xs font-mono text-tarp py-1.5 chain-drop">
          {notionSyncMsg}
        </div>
      )}

      {tamperFlash && (
        <div className="bg-rust text-white text-center text-xs font-mono py-2 chain-drop">
          ⚠ Tamper attempt detected — chain hash mismatch flagged below
        </div>
      )}

      <main className="px-4 py-8">
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
            notionStatus={notionStatus}
          />
        )}
      </main>

      <footer className="text-center py-6 text-[11px] text-steel font-mono flex items-center justify-center gap-1.5">
        <ShieldCheck size={12} />
        Hash-chained ledger · ArmorPay policy-gated payouts
        {notionStatus.connected && " · Notion workspace connected"}
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
                  <span className="font-display text-xs text-bitumen block font-bold">v1.0.0 — Immutable Ledger & Notion Roster Sync</span>
                  <p className="text-xs text-steel mt-1 font-normal leading-relaxed">
                    Engineered client-side cryptographic ledger chain mimicking Hyperledger Fabric tamper-proof validations. Completed Notion integration for syncing worker profiles and logging real-time ledger blocks.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-bitumen/10 flex items-center justify-between text-[10px] font-mono text-steel">
              <span>Notion Workspace Connected</span>
              {notionStatus?.connected && notionStatus?.workspaceUrl ? (
                <a 
                  href={notionStatus.workspaceUrl}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-tarp hover:underline font-bold flex items-center gap-0.5"
                >
                  View Notion Board <ExternalLink size={10} />
                </a>
              ) : (
                <span className="text-steel italic">Local Mock Mode</span>
              )}
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
