// デモ用ユーザー（パスワードは平文。デモ専用のため本番では使用しないこと）
export const users = [
  { id: "admin01", name: "山田 太郎", role: "admin", password: "admin-pass" },
  { id: "sales01", name: "佐藤 花子", role: "sales", password: "sales-pass" },
  { id: "staff01", name: "鈴木 一郎", role: "staff", password: "staff-pass" },
];

export function findUserById(id) {
  return users.find((user) => user.id === id);
}

/** クライアントへ返す項目だけに絞る */
export function toPublicUser(user) {
  return { id: user.id, name: user.name, role: user.role };
}
