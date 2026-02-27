import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { profile, products } = await req.json();

        const nicho = profile?.nicho || "nutrição";
        const subNicho = profile?.sub_nicho || "";
        const dorPrincipal = profile?.dor_principal || "";
        const promessa = profile?.promessa_principal || "";
        const tomVoz = profile?.tom_voz || "empático";

        const systemPrompt = `Você é o VIRAL MASTER — um especialista em viralização e tendências para o Instagram, focado no nicho de ${nicho}.

CONTEXTO DO PROFISSIONAL:
- Nicho: ${nicho} ${subNicho ? `/ ${subNicho}` : ""}
- Dor principal: ${dorPrincipal}
- Promessa: ${promessa}
- Tom de voz: ${tomVoz}

SUA MISSÃO:
Gere 6 sugestões de conteúdo de alto impacto voltadas para viralização e tendências atuais.
Divida em duas categorias:
1. "Em Alta": Temas que estão sendo muito comentados agora no nicho.
2. "Viral": Ideias com ganchos (hooks) fortes voltadas para compartilhamento.

REGRAS:
- Seja extremamente específico. Use termos técnicos do nicho interpretados de forma impactante.
- Cada ideia deve ter um "Gancho" (o que aparece nos primeiros 3 segundos).
- Cada ideia deve ter uma "Sugestão de Formato" (Reels, Carrossel, etc).

Retorne APENAS um JSON array válido.
Formato:
[
  {
    "categoria": "Em Alta" | "Viral",
    "titulo": "Título Curto",
    "trend": "Qual a tendência ou tema",
    "hook": "O gancho inicial (headline)",
    "tipo": "reels" | "carrossel" | "post_unico",
    "descricao": "Breve explicação do porquê isso vai funcionar"
  }
]`;

        const apiKey = Deno.env.get("LOVABLE_API_KEY");
        if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash", // Using a fast, modern model
                messages: [
                    { role: "system", content: systemPrompt },
                    {
                        role: "user",
                        content: `Analise as tendências para o nicho ${nicho} e gere 6 ideias virais. Retorne APENAS o JSON.`,
                    },
                ],
                temperature: 0.9,
            }),
        });

        if (!response.ok) {
            throw new Error("Erro na API de IA");
        }

        const aiData = await response.json();
        const content = aiData.choices?.[0]?.message?.content || "";

        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error("IA não retornou JSON válido");

        return new Response(jsonMatch[0], {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Erro interno";
        return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
