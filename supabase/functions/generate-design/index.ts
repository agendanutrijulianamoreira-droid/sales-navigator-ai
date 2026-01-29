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
    const { slide, style, profileName, brandColors, fontFamily } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Enhanced style descriptions for better visual consistency
    const styleDescriptions: Record<string, string> = {
      minimalist: "Clean, minimalist graphic design with ample white space, high-end editorial feel, modern sans-serif typography, subtle depth with soft shadows.",
      twitter: "Modern social media text-post style, clean dark text on a light solid background, professional and highly readable, minimalist UI elements.",
      elegant: "Premium sophisticated design, luxury brand aesthetic, serif typography, refined color palette with gold or muted accents, spacious layout.",
      bold: "High-impact energetic design, vibrant high-contrast colors, massive bold typography, dynamic geometric shapes, modern and attention-grabbing.",
      warm: "Friendly and welcoming design, soft organic shapes, warm pastel color palette, approachable feel, rounded typography, clean and cozy layout.",
    };

    const fontDescriptions: Record<string, string> = {
      inter: "Modern, clean sans-serif (Inter/Helvetica style)",
      playfair: "Elegant, high-contrast serif (Playfair Display style)",
      montserrat: "Geometric, bold sans-serif (Montserrat style)",
      lora: "Classic, highly readable serif (Lora style)",
    };

    const styleDesc = styleDescriptions[style] || styleDescriptions.minimalist;
    const fontDesc = fontDescriptions[fontFamily] || fontDescriptions.inter;
    
    // Layout logic based on slide type
    let layoutInstructions = "";
    if (slide.tipo === 'capa') {
      layoutInstructions = `
      LAYOUT: CENTERED HERO
      - Headline should be massive and centered.
      - Use a high-impact background or a strong geometric element.
      - Subtext should be smaller, positioned below the headline.
      - Visual focus must be 100% on the main promise.`;
    } else if (slide.tipo === 'cta') {
      layoutInstructions = `
      LAYOUT: CALL TO ACTION
      - Headline should be a clear command.
      - Include a visual element that looks like a button or a pointer.
      - High contrast to ensure the action stands out.`;
    } else {
      layoutInstructions = `
      LAYOUT: CONTENT LIST
      - Headline at the top, clearly separated.
      - Body text (subtext) in the center with good line spacing.
      - Use bullet points or numbers if appropriate.
      - Maintain a clear hierarchy between title and content.`;
    }

    const prompt = `Task: Create a professional Instagram carousel slide graphic.

VISUAL STYLE: ${styleDesc}
TYPOGRAPHY: Use ${fontDesc} for all text.
${brandColors ? `COLOR PALETTE: ${brandColors}` : "COLOR PALETTE: Professional and balanced."}

${layoutInstructions}

CONTENT TO INCLUDE:
1. MAIN HEADLINE: "${slide.headline}" (Make this the primary focus)
2. SUBTEXT: "${slide.subtexto || ""}" (Secondary focus)
3. HIGHLIGHT: "${slide.destaque || ""}" (Use a different color or bold weight for this specific word/phrase)
4. BRANDING: "${profileName || ""}" (Small, elegant placement at the bottom)

CRITICAL RULES:
- FORMAT: 1080x1080 pixels (Square).
- NO PHOTOS: Use only graphic design, typography, and vector elements.
- READABILITY: Text must be perfectly legible with high contrast against the background.
- CONSISTENCY: Do not add random elements. Keep it clean and professional.
- LANGUAGE: All text must be exactly as provided in Portuguese.

Generate a stunning, high-quality graphic design for this slide.`;

    console.log(`[Generate-Design] Creating ${style} (${slide.tipo}) slide for: ${slide.headline?.substring(0, 50)}...`);

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
