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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import {
  Calendar, Grid3X3, Plus, ChevronLeft, ChevronRight,
  FileText, ArrowLeft, Trash2, Loader2, Sparkles,
  Copy, Download, Search
} from "lucide-react";
import { toast } from "sonner";

const CONTENT_TYPES = {
  carrossel: { label: "Carrossel", icon: Grid3X3, color: "bg-blue-500" },
  post_unico: { label: "Post Único", icon: FileText, color: "bg-green-500" },
  reels: { label: "Reels", icon: FileText, color: "bg-purple-500" },
  stories: { label: "Stories", icon: FileText, color: "bg-orange-500" },
  levantada: { label: "Levantada de Mão", icon: FileText, color: "bg-pink-500" },
};

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export default function ContentPlanner() {
  const { profile } = useProfile();
  const { items, isLoading, addItem, deleteItem, updateItem, getItemsForDate } = useCalendarItems();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week">("month");
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingPost, setEditingPost] = useState<CalendarItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [showStatistics, setShowStatistics] = useState(false);

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
    setEditingPost(post);
    setShowEditDialog(true);
  };

  const handleUpdatePost = async (id: string, data: { date: string; tipo: string; titulo: string; notas?: string }) => {
    await updateItem(id, { data: data.date, tipo: data.tipo, titulo: data.titulo, notas: data.notas || null });
    toast.success("Post atualizado!");
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

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container flex items-center justify-between h-14 px-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/"><ArrowLeft className="h-4 w-4" /></Link>
              </Button>
              <div>
                <h1 className="font-semibold">Planejador de Conteúdo</h1>
                <p className="text-xs text-muted-foreground">Organize seus posts</p>
              </div>
            </div>
            <div className="flex gap-2">
              {isPremium && (
                <Button
                  variant="outline"
                  className="bg-primary/10 border-primary/20 hover:bg-primary/20 font-bold gap-2"
                  onClick={handleGenerateMonth}
                  disabled={isGeneratingMonth}
                >
                  {isGeneratingMonth ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {monthProgress || "Gerando..."}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Gerar Mês com IA
                    </>
                  )}
                </Button>
              )}
              <Button variant="outline" onClick={() => setShowScheduleDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Agendar
              </Button>
              <Button asChild>
                <Link to="/carousel-creator">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Carrossel
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <main className="container px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant={filterType === null ? "default" : "outline"} size="sm" onClick={() => setFilterType(null)}>Todos</Button>
              {Object.entries(CONTENT_TYPES).map(([key, config]) => (
                <Button key={key} variant={filterType === key ? "default" : "outline"} size="sm" onClick={() => setFilterType(key)}>
                  {config.label}
                </Button>
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowStatistics(!showStatistics)}>📊 Gráficos</Button>
              <Button variant="outline" size="sm" onClick={handleExportCSV}><Download className="h-4 w-4 mr-2" />CSV</Button>
            </div>
          </div>

          <div className="mb-6">
            <SmartAlerts items={filteredItems.length > 0 ? filteredItems : items} currentDate={currentDate} />
          </div>

          {view === "week" && (
            <div className="mb-6">
              <DateSuggestions
                items={items}
                weekDates={weekDates}
                onSelectDate={(date) => { setSelectedDate(date); setShowScheduleDialog(true); }}
              />
            </div>
          )}

          {showStatistics && (
            <div className="mb-6">
              <ContentStatistics items={filteredItems.length > 0 ? filteredItems : items} />
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <Tabs value={view} onValueChange={(v) => setView(v as "month" | "week")}>
              <TabsList>
                <TabsTrigger value="month"><Calendar className="h-4 w-4 mr-2" />Mês</TabsTrigger>
                <TabsTrigger value="week"><Grid3X3 className="h-4 w-4 mr-2" />Semana</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="font-medium min-w-[140px] text-center">{view === "month" ? `${MONTHS[currentMonth]} ${currentYear}` : `${weekDates[0].getDate()}/${weekDates[0].getMonth() + 1} - ${weekDates[6].getDate()}/${weekDates[6].getMonth() + 1}`}</span>
              <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>

          {view === "month" && (
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {DAYS.map((day) => <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNumber = i + 1;
                    const date = new Date(currentYear, currentMonth, dayNumber);
                    const posts = getItemsForDate(date);
                    const isToday = dayNumber === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();
                    return (
                      <div key={dayNumber} onClick={() => { setSelectedDate(date); setShowScheduleDialog(true); }} className={`aspect-square p-1 rounded-lg border transition-all cursor-pointer ${isToday ? "bg-primary/10 border-primary" : "border-transparent hover:bg-muted/50"}`}>
                        <div className="text-xs font-medium mb-1">{dayNumber}</div>
                        <div className="space-y-0.5">
                          {posts.slice(0, 2).map((post, pi) => {
                            const typeConfig = CONTENT_TYPES[post.tipo as keyof typeof CONTENT_TYPES];
                            return <div key={pi} className={`h-1.5 rounded-full ${typeConfig?.color || "bg-gray-400"}`} title={post.titulo || post.tipo} />;
                          })}
                          {posts.length > 2 && <div className="text-[10px] text-muted-foreground">+{posts.length - 2}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {view === "week" && (
            <div className="grid grid-cols-7 gap-4">
              {weekDates.map((date, i) => {
                const posts = getItemsForDate(date);
                const isToday = date.getDate() === new Date().getDate() && date.getMonth() === new Date().getMonth() && date.getFullYear() === new Date().getFullYear();
                return (
                  <Card key={i} className={isToday ? "border-primary" : ""}>
                    <CardHeader className="pb-2">
                      <CardTitle className={`text-sm ${isToday ? "text-primary" : ""}`}>{DAYS[i]}</CardTitle>
                      <CardDescription>{date.getDate()}/{date.getMonth() + 1}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <DroppableDay date={date} isEmpty={posts.length === 0} onDrop={handleDropPost} onAddClick={() => { setSelectedDate(date); setShowScheduleDialog(true); }}>
                        <div className="space-y-2">
                          {posts.map((post) => (
                            <DraggablePostCard key={post.id} post={post} onEdit={handleEditPost} onDuplicate={handleDuplicatePost} onDelete={deleteItem} />
                          ))}
                        </div>
                      </DroppableDay>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            {Object.entries(CONTENT_TYPES).map(([key, config]) => {
              const IconComponent = config.icon;
              return (
                <Card key={key}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${config.color} flex items-center justify-center`}><IconComponent className="h-4 w-4 text-white" /></div>
                    <div><p className="text-xs text-muted-foreground">{config.label}</p><p className="font-medium">{typeCounts[key] || 0}</p></div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Tipos de Conteúdo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {Object.entries(CONTENT_TYPES).map(([key, config]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${config.color}`} />
                    <span className="text-sm">{config.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>

        <ScheduleDialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog} onSchedule={handleSchedule} defaultTitle="" defaultTipo="carrossel" defaultDate={selectedDate || undefined} />
        <EditPostDialog open={showEditDialog} onOpenChange={setShowEditDialog} onUpdate={handleUpdatePost} post={editingPost || undefined} />
      </div>
    </DndProvider>
  );
}
