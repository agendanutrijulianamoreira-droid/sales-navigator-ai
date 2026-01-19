import { useState, useCallback } from "react";
import { useProfile } from "./useProfile";
import { useProducts } from "./useProducts";
import { useToast } from "./use-toast";

export interface CarouselSlide {
  numero: number;
  tipo: string;
  headline: string;
  subtexto?: string;
  destaque?: string;
  imageUrl?: string;
}

export interface CarouselData {
  titulo: string;
  slides: CarouselSlide[];
  legenda: string;
  cta_stories?: string;
}

export type PostType = 
  | "PROMESSA"
  | "COMO_FIZ"
  | "NAO_SOBRE"
  | "SUPERACAO"
  | "PIOR_EXPERIENCIA"
  | "CONTRA_MERCADO"
  | "ESTRATEGIA_UTIL"
  | "LEVANTADA_MAO"
  | "DOR_EVENTO"
  | "ALCANCE";

export const POST_TYPE_LABELS: Record<PostType, string> = {
  PROMESSA: "Promessa objetiva",
  COMO_FIZ: "Como eu fiz isso",
  NAO_SOBRE: "Isso não é sobre apenas...",
  SUPERACAO: "História de superação",
  PIOR_EXPERIENCIA: "Pior experiência/cliente",
  CONTRA_MERCADO: "Contra o mercado",
  ESTRATEGIA_UTIL: "Estratégia útil",
  LEVANTADA_MAO: "Levantada de mão",
  DOR_EVENTO: "Dor/Evento",
  ALCANCE: "Alcance viral",
};

export const CONTENT_PILLARS = [
  "Educativo",
  "Autoridade",
  "Conexão/Bastidores",
  "Conversão/Venda",
  "Entretenimento",
];

export const DESIGN_STYLES = [
  { id: "minimalist", label: "Minimalista", description: "Clean e moderno" },
  { id: "twitter", label: "Twitter/X", description: "Estilo post de texto" },
  { id: "elegant", label: "Elegante", description: "Premium e sofisticado" },
  { id: "bold", label: "Bold", description: "Vibrante e energético" },
  { id: "warm", label: "Acolhedor", description: "Tons quentes e amigáveis" },
];

export function useCarouselGenerator() {
  const { profile } = useProfile();
  const { products } = useProducts();
  const { toast } = useToast();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingDesign, setIsGeneratingDesign] = useState(false);
  const [carousel, setCarousel] = useState<CarouselData | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const generateCarousel = useCallback(async (
    topic: string,
    postType: PostType,
    contentPillar: string,
    customInstructions?: string
  ) => {
    setIsGenerating(true);
    setCarousel(null);

    try {
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
          customInstructions,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao gerar carrossel");
      }

      const data: CarouselData = await response.json();
      setCarousel(data);
      setCurrentSlideIndex(0);
      
      toast({
        title: "Carrossel gerado!",
        description: `${data.slides.length} slides criados`,
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
  }, [profile, products, toast]);

  const generateSlideDesign = useCallback(async (
    slideIndex: number,
    style: string = "minimalist"
  ) => {
    if (!carousel || !carousel.slides[slideIndex]) return null;

    setIsGeneratingDesign(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-design`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          slide: carousel.slides[slideIndex],
          style,
          profileName: profile?.nome,
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

  return {
    carousel,
    isGenerating,
    isGeneratingDesign,
    currentSlideIndex,
    setCurrentSlideIndex,
    generateCarousel,
    generateSlideDesign,
    updateSlide,
    updateLegenda,
    addSlide,
    removeSlide,
    resetCarousel,
  };
}
