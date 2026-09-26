import { Images, Clapperboard, Image as ImageIcon, CircleDot, type LucideIcon } from "lucide-react";

export type FormatKey = "carrossel" | "reels" | "post_unico" | "stories";

export const FORMATS: Record<FormatKey, { label: string; icon: LucideIcon; token: string }> = {
  carrossel: { label: "Carrossel", icon: Images, token: "--fmt-carrossel" },
  reels: { label: "Reels", icon: Clapperboard, token: "--fmt-reels" },
  post_unico: { label: "Post", icon: ImageIcon, token: "--fmt-post" },
  stories: { label: "Stories", icon: CircleDot, token: "--fmt-stories" },
};

export const getFormat = (tipo: string) =>
  FORMATS[(tipo === "levantada" ? "stories" : tipo) as FormatKey] ?? FORMATS.post_unico;

export const STATUSES = [
  { value: "rascunho", label: "Rascunho" },
  { value: "producao", label: "Em produção" },
  { value: "publicado", label: "Publicado" },
  { value: "arquivado", label: "Arquivado" },
] as const;

export const statusLabel = (s: string | null) =>
  STATUSES.find((x) => x.value === s)?.label ?? "Rascunho";

export const toISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
