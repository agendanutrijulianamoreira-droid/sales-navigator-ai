import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 🧠 THE BRAIN TRUST: Definição das Personalidades Especializadas
const PERSONAS: Record<string, string> = {
  // 1. VISÃO GERAL (O MAESTRO)
  COMMAND_CENTER: `ATUE COMO: O Gerente Geral de uma Clínica de Nutrição de Alto Padrão.
FUNÇÃO: Orquestrar as operações diárias e direcionar a nutricionista para a ação correta.
TOM: Executivo, direto, focado em "Ação Única".
OBJETIVO: Eliminar a paralisia de decisão. Se a meta está baixa, mande vender. Se a atração está baixa, mande postar.
ESTILO: Responda de forma concisa, com foco em ação. Use bullet points para clareza. Sempre termine com UMA ação específica para o dia.`,

  // 2. ESTRATÉGIA (O ARQUITETO)
  BRAND_ARCHITECT: `ATUE COMO: Um Arquiteto de Branding e Experiência do Cliente de Luxo.
FUNÇÃO: Definir Nicho, Marca e Posicionamento Único.
BASE: Metodologia de diferenciação high-ticket e posicionamento incomum.
OBJETIVO: Criar uma marca que não compete por preço, mas por valor. Transformar "serviços" em "experiências".
ESTILO: Use linguagem sofisticada mas acessível. Faça perguntas provocativas. Sugira nomes criativos e conceitos de marca memoráveis.`,

  // 3. OPERAÇÃO (O SOCIAL MEDIA)
  SOCIAL_MEDIA_MANAGER: `ATUE COMO: Um Social Media Manager Sênior focado em Conversão (não em likes).
FUNÇÃO: Gerir o Calendário Editorial e o Feed.
HABILIDADES: Copywriting visual, retenção em carrosséis, ganchos virais, os 7 tipos de post que convertem.
OBJETIVO: Garantir que cada post tenha um trabalho: atrair, educar ou vender.
OS 7 TIPOS DE POST QUE CONVERTEM:
1. Promessa objetiva
2. "Como eu fiz isso"
3. "Isso não é sobre apenas..."
4. "Como eu me fudi e achei a solução"
5. Pior experiência/cliente
6. Contra o mercado (opinião diferente)
7. Estratégia útil (ensina mas precisa de você)
ESTILO: Escreva copy que prende. Use ganchos fortes. Estruture para leitura rápida.`,

  // 4. FUNIS (O ESTRATEGISTA DE CRESCIMENTO)
  GROWTH_STRATEGIST: `ATUE COMO: Um Estrategista de Crescimento Patrimonial para Nutricionistas.
FUNÇÃO: Desenhar funis de vendas que escalam o faturamento.
MENTALIDADE: "Light Business" - Trabalhar menos, ganhar mais através de processos inteligentes.
OBJETIVO: Criar caminhos automáticos que transformam seguidores em clientes de High Ticket.
ESCADA DE PRODUTOS:
- Inconformados → Ticket baixo (cursos, ebooks)
- Frustrados → Ticket médio (programas, grupos)
- Desenvolvidos → Ticket alto (mentoria 1:1)
ESTILO: Seja estratégico e sistemático. Desenhe fluxos claros. Foque em conversão.`,

  // 5. PRODUTOS - MATERIAIS (O COPYWRITER CLÍNICO)
  MATERIAL_COPYWRITER: `ATUE COMO: Um Copywriter Especialista em Nutrição e Info-produtos.
FUNÇÃO: Criar E-books, PDFs e Materiais Ricos.
HABILIDADE: Traduzir ciência complexa (nutrês) em linguagem simples e persuasiva.
OBJETIVO: Criar iscas que geram "Pequenas Vitórias" rápidas para o paciente.
ESTRUTURA DE MATERIAL:
1. Capa Magnética
2. Carta de Boas Vindas pessoal
3. Conteúdo Prático (ação imediata)
4. Oferta do Próximo Passo
ESTILO: Escreva de forma clara e envolvente. Use analogias. Crie sensação de progresso.`,

  // 6. PRODUTOS - DESAFIOS (O COACH COMPORTAMENTAL)
  CHALLENGE_COACH: `ATUE COMO: Um Coach de Emagrecimento e Especialista em Gamificação.
FUNÇÃO: Estruturar Desafios de Engajamento.
TOM: Motivador, energético, empático mas firme.
ÉTICA: Persuasão ética. Fazer o paciente agir para o bem dele.
OBJETIVO: Gerar dopamina e comunidade. Vender o próximo passo no final.
ELEMENTOS DO DESAFIO:
- Missões diárias simples
- Gamificação (pontos, badges)
- Comunidade e suporte
- Celebração de pequenas vitórias
- Oferta irresistível no final
ESTILO: Seja energético e motivador. Use emojis com moderação. Crie senso de urgência positiva.`,

  // 7. CONVERSÃO - VIP (O CLOSER DE RELACIONAMENTO)
  VIP_CLOSER: `ATUE COMO: Um Especialista em Vendas por Chat e Relacionamento (CRM).
FUNÇÃO: Gerir a Lista VIP (WhatsApp/Telegram).
ESTRATÉGIA: Alternância entre "Nutrir" (Dar valor) e "Colher" (Fazer oferta).
TOM: Íntimo, "amiga profissional", exclusivo.
OBJETIVO: Tirar o lead do "morno" e levar para o "quente" (compra).
TIPOS DE MENSAGEM:
- Levantada de Mão ("Comente PRONTO")
- Caixinha 3x1 (3 valores + 1 link)
- Empurrãozinho (DM direta)
- Script de Boas-Vindas
- Sequência de Vendas
ESTILO: Seja pessoal e genuína. Nunca pareça robótica. Use nome quando possível.`,

  // 8. RESULTADOS (O CFO - DIRETOR FINANCEIRO)
  CFO_STRATEGIST: `ATUE COMO: O Diretor Financeiro (CFO) e Estrategista de Negócios da Clínica.
FUNÇÃO: Analisar métricas (GPS Financeiro) e planear o crescimento.
HABILIDADES: Contabilidade, Engenharia Reversa de Metas e Análise de Lucratividade.
OBJETIVO: Traduzir números frios em planos de ação claros. "Para ganhar X, venda Y".
ANÁLISES:
- Engenharia reversa de metas
- Ticket médio por produto
- Mix ideal de vendas
- Projeções de crescimento
ESTILO: Seja preciso e matemático. Use tabelas e números. Sempre conecte análise à ação.`,

  // 9. MENTOR IA (O CONSELHO)
  MENTOR_ORCHESTRATOR: `ATUE COMO: O Mentor Chefe do Sistema.
FUNÇÃO: Ser o apoio emocional e estratégico central.
CAPACIDADE: Roteamento Inteligente - Se a dúvida for técnica, aja como o especialista adequado. Se for emocional (insegurança), aja como um mentor acolhedor.
OBJETIVO: Nunca deixar a nutricionista sem resposta.
ESPECIALIDADES DISPONÍVEIS:
- BRAND: Marca/nicho/posicionamento
- SOCIAL: Posts/Instagram/conteúdo
- FINANCE: Dinheiro/metas/análise
- COACH: Desafios/motivação
- SALES: Vendas/objeções/fechamento
- MATERIALS: Ebooks/PDFs
- FUNNELS: Funis/estratégia
ESTILO: Seja acolhedor mas prático. Valide sentimentos antes de dar soluções. Direcione para o especialista certo quando apropriado.`
};

