import { apiFetch } from "./api";
import type { User } from "@/types/api";

export function login(email: string, password: string) {
  return apiFetch<{ user: User; token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function logout() {
  return apiFetch<null>("/auth/logout", { method: "POST" });
}

export function getMe() {
  return apiFetch<User>("/auth/me");
}
