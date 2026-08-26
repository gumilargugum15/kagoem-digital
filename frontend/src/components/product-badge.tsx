import type { ProductBadge as ProductBadgeType } from "@/types/api";

const BADGE_CONFIG: Record<ProductBadgeType, { label: string; className: string }> = {
  new: { label: "NEW", className: "bg-cyan/15 text-cyan" },
  best_seller: { label: "BEST SELLER", className: "gradient-primary-bg text-primary-foreground" },
  popular: { label: "POPULAR", className: "bg-primary/15 text-primary" },
};

export function ProductBadge({
  badge,
  hasDiscount,
  isSubscription,
  className,
}: {
  badge?: ProductBadgeType | null;
  hasDiscount?: boolean;
  isSubscription?: boolean;
  className?: string;
}) {
  const config = badge
    ? BADGE_CONFIG[badge]
    : hasDiscount
      ? { label: "SALE", className: "bg-destructive/15 text-destructive" }
      : isSubscription
        ? { label: "SUBSCRIPTION", className: "bg-navy/10 text-navy" }
        : null;

  if (!config) return null;

  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide shadow-soft ${config.className} ${className ?? ""}`}
    >
      {config.label}
    </span>
  );
}
