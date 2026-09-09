import { useEffect, useState, type ChangeEvent } from "react";
import { Image as ImageIcon, Instagram, Loader2, Palette, Pencil, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAssets } from "@/hooks/useAssets";
import { useAuth } from "@/hooks/useAuth";
import type { Profile } from "@/hooks/useProfile";
import { useBrand } from "@/contexts/BrandContext";
import { supabase } from "@/integrations/supabase/client";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const TITLE_FONTS = ["Space Grotesk", "Merriweather", "Montserrat", "Playfair Display"];
const BODY_FONTS = ["Inter", "Source Sans 3", "DM Sans", "Lora"];

type UploadKind = "logo" | "watermark";

type VisualDraft = {
  primary: string;
  secondary: string;
  neutral: string;
  heading: string;
  body: string;
  instagram: string;
};

type BrandKitProps = {
  profile: Profile | null;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
};

export function BrandKit({ profile, updateProfile }: BrandKitProps) {
  const { user } = useAuth();
  const { addAsset } = useAssets();
  const { brand, updateBrand } = useBrand();
  const [editOpen, setEditOpen] = useState(false);
  const [uploading, setUploading] = useState<UploadKind | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draft, setDraft] = useState<VisualDraft>({
    primary: brand.primary,
    secondary: brand.secondary,
    neutral: brand.background,
    heading: brand.fontHeading,
    body: brand.fontBody,
    instagram: "",
  });

  useEffect(() => {
    setDraft({
      primary: profile?.brand_primary_color || brand.primary,
      secondary: profile?.brand_secondary_color || brand.secondary,
      neutral: profile?.brand_neutral_color || brand.background,
      heading: profile?.brand_font_title || brand.fontHeading,
      body: profile?.brand_font_body || brand.fontBody,
      instagram: profile?.instagram_handle || "",
    });
  }, [profile, brand]);

  const handleDialogChange = (open: boolean) => {
    if (open) {
      setDraft({
        primary: profile?.brand_primary_color || brand.primary,
        secondary: profile?.brand_secondary_color || brand.secondary,
        neutral: profile?.brand_neutral_color || brand.background,
        heading: profile?.brand_font_title || brand.fontHeading,
        body: profile?.brand_font_body || brand.fontBody,
        instagram: profile?.instagram_handle || "",
      });
    }
    setEditOpen(open);
  };

  const saveVisualIdentity = async (nextDraft = draft) => {
    const validColor = /^#[0-9a-f]{6}$/i;
    if (![nextDraft.primary, nextDraft.secondary, nextDraft.neutral].every((color) => validColor.test(color))) {
      toast.error("Use cores no formato hexadecimal, como #7C3AED.");
      return false;
    }

    setIsSaving(true);
    const { error } = await updateProfile({
      brand_primary_color: nextDraft.primary,
      brand_secondary_color: nextDraft.secondary,
      brand_neutral_color: nextDraft.neutral,
      brand_font_title: nextDraft.heading,
      brand_font_body: nextDraft.body,
      instagram_handle: nextDraft.instagram.replace(/^@/, "").trim(),
    });
    setIsSaving(false);

    if (error) {
      toast.error("Não foi possível salvar a identidade visual.");
      return false;
    }

    updateBrand({
      primary: nextDraft.primary,
      secondary: nextDraft.secondary,
      background: nextDraft.neutral,
      fontHeading: nextDraft.heading,
      fontBody: nextDraft.body,
    });
    return true;
  };

  const handleSave = async () => {
    if (await saveVisualIdentity()) {
      toast.success("Identidade visual salva.");
      setEditOpen(false);
    }
  };

  const handleMagicImport = async () => {
    const cleanHandle = draft.instagram.replace(/^@/, "").trim();
    if (cleanHandle.length < 2) {
      toast.error("Digite um usuário válido do Instagram.");
      return;
    }

    setIsImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-brand-palette", {
        body: {
          instagram_handle: cleanHandle,
          nicho: profile?.nicho || "",
          sub_nicho: profile?.sub_nicho || "",
          persona: profile?.persona_ideal || "",
          nome: profile?.nome || "",
        },
      });
      if (error) throw error;
      if (!data?.palette) throw new Error("A IA não retornou uma paleta válida.");

      const generatedDraft: VisualDraft = {
        primary: data.palette.primary,
        secondary: data.palette.secondary,
        neutral: data.palette.neutral,
        heading: data.palette.font_title || "Space Grotesk",
        body: data.palette.font_body || "Inter",
        instagram: cleanHandle,
      };

      setDraft(generatedDraft);
      if (await saveVisualIdentity(generatedDraft)) {
        toast.success("Identidade criada e salva pela IA.");
      }
    } catch (error) {
      console.error("Erro ao criar identidade visual:", error);
      toast.error("Não foi possível criar a identidade pelo Instagram.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>, kind: UploadKind) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Envie uma imagem PNG, JPG ou WEBP.");
      return;
    }

    setUploading(kind);
    try {
      const extension = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `${user.id}/${kind}-${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("assets").upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("assets").getPublicUrl(path);
      await addAsset({
        tipo: "brand",
        subtipo: kind,
        url: data.publicUrl,
        metadata: { filename: file.name, size: file.size, mimeType: file.type },
      });
      await updateProfile(kind === "logo" ? { brand_logo_url: data.publicUrl } : { brand_watermark_url: data.publicUrl });
      toast.success(kind === "logo" ? "Logo atualizado." : "Marca d’água atualizada.");
    } catch (error) {
      console.error("Erro ao enviar arquivo de marca:", error);
      toast.error("Não foi possível enviar a imagem.");
    } finally {
      setUploading(null);
      event.target.value = "";
    }
  };

  return (
    <>
      <section className="border border-border bg-card" aria-labelledby="visual-identity-title">
        <div className="flex items-center justify-between border-b border-border px-5 py-4 md:px-6">
          <div>
            <h3 id="visual-identity-title" className="font-semibold text-foreground">Identidade visual</h3>
            <p className="mt-1 text-xs text-muted-foreground">Aplicada automaticamente aos conteúdos.</p>
          </div>
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => handleDialogChange(true)}>
            <Pencil className="h-3.5 w-3.5" /> Editar identidade
          </Button>
        </div>

        <div className="grid divide-y divide-border sm:grid-cols-[1fr_1fr_1.2fr] sm:divide-x sm:divide-y-0">
          <div className="flex items-center gap-3 px-5 py-5 md:px-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden border border-border bg-muted/30">
              {profile?.brand_logo_url ? (
                <img src={profile.brand_logo_url} alt="Logo da marca" className="h-full w-full object-contain" loading="lazy" />
              ) : (
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Logo</p>
              <p className="mt-1 text-sm font-medium text-foreground">{profile?.brand_logo_url ? "Configurado" : "Não enviado"}</p>
            </div>
          </div>

          <div className="px-5 py-5 md:px-6">
            <p className="text-xs text-muted-foreground">Cores</p>
            <div className="mt-2 flex items-center gap-2" aria-label="Cores atuais da marca">
              {[draft.primary, draft.secondary, draft.neutral].map((color, index) => (
                <span key={`${color}-${index}`} className="h-8 w-8 border border-black/10" style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>

          <div className="px-5 py-5 md:px-6">
            <p className="text-xs text-muted-foreground">Fontes</p>
            <p className="mt-2 text-sm font-semibold text-foreground" style={{ fontFamily: draft.heading }}>{draft.heading}</p>
            <p className="mt-1 text-xs text-muted-foreground" style={{ fontFamily: draft.body }}>{draft.body} para textos</p>
          </div>
        </div>
      </section>

      <Dialog open={editOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Editar identidade visual</DialogTitle>
            <DialogDescription>Configure uma vez para manter todos os conteúdos consistentes.</DialogDescription>
          </DialogHeader>

          <div className="space-y-7 py-2">
            <section className="border border-primary/20 bg-primary/5 p-4">
              <div className="mb-4 flex items-start gap-3">
                <Instagram className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Criar pelo Instagram</h4>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">Informe seu usuário para a IA sugerir cores e fontes.</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
                  <Input
                    aria-label="Usuário do Instagram"
                    className="pl-8"
                    value={draft.instagram}
                    onChange={(event) => setDraft((current) => ({ ...current, instagram: event.target.value }))}
                    placeholder="seuinstagram"
                    disabled={isImporting}
                  />
                </div>
                <Button onClick={handleMagicImport} disabled={isImporting || isSaving} className="gap-2">
                  {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {isImporting ? "Criando..." : "Criar identidade"}
                </Button>
              </div>
            </section>

            <section>
              <h4 className="mb-4 text-sm font-semibold text-foreground">Cores da marca</h4>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { key: "primary", label: "Principal" },
                  { key: "secondary", label: "Apoio" },
                  { key: "neutral", label: "Fundo" },
                ].map((item) => {
                  const key = item.key as "primary" | "secondary" | "neutral";
                  return (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={`brand-${key}`}>{item.label}</Label>
                      <div className="flex gap-2">
                        <input
                          aria-label={`Selecionar cor ${item.label.toLowerCase()}`}
                          type="color"
                          value={draft[key]}
                          onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))}
                          className="h-10 w-12 cursor-pointer border border-border bg-transparent p-1"
                        />
                        <Input
                          id={`brand-${key}`}
                          value={draft[key]}
                          onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section>
              <h4 className="mb-4 text-sm font-semibold text-foreground">Fontes</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Para títulos</Label>
                  <Select value={draft.heading} onValueChange={(value) => setDraft((current) => ({ ...current, heading: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TITLE_FONTS.map((font) => <SelectItem key={font} value={font}>{font}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Para textos</Label>
                  <Select value={draft.body} onValueChange={(value) => setDraft((current) => ({ ...current, body: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BODY_FONTS.map((font) => <SelectItem key={font} value={font}>{font}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            <section>
              <h4 className="mb-4 text-sm font-semibold text-foreground">Arquivos da marca</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { kind: "logo" as const, label: "Logo", url: profile?.brand_logo_url },
                  { kind: "watermark" as const, label: "Marca d’água", url: profile?.brand_watermark_url },
                ].map((item) => (
                  <div key={item.kind} className="border border-border p-4">
                    <div className="mb-3 flex h-24 items-center justify-center overflow-hidden bg-muted/30">
                      {item.url ? (
                        <img src={item.url} alt={item.label} className="h-full w-full object-contain" loading="lazy" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <Label htmlFor={`upload-${item.kind}`} className="mb-2 block">{item.label}</Label>
                    <div className="relative">
                      <Input
                        id={`upload-${item.kind}`}
                        type="file"
                        accept={ACCEPTED_TYPES.join(",")}
                        onChange={(event) => handleUpload(event, item.kind)}
                        disabled={uploading !== null}
                      />
                      {uploading === item.kind && (
                        <span className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Enviando...
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleDialogChange(false)} disabled={isSaving || isImporting}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving || isImporting} className="gap-2">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {isSaving ? "Salvando..." : "Salvar identidade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default BrandKit;
