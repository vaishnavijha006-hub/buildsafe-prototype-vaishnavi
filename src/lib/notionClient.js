const BASE = "/api/notion";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Notion API error (${res.status})`);
  return data;
}

export async function getNotionStatus() {
  try {
    return await request("/status");
  } catch {
    return { connected: false, databases: {} };
  }
}

export async function syncWorkersFromNotion() {
  const { workers } = await request("/workers");
  return workers;
}

export async function pushWorkerToNotion(worker) {
  return request("/workers", { method: "POST", body: JSON.stringify(worker) });
}

export async function pushProjectToNotion(project) {
  return request("/projects", { method: "POST", body: JSON.stringify(project) });
}

export async function pushLedgerEventToNotion(event) {
  return request("/ledger", { method: "POST", body: JSON.stringify(event) });
}

export async function pushUserToNotion(user) {
  return request("/users", { method: "POST", body: JSON.stringify(user) });
}
