import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { getCart, updateCartItem, removeCartItem } from "@/services/cart";
import { ApiClientError } from "@/services/api";
import { formatCurrency } from "@/lib/utils";
import { CartItem } from "@/components/cart-item";
import { EmptyCart } from "@/components/empty-cart";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function CartDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: cart, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
    enabled: open,
  });

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
    onSuccess: invalidate,
    onError: (e: unknown) =>
      toast.error(e instanceof ApiClientError ? e.message : "Gagal menghapus item"),
  });

  const items = cart?.items ?? [];

  const goToCart = () => {
    onOpenChange(false);
    navigate("/cart");
  };

  const handleCheckout = () => {
    toast.info("Fitur checkout akan segera tersedia.");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display">Your Cart</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : items.length === 0 ? (
            <EmptyCart />
          ) : (
            <div className="divide-y divide-border">
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  compact
                  isUpdating={updateMutation.isPending && updateMutation.variables?.id === item.id}
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
          )}
        </div>

        {cart && items.length > 0 && (
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between text-base font-bold text-navy">
              <span>Total</span>
              <span>{formatCurrency(cart.total)}</span>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <Button onClick={handleCheckout} className="w-full py-5">
                Checkout
              </Button>
              <Button variant="outline" onClick={goToCart} className="w-full">
                View Cart
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
