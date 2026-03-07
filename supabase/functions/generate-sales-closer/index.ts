import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PERSONAS = {
    SALES_CLOSER_ELITE: `ATUE COMO: Mentor Senior de Vendas High-Ticket para Nutricionistas.
FUNÇÃO: Criar argumentos irrebatíveis, quebrar objeções e estruturar ofertas de alto valor.
MENTALIDADE: "Venda é ajuda". Se o cliente não compra, ele continua com o problema.
HABILIDADES: Escuta empática, reversão de objeções de preço/tempo, ancoragem de valor superior.
PROTOCOLO: Papel de autoridade, mas acolhedora. Fale como quem já viu centenas de casos e sabe o caminho.`,
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { type, data, profile } = await req.json();

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

        let systemPrompt = `${PERSONAS.SALES_CLOSER_ELITE}

CONTEXTO DA NUTRICIONISTA:
- Nome: ${profile?.nome || "Nutricionista"}
- Nicho: ${profile?.nicho || "Nutrição"}
- Método: ${profile?.nome_metodo || "Método Personalizado"}
- Promessa: ${profile?.promessa_principal || "Resultado"}

REGRAS:
1. Nunca peça desculpas pelo preço. O preço é o reflexo do valor.
2. Use a técnica de "Isolamento de Objeção".
3. Tom elegante, direto e profissional.
4. Responda em Português do Brasil.`;

        let userPrompt = "";

        if (type === "breaking_objection") {
            userPrompt = `TIPO: Quebra de Objeção Complexa
OBJECÃO DO CLIENTE: "${data.objection}"
CONTEXTO: ${data.context || "Lead em fechamento de mentoria"}

Tarefa: Gere uma resposta persuasiva para Direct ou WhatsApp que:
1. Valide o sentimento do cliente.
2. Inverta a lógica da objeção.
3. Chame para a decisão/próximo passo.
Retorne um JSON com: { "response": "texto da resposta" }`;
        } else if (type === "follow_up_elite") {
            userPrompt = `TIPO: Follow-up de Elite (Última Chamada)
SITUAÇÃO: Lead sumiu ou disse que "ia pensar" há 24h.

Tarefa: Gere uma mensagem curta e poderosa para "limpar o terreno" ou fechar a venda agora.
Retorne um JSON com: { "response": "texto da mensagem" }`;
        } else {
            userPrompt = `TIPO: Refinamento de Proposta High Ticket
DADOS: ${JSON.stringify(data)}

Tarefa: Refine os argumentos de venda desta proposta para torná-la mais irresistível.
Retorne um JSON com: { "response": "texto refinado" }`;
        }

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
                temperature: 0.7,
                response_format: { type: "json_object" },
            }),
        });

        if (!response.ok) throw new Error("Erro na chamada da IA");

        const result = await response.json();
        const content = result.choices?.[0]?.message?.content;

        return new Response(content, {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (e) {
        return new Response(
            JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
