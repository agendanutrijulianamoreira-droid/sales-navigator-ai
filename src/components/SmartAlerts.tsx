import { AlertCircle, TrendingUp, Zap, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalendarItem } from "@/hooks/useCalendarItems";

interface SmartAlertsProps {
  items: CalendarItem[];
  currentDate: Date;
}

const CONTENT_TYPES = {
  carrossel: "Carrossel",
  post_unico: "Post Único",
  reels: "Reels",
  stories: "Stories",
  levantada: "Levantada de Mão",
};

export function SmartAlerts({ items, currentDate }: SmartAlertsProps) {
  const weekStart = new Date(currentDate);
  weekStart.setDate(currentDate.getDate() - currentDate.getDay());

  const weekItems = items.filter((item) => {
    const itemDate = new Date(item.data);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    return itemDate >= weekStart && itemDate < weekEnd;
  });

  const alerts: Array<{ type: "warning" | "info"; title: string; description: string }> = [];

  // Verificar tipos de conteúdo
  const typeCounts: Record<string, number> = {};
  Object.keys(CONTENT_TYPES).forEach((key) => (typeCounts[key] = 0));
  weekItems.forEach((item) => {
    if (typeCounts[item.tipo] !== undefined) typeCounts[item.tipo]++;
  });

  const missingTypes = Object.entries(typeCounts)
    .filter(([_, count]) => count === 0)
    .map(([type]) => CONTENT_TYPES[type as keyof typeof CONTENT_TYPES]);

  if (missingTypes.length > 0) {
    alerts.push({
      type: "warning",
      title: "Tipo de conteúdo faltando",
      description: `Sua semana não tem: ${missingTypes.join(", ")}. Considere adicionar para variedade.`,
    });
  }

  // Verificar dias sem conteúdo
  const daysWithContent = new Set<string>();
  weekItems.forEach((item) => {
    daysWithContent.add(item.data);
  });

  if (daysWithContent.size < 4) {
    alerts.push({
      type: "info",
      title: "Semana com pouco conteúdo",
      description: `Apenas ${daysWithContent.size} dias com posts. Meta sugerida: 5+ dias por semana.`,
    });
  }

  // Verificar picos de conteúdo
  const dayItemCounts: Record<string, number> = {};
  weekItems.forEach((item) => {
    dayItemCounts[item.data] = (dayItemCounts[item.data] || 0) + 1;
  });

  const overloadedDays = Object.entries(dayItemCounts)
    .filter(([_, count]) => count > 3)
    .map(([date]) => new Date(date).toLocaleDateString("pt-BR"));

  if (overloadedDays.length > 0) {
    alerts.push({
      type: "warning",
      title: "Dias sobrecarregados",
      description: `${overloadedDays.join(", ")} tem mais de 3 posts. Considere distribuir melhor.`,
    });
  }

  // Verificar fins de semana
  const weekendItems = weekItems.filter((item) => {
    const date = new Date(item.data);
    const day = date.getDay();
    return day === 0 || day === 6;
  });

  if (weekendItems.length === 0) {
    alerts.push({
      type: "info",
      title: "Sem posts no fim de semana",
      description: "Sábados e domingos têm alto engajamento. Considere agendar algo!",
    });
  }

  // Total de posts
  if (weekItems.length === 0) {
    alerts.push({
      type: "warning",
      title: "Semana vazia",
      description: "Nenhum post agendado para esta semana. Comece a planejar!",
    });
  }

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert, i) => (
        <Alert
          key={i}
          variant={alert.type === "warning" ? "default" : "default"}
          className={alert.type === "warning" ? "border-yellow-500/50 bg-yellow-50" : "border-blue-500/50 bg-blue-50"}
        >
          <div className="flex gap-3">
            {alert.type === "warning" ? (
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            ) : (
              <TrendingUp className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <AlertTitle className={alert.type === "warning" ? "text-yellow-900" : "text-blue-900"}>
                {alert.title}
              </AlertTitle>
              <AlertDescription className={alert.type === "warning" ? "text-yellow-800" : "text-blue-800"}>
                {alert.description}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      ))}
    </div>
  );
}
