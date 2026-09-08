export type ResearchItemType = "article" | "news";

export interface ResearchItem {
  id?: string;
  type: ResearchItemType;
  query_key?: string;
  external_id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  published_at: string | null;
  fetched_at?: string;
  keywords?: string[];
  source_metadata?: Record<string, unknown>;
}

export interface ResearchSourceContext {
  type: ResearchItemType;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt?: string | null;
}
