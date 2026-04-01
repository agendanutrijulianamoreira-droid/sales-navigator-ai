import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

// ── Types ──
export interface RevenueEntry {
  id: string;
  user_id: string;
  data: string;
  valor: number;
  categoria: RevenueCategory;
  produto_id?: string;
  paciente_nome?: string;
  descricao?: string;
  recorrente?: boolean;
  created_at: string;
}

export interface ExpenseEntry {
  id: string;
  user_id: string;
  data: string;
  valor: number;
  categoria: ExpenseCategory;
  descricao?: string;
  recorrente?: boolean;
  created_at: string;
}

export type RevenueCategory = "consulta" | "retorno" | "infoproduto" | "mentoria" | "desafio" | "grupo" | "parceria" | "outro";
export type ExpenseCategory = "aluguel" | "software" | "trafego" | "funcionario" | "material" | "imposto" | "alimentacao" | "transporte" | "educacao" | "outro";

export const REVENUE_CATEGORY_LABELS: Record<RevenueCategory, string> = {
  consulta: "Consulta",
  retorno: "Retorno",
  infoproduto: "Infoproduto",
  mentoria: "Mentoria",
  desafio: "Desafio",
  grupo: "Grupo",
  parceria: "Parceria",
  outro: "Outro",
};

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  aluguel: "Aluguel/Sala",
  software: "Software/Apps",
  trafego: "Tráfego Pago",
  funcionario: "Funcionário/Assistente",
  material: "Material/Suplementos",
  imposto: "Impostos",
  alimentacao: "Alimentação",
  transporte: "Transporte",
  educacao: "Educação/Cursos",
  outro: "Outro",
};

export interface MonthlyDRE {
  receita_bruta: number;
  impostos: number;
  custos_fixos: number;
  custos_variaveis: number;
  lucro_liquido: number;
  margem: number;
  receita_por_categoria: Record<string, number>;
  despesa_por_categoria: Record<string, number>;
  total_consultas: number;
  ticket_medio: number;
}

// ── Helpers ──
function getMonthRange(year: number, month: number) {
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const end = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
  return { start, end };
}

