import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

// ── Task Definitions ──
export interface ChecklistTask {
  key: string;
  label: string;
  description: string;
  actionUrl?: string;
  steps?: string[];
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
      { 
        key: "f1_google_business", 
        label: "Otimizar Google Meu Negócio", 
        description: "Informações completas, fotos de qualidade e resposta a avaliações",
        steps: [
          "Validar endereço e horários de funcionamento",
          "Subir 5+ fotos profissionais do espaço e equipe",
          "Responder a todas as avaliações com atenção"
        ]
      },
      { 
        key: "f1_instagram_profile", 
        label: "Otimizar perfil do Instagram", 
        description: "Foto profissional, bio clara com link WhatsApp, destaques estratégicos", 
        actionUrl: "/brand-hub",
        steps: [
          "Foto de perfil de alta qualidade (rosto amigável)",
          "Bio direta com promessa clara",
          "Link Tree ou WhatsApp direto no perfil"
        ]
      },
      { 
        key: "f1_build_offer", 
        label: "Construir oferta de acompanhamento", 
        description: "Transição de consulta avulsa para planos trimestrais/semestrais", 
        actionUrl: "/business-lab",
        steps: [
          "Definir pacote de acompanhamento (consultas + suporte)",
          "Estipular preço premium condizente com o valor",
          "Criar material visual de apresentação da oferta"
        ]
      },
      { 
        key: "f1_delivery_10", 
        label: "Estruturar Entrega 10/10", 
        description: "Roteiro de consulta, suporte proativo e experiência do cliente",
        steps: [
          "Mimo surpresa para novos pacientes",
          "Script de acolhimento na primeira consulta",
          "Check-in proativo no dia 7 após consulta"
        ]
      },
      { 
        key: "f1_brand_identity", 
        label: "Definir identidade visual e tom de voz", 
        description: "Cores, fontes, arquétipo e voz da marca", 
        actionUrl: "/brand-hub",
        steps: [
          "Definir paleta de 3 cores principais",
          "Escolher 2 fontes que transmitam sua autoridade",
          "Criar logo ou assinatura visual simples"
        ]
      },
      { 
        key: "f1_product_ladder", 
        label: "Cadastrar produtos na escada de valor", 
        description: "Isca, entrada, core e premium definidos", 
        actionUrl: "/business-lab",
        steps: [
          "Criar Isca Digital (e-book, aula curta)",
          "Definir Produto de Entrada (check-up rápido)",
          "Estruturar Produto Core (acompanhamento)"
        ]
      },
    ],
  },
  {
    fase: 2,
    title: "Ação",
    subtitle: "Tração e vendas",
    emoji: "🚀",
    tasks: [
      { 
        key: "f2_sales_script", 
        label: "Implementar script de vendas", 
        description: "Saudação → Situação → Identificação → Solução → Oferta", 
        actionUrl: "/conversion",
        steps: [
          "Fase de conexão e empatia inicial",
          "Sondagem profunda das dores do paciente",
          "Apresentação da solução com foco no benefício"
        ]
      },
      { 
        key: "f2_lead_recovery", 
        label: "Criar rotina de recuperação de leads", 
        description: "Reabordar contatos que não fecharam",
        steps: [
          "Listar contatos que orçaram mas não fecharam",
          "Abordagem de 'motivo do sumiço' (suave)",
          "Oferta de transição ou última chamada"
        ]
      },
      { 
        key: "f2_referral_program", 
        label: "Ativar programa de indicação", 
        description: "Transformar pacientes satisfeitos em vendedores",
        steps: [
          "Bônus ou desconto na renovação por indicação",
          "Aviso visual no consultório sobre indicações",
          "Mencionar benefício de indicação no fim da consulta"
        ]
      },
      { 
        key: "f2_social_selling", 
        label: "Iniciar Social Selling nos stories", 
        description: "Levantadas de mão e enquetes estratégicas", 
        actionUrl: "/carousel-creator",
        steps: [
          "Postar enquetes de 'Qual seu maior desafio?'",
          "Interagir com as respostas via Direct",
          "Fazer oferta direta para os interessados"
        ]
      },
      { 
        key: "f2_first_content", 
        label: "Criar primeiros conteúdos vendedores", 
        description: "Posts que geram desejo e autoridade", 
        actionUrl: "/carousel-creator",
        steps: [
          "Post 1: Educativo (quebrando mito)",
          "Post 2: Prova Social (depoimento/resultado)",
          "Post 3: Autoridade (estudo de caso)"
        ]
      },
      { 
        key: "f2_financial_control", 
        label: "Começar controle financeiro real", 
        description: "Registrar receitas e despesas no Painel Financeiro", 
        actionUrl: "/business-lab",
        steps: [
          "Criar conta exclusiva para o consultório",
          "Separar PF de PJ rigorosamente",
          "Lançar toda entrada e saída diariamente"
        ]
      },
    ],
  },
  {
    fase: 3,
    title: "Consolidação",
    subtitle: "Eficiência e equipe",
    emoji: "⚡",
    tasks: [
      { 
        key: "f3_squad", 
        label: "Montar equipe mínima viável", 
        description: "Assistente/estagiário para delegar tarefas operacionais",
        steps: [
          "Estagiário/Secretária para agendamentos",
          "Delegar gestão de redes sociais básica",
          "Liberar 20% do seu tempo para estratégia"
        ]
      },
      { 
        key: "f3_retention", 
        label: "Implementar gestão de retenção", 
        description: "Plano de tratamento e ofertas de renovação",
        steps: [
          "Pesquisa de satisfação trimestral",
          "Newsletter ou grupo de avisos mensais",
          "Brinde de aniversário para o paciente"
        ]
      },
      { 
        key: "f3_support_routine", 
        label: "Organizar rotina de suporte", 
        description: "Suporte reativo (seg-sex) e proativo (dia fixo de feedbacks)",
        steps: [
          "Horário fixo para responder dúvidas no WhatsApp",
          "Canal oficial de suporte (ex: e-mail ou grupo)",
          "Templates de respostas rápidas padrão"
        ]
      },
      { 
        key: "f3_group_challenge", 
        label: "Executar primeiro desafio em grupo", 
        description: "Engajamento + captação via gamificação", 
        actionUrl: "/challenge-creator",
        steps: [
          "Definir tema impactante (ex: 7 dias detox)",
          "Valor de ticket baixo para atrair novos leads",
          "Grupo fechado com gamificação e prêmios"
        ]
      },
      { 
        key: "f3_paid_traffic", 
        label: "Iniciar tráfego pago nível 2", 
        description: "Investimento em Google/Instagram Ads",
        steps: [
          "Impulsionar posts de melhor desempenho",
          "Criar anúncio focado no Direct/WhatsApp",
          "Analisar custo por lead e otimizar ativos"
        ]
      },
    ],
  },
  {
    fase: 4,
    title: "Expansão",
    subtitle: "Escala",
    emoji: "👑",
    tasks: [
      { 
        key: "f4_digital_products", 
        label: "Criar produtos digitais", 
        description: "E-books, cursos gravados ou materiais complementares",
        steps: [
          "E-book pago de receitas práticas",
          "Minicurso gravado sobre organização",
          "Materiais de apoio editáveis para pacientes"
        ]
      },
      { 
        key: "f4_funnel_stack", 
        label: "Empilhar funis de captação", 
        description: "Indicação + Social + Conteúdo + Tráfego ativos simultaneamente", 
        actionUrl: "/funnels",
        steps: [
          "Tráfego Pago → Isca → Venda de entrada",
          "Orgânico → Stories → Direct",
          "Indicação → Acompanhamento Core"
        ]
      },
      { 
        key: "f4_hire_nutri", 
        label: "Contratar outro nutricionista", 
        description: "Atender sob sua metodologia para escalar receita",
        steps: [
          "Nutricionista júnior alinhado aos valores",
          "Treinamento completo na sua metodologia",
          "Divisão de agenda para capilarizar demanda"
        ]
      },
      { 
        key: "f4_brand_rituals", 
        label: "Criar rituais de marca", 
        description: "Newsletter, encontros ao vivo e mimos que geram pertencimento",
        steps: [
          "Café com a Nutri (encontro online mensal)",
          "Cartão de fidelidade ou selos de conquista",
          "Evento anual presencial para pacientes VIP"
        ]
      },
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
      const { data, error } = await supabase
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
        await supabase
          .from("implementation_checklist")
          .delete()
          .eq("user_id", user.id)
          .eq("task_key", taskKey);
      } else {
        await supabase
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
