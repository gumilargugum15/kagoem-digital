import { apiFetch } from "./api";
import type { Portfolio } from "@/types/api";

export function getPortfolios(category?: string) {
  const query = category && category !== "All" ? `?category=${encodeURIComponent(category)}` : "";
  return apiFetch<Portfolio[]>(`/portfolios${query}`);
}

export function getFeaturedPortfolios() {
  return apiFetch<Portfolio[]>("/portfolios/featured");
}

export function getPortfolio(slug: string) {
  return apiFetch<Portfolio>(`/portfolios/${slug}`);
}

export function adminGetPortfolios() {
  return apiFetch<Portfolio[]>("/admin/portfolios");
}

export function adminGetPortfolio(id: number) {
  return apiFetch<Portfolio>(`/admin/portfolios/${id}`);
}

export function adminCreatePortfolio(payload: FormData) {
  return apiFetch<Portfolio>("/admin/portfolios", {
    method: "POST",
    body: payload,
  });
}

export function adminUpdatePortfolio(id: number, payload: FormData) {
  payload.append("_method", "PUT");
  return apiFetch<Portfolio>(`/admin/portfolios/${id}`, {
    method: "POST",
    body: payload,
  });
}

export function adminDeletePortfolio(id: number) {
  return apiFetch<null>(`/admin/portfolios/${id}`, { method: "DELETE" });
}
