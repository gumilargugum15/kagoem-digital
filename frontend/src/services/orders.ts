import { apiFetch } from "./api";
import type { Order, PaginatedData } from "@/types/api";

export function checkout(phone?: string) {
  return apiFetch<Order>("/checkout", {
    method: "POST",
    body: JSON.stringify(phone ? { phone } : {}),
  });
}

export interface OrderListParams {
  page?: number;
  search?: string;
  status?: string;
}

export function getOrders(params: OrderListParams = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.search) query.set("search", params.search);
  if (params.status && params.status !== "all") query.set("status", params.status);
  const qs = query.toString();
  return apiFetch<PaginatedData<Order>>(`/orders${qs ? `?${qs}` : ""}`);
}

export function getOrder(orderNumber: string) {
  return apiFetch<Order>(`/orders/${orderNumber}`);
}

export interface CreatePaymentResult {
  order_number: string;
  snap_token: string;
}

export function createPayment(orderNumber: string) {
  return apiFetch<CreatePaymentResult>(`/orders/${orderNumber}/payment`, {
    method: "POST",
  });
}

export function adminGetOrders(page = 1) {
  return apiFetch<PaginatedData<Order>>(`/admin/orders?page=${page}`);
}

export function adminGetOrder(orderNumber: string) {
  return apiFetch<Order>(`/admin/orders/${orderNumber}`);
}
