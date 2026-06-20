import { Client } from "@notionhq/client";

/**
 * Notion is the system-of-record for BuildSafe:
 * - Workers database  → onboarding & roster
 * - Projects database → site registry & wage terms
 * - Ledger database   → immutable audit trail (mirrors on-chain events)
 * - Users database    → auth registry synced on signup
 */

function getConfig() {
  const apiKey = process.env.NOTION_API_KEY;
  const workersDb = process.env.NOTION_WORKERS_DATABASE_ID;
  const projectsDb = process.env.NOTION_PROJECTS_DATABASE_ID;
  const ledgerDb = process.env.NOTION_LEDGER_DATABASE_ID;
  const usersDb = process.env.NOTION_USERS_DATABASE_ID;

  return {
    configured: Boolean(apiKey && workersDb),
    apiKey,
    workersDb,
    projectsDb,
    ledgerDb,
    usersDb,
  };
}

function client() {
  const { apiKey } = getConfig();
  if (!apiKey) throw new Error("NOTION_API_KEY not configured");
  return new Client({ auth: apiKey });
}

function richText(value) {
  return [{ type: "text", text: { content: String(value ?? "") } }];
}

function readRichText(prop) {
  if (!prop) return "";
  if (prop.type === "title") return prop.title?.[0]?.plain_text ?? "";
  if (prop.type === "rich_text") return prop.rich_text?.[0]?.plain_text ?? "";
  return "";
}

function readNumber(prop) {
  return prop?.type === "number" ? (prop.number ?? 0) : 0;
}

function readDate(prop) {
  return prop?.type === "date" ? (prop.date?.start ?? "") : "";
}

export function notionStatus() {
  const cfg = getConfig();
  return {
    connected: cfg.configured,
    databases: {
      workers: Boolean(cfg.workersDb),
      projects: Boolean(cfg.projectsDb),
      ledger: Boolean(cfg.ledgerDb),
      users: Boolean(cfg.usersDb),
    },
    workspaceUrl: process.env.NOTION_WORKSPACE_URL || null,
  };
}

export async function fetchWorkersFromNotion() {
  const { workersDb } = getConfig();
  if (!workersDb) return [];

  const notion = client();
  const response = await notion.databases.query({ database_id: workersDb });

  return response.results.map((page) => {
    const p = page.properties;
    return {
      notionPageId: page.id,
      id: readRichText(p["Worker ID"] || p["WorkerID"]),
      name: readRichText(p["Name"] || p["Worker Name"]),
      role: readRichText(p["Role"]),
      projectId: readRichText(p["Project ID"] || p["ProjectID"]),
      dailyWage: readNumber(p["Daily Wage"] || p["DailyWage"]),
      phone: readRichText(p["Phone"]) || "—",
      joinedOn: readDate(p["Joined On"] || p["JoinedOn"]) || new Date().toISOString().slice(0, 10),
    };
  }).filter((w) => w.id && w.name);
}

export async function createWorkerInNotion(worker) {
  const { workersDb } = getConfig();
  if (!workersDb) return null;

  const notion = client();
  const page = await notion.pages.create({
    parent: { database_id: workersDb },
    properties: {
      Name: { title: richText(worker.name) },
      "Worker ID": { rich_text: richText(worker.id) },
      Role: { rich_text: richText(worker.role) },
      "Project ID": { rich_text: richText(worker.projectId) },
      "Daily Wage": { number: worker.dailyWage },
      Phone: { rich_text: richText(worker.phone || "—") },
      "Joined On": { date: { start: worker.joinedOn } },
      Status: { select: { name: "Active" } },
    },
  });
  return page.id;
}

export async function createProjectInNotion(project) {
  const { projectsDb } = getConfig();
  if (!projectsDb) return null;

  const notion = client();
  const page = await notion.pages.create({
    parent: { database_id: projectsDb },
    properties: {
      Name: { title: richText(project.name) },
      "Project ID": { rich_text: richText(project.id) },
      Location: { rich_text: richText(project.location || "—") },
      "Wage Locked": { number: project.wageLocked },
      "Start Date": { date: { start: project.startDate } },
      Status: { select: { name: "Active" } },
    },
  });
  return page.id;
}

export async function appendLedgerEventToNotion(event) {
  const { ledgerDb } = getConfig();
  if (!ledgerDb) return null;

  const notion = client();
  const page = await notion.pages.create({
    parent: { database_id: ledgerDb },
    properties: {
      Event: { title: richText(`${event.type} #${event.index}`) },
      Type: { select: { name: event.type } },
      "Block Index": { number: event.index },
      Timestamp: { date: { start: new Date(event.timestamp).toISOString() } },
      "Worker ID": { rich_text: richText(event.data?.workerId || "—") },
      Payload: { rich_text: richText(JSON.stringify(event.data).slice(0, 2000)) },
      Hash: { rich_text: richText(event.hash?.slice(0, 32) || "") },
    },
  });
  return page.id;
}

export async function createUserInNotion(user) {
  const { usersDb } = getConfig();
  if (!usersDb) return null;

  const notion = client();
  const page = await notion.pages.create({
    parent: { database_id: usersDb },
    properties: {
      Name: { title: richText(user.name) },
      Email: { email: user.email },
      Role: { select: { name: user.role === "contractor" ? "Contractor" : "Worker" } },
      "Worker ID": { rich_text: richText(user.workerId || "—") },
      "Signed Up": { date: { start: new Date().toISOString().slice(0, 10) } },
    },
  });
  return page.id;
}
