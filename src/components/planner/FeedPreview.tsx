import { useState } from "react";
import type { CalendarItem } from "@/hooks/useCalendarItems";
import { FORMATS, getFormat, type FormatKey } from "./formats";
import { LayoutGrid } from "lucide-react";

export function FeedPreview({ items, onOpen }: { items: CalendarItem[]; onOpen: (i: CalendarItem) => void }) {
  const [filter, setFilter] = useState<FormatKey | "feed">("feed");
  const list = items
    .filter((i) => i.status !== "arquivado")
    .filter((i) => (filter === "feed" ? i.tipo !== "stories" && i.tipo !== "levantada" : (i.tipo === "levantada" ? "stories" : i.tipo) === filter))
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 12);

  const tabs: { k: FormatKey | "feed"; label: string; token?: string }[] = [
    { k: "feed", label: "Feed" },
    ...(["stories", "post_unico", "carrossel", "reels"] as FormatKey[]).map((k) => ({ k, label: FORMATS[k].label, token: FORMATS[k].token })),
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-5 gap-1 rounded-xl border bg-muted/30 p-1">
        {tabs.map((t) => (
          <button
            key={t.k}
            onClick={() => setFilter(t.k)}
            className={`flex items-center justify-center gap-1 rounded-lg py-2 text-xs font-semibold transition-opacity ${filter === t.k ? "opacity-100 ring-2 ring-primary" : "opacity-70 hover:opacity-100"} ${t.token ? "text-primary-foreground" : "bg-background"}`}
            style={t.token ? { background: `hsl(var(${t.token}))` } : undefined}
          >
            {t.k === "feed" && <LayoutGrid className="h-3 w-3" />}{t.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-0.5 overflow-hidden rounded-xl border">
        {list.length === 0 && <p className="col-span-3 p-8 text-center text-sm text-muted-foreground">Nenhum conteúdo aqui ainda.</p>}
        {list.map((i) => {
          const f = getFormat(i.tipo);
          const Icon = f.icon;
          const d = new Date(i.data + "T12:00:00");
          return (
            <button key={i.id} onClick={() => onOpen(i)} className="relative aspect-[4/5] overflow-hidden bg-muted text-left">
              {i.cover_image_url ? (
                <img src={i.cover_image_url} alt={i.titulo ?? ""} className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 p-3 text-center" style={{ background: `hsl(var(${f.token}) / 0.15)` }}>
                  <Icon className="h-5 w-5" style={{ color: `hsl(var(${f.token}))` }} />
                  <p className="line-clamp-4 text-xs text-muted-foreground">{i.titulo}</p>
                </div>
              )}
              <span className="absolute bottom-1 left-2 text-[10px] font-bold text-foreground drop-shadow">
                {d.toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
