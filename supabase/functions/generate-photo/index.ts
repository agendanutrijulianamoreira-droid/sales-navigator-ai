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
    const { basePhotoUrl, pack, profile } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const packDescriptions: Record<string, string> = {
      headshot: "Professional editorial headshot, neutral studio background, high-end lighting, corporate but approachable style.",
      consultorio: "Nutritionist in a modern clean office/clinic setting, sitting at a desk or standing near a bookshelf, professional healthcare environment.",
      conteudo: "Dynamic content creator style, holding a tablet or pointing to a side space (for text overlay), bright natural lighting, engaging expression."
    };

    const prompt = `Task: Create a professional high-quality photo of a person based on the provided reference image.

STYLE: ${packDescriptions[pack] || packDescriptions.headshot}
PERSON: Maintain the exact facial features, hair color, and ethnicity of the person in the reference photo.
CLOTHING: Professional attire suitable for a nutritionist (e.g., clean white coat, smart casual, or professional blouse).
QUALITY: Photorealistic, 8k resolution, professional photography lighting, sharp focus.

CRITICAL: The person's face must be clearly recognizable as the same person from the reference photo. Do not change their identity.`;

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
