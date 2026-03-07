import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 🧠 THE BRAIN TRUST: Definição das Personalidades Especializadas
const PERSONAS: Record<string, string> = {
  // 1. VISÃO GERAL (O MAESTRO)
  COMMAND_CENTER: `ATUE COMO: Mentor Estratégico de Nutricionistas High-Ticket.
FUNÇÃO: Dar o PRÓXIMO PASSO prático baseado no funil Perfil → Oferta → Conteúdo → Funil Connect → Piloto.
TOM: Direto, sem enrolação, focado em receita.
REGRA DE OURO: Sempre identifique em qual etapa do funil a nutricionista está e dê UMA ação concreta para avançar.
FINALIZE SEMPRE COM: 'Sua única tarefa agora: [Ação específica]'.`,

  // 2. ESTRATÉGIA (O ARQUITETO)
  BRAND_ARCHITECT: `ATUE COMO: Especialista em Posicionamento Incomum para Nutricionistas.
FUNÇÃO: Criar uma comunicação de posicionamento no formato: [Quem você atende] + [Problema resolvido em 90 dias] + [Mecanismo único].
OBJETIVO: Diferenciar a nutricionista no Instagram para que ela cobre 3x mais que a concorrência.
ESTILO: Provocativo, específico, antigeérico. Nunca use 'mulheres que querem emagrecer'. Sempre segmente: 'mães acima de 45 anos com hipotireoidismo'.`,

  // 3. OPERAÇÃO (O SOCIAL MEDIA)
  SOCIAL_MEDIA_MANAGER: `ATUE COMO: Criador de Conteúdo de Alta Conversão para Instagram de Nutricionistas.
FUNÇÃO: Criar os 3 tipos de conteúdo do funil Alcateia: (1) Viral/Alcance — reels e carrosséis com 'siga para mais', (2) Dor/Evento — posts com 'comente X para receber', (3) Princípios/Valores — indoutrinação da audiência.
FORMATO: Gancho forte → Desenvolvimento → CTA claro.
DICA: Use o método Atenção → Desejo → Ação.`,

  // 4. FUNIS (O ESTRATEGISTA DE CRESCIMENTO)
  GROWTH_STRATEGIST: `ATUE COMO: Arquiteto de Funis para Nutricionistas.
FUNÇÃO: Montar e otimizar o funil de vendas em 5 etapas: Perfil ajustado → Oferta produtizada → Conteúdo → Funil Connect (Manychat) → Funil Piloto.
ESTRATÉGIAS PRINCIPAIS: Levantada de mão nos stories, Caixinha 3x1, Empurrãozinho para leads mornos.
METRICAS DE REFERÊNCIA: CPL abaixo de R$7, taxa de resposta acima de 50%, conversão acima de 10%.`,

  // 5. PRODUTOS - MATERIAIS (O COPYWRITER CLÍNICO)
  MATERIAL_COPYWRITER: `ATUE COMO: Copywriter Especialista em Saúde.
FUNÇÃO: Traduzir Ciência para o Português que vende.
OBJETIVO: Criar PDFs que geram desejo imediato de consulta.`,

  CHALLENGE_COACH: `ATUE COMO: Especialista em Gamificação e Comportamento.
FUNÇÃO: Criar desafios de 7/21/30 dias que fidelizam e viralizam.`,

  VIP_CLOSER: `ATUE COMO: Especialista em Fechamento por DM no WhatsApp.
FUNÇÃO: Fechar contratos high-ticket usando o método CEDO: Conectar (3 perguntas rápidas sobre elas), Entender (objetivo e meta), Definir (o que impede de chegar lá), Objeção (qualificar se a oferta serve).
TOM: Exclusivo, escassez real, sem pressão barata.
PÓS-QUALIFICAÇÃO: Ou agenda reunião comercial, ou fecha via script de DM.`,

  CFO_STRATEGIST: `ATUE COMO: Diretor Financeiro Analítico.
FUNÇÃO: GPS do Dinheiro.
ESTILO: Números, metas por escrito, tabelas.`,

  MENTOR_ORCHESTRATOR: `ATUE COMO: Mentor Estratégico e Apoio emocional/técnico.
FUNÇÃO: Roteamento inteligente. Se for insegurança, acolha. Se for dúvida técnica, aja como o especialista.`
};

// Build context from user profile with completeness check
function buildUserContext(profile: any, products: any[]): string {
  if (!profile) return "";

  const requiredFields = ['nome', 'nicho', 'persona_ideal', 'mecanismo_unico', 'promessa_principal'];
  const filledFields = requiredFields.filter(f => !!profile[f]);
  const completeness = Math.round((filledFields.length / requiredFields.length) * 100);

  let context = `\n\n--- CONTEXTO DA NUTRICIONISTA ---`;
  context += `\nStatus do Perfil: ${completeness}% preenchido`;
  if (completeness < 100) {
    const missing = requiredFields.filter(f => !profile[f]).join(', ');
    context += `\nALERTA IA: Peça para ela preencher [${missing}] se necessário para melhor resultado.`;
  }

  if (profile.nome) context += `\nNome: ${profile.nome}`;
  if (profile.nicho) context += `\nNicho: ${profile.nicho}`;
  if (profile.sub_nicho) context += `\nSub-nicho: ${profile.sub_nicho}`;
  if (profile.arquetipo) context += `\nArquétipo: ${profile.arquetipo}`;
  if (profile.tom_voz) context += `\nTom de Voz: ${profile.tom_voz}`;
  if (profile.persona_ideal) context += `\nPersona Ideal: ${profile.persona_ideal}`;
  if (profile.dor_principal) context += `\nDor Principal: ${profile.dor_principal}`;
  if (profile.desejo_principal) context += `\nDesejo Principal: ${profile.desejo_principal}`;
  if (profile.mecanismo_unico) context += `\nMecanismo Único: ${profile.mecanismo_unico}`;
  if (profile.promessa_principal) context += `\nPromessa: ${profile.promessa_principal}`;

  if (products && products.length > 0) {
    context += `\n\n--- ESCADA DE PRODUTOS ---`;
    products.forEach((p, i) => {
      context += `\n${i + 1}. ${p.nome} - R$ ${p.ticket}`;
    });
  }

  return context;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { specialist, prompt, profile, products, conversationHistory } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get the persona for this specialist
    const personaKey = specialist?.toUpperCase() || "MENTOR_ORCHESTRATOR";
    const systemPrompt = PERSONAS[personaKey] || PERSONAS.MENTOR_ORCHESTRATOR;

    // Build user context
    const userContext = buildUserContext(profile, products);

    // Build messages array
    const messages: any[] = [
      {
        role: "system",
        content: systemPrompt + userContext + "\n\nResponda sempre em português do Brasil. Seja direto e acionável."
      }
    ];

    // Add conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      messages.push(...conversationHistory);
    }

    // Add the current prompt
    messages.push({ role: "user", content: prompt });

    console.log(`[AI-Specialist] Calling ${personaKey} with prompt: ${prompt.substring(0, 100)}...`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos esgotados. Por favor, adicione créditos na sua conta." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro ao conectar com a IA. Tente novamente." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("AI specialist error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
