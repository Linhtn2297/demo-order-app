const STATUS_LABELS = { draft: "下書き", confirmed: "確定", shipped: "出荷済" };
const form = document.getElementById("search-form");
const rows = document.getElementById("order-rows");
let permissions = [];

async function init() {
  const res = await fetch("/api/me");
  if (!res.ok) {
    location.href = "/login.html";
    return;
  }
  const me = await res.json();
  permissions = me.permissions;
  document.getElementById("current-user").textContent = me.user.name;
  // ボタンの表示は権限に従う（spec/権限一覧.xlsx）
  document.getElementById("new-order").hidden = !permissions.includes("order:save");
  await search();
}

async function search() {
  const params = new URLSearchParams([...new FormData(form)].filter(([, value]) => value !== ""));
  const res = await fetch(`/api/orders?${params}`);
  const { orders } = await res.json();
  document.getElementById("result-count").textContent = `${orders.length}件`;
  rows.replaceChildren(...orders.map(renderRow));
}

function renderRow(order) {
  const tr = document.createElement("tr");
  const cells = [order.orderNo, order.orderDate, order.customerName, `¥${order.totalAmount.toLocaleString("ja-JP")}`, STATUS_LABELS[order.status]];
  for (const value of cells) {
    const td = document.createElement("td");
    td.textContent = value;
    tr.append(td);
  }
  const actions = document.createElement("td");
  if (permissions.includes("order:save") && order.status !== "shipped") actions.append(button("編集", () => alert(`編集画面は未実装です: ${order.orderNo}`)));
  if (permissions.includes("order:delete")) actions.append(button("削除", () => remove(order.orderNo)));
  tr.append(actions);
  return tr;
}

function button(label, onClick) {
  const element = document.createElement("button");
  element.type = "button";
  element.textContent = label;
  element.addEventListener("click", onClick);
  return element;
}

async function remove(orderNo) {
  if (!confirm(`${orderNo} を削除しますか？`)) return;
  await fetch(`/api/orders/${encodeURIComponent(orderNo)}`, { method: "DELETE" });
  await search();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  search();
});
document.getElementById("logout").addEventListener("click", async () => {
  await fetch("/api/logout", { method: "POST" });
  location.href = "/login.html";
});

init();
