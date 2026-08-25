import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/admin-layout";
import {
  adminGetTechNotes,
  adminCreateTechNote,
  adminUpdateTechNote,
  adminDeleteTechNote,
} from "@/services/tech-notes";
import type { TechNote } from "@/types/api";
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

interface TechNoteFormState {
  title: string;
  category: string;
  excerpt: string;
  content: string;
  tags: string;
  author_name: string;
  published_at: string;
  is_active: boolean;
}

const emptyForm: TechNoteFormState = {
  title: "",
  category: "",
  excerpt: "",
  content: "",
  tags: "",
  author_name: "Kagoem Digital Team",
  published_at: "",
  is_active: true,
};

function toFormState(n: TechNote): TechNoteFormState {
  return {
    title: n.title,
    category: n.category,
    excerpt: n.excerpt,
    content: n.content,
    tags: n.tags?.join(", ") ?? "",
    author_name: n.author_name,
    published_at: n.published_at ? n.published_at.slice(0, 10) : "",
    is_active: n.is_active,
  };
}

function buildFormData(form: TechNoteFormState, file: File | null): FormData {
  const fd = new FormData();
  fd.append("title", form.title);
  fd.append("category", form.category);
  fd.append("excerpt", form.excerpt);
  fd.append("content", form.content);
  fd.append("author_name", form.author_name);
  fd.append("is_active", form.is_active ? "1" : "0");
  if (form.published_at) fd.append("published_at", form.published_at);
  form.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .forEach((t) => fd.append("tags[]", t));
  if (file) fd.append("thumbnail", file);
  return fd;
}

export default function AdminTechNotes() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "tech-notes"],
    queryFn: adminGetTechNotes,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TechNote | null>(null);
  const [form, setForm] = useState<TechNoteFormState>(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TechNote | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "tech-notes"] });

  const createMutation = useMutation({
    mutationFn: adminCreateTechNote,
    onSuccess: () => {
      toast.success("Artikel berhasil ditambahkan");
      invalidate();
      setDialogOpen(false);
    },
    onError: (e: unknown) =>
      toast.error(e instanceof ApiClientError ? e.message : "Gagal menyimpan"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: FormData }) =>
      adminUpdateTechNote(id, payload),
    onSuccess: () => {
      toast.success("Artikel berhasil diperbarui");
      invalidate();
      setDialogOpen(false);
    },
    onError: (e: unknown) =>
      toast.error(e instanceof ApiClientError ? e.message : "Gagal menyimpan"),
  });

  const deleteMutation = useMutation({
    mutationFn: adminDeleteTechNote,
    onSuccess: () => {
      toast.success("Artikel berhasil dihapus");
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

  const openEdit = (note: TechNote) => {
    setEditing(note);
    setForm(toFormState(note));
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
    <AdminLayout title="Tech Notes">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Kelola artikel Tech Notes.</p>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Tambah Artikel
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
                <TableHead>Thumbnail</TableHead>
                <TableHead>Judul</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((note) => {
                const imageUrl = getStorageUrl(note.thumbnail);
                return (
                  <TableRow key={note.id}>
                    <TableCell>
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={note.title}
                          className="h-10 w-14 rounded object-cover"
                        />
                      ) : (
                        <div className="grid h-10 w-14 place-items-center rounded bg-muted">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-navy">
                      {note.title}
                      <div className="text-xs font-normal text-muted-foreground">
                        {note.author_name} &middot; {note.reading_time} min read
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{note.category}</TableCell>
                    <TableCell>
                      <Badge variant={note.is_active ? "default" : "secondary"}>
                        {note.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(note)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(note)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {data?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Belum ada artikel.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Artikel" : "Tambah Artikel"}</DialogTitle>
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
                placeholder="Laravel, PHP, React, DevOps..."
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                required
                rows={2}
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="content">Konten (Markdown)</Label>
              <Textarea
                id="content"
                required
                rows={14}
                className="font-mono text-sm"
                placeholder={"## Introduction\n\nIsi artikel...\n\n```php\ncode here\n```"}
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Mendukung Markdown, termasuk code block dengan sintaks ```bahasa.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tags">Tags (pisahkan dengan koma)</Label>
              <Input
                id="tags"
                placeholder="Laravel, API, Sanctum"
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="author_name">Author</Label>
              <Input
                id="author_name"
                value={form.author_name}
                onChange={(e) => setForm((f) => ({ ...f, author_name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="published_at">Tanggal Publish</Label>
              <Input
                id="published_at"
                type="date"
                value={form.published_at}
                onChange={(e) => setForm((f) => ({ ...f, published_at: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="thumbnail">Thumbnail</Label>
              {editing?.thumbnail && !file && (
                <img
                  src={getStorageUrl(editing.thumbnail) ?? undefined}
                  alt=""
                  className="mb-2 h-24 w-36 rounded object-cover"
                />
              )}
              <Input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
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
            <AlertDialogTitle>Hapus Artikel</AlertDialogTitle>
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
