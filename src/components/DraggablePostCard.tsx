import { useDrag } from "react-dnd";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil, Instagram, Check } from "lucide-react";
import { CalendarItem } from "@/hooks/useCalendarItems";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { PostPreviewPopover } from "./PostPreviewPopover";
import { getFormatConfig } from "@/lib/constants/postFormat";
import { getStatusConfig, normalizeStatus } from "@/lib/constants/postStatus";

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

  const formatConfig = getFormatConfig(post.tipo);
  const statusConfig = getStatusConfig(post.status);
  const isPublicado = normalizeStatus(post.status) === "publicado";
  const FormatIcon = formatConfig.icon;

  if (variant === "week") {
    return (
      <PostPreviewPopover post={post} thumbnail={thumbnail} side="right">
        <div
          ref={drag}
          style={{ borderLeftColor: statusConfig.hex }}
          className={cn(
            "group rounded-lg border border-gray-100 bg-white shadow-sm overflow-hidden transition-all hover:shadow-md border-l-[3px] cursor-grab active:cursor-grabbing",
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
        <div className="p-2" style={{ backgroundColor: `${statusConfig.hex}0d` }}>
          <div className="flex items-center gap-1.5 mb-0.5">
            <FormatIcon className="h-3.5 w-3.5 text-gray-500 shrink-0" />
            <span className="text-[11px] font-semibold text-gray-700">{formatConfig.label}</span>
            <span className="ml-auto flex items-center justify-center shrink-0">
              {isPublicado ? (
                <Check className="h-3 w-3" style={{ color: statusConfig.hex }} />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusConfig.hex }} />
              )}
            </span>
          </div>
          <p className="text-[11px] font-semibold mb-1" style={{ color: statusConfig.hex }}>{statusConfig.label}</p>
          <p className="text-xs font-medium text-gray-800 line-clamp-2 leading-snug">
            {post.titulo || "Sem título"}
          </p>
          {post.notas && (
            <p className="text-[10px] text-gray-400 line-clamp-2 mt-0.5 mb-1 leading-snug">
              {post.notas}
            </p>
          )}
          <div className="flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
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
      </PostPreviewPopover>
    );
  }

  // Month variant — compact
  return (
    <PostPreviewPopover post={post} thumbnail={thumbnail} side="top">
      <div
        ref={drag}
        style={{ borderLeftColor: statusConfig.hex, backgroundColor: `${statusConfig.hex}0d` }}
        className={cn(
          "group relative rounded border border-gray-100 overflow-hidden transition-all hover:shadow-sm border-l-[3px] cursor-grab active:cursor-grabbing",
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
        <div className="flex items-center gap-1 px-1.5 py-1">
          <FormatIcon className="h-3 w-3 text-gray-500 shrink-0" />
          {isPublicado ? (
            <Check className="h-2.5 w-2.5 shrink-0" style={{ color: statusConfig.hex }} />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: statusConfig.hex }} />
          )}
          <p className="text-[10px] font-medium leading-tight line-clamp-1 text-gray-800 flex-1">
            {post.titulo || "Sem título"}
          </p>
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
    </PostPreviewPopover>
  );
}
