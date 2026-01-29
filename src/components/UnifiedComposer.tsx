import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useProducts } from "@/hooks/useProducts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Wand2, Loader2, Target, Users, ShoppingBag, 
  Sparkles, ArrowRight, Zap, MessageSquare, ChevronRight,
  FileText, Layout, Quote
} from "lucide-react";
import { toast } from "sonner";
import { CarouselData, PostType } from "@/hooks/useCarouselGenerator";

// Objective-based content system
const CONTENT_OBJECTIVES = [
  {
    id: "atrair",
    label: "Atrair",
    subtitle: "Alcance e descoberta",
    description: "Conteúdo viral para novos seguidores",
    icon: Users,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    postTypes: ["ALCANCE", "DOR_EVENTO", "CONTRA_MERCADO"],
    formats: ["carousel", "reels_script"],
  },
  {
    id: "aquecer",
    label: "Aquecer",
    subtitle: "Conexão e autoridade",
    description: "Construir confiança e relacionamento",
    icon: Target,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    postTypes: ["COMO_FIZ", "SUPERACAO", "NAO_SOBRE"],
    formats: ["carousel", "story_sequence"],
  },
  {
    id: "converter",
    label: "Converter",
    subtitle: "Venda e ação",
    description: "Levar à ação ou compra",
    icon: ShoppingBag,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    postTypes: ["PROMESSA", "ESTRATEGIA_UTIL", "LEVANTADA_MAO"],
    formats: ["carousel", "single_post"],
  },
];

const FORMAT_OPTIONS = [
  { id: "carousel", label: "Carrossel", description: "5-7 slides educativos" },
  { id: "single_post", label: "Post Único", description: "Imagem + legenda" },
  { id: "story_sequence", label: "Stories", description: "Sequência de 5-7 stories" },
  { id: "reels_script", label: "Roteiro Reels", description: "Script + ganchos" },
];

interface UnifiedComposerProps {
  onGenerate?: (data: GeneratedContent) => void;
}

export interface GeneratedContent {
  objective: string;
  format: string;
  theme: string;
  offer?: string;
  postType: string;
  draft?: CarouselData;
}

