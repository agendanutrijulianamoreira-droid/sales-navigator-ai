import { useState, useCallback, useEffect } from "react";
import { useProfile } from "./useProfile";
import { useProducts } from "./useProducts";
import { useToast } from "./use-toast";
import { useBrand } from "@/contexts/BrandContext";
import { useCredits } from "./useCredits";
import { supabase } from "@/integrations/supabase/client";

export interface CarouselSlide {
  numero: number;
  tipo: string;
  layout?: 'capa' | 'topicos' | 'cta'; // Novo campo de layout
  headline: string;
  subtexto?: string;
  destaque?: string;
  imageUrl?: string;
  backgroundImageUrl?: string; // New field for user-selected background photo
}

export interface CarouselData {
  id?: string;
  titulo: string;
  slides: CarouselSlide[];
  legenda: string;
  cta_stories?: string;
}

export interface WeekContent {
  id: string;
  dayOfWeek: number;
  topic: string;
  postType: PostType;
  contentPillar: string;
  carousel: CarouselData | null;
  status: "pending" | "generated" | "edited";
}

export interface DesignSettings {
  style: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
}

export type PostType =
  | "STORYTELLING_RESULTADO"
  | "CONTRA_INTUITIVO"
  | "QUEBRA_OBJECAO"
  | "LISTA_AUTORIDADE"
  | "COMPARATIVO_ELITE"
  | "ANTES_DEPOIS_CONCEITUAL"
  | "CTA_DIRETO"
  | "MITO_VS_VERDADE"
  | "ROTINA_PRATICA";

export const POST_TYPE_LABELS: Record<PostType, string> = {
  STORYTELLING_RESULTADO: "Storytelling de Resultado",
  CONTRA_INTUITIVO: "Contra-intuitivo",
  QUEBRA_OBJECAO: "Quebra de Objeção",
  LISTA_AUTORIDADE: "Lista de Autoridade",
  COMPARATIVO_ELITE: "Comparativo de Elite",
  ANTES_DEPOIS_CONCEITUAL: "Antes e Depois Conceitual",
  CTA_DIRETO: "CTA Direto / Oferta",
  MITO_VS_VERDADE: "Mito vs Verdade",
  ROTINA_PRATICA: "Rotina Prática",
};

export const POST_TYPE_DESCRIPTIONS: Record<PostType, string> = {
  STORYTELLING_RESULTADO: "Conte a transformação de uma paciente — da dor ao resultado",
  CONTRA_INTUITIVO: "Quebre uma crença popular com um fato surpreendente",
  QUEBRA_OBJECAO: "Destrua a desculpa que impede a pessoa de agir",
  LISTA_AUTORIDADE: "Entregue valor denso em lista numerada",
  COMPARATIVO_ELITE: "Compare o caminho comum vs. o caminho ideal",
  ANTES_DEPOIS_CONCEITUAL: "Mostre transformação de mindset e hábitos (sem fotos de corpo)",
  CTA_DIRETO: "Post focado em conversão com oferta direta",
  MITO_VS_VERDADE: "Desmistifique informações erradas do nicho",
  ROTINA_PRATICA: "Mostre como aplicar algo no dia a dia real da paciente",
};

export type FunnelStage = "ALCANCE" | "EVENTOS_DOR" | "PRINCIPIOS_VALORES" | "VENDA_DIRETA";

export const FUNNEL_STAGE_LABELS: Record<FunnelStage, string> = {
  ALCANCE: "Alcance",
  EVENTOS_DOR: "Eventos / Dor",
  PRINCIPIOS_VALORES: "Princípios e Valores",
  VENDA_DIRETA: "Venda Direta",
};

export const FUNNEL_STAGE_DESCRIPTIONS: Record<FunnelStage, string> = {
  ALCANCE: "Atrair novos seguidores — conteúdo viral e compartilhável",
  EVENTOS_DOR: "Engajamento profundo — tocar em dores reais e gerar desejo",
  PRINCIPIOS_VALORES: "Doutrinação — criar conexão com seus valores e método",
  VENDA_DIRETA: "Conversão — oferta clara com CTA direto",
};

