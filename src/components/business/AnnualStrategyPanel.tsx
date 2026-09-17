import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Gauge,
  Loader2,
  Package,
  Save,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  WalletCards,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFinancialSettings } from "@/hooks/useFinancialSettings";
import { useMarketingStrategy } from "@/hooks/useMarketingStrategy";
import { useProducts } from "@/hooks/useProducts";
import {
  buildAnnualStrategy,
  calculateRevenueScenarios,
  MONTH_NAMES,
  MOVEMENT_LABELS,
  type AnnualPlanningInputs,
  type MonthStrategy,
  type RevenueScenario,
  type RevenueScenarioKey,
  type StrategyMovement,
} from "@/lib/annualPlanning";
import { cn } from "@/lib/utils";

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const number = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });

const movementStyles: Record<StrategyMovement, string> = {
  base: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  peak: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  recovery: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  review: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  acceleration: "border-orange-500/30 bg-orange-500/10 text-orange-300",
};

function NumericField({
  id,
  label,
  value,
  onChange,
  suffix,
  min = 0,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  min?: number;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type="number"
          min={min}
          value={value}
          onChange={(event) => onChange(Number(event.target.value) || 0)}
          className={cn("bg-background/40", suffix && "pr-12")}
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function ScenarioCard({
  scenario,
  selected,
  onSelect,
}: {
  scenario: RevenueScenario;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "rounded-2xl border p-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected
          ? "border-primary bg-primary/10 shadow-lg shadow-primary/5"
          : "border-border bg-card/40 hover:border-primary/40",
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-bold">{scenario.label}</p>
          <p className="text-xs text-muted-foreground">{Math.round(scenario.factor * 100)}% da meta-base</p>
        </div>
        {selected ? <CheckCircle2 className="h-5 w-5 text-primary" /> : null}
      </div>
      <p className="text-2xl font-black tracking-tight">{money.format(scenario.annualRevenue)}</p>
      <p className="mb-4 text-xs text-muted-foreground">faturamento anual projetado</p>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-muted-foreground">Vendas/ano</p>
          <p className="font-bold">{number.format(scenario.annualSales)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Leads/ano</p>
          <p className="font-bold">{number.format(scenario.annualLeads)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Líquido estimado</p>
          <p className={cn("font-bold", scenario.estimatedNet < 0 && "text-destructive")}>
            {money.format(scenario.estimatedNet)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Capacidade</p>
          <p className={cn("font-bold", !scenario.feasible && "text-amber-400")}>
            {scenario.capacityUsage.toFixed(0)}%
          </p>
        </div>
      </div>
    </button>
  );
}

function MonthCard({
  month,
  products,
  onChange,
  onOpenCalendar,
}: {
  month: MonthStrategy;
  products: Array<{ id: string; nome: string }>;
  onChange: (field: keyof MonthStrategy, value: MonthStrategy[keyof MonthStrategy]) => void;
  onOpenCalendar: () => void;
}) {
  return (
    <Card className="overflow-hidden border-border/70 bg-card/50">
      <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{MONTH_NAMES[month.month - 1]}</CardTitle>
            <CardDescription>{money.format(month.revenue_target)} de meta</CardDescription>
          </div>
          <Badge variant="outline" className={movementStyles[month.movement]}>
            {MOVEMENT_LABELS[month.movement]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-5">
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/30 p-3 text-center text-xs">
          <div>
            <p className="text-muted-foreground">Receita</p>
            <p className="font-bold">{money.format(month.revenue_target)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Vendas</p>
            <p className="font-bold">{number.format(month.sales_target)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Leads</p>
            <p className="font-bold">{number.format(month.lead_target)}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`movement-${month.month}`}>Movimento comercial</Label>
          <Select value={month.movement} onValueChange={(value) => onChange("movement", value as StrategyMovement)}>
            <SelectTrigger id={`movement-${month.month}`} className="bg-background/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(MOVEMENT_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`campaign-${month.month}`}>Campanha</Label>
          <Input
            id={`campaign-${month.month}`}
            value={month.campaign}
            onChange={(event) => onChange("campaign", event.target.value)}
            className="bg-background/40"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`theme-${month.month}`}>Tema de conteúdo</Label>
          <Input
            id={`theme-${month.month}`}
            value={month.theme}
            onChange={(event) => onChange("theme", event.target.value)}
            className="bg-background/40"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`product-${month.month}`}>Produto em foco</Label>
          <Select
            value={month.product_id || "none"}
            onValueChange={(value) => onChange("product_id", value === "none" ? null : value)}
          >
            <SelectTrigger id={`product-${month.month}`} className="bg-background/40">
              <SelectValue placeholder="Selecione um produto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Oferta principal</SelectItem>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>{product.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="button" variant="outline" className="w-full" onClick={onOpenCalendar}>
          Planejar conteúdos deste mês
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

export function AnnualStrategyPanel() {
  const navigate = useNavigate();
  const { products, loading: productsLoading } = useProducts();
  const { settings, loading: settingsLoading } = useFinancialSettings();
  const {
    strategy,
    planningInputs,
    isLoading,
    saveStrategy,
    generateWithAI,
  } = useMarketingStrategy();
  const initialized = useRef(false);
  const currentYear = new Date().getFullYear();
  const [editableStrategy, setEditableStrategy] = useState<MonthStrategy[]>([]);
  const [inputs, setInputs] = useState<AnnualPlanningInputs>({
    year: currentYear,
    annualGoal: 120000,
    currentMonthlyRevenue: 5000,
    leadToSaleRate: 10,
    averageDeliveryHours: 2,
    paidTrafficMonthly: 0,
    variableCostRate: 5,
    selectedScenario: "probable",
  });

  useEffect(() => {
    if (strategy) setEditableStrategy(strategy);
  }, [strategy]);

  useEffect(() => {
    if (initialized.current || settingsLoading) return;

    setInputs(planningInputs || {
      year: currentYear,
      annualGoal: Math.max(0, (settings?.monthly_income_goal || 10000) * 12),
      currentMonthlyRevenue: Math.max(0, settings?.monthly_income_goal || 5000),
      leadToSaleRate: 10,
      averageDeliveryHours: 2,
      paidTrafficMonthly: 0,
      variableCostRate: 5,
      selectedScenario: "probable",
    });
    initialized.current = true;
  }, [currentYear, planningInputs, settings, settingsLoading]);

  const planningProducts = useMemo(
    () => products.map((product) => ({
      id: product.id,
      nome: product.nome,
      ticket: Number(product.ticket),
      ativo: product.ativo,
    })),
    [products],
  );

  const foundation = useMemo(() => ({
    fixedCosts: settings?.fixed_costs || 0,
    taxRate: settings?.tax_rate || 0,
    workDaysWeek: settings?.work_days_week || 5,
    workHoursDay: settings?.work_hours_day || 6,
  }), [settings]);

  const scenarios = useMemo(
    () => calculateRevenueScenarios(inputs, foundation, planningProducts),
    [foundation, inputs, planningProducts],
  );
  const selectedScenario = scenarios.find((scenario) => scenario.key === inputs.selectedScenario) || scenarios[1];

  const updateInput = <K extends keyof AnnualPlanningInputs>(key: K, value: AnnualPlanningInputs[K]) => {
    setInputs((current) => ({ ...current, [key]: value }));
  };

  const handleBuildPlan = () => {
    const plan = buildAnnualStrategy(inputs, selectedScenario, planningProducts);
    setEditableStrategy(plan);
    toast.success("Plano anual calculado. Revise e salve quando estiver pronto.");
  };

  const handleSave = async () => {
    if (!editableStrategy.length) {
      toast.error("Calcule o plano anual antes de salvar.");
      return;
    }
    await saveStrategy(editableStrategy, inputs);
  };

  const handleAiEnrichment = async () => {
    if (!editableStrategy.length) {
      toast.error("Calcule o plano antes de enriquecer com IA.");
      return;
    }

    const saved = await saveStrategy(editableStrategy, inputs, "Plano-base salvo.");
    if (!saved) return;
    const generated = await generateWithAI(inputs, saved);
    if (generated) setEditableStrategy(generated);
  };

  const updateMonth = (
    monthIndex: number,
    field: keyof MonthStrategy,
    value: MonthStrategy[keyof MonthStrategy],
  ) => {
    setEditableStrategy((current) =>
      current.map((month, index) => index === monthIndex ? { ...month, [field]: value } : month),
    );
  };

  const openMonthInCalendar = (month: MonthStrategy) => {
    navigate("/planner", {
      state: {
        openGenerator: true,
        targetMonth: month.month,
        targetYear: inputs.year,
      },
    });
  };

  if ((settingsLoading || productsLoading) && !initialized.current) {
    return (
      <div className="flex h-80 flex-col items-center justify-center gap-3">
        <Loader2 className="h-9 w-9 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Carregando dados financeiros e produtos…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card">
        <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Badge variant="outline" className="w-fit border-primary/30 bg-primary/10 text-primary">
              Máquina de vendas anual
            </Badge>
            <CardTitle className="text-2xl md:text-3xl">Estratégia anual e projeção de faturamento</CardTitle>
            <CardDescription className="max-w-3xl text-sm md:text-base">
              Transforme a meta do ano em vendas, leads, capacidade e campanhas mensais de base,
              pico, recuperação e aceleração.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={handleAiEnrichment} disabled={isLoading || !editableStrategy.length}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Enriquecer com IA
            </Button>
            <Button type="button" onClick={handleSave} disabled={isLoading || !editableStrategy.length}>
              <Save className="mr-2 h-4 w-4" />
              Salvar plano
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Premissas do planejamento
          </CardTitle>
          <CardDescription>
            Ajuste as premissas para comparar cenários. As projeções são estimativas, não promessa de resultado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <NumericField id="plan-year" label="Ano" value={inputs.year} min={currentYear} onChange={(value) => updateInput("year", value)} />
            <NumericField id="annual-goal" label="Meta anual" value={inputs.annualGoal} suffix="R$" onChange={(value) => updateInput("annualGoal", value)} />
            <NumericField id="current-revenue" label="Faturamento mensal atual" value={inputs.currentMonthlyRevenue} suffix="R$" onChange={(value) => updateInput("currentMonthlyRevenue", value)} />
            <NumericField id="conversion" label="Conversão de lead em venda" value={inputs.leadToSaleRate} suffix="%" onChange={(value) => updateInput("leadToSaleRate", value)} />
            <NumericField id="delivery-hours" label="Horas médias por venda" value={inputs.averageDeliveryHours} suffix="h" onChange={(value) => updateInput("averageDeliveryHours", value)} />
            <NumericField id="paid-traffic" label="Tráfego pago mensal" value={inputs.paidTrafficMonthly} suffix="R$" onChange={(value) => updateInput("paidTrafficMonthly", value)} />
            <NumericField id="variable-cost" label="Custos variáveis" value={inputs.variableCostRate} suffix="%" onChange={(value) => updateInput("variableCostRate", value)} />
            <div className="flex items-end">
              <Button type="button" className="w-full" onClick={handleBuildPlan}>
                <BarChart3 className="mr-2 h-4 w-4" />
                Calcular plano anual
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <section aria-labelledby="scenario-heading" className="space-y-4">
        <div>
          <h3 id="scenario-heading" className="text-xl font-bold">Cenários de faturamento</h3>
          <p className="text-sm text-muted-foreground">Escolha o cenário que vai orientar as metas mensais.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {scenarios.map((scenario) => (
            <ScenarioCard
              key={scenario.key}
              scenario={scenario}
              selected={scenario.key === inputs.selectedScenario}
              onSelect={() => updateInput("selectedScenario", scenario.key as RevenueScenarioKey)}
            />
          ))}
        </div>
      </section>

      <Card className={cn(!selectedScenario.feasible && "border-amber-500/40")}>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Raio-X do cenário {selectedScenario.label.toLowerCase()}</CardTitle>
              <CardDescription>Os números usados para orientar oferta, aquisição e agenda.</CardDescription>
            </div>
            {!selectedScenario.feasible ? (
              <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-300">
                <AlertTriangle className="mr-1 h-3.5 w-3.5" />
                Capacidade acima do limite
              </Badge>
            ) : (
              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                Compatível com a agenda
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: WalletCards, label: "Média mensal", value: money.format(selectedScenario.monthlyAverage) },
              { icon: Users, label: "Leads por mês", value: number.format(selectedScenario.monthlyLeads) },
              { icon: TrendingUp, label: "Vendas por mês", value: number.format(selectedScenario.monthlySales) },
              { icon: Gauge, label: "Uso da capacidade", value: selectedScenario.capacityUsage.toFixed(0) + "%" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl border bg-muted/20 p-4">
                <Icon className="mb-3 h-5 w-5 text-primary" />
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-black">{value}</p>
              </div>
            ))}
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <h4 className="font-bold">Mix de produtos sugerido</h4>
            </div>
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="bg-muted/40 text-left text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Produto</th>
                    <th className="px-4 py-3 font-medium">Ticket</th>
                    <th className="px-4 py-3 font-medium">Participação</th>
                    <th className="px-4 py-3 font-medium">Vendas/ano</th>
                    <th className="px-4 py-3 font-medium">Receita</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedScenario.productMix.map((item) => (
                    <tr key={item.productId || item.name} className="border-t">
                      <td className="px-4 py-3 font-medium">{item.name}</td>
                      <td className="px-4 py-3">{money.format(item.ticket)}</td>
                      <td className="px-4 py-3">{(item.share * 100).toFixed(0)}%</td>
                      <td className="px-4 py-3">{number.format(item.annualUnits)}</td>
                      <td className="px-4 py-3">{money.format(item.annualRevenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <section aria-labelledby="annual-map-heading" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 id="annual-map-heading" className="text-xl font-bold">Mapa estratégico de {inputs.year}</h3>
            <p className="text-sm text-muted-foreground">
              Cada mês vira uma direção comercial que pode ser levada ao gerador de calendário.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={handleBuildPlan}>
            <Zap className="mr-2 h-4 w-4" />
            Recalcular meses
          </Button>
        </div>

        {editableStrategy.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {editableStrategy.map((month, index) => (
              <MonthCard
                key={month.month}
                month={month}
                products={products}
                onChange={(field, value) => updateMonth(index, field, value)}
                onOpenCalendar={() => openMonthInCalendar(month)}
              />
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center gap-4 py-14 text-center">
              <Calendar className="h-10 w-10 text-primary" />
              <div>
                <p className="font-bold">Seu mapa anual ainda não foi calculado</p>
                <p className="text-sm text-muted-foreground">Escolha um cenário e gere a distribuição dos 12 meses.</p>
              </div>
              <Button type="button" onClick={handleBuildPlan}>Calcular plano anual</Button>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
