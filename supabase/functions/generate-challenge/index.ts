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
        const { config, profile } = await req.json();

        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

        const isLovableKey = !!LOVABLE_API_KEY;
        const apiUrl = isLovableKey
            ? "https://ai.gateway.lovable.dev/v1/chat/completions"
            : "https://api.openai.com/v1/chat/completions";
        const apiKey = isLovableKey ? LOVABLE_API_KEY : OPENAI_API_KEY;
        const model = isLovableKey ? "google/gemini-2.0-flash-exp" : "gpt-4o-mini";

        if (!apiKey) throw new Error("API key não configurada");

        const systemPrompt = `ATUE COMO: Coach de Emagrecimento e Especialista em Gamificação para Nutricionistas.
FUNÇÃO: Estruturar Desafios de Engajamento que fidelizam e viralizam.
TOM: Motivador, energético, empático mas firme.
ÉTICA: Persuasão ética. Fazer o paciente agir para o bem dele.
OBJETIVO: Gerar dopamina e comunidade. Vender o próximo passo (mentoria/consulta) no final.

CONTEXTO DA NUTRICIONISTA:
- Nome: ${profile?.nome || "Nutricionista"}
- Nicho: ${profile?.nicho || "Nutrição"}
- Mecanismo Único: ${profile?.mecanismo_unico || "Método personalizado"}
- Promessa: ${profile?.promessa_principal || "Resultado em 90 dias"}

REGRAS:
1. Cada missão diária deve ter: tema, título motivacional, descrição prática, script da manhã (mensagem para engajar), script da noite (check-in e motivação), e pontos de gamificação.
2. Scripts curtos (máx 3 parágrafos cada). Tom de "amiga profissional" que cobra resultado com carinho.
3. Use emojis estratégicos. Não exagere.
4. O último dia SEMPRE deve ter uma oferta para o próximo passo (mentoria/consulta).
5. Inclua uma estratégia de lançamento com 3 stories pré-desafio.
6. Todo texto em Português do Brasil.

TAREFA: Crie um desafio de ${config?.duration || 7} dias sobre "${config?.title || "Hábitos Saudáveis"}".
Pilar/foco: ${config?.pillar || "Emagrecimento"}.
Preço sugerido: R$ ${config?.price || "27"}.

Retorne JSON no formato:
{
  "title": "Nome criativo do desafio",
  "price": numero,
  "launch_strategy": [
    { "day": "D-3", "script": "texto do story de aquecimento" },
    { "day": "D-2", "script": "texto" },
    { "day": "D-1", "script": "texto — escassez e abertura" }
  ],
  "daily_missions": [
    {
      "day": 1,
      "theme": "Tema do dia",
      "title": "Título motivacional",
      "description": "O que fazer hoje",
      "morning_script": "Mensagem da manhã",
      "night_script": "Check-in noturno",
      "mentor_tip": "Dica de bastidor para a nutri",
      "gamification_points": 10
    }
  ]
}`;

        console.log(`[Generate-Challenge] Creating ${config?.duration}-day challenge: ${config?.title}`);

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
                    { role: "user", content: `Gere o desafio completo agora. Tema: "${config?.title}". Duração: ${config?.duration} dias. Foco: ${config?.pillar}.` },
                ],
                temperature: 0.8,
                response_format: { type: "json_object" },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("AI error:", response.status, errorText);
            throw new Error("Erro ao gerar desafio");
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        let parsed;
        try {
            parsed = JSON.parse(content);
        } catch {
            parsed = { title: config?.title, daily_missions: [], launch_strategy: [] };
        }

        return new Response(JSON.stringify(parsed), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (e) {
        console.error("Generate challenge error:", e);
        return new Response(
            JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
