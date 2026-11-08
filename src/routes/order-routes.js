import { can } from "../auth/permissions.js";
import { getSessionUser } from "../auth/session.js";
import { deleteOrder, getOrder, OrderError, saveOrder, searchOrders } from "../services/order-service.js";
import { sendJson } from "../http-utils.js";

/** GET /api/orders?customerName=&dateFrom=&dateTo=&status= */
export async function handleSearchOrders(req, res, _body, url) {
  const user = requireUser(req, res, "order:search");
  if (!user) return;
  const criteria = Object.fromEntries(["customerName", "dateFrom", "dateTo", "status"]
    .map((key) => [key, url.searchParams.get(key) ?? undefined]));
  return sendJson(res, 200, { orders: searchOrders(criteria) });
}

/** GET /api/orders/:orderNo */
export async function handleGetOrder(req, res, _body, _url, params) {
  if (!requireUser(req, res, "order:view")) return;
  const order = getOrder(params.orderNo);
  if (!order) return sendJson(res, 404, { error: { code: "NOT_FOUND", message: "注文が見つかりません" } });
  return sendJson(res, 200, { order });
}

/** POST /api/orders （新規作成・更新） */
export async function handleSaveOrder(req, res, body) {
  const user = requireUser(req, res, "order:save");
  if (!user) return;
  return withOrderErrors(res, () => sendJson(res, 200, { order: saveOrder(body ?? {}, user) }));
}

/** DELETE /api/orders/:orderNo */
export async function handleDeleteOrder(req, res, _body, _url, params) {
  if (!requireUser(req, res, "order:delete")) return;
  return withOrderErrors(res, () => {
    deleteOrder(params.orderNo);
    return sendJson(res, 200, { ok: true });
  });
}

function requireUser(req, res, action) {
  const user = getSessionUser(req);
  if (!user) {
    sendJson(res, 401, { error: { code: "UNAUTHORIZED", message: "ログインしてください" } });
    return undefined;
  }
  if (!can(user, action)) {
    sendJson(res, 403, { error: { code: "FORBIDDEN", message: "この操作を行う権限がありません" } });
    return undefined;
  }
  return user;
}

function withOrderErrors(res, action) {
  try {
    return action();
  } catch (error) {
    if (!(error instanceof OrderError)) throw error;
    const status = error.code === "NOT_FOUND" ? 404 : error.code === "VALIDATION_ERROR" ? 400 : 409;
    return sendJson(res, status, { error: { code: error.code, message: error.message } });
  }
}
