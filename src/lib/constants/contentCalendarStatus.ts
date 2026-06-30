import { PostStatus } from "@/types/contentCalendar";

export interface StatusConfig {
  label: string;
  hex: string;
  dotHex: string;
  bgLight: string;
  textColor: string;
}

export const STATUS_ORDER: PostStatus[] = [
  "ideia",
  "em-producao",
  "revisando",
  "pronto",
  "programado",
  "publicado",
];

export const STATUS_CONFIG: Record<PostStatus, StatusConfig> = {
  ideia: { label: "Ideia", hex: "#AAAAAA", dotHex: "#AAAAAA", bgLight: "#F5F5F5", textColor: "#888888" },
  "em-producao": { label: "Em Produção", hex: "#F59E0B", dotHex: "#F59E0B", bgLight: "#FFF8EC", textColor: "#D97706" },
  revisando: { label: "Revisando", hex: "#F97316", dotHex: "#F97316", bgLight: "#FFF2EF", textColor: "#E05A2B" },
  pronto: { label: "Pronto", hex: "#22C55E", dotHex: "#22C55E", bgLight: "#F0FDF4", textColor: "#16A34A" },
  programado: { label: "Programado", hex: "#3B82F6", dotHex: "#3B82F6", bgLight: "#EFF6FF", textColor: "#2563EB" },
  publicado: { label: "Publicado", hex: "#10B981", dotHex: "#10B981", bgLight: "#ECFDF5", textColor: "#059669" },
};

// Resumo simplificado de 4 estágios usado nos badges do header.
export const HEADER_BADGES: { status: PostStatus; label: string; hex: string }[] = [
  { status: "ideia", label: "Ideia", hex: "#888888" },
  { status: "em-producao", label: "Em Prod.", hex: "#F59E0B" },
  { status: "pronto", label: "Pronto", hex: "#F97316" },
  { status: "publicado", label: "Publicado", hex: "#22C55E" },
];

export function nextStatus(status: PostStatus): PostStatus {
  const idx = STATUS_ORDER.indexOf(status);
  return STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
}

export const SUGGESTED_TAGS = [
  "educativo",
  "depoimento",
  "bastidores",
  "dica-rapida",
  "carrossel-longo",
  "stories",
  "promocao",
  "agenda-aberta",
  "data-comemorativa",
];
