import { apiFetch } from "./api";
import type { HomeStats } from "@/types/api";

export function getStats() {
  return apiFetch<HomeStats>("/stats");
}
