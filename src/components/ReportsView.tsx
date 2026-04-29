import { useMemo, useState } from "react";
import { CalendarItem } from "@/hooks/useCalendarItems";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BarChart2, TrendingUp, CheckCircle2, Clock, Download,
  Layers, Target, Calendar, Award, AlertCircle, ChevronLeft, ChevronRight
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

const TYPE_CONFIG = {
  carrossel:  { label: "Carrossel",        color: "#7C3AED", bg: "bg-violet-500", light: "bg-violet-50", text: "text-violet-700" },
  post_unico: { label: "Post Único",        color: "#059669", bg: "bg-emerald-500", light: "bg-emerald-50", text: "text-emerald-700" },
  reels:      { label: "Reels",             color: "#EC4899", bg: "bg-pink-500",   light: "bg-pink-50",   text: "text-pink-700" },
  stories:    { label: "Stories",           color: "#F59E0B", bg: "bg-amber-500",  light: "bg-amber-50",  text: "text-amber-700" },
  levantada:  { label: "Levantada de Mão",  color: "#EF4444", bg: "bg-red-500",    light: "bg-red-50",    text: "text-red-700" },
};

const STATUS_CONFIG = {
  planejado: { label: "Planejado", color: "#9CA3AF", bg: "bg-gray-400" },
  rascunho:  { label: "Rascunho",  color: "#F59E0B", bg: "bg-amber-400" },
  pronto:    { label: "Pronto",    color: "#3B82F6", bg: "bg-blue-500" },
  agendado:  { label: "Agendado",  color: "#8B5CF6", bg: "bg-purple-500" },
  publicado: { label: "Publicado", color: "#10B981", bg: "bg-emerald-500" },
};

const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

interface ReportsViewProps {
  items: CalendarItem[];
}

function StatCard({ icon: Icon, label, value, sub, color = "text-gray-800" }: {
  icon: any; label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
          <p className={cn("text-2xl font-bold leading-none", color)}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
          <Icon className="h-4.5 w-4.5 text-gray-400" />
        </div>
      </div>
    </div>
  );
}

function DonutChart({ data, total }: { data: { label: string; value: number; color: string }[]; total: number }) {
  if (total === 0) return <div className="h-32 flex items-center justify-center text-xs text-gray-400">Nenhum dado</div>;

  let cumulative = 0;
  const segments = data
    .filter(d => d.value > 0)
    .map(d => {
      const pct = d.value / total;
      const start = cumulative;
      cumulative += pct;
      return { ...d, start, pct };
    });

  const r = 40;
  const cx = 50, cy = 50;
  const circumference = 2 * Math.PI * r;

  return (
    <div className="flex items-center gap-4">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F3F4F6" strokeWidth="14" />
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="14"
            strokeDasharray={`${seg.pct * circumference} ${circumference}`}
            strokeDashoffset={-seg.start * circumference}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition: "stroke-dasharray 0.4s ease" }}
          />
        ))}
        <text x={cx} y={cy - 3} textAnchor="middle" fontSize="14" fontWeight="700" fill="#111827">{total}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="6" fill="#9CA3AF">posts</text>
      </svg>
      <div className="space-y-1.5 flex-1 min-w-0">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-xs text-gray-600 truncate flex-1">{seg.label}</span>
            <span className="text-xs font-bold text-gray-800">{seg.value}</span>
            <span className="text-[10px] text-gray-400 w-8 text-right">{Math.round(seg.pct * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WeekHeatmap({ items, year, month }: { items: CalendarItem[]; year: number; month: number }) {
  const days = eachDayOfInterval({
    start: startOfMonth(new Date(year, month)),
    end: endOfMonth(new Date(year, month)),
  });

  const countByDate: Record<string, number> = {};
  items.forEach(item => {
    const d = item.data.slice(0, 10);
    countByDate[d] = (countByDate[d] || 0) + 1;
  });

  const maxCount = Math.max(...Object.values(countByDate), 1);
  const firstDow = getDay(days[0]);
  const DAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];

  return (
    <div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAY_LABELS.map((d, i) => (
          <div key={i} className="text-[9px] font-semibold text-gray-400 text-center">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: firstDow }).map((_, i) => <div key={`e-${i}`} />)}
        {days.map(day => {
          const key = format(day, "yyyy-MM-dd");
          const count = countByDate[key] || 0;
          const intensity = count === 0 ? 0 : Math.ceil((count / maxCount) * 4);
          const colors = ["bg-gray-100", "bg-primary/20", "bg-primary/40", "bg-primary/70", "bg-primary"];
          return (
            <div
              key={key}
              title={`${format(day, "d MMM", { locale: ptBR })}: ${count} post(s)`}
              className={cn("h-6 rounded-sm transition-all cursor-default", colors[intensity])}
            />
          );
        })}
      </div>
    </div>
  );
}

