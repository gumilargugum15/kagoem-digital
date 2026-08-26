import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, ListPlus } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/admin-layout";
import { adminGetProduct } from "@/services/products";
import {
  adminGetPlans,
  adminCreatePlan,
  adminUpdatePlan,
  adminDeletePlan,
  type SubscriptionPlanPayload,
} from "@/services/subscription-plans";
import type { BillingInterval, ProductStatus, SubscriptionPlan } from "@/types/api";
import { ApiClientError } from "@/services/api";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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

interface PlanFormState {
  name: string;
  description: string;
  price: string;
  billing_interval: BillingInterval;
  max_users: string;
  max_branches: string;
  max_products: string;
  cta_label: string;
  is_highlighted: boolean;
  status: ProductStatus;
  sort_order: string;
}

interface FeatureRow {
  feature: string;
  value: string;
}

const emptyForm: PlanFormState = {
  name: "",
  description: "",
  price: "",
  billing_interval: "monthly",
  max_users: "",
  max_branches: "",
  max_products: "",
  cta_label: "",
  is_highlighted: false,
  status: "published",
  sort_order: "0",
};

function toFormState(p: SubscriptionPlan): PlanFormState {
  return {
    name: p.name,
    description: p.description ?? "",
    price: p.price ?? "",
    billing_interval: p.billing_interval,
    max_users: p.max_users?.toString() ?? "",
    max_branches: p.max_branches?.toString() ?? "",
    max_products: p.max_products?.toString() ?? "",
    cta_label: p.cta_label ?? "",
    is_highlighted: p.is_highlighted,
    status: p.status,
    sort_order: String(p.sort_order),
  };
}

function buildPayload(form: PlanFormState, features: FeatureRow[]): SubscriptionPlanPayload {
  return {
    name: form.name,
    description: form.description || undefined,
    price: form.price ? Number(form.price) : null,
    billing_interval: form.billing_interval,
    max_users: form.max_users ? Number(form.max_users) : null,
    max_branches: form.max_branches ? Number(form.max_branches) : null,
    max_products: form.max_products ? Number(form.max_products) : null,
    cta_label: form.cta_label || null,
    is_highlighted: form.is_highlighted,
    status: form.status,
    sort_order: Number(form.sort_order) || 0,
    features: features.filter((f) => f.feature.trim()),
  };
}

