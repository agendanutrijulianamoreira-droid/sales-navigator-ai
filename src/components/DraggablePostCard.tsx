import { useDrag } from "react-dnd";
import { Button } from "@/components/ui/button";
import { Trash2, Copy } from "lucide-react";
import { CalendarItem } from "@/hooks/useCalendarItems";

const CONTENT_TYPES = {
  carrossel: { label: "Carrossel", color: "bg-blue-500" },
  post_unico: { label: "Post Único", color: "bg-green-500" },
  reels: { label: "Reels", color: "bg-purple-500" },
  stories: { label: "Stories", color: "bg-orange-500" },
  levantada: { label: "Levantada de Mão", color: "bg-pink-500" },
};

interface DraggablePostCardProps {
  post: CalendarItem;
  onEdit?: (post: CalendarItem) => void;
  onDuplicate?: (post: CalendarItem) => void;
  onDelete?: (id: string) => void;
}

export function DraggablePostCard({ post, onEdit, onDuplicate, onDelete }: DraggablePostCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "post",
    item: { id: post.id, data: post.data },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const typeConfig = CONTENT_TYPES[post.tipo as keyof typeof CONTENT_TYPES];

  return (
    <div
      ref={drag}
      className={`p-2 rounded-lg text-xs group relative hover:bg-muted transition-colors cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-50 bg-muted" : "bg-muted/50"
      }`}
    >
      <div className="flex items-center gap-1 mb-1">
        <div className={`w-2 h-2 rounded-full ${typeConfig?.color || "bg-gray-400"}`} />
        <span className="font-medium flex-1">{typeConfig?.label || post.tipo}</span>
      </div>
      <p className="text-muted-foreground line-clamp-2 mb-2">{post.titulo}</p>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(post);
            }}
          >
            ✏️
          </Button>
        )}
        {onDuplicate && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(post);
            }}
          >
            <Copy className="h-3 w-3" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(post.id);
            }}
          >
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        )}
      </div>
    </div>
  );
}
