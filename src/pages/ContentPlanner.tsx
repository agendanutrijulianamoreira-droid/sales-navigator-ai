import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useCalendarItems, CalendarItem } from "@/hooks/useCalendarItems";
import { ScheduleDialog } from "@/components/ScheduleDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { 
  Calendar, Grid3X3, Plus, ChevronLeft, ChevronRight,
  FileText, Image, MessageSquare, TrendingUp, ArrowLeft, Trash2, Loader2, Sparkles
} from "lucide-react";
import { toast } from "sonner";
// Tipos de conteúdo baseados na metodologia
const CONTENT_TYPES = {
  carrossel: { label: "Carrossel", icon: Grid3X3, color: "bg-blue-500" },
  post_unico: { label: "Post Único", icon: Image, color: "bg-green-500" },
  reels: { label: "Reels", icon: TrendingUp, color: "bg-purple-500" },
  stories: { label: "Stories", icon: MessageSquare, color: "bg-orange-500" },
  levantada: { label: "Levantada de Mão", icon: FileText, color: "bg-pink-500" },
};

const STRATEGIC_GOALS = {
  atrair: { label: "Atrair", description: "Alcance e novos seguidores", color: "bg-blue-500/10 text-blue-600 border-blue-200" },
  aquecer: { label: "Aquecer", description: "Autoridade e confiança", color: "bg-amber-500/10 text-amber-600 border-amber-200" },
  converter: { label: "Converter", description: "Venda e ação direta", color: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
};

const WEEKLY_STRATEGY = [
  { day: 1, goal: "atrair", type: "reels", title: "Dica rápida de nutrição" },
  { day: 2, goal: "aquecer", type: "carrossel", title: "Explicação profunda sobre metabolismo" },
  { day: 3, goal: "aquecer", type: "stories", title: "Bastidores do consultório" },
  { day: 4, goal: "atrair", type: "post_unico", title: "Mito vs Verdade" },
  { day: 5, goal: "converter", type: "carrossel", title: "Como funciona meu acompanhamento" },
  { day: 6, goal: "aquecer", type: "reels", title: "Receita prática da semana" },
  { day: 0, goal: "converter", type: "levantada", title: "Chamada para agendamento" },
];

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function ContentPlanner() {
  const { profile } = useProfile();
  const { items, isLoading, addItem, deleteItem, getItemsForDate } = useCalendarItems();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week">("month");
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  // Get week dates
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

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentYear, currentMonth + direction, 1));
  };

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const handleSchedule = async (data: { date: string; tipo: string; titulo: string }) => {
    await addItem({
      data: data.date,
      tipo: data.tipo,
      titulo: data.titulo,
    });
  };

  const handleGenerateWeeklyStrategy = async () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    for (const step of WEEKLY_STRATEGY) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + step.day);
      
      await addItem({
        data: date.toISOString().split('T')[0],
        tipo: step.type,
        titulo: step.title,
        notas: `Objetivo: ${STRATEGIC_GOALS[step.goal as keyof typeof STRATEGIC_GOALS].label}`,
      });
    }
    toast.success("Estratégia semanal gerada com sucesso!");
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setShowScheduleDialog(true);
  };

  // Count items by type for the current view
  const getTypeCounts = () => {
    const monthItems = items.filter(item => {
      const itemDate = new Date(item.data);
      return itemDate.getFullYear() === currentYear && itemDate.getMonth() === currentMonth;
    });
    
    const counts: Record<string, number> = {};
    Object.keys(CONTENT_TYPES).forEach(key => counts[key] = 0);
    monthItems.forEach(item => {
      if (counts[item.tipo] !== undefined) {
        counts[item.tipo]++;
      }
    });
    return counts;
  };

  const typeCounts = getTypeCounts();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
              <h1 className="font-semibold">Planejador de Conteúdo</h1>
              <p className="text-xs text-muted-foreground">Organize seus posts da semana</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleGenerateWeeklyStrategy}>
              <Sparkles className="h-4 w-4 mr-2" />
              Gerar Estratégia
            </Button>
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
        {/* View Toggle & Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Tabs value={view} onValueChange={(v) => setView(v as "month" | "week")}>
              <TabsList>
                <TabsTrigger value="month">
                  <Calendar className="h-4 w-4 mr-2" />
                  Mês
                </TabsTrigger>
                <TabsTrigger value="week">
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  Semana
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => view === "month" ? navigateMonth(-1) : navigateWeek(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium min-w-[140px] text-center">
              {view === "month" 
                ? `${MONTHS[currentMonth]} ${currentYear}`
                : `${weekDates[0].getDate()}/${weekDates[0].getMonth() + 1} - ${weekDates[6].getDate()}/${weekDates[6].getMonth() + 1}`
              }
            </span>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => view === "month" ? navigateMonth(1) : navigateWeek(1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Monthly View */}
        {view === "month" && (
          <Card>
            <CardContent className="p-4">
              {/* Days header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before first of month */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Days of month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNumber = i + 1;
                  const date = new Date(currentYear, currentMonth, dayNumber);
                  const posts = getItemsForDate(date);
                  const isToday = 
                    dayNumber === new Date().getDate() && 
                    currentMonth === new Date().getMonth() &&
                    currentYear === new Date().getFullYear();

                  return (
                    <div
                      key={dayNumber}
                      onClick={() => handleDayClick(date)}
                      className={`aspect-square p-1 rounded-lg border transition-all hover:border-primary/50 cursor-pointer ${
                        isToday ? "bg-primary/10 border-primary" : "border-transparent hover:bg-muted/50"
                      }`}
                    >
                      <div className="text-xs font-medium mb-1">{dayNumber}</div>
                      <div className="space-y-0.5">
                        {posts.slice(0, 2).map((post, pi) => {
                          const typeConfig = CONTENT_TYPES[post.tipo as keyof typeof CONTENT_TYPES];
                          return (
                            <div
                              key={pi}
                              className={`h-1.5 rounded-full ${typeConfig?.color || "bg-gray-400"}`}
                              title={post.titulo || post.tipo}
                            />
                          );
                        })}
                        {posts.length > 2 && (
                          <div className="text-[10px] text-muted-foreground">+{posts.length - 2}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weekly View */}
        {view === "week" && (
          <div className="grid grid-cols-7 gap-4">
            {weekDates.map((date, i) => {
              const posts = getItemsForDate(date);
              const isToday = 
                date.getDate() === new Date().getDate() && 
                date.getMonth() === new Date().getMonth() &&
                date.getFullYear() === new Date().getFullYear();

              return (
                <Card key={i} className={isToday ? "border-primary" : ""}>
                  <CardHeader className="pb-2">
                    <CardTitle className={`text-sm ${isToday ? "text-primary" : ""}`}>
                      {DAYS[i]}
                    </CardTitle>
                    <CardDescription>{date.getDate()}/{date.getMonth() + 1}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {posts.length > 0 ? (
                      posts.map((post) => {
                        const typeConfig = CONTENT_TYPES[post.tipo as keyof typeof CONTENT_TYPES];
                        const IconComponent = typeConfig?.icon || FileText;
                        return (
                          <div key={post.id} className="p-2 rounded-lg bg-muted/50 text-xs group relative">
                            <div className="flex items-center gap-1 mb-1">
                              <IconComponent className="h-3 w-3" />
                              <span className="font-medium">{typeConfig?.label || post.tipo}</span>
                            </div>
                            <p className="text-muted-foreground line-clamp-2">{post.titulo}</p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => deleteItem(post.id)}
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        );
                      })
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full h-20 border-2 border-dashed"
                        onClick={() => handleDayClick(date)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          {Object.entries(CONTENT_TYPES).map(([key, config]) => {
            const IconComponent = config.icon;
            return (
              <Card key={key}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${config.color} flex items-center justify-center`}>
                    <IconComponent className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{config.label}</p>
                    <p className="font-medium">{typeCounts[key] || 0}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Legend */}
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

      {/* Schedule Dialog */}
      <ScheduleDialog
        open={showScheduleDialog}
        onOpenChange={setShowScheduleDialog}
        onSchedule={handleSchedule}
        defaultTitle=""
        defaultTipo="carrossel"
      />
    </div>
  );
}
