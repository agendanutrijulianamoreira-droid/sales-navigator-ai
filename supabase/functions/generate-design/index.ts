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
    const { slide, style, profileName, brandColors } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build the prompt for image generation
    const styleDescriptions: Record<string, string> = {
      minimalist: "Clean, minimalist design with lots of white space, modern sans-serif typography, subtle shadows",
      twitter: "Twitter/X style post design, dark text on light background, clean and professional",
      elegant: "Elegant, sophisticated design with premium feel, gold accents, serif typography",
      bold: "Bold, high-contrast design with large typography, vibrant colors, modern and energetic",
      warm: "Warm, welcoming design with soft colors, friendly feel, rounded elements",
    };

    const styleDesc = styleDescriptions[style] || styleDescriptions.minimalist;
    
    const prompt = `Create a professional Instagram carousel slide design:

STYLE: ${styleDesc}
${brandColors ? `BRAND COLORS: ${brandColors}` : ""}

SLIDE CONTENT:
- Type: ${slide.tipo}
- Headline: "${slide.headline}"
${slide.subtexto ? `- Subtext: "${slide.subtexto}"` : ""}
${slide.destaque ? `- Highlight word: "${slide.destaque}"` : ""}
${profileName ? `- Author name at bottom: "${profileName}"` : ""}

Design requirements:
- Instagram square format (1080x1080)
- Professional, clean layout
- Easy to read typography
- Visual hierarchy with headline as focus
- ${slide.tipo === 'capa' ? 'Impactful cover design' : 'Content slide with clear structure'}

Generate a beautiful, professional slide design.`;

    console.log(`[Generate-Design] Creating ${style} slide for: ${slide.headline?.substring(0, 50)}...`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          { role: "user", content: prompt }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos esgotados." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Erro ao gerar imagem");
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) {
      throw new Error("Imagem não gerada");
    }

    return new Response(JSON.stringify({ imageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Generate design error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
