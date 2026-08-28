import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { getCart } from "@/services/cart";
import { checkout } from "@/services/orders";
import { getSettings } from "@/services/settings";
import { ApiClientError } from "@/services/api";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const { data: cart, isLoading } = useQuery({ queryKey: ["cart"], queryFn: getCart });
  const [phone, setPhone] = useState("");

  const checkoutMutation = useMutation({
    mutationFn: () => checkout(phone || undefined),
    onSuccess: (order) => {
      navigate(`/checkout/success?order=${order.order_number}`);
    },
    onError: (e: unknown) =>
      toast.error(e instanceof ApiClientError ? e.message : "Checkout gagal. Silakan coba lagi."),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    checkoutMutation.mutate();
  };

  const items = cart?.items ?? [];

  return (
    <main className="min-h-screen bg-background">
      <Nav settings={settings} />

      <section className="relative pt-28 pb-24 sm:pt-32">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link
            to="/cart"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-navy"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke Keranjang
          </Link>

          <h1 className="mt-4 font-display text-3xl font-extrabold text-navy sm:text-4xl">
            Checkout
          </h1>

          {isLoading ? (
            <div className="mt-16 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Memuat...
            </div>
          ) : items.length === 0 ? (
            <div className="mt-16 flex flex-col items-center gap-4 text-center">
              <p className="text-sm text-muted-foreground">Keranjang Anda masih kosong.</p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-full gradient-primary-bg px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elegant"
              >
                Jelajahi Produk
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                  <h2 className="font-display text-base font-bold text-navy">Customer</h2>
                  <div className="mt-3 space-y-1 text-sm">
                    <p className="font-medium text-navy">{user?.name}</p>
                    <p className="text-muted-foreground">{user?.email}</p>
                  </div>
                  <div className="mt-4 space-y-1.5">
                    <Label htmlFor="phone">Nomor Telepon (opsional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="08xxxxxxxxxx"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                  <h2 className="font-display text-base font-bold text-navy">Order</h2>
                  <div className="mt-4 divide-y divide-border">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-4 py-3">
                        <div>
                          <p className="font-medium text-navy">{item.product_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(item.price)}
                            {item.billing_interval
                              ? ` / ${item.billing_interval === "monthly" ? "bulan" : "tahun"}`
                              : ""}{" "}
                            &middot; Qty {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold text-navy">{formatCurrency(item.subtotal)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pb-4">
                <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:sticky sm:top-28">
                  <h3 className="font-display text-base font-bold text-navy">Ringkasan</h3>
                  <div className="mt-4 space-y-2.5 text-sm">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="text-navy">{formatCurrency(cart?.subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-border pt-3 text-base font-bold text-navy">
                      <span>Total</span>
                      <span>{formatCurrency(cart?.total)}</span>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={checkoutMutation.isPending}
                    className="mt-6 w-full py-5"
                  >
                    {checkoutMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Lanjutkan Pembayaran"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </section>

      <Footer settings={settings} />
    </main>
  );
}
