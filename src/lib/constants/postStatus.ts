// Status adaptado para uso solo de consultório (sem fluxo de aprovação de clientes)
// Chaves mantidas iguais ao banco de dados; apenas rótulos/cores foram adaptados.
export type PostStatusKey =
  | "planejado"
  | "rascunho"
  | "em_aprovacao"
  | "aprovado"
  | "agendado"
  | "publicado";

export interface PostStatusConfig {
  label: string;
  hex: string;
  dot: string;
  text: string;
  bgLight: string;
  border: string;
  badge: string;
}

export const STATUS_CONFIG: Record<PostStatusKey, PostStatusConfig> = {
  planejado: {
    label: "Ideia",
    hex: "#AAAAAA",
    dot: "bg-[#AAAAAA]",
    text: "text-[#888888]",
    bgLight: "bg-[#F5F5F5]",
    border: "border-[#E8E8EC]",
    badge: "bg-[#F5F5F5] text-[#888888]",
  },
  rascunho: {
    label: "Em Produção",
    hex: "#F59E0B",
    dot: "bg-[#F59E0B]",
    text: "text-[#D97706]",
    bgLight: "bg-[#FFF8EC]",
    border: "border-[#FBE3B7]",
    badge: "bg-[#FFF8EC] text-[#D97706]",
  },
  em_aprovacao: {
    label: "Revisando",
    hex: "#F97316",
    dot: "bg-[#F97316]",
    text: "text-[#E05A2B]",
    bgLight: "bg-[#FFF2EF]",
    border: "border-[#FBD2C3]",
    badge: "bg-[#FFF2EF] text-[#E05A2B]",
  },
  aprovado: {
    label: "Pronto",
    hex: "#22C55E",
    dot: "bg-[#22C55E]",
    text: "text-[#16A34A]",
    bgLight: "bg-[#F0FDF4]",
    border: "border-[#BBF7D0]",
    badge: "bg-[#F0FDF4] text-[#16A34A]",
  },
  agendado: {
    label: "Programado",
    hex: "#3B82F6",
    dot: "bg-[#3B82F6]",
    text: "text-[#2563EB]",
    bgLight: "bg-[#EFF6FF]",
    border: "border-[#BFDBFE]",
    badge: "bg-[#EFF6FF] text-[#2563EB]",
  },
  publicado: {
    label: "Publicado",
    hex: "#10B981",
    dot: "bg-[#10B981]",
    text: "text-[#059669]",
    bgLight: "bg-[#ECFDF5]",
    border: "border-[#A7F3D0]",
    badge: "bg-[#ECFDF5] text-[#059669]",
  },
};

export const STATUS_ORDER: PostStatusKey[] = [
  "planejado",
  "rascunho",
  "em_aprovacao",
  "aprovado",
  "agendado",
  "publicado",
];

// Compat: status legados que já existem em registros salvos.
export function normalizeStatus(status: string | null | undefined): PostStatusKey {
  if (status === "criado" || status === "pronto") return "aprovado";
  if (status && (status as PostStatusKey) in STATUS_CONFIG) return status as PostStatusKey;
  return "planejado";
}

export function getStatusConfig(status: string | null | undefined): PostStatusConfig {
  return STATUS_CONFIG[normalizeStatus(status)];
}
