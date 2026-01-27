import { useState } from "react";
import { 
  useCarouselGenerator, 
  POST_TYPE_LABELS, 
  CONTENT_PILLARS, 
  DESIGN_STYLES, 
  FONT_OPTIONS,
  COLOR_PALETTES,
  PostType, 
  CarouselSlide,
  WeekContent
} from "@/hooks/useCarouselGenerator";
import { useGenerations } from "@/hooks/useGenerations";
import { useCalendarItems } from "@/hooks/useCalendarItems";
import { ScheduleDialog } from "@/components/ScheduleDialog";
import { ColorPicker } from "@/components/ColorPicker";
import { downloadCarouselAsZip } from "@/lib/downloadZip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Loader2, Sparkles, Copy, Save, ChevronLeft, ChevronRight, 
  Plus, Trash2, Image, RefreshCw, Wand2, Edit3, Check, ArrowLeft, CalendarPlus,
  Calendar, Palette, Type, Images, Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const WEEK_DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

export default function CarouselCreator() {
  const { toast } = useToast();
  const { saveGeneration } = useGenerations();
  const { addItem: addCalendarItem } = useCalendarItems();
  const {
    carousel,
    weekContent,
    isGenerating,
    isGeneratingDesign,
    isGeneratingWeek,
    isGeneratingAllDesigns,
    designProgress,
    designSettings,
    setDesignSettings,
    currentSlideIndex,
    setCurrentSlideIndex,
    generateCarousel,
    generateSlideDesign,
    generateAllSlideDesigns,
    generateWeekContent,
    selectWeekContentForEdit,
    updateSlide,
    updateLegenda,
    addSlide,
    removeSlide,
    resetCarousel,
    resetWeekContent,
  } = useCarouselGenerator();

  // Form state
  const [topic, setTopic] = useState("");
  const [postType, setPostType] = useState<PostType>("ESTRATEGIA_UTIL");
  const [contentPillar, setContentPillar] = useState("Educativo");
  const [customInstructions, setCustomInstructions] = useState("");
  const [editingSlide, setEditingSlide] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [savedGenerationId, setSavedGenerationId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [useCustomColors, setUseCustomColors] = useState(false);
  const [mode, setMode] = useState<"single" | "week">("single");
  const [editingWeekItem, setEditingWeekItem] = useState<string | null>(null);

  // Week content form
  const [weekTopics, setWeekTopics] = useState<{ topic: string; postType: PostType; contentPillar: string }[]>([
    { topic: "", postType: "ESTRATEGIA_UTIL", contentPillar: "Educativo" },
    { topic: "", postType: "PROMESSA", contentPillar: "Autoridade" },
    { topic: "", postType: "COMO_FIZ", contentPillar: "Conexão/Bastidores" },
    { topic: "", postType: "DOR_EVENTO", contentPillar: "Conversão/Venda" },
    { topic: "", postType: "ALCANCE", contentPillar: "Entretenimento" },
  ]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({ variant: "destructive", title: "Digite um tema" });
      return;
    }
    await generateCarousel(topic, postType, contentPillar, customInstructions);
  };

  const handleGenerateWeek = async () => {
    const validTopics = weekTopics.filter(t => t.topic.trim());
    if (validTopics.length === 0) {
      toast({ variant: "destructive", title: "Adicione pelo menos um tema" });
      return;
    }
    await generateWeekContent(validTopics);
  };

  const handleEditWeekItem = (item: WeekContent) => {
    setEditingWeekItem(item.id);
    selectWeekContentForEdit(item.id);
  };

  const handleBackToWeekList = () => {
    setEditingWeekItem(null);
    resetCarousel();
  };

  const handleGenerateDesign = async (index: number) => {
    await generateSlideDesign(index, designSettings.style, {
      primary: designSettings.primaryColor,
      secondary: designSettings.secondaryColor,
    }, designSettings.fontFamily);
  };

  const handleGenerateAllDesigns = async () => {
    await generateAllSlideDesigns();
  };

  const updateWeekTopic = (index: number, updates: Partial<{ topic: string; postType: PostType; contentPillar: string }>) => {
    setWeekTopics(prev => prev.map((t, i) => i === index ? { ...t, ...updates } : t));
  };

  const addWeekTopic = () => {
    if (weekTopics.length < 7) {
      setWeekTopics(prev => [...prev, { topic: "", postType: "ESTRATEGIA_UTIL", contentPillar: "Educativo" }]);
    }
  };

  const removeWeekTopic = (index: number) => {
    if (weekTopics.length > 1) {
      setWeekTopics(prev => prev.filter((_, i) => i !== index));
    }
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
    
    const result = await saveGeneration({
      tipo: "post",
      subtipo: "carrossel",
      specialist: "social_media_manager",
      titulo: carousel.titulo,
      output_content: JSON.stringify(carousel),
      input_data: { topic, postType, contentPillar },
      favorito: false,
      tags: [postType.toLowerCase(), contentPillar.toLowerCase()],
    });
    
    if (!result.error && result.data?.id) {
      setSavedGenerationId(result.data.id);
    }
    
    toast({ title: "Salvo na biblioteca!" });
  };

  const handleSchedule = async (data: { date: string; tipo: string; titulo: string }) => {
    await addCalendarItem({
      data: data.date,
      tipo: data.tipo,
      titulo: data.titulo,
      generation_id: savedGenerationId || undefined,
    });
  };

  const handleDownloadZip = async () => {
    if (!carousel) return;
    
    const hasImages = carousel.slides.some(s => s.imageUrl);
    if (!hasImages) {
      toast({ variant: "destructive", title: "Gere os designs primeiro" });
      return;
    }
    
    setIsDownloading(true);
    try {
      await downloadCarouselAsZip(carousel.slides, carousel.titulo);
      toast({ title: "Download iniciado!" });
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Erro no download", 
        description: error instanceof Error ? error.message : "Tente novamente" 
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const currentSlide = carousel?.slides[currentSlideIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            {editingWeekItem ? (
              <Button variant="ghost" size="icon" onClick={handleBackToWeekList}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="ghost" size="icon" asChild>
                <Link to="/"><ArrowLeft className="h-4 w-4" /></Link>
              </Button>
            )}
            <div>
              <h1 className="font-semibold">
                {editingWeekItem ? "Editando Post" : "Gerador de Carrossel"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {editingWeekItem ? "Voltar para lista da semana" : "Crie posts que convertem"}
              </p>
            </div>
          </div>
          {carousel && (
            <div className="flex gap-2">
              {editingWeekItem && (
                <Button variant="outline" size="sm" onClick={handleBackToWeekList}>
                  <Check className="h-4 w-4 mr-2" /> Concluir Edição
                </Button>
              )}
              {!editingWeekItem && (
                <Button variant="outline" size="sm" onClick={resetCarousel}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Novo
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownloadZip}
                disabled={isDownloading || !carousel.slides.some(s => s.imageUrl)}
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <><Download className="h-4 w-4 mr-2" /> ZIP</>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowScheduleDialog(true)}>
                <CalendarPlus className="h-4 w-4 mr-2" /> Agendar
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" /> Salvar
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="container px-4 py-6">
        {/* Week content list view */}
        {weekContent.length > 0 && !carousel && !editingWeekItem ? (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Semana Gerada</h2>
                <p className="text-sm text-muted-foreground">Clique em um post para editar</p>
              </div>
              <Button variant="outline" onClick={resetWeekContent}>
                <RefreshCw className="h-4 w-4 mr-2" /> Nova Semana
              </Button>
            </div>
            
            <div className="grid gap-4">
              {weekContent.map((item, index) => (
                <Card 
                  key={item.id} 
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleEditWeekItem(item)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="font-semibold text-primary">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium line-clamp-1">{item.carousel?.titulo || item.topic}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{POST_TYPE_LABELS[item.postType]}</Badge>
                            <Badge variant="secondary" className="text-xs">{item.contentPillar}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={item.status === "edited" ? "default" : "secondary"}>
                          {item.status === "edited" ? "Editado" : "Gerado"}
                        </Badge>
                        <Edit3 className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : !carousel ? (
          /* Generator Form */
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Mode Selector */}
            <div className="flex gap-2 justify-center">
              <Button 
                variant={mode === "single" ? "default" : "outline"} 
                onClick={() => setMode("single")}
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Post Único
              </Button>
              <Button 
                variant={mode === "week" ? "default" : "outline"} 
                onClick={() => setMode("week")}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Semana Completa
              </Button>
            </div>

            {mode === "single" ? (
              /* Single Post Form */
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
            ) : (
              /* Week Content Form */
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Gerar Semana de Conteúdo
                  </CardTitle>
                  <CardDescription>
                    Configure os temas da semana e gere todos de uma vez
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {weekTopics.map((item, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <Badge variant="outline">{WEEK_DAYS[index] || `Post ${index + 1}`}</Badge>
                            {weekTopics.length > 1 && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => removeWeekTopic(index)}
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            )}
                          </div>
                          
                          <div className="space-y-3">
                            <Input
                              value={item.topic}
                              onChange={(e) => updateWeekTopic(index, { topic: e.target.value })}
                              placeholder="Tema do post..."
                            />
                            
                            <div className="grid grid-cols-2 gap-2">
                              <Select 
                                value={item.postType} 
                                onValueChange={(v) => updateWeekTopic(index, { postType: v as PostType })}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(POST_TYPE_LABELS).map(([key, label]) => (
                                    <SelectItem key={key} value={key} className="text-xs">{label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              
                              <Select 
                                value={item.contentPillar} 
                                onValueChange={(v) => updateWeekTopic(index, { contentPillar: v })}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {CONTENT_PILLARS.map((pillar) => (
                                    <SelectItem key={pillar} value={pillar} className="text-xs">{pillar}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>

                  {weekTopics.length < 7 && (
                    <Button variant="outline" onClick={addWeekTopic} className="w-full">
                      <Plus className="h-4 w-4 mr-2" /> Adicionar Post
                    </Button>
                  )}

                  <Button 
                    onClick={handleGenerateWeek} 
                    disabled={isGeneratingWeek} 
                    className="w-full" 
                    size="lg"
                  >
                    {isGeneratingWeek ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Gerando {weekTopics.filter(t => t.topic.trim()).length} posts...
                      </>
                    ) : (
                      <>
                        <Calendar className="h-4 w-4 mr-2" />
                        Gerar Semana Completa
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Quick Ideas - only for single mode */}
            {mode === "single" && (
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
            )}
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

              {/* Design Settings & Actions */}
              <Card className="p-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Palette className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Design & Paleta</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {/* Style */}
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Estilo</label>
                    <Select 
                      value={designSettings.style} 
                      onValueChange={(v) => setDesignSettings(prev => ({ ...prev, style: v }))}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DESIGN_STYLES.map((style) => (
                          <SelectItem key={style.id} value={style.id}>
                            {style.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Font */}
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Tipografia</label>
                    <Select 
                      value={designSettings.fontFamily} 
                      onValueChange={(v) => setDesignSettings(prev => ({ ...prev, fontFamily: v }))}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_OPTIONS.map((font) => (
                          <SelectItem key={font.id} value={font.id}>
                            {font.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Color Palette */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-muted-foreground">Paleta de Cores</label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 text-xs"
                      onClick={() => setUseCustomColors(!useCustomColors)}
                    >
                      {useCustomColors ? "Usar paletas" : "Cores personalizadas"}
                    </Button>
                  </div>
                  
                  {useCustomColors ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Cor Primária</label>
                        <ColorPicker 
                          color={designSettings.primaryColor}
                          onChange={(c) => setDesignSettings(prev => ({ ...prev, primaryColor: c }))}
                          label={designSettings.primaryColor}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Cor Secundária</label>
                        <ColorPicker 
                          color={designSettings.secondaryColor}
                          onChange={(c) => setDesignSettings(prev => ({ ...prev, secondaryColor: c }))}
                          label={designSettings.secondaryColor}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {COLOR_PALETTES.map((palette) => (
                        <button
                          key={palette.id}
                          onClick={() => setDesignSettings(prev => ({ 
                            ...prev, 
                            primaryColor: palette.primary, 
                            secondaryColor: palette.secondary 
                          }))}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs transition-all ${
                            designSettings.primaryColor === palette.primary 
                              ? "border-primary bg-primary/10" 
                              : "hover:border-muted-foreground"
                          }`}
                        >
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: palette.primary }}
                          />
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: palette.secondary }}
                          />
                          <span>{palette.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    onClick={() => handleGenerateDesign(currentSlideIndex)}
                    disabled={isGeneratingDesign || isGeneratingAllDesigns}
                    variant="outline"
                    className="flex-1"
                  >
                    {isGeneratingDesign ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Image className="h-4 w-4 mr-2" />
                        Slide Atual
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={handleGenerateAllDesigns}
                    disabled={isGeneratingDesign || isGeneratingAllDesigns}
                    className="flex-1"
                  >
                    {isGeneratingAllDesigns ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {designProgress.current}/{designProgress.total}
                      </>
                    ) : (
                      <>
                        <Images className="h-4 w-4 mr-2" />
                        Todos os Slides
                      </>
                    )}
                  </Button>
                </div>
                
                {isGeneratingAllDesigns && (
                  <Progress value={(designProgress.current / designProgress.total) * 100} className="h-2" />
                )}
              </Card>
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

      {/* Schedule Dialog */}
      <ScheduleDialog
        open={showScheduleDialog}
        onOpenChange={setShowScheduleDialog}
        onSchedule={handleSchedule}
        defaultTitle={carousel?.titulo || topic}
        defaultTipo="carrossel"
      />
    </div>
  );
}
