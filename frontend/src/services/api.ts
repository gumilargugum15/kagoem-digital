const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";
const API_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, "");

const TOKEN_STORAGE_KEY = "kagoem_admin_token";

export function getStorageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return `${API_ORIGIN}/storage/${path}`;
}

export class ApiClientError extends Error {
  status: number;
  errors: Record<string, string[]> | null;

  constructor(message: string, status: number, errors: Record<string, string[]> | null = null) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.errors = errors;
  }
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setAuthToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = getAuthToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const json = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiClientError(
      json?.message ?? "Something went wrong. Please try again.",
      response.status,
      json?.errors ?? null,
    );
  }

  return json?.data as T;
}
