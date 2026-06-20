import { useState, useEffect } from "react";
import {
  Link2, ShieldCheck, ShieldAlert, Users, IndianRupee, Activity,
  ChevronDown, ChevronUp, AlertTriangle, Plus, X, CheckCircle2, XCircle,
} from "lucide-react";
import { verifyChain, getOpenDisputes, detectAnomalies } from "../lib/ledger";

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
        className={`bg-white rounded-xl border-2 ${typeColor} p-3.5 cursor-pointer hover:shadow-md transition-shadow`}
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] bg-bitumen text-cement px-1.5 py-0.5 rounded">
              #{block.index}
            </span>
            <span className="font-display text-[11px] text-bitumen">{typeLabel}</span>
          </div>
          {open ? <ChevronUp size={14} className="text-steel" /> : <ChevronDown size={14} className="text-steel" />}
        </div>
        <p className="text-[11px] text-steel mt-1">
          {block.data.workerName || block.data.projectName || "—"} ·{" "}
          {new Date(block.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        </p>
        {open && (
          <div className="mt-2.5 pt-2.5 border-t border-bitumen/10 space-y-1 font-mono text-[10px] text-steel break-all">
            <p><span className="text-bitumen/50">prevHash:</span> {block.prevHash.slice(0, 24)}…</p>
            <p><span className="text-bitumen/50">hash:</span> {block.hash.slice(0, 24)}…</p>
            <pre className="bg-cement rounded-lg p-2 mt-1 whitespace-pre-wrap">
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

function DisputeCard({ dispute, onResolve }) {
  const [note, setNote] = useState("");
  return (
    <div className="bg-rust/5 border border-rust/30 rounded-xl p-4 chain-drop">
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-mono text-[10px] bg-rust text-white px-1.5 py-0.5 rounded">
          {dispute.data.disputeId}
        </span>
        <span className="text-[11px] text-steel">{dispute.data.workerName}</span>
      </div>
      <p className="text-xs text-bitumen mb-3">{dispute.data.reason}</p>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Resolution note…"
        className="w-full text-xs border border-bitumen/15 rounded-lg p-2 mb-2 focus:outline-none focus:border-tarp"
      />
      <div className="flex gap-2">
        <button
          onClick={() => onResolve(dispute.data.disputeId, note || "Wage released after verification", "WAGE_RELEASED")}
          className="flex-1 flex items-center justify-center gap-1 bg-tarp text-white text-[11px] font-display py-2 rounded-lg hover:bg-tarpLight hover:scale-[1.01] active:scale-[0.99] transition-all duration-150 shadow-sm"
        >
          <CheckCircle2 size={13} /> Release wage
        </button>
        <button
          onClick={() => onResolve(dispute.data.disputeId, note || "Claim rejected after review", "REJECTED")}
          className="flex-1 flex items-center justify-center gap-1 bg-steel text-white text-[11px] font-display py-2 rounded-lg hover:bg-steel/80 hover:scale-[1.01] active:scale-[0.99] transition-all duration-150 shadow-sm"
        >
          <XCircle size={13} /> Reject
        </button>
      </div>
    </div>
  );
}

export default function ContractorView({
  chain, workers, projects, activeProjectId, onSwitchProject,
  onTamperDemo, onResolveDispute, onCreateProject, onAddWorker,
  notionStatus,
}) {
  const [chainStatus, setChainStatus] = useState(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newName, setNewName] = useState("");
  const [newWage, setNewWage] = useState("");
  const [showNewWorker, setShowNewWorker] = useState(false);
  const [workerName, setWorkerName] = useState("");
  const [workerRole, setWorkerRole] = useState("");
  const [workerWage, setWorkerWage] = useState("");

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
      <div className="flex items-center justify-between gap-3 mb-5">
        <button
          onClick={() => setShowNewWorker(true)}
          className="flex items-center gap-2 bg-tarp text-white text-sm font-display px-4 py-2.5 rounded-xl hover:bg-tarpLight hover:scale-[1.01] active:scale-[0.99] transition-all shrink-0 shadow-md"
        >
          <Plus size={16} /> Add new worker
        </button>
        {notionStatus?.connected ? (
          <span className="text-[10px] font-mono text-tarp bg-tarp/10 border border-tarp/20 rounded-full px-3 py-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-tarp animate-pulse" />
            Notion Sync Active
          </span>
        ) : (
          <span className="text-[10px] font-mono text-steel bg-bitumen/5 border border-bitumen/10 rounded-full px-3 py-1.5 flex items-center gap-1.5 cursor-help" title="BuildSafe runs in local-first secure offline mode. Connect Notion database in production.">
            <span className="w-1.5 h-1.5 rounded-full bg-steel/60" />
            Notion Ledger (Offline)
          </span>
        )}
      </div>

      {/* Project switcher */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => onSwitchProject(p.id)}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium border whitespace-nowrap ${
              p.id === activeProjectId
                ? "bg-bitumen text-cement border-bitumen"
                : "bg-white text-steel border-bitumen/10"
            }`}
          >
            {p.name}
          </button>
        ))}
        <button
          onClick={() => setShowNewProject(true)}
          className="shrink-0 px-3 py-2 rounded-full text-xs font-medium border border-dashed border-steel/40 text-steel hover:bg-bitumen/5 hover:border-steel/60 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center gap-1"
        >
          <Plus size={13} /> New site
        </button>
      </div>

      {showNewProject && (
        <div className="bg-white border-2 border-bitumen/10 rounded-2xl p-5 mb-5 chain-drop">
          <div className="flex items-center justify-between mb-3">
            <p className="font-display text-sm text-bitumen">Register new project</p>
            <button onClick={() => setShowNewProject(false)}><X size={16} className="text-steel" /></button>
          </div>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Project name, e.g. Riverside Bridge — Phase 1"
            className="w-full text-sm border border-bitumen/15 rounded-lg p-2.5 mb-2 focus:outline-none focus:border-safety"
          />
          <input
            value={newWage}
            onChange={(e) => setNewWage(e.target.value)}
            type="number"
            placeholder="Wage terms to lock (₹)"
            className="w-full text-sm border border-bitumen/15 rounded-lg p-2.5 mb-3 focus:outline-none focus:border-safety"
          />
          <button
            disabled={!newName.trim() || !newWage}
            onClick={() => {
              onCreateProject(newName.trim(), Number(newWage));
              setNewName(""); setNewWage(""); setShowNewProject(false);
            }}
            className="w-full bg-safety disabled:opacity-40 text-bitumen text-sm font-display py-3 rounded-lg hover:bg-safetyDark hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md"
          >
            LOCK WAGE TERMS ON-CHAIN
          </button>
        </div>
      )}

      {showNewWorker && (
        <div className="bg-white border-2 border-bitumen/10 rounded-2xl p-5 mb-5 chain-drop">
          <div className="flex items-center justify-between mb-3">
            <p className="font-display text-sm text-bitumen">Onboard new worker</p>
            <button onClick={() => setShowNewWorker(false)}><X size={16} className="text-steel" /></button>
          </div>
          <input
            value={workerName}
            onChange={(e) => setWorkerName(e.target.value)}
            placeholder="Worker name, e.g. Mahesh Yadav"
            className="w-full text-sm border border-bitumen/15 rounded-lg p-2.5 mb-2 focus:outline-none focus:border-safety"
          />
          <input
            value={workerRole}
            onChange={(e) => setWorkerRole(e.target.value)}
            placeholder="Role, e.g. Mason, Helper, Electrician"
            className="w-full text-sm border border-bitumen/15 rounded-lg p-2.5 mb-2 focus:outline-none focus:border-safety"
          />
          <input
            value={workerWage}
            onChange={(e) => setWorkerWage(e.target.value)}
            type="number"
            placeholder="Daily wage (₹)"
            className="w-full text-sm border border-bitumen/15 rounded-lg p-2.5 mb-3 focus:outline-none focus:border-safety"
          />
          <p className="text-[11px] text-steel mb-3">
            Onboards to <span className="text-bitumen font-medium">{project?.name}</span>. A Digital Worker ID is issued, the event is written to the ledger, and the roster syncs to Notion.
          </p>
          <button
            disabled={!workerName.trim() || !workerRole.trim() || !workerWage}
            onClick={() => {
              onAddWorker(workerName.trim(), workerRole.trim(), Number(workerWage), activeProjectId);
              setWorkerName(""); setWorkerRole(""); setWorkerWage(""); setShowNewWorker(false);
            }}
            className="w-full bg-tarp disabled:opacity-40 text-white text-sm font-display py-3 rounded-lg hover:bg-tarpLight hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md"
          >
            ISSUE DIGITAL WORKER ID
          </button>
        </div>
      )}

      {/* Stat strip */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 border border-bitumen/10">
          <div className="flex items-center justify-between mb-2">
            <Users size={16} className="text-steel" />
            <button
              onClick={() => setShowNewWorker(true)}
              title="Add worker"
              className="text-steel hover:text-bitumen"
            >
              <Plus size={14} />
            </button>
          </div>
          <p className="font-display text-xl text-bitumen">{projectWorkers.length}</p>
          <p className="text-[11px] text-steel">Active workers</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-bitumen/10">
          <Activity size={16} className="text-safety mb-2" />
          <p className="font-display text-xl text-bitumen">{attendanceToday}</p>
          <p className="text-[11px] text-steel">Attendance marks</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-bitumen/10">
          <IndianRupee size={16} className="text-tarp mb-2" />
          <p className="font-display text-xl text-bitumen">₹{totalPaid}</p>
          <p className="text-[11px] text-steel">Wages disbursed</p>
        </div>
      </div>

      {/* Project + chain integrity */}
      <div className="bg-bitumen text-cement rounded-2xl p-5 mb-6 flex items-center justify-between">
        <div>
          <p className="font-display text-sm">{project?.name}</p>
          <p className="text-[11px] text-steel font-mono mt-0.5">
            {chain.length} total blocks · wage locked ₹{project?.wageLocked}
          </p>
        </div>
        {chainStatus && (
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono ${
              chainStatus.valid ? "bg-tarp/20 text-tarpLight" : "bg-rust/20 text-rust"
            }`}
          >
            {chainStatus.valid ? <ShieldCheck size={13} /> : <ShieldAlert size={13} />}
            {chainStatus.valid ? "Chain verified" : `Tampered at #${chainStatus.brokenAt}`}
          </div>
        )}
      </div>

      {/* Active Workers Roster */}
      <div className="bg-white rounded-2xl border-2 border-bitumen/10 p-5 mb-6 chain-drop">
        <h3 className="font-display text-sm text-bitumen mb-3 flex items-center gap-2">
          <Users size={16} /> Active Workers Roster
        </h3>
        {projectWorkers.length === 0 ? (
          <p className="text-xs text-steel py-4 text-center">No workers onboarded to this project yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-bitumen/10 font-mono text-steel text-[10px] uppercase">
                  <th className="py-2.5">Worker</th>
                  <th className="py-2.5">Role</th>
                  <th className="py-2.5">Contact</th>
                  <th className="py-2.5 text-right">Daily Wage</th>
                  <th className="py-2.5 text-right">Due Wage</th>
                  <th className="py-2.5 text-right">Paid Wage</th>
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
                      <td className="py-3 font-medium text-bitumen">
                        <div>{w.name}</div>
                        <div className="font-mono text-[9px] text-steel">{w.id}</div>
                      </td>
                      <td className="py-3 text-steel">{w.role}</td>
                      <td className="py-3 font-mono text-steel">{w.phone || "—"}</td>
                      <td className="py-3 text-right font-mono text-bitumen">₹{w.dailyWage}</td>
                      <td className="py-3 text-right font-mono font-medium text-rust">
                        ₹{dueWage}
                      </td>
                      <td className="py-3 text-right font-mono text-tarp">₹{paidWage}</td>
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
            <AlertTriangle size={14} /> Anomaly detection flags
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
          <AlertTriangle size={15} className="text-rust" /> Open disputes ({openDisputes.length})
        </p>
        {openDisputes.length > 0 ? (
          <div className="space-y-3">
            {openDisputes.map((d) => (
              <DisputeCard key={d.data.disputeId} dispute={d} onResolve={onResolveDispute} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-bitumen/10 rounded-xl p-5 text-center shadow-sm flex flex-col items-center justify-center gap-1.5 py-6">
            <div className="bg-tarp/10 p-2 rounded-full text-tarp">
              <ShieldCheck size={18} />
            </div>
            <p className="font-display text-xs text-bitumen">No active disputes</p>
            <p className="text-[10px] text-steel max-w-[340px]">All worker attendance records are aligned. No wage claims are currently flagged as contested.</p>
          </div>
        )}
      </div>

      {/* Ledger chain visual */}
      <div className="flex items-center justify-between mb-3">
        <p className="font-display text-sm text-bitumen flex items-center gap-1.5">
          <Link2 size={15} /> Work Ledger
        </p>
        <button
          onClick={onTamperDemo}
          className="text-[11px] font-mono text-rust border border-rust/40 rounded-full px-3 py-1 hover:bg-rust/5 hover:scale-[1.01] active:scale-[0.99] transition-all"
          title="Demo: simulate a contractor trying to edit a past record"
        >
          ⚠ Try tampering (demo)
        </button>
      </div>

      <div className="space-y-0 max-h-[420px] overflow-y-auto pr-1">
        {chain.length === 0 ? (
          <div className="bg-white border border-bitumen/10 rounded-xl p-6 text-center shadow-sm flex flex-col items-center justify-center gap-1.5 py-8">
            <div className="bg-safety/20 p-2.5 rounded-full text-bitumen">
              <Activity size={20} className="animate-pulse" />
            </div>
            <p className="font-display text-xs text-bitumen">Ledger is empty</p>
            <p className="text-[10px] text-steel max-w-[280px]">No blocks have been written to the ledger yet. Worker attendance check-ins will generate the first blocks.</p>
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