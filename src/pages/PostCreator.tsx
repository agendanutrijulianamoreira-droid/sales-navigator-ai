import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  ImagePlus,
  Images,
  Loader2,
  PencilLine,
  RefreshCw,
  Save,
  Sparkles,
  Upload,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useBrand } from "@/contexts/BrandContext";
import { useCalendarItems, type CalendarItem } from "@/hooks/useCalendarItems";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PublicImage {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  creator: string;
  creatorUrl: string;
  sourceUrl: string;
  license: string;
  licenseUrl: string;
}

interface SlideImage extends PublicImage {
  slideIndex: number;
}

const parseSlideImages = (value: Json): SlideImage[] => {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
    const candidate = entry as Record<string, Json | undefined>;
    return typeof candidate.url === "string" && typeof candidate.slideIndex === "number"
      ? [candidate as unknown as SlideImage]
      : [];
  });
};

const extractSlideCopy = (body: string, isCarousel: boolean) => {
  if (!isCarousel) return [];
  const paragraphs = body
    .split(/\n{2,}|(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÃÕÇ])/)
    .map((part) => part.replace(/^slide\s*\d+\s*[:—-]?\s*/i, "").trim())
    .filter(Boolean);
  return paragraphs.slice(0, 5);
};

export default function PostCreator() {
  const { draftId } = useParams<{ draftId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { brand } = useBrand();
  const { items, isLoading, updateItem } = useCalendarItems();
  const initializedDraft = useRef<string | null>(null);
  const autoImagesRequested = useRef<string | null>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const draft = items.find((item) => item.id === draftId);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [header, setHeader] = useState("");
  const [footer, setFooter] = useState("");
  const [coverMode, setCoverMode] = useState<"ai" | "upload" | null>(null);
  const [coverStorageValue, setCoverStorageValue] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [slideImages, setSlideImages] = useState<SlideImage[]>([]);
  const [publicImages, setPublicImages] = useState<PublicImage[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [imageQuery, setImageQuery] = useState("");
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [showCoverQuestion, setShowCoverQuestion] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [isSearchingImages, setIsSearchingImages] = useState(false);
  const [isRefining, setIsRefining] = useState<"titles" | "body" | null>(null);

  useEffect(() => {
    if (!draft || initializedDraft.current === draft.id) return;
    initializedDraft.current = draft.id;
    const specialty = profile?.sub_nicho || profile?.nicho || "Nutrição";
    const handle = profile?.instagram_handle?.replace(/^@/, "") || "seuinstagram";
    setTitle(draft.titulo || "");
    setBody(draft.conteudo_corpo || draft.notas || "");
    setHeader(draft.cabecalho || `${profile?.nome || "Seu nome"} | ${specialty}`);
    setFooter(draft.rodape || `@${handle}`);
    setCoverMode(draft.cover_mode === "ai" || draft.cover_mode === "upload" ? draft.cover_mode : null);
    setCoverStorageValue(draft.cover_image_url);
    setSlideImages(parseSlideImages(draft.slide_images));
    const savedStrategy = draft.estrategia_snapshot && typeof draft.estrategia_snapshot === "object" && !Array.isArray(draft.estrategia_snapshot)
      ? draft.estrategia_snapshot as Record<string, Json | undefined>
      : {};
    setImageQuery(typeof savedStrategy.termos_imagem === "string" ? savedStrategy.termos_imagem : [draft.titulo, specialty].filter(Boolean).join(" "));
    setShowCoverQuestion(!draft.cover_mode && !draft.cover_image_url);
  }, [draft, profile]);

  useEffect(() => {
    if (!draft || draft.tipo !== "carrossel" || autoImagesRequested.current === draft.id) return;
    if (parseSlideImages(draft.slide_images).length > 0) return;
    autoImagesRequested.current = draft.id;
    const specialty = profile?.sub_nicho || profile?.nicho || "nutrição";
    const draftStrategy = draft.estrategia_snapshot && typeof draft.estrategia_snapshot === "object" && !Array.isArray(draft.estrategia_snapshot)
      ? draft.estrategia_snapshot as Record<string, Json | undefined>
      : {};
    const query = typeof draftStrategy.termos_imagem === "string"
      ? draftStrategy.termos_imagem
      : [draft.titulo, specialty].filter(Boolean).join(" ");
    const requestedSlides = Math.max(1, extractSlideCopy(draft.conteudo_corpo || draft.notas || "", true).length);

    setIsSearchingImages(true);
    supabase.functions.invoke("search-public-images", { body: { query } })
      .then(({ data, error }) => {
        if (error) throw error;
        const images = (data?.images || []) as PublicImage[];
        setPublicImages(images);
        setSlideImages(images.slice(0, requestedSlides).map((image, index) => ({ ...image, slideIndex: index + 1 })));
      })
      .catch((error) => console.error("Erro ao preencher imagens públicas:", error))
      .finally(() => setIsSearchingImages(false));
  }, [draft, profile]);

  useEffect(() => {
    const resolveCover = async () => {
      if (!coverStorageValue) {
        setCoverPreview(null);
        return;
      }
      if (!coverStorageValue.startsWith("assets:")) {
        setCoverPreview(coverStorageValue);
        return;
      }
      const path = coverStorageValue.slice("assets:".length);
      const { data, error } = await supabase.storage.from("assets").createSignedUrl(path, 3600);
      if (!error) setCoverPreview(data.signedUrl);
    };
    resolveCover();
  }, [coverStorageValue]);

  const isCarousel = draft?.tipo === "carrossel";
  const slideCopy = useMemo(() => extractSlideCopy(body, isCarousel), [body, isCarousel]);
  const slideCount = isCarousel ? Math.max(2, slideCopy.length + 1) : 1;
  const strategy = draft?.estrategia_snapshot && typeof draft.estrategia_snapshot === "object" && !Array.isArray(draft.estrategia_snapshot)
    ? draft.estrategia_snapshot as Record<string, Json | undefined>
    : {};

  const saveImageBlob = async (blob: Blob, kind: "ai" | "upload") => {
    if (!user || !draft) throw new Error("Usuário ou rascunho indisponível");
    const extension = blob.type.includes("png") ? "png" : blob.type.includes("webp") ? "webp" : "jpg";
    const path = `${user.id}/post-covers/${draft.id}-${kind}-${Date.now()}.${extension}`;
    const { error } = await supabase.storage.from("assets").upload(path, blob, {
      cacheControl: "3600",
      contentType: blob.type || `image/${extension}`,
      upsert: false,
    });
    if (error) throw error;
    const { data } = await supabase.storage.from("assets").createSignedUrl(path, 3600);
    setCoverStorageValue(`assets:${path}`);
    setCoverPreview(data?.signedUrl || null);
    return `assets:${path}`;
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 6 * 1024 * 1024) {
      toast.error("Envie uma imagem PNG, JPG ou WEBP de até 6 MB.");
      event.target.value = "";
      return;
    }
    try {
      setCoverMode("upload");
      await saveImageBlob(file, "upload");
      setShowCoverQuestion(false);
      toast.success("Capa enviada com segurança.");
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível enviar a capa.");
    } finally {
      event.target.value = "";
    }
  };

  const generateAICover = async () => {
    if (!draft || !title.trim()) {
      toast.error("Escreva um título antes de gerar a capa.");
      return;
    }
    setCoverMode("ai");
    setIsGeneratingCover(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-design", {
        body: {
          slide: { headline: title, subtexto: slideCopy[0] || "", layout: "capa" },
          style: profile?.brand_style || "editorial",
          profileName: header,
          brandColors: [profile?.brand_primary_color || brand.primary, profile?.brand_secondary_color || brand.secondary].join(", "),
          fontFamily: "playfair",
          contentFormat: isCarousel ? "carousel" : "single_post",
        },
      });
      if (error || !data?.imageUrl) throw error || new Error("Imagem não retornada");
      const imageResponse = await fetch(data.imageUrl);
      const blob = await imageResponse.blob();
      await saveImageBlob(blob, "ai");
      setShowCoverQuestion(false);
      toast.success("Capa gerada com sua identidade.");
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível gerar a capa agora.");
    } finally {
      setIsGeneratingCover(false);
    }
  };

  const searchPublicImages = async () => {
    setIsSearchingImages(true);
    try {
      const { data, error } = await supabase.functions.invoke("search-public-images", {
        body: { query: imageQuery || title },
      });
      if (error) throw error;
      setPublicImages(data?.images || []);
      if (!data?.images?.length) toast.info("Nenhuma imagem encontrada. Tente termos mais simples.");
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível consultar o banco público.");
    } finally {
      setIsSearchingImages(false);
    }
  };

  const chooseSlideImage = (image: PublicImage) => {
    if (activeSlide === 0) return;
    setSlideImages((current) => [
      ...current.filter((item) => item.slideIndex !== activeSlide),
      { ...image, slideIndex: activeSlide },
    ]);
    toast.success(`Imagem aplicada ao slide ${activeSlide + 1}.`);
  };

  const refineDraft = async (mode: "titles" | "body") => {
    if (!draft) return;
    setIsRefining(mode);
    try {
      const { data, error } = await supabase.functions.invoke("refine-post-draft", {
        body: {
          mode,
          profile,
          strategy,
          draft: { ...draft, titulo: title, conteudo_corpo: body },
        },
      });
      if (error) throw error;
      if (mode === "titles") setTitleSuggestions(data?.titles || []);
      if (mode === "body" && data?.body) setBody(data.body);
    } catch (error) {
      console.error(error);
      toast.error("A IA não conseguiu refinar este trecho.");
    } finally {
      setIsRefining(null);
    }
  };

  const saveDraft = async (nextStatus?: string) => {
    if (!draft || !title.trim() || !body.trim()) {
      toast.error("Título e texto do post são obrigatórios.");
      return;
    }
    setIsSaving(true);
    const saved = await updateItem(draft.id, {
      titulo: title.trim(),
      conteudo_corpo: body.trim(),
      cabecalho: header.trim(),
      rodape: footer.trim().startsWith("@") ? footer.trim() : `@${footer.trim()}`,
      cover_mode: coverMode,
      cover_image_url: coverStorageValue,
      slide_images: slideImages as unknown as Json,
      status: nextStatus || draft.status || "rascunho",
    });
    setIsSaving(false);
    if (saved) toast.success(nextStatus ? "Conteúdo enviado para aprovação." : "Rascunho salvo.");
  };

  if (isLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;
  }
  if (!draft) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <h1 className="text-xl font-bold">Rascunho não encontrado</h1>
        <Button className="mt-6" onClick={() => navigate("/planner")}>Voltar ao calendário</Button>
      </div>
    );
  }

  const activeImage = slideImages.find((item) => item.slideIndex === activeSlide);
  const activeCopy = activeSlide > 0 ? slideCopy[activeSlide - 1] || body : "";
  const vertical = draft.tipo === "stories" || draft.tipo === "reels";

  return (
    <div className="min-h-screen bg-[#f4f2ed] text-slate-900">
      <input ref={uploadInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleUpload} />

      <header className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3 border-b border-black/10 bg-[#fbfaf7]/95 px-4 py-3 backdrop-blur md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/planner")} aria-label="Voltar ao calendário">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Estúdio editorial</span>
              <Badge variant="outline" className="hidden sm:inline-flex">Rascunho</Badge>
            </div>
            <h1 className="truncate text-base font-bold md:text-lg">{title || "Post sem título"}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => saveDraft()} disabled={isSaving} className="gap-2">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvar
          </Button>
          <Button onClick={() => saveDraft("em_aprovacao")} disabled={isSaving} className="gap-2">
            <Check className="h-4 w-4" /> Enviar para aprovação
          </Button>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-65px)] xl:grid-cols-[330px_minmax(430px,1fr)_370px]">
        <aside className="border-r border-black/10 bg-[#fbfaf7]">
          <ScrollArea className="h-[calc(100vh-65px)]">
            <div className="space-y-6 p-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">01 · Estratégia</p>
                <h2 className="mt-1 font-bold">Por que este post existe</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[strategy.etapa_funil, strategy.pilar, strategy.objetivo].filter(Boolean).map((value, index) => (
                    <Badge key={`${String(value)}-${index}`} variant="secondary" className="max-w-full truncate">{String(value)}</Badge>
                  ))}
                </div>
                {strategy.tema && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Tema: {String(strategy.tema)}</p>}
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="post-title">Título</Label>
                  <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => refineDraft("titles")} disabled={!!isRefining}>
                    {isRefining === "titles" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} Sugerir títulos
                  </Button>
                </div>
                <Textarea id="post-title" value={title} onChange={(event) => setTitle(event.target.value)} rows={3} className="resize-none text-base font-semibold" />
                {titleSuggestions.length > 0 && (
                  <div className="space-y-2">
                    {titleSuggestions.map((suggestion) => (
                      <button key={suggestion} type="button" onClick={() => setTitle(suggestion)} className="w-full rounded-lg border bg-white p-2.5 text-left text-xs leading-relaxed hover:border-primary">
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="post-body">Texto do post</Label>
                  <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => refineDraft("body")} disabled={!!isRefining}>
                    {isRefining === "body" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />} Reescrever
                  </Button>
                </div>
                <Textarea id="post-body" value={body} onChange={(event) => setBody(event.target.value)} rows={13} className="resize-y leading-relaxed" />
              </div>

              <Separator />

              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">02 · Assinatura</p>
                <div className="space-y-2"><Label htmlFor="header">Cabeçalho</Label><Input id="header" value={header} onChange={(event) => setHeader(event.target.value)} placeholder="Nome | Especialidade" /></div>
                <div className="space-y-2"><Label htmlFor="footer">Rodapé</Label><Input id="footer" value={footer} onChange={(event) => setFooter(event.target.value)} placeholder="@seuinstagram" /></div>
              </div>
            </div>
          </ScrollArea>
        </aside>

        <main className="relative flex min-h-[680px] flex-col items-center justify-center overflow-hidden bg-[linear-gradient(rgba(15,23,42,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.045)_1px,transparent_1px)] bg-[size:24px_24px] p-6 md:p-10">
          <div className="mb-4 flex max-w-full gap-2 overflow-x-auto pb-1">
            {Array.from({ length: slideCount }).map((_, index) => (
              <button key={index} type="button" onClick={() => setActiveSlide(index)} className={cn("rounded-full border px-3 py-1.5 text-xs font-bold transition", activeSlide === index ? "border-slate-900 bg-slate-900 text-white" : "border-black/15 bg-white/80 hover:bg-white")}>Slide {index + 1}</button>
            ))}
          </div>

          <div className={cn("relative w-full max-w-[620px] overflow-hidden bg-white shadow-[0_28px_80px_rgba(15,23,42,0.18)]", vertical ? "aspect-[9/16] max-h-[72vh] max-w-[410px]" : "aspect-square")} style={{ fontFamily: profile?.brand_font_body || brand.fontBody }}>
            {activeSlide === 0 ? (
              <div className="relative flex h-full flex-col justify-between p-[7%] text-white" style={{ backgroundColor: profile?.brand_primary_color || brand.primary }}>
                {coverPreview && <img src={coverPreview} alt="Capa do post" className="absolute inset-0 h-full w-full object-cover" />}
                {coverPreview && <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-black/65" />}
                <p className="relative z-10 text-[clamp(9px,1.4vw,14px)] font-bold uppercase tracking-[0.18em]">{header || "Nome | Especialidade"}</p>
                <div className="relative z-10 max-w-[90%]">
                  <p className="mb-4 h-1 w-12 rounded-full bg-white/80" />
                  <h2 className="text-[clamp(28px,5.2vw,58px)] font-black leading-[0.98] tracking-[-0.045em]" style={{ fontFamily: profile?.brand_font_title || brand.fontHeading }}>{title || "Seu título aparece aqui"}</h2>
                </div>
                <p className="relative z-10 text-[clamp(10px,1.5vw,15px)] font-semibold tracking-wide">{footer || "@seuinstagram"}</p>
              </div>
            ) : (
              <div className="flex h-full flex-col bg-[#fffdf8]">
                <div className="flex items-center justify-between border-b border-black/10 px-[7%] py-[4%] text-[clamp(8px,1.2vw,12px)] font-bold uppercase tracking-[0.15em]"><span>{header}</span><span>{String(activeSlide).padStart(2, "0")}</span></div>
                <div className="grid min-h-0 flex-1 grid-rows-[42%_1fr]">
                  <div className="relative overflow-hidden bg-slate-100">
                    {activeImage ? <img src={activeImage.url} alt={activeImage.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-muted-foreground"><Images className="h-10 w-10 opacity-40" /></div>}
                  </div>
                  <div className="flex flex-col justify-between p-[7%]">
                    <p className="text-[clamp(16px,3vw,31px)] font-bold leading-tight" style={{ fontFamily: profile?.brand_font_title || brand.fontHeading }}>{activeCopy || "Edite o texto do post para preencher este slide."}</p>
                    <p className="text-[clamp(9px,1.2vw,12px)] font-semibold text-slate-500">{footer}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <p className="mt-4 text-xs text-slate-500">Prévia ao vivo · o arquivo final poderá ser refinado no editor visual</p>
        </main>

        <aside className="border-l border-black/10 bg-[#fbfaf7]">
          <ScrollArea className="h-[calc(100vh-65px)]">
            <div className="space-y-6 p-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">03 · Mídia</p>
                <h2 className="mt-1 font-bold">Capa</h2>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button variant={coverMode === "ai" ? "default" : "outline"} className="h-auto flex-col gap-1 py-3" onClick={generateAICover} disabled={isGeneratingCover}>
                    {isGeneratingCover ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}<span className="text-xs">Usar IA</span>
                  </Button>
                  <Button variant={coverMode === "upload" ? "default" : "outline"} className="h-auto flex-col gap-1 py-3" onClick={() => uploadInputRef.current?.click()}>
                    <Upload className="h-4 w-4" /><span className="text-xs">Subir imagem</span>
                  </Button>
                </div>
              </div>

              {isCarousel && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <div>
                      <h2 className="font-bold">Imagens dos slides</h2>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Busca no Openverse. A autoria e a licença acompanham cada escolha.</p>
                    </div>
                    <div className="flex gap-2"><Input value={imageQuery} onChange={(event) => setImageQuery(event.target.value)} onKeyDown={(event) => event.key === "Enter" && searchPublicImages()} placeholder="Ex.: mulher alimentação saudável" /><Button size="icon" onClick={searchPublicImages} disabled={isSearchingImages}>{isSearchingImages ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}</Button></div>
                    {activeSlide === 0 && <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">Selecione um slide interno acima para aplicar uma imagem.</p>}
                    <div className="grid grid-cols-2 gap-2">
                      {publicImages.map((image) => (
                        <button key={image.id} type="button" disabled={activeSlide === 0} onClick={() => chooseSlideImage(image)} className="group overflow-hidden rounded-xl border bg-white text-left disabled:opacity-50">
                          <img src={image.thumbnail} alt={image.title} loading="lazy" className="aspect-square w-full object-cover transition group-hover:scale-[1.03]" />
                          <span className="block truncate px-2 pt-2 text-[11px] font-semibold">{image.creator}</span>
                          <span className="block px-2 pb-2 text-[10px] uppercase text-muted-foreground">{image.license || "Licença aberta"}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activeImage && activeSlide > 0 && (
                <div className="rounded-xl border bg-white p-3 text-xs leading-relaxed text-muted-foreground">
                  <p className="font-semibold text-foreground">Crédito do slide {activeSlide + 1}</p>
                  <p>{activeImage.creator} · {activeImage.license || "licença aberta"}</p>
                  {activeImage.sourceUrl && <a href={activeImage.sourceUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-primary hover:underline">Ver fonte <ExternalLink className="h-3 w-3" /></a>}
                </div>
              )}
            </div>
          </ScrollArea>
        </aside>
      </div>

      <Dialog open={showCoverQuestion} onOpenChange={setShowCoverQuestion}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Como você quer criar a capa?</DialogTitle>
            <DialogDescription>Escolha agora; você poderá trocar a opção depois no painel de mídia.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={generateAICover} disabled={isGeneratingCover} className="rounded-2xl border bg-primary/5 p-5 text-left hover:border-primary">
              {isGeneratingCover ? <Loader2 className="mb-4 h-6 w-6 animate-spin text-primary" /> : <Sparkles className="mb-4 h-6 w-6 text-primary" />}
              <span className="block font-bold">Gerar com IA</span><span className="mt-1 block text-xs leading-relaxed text-muted-foreground">Cria uma capa editorial com título e cores da marca.</span>
            </button>
            <button type="button" onClick={() => uploadInputRef.current?.click()} className="rounded-2xl border p-5 text-left hover:border-primary">
              <Upload className="mb-4 h-6 w-6 text-primary" />
              <span className="block font-bold">Subir imagem</span><span className="mt-1 block text-xs leading-relaxed text-muted-foreground">Use uma foto ou criativo que já está no seu computador.</span>
            </button>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowCoverQuestion(false)} className="mx-auto gap-2 text-muted-foreground"><PencilLine className="h-3.5 w-3.5" /> Decidir depois</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
