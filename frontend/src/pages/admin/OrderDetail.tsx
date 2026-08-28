import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";

import { AdminLayout } from "@/components/admin/admin-layout";
import { adminGetOrder } from "@/services/orders";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu Pembayaran",
  paid: "Dibayar",
  failed: "Gagal",
  cancelled: "Dibatalkan",
  expired: "Kedaluwarsa",
};

export default function AdminOrderDetail() {
  const { orderNumber = "" } = useParams<{ orderNumber: string }>();
  const { data: order, isLoading } = useQuery({
    queryKey: ["admin", "orders", orderNumber],
    queryFn: () => adminGetOrder(orderNumber),
    enabled: Boolean(orderNumber),
  });

  return (
    <AdminLayout title="Order Detail">
      <Link
        to="/admin/orders"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-navy"
      >
        <ArrowLeft className="h-4 w-4" /> Orders
      </Link>

      {isLoading ? (
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Memuat...
        </div>
      ) : !order ? (
        <p className="mt-8 text-sm text-muted-foreground">Order tidak ditemukan.</p>
      ) : (
        <div className="mt-6 rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold text-navy">#{order.order_number}</h2>
            <Badge variant={order.status === "pending" ? "secondary" : "default"}>
              {ORDER_STATUS_LABEL[order.status]}
            </Badge>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Customer</p>
              <p className="font-medium text-navy">{order.customer_name}</p>
              <p className="text-muted-foreground">{order.customer_email}</p>
              {order.customer_phone && (
                <p className="text-muted-foreground">{order.customer_phone}</p>
              )}
            </div>
            <div>
              <p className="text-muted-foreground">Tanggal</p>
              <p className="font-medium text-navy">
                {new Date(order.created_at).toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          <div className="mt-6 divide-y divide-border border-y border-border">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-navy">{item.product_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(item.unit_price)} &middot; Qty {item.quantity}
                  </p>
                </div>
                <p className="font-semibold text-navy">{formatCurrency(item.subtotal)}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-1.5 text-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="text-navy">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2 text-base font-bold text-navy">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-muted p-4 text-sm">
            <div>
              <p className="text-muted-foreground">Payment Status</p>
              <p className="mt-0.5 font-semibold text-navy">
                {order.payment ? ORDER_STATUS_LABEL[order.payment.status] : "-"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Payment Method</p>
              <p className="mt-0.5 font-semibold text-navy">
                {order.payment?.payment_method ?? "-"}
              </p>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
