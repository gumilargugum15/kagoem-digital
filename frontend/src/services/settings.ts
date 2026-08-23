import { apiFetch } from "./api";
import type { SiteSettings } from "@/types/api";

export function getSettings() {
  return apiFetch<SiteSettings>("/settings");
}

export function adminGetSettings() {
  return apiFetch<SiteSettings>("/admin/settings");
}

export function adminUpdateSettings(settings: SiteSettings) {
  return apiFetch<SiteSettings>("/admin/settings", {
    method: "PUT",
    body: JSON.stringify({ settings }),
  });
}
