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
    const { profile, products, startDate, daysCount = 30, postCount = 12, period = "monthly", monthlyStrategy } = await req.json();

    const nicho = profile?.nicho || "nutrição";
    const subNicho = profile?.sub_nicho || "";
    const nomeMetodo = profile?.nome_metodo || "";
    const dorPrincipal = profile?.dor_principal || "";
    const promessa = profile?.promessa_principal || "";
    const personaIdeal = profile?.persona_ideal || "";
    const tomVoz = profile?.tom_voz || "empático";
    const inimigoComum = profile?.inimigo_comum || "";
    const nome = String(profile?.nome || "Sua marca").trim();
    const especialidade = String(profile?.sub_nicho || profile?.nicho || "Nutrição").trim();
    const instagram = String(profile?.instagram_handle || "seuinstagram").replace(/^@/, "").trim();
    const safeDaysCount = Math.min(31, Math.max(1, Number(daysCount) || 30));
    const safePostCount = Math.min(16, Math.max(1, Number(postCount) || 12));

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

ESTRATÉGIA ESPECÍFICA DESTE MÊS:
${monthlyStrategy ? `
- Tema: ${monthlyStrategy.theme}
- Objetivo: ${monthlyStrategy.goal}
- Ganchos Sugeridos: ${monthlyStrategy.hooks?.join(", ")}
- Produto Foco: ${products?.find((p: any) => p.id === monthlyStrategy.product_id)?.nome || "Geral"}
` : "Siga o fluxo padrão do Funil Infinito."}

MISSÃO: Criar EXATAMENTE ${safePostCount} rascunho(s), distribuídos nos próximos ${safeDaysCount} dias, seguindo o framework "Funil Infinito":
- Semana 1: ATRAIR (alcance, viralização, dor/evento)
- Semana 2: AQUECER (autoridade, bastidores, superação)
- Semana 3: PROVAR (resultados, depoimentos, comparativos)
- Semana 4: CONVERTER (ofertas, CTAs, levantada de mão)

REGRAS:
1. Distribua proporcionalmente os tipos entre carrossel, reels, stories, post_unico e levantada. Para apenas 1 conteúdo, escolha o formato de maior impacto estratégico.
2. Nunca repita o mesmo tipo 2 dias seguidos
3. Fins de semana = conteúdo leve (conexão, bastidores, stories)
4. Cada TÍTULO é um GANCHO NEURO de 3 segundos. Use:
   - Pattern interrupt ("Pare de...", "Não faça isso se...")
   - Loop aberto / curiosidade ("Descobri por acidente...", "O que ninguém te conta sobre...")
   - Número específico ("Os 3 sinais de que...", "87% das mulheres ignoram...")
   - Aversão à perda ("O que você está perdendo ao...")
   - Contradição com o senso comum ("Beber mais água pode estar te atrapalhando")
5. Notas devem conter: objetivo do post | gatilho neuro usado (curiosidade/escassez/prova/autoridade/aversão à perda) | CTA sugerido | pilar
6. Linguagem sensorial e específica: "inflamação subclínica", "fadiga adrenal", "neblina mental" — nunca "saúde" ou "bem-estar" genéricos
7. Inclua 2-3 posts de oferta direta dos produtos cadastrados
8. Storytelling em 1ª pessoa sempre que possível (ativa neurônios-espelho)

9. Gere o texto completo da legenda/corpo, pronto para edição e publicação, com parágrafos curtos, CTA coerente e sem promessas clínicas absolutas.
10. O título deve existir quando o formato pedir gancho visual (carrossel, post único, reels ou levantada). Para stories, pode ser curto e conversacional.
11. O cabeçalho é sempre "${nome} | ${especialidade}" e o rodapé é sempre "@${instagram}".
12. Inclua um snapshot estratégico estruturado para explicar por que cada rascunho existe e 2-4 termos visuais em inglês para buscar imagens coerentes.

IMPORTANTE: Retorne APENAS um JSON array válido com EXATAMENTE ${safePostCount} itens, sem markdown, sem texto antes ou depois.
Formato exato:
[{"data":"YYYY-MM-DD","tipo":"carrossel","titulo":"Título gancho","conteudo_corpo":"Legenda completa com parágrafos e CTA","cabecalho":"${nome} | ${especialidade}","rodape":"@${instagram}","notas":"Objetivo: X | Gatilho: curiosidade | CTA: Y | Pilar: Z","estrategia_snapshot":{"periodo":"${period}","tema":"Tema","objetivo":"Objetivo","pilar":"Pilar","etapa_funil":"ATRAIR","produto":"Produto ou geral","cta":"CTA","termos_imagem":"healthy food woman"}}]`;

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Gere ${safePostCount} rascunho(s) editoriais começando em ${startDate}, distribuídos em ${safeDaysCount} dia(s). Período escolhido: ${period}. Retorne APENAS o JSON array.`,
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
      .slice(0, safePostCount)
      .map((item: any) => ({
        data: String(item.data).slice(0, 10),
        tipo: validTypes.includes(item.tipo) ? item.tipo : "carrossel",
        titulo: String(item.titulo).slice(0, 180),
        notas: String(item.notas || "").slice(0, 1000),
        status: "rascunho",
        conteudo_corpo: String(item.conteudo_corpo || "").slice(0, 12000),
        cabecalho: String(item.cabecalho || `${nome} | ${especialidade}`).slice(0, 180),
        rodape: String(item.rodape || `@${instagram}`).slice(0, 100),
        estrategia_snapshot: {
          periodo: period,
          tema: item.estrategia_snapshot?.tema || monthlyStrategy?.theme || "",
          objetivo: item.estrategia_snapshot?.objetivo || monthlyStrategy?.goal || "",
          pilar: item.estrategia_snapshot?.pilar || "",
          etapa_funil: item.estrategia_snapshot?.etapa_funil || "",
          produto: item.estrategia_snapshot?.produto || "Geral",
          cta: item.estrategia_snapshot?.cta || "",
          termos_imagem: String(item.estrategia_snapshot?.termos_imagem || "healthy nutrition").slice(0, 120),
        },
      }));

    if (cleanedItems.length !== safePostCount) {
      throw new Error(`A IA retornou ${cleanedItems.length} de ${safePostCount} rascunhos. Tente novamente.`);
    }

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
