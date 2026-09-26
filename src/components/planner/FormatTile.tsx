import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import type { CalendarItem } from "@/hooks/useCalendarItems";
import { getFormat, statusLabel } from "./formats";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FormatTile({ item, onClick, compact }: { item: CalendarItem; onClick: () => void; compact?: boolean }) {
  const f = getFormat(item.tipo);
  const Icon = f.icon;
  const horario = (item.estrategia_snapshot as Record<string, unknown> | null)?.horario as string | undefined;
  const color = `hsl(var(${f.token}))`;

  return (
    <HoverCard openDelay={150}>
      <HoverCardTrigger asChild>
        <Button
          variant="ghost"
          onClick={onClick}
          className={`flex flex-col items-center justify-center rounded-lg text-primary-foreground shadow-md transition-transform hover:scale-105 ${compact ? "h-7 w-full flex-row gap-1 px-2" : "h-[72px] w-[72px] gap-1"} ${horario ? "border-2 border-dashed border-primary-foreground/60" : ""}`}
          style={{ background: `linear-gradient(135deg, ${color}, hsl(var(${f.token}) / 0.75))` }}
        >
          {horario && !compact ? <Clock className="h-4 w-4" /> : <Icon className={compact ? "h-3 w-3" : "h-5 w-5"} />}
          <span className={compact ? "truncate text-[10px] font-semibold" : "text-[11px] font-semibold"}>
            {horario && !compact ? horario : f.label}
          </span>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 overflow-hidden p-0">
        <div className="flex items-center justify-between px-4 py-2 text-xs font-bold uppercase text-primary-foreground" style={{ background: color }}>
          <span className="flex items-center gap-2"><Icon className="h-4 w-4" />{f.label}</span>
          <span className="font-medium normal-case">{statusLabel(item.status)}</span>
        </div>
        <div className="space-y-2 p-4">
          <p className="line-clamp-2 font-semibold">{item.titulo || "Sem título"}</p>
          <p className="line-clamp-3 text-sm text-muted-foreground">{item.notas || item.conteudo_corpo || "Sem descrição"}</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
