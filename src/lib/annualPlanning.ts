export type StrategyMovement = "base" | "peak" | "recovery" | "review" | "acceleration";

export interface MonthStrategy {
  month: number;
  theme: string;
  goal: string;
  product_id: string | null;
  hooks: string[];
  movement: StrategyMovement;
  campaign: string;
  revenue_target: number;
  sales_target: number;
  lead_target: number;
}

export interface AnnualPlanningInputs {
  year: number;
  annualGoal: number;
  currentMonthlyRevenue: number;
  leadToSaleRate: number;
  averageDeliveryHours: number;
  paidTrafficMonthly: number;
  variableCostRate: number;
  selectedScenario: RevenueScenarioKey;
}

export type RevenueScenarioKey = "conservative" | "probable" | "accelerated";

export interface PlanningProduct {
  id: string;
  nome: string;
  ticket: number;
  ativo?: boolean | null;
}

export interface FinancialFoundation {
  fixedCosts: number;
  taxRate: number;
  workDaysWeek: number;
  workHoursDay: number;
}

export interface ProductProjection {
  productId: string | null;
  name: string;
  ticket: number;
  share: number;
  annualUnits: number;
  annualRevenue: number;
}

export interface RevenueScenario {
  key: RevenueScenarioKey;
  label: string;
  factor: number;
  annualRevenue: number;
  monthlyAverage: number;
  annualSales: number;
  monthlySales: number;
  annualLeads: number;
  monthlyLeads: number;
  taxes: number;
  fixedCosts: number;
  variableCosts: number;
  marketingInvestment: number;
  estimatedNet: number;
  capacityHours: number;
  requiredHours: number;
  capacityUsage: number;
  feasible: boolean;
  productMix: ProductProjection[];
}

export const MOVEMENT_LABELS: Record<StrategyMovement, string> = {
  base: "Base contínua",
  peak: "Campanha de pico",
  recovery: "Recuperação",
  review: "Revisão 360º",
  acceleration: "Aceleração",
};

export const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const SCENARIOS: Array<{ key: RevenueScenarioKey; label: string; factor: number }> = [
  { key: "conservative", label: "Conservador", factor: 0.8 },
  { key: "probable", label: "Provável", factor: 1 },
  { key: "accelerated", label: "Acelerado", factor: 1.2 },
];

const SEASONALITY = [1.12, 0.82, 0.95, 0.98, 1.05, 0.92, 0.98, 0.9, 1.08, 1.1, 1.22, 0.88];

const MOVEMENTS: StrategyMovement[] = [
  "peak", "review", "peak", "recovery", "base", "acceleration",
  "recovery", "review", "peak", "base", "peak", "recovery",
];

const THEMES: Record<StrategyMovement, string[]> = {
  base: ["Autoridade que converte", "Relacionamento e prova de método"],
  peak: ["Campanha principal do mês", "Semana de decisão"],
  recovery: ["Retomada de oportunidades", "Convite para quem ainda não decidiu"],
  review: ["Diagnóstico do negócio", "Revisão de números e posicionamento"],
  acceleration: ["Sprint de crescimento", "Aceleração da meta"],
};

const HOOKS: Record<StrategyMovement, string[]> = {
  base: [
    "O que você precisa entender antes de tentar outra estratégia",
    "O erro silencioso que mantém o problema",
    "Como aplicar isso em uma rotina real",
  ],
  peak: [
    "As inscrições estão abertas: para quem esta solução faz sentido",
    "O que muda quando existe acompanhamento e método",
    "Se você quer avançar, este é o próximo passo",
  ],
  recovery: [
    "Você se interessou, mas ainda ficou com uma dúvida?",
    "O que costuma impedir uma decisão importante",
    "Ainda dá tempo de começar com segurança",
  ],
  review: [
    "O que os números do último ciclo estão mostrando",
    "O que manter, corrigir e abandonar agora",
    "A estratégia que parece boa, mas não gera resultado",
  ],
  acceleration: [
    "O plano para recuperar a meta sem agir no desespero",
    "Onde concentrar esforço para vender melhor",
    "A ação mais simples para destravar este mês",
  ],
};

