import { useMemo, useState, type ChangeEvent } from "react";
import { Upload, Image as ImageIcon, Palette, Type, Loader2 } from "lucide-react";
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