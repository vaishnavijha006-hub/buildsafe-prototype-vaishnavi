import { loadEnv } from "vite";
import {
  notionStatus,
  fetchWorkersFromNotion,
  createWorkerInNotion,
  createProjectInNotion,
  appendLedgerEventToNotion,
  createUserInNotion,
} from "./notionService.js";

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => { data += chunk; });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

export function notionApiPlugin(mode) {
  return {
    name: "buildsafe-notion-api",
    configureServer(server) {
      const env = loadEnv(mode, process.cwd(), "");
      Object.assign(process.env, env);

      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/notion")) return next();

        const url = new URL(req.url, "http://localhost");
        const path = url.pathname;

        try {
          if (path === "/api/notion/status" && req.method === "GET") {
            return sendJson(res, 200, notionStatus());
          }

          if (path === "/api/notion/workers" && req.method === "GET") {
            const workers = await fetchWorkersFromNotion();
            return sendJson(res, 200, { workers });
          }

          if (path === "/api/notion/workers" && req.method === "POST") {
            const body = await readBody(req);
            const pageId = await createWorkerInNotion(body);
            return sendJson(res, 201, { ok: true, notionPageId: pageId });
          }

          if (path === "/api/notion/projects" && req.method === "POST") {
            const body = await readBody(req);
            const pageId = await createProjectInNotion(body);
            return sendJson(res, 201, { ok: true, notionPageId: pageId });
          }

          if (path === "/api/notion/ledger" && req.method === "POST") {
            const body = await readBody(req);
            const pageId = await appendLedgerEventToNotion(body);
            return sendJson(res, 201, { ok: true, notionPageId: pageId });
          }

          if (path === "/api/notion/users" && req.method === "POST") {
            const body = await readBody(req);
            const pageId = await createUserInNotion(body);
            return sendJson(res, 201, { ok: true, notionPageId: pageId });
          }

          sendJson(res, 404, { error: "Not found" });
        } catch (err) {
          console.error("[Notion API]", err.message);
          sendJson(res, 500, { error: err.message });
        }
      });
    },
  };
}
