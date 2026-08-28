import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { AdminLayout } from "@/components/admin/admin-layout";
import { adminGetOrders } from "@/services/orders";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu Pembayaran",
  paid: "Dibayar",
  failed: "Gagal",
  cancelled: "Dibatalkan",
  expired: "Kedaluwarsa",
};

export default function AdminOrders() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => adminGetOrders(),
  });

  const orders = data?.data ?? [];

  return (
    <AdminLayout title="Orders">
      <p className="text-sm text-muted-foreground">Daftar seluruh pesanan customer.</p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Memuat...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Produk</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Order Status</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium text-navy">{order.order_number}</TableCell>
                    <TableCell>
                      <div className="text-navy">{order.customer_name}</div>
                      <div className="text-xs text-muted-foreground">{order.customer_email}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {order.items.map((i) => i.product_name).join(", ")}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatCurrency(order.total)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={order.status === "pending" ? "secondary" : "default"}>
                        {ORDER_STATUS_LABEL[order.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={order.payment?.status === "pending" ? "secondary" : "default"}
                      >
                        {order.payment ? ORDER_STATUS_LABEL[order.payment.status] : "-"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("id-ID")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        to={`/admin/orders/${order.order_number}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Detail
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      Belum ada order.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
