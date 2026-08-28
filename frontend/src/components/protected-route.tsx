import { useEffect, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login", { state: { from: location } });
    }
  }, [isLoading, user, navigate, location]);

  if (isLoading || !user) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-surface">
        <div className="pointer-events-none absolute inset-0 gradient-hero-bg" aria-hidden />
        <Loader2 className="relative h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
