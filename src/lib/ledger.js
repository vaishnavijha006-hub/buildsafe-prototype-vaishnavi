// BuildSafe core logic
// -----------------------------------------------------------------
// NOTE FOR DEMO / JUDGES:
// This simulates an immutable, hash-chained ledger client-side, the
// same structural guarantee Hyperledger Fabric gives in production
// (each block cryptographically references the previous one, so any
// edit to history is detectable). For the finale build, this module
// is the seam where a real Fabric/Polygon write call would go.
// -----------------------------------------------------------------

// Simple, dependency-free SHA-256 using the browser's native Web Crypto API.
export async function sha256(message) {
  const data = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

const GENESIS_HASH = "0".repeat(64);

export async function createBlock(prevHash, payload) {
  const block = {
    index: payload.index,
    timestamp: payload.timestamp,
    type: payload.type, // 'ATTENDANCE' | 'PAYOUT' | 'PROJECT_CREATED'
    data: payload.data,
    prevHash,
  };
  const hash = await sha256(prevHash + JSON.stringify(block.data) + block.timestamp + block.type);
  return { ...block, hash };
}

export async function appendToChain(chain, type, data) {
  const prevHash = chain.length ? chain[chain.length - 1].hash : GENESIS_HASH;
  const block = await createBlock(prevHash, {
    index: chain.length,
    timestamp: Date.now(),
    type,
    data,
  });
  return [...chain, block];
}

// Verifies every link in the chain re-hashes correctly. If a contractor
// tried to silently edit a past attendance record, this catches it —
// that's the "tamper-proof" guarantee in practice.
export async function verifyChain(chain) {
  for (let i = 0; i < chain.length; i++) {
    const expectedPrev = i === 0 ? GENESIS_HASH : chain[i - 1].hash;
    if (chain[i].prevHash !== expectedPrev) return { valid: false, brokenAt: i };
    const recomputed = await sha256(
      chain[i].prevHash + JSON.stringify(chain[i].data) + chain[i].timestamp + chain[i].type
    );
    if (recomputed !== chain[i].hash) return { valid: false, brokenAt: i };
  }
  return { valid: true, brokenAt: null };
}

// -----------------------------------------------------------------
// ArmorPay-style policy gate.
// Modeled on ArmorPay's real bundle structure (amount thresholds,
// velocity limits, recipient validation) for an AI/automated payment
// agent — here, the smart-contract wage payout agent. Every payout
// must clear this gate before funds are released.
// -----------------------------------------------------------------
export function armorPayPolicyCheck({ amount, dailyWage, recipientId, payoutsToday }) {
  const checks = [];

  // 1. Amount threshold — payout should never exceed agreed daily wage
  const withinThreshold = amount <= dailyWage * 1.05; // 5% tolerance for bonuses
  checks.push({
    id: "amount_threshold",
    label: "Amount threshold",
    pass: withinThreshold,
    detail: withinThreshold
      ? `₹${amount} is within agreed wage band (≤ ₹${Math.round(dailyWage * 1.05)})`
      : `₹${amount} exceeds agreed wage band — blocked`,
  });

  // 2. Velocity limit — no more than 1 payout per worker per day
  const withinVelocity = payoutsToday < 1;
  checks.push({
    id: "velocity_limit",
    label: "Velocity limit",
    pass: withinVelocity,
    detail: withinVelocity
      ? "1 payout today (limit: 1/day) — OK"
      : "Duplicate payout attempt today — blocked",
  });

  // 3. Recipient validation — recipient must be a verified digital ID
  const recipientValid = Boolean(recipientId) && recipientId.startsWith("BSW-");
  checks.push({
    id: "recipient_validation",
    label: "Recipient validation",
    pass: recipientValid,
    detail: recipientValid
      ? `Recipient ${recipientId} is a verified BuildSafe Worker ID`
      : "Recipient ID missing or unverified — blocked",
  });

  const allPass = checks.every((c) => c.pass);
  return { allPass, checks };
}

export function genWorkerId() {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `BSW-${n}`;
}

// Writes a worker's onboarding to the chain — the moment a Digital
// Worker ID is issued. This is the literal "Worker completes
// onboarding and gets a digital ID" step from the pitch, made visible
// in the ledger rather than just a row in a database.
export async function appendOnboarding(chain, { workerId, workerName, role, projectId, dailyWage }) {
  return appendToChain(chain, "WORKER_ONBOARDED", {
    workerId,
    workerName,
    role,
    projectId,
    dailyWage,
  });
}

export function genTxnId() {
  return `UPI${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 900 + 100)}`;
}

export function genDisputeId() {
  return `DSP-${Math.floor(1000 + Math.random() * 9000)}`;
}

// -----------------------------------------------------------------
// Dispute resolution.
// A worker can raise a dispute against a specific ledger block (e.g.
// "I worked this day but was never paid"). The dispute itself is
// also written to the chain, so the act of raising and resolving a
// dispute is part of the same immutable audit trail — there's no
// separate, editable "support ticket" system that a contractor could
// quietly bury.
// -----------------------------------------------------------------
export async function raiseDispute(chain, { workerId, workerName, reason, relatedBlockHash }) {
  return appendToChain(chain, "DISPUTE_RAISED", {
    disputeId: genDisputeId(),
    workerId,
    workerName,
    reason,
    relatedBlockHash: relatedBlockHash || null,
    status: "OPEN",
  });
}

export async function resolveDispute(chain, { disputeId, resolutionNote, outcome }) {
  return appendToChain(chain, "DISPUTE_RESOLVED", {
    disputeId,
    resolutionNote,
    outcome, // 'WAGE_RELEASED' | 'REJECTED' | 'PARTIAL'
    status: "CLOSED",
  });
}

export function getOpenDisputes(chain) {
  const raised = chain.filter((b) => b.type === "DISPUTE_RAISED");
  const resolvedIds = new Set(
    chain.filter((b) => b.type === "DISPUTE_RESOLVED").map((b) => b.data.disputeId)
  );
  return raised.filter((b) => !resolvedIds.has(b.data.disputeId));
}

// -----------------------------------------------------------------
// Lightweight anomaly detection — a teaser for the "AI-based fraud
// detection" item in Future Scope. Flags attendance blocks that share
// near-identical GPS + timestamp across two different worker IDs,
// which would indicate spoofed or proxy check-ins.
// -----------------------------------------------------------------
export function detectAnomalies(chain) {
  const attendance = chain.filter((b) => b.type === "ATTENDANCE");
  const flags = [];
  for (let i = 0; i < attendance.length; i++) {
    for (let j = i + 1; j < attendance.length; j++) {
      const a = attendance[i];
      const b = attendance[j];
      if (a.data.workerId === b.data.workerId) continue;
      const sameGps = a.data.gps === b.data.gps;
      const closeTime = Math.abs(a.timestamp - b.timestamp) < 5000; // within 5s
      if (sameGps && closeTime) {
        flags.push({
          blocks: [a.index, b.index],
          reason: `Identical GPS + near-identical timestamp for ${a.data.workerName} and ${b.data.workerName}`,
        });
      }
    }
  }
  return flags;
}

// -----------------------------------------------------------------
// Work history — builds a per-worker summary from the chain, used
// for the Digital Worker Identity / portable history view.
// -----------------------------------------------------------------
export function buildWorkHistory(chain, workerId) {
  const events = chain.filter((b) => b.data.workerId === workerId);
  const attendanceDays = events.filter((b) => b.type === "ATTENDANCE").length;
  const totalEarned = events
    .filter((b) => b.type === "PAYOUT")
    .reduce((sum, b) => sum + b.data.amount, 0);
  const disputesRaised = events.filter((b) => b.type === "DISPUTE_RAISED").length;
  return { events, attendanceDays, totalEarned, disputesRaised };
}