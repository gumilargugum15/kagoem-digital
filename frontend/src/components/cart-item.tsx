import { Link } from "react-router-dom";
import { Loader2, Minus, Package, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { getStorageUrl } from "@/services/api";
import { formatCurrency } from "@/lib/utils";
import type { CartItem as CartItemType } from "@/types/api";

const TYPE_LABEL: Record<CartItemType["product_type"], string> = {
  digital: "Digital Product",
  subscription: "Subscription",
  service: "Service",
};

export function CartItem({
  item,
  onIncrement,
  onDecrement,
  onRemove,
  isUpdating,
  isRemoving,
  compact = false,
}: {
  item: CartItemType;
  onIncrement?: () => void;
  onDecrement?: () => void;
  onRemove: () => void;
  isUpdating?: boolean;
  isRemoving?: boolean;
  compact?: boolean;
}) {
  const imageUrl = getStorageUrl(item.product?.thumbnail);
  const isSubscription = item.product_type === "subscription";
  const productHref = item.product?.slug ? `/products/${item.product.slug}` : "/products";

  return (
    <div className={`flex gap-4 ${compact ? "py-3" : "py-5"}`}>
      <Link
        to={productHref}
        className="relative block h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-muted sm:h-20 sm:w-20"
      >
        {imageUrl ? (
          <img src={imageUrl} alt={item.product_name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 to-cyan/15">
            {isSubscription ? (
              <ShoppingBag className="h-6 w-6 text-primary/40" />
            ) : (
              <Package className="h-6 w-6 text-primary/40" />
            )}
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link to={productHref} className="font-display text-sm font-bold text-navy sm:text-base">
            {item.product_name}
          </Link>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {TYPE_LABEL[item.product_type]}
            {item.subscription_plan && ` — ${item.subscription_plan.name} Plan`}
          </p>
          <p className="mt-1 text-sm font-semibold text-navy">
            {formatCurrency(item.price)}
            {isSubscription && (
              <span className="text-xs font-normal text-muted-foreground">
                {" "}
                / {item.billing_interval === "yearly" ? "tahun" : "bulan"}
              </span>
            )}
          </p>
        </div>

        <div className="mt-2 flex items-center justify-between">
          {isSubscription ? (
            <span className="text-xs text-muted-foreground">Quantity: 1</span>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onDecrement}
                disabled={isUpdating || item.quantity <= 1}
                className="grid h-7 w-7 place-items-center rounded-full border border-border text-navy disabled:opacity-40"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-6 text-center text-sm font-medium text-navy">
                {isUpdating ? (
                  <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin" />
                ) : (
                  item.quantity
                )}
              </span>
              <button
                type="button"
                onClick={onIncrement}
                disabled={isUpdating}
                className="grid h-7 w-7 place-items-center rounded-full border border-border text-navy disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onRemove}
            disabled={isRemoving}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive hover:underline disabled:opacity-50"
          >
            {isRemoving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
