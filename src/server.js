import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { handleLogin, handleLogout, handleMe } from "./routes/auth-routes.js";
import { handleDeleteOrder, handleGetOrder, handleSaveOrder, handleSearchOrders } from "./routes/order-routes.js";
import { readJsonBody, sendJson } from "./http-utils.js";

const PORT = Number(process.env.PORT ?? 4000);
const PUBLIC_DIR = fileURLToPath(new URL("../public/", import.meta.url));
const CONTENT_TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8" };

const routes = [
  ["POST", "/api/login", handleLogin],
  ["POST", "/api/logout", handleLogout],
  ["GET", "/api/me", handleMe],
  ["GET", "/api/orders", handleSearchOrders],
  ["POST", "/api/orders", handleSaveOrder],
  ["GET", "/api/orders/:orderNo", handleGetOrder],
  ["DELETE", "/api/orders/:orderNo", handleDeleteOrder],
];

function matchRoute(method, pathname) {
  for (const [routeMethod, pattern, handler] of routes) {
    if (routeMethod !== method) continue;
    const names = [];
    const regex = new RegExp(`^${pattern.replace(/:(\w+)/g, (_, name) => { names.push(name); return "([^/]+)"; })}$`);
    const match = regex.exec(pathname);
    if (match) return { handler, params: Object.fromEntries(names.map((name, i) => [name, decodeURIComponent(match[i + 1])])) };
  }
  return undefined;
}

async function serveStatic(res, pathname) {
  const file = normalize(join(PUBLIC_DIR, pathname === "/" ? "login.html" : pathname));
  if (!file.startsWith(PUBLIC_DIR)) return sendJson(res, 404, { error: { code: "NOT_FOUND" } });
  try {
    const content = await readFile(file);
    res.writeHead(200, { "Content-Type": CONTENT_TYPES[extname(file)] ?? "application/octet-stream" });
    res.end(content);
  } catch {
    sendJson(res, 404, { error: { code: "NOT_FOUND" } });
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    const route = matchRoute(req.method, url.pathname);
    if (!route) return await serveStatic(res, url.pathname);
    const body = req.method === "POST" ? await readJsonBody(req) : undefined;
    await route.handler(req, res, body, url, route.params);
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: { code: "INTERNAL_ERROR", message: "システムエラーが発生しました" } });
  }
});

server.listen(PORT, "127.0.0.1", () => console.log(`demo-order-app: http://127.0.0.1:${PORT}`));
