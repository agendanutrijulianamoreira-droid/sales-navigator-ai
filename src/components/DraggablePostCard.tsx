import { useDrag } from "react-dnd";
import { Button } from "@/components/ui/button";
import { Trash2, Copy, Pencil, Instagram } from "lucide-react";
import { CalendarItem } from "@/hooks/useCalendarItems";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const CONTENT_TYPES = {
  carrossel: { label: "Carrossel", color: "bg-[#7c3aed]" },
  post_unico: { label: "Post Único", color: "bg-[#10b981]" },
  reels: { label: "Reels", color: "bg-[#ec4899]" },
  stories: { label: "Stories", color: "bg-[#f59e0b]" },
  levantada: { label: "Levantada de Mão", color: "bg-[#ef4444]" },
};

interface DraggablePostCardProps {
  post: CalendarItem;
  onEdit?: (post: CalendarItem) => void;
  onDuplicate?: (post: CalendarItem) => void;
  onDelete?: (id: string) => void;
}

export function DraggablePostCard({ post, onEdit, onDuplicate, onDelete }: DraggablePostCardProps) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "post",
    item: { id: post.id, data: post.data },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  useEffect(() => {
    const fetchThumbnail = async () => {
      if (post.generation_id) {
        const { data, error } = await supabase
          .from("generations")
          .select("output_content")
          .eq("id", post.generation_id)
          .single();

        if (data && !error) {
          try {
            const content = JSON.parse(data.output_content);
            if (content.slides && content.slides[0]?.imageUrl) {
              setThumbnail(content.slides[0].imageUrl);
            }
          } catch (e) {
            console.error("Erro ao processar thumbnail", e);
          }
        }
      }
    };
    fetchThumbnail();
  }, [post.generation_id]);

  const typeConfig = CONTENT_TYPES[post.tipo as keyof typeof CONTENT_TYPES];

  return (
    <div
      ref={drag}
      className={`relative group rounded-md border bg-white shadow-sm overflow-hidden mb-1 transition-all hover:ring-2 hover:ring-primary/20 ${isDragging ? "opacity-30" : "opacity-100"
        }`}
    >
      {thumbnail ? (
        <div className="aspect-square relative overflow-hidden bg-muted">
          <img src={thumbnail} alt={post.titulo || ""} className="w-full h-full object-cover" />
          <div className="absolute top-1 right-1">
            <Instagram className="h-3 w-3 text-white drop-shadow-md" />
          </div>
        </div>
      ) : (
        <div className={`h-1 w-full ${typeConfig?.color || "bg-gray-400"}`} />
      )}

      <div className="p-1.5 pt-1">
        <p className="text-[10px] font-semibold leading-tight line-clamp-2 text-foreground/90">
          {post.titulo || "Sem título"}
        </p>
      </div>

      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity backdrop-blur-[1px]">
        <Button
          variant="secondary"
          size="icon"
          className="h-6 w-6 rounded-full shadow-lg"
          onClick={() => onEdit?.(post)}
        >
          <Pencil className="h-3 w-3" />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          className="h-6 w-6 rounded-full shadow-lg"
          onClick={() => onDelete?.(post.id)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