export const FUNNEL_STAGE_ICONS: Record<FunnelStage, string> = {
  ALCANCE: "📢",
  EVENTOS_DOR: "💬",
  PRINCIPIOS_VALORES: "👑",
  VENDA_DIRETA: "🎯",
};

export type CtaStyle = "PALAVRA_CHAVE" | "LINK_BIO" | "DM" | "SALVAR_COMPARTILHAR" | "LEVANTADA_MAO" | "auto";

export const CTA_STYLE_LABELS: Record<CtaStyle, string> = {
  PALAVRA_CHAVE: "Comente [Palavra]",
  LINK_BIO: "Link na Bio",
  DM: "Envie DM",
  SALVAR_COMPARTILHAR: "Salve / Compartilhe",
  LEVANTADA_MAO: "Levantada de Mão",
  auto: "Automático (IA escolhe)",
};

export type NarrativeElement = "metafora" | "analogia" | "plot_twist" | "conflito" | "paradoxo" | "experiencia_pessoal" | "suspense" | "ironia" | "dialogo" | "jornada_heroi" | "auto";

export const NARRATIVE_ELEMENT_LABELS: Record<NarrativeElement, string> = {
  metafora: "Metáfora",
  analogia: "Analogia",
  plot_twist: "Plot Twist",
  conflito: "Conflito",
  paradoxo: "Paradoxo",
  experiencia_pessoal: "Experiência Pessoal",
  suspense: "Suspense",
  ironia: "Ironia",
  dialogo: "Diálogo",
  jornada_heroi: "Jornada do Herói",
  auto: "Automático (IA escolhe)",
};

export const CONTENT_PILLARS = [
  "Educativo",
  "Autoridade",
  "Conexão/Bastidores",
  "Conversão/Venda",
  "Entretenimento",
];

export type ContentFormat = "carousel" | "single_post" | "stories" | "reels_script";

export const CONTENT_FORMAT_LABELS: Record<ContentFormat, string> = {
  carousel: "Carrossel",
  single_post: "Post Único",
  stories: "Stories",
  reels_script: "Roteiro Reels/Vídeo",
};

export const CONTENT_FORMAT_DESCRIPTIONS: Record<ContentFormat, string> = {
  carousel: "5-10 slides deslizáveis — ideal para educar e converter",
  single_post: "1 imagem + legenda completa — rápido e direto",
  stories: "Sequência de 5-7 stories — interativo e pessoal",
  reels_script: "Roteiro com texto na tela + script falado — viral",
};

export const CONTENT_FORMAT_ICONS: Record<ContentFormat, string> = {
  carousel: "🎠",
  single_post: "📸",
  stories: "📱",
  reels_script: "🎬",
};

export const DESIGN_STYLES = [
  { id: "minimalist", label: "Minimalista", description: "Clean e moderno" },
  { id: "twitter", label: "Twitter/X", description: "Estilo post de texto" },
  { id: "elegant", label: "Elegante", description: "Premium e sofisticado" },
  { id: "bold", label: "Bold", description: "Vibrante e energético" },
  { id: "warm", label: "Acolhedor", description: "Tons quentes e amigáveis" },
  { id: "high_ticket", label: "High Ticket", description: "Luxo e exclusividade" },
  { id: "vibrant", label: "Vibrante", description: "Gradientes modernos e fun" },
  { id: "editorial", label: "Editorial", description: "Estilo revista premium" },
];

export const FONT_OPTIONS = [
  { id: "inter", label: "Inter", style: "font-sans" },
  { id: "playfair", label: "Playfair Display", style: "font-serif" },
  { id: "montserrat", label: "Montserrat", style: "font-sans" },
  { id: "lora", label: "Lora", style: "font-serif" },
];

export const COLOR_PALETTES = [
  { id: "neutral", label: "Neutro", primary: "#1a1a1a", secondary: "#6b7280" },
  { id: "warm", label: "Quente", primary: "#b45309", secondary: "#d97706" },
  { id: "cool", label: "Frio", primary: "#0369a1", secondary: "#0891b2" },
  { id: "nature", label: "Natural", primary: "#166534", secondary: "#15803d" },
  { id: "rose", label: "Rosa", primary: "#9f1239", secondary: "#e11d48" },
  { id: "purple", label: "Roxo", primary: "#6b21a8", secondary: "#9333ea" },
];