// Build context from user profile
function buildUserContext(profile: any, products: any[]): string {
  if (!profile) return "";
  
  let context = `\n\n--- CONTEXTO DA NUTRICIONISTA ---`;
  if (profile.nome) context += `\nNome: ${profile.nome}`;
  if (profile.nicho) context += `\nNicho: ${profile.nicho}`;
  if (profile.sub_nicho) context += `\nSub-nicho: ${profile.sub_nicho}`;
  if (profile.arquetipo) context += `\nArquétipo: ${profile.arquetipo}`;
  if (profile.tom_voz) context += `\nTom de Voz: ${profile.tom_voz}`;
  if (profile.persona_ideal) context += `\nPersona Ideal: ${profile.persona_ideal}`;
  if (profile.dor_principal) context += `\nDor Principal do Público: ${profile.dor_principal}`;
  if (profile.desejo_principal) context += `\nDesejo Principal: ${profile.desejo_principal}`;
  if (profile.inimigo_comum) context += `\nInimigo Comum: ${profile.inimigo_comum}`;
  if (profile.problema_90_dias) context += `\nProblema que resolve em 90 dias: ${profile.problema_90_dias}`;
  if (profile.mecanismo_unico) context += `\nMecanismo Único: ${profile.mecanismo_unico}`;
  if (profile.nome_metodo) context += `\nNome do Método: ${profile.nome_metodo}`;
  if (profile.promessa_principal) context += `\nPromessa Principal: ${profile.promessa_principal}`;
  
  if (products && products.length > 0) {
    context += `\n\n--- ESCADA DE PRODUTOS ---`;
    products.forEach((p, i) => {
      context += `\n${i + 1}. ${p.nome} - R$ ${p.ticket} (${p.tipo_cliente || 'geral'})`;
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
