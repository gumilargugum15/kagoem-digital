import { apiFetch, getAuthToken, ApiClientError } from "./api";
import type { MyProducts } from "@/types/api";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

export function getMyProducts() {
  return apiFetch<MyProducts>("/my-products");
}

/**
 * Digital files are served by an authenticated endpoint (Bearer token), not a public URL.
 * The endpoint returns either the file itself, or — for products that only have an external
 * download_url — a small JSON redirect payload. Handle both from the same call.
 */
export async function downloadDigitalProduct(accessId: number, filename: string): Promise<void> {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}/my-products/digital/${accessId}/download`, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const json = await response.json();
    if (!response.ok) {
      throw new ApiClientError(
        json?.message ?? "Gagal mengunduh file.",
        response.status,
        json?.errors ?? null,
      );
    }
    window.open(json.data.redirect_url, "_blank", "noopener,noreferrer");
    return;
  }

  if (!response.ok) {
    throw new ApiClientError("Gagal mengunduh file.", response.status);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
