import { ChevronLeft, ChevronRight } from "lucide-react";
import { ContentCalendarPost } from "@/types/contentCalendar";
import { HEADER_BADGES } from "@/lib/constants/contentCalendarStatus";

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  monthPosts: ContentCalendarPost[];
}

function StatusBadge({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[20px] font-bold leading-none" style={{ color }}>
        {count}
      </span>
      <span className="text-[11px] text-[#6B6B80] mt-1">{label}</span>
    </div>
  );
}

export function CalendarHeader({ currentDate, onPrevMonth, onNextMonth, monthPosts }: CalendarHeaderProps) {
  const counts = HEADER_BADGES.reduce<Record<string, number>>((acc, b) => {
    acc[b.status] = monthPosts.filter((p) => p.status === b.status).length;
    return acc;
  }, {});

  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E8EC] bg-white flex-wrap gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onPrevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#F0F0F5] transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-[18px] font-semibold text-[#1A1A2E] min-w-[140px] text-center">
          {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
        </span>
        <button
          onClick={onNextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#F0F0F5] transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="flex items-center gap-6">
        {HEADER_BADGES.map((b) => (
          <StatusBadge key={b.status} count={counts[b.status] || 0} label={b.label} color={b.hex} />
        ))}
      </div>
    </div>
  );
}
