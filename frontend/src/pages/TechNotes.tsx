import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowRight, Calendar, Clock, Inbox, Loader2, Search } from "lucide-react";

import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { getTechNotes } from "@/services/tech-notes";
import { getSettings } from "@/services/settings";
import { getStorageUrl } from "@/services/api";
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
  "Laravel",
  "PHP",
  "React",
  "Vue",
  "Flutter",
  "JavaScript",
  "TypeScript",
  "MySQL",
  "PostgreSQL",
  "Git",
  "GitLab",
  "DevOps",
  "Linux",
  "Docker",
  "API",
  "Tutorial",
  "Troubleshooting",
];

function formatDate(dateString: string | null): string {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function TechNotes() {
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["tech-notes", debouncedSearch, category, page],
    queryFn: () => getTechNotes({ search: debouncedSearch, category, page }),
  });

  const articles = data?.data ?? [];

  return (
    <main className="min-h-screen bg-background">
      <Nav settings={settings} />

      <section className="relative overflow-hidden pt-28 sm:pt-32">
        <div className="pointer-events-none absolute inset-0 gradient-hero-bg" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-4 pb-14 text-center sm:px-6 lg:px-8">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-primary shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Kagoem Digital Blog
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold text-navy sm:text-5xl">
            TECH NOTES
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Catatan, tutorial, dan solusi seputar teknologi dan pengembangan aplikasi.
          </p>

          <div className="mx-auto mt-8 max-w-lg">
            <div className="glass flex items-center gap-3 rounded-full px-5 py-3 shadow-soft">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari artikel..."
                className="w-full bg-transparent text-sm text-navy placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="relative pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2">
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

          {isLoading && (
            <div className="mt-14 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Memuat artikel...
            </div>
          )}

          {isError && (
            <div className="mt-14 flex flex-col items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-6 w-6 text-destructive" />
              Gagal memuat artikel. Silakan coba lagi nanti.
            </div>
          )}

          {!isLoading && !isError && articles.length === 0 && (
            <div className="mt-14 flex flex-col items-center gap-2 text-sm text-muted-foreground">
              <Inbox className="h-6 w-6" />
              Belum ada artikel untuk kategori atau pencarian ini.
            </div>
          )}

          {articles.length > 0 && (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => {
                const imageUrl = getStorageUrl(article.thumbnail);
                return (
                  <article
                    key={article.id}
                    className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft hover-lift"
                  >
                    <Link
                      to={`/tech-notes/${article.slug}`}
                      className="relative block aspect-[16/9] overflow-hidden"
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={article.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 to-cyan/15">
                          <span className="font-display text-lg font-bold text-primary/40">
                            {article.category}
                          </span>
                        </div>
                      )}
                    </Link>
                    <div className="flex flex-1 flex-col p-6">
                      <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                        {article.category}
                      </span>
                      <Link to={`/tech-notes/${article.slug}`}>
                        <h3 className="mt-3 font-display text-lg font-bold leading-snug text-navy transition-colors group-hover:text-primary">
                          {article.title}
                        </h3>
                      </Link>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {article.excerpt}
                      </p>

                      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" /> {article.reading_time} min read
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" /> {formatDate(article.published_at)}
                        </span>
                      </div>

                      {article.tags && article.tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {article.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-border bg-white/70 px-2.5 py-0.5 text-[11px] font-semibold text-navy"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <Link
                        to={`/tech-notes/${article.slug}`}
                        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-transform hover:translate-x-0.5"
                      >
                        Baca Artikel <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                );
              })}
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

      <Footer settings={settings} />
    </main>
  );
}
