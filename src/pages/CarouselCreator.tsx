import { useState } from "react";
import { useCarouselGenerator, POST_TYPE_LABELS, CONTENT_PILLARS, DESIGN_STYLES, PostType, CarouselSlide } from "@/hooks/useCarouselGenerator";
import { useGenerations } from "@/hooks/useGenerations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Loader2, Sparkles, Copy, Save, ChevronLeft, ChevronRight, 
  Plus, Trash2, Image, RefreshCw, Wand2, Edit3, Check, ArrowLeft
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

export default function CarouselCreator() {
  const { toast } = useToast();
  const { saveGeneration } = useGenerations();
  const {
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
  } = useCarouselGenerator();

  // Form state
  const [topic, setTopic] = useState("");
  const [postType, setPostType] = useState<PostType>("ESTRATEGIA_UTIL");
  const [contentPillar, setContentPillar] = useState("Educativo");
  const [customInstructions, setCustomInstructions] = useState("");
  const [designStyle, setDesignStyle] = useState("minimalist");
  const [editingSlide, setEditingSlide] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({ variant: "destructive", title: "Digite um tema" });
      return;
    }
    await generateCarousel(topic, postType, contentPillar, customInstructions);
  };

  const handleGenerateDesign = async (index: number) => {
    await generateSlideDesign(index, designStyle);
  };

  const handleCopyLegenda = async () => {
    if (!carousel?.legenda) return;
    await navigator.clipboard.writeText(carousel.legenda);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Legenda copiada!" });
  };

  const handleSave = async () => {
    if (!carousel) return;
    
    await saveGeneration({
      tipo: "post",
      subtipo: "carrossel",
      specialist: "social_media_manager",
      titulo: carousel.titulo,
      output_content: JSON.stringify(carousel),
      input_data: { topic, postType, contentPillar },
      favorito: false,
      tags: [postType.toLowerCase(), contentPillar.toLowerCase()],
    });
    
    toast({ title: "Salvo na biblioteca!" });
  };

  const currentSlide = carousel?.slides[currentSlideIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <div>
              <h1 className="font-semibold">Gerador de Carrossel</h1>
              <p className="text-xs text-muted-foreground">Crie posts que convertem</p>
            </div>
          </div>
          {carousel && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={resetCarousel}>
                <RefreshCw className="h-4 w-4 mr-2" /> Novo
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" /> Salvar
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="container px-4 py-6">
        {!carousel ? (
          /* Generator Form */
          <div className="max-w-2xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Criar Novo Carrossel
                </CardTitle>
                <CardDescription>
                  A IA vai gerar os textos de cada slide baseado no seu perfil e método
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Topic */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tema do Post</label>
                  <Textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Ex: Por que dietas restritivas não funcionam a longo prazo"
                    rows={2}
                  />
                </div>

                {/* Post Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo de Post</label>
                  <Select value={postType} onValueChange={(v) => setPostType(v as PostType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(POST_TYPE_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Content Pillar */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pilar de Conteúdo</label>
                  <div className="flex flex-wrap gap-2">
                    {CONTENT_PILLARS.map((pillar) => (
                      <Badge
                        key={pillar}
                        variant={contentPillar === pillar ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setContentPillar(pillar)}
                      >
                        {pillar}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Custom Instructions */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Instruções Adicionais (opcional)</label>
                  <Input
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="Ex: Focar em mulheres 40+, usar linguagem leve"
                  />
                </div>

                {/* Generate Button */}
                <Button onClick={handleGenerate} disabled={isGenerating} className="w-full" size="lg">
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Gerando carrossel...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Gerar Carrossel
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Quick Ideas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Ideias Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {[
                    "3 erros que sabotam seu emagrecimento",
                    "O que comer antes de treinar",
                    "Por que você não precisa de dieta, precisa de estratégia",
                    "Minha rotina alimentar na prática",
                    "Como lidar com a fome emocional",
                  ].map((idea) => (
                    <Badge
                      key={idea}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary/10"
                      onClick={() => setTopic(idea)}
                    >
                      {idea}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Carousel Editor */
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Slide Preview */}
            <div className="space-y-4">
              <Card className="aspect-square relative overflow-hidden">
                {currentSlide?.imageUrl ? (
                  <img 
                    src={currentSlide.imageUrl} 
                    alt={`Slide ${currentSlideIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <CardContent className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-muted/50 to-muted">
                    <Badge className="mb-4" variant="outline">
                      Slide {currentSlideIndex + 1}/{carousel.slides.length}
                    </Badge>
                    
                    <div className="text-center max-w-sm">
                      {currentSlide?.destaque && (
                        <p className="text-sm text-primary font-medium mb-2">{currentSlide.destaque}</p>
                      )}
                      <h3 className="text-xl font-bold mb-3 leading-tight">{currentSlide?.headline}</h3>
                      {currentSlide?.subtexto && (
                        <p className="text-muted-foreground text-sm whitespace-pre-line">{currentSlide.subtexto}</p>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Slide Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                  disabled={currentSlideIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <ScrollArea className="flex-1 mx-4">
                  <div className="flex gap-2 justify-center">
                    {carousel.slides.map((slide, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentSlideIndex(i)}
                        className={`w-10 h-10 rounded-lg text-xs font-medium transition-all ${
                          i === currentSlideIndex
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80"
                        } ${slide.imageUrl ? "ring-2 ring-green-500" : ""}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => addSlide(carousel.slides.length - 1)}
                      className="w-10 h-10 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center hover:border-primary transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </ScrollArea>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentSlideIndex(Math.min(carousel.slides.length - 1, currentSlideIndex + 1))}
                  disabled={currentSlideIndex === carousel.slides.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Design Actions */}
              <div className="flex gap-2">
                <Select value={designStyle} onValueChange={setDesignStyle}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DESIGN_STYLES.map((style) => (
                      <SelectItem key={style.id} value={style.id}>
                        {style.label} - {style.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={() => handleGenerateDesign(currentSlideIndex)}
                  disabled={isGeneratingDesign}
                >
                  {isGeneratingDesign ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Image className="h-4 w-4 mr-2" />
                      Gerar Design
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Editor Panel */}
            <div className="space-y-4">
              <Tabs defaultValue="slides">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="slides">Slides</TabsTrigger>
                  <TabsTrigger value="legenda">Legenda</TabsTrigger>
                </TabsList>

                <TabsContent value="slides" className="space-y-4">
                  {/* Current Slide Editor */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Slide {currentSlideIndex + 1}</CardTitle>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingSlide(editingSlide === currentSlideIndex ? null : currentSlideIndex)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          {carousel.slides.length > 2 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeSlide(currentSlideIndex)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">Destaque</label>
                        <Input
                          value={currentSlide?.destaque || ""}
                          onChange={(e) => updateSlide(currentSlideIndex, { destaque: e.target.value })}
                          placeholder="Palavra ou frase de destaque"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">Headline</label>
                        <Textarea
                          value={currentSlide?.headline || ""}
                          onChange={(e) => updateSlide(currentSlideIndex, { headline: e.target.value })}
                          placeholder="Texto principal do slide"
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">Subtexto</label>
                        <Textarea
                          value={currentSlide?.subtexto || ""}
                          onChange={(e) => updateSlide(currentSlideIndex, { subtexto: e.target.value })}
                          placeholder="Texto de apoio (opcional)"
                          rows={4}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* All Slides Overview */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Todos os Slides</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[200px]">
                        <div className="space-y-2">
                          {carousel.slides.map((slide, i) => (
                            <div
                              key={i}
                              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                i === currentSlideIndex ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                              }`}
                              onClick={() => setCurrentSlideIndex(i)}
                            >
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="text-xs">
                                  {slide.tipo}
                                </Badge>
                                {slide.imageUrl && (
                                  <Check className="h-3 w-3 text-green-500" />
                                )}
                              </div>
                              <p className="text-sm mt-1 line-clamp-2">{slide.headline}</p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="legenda" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Legenda do Post</CardTitle>
                        <Button variant="ghost" size="sm" onClick={handleCopyLegenda}>
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={carousel.legenda}
                        onChange={(e) => updateLegenda(e.target.value)}
                        placeholder="Legenda para o Instagram..."
                        rows={12}
                        className="resize-none"
                      />
                    </CardContent>
                  </Card>

                  {carousel.cta_stories && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Sugestão para Stories</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{carousel.cta_stories}</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
