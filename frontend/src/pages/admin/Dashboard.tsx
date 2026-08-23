import { useQuery } from "@tanstack/react-query";
import { Briefcase, Image as ImageIcon, Mail, Loader2, AlertCircle } from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { getDashboardStats } from "@/services/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STATUS_LABEL: Record<string, string> = {
  new: "Baru",
  contacted: "Dihubungi",
  closed: "Selesai",
};

export default function AdminDashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: getDashboardStats,
  });

  return (
    <AdminLayout title="Dashboard">
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Memuat data...
        </div>
      )}

      {isError && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" /> Gagal memuat data dashboard.
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Services
                </CardTitle>
                <Briefcase className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-navy">{data.services_count}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Portfolio
                </CardTitle>
                <ImageIcon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-navy">{data.portfolios_count}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Contact Messages
                </CardTitle>
                <Mail className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-navy">{data.contact_messages_count}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Pesan Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
              {data.latest_messages.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada pesan.</p>
              ) : (
                <div className="space-y-3">
                  {data.latest_messages.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between rounded-lg border border-border/60 p-3"
                    >
                      <div>
                        <div className="text-sm font-semibold text-navy">{m.name}</div>
                        <div className="text-xs text-muted-foreground">{m.email}</div>
                        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                          {m.message}
                        </p>
                      </div>
                      <Badge variant="secondary">{STATUS_LABEL[m.status] ?? m.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </AdminLayout>
  );
}
