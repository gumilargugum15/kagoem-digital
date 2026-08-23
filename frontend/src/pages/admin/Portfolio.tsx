import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/admin-layout";
import {
  adminGetPortfolios,
  adminCreatePortfolio,
  adminUpdatePortfolio,
  adminDeletePortfolio,
} from "@/services/portfolios";
import type { Portfolio } from "@/types/api";
import { ApiClientError, getStorageUrl } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface PortfolioFormState {
  title: string;
  category: string;
  client_name: string;
  short_description: string;
  description: string;
  technologies: string;
  project_url: string;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
}

const emptyForm: PortfolioFormState = {
  title: "",
  category: "",
  client_name: "",
  short_description: "",
  description: "",
  technologies: "",
  project_url: "",
  is_featured: false,
  is_active: true,
  sort_order: 0,
};

function toFormState(p: Portfolio): PortfolioFormState {
  return {
    title: p.title,
    category: p.category,
    client_name: p.client_name ?? "",
    short_description: p.short_description,
    description: p.description ?? "",
    technologies: p.technologies?.join(", ") ?? "",
    project_url: p.project_url ?? "",
    is_featured: p.is_featured,
    is_active: p.is_active,
    sort_order: p.sort_order,
  };
}

function buildFormData(form: PortfolioFormState, file: File | null): FormData {
  const fd = new FormData();
  fd.append("title", form.title);
  fd.append("category", form.category);
  fd.append("client_name", form.client_name);
  fd.append("short_description", form.short_description);
  fd.append("description", form.description);
  fd.append("project_url", form.project_url);
  fd.append("is_featured", form.is_featured ? "1" : "0");
  fd.append("is_active", form.is_active ? "1" : "0");
  fd.append("sort_order", String(form.sort_order));
  form.technologies
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .forEach((t) => fd.append("technologies[]", t));
  if (file) fd.append("image", file);
  return fd;
}

export default function AdminPortfolio() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "portfolios"],
    queryFn: adminGetPortfolios,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Portfolio | null>(null);
  const [form, setForm] = useState<PortfolioFormState>(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Portfolio | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "portfolios"] });

  const createMutation = useMutation({
    mutationFn: adminCreatePortfolio,
    onSuccess: () => {
      toast.success("Portfolio berhasil ditambahkan");
      invalidate();
      setDialogOpen(false);
    },
    onError: (e: unknown) =>
      toast.error(e instanceof ApiClientError ? e.message : "Gagal menyimpan"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: FormData }) =>
      adminUpdatePortfolio(id, payload),
    onSuccess: () => {
      toast.success("Portfolio berhasil diperbarui");
      invalidate();
      setDialogOpen(false);
    },
    onError: (e: unknown) =>
      toast.error(e instanceof ApiClientError ? e.message : "Gagal menyimpan"),
  });

  const deleteMutation = useMutation({
    mutationFn: adminDeletePortfolio,
    onSuccess: () => {
      toast.success("Portfolio berhasil dihapus");
      invalidate();
      setDeleteTarget(null);
    },
    onError: (e: unknown) =>
      toast.error(e instanceof ApiClientError ? e.message : "Gagal menghapus"),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFile(null);
    setDialogOpen(true);
  };

  const openEdit = (portfolio: Portfolio) => {
    setEditing(portfolio);
    setForm(toFormState(portfolio));
    setFile(null);
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = buildFormData(form, file);
    if (editing) {
      updateMutation.mutate({ id: editing.id, payload: fd });
    } else {
      createMutation.mutate(fd);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout title="Portfolio">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Kelola portfolio project yang ditampilkan.</p>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Tambah Portfolio
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
                <TableHead>Gambar</TableHead>
                <TableHead>Judul</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((portfolio) => {
                const imageUrl = getStorageUrl(portfolio.image);
                return (
                  <TableRow key={portfolio.id}>
                    <TableCell>
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={portfolio.title}
                          className="h-10 w-14 rounded object-cover"
                        />
                      ) : (
                        <div className="grid h-10 w-14 place-items-center rounded bg-muted">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-navy">
                      {portfolio.title}
                      {portfolio.client_name && (
                        <div className="text-xs font-normal text-muted-foreground">
                          Klien: {portfolio.client_name}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{portfolio.category}</TableCell>
                    <TableCell>{portfolio.is_featured && <Badge>Featured</Badge>}</TableCell>
                    <TableCell>
                      <Badge variant={portfolio.is_active ? "default" : "secondary"}>
                        {portfolio.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(portfolio)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(portfolio)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {data?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Belum ada portfolio.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Portfolio" : "Tambah Portfolio"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Judul</Label>
              <Input
                id="title"
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Kategori</Label>
              <Input
                id="category"
                required
                placeholder="Website, Mobile App, ERP, POS, Dashboard..."
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="client_name">Nama Klien (opsional)</Label>
              <Input
                id="client_name"
                placeholder="Nama perusahaan/klien"
                value={form.client_name}
                onChange={(e) => setForm((f) => ({ ...f, client_name: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Digunakan untuk menghitung jumlah klien pada statistik di halaman utama.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="short_description">Deskripsi Singkat</Label>
              <Textarea
                id="short_description"
                required
                rows={2}
                value={form.short_description}
                onChange={(e) => setForm((f) => ({ ...f, short_description: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Deskripsi Lengkap (opsional)</Label>
              <Textarea
                id="description"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="technologies">Teknologi (pisahkan dengan koma)</Label>
              <Input
                id="technologies"
                placeholder="Laravel, MySQL, Vue.js"
                value={form.technologies}
                onChange={(e) => setForm((f) => ({ ...f, technologies: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="project_url">Project URL (opsional)</Label>
              <Input
                id="project_url"
                type="url"
                placeholder="https://..."
                value={form.project_url}
                onChange={(e) => setForm((f) => ({ ...f, project_url: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="image">Gambar</Label>
              {editing?.image && !file && (
                <img
                  src={getStorageUrl(editing.image) ?? undefined}
                  alt=""
                  className="mb-2 h-24 w-36 rounded object-cover"
                />
              )}
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sort_order">Urutan</Label>
              <Input
                id="sort_order"
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.is_featured}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, is_featured: checked }))}
              />
              <Label>Featured</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.is_active}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, is_active: checked }))}
              />
              <Label>Aktif</Label>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Portfolio</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus "{deleteTarget?.title}"? Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
