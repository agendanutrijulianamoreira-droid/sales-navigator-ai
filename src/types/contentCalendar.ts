export type PostFormat = "carrossel" | "reels" | "estatico" | "story";
export type PostStatus = "ideia" | "em-producao" | "revisando" | "pronto" | "programado" | "publicado";
export type Platform = "instagram" | "tiktok";

export interface ContentCalendarPost {
  id: string;
  title: string;
  description: string;
  format: PostFormat;
  platform: Platform;
  status: PostStatus;
  scheduledDate: string; // ISO date "2026-07-15"
  scheduledTime?: string; // "14:30"
  thumbnailUrl?: string;
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ContentCalendarPostDraft = Omit<ContentCalendarPost, "id" | "createdAt" | "updatedAt">;
