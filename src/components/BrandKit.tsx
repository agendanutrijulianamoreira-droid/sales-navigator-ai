import { useMemo, useState, type ChangeEvent } from "react";
import { Upload, Image as ImageIcon, Palette, Type, Loader2, Sparkles, Instagram } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useAssets } from "@/hooks/useAssets";
import { useBrand } from "@/contexts/BrandContext";
import { toast } from "sonner";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const TITLE_FONTS = ["Space Grotesk", "Merriweather", "Montserrat", "Playfair Display"];
const BODY_FONTS = ["Inter", "Source Sans 3", "DM Sans", "Lora"];

type UploadKind = "logo" | "watermark";

export function BrandKit() {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { addAsset } = useAssets();
  const { brand, updateBrand } = useBrand();
  const [uploading, setUploading] = useState<UploadKind | null>(null);
  const [igHandle, setIgHandle] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const handleMagicImport = async () => {
    let cleanHandle = igHandle.trim();
    if (cleanHandle.startsWith("@")) cleanHandle = cleanHandle.substring(1);

    if (!cleanHandle || cleanHandle.length < 2) {
      toast.error("Digite um @ usuário válido do Instagram");
      return;
    }

    setIsImporting(true);

    try {
      const nicho = profile?.nicho || "";
      const subNicho = profile?.sub_nicho || "";
      const persona = profile?.persona_ideal || "";
      const nome = profile?.nome || "";

      const { data, error } = await supabase.functions.invoke("generate-brand-palette", {
        body: {
          instagram_handle: cleanHandle,
          nicho,
          sub_nicho: subNicho,
          persona,
          nome,
        },
      });

      if (error) throw error;

      const palette = data?.palette;
      if (!palette) throw new Error("Resposta inválida da IA");

      await handleColorChange("brand_primary_color", palette.primary);
      await handleColorChange("brand_secondary_color", palette.secondary);
      await handleColorChange("brand_neutral_color", palette.neutral);
      await handleFontChange("brand_font_title", palette.font_title || "Space Grotesk");
      await handleFontChange("brand_font_body", palette.font_body || "Inter");

      toast.success("Paleta gerada pela IA com sucesso! ✨");
      setIgHandle("");
    } catch (err) {
      console.error("Erro na importação mágica:", err);
      toast.error("Não foi possível gerar a paleta. Tente novamente.");
    } finally {
      setIsImporting(false);
    }
  };

  const previewPalette = useMemo(
    () => ({
      primary: profile?.brand_primary_color || brand.primary,
      secondary: profile?.brand_secondary_color || brand.secondary,
      neutral: profile?.brand_neutral_color || brand.background,
      heading: profile?.brand_font_title || brand.fontHeading,
      body: profile?.brand_font_body || brand.fontBody,
    }),
    [profile, brand],
  );

  const handleColorChange = async (field: "brand_primary_color" | "brand_secondary_color" | "brand_neutral_color", value: string) => {
    await updateProfile({ [field]: value });

    if (field === "brand_primary_color") updateBrand({ primary: value });
    if (field === "brand_secondary_color") updateBrand({ secondary: value });
    if (field === "brand_neutral_color") updateBrand({ background: value });
  };

  const handleFontChange = async (field: "brand_font_title" | "brand_font_body", value: string) => {
    await updateProfile({ [field]: value });

    if (field === "brand_font_title") updateBrand({ fontHeading: value });
    if (field === "brand_font_body") updateBrand({ fontBody: value });
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>, kind: UploadKind) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Envie PNG, JPG ou WEBP.");
      return;
    }

    setUploading(kind);

    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `${user.id}/${kind}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage.from("assets").upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("assets").getPublicUrl(path);
      const publicUrl = data.publicUrl;

      await addAsset({
        tipo: "brand",
        subtipo: kind,
        url: publicUrl,
        metadata: { filename: file.name, size: file.size, mimeType: file.type },
      });

      await updateProfile(kind === "logo" ? { brand_logo_url: publicUrl } : { brand_watermark_url: publicUrl });
      toast.success(kind === "logo" ? "Logo atualizado." : "Marca d'água atualizada.");
    } catch (error) {
      console.error("Erro ao enviar arquivo de marca:", error);
      toast.error("Não foi possível enviar a imagem.");
    } finally {
      setUploading(null);
      event.target.value = "";
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        
        {/* Magic Import Box */}
        <Card className="border-primary/20 bg-primary/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Instagram className="w-24 h-24" />
          </div>
          <CardHeader className="pb-3 border-b border-primary/10">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Sparkles className="w-5 h-5" /> Importação Mágica (Instagram) 🚀
            </CardTitle>
            <CardDescription className="text-primary/70">
              Evite configurar tudo manualmente! Escreva seu @ e deixe a IA extrair sua paleta de cores perfeita.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="flex gap-3 items-end max-w-sm">
              <div className="flex-1 space-y-2">
                <Label>Qual é o seu arroba?</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">@</span>
                  <Input 
                    placeholder="nutrisucesso" 
                    className="pl-8 bg-white border-primary/20" 
                    value={igHandle} 
                    onChange={(e) => setIgHandle(e.target.value)}
                    disabled={isSimulatingMagic}
                  />
                </div>
              </div>
              <Button onClick={handleMagicImport} disabled={isSimulatingMagic} className="gap-2">
                {isSimulatingMagic ? <><Loader2 className="w-4 h-4 animate-spin"/> Puxando...</> : <><Sparkles className="w-4 h-4"/> Importar</>}
              </Button>
            </div>
            {isSimulatingMagic && (
              <div className="mt-4 text-xs font-semibold text-primary animate-pulse flex items-center gap-2">
                🪄 Analisando perfil, definindo tons hexadecimais...
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5 text-primary" /> Paleta da marca</CardTitle>
            <CardDescription>Ajuste as cores usadas nas experiências e materiais gerados.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {[
              { key: "brand_primary_color", label: "Primária", value: previewPalette.primary },
              { key: "brand_secondary_color", label: "Secundária", value: previewPalette.secondary },
              { key: "brand_neutral_color", label: "Neutra", value: previewPalette.neutral },
            ].map((item) => (
              <div key={item.key} className="space-y-2">
                <Label>{item.label}</Label>
                <div className="flex items-center gap-3 rounded-xl border border-border p-3">
                  <input
                    type="color"
                    value={item.value}
                    onChange={(e) => handleColorChange(item.key as "brand_primary_color" | "brand_secondary_color" | "brand_neutral_color", e.target.value)}
                    className="h-10 w-12 cursor-pointer rounded-md border border-border bg-transparent"
                  />
                  <Input value={item.value} onChange={(e) => handleColorChange(item.key as any, e.target.value)} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Type className="h-5 w-5 text-primary" /> Tipografia</CardTitle>
            <CardDescription>Defina as fontes de títulos e de textos do seu sistema.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Fonte de títulos</Label>
              <div className="grid grid-cols-2 gap-2">
                {TITLE_FONTS.map((font) => (
                  <Button key={font} type="button" variant={previewPalette.heading === font ? "default" : "outline"} className="justify-start" onClick={() => handleFontChange("brand_font_title", font)}>
                    {font}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Fonte de corpo</Label>
              <div className="grid grid-cols-2 gap-2">
                {BODY_FONTS.map((font) => (
                  <Button key={font} type="button" variant={previewPalette.body === font ? "default" : "outline"} className="justify-start" onClick={() => handleFontChange("brand_font_body", font)}>
                    {font}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5 text-primary" /> Arquivos da marca</CardTitle>
            <CardDescription>Envie o logo principal e a marca d'água para reutilização automática.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {[
              { kind: "logo", label: "Logo principal", url: profile?.brand_logo_url },
              { kind: "watermark", label: "Marca d'água", url: profile?.brand_watermark_url },
            ].map((item) => (
              <div key={item.kind} className="space-y-3 rounded-xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <Label>{item.label}</Label>
                  <Badge variant="outline">PNG / JPG / WEBP</Badge>
                </div>

                <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 overflow-hidden">
                  {item.url ? (
                    <img src={item.url} alt={item.label} className="h-full w-full object-contain" loading="lazy" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <ImageIcon className="h-8 w-8" />
                      <span className="text-sm">Nenhuma imagem enviada</span>
                    </div>
                  )}
                </div>

                <Input type="file" accept={ACCEPTED_TYPES.join(",")}
                  onChange={(e) => handleUpload(e, item.kind as UploadKind)}
                  disabled={uploading !== null}
                />

                {uploading === item.kind && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Enviando...
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Preview da identidade</CardTitle>
          <CardDescription>Uma visão rápida de como a marca está sendo aplicada hoje.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-2xl border border-border p-6" style={{ backgroundColor: previewPalette.neutral }}>
            <div className="space-y-4 rounded-xl border border-border bg-background p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Marca</p>
                  <h3 className="text-2xl" style={{ color: previewPalette.primary, fontFamily: previewPalette.heading }}>
                    {profile?.nome || "Sua Marca"}
                  </h3>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-8 rounded-full border border-border" style={{ backgroundColor: previewPalette.primary }} />
                  <div className="h-8 w-8 rounded-full border border-border" style={{ backgroundColor: previewPalette.secondary }} />
                </div>
              </div>

              <p style={{ fontFamily: previewPalette.body }} className="text-sm text-foreground/80">
                Posicionamento, oferta e ativos visuais alinhados para manter consistência em todo o sistema.
              </p>

              <div className="flex gap-3">
                <Button type="button">Primário</Button>
                <Button type="button" variant="outline">Secundário</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default BrandKit;