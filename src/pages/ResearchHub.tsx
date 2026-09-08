import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import type { ResearchItem, ResearchItemType, ResearchSourceContext } from "@/types/research";
import {
  ArrowUpRight,
  BookOpenCheck,
  Clock3,
  FlaskConical,
  Loader2,
  Newspaper,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

function formatDate(value: string | null) {
  if (!value) return "Data não informada";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data não informada";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function SourceList({
  items,
  type,
  onCreate,
}: {
  items: ResearchItem[];
  type: ResearchItemType;
  onCreate: (item: ResearchItem) => void;
}) {
  const Icon = type === "article" ? FlaskConical : Newspaper;

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
        <Icon className="mx-auto h-9 w-9 text-muted-foreground/50" />
        <h3 className="mt-4 font-semibold">Nenhuma fonte encontrada</h3>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          Ajuste a busca ou atualize as fontes. O filtro usa seu nicho e sub-nicho cadastrados.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
      {items.map((item, index) => (
        <article
          key={`${item.type}-${item.external_id}`}
          className="group grid gap-4 border-b border-border/60 p-5 last:border-b-0 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-6"
        >
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="rounded-md border-primary/20 bg-primary/5 font-medium text-primary">
                {item.source}
              </Badge>
              <span className="flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5" />
                {formatDate(item.published_at)}
              </span>
              {index < 3 && (
                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" /> fonte recente
                </span>
              )}
            </div>
            <h2 className="max-w-4xl text-base font-semibold leading-snug text-foreground md:text-lg">
              {item.title}
            </h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-muted-foreground line-clamp-3">
              {item.summary}
            </p>
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Ler na fonte original <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
          <Button className="w-full gap-2 md:w-auto" onClick={() => onCreate(item)}>
            <Sparkles className="h-4 w-4" />
            Criar conteúdo
          </Button>
        </article>
      ))}
    </div>
  );
}

export default function ResearchHub() {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useProfile();
  const [items, setItems] = useState<ResearchItem[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [terms, setTerms] = useState<string[]>([]);

  const fetchItems = useCallback(async (forceRefresh = false) => {
    if (!profile) return;
    if (forceRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("fetch-research-items", {
        body: {
          niche: profile.nicho,
          subNiche: profile.sub_nicho,
          forceRefresh,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const nextItems = Array.isArray(data?.items) ? data.items as ResearchItem[] : [];
      setItems(nextItems);
      setTerms(Array.isArray(data?.terms) ? data.terms : []);
      const fetchedDates = nextItems.map((item) => item.fetched_at).filter(Boolean).sort();
      const newestFetch = fetchedDates[fetchedDates.length - 1];
      setLastUpdated(newestFetch || new Date().toISOString());

      if (forceRefresh) {
        toast.success(data?.refreshed ? "Fontes atualizadas" : "As fontes já estavam atualizadas");
      }
      if (data?.partial) toast.warning("Uma das fontes está indisponível; exibindo os resultados disponíveis.");
    } catch (error) {
      console.error("Research Hub error:", error);
      toast.error("Não foi possível carregar as fontes", {
        description: error instanceof Error ? error.message : "Tente novamente em alguns minutos.",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [profile]);

  useEffect(() => {
    if (!profileLoading && profile) fetchItems();
  }, [profileLoading, profile, fetchItems]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-BR");
    if (!normalized) return items;
    return items.filter((item) =>
      `${item.title} ${item.summary} ${item.source}`.toLocaleLowerCase("pt-BR").includes(normalized)
    );
  }, [items, query]);

  const articles = filtered.filter((item) => item.type === "article");
  const news = filtered.filter((item) => item.type === "news");

  const handleCreate = (item: ResearchItem) => {
    const researchSource: ResearchSourceContext = {
      type: item.type,
      title: item.title,
      summary: item.summary,
      source: item.source,
      url: item.url,
      publishedAt: item.published_at,
    };

    navigate("/carousel-creator", {
      state: {
        topic: item.title,
        researchSource,
        preselectedFormat: "carousel",
      },
    });
  };

  return (
    <AppLayout
      title="Fontes & Pesquisa"
      description="Conteúdo baseado em ciência e fatos verificáveis"
    >
      <section className="relative overflow-hidden rounded-3xl border border-primary/15 bg-[linear-gradient(120deg,hsl(var(--card))_0%,hsl(var(--card))_62%,hsl(var(--primary)/0.10)_100%)] p-6 md:p-8">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-primary via-accent to-primary" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <BookOpenCheck className="h-4 w-4" />
              Bancada de evidências
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
              Comece pela fonte. Depois aplique sua estratégia.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              Artigos do PubMed e notícias de saúde entram como base factual no método ISCAA. A IA recebe instruções para não inventar números nem conclusões ausentes na fonte.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground lg:max-w-sm lg:justify-end">
            {terms.slice(0, 5).map((term) => (
              <Badge key={term} variant="secondary" className="rounded-full px-3 py-1 font-normal">
                {term}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar tema, periódico ou veículo"
            className="h-11 pl-9"
            aria-label="Buscar nas fontes"
          />
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Atualizado {formatDate(lastUpdated)}
            </span>
          )}
          <Button variant="outline" className="gap-2" onClick={() => fetchItems(true)} disabled={isRefreshing || isLoading}>
            {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Atualizar fontes
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Buscando evidências para o seu nicho…</p>
        </div>
      ) : (
        <Tabs defaultValue="articles" className="mt-5">
          <TabsList className="grid h-11 w-full grid-cols-2 sm:w-[420px]">
            <TabsTrigger value="articles" className="gap-2">
              <FlaskConical className="h-4 w-4" /> Artigos científicos ({articles.length})
            </TabsTrigger>
            <TabsTrigger value="news" className="gap-2">
              <Newspaper className="h-4 w-4" /> Notícias ({news.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="articles" className="mt-4">
            <SourceList items={articles} type="article" onCreate={handleCreate} />
            <p className="mt-3 text-xs text-muted-foreground">
              Dados bibliográficos fornecidos pelo NCBI/PubMed. Revise a publicação original antes de fazer alegações clínicas.
            </p>
          </TabsContent>
          <TabsContent value="news" className="mt-4">
            <SourceList items={news} type="news" onCreate={handleCreate} />
            <p className="mt-3 text-xs text-muted-foreground">
              Notícias ajudam a identificar pautas; elas não substituem a evidência científica nem a avaliação profissional.
            </p>
          </TabsContent>
        </Tabs>
      )}
    </AppLayout>
  );
}
