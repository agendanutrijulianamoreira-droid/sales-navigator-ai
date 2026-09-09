import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) throw new Error("Unauthorized");

    const authClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const { data: claims, error: authError } = await authClient.auth.getClaims(authHeader.slice(7));
    if (authError || !claims?.claims) throw new Error("Unauthorized");

    const { query } = await req.json();
    const cleanQuery = String(query || "nutrição saudável").replace(/[\r\n]/g, " ").slice(0, 140).trim();
    const url = new URL("https://api.openverse.org/v1/images/");
    url.searchParams.set("q", cleanQuery);
    url.searchParams.set("page_size", "12");
    url.searchParams.set("mature", "false");
    url.searchParams.set("license", "cc0,pdm");

    const response = await fetch(url, {
      headers: { "User-Agent": "ClubNutri/1.0 (open-media-search)" },
    });
    if (!response.ok) throw new Error(`Openverse indisponível (${response.status})`);

    const payload = await response.json();
    const images = (payload.results || []).map((item: Record<string, unknown>) => ({
      id: String(item.id || ""),
      title: String(item.title || "Imagem sem título"),
      url: String(item.url || item.thumbnail || ""),
      thumbnail: String(item.thumbnail || item.url || ""),
      creator: String(item.creator || "Autor não informado"),
      creatorUrl: String(item.creator_url || ""),
      sourceUrl: String(item.foreign_landing_url || ""),
      license: String(item.license || "").toUpperCase(),
      licenseUrl: String(item.license_url || ""),
    })).filter((item: { url: string; thumbnail: string }) => item.url && item.thumbnail);

    return new Response(JSON.stringify({ images }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao buscar imagens";
    const status = message === "Unauthorized" ? 401 : 500;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
