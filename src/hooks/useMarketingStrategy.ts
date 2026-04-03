import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useProfile } from "./useProfile";
import { useProducts } from "./useProducts";

export interface MonthStrategy {
  month: number;
  theme: string;
  goal: string;
  product_id: string | null;
  hooks: string[];
}

export function useMarketingStrategy() {
  const { profile } = useProfile();
  const { products } = useProducts();
  const [strategy, setStrategy] = useState<MonthStrategy[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Carrega a estratégia salva
  const fetchStrategy = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("generations")
        .select("output_content")
        .eq("user_id", user.id)
        .eq("tipo", "annual_marketing_strategy")
        .maybeSingle();

      if (error) throw error;
      if (data?.output_content) {
        setStrategy(data.output_content as unknown as MonthStrategy[]);
      }
    } catch (e) {
      console.error("Erro ao buscar estratégia:", e);
    }
  };

  useEffect(() => {
    fetchStrategy();
  }, []);

  const saveStrategy = async (newStrategy: MonthStrategy[]) => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // UPSERT na generations baseado em user_id e tipo
      // Primeiro tentamos ver se existe
      const { data: existing } = await supabase
        .from("generations")
        .select("id")
        .eq("user_id", user.id)
        .eq("tipo", "annual_marketing_strategy")
        .maybeSingle();

        await supabase
          .from("generations")
          .insert({
            user_id: user.id,
            tipo: "annual_marketing_strategy",
            output_content: JSON.stringify(newStrategy),
            specialist: "ANNUAL_PLANNER",
            input_data: { generated_at: new Date().toISOString() } as any
          });

      setStrategy(newStrategy);
      toast.success("Estratégia salva com sucesso!");
    } catch (e) {
      console.error("Erro ao salvar:", e);
      toast.error("Erro ao salvar estratégia.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateWithAI = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke("ai-specialist", {
        body: {
          specialist: "ANNUAL_PLANNER",
          prompt: "Gere meu planejamento estratégico de 12 meses focado em nutrição e vendas.",
          profile,
          products
        }
      });

      if (error) throw error;

      // O ai-specialist streama a resposta, mas aqui precisamos esperar o final para o JSON
      // Como o invoke não suporta stream nativo de forma simples em hooks sem custom reader:
      // Vamos assumir que recebemos o JSON final (ou tratar o texto)
      const text = data; // Texto bruto retornado
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("IA não retornou plano válido");

      const generatedStrategy = JSON.parse(jsonMatch[0]);
      await saveStrategy(generatedStrategy);
    } catch (e) {
      console.error("Erro ao gerar:", e);
      toast.error("Erro ao gerar estratégia com IA.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    strategy,
    isLoading,
    saveStrategy,
    generateWithAI,
    refresh: fetchStrategy
  };
}
