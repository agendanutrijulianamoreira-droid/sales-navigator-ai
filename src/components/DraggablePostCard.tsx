import { useDrag } from "react-dnd";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil, Instagram } from "lucide-react";
import { CalendarItem } from "@/hooks/useCalendarItems";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const TYPE_CONFIG = {
  carrossel: { label: "Carrossel", color: "bg-violet-500", text: "text-violet-700", border: "border-l-violet-500" },
  post_unico: { label: "Post Único", color: "bg-emerald-500", text: "text-emerald-700", border: "border-l-emerald-500" },
  reels: { label: "Reels", color: "bg-pink-500", text: "text-pink-700", border: "border-l-pink-500" },
  stories: { label: "Stories", color: "bg-amber-500", text: "text-amber-700", border: "border-l-amber-500" },
  levantada: { label: "Levantada", color: "bg-red-500", text: "text-red-700", border: "border-l-red-500" },
};

const STATUS_CONFIG = {
  planejado: { label: "Planejado", dot: "bg-gray-400" },
  rascunho: { label: "Rascunho", dot: "bg-amber-400" },
  pronto: { label: "Pronto", dot: "bg-blue-500" },
  agendado: { label: "Agendado", dot: "bg-purple-500" },
  publicado: { label: "Publicado", dot: "bg-emerald-500" },
};

interface DraggablePostCardProps {
  post: CalendarItem;
  onEdit?: (post: CalendarItem) => void;
  onDuplicate?: (post: CalendarItem) => void;
  onDelete?: (id: string) => void;
  variant?: "month" | "week";
}

export function DraggablePostCard({ post, onEdit, onDuplicate, onDelete, variant = "month" }: DraggablePostCardProps) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "post",
    item: { id: post.id, data: post.data },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }));

  useEffect(() => {
    if (!post.generation_id) return;
    supabase
      .from("generations")
      .select("output_content")
      .eq("id", post.generation_id)
      .single()
      .then(({ data, error }) => {
        if (data && !error) {
          try {
            const content = JSON.parse(data.output_content);
            if (content.slides?.[0]?.imageUrl) setThumbnail(content.slides[0].imageUrl);
          } catch {}
        }
      });
  }, [post.generation_id]);

  const typeConfig = TYPE_CONFIG[post.tipo as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.post_unico;
  const statusConfig = STATUS_CONFIG[(post.status ?? "planejado") as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.planejado;

  if (variant === "week") {
    return (
      <div
        ref={drag}
        className={cn(
          "group rounded-lg border border-gray-100 bg-white shadow-sm overflow-hidden transition-all hover:shadow-md border-l-4 cursor-grab active:cursor-grabbing",
          typeConfig.border,
          isDragging && "opacity-30"
        )}
      >
        {thumbnail && (
          <div className="relative h-20 overflow-hidden bg-muted">
            <img src={thumbnail} alt={post.titulo || ""} className="w-full h-full object-cover" />
            <div className="absolute top-1 right-1">
              <Instagram className="h-3 w-3 text-white drop-shadow-md" />
            </div>
          </div>
        )}
        <div className="p-2">
          <div className="flex items-center gap-1.5 mb-1">
            <span className={cn("text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full text-white", typeConfig.color)}>
              {typeConfig.label}
            </span>
            <span className="ml-auto flex items-center gap-1">
              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", statusConfig.dot)} />
              <span className="text-[9px] text-gray-400">{statusConfig.label}</span>
            </span>
          </div>
          <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug mb-2">
            {post.titulo || "Sem título"}
          </p>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-md hover:bg-primary/10"
              onClick={() => onEdit?.(post)}
            >
              <Pencil className="h-3 w-3 text-primary" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-md hover:bg-red-50"
              onClick={() => onDelete?.(post.id)}
            >
              <Trash2 className="h-3 w-3 text-red-400" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Month variant — compact
  return (
    <div
      ref={drag}
      className={cn(
        "group relative rounded border border-gray-100 bg-white overflow-hidden transition-all hover:shadow-sm border-l-[3px] cursor-grab active:cursor-grabbing",
        typeConfig.border,
        isDragging && "opacity-30"
      )}
    >
      {thumbnail ? (
        <div className="flex items-center gap-1.5 p-1">
          <img src={thumbnail} alt="" className="w-6 h-6 rounded object-cover shrink-0" />
          <p className="text-[10px] font-semibold leading-tight line-clamp-1 text-gray-800 flex-1">
            {post.titulo || "Sem título"}
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 px-1.5 py-1">
          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", statusConfig.dot)} />
          <p className="text-[10px] font-semibold leading-tight line-clamp-1 text-gray-800 flex-1">
            {post.titulo || "Sem título"}
          </p>
          <span className={cn("text-[8px] font-bold uppercase shrink-0 opacity-60", typeConfig.text)}>
            {typeConfig.label.slice(0, 3)}
          </span>
        </div>
      )}

      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
        <Button variant="secondary" size="icon" className="h-5 w-5 rounded-full shadow" onClick={() => onEdit?.(post)}>
          <Pencil className="h-2.5 w-2.5" />
        </Button>
        <Button variant="destructive" size="icon" className="h-5 w-5 rounded-full shadow" onClick={() => onDelete?.(post.id)}>
          <Trash2 className="h-2.5 w-2.5" />
        </Button>
      </div>
    </div>
  );
}