export function UnifiedComposer({ onGenerate }: UnifiedComposerProps) {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { products } = useProducts();
  
  const [objective, setObjective] = useState<string | null>(null);
  const [format, setFormat] = useState<string>("carousel");
  const [theme, setTheme] = useState("");
  const [offer, setOffer] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [draft, setDraft] = useState<CarouselData | null>(null);

  const selectedObjective = CONTENT_OBJECTIVES.find(o => o.id === objective);
  
  const handleObjectiveSelect = (objId: string) => {
    setObjective(objId);
    const obj = CONTENT_OBJECTIVES.find(o => o.id === objId);
    if (obj?.formats[0]) {
      setFormat(obj.formats[0]);
    }
  };

  const themeSuggestions = [
    profile?.dor_principal && `Como resolver: ${profile.dor_principal}`,
    profile?.promessa_principal,
    profile?.nome_metodo && `O que é o ${profile.nome_metodo}`,
    "3 erros que sabotam seus resultados",
    "O que eu gostaria de ter sabido antes",
  ].filter(Boolean).slice(0, 4);

  const offerSuggestions = products?.slice(0, 3).map(p => 
    `${p.nome} - R$ ${p.ticket}`
  ) || [];

  const handleGenerateDraft = async () => {
    if (!theme.trim() || !objective) {
      toast.error("Preencha o tema e escolha um objetivo");
      return;
    }

    setIsGenerating(true);
    setDraft(null);
    
    try {
      const postType = selectedObjective?.postTypes[0] || "ESTRATEGIA_UTIL";
      const contentPillar = selectedObjective?.label || "Educativo";

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-carousel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          topic: theme,
          postType,
          contentPillar,
          profile,
          products,
          customInstructions: offer ? `Oferta/CTA: ${offer}` : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao gerar rascunho");
      }

      const data: CarouselData = await response.json();
      setDraft(data);
      toast.success("Rascunho gerado com sucesso!");
    } catch (error) {
      console.error("Generate draft error:", error);
      toast.error("Erro ao gerar rascunho. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContinueToDesign = () => {
    if (!draft || !objective) return;

    const postType = selectedObjective?.postTypes[0] || "ESTRATEGIA_UTIL";
    
    const data: GeneratedContent = {
      objective,
      format,
      theme,
      offer: offer || undefined,
      postType,
      draft,
    };

    if (onGenerate) {
      onGenerate(data);
    } else {
      // Navigate to carousel creator with draft data in state
      // We also pass autoGenerateDesign: true to trigger design generation immediately
      navigate(`/carousel-creator`, { 
        state: { 
          initialData: draft,
          metadata: { theme, postType, objective, format, offer },
          autoGenerateDesign: true
        } 
      });
    }
  };

  if (draft) {
    return (
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 overflow-hidden">
        <CardHeader className="bg-primary/5 border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Rascunho Gerado</CardTitle>
                <CardDescription>{draft.titulo}</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setDraft(null)}>
              Refazer
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px] p-6">
            <div className="space-y-6">
              {/* Slides Preview */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                  <Layout className="h-4 w-4" /> Estrutura de Slides
                </h4>
                <div className="grid gap-3">
                  {draft.slides.map((slide, i) => (
                    <div key={i} className="p-3 rounded-lg bg-background border border-primary/10 shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px] h-4 px-1">Slide {slide.numero}</Badge>
                        <span className="text-[10px] uppercase font-bold text-primary/60">{slide.tipo}</span>
                      </div>
                      <p className="text-sm font-medium">{slide.headline}</p>
                      {slide.subtexto && <p className="text-xs text-muted-foreground mt-1">{slide.subtexto}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Caption Preview */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                  <Quote className="h-4 w-4" /> Legenda Sugerida
                </h4>
                <div className="p-4 rounded-lg bg-muted/50 text-sm whitespace-pre-wrap italic text-muted-foreground border-l-4 border-primary/30">
                  {draft.legenda}
                </div>
              </div>
            </div>
          </ScrollArea>
          
          <div className="p-4 bg-background border-t flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setDraft(null)}>
              Editar Tema
            </Button>
            <Button className="flex-1" onClick={handleContinueToDesign}>
              Criar Design <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Zap className="h-6 w-6 text-primary" />
          Criar Conteúdo
        </CardTitle>
        <CardDescription className="text-base">
          Tema + Objetivo = Post pronto em segundos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Step 1: Theme */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</span>
            Qual é o tema?
          </label>
          <Textarea
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="Ex: Por que dietas restritivas não funcionam a longo prazo"
            rows={2}
            className="resize-none"
          />
          {themeSuggestions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {themeSuggestions.map((suggestion, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary/20 transition-colors"
                  onClick={() => setTheme(suggestion as string)}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {(suggestion as string).substring(0, 40)}...
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Objective */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</span>
            Qual é o objetivo?
          </label>
          <div className="grid grid-cols-3 gap-3">
            {CONTENT_OBJECTIVES.map((obj) => (
              <button
                key={obj.id}
                onClick={() => handleObjectiveSelect(obj.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  objective === obj.id
                    ? `${obj.borderColor} ${obj.bgColor} ring-2 ring-primary/30 ring-offset-2`
                    : "hover:border-muted-foreground/30"
                }`}
              >
                <obj.icon className={`h-6 w-6 mb-2 ${obj.color}`} />
                <p className="font-semibold">{obj.label}</p>
                <p className="text-xs text-muted-foreground">{obj.subtitle}</p>
              </button>
            ))}
          </div>
          {selectedObjective && (
            <p className="text-sm text-muted-foreground pl-8">
              {selectedObjective.description}
            </p>
          )}
        </div>

        {/* Step 3: Offer/CTA (Optional) */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold">3</span>
            Oferta ou CTA (opcional)
          </label>
          <Input
            value={offer}
            onChange={(e) => setOffer(e.target.value)}
            placeholder="Ex: Agende sua consulta, Link na bio, Comente 'EU QUERO'"
          />
          {offerSuggestions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {offerSuggestions.map((suggestion, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => setOffer(suggestion)}
                >
                  <ShoppingBag className="h-3 w-3 mr-1" />
                  {suggestion}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Format Selection */}
        {objective && (
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground">Formato</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {FORMAT_OPTIONS.map((f) => {
                const isRecommended = selectedObjective?.formats.includes(f.id);
                return (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      format === f.id
                        ? "border-primary bg-primary/10"
                        : "hover:border-muted-foreground/30"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{f.label}</p>
                      {isRecommended && (
                        <Badge variant="secondary" className="text-[10px] px-1">
                          ✓
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{f.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Generate Button */}
        <Button 
          onClick={handleGenerateDraft}
          disabled={isGenerating || !theme.trim() || !objective}
          className="w-full h-12 text-base"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Gerando Rascunho...
            </>
          ) : (
            <>
              <Wand2 className="h-5 w-5 mr-2" />
              Gerar Rascunho
              <ArrowRight className="h-5 w-5 ml-2" />
            </>
          )}
        </Button>

        {/* Info */}
        <p className="text-xs text-center text-muted-foreground">
          A IA vai criar o texto usando seu perfil, método e tom de voz
        </p>
      </CardContent>
    </Card>
  );
}
