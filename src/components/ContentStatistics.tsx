import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarItem } from "@/hooks/useCalendarItems";

interface ContentStatisticsProps {
  items: CalendarItem[];
}

const CONTENT_TYPES = {
  carrossel: "Carrossel",
  post_unico: "Post Único",
  reels: "Reels",
  stories: "Stories",
  levantada: "Levantada de Mão",
};

const COLORS = {
  carrossel: "#3b82f6",
  post_unico: "#10b981",
  reels: "#a855f7",
  stories: "#f97316",
  levantada: "#ec4899",
};

export function ContentStatistics({ items }: ContentStatisticsProps) {
  if (items.length === 0) {
    return null;
  }

  // Contagem por tipo
  const typeCounts: Record<string, number> = {};
  Object.keys(CONTENT_TYPES).forEach((key) => (typeCounts[key] = 0));
  items.forEach((item) => {
    if (typeCounts[item.tipo] !== undefined) typeCounts[item.tipo]++;
  });

  const typeData = Object.entries(typeCounts)
    .filter(([_, count]) => count > 0)
    .map(([type, count]) => ({
      name: CONTENT_TYPES[type as keyof typeof CONTENT_TYPES],
      value: count,
      percentage: Math.round((count / items.length) * 100),
    }));

  // Contagem por dia da semana
  const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const dayCount = [0, 0, 0, 0, 0, 0, 0];

  items.forEach((item) => {
    const date = new Date(item.data);
    const dayOfWeek = date.getDay();
    dayCount[dayOfWeek]++;
  });

  const dayData = DAYS.map((name, index) => ({
    day: name,
    posts: dayCount[index],
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Distribuição por Tipo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Distribuição por Tipo</CardTitle>
          <CardDescription>Total de {items.length} posts</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {typeData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      COLORS[
                        Object.entries(CONTENT_TYPES).find(
                          ([_, v]) => v === entry.name
                        )?.[0] as keyof typeof COLORS
                      ]
                    }
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} posts`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {typeData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        COLORS[
                          Object.entries(CONTENT_TYPES).find(
                            ([_, v]) => v === item.name
                          )?.[0] as keyof typeof COLORS
                        ],
                    }}
                  />
                  {item.name}
                </span>
                <span className="font-semibold">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Posts por Dia da Semana */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Posts por Dia da Semana</CardTitle>
          <CardDescription>Distribuição ao longo da semana</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dayData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ backgroundColor: "#f3f4f6", border: "1px solid #e5e7eb" }} />
              <Bar dataKey="posts" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold">Dia mais movimentado:</span>{" "}
              {DAYS[dayCount.indexOf(Math.max(...dayCount))]} com {Math.max(...dayCount)} posts
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
