import { apiFetch } from "./api";
import type { Cart, CartItem } from "@/types/api";

const CART_SESSION_KEY = "kagoem_cart_session";

export function getCartSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(CART_SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(CART_SESSION_KEY, id);
  }
  return id;
}

function cartFetch<T>(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  headers.set("X-Cart-Session", getCartSessionId());
  return apiFetch<T>(path, { ...options, headers });
}

export function getCart() {
  return cartFetch<Cart>("/cart");
}

export interface AddCartItemPayload {
  product_id: number;
  subscription_plan_id?: number | null;
  quantity?: number;
}

export function addCartItem(payload: AddCartItemPayload) {
  return cartFetch<{ cart: Cart; item: CartItem }>("/cart/items", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateCartItem(itemId: number, quantity: number) {
  return cartFetch<Cart>(`/cart/items/${itemId}`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  });
}

export function removeCartItem(itemId: number) {
  return cartFetch<Cart>(`/cart/items/${itemId}`, { method: "DELETE" });
}

export function clearCart() {
  return cartFetch<Cart>("/cart", { method: "DELETE" });
}
