import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ChevronRight, Loader2, LogOut, Package } from "lucide-react";
import { toast } from "sonner";

import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { useAuth } from "@/hooks/use-auth";
import { getSettings } from "@/services/settings";
import { updatePassword, updateProfile, resendVerification } from "@/services/auth";
import { ApiClientError } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ProfileForm() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setIsSubmitting(true);
    try {
      const updated = await updateProfile(name, email);
      setUser(updated);
      toast.success("Profil berhasil diperbarui.");
    } catch (err) {
      if (err instanceof ApiClientError) {
        setFieldErrors(err.errors ?? {});
        toast.error(err.message);
      } else {
        toast.error("Gagal memperbarui profil.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nama</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        {fieldErrors.name && <p className="text-xs text-destructive">{fieldErrors.name[0]}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email[0]}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan Perubahan"}
      </Button>
    </form>
  );
}

function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setIsSubmitting(true);
    try {
      await updatePassword(currentPassword, password, passwordConfirmation);
      toast.success("Password berhasil diperbarui.");
      setCurrentPassword("");
      setPassword("");
      setPasswordConfirmation("");
    } catch (err) {
      if (err instanceof ApiClientError) {
        setFieldErrors(err.errors ?? {});
        toast.error(err.message);
      } else {
        toast.error("Gagal memperbarui password.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="current_password">Password Saat Ini</Label>
        <Input
          id="current_password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        {fieldErrors.current_password && (
          <p className="text-xs text-destructive">{fieldErrors.current_password[0]}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="new_password">Password Baru</Label>
        <Input
          id="new_password"
          type="password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {fieldErrors.password && (
          <p className="text-xs text-destructive">{fieldErrors.password[0]}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="new_password_confirmation">Konfirmasi Password Baru</Label>
        <Input
          id="new_password_confirmation"
          type="password"
          minLength={8}
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ubah Password"}
      </Button>
    </form>
  );
}

export default function Account() {
  const { user, logout, refresh } = useAuth();
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendVerification();
      toast.success("Email verifikasi telah dikirim ulang. Silakan cek inbox Anda.");
    } catch {
      toast.error("Gagal mengirim ulang email verifikasi.");
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Anda telah logout.");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-surface">
      <Nav settings={settings} />

      <main className="mx-auto max-w-2xl px-4 pt-32 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-navy">Akun Saya</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Kelola informasi akun Kagoem Digital Anda.
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>

        {!user.email_verified_at && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
              <span>Email Anda belum diverifikasi.</span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isResending}
                onClick={handleResend}
              >
                {isResending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Kirim Ulang Email"}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <Link
            to="/orders"
            className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-soft transition-shadow hover:shadow-elegant"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-navy">Pesanan Saya</p>
                <p className="text-sm text-muted-foreground">Lihat riwayat dan status pesanan</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>

          <Card>
            <CardHeader>
              <CardTitle>Informasi Profil</CardTitle>
              <CardDescription>Perbarui nama dan email akun Anda.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ubah Password</CardTitle>
              <CardDescription>
                Gunakan password yang kuat dan tidak digunakan di tempat lain.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PasswordForm />
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
