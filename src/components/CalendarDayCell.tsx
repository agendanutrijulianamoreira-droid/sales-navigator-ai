import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  FileText, Image as ImageIcon, Layout, Box, 
  Sparkles, ListChecks, MessageSquare, Plus, ChevronDown
} from "lucide-react";
import { CommemorativeDate } from "@/lib/constants/holidays";
import { CalendarItem } from "@/hooks/useCalendarItems";
import { DraggablePostCard } from "./DraggablePostCard";
import { DroppableDay } from "./DroppableDay";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  onQuickAction: (type: string, date: Date) => void;
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
  onQuickAction
}: CalendarDayCellProps) {
  return (
    <div
      className={cn(
        "border-b border-r border-gray-100 min-h-[220px] flex flex-col group relative transition-colors",
        isToday ? "bg-primary/[0.02]" : "bg-white"
      )}
    >
      {/* Day Header */}
      <div className="p-2 flex items-center justify-between z-20">
        <span
          className={cn(
            "text-sm font-bold flex items-center justify-center w-7 h-7 rounded-full transition-all",
            isToday 
              ? "bg-primary text-white shadow-sm scale-110" 
              : "text-gray-500 hover:bg-gray-100 cursor-pointer"
          )}
          onClick={() => onAddClick(date)}
        >
          {dayNumber}
        </span>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <Plus className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onQuickAction('text', date)}>
              <FileText className="h-4 w-4 mr-2" /> Novo Post de Texto
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onQuickAction('image', date)}>
              <ImageIcon className="h-4 w-4 mr-2" /> Novo Post com Imagem
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onQuickAction('layout', date)}>
              <Layout className="h-4 w-4 mr-2" /> Novo Layout/Carrossel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <DroppableDay date={date} onDrop={onDropPost} onAddClick={onAddClick}>
        <div className="flex flex-col h-full px-2 pb-2 space-y-3">
          
          {/* Posts list */}
          <div className="space-y-1 min-h-[20px] empty:hidden">
            {posts.map((post) => (
              <DraggablePostCard
                key={post.id}
                post={post}
                onEdit={onEditPost}
                onDelete={onDeletePost}
              />
            ))}
          </div>

          {/* Action Buttons (Reference: Gerar posts) */}
          <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Gerar posts</p>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-[10px] px-2 justify-between border-primary/20 hover:bg-primary/5 text-primary font-bold bg-white"
                >
                  <div className="flex items-center">
                    <Sparkles className="h-3 w-3 mr-1.5" />
                    Usar serviços
                  </div>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuItem onClick={() => onQuickAction('service_highlight', date)}>Destaque de Consulta</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onQuickAction('service_process', date)}>Processo do Acompanhamento</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onQuickAction('service_benefits', date)}>Benefícios do Método</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 text-[10px] px-2 justify-start border-primary/20 hover:bg-primary/5 text-primary font-bold bg-white"
              onClick={() => onQuickAction('topics', date)}
            >
              <MessageSquare className="h-3 w-3 mr-1.5" />
              Usar assuntos
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 text-[10px] px-2 justify-start border-primary/20 hover:bg-primary/5 text-primary font-bold bg-white underline decoration-primary/30 underline-offset-2"
              onClick={() => onQuickAction('step_by_step', date)}
            >
              <ListChecks className="h-3 w-3 mr-1.5" />
              Gerar passo a passo
            </Button>
          </div>

          {/* Quick Shortcuts Grid (Other ways to start) */}
          <div className="pt-2 border-t border-gray-50 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-75">
            <p className="text-[9px] font-semibold text-gray-400 mb-1.5 uppercase">Outras formas de começar</p>
            <div className="grid grid-cols-2 gap-1">
              <button 
                onClick={() => onQuickAction('text', date)}
                className="flex flex-col items-center justify-center p-1.5 rounded-md border border-gray-100 hover:border-primary/30 hover:bg-primary/[0.02] transition-colors"
              >
                <FileText className="h-3.5 w-3.5 text-gray-400 mb-1" />
                <span className="text-[8px] font-medium text-gray-500">Texto</span>
              </button>
              <button 
                onClick={() => onQuickAction('image', date)}
                className="flex flex-col items-center justify-center p-1.5 rounded-md border border-gray-100 hover:border-primary/30 hover:bg-primary/[0.02] transition-colors"
              >
                <ImageIcon className="h-3.5 w-3.5 text-gray-400 mb-1" />
                <span className="text-[8px] font-medium text-gray-500">Imagem</span>
              </button>
              <button 
                onClick={() => onQuickAction('layout', date)}
                className="flex flex-col items-center justify-center p-1.5 rounded-md border border-gray-100 hover:border-primary/30 hover:bg-primary/[0.02] transition-colors"
              >
                <Layout className="h-3.5 w-3.5 text-gray-400 mb-1" />
                <span className="text-[8px] font-medium text-gray-500">Layout</span>
              </button>
              <button 
                onClick={() => onQuickAction('ready_posts', date)}
                className="flex flex-col items-center justify-center p-1.5 rounded-md border border-gray-100 hover:border-primary/30 hover:bg-primary/[0.02] transition-colors"
              >
                <Box className="h-3.5 w-3.5 text-gray-400 mb-1" />
                <span className="text-[8px] font-medium text-gray-500">Posts Prontos</span>
              </button>
            </div>
          </div>
        </div>
      </DroppableDay>

      {/* Holiday Indicator */}
      {holiday && (
        <div className={cn(
          "absolute bottom-0 left-0 right-0 py-0.5 px-2 text-[9px] font-bold text-white truncate z-10",
          holiday.color || "bg-primary/80"
        )}>
          {holiday.label}
        </div>
      )}
    </div>
  );
}
