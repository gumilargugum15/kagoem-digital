import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

export function EmptyCart() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10">
        <ShoppingCart className="h-7 w-7 text-primary" />
      </div>
      <div>
        <h3 className="font-display text-lg font-bold text-navy">Keranjang Anda masih kosong.</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Temukan produk digital dan aplikasi yang sesuai kebutuhan Anda.
        </p>
      </div>
      <Link
        to="/products"
        className="inline-flex items-center gap-2 rounded-full gradient-primary-bg px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.03]"
      >
        Browse Products
      </Link>
    </div>
  );
}
