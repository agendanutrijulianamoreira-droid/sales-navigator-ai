import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarItem } from "@/hooks/useCalendarItems";
import { Lightbulb } from "lucide-react";

// Calendário Alcateia: sugestão de conteúdo por dia da semana
const ALCATEIA_CALENDAR: Record<number, { label: string; type: string; color: string }> = {
  0: { label: "Levantada de Mão 🙋", type: "levantada", color: "bg-pink-100 text-pink-700 border-pink-200" },
  1: { label: "Caixinha 3x1 📦", type: "stories", color: "bg-blue-100 text-blue-700 border-blue-200" },
  2: { label: "Empurrãozinho 🚀", type: "stories", color: "bg-orange-100 text-orange-700 border-orange-200" },
  3: { label: "Carrossel de Valor 🎠", type: "carrossel", color: "bg-purple-100 text-purple-700 border-purple-200" },
  4: { label: "Levantada de Mão 🙋", type: "levantada", color: "bg-pink-100 text-pink-700 border-pink-200" },
  5: { label: "Caixinha 3x1 📦", type: "stories", color: "bg-blue-100 text-blue-700 border-blue-200" },
  6: { label: "Empurrãozinho 🚀", type: "stories", color: "bg-orange-100 text-orange-700 border-orange-200" },
};

interface DateSuggestionsProps {
  items: CalendarItem[];
  weekDates: Date[];
  onSelectDate: (date: Date) => void;
}

export function DateSuggestions({ items, weekDates, onSelectDate }: DateSuggestionsProps) {
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());

  // Contar posts por dia da semana
  const postsPerDay: Record<number, number> = {
    0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0,
  };

  items.forEach((item) => {
    const date = new Date(item.data);
    const dayOfWeek = date.getDay();
    postsPerDay[dayOfWeek]++;
  });

  // Encontrar dias com menos posts
  const suggestions = weekDates
    .map((date) => ({
      date,
      day: date.getDay(),
      dayName: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][date.getDay()],
      fullDayName: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"][date.getDay()],
      postsCount: items.filter((item) => item.data === date.toISOString().split("T")[0]).length,
    }))
    .sort((a, b) => a.postsCount - b.postsCount);

  const topSuggestions = suggestions.filter(s => s.postsCount < 3).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Cadência Alcateia */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-1">
          Cadência semanal recomendada
        </h4>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {weekDates.sort((a, b) => a.getTime() - b.getTime()).map((date) => {
            const day = date.getDay();
            const isSelected = selectedDay === day;
            const config = ALCATEIA_CALENDAR[day];

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex flex-col items-center min-w-[50px] p-2 rounded-xl transition-all border-2 ${isSelected
                  ? "bg-background border-primary shadow-sm scale-105"
                  : "bg-muted/30 border-transparent hover:bg-muted/50"
                  }`}
              >
                <span className="text-[10px] uppercase font-bold text-muted-foreground">
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][day]}
                </span>
                <span className="text-sm font-bold">{date.getDate()}</span>
              </button>
            );
          })}
        </div>

        <div className={`p-4 rounded-2xl border transition-all animate-in fade-in slide-in-from-top-2 ${ALCATEIA_CALENDAR[selectedDay].color}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Sugestão Elite</p>
              <h5 className="font-bold text-sm flex items-center gap-2">
                {ALCATEIA_CALENDAR[selectedDay].label}
              </h5>
            </div>
            <Lightbulb className="h-5 w-5 opacity-50" />
          </div>
        </div>
      </div>

      {topSuggestions.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-xs flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-blue-600" />
              Melhor Momento para Postar
            </CardTitle>
            <CardDescription className="text-[10px]">Dias com menos posts agendados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 px-4 pb-4">
            {topSuggestions.map((suggestion) => (
              <Button
                key={suggestion.date.toISOString()}
                variant="outline"
                className="w-full justify-between h-auto py-2 bg-white/50 border-blue-100 hover:bg-white"
                onClick={() => onSelectDate(suggestion.date)}
              >
                <span className="flex items-center gap-2 flex-wrap text-xs">
                  {suggestion.fullDayName} ({suggestion.date.getDate()})
                  <Badge variant="secondary" className="bg-blue-100/50 text-blue-700 text-[10px]">
                    {suggestion.postsCount} post{suggestion.postsCount !== 1 ? "s" : ""}
                  </Badge>
                </span>
                <span className="text-[10px] text-blue-600 font-bold uppercase tracking-tighter">Agendar →</span>
              </Button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
