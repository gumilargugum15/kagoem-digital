import { apiFetch } from "./api";
import type { Order, PaginatedData } from "@/types/api";

export function checkout(phone?: string) {
  return apiFetch<Order>("/checkout", {
    method: "POST",
    body: JSON.stringify(phone ? { phone } : {}),
  });
}

export function getOrders(page = 1) {
  return apiFetch<PaginatedData<Order>>(`/orders?page=${page}`);
}

export function getOrder(orderNumber: string) {
  return apiFetch<Order>(`/orders/${orderNumber}`);
}

export function adminGetOrders(page = 1) {
  return apiFetch<PaginatedData<Order>>(`/admin/orders?page=${page}`);
}

export function adminGetOrder(orderNumber: string) {
  return apiFetch<Order>(`/admin/orders/${orderNumber}`);
}
