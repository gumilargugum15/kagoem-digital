import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowRight,
  Check,
  Download,
  ExternalLink,
  Loader2,
  MessageCircle,
  Package,
  RefreshCw,
  ShieldCheck,
  ShoppingCart,
  Star,
  Zap,
} from "lucide-react";

import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ProductBadge } from "@/components/product-badge";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { PricingCard } from "@/components/pricing-card";
import { FeatureComparisonTable } from "@/components/feature-comparison-table";
import { getProduct } from "@/services/products";
import { getSettings } from "@/services/settings";
import { getStorageUrl, ApiClientError } from "@/services/api";
import { addCartItem } from "@/services/cart";
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Product, SubscriptionPlan } from "@/types/api";

const DIGITAL_TRUST_ITEMS = [
  { icon: ShieldCheck, label: "Secure Payment" },
  { icon: Zap, label: "Instant Access" },
  { icon: MessageCircle, label: "Developer Support" },
  { icon: RefreshCw, label: "Regular Updates" },
];

const SUBSCRIPTION_TRUST_ITEMS = [
  { icon: Check, label: "Cancel anytime" },
  { icon: RefreshCw, label: "Regular updates" },
  { icon: MessageCircle, label: "Customer support" },
  { icon: Package, label: "Cloud based" },
];

function whatsappHref(phone: string | undefined, message: string): string {
  if (!phone) return "/#contact";
  return `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`;
}

function groupPlansByName(plans: SubscriptionPlan[]) {
  const groups = new Map<string, { monthly?: SubscriptionPlan; yearly?: SubscriptionPlan }>();
  for (const plan of plans) {
    const group = groups.get(plan.name) ?? {};
    group[plan.billing_interval] = plan;
    groups.set(plan.name, group);
  }
  return Array.from(groups.values());
}

