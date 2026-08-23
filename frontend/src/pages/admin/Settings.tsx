import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/admin-layout";
import { adminGetSettings, adminUpdateSettings } from "@/services/settings";
import { ApiClientError } from "@/services/api";
import type { SiteSettings } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const FIELD_LABELS: Record<string, string> = {
  site_name: "Nama Website",
  owner_name: "Nama Pemilik",
  email: "Email",
  whatsapp: "WhatsApp",
  linkedin: "LinkedIn",
  github: "GitHub",
  instagram: "Instagram",
};

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: adminGetSettings,
  });
  const [form, setForm] = useState<SiteSettings>({});

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const mutation = useMutation({
    mutationFn: adminUpdateSettings,
    onSuccess: () => {
      toast.success("Setting berhasil disimpan");
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (e: unknown) =>
      toast.error(e instanceof ApiClientError ? e.message : "Gagal menyimpan"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <AdminLayout title="Site Settings">
      <p className="text-sm text-muted-foreground">Kelola informasi dasar website.</p>

      <Card className="mt-6 max-w-xl">
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Memuat...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {Object.keys(FIELD_LABELS).map((key) => (
                <div key={key} className="space-y-1.5">
                  <Label htmlFor={key}>{FIELD_LABELS[key]}</Label>
                  <Input
                    id={key}
                    value={form[key] ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  />
                </div>
              ))}
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Simpan
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
