import { Link } from "react-router-dom";
import type { ReactNode } from "react";

import { LogoMark } from "@/components/logo-mark";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-4 py-12">
      <div className="pointer-events-none absolute inset-0 gradient-hero-bg" aria-hidden />
      <div
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/25 blur-3xl animate-blob"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 -right-24 h-80 w-80 rounded-full bg-cyan/25 blur-3xl animate-blob"
        aria-hidden
      />

      <div className="glass relative w-full max-w-sm animate-fade-up rounded-3xl p-8 shadow-elegant">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-navy">
          <span className="grid h-9 w-9 place-items-center rounded-xl gradient-primary-bg text-white shadow-elegant">
            <LogoMark className="h-5 w-5" />
          </span>
          Kagoem Digital
        </Link>

        <h1 className="mt-6 font-display text-xl font-bold text-navy">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}

        <div className="mt-6">{children}</div>

        {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </div>
  );
}
