import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, type ReactNode } from "react";
import {
  LayoutDashboard,
  Briefcase,
  Image as ImageIcon,
  HelpCircle,
  Mail,
  Settings,
  LogOut,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/logo-mark";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/services", label: "Services", icon: Briefcase, end: false },
  { to: "/admin/portfolio", label: "Portfolio", icon: ImageIcon, end: false },
  { to: "/admin/faq", label: "FAQ", icon: HelpCircle, end: false },
  { to: "/admin/messages", label: "Messages", icon: Mail, end: false },
  { to: "/admin/settings", label: "Settings", icon: Settings, end: false },
] as const;

export function AdminLayout({ children, title }: { children: ReactNode; title: string }) {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/admin/login");
    }
  }, [isLoading, user, navigate]);

  if (isLoading || !user) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-surface">
        <div className="pointer-events-none absolute inset-0 gradient-hero-bg" aria-hidden />
        <Loader2 className="relative h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-surface">
      <div className="pointer-events-none fixed inset-0 gradient-hero-bg" aria-hidden />

      <div className="relative flex min-h-screen">
        <aside className="glass hidden w-64 flex-col px-4 py-6 shadow-elegant sm:flex">
          <Link
            to="/"
            className="mb-8 flex items-center gap-2 px-2 font-display font-bold text-navy"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl gradient-primary-bg text-white shadow-elegant">
              <LogoMark className="h-4 w-4" />
            </span>
            Kagoem Admin
          </Link>
          <nav className="flex flex-1 flex-col gap-1.5">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-white/60 hover:text-navy",
                    isActive && "gradient-primary-bg text-primary-foreground shadow-elegant",
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-white/60 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </aside>

        <div className="flex-1">
          <header className="glass sticky top-0 z-10 flex items-center justify-between px-6 py-4 shadow-soft">
            <h1 className="font-display text-lg font-bold text-navy">{title}</h1>
            <span className="glass rounded-full px-4 py-1.5 text-sm font-medium text-navy shadow-soft">
              {user.name}
            </span>
          </header>
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
