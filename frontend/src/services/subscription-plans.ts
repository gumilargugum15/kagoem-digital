import { apiFetch } from "./api";
import type { SubscriptionPlan } from "@/types/api";

export interface SubscriptionPlanPayload {
  name: string;
  description?: string;
  price?: number | null;
  billing_interval: "monthly" | "yearly";
  max_users?: number | null;
  max_branches?: number | null;
  max_products?: number | null;
  cta_label?: string | null;
  is_highlighted?: boolean;
  status?: string;
  sort_order?: number;
  features?: { feature: string; value?: string | null }[];
}

export function adminGetPlans(productId: number) {
  return apiFetch<SubscriptionPlan[]>(`/admin/products/${productId}/plans`);
}

export function adminCreatePlan(productId: number, payload: SubscriptionPlanPayload) {
  return apiFetch<SubscriptionPlan>(`/admin/products/${productId}/plans`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function adminUpdatePlan(
  productId: number,
  planId: number,
  payload: SubscriptionPlanPayload,
) {
  return apiFetch<SubscriptionPlan>(`/admin/products/${productId}/plans/${planId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function adminDeletePlan(productId: number, planId: number) {
  return apiFetch<null>(`/admin/products/${productId}/plans/${planId}`, { method: "DELETE" });
}
