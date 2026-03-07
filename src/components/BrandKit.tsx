import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ColorPicker } from "./ColorPicker";
import {
  Palette, Type, Image, Lock, Unlock, Save, Loader2,
  Check, Upload, Sparkles, Eye
} from "lucide-react";
import { toast } from "sonner";

const BRAND_STYLES = [
  {
    id: "minimal",
    label: "Minimalista",
    description: "Clean, moderno e sofisticado",
    preview: "bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900"
  },
  {
    id: "clinical",
    label: "Clínico",
    description: "Profissional e confiável",
    preview: "bg-gradient-to-br from-sky-50 to-cyan-50 text-sky-900"
  },
  {
    id: "premium",
    label: "Premium",
    description: "Elegante e exclusivo",
    preview: "bg-gradient-to-br from-amber-50 to-orange-50 text-amber-900"
  },
  {
    id: "bold",
    label: "Vibrante",
    description: "Energético e marcante",
    preview: "bg-gradient-to-br from-pink-50 to-rose-50 text-pink-900"
  },
  {
    id: "warm",
    label: "Acolhedor",
    description: "Amigável e acessível",
    preview: "bg-gradient-to-br from-orange-50 to-yellow-50 text-orange-900"
  },
];

const FONT_OPTIONS = [
  { id: "inter", label: "Inter", category: "Sans-serif moderna" },
  { id: "playfair", label: "Playfair Display", category: "Serif elegante" },
  { id: "montserrat", label: "Montserrat", category: "Sans-serif geométrica" },
  { id: "lora", label: "Lora", category: "Serif clássica" },
  { id: "poppins", label: "Poppins", category: "Sans-serif arredondada" },
  { id: "outfit", label: "Outfit", category: "Sans-serif geométrica" },
  { id: "baskerville", label: "Libre Baskerville", category: "Serif tradicional" },
];

const BRANDING_PRESETS = [
  {
    name: "Elite Blue",
    primary: "#0f172a",
    secondary: "#38bdf8",
    neutral: "#94a3b8",
    fontTitle: "montserrat",
    fontBody: "inter",
    style: "premium"
  },
  {
    name: "Nature Vitality",
    primary: "#064e3b",
    secondary: "#10b981",
    neutral: "#6b7280",
    fontTitle: "playfair",
    fontBody: "lora",
    style: "minimal"
  },
  {
    name: "Modern Health",
    primary: "#4f46e5",
    secondary: "#818cf8",
    neutral: "#4b5563",
    fontTitle: "poppins",
    fontBody: "inter",
    style: "clinical"
  },
  {
    name: "Soft Glow",
    primary: "#be185d",
    secondary: "#fb7185",
    neutral: "#4a5568",
    fontTitle: "inter",
    fontBody: "lora",
    style: "warm"
  },
  {
    name: "Luxury Gold",
    primary: "#1c1917",
    secondary: "#eab308",
    neutral: "#78716c",
    fontTitle: "playfair",
    fontBody: "inter",
    style: "premium"
  },
  {
    name: "Pure Health",
    primary: "#1e3a8a",
    secondary: "#60a5fa",
    neutral: "#64748b",
    fontTitle: "outfit",
    fontBody: "inter",
    style: "clinical"
  },
  {
    name: "Organic Calm",
    primary: "#365314",
    secondary: "#a3e635",
    neutral: "#71717a",
    fontTitle: "lora",
    fontBody: "inter",
    style: "minimal"
  },
  {
    name: "High Focus",
    primary: "#581c87",
    secondary: "#d8b4fe",
    neutral: "#52525b",
    fontTitle: "poppins",
    fontBody: "inter",
    style: "bold"
  }
];

import { useAISpecialist } from "@/hooks/useAISpecialist";

