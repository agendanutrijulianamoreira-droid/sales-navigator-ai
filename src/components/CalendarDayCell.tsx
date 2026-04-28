import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { CommemorativeDate } from "@/lib/constants/holidays";
import { CalendarItem } from "@/hooks/useCalendarItems";
import { DraggablePostCard } from "./DraggablePostCard";
import { DroppableDay } from "./DroppableDay";

interface CalendarDayCellProps {
  date: Date;
  dayNumber: number;
  isToday: boolean;
  posts: CalendarItem[];
  holiday?: CommemorativeDate;
  onAddClick: (date: Date) => void;
  onEditPost: (post: CalendarItem) => void;
  onDeletePost: (id: string) => void;
  onDropPost: (postId: string, newDate: string) => void;
  onQuickAction?: (type: string, date: Date) => void;
  variant?: "month" | "week";
}

export function CalendarDayCell({
  date,
  dayNumber,
  isToday,
  posts,
  holiday,
  onAddClick,
  onEditPost,
  onDeletePost,
  onDropPost,
  variant = "month",
}: CalendarDayCellProps) {
  const isWeek = variant === "week";

  return (
    <div
      className={cn(
        "border-b border-r border-gray-100 flex flex-col group relative transition-colors",
        isWeek ? "min-h-[600px]" : "min-h-[150px]",
        isToday ? "bg-primary/[0.03]" : "bg-white hover:bg-gray-50/40"
      )}
    >
      {/* Day Header */}
      <div className="p-2 flex items-center justify-between z-20 sticky top-0 bg-inherit">
        <span
          className={cn(
            "text-sm font-bold flex items-center justify-center min-w-7 h-7 px-2 rounded-full transition-all",
            isToday
              ? "bg-primary text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100 cursor-pointer"
          )}
          onClick={() => onAddClick(date)}
        >
          {dayNumber}
        </span>

        {posts.length > 0 && (
          <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 rounded-full px-1.5 py-0.5">
            {posts.length}
          </span>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
          onClick={() => onAddClick(date)}
          title="Adicionar post"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      <DroppableDay date={date} onDrop={onDropPost} onAddClick={onAddClick}>
        <div className={cn("flex flex-col px-1.5 pb-2 gap-1", isWeek ? "px-2 gap-2" : "px-1.5 gap-1")}>
          {posts.map((post) => (
            <DraggablePostCard
              key={post.id}
              post={post}
              onEdit={onEditPost}
              onDelete={onDeletePost}
              variant={variant}
            />
          ))}
          {posts.length === 0 && (
            <button
              onClick={() => onAddClick(date)}
              className={cn(
                "rounded-md border border-dashed border-gray-200 hover:border-primary/40 hover:bg-primary/[0.02] transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100",
                isWeek ? "min-h-[80px]" : "min-h-[40px]"
              )}
            >
              <Plus className="h-4 w-4 text-gray-300" />
            </button>
          )}
        </div>
      </DroppableDay>

      {/* Holiday Indicator */}
      {holiday && (
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 py-0.5 px-2 text-[9px] font-bold text-white truncate z-10",
            holiday.color || "bg-primary/80"
          )}
          title={holiday.label}
        >
          {holiday.label}
        </div>
      )}
    </div>
  );
}
