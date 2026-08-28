import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Download, Loader2, Package, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { getMyProducts, downloadDigitalProduct } from "@/services/my-products";
import { getSettings } from "@/services/settings";
import { ApiClientError } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const SUBSCRIPTION_STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu Aktivasi",
  active: "Aktif",
  expired: "Kedaluwarsa",
  cancelled: "Dibatalkan",
};

export default function MyProducts() {
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const { data, isLoading } = useQuery({ queryKey: ["my-products"], queryFn: getMyProducts });
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const subscriptions = data?.subscriptions ?? [];
  const digital = data?.digital ?? [];
  const isEmpty = subscriptions.length === 0 && digital.length === 0;

  const handleDownload = async (accessId: number, productName: string) => {
    setDownloadingId(accessId);
    try {
      await downloadDigitalProduct(accessId, productName);
    } catch (e: unknown) {
      toast.error(e instanceof ApiClientError ? e.message : "Gagal mengunduh file.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Nav settings={settings} />

      <section className="relative pt-28 pb-24 sm:pt-32">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-extrabold text-navy sm:text-4xl">
            Produk Saya
          </h1>

          {isLoading ? (
            <div className="mt-16 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Memuat...
            </div>
          ) : isEmpty ? (
            <div className="mt-16 flex flex-col items-center gap-4 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10">
                <ShoppingBag className="h-7 w-7 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Anda belum memiliki produk.</p>
              <Button asChild>
                <Link to="/products">Jelajahi Produk</Link>
              </Button>
            </div>
          ) : (
            <div className="mt-8 space-y-10">
              {subscriptions.length > 0 && (
                <div>
                  <h2 className="font-display text-lg font-bold text-navy">Subscription</h2>
                  <div className="mt-4 space-y-3">
                    {subscriptions.map((sub) => {
                      const content = (
                        <>
                          <div>
                            <p className="font-semibold text-navy">{sub.product?.name}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {sub.started_at && (
                                <>
                                  Mulai {new Date(sub.started_at).toLocaleDateString("id-ID")}
                                  {sub.expires_at &&
                                    ` · Berakhir ${new Date(sub.expires_at).toLocaleDateString("id-ID")}`}
                                </>
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={sub.status === "active" ? "default" : "secondary"}>
                              {SUBSCRIPTION_STATUS_LABEL[sub.status]}
                            </Badge>
                            {sub.product?.slug && (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </>
                      );

                      if (!sub.product?.slug) {
                        return (
                          <div
                            key={sub.id}
                            className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between"
                          >
                            {content}
                          </div>
                        );
                      }

                      return (
                        <Link
                          key={sub.id}
                          to={`/products/${sub.product.slug}`}
                          className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-elegant sm:flex-row sm:items-center sm:justify-between"
                        >
                          {content}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {digital.length > 0 && (
                <div>
                  <h2 className="font-display text-lg font-bold text-navy">Produk Digital</h2>
                  <div className="mt-4 space-y-3">
                    {digital.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10">
                            <Package className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-navy">{item.product?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.download_count > 0
                                ? `Diunduh ${item.download_count}x`
                                : "Belum diunduh"}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          disabled={downloadingId === item.id || item.status !== "active"}
                          onClick={() => handleDownload(item.id, item.product?.name ?? "download")}
                        >
                          {downloadingId === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer settings={settings} />
    </main>
  );
}