export function BrandKit() {
  const { profile, updateProfile, loading: profileLoading } = useProfile();
  const { generateContent, isLoading: aiLoading } = useAISpecialist();
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingBranding, setIsGeneratingBranding] = useState(false);

  // Local state from profile
  const [primaryColor, setPrimaryColor] = useState("#6366f1");
  const [secondaryColor, setSecondaryColor] = useState("#ec4899");
  const [neutralColor, setNeutralColor] = useState("#64748b");
  const [fontTitle, setFontTitle] = useState("inter");
  const [fontBody, setFontBody] = useState("inter");
  const [brandStyle, setBrandStyle] = useState("minimal");
  const [brandLocked, setBrandLocked] = useState(false);
  const [brandLogoUrl, setBrandLogoUrl] = useState<string | null>(null);
  const [brandWatermarkUrl, setBrandWatermarkUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<string | null>(null); // 'logo' | 'watermark' | null

  // Update local state when profile loads
  useEffect(() => {
    if (profile) {
      setPrimaryColor(profile.brand_primary_color || "#6366f1");
      setSecondaryColor(profile.brand_secondary_color || "#ec4899");
      setNeutralColor(profile.brand_neutral_color || "#64748b");
      setFontTitle(profile.brand_font_title || "inter");
      setFontBody(profile.brand_font_body || "inter");
      setBrandStyle(profile.brand_style || "minimal");
      setBrandLocked(profile.brand_locked || false);
      setBrandLogoUrl(profile.brand_logo_url || null);
      setBrandWatermarkUrl(profile.brand_watermark_url || null);
    }
  }, [profile]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'watermark') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("O arquivo deve ter no máximo 5MB");
      return;
    }

    setIsUploading(type);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `brand-assets/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath);

      if (type === 'logo') setBrandLogoUrl(publicUrl);
      else setBrandWatermarkUrl(publicUrl);

      toast.success(`${type === 'logo' ? 'Logo' : 'Marca d\'água'} carregada com sucesso!`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Erro ao carregar arquivo");
    } finally {
      setIsUploading(null);
    }
  };

  const handleGenerateBrandingIA = async () => {
    setIsGeneratingBranding(true);
    try {
      const prompt = `Crie uma identidade visual estratégica (paleta de cores e tipografia) para este profissional de nutrição. 
      Leve em conta o nicho: ${profile?.nicho}, persona: ${profile?.persona_ideal} e promessa: ${profile?.promessa_principal}.
      
      RETORNE APENAS UM JSON no seguinte formato:
      {
        "primaryColor": "#hexcode",
        "secondaryColor": "#hexcode",
        "neutralColor": "#hexcode",
        "fontTitle": "inter|playfair|montserrat|lora|poppins",
        "fontBody": "inter|playfair|montserrat|lora|poppins",
        "style": "minimal|clinical|premium|bold|warm",
        "explanation": "brevíssima explicação da escolha"
      }`;

      const response = await generateContent("brand_architect", "branding_suggestion", { prompt });

      // Attempt to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        setPrimaryColor(data.primaryColor);
        setSecondaryColor(data.secondaryColor);
        setNeutralColor(data.neutralColor);
        setFontTitle(data.fontTitle);
        setFontBody(data.fontBody);
        setBrandStyle(data.style);
        toast.success("Identidade sugerida com sucesso!");
        if (data.explanation) toast.info(data.explanation, { duration: 5000 });
      } else {
        throw new Error("Não foi possível gerar a sugestão em formato válido.");
      }
    } catch (error) {
      console.error("AI Branding error:", error);
      toast.error("Erro ao gerar sugestão da IA");
    } finally {
      setIsGeneratingBranding(false);
    }
  };

  const applyPreset = (preset: typeof BRANDING_PRESETS[0]) => {
    setPrimaryColor(preset.primary);
    setSecondaryColor(preset.secondary);
    setNeutralColor(preset.neutral);
    setFontTitle(preset.fontTitle);
    setFontBody(preset.fontBody);
    setBrandStyle(preset.style);
    toast.success(`Preset "${preset.name}" aplicado!`);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateProfile({
        brand_primary_color: primaryColor,
        brand_secondary_color: secondaryColor,
        brand_neutral_color: neutralColor,
        brand_font_title: fontTitle,
        brand_font_body: fontBody,
        brand_style: brandStyle,
        brand_locked: brandLocked,
        brand_logo_url: brandLogoUrl,
        brand_watermark_url: brandWatermarkUrl,
      });

      if (result.error) throw result.error;
      toast.success("Kit de marca salvo!");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Erro ao salvar o kit de marca");
    } finally {
      setIsSaving(false);
    }
  };

  const getFontFamily = (fontId: string) => {
    switch (fontId) {
      case 'playfair': return "'Playfair Display', serif";
      case 'montserrat': return "'Montserrat', sans-serif";
      case 'lora': return "'Lora', serif";
      case 'poppins': return "'Poppins', sans-serif";
      case 'outfit': return "'Outfit', sans-serif";
      case 'baskerville': return "'Libre Baskerville', serif";
      default: return "'Inter', sans-serif";
    }
  };

  const selectedStyle = BRAND_STYLES.find(s => s.id === brandStyle);

  return (
    <div className="space-y-6">
      {/* Header with Lock Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Palette className="h-6 w-6 text-primary" />
            Kit de Marca
          </h2>
          <p className="text-muted-foreground">
            Configure sua identidade visual para todos os designs
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {brandLocked ? (
              <Lock className="h-4 w-4 text-primary" />
            ) : (
              <Unlock className="h-4 w-4 text-muted-foreground" />
            )}
            <Label htmlFor="brand-lock" className="text-sm">
              {brandLocked ? "Marca travada" : "Modo livre"}
            </Label>
            <Switch
              id="brand-lock"
              checked={brandLocked}
              onCheckedChange={setBrandLocked}
            />
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </>
            )}
          </Button>
        </div>
      </div>

      {brandLocked && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 flex items-center gap-3">
            <Lock className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Marca Travada</p>
              <p className="text-sm text-muted-foreground">
                Todos os designs gerados vão usar automaticamente essas configurações
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* IA Suggestions & Presets */}
        <Card className="lg:col-span-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              Sugestões Inteligentes
            </CardTitle>
            <CardDescription>
              Deixe a IA criar sua marca ou escolha uma de nossas combinações prontas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/50 p-4 rounded-xl border border-primary/10">
              <div className="space-y-1">
                <p className="font-bold text-sm">Gerar Identidade Única</p>
                <p className="text-xs text-muted-foreground">A IA analisará sua estratégia para sugerir o visual perfeito</p>
              </div>
              <Button
                onClick={handleGenerateBrandingIA}
                disabled={isGeneratingBranding}
                className="w-full md:w-auto bg-primary hover:bg-primary/90"
              >
                {isGeneratingBranding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Sugerir com IA
              </Button>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Paletas Pre-Prontas</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {BRANDING_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className="group flex flex-col items-center gap-2 p-2 rounded-lg border bg-white hover:border-primary transition-all shadow-sm"
                  >
                    <div className="flex w-full h-8 rounded-md overflow-hidden shadow-inner">
                      <div className="flex-1" style={{ backgroundColor: preset.primary }} />
                      <div className="flex-1" style={{ backgroundColor: preset.secondary }} />
                      <div className="flex-1" style={{ backgroundColor: preset.neutral }} />
                    </div>
                    <span className="text-[10px] font-bold truncate w-full text-center">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Colors Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Palette className="h-5 w-5" />
              Paleta de Cores
            </CardTitle>
            <CardDescription>
              Defina as cores da sua marca
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Primária</Label>
                <ColorPicker
                  color={primaryColor}
                  onChange={setPrimaryColor}
                  label="Primária"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-8 text-xs font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Secundária</Label>
                <ColorPicker
                  color={secondaryColor}
                  onChange={setSecondaryColor}
                  label="Secundária"
                />
                <Input
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="h-8 text-xs font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Neutra</Label>
                <ColorPicker
                  color={neutralColor}
                  onChange={setNeutralColor}
                  label="Neutra"
                />
                <Input
                  value={neutralColor}
                  onChange={(e) => setNeutralColor(e.target.value)}
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            {/* Preview */}
            <Separator />
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Prévia da Paleta</Label>
              <div className="flex gap-2 p-4 bg-muted/50 rounded-lg">
                <div
                  className="flex-1 h-16 rounded-lg shadow-sm flex items-center justify-center text-white text-xs font-medium"
                  style={{ backgroundColor: primaryColor }}
                >
                  Primária
                </div>
                <div
                  className="flex-1 h-16 rounded-lg shadow-sm flex items-center justify-center text-white text-xs font-medium"
                  style={{ backgroundColor: secondaryColor }}
                >
                  Secundária
                </div>
                <div
                  className="flex-1 h-16 rounded-lg shadow-sm flex items-center justify-center text-white text-xs font-medium"
                  style={{ backgroundColor: neutralColor }}
                >
                  Neutra
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Typography Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Type className="h-5 w-5" />
              Tipografia
            </CardTitle>
            <CardDescription>
              Escolha as fontes para títulos e texto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Fonte de Títulos</Label>
              <div className="grid grid-cols-2 gap-2">
                {FONT_OPTIONS.slice(0, 4).map((font) => (
                  <button
                    key={font.id}
                    onClick={() => setFontTitle(font.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${fontTitle === font.id
                      ? "border-primary bg-primary/5"
                      : "hover:border-muted-foreground/50"
                      }`}
                  >
                    <p className="font-medium">{font.label}</p>
                    <p className="text-xs text-muted-foreground">{font.category}</p>
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Fonte de Texto</Label>
              <div className="grid grid-cols-2 gap-2">
                {FONT_OPTIONS.slice(0, 4).map((font) => (
                  <button
                    key={font.id}
                    onClick={() => setFontBody(font.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${fontBody === font.id
                      ? "border-primary bg-primary/5"
                      : "hover:border-muted-foreground/50"
                      }`}
                  >
                    <p className="font-medium">{font.label}</p>
                    <p className="text-xs text-muted-foreground">{font.category}</p>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Styles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5" />
            Estilo Visual
          </CardTitle>
          <CardDescription>
            Escolha o estilo geral dos seus designs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {BRAND_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => setBrandStyle(style.id)}
                className={`p-4 rounded-xl border text-left transition-all ${brandStyle === style.id
                  ? "border-primary ring-2 ring-primary/20"
                  : "hover:border-muted-foreground/50"
                  }`}
              >
                <div className={`w-full aspect-square rounded-lg mb-3 ${style.preview}`} />
                <p className="font-medium text-sm">{style.label}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{style.description}</p>
                {brandStyle === style.id && (
                  <Badge variant="default" className="mt-2 text-xs">
                    <Check className="h-3 w-3 mr-1" /> Selecionado
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Logo & Watermark */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Image className="h-5 w-5" />
            Logo & Marca d'água
          </CardTitle>
          <CardDescription>
            Adicione elementos visuais da sua marca (em breve)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className={`border-2 border-dashed rounded-lg p-8 text-center relative transition-all ${brandLogoUrl ? 'border-primary/50 bg-primary/5' : 'border-muted'}`}>
              <Input
                type="file"
                className="hidden"
                id="logo-upload"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'logo')}
                disabled={!!isUploading}
              />
              <Label htmlFor="logo-upload" className="cursor-pointer block">
                {brandLogoUrl ? (
                  <div className="relative aspect-video w-full max-w-[200px] mx-auto mb-2 group">
                    <img src={brandLogoUrl} alt="Logo" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                      <Upload className="h-5 w-5 text-white" />
                    </div>
                  </div>
                ) : (
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                )}
                <p className="font-medium">Logo Principal</p>
                <p className="text-xs text-muted-foreground mb-3">PNG transparente recomendado</p>
              </Label>
              <Button
                variant="outline"
                size="sm"
                disabled={!!isUploading}
                onClick={() => document.getElementById('logo-upload')?.click()}
              >
                {isUploading === 'logo' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : brandLogoUrl ? (
                  "Alterar Logo"
                ) : (
                  "Carregar"
                )}
              </Button>
            </div>

            <div className={`border-2 border-dashed rounded-lg p-8 text-center relative transition-all ${brandWatermarkUrl ? 'border-primary/50 bg-primary/5' : 'border-muted'}`}>
              <Input
                type="file"
                className="hidden"
                id="watermark-upload"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'watermark')}
                disabled={!!isUploading}
              />
              <Label htmlFor="watermark-upload" className="cursor-pointer block">
                {brandWatermarkUrl ? (
                  <div className="relative aspect-video w-full max-w-[200px] mx-auto mb-2 group">
                    <img src={brandWatermarkUrl} alt="Marca d'água" className="w-full h-full object-contain opacity-60" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                      <Upload className="h-5 w-5 text-white" />
                    </div>
                  </div>
                ) : (
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                )}
                <p className="font-medium">Marca d'água</p>
                <p className="text-xs text-muted-foreground mb-3">Aparece nos slides</p>
              </Label>
              <Button
                variant="outline"
                size="sm"
                disabled={!!isUploading}
                onClick={() => document.getElementById('watermark-upload')?.click()}
              >
                {isUploading === 'watermark' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : brandWatermarkUrl ? (
                  "Alterar Marca"
                ) : (
                  "Carregar"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Card */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="h-5 w-5" />
            Prévia do Design
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="aspect-square max-w-sm mx-auto rounded-xl shadow-lg p-8 flex flex-col justify-center items-center text-center relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}15)`,
              borderColor: primaryColor,
              borderWidth: 2,
              fontFamily: getFontFamily(fontBody)
            }}
          >
            {/* Watermark effect in preview */}
            {brandWatermarkUrl && (
              <img
                src={brandWatermarkUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-contain opacity-10 pointer-events-none"
              />
            )}

            {brandLogoUrl ? (
              <img src={brandLogoUrl} alt="Logo Preview" className="h-16 w-auto mb-4 object-contain" />
            ) : (
              <div
                className="w-12 h-12 rounded-full mb-4"
                style={{ backgroundColor: primaryColor }}
              />
            )}

            <h3
              className="text-xl font-bold mb-2"
              style={{ color: primaryColor, fontFamily: getFontFamily(fontTitle) }}
            >
              Headline do Slide
            </h3>
            <p
              className="text-sm"
              style={{ color: neutralColor }}
            >
              Este é o texto de apoio que aparece nos seus slides, usando a cor neutra da sua marca.
            </p>
            <div
              className="mt-4 px-4 py-2 rounded-full text-white text-sm font-medium"
              style={{ backgroundColor: secondaryColor }}
            >
              Chamada para Ação
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}