import { Link, useSearchParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";

const COPY: Record<string, { title: string; message: string; success: boolean }> = {
  verified: {
    title: "Email Terverifikasi",
    message: "Email Anda berhasil diverifikasi. Sekarang Anda dapat login sepenuhnya.",
    success: true,
  },
  "already-verified": {
    title: "Sudah Terverifikasi",
    message: "Email Anda sudah terverifikasi sebelumnya.",
    success: true,
  },
  invalid: {
    title: "Link Tidak Valid",
    message:
      "Link verifikasi tidak valid atau sudah kadaluarsa. Silakan minta link verifikasi baru.",
    success: false,
  },
};

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status") ?? "invalid";
  const copy = COPY[status] ?? COPY.invalid;

  return (
    <AuthLayout title={copy.title}>
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        {copy.success ? (
          <CheckCircle2 className="h-12 w-12 text-primary" />
        ) : (
          <AlertTriangle className="h-12 w-12 text-destructive" />
        )}
        <p className="text-sm text-muted-foreground">{copy.message}</p>
        <Button asChild className="w-full">
          <Link to="/account">Ke Akun Saya</Link>
        </Button>
      </div>
    </AuthLayout>
  );
}
