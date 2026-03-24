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
    const { slide, style, profileName, brandColors, fontFamily, contentFormat } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // ══ FORMAT DIMENSIONS ══
    const FORMAT_CONFIG: Record<string, { width: number; height: number; ratio: string; label: string }> = {
      carousel: { width: 1080, height: 1080, ratio: "1:1 SQUARE", label: "Slide de Carrossel" },
      single_post: { width: 1080, height: 1080, ratio: "1:1 SQUARE", label: "Post Único" },
      stories: { width: 1080, height: 1920, ratio: "9:16 VERTICAL", label: "Story" },
    };

    const format = FORMAT_CONFIG[contentFormat] || FORMAT_CONFIG.carousel;

    // ══ STYLE DESCRIPTIONS ══
    const styleDescriptions: Record<string, string> = {
      minimalist: "Ultra-clean editorial design. Pure white or off-white (#FAFAF8) background. A single strong accent color block. Generous whitespace. Headlines in heavy weight, body text in light weight. No decorative clutter. Think Vogue magazine meets premium wellness brand.",
      twitter: "Sophisticated text-forward post. Cream or very light warm-gray background (#F5F0EB). Headline in large bold serif or sans-serif. A thin accent rule or colored text highlight. No icons or clipart. Clean like a premium newsletter.",
      elegant: "Luxury brand aesthetic. Deep background color (near-black, dark wine #5C1A2E, or charcoal) with cream/ivory (#F5ECD7) text and a single warm gold (#C9A96E) accent. Serif headline, delicate body font. Feels like a high-end spa or premium coaching brand.",
      bold: "High-impact editorial. Full bleed background in a strong desaturated color. Massive headline, 80–120pt, centered with crop. Controlled color palette: 2 colors max. Geometric negative space. Feels like a luxury fashion label or a dominant expert brand.",
      warm: "Premium nurturing aesthetic. Warm neutral background (#F2E8DC or soft parchment). Serif headlines in a muted warm tone. Icons replaced by elegant checkmarks or numbered circles. Linen texture overlay at 5% opacity. Think Goop or premium health brand.",
      high_ticket: "PREMIUM HIGH-TICKET EDITORIAL. Wine/burgundy (#7B1F3A) or dark champagne tones. Creamy white (#FDFAF5) text on dark, or wine text on cream. Bold serif headline. Asymmetric layout: photo or color block on one column, text on the other. Minimal, confident, absolutely no clipart.",
      vibrant: "VIBRANT & MODERN. Bright gradient backgrounds (coral-to-peach, teal-to-mint, or purple-to-pink). White bold sans-serif text with drop shadows. Rounded shapes and soft blobs as decorative elements. Feels fun, approachable, and energetic — like a modern wellness brand for younger audiences.",
      editorial: "EDITORIAL MAGAZINE. Clean grid layout with strong typography hierarchy. Muted background (light gray, cream, or sage). Headline in oversized serif, subtext in refined sans-serif. Color accents only through thin lines or small color blocks. Feels like a curated editorial spread.",
    };

    const fontDescriptions: Record<string, string> = {
      inter: "Clean neutral sans-serif (Inter). Headlines heavy weight 700-900, body 400.",
      playfair: "High-contrast elegant serif (Playfair Display). Headlines at weight 900 italic, body 400.",
      montserrat: "Confident geometric sans (Montserrat). Headlines 800 ExtraBold uppercase, body 300 Light.",
      lora: "Warm authoritative serif (Lora). Headlines 700 bold, body 400 regular.",
    };

    const styleDesc = styleDescriptions[style] || styleDescriptions.high_ticket;
    const fontDesc = fontDescriptions[fontFamily] || fontDescriptions.playfair;

    // ══ LAYOUT INSTRUCTIONS BY FORMAT + SLIDE TYPE ══
    let layoutInstructions = "";
    const layout = slide.layout || slide.tipo || "topicos";

    if (contentFormat === "stories") {
      // Stories: 9:16 vertical — different layout rules
      if (layout === "capa" || layout === "intro") {
        layoutInstructions = `
        LAYOUT: STORY COVER (9:16 VERTICAL)
        - TOP 30%: Brand name small caps, subtle, 10pt, centered.
        - MIDDLE 50%: Headline MASSIVE, 64-80pt, centered, bold serif or bold sans. Max 4 lines.
        - BOTTOM 20%: Subtext in 18pt lighter weight. Swipe-up hint or CTA arrow.
        - Background: full-bleed color, gradient, or photo with dark overlay.
        - Feel: vertical, immersive, thumb-stopping.`;
      } else if (layout === "cta") {
        layoutInstructions = `
        LAYOUT: STORY CTA (9:16 VERTICAL)
        - TOP 25%: Context or setup phrase, 20pt, lighter.
        - MIDDLE 35%: CTA headline, 48-60pt, bold. Make it feel like an invitation.
        - BOTTOM 40%: 
          * Interactive element hint: "TOQUE AQUI" or "RESPONDA" styled as a pill button.
          * Or swipe-up arrow indicator.
          * Brand name at very bottom, 9pt.
        - Background: solid brand color or photo with heavy overlay.`;
      } else {
        layoutInstructions = `
        LAYOUT: STORY CONTENT (9:16 VERTICAL)
        - TOP 20%: Headline, 36-44pt, bold. Left or center aligned.
        - MIDDLE 55%: Content text, 18-22pt, comfortable line spacing. 
          Use numbered items (1. 2. 3.) or short paragraphs. Max 5-6 lines of body.
        - BOTTOM 25%: Highlight or key takeaway in accent color. Brand name subtle.
        - Background: clean color or photo with text-safe overlay.
        - Remember: text must not overlap with Instagram's UI zones (top status bar, bottom navigation).`;
      }
    } else if (contentFormat === "single_post") {
      layoutInstructions = `
      LAYOUT: SINGLE POST (1:1 SQUARE)
      - This is a STANDALONE post — it must tell the whole story in ONE image.
      - Headline: DOMINANT, 60-90pt, bold. Centered or asymmetric with a color block.
      - Subtext: 16-20pt below headline. Max 3 lines.
      - If there's a highlight/CTA: make it a clear visual element (pill button, underlined text, or color accent).
      - Brand name: subtle at top or bottom, 9-10pt.
      - The design must be instantly readable and shareable.
      - ONE strong visual concept — no clutter.`;
    } else {
      // Carousel slides
      if (layout === "capa") {
        layoutInstructions = `
        LAYOUT: CAROUSEL COVER / CAPA (1:1 SQUARE)
        - Dominant headline at 80-100pt, centered or left-aligned with side photo.
        - Brand name at top in small caps, very subtle (9-10pt, 40% opacity).
        - Subtext below headline in 16-18pt, lighter weight, max 2 lines.
        - If photo: person on right 40%, text on left 60% with fine vertical separator.
        - Background: full-bleed hero color or clean gradient.
        - One thin decorative accent line (1px). NO icons or emojis.`;
      } else if (layout === "cta") {
        layoutInstructions = `
        LAYOUT: CAROUSEL CTA (1:1 SQUARE)
        - Command headline centered, 48-60pt bold serif. Invitation, not demand.
        - Subtext in 16pt, italic, light weight below.
        - CTA element: elegant rounded pill button or underlined accent text.
        - Bottom: branded name and fine accent line. Premium, exclusive, confident.
        - Background: solid brand color or white with strong 1/3 color block.`;
      } else {
        layoutInstructions = `
        LAYOUT: CAROUSEL CONTENT (1:1 SQUARE)
        - Headline at top, 32-40pt bold serif, left-aligned. Color block or accent color text.
        - Body text: 15-17pt, excellent line spacing (1.7-2.0). Elegant checkmarks or numbered labels.
        - If list: clean column with subtle 1px horizontal dividers at 10% opacity.
        - Brand name top right, 8-9pt, light weight, muted.
        - At most ONE accent element per slide.`;
      }
    }

    // ══ MAIN PROMPT ══
    const prompt = `You are a premium Instagram content designer for a high-ticket nutritionist expert brand.

MISSION: Create a ${format.label} that feels like it belongs in a luxury wellness brand Instagram feed — premium, confident, editorial.

== DIMENSIONS ==
${format.ratio} format: ${format.width}x${format.height}px exactly.

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
- Place the person naturally, elegantly positioned. Do NOT crop the face.
- Add a subtle semi-transparent dark overlay (20-30%) where text is placed for readability.
- The photo should feel editorial, like a magazine shoot.`
        : `== BACKGROUND ==
No photo. Use a clean graphic background: solid brand color, a 2-tone split, or a minimal geometric shape. NO stock photos, NO heavy textures.`}

== CONTENT TO RENDER ==
HEADLINE: "${slide.headline}"
${slide.subtexto ? `SUBTEXT: "${slide.subtexto}"` : ""}
${slide.destaque ? `HIGHLIGHT/CTA: "${slide.destaque}" — make this visually distinct: different color, weight, or inside a pill shape.` : ""}
${profileName ? `BRAND NAME (small, top or bottom): "${profileName}"` : ""}

== CRITICAL RULES ==
- FORMAT: ${format.width}x${format.height}px exactly. ${format.ratio}.
- TEXT LEGIBILITY: All text must be clearly readable. High contrast always.
- NO CLIPART, NO ICONS, NO EMOJIS in the design.
- NO gradients except a dark overlay on photos.
- All text MUST be in Portuguese, exactly as provided. Do NOT translate or modify.
- The result must feel high-end, premium, exclusive — like a professional designer delivered it.

Generate the ${format.label} now.`;

    console.log(`[Generate-Design] Creating ${style} ${contentFormat || 'carousel'} (${layout}) for: ${slide.headline?.substring(0, 50)}...`);

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
