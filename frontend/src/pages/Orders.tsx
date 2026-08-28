import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Loader2, Search, ShoppingBag } from "lucide-react";

import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { getOrders } from "@/services/orders";
import { getSettings } from "@/services/settings";
import { formatCurrency } from "@/lib/utils";
import { ORDER_STATUS_LABEL, ORDER_STATUS_FILTERS } from "@/lib/order-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function Orders() {
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["orders", debouncedSearch, status, page],
    queryFn: () => getOrders({ search: debouncedSearch, status, page }),
  });

  const orders = data?.data ?? [];
  const hasFilters = Boolean(debouncedSearch) || status !== "all";

  return (
    <main className="min-h-screen bg-background">
      <Nav settings={settings} />

      <section className="relative pt-28 pb-24 sm:pt-32">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-extrabold text-navy sm:text-4xl">
            Pesanan Saya
          </h1>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="glass flex items-center gap-3 rounded-full px-5 py-3 shadow-soft sm:max-w-xs">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nomor order..."
                className="w-full bg-transparent text-sm text-navy placeholder:text-muted-foreground focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {ORDER_STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatus(f.value)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    status === f.value
                      ? "gradient-primary-bg text-primary-foreground shadow-elegant"
                      : "glass text-navy hover:scale-105"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="mt-14 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Memuat...
            </div>
          ) : isError ? (
            <div className="mt-14 flex flex-col items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-6 w-6 text-destructive" />
              Gagal memuat pesanan. Silakan coba lagi nanti.
            </div>
          ) : orders.length === 0 ? (
            <div className="mt-14 flex flex-col items-center gap-4 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10">
                <ShoppingBag className="h-7 w-7 text-primary" />
              </div>
              {hasFilters ? (
                <p className="text-sm text-muted-foreground">
                  Tidak ada pesanan yang cocok dengan pencarian/filter ini.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">Anda belum memiliki pesanan.</p>
              )}
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
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
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

          {data && data.last_page > 1 && (
            <Pagination className="mt-10">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.max(1, p - 1));
                    }}
                    className={page === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: data.last_page }, (_, i) => i + 1).map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href="#"
                      isActive={p === page}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(p);
                      }}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.min(data.last_page, p + 1));
                    }}
                    className={page === data.last_page ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </section>

      <Footer settings={settings} />
    </main>
  );
}
