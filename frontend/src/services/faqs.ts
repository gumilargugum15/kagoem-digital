import { apiFetch } from "./api";
import type { Faq } from "@/types/api";

export function getFaqs() {
  return apiFetch<Faq[]>("/faqs");
}

export function adminGetFaqs() {
  return apiFetch<Faq[]>("/admin/faqs");
}

export function adminCreateFaq(payload: Partial<Faq>) {
  return apiFetch<Faq>("/admin/faqs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function adminUpdateFaq(id: number, payload: Partial<Faq>) {
  return apiFetch<Faq>(`/admin/faqs/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function adminDeleteFaq(id: number) {
  return apiFetch<null>(`/admin/faqs/${id}`, { method: "DELETE" });
}
