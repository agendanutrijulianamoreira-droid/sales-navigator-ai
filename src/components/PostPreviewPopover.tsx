import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { CalendarItem } from "@/hooks/useCalendarItems";
import { cn } from "@/lib/utils";
import { CalendarDays, Clock, FileText, Grid3X3, Play, BookOpen, Hand } from "lucide-react";

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  carrossel:  { label: "Carrossel",        color: "text-violet-700",  bg: "bg-violet-100",  icon: Grid3X3 },
  post_unico: { label: "Post Único",       color: "text-emerald-700", bg: "bg-emerald-100", icon: FileText },
  reels:      { label: "Reels",            color: "text-pink-700",    bg: "bg-pink-100",    icon: Play },
  stories:    { label: "Stories",          color: "text-amber-700",   bg: "bg-amber-100",   icon: BookOpen },
  levantada:  { label: "Levantada de Mão", color: "text-red-700",     bg: "bg-red-100",     icon: Hand },
};

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  planejado:      { label: "Planejado",       dot: "bg-gray-400",    badge: "bg-gray-100 text-gray-600" },
  rascunho:       { label: "Rascunho",        dot: "bg-amber-400",   badge: "bg-amber-100 text-amber-700" },
  em_aprovacao:   { label: "Em aprovação",    dot: "bg-sky-400",     badge: "bg-sky-100 text-sky-700" },
  aprovado:       { label: "Aprovado",        dot: "bg-green-500",   badge: "bg-green-100 text-green-700" },
  pronto:         { label: "Pronto",          dot: "bg-blue-500",    badge: "bg-blue-100 text-blue-700" },
  agendado:       { label: "Agendado",        dot: "bg-purple-500",  badge: "bg-purple-100 text-purple-700" },
  publicado:      { label: "Publicado",       dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700" },
};

interface PostPreviewPopoverProps {
  post: CalendarItem;
  thumbnail?: string | null;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
}

export function PostPreviewPopover({ post, thumbnail, children, side = "right" }: PostPreviewPopoverProps) {
  const typeConfig = TYPE_CONFIG[post.tipo] ?? TYPE_CONFIG.post_unico;
  const statusConfig = STATUS_CONFIG[(post.status ?? "planejado")] ?? STATUS_CONFIG.planejado;
  const TypeIcon = typeConfig.icon;

  const formattedDate = (() => {
    try {
      const [year, month, day] = post.data.split("-").map(Number);
      return new Date(year, month - 1, day).toLocaleDateString("pt-BR", {
        weekday: "long", day: "numeric", month: "long",
      });
    } catch {
      return post.data;
    }
  })();

  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent
        side={side}
        align="start"
        sideOffset={8}
        className="w-72 p-0 shadow-xl border border-gray-100 rounded-xl overflow-hidden z-[100]"
      >
        {/* Thumbnail */}
        {thumbnail ? (
          <div className="relative h-32 bg-gray-100 overflow-hidden">
            <img src={thumbnail} alt={post.titulo ?? ""} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1.5">
              <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full", typeConfig.bg, typeConfig.color)}>
                <TypeIcon className="h-2.5 w-2.5" />
                {typeConfig.label}
              </span>
              <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto", statusConfig.badge)}>
                <span className={cn("w-1.5 h-1.5 rounded-full", statusConfig.dot)} />
                {statusConfig.label}
              </span>
            </div>
          </div>
        ) : (
          <div className={cn("h-2 w-full", typeConfig.bg.replace("100", "400"))} />
        )}

        {/* Content */}
        <div className="p-3 space-y-2">
          {/* Badges (no thumbnail case) */}
          {!thumbnail && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full", typeConfig.bg, typeConfig.color)}>
                <TypeIcon className="h-2.5 w-2.5" />
                {typeConfig.label}
              </span>
              <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full", statusConfig.badge)}>
                <span className={cn("w-1.5 h-1.5 rounded-full", statusConfig.dot)} />
                {statusConfig.label}
              </span>
            </div>
          )}

          {/* Title */}
          <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
            {post.titulo || "Sem título"}
          </p>

          {/* Notes preview */}
          {post.notas && (
            <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-3 border-l-2 border-gray-100 pl-2">
              {post.notas}
            </p>
          )}

          {/* Date */}
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 pt-1 border-t border-gray-50">
            <CalendarDays className="h-3 w-3" />
            <span className="capitalize">{formattedDate}</span>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