export default function ProductDetail() {
  const { slug = "" } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const queryClient = useQueryClient();
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);
  const [buyNow, setBuyNow] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", slug],
    queryFn: () => getProduct(slug),
    enabled: Boolean(slug),
  });

  const addToCartMutation = useMutation({
    mutationFn: addCartItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      if (buyNow) {
        navigate("/checkout");
        return;
      }
      const name = data?.product.name ?? "Produk";
      toast.success(`${name} berhasil ditambahkan ke keranjang.`);
    },
    onError: (e: unknown) =>
      toast.error(e instanceof ApiClientError ? e.message : "Gagal menambahkan ke keranjang"),
  });

  const handleAddDigitalToCart = (options: { buyNow?: boolean } = {}) => {
    if (!data) return;
    setBuyNow(Boolean(options.buyNow));
    addToCartMutation.mutate({ product_id: data.product.id, quantity: 1 });
  };

  const handleAddSubscriptionToCart = (options: { buyNow?: boolean } = {}) => {
    if (!selectedPlanId) {
      setPlanError("Silakan pilih paket terlebih dahulu.");
      return;
    }
    if (!data) return;
    setPlanError(null);
    setBuyNow(Boolean(options.buyNow));
    addToCartMutation.mutate({
      product_id: data.product.id,
      subscription_plan_id: selectedPlanId,
    });
  };

  const planGroups = useMemo(
    () => groupPlansByName(data?.product.plans ?? []),
    [data?.product.plans],
  );

  const hasYearly = planGroups.some((g) => g.yearly);

  const displayedPlans = useMemo(() => {
    return planGroups
      .map((group) => group[interval] ?? group.monthly ?? group.yearly)
      .filter((p): p is SubscriptionPlan => Boolean(p));
  }, [planGroups, interval]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Nav settings={settings} />
        <div className="flex min-h-screen items-center justify-center pt-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="min-h-screen bg-background">
        <Nav settings={settings} />
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 pt-20 text-center">
          <h1 className="font-display text-2xl font-bold text-navy">Produk tidak ditemukan</h1>
          <p className="text-sm text-muted-foreground">
            Produk yang Anda cari mungkin telah dihapus atau tidak tersedia.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-full gradient-primary-bg px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elegant"
          >
            Kembali ke Products
          </Link>
        </div>
        <Footer settings={settings} />
      </main>
    );
  }

  const { product, related } = data;
  const isSubscription = product.type === "subscription";
  const hasDiscount = Boolean(product.discount_price);
  const heroImage = getStorageUrl(product.thumbnail);
  const galleryImages = product.gallery ?? (product.thumbnail ? [product.thumbnail] : []);
  const trustItems = isSubscription ? SUBSCRIPTION_TRUST_ITEMS : DIGITAL_TRUST_ITEMS;

  return (
    <main className="min-h-screen bg-background">
      <Nav settings={settings} />

      <article className="relative overflow-hidden pt-28 sm:pt-32">
        <div className="pointer-events-none absolute inset-0 gradient-hero-bg" aria-hidden />
        <div className="relative mx-auto max-w-3xl px-4 pb-8 text-center sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2">
            <ProductBadge
              badge={product.badge}
              hasDiscount={hasDiscount}
              isSubscription={isSubscription}
            />
          </div>
          <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight text-navy sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {product.short_description}
          </p>
          {product.rating && (
            <div className="mt-3 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {product.rating}
              {product.purchases_count > 0 && (
                <span>&middot; {product.purchases_count}+ terjual</span>
              )}
            </div>
          )}
        </div>

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {galleryImages.length > 0 ? (
            <ProductGallery images={galleryImages} alt={product.name} />
          ) : (
            heroImage && (
              <div className="aspect-[16/9] overflow-hidden rounded-3xl shadow-elegant">
                <img src={heroImage} alt={product.name} className="h-full w-full object-cover" />
              </div>
            )
          )}
        </div>

        <div className="relative mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          {product.description && (
            <div className="whitespace-pre-line text-[15px] leading-relaxed text-muted-foreground sm:text-base">
              {product.description}
            </div>
          )}

          {product.features && product.features.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-xl font-bold text-navy">Features</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {product.features.map((feature) => (
                  <div key={feature.id} className="glass rounded-2xl p-4 shadow-soft">
                    <div className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <div>
                        <div className="font-semibold text-navy">{feature.name}</div>
                        {feature.description && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {feature.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.technology && product.technology.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-xl font-bold text-navy">Technology</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {product.technology.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-border bg-muted px-3 py-1.5 text-sm font-medium text-navy"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {product.whats_included && product.whats_included.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-xl font-bold text-navy">What's Included</h2>
              <ul className="mt-4 space-y-2">
                {product.whats_included.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-navy">
                    <Check className="h-4 w-4 shrink-0 text-primary" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.requirements && product.requirements.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-xl font-bold text-navy">Requirements</h2>
              <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                {product.requirements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Pricing */}
          <div className="mt-12">
            <h2 className="font-display text-xl font-bold text-navy">Pricing</h2>

            {isSubscription ? (
              <div className="mt-6">
                {hasYearly && (
                  <div className="mb-8 flex items-center justify-center">
                    <div className="glass inline-flex rounded-full p-1 shadow-soft">
                      <button
                        onClick={() => setInterval("monthly")}
                        className={cn(
                          "rounded-full px-5 py-2 text-sm font-semibold transition-all",
                          interval === "monthly"
                            ? "gradient-primary-bg text-primary-foreground shadow-elegant"
                            : "text-navy",
                        )}
                      >
                        Bulanan
                      </button>
                      <button
                        onClick={() => setInterval("yearly")}
                        className={cn(
                          "rounded-full px-5 py-2 text-sm font-semibold transition-all",
                          interval === "yearly"
                            ? "gradient-primary-bg text-primary-foreground shadow-elegant"
                            : "text-navy",
                        )}
                      >
                        Tahunan
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {displayedPlans.map((plan) => {
                    const monthlyEquivalent =
                      interval === "yearly" && plan.price
                        ? (Number(plan.price) / 12).toFixed(2)
                        : null;
                    const isCustom = plan.price === null;
                    return (
                      <PricingCard
                        key={plan.id}
                        plan={plan}
                        currency={product.currency}
                        monthlyEquivalent={monthlyEquivalent}
                        selected={selectedPlanId === plan.id}
                        onSelect={() => {
                          if (isCustom) {
                            window.open(
                              whatsappHref(
                                settings?.whatsapp,
                                `Halo Kagoem Digital, saya ingin bertanya tentang paket ${plan.name} untuk "${product.name}".`,
                              ),
                              "_blank",
                            );
                            return;
                          }
                          setPlanError(null);
                          setSelectedPlanId((current) => (current === plan.id ? null : plan.id));
                        }}
                      />
                    );
                  })}
                </div>

                {displayedPlans.length > 1 && (
                  <div className="mt-10">
                    <h3 className="font-display text-lg font-bold text-navy">Perbandingan Paket</h3>
                    <div className="mt-4">
                      <FeatureComparisonTable plans={displayedPlans} />
                    </div>
                  </div>
                )}

                {displayedPlans.some((p) => p.price !== null) && (
                  <div className="mt-8 flex flex-col items-center gap-3">
                    {planError && (
                      <p className="text-sm font-medium text-destructive">{planError}</p>
                    )}
                    <div className="flex flex-wrap justify-center gap-3">
                      <Button
                        type="button"
                        onClick={() => handleAddSubscriptionToCart({ buyNow: true })}
                        disabled={addToCartMutation.isPending}
                        className="w-full max-w-xs py-5 sm:w-auto sm:px-10"
                      >
                        {addToCartMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : null}
                        Beli Sekarang
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleAddSubscriptionToCart()}
                        disabled={addToCartMutation.isPending}
                        className="w-full max-w-xs py-5 sm:w-auto sm:px-10"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                      </Button>
                    </div>
                    {addToCartMutation.isSuccess && !buyNow && (
                      <Link
                        to="/cart"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:translate-x-0.5"
                      >
                        Go to Cart <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-6 glass rounded-3xl p-6 shadow-soft sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-3xl font-extrabold text-navy">
                        {formatCurrency(product.discount_price ?? product.price, product.currency)}
                      </span>
                      {hasDiscount && (
                        <span className="text-base text-muted-foreground line-through">
                          {formatCurrency(product.price, product.currency)}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Pembayaran sekali (lifetime)
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      type="button"
                      onClick={() => handleAddDigitalToCart({ buyNow: true })}
                      disabled={addToCartMutation.isPending}
                      className="px-6 py-5"
                    >
                      {addToCartMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : null}
                      Beli Sekarang
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleAddDigitalToCart()}
                      disabled={addToCartMutation.isPending}
                      className="px-6 py-5"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </Button>
                    {product.download_url && (
                      <a
                        href={product.download_url}
                        target="_blank"
                        rel="noreferrer"
                        className="glass inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-navy shadow-soft"
                      >
                        <Download className="h-4 w-4" /> Preview
                      </a>
                    )}
                    {addToCartMutation.isSuccess && !buyNow && (
                      <Link
                        to="/cart"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:translate-x-0.5"
                      >
                        Go to Cart <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {product.demo_url && (
            <div className="mt-10 text-center">
              <a
                href={product.demo_url}
                target="_blank"
                rel="noreferrer"
                className="glass inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-navy shadow-soft transition-transform hover:scale-[1.03]"
              >
                <ExternalLink className="h-4 w-4" /> Lihat Demo
              </a>
            </div>
          )}

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {trustItems.map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-center shadow-soft"
              >
                <item.icon className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium text-navy">{item.label}</span>
              </div>
            ))}
          </div>

          {product.faqs && product.faqs.length > 0 && (
            <div className="mt-12">
              <h2 className="font-display text-xl font-bold text-navy">FAQ</h2>
              <Accordion type="single" collapsible className="mt-4">
                {product.faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`}>
                    <AccordionTrigger className="text-left font-semibold text-navy">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </div>
      </article>

      {related.length > 0 && (
        <section className="relative bg-surface py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl font-bold text-navy">Produk Terkait</h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item: Product) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="relative py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] gradient-cta-bg p-8 text-center shadow-elegant sm:p-12">
            <h2 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
              Butuh solusi digital khusus untuk bisnis Anda?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/80 sm:text-base">
              Tim Kagoem Digital siap membantu membangun aplikasi custom sesuai kebutuhan bisnis
              Anda.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href="/#contact"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-navy shadow-elegant transition-transform hover:scale-[1.03]"
              >
                Konsultasi Gratis <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                to="/products"
                className="glass-dark inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
              >
                Lihat Produk Lain
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer settings={settings} />
    </main>
  );
}
