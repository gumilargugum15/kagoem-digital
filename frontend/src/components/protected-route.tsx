import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
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

  return <>{children}</>;
}