function safeNumber(value: number, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function activeProducts(products: PlanningProduct[]) {
  return products
    .filter((product) => product.ativo !== false && safeNumber(Number(product.ticket)) > 0)
    .map((product) => ({ ...product, ticket: Number(product.ticket) }))
    .sort((a, b) => a.ticket - b.ticket);
}

function buildProductMix(annualRevenue: number, products: PlanningProduct[]): ProductProjection[] {
  const available = activeProducts(products);

  if (!available.length) {
    const fallbackTicket = 500;
    const annualUnits = Math.max(1, Math.ceil(annualRevenue / fallbackTicket));
    return [{
      productId: null,
      name: "Ticket médio estimado",
      ticket: fallbackTicket,
      share: 1,
      annualUnits,
      annualRevenue: roundCurrency(annualUnits * fallbackTicket),
    }];
  }

  const scores = available.map((product) => Math.sqrt(product.ticket));
  const scoreTotal = scores.reduce((sum, score) => sum + score, 0);

  return available.map((product, index) => {
    const share = scoreTotal > 0 ? scores[index] / scoreTotal : 1 / available.length;
    const annualUnits = Math.max(1, Math.ceil((annualRevenue * share) / product.ticket));

    return {
      productId: product.id,
      name: product.nome,
      ticket: product.ticket,
      share,
      annualUnits,
      annualRevenue: roundCurrency(annualUnits * product.ticket),
    };
  });
}

export function calculateRevenueScenarios(
  inputs: AnnualPlanningInputs,
  foundation: FinancialFoundation,
  products: PlanningProduct[],
): RevenueScenario[] {
  const leadToSaleRate = Math.max(0.01, Math.min(inputs.leadToSaleRate / 100, 1));
  const taxRate = Math.max(0, foundation.taxRate / 100);
  const variableCostRate = Math.max(0, inputs.variableCostRate / 100);
  const capacityHours = Math.max(0, foundation.workDaysWeek * foundation.workHoursDay * 52);

  return SCENARIOS.map((scenario) => {
    const requestedRevenue = Math.max(0, inputs.annualGoal * scenario.factor);
    const productMix = buildProductMix(requestedRevenue, products);
    const annualSales = productMix.reduce((sum, item) => sum + item.annualUnits, 0);
    const annualRevenue = roundCurrency(productMix.reduce((sum, item) => sum + item.annualRevenue, 0));
    const annualLeads = Math.ceil(annualSales / leadToSaleRate);
    const taxes = roundCurrency(annualRevenue * taxRate);
    const fixedCosts = roundCurrency(Math.max(0, foundation.fixedCosts) * 12);
    const variableCosts = roundCurrency(annualRevenue * variableCostRate);
    const marketingInvestment = roundCurrency(Math.max(0, inputs.paidTrafficMonthly) * 12);
    const requiredHours = roundCurrency(annualSales * Math.max(0, inputs.averageDeliveryHours));
    const capacityUsage = capacityHours > 0 ? (requiredHours / capacityHours) * 100 : 0;

    return {
      key: scenario.key,
      label: scenario.label,
      factor: scenario.factor,
      annualRevenue,
      monthlyAverage: roundCurrency(annualRevenue / 12),
      annualSales,
      monthlySales: Math.ceil(annualSales / 12),
      annualLeads,
      monthlyLeads: Math.ceil(annualLeads / 12),
      taxes,
      fixedCosts,
      variableCosts,
      marketingInvestment,
      estimatedNet: roundCurrency(annualRevenue - taxes - fixedCosts - variableCosts - marketingInvestment),
      capacityHours,
      requiredHours,
      capacityUsage: roundCurrency(capacityUsage),
      feasible: capacityHours === 0 || capacityUsage <= 100,
      productMix,
    };
  });
}

export function buildAnnualStrategy(
  inputs: AnnualPlanningInputs,
  scenario: RevenueScenario,
  products: PlanningProduct[],
): MonthStrategy[] {
  const seasonalTotal = SEASONALITY.reduce((sum, value) => sum + value, 0);
  const available = activeProducts(products);

  return MONTH_NAMES.map((monthName, index) => {
    const movement = MOVEMENTS[index];
    const revenueTarget = roundCurrency(scenario.annualRevenue * (SEASONALITY[index] / seasonalTotal));
    const salesTarget = Math.max(1, Math.ceil(scenario.annualSales * (SEASONALITY[index] / seasonalTotal)));
    const leadTarget = Math.max(1, Math.ceil(scenario.annualLeads * (SEASONALITY[index] / seasonalTotal)));
    const focusProduct = available.length ? available[index % available.length] : null;
    const themeOptions = THEMES[movement];
    const theme = themeOptions[index % themeOptions.length];
    const productName = focusProduct?.nome || "oferta principal";

    return {
      month: index + 1,
      theme,
      goal: "Gerar " + salesTarget + " venda(s) de " + productName + " e alcançar a meta do mês.",
      product_id: focusProduct?.id || null,
      hooks: HOOKS[movement],
      movement,
      campaign: MOVEMENT_LABELS[movement] + " — " + monthName,
      revenue_target: revenueTarget,
      sales_target: salesTarget,
      lead_target: leadTarget,
    };
  });
}

export function normalizeMonthStrategy(value: Partial<MonthStrategy>, index: number): MonthStrategy {
  const movement = value.movement && MOVEMENT_LABELS[value.movement] ? value.movement : MOVEMENTS[index];

  return {
    month: value.month || index + 1,
    theme: value.theme || "",
    goal: value.goal || "",
    product_id: value.product_id || null,
    hooks: Array.isArray(value.hooks) ? value.hooks.filter((hook): hook is string => typeof hook === "string") : [],
    movement,
    campaign: value.campaign || "",
    revenue_target: safeNumber(Number(value.revenue_target)),
    sales_target: safeNumber(Number(value.sales_target)),
    lead_target: safeNumber(Number(value.lead_target)),
  };
}
