import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowRight, Inbox, Loader2, Search } from "lucide-react";

import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/services/products";
import { getSettings } from "@/services/settings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const CATEGORIES = [
  "All",
  "Digital Products",
  "Software",
  "Template",
  "Source Code",
  "Ebook",
  "Tools",
  "Subscription",
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Popular" },
  { value: "price_low", label: "Price Low → High" },
  { value: "price_high", label: "Price High → Low" },
];

export default function Products() {
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, sort]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", debouncedSearch, category, sort, page],
    queryFn: () => getProducts({ search: debouncedSearch, category, sort, page }),
  });

  const products = data?.data ?? [];

  return (
    <main className="min-h-screen bg-background">
      <Nav settings={settings} />

      <section className="relative overflow-hidden pt-28 sm:pt-32">
        <div className="pointer-events-none absolute inset-0 gradient-hero-bg" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-4 pb-14 text-center sm:px-6 lg:px-8">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-primary shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Kagoem Digital Marketplace
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold text-navy sm:text-5xl">
            PRODUCTS
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Produk digital dan aplikasi siap pakai untuk membantu bisnis dan kebutuhan digital Anda.
          </p>

          <div className="mx-auto mt-8 max-w-lg">
            <div className="glass flex items-center gap-3 rounded-full px-5 py-3 shadow-soft">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari produk..."
                className="w-full bg-transparent text-sm text-navy placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="relative pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    category === c
                      ? "gradient-primary-bg text-primary-foreground shadow-elegant"
                      : "glass text-navy hover:scale-105"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-full glass sm:w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading && (
            <div className="mt-14 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Memuat produk...
            </div>
          )}

          {isError && (
            <div className="mt-14 flex flex-col items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-6 w-6 text-destructive" />
              Gagal memuat produk. Silakan coba lagi nanti.
            </div>
          )}

          {!isLoading && !isError && products.length === 0 && (
            <div className="mt-14 flex flex-col items-center gap-2 text-sm text-muted-foreground">
              <Inbox className="h-6 w-6" />
              Belum ada produk untuk kategori atau pencarian ini.
            </div>
          )}

          {products.length > 0 && (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {data && data.last_page > 1 && (
            <Pagination className="mt-12">
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

      <section className="relative py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] gradient-cta-bg p-8 text-center shadow-elegant sm:p-12">
            <h2 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
              Temukan solusi digital untuk bisnis Anda.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/80 sm:text-base">
              Gunakan produk siap pakai atau konsultasikan kebutuhan aplikasi custom Anda dengan
              Kagoem Digital.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-navy shadow-elegant transition-transform hover:scale-[1.03]"
              >
                Lihat Products <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="/#contact"
                className="glass-dark inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
              >
                Konsultasi Gratis
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer settings={settings} />
    </main>
  );
}
