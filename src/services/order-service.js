import { nextOrderNo, orders } from "../data/orders.js";

export class OrderError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

const STATUSES = ["draft", "confirmed", "shipped"];
const MAX_RESULTS = 100;

/**
 * 注文を検索する。
 * @param {{ customerName?: string, dateFrom?: string, dateTo?: string, status?: string }} criteria
 */
export function searchOrders(criteria = {}) {
  const customerName = criteria.customerName?.trim();
  return orders
    .filter((order) => !customerName || order.customerName.startsWith(customerName))
    .filter((order) => !criteria.dateFrom || order.orderDate >= criteria.dateFrom)
    .filter((order) => !criteria.dateTo || order.orderDate <= criteria.dateTo)
    .filter((order) => !criteria.status || order.status === criteria.status)
    .sort((a, b) => b.orderDate.localeCompare(a.orderDate) || b.orderNo.localeCompare(a.orderNo))
    .slice(0, MAX_RESULTS);
}

export function getOrder(orderNo) {
  return orders.find((order) => order.orderNo === orderNo);
}

/**
 * 注文を保存する（orderNo なし: 新規作成、あり: 更新）。
 * 出荷済の注文は更新できない。
 */
export function saveOrder(input, user) {
  validate(input);
  if (!input.orderNo) {
    const order = { ...pick(input), orderNo: nextOrderNo(), status: "draft", createdBy: user.id };
    orders.push(order);
    return order;
  }
  const existing = getOrder(input.orderNo);
  if (!existing) throw new OrderError("NOT_FOUND", "注文が見つかりません");
  if (existing.status === "shipped") throw new OrderError("SHIPPED_ORDER_LOCKED", "出荷済の注文は変更できません");
  Object.assign(existing, pick(input));
  return existing;
}

export function deleteOrder(orderNo) {
  const index = orders.findIndex((order) => order.orderNo === orderNo);
  if (index < 0) throw new OrderError("NOT_FOUND", "注文が見つかりません");
  orders.splice(index, 1);
}

function validate(input) {
  if (!input.customerName?.trim()) throw new OrderError("VALIDATION_ERROR", "顧客名は必須です");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.orderDate ?? "")) throw new OrderError("VALIDATION_ERROR", "注文日の形式が正しくありません");
  if (!Number.isInteger(input.totalAmount) || input.totalAmount < 0) throw new OrderError("VALIDATION_ERROR", "合計金額は0以上の整数で入力してください");
  if (input.status && !STATUSES.includes(input.status)) throw new OrderError("VALIDATION_ERROR", "ステータスが正しくありません");
}

function pick(input) {
  return {
    orderDate: input.orderDate,
    customerName: input.customerName.trim(),
    totalAmount: input.totalAmount,
    ...(input.status ? { status: input.status } : {}),
  };
}
