import { Plus } from "lucide-react";
import { ContentCalendarPost } from "@/types/contentCalendar";
import { PostCard } from "./PostCard";

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface MonthlyCalendarProps {
  currentDate: Date;
  posts: ContentCalendarPost[];
  onDayClick: (date: Date) => void;
  onPostClick: (post: ContentCalendarPost) => void;
  onCycleStatus: (post: ContentCalendarPost) => void;
}

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function MonthlyCalendar({ currentDate, posts, onDayClick, onPostClick, onCycleStatus }: MonthlyCalendarProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const today = new Date();
  const todayKey = toDateKey(today);

  const postsByDate = posts.reduce<Record<string, ContentCalendarPost[]>>((acc, p) => {
    (acc[p.scheduledDate] ||= []).push(p);
    return acc;
  }, {});

  const cells: { date: Date; inMonth: boolean }[] = [];
  for (let i = startOffset - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, daysInPrevMonth - i), inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), inMonth: true });
  }
  while (cells.length % 7 !== 0 || cells.length < 42) {
    const last = cells[cells.length - 1].date;
    cells.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), inMonth: false });
    if (cells.length >= 42) break;
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="grid grid-cols-7 border-b border-[#E8E8EC]">
        {DAYS.map((d) => (
          <div key={d} className="px-2 py-2 text-[12px] font-medium text-[#6B6B80] uppercase tracking-wide text-center">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1 gap-[2px] bg-[#E8E8EC]">
        {cells.map(({ date, inMonth }, i) => {
          const key = toDateKey(date);
          const dayPosts = postsByDate[key] || [];
          const isToday = key === todayKey;
          return (
            <div
              key={i}
              className={`group min-h-[110px] p-[6px] flex flex-col gap-1 ${inMonth ? "bg-white" : "bg-[#FAFAFA]"}`}
              onClick={() => dayPosts.length === 0 && onDayClick(date)}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[13px] font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday
                      ? "bg-[#6D4AE8] text-white"
                      : inMonth
                        ? "text-[#6B6B80]"
                        : "text-[#CCCCCC]"
                  }`}
                >
                  {date.getDate()}
                </span>
                {dayPosts.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDayClick(date);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-[#F0F0F5]"
                  >
                    <Plus className="h-3.5 w-3.5 text-[#6B6B80]" />
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-1">
                {dayPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onClick={() => onPostClick(post)}
                    onCycleStatus={() => onCycleStatus(post)}
                  />
                ))}
              </div>

              {dayPosts.length === 0 && (
                <button
                  onClick={() => onDayClick(date)}
                  className="flex-1 min-h-[28px] flex items-center justify-center text-[11px] text-[#AAAAAA] opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  + adicionar
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
