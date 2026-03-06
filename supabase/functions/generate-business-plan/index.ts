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
        const { goal, services, niche, subNiche, weeklyCap, fixedCosts, taxRate } = await req.json();

        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

        const systemPrompt = `Você é o CFO Estrategista do NutriSales AI. Sua especialidade é engenharia reversa de faturamento para nutricionistas de elite.

REGRAS DE CÁLCULO:
1. Use o framework 10-60-30: 10% da meta em Iscas/Entrada, 60% na Oferta Central (Core), 30% em High-Ticket.
2. PRECIFICAÇÃO POR VALOR: Se o nicho é clínico complexo (SOP, Endometriose, Oncologia, Autoimune, Hormonal, Diabetes, Gestante), sugira preços 40% acima da média de mercado.
3. REALIDADE FÍSICA: Nunca sugira um plano que ultrapasse o cap semanal de horas do usuário. weeklyLoad DEVE ser <= weeklyCap.
4. Todos os valores monetários em BRL (número puro, sem símbolo).

RESPONDA APENAS JSON VÁLIDO, sem markdown, sem explicações fora do JSON.

Estrutura JSON obrigatória:
{
  "summary": "Frase de 1-2 linhas com o veredicto estratégico do plano",
  "maestroVerdict": "Conselho direto e motivador do Maestro sobre a viabilidade deste plano",
  "viability": "safe|limit|burnout",
  "weeklyLoad": number,
  "freeHours": number,
  "productMix": [
    {
      "name": "Nome do produto",
      "ladder": "isca|entrada|core|premium",
      "suggestedPrice": number,
      "unitsNeeded": number,
      "hoursPerUnit": number,
      "revenueShare": number,
      "rationale": "Por que esse preço e esse volume faz sentido estratégico"
    }
  ],
  "annualCalendar": [
    {
      "month": "Janeiro",
      "theme": "Tema da campanha",
      "focus": "isca|entrada|core|premium",
      "campaign": "Título curto da campanha e gatilho emocional"
    }
  ]
}`;

        const userPrompt = `Gere um Plano de Voo de Faturamento com os seguintes dados:
- Meta mensal: R$ ${goal}
- Serviços ofertados: ${services.join(", ")}
- Nicho: ${niche || "Nutrição Geral"}${subNiche ? ` (${subNiche})` : ""}
- Cap de horas semanais: ${weeklyCap}h
- Custos fixos mensais: R$ ${fixedCosts}
- Imposto estimado: ${taxRate}%

Leve em conta que o lucro líquido real deve cobrir os custos fixos + meta líquida.
O plano deve ter entre 2 e 4 produtos no mix, seguindo o framework 10-60-30.
O calendário anual deve ter exatamente 12 meses, com campanhas sazonais relevantes para nutricionistas (ex: Janeiro Detox, Março Pré-verão Carioca, Junho/Julho foco imunidade de inverno, etc.).`;

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
                    { role: "user", content: userPrompt },
                ],
                temperature: 0.6,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[generate-business-plan] API Error:", response.status, errorText);
            throw new Error(`AI API error ${response.status}`);
        }

        const rawText = await response.text();
        const data = JSON.parse(rawText);
        const content = data.choices[0].message.content;

        // Extract JSON from response (strip possible markdown fences)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Resposta da IA não contém JSON válido");
        const plan = JSON.parse(jsonMatch[0]);

        return new Response(JSON.stringify(plan), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Erro desconhecido";
        console.error("[generate-business-plan] Error:", message);
        return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
