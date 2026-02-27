import { useDrop } from "react-dnd";
import { Plus } from "lucide-react";
import { ReactNode } from "react";

interface DroppableDayProps {
  date: Date;
  children?: ReactNode;
  onDrop?: (postId: string, newDate: string) => void;
  onAddClick?: (date: Date) => void;
}

export function DroppableDay({ date, children, onDrop, onAddClick }: DroppableDayProps) {
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
      className={`h-full min-h-[120px] relative transition-all group ${isOver ? "bg-primary/5 ring-2 ring-primary inset-0 z-10" : ""
        }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onAddClick?.(date);
        }
      }}
    >
      <div className="p-1 space-y-1">
        {children}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onAddClick?.(date);
        }}
        className="absolute bottom-1 right-1 p-1 rounded-full bg-primary text-white opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
}
