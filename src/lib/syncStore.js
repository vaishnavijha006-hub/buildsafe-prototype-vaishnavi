// LocalStorage based sync mechanism, replacing Notion API integration

export async function getSyncStatus() {
  return { connected: true };
}

export async function syncWorkersFromStore() {
  try {
    const stored = localStorage.getItem("buildsafe_workers_sync");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export async function syncWorkerRoster(worker) {
  try {
    const workers = await syncWorkersFromStore();
    workers.push(worker);
    localStorage.setItem("buildsafe_workers_sync", JSON.stringify(workers));
  } catch (err) {
    console.error("Local sync error (worker):", err);
  }
}

export async function syncProject(project) {
  try {
    const stored = localStorage.getItem("buildsafe_projects_sync");
    const projects = stored ? JSON.parse(stored) : [];
    projects.push(project);
    localStorage.setItem("buildsafe_projects_sync", JSON.stringify(projects));
  } catch (err) {
    console.error("Local sync error (project):", err);
  }
}

export async function syncLedgerEntry(event) {
  try {
    const stored = localStorage.getItem("buildsafe_ledger_sync");
    const ledger = stored ? JSON.parse(stored) : [];
    ledger.push(event);
    localStorage.setItem("buildsafe_ledger_sync", JSON.stringify(ledger));
  } catch (err) {
    console.error("Local sync error (ledger):", err);
  }
}

export async function syncUser(user) {
  try {
    const stored = localStorage.getItem("buildsafe_users_sync");
    const users = stored ? JSON.parse(stored) : [];
    users.push(user);
    localStorage.setItem("buildsafe_users_sync", JSON.stringify(users));
  } catch (err) {
    console.error("Local sync error (user):", err);
  }
}
