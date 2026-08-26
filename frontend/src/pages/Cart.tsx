import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { CartItem } from "@/components/cart-item";
import { CartSummary } from "@/components/cart-summary";
import { EmptyCart } from "@/components/empty-cart";
import { getCart, updateCartItem, removeCartItem } from "@/services/cart";
import { getSettings } from "@/services/settings";
import { ApiClientError } from "@/services/api";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function Cart() {
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const queryClient = useQueryClient();

  const { data: cart, isLoading } = useQuery({ queryKey: ["cart"], queryFn: getCart });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["cart"] });

  const updateMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) =>
      updateCartItem(id, quantity),
    onSuccess: invalidate,
    onError: (e: unknown) =>
      toast.error(e instanceof ApiClientError ? e.message : "Gagal memperbarui keranjang"),
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => removeCartItem(id),
    onSuccess: () => {
      invalidate();
      toast.success("Item dihapus dari keranjang.");
    },
    onError: (e: unknown) =>
      toast.error(e instanceof ApiClientError ? e.message : "Gagal menghapus item"),
  });

  const handleCheckout = () => {
    toast.info("Fitur checkout akan segera tersedia.");
  };

  const items = cart?.items ?? [];

  return (
    <main className="min-h-screen bg-background">
      <Nav settings={settings} />

      <section className="relative pt-28 pb-24 sm:pt-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-navy"
          >
            <ArrowLeft className="h-4 w-4" /> Continue Shopping
          </Link>

          <h1 className="mt-4 font-display text-3xl font-extrabold text-navy sm:text-4xl">
            Shopping Cart
          </h1>

          {isLoading ? (
            <div className="mt-16 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Memuat keranjang...
            </div>
          ) : items.length === 0 ? (
            <EmptyCart />
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-soft lg:col-span-2">
                <div className="divide-y divide-border">
                  {items.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      isUpdating={
                        updateMutation.isPending && updateMutation.variables?.id === item.id
                      }
                      isRemoving={removeMutation.isPending && removeMutation.variables === item.id}
                      onIncrement={() =>
                        updateMutation.mutate({ id: item.id, quantity: item.quantity + 1 })
                      }
                      onDecrement={() =>
                        item.quantity > 1 &&
                        updateMutation.mutate({ id: item.id, quantity: item.quantity - 1 })
                      }
                      onRemove={() => removeMutation.mutate(item.id)}
                    />
                  ))}
                </div>
              </div>

              <div className="pb-20 sm:pb-0">
                {cart && <CartSummary cart={cart} onCheckout={handleCheckout} sticky />}
              </div>
            </div>
          )}
        </div>
      </section>

      {cart && items.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 p-4 shadow-elegant backdrop-blur sm:hidden">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs text-muted-foreground">Total</div>
              <div className="font-display text-base font-bold text-navy">
                {formatCurrency(cart.total)}
              </div>
            </div>
            <Button onClick={handleCheckout} className="flex-1 py-5">
              Checkout
            </Button>
          </div>
        </div>
      )}

      <Footer settings={settings} />
    </main>
  );
}
