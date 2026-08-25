import { useLocation } from "react-router-dom";
import { Instagram, Linkedin, Github, Mail, MessageCircle } from "lucide-react";

import { LogoMark } from "@/components/logo-mark";
import type { SiteSettings } from "@/types/api";

const MENU_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Tech Notes", href: "/tech-notes", isRoute: true },
  { label: "Contact", href: "#contact" },
] as const;

function socialHandle(url?: string): string {
  if (!url) return "";
  const segments = url.replace(/\/+$/, "").split("/");
  return segments[segments.length - 1] ?? "";
}

function waHref(phone?: string): string {
  if (!phone) return "#";
  return `https://wa.me/${phone.replace(/[^0-9]/g, "")}`;
}

export function Footer({ settings }: { settings?: SiteSettings }) {
  const location = useLocation();
  const isHome = location.pathname === "/";

  const socialLinks = [
    settings?.instagram && { icon: Instagram, href: settings.instagram, label: "Instagram" },
    settings?.linkedin && { icon: Linkedin, href: settings.linkedin, label: "LinkedIn" },
    settings?.github && { icon: Github, href: settings.github, label: "GitHub" },
    settings?.whatsapp && {
      icon: MessageCircle,
      href: waHref(settings.whatsapp),
      label: "WhatsApp",
    },
    settings?.email && { icon: Mail, href: `mailto:${settings.email}`, label: "Email" },
  ].filter((s): s is { icon: typeof Instagram; href: string; label: string } => Boolean(s));

  return (
    <footer className="relative bg-navy text-white/80">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 font-display font-bold text-white">
              <span className="grid h-9 w-9 place-items-center rounded-xl gradient-primary-bg text-white shadow-elegant">
                <LogoMark className="h-5 w-5" />
              </span>
              <span className="text-lg tracking-tight">
                {settings?.site_name ?? "Kagoem Digital"}
              </span>
            </div>
            <p className="mt-4 max-w-md text-sm text-white/70">
              Software house dan digital agency yang membantu bisnis membangun website, aplikasi
              web, dan mobile dengan teknologi modern.
            </p>
            <div className="mt-6 flex gap-3">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-white transition-all hover:bg-white/10 hover:scale-110"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="font-display text-sm font-bold text-white">Menu</div>
            <ul className="mt-4 space-y-2 text-sm">
              {MENU_LINKS.map((link) => {
                const href =
                  "isRoute" in link && link.isRoute
                    ? link.href
                    : isHome
                      ? link.href
                      : `/${link.href}`;
                return (
                  <li key={link.href}>
                    <a href={href} className="text-white/70 transition-colors hover:text-cyan">
                      {link.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <div className="font-display text-sm font-bold text-white">Kontak</div>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              {settings?.email && (
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-cyan" /> {settings.email}
                </li>
              )}
              {settings?.whatsapp && (
                <li className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-cyan" /> {settings.whatsapp}
                </li>
              )}
              {settings?.instagram && (
                <li className="flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-cyan" /> @{socialHandle(settings.instagram)}
                </li>
              )}
              {settings?.linkedin && (
                <li className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4 text-cyan" /> {socialHandle(settings.linkedin)}
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row">
          <div>
            © {new Date().getFullYear()} {settings?.site_name ?? "Kagoem Digital"}. All rights
            reserved.
          </div>
          <div>
            {settings?.owner_name
              ? `Dikelola oleh ${settings.owner_name}`
              : "Made with care for modern businesses."}
          </div>
        </div>
      </div>
    </footer>
  );
}
