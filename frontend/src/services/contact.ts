import { apiFetch } from "./api";
import type { ContactMessage, ContactPayload, PaginatedData } from "@/types/api";

export function sendContactMessage(payload: ContactPayload) {
  return apiFetch<ContactMessage>("/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function adminGetContactMessages(status?: string) {
  const query = status && status !== "all" ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch<PaginatedData<ContactMessage>>(`/admin/contact-messages${query}`);
}

export function adminUpdateContactMessageStatus(id: number, status: ContactMessage["status"]) {
  return apiFetch<ContactMessage>(`/admin/contact-messages/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function adminDeleteContactMessage(id: number) {
  return apiFetch<null>(`/admin/contact-messages/${id}`, { method: "DELETE" });
}
