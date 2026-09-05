import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon, ListPlus, Sliders } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/admin-layout";
import {
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
} from "@/services/products";
import { adminGetApplications } from "@/services/applications";
import type { Product, ProductType, ProductStatus, ProductBadge } from "@/types/api";
import { ApiClientError, getStorageUrl } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface ProductFormState {
  name: string;
  category: string;
  type: ProductType;
  short_description: string;
  description: string;
  tags: string;
  badge: ProductBadge | "none";
  price: string;
  discount_price: string;
  currency: string;
  demo_url: string;
  download_url: string;
  whats_included: string;
  requirements: string;
  technology: string;
  meta_title: string;
  meta_description: string;
  status: ProductStatus;
  sort_order: string;
  published_at: string;
  application_id: string;
}

interface FeatureRow {
  name: string;
  description: string;
}

interface FaqRow {
  question: string;
  answer: string;
}

const emptyForm: ProductFormState = {
  name: "",
  category: "",
  type: "digital",
  short_description: "",
  description: "",
  tags: "",
  badge: "none",
  price: "",
  discount_price: "",
  currency: "IDR",
  demo_url: "",
  download_url: "",
  whats_included: "",
  requirements: "",
  technology: "",
  meta_title: "",
  meta_description: "",
  status: "draft",
  sort_order: "0",
  published_at: "",
  application_id: "none",
};

function toFormState(p: Product): ProductFormState {
  return {
    name: p.name,
    category: p.category,
    type: p.type,
    short_description: p.short_description,
    description: p.description ?? "",
    tags: p.tags?.join(", ") ?? "",
    badge: p.badge ?? "none",
    price: p.price ?? "",
    discount_price: p.discount_price ?? "",
    currency: p.currency,
    demo_url: p.demo_url ?? "",
    download_url: p.download_url ?? "",
    whats_included: p.whats_included?.join("\n") ?? "",
    requirements: p.requirements?.join("\n") ?? "",
    technology: p.technology?.join("\n") ?? "",
    meta_title: p.meta_title ?? "",
    meta_description: p.meta_description ?? "",
    status: p.status,
    sort_order: String(p.sort_order),
    published_at: p.published_at ? p.published_at.slice(0, 10) : "",
    application_id: p.application_id ? String(p.application_id) : "none",
  };
}

function linesToArray(value: string): string[] {
  return value
    .split("\n")
    .map((v) => v.trim())
    .filter(Boolean);
}

