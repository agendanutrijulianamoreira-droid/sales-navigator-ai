import { useEffect, useState } from "react";
import { CalendarItem } from "@/hooks/useCalendarItems";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Pencil, Trash2, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";

const TYPE_COLOR: Record<string, string> = {
  carrossel: "bg-violet-500",
  post_unico: "bg-emerald-500",
  reels: "bg-pink-500",
  stories: "bg-amber-500",
  levantada: "bg-red-500",
};

const TYPE_LABEL: Record<string, string> = {
  carrossel: "Carrossel",
  post_unico: "Post Único",
  reels: "Reels",
  stories: "Stories",
  levantada: "Levantada",
};

const STATUS_DOT: Record<string, string> = {
  planejado: "bg-gray-400",
  rascunho: "bg-amber-400",
  em_aprovacao: "bg-sky-400",
  aprovado: "bg-green-500",
  pronto: "bg-blue-500",
  agendado: "bg-purple-500",
  publicado: "bg-emerald-500",
};

const STATUS_LABEL: Record<string, string> = {
  planejado: "Planejado",
  rascunho: "Rascunho",
  em_aprovacao: "Em aprovação",
  aprovado: "Aprovado",
  pronto: "Pronto",
  agendado: "Agendado",
  publicado: "Publicado",
};

interface FeedCellProps {
  post: CalendarItem;
  onEdit: (post: CalendarItem) => void;
  onDelete: (id: string) => void;
}

function FeedCell({ post, onEdit, onDelete }: FeedCellProps) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);

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

  const normalizedStatus = post.status === "criado" ? "pronto" : (post.status ?? "planejado");
  const dot = STATUS_DOT[normalizedStatus] ?? "bg-gray-400";
  const statusLabel = STATUS_LABEL[normalizedStatus] ?? normalizedStatus;
  const typeColor = TYPE_COLOR[post.tipo] ?? "bg-gray-400";
  const typeLabel = TYPE_LABEL[post.tipo] ?? post.tipo;

  const formattedDate = new Date(post.data + "T12:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });

  return (
    <div className="relative aspect-square group overflow-hidden rounded-sm bg-gray-100">
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={post.titulo || ""}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className={cn("w-full h-full flex flex-col items-center justify-center gap-2 p-3", typeColor)}>
          <span className="text-[10px] font-bold uppercase text-white/70 tracking-wider">
            {typeLabel}
          </span>
          <p className="text-sm font-bold text-white text-center line-clamp-3 leading-snug">
            {post.titulo || "Sem título"}
          </p>
          <span className="text-[10px] text-white/60">{formattedDate}</span>
        </div>
      )}

      {/* Status badge top-right */}
      <div className="absolute top-1.5 right-1.5 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-1.5 py-0.5">
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dot)} />
        <span className="text-[9px] font-semibold text-white">{statusLabel}</span>
      </div>

      {/* Date badge top-left */}
      <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-sm rounded-full px-1.5 py-0.5">
        <span className="text-[9px] font-semibold text-white">{formattedDate}</span>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
        <p className="text-xs font-semibold text-white text-center line-clamp-3 leading-snug">
          {post.titulo || "Sem título"}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7 rounded-full bg-white/20 hover:bg-white/40 border-0"
            onClick={() => onEdit(post)}
          >
            <Pencil className="h-3.5 w-3.5 text-white" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7 rounded-full bg-white/20 hover:bg-red-500/60 border-0"
            onClick={() => onDelete(post.id)}
          >
            <Trash2 className="h-3.5 w-3.5 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface FeedViewProps {
  items: CalendarItem[];
  currentMonth: number;
  currentYear: number;
  onEditPost: (post: CalendarItem) => void;
  onDeletePost: (id: string) => void;
}

export function FeedView({ items, currentMonth, currentYear, onEditPost, onDeletePost }: FeedViewProps) {
  const monthItems = items
    .filter((item) => {
      const d = new Date(item.data);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    })
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

  const publishedCount = monthItems.filter(
    (i) => (i.status === "criado" ? "pronto" : i.status) === "publicado"
  ).length;

  const statusCounts: Record<string, number> = {};
  monthItems.forEach((item) => {
    const s = item.status === "criado" ? "pronto" : (item.status ?? "planejado");
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  });

  if (monthItems.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400 py-20">
        <Instagram className="h-10 w-10 opacity-30" />
        <p className="text-sm font-medium">Nenhum post planejado este mês</p>
        <p className="text-xs text-gray-300">Adicione posts no calendário para visualizá-los aqui</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-lg mx-auto space-y-4">

        {/* Profile-style header */}
        <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/60 to-primary flex items-center justify-center shrink-0">
            <Instagram className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-800">Feed simulado — {new Date(currentYear, currentMonth).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</p>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-[11px] text-gray-500">
                <span className="font-bold text-gray-800">{monthItems.length}</span> posts
              </span>
              <span className="text-[11px] text-gray-500">
                <span className="font-bold text-gray-800">{publishedCount}</span> publicados
              </span>
            </div>
          </div>
        </div>

        {/* Status flow summary */}
        <div className="flex items-center gap-2 flex-wrap">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1">
              <span className={cn("w-1.5 h-1.5 rounded-full", STATUS_DOT[status] ?? "bg-gray-400")} />
              <span className="text-[10px] font-semibold text-gray-600">
                {STATUS_LABEL[status] ?? status} <span className="text-gray-400">({count})</span>
              </span>
            </div>
          ))}
        </div>

        {/* 3×3 Grid */}
        <div className="grid grid-cols-3 gap-0.5">
          {monthItems.map((post) => (
            <FeedCell key={post.id} post={post} onEdit={onEditPost} onDelete={onDeletePost} />
          ))}
          {/* Empty cells to complete the last row */}
          {Array.from({ length: (3 - (monthItems.length % 3)) % 3 }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square bg-gray-50 rounded-sm" />
          ))}
        </div>

        <p className="text-center text-[10px] text-gray-300 pb-4">
          Grade cronológica · da esquerda para direita, do mais antigo ao mais recente
        </p>
      </div>
    </div>
  );
}
