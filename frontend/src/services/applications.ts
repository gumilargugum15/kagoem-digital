import { apiFetch } from "./api";
import type { Application } from "@/types/api";

export function adminGetApplications() {
  return apiFetch<Application[]>("/admin/applications");
}

export function adminCreateApplication(payload: Partial<Application>) {
  return apiFetch<Application>("/admin/applications", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function adminUpdateApplication(id: number, payload: Partial<Application>) {
  return apiFetch<Application>(`/admin/applications/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