export default function AdminProductPlans() {
  const { id = "" } = useParams<{ id: string }>();
  const productId = Number(id);
  const queryClient = useQueryClient();

  const { data: product } = useQuery({
    queryKey: ["admin", "products", productId],
    queryFn: () => adminGetProduct(productId),
    enabled: Boolean(productId),
  });

  const { data: plans, isLoading } = useQuery({
    queryKey: ["admin", "products", productId, "plans"],
    queryFn: () => adminGetPlans(productId),
    enabled: Boolean(productId),
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SubscriptionPlan | null>(null);
  const [form, setForm] = useState<PlanFormState>(emptyForm);
  const [features, setFeatures] = useState<FeatureRow[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<SubscriptionPlan | null>(null);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "products", productId, "plans"] });

  const createMutation = useMutation({
    mutationFn: (payload: SubscriptionPlanPayload) => adminCreatePlan(productId, payload),
    onSuccess: () => {
      toast.success("Plan berhasil ditambahkan");
      invalidate();
      setDialogOpen(false);
    },
    onError: (e: unknown) =>
      toast.error(e instanceof ApiClientError ? e.message : "Gagal menyimpan"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ planId, payload }: { planId: number; payload: SubscriptionPlanPayload }) =>
      adminUpdatePlan(productId, planId, payload),
    onSuccess: () => {
      toast.success("Plan berhasil diperbarui");
      invalidate();
      setDialogOpen(false);
    },
    onError: (e: unknown) =>
      toast.error(e instanceof ApiClientError ? e.message : "Gagal menyimpan"),
  });

  const deleteMutation = useMutation({
    mutationFn: (planId: number) => adminDeletePlan(productId, planId),
    onSuccess: () => {
      toast.success("Plan berhasil dihapus");
      invalidate();
      setDeleteTarget(null);
    },
    onError: (e: unknown) =>
      toast.error(e instanceof ApiClientError ? e.message : "Gagal menghapus"),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFeatures([]);
    setDialogOpen(true);
  };

  const openEdit = (plan: SubscriptionPlan) => {
    setEditing(plan);
    setForm(toFormState(plan));
    setFeatures(
      plan.plan_features?.map((f) => ({ feature: f.feature, value: f.value ?? "" })) ?? [],
    );
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = buildPayload(form, features);
    if (editing) {
      updateMutation.mutate({ planId: editing.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout title={product ? `Subscription Plans — ${product.name}` : "Subscription Plans"}>
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-navy"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Products
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Kelola paket berlangganan untuk produk ini.</p>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Tambah Plan
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
                  <TableHead>Nama</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Interval</TableHead>
                  <TableHead>Highlight</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans?.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium text-navy">{plan.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {plan.price ? formatCurrency(plan.price) : "Custom"}
                    </TableCell>
                    <TableCell className="text-muted-foreground capitalize">
                      {plan.billing_interval}
                    </TableCell>
                    <TableCell>{plan.is_highlighted && <Badge>Highlighted</Badge>}</TableCell>
                    <TableCell>
                      <Badge variant={plan.status === "published" ? "default" : "secondary"}>
                        {plan.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(plan)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(plan)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {plans?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Belum ada plan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Plan" : "Tambah Plan"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nama Plan</Label>
                <Input
                  id="name"
                  required
                  placeholder="Starter, Business, Enterprise..."
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Billing Interval</Label>
                <Select
                  value={form.billing_interval}
                  onValueChange={(v: BillingInterval) =>
                    setForm((f) => ({ ...f, billing_interval: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="price">Harga (kosongkan untuk Custom/Hubungi Kami)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cta_label">CTA Label (opsional)</Label>
                <Input
                  id="cta_label"
                  placeholder="Mulai Berlangganan / Hubungi Kami"
                  value={form.cta_label}
                  onChange={(e) => setForm((f) => ({ ...f, cta_label: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="max_users">Max Users</Label>
                <Input
                  id="max_users"
                  type="number"
                  min="0"
                  placeholder="Unlimited"
                  value={form.max_users}
                  onChange={(e) => setForm((f) => ({ ...f, max_users: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="max_branches">Max Branches</Label>
                <Input
                  id="max_branches"
                  type="number"
                  min="0"
                  placeholder="Unlimited"
                  value={form.max_branches}
                  onChange={(e) => setForm((f) => ({ ...f, max_branches: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="max_products">Max Products</Label>
                <Input
                  id="max_products"
                  type="number"
                  min="0"
                  placeholder="Unlimited"
                  value={form.max_products}
                  onChange={(e) => setForm((f) => ({ ...f, max_products: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={form.is_highlighted}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, is_highlighted: checked }))}
              />
              <Label>Highlight plan ini (mis. "Paling Populer")</Label>
            </div>

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

            <div>
              <div className="flex items-center justify-between">
                <Label>Plan Features</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFeatures((rows) => [...rows, { feature: "", value: "" }])}
                >
                  <ListPlus className="h-4 w-4" /> Tambah
                </Button>
              </div>
              <div className="mt-3 space-y-2">
                {features.map((row, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder="Fitur (mis. 5 users)"
                      value={row.feature}
                      onChange={(e) =>
                        setFeatures((rows) =>
                          rows.map((r, idx) => (idx === i ? { ...r, feature: e.target.value } : r)),
                        )
                      }
                    />
                    <Input
                      placeholder="Value (opsional)"
                      value={row.value}
                      onChange={(e) =>
                        setFeatures((rows) =>
                          rows.map((r, idx) => (idx === i ? { ...r, value: e.target.value } : r)),
                        )
                      }
                    />
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
            <AlertDialogTitle>Hapus Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus plan "{deleteTarget?.name}"? Tindakan ini tidak
              dapat dibatalkan.
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
