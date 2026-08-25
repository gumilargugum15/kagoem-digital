import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Code2,
  Globe,
  Layers,
  LayoutDashboard,
  LifeBuoy,
  Loader2,
  MessageCircle,
  Rocket,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Users,
  Wallet,
  Wrench,
  Zap,
  Cpu,
  Database,
  GitBranch,
  Cloud,
  Server,
  ClipboardList,
  Search,
  PenTool,
  Hammer,
  Bug,
  UploadCloud,
  Settings2,
  AlertCircle,
  Inbox,
  type LucideIcon,
} from "lucide-react";

import heroIllustration from "@/assets/hero-illustration.png";
import aboutIllustration from "@/assets/about-illustration.png";
import { getServices } from "@/services/services";
import { getPortfolios } from "@/services/portfolios";
import { getFaqs } from "@/services/faqs";
import { sendContactMessage } from "@/services/contact";
import { getSettings } from "@/services/settings";
import { getStats } from "@/services/stats";
import { ApiClientError, getStorageUrl } from "@/services/api";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import type { ContactPayload, SiteSettings } from "@/types/api";

/* ------------------------------------------------------------------ */
/*  Small hooks                                                       */
/* ------------------------------------------------------------------ */

function useCountUp(target: number, start: boolean, duration = 1600) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, start, duration]);
  return value;
}

function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ------------------------------------------------------------------ */
/*  Components                                                        */
/* ------------------------------------------------------------------ */

function StatCard({ end, suffix, label }: { end: number; suffix?: string; label: string }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const val = useCountUp(end, inView);
  return (
    <div ref={ref} className="glass rounded-2xl p-5 text-center shadow-soft hover-lift">
      <div className="font-display text-3xl font-extrabold text-navy sm:text-4xl">
        {val}
        {suffix}
      </div>
      <div className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">{label}</div>
    </div>
  );
}

