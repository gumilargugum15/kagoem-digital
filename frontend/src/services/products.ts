import { apiFetch } from "./api";
import type { PaginatedData, Product, ProductDetail } from "@/types/api";

export interface ProductListParams {
  category?: string;
  type?: string;
  search?: string;
  sort?: string;
  page?: number;
  per_page?: number;
}

export function getProducts(params: ProductListParams = {}) {
  const query = new URLSearchParams();
  if (params.category && params.category !== "All") query.set("category", params.category);
  if (params.type) query.set("type", params.type);
  if (params.search) query.set("search", params.search);
  if (params.sort) query.set("sort", params.sort);
  if (params.page) query.set("page", String(params.page));
  if (params.per_page) query.set("per_page", String(params.per_page));
  const qs = query.toString();
  return apiFetch<PaginatedData<Product>>(`/products${qs ? `?${qs}` : ""}`);
}

export function getProduct(slug: string) {
  return apiFetch<ProductDetail>(`/products/${slug}`);
}

export function adminGetProducts() {
  return apiFetch<Product[]>("/admin/products");
}

export function adminGetProduct(id: number) {
  return apiFetch<Product>(`/admin/products/${id}`);
}

export function adminCreateProduct(payload: FormData) {
  return apiFetch<Product>("/admin/products", {
    method: "POST",
    body: payload,
  });
}

export function adminUpdateProduct(id: number, payload: FormData) {
  payload.append("_method", "PUT");
  return apiFetch<Product>(`/admin/products/${id}`, {
    method: "POST",
    body: payload,
  });
}

export function adminDeleteProduct(id: number) {
  return apiFetch<null>(`/admin/products/${id}`, { method: "DELETE" });
}
