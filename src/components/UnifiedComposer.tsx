import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useProducts } from "@/hooks/useProducts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Wand2, Loader2, Target, Users, TrendingUp, ShoppingBag, 
  Sparkles, ArrowRight, Zap, MessageSquare
} from "lucide-react";
import { toast } from "sonner";

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

  const selectedObjective = CONTENT_OBJECTIVES.find(o => o.id === objective);
  
  // Auto-select format based on objective
  const handleObjectiveSelect = (objId: string) => {
    setObjective(objId);
    const obj = CONTENT_OBJECTIVES.find(o => o.id === objId);
    if (obj?.formats[0]) {
      setFormat(obj.formats[0]);
    }
  };

  // Quick theme suggestions based on profile
  const themeSuggestions = [
    profile?.dor_principal && `Como resolver: ${profile.dor_principal}`,
    profile?.promessa_principal,
    profile?.nome_metodo && `O que é o ${profile.nome_metodo}`,
    "3 erros que sabotam seus resultados",
    "O que eu gostaria de ter sabido antes",
  ].filter(Boolean).slice(0, 4);

  // Product-based offers
  const offerSuggestions = products?.slice(0, 3).map(p => 
    `${p.nome} - R$ ${p.ticket}`
  ) || [];

  const handleGenerate = async () => {
    if (!theme.trim() || !objective) {
      toast.error("Preencha o tema e escolha um objetivo");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Determine post type based on objective
      const postType = selectedObjective?.postTypes[0] || "ESTRATEGIA_UTIL";
      
      const data: GeneratedContent = {
        objective,
        format,
        theme,
        offer: offer || undefined,
        postType,
      };

      if (onGenerate) {
        onGenerate(data);
      } else {
        // Navigate to carousel creator with pre-filled data
        const params = new URLSearchParams({
          theme,
          postType,
          objective,
          format,
          ...(offer && { offer }),
        });
        navigate(`/carousel-creator?${params.toString()}`);
      }
    } catch (error) {
      toast.error("Erro ao gerar conteúdo");
    } finally {
      setIsGenerating(false);
    }
  };

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
          onClick={handleGenerate}
          disabled={isGenerating || !theme.trim() || !objective}
          className="w-full h-12 text-base"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <Wand2 className="h-5 w-5 mr-2" />
              Gerar Conteúdo
              <ArrowRight className="h-5 w-5 ml-2" />
            </>
          )}
        </Button>

        {/* Info */}
        <p className="text-xs text-center text-muted-foreground">
          A IA vai criar o conteúdo usando seu perfil, método e identidade visual
        </p>
      </CardContent>
    </Card>
  );
}