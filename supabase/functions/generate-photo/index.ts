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
    const body = await req.json();
    const { basePhotoUrl, pack } = body;

    console.log(`[Generate-Photo] Request received for pack: ${pack}`);
    console.log(`[Generate-Photo] Base Photo URL: ${basePhotoUrl}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("[Generate-Photo] LOVABLE_API_KEY is missing in environment variables");
      throw new Error("Configuração incompleta: LOVABLE_API_KEY não encontrada.");
    }

    const packDescriptions: Record<string, string> = {
      headshot: "Professional high-end editorial headshot. 85mm lens, f/1.8 aperture, softbox studio lighting, neutral grey/beige textured background. Clean skin texture, sharp focus on eyes, corporate but warm and approachable. Magazine cover quality.",
      consultorio: "Nutritionist in a bright modern clinical setting. Professional white coat or smart business attire. Desk with a laptop and some healthy elements (like a green plant or bowl of fruit) in soft focus in the background. Natural window light mixed with professional indoor lighting.",
      conteudo: "Dynamic content creator/educator style. Candid moment, professional yet energetic expression. Soft natural lighting, urban or modern interior background with depth (bokeh). Person is gesturing naturally. High-end lifestyle photography.",
      palestra: "Expert speaker on a stage. Professional public speaking moment, slight low-angle shot for authority. Blurred audience in the foreground/background, warm stage lighting, holding a microphone or near a podium. Conference atmosphere.",
      lifestyle: "Casual professional lifestyle. Natural morning light, sophisticated cafe or modern home kitchen background. Relaxed but sharp appearance, holding a ceramic mug or organic juice. Clean, airy 'Instagram editorial' aesthetic."
    };

    const prompt = `Task: Create an ultra-realistic, high-end professional photo based on the person in the provided reference image.

STYLE: ${packDescriptions[pack] || packDescriptions.headshot}

TECHNICAL SPECS: Photorealistic, 8k, highly detailed skin texture, professional color grading, cinematic lighting, sharp focus, no distortion.

IDENTITY PRESERVATION (CRITICAL): 
1. Maintain the EXACT facial features, bone structure, eye color, and unique marks of the person.
2. Maintain hair color and texture.
3. The person should be 100% recognizable as the same individual from the reference photo. 
4. DO NOT change their ethnicity or basic identity.

CLOTHING: Professional and sophisticated attire suitable for a top-tier nutritionist (e.g., silk blouse, tailored blazer, or a very clean modern medical coat).`;

    console.log(`[Generate-Photo] Creating ${pack} photo for user...`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: basePhotoUrl } }
            ]
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Erro ao gerar foto profissional");
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
    console.error("Generate photo error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
