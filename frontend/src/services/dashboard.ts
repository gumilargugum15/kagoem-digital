import { apiFetch } from "./api";
import type { ContactMessage } from "@/types/api";

export interface DashboardStats {
  services_count: number;
  portfolios_count: number;
  contact_messages_count: number;
  latest_messages: ContactMessage[];
}

export function getDashboardStats() {
  return apiFetch<DashboardStats>("/admin/dashboard");
}
