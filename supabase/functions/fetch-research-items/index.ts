import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.90.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type ResearchType = "article" | "news";

interface ResearchItem {
  type: ResearchType;
  query_key: string;
  external_id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  published_at: string | null;
  fetched_at: string;
  keywords: string[];
  source_metadata: Record<string, unknown>;
}

const CACHE_HOURS = 12;
const MANUAL_REFRESH_COOLDOWN_MINUTES = 5;
const MAX_ITEMS_PER_TYPE = 18;

const NEWS_FEEDS = [
  { name: "Organização Mundial da Saúde", url: "https://www.who.int/rss-feeds/news-english.xml" },
  { name: "ScienceDaily Nutrition", url: "https://www.sciencedaily.com/rss/health_medicine/nutrition.xml" },
  { name: "Medical Xpress", url: "https://medicalxpress.com/rss-feed/" },
];

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function decodeXml(value = "") {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;|&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function tagValue(xml: string, tag: string) {
  const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = xml.match(new RegExp(`<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escaped}>`, "i"));
  return decodeXml(match?.[1] || "");
}

function tagValues(xml: string, tag: string) {
  const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return [...xml.matchAll(new RegExp(`<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escaped}>`, "gi"))]
    .map((match) => decodeXml(match[1]))
    .filter(Boolean);
}

function blocks(xml: string, tag: string) {
  const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return [...xml.matchAll(new RegExp(`<${escaped}(?:\\s[^>]*)?>[\\s\\S]*?<\\/${escaped}>`, "gi"))]
    .map((match) => match[0]);
}

function safeDate(value: string | null | undefined) {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString();
}

function truncate(value: string, max = 900) {
  if (value.length <= max) return value;
  return `${value.slice(0, max).trimEnd()}…`;
}

function normalizeTerm(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hash(value: string) {
  let result = 5381;
  for (let index = 0; index < value.length; index += 1) {
    result = ((result << 5) + result) ^ value.charCodeAt(index);
  }
  return (result >>> 0).toString(36);
}

function buildSearchTerms(niche: string, subNiche: string) {
  const raw = normalizeTerm(`${niche} ${subNiche}`);
  const mapped = new Set<string>([
    "nutrition",
    "women's health",
    "dietary intervention",
    "metabolic health",
  ]);

  const mappings: Array<[RegExp, string[]]> = [
    [/emagrec|peso|obes/, ["weight loss", "obesity"]],
    [/intestin|microbiot|digest/, ["gut microbiota", "digestive health"]],
    [/hormon|sop|ovario|pcos/, ["hormonal health", "polycystic ovary syndrome"]],
    [/endometr/, ["endometriosis"]],
    [/menop|climater/, ["menopause"]],
    [/fertil|gesta/, ["female fertility", "pregnancy nutrition"]],
    [/diabet|glic|insulin/, ["diabetes", "insulin resistance"]],
    [/autoimun|inflama/, ["autoimmune disease", "inflammation"]],
  ];

  for (const [pattern, terms] of mappings) {
    if (pattern.test(raw)) terms.forEach((term) => mapped.add(term));
  }

  const userPhrases = [niche, subNiche]
    .map((term) => term.trim())
    .filter((term) => term.length >= 3)
    .slice(0, 2);

  return [...new Set([...userPhrases, ...mapped])].slice(0, 8);
}

function pubMedDate(article: string) {
  const pubDate = article.match(/<PubDate(?:\s[^>]*)?>[\s\S]*?<\/PubDate>/i)?.[0]
    || article.match(/<ArticleDate(?:\s[^>]*)?>[\s\S]*?<\/ArticleDate>/i)?.[0]
    || article;
  const year = tagValue(pubDate, "Year");
  const month = tagValue(pubDate, "Month") || "01";
  const day = tagValue(pubDate, "Day") || "01";
  const parsed = safeDate(`${year}-${month}-${day}`);
  if (parsed) return parsed;
  const medline = tagValue(pubDate, "MedlineDate");
  const medlineYear = medline.match(/\b(19|20)\d{2}\b/)?.[0];
  return medlineYear ? safeDate(`${medlineYear}-01-01`) : null;
}

async function fetchPubMed(terms: string[], queryKey: string, fetchedAt: string): Promise<ResearchItem[]> {
  const focusedTerms = terms.slice(0, 6).map((term) => `"${term}"[Title/Abstract]`).join(" OR ");
  const query = `(nutrition[MeSH Terms] OR diet[Title/Abstract]) AND (${focusedTerms}) AND humans[MeSH Terms]`;
  const base = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
  const common = { tool: "club_nutri_research_hub", retmode: "json" };
  const searchUrl = new URL(`${base}/esearch.fcgi`);
  Object.entries({
    ...common,
    db: "pubmed",
    term: query,
    sort: "pub date",
    retmax: String(MAX_ITEMS_PER_TYPE),
    datetype: "pdat",
    reldate: "730",
  }).forEach(([key, value]) => searchUrl.searchParams.set(key, value));

  const searchResponse = await fetch(searchUrl, { headers: { Accept: "application/json" } });
  if (!searchResponse.ok) throw new Error(`PubMed ESearch respondeu ${searchResponse.status}`);
  const searchData = await searchResponse.json();
  const ids = (searchData?.esearchresult?.idlist || []) as string[];
  if (!ids.length) return [];

  const fetchUrl = new URL(`${base}/efetch.fcgi`);
  Object.entries({
    db: "pubmed",
    id: ids.join(","),
    retmode: "xml",
    rettype: "abstract",
    tool: "club_nutri_research_hub",
  }).forEach(([key, value]) => fetchUrl.searchParams.set(key, value));

  const fetchResponse = await fetch(fetchUrl, { headers: { Accept: "application/xml" } });
  if (!fetchResponse.ok) throw new Error(`PubMed EFetch respondeu ${fetchResponse.status}`);
  const xml = await fetchResponse.text();

  return blocks(xml, "PubmedArticle").map((article) => {
    const pmid = tagValue(article, "PMID");
    const articleNode = article.match(/<Article(?:\s[^>]*)?>[\s\S]*?<\/Article>/i)?.[0] || article;
    const title = tagValue(articleNode, "ArticleTitle");
    const abstract = tagValues(articleNode, "AbstractText").join(" ");
    const journal = tagValue(articleNode, "Title") || "PubMed";
    const doi = tagValues(article, "ArticleId").find((value) => value.startsWith("10."));

    return {
      type: "article" as const,
      query_key: queryKey,
      external_id: pmid,
      title,
      summary: truncate(abstract || "Resumo não disponibilizado pelo periódico no PubMed."),
      source: journal,
      url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      published_at: pubMedDate(article),
      fetched_at: fetchedAt,
      keywords: terms,
      source_metadata: { pmid, doi: doi || null },
    };
  }).filter((item) => item.external_id && item.title);
}

function rssLink(item: string) {
  const textLink = item.match(/<link(?:\s[^>]*)?>([\s\S]*?)<\/link>/i)?.[1];
  if (textLink) return decodeXml(textLink);
  const href = item.match(/<link[^>]+href=["']([^"']+)["'][^>]*\/?\s*>/i)?.[1];
  return decodeXml(href || tagValue(item, "guid"));
}

function relevanceScore(text: string, terms: string[]) {
  const normalized = normalizeTerm(text);
  const coreTerms = [
    "nutrition", "diet", "food", "weight", "obesity", "metabolic", "women", "female",
    "hormone", "menopause", "pcos", "microbiota", "gut", "diabetes",
  ];
  const needles = [...terms.map(normalizeTerm), ...coreTerms];
  return needles.reduce((score, term) => score + (term && normalized.includes(term) ? 1 : 0), 0);
}

async function fetchNews(terms: string[], queryKey: string, fetchedAt: string): Promise<ResearchItem[]> {
  const settled = await Promise.allSettled(NEWS_FEEDS.map(async (feed) => {
    const response = await fetch(feed.url, {
      headers: { Accept: "application/rss+xml, application/xml, text/xml" },
    });
    if (!response.ok) throw new Error(`${feed.name} respondeu ${response.status}`);
    const xml = await response.text();
    const entries = [...blocks(xml, "item"), ...blocks(xml, "entry")];

    return entries.map((entry) => {
      const title = tagValue(entry, "title");
      const summary = tagValue(entry, "description") || tagValue(entry, "summary") || tagValue(entry, "content:encoded");
      const url = rssLink(entry);
      const published = tagValue(entry, "pubDate") || tagValue(entry, "dc:date") || tagValue(entry, "published") || tagValue(entry, "updated");
      const score = relevanceScore(`${title} ${summary}`, terms);

      return {
        score,
        item: {
          type: "news" as const,
          query_key: queryKey,
          external_id: url || `${feed.name}:${hash(title)}`,
          title,
          summary: truncate(summary || "A fonte não forneceu uma descrição para esta notícia."),
          source: feed.name,
          url,
          published_at: safeDate(published),
          fetched_at: fetchedAt,
          keywords: terms,
          source_metadata: { feed_url: feed.url },
        },
      };
    }).filter(({ item, score }) => item.title && item.url && score > 0);
  }));

  settled.forEach((result) => {
    if (result.status === "rejected") console.error("[ResearchHub] RSS error:", result.reason);
  });

  return settled
    .flatMap((result) => result.status === "fulfilled" ? result.value : [])
    .sort((a, b) => b.score - a.score || (Date.parse(b.item.published_at || "") || 0) - (Date.parse(a.item.published_at || "") || 0))
    .slice(0, MAX_ITEMS_PER_TYPE)
    .map(({ item }) => item);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Método não permitido" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) throw new Error("Supabase server credentials não configuradas");

    const body = await req.json().catch(() => ({}));
    const niche = String(body.niche || "nutrição").slice(0, 120);
    const subNiche = String(body.subNiche || "saúde da mulher").slice(0, 160);
    const forceRefresh = body.forceRefresh === true;
    const terms = buildSearchTerms(niche, subNiche);
    const queryKey = `v1-${hash(terms.map(normalizeTerm).sort().join("|"))}`;
    const db = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

    const cooldown = new Date(Date.now() - MANUAL_REFRESH_COOLDOWN_MINUTES * 60 * 1000).toISOString();
    const freshness = new Date(Date.now() - CACHE_HOURS * 60 * 60 * 1000).toISOString();
    const threshold = forceRefresh ? cooldown : freshness;
    const { data: cached, error: cacheError } = await db
      .from("research_items")
      .select("*")
      .eq("query_key", queryKey)
      .gte("fetched_at", threshold)
      .order("published_at", { ascending: false, nullsFirst: false });

    if (cacheError) console.error("[ResearchHub] Cache read error:", cacheError.message);
    if (cached?.length) {
      return jsonResponse({ items: cached, refreshed: false, queryKey, terms });
    }

    const fetchedAt = new Date().toISOString();
    const [articlesResult, newsResult] = await Promise.allSettled([
      fetchPubMed(terms, queryKey, fetchedAt),
      fetchNews(terms, queryKey, fetchedAt),
    ]);
    const articles = articlesResult.status === "fulfilled" ? articlesResult.value : [];
    const news = newsResult.status === "fulfilled" ? newsResult.value : [];
    if (articlesResult.status === "rejected") console.error("[ResearchHub] PubMed error:", articlesResult.reason);
    if (newsResult.status === "rejected") console.error("[ResearchHub] News error:", newsResult.reason);

    const freshItems = [...articles, ...news];
    if (!freshItems.length) {
      const { data: stale } = await db
        .from("research_items")
        .select("*")
        .eq("query_key", queryKey)
        .order("published_at", { ascending: false, nullsFirst: false });
      if (stale?.length) return jsonResponse({ items: stale, refreshed: false, stale: true, queryKey, terms });
      throw new Error("Nenhuma fonte respondeu. Tente atualizar novamente em alguns minutos.");
    }

    const { error: upsertError } = await db
      .from("research_items")
      .upsert(freshItems, { onConflict: "type,query_key,external_id" });
    if (upsertError) console.error("[ResearchHub] Cache write error:", upsertError.message);

    return jsonResponse({
      items: freshItems.sort((a, b) => (Date.parse(b.published_at || "") || 0) - (Date.parse(a.published_at || "") || 0)),
      refreshed: true,
      queryKey,
      terms,
      partial: articlesResult.status === "rejected" || newsResult.status === "rejected",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    console.error("[ResearchHub]", message);
    return jsonResponse({ error: message }, 500);
  }
});
