import { Heart, MessageCircle, Send, Bookmark, Instagram } from "lucide-react";
import { ContentCalendarPostDraft } from "@/types/contentCalendar";
import { STATUS_CONFIG } from "@/lib/constants/contentCalendarStatus";
import { FORMAT_CONFIG } from "@/lib/constants/contentCalendarFormat";

interface InstagramPostPreviewProps {
  draft: ContentCalendarPostDraft;
}

export function InstagramPostPreview({ draft }: InstagramPostPreviewProps) {
  const formatCfg = FORMAT_CONFIG[draft.format];
  const FormatIcon = formatCfg.icon;
  const statusCfg = STATUS_CONFIG[draft.status];
  const caption = draft.description || draft.title;

  return (
    <div className="rounded-xl border border-[#E8E8EC] overflow-hidden bg-white shadow-sm max-w-[280px] mx-auto">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#F5F5F5]">
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#6D4AE8] to-[#EDE9FF]" />
        <span className="text-xs font-semibold text-[#1A1A2E] flex-1 truncate">seu_consultorio</span>
        {draft.platform === "instagram" && <Instagram className="h-3.5 w-3.5 text-[#6B6B80]" />}
      </div>

      <div className="aspect-square w-full flex items-center justify-center" style={{ backgroundColor: statusCfg.bgLight }}>
        {draft.thumbnailUrl ? (
          <img src={draft.thumbnailUrl} alt={draft.title} className="w-full h-full object-cover" />
        ) : (
          <FormatIcon className="h-10 w-10" style={{ color: statusCfg.hex }} />
        )}
      </div>

      <div className="px-3 py-2 flex items-center gap-3 text-[#1A1A2E]">
        <Heart className="h-4 w-4" />
        <MessageCircle className="h-4 w-4" />
        <Send className="h-4 w-4" />
        <Bookmark className="h-4 w-4 ml-auto" />
      </div>

      <div className="px-3 pb-3 space-y-1">
        <p className="text-[11px] text-[#1A1A2E] leading-snug">
          <span className="font-semibold">seu_consultorio</span>{" "}
          {caption ? (caption.length > 90 ? `${caption.slice(0, 90)}...` : caption) : (
            <span className="text-[#AAAAAA]">Sua legenda aparece aqui...</span>
          )}
        </p>
        {draft.tags.length > 0 && (
          <p className="text-[10px] text-[#3B82F6] truncate">{draft.tags.map((t) => `#${t}`).join(" ")}</p>
        )}
      </div>
    </div>
  );
}
