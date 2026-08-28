import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ShoppingBag } from "lucide-react";

import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { getOrders } from "@/services/orders";
import { getSettings } from "@/services/settings";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu Pembayaran",
  paid: "Dibayar",
  failed: "Gagal",
  cancelled: "Dibatalkan",
  expired: "Kedaluwarsa",
};

export default function Orders() {
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const { data, isLoading } = useQuery({ queryKey: ["orders"], queryFn: () => getOrders() });

  const orders = data?.data ?? [];

  return (
    <main className="min-h-screen bg-background">
      <Nav settings={settings} />

      <section className="relative pt-28 pb-24 sm:pt-32">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-extrabold text-navy sm:text-4xl">
            Pesanan Saya
          </h1>

          {isLoading ? (
            <div className="mt-16 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Memuat...
            </div>
          ) : orders.length === 0 ? (
            <div className="mt-16 flex flex-col items-center gap-4 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10">
                <ShoppingBag className="h-7 w-7 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Anda belum memiliki pesanan.</p>
              <Button asChild>
                <Link to="/products">Jelajahi Produk</Link>
              </Button>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  to={`/orders/${order.order_number}`}
                  className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-elegant sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-navy">#{order.order_number}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {order.items.map((i) => i.product_name).join(", ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-navy">{formatCurrency(order.total)}</span>
                    <Badge variant={order.status === "pending" ? "secondary" : "default"}>
                      {ORDER_STATUS_LABEL[order.status]}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer settings={settings} />
    </main>
  );
}
