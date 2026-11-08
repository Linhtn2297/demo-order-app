import { test } from "node:test";
import assert from "node:assert/strict";
import { searchOrders, saveOrder, OrderError } from "../src/services/order-service.js";
import { can } from "../src/auth/permissions.js";

test("顧客名で検索できる", () => {
  const result = searchOrders({ customerName: "株式会社さくら" });
  assert.deepEqual(result.map((order) => order.orderNo), ["ORD-0006", "ORD-0001"]);
});

test("注文日の範囲とステータスで絞り込める", () => {
  const result = searchOrders({ dateFrom: "2026-09-01", dateTo: "2026-09-30", status: "confirmed" });
  assert.deepEqual(result.map((order) => order.orderNo), ["ORD-0004", "ORD-0003"]);
});

test("出荷済の注文は更新できない", () => {
  assert.throws(
    () => saveOrder({ orderNo: "ORD-0001", orderDate: "2026-09-01", customerName: "株式会社さくら商事", totalAmount: 1 }, { id: "admin01" }),
    (error) => error instanceof OrderError && error.code === "SHIPPED_ORDER_LOCKED",
  );
});

test("注文の保存・削除は管理者のみ", () => {
  assert.equal(can({ role: "admin" }, "order:save"), true);
  assert.equal(can({ role: "sales" }, "order:save"), false);
  assert.equal(can({ role: "staff" }, "order:save"), false);
  assert.equal(can({ role: "sales" }, "order:delete"), false);
});
