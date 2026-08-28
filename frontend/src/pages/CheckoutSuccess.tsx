import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { getOrder } from "@/services/orders";
import { getSettings } from "@/services/settings";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get("order") ?? "";
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });

  const { data: order, isLoading } = useQuery({
    queryKey: ["orders", orderNumber],
    queryFn: () => getOrder(orderNumber),
    enabled: Boolean(orderNumber),
  });

  return (
    <main className="min-h-screen bg-background">
      <Nav settings={settings} />

      <section className="relative flex min-h-screen items-center justify-center pt-28 pb-24 sm:pt-32">
        <div className="mx-auto w-full max-w-md px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Memuat...
            </div>
          ) : order ? (
            <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-soft">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <h1 className="mt-4 font-display text-2xl font-bold text-navy">
                Order Berhasil Dibuat
              </h1>

              <div className="mt-6 space-y-3 rounded-2xl bg-muted p-4 text-left text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Order Number</span>
                  <span className="font-semibold text-navy">{order.order_number}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-semibold text-navy">Menunggu Pembayaran</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold text-navy">{formatCurrency(order.total)}</span>
                </div>
              </div>

              <Button asChild className="mt-6 w-full py-5">
                <Link to={`/orders/${order.order_number}`}>Lihat Detail Order</Link>
              </Button>
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground">Order tidak ditemukan.</div>
          )}
        </div>
      </section>

      <Footer settings={settings} />
    </main>
  );
}