function Hero() {
  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: getStats,
  });

  return (
    <section id="home" className="relative overflow-hidden pt-28 sm:pt-32">
      <div className="pointer-events-none absolute inset-0 gradient-hero-bg" aria-hidden />
      <div
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/25 blur-3xl animate-blob"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-40 -right-24 h-80 w-80 rounded-full bg-cyan/25 blur-3xl animate-blob"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 pb-16 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8 lg:pb-24">
        <div className="animate-fade-up">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-primary shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Software House & Digital Agency
          </span>

          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.08] text-navy sm:text-5xl lg:text-6xl">
            Mewujudkan <span className="gradient-text">Solusi Digital</span> untuk Bisnis Anda
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Kami membantu perusahaan, UMKM, startup, dan instansi membangun{" "}
            <span className="font-semibold text-navy">Website</span>,{" "}
            <span className="font-semibold text-navy">Aplikasi Mobile</span>, dan{" "}
            <span className="font-semibold text-navy">Sistem Informasi</span> yang cepat, aman,
            modern, dan scalable.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#contact"
              className="group inline-flex items-center gap-2 rounded-full gradient-primary-bg px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.03]"
            >
              Konsultasi Gratis
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#portfolio"
              className="glass inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-navy shadow-soft transition-transform hover:scale-[1.03]"
            >
              Lihat Portfolio
            </a>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard end={stats?.projects_count ?? 0} suffix="+" label="Project" />
            <StatCard end={stats?.clients_count ?? 0} suffix="+" label="Client" />
            <StatCard end={5} suffix="+" label="Tahun Pengalaman" />
            <div className="glass rounded-2xl p-5 text-center shadow-soft hover-lift">
              <div className="grid place-items-center">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <div className="mt-1 text-xs font-semibold text-navy sm:text-sm">
                Support After Sales
              </div>
            </div>
          </div>
        </div>

        <div className="relative animate-fade-in">
          <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/15 to-cyan/15 blur-2xl" />
          <div className="relative animate-float">
            <img
              src={heroIllustration}
              alt="Ilustrasi programmer membangun aplikasi"
              width={1280}
              height={1024}
              className="mx-auto w-full max-w-lg drop-shadow-2xl lg:max-w-none"
            />
          </div>

          {/* Floating cards */}
          <div className="glass absolute left-2 top-8 hidden animate-float rounded-2xl p-3 shadow-elegant sm:flex sm:items-center sm:gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl gradient-primary-bg text-white">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-navy">Deploy Success</div>
              <div className="text-[10px] text-muted-foreground">v1.2.0 • 2m ago</div>
            </div>
          </div>
          <div className="glass absolute bottom-6 right-2 hidden animate-float rounded-2xl p-3 shadow-elegant sm:flex sm:items-center sm:gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-cyan text-navy">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-navy">+128 Users</div>
              <div className="text-[10px] text-muted-foreground">this week</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={`mx-auto max-w-3xl ${align === "center" ? "text-center" : "text-left"} `}>
      <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-primary shadow-soft">
        {eyebrow}
      </span>
      <h2 className="mt-4 font-display text-3xl font-extrabold text-navy sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function About() {
  return (
    <section id="about" className="relative py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="relative order-2 lg:order-1">
          <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-tr from-cyan/15 to-primary/15 blur-2xl" />
          <img
            src={aboutIllustration}
            alt="Tim Kagoem Digital sedang bekerja"
            width={1280}
            height={960}
            loading="lazy"
            className="mx-auto w-full max-w-lg drop-shadow-xl lg:max-w-none"
          />
        </div>
        <div className="order-1 lg:order-2">
          <SectionHeader
            align="left"
            eyebrow="Tentang Kami"
            title={
              <>
                Partner <span className="gradient-text">Digital</span> untuk pertumbuhan bisnis Anda
              </>
            }
            subtitle="Kagoem Digital merupakan software house yang menyediakan layanan pengembangan aplikasi berbasis web dan mobile menggunakan teknologi modern agar bisnis berkembang lebih cepat."
          />
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              "Tim engineer berpengalaman",
              "Teknologi modern & scalable",
              "Kolaborasi transparan",
              "Delivery tepat waktu",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2 text-sm text-navy">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full gradient-primary-bg text-white">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ------------------------- SERVICES ------------------------- */

const SERVICE_ICONS: Record<string, LucideIcon> = {
  website: Globe,
  mobile: Smartphone,
  informasi: LayoutDashboard,
  custom: Code2,
  inventory: ClipboardList,
  pos: Wallet,
  cashier: Wallet,
  erp: Layers,
  api: Cpu,
  maintenance: Wrench,
  support: Wrench,
};

function getServiceIcon(title: string): LucideIcon {
  const key = title.toLowerCase();
  const match = Object.entries(SERVICE_ICONS).find(([k]) => key.includes(k));
  return match ? match[1] : Sparkles;
}

function Services() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["services"],
    queryFn: getServices,
  });

  return (
    <section id="services" className="relative bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Our Services"
          title={
            <>
              Layanan <span className="gradient-text">lengkap</span> untuk transformasi digital
            </>
          }
          subtitle="Dari ide sampai produksi — kami bantu wujudkan produk digital yang cepat, aman, dan scalable."
        />

        {isLoading && (
          <div className="mt-14 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Memuat layanan...
          </div>
        )}

        {isError && (
          <div className="mt-14 flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-6 w-6 text-destructive" />
            Gagal memuat data layanan. Silakan coba lagi nanti.
          </div>
        )}

        {data && data.length === 0 && (
          <div className="mt-14 flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <Inbox className="h-6 w-6" />
            Belum ada layanan yang tersedia.
          </div>
        )}

        {data && data.length > 0 && (
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((s, i) => {
              const Icon = getServiceIcon(s.title);
              return (
                <article
                  key={s.id}
                  style={{ animationDelay: `${i * 80}ms` }}
                  className="group relative animate-fade-up overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-soft hover-lift"
                >
                  <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-primary/15 to-cyan/15 blur-2xl transition-transform group-hover:scale-125" />
                  <div className="relative">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-primary-bg text-white shadow-elegant transition-transform group-hover:scale-110">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 font-display text-xl font-bold text-navy">{s.title}</h3>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      {s.short_description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------- TECHNOLOGY ------------------------- */

const tech = [
  { group: "Frontend", icon: Layers, items: ["Vue.js", "Flutter", "HTML5", "CSS3", "JavaScript"] },
  { group: "Backend", icon: Server, items: ["PHP", "Laravel"] },
  { group: "Database", icon: Database, items: ["MySQL", "PostgreSQL"] },
  { group: "API", icon: Cpu, items: ["REST API"] },
  { group: "Version Control", icon: GitBranch, items: ["Git"] },
  { group: "Hosting", icon: Cloud, items: ["Linux Server", "VPS", "Cloud"] },
];

function Technology() {
  return (
    <section id="technology" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Technology Stack"
          title={
            <>
              Kami membangun dengan <span className="gradient-text">teknologi modern</span>
            </>
          }
          subtitle="Stack teknologi yang battle-tested untuk performa, keamanan, dan skalabilitas jangka panjang."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tech.map((t) => (
            <div key={t.group} className="glass rounded-3xl p-6 shadow-soft hover-lift">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl gradient-primary-bg text-white shadow-elegant">
                  <t.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-bold text-navy">{t.group}</h3>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {t.items.map((i) => (
                  <span
                    key={i}
                    className="rounded-full border border-border bg-white/70 px-3 py-1 text-xs font-semibold text-navy shadow-soft"
                  >
                    {i}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------- WHY US ------------------------- */

const why = [
  { icon: Users, title: "Professional Team", desc: "Engineer & designer berpengalaman." },
  { icon: Cpu, title: "Modern Technology", desc: "Stack terbaru & performa optimal." },
  { icon: Rocket, title: "Fast Development", desc: "Delivery cepat tanpa kompromi kualitas." },
  { icon: Smartphone, title: "Responsive Design", desc: "Sempurna di semua device." },
  { icon: Shield, title: "Secure System", desc: "Best practice keamanan aplikasi." },
  { icon: Layers, title: "Scalable Architecture", desc: "Siap tumbuh bersama bisnis Anda." },
  { icon: Wallet, title: "Affordable Price", desc: "Harga transparan & kompetitif." },
  { icon: LifeBuoy, title: "Free Consultation", desc: "Diskusi kebutuhan tanpa biaya." },
];

function WhyUs() {
  return (
    <section id="why" className="relative bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Why Choose Us"
          title={
            <>
              Kenapa memilih <span className="gradient-text">Kagoem Digital?</span>
            </>
          }
          subtitle="Delapan alasan yang membuat klien kami terus kembali untuk project berikutnya."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {why.map((w, i) => (
            <div
              key={w.title}
              style={{ animationDelay: `${i * 60}ms` }}
              className="group animate-fade-up rounded-3xl border border-border bg-card p-6 shadow-soft hover-lift"
            >
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-primary/10 to-cyan/10 text-primary transition-transform group-hover:scale-110 group-hover:from-primary group-hover:to-cyan group-hover:text-white">
                <w.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-navy">{w.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{w.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------- PROCESS ------------------------- */

const steps = [
  { icon: MessageCircle, title: "Consultation", desc: "Diskusi kebutuhan & tujuan bisnis." },
  { icon: Search, title: "Analysis", desc: "Riset, requirement, & scope project." },
  { icon: PenTool, title: "UI/UX Design", desc: "Wireframe, prototype, design system." },
  { icon: Hammer, title: "Development", desc: "Coding dengan best practice." },
  { icon: Bug, title: "Testing", desc: "QA, security, dan performance test." },
  { icon: UploadCloud, title: "Deployment", desc: "Rilis ke server produksi." },
  { icon: Settings2, title: "Maintenance", desc: "Support & pengembangan berkelanjutan." },
];

function Process() {
  return (
    <section id="process" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Development Process"
          title={
            <>
              Alur kerja yang <span className="gradient-text">terstruktur</span> & transparan
            </>
          }
          subtitle="Setiap tahap dijalankan dengan komunikasi terbuka agar hasil sesuai ekspektasi."
        />

        <div className="relative mt-16">
          <div className="pointer-events-none absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent lg:block" />
          <ol className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-7">
            {steps.map((s, i) => (
              <li
                key={s.title}
                style={{ animationDelay: `${i * 80}ms` }}
                className="group relative animate-fade-up"
              >
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl gradient-primary-bg text-white shadow-elegant transition-transform group-hover:scale-110">
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="mt-4 rounded-2xl border border-border bg-card p-4 text-center shadow-soft">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-primary">
                    Step {i + 1}
                  </div>
                  <div className="mt-1 font-display text-sm font-bold text-navy">{s.title}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ------------------------- PORTFOLIO ------------------------- */

function Portfolio() {
  const [active, setActive] = useState<string>("All");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["portfolios"],
    queryFn: () => getPortfolios(),
  });

  const categories = useMemo(() => {
    if (!data) return ["All"];
    return ["All", ...Array.from(new Set(data.map((p) => p.category)))];
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return active === "All" ? data : data.filter((p) => p.category === active);
  }, [data, active]);

  return (
    <section id="portfolio" className="relative bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Portfolio"
          title={
            <>
              Karya <span className="gradient-text">terbaik</span> kami
            </>
          }
          subtitle="Sebagian project yang telah kami kerjakan bersama klien dari berbagai industri."
        />

        {isLoading && (
          <div className="mt-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Memuat portfolio...
          </div>
        )}

        {isError && (
          <div className="mt-10 flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-6 w-6 text-destructive" />
            Gagal memuat data portfolio. Silakan coba lagi nanti.
          </div>
        )}

        {data && (
          <>
            <div className="mt-10 flex flex-wrap justify-center gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setActive(c)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    active === c
                      ? "gradient-primary-bg text-primary-foreground shadow-elegant"
                      : "glass text-navy hover:scale-105"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="mt-10 flex flex-col items-center gap-2 text-sm text-muted-foreground">
                <Inbox className="h-6 w-6" />
                Belum ada portfolio untuk kategori ini.
              </div>
            ) : (
              <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((p) => {
                  const imageUrl = getStorageUrl(p.image);
                  return (
                    <article
                      key={p.id}
                      className="group relative overflow-hidden rounded-3xl border border-border bg-card shadow-soft hover-lift"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={p.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 to-cyan/15">
                            <LayoutDashboard className="h-10 w-10 text-primary/50" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                        <div className="absolute bottom-0 left-0 right-0 translate-y-4 p-5 text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                          <div className="text-xs font-semibold uppercase tracking-widest text-cyan">
                            {p.category}
                          </div>
                          <div className="mt-1 font-display text-lg font-bold">{p.title}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-5">
                        <div>
                          <div className="text-xs font-semibold text-primary">{p.category}</div>
                          <div className="font-display text-base font-bold text-navy">
                            {p.title}
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

/* ------------------------- TESTIMONIAL ------------------------- */

const testimonials = [
  {
    name: "Andini Pratama",
    role: "CEO, RetailKu",
    text: "Tim Kagoem Digital sangat responsif dan hasil kerjanya rapi. Sistem POS kami sekarang jauh lebih cepat dan andal.",
    rating: 5,
  },
  {
    name: "Budi Santoso",
    role: "Founder, LogistikPro",
    text: "Aplikasi mobile kami dibangun tepat waktu dengan kualitas kelas enterprise. Sangat direkomendasikan!",
    rating: 5,
  },
  {
    name: "Citra Halim",
    role: "Marketing Lead, EduStart",
    text: "Landing page-nya modern, cepat, dan konversi meningkat 40%. Kolaborasi yang sangat menyenangkan.",
    rating: 5,
  },
];

function Testimonials() {
  return (
    <section id="testimonial" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Testimonial"
          title={
            <>
              Dipercaya oleh <span className="gradient-text">klien kami</span>
            </>
          }
        />
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <blockquote
              key={t.name}
              style={{ animationDelay: `${i * 100}ms` }}
              className="glass animate-fade-up rounded-3xl p-7 shadow-soft hover-lift"
            >
              <div className="flex gap-1 text-primary">
                {Array.from({ length: t.rating }).map((_, k) => (
                  <Star key={k} className="h-4 w-4 fill-primary" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-navy">"{t.text}"</p>
              <footer className="mt-6 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full gradient-primary-bg font-bold text-white">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-bold text-navy">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------- FAQ ------------------------- */

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["faqs"],
    queryFn: getFaqs,
  });

  return (
    <section id="faq" className="relative bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="FAQ"
          title={
            <>
              Pertanyaan yang sering <span className="gradient-text">ditanyakan</span>
            </>
          }
        />

        {isLoading && (
          <div className="mt-12 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Memuat FAQ...
          </div>
        )}

        {isError && (
          <div className="mt-12 flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-6 w-6 text-destructive" />
            Gagal memuat FAQ. Silakan coba lagi nanti.
          </div>
        )}

        {data && data.length === 0 && (
          <div className="mt-12 flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <Inbox className="h-6 w-6" />
            Belum ada pertanyaan yang tersedia.
          </div>
        )}

        {data && data.length > 0 && (
          <div className="mt-12 space-y-3">
            {data.map((f, i) => {
              const isOpen = open === i;
              return (
                <div
                  key={f.id}
                  className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="font-display text-sm font-bold text-navy sm:text-base">
                      {f.question}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-primary transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`grid overflow-hidden transition-all duration-300 ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="min-h-0">
                      <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
                        {f.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------- CTA ------------------------- */

const initialContactForm: ContactPayload = { name: "", email: "", message: "" };

function Cta({ settings }: { settings?: SiteSettings }) {
  const [form, setForm] = useState<ContactPayload>(initialContactForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const mutation = useMutation({
    mutationFn: sendContactMessage,
    onSuccess: () => {
      toast.success("Pesan berhasil dikirim! Tim kami akan menghubungi Anda segera.");
      setForm(initialContactForm);
      setFieldErrors({});
    },
    onError: (error: unknown) => {
      if (error instanceof ApiClientError && error.errors) {
        setFieldErrors(error.errors);
        toast.error(error.message);
      } else {
        toast.error("Gagal mengirim pesan. Silakan coba lagi.");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <section id="contact" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] gradient-cta-bg p-8 shadow-elegant sm:p-14">
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-cyan/30 blur-3xl animate-blob" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-primary/40 blur-3xl animate-blob" />

          <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="glass-dark inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-white">
                <Sparkles className="h-3.5 w-3.5" /> Ready to build?
              </span>
              <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
                Siap Membangun Aplikasi Impian Anda?
              </h2>
              <p className="mt-4 max-w-lg text-sm text-white/80 sm:text-base">
                Konsultasi gratis dengan tim kami hari ini. Kami bantu petakan kebutuhan dan
                rekomendasikan solusi terbaik untuk bisnis Anda.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={`mailto:${settings?.email ?? "hello@kagoemdigital.com"}`}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-navy shadow-elegant transition-transform hover:scale-[1.03]"
                >
                  Hubungi Kami <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#services"
                  className="glass-dark inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
                >
                  Lihat Layanan
                </a>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="glass-dark rounded-3xl p-6 shadow-elegant">
              <h3 className="font-display text-lg font-bold text-white">Contact Form</h3>
              <p className="mt-1 text-xs text-white/70">
                Isi form, tim kami akan menghubungi Anda dalam 1x24 jam.
              </p>
              <div className="mt-5 space-y-3">
                <div>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Nama lengkap"
                    className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/40"
                  />
                  {fieldErrors.name && (
                    <p className="mt-1 text-xs text-red-300">{fieldErrors.name[0]}</p>
                  )}
                </div>
                <div>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="Email"
                    className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/40"
                  />
                  {fieldErrors.email && (
                    <p className="mt-1 text-xs text-red-300">{fieldErrors.email[0]}</p>
                  )}
                </div>
                <div>
                  <textarea
                    required
                    rows={3}
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    placeholder="Ceritakan project Anda..."
                    className="w-full resize-none rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/40"
                  />
                  {fieldErrors.message && (
                    <p className="mt-1 text-xs text-red-300">{fieldErrors.message[0]}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-navy transition-transform hover:scale-[1.02] disabled:opacity-70"
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Mengirim...
                    </>
                  ) : (
                    <>
                      Kirim Pesan <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export default function Landing() {
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

  return (
    <main className="min-h-screen bg-background">
      <Nav settings={settings} />
      <Hero />
      <About />
      <Services />
      <Technology />
      <WhyUs />
      <Process />
      <Portfolio />
      <Testimonials />
      <Faq />
      <Cta settings={settings} />
      <Footer settings={settings} />
    </main>
  );
}
