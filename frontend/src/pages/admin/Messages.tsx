import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Trash2, Loader2, Eye } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/admin-layout";
import {
  adminGetContactMessages,
  adminUpdateContactMessageStatus,
  adminDeleteContactMessage,
} from "@/services/contact";
import type { ContactMessage } from "@/types/api";
import { ApiClientError } from "@/services/api";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

const STATUS_OPTIONS: ContactMessage["status"][] = ["new", "contacted", "closed"];
const STATUS_LABEL: Record<string, string> = {
  new: "Baru",
  contacted: "Dihubungi",
  closed: "Selesai",
};

export default function AdminMessages() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewing, setViewing] = useState<ContactMessage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "contact-messages", statusFilter],
    queryFn: () => adminGetContactMessages(statusFilter),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "contact-messages"] });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: ContactMessage["status"] }) =>
      adminUpdateContactMessageStatus(id, status),
    onSuccess: () => {
      toast.success("Status pesan diperbarui");
      invalidate();
    },
    onError: (e: unknown) =>
      toast.error(e instanceof ApiClientError ? e.message : "Gagal memperbarui"),
  });

  const deleteMutation = useMutation({
    mutationFn: adminDeleteContactMessage,
    onSuccess: () => {
      toast.success("Pesan berhasil dihapus");
      invalidate();
      setDeleteTarget(null);
    },
    onError: (e: unknown) =>
      toast.error(e instanceof ApiClientError ? e.message : "Gagal menghapus"),
  });

  return (
    <AdminLayout title="Contact Messages">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Pesan yang dikirim calon klien melalui website.
        </p>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
                <TableHead>Email</TableHead>
                <TableHead>Pesan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((message) => (
                <TableRow key={message.id}>
                  <TableCell className="font-medium text-navy">{message.name}</TableCell>
                  <TableCell className="text-muted-foreground">{message.email}</TableCell>
                  <TableCell className="max-w-xs text-muted-foreground">
                    <span className="line-clamp-1">{message.message}</span>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={message.status}
                      onValueChange={(status) =>
                        statusMutation.mutate({
                          id: message.id,
                          status: status as ContactMessage["status"],
                        })
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {STATUS_LABEL[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setViewing(message)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(message)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {data?.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Belum ada pesan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pesan dari {viewing?.name}</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-navy">Email:</span> {viewing.email}
              </div>
              {viewing.phone && (
                <div>
                  <span className="font-medium text-navy">Telepon:</span> {viewing.phone}
                </div>
              )}
              {viewing.company && (
                <div>
                  <span className="font-medium text-navy">Perusahaan:</span> {viewing.company}
                </div>
              )}
              <div>
                <span className="font-medium text-navy">Pesan:</span>
                <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{viewing.message}</p>
              </div>
              <div>
                <Badge variant="secondary">{STATUS_LABEL[viewing.status]}</Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pesan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pesan dari "{deleteTarget?.name}"? Tindakan ini
              tidak dapat dibatalkan.
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
