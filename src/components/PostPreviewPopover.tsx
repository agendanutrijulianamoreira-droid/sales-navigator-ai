import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { CalendarItem } from "@/hooks/useCalendarItems";
import { cn } from "@/lib/utils";
import { CalendarDays, Clock } from "lucide-react";
import { getFormatConfig } from "@/lib/constants/postFormat";
import { getStatusConfig } from "@/lib/constants/postStatus";

interface PostPreviewPopoverProps {
  post: CalendarItem;
  thumbnail?: string | null;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
}

export function PostPreviewPopover({ post, thumbnail, children, side = "right" }: PostPreviewPopoverProps) {
  const typeConfig = getFormatConfig(post.tipo);
  const statusConfig = getStatusConfig(post.status);
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
              <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full", typeConfig.bgLight, typeConfig.text)}>
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
          <div className={cn("h-2 w-full", typeConfig.bgLight.replace("100", "400"))} />
        )}

        {/* Content */}
        <div className="p-3 space-y-2">
          {/* Badges (no thumbnail case) */}
          {!thumbnail && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full", typeConfig.bgLight, typeConfig.text)}>
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
