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
    const { profile, products, startDate, daysCount = 30 } = await req.json();

    const nicho = profile?.nicho || "nutrição";
    const subNicho = profile?.sub_nicho || "";
    const nomeMetodo = profile?.nome_metodo || "";
    const dorPrincipal = profile?.dor_principal || "";
    const promessa = profile?.promessa_principal || "";
    const personaIdeal = profile?.persona_ideal || "";
    const tomVoz = profile?.tom_voz || "empático";
    const inimigoComum = profile?.inimigo_comum || "";

    const productsList = (products || [])
      .slice(0, 3)
      .map((p: any) => `${p.nome} (R$${p.ticket})`)
      .join(", ");

    const systemPrompt = `Você é o MAESTRO — o estrategista de conteúdo de elite para profissionais de ${nicho}.

CONTEXTO DO PROFISSIONAL:
- Nicho: ${nicho} ${subNicho ? `/ ${subNicho}` : ""}
- Método: ${nomeMetodo || "não definido"}
- Dor principal do público: ${dorPrincipal}
- Promessa: ${promessa}
- Persona ideal: ${personaIdeal}
- Tom de voz: ${tomVoz}
- Inimigo comum: ${inimigoComum}
- Produtos: ${productsList || "não definidos"}

MISSÃO: Criar um plano editorial de ${daysCount} dias seguindo o framework "Funil Infinito":
- Semana 1: ATRAIR (alcance, viralização, dor/evento)
- Semana 2: AQUECER (autoridade, bastidores, superação)
- Semana 3: PROVAR (resultados, depoimentos, comparativos)
- Semana 4: CONVERTER (ofertas, CTAs, levantada de mão)

REGRAS:
1. Distribua os tipos: carrossel (12-15), reels (6-8), stories (4-6), post_unico (3-4), levantada (2-3)
2. Nunca repita o mesmo tipo 2 dias seguidos
3. Fins de semana = conteúdo leve (conexão, bastidores, stories)
4. Cada título deve ser um gancho irresistível, específico ao nicho
5. Notas devem conter: objetivo do post, CTA sugerido e pilar de conteúdo
6. Use linguagem de impacto: "inflamação subclínica", "fadiga adrenal", "clareza mental" (não genéricos como "saúde")
7. Inclua 2-3 posts de oferta direta dos produtos cadastrados

IMPORTANTE: Retorne APENAS um JSON array válido, sem markdown, sem texto antes ou depois.
Formato exato:
[{"data":"YYYY-MM-DD","tipo":"carrossel","titulo":"Título gancho","notas":"Objetivo: X | Pilar: Y | CTA: Z"}]`;

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Gere o plano editorial começando em ${startDate}. São ${daysCount} dias. Retorne APENAS o JSON array.`,
          },
        ],
        temperature: 0.8,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", errorText);
      throw new Error("Erro na API de IA");
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    // Extract JSON array from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("No JSON found in response:", content.substring(0, 500));
      throw new Error("IA não retornou formato válido");
    }

    const items = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Plano vazio retornado pela IA");
    }

    // Validate and clean items
    const validTypes = ["carrossel", "post_unico", "reels", "stories", "levantada"];
    const cleanedItems = items
      .filter((item: any) => item.data && item.tipo && item.titulo)
      .map((item: any) => ({
        data: item.data,
        tipo: validTypes.includes(item.tipo) ? item.tipo : "carrossel",
        titulo: item.titulo,
        notas: item.notas || "",
      }));

    return new Response(JSON.stringify(cleanedItems), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro interno";
    console.error("generate-month-plan error:", error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
