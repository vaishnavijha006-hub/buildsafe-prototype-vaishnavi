import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HardHat, LayoutDashboard, ShieldCheck, LogOut, ExternalLink } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import WorkerView from "../components/WorkerView";
import ContractorView from "../components/ContractorView";
import ArmorPayGate from "../components/ArmorPayGate";
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

  const worker = workers.find((w) => w.id === activeWorkerId) || workers[0];
  const project = projects.find((p) => p.id === worker?.projectId);

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
  };

  const handleResolveDispute = async (disputeId, resolutionNote, outcome) => {
    const updated = await resolveDispute(chain, { disputeId, resolutionNote, outcome });
    setChain(updated);
    syncLedgerToNotion(updated);
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
    </div>
  );
}
