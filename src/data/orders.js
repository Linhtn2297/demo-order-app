// 注文データ（デモ用のインメモリデータ。サーバー再起動で初期状態に戻る）
// status: draft = 下書き, confirmed = 確定, shipped = 出荷済
export const orders = [
  { orderNo: "ORD-0001", orderDate: "2026-09-01", customerName: "株式会社さくら商事", totalAmount: 128000, status: "shipped", createdBy: "admin01" },
  { orderNo: "ORD-0002", orderDate: "2026-09-03", customerName: "さくら運輸株式会社", totalAmount: 54000, status: "shipped", createdBy: "admin01" },
  { orderNo: "ORD-0003", orderDate: "2026-09-10", customerName: "有限会社みどり食品", totalAmount: 32500, status: "confirmed", createdBy: "admin01" },
  { orderNo: "ORD-0004", orderDate: "2026-09-15", customerName: "株式会社青葉システム", totalAmount: 450000, status: "confirmed", createdBy: "admin01" },
  { orderNo: "ORD-0005", orderDate: "2026-09-22", customerName: "青葉物産株式会社", totalAmount: 76000, status: "draft", createdBy: "admin01" },
  { orderNo: "ORD-0006", orderDate: "2026-10-01", customerName: "株式会社さくら商事", totalAmount: 99000, status: "draft", createdBy: "admin01" },
  { orderNo: "ORD-0007", orderDate: "2026-10-05", customerName: "ひまわり工業株式会社", totalAmount: 210000, status: "confirmed", createdBy: "admin01" },
  { orderNo: "ORD-0008", orderDate: "2026-10-12", customerName: "有限会社みどり食品", totalAmount: 18000, status: "draft", createdBy: "admin01" },
];

export function nextOrderNo() {
  const max = orders.reduce((acc, order) => Math.max(acc, Number(order.orderNo.slice(4))), 0);
  return `ORD-${String(max + 1).padStart(4, "0")}`;
}
