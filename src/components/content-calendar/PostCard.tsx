import { Check } from "lucide-react";
import { ContentCalendarPost } from "@/types/contentCalendar";
import { STATUS_CONFIG, nextStatus } from "@/lib/constants/contentCalendarStatus";
import { FORMAT_CONFIG } from "@/lib/constants/contentCalendarFormat";

interface PostCardProps {
  post: ContentCalendarPost;
  onClick: () => void;
  onCycleStatus: () => void;
}

export function PostCard({ post, onClick, onCycleStatus }: PostCardProps) {
  const statusCfg = STATUS_CONFIG[post.status];
  const formatCfg = FORMAT_CONFIG[post.format];
  const FormatIcon = formatCfg.icon;
  const isPublicado = post.status === "publicado";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      style={{ borderLeftColor: statusCfg.hex, backgroundColor: `${statusCfg.hex}1a` }}
      className="group h-16 rounded border border-[#E8E8EC] border-l-[3px] px-2 py-1 cursor-pointer hover:shadow-sm transition-shadow overflow-hidden flex flex-col justify-center gap-0.5"
      title={post.title}
    >
      <div className="flex items-center gap-1">
        <FormatIcon className="h-3.5 w-3.5 text-[#1A1A2E] shrink-0" />
        <span className="text-[11px] font-medium text-[#1A1A2E] truncate flex-1">{formatCfg.label}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCycleStatus();
          }}
          className="shrink-0 w-4 h-4 flex items-center justify-center rounded-full hover:bg-black/5"
          title={`Avançar para ${STATUS_CONFIG[nextStatus(post.status)].label}`}
        >
          {isPublicado ? (
            <Check className="h-3 w-3" style={{ color: statusCfg.hex }} />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusCfg.hex }} />
          )}
        </button>
      </div>
      <p className="text-[11px] font-semibold" style={{ color: statusCfg.textColor }}>
        {statusCfg.label}
      </p>
      <p className="text-[12px] font-normal text-[#1A1A2E] truncate leading-tight">{post.title || "Sem título"}</p>
    </div>
  );
}
