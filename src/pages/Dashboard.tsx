import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  FlaskConical,
  MessageSquare,
  Plus,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type UpcomingContent = {
  id: string;
  data: string;
  tipo: string;
  titulo: string;
  status: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  planejado: "Planejado",
  rascunho: "Rascunho",
  em_aprovacao: "Em aprovação",
  aprovado: "Aprovado",
  agendado: "Agendado",
  publicado: "Publicado",
};

const STATUS_STYLES: Record<string, string> = {
  planejado: "border-slate-200 bg-slate-50 text-slate-600",
  rascunho: "border-amber-200 bg-amber-50 text-amber-700",
  em_aprovacao: "border-sky-200 bg-sky-50 text-sky-700",
  aprovado: "border-green-200 bg-green-50 text-green-700",
  agendado: "border-violet-200 bg-violet-50 text-violet-700",
  publicado: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const QUICK_LINKS = [
  { label: "Calendário", description: "Ver todo o planejamento", href: "/planner", icon: CalendarDays },
  { label: "Laboratório", description: "Ajustar sua estratégia", href: "/business-lab", icon: FlaskConical },
  { label: "Fontes e pesquisas", description: "Criar com evidências", href: "/research", icon: BookOpenCheck },
  { label: "Mentor IA", description: "Tirar uma dúvida", href: "/mentor", icon: MessageSquare },
];

function getLocalDateKey() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function formatContentDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return {
    weekday: date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
    day: date.toLocaleDateString("pt-BR", { day: "2-digit" }),
    month: date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
  };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();

  const { data: upcomingContents = [], isLoading } = useQuery({
    queryKey: ["dashboard-upcoming-contents", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("calendar_items")
        .select("id, data, tipo, titulo, status")
        .eq("user_id", user.id)
        .gte("data", getLocalDateKey())
        .or("status.is.null,status.neq.publicado")
        .order("data", { ascending: true })
        .limit(3);

      if (error) throw error;
      return (data ?? []) as UpcomingContent[];
    },
    enabled: Boolean(user),
    staleTime: 60_000,
  });

  const firstName = profile?.nome?.trim().split(" ")[0] || "Nutri";

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-8">
      <section className="border-b border-border pb-7 pt-1">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="mb-2 text-sm font-medium text-primary">{getGreeting()}, {firstName}</p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              O que você vai publicar agora?
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground md:text-base">
              Gere seu planejamento ou continue o próximo conteúdo da fila.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              size="lg"
              className="h-11 gap-2 rounded-xl px-5"
              onClick={() => navigate("/planner", { state: { openGenerator: true } })}
            >
              <Sparkles className="h-4 w-4" />
              Gerar posts
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 gap-2 rounded-xl px-5"
              onClick={() => navigate("/carousel-creator")}
            >
              <Plus className="h-4 w-4" />
              Criar post avulso
            </Button>
          </div>
        </div>
      </section>

      <section aria-labelledby="upcoming-content-title">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 id="upcoming-content-title" className="text-xl font-semibold tracking-tight text-foreground">
              Próximos conteúdos
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Sua fila de criação, em ordem de publicação.</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="hidden gap-1 text-primary sm:flex">
            <Link to="/planner">Ver calendário <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>

        <Card className="overflow-hidden border-border/80 shadow-sm">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="divide-y divide-border" aria-label="Carregando próximos conteúdos">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="flex items-center gap-4 p-4 md:p-5">
                    <div className="h-12 w-14 animate-pulse bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            ) : upcomingContents.length === 0 ? (
              <div className="flex flex-col items-start gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-8">
                <div>
                  <p className="font-medium text-foreground">Sua fila está livre.</p>
                  <p className="mt-1 text-sm text-muted-foreground">Gere um plano e receba os rascunhos já organizados no calendário.</p>
                </div>
                <Button
                  className="gap-2 rounded-xl"
                  onClick={() => navigate("/planner", { state: { openGenerator: true } })}
                >
                  <Sparkles className="h-4 w-4" /> Gerar meu planejamento
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {upcomingContents.map((content) => {
                  const date = formatContentDate(content.data);
                  const status = content.status || "planejado";

                  return (
                    <div
                      key={content.id}
                      className="group flex flex-col gap-4 p-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center md:p-5"
                    >
                      <div className="flex w-16 shrink-0 items-baseline gap-1 sm:block sm:text-center">
                        <span className="text-xs font-medium capitalize text-muted-foreground sm:block">{date.weekday}</span>
                        <span className="text-xl font-bold leading-none text-foreground sm:text-2xl">{date.day}</span>
                        <span className="text-xs text-muted-foreground sm:ml-1">{date.month}</span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">{content.titulo || "Conteúdo sem título"}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="h-5 rounded-md px-2 text-[11px] font-medium capitalize">
                            {content.tipo.replace("_", " ")}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={cn("h-5 rounded-md px-2 text-[11px] font-medium", STATUS_STYLES[status])}
                          >
                            {STATUS_LABELS[status] || status}
                          </Badge>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1.5 rounded-lg sm:w-auto"
                        onClick={() => navigate(`/post-creator/${content.id}`)}
                      >
                        {status === "rascunho" ? "Criar post" : "Abrir"}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="quick-access-title">
        <h2 id="quick-access-title" className="mb-4 text-base font-semibold text-foreground">Acesso rápido</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="group flex min-h-24 items-start gap-3 border border-border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-primary/[0.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span>
                <span className="block text-sm font-semibold text-foreground">{item.label}</span>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">{item.description}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
