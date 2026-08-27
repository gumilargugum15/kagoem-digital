import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { resetPassword } from "@/services/auth";
import { ApiClientError } from "@/services/api";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await resetPassword(token, email, password, passwordConfirmation);
      toast.success("Password berhasil direset. Silakan login.");
      navigate("/login");
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : "Gagal mereset password. Silakan coba lagi.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token || !email) {
    return (
      <AuthLayout
        title="Link Tidak Valid"
        subtitle="Link reset password tidak lengkap atau kadaluarsa."
      >
        <Link to="/forgot-password">
          <Button className="w-full">Minta Link Baru</Button>
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset Password" subtitle={`Buat password baru untuk ${email}.`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">Password Baru</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 8 karakter"
          />
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
            placeholder="Ulangi password baru"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
