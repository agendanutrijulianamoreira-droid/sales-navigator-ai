import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useProfile } from "./useProfile";
import { useProducts } from "./useProducts";
import {
  normalizeMonthStrategy,
  type AnnualPlanningInputs,
  type MonthStrategy,
} from "@/lib/annualPlanning";

export type { AnnualPlanningInputs, MonthStrategy } from "@/lib/annualPlanning";

function parseSavedStrategy(rawValue: string): MonthStrategy[] | null {
  try {
    const parsed = JSON.parse(rawValue) as unknown;
    const months = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === "object" && Array.isArray((parsed as { months?: unknown }).months)
        ? (parsed as { months: unknown[] }).months
        : null;

    if (!months) return null;

    return Array.from({ length: 12 }, (_, index) =>
      normalizeMonthStrategy((months[index] || {}) as Partial<MonthStrategy>, index),
    );
  } catch (error) {
    console.error("Estratégia anual salva em formato inválido:", error);
    return null;
  }
}

function parsePlanningInputs(value: unknown): AnnualPlanningInputs | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = value as Partial<AnnualPlanningInputs>;

  if (!Number.isFinite(Number(candidate.annualGoal))) return null;

  return {
    year: Number(candidate.year) || new Date().getFullYear(),
    annualGoal: Number(candidate.annualGoal) || 0,
    currentMonthlyRevenue: Number(candidate.currentMonthlyRevenue) || 0,
    leadToSaleRate: Number(candidate.leadToSaleRate) || 10,
    averageDeliveryHours: Number(candidate.averageDeliveryHours) || 2,
    paidTrafficMonthly: Number(candidate.paidTrafficMonthly) || 0,
    variableCostRate: Number(candidate.variableCostRate) || 0,
    selectedScenario:
      candidate.selectedScenario === "conservative" ||
      candidate.selectedScenario === "accelerated"
        ? candidate.selectedScenario
        : "probable",
  };
}

export function useMarketingStrategy() {
  const { profile } = useProfile();
  const { products } = useProducts();
  const [strategy, setStrategy] = useState<MonthStrategy[] | null>(null);
  const [planningInputs, setPlanningInputs] = useState<AnnualPlanningInputs | null>(null);
  const [storageId, setStorageId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStrategy = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setStrategy(null);
        setPlanningInputs(null);
        setStorageId(null);
        return;
      }

      const { data, error } = await supabase
        .from("generations")
        .select("id, output_content, input_data")
        .eq("user_id", user.id)
        .eq("tipo", "annual_marketing_strategy")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setStrategy(null);
        setPlanningInputs(null);
        setStorageId(null);
        return;
      }

      setStorageId(data.id);
      setStrategy(parseSavedStrategy(data.output_content));
      setPlanningInputs(parsePlanningInputs(data.input_data));
    } catch (error) {
      console.error("Erro ao buscar estratégia:", error);
      toast.error("Não foi possível carregar o planejamento anual.");
    }
  }, []);

  useEffect(() => {
    void fetchStrategy();
  }, [fetchStrategy]);

  const saveStrategy = async (
    newStrategy: MonthStrategy[],
    newInputs?: AnnualPlanningInputs | null,
    successMessage = "Estratégia salva com sucesso!",
  ) => {
    try {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Usuário não autenticado");

      const normalized = Array.from({ length: 12 }, (_, index) =>
        normalizeMonthStrategy(newStrategy[index] || {}, index),
      );
      const inputsToSave = newInputs || planningInputs;
      const payload = {
        output_content: JSON.stringify(normalized),
        input_data: {
          ...(inputsToSave || {}),
          generated_at: new Date().toISOString(),
          version: 2,
        },
      };

      let currentId = storageId;

      if (!currentId) {
        const { data: existing, error: existingError } = await supabase
          .from("generations")
          .select("id")
          .eq("user_id", user.id)
          .eq("tipo", "annual_marketing_strategy")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existingError) throw existingError;
        currentId = existing?.id || null;
      }

      if (currentId) {
        const { error } = await supabase
          .from("generations")
          .update(payload)
          .eq("id", currentId)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        const { data: inserted, error } = await supabase
          .from("generations")
          .insert({
            user_id: user.id,
            tipo: "annual_marketing_strategy",
            specialist: "ANNUAL_PLANNER",
            titulo: "Planejamento anual",
            ...payload,
          })
          .select("id")
          .single();

        if (error) throw error;
        setStorageId(inserted.id);
      }

      setStrategy(normalized);
      if (inputsToSave) setPlanningInputs(inputsToSave);
      toast.success(successMessage);
      return normalized;
    } catch (error) {
      console.error("Erro ao salvar estratégia:", error);
      toast.error("Erro ao salvar estratégia.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const generateWithAI = async (inputs?: AnnualPlanningInputs) => {
    try {
      setIsLoading(true);
      const context = inputs || planningInputs;
      const financialContext = context
        ? "Ano: " + context.year +
          ". Meta anual: R$ " + context.annualGoal +
          ". Faturamento mensal atual: R$ " + context.currentMonthlyRevenue +
          ". Cenário escolhido: " + context.selectedScenario + "."
        : "";

      const { data, error } = await supabase.functions.invoke("ai-specialist", {
        body: {
          specialist: "ANNUAL_PLANNER",
          prompt:
            "Gere meu planejamento estratégico de 12 meses focado em nutrição e vendas. " +
            financialContext +
            " Preserve metas realistas, distribua campanhas de base, pico, recuperação, revisão e aceleração.",
          profile,
          products,
          stream: false,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const text = data?.content || "";
      const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);

      if (!jsonMatch) {
        throw new Error("A IA não retornou um plano anual válido.");
      }

      const generated = JSON.parse(jsonMatch[0]) as Array<Partial<MonthStrategy>>;
      const merged = Array.from({ length: 12 }, (_, index) => {
        const current = strategy?.[index];
        const aiMonth = generated[index] || {};

        return normalizeMonthStrategy(
          {
            ...current,
            theme: aiMonth.theme || current?.theme || "",
            goal: aiMonth.goal || current?.goal || "",
            product_id: aiMonth.product_id || current?.product_id || null,
            hooks: aiMonth.hooks?.length ? aiMonth.hooks : current?.hooks || [],
          },
          index,
        );
      });

      return await saveStrategy(
        merged,
        context,
        "Plano estratégico enriquecido pela IA!",
      );
    } catch (error) {
      console.error("Erro na geração da estratégia:", error);
      toast.error(error instanceof Error ? error.message : "Falha ao gerar estratégia");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    strategy,
    planningInputs,
    isLoading,
    saveStrategy,
    generateWithAI,
    refresh: fetchStrategy,
  };
}
