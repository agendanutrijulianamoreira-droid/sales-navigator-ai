import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Tipos de post baseados na metodologia
const POST_TYPES = {
  PROMESSA: "Promessa objetiva - Um post que faz uma promessa clara e direta ao seu público",
  COMO_FIZ: "Como eu fiz isso - Compartilhe uma conquista/resultado seu",
  NAO_SOBRE: "Isso não é sobre apenas... - Mude a perspectiva do público sobre algo",
  SUPERACAO: "Como eu me fudi e achei a solução - História de superação pessoal",
  PIOR_EXPERIENCIA: "Pior experiência/cliente - Aprendizado de uma situação difícil",
  CONTRA_MERCADO: "Contra o mercado - Opinião controversa mas fundamentada",
  ESTRATEGIA_UTIL: "Estratégia útil - Ensina algo prático mas precisa de você para aprofundar",
  LEVANTADA_MAO: "Levantada de mão - Post que convida para ação (comente X)",
  DOR_EVENTO: "Dor/Evento - Conecta com uma dor ou momento específico do público",
  ALCANCE: "Alcance - Conteúdo viral que atrai novos seguidores",
};

// Estrutura do carrossel com princípios de neuromarketing
const CAROUSEL_STRUCTURE = `
ESTRUTURA NEURO-OTIMIZADA (5-7 slides):
1. CAPA (Gancho 3s): Pattern interrupt + curiosidade. Use uma das técnicas:
   - Contradição ("Pare de beber água em jejum se...")
   - Número específico ("Os 3 erros que travam 87% das pacientes")
   - Pergunta provocativa ("Por que sua dieta sempre falha na 3ª semana?")
   - Loop aberto ("Descobri isso por acidente — e mudou tudo")
2-4. CONTEÚDO (Dopamina + Zeigarnik): cada slide ENTREGA uma micro-recompensa E abre o próximo loop. Termine slides com cliffhangers ("mas tem um detalhe...", "e o pior vem agora...")
5-6. PROVA SOCIAL + AUTORIDADE: caso real, número, transformação. Ative espelhamento neural com narrativa em 1ª pessoa.
7. CTA NEURO: comando direto + benefício imediato + baixo atrito ("Comenta EU QUERO e te mando o passo 1 agora")

PRINCÍPIOS OBRIGATÓRIOS (neuromarketing/neurovendas):
- GANCHO em 3 segundos ou perde a pessoa
- 1 ideia por slide (carga cognitiva baixa)
- Frases curtas (máx 12 palavras). Quebre linha gerando ritmo.
- Linguagem sensorial concreta (cérebro processa imagem, não abstração)
- Gatilhos: curiosidade > escassez > prova social > autoridade > reciprocidade
- Aversão à perda > ganho ("o que você está perdendo ao..." converte mais que "ganhe...")
- Storytelling em 1ª pessoa (neurônios-espelho)
- Ancoragem: contraste entre situação atual x desejada
- Microcopy dopaminérgico: revelações progressivas, nunca entregue tudo no slide 1
- Destaque palavras-emoção em **negrito** (medo, alívio, descoberta, finalmente, segredo)
- Emojis funcionais (1-2 por slide), nunca decorativos
- Cada slide DEVE dar vontade de arrastar para o próximo
- Tom: amiga especialista — autoridade sem distância
- Máx 40-50 palavras por slide
`;

function buildSystemPrompt(profile: any, products: any[]): string {
  let context = `Você é um especialista em copywriting de alta conversão para Instagram, treinado em neuromarketing, neurociência aplicada e neurovendas. Seu trabalho é criar carrosséis que prendem o cérebro do leitor do primeiro ao último slide.

${CAROUSEL_STRUCTURE}

CONTEXTO DA PROFISSIONAL:`;
  
  if (profile?.nome) context += `\n- Nome: ${profile.nome}`;
  if (profile?.nicho) context += `\n- Nicho: ${profile.nicho}`;
  if (profile?.sub_nicho) context += `\n- Sub-nicho: ${profile.sub_nicho}`;
  if (profile?.persona_ideal) context += `\n- Público-alvo: ${profile.persona_ideal}`;
  if (profile?.dor_principal) context += `\n- Dor principal do público: ${profile.dor_principal}`;
  if (profile?.desejo_principal) context += `\n- Desejo principal: ${profile.desejo_principal}`;
  if (profile?.problema_90_dias) context += `\n- Problema que resolve em 90 dias: ${profile.problema_90_dias}`;
  if (profile?.mecanismo_unico) context += `\n- Mecanismo único: ${profile.mecanismo_unico}`;
  if (profile?.nome_metodo) context += `\n- Nome do método: ${profile.nome_metodo}`;
  if (profile?.promessa_principal) context += `\n- Promessa: ${profile.promessa_principal}`;
  if (profile?.tom_voz) context += `\n- Tom de voz: ${profile.tom_voz}`;
  if (profile?.inimigo_comum) context += `\n- Inimigo comum: ${profile.inimigo_comum}`;
  
  if (products && products.length > 0) {
    context += `\n\nPRODUTOS/SERVIÇOS:`;
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
    const { topic, postType, contentPillar, profile, products, customInstructions } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const postTypeDescription = POST_TYPES[postType as keyof typeof POST_TYPES] || postType;
    
    const systemPrompt = buildSystemPrompt(profile, products);
    
    const userPrompt = `Crie um carrossel completo sobre:

TEMA: ${topic}
TIPO DE POST: ${postTypeDescription}
PILAR DE CONTEÚDO: ${contentPillar || "Educativo"}
${customInstructions ? `INSTRUÇÕES ADICIONAIS: ${customInstructions}` : ""}

Retorne no formato JSON com a seguinte estrutura:
{
  "titulo": "Título interno para referência",
  "slides": [
    {
      "numero": 1,
      "tipo": "capa",
      "headline": "Texto principal do slide",
      "subtexto": "Texto secundário (opcional)",
      "destaque": "Palavra ou frase para destacar visualmente"
    }
  ],
  "legenda": "Legenda completa para o post do Instagram (com hashtags)",
  "cta_stories": "Sugestão de texto para stories promovendo o post"
}

IMPORTANTE: Retorne APENAS o JSON, sem markdown ou texto adicional.`;

    console.log(`[Generate-Carousel] Creating ${postType} carousel about: ${topic}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
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
      throw new Error("Erro ao conectar com a IA");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("Resposta vazia da IA");
    }

    // Parse the JSON from the response
    let carouselData;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      carouselData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse carousel JSON:", content);
      throw new Error("Erro ao processar resposta da IA");
    }

    return new Response(JSON.stringify(carouselData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Generate carousel error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
