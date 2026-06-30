import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { ContentCalendarPost } from "@/types/contentCalendar";
import { PostCard } from "./PostCard";

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

interface WeeklyCalendarProps {
  weekStart: Date;
  posts: ContentCalendarPost[];
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onDayClick: (date: Date) => void;
  onPostClick: (post: ContentCalendarPost) => void;
  onCycleStatus: (post: ContentCalendarPost) => void;
}

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function WeeklyCalendar({
  weekStart, posts, onPrevWeek, onNextWeek, onDayClick, onPostClick, onCycleStatus,
}: WeeklyCalendarProps) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
  const today = new Date();
  const todayKey = toDateKey(today);

  const postsByDate = posts.reduce<Record<string, ContentCalendarPost[]>>((acc, p) => {
    (acc[p.scheduledDate] ||= []).push(p);
    return acc;
  }, {});

  const weekEnd = days[6];

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="flex items-center justify-center gap-3 py-2 border-b border-[#E8E8EC]">
        <button onClick={onPrevWeek} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#F0F0F5]">
          <ChevronLeft size={14} />
        </button>
        <span className="text-[13px] font-medium text-[#1A1A2E]">
          {weekStart.getDate()} {MONTHS_SHORT[weekStart.getMonth()]} – {weekEnd.getDate()} {MONTHS_SHORT[weekEnd.getMonth()]} de {weekEnd.getFullYear()}
        </span>
        <button onClick={onNextWeek} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#F0F0F5]">
          <ChevronRight size={14} />
        </button>
      </div>
      <div className="grid grid-cols-7 flex-1 gap-[2px] bg-[#E8E8EC] overflow-x-auto">
        {days.map((date, i) => {
          const key = toDateKey(date);
          const dayPosts = (postsByDate[key] || []).slice().sort((a, b) =>
            (a.scheduledTime || "").localeCompare(b.scheduledTime || "")
          );
          const isToday = key === todayKey;
          return (
            <div key={i} className="group min-w-[140px] min-h-[420px] bg-white p-2 flex flex-col gap-2">
              <div className="text-center pb-1 border-b border-[#F5F5F5]">
                <p className="text-[10px] font-medium text-[#6B6B80] uppercase">{DAYS[date.getDay()]}</p>
                <span
                  className={`text-[13px] font-medium inline-flex items-center justify-center w-6 h-6 rounded-full ${
                    isToday ? "bg-[#6D4AE8] text-white" : "text-[#1A1A2E]"
                  }`}
                >
                  {date.getDate()}
                </span>
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                {dayPosts.map((post) => (
                  <div key={post.id}>
                    {post.scheduledTime && (
                      <p className="text-[10px] text-[#6B6B80] mb-0.5">{post.scheduledTime}</p>
                    )}
                    <PostCard post={post} onClick={() => onPostClick(post)} onCycleStatus={() => onCycleStatus(post)} />
                  </div>
                ))}
                <button
                  onClick={() => onDayClick(date)}
                  className="flex-1 min-h-[28px] flex items-center justify-center gap-1 text-[11px] text-[#AAAAAA] opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Plus className="h-3 w-3" /> adicionar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
