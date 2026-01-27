import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
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
];

export function BrandKit() {
  const { profile, updateProfile, loading: profileLoading } = useProfile();
  const [isSaving, setIsSaving] = useState(false);
  
  // Local state from profile
  const [primaryColor, setPrimaryColor] = useState(profile?.brand_primary_color || "#6366f1");
  const [secondaryColor, setSecondaryColor] = useState(profile?.brand_secondary_color || "#ec4899");
  const [neutralColor, setNeutralColor] = useState(profile?.brand_neutral_color || "#64748b");
  const [fontTitle, setFontTitle] = useState(profile?.brand_font_title || "inter");
  const [fontBody, setFontBody] = useState(profile?.brand_font_body || "inter");
  const [brandStyle, setBrandStyle] = useState(profile?.brand_style || "minimal");
  const [brandLocked, setBrandLocked] = useState(profile?.brand_locked || false);

  // Update local state when profile loads
  useState(() => {
    if (profile) {
      setPrimaryColor(profile.brand_primary_color || "#6366f1");
      setSecondaryColor(profile.brand_secondary_color || "#ec4899");
      setNeutralColor(profile.brand_neutral_color || "#64748b");
      setFontTitle(profile.brand_font_title || "inter");
      setFontBody(profile.brand_font_body || "inter");
      setBrandStyle(profile.brand_style || "minimal");
      setBrandLocked(profile.brand_locked || false);
    }
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        brand_primary_color: primaryColor,
        brand_secondary_color: secondaryColor,
        brand_neutral_color: neutralColor,
        brand_font_title: fontTitle,
        brand_font_body: fontBody,
        brand_style: brandStyle,
        brand_locked: brandLocked,
      });
      toast.success("Kit de marca salvo!");
    } catch (error) {
      toast.error("Erro ao salvar");
    } finally {
      setIsSaving(false);
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
                    className={`p-3 rounded-lg border text-left transition-all ${
                      fontTitle === font.id
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
                    className={`p-3 rounded-lg border text-left transition-all ${
                      fontBody === font.id
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
                className={`p-4 rounded-xl border text-left transition-all ${
                  brandStyle === style.id
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
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="font-medium">Logo Principal</p>
              <p className="text-xs text-muted-foreground mb-3">PNG transparente recomendado</p>
              <Button variant="outline" size="sm" disabled>
                Em breve
              </Button>
            </div>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="font-medium">Marca d'água</p>
              <p className="text-xs text-muted-foreground mb-3">Aparece nos slides</p>
              <Button variant="outline" size="sm" disabled>
                Em breve
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
            className="aspect-square max-w-sm mx-auto rounded-xl shadow-lg p-8 flex flex-col justify-center items-center text-center"
            style={{ 
              background: `linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}15)`,
              borderColor: primaryColor,
              borderWidth: 2
            }}
          >
            <div 
              className="w-12 h-12 rounded-full mb-4"
              style={{ backgroundColor: primaryColor }}
            />
            <h3 
              className="text-xl font-bold mb-2"
              style={{ color: primaryColor }}
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