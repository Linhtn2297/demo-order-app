import { randomUUID } from "node:crypto";
import { findUserById } from "../data/users.js";

// セッションはメモリ上で管理する（デモ用）
const sessions = new Map();
const COOKIE_NAME = "sid";

/**
 * ID とパスワードで認証する。
 * 失敗時はどちらが誤っているかを区別せず INVALID_CREDENTIALS を返す。
 */
export function authenticate(id, password) {
  const user = findUserById(id);
  if (!user || user.password !== password) {
    return { ok: false, code: "INVALID_CREDENTIALS" };
  }
  return { ok: true, user };
}

export function createSession(user) {
  const sid = randomUUID();
  sessions.set(sid, user.id);
  return `${COOKIE_NAME}=${sid}; HttpOnly; Path=/; SameSite=Lax`;
}

export function destroySession(req) {
  const sid = readSessionId(req);
  if (sid) sessions.delete(sid);
  return `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0`;
}

/** リクエストの Cookie からログイン中のユーザーを取得する。未ログインなら undefined */
export function getSessionUser(req) {
  const sid = readSessionId(req);
  const userId = sid ? sessions.get(sid) : undefined;
  return userId ? findUserById(userId) : undefined;
}

function readSessionId(req) {
  const cookie = req.headers.cookie ?? "";
  const match = cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`));
  return match?.slice(COOKIE_NAME.length + 1) || undefined;
}
