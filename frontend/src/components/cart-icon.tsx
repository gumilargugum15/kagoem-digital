import { ShoppingCart } from "lucide-react";

export function CartBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full gradient-primary-bg px-1 text-[11px] font-bold text-primary-foreground shadow-elegant">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function CartIcon({
  count,
  onClick,
  className,
}: {
  count: number;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label="Cart"
      onClick={onClick}
      className={`relative grid h-10 w-10 place-items-center rounded-xl text-navy transition-transform hover:scale-105 ${className ?? ""}`}
    >
      <ShoppingCart className="h-5 w-5" />
      <CartBadge count={count} />
    </button>
  );
}
