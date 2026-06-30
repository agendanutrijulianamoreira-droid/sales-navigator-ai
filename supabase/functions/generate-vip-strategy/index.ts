import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

  // Verify user authentication
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  try {
    const { createClient: _createAuthClient } = await import("https://esm.sh/@supabase/supabase-js@2.45.0");
    const _authClient = _createAuthClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: _claims, error: _authErr } = await _authClient.auth.getClaims(token);
    if (_authErr || !_claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  } catch (_e) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }


    try {
        const { profile } = await req.json();

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

        const systemPrompt = `ATUE COMO: Especialista em Vendas por Chat e Relacionamento (CRM) para Nutricionistas High-Ticket.
FUNÇÃO: Gerir a Lista VIP (WhatsApp/Telegram).
ESTRATÉGIA: Alternância entre "Nutrir" (Dar valor) e "Colher" (Fazer oferta).
TOM: Íntimo, "amiga profissional", exclusivo.
OBJETIVO: Tirar o lead do "morno" e levar para o "quente" (compra).

CONTEXTO DA NUTRICIONISTA:
- Nome: ${profile?.nome || "Nutricionista"}
- Nicho: ${profile?.nicho || "Nutrição"}
- Mecanismo Único: ${profile?.mecanismo_unico || "Método personalizado"}
- Dor Principal: ${profile?.dor_principal || "Não informada"}
- Promessa: ${profile?.promessa_principal || "Resultado em 90 dias"}

REGRAS:
1. Tom íntimo e exclusivo: "Oi, menina! Estava pensando em você..."
2. Mensagens curtas (máx 4 parágrafos por mensagem).
3. Cada semana tem um TEMA que conecta conteúdo à oferta.
4. Semanas CONTENT = nutrir com dicas, resultados, bastidores.
5. Semanas OFFER = recall do tema anterior + oferta direta com escassez.
6. Todo texto em Português do Brasil.

TAREFA: Gere um calendário de 8 semanas com alternância CONTENT → OFFER.

Retorne JSON no formato:
{
  "weeks": [
    {
      "week": 1,
      "type": "CONTENT",
      "headline": "Título/tema da semana",
      "script": "Texto completo da mensagem para enviar"
    }
  ]
}

As 8 semanas devem seguir o padrão: CONTENT, OFFER, CONTENT, OFFER, CONTENT, OFFER, CONTENT, OFFER.
Cada script deve ter entre 3-5 parágrafos. Alterne temas de saúde, resultado de pacientes, bastidores, dicas práticas.`;

        console.log("[Generate-VIP] Generating 8-week strategy");

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
                    { role: "user", content: "Gere agora o calendário completo de 8 semanas de mensagens VIP." },
                ],
                temperature: 0.8,
                response_format: { type: "json_object" },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("AI error:", response.status, errorText);
            throw new Error("Erro ao gerar estratégia VIP");
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        let parsed;
        try {
            parsed = JSON.parse(content);
        } catch {
            parsed = { weeks: [] };
        }

        return new Response(JSON.stringify(parsed), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (e) {
        console.error("Generate VIP error:", e);
        return new Response(
            JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