function buildFormData(
  form: ProductFormState,
  features: FeatureRow[],
  faqs: FaqRow[],
  files: {
    thumbnail: File | null;
    gallery: File[];
    digitalFile: File | null;
    ogImage: File | null;
  },
): FormData {
  const fd = new FormData();
  fd.append("name", form.name);
  fd.append("category", form.category);
  fd.append("type", form.type);
  fd.append("short_description", form.short_description);
  if (form.description) fd.append("description", form.description);
  if (form.price) fd.append("price", form.price);
  if (form.discount_price) fd.append("discount_price", form.discount_price);
  fd.append("currency", form.currency || "IDR");
  if (form.demo_url) fd.append("demo_url", form.demo_url);
  if (form.download_url) fd.append("download_url", form.download_url);
  if (form.badge !== "none") fd.append("badge", form.badge);
  if (form.meta_title) fd.append("meta_title", form.meta_title);
  if (form.meta_description) fd.append("meta_description", form.meta_description);
  fd.append("sort_order", form.sort_order || "0");
  fd.append("status", form.status);
  if (form.published_at) fd.append("published_at", form.published_at);
  if (form.application_id !== "none") fd.append("application_id", form.application_id);

  form.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .forEach((t) => fd.append("tags[]", t));

  linesToArray(form.whats_included).forEach((v) => fd.append("whats_included[]", v));
  linesToArray(form.requirements).forEach((v) => fd.append("requirements[]", v));
  linesToArray(form.technology).forEach((v) => fd.append("technology[]", v));

  features
    .filter((f) => f.name.trim())
    .forEach((f, i) => {
      fd.append(`features[${i}][name]`, f.name);
      if (f.description) fd.append(`features[${i}][description]`, f.description);
    });

  faqs
    .filter((f) => f.question.trim() && f.answer.trim())
    .forEach((f, i) => {
      fd.append(`faqs[${i}][question]`, f.question);
      fd.append(`faqs[${i}][answer]`, f.answer);
    });

  if (files.thumbnail) fd.append("thumbnail", files.thumbnail);
  if (files.ogImage) fd.append("og_image", files.ogImage);
  if (files.digitalFile) fd.append("digital_file", files.digitalFile);
  files.gallery.forEach((file) => fd.append("gallery[]", file));

  return fd;
}

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: adminGetProducts,
  });
  const { data: applications } = useQuery({
    queryKey: ["admin", "applications"],
    queryFn: adminGetApplications,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [features, setFeatures] = useState<FeatureRow[]>([]);
  const [faqs, setFaqs] = useState<FaqRow[]>([]);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [ogImage, setOgImage] = useState<File | null>(null);
  const [digitalFile, setDigitalFile] = useState<File | null>(null);
  const [gallery, setGallery] = useState<File[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "products"] });

  const createMutation = useMutation({
    mutationFn: adminCreateProduct,
    onSuccess: () => {
      toast.success("Produk berhasil ditambahkan");
      invalidate();
      setDialogOpen(false);
    },
    onError: (e: unknown) =>
      toast.error(e instanceof ApiClientError ? e.message : "Gagal menyimpan"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: FormData }) =>
      adminUpdateProduct(id, payload),
    onSuccess: () => {
      toast.success("Produk berhasil diperbarui");
      invalidate();
      setDialogOpen(false);
    },
    onError: (e: unknown) =>
      toast.error(e instanceof ApiClientError ? e.message : "Gagal menyimpan"),
  });

  const deleteMutation = useMutation({
    mutationFn: adminDeleteProduct,
    onSuccess: () => {
      toast.success("Produk berhasil dihapus");
      invalidate();
      setDeleteTarget(null);
    },
    onError: (e: unknown) =>
      toast.error(e instanceof ApiClientError ? e.message : "Gagal menghapus"),
  });

  const resetFiles = () => {
    setThumbnail(null);
    setOgImage(null);
    setDigitalFile(null);
    setGallery([]);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFeatures([]);
    setFaqs([]);
    resetFiles();
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm(toFormState(product));
    setFeatures(
      product.features?.map((f) => ({ name: f.name, description: f.description ?? "" })) ?? [],
    );
    setFaqs(product.faqs?.map((f) => ({ question: f.question, answer: f.answer })) ?? []);
    resetFiles();
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = buildFormData(form, features, faqs, {
      thumbnail,
      gallery,
      digitalFile,
      ogImage,
    });
    if (editing) {
      updateMutation.mutate({ id: editing.id, payload: fd });
    } else {
      createMutation.mutate(fd);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isDigital = form.type === "digital";
  const isSubscription = form.type === "subscription";

  return (
    <AdminLayout title="Products">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Kelola produk digital dan subscription.</p>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Tambah Produk
        </Button>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Memuat...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thumbnail</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.map((product) => {
                  const imageUrl = getStorageUrl(product.thumbnail);
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="h-10 w-14 rounded object-cover"
                          />
                        ) : (
                          <div className="grid h-10 w-14 place-items-center rounded bg-muted">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-navy">{product.name}</TableCell>
                      <TableCell className="text-muted-foreground capitalize">
                        {product.type}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{product.category}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {product.type === "subscription"
                          ? `${product.plans_count ?? 0} plan`
                          : product.price
                            ? `Rp ${Number(product.discount_price ?? product.price).toLocaleString("id-ID")}`
                            : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            product.status === "published"
                              ? "default"
                              : product.status === "archived"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {product.type === "subscription" && (
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/admin/products/${product.id}/plans`}>
                              <Sliders className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => openEdit(product)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(product)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {data?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Belum ada produk.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Produk" : "Tambah Produk"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Tabs defaultValue="general">
              <TabsList className="flex w-full flex-wrap justify-start gap-1">
                <TabsTrigger value="general">Umum</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
                {isDigital && <TabsTrigger value="digital">Digital</TabsTrigger>}
                <TabsTrigger value="features">Fitur & FAQ</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Nama Produk</Label>
                    <Input
                      id="name"
                      required
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="category">Kategori</Label>
                    <Input
                      id="category"
                      required
                      placeholder="Template, Source Code, Ebook, Software..."
                      value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Product Type</Label>
                    <Select
                      value={form.type}
                      onValueChange={(v: ProductType) => setForm((f) => ({ ...f, type: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="digital">Digital</SelectItem>
                        <SelectItem value="subscription">Subscription</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Badge</Label>
                    <Select
                      value={form.badge}
                      onValueChange={(v: ProductBadge | "none") =>
                        setForm((f) => ({ ...f, badge: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Tidak ada</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="best_seller">Best Seller</SelectItem>
                        <SelectItem value="popular">Popular</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="short_description">Short Description</Label>
                  <Textarea
                    id="short_description"
                    required
                    rows={2}
                    value={form.short_description}
                    onChange={(e) => setForm((f) => ({ ...f, short_description: e.target.value }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={6}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tags">Tags (pisahkan dengan koma)</Label>
                  <Input
                    id="tags"
                    placeholder="Laravel, POS, Source Code"
                    value={form.tags}
                    onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label>Status</Label>
                    <Select
                      value={form.status}
                      onValueChange={(v: ProductStatus) => setForm((f) => ({ ...f, status: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="sort_order">Urutan</Label>
                    <Input
                      id="sort_order"
                      type="number"
                      value={form.sort_order}
                      onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
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
                </div>

                <div className="space-y-1.5">
                  <Label>Linked Application</Label>
                  <Select
                    value={form.application_id}
                    onValueChange={(v) => setForm((f) => ({ ...f, application_id: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tidak ada</SelectItem>
                      {applications?.map((app) => (
                        <SelectItem key={app.id} value={String(app.id)}>
                          {app.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Wajib diisi agar pelanggan bisa melihat tombol "Buka Aplikasi" setelah subscription
                    aktif.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="media" className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="thumbnail">Thumbnail</Label>
                  {editing?.thumbnail && !thumbnail && (
                    <img
                      src={getStorageUrl(editing.thumbnail) ?? undefined}
                      alt=""
                      className="mb-2 h-24 w-36 rounded object-cover"
                    />
                  )}
                  <Input
                    id="thumbnail"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => setThumbnail(e.target.files?.[0] ?? null)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gallery">Gallery (bisa pilih beberapa gambar)</Label>
                  {editing?.gallery && editing.gallery.length > 0 && gallery.length === 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                      {editing.gallery.map((path) => (
                        <img
                          key={path}
                          src={getStorageUrl(path) ?? undefined}
                          alt=""
                          className="h-16 w-24 rounded object-cover"
                        />
                      ))}
                    </div>
                  )}
                  <Input
                    id="gallery"
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => setGallery(Array.from(e.target.files ?? []))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload baru akan menggantikan seluruh gallery yang ada.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="demo_url">Demo URL</Label>
                  <Input
                    id="demo_url"
                    type="url"
                    placeholder="https://demo.kagoemdigital.com/..."
                    value={form.demo_url}
                    onChange={(e) => setForm((f) => ({ ...f, demo_url: e.target.value }))}
                  />
                </div>
              </TabsContent>

              {isDigital && (
                <TabsContent value="digital" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="price">Harga</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        value={form.price}
                        onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="discount_price">Harga Diskon</Label>
                      <Input
                        id="discount_price"
                        type="number"
                        min="0"
                        value={form.discount_price}
                        onChange={(e) => setForm((f) => ({ ...f, discount_price: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="currency">Currency</Label>
                      <Input
                        id="currency"
                        value={form.currency}
                        onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="digital_file">Digital File (ZIP/PDF/RAR, maks 50MB)</Label>
                    {editing?.has_digital_file && !digitalFile && (
                      <p className="text-xs text-muted-foreground">
                        File sudah tersedia. Upload file baru untuk mengganti.
                      </p>
                    )}
                    <Input
                      id="digital_file"
                      type="file"
                      accept=".zip,.pdf,.rar"
                      onChange={(e) => setDigitalFile(e.target.files?.[0] ?? null)}
                    />
                    <p className="text-xs text-muted-foreground">
                      File tersimpan aman dan tidak dapat diakses publik secara langsung.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="download_url">Download URL (opsional, alternatif file)</Label>
                    <Input
                      id="download_url"
                      type="url"
                      value={form.download_url}
                      onChange={(e) => setForm((f) => ({ ...f, download_url: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="whats_included">What's Included (satu baris satu item)</Label>
                    <Textarea
                      id="whats_included"
                      rows={4}
                      placeholder={"Source code\nDocumentation\nInstallation guide"}
                      value={form.whats_included}
                      onChange={(e) => setForm((f) => ({ ...f, whats_included: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="requirements">Requirements (satu baris satu item)</Label>
                    <Textarea
                      id="requirements"
                      rows={3}
                      value={form.requirements}
                      onChange={(e) => setForm((f) => ({ ...f, requirements: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="technology">Technology (satu baris satu item)</Label>
                    <Textarea
                      id="technology"
                      rows={3}
                      value={form.technology}
                      onChange={(e) => setForm((f) => ({ ...f, technology: e.target.value }))}
                    />
                  </div>
                </TabsContent>
              )}

              <TabsContent value="features" className="space-y-6 pt-4">
                <div>
                  <div className="flex items-center justify-between">
                    <Label>Features</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setFeatures((rows) => [...rows, { name: "", description: "" }])
                      }
                    >
                      <ListPlus className="h-4 w-4" /> Tambah
                    </Button>
                  </div>
                  <div className="mt-3 space-y-3">
                    {features.map((row, i) => (
                      <div key={i} className="flex gap-2 rounded-xl border border-border p-3">
                        <div className="flex-1 space-y-2">
                          <Input
                            placeholder="Nama fitur"
                            value={row.name}
                            onChange={(e) =>
                              setFeatures((rows) =>
                                rows.map((r, idx) =>
                                  idx === i ? { ...r, name: e.target.value } : r,
                                ),
                              )
                            }
                          />
                          <Input
                            placeholder="Deskripsi (opsional)"
                            value={row.description}
                            onChange={(e) =>
                              setFeatures((rows) =>
                                rows.map((r, idx) =>
                                  idx === i ? { ...r, description: e.target.value } : r,
                                ),
                              )
                            }
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setFeatures((rows) => rows.filter((_, idx) => idx !== i))}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    {features.length === 0 && (
                      <p className="text-sm text-muted-foreground">Belum ada fitur.</p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label>FAQ</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFaqs((rows) => [...rows, { question: "", answer: "" }])}
                    >
                      <ListPlus className="h-4 w-4" /> Tambah
                    </Button>
                  </div>
                  <div className="mt-3 space-y-3">
                    {faqs.map((row, i) => (
                      <div key={i} className="flex gap-2 rounded-xl border border-border p-3">
                        <div className="flex-1 space-y-2">
                          <Input
                            placeholder="Pertanyaan"
                            value={row.question}
                            onChange={(e) =>
                              setFaqs((rows) =>
                                rows.map((r, idx) =>
                                  idx === i ? { ...r, question: e.target.value } : r,
                                ),
                              )
                            }
                          />
                          <Textarea
                            placeholder="Jawaban"
                            rows={2}
                            value={row.answer}
                            onChange={(e) =>
                              setFaqs((rows) =>
                                rows.map((r, idx) =>
                                  idx === i ? { ...r, answer: e.target.value } : r,
                                ),
                              )
                            }
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setFaqs((rows) => rows.filter((_, idx) => idx !== i))}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    {faqs.length === 0 && (
                      <p className="text-sm text-muted-foreground">Belum ada FAQ.</p>
                    )}
                  </div>
                </div>

                {isSubscription && (
                  <p className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">
                    Kelola subscription plan melalui halaman "Manage Plans" setelah produk disimpan.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="seo" className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="meta_title">Meta Title</Label>
                  <Input
                    id="meta_title"
                    value={form.meta_title}
                    onChange={(e) => setForm((f) => ({ ...f, meta_title: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea
                    id="meta_description"
                    rows={3}
                    value={form.meta_description}
                    onChange={(e) => setForm((f) => ({ ...f, meta_description: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="og_image">OG Image</Label>
                  {editing?.og_image && !ogImage && (
                    <img
                      src={getStorageUrl(editing.og_image) ?? undefined}
                      alt=""
                      className="mb-2 h-20 w-36 rounded object-cover"
                    />
                  )}
                  <Input
                    id="og_image"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => setOgImage(e.target.files?.[0] ?? null)}
                  />
                </div>
              </TabsContent>
            </Tabs>

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
            <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus "{deleteTarget?.name}"? Tindakan ini tidak dapat
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