// ── Hook ──
export function useFinancialData() {
  const { user } = useAuth();
  const [revenues, setRevenues] = useState<RevenueEntry[]>([]);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });

  const { start, end } = useMemo(() => getMonthRange(selectedMonth.year, selectedMonth.month), [selectedMonth]);

  // ── Fetch ──
  const fetchData = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    try {
      const [revResult, expResult] = await Promise.all([
        supabase
          .from("revenue_entries")
          .select("*")
          .eq("user_id", user.id)
          .gte("data", start)
          .lt("data", end)
          .order("data", { ascending: false }),
        supabase
          .from("expense_entries")
          .select("*")
          .eq("user_id", user.id)
          .gte("data", start)
          .lt("data", end)
          .order("data", { ascending: false }),
      ]);

      if (revResult.error) throw revResult.error;
      if (expResult.error) throw expResult.error;

      setRevenues((revResult.data as RevenueEntry[]) || []);
      setExpenses((expResult.data as ExpenseEntry[]) || []);
    } catch (err) {
      console.error("Error fetching financial data:", err);
    } finally {
      setLoading(false);
    }
  }, [user, start, end]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Add Revenue ──
  const addRevenue = async (entry: Omit<RevenueEntry, "id" | "user_id" | "created_at">) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from("revenue_entries")
        .insert({ ...entry, user_id: user.id });
      if (error) throw error;
      await fetchData();
      toast.success("Receita registrada!");
    } catch (err) {
      console.error("Error adding revenue:", err);
      toast.error("Erro ao registrar receita");
    }
  };

  // ── Add Expense ──
  const addExpense = async (entry: Omit<ExpenseEntry, "id" | "user_id" | "created_at">) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from("expense_entries")
        .insert({ ...entry, user_id: user.id });
      if (error) throw error;
      await fetchData();
      toast.success("Despesa registrada!");
    } catch (err) {
      console.error("Error adding expense:", err);
      toast.error("Erro ao registrar despesa");
    }
  };

  // ── Delete ──
  const deleteRevenue = async (id: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from("revenue_entries").delete().eq("id", id).eq("user_id", user.id);
      if (error) throw error;
      await fetchData();
      toast.success("Receita removida");
    } catch (err) { toast.error("Erro ao remover"); }
  };

  const deleteExpense = async (id: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from("expense_entries").delete().eq("id", id).eq("user_id", user.id);
      if (error) throw error;
      await fetchData();
      toast.success("Despesa removida");
    } catch (err) { toast.error("Erro ao remover"); }
  };

  // ── DRE Calculation ──
  const dre = useMemo<MonthlyDRE>(() => {
    const receita_bruta = revenues.reduce((acc, r) => acc + Number(r.valor), 0);
    const total_despesas = expenses.reduce((acc, e) => acc + Number(e.valor), 0);

    // Split expenses by type
    const impostos = expenses.filter(e => e.categoria === "imposto").reduce((acc, e) => acc + Number(e.valor), 0);
    const custos_fixos = expenses.filter(e => ["aluguel", "software", "funcionario"].includes(e.categoria)).reduce((acc, e) => acc + Number(e.valor), 0);
    const custos_variaveis = total_despesas - impostos - custos_fixos;

    const lucro_liquido = receita_bruta - total_despesas;
    const margem = receita_bruta > 0 ? (lucro_liquido / receita_bruta) * 100 : 0;

    // Revenue by category
    const receita_por_categoria: Record<string, number> = {};
    revenues.forEach(r => {
      receita_por_categoria[r.categoria] = (receita_por_categoria[r.categoria] || 0) + Number(r.valor);
    });

    // Expense by category
    const despesa_por_categoria: Record<string, number> = {};
    expenses.forEach(e => {
      despesa_por_categoria[e.categoria] = (despesa_por_categoria[e.categoria] || 0) + Number(e.valor);
    });

    const consultas = revenues.filter(r => ["consulta", "retorno"].includes(r.categoria));
    const total_consultas = consultas.length;
    const ticket_medio = total_consultas > 0
      ? consultas.reduce((acc, r) => acc + Number(r.valor), 0) / total_consultas
      : 0;

    return {
      receita_bruta,
      impostos,
      custos_fixos,
      custos_variaveis,
      lucro_liquido,
      margem,
      receita_por_categoria,
      despesa_por_categoria,
      total_consultas,
      ticket_medio,
    };
  }, [revenues, expenses]);

  // ── Fetch Last 6 Months ──
  const [monthlyHistory, setMonthlyHistory] = useState<{ mes: string; receita: number; despesa: number; lucro: number }[]>([]);

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    try {
      const months: { mes: string; receita: number; despesa: number; lucro: number }[] = [];
      const now = new Date();

      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const { start, end } = getMonthRange(d.getFullYear(), d.getMonth() + 1);
        const mesLabel = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");

        const [revRes, expRes] = await Promise.all([
          supabase.from("revenue_entries").select("valor").eq("user_id", user.id).gte("data", start).lt("data", end),
          supabase.from("expense_entries").select("valor").eq("user_id", user.id).gte("data", start).lt("data", end),
        ]);

        const receita = (revRes.data || []).reduce((acc, r) => acc + Number(r.valor), 0);
        const despesa = (expRes.data || []).reduce((acc, e) => acc + Number(e.valor), 0);
        months.push({ mes: mesLabel, receita, despesa, lucro: receita - despesa });
      }

      setMonthlyHistory(months);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  }, [user]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  return {
    revenues,
    expenses,
    loading,
    dre,
    monthlyHistory,
    selectedMonth,
    setSelectedMonth,
    addRevenue,
    addExpense,
    deleteRevenue,
    deleteExpense,
    refetch: fetchData,
  };
}
