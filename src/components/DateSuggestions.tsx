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
      dayName: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"][date.getDay()],
      postsCount: items.filter((item) => item.data === date.toISOString().split("T")[0]).length,
    }))
    .sort((a, b) => a.postsCount - b.postsCount);

  const topSuggestions = suggestions.slice(0, 3);
  const isEmpty = topSuggestions.every((s) => s.postsCount === 0);

  if (isEmpty || topSuggestions.every((s) => s.postsCount > 0)) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-blue-600" />
          Melhor Momento para Postar
        </CardTitle>
        <CardDescription>Dias com menos posts agendados</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {topSuggestions.map((suggestion) => (
          <Button
            key={suggestion.date.toISOString()}
            variant="outline"
            className="w-full justify-between h-auto py-2"
            onClick={() => onSelectDate(suggestion.date)}
          >
            <span className="flex items-center gap-2 flex-wrap">
              {suggestion.dayName} ({suggestion.date.getDate()})
              <Badge variant="secondary">
                {suggestion.postsCount} post{suggestion.postsCount !== 1 ? "s" : ""}
              </Badge>
              <Badge
                variant="outline"
                className={`text-[10px] font-medium border ${ALCATEIA_CALENDAR[suggestion.day].color}`}
              >
                {ALCATEIA_CALENDAR[suggestion.day].label}
              </Badge>
            </span>
            <span className="text-xs text-muted-foreground">Agendar →</span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
