import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TITLE_FONTS = ["Space Grotesk", "Merriweather", "Montserrat", "Playfair Display"];
const BODY_FONTS = ["Inter", "Source Sans 3", "DM Sans", "Lora"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { instagram_handle, nicho, sub_nicho, persona, nome } = await req.json();

    const prompt = `Você é um designer de marcas especializado em nutricionistas e profissionais de saúde.

Com base nas informações abaixo, crie uma paleta de cores profissional e uma combinação de fontes que transmita credibilidade e se conecte com o público-alvo.

Perfil da marca:
- Instagram: @${instagram_handle}
- Nome: ${nome || "Não informado"}
- Nicho: ${nicho || "Nutrição"}
- Sub-nicho: ${sub_nicho || "Não informado"}
- Persona ideal: ${persona || "Não informado"}

Regras:
1. A cor primária deve ser forte e profissional
2. A cor secundária deve complementar a primária
3. A cor neutra deve ser um tom claro/suave para fundos
4. Todas as cores em formato hexadecimal (#XXXXXX)
5. Fontes de título: escolha entre ${TITLE_FONTS.join(", ")}
6. Fontes de corpo: escolha entre ${BODY_FONTS.join(", ")}
7. Considere a psicologia das cores para o nicho de saúde/nutrição

Responda APENAS com JSON válido no formato:
{
  "primary": "#hex",
  "secondary": "#hex",
  "neutral": "#hex",
  "font_title": "Nome da Fonte",
  "font_body": "Nome da Fonte",
  "reasoning": "Explicação breve da escolha"
}`;

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "Você é um designer de marcas expert. Responda SOMENTE com JSON válido." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AI API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in AI response");

    const palette = JSON.parse(jsonMatch[0]);

    // Validate hex colors
    const hexRegex = /^#[0-9a-fA-F]{6}$/;
    if (!hexRegex.test(palette.primary) || !hexRegex.test(palette.secondary) || !hexRegex.test(palette.neutral)) {
      throw new Error("Invalid hex colors in response");
    }

    // Validate fonts
    if (!TITLE_FONTS.includes(palette.font_title)) palette.font_title = "Space Grotesk";
    if (!BODY_FONTS.includes(palette.font_body)) palette.font_body = "Inter";

    return new Response(JSON.stringify({ palette }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating brand palette:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
