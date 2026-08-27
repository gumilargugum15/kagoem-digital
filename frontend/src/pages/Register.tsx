import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import { ApiClientError } from "@/services/api";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsSubmitting(true);
    try {
      await register(name, email, password, passwordConfirmation);
      toast.success("Registrasi berhasil! Selamat datang di Kagoem Digital.");
      navigate("/account");
    } catch (err) {
      if (err instanceof ApiClientError && err.errors) {
        setFieldErrors(err.errors);
      }
      setError(
        err instanceof ApiClientError ? err.message : "Registrasi gagal. Silakan coba lagi.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Buat Akun"
      subtitle="Satu akun untuk semua produk Kagoem Digital."
      footer={
        <>
          Sudah punya akun?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Login
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nama</Label>
          <Input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama lengkap"
          />
          {fieldErrors.name && <p className="text-xs text-destructive">{fieldErrors.name[0]}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
          />
          {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email[0]}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 8 karakter"
          />
          {fieldErrors.password && (
            <p className="text-xs text-destructive">{fieldErrors.password[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
          <Input
            id="password_confirmation"
            type="password"
            required
            minLength={8}
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            placeholder="Ulangi password"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Memproses...
            </>
          ) : (
            "Daftar Sekarang"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