export function useCarouselGenerator() {
  const { profile } = useProfile();
  const { products } = useProducts();
  const { toast } = useToast();
  const { brand } = useBrand();

  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingDesign, setIsGeneratingDesign] = useState(false);
  const [isGeneratingWeek, setIsGeneratingWeek] = useState(false);
  const [isGeneratingAllDesigns, setIsGeneratingAllDesigns] = useState(false);
  const [designProgress, setDesignProgress] = useState({ current: 0, total: 0 });
  const [carousel, setCarousel] = useState<CarouselData | null>(null);
  const [weekContent, setWeekContent] = useState<WeekContent[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentContentFormat, setCurrentContentFormat] = useState<ContentFormat>("carousel");

  // Initialize design settings from BrandContext
  const [designSettings, setDesignSettings] = useState<DesignSettings>({
    style: "minimalist",
    primaryColor: brand.primary,
    secondaryColor: brand.secondary,
    fontFamily: brand.fontHeading.toLowerCase(),
  });

  // Update design settings when brand context changes
  const syncBrandFromContext = useCallback(() => {
    setDesignSettings({
      style: "minimalist",
      primaryColor: brand.primary,
      secondaryColor: brand.secondary,
      fontFamily: brand.fontHeading.toLowerCase(),
    });
  }, [brand]);

  // Sync on brand change
  useEffect(() => {
    syncBrandFromContext();
  }, [brand, syncBrandFromContext]);

  const { consumeCredit } = useCredits();

  const generateCarousel = useCallback(async (
    topic: string,
    postType: PostType,
    contentPillar: string,
    customInstructions?: string,
    strategyContext?: any,
    funnelStage?: FunnelStage,
    ctaStyle?: CtaStyle,
    narrativeElement?: NarrativeElement,
    contentFormat?: ContentFormat
  ) => {
    // 1. Verificar Créditos
    const hasCredit = await consumeCredit(1);
    if (!hasCredit) return;

    setIsGenerating(true);
    setCarousel(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-carousel-text', {
        body: {
          topic,
          postType,
          contentPillar,
          contentFormat: contentFormat || 'carousel',
          funnelStage: funnelStage || 'EVENTOS_DOR',
          ctaStyle: ctaStyle || 'auto',
          narrativeElement: narrativeElement || 'auto',
          customInstructions,
          profile,
          products,
          strategyContext,
          brandColors: brand.primary ? `Primary: ${brand.primary}, Secondary: ${brand.secondary}` : undefined,
          brandFonts: brand.fontHeading ? `Heading: ${brand.fontHeading}, Body: ${brand.fontBody}` : undefined,
        }
      });

      if (error) throw error;

      setCarousel(data);
      setCurrentSlideIndex(0);
      setCurrentContentFormat(contentFormat || 'carousel');

      const formatLabel = contentFormat === 'single_post' ? 'Post' : contentFormat === 'stories' ? 'Stories' : contentFormat === 'reels_script' ? 'Roteiro' : 'Carrossel';
      toast({
        title: `${formatLabel} gerado!`,
        description: `${data.slides.length} ${contentFormat === 'reels_script' ? 'seções' : 'slides'} criados`,
      });

      return data;
    } catch (error) {
      console.error("Generate carousel error:", error);
      toast({
        variant: "destructive",
        title: "Erro ao gerar",
        description: error instanceof Error ? error.message : "Tente novamente",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [profile, products, brand, toast]);

  const generateSlideDesign = useCallback(async (
    slideIndex: number,
    style: string = "minimalist",
    brandColors?: { primary: string; secondary: string },
    fontFamily?: string,
    backgroundImageUrl?: string
  ) => {
    if (!carousel || !carousel.slides[slideIndex]) return null;

    setIsGeneratingDesign(true);

    try {
      // Update the slide locally with the background image before calling the server
      if (backgroundImageUrl) {
        updateSlide(slideIndex, { backgroundImageUrl });
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-design`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          slide: {
            ...carousel.slides[slideIndex],
            backgroundImageUrl: backgroundImageUrl || carousel.slides[slideIndex].backgroundImageUrl
          },
          style,
          contentFormat: currentContentFormat,
          profileName: profile?.nome,
          brandColors: brandColors ? `Primary: ${brandColors.primary}, Secondary: ${brandColors.secondary}` : undefined,
          fontFamily,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao gerar design");
      }

      const data = await response.json();

      // Update the slide with the generated image
      setCarousel(prev => {
        if (!prev) return null;
        const newSlides = [...prev.slides];
        newSlides[slideIndex] = { ...newSlides[slideIndex], imageUrl: data.imageUrl };
        return { ...prev, slides: newSlides };
      });

      toast({
        title: "Design gerado!",
        description: `Slide ${slideIndex + 1} pronto`,
      });

      return data.imageUrl;
    } catch (error) {
      console.error("Generate design error:", error);
      toast({
        variant: "destructive",
        title: "Erro ao gerar design",
        description: error instanceof Error ? error.message : "Tente novamente",
      });
      return null;
    } finally {
      setIsGeneratingDesign(false);
    }
  }, [carousel, profile, toast]);

  // Generate all slide designs at once with brand settings
  const generateAllSlideDesigns = useCallback(async () => {
    if (!carousel || carousel.slides.length === 0) return;

    setIsGeneratingAllDesigns(true);
    setDesignProgress({ current: 0, total: carousel.slides.length });

    try {
      for (let i = 0; i < carousel.slides.length; i++) {
        setDesignProgress({ current: i + 1, total: carousel.slides.length });

        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-design`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            slide: {
              ...carousel.slides[i],
              backgroundImageUrl: carousel.slides[i].backgroundImageUrl
            },
            style: designSettings.style,
            contentFormat: currentContentFormat,
            profileName: profile?.nome,
            brandColors: `Primary: ${designSettings.primaryColor}, Secondary: ${designSettings.secondaryColor}`,
            fontFamily: designSettings.fontFamily,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || `Erro no slide ${i + 1}`);
        }

        const data = await response.json();

        setCarousel(prev => {
          if (!prev) return null;
          const newSlides = [...prev.slides];
          newSlides[i] = { ...newSlides[i], imageUrl: data.imageUrl };
          return { ...prev, slides: newSlides };
        });
      }

      toast({
        title: "Todos os designs gerados!",
        description: `${carousel.slides.length} slides prontos`,
      });
    } catch (error) {
      console.error("Generate all designs error:", error);
      toast({
        variant: "destructive",
        title: "Erro ao gerar designs",
        description: error instanceof Error ? error.message : "Tente novamente",
      });
    } finally {
      setIsGeneratingAllDesigns(false);
      setDesignProgress({ current: 0, total: 0 });
    }
  }, [carousel, designSettings, profile, toast]);

  // Generate a week of content at once
  const generateWeekContent = useCallback(async (topics: { topic: string; postType: PostType; contentPillar: string }[]) => {
    setIsGeneratingWeek(true);
    const generated: WeekContent[] = [];

    try {
      for (let i = 0; i < topics.length; i++) {
        const { topic, postType, contentPillar } = topics[i];

        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-carousel`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            topic,
            postType,
            contentPillar,
            profile,
            products,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || `Erro no post ${i + 1}`);
        }

        const data: CarouselData = await response.json();

        generated.push({
          id: crypto.randomUUID(),
          dayOfWeek: i,
          topic,
          postType,
          contentPillar,
          carousel: data,
          status: "generated",
        });
      }

      setWeekContent(generated);

      toast({
        title: "Semana gerada!",
        description: `${generated.length} posts criados`,
      });

      return generated;
    } catch (error) {
      console.error("Generate week error:", error);
      toast({
        variant: "destructive",
        title: "Erro ao gerar semana",
        description: error instanceof Error ? error.message : "Tente novamente",
      });
      return null;
    } finally {
      setIsGeneratingWeek(false);
    }
  }, [profile, products, toast]);

  // Select a week content item to edit
  const selectWeekContentForEdit = useCallback((id: string) => {
    const item = weekContent.find(w => w.id === id);
    if (item?.carousel) {
      setCarousel(item.carousel);
      setCurrentSlideIndex(0);
    }
  }, [weekContent]);

  // Update week content after editing
  const updateWeekContent = useCallback((id: string, newCarousel: CarouselData) => {
    setWeekContent(prev => prev.map(w =>
      w.id === id ? { ...w, carousel: newCarousel, status: "edited" } : w
    ));
  }, []);

  const updateSlide = useCallback((index: number, updates: Partial<CarouselSlide>) => {
    setCarousel(prev => {
      if (!prev) return null;
      const newSlides = [...prev.slides];
      newSlides[index] = { ...newSlides[index], ...updates };
      return { ...prev, slides: newSlides };
    });
  }, []);

  const updateLegenda = useCallback((legenda: string) => {
    setCarousel(prev => prev ? { ...prev, legenda } : null);
  }, []);

  const addSlide = useCallback((afterIndex: number) => {
    setCarousel(prev => {
      if (!prev) return null;
      const newSlide: CarouselSlide = {
        numero: afterIndex + 2,
        tipo: "conteudo",
        headline: "",
        subtexto: "",
      };
      const newSlides = [...prev.slides];
      newSlides.splice(afterIndex + 1, 0, newSlide);
      // Renumber slides
      newSlides.forEach((s, i) => s.numero = i + 1);
      return { ...prev, slides: newSlides };
    });
  }, []);

  const removeSlide = useCallback((index: number) => {
    setCarousel(prev => {
      if (!prev || prev.slides.length <= 2) return prev;
      const newSlides = prev.slides.filter((_, i) => i !== index);
      newSlides.forEach((s, i) => s.numero = i + 1);
      if (currentSlideIndex >= newSlides.length) {
        setCurrentSlideIndex(newSlides.length - 1);
      }
      return { ...prev, slides: newSlides };
    });
  }, [currentSlideIndex]);

  const resetCarousel = useCallback(() => {
    setCarousel(null);
    setCurrentSlideIndex(0);
  }, []);

  const resetWeekContent = useCallback(() => {
    setWeekContent([]);
  }, []);

  const refineText = useCallback(async (currentText: string, mode: 'shorter' | 'punchy' | 'professional', slideIndex: number, field: 'headline' | 'subtexto' | 'destaque') => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-carousel-text', {
        body: {
          mode,
          currentText,
          topic: carousel?.titulo || "Carousel Content",
          strategyContext: {
            persona: profile?.nicho,
            brandVoice: profile?.tom_voz
          }
        }
      });

      if (error) throw error;

      if (data) {
        let refined = "";
        if (typeof data === 'string') {
          refined = data;
        } else if (data.refinedText) {
          refined = data.refinedText;
        }

        if (refined) {
          refined = refined.replace(/^["']|["']$/g, '');
          updateSlide(slideIndex, { [field]: refined });
          return refined;
        }
      }

      return null;
    } catch (error) {
      console.error("Refine text error:", error);
      toast({
        variant: "destructive",
        title: "Erro ao refinar texto",
        description: error instanceof Error ? error.message : "Tente novamente",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [carousel, brand, updateSlide, toast, setIsGenerating]);

  return {
    carousel,
    weekContent,
    isGenerating,
    isGeneratingDesign,
    isGeneratingWeek,
    isGeneratingAllDesigns,
    designProgress,
    designSettings,
    setDesignSettings,
    isBrandLocked: profile?.brand_locked || false,
    currentSlideIndex,
    setCurrentSlideIndex,
    currentContentFormat,
    setCurrentContentFormat,
    generateCarousel,
    generateSlideDesign,
    generateAllSlideDesigns,
    generateWeekContent,
    selectWeekContentForEdit,
    updateWeekContent,
    updateSlide,
    updateLegenda,
    addSlide,
    removeSlide,
    resetCarousel,
    resetWeekContent,
    syncBrandFromProfile: syncBrandFromContext,
    setCarousel,
    refineText,
  };
}
