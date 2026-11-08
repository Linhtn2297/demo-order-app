// 権限定義
// 仕様: spec/権限一覧.xlsx（シート「権限」）と対応させること。
export const ROLE_LABELS = {
  admin: "管理者",
  sales: "営業部",
  staff: "一般社員",
};

const PERMISSIONS = {
  "order:list": ["admin", "sales", "staff"],
  "order:search": ["admin", "sales", "staff"],
  "order:view": ["admin", "sales", "staff"],
  "order:save": ["admin"], // 新規作成・更新
  "order:delete": ["admin"],
  "user:manage": ["admin"],
};

/** ユーザーが操作を実行できるか判定する */
export function can(user, action) {
  if (!user) return false;
  return (PERMISSIONS[action] ?? []).includes(user.role);
}

/** 画面のボタン表示制御用に、ユーザーが持つ権限の一覧を返す */
export function permissionsOf(user) {
  return Object.keys(PERMISSIONS).filter((action) => can(user, action));
}
