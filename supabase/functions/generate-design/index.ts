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

    // Premium style descriptions with high-ticket visual references
    const styleDescriptions: Record<string, string> = {
      minimalist: "Ultra-clean editorial design. Pure white or off-white (#FAFAF8) background. A single strong accent color block. Generous whitespace. Headlines in heavy weight, body text in light weight. No decorative clutter. Think Vogue magazine meets premium wellness brand.",
      twitter: "Sophisticated text-forward post. Cream or very light warm-gray background (#F5F0EB). Headline in large bold serif or sans-serif. A thin accent rule or colored text highlight. No icons or clipart. Clean like a premium newsletter.",
      elegant: "Luxury brand aesthetic. Deep background color (near-black, dark wine #5C1A2E, or charcoal) with cream/ivory (#F5ECD7) text and a single warm gold (#C9A96E) accent. Serif headline, delicate body font. Feels like a high-end spa or premium coaching brand.",
      bold: "High-impact editorial. Full bleed background in a strong desaturated color. Massive headline, 80–120pt, centered with crop. Controlled color palette: 2 colors max. Geometric negative space. Feels like a luxury fashion label or a dominant expert brand.",
      warm: "Premium nurturing aesthetic. Warm neutral background (#F2E8DC or soft parchment). Serif headlines in a muted warm tone. Icons replaced by elegant checkmarks or numbered circles. Linen texture overlay at 5% opacity. Think Goop or premium health brand.",
      high_ticket: "PREMIUM HIGH-TICKET EDITORIAL. Wine/burgundy (#7B1F3A) or dark champagne tones. Creamy white (#FDFAF5) text on dark, or wine text on cream. Bold serif headline (Cormorant Garamond or Playfair style). Slim professional name watermark at top. Asymmetric layout: photo or color block on one column, text on the other with a fine vertical rule separator. Minimal, confident, absolutely no clipart or gradients except a single subtle dark overlay on photos.",
    };

    const fontDescriptions: Record<string, string> = {
      inter: "Clean neutral sans-serif (Inter). Headlines heavy weight 700-900, body 400.",
      playfair: "High-contrast elegant serif (Playfair Display). Headlines at weight 900 italic for headlines, 400 for body.",
      montserrat: "Confident geometric sans (Montserrat). Headlines 800 ExtraBold uppercase, body 300 Light.",
      lora: "Warm authoritative serif (Lora). Headlines 700 bold, body 400 regular with relaxed line-height 1.8.",
    };

    const styleDesc = styleDescriptions[style] || styleDescriptions.high_ticket;
    const fontDesc = fontDescriptions[fontFamily] || fontDescriptions.playfair;

    // Layout logic based on slide layout field (capa/topicos/cta) with high-ticket instructions
    let layoutInstructions = "";
    const layout = slide.layout || slide.tipo || "topicos";

    if (layout === "capa") {
      layoutInstructions = `
      LAYOUT: HIGH-TICKET COVER / CAPA
      - Dominant headline at 80-100pt, centered or left-aligned if there's a side photo.
      - Brand name at top in small caps, very subtle (9-10pt, 40% opacity).
      - Subtext below headline in 16-18pt, lighter weight, max 2 lines.
      - If using a photo: place person on right 40% of frame, text on left 60% with a fine vertical line separator.
      - Background: either full-bleed hero color or a clean gradient from dark wine to near-black.
      - One thin horizontal line as a decorative accent (1px). NO icons or emojis.`;
    } else if (layout === "cta") {
      layoutInstructions = `
      LAYOUT: HIGH-TICKET CALL TO ACTION
      - Command headline centered, 48-60pt bold serif. Make it feel like an invitation, not a demand.
      - Subtext in 16pt, italic, light weight below.
      - A clearly designed CTA element: elegant rounded pill button shape or underlined text in brand accent color.
      - Bottom: branded name and a fine accent line. Feel premium, exclusive, and confident.
      - Background: solid brand color (wine or deep champagne) or white with a strong color block at 1/3 of the slide.`;
    } else {
      layoutInstructions = `
      LAYOUT: HIGH-TICKET CONTENT / TÓPICOS
      - Headline at top, 32-40pt bold serif, left-aligned. Color block behind it or bold accent color text.
      - Body text below in 15-17pt, excellent line spacing (1.7-2.0). Use elegant checkmarks ✓ or numbered labels, NOT bullet points.
      - If slide has a list: items in clean column with subtle horizontal lines between them (1px, 10% opacity).
      - Brand name top right, 8-9pt, light weight, muted color.
      - At most ONE accent element per slide (a color block, a line, or a number circle). Never combine all three.`;
    }

    const prompt = `You are a premium Instagram carousel designer for a high-ticket nutritionist expert brand.

MISSION: Create a slide that feels like it belongs in a luxury wellness brand Instagram feed — think premium, confident, editorial.

== VISUAL STYLE ==
${styleDesc}

== TYPOGRAPHY ==
${fontDesc}

== COLOR PALETTE ==
${brandColors
        ? `Use EXACTLY these brand colors: ${brandColors}. Do not invent other colors. Max 2-3 colors total.`
        : "Use a high-ticket palette: deep wine #7B1F3A, creamy off-white #FDFAF5, and warm gold #C9A96E as the only accent."}

== LAYOUT ==
${layoutInstructions}

${slide.backgroundImageUrl
        ? `== PHOTO INTEGRATION ==
- The subject/person from this URL is the brand's nutritionist expert: ${slide.backgroundImageUrl}
- Place the person naturally on ONE SIDE of the slide (right or left), occupying 35-45% of the frame.
- Do NOT crop the face. Position elegantly, full or 3/4 body preferred.
- Add a subtle semi-transparent dark overlay (20-30%) IF text is placed over the photo area to guarantee readability.
- The photo should feel editorial, like a magazine shoot—not a social media screenshot.`
        : `== BACKGROUND ==
No photo. Use a clean graphic background: solid brand color, a 2-tone split, or a minimal geometric shape. NO stock photo backgrounds, NO textures beyond a very subtle linen at 3% opacity.`}

== CONTENT TO RENDER ==
HEADLINE: "${slide.headline}"
${slide.subtexto ? `SUBTEXT: "${slide.subtexto}"` : ""}
${slide.destaque ? `HIGHLIGHT/CTA ELEMENT: "${slide.destaque}" — make this visually distinct: different color, weight, or inside a pill shape.` : ""}
${profileName ? `BRAND NAME (small, top or bottom): "${profileName}"` : ""}

== CRITICAL RULES ==
- SQUARE FORMAT: 1080x1080px exactly.
- TEXT LEGIBILITY: All text must be clearly readable. High contrast always. Never place light text on light background.
- NO CLIPART, NO ICONS, NO EMOJIS in the design itself.
- NO gradients except a dark overlay on photos.
- All text MUST be in Portuguese, exactly as provided. Do NOT translate or modify the content.
- The final result must feel high-end, premium, exclusive — like a result a professional designer would deliver.

Generate the slide now.`;


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
