import { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useProfile } from "@/hooks/useProfile";
import { useCalendarItems, CalendarItem } from "@/hooks/useCalendarItems";
import { useAISpecialist } from "@/hooks/useAISpecialist";
import { useUserRole } from "@/hooks/useUserRole";
import { useProducts } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { ScheduleDialog } from "@/components/ScheduleDialog";
import { EditPostDialog } from "@/components/EditPostDialog";
import { SmartAlerts } from "@/components/SmartAlerts";
import { ContentStatistics } from "@/components/ContentStatistics";
import { DateSuggestions } from "@/components/DateSuggestions";
import { DraggablePostCard } from "@/components/DraggablePostCard";
import { DroppableDay } from "@/components/DroppableDay";
import { TrendsSidebar } from "@/components/TrendsSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";
import { 
  Calendar, Grid3X3, Plus, ChevronLeft, ChevronRight,
  FileText, ArrowLeft, Trash2, Loader2, Sparkles,
  Copy, Download, Search, MoreHorizontal, Zap,
  CalendarDays,
  Target
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { CalendarDayCell } from "@/components/CalendarDayCell";
import { getHolidayForDate, COMMEMORATIVE_DATES } from "@/lib/constants/holidays";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CONTENT_TYPES = {
  carrossel: { label: "Carrossel", icon: Grid3X3, color: "bg-blue-500" },
  post_unico: { label: "Post Único", icon: FileText, color: "bg-green-500" },
  reels: { label: "Reels", icon: FileText, color: "bg-purple-500" },
  stories: { label: "Stories", icon: FileText, color: "bg-orange-500" },
  levantada: { label: "Levantada de Mão", icon: FileText, color: "bg-pink-500" },
};

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function ContentPlanner() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { items, isLoading, addItem, deleteItem, updateItem, getItemsForDate } = useCalendarItems();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week">("month");
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedPost, setSelectedPost] = useState<CalendarItem | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showTrends, setShowTrends] = useState(false);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const filteredItems = items.filter(item => {
    const matchesSearch = !searchQuery ||
      item.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.notas?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !filterType || item.tipo === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleSchedule = async (data: { date: string; tipo: string; titulo: string }) => {
    await addItem({ data: data.date, tipo: data.tipo, titulo: data.titulo });
  };

  const handleEditPost = (post: CalendarItem) => {
    setSelectedPost(post);
  };

  const handleUpdatePost = async (id: string, data: { date: string; tipo: string; titulo: string; notas?: string }) => {
    await updateItem(id, { data: data.date, tipo: data.tipo, titulo: data.titulo, notas: data.notas || null });
    toast.success("Post atualizado!");
  };

  const handleApplyIdea = (idea: { tipo: string; titulo: string; hook: string; descricao: string }) => {
    setSelectedDate(new Date()); // O usuário pode arrastar depois
    addItem({
      data: new Date().toISOString().split("T")[0],
      tipo: idea.tipo,
      titulo: idea.titulo,
      notas: `Gancho sugerido: ${idea.hook}\n\nEstratégia: ${idea.descricao}`
    });
    toast.success("Ideia viral adicionada ao calendário! Arraste para o dia desejado.");
  };

  const handleDuplicatePost = async (post: CalendarItem) => {
    const newDate = new Date(post.data);
    newDate.setDate(newDate.getDate() + 7);
    await addItem({ data: newDate.toISOString().split('T')[0], tipo: post.tipo, titulo: `${post.titulo} (Cópia)`, notas: post.notas || undefined });
    toast.success("Post duplicado!");
  };

  const handleExportCSV = () => {
    const csv = [["Data", "Tipo", "Título", "Notas"], ...items.map(item => [item.data, item.tipo, item.titulo || "", item.notas || ""])].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `planejamento-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success("Exportado!");
  };

  const { generateContent, isLoading: isAISpecialistLoading } = useAISpecialist();
  const [isGeneratingMonth, setIsGeneratingMonth] = useState(false);
  const [monthProgress, setMonthProgress] = useState("");
  const { addBatchItems } = useCalendarItems();
  const { hasPremiumAccess, isLoading: isRoleLoading } = useUserRole();
  const { products } = useProducts();

  const isPremium = hasPremiumAccess();

  const handleGenerateMonth = async () => {
    if (!isPremium) {
      toast.error("Funcionalidade exclusiva para usuários Elite, Teste e Admin!");
      return;
    }

    if (items.length > 5) {
      const confirm = window.confirm("Isso irá gerar ~30 novos itens no seu calendário. Deseja continuar?");
      if (!confirm) return;
    }

    setIsGeneratingMonth(true);
    setMonthProgress("Analisando seu perfil e produtos...");

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 1);

      setMonthProgress("O Maestro está criando seu plano editorial...");

      const { data, error } = await supabase.functions.invoke("generate-month-plan", {
        body: {
          profile,
          products,
          startDate: startDate.toISOString().split("T")[0],
          daysCount: 30,
        },
      });

      if (error) throw error;

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Plano vazio retornado pela IA");
      }

      setMonthProgress(`Agendando ${data.length} posts no calendário...`);
      await addBatchItems(data);
      toast.success(`🎯 ${data.length} posts agendados pelo Maestro!`);
    } catch (error) {
      console.error("Erro ao gerar mês:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao gerar planejamento");
    } finally {
      setIsGeneratingMonth(false);
      setMonthProgress("");
    }
  };

  const handleGenerateManual = async () => {
    const confirm = window.confirm("Isso irá criar uma sugestão base de posts para as próximas 4 semanas. Deseja continuar?");
    if (!confirm) return;

    setIsGeneratingMonth(true);
    setMonthProgress("Criando planejamento manual...");

    const suggestedItems = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);

    const template = [
      { day: 1, tipo: "carrossel", titulo: "Dica Educativa", notas: "Resolva uma dor comum do seu público." },
      { day: 3, tipo: "reels", titulo: "Post de Autoridade", notas: "Quebre um mito ou mostre um resultado." },
      { day: 5, tipo: "post_unico", titulo: "Oferta Direta", notas: "Convide seu seguidor para uma ação." },
      { day: 0, tipo: "stories", titulo: "Bastidores/Vlog", notas: "Humanize sua marca e mostre o dia a dia." }
    ];

    for (let week = 0; week < 4; week++) {
      template.forEach(t => {
        const date = new Date(startDate);
        const currentDay = startDate.getDay();
        const dayOffset = (t.day - currentDay + 7) % 7 + (week * 7);
        date.setDate(startDate.getDate() + dayOffset);

        suggestedItems.push({
          data: date.toISOString().split('T')[0],
          tipo: t.tipo,
          titulo: t.titulo,
          notas: t.notas
        });
      });
    }

    try {
      await addBatchItems(suggestedItems);
      toast.success("Plano manual criado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar plano manual:", error);
      toast.error("Erro ao criar planejamento manual.");
    } finally {
      setIsGeneratingMonth(false);
      setMonthProgress("");
    }
  };

  const handleDropPost = async (postId: string, newDate: string) => {
    const post = items.find(item => item.id === postId);
    if (post && post.data !== newDate) {
      await updateItem(postId, { data: newDate });
      toast.success("Post movido!");
    }
  };

  const getTypeCounts = () => {
    const monthItems = items.filter(item => {
      const itemDate = new Date(item.data);
      return itemDate.getFullYear() === currentYear && itemDate.getMonth() === currentMonth;
    });
    const counts: Record<string, number> = {};
    Object.keys(CONTENT_TYPES).forEach(key => counts[key] = 0);
    monthItems.forEach(item => { if (counts[item.tipo] !== undefined) counts[item.tipo]++; });
    return counts;
  };

  const typeCounts = getTypeCounts();

  const handleQuickAction = (type: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    switch (type) {
      case 'text':
        setSelectedDate(date);
        setShowScheduleDialog(true);
        break;
      case 'image':
        setSelectedDate(date);
        setShowScheduleDialog(true);
        break;
      case 'layout':
        navigate('/carousel-creator', { state: { preselectedFormat: 'carousel' } });
        break;
      case 'ready_posts':
        navigate('/library');
        break;
      case 'service_highlight':
      case 'service_process':
      case 'service_benefits':
      case 'topics':
      case 'step_by_step':
        // Estes gatilhos podem abrir o Maestro ou Gerador com contexto
        toast.info("Abrindo assistente de geração para este tema...");
        navigate('/carousel-creator', { 
          state: { 
            topic: type.replace('_', ' '),
            autoGenerateDesign: true 
          } 
        });
        break;
      default:
        setSelectedDate(date);
        setShowScheduleDialog(true);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-white flex flex-col">
        {/* Canva-style Minimalist Header */}
        <header className="min-h-16 flex flex-wrap items-center justify-between gap-4 px-4 md:px-6 py-3 border-b border-gray-100 sticky top-0 bg-white z-50">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-gray-900 leading-none">Planejador de Conteúdo</h1>

            <div className="flex items-center bg-gray-50 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs font-semibold"
                onClick={() => setCurrentDate(new Date())}
              >
                Hoje
              </Button>
              <div className="flex items-center gap-1 border-l border-gray-200 ml-1 pl-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500"
                  onClick={() => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500"
                  onClick={() => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <span className="text-lg font-semibold text-gray-700 capitalize">
              {MONTHS[currentMonth]} de {currentYear}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-gray-50 rounded-lg p-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 text-xs font-bold px-3 text-primary">
                    <CalendarDays className="h-4 w-4 mr-2" />
                    Planejar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] md:w-80 p-0 overflow-hidden glass-card border-border/50">
                  <div className="p-4 border-b border-gray-100 bg-primary/5">
                    <h3 className="font-bold text-sm text-primary flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Datas Estratégicas ({MONTHS[currentMonth]})
                    </h3>
                    <p className="text-[10px] text-muted-foreground mt-1 italic">Dica: Clique para ir até a data no calendário</p>
                  </div>
                  <ScrollArea className="h-[50vh] md:h-80">
                    {COMMEMORATIVE_DATES.filter(d => d.month === currentMonth).map((d, i) => (
                      <DropdownMenuItem 
                        key={i} 
                        onClick={() => {
                          const targetDate = new Date(currentYear, d.month, d.day);
                          setCurrentDate(targetDate);
                        }}
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-xs">{d.day}/{d.month + 1} - {d.label}</span>
                          <span className="text-[10px] text-muted-foreground capitalize">{d.type}</span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                    {COMMEMORATIVE_DATES.filter(d => d.month === currentMonth).length === 0 && (
                      <div className="p-4 text-center text-xs text-muted-foreground">Nenhuma data este mês</div>
                    )}
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="w-px h-4 bg-gray-200 self-center mx-1" />

              <Button
                variant={view === "month" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 text-xs font-semibold px-3"
                onClick={() => setView("month")}
              >
                Mês
              </Button>
              <Button
                variant={view === "week" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 text-xs font-semibold px-3"
                onClick={() => setView("week")}
              >
                Semana
              </Button>
            </div>

            <Select value={filterType || "todos"} onValueChange={(v) => setFilterType(v === "todos" ? null : v)}>
              <SelectTrigger className="w-[180px] h-9 bg-gray-50 border-none text-sm font-medium">
                <SelectValue placeholder="Todos os eventos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os eventos</SelectItem>
                {Object.entries(CONTENT_TYPES).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              className="bg-primary hover:bg-primary/90 text-white font-bold h-9"
              onClick={() => { setSelectedDate(new Date()); setShowScheduleDialog(true); }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>

            <div className="flex items-center gap-1 ml-2">
              <Button
                variant={showTrends ? "secondary" : "ghost"}
                size="icon"
                className={`h-9 w-9 ${showTrends ? "text-orange-600 bg-orange-50" : "text-gray-400"}`}
                onClick={() => setShowTrends(!showTrends)}
              >
                <Zap className={`h-4 w-4 ${showTrends ? "fill-orange-600" : ""}`} />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-hidden flex flex-col">
            {/* Calendar Grid Header (Days Name) */}
            <div className="grid grid-cols-7 border-b border-gray-100 bg-white">
              {DAYS.map((day) => (
                <div key={day} className="text-left px-4 py-2 text-xs font-semibold text-gray-500 border-r border-gray-50 last:border-r-0">
                  {day}.
                </div>
              ))}
            </div>

            <ScrollArea className="flex-1">
              <div className="grid grid-cols-7 h-full">
                {/* Empty spaces at start */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="border-b border-r border-gray-50 min-h-[150px] bg-gray-50/20" />
                ))}

                {/* Actual Days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNumber = i + 1;
                  const d = new Date(currentYear, currentMonth, dayNumber);
                  const posts = getItemsForDate(d);
                  const isToday = dayNumber === new Date().getDate() &&
                    currentMonth === new Date().getMonth() &&
                    currentYear === new Date().getFullYear();

                  return (
                    <CalendarDayCell
                      key={dayNumber}
                      date={d}
                      dayNumber={dayNumber}
                      isToday={isToday}
                      posts={posts}
                      holiday={getHolidayForDate(dayNumber, currentMonth)}
                      onAddClick={(date) => { setSelectedDate(date); setShowScheduleDialog(true); }}
                      onEditPost={handleEditPost}
                      onDeletePost={deleteItem}
                      onDropPost={handleDropPost}
                      onQuickAction={handleQuickAction}
                    />
                  );
                })}
              </div>

              {/* Extra generation buttons floating or at bottom */}
              <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-[60]">
                <Button
                  variant="outline"
                  className="rounded-full shadow-lg bg-white border-primary/20 hover:bg-primary/5 text-primary font-bold pr-6 pl-4 py-6"
                  onClick={handleGenerateManual}
                  disabled={isGeneratingMonth}
                >
                  <Plus className="h-5 w-5 mr-3" />
                  Sugestão Manual
                </Button>
                {isPremium && (
                  <Button
                    className="rounded-full shadow-lg bg-primary hover:bg-primary/90 text-white font-bold pr-6 pl-4 py-6"
                    onClick={handleGenerateMonth}
                    disabled={isGeneratingMonth}
                  >
                    {isGeneratingMonth ? (
                      <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                    ) : (
                      <Sparkles className="h-5 w-5 mr-3" />
                    )}
                    {isGeneratingMonth ? (monthProgress || "Gerando...") : "Gerar Mês com IA"}
                  </Button>
                )}
              </div>
            </ScrollArea>
          </main>

          {showTrends && (
            <aside className="animate-in slide-in-from-right duration-300">
              <TrendsSidebar onApplyIdea={handleApplyIdea} />
            </aside>
          )}
        </div>

        <EditPostDialog
          open={!!selectedPost}
          onOpenChange={(open) => !open && setSelectedPost(undefined)}
          post={selectedPost}
          onUpdate={async (id, data) => {
            await updateItem(id, {
              titulo: data.titulo,
              tipo: data.tipo,
              notas: data.notas,
              data: data.date
            });
            setSelectedPost(undefined);
          }}
          onDuplicate={async (post) => {
            await addItem({
              data: post.data,
              tipo: post.tipo,
              titulo: `${post.titulo} (Cópia)`,
              notas: post.notas
            });
          }}
        />

        <ScheduleDialog
          open={showScheduleDialog}
          onOpenChange={setShowScheduleDialog}
          defaultDate={selectedDate || undefined}
          onSchedule={async (data) => {
            await addItem({
              data: data.date,
              tipo: data.tipo,
              titulo: data.titulo
            });
            setShowScheduleDialog(false);
          }}
        />
      </div>
    </DndProvider>
  );
};

export default ContentPlanner;
