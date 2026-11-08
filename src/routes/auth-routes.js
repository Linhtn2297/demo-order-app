import { authenticate, createSession, destroySession, getSessionUser } from "../auth/session.js";
import { permissionsOf } from "../auth/permissions.js";
import { toPublicUser } from "../data/users.js";
import { sendJson } from "../http-utils.js";

// エラーメッセージは spec/画面仕様書.md「1.3 メッセージ」に合わせる
const MESSAGES = {
  INVALID_CREDENTIALS: "IDまたはパスワードが正しくありません",
  REQUIRED: "IDとパスワードを入力してください",
};

export async function handleLogin(req, res, body) {
  const { id, password } = body ?? {};
  if (!id || !password) {
    return sendJson(res, 400, { error: { code: "REQUIRED", message: MESSAGES.REQUIRED } });
  }
  const result = authenticate(id, password);
  if (!result.ok) {
    return sendJson(res, 401, { error: { code: result.code, message: MESSAGES[result.code] } });
  }
  return sendJson(res, 200, { user: toPublicUser(result.user) }, { "Set-Cookie": createSession(result.user) });
}

export async function handleLogout(req, res) {
  return sendJson(res, 200, { ok: true }, { "Set-Cookie": destroySession(req) });
}

export async function handleMe(req, res) {
  const user = getSessionUser(req);
  if (!user) return sendJson(res, 401, { error: { code: "UNAUTHORIZED", message: "ログインしてください" } });
  return sendJson(res, 200, { user: toPublicUser(user), permissions: permissionsOf(user) });
}
