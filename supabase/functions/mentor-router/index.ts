import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Router prompt for the Mentor to decide which specialist should respond
const ROUTER_PROMPT = `Você é o roteador inteligente do sistema. Analise a pergunta e decida qual especialista deve responder.

ESPECIALISTAS:
1. AUDIENCE_EXPERT - público-alvo, persona, dores, desejos, linguagem do cliente
2. BRAND_ARCHITECT - marca, nicho, posicionamento, diferenciação, bio do Instagram, perfil
3. SOCIAL_MEDIA_MANAGER - posts, carrosséis, reels, stories, conteúdo viral, calendário
4. HOOKS_COPYWRITER - headlines, hooks, copy, textos persuasivos, chamadas de atenção
5. SALES_PAGE_BUILDER - páginas de vendas, landing pages, VSL, copy de venda
6. VIDEO_SCRIPTWRITER - roteiros de vídeo, reels, YouTube, VSL, scripts falados
7. MINI_TRAINING_BUILDER - mini treinamentos, funis de conteúdo gratuito, iscas digitais
8. GROWTH_STRATEGIST - funis de venda, automação, Manychat, estratégia de crescimento
9. VIP_CLOSER - vendas, DM, WhatsApp, fechamento, objeções, scripts de venda
10. CFO_STRATEGIST - finanças, metas, faturamento, precificação, números
11. MATERIAL_COPYWRITER - ebooks, PDFs, materiais ricos, iscas
12. CHALLENGE_COACH - desafios, gamificação, engajamento
13. MENTOR_ORCHESTRATOR - dúvidas emocionais, insegurança, apoio, perguntas gerais

REGRAS:
- INSEGURANÇA, MEDO, EMOÇÃO → MENTOR_ORCHESTRATOR
- DINHEIRO, NÚMEROS, PRECIFICAÇÃO → CFO_STRATEGIST
- CONTEÚDO, POSTS, REELS → SOCIAL_MEDIA_MANAGER
- HEADLINE, HOOK, COPY CURTA → HOOKS_COPYWRITER
- PÁGINA DE VENDAS, LANDING PAGE → SALES_PAGE_BUILDER
- ROTEIRO VÍDEO, SCRIPT → VIDEO_SCRIPTWRITER
- MINI TREINAMENTO, FUNIL GRATUITO → MINI_TRAINING_BUILDER
- FUNIL, AUTOMAÇÃO, MANYCHAT → GROWTH_STRATEGIST
- MENSAGENS DE VENDAS, DM, WHATSAPP → VIP_CLOSER
- MARCA, NICHO, POSICIONAMENTO → BRAND_ARCHITECT
- PÚBLICO, PERSONA, AVATAR → AUDIENCE_EXPERT
- NÃO SE ENCAIXA → MENTOR_ORCHESTRATOR

Responda APENAS com o nome do especialista em maiúsculas, sem explicação.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`[Mentor-Router] Routing query: ${query.substring(0, 100)}...`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: ROUTER_PROMPT },
          { role: "user", content: query }
        ],
        max_tokens: 50,
      }),
    });

    if (!response.ok) {
      console.error("Router error:", response.status);
      return new Response(JSON.stringify({ specialist: "MENTOR_ORCHESTRATOR" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const specialist = data.choices?.[0]?.message?.content?.trim()?.toUpperCase() || "MENTOR_ORCHESTRATOR";
    
    // Validate specialist name
    const validSpecialists = [
      "COMMAND_CENTER", "AUDIENCE_EXPERT", "BRAND_ARCHITECT", "SOCIAL_MEDIA_MANAGER", 
      "HOOKS_COPYWRITER", "SALES_PAGE_BUILDER", "VIDEO_SCRIPTWRITER", "MINI_TRAINING_BUILDER",
      "GROWTH_STRATEGIST", "MATERIAL_COPYWRITER", "CHALLENGE_COACH",
      "VIP_CLOSER", "CFO_STRATEGIST", "MENTOR_ORCHESTRATOR"
    ];
    
    const finalSpecialist = validSpecialists.includes(specialist) ? specialist : "MENTOR_ORCHESTRATOR";
    
    console.log(`[Mentor-Router] Routed to: ${finalSpecialist}`);

    return new Response(JSON.stringify({ specialist: finalSpecialist }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Mentor router error:", e);
    return new Response(JSON.stringify({ specialist: "MENTOR_ORCHESTRATOR" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
