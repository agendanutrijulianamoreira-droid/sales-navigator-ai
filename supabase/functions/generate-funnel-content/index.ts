import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PERSONAS = {
    GROWTH_STRATEGIST: `ATUE COMO: Arquiteto de Funis de Vendas para Nutricionistas High-Ticket.
FUNÇÃO: Gerar roteiros e scripts para funis de vendas que convertem seguidores em clientes.
MENTALIDADE: "Light Business" — menos volume, mais conversão. Um funil, uma oferta.
HABILIDADE: Copywriting persuasivo, escassez real, CTAs de ação imediata.
OBJETIVO: Criar caminhos que transformam seguidores em clientes de High Ticket.`,

    SOCIAL_MEDIA_MANAGER: `ATUE COMO: Social Media Manager Sênior focado em Conversão.
FUNÇÃO: Criar conteúdo que vende sem parecer que está vendendo.
HABILIDADES: Copywriting visual, retenção em carrosséis, ganchos virais.
PROTOCOLO ANTI-ROBÔ:
- 🚫 NUNCA comece com "Olá pessoal", "No post de hoje".
- 🚫 NUNCA use linguagem acadêmica fria.
- 🚫 NUNCA termine com "Gostou? Curte e compartilha". Use CTAs de conversão.`,
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { blueprint, answers, profile, format } = await req.json();

        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

        const isLovableKey = !!LOVABLE_API_KEY;
        const apiUrl = isLovableKey
            ? "https://ai.gateway.lovable.dev/v1/chat/completions"
            : "https://api.openai.com/v1/chat/completions";
        const apiKey = isLovableKey ? LOVABLE_API_KEY : OPENAI_API_KEY;
        const model = isLovableKey ? "google/gemini-2.0-flash-exp" : "gpt-4o-mini";

        if (!apiKey) {
            throw new Error("API key não configurada");
        }

        const outputFormat = format || blueprint?.outputFormat || "roteiro_stories";

        let formatInstructions = "";
        if (outputFormat === "roteiro_stories") {
            formatInstructions = `Retorne um JSON com: { "parts": [ { "title": "Story 1", "script": "texto do story" }, ... ] }
Gere entre 5 a 8 stories sequenciais. Cada story deve ter máximo 3 frases. Use CTAs conversacionais.`;
        } else if (outputFormat === "script_whatsapp") {
            formatInstructions = `Retorne um JSON com: { "parts": [ { "title": "Mensagem 1 - Abertura", "script": "texto da mensagem" }, ... ] }
Gere entre 3 a 5 mensagens de WhatsApp sequenciais. Tom íntimo, exclusivo, "amiga profissional".`;
        } else {
            formatInstructions = `Retorne um JSON com: { "parts": [ { "title": "Slide 1 - Capa", "script": "texto do slide" }, ... ] }
Gere entre 5 a 7 slides de carrossel. Gancho forte na capa, desenvolvimento persuasivo, CTA no final.`;
        }

        const answersText = Object.entries(answers || {})
            .map(([key, val]) => `${key}: ${val}`)
            .join("\n");

        const systemPrompt = `${PERSONAS.GROWTH_STRATEGIST}

${PERSONAS.SOCIAL_MEDIA_MANAGER}

CONTEXTO DA NUTRICIONISTA:
- Nome: ${profile?.nome || "Nutricionista"}
- Nicho: ${profile?.nicho || "Nutrição"}
- Mecanismo Único: ${profile?.mecanismo_unico || "Método personalizado"}
- Dor Principal do Público: ${profile?.dor_principal || "Não informada"}
- Desejo Principal: ${profile?.desejo_principal || "Não informado"}
- Promessa: ${profile?.promessa_principal || "Resultado em 90 dias"}

REGRAS DE ESCRITA:
1. Use metáforas e analogias do dia a dia.
2. Tom autoral, firme e empático. Fale como uma profissional que domina o assunto.
3. Comece cada peça com um GANCHO que prende atenção nos primeiros 3 segundos.
4. Termine com CTA de ação direta (ex: "Comente X", "Envie DM com Y").
5. NUNCA seja genérica. Use dados específicos do contexto acima.
6. Todo texto em Português do Brasil.`;

        const userPrompt = `FUNIL: "${blueprint?.title || "Funil de vendas"}"
DESCRIÇÃO: ${blueprint?.description || ""}
PROMESSA: ${blueprint?.promise || ""}

RESPOSTAS DA NUTRICIONISTA:
${answersText}

${formatInstructions}

Gere agora o conteúdo completo para este funil. Seja específica, persuasiva e estratégica.`;

        console.log(`[Generate-Funnel] Generating ${outputFormat} for: ${blueprint?.title}`);

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                temperature: 0.8,
                response_format: { type: "json_object" },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("AI error:", response.status, errorText);
            throw new Error("Erro ao gerar conteúdo do funil");
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        let parsed;
        try {
            parsed = JSON.parse(content);
        } catch {
            parsed = { parts: [{ title: "Conteúdo Gerado", script: content }] };
        }

        return new Response(JSON.stringify(parsed), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (e) {
        console.error("Generate funnel error:", e);
        return new Response(
            JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
