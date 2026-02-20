import { useDrop } from "react-dnd";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CalendarItem } from "@/hooks/useCalendarItems";
import { ReactNode } from "react";

interface DroppableDayProps {
  date: Date;
  children?: ReactNode;
  onDrop?: (postId: string, newDate: string) => void;
  onAddClick?: (date: Date) => void;
  isEmpty?: boolean;
}

export function DroppableDay({ date, children, onDrop, onAddClick, isEmpty }: DroppableDayProps) {
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "post",
      drop: (item: { id: string; data: string }) => {
        if (onDrop) {
          onDrop(item.id, date.toISOString().split("T")[0]);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }),
    [date, onDrop]
  );

  return (
    <div
      ref={drop}
      className={`p-2 rounded-lg border-2 transition-all ${
        isOver ? "border-primary bg-primary/5 border-dashed" : "border-transparent"
      }`}
    >
      {!isEmpty && children}
      {isEmpty && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full h-20 border-2 border-dashed"
          onClick={() => onAddClick?.(date)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
