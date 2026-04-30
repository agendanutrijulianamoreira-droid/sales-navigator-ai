import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUserRole } from "@/hooks/useUserRole";
import { Navigate } from "react-router-dom";
import { DollarSign, Users, TrendingUp, AlertCircle, Loader2 } from "lucide-react";

export default function AdminSales() {
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [stats, setStats] = useState({ mrr: 0, customers: 0, activeSubsCount: 0, churnedCount: 0 });
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const [{ data: subs }, { data: payments }] = await Promise.all([
        supabase
          .from("subscriptions")
          .select("*, plan:subscription_plans(name, price_monthly, price_yearly)")
          .order("created_at", { ascending: false }),
        supabase
          .from("payment_events")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20),
      ]);

      const all = (subs as any[]) || [];
      const active = all.filter((s) => s.status === "active");
      const mrr = active.reduce((sum, s) => {
        const monthly = s.billing_cycle === "yearly"
          ? (s.plan?.price_yearly || 0) / 12
          : (s.plan?.price_monthly || 0);
        return sum + Number(monthly);
      }, 0);

      setStats({
        mrr,
        customers: all.length,
        activeSubsCount: active.length,
        churnedCount: all.filter((s) => s.status === "canceled").length,
      });
      setSubscriptions(all);
      setRecentPayments((payments as any[]) || []);
      setLoading(false);
    })();
  }, [isAdmin]);

  if (roleLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }
  if (!isAdmin) return <Navigate to="/" replace />;

  const statusColor = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "trialing": return "secondary";
      case "past_due": return "destructive";
      case "canceled": return "outline";
      default: return "outline";
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
          Central de Vendas
        </h1>
        <p className="text-muted-foreground">Métricas, clientes e pagamentos</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardDescription>MRR</CardDescription>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.mrr.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Receita mensal recorrente</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardDescription>Assinantes ativos</CardDescription>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardDescription>Total de clientes</CardDescription>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardDescription>Cancelados</CardDescription>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.churnedCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assinaturas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Ciclo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Créditos AI</TableHead>
                  <TableHead>Próxima cobrança</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs">{s.user_id.slice(0, 8)}...</TableCell>
                    <TableCell>{s.plan?.name || "—"}</TableCell>
                    <TableCell>{s.billing_cycle || "—"}</TableCell>
                    <TableCell><Badge variant={statusColor(s.status) as any}>{s.status}</Badge></TableCell>
                    <TableCell>{s.ai_credits_remaining}</TableCell>
                    <TableCell>{s.current_period_end ? new Date(s.current_period_end).toLocaleDateString("pt-BR") : "—"}</TableCell>
                  </TableRow>
                ))}
                {subscriptions.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Nenhuma assinatura ainda</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pagamentos recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentPayments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-xs">{new Date(p.created_at).toLocaleString("pt-BR")}</TableCell>
                  <TableCell><Badge variant="outline">{p.event_type}</Badge></TableCell>
                  <TableCell>{p.amount ? `R$ ${Number(p.amount).toFixed(2)}` : "—"}</TableCell>
                  <TableCell>{p.status || "—"}</TableCell>
                </TableRow>
              ))}
              {recentPayments.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Nenhum pagamento ainda</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
