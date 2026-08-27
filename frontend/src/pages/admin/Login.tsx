import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { ApiClientError } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoMark } from "@/components/logo-mark";

export default function AdminLogin() {
  const { user, isLoading, login, logout } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && user?.role === "admin") {
      navigate("/admin");
    }
  }, [isLoading, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.role !== "admin") {
        await logout();
        setError("Akun ini tidak memiliki akses admin.");
        return;
      }
      toast.success("Login berhasil");
      navigate("/admin");
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Login gagal";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || user?.role === "admin") {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-surface">
        <div className="pointer-events-none absolute inset-0 gradient-hero-bg" aria-hidden />
        <Loader2 className="relative h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-4">
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
        <div className="flex items-center gap-2 font-display font-bold text-navy">
          <span className="grid h-9 w-9 place-items-center rounded-xl gradient-primary-bg text-white shadow-elegant">
            <LogoMark className="h-5 w-5" />
          </span>
          Kagoem Admin
        </div>
        <p className="mt-2 text-sm text-muted-foreground">Masuk untuk mengelola konten website.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@kagoemdigital.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Masuk...
              </>
            ) : (
              "Masuk"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
