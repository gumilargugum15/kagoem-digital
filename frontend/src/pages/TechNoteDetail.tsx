import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Calendar, Clock, Loader2, User } from "lucide-react";

import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { MarkdownContent } from "@/components/markdown-content";
import { getTechNote } from "@/services/tech-notes";
import { getSettings } from "@/services/settings";
import { getStorageUrl } from "@/services/api";
import type { TechNote } from "@/types/api";

function formatDate(dateString: string | null): string {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function RelatedCard({ article }: { article: TechNote }) {
  const imageUrl = getStorageUrl(article.thumbnail);
  return (
    <Link
      to={`/tech-notes/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft hover-lift"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={article.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 to-cyan/15">
            <span className="font-display text-sm font-bold text-primary/40">
              {article.category}
            </span>
          </div>
        )}
      </div>
      <div className="p-5">
        <span className="text-xs font-bold uppercase tracking-wide text-primary">
          {article.category}
        </span>
        <h3 className="mt-2 font-display text-base font-bold leading-snug text-navy group-hover:text-primary">
          {article.title}
        </h3>
      </div>
    </Link>
  );
}

export default function TechNoteDetail() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["tech-notes", slug],
    queryFn: () => getTechNote(slug),
    enabled: Boolean(slug),
  });

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
          <h1 className="font-display text-2xl font-bold text-navy">Artikel tidak ditemukan</h1>
          <p className="text-sm text-muted-foreground">
            Artikel yang Anda cari mungkin telah dihapus atau tidak tersedia.
          </p>
          <Link
            to="/tech-notes"
            className="inline-flex items-center gap-2 rounded-full gradient-primary-bg px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elegant"
          >
            Kembali ke Tech Notes
          </Link>
        </div>
        <Footer settings={settings} />
      </main>
    );
  }

  const { article, related } = data;
  const imageUrl = getStorageUrl(article.thumbnail);

  return (
    <main className="min-h-screen bg-background">
      <Nav settings={settings} />

      <article className="relative overflow-hidden pt-28 sm:pt-32">
        <div className="pointer-events-none absolute inset-0 gradient-hero-bg" aria-hidden />
        <div className="relative mx-auto max-w-3xl px-4 pb-10 sm:px-6 lg:px-8">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-primary shadow-soft">
            {article.category}
          </span>
          <h1 className="mt-5 font-display text-3xl font-extrabold leading-tight text-navy sm:text-4xl">
            {article.title}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" /> {article.author_name}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> {formatDate(article.published_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> {article.reading_time} min read
            </span>
          </div>
        </div>

        {imageUrl && (
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="aspect-[16/9] overflow-hidden rounded-3xl shadow-elegant">
              <img src={imageUrl} alt={article.title} className="h-full w-full object-cover" />
            </div>
          </div>
        )}

        <div className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <MarkdownContent content={article.content} />

          {article.tags && article.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2 border-t border-border pt-6">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-navy"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="glass mt-10 flex items-center gap-4 rounded-3xl p-6 shadow-soft">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full gradient-primary-bg font-display text-lg font-bold text-white">
              {article.author_name.charAt(0)}
            </div>
            <div>
              <div className="font-display text-base font-bold text-navy">
                {article.author_name}
              </div>
              <p className="text-sm text-muted-foreground">
                Tim engineer Kagoem Digital yang senang berbagi ilmu seputar pengembangan aplikasi
                web dan mobile.
              </p>
            </div>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="relative bg-surface py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl font-bold text-navy">Related Articles</h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <RelatedCard key={item.id} article={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="relative py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] gradient-cta-bg p-8 text-center shadow-elegant sm:p-12">
            <h2 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
              Butuh bantuan mewujudkan project Anda?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/80 sm:text-base">
              Tim Kagoem Digital siap membantu membangun website, aplikasi web, dan mobile sesuai
              kebutuhan bisnis Anda.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href="/#contact"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-navy shadow-elegant transition-transform hover:scale-[1.03]"
              >
                Konsultasi Gratis <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/#portfolio"
                className="glass-dark inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
              >
                Lihat Portfolio
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer settings={settings} />
    </main>
  );
}
