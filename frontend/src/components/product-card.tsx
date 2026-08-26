import { Link } from "react-router-dom";
import { ArrowRight, Package, ShoppingBag, Star } from "lucide-react";

import { getStorageUrl } from "@/services/api";
import { formatCurrency } from "@/lib/utils";
import { ProductBadge } from "@/components/product-badge";
import type { Product } from "@/types/api";

const TYPE_LABEL: Record<Product["type"], string> = {
  digital: "DIGITAL PRODUCT",
  subscription: "SOFTWARE",
  service: "SERVICE",
};

const CTA_LABEL: Record<Product["type"], string> = {
  digital: "Lihat Produk",
  subscription: "Lihat Detail",
  service: "Lihat Detail",
};

function cheapestMonthlyPrice(product: Product): string | null {
  const plans = product.plans ?? [];
  if (plans.length === 0) return null;
  const monthly = plans.filter((p) => p.billing_interval === "monthly" && p.price !== null);
  const pool = monthly.length > 0 ? monthly : plans.filter((p) => p.price !== null);
  if (pool.length === 0) return null;
  const cheapest = pool.reduce((min, p) => (Number(p.price) < Number(min.price) ? p : min));
  return cheapest.price;
}

export function ProductCard({ product }: { product: Product }) {
  const imageUrl = getStorageUrl(product.thumbnail);
  const isSubscription = product.type === "subscription";
  const hasDiscount = Boolean(product.discount_price);

  const priceNode = isSubscription ? (
    (() => {
      const price = cheapestMonthlyPrice(product);
      return price ? (
        <span className="font-display text-lg font-extrabold text-navy">
          Mulai {formatCurrency(price, product.currency)}{" "}
          <span className="text-sm font-medium text-muted-foreground">/ bulan</span>
        </span>
      ) : (
        <span className="font-display text-lg font-extrabold text-navy">Hubungi Kami</span>
      );
    })()
  ) : (
    <div className="flex items-baseline gap-2">
      <span className="font-display text-lg font-extrabold text-navy">
        {formatCurrency(product.discount_price ?? product.price, product.currency)}
      </span>
      {hasDiscount && (
        <span className="text-sm text-muted-foreground line-through">
          {formatCurrency(product.price, product.currency)}
        </span>
      )}
    </div>
  );

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft hover-lift">
      <Link
        to={`/products/${product.slug}`}
        className="relative block aspect-[4/3] overflow-hidden"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 to-cyan/15">
            {isSubscription ? (
              <ShoppingBag className="h-10 w-10 text-primary/40" />
            ) : (
              <Package className="h-10 w-10 text-primary/40" />
            )}
          </div>
        )}
        <div className="absolute left-3 top-3">
          <ProductBadge
            badge={product.badge}
            hasDiscount={hasDiscount}
            isSubscription={isSubscription}
          />
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
          {TYPE_LABEL[product.type]}
        </span>
        <Link to={`/products/${product.slug}`}>
          <h3 className="mt-3 font-display text-lg font-bold leading-snug text-navy transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {product.short_description}
        </p>

        {(product.rating || product.purchases_count > 0) && (
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            {product.rating && (
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {product.rating}
              </span>
            )}
            {product.purchases_count > 0 && <span>{product.purchases_count}+ terjual</span>}
          </div>
        )}

        <div className="mt-4">{priceNode}</div>

        <Link
          to={`/products/${product.slug}`}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-transform hover:translate-x-0.5"
        >
          {CTA_LABEL[product.type]} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
