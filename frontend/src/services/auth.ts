import { apiFetch } from "./api";
import type { User } from "@/types/api";

export function login(email: string, password: string) {
  return apiFetch<{ user: User; token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(
  name: string,
  email: string,
  password: string,
  passwordConfirmation: string,
) {
  return apiFetch<{ user: User; token: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    }),
  });
}

export function logout() {
  return apiFetch<null>("/auth/logout", { method: "POST" });
}

export function getMe() {
  return apiFetch<User>("/auth/me");
}

export function updateProfile(name: string, email: string) {
  return apiFetch<User>("/auth/profile", {
    method: "PUT",
    body: JSON.stringify({ name, email }),
  });
}

export function updatePassword(
  currentPassword: string,
  password: string,
  passwordConfirmation: string,
) {
  return apiFetch<null>("/auth/profile/password", {
    method: "PUT",
    body: JSON.stringify({
      current_password: currentPassword,
      password,
      password_confirmation: passwordConfirmation,
    }),
  });
}

export function forgotPassword(email: string) {
  return apiFetch<null>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(
  token: string,
  email: string,
  password: string,
  passwordConfirmation: string,
) {
  return apiFetch<null>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({
      token,
      email,
      password,
      password_confirmation: passwordConfirmation,
    }),
  });
}

export function resendVerification() {
  return apiFetch<null>("/auth/email/resend", { method: "POST" });
}
