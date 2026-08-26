import { ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Cart } from "@/types/api";

export function CartSummary({
  cart,
  onCheckout,
  checkoutLabel = "Checkout",
  sticky = false,
}: {
  cart: Cart;
  onCheckout?: () => void;
  checkoutLabel?: string;
  sticky?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border border-border bg-card p-6 shadow-soft ${sticky ? "sm:sticky sm:top-28" : ""}`}
    >
      <h3 className="font-display text-base font-bold text-navy">Summary</h3>
      <div className="mt-4 space-y-2.5 text-sm">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="text-navy">{formatCurrency(cart.subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Discount</span>
          <span className="text-navy">
            {cart.discount > 0 ? `-${formatCurrency(cart.discount)}` : formatCurrency(0)}
          </span>
        </div>
        {cart.tax > 0 && (
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Tax</span>
            <span className="text-navy">{formatCurrency(cart.tax)}</span>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-border pt-3 text-base font-bold text-navy">
          <span>Total</span>
          <span>{formatCurrency(cart.total)}</span>
        </div>
      </div>

      {onCheckout && (
        <Button onClick={onCheckout} className="mt-6 w-full py-5">
          {checkoutLabel} <ArrowRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
