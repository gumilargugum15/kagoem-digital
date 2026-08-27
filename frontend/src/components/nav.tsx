import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Menu, User, X } from "lucide-react";

import { LogoMark } from "@/components/logo-mark";
import { CartIcon } from "@/components/cart-icon";
import { CartDrawer } from "@/components/cart-drawer";
import { getCart } from "@/services/cart";
import { useAuth } from "@/hooks/use-auth";
import type { SiteSettings } from "@/types/api";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Products", to: "/products" },
  { label: "Tech Notes", to: "/tech-notes" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
] as const;

export function Nav({ settings }: { settings?: SiteSettings }) {
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  const { data: cart } = useQuery({ queryKey: ["cart"], queryFn: getCart });
  const cartCount = cart?.items_count ?? 0;
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkClass =
    "rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-navy";
  const mobileLinkClass = "rounded-xl px-4 py-3 text-sm font-medium text-navy hover:bg-muted";

  const renderLink = (
    link: (typeof NAV_LINKS)[number],
    className: string,
    onClick?: () => void,
  ) => {
    if ("to" in link) {
      return (
        <Link key={link.label} to={link.to} onClick={onClick} className={className}>
          {link.label}
        </Link>
      );
    }
    const href = isHome ? link.href : `/${link.href}`;
    return (
      <a key={link.label} href={href} onClick={onClick} className={className}>
        {link.label}
      </a>
    );
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`glass flex items-center justify-between rounded-2xl px-4 py-3 shadow-soft transition-all ${
            scrolled ? "shadow-elegant" : ""
          }`}
        >
          <Link
            to={isHome ? "#home" : "/"}
            className="flex items-center gap-2 font-display font-bold text-navy"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl gradient-primary-bg text-white shadow-elegant">
              <LogoMark className="h-5 w-5" />
            </span>
            <span className="text-lg tracking-tight">
              {settings?.site_name ?? "Kagoem Digital"}
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => renderLink(link, linkClass))}
          </nav>

          <div className="hidden md:block">
            <a
              href={isHome ? "#contact" : "/#contact"}
              className="group inline-flex items-center gap-2 rounded-full gradient-primary-bg px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.03]"
            >
              Konsultasi Gratis
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>

          <div className="flex items-center gap-1">
            <Link
              to={user ? "/account" : "/login"}
              aria-label={user ? "Akun Saya" : "Masuk"}
              className="grid h-10 w-10 place-items-center rounded-xl text-navy transition-transform hover:scale-105"
            >
              <User className="h-5 w-5" />
            </Link>

            <CartIcon count={cartCount} onClick={() => setCartOpen(true)} />

            <button
              aria-label="Toggle menu"
              className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-navy md:hidden"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="glass mt-2 animate-fade-up rounded-2xl p-3 shadow-elegant md:hidden">
            <div className="flex flex-col">
              {NAV_LINKS.map((link) => renderLink(link, mobileLinkClass, () => setOpen(false)))}
              <Link
                to={user ? "/account" : "/login"}
                onClick={() => setOpen(false)}
                className={mobileLinkClass}
              >
                {user ? "Akun Saya" : "Masuk"}
              </Link>
              <a
                href={isHome ? "#contact" : "/#contact"}
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl gradient-primary-bg px-5 py-3 text-sm font-semibold text-primary-foreground"
              >
                Konsultasi Gratis <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        )}
      </div>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </header>
  );
}