function BarChartWeekly({ items, year, month }: { items: CalendarItem[]; year: number; month: number }) {
  const weekLabels = ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5"];
  const counts = [0, 0, 0, 0, 0];
  
  items.forEach(item => {
    const d = new Date(item.data + "T12:00:00");
    if (d.getFullYear() === year && d.getMonth() === month) {
      const week = Math.min(Math.floor((d.getDate() - 1) / 7), 4);
      counts[week]++;
    }
  });

  const max = Math.max(...counts, 1);

  return (
    <div className="flex items-end gap-2 h-24 pt-2">
      {counts.map((count, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[10px] font-bold text-gray-600">{count > 0 ? count : ""}</span>
          <div className="w-full rounded-t-md bg-primary/80 transition-all" style={{ height: `${(count / max) * 64}px`, minHeight: count > 0 ? 4 : 0 }} />
          <span className="text-[9px] text-gray-400">{weekLabels[i]}</span>
        </div>
      ))}
    </div>
  );
}

export function ReportsView({ items }: ReportsViewProps) {
  const [reportDate, setReportDate] = useState(new Date());
  const month = reportDate.getMonth();
  const year = reportDate.getFullYear();

  const monthItems = useMemo(() =>
    items.filter(item => {
      const d = new Date(item.data + "T12:00:00");
      return d.getFullYear() === year && d.getMonth() === month;
    }), [items, year, month]);

  const allItems = items;

  // --- Type distribution for month ---
  const typeData = useMemo(() =>
    Object.entries(TYPE_CONFIG).map(([key, cfg]) => ({
      label: cfg.label,
      value: monthItems.filter(i => i.tipo === key).length,
      color: cfg.color,
    })), [monthItems]);

  // --- Status distribution ---
  const statusData = useMemo(() =>
    Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({
      label: cfg.label,
      value: monthItems.filter(i => (i.status || "planejado") === key).length,
      color: cfg.color,
    })), [monthItems]);

  const publishedCount = monthItems.filter(i => i.status === "publicado").length;
  const readyCount = monthItems.filter(i => i.status === "pronto" || i.status === "agendado").length;
  const pendingCount = monthItems.filter(i => !i.status || i.status === "planejado" || i.status === "rascunho").length;
  const completionRate = monthItems.length > 0 ? Math.round((publishedCount / monthItems.length) * 100) : 0;

  // --- Best day analysis ---
  const byDow = [0,0,0,0,0,0,0];
  monthItems.forEach(item => {
    const d = new Date(item.data + "T12:00:00");
    byDow[getDay(d)]++;
  });
  const bestDowIndex = byDow.indexOf(Math.max(...byDow));
  const DOW_NAMES = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];

  // --- 6-month trend ---
  const sixMonths = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(reportDate, 5 - i);
    const m = d.getMonth();
    const y = d.getFullYear();
    const count = items.filter(item => {
      const id = new Date(item.data + "T12:00:00");
      return id.getMonth() === m && id.getFullYear() === y;
    }).length;
    return { label: MONTHS[m].slice(0, 3), count };
  });
  const sixMax = Math.max(...sixMonths.map(s => s.count), 1);

  const handleExportCSV = () => {
    const header = ["Data", "Tipo", "Título", "Status", "Notas"];
    const rows = monthItems.map(item => [
      item.data,
      TYPE_CONFIG[item.tipo as keyof typeof TYPE_CONFIG]?.label || item.tipo,
      item.titulo || "",
      STATUS_CONFIG[(item.status || "planejado") as keyof typeof STATUS_CONFIG]?.label || "",
      (item.notas || "").replace(/\n/g, " "),
    ]);
    const csv = [header, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-${MONTHS[month].toLowerCase()}-${year}.csv`;
    a.click();
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/40 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-primary" />
            Relatório de Conteúdo
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Análise de performance editorial</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Month Selector */}
          <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-lg px-2 py-1.5 shadow-sm">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setReportDate(d => subMonths(d, 1))}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-sm font-semibold text-gray-700 w-32 text-center">
              {MONTHS[month]} {year}
            </span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setReportDate(d => addMonths(d, 1))}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="h-8 text-xs font-semibold gap-1.5">
            <Download className="h-3.5 w-3.5" /> Exportar CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <StatCard icon={Layers} label="Total do Mês" value={monthItems.length} sub={`${allItems.length} total geral`} />
        <StatCard icon={CheckCircle2} label="Publicados" value={publishedCount} sub={`${completionRate}% do mês`} color="text-emerald-600" />
        <StatCard icon={Clock} label="Em Preparação" value={readyCount} sub="Pronto ou Agendado" color="text-blue-600" />
        <StatCard icon={AlertCircle} label="Pendentes" value={pendingCount} sub="Planejado ou Rascunho" color="text-amber-600" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Tipo Distribution */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5" /> Mix de Conteúdo
          </p>
          <DonutChart data={typeData} total={monthItems.length} />
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" /> Status do Conteúdo
          </p>
          <DonutChart data={statusData} total={monthItems.length} />
        </div>

        {/* Weekly Distribution */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" /> Posts por Semana
          </p>
          <BarChartWeekly items={monthItems} year={year} month={month} />
          {monthItems.length > 0 && (
            <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
              <Award className="h-3 w-3" />
              Dia mais ativo: <strong className="text-gray-600 ml-1">{DOW_NAMES[bestDowIndex]}</strong>
              <span className="ml-1">({byDow[bestDowIndex]} posts)</span>
            </p>
          )}
        </div>
      </div>

      {/* Heatmap + 6-month trend */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
            📅 Frequência do Mês — {MONTHS[month]}
          </p>
          <WeekHeatmap items={monthItems} year={year} month={month} />
          <p className="text-[10px] text-gray-400 mt-2">Quanto mais escuro, mais posts naquele dia.</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
            📈 Evolução — Últimos 6 Meses
          </p>
          <div className="flex items-end gap-2 h-28">
            {sixMonths.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-gray-600">{m.count > 0 ? m.count : ""}</span>
                <div
                  className={cn("w-full rounded-t-md transition-all", i === 5 ? "bg-primary" : "bg-primary/30")}
                  style={{ height: `${(m.count / sixMax) * 80}px`, minHeight: m.count > 0 ? 4 : 0 }}
                />
                <span className="text-[9px] text-gray-400">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Post List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
            Lista de Posts — {MONTHS[month]}
          </p>
          <span className="text-xs font-semibold text-gray-400">{monthItems.length} posts</span>
        </div>
        {monthItems.length === 0 ? (
          <div className="py-10 text-center text-xs text-gray-400">Nenhum post este mês.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {monthItems
              .sort((a, b) => a.data.localeCompare(b.data))
              .map(item => {
                const tc = TYPE_CONFIG[item.tipo as keyof typeof TYPE_CONFIG];
                const sc = STATUS_CONFIG[(item.status || "planejado") as keyof typeof STATUS_CONFIG];
                return (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50/50 transition-colors">
                    <span className="text-xs font-semibold text-gray-400 w-10 shrink-0">
                      {new Date(item.data + "T12:00:00").getDate()}/{month + 1}
                    </span>
                    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded text-white shrink-0", tc?.bg || "bg-gray-400")}>
                      {tc?.label || item.tipo}
                    </span>
                    <span className="text-sm text-gray-800 flex-1 truncate">
                      {item.titulo || <em className="text-gray-400">Sem título</em>}
                    </span>
                    {item.notas && (
                      <span className="text-[10px] text-gray-400 truncate max-w-[160px] hidden md:block">{item.notas}</span>
                    )}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={cn("w-2 h-2 rounded-full", sc?.bg || "bg-gray-300")} />
                      <span className="text-[10px] text-gray-500">{sc?.label}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
