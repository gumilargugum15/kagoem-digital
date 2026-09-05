import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/admin-layout";
import {
  adminGetApplications,
  adminCreateApplication,
  adminUpdateApplication,
} from "@/services/applications";
import type { Application, ApplicationStatus } from "@/types/api";
import { ApiClientError } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ApplicationFormState {
  name: string;
  code: string;
  base_url: string;
  status: ApplicationStatus;
}

const emptyForm: ApplicationFormState = {
  name: "",
  code: "",
  base_url: "",
  status: "active",
};

function toFormState(app: Application): ApplicationFormState {
  return {
    name: app.name,
    code: app.code,
    base_url: app.base_url ?? "",
    status: app.status,
  };
}

export default function AdminApplications() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "applications"],
    queryFn: adminGetApplications,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Application | null>(null);
  const [form, setForm] = useState<ApplicationFormState>(emptyForm);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "applications"] });

  const createMutation = useMutation({
    mutationFn: adminCreateApplication,
    onSuccess: () => {
      toast.success("Application berhasil ditambahkan");
      invalidate();
      setDialogOpen(false);
    },
    onError: (e: unknown) =>
      toast.error(e instanceof ApiClientError ? e.message : "Gagal menyimpan"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<Application> }) =>
      adminUpdateApplication(id, payload),
    onSuccess: () => {
      toast.success("Application berhasil diperbarui");
      invalidate();
      setDialogOpen(false);
    },
    onError: (e: unknown) =>
      toast.error(e instanceof ApiClientError ? e.message : "Gagal menyimpan"),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (app: Application) => {
    setEditing(app);
    setForm(toFormState(app));
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, base_url: form.base_url || null };
    if (editing) {
      updateMutation.mutate({ id: editing.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout title="Applications">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Kelola aplikasi eksternal (POS, Inventory, ...) yang bisa dihubungkan ke produk
          subscription. Link di sini adalah yang dibuka lewat tombol "Buka Aplikasi" pelanggan.
        </p>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Tambah Application
        </Button>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Memuat...
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Base URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium text-navy">{app.name}</TableCell>
                  <TableCell className="text-muted-foreground">{app.code}</TableCell>
                  <TableCell className="max-w-md text-muted-foreground">
                    <span className="line-clamp-1">{app.base_url || "-"}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={app.status === "active" ? "default" : "secondary"}>
                      {app.status === "active" ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(app)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {data?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Belum ada application.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Application" : "Tambah Application"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nama</Label>
              <Input
                id="name"
                required
                placeholder="POS"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                required
                placeholder="pos"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Harus cocok dengan key adapter provisioning di backend (config/application_provisioning.php).
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="base_url">Base URL</Label>
              <Input
                id="base_url"
                type="url"
                placeholder="https://pos.kagoemdigital.com"
                value={form.base_url}
                onChange={(e) => setForm((f) => ({ ...f, base_url: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Link inilah yang dibuka tombol "Buka Aplikasi" di halaman Produk Saya pelanggan.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v: ApplicationStatus) => setForm((f) => ({ ...f, status: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
