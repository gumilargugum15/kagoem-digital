import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Download, ExternalLink, Loader2, Package, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { getMyProducts, downloadDigitalProduct } from "@/services/my-products";
import { getSettings } from "@/services/settings";
import { ApiClientError, getStorageUrl } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const SUBSCRIPTION_STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu Aktivasi",
  active: "Active",
  expired: "Expired",
  cancelled: "Cancelled",
};

export default function MyProducts() {
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["my-products"],
    queryFn: getMyProducts,
  });
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
              <Loader2 className="h-4 w-4 animate-spin" /> Memuat Produk...
            </div>
          ) : isError ? (
            <div className="mt-16 flex flex-col items-center gap-4 text-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-sm text-muted-foreground">Gagal memuat produk.</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => refetch()}
                disabled={isRefetching}
              >
                {isRefetching ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Coba Lagi
              </Button>
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
                      const thumbnail = getStorageUrl(sub.product?.thumbnail);
                      const isExpired = sub.status === "expired";
                      const application = sub.product?.application;
                      const canOpenApp =
                        sub.status === "active" &&
                        sub.provisioning?.status === "completed" &&
                        Boolean(application?.base_url);
                      const provisioningFailed = sub.provisioning?.status === "failed";

                      return (
                        <div
                          key={sub.id}
                          className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-center gap-3">
                            {thumbnail ? (
                              <img
                                src={thumbnail}
                                alt={sub.product?.name}
                                className="h-12 w-12 shrink-0 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10">
                                <Package className="h-5 w-5 text-primary" />
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-navy">{sub.product?.name}</p>
                              <p className="text-xs text-muted-foreground">Subscription</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {isExpired ? "Expired" : "Berakhir"}:{" "}
                                {sub.expires_at
                                  ? new Date(sub.expires_at).toLocaleDateString("id-ID", {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    })
                                  : "-"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={sub.status === "active" ? "default" : "secondary"}>
                              {provisioningFailed
                                ? "Provisioning Failed"
                                : SUBSCRIPTION_STATUS_LABEL[sub.status]}
                            </Badge>
                            {canOpenApp && application?.base_url ? (
                              <Button type="button" size="sm" asChild>
                                <a href={application.base_url} target="_blank" rel="noreferrer">
                                  <ExternalLink className="h-4 w-4" /> Buka Aplikasi
                                </a>
                              </Button>
                            ) : (
                              sub.product?.slug && (
                                <Button type="button" variant="outline" size="sm" asChild>
                                  <Link to={`/products/${sub.product.slug}`}>Detail</Link>
                                </Button>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {digital.length > 0 && (
                <div>
                  <h2 className="font-display text-lg font-bold text-navy">Digital Products</h2>
                  <div className="mt-4 space-y-3">
                    {digital.map((item) => {
                      const thumbnail = getStorageUrl(item.product?.thumbnail);

                      return (
                        <div
                          key={item.id}
                          className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-center gap-3">
                            {thumbnail ? (
                              <img
                                src={thumbnail}
                                alt={item.product?.name}
                                className="h-12 w-12 shrink-0 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10">
                                <Package className="h-5 w-5 text-primary" />
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-navy">{item.product?.name}</p>
                              <p className="text-xs text-muted-foreground">Digital Product</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {item.download_count > 0
                                  ? `Diunduh ${item.download_count}x`
                                  : "Belum diunduh"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={item.status === "active" ? "default" : "secondary"}>
                              {item.status === "active" ? "Owned" : "Revoked"}
                            </Badge>
                            <Button
                              type="button"
                              size="sm"
                              disabled={downloadingId === item.id || item.status !== "active"}
                              onClick={() =>
                                handleDownload(item.id, item.product?.name ?? "download")
                              }
                            >
                              {downloadingId === item.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                              Download
                            </Button>
                          </div>
                        </div>
                      );
                    })}
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
