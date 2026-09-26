import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { useCalendarItems, type CalendarItem } from "@/hooks/useCalendarItems";
import { useProfile } from "@/hooks/useProfile";
import { useProducts } from "@/hooks/useProducts";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CalendarDays, FolderOpen, ChevronLeft, ChevronRight, Plus, Sparkles, Loader2 } from "lucide-react";
import { FormatTile } from "@/components/planner/FormatTile";
import { FeedPreview } from "@/components/planner/FeedPreview";
import { QuickNotes } from "@/components/planner/QuickNotes";
import { GenerateCalendarDialog, type GenerateOptions } from "@/components/planner/GenerateCalendarDialog";
import { IdeaDialog, type IdeaValues } from "@/components/planner/IdeaDialog";
import { toISO } from "@/components/planner/formats";
import type { Json } from "@/integrations/supabase/types";

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
function startOfWeek(date: Date) {
  const day = new Date(date);
  day.setHours(12, 0, 0, 0);
  day.setDate(day.getDate() - (day.getDay() + 6) % 7);
  return day;
}
function daysFrom(start: Date, length: number) {
  return Array.from({ length }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export default function ContentPlanner() {
  const navigate = useNavigate();
  const location = useLocation();
  const initial = location.state as { openGenerator?: boolean; targetMonth?: number; targetYear?: number } | null;
  const [currentDate, setCurrentDate] = useState(() => initial?.targetMonth ? new Date(initial.targetYear ?? new Date().getFullYear(), initial.targetMonth - 1, 1) : new Date());
  const [view, setView] = useState<"week" | "month">("week");
  const [openGenerator, setOpenGenerator] = useState(Boolean(initial?.openGenerator));
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [ideaOpen, setIdeaOpen] = useState(false);
  const [selected, setSelected] = useState<CalendarItem | null>(null);
  const [defaultDate, setDefaultDate] = useState(toISO(new Date()));
  const { items, isLoading, addItem, addBatchItems, updateItem, deleteItem } = useCalendarItems();
  const { profile } = useProfile();
  const { products } = useProducts();
  const { hasPremiumAccess } = useUserRole();

  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const weekStart = startOfWeek(currentDate);
  const monthGridStart = startOfWeek(monthStart);
  const weeks = Math.ceil(((monthStart.getDay() + 6) % 7 + new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()) / 7);
  const dates = view === "week" ? daysFrom(weekStart, 7) : daysFrom(monthGridStart, weeks * 7);
  const monthLabel = currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const openIdea = (date: string, item?: CalendarItem) => {
    setDefaultDate(date);
    setSelected(item ?? null);
    setIdeaOpen(true);
  };
  const saveIdea = async (v: IdeaValues) => {
    const snap = (selected?.estrategia_snapshot && typeof selected.estrategia_snapshot === "object" && !Array.isArray(selected.estrategia_snapshot)) ? selected.estrategia_snapshot : {};
    const payload = {
      data: v.data, tipo: v.tipo, titulo: v.titulo.trim(), status: v.status,
      notas: v.notas, conteudo_corpo: v.conteudo_corpo,
      estrategia_snapshot: { ...snap, horario: v.horario } as Json,
    };
    const success = selected ? await updateItem(selected.id, payload) : await addItem(payload);
    if (!success) throw new Error("Não foi possível salvar a ideia");
    setIdeaOpen(false);
    toast.success("Ideia salva");
  };
  const createFromIdea = async (v: IdeaValues) => {
    await saveIdea(v);
    navigate("/carousel-creator", {
      state: {
        topic: `${v.titulo}. ${v.notas}`,
        preselectedFormat: ({ carrossel: "carousel", reels: "reels_script", post_unico: "single_post", stories: "stories" } as Record<string, string>)[v.tipo],
        ideaDescription: v.conteudo_corpo,
      },
    });
  };
  const deleteSelected = async () => {
    if (!selected || !window.confirm("Excluir esta ideia?")) return;
    if (await deleteItem(selected.id)) setIdeaOpen(false);
  };
  const generate = async (o: GenerateOptions) => {
    if (!hasPremiumAccess()) { toast.error("Geração disponível para Elite, Teste e Admin."); return; }
    setLoading(true);
    setProgress("Criando seu calendário...");
    try {
      const start = o.period === "weekly" ? startOfWeek(currentDate) : new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (start < today) start.setTime(today.getTime());
      const daysCount = o.period === "weekly" ? Math.min(7, 7 - (start.getDay() + 6) % 7) : Math.min(31, new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate() - start.getDate() + 1);
      const postCount = Math.min(o.perWeek, daysCount);
      const batches = o.period === "weekly" ? 1 : Math.ceil(daysCount / 7);
      let total = 0;
      for (let batch = 0; batch < batches; batch++) {
        const batchStart = new Date(start);
        batchStart.setDate(batchStart.getDate() + 7 * batch);
        const batchDays = Math.min(7, daysCount - batch * 7);
        if (batchDays <= 0) continue;
        setProgress(`Criando ideias ${batch + 1} de ${batches}...`);
        const { data, error } = await supabase.functions.invoke("generate-month-plan", { body: {
          profile, products, startDate: toISO(batchStart), daysCount: batchDays,
          postCount: Math.min(postCount, batchDays), period: o.period, objective: o.objective, formats: o.formats,
        } });
        if (error) {
          const response = "context" in error ? error.context as Response : null;
          const body = response && typeof response.json === "function" ? await response.json().catch(() => null) : null;
          throw new Error(body?.error || error.message);
        }
        if (!Array.isArray(data) || !data.length) throw new Error(data?.error || "Nenhuma ideia foi gerada.");
        setProgress(`Salvando ideias ${batch + 1} de ${batches}...`);
        const saved = await addBatchItems(data);
        if (!saved) throw new Error("Não foi possível salvar as ideias. Tente novamente.");
        total += saved.length;
      }
      setOpenGenerator(false);
      toast.success(`${total} ideias adicionadas ao calendário`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível gerar o calendário");
    } finally { setLoading(false); setProgress(""); }
  };

  const move = (offset: number) => setCurrentDate((prev) => {
    const next = new Date(prev);
    if (view === "week") next.setDate(next.getDate() + 7 * offset);
    else next.setMonth(next.getMonth() + offset);
    return next;
  });

  return (
    <AppLayout title="Calendário de conteúdo" description="Planeje o que publicar, da ideia ao post pronto">
      <div className="space-y-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            <Button variant="secondary" size="sm" className="gap-2"><CalendarDays className="h-4 w-4" />Calendário</Button>
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate("/carousel-creator")}><FolderOpen className="h-4 w-4" />Conteúdos</Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border bg-muted/50 p-1">
              <Button variant={view === "week" ? "secondary" : "ghost"} size="sm" onClick={() => setView("week")}>Semana</Button>
              <Button variant={view === "month" ? "secondary" : "ghost"} size="sm" onClick={() => setView("month")}>Mês</Button>
            </div>
            <Button variant="secondary" size="sm" onClick={() => openIdea(toISO(currentDate))}><Plus className="mr-1 h-4 w-4" />Nova ideia</Button>
            <Button variant="outline" size="sm" onClick={() => setOpenGenerator(true)}><Sparkles className="mr-1 h-4 w-4" />Gerar calendário</Button>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-muted px-2 py-1">
            <Button variant="ghost" size="icon" aria-label="Anterior" onClick={() => move(-1)}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="min-w-36 text-center text-sm font-semibold capitalize">{monthLabel}</span>
            <Button variant="ghost" size="icon" aria-label="Próximo" onClick={() => move(1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
        {isLoading ? <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
          <div className="overflow-x-auto">
            <div className="min-w-[660px]">
              <div className="grid grid-cols-7 gap-2 pb-3">
                {WEEKDAYS.map((d) => <div key={d} className="text-center text-xs font-semibold uppercase text-muted-foreground">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {dates.map((date) => {
                  const key = toISO(date);
                  const today = key === toISO(new Date());
                  const dayItems = items.filter((i) => i.data === key && i.status !== "arquivado");
                  return (
                    <div key={key} className={`min-w-0 ${view === "month" ? "min-h-[135px]" : "min-h-[220px]"} ${date.getMonth() !== currentDate.getMonth() && view === "month" ? "opacity-45" : ""}`}>
                      <Button variant={today ? "default" : "ghost"} size="icon" onClick={() => openIdea(key)} className="mx-auto mb-3 flex h-9 w-9 rounded-full text-lg font-semibold" aria-label={`Nova ideia em ${key}`}>{date.getDate()}</Button>
                      <div className={`flex h-[calc(100%-3rem)] flex-wrap content-start justify-center gap-2 rounded-xl border p-2 transition-colors hover:border-primary/40 ${today ? "border-primary/40 bg-primary/5" : "border-border bg-card/60"}`}>
                        {dayItems.slice(0, view === "month" ? 3 : 8).map((item) => <FormatTile key={item.id} item={item} compact={view === "month"} onClick={() => openIdea(key, item)} />)}
                        {dayItems.length > (view === "month" ? 3 : 8) && <span className="text-xs text-muted-foreground">+{dayItems.length - (view === "month" ? 3 : 8)}</span>}
                        {!dayItems.length && <Button variant="ghost" size="icon" className="h-8 w-8 opacity-50 hover:opacity-100" onClick={() => openIdea(key)} aria-label={`Adicionar ideia em ${key}`}><Plus className="h-4 w-4" /></Button>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        <div className="grid items-start gap-8 border-t pt-6 lg:grid-cols-[minmax(0,3fr)_minmax(260px,2fr)]">
          <FeedPreview items={items} onOpen={(i) => openIdea(i.data, i)} />
          <QuickNotes />
        </div>
      </div>
      <GenerateCalendarDialog open={openGenerator} onOpenChange={setOpenGenerator} onGenerate={generate} loading={loading} progress={progress} />
      <IdeaDialog open={ideaOpen} onOpenChange={setIdeaOpen} item={selected} defaultDate={defaultDate} onSave={saveIdea} onCreate={createFromIdea} onDelete={deleteSelected} />
    </AppLayout>
  );
}
