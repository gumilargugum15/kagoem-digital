import { apiFetch } from "./api";
import type { Service } from "@/types/api";

export function getServices() {
  return apiFetch<Service[]>("/services");
}

export function adminGetServices() {
  return apiFetch<Service[]>("/admin/services");
}

export function adminGetService(id: number) {
  return apiFetch<Service>(`/admin/services/${id}`);
}

export function adminCreateService(payload: Partial<Service>) {
  return apiFetch<Service>("/admin/services", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function adminUpdateService(id: number, payload: Partial<Service>) {
  return apiFetch<Service>(`/admin/services/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function adminDeleteService(id: number) {
  return apiFetch<null>(`/admin/services/${id}`, { method: "DELETE" });
}
