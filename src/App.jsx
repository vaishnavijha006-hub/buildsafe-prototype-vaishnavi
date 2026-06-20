import { useState } from "react";
import { HardHat, LayoutDashboard, ShieldCheck } from "lucide-react";
import WorkerView from "./components/WorkerView";
import ContractorView from "./components/ContractorView";
import ArmorPayGate from "./components/ArmorPayGate";
import { appendToChain, armorPayPolicyCheck, genTxnId, raiseDispute, resolveDispute, getOpenDisputes } from "./lib/ledger";
import { WORKERS, PROJECTS, getWorkerById } from "./lib/seedData";

export default function App() {
  const [view, setView] = useState("worker");
  const [chain, setChain] = useState([]);
  const [lastPayout, setLastPayout] = useState(null);
  const [gateStatus, setGateStatus] = useState(null);
  const [policyResult, setPolicyResult] = useState(null);
  const [tamperFlash, setTamperFlash] = useState(false);

  const [activeWorkerId, setActiveWorkerId] = useState(WORKERS[0].id);
  const [activeProjectId, setActiveProjectId] = useState(PROJECTS[0].id);
  const [projects, setProjects] = useState(PROJECTS);

  const worker = getWorkerById(activeWorkerId);
  const project = projects.find((p) => p.id === worker.projectId);

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
  };

  const handleResolveDispute = async (disputeId, resolutionNote, outcome) => {
    const updated = await resolveDispute(chain, { disputeId, resolutionNote, outcome });
    setChain(updated);
  };

  const handleCreateProject = async (name, wageLocked) => {
    const id = `PRJ-${Math.floor(100 + Math.random() * 900)}`;
    setProjects((prev) => [...prev, { id, name, location: "—", wageLocked, startDate: new Date().toISOString().slice(0, 10) }]);
    const updated = await appendToChain(chain, "PROJECT_CREATED", {
      projectId: id,
      projectName: name,
      wageLocked,
    });
    setChain(updated);
    setActiveProjectId(id);
  };

  const openDisputeForWorker = (workerId) => getOpenDisputes(chain).some((d) => d.data.workerId === workerId);

  return (
    <div className="min-h-screen bg-cement2">
      <header className="bg-bitumen text-cement sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-safety p-1.5 rounded-lg">
              <HardHat size={18} className="text-bitumen" />
            </div>
            <div>
              <p className="font-display text-base leading-none">BuildSafe</p>
              <p className="text-[10px] text-steel font-mono">Wage protection, on the chain</p>
            </div>
          </div>
          <div className="flex bg-bitumen2 rounded-full p-1 gap-1">
            <button
              onClick={() => setView("worker")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                view === "worker" ? "bg-safety text-bitumen" : "text-steel"
              }`}
            >
              <HardHat size={14} /> Worker
            </button>
            <button
              onClick={() => setView("contractor")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                view === "contractor" ? "bg-safety text-bitumen" : "text-steel"
              }`}
            >
              <LayoutDashboard size={14} /> Contractor
            </button>
          </div>
        </div>
      </header>

      {tamperFlash && (
        <div className="bg-rust text-white text-center text-xs font-mono py-2 chain-drop">
          ⚠ Tamper attempt detected — chain hash mismatch flagged below
        </div>
      )}

      <main className="px-4 py-8">
        {view === "worker" ? (
          <WorkerView
            key={worker.id}
            worker={worker}
            workers={WORKERS}
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
            workers={WORKERS}
            projects={projects}
            activeProjectId={activeProjectId}
            onSwitchProject={setActiveProjectId}
            onTamperDemo={handleTamperDemo}
            onResolveDispute={handleResolveDispute}
            onCreateProject={handleCreateProject}
          />
        )}
      </main>

      <footer className="text-center py-6 text-[11px] text-steel font-mono flex items-center justify-center gap-1.5">
        <ShieldCheck size={12} /> Hash-chained ledger · ArmorPay policy-gated payouts
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
