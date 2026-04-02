import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

// ── Task Definitions (Operação 26) ──
export interface ChecklistTask {
  key: string;
  label: string;
  description: string;
  actionUrl?: string;
}

export interface ChecklistPhase {
  fase: number;
  title: string;
  subtitle: string;
  emoji: string;
  tasks: ChecklistTask[];
}

export const IMPLEMENTATION_PHASES: ChecklistPhase[] = [
  {
    fase: 1,
    title: "Preparação",
    subtitle: "Arrume a casa",
    emoji: "🏗️",
    tasks: [
      { key: "f1_google_business", label: "Otimizar Google Meu Negócio", description: "Informações completas, fotos de qualidade e resposta a avaliações" },
      { key: "f1_instagram_profile", label: "Otimizar perfil do Instagram", description: "Foto profissional, bio clara com link WhatsApp, destaques estratégicos", actionUrl: "/brand-hub" },
      { key: "f1_build_offer", label: "Construir oferta de acompanhamento", description: "Transição de consulta avulsa para planos trimestrais/semestrais", actionUrl: "/business-lab" },
      { key: "f1_delivery_10", label: "Estruturar Entrega 10/10", description: "Roteiro de consulta, suporte proativo e experiência do cliente" },
      { key: "f1_brand_identity", label: "Definir identidade visual e tom de voz", description: "Cores, fontes, arquétipo e voz da marca", actionUrl: "/brand-hub" },
      { key: "f1_product_ladder", label: "Cadastrar produtos na escada de valor", description: "Isca, entrada, core e premium definidos", actionUrl: "/business-lab" },
    ],
  },
  {
    fase: 2,
    title: "Ação",
    subtitle: "Tração e vendas",
    emoji: "🚀",
    tasks: [
      { key: "f2_sales_script", label: "Implementar script de vendas", description: "Saudação → Situação → Identificação → Solução → Oferta", actionUrl: "/conversion" },
      { key: "f2_lead_recovery", label: "Criar rotina de recuperação de leads", description: "Reabordar contatos que não fecharam" },
      { key: "f2_referral_program", label: "Ativar programa de indicação", description: "Transformar pacientes satisfeitos em vendedores" },
      { key: "f2_social_selling", label: "Iniciar Social Selling nos stories", description: "Levantadas de mão e enquetes estratégicas", actionUrl: "/carousel-creator" },
      { key: "f2_first_content", label: "Criar primeiros conteúdos vendedores", description: "Posts que geram desejo e autoridade", actionUrl: "/carousel-creator" },
      { key: "f2_financial_control", label: "Começar controle financeiro real", description: "Registrar receitas e despesas no Painel Financeiro", actionUrl: "/business-lab" },
    ],
  },
  {
    fase: 3,
    title: "Consolidação",
    subtitle: "Eficiência e equipe",
    emoji: "⚡",
    tasks: [
      { key: "f3_squad", label: "Montar equipe mínima viável", description: "Assistente/estagiário para delegar tarefas operacionais" },
      { key: "f3_retention", label: "Implementar gestão de retenção", description: "Plano de tratamento e ofertas de renovação" },
      { key: "f3_support_routine", label: "Organizar rotina de suporte", description: "Suporte reativo (seg-sex) e proativo (dia fixo de feedbacks)" },
      { key: "f3_group_challenge", label: "Executar primeiro desafio em grupo", description: "Engajamento + captação via gamificação", actionUrl: "/challenge-creator" },
      { key: "f3_paid_traffic", label: "Iniciar tráfego pago nível 2", description: "Investimento em Google/Instagram Ads" },
    ],
  },
  {
    fase: 4,
    title: "Expansão",
    subtitle: "Escala",
    emoji: "👑",
    tasks: [
      { key: "f4_digital_products", label: "Criar produtos digitais", description: "E-books, cursos gravados ou materiais complementares" },
      { key: "f4_funnel_stack", label: "Empilhar funis de captação", description: "Indicação + Social + Conteúdo + Tráfego ativos simultaneamente", actionUrl: "/funnels" },
      { key: "f4_hire_nutri", label: "Contratar outro nutricionista", description: "Atender sob sua metodologia para escalar receita" },
      { key: "f4_brand_rituals", label: "Criar rituais de marca", description: "Newsletter, encontros ao vivo e mimos que geram pertencimento" },
    ],
  },
];

export const ALL_TASKS = IMPLEMENTATION_PHASES.flatMap(p => p.tasks.map(t => ({ ...t, fase: p.fase })));

// ── Hook ──
export function useImplementationChecklist() {
  const { user } = useAuth();
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchChecklist = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const { data, error } = await (supabase as any)
        .from("implementation_checklist")
        .select("task_key")
        .eq("user_id", user.id)
        .eq("completed", true);
      if (error) throw error;
      setCompletedTasks(new Set((data || []).map(d => d.task_key)));
    } catch (err) {
      console.error("Error fetching checklist:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchChecklist(); }, [fetchChecklist]);

  const toggleTask = useCallback(async (taskKey: string, fase: number) => {
    if (!user) return;
    const isCompleted = completedTasks.has(taskKey);

    // Optimistic update
    setCompletedTasks(prev => {
      const next = new Set(prev);
      if (isCompleted) next.delete(taskKey);
      else next.add(taskKey);
      return next;
    });

    try {
      if (isCompleted) {
        await (supabase as any)
          .from("implementation_checklist")
          .delete()
          .eq("user_id", user.id)
          .eq("task_key", taskKey);
      } else {
        await (supabase as any)
          .from("implementation_checklist")
          .upsert({
            user_id: user.id,
            task_key: taskKey,
            fase,
            completed: true,
            completed_at: new Date().toISOString(),
          });
      }
    } catch (err) {
      console.error("Error toggling task:", err);
      // Revert on error
      fetchChecklist();
    }
  }, [user, completedTasks, fetchChecklist]);

  // ── Computed stats ──
  const stats = useMemo(() => {
    const totalTasks = ALL_TASKS.length;
    const completedCount = completedTasks.size;
    const overallProgress = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

    const phaseStats = IMPLEMENTATION_PHASES.map(phase => {
      const phaseTasks = phase.tasks.length;
      const phaseCompleted = phase.tasks.filter(t => completedTasks.has(t.key)).length;
      const phaseProgress = phaseTasks > 0 ? Math.round((phaseCompleted / phaseTasks) * 100) : 0;
      return { fase: phase.fase, total: phaseTasks, completed: phaseCompleted, progress: phaseProgress };
    });

    // Current phase = first phase not 100%
    const currentPhase = phaseStats.find(p => p.progress < 100)?.fase || 4;

    return { totalTasks, completedCount, overallProgress, phaseStats, currentPhase };
  }, [completedTasks]);

  return { completedTasks, loading, toggleTask, stats, phases: IMPLEMENTATION_PHASES };
}
