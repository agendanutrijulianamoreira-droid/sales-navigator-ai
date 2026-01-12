import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Router prompt for the Mentor to decide which specialist should respond
const ROUTER_PROMPT = `Você é o roteador inteligente do sistema. Analise a pergunta da usuária e decida qual especialista deve responder.

ESPECIALISTAS DISPONÍVEIS:
1. BRAND_ARCHITECT - Para perguntas sobre: marca, nicho, posicionamento, diferenciação, identidade visual, arquétipo
2. SOCIAL_MEDIA_MANAGER - Para perguntas sobre: posts, Instagram, conteúdo, carrossel, reels, stories, calendário editorial
3. GROWTH_STRATEGIST - Para perguntas sobre: funis de venda, escada de produtos, estratégia de crescimento, automação
4. MATERIAL_COPYWRITER - Para perguntas sobre: ebooks, PDFs, materiais ricos, iscas digitais, copy de materiais
5. CHALLENGE_COACH - Para perguntas sobre: desafios, gamificação, engajamento, motivação de pacientes
6. VIP_CLOSER - Para perguntas sobre: vendas, mensagens, WhatsApp, fechamento, objeções, DM, conversão
7. CFO_STRATEGIST - Para perguntas sobre: finanças, metas, faturamento, precificação, números, análise
8. MENTOR_ORCHESTRATOR - Para: dúvidas emocionais, insegurança, apoio, perguntas gerais, ou quando não se encaixa em nenhum outro

REGRAS:
- Se a pergunta envolve INSEGURANÇA, MEDO ou EMOÇÃO → MENTOR_ORCHESTRATOR
- Se a pergunta é sobre DINHEIRO ou NÚMEROS → CFO_STRATEGIST
- Se a pergunta é sobre CONTEÚDO ou POSTS → SOCIAL_MEDIA_MANAGER
- Se a pergunta é sobre MENSAGENS DE VENDAS → VIP_CLOSER
- Se a pergunta é sobre MARCA ou NICHO → BRAND_ARCHITECT
- Se a pergunta não se encaixa claramente → MENTOR_ORCHESTRATOR

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
      "COMMAND_CENTER", "BRAND_ARCHITECT", "SOCIAL_MEDIA_MANAGER", 
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
