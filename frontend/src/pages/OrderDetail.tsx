import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { getOrder, createPayment } from "@/services/orders";
import { getSettings } from "@/services/settings";
import { ApiClientError } from "@/services/api";
import { payWithSnap } from "@/lib/midtrans";
import { formatCurrency } from "@/lib/utils";
import { ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL } from "@/lib/order-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function OrderDetail() {
  const { orderNumber = "" } = useParams<{ orderNumber: string }>();
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const queryClient = useQueryClient();
  const [isPaying, setIsPaying] = useState(false);

  const {
    data: order,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["orders", orderNumber],
    queryFn: () => getOrder(orderNumber),
    enabled: Boolean(orderNumber),
  });

  const refreshOrder = () => queryClient.invalidateQueries({ queryKey: ["orders", orderNumber] });

  const paymentMutation = useMutation({
    mutationFn: () => createPayment(orderNumber),
    onSuccess: async ({ snap_token }) => {
      try {
        await payWithSnap(snap_token, {
          onSuccess: () => {
            setIsPaying(false);
            toast.success("Pembayaran diterima. Memuat status terbaru...");
            void refreshOrder();
          },
          onPending: () => {
            setIsPaying(false);
            toast.info("Menunggu pembayaran Anda diselesaikan.");
            void refreshOrder();
          },
          onError: () => {
            setIsPaying(false);
            toast.error("Pembayaran gagal. Silakan coba lagi.");
            void refreshOrder();
          },
          onClose: () => {
            setIsPaying(false);
            void refreshOrder();
          },
        });
      } catch {
        setIsPaying(false);
        toast.error("Pembayaran belum dapat diproses. Silakan coba lagi.");
      }
    },
    onError: (e: unknown) => {
      setIsPaying(false);
      toast.error(
        e instanceof ApiClientError
          ? e.message
          : "Pembayaran belum dapat diproses. Silakan coba lagi.",
      );
    },
  });

  const handlePay = () => {
    if (isPaying) return;
    setIsPaying(true);
    paymentMutation.mutate();
  };

  return (
    <main className="min-h-screen bg-background">
      <Nav settings={settings} />

      <section className="relative pt-28 pb-24 sm:pt-32">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-navy"
          >
            <ArrowLeft className="h-4 w-4" /> Pesanan Saya
          </Link>

          {isLoading ? (
            <div className="mt-16 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Memuat...
            </div>
          ) : isError || !order ? (
            <p className="mt-16 text-center text-sm text-muted-foreground">
              Order tidak ditemukan.
            </p>
          ) : (
            <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="font-display text-2xl font-bold text-navy">
                  Order #{order.order_number}
                </h1>
                <Badge variant={order.status === "pending" ? "secondary" : "default"}>
                  {ORDER_STATUS_LABEL[order.status]}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {new Date(order.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>

              <div className="mt-6 divide-y divide-border border-y border-border">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 py-4">
                    <div>
                      <p className="font-medium text-navy">{item.product_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(item.unit_price)}
                        {item.billing_interval
                          ? ` / ${item.billing_interval === "monthly" ? "bulan" : "tahun"}`
                          : ""}{" "}
                        &middot; Qty {item.quantity}
                      </p>
                      {item.subscription && (
                        <p className="mt-1 text-xs font-medium text-primary">
                          Subscription:{" "}
                          {item.subscription.status === "active"
                            ? "ACTIVE"
                            : item.subscription.status.toUpperCase()}
                        </p>
                      )}
                      {item.digital_access && (
                        <p className="mt-1 text-xs font-medium text-primary">
                          Digital Access:{" "}
                          {item.digital_access.status === "active"
                            ? "ACTIVE"
                            : item.digital_access.status.toUpperCase()}
                        </p>
                      )}
                    </div>
                    <p className="font-semibold text-navy">{formatCurrency(item.subtotal)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-2 text-sm">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-navy">{formatCurrency(order.subtotal)}</span>
                </div>
                {Number(order.discount) > 0 && (
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Discount</span>
                    <span className="text-navy">-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                {Number(order.tax) > 0 && (
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Tax</span>
                    <span className="text-navy">{formatCurrency(order.tax)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-border pt-2 text-base font-bold text-navy">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl bg-muted p-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Status Order</p>
                  <p className="mt-0.5 font-semibold text-navy">
                    {ORDER_STATUS_LABEL[order.status]}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status Payment</p>
                  <p className="mt-0.5 font-semibold text-navy">
                    {order.payment ? PAYMENT_STATUS_LABEL[order.payment.status] : "-"}
                  </p>
                </div>
              </div>

              {order.status === "pending" && (
                <Button
                  type="button"
                  className="mt-6 w-full py-5"
                  disabled={isPaying}
                  onClick={handlePay}
                >
                  {isPaying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Bayar Sekarang
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer settings={settings} />
    </main>
  );
}
