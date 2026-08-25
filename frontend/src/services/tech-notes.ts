import { apiFetch } from "./api";
import type { PaginatedData, TechNote, TechNoteDetail } from "@/types/api";

export interface TechNoteListParams {
  category?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export function getTechNotes(params: TechNoteListParams = {}) {
  const query = new URLSearchParams();
  if (params.category && params.category !== "All") query.set("category", params.category);
  if (params.search) query.set("search", params.search);
  if (params.page) query.set("page", String(params.page));
  if (params.per_page) query.set("per_page", String(params.per_page));
  const qs = query.toString();
  return apiFetch<PaginatedData<TechNote>>(`/tech-notes${qs ? `?${qs}` : ""}`);
}

export function getTechNote(slug: string) {
  return apiFetch<TechNoteDetail>(`/tech-notes/${slug}`);
}

export function adminGetTechNotes() {
  return apiFetch<TechNote[]>("/admin/tech-notes");
}

export function adminGetTechNote(id: number) {
  return apiFetch<TechNote>(`/admin/tech-notes/${id}`);
}

export function adminCreateTechNote(payload: FormData) {
  return apiFetch<TechNote>("/admin/tech-notes", {
    method: "POST",
    body: payload,
  });
}

export function adminUpdateTechNote(id: number, payload: FormData) {
  payload.append("_method", "PUT");
  return apiFetch<TechNote>(`/admin/tech-notes/${id}`, {
    method: "POST",
    body: payload,
  });
}

export function adminDeleteTechNote(id: number) {
  return apiFetch<null>(`/admin/tech-notes/${id}`, { method: "DELETE" });
}
