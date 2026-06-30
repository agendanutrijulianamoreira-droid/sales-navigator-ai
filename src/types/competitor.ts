export type CompetitorType = "direto" | "inspiracao";
export type PositioningStrength = "forte" | "generico" | "confuso";

export interface Competitor {
  id: string;
  nome: string;
  handle: string;
  seguidores: string;
  frequencia: string;
  tipo: CompetitorType;
  oQueVende: string;
  diferencial: string;
  classificacao: PositioningStrength | "";
  observacoes: string;
  createdAt: string;
  updatedAt: string;
}

export type CompetitorDraft = Omit<Competitor, "id" | "createdAt" | "updatedAt">;

export const emptyCompetitorDraft = (): CompetitorDraft => ({
  nome: "",
  handle: "",
  seguidores: "",
  frequencia: "",
  tipo: "direto",
  oQueVende: "",
  diferencial: "",
  classificacao: "",
  observacoes: "",
});
