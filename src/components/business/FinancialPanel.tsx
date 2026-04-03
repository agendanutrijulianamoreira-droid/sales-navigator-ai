import { useState } from "react";
import {
  useFinancialData,
  RevenueCategory,
  ExpenseCategory,
  REVENUE_CATEGORY_LABELS,
  EXPENSE_CATEGORY_LABELS,
} from "@/hooks/useFinancialData";
import { useFinancialSettings } from "@/hooks/useFinancialSettings";
import { useProducts } from "@/hooks/useProducts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DollarSign, TrendingUp, TrendingDown, Wallet, Target,
  Plus, Trash2, ChevronLeft, ChevronRight, Receipt,
  ArrowUpRight, ArrowDownRight, PieChart, BarChart3, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MONTHS_PT = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export function FinancialPanel() {
  const { revenues, expenses, loading, dre, monthlyHistory, selectedMonth, setSelectedMonth, addRevenue, addExpense, deleteRevenue, deleteExpense } = useFinancialData();
  const { settings } = useFinancialSettings();
  const { products } = useProducts();

  const [entryTab, setEntryTab] = useState<"receita" | "despesa">("receita");

  // Revenue form
  const [revValor, setRevValor] = useState("");
  const [revCategoria, setRevCategoria] = useState<RevenueCategory>("consulta");
  const [revPaciente, setRevPaciente] = useState("");
  const [revDescricao, setRevDescricao] = useState("");
  const [revProdutoId, setRevProdutoId] = useState<string>("");
  const [revData, setRevData] = useState(new Date().toISOString().split("T")[0]);

  // Expense form
  const [expValor, setExpValor] = useState("");
  const [expCategoria, setExpCategoria] = useState<ExpenseCategory>("software");
  const [expDescricao, setExpDescricao] = useState("");
  const [expData, setExpData] = useState(new Date().toISOString().split("T")[0]);
  const [expRecorrente, setExpRecorrente] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  // Funnel metrics
  const [funnelInvestimento, setFunnelInvestimento] = useState("");
  const [funnelComentarios, setFunnelComentarios] = useState("");
  const [funnelConversas, setFunnelConversas] = useState("");
  const [funnelVendas, setFunnelVendas] = useState("");

  const funnelCustoComentario = Number(funnelInvestimento) > 0 && Number(funnelComentarios) > 0
    ? (Number(funnelInvestimento) / Number(funnelComentarios))
    : null;
  const funnelTaxaResposta = Number(funnelComentarios) > 0 && Number(funnelConversas) > 0
    ? ((Number(funnelConversas) / Number(funnelComentarios)) * 100)
    : null;
  const funnelConversao = Number(funnelConversas) > 0 && Number(funnelVendas) > 0
    ? ((Number(funnelVendas) / Number(funnelConversas)) * 100)
    : null;

  const monthlyGoal = settings?.monthly_income_goal || 10000;
  const goalProgress = monthlyGoal > 0 ? Math.min((dre.receita_bruta / monthlyGoal) * 100, 100) : 0;

  const navigateMonth = (direction: number) => {
    setSelectedMonth(prev => {
      let newMonth = prev.month + direction;
      let newYear = prev.year;
      if (newMonth < 1) { newMonth = 12; newYear--; }
      if (newMonth > 12) { newMonth = 1; newYear++; }
      return { year: newYear, month: newMonth };
    });
  };

  const handleAddRevenue = async () => {
    if (!revValor || parseFloat(revValor) <= 0) return;
    setIsSaving(true);
    await addRevenue({
      data: revData,
      valor: parseFloat(revValor),
      categoria: revCategoria,
      produto_id: revProdutoId || undefined,
      paciente_nome: revPaciente || undefined,
      descricao: revDescricao || undefined,
    });
    setRevValor(""); setRevPaciente(""); setRevDescricao(""); setRevProdutoId("");
    setIsSaving(false);
  };

  const handleAddExpense = async () => {
    if (!expValor || parseFloat(expValor) <= 0) return;
    setIsSaving(true);
    await addExpense({
      data: expData,
      valor: parseFloat(expValor),
      categoria: expCategoria,
      descricao: expDescricao || undefined,
      recorrente: expRecorrente,
    });
    setExpValor(""); setExpDescricao(""); setExpRecorrente(false);
    setIsSaving(false);
  };

  const fmt = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalDespesas = dre.impostos + dre.custos_fixos + dre.custos_variaveis;

  return (
    <div className="space-y-6">
      {/* Month Navigator */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigateMonth(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-bold">
          {MONTHS_PT[selectedMonth.month - 1]} {selectedMonth.year}
        </h2>
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigateMonth(1)}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-emerald-200/50 bg-emerald-50/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-emerald-700/60 uppercase tracking-wider">Receita</span>
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-emerald-700">R$ {fmt(dre.receita_bruta)}</p>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Meta: R$ {fmt(monthlyGoal)}</span>
                <span className="font-semibold">{Math.round(goalProgress)}%</span>
              </div>
              <Progress value={goalProgress} className="h-1.5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200/50 bg-red-50/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-red-700/60 uppercase tracking-wider">Despesas</span>
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-700">R$ {fmt(totalDespesas)}</p>
            <p className="text-xs text-muted-foreground mt-1">{expenses.length} lançamentos</p>
          </CardContent>
        </Card>

        <Card className={cn("border-200/50", dre.lucro_liquido >= 0 ? "border-blue-200/50 bg-blue-50/30" : "border-amber-200/50 bg-amber-50/30")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className={cn("text-xs font-semibold uppercase tracking-wider", dre.lucro_liquido >= 0 ? "text-blue-700/60" : "text-amber-700/60")}>Lucro Líquido</span>
              <Wallet className={cn("h-4 w-4", dre.lucro_liquido >= 0 ? "text-blue-500" : "text-amber-500")} />
            </div>
            <p className={cn("text-2xl font-bold", dre.lucro_liquido >= 0 ? "text-blue-700" : "text-amber-700")}>
              R$ {fmt(dre.lucro_liquido)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Margem: {dre.margem.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200/50 bg-purple-50/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-purple-700/60 uppercase tracking-wider">Atendimentos</span>
              <PieChart className="h-4 w-4 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-purple-700">{dre.total_consultas}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Ticket médio: R$ {fmt(dre.ticket_medio)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* DRE + History (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* DRE Simplificado */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                DRE Simplificado
              </CardTitle>
              <CardDescription>Demonstrativo de Resultado do mês</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm font-semibold text-emerald-600">Receita Bruta</span>
                  <span className="text-sm font-bold text-emerald-600">R$ {fmt(dre.receita_bruta)}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 pl-4 text-sm text-muted-foreground">
                  <span>(-) Impostos</span>
                  <span className="text-red-500">- R$ {fmt(dre.impostos)}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 pl-4 text-sm text-muted-foreground">
                  <span>(-) Custos Fixos</span>
                  <span className="text-red-500">- R$ {fmt(dre.custos_fixos)}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 pl-4 text-sm text-muted-foreground">
                  <span>(-) Custos Variáveis</span>
                  <span className="text-red-500">- R$ {fmt(dre.custos_variaveis)}</span>
                </div>
                <div className={cn("flex items-center justify-between py-3 border-t-2 border-dashed", dre.lucro_liquido >= 0 ? "border-emerald-200" : "border-red-200")}>
                  <span className="text-sm font-bold">=  Lucro Líquido</span>
                  <span className={cn("text-lg font-black", dre.lucro_liquido >= 0 ? "text-emerald-600" : "text-red-600")}>
                    R$ {fmt(dre.lucro_liquido)}
                  </span>
                </div>
              </div>

              {/* Revenue breakdown */}
              {Object.keys(dre.receita_por_categoria).length > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Receita por categoria</p>
                  <div className="space-y-2">
                    {Object.entries(dre.receita_por_categoria)
                      .sort(([, a], [, b]) => b - a)
                      .map(([cat, val]) => (
                        <div key={cat} className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-xs mb-0.5">
                              <span className="capitalize">{REVENUE_CATEGORY_LABELS[cat as RevenueCategory] || cat}</span>
                              <span className="font-semibold">R$ {fmt(val)}</span>
                            </div>
                            <Progress value={dre.receita_bruta > 0 ? (val / dre.receita_bruta) * 100 : 0} className="h-1" />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Evolução Mensal */}
          {monthlyHistory.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  Evolução (6 meses)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-40">
                  {monthlyHistory.map((m, i) => {
                    const maxVal = Math.max(...monthlyHistory.map(h => Math.max(h.receita, h.despesa)), 1);
                    const hReceita = Math.max((m.receita / maxVal) * 120, 4);
                    const hDespesa = Math.max((m.despesa / maxVal) * 120, 4);
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="flex gap-0.5 items-end h-[130px]">
                          <div className="w-3 bg-emerald-400 rounded-t-sm transition-all" style={{ height: hReceita }} title={`Receita: R$ ${fmt(m.receita)}`} />
                          <div className="w-3 bg-red-300 rounded-t-sm transition-all" style={{ height: hDespesa }} title={`Despesa: R$ ${fmt(m.despesa)}`} />
                        </div>
                        <span className="text-[10px] text-muted-foreground capitalize">{m.mes}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-center gap-6 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" /> Receita</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-300" /> Despesa</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Entries */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="h-4 w-4 text-muted-foreground" />
                Lançamentos do Mês
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {revenues.length === 0 && expenses.length === 0 ? (
                <div className="text-center py-10 text-sm text-muted-foreground">
                  Nenhum lançamento neste mês
                </div>
              ) : (
                <div className="max-h-[400px] overflow-y-auto">
                  {[...revenues.map(r => ({ ...r, _type: "receita" as const })), ...expenses.map(e => ({ ...e, _type: "despesa" as const }))]
                    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                    .map((entry) => (
                      <div key={entry.id} className="flex items-center gap-3 px-5 py-3 border-b last:border-b-0 hover:bg-muted/30 transition-colors group">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                          entry._type === "receita" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"
                        )}>
                          {entry._type === "receita" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {entry._type === "receita"
                              ? (REVENUE_CATEGORY_LABELS[(entry as any).categoria as RevenueCategory] || entry.categoria)
                              : (EXPENSE_CATEGORY_LABELS[(entry as any).categoria as ExpenseCategory] || entry.categoria)}
                            {(entry as any).paciente_nome && ` — ${(entry as any).paciente_nome}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(entry.data + 'T12:00:00').toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                            {entry.descricao && ` · ${entry.descricao}`}
                          </p>
                        </div>
                        <span className={cn("text-sm font-bold", entry._type === "receita" ? "text-emerald-600" : "text-red-500")}>
                          {entry._type === "receita" ? "+" : "-"} R$ {fmt(Number(entry.valor))}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => entry._type === "receita" ? deleteRevenue(entry.id) : deleteExpense(entry.id)}
                        >
                          <Trash2 className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Quick Entry */}
        <div className="space-y-4">
          <Card className="border-2 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" />
                Novo Lançamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={entryTab} onValueChange={(v) => setEntryTab(v as "receita" | "despesa")}>
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="receita" className="text-xs font-bold data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                    <ArrowUpRight className="h-3 w-3 mr-1" /> Receita
                  </TabsTrigger>
                  <TabsTrigger value="despesa" className="text-xs font-bold data-[state=active]:bg-red-500 data-[state=active]:text-white">
                    <ArrowDownRight className="h-3 w-3 mr-1" /> Despesa
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="receita" className="space-y-3 mt-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Valor (R$)</Label>
                    <Input
                      type="number"
                      value={revValor}
                      onChange={(e) => setRevValor(e.target.value)}
                      placeholder="350.00"
                      className="h-12 text-lg font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Categoria</Label>
                    <Select value={revCategoria} onValueChange={(v) => setRevCategoria(v as RevenueCategory)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(REVENUE_CATEGORY_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Data</Label>
                    <Input type="date" value={revData} onChange={(e) => setRevData(e.target.value)} />
                  </div>
                  {products && products.length > 0 && (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Produto (opcional)</Label>
                      <Select value={revProdutoId || "none"} onValueChange={(v) => setRevProdutoId(v === "none" ? "" : v)}>
                        <SelectTrigger><SelectValue placeholder="Vincular produto" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          {products.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.nome} — R$ {p.ticket}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Paciente (opcional)</Label>
                    <Input value={revPaciente} onChange={(e) => setRevPaciente(e.target.value)} placeholder="Nome do paciente" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Descrição (opcional)</Label>
                    <Input value={revDescricao} onChange={(e) => setRevDescricao(e.target.value)} placeholder="Consulta de retorno 30min" />
                  </div>
                  <Button onClick={handleAddRevenue} disabled={isSaving || !revValor} className="w-full h-11 font-bold bg-emerald-600 hover:bg-emerald-700">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                    Registrar Receita
                  </Button>
                </TabsContent>

                <TabsContent value="despesa" className="space-y-3 mt-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Valor (R$)</Label>
                    <Input
                      type="number"
                      value={expValor}
                      onChange={(e) => setExpValor(e.target.value)}
                      placeholder="150.00"
                      className="h-12 text-lg font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Categoria</Label>
                    <Select value={expCategoria} onValueChange={(v) => setExpCategoria(v as ExpenseCategory)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(EXPENSE_CATEGORY_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Data</Label>
                    <Input type="date" value={expData} onChange={(e) => setExpData(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Descrição (opcional)</Label>
                    <Input value={expDescricao} onChange={(e) => setExpDescricao(e.target.value)} placeholder="ManyChat mensal" />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={expRecorrente} onChange={(e) => setExpRecorrente(e.target.checked)} className="rounded" />
                    <span className="text-xs text-muted-foreground">Despesa recorrente (todo mês)</span>
                  </label>
                  <Button onClick={handleAddExpense} disabled={isSaving || !expValor} className="w-full h-11 font-bold bg-red-600 hover:bg-red-700 text-white">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                    Registrar Despesa
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Meta do Mês */}
          <Card className={cn(goalProgress >= 100 ? "border-emerald-300 bg-emerald-50/50" : "")}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className={cn("h-4 w-4", goalProgress >= 100 ? "text-emerald-500" : "text-primary")} />
                <span className="text-sm font-semibold">Meta do Mês</span>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-bold">R$ {fmt(dre.receita_bruta)}</span>
                <span className="text-sm text-muted-foreground">/ R$ {fmt(monthlyGoal)}</span>
              </div>
              <Progress value={goalProgress} className="h-2 mb-2" />
              <p className="text-xs text-muted-foreground">
                {goalProgress >= 100
                  ? "Meta batida! Parabéns!"
                  : `Faltam R$ ${fmt(monthlyGoal - dre.receita_bruta)} para bater a meta`}
              </p>
            </CardContent>
          </Card>

          {/* Métricas de Funil */}
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-primary/70 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5" /> Métricas de Funil
              </p>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Investimento em tráfego</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">R$</span>
                    <Input type="number" placeholder="140" className="h-8 text-xs" value={funnelInvestimento} onChange={(e) => setFunnelInvestimento(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-muted-foreground">Comentários</span>
                    <Input type="number" placeholder="20" className="h-8 text-xs mt-1" value={funnelComentarios} onChange={(e) => setFunnelComentarios(e.target.value)} />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground">Custo/comentário</span>
                    <div className={cn("h-8 flex items-center px-2 rounded-md text-xs font-semibold mt-1", funnelCustoComentario !== null && funnelCustoComentario <= 7 ? "bg-emerald-50 text-emerald-600" : funnelCustoComentario !== null ? "bg-red-50 text-red-600" : "bg-muted/50")}>
                      {funnelCustoComentario !== null ? `R$ ${funnelCustoComentario.toFixed(2)}` : "—"}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-muted-foreground">Conversas iniciadas</span>
                    <Input type="number" placeholder="10" className="h-8 text-xs mt-1" value={funnelConversas} onChange={(e) => setFunnelConversas(e.target.value)} />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground">Taxa resposta</span>
                    <div className={cn("h-8 flex items-center px-2 rounded-md text-xs font-semibold mt-1", funnelTaxaResposta !== null && funnelTaxaResposta >= 50 ? "bg-emerald-50 text-emerald-600" : funnelTaxaResposta !== null ? "bg-amber-50 text-amber-600" : "bg-muted/50")}>
                      {funnelTaxaResposta !== null ? `${funnelTaxaResposta.toFixed(0)}%` : "—"}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-muted-foreground">Vendas fechadas</span>
                    <Input type="number" placeholder="1" className="h-8 text-xs mt-1" value={funnelVendas} onChange={(e) => setFunnelVendas(e.target.value)} />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground">Conversão</span>
                    <div className={cn("h-8 flex items-center px-2 rounded-md text-xs font-bold mt-1", funnelConversao !== null && funnelConversao >= 10 ? "bg-emerald-50 text-emerald-600" : funnelConversao !== null ? "bg-amber-50 text-amber-600" : "bg-muted/50")}>
                      {funnelConversao !== null ? `${funnelConversao.toFixed(0)}%` : "—"}
                    </div>
                  </div>
                </div>
                <div className="p-2 bg-primary/5 rounded-lg text-[10px] text-primary/70">
                  <strong>Referência:</strong> Custo/comentário {'<'} R$7 · Taxa resposta {'>'} 50% · Conversão {'>'} 10%
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Despesas por Categoria */}
          {Object.keys(dre.despesa_por_categoria).length > 0 && (
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Despesas por tipo</p>
                <div className="space-y-2">
                  {Object.entries(dre.despesa_por_categoria)
                    .sort(([, a], [, b]) => b - a)
                    .map(([cat, val]) => (
                      <div key={cat} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{EXPENSE_CATEGORY_LABELS[cat as ExpenseCategory] || cat}</span>
                        <span className="font-semibold text-red-600">R$ {fmt(val)}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
