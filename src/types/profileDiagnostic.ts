export type AuditAnswer = "sim" | "nao" | "parcial";
export type EngagementLevel = "alto" | "medio" | "baixo";
export type PositioningStrength = "forte" | "generico" | "confuso";

export interface ProfileDiagnostic {
  visualIdentity: {
    fotoPerfilRepresenta: AuditAnswer | "";
    destaquesEstrategicos: AuditAnswer | "";
    conteudoAtualizado: AuditAnswer | "";
    observacoes: string;
  };
  bio: {
    claraEPersuasiva: AuditAnswer | "";
    linkFuncional: AuditAnswer | "";
    pontoDeAtencao: string;
  };
  posicionamento: {
    oQueVende: string;
    diferencial: string;
    nichoEspecifico: string;
    classificacao: PositioningStrength | "";
  };
  engajamento: {
    mediaCurtidas: string;
    mediaComentarios: string;
    mediaCompartilhamentos: string;
    interacoesStories: EngagementLevel | "";
  };
  resumo: {
    pontosFortes: string;
    oportunidades: string;
  };
  updatedAt: string;
}

export const emptyDiagnostic = (): ProfileDiagnostic => ({
  visualIdentity: { fotoPerfilRepresenta: "", destaquesEstrategicos: "", conteudoAtualizado: "", observacoes: "" },
  bio: { claraEPersuasiva: "", linkFuncional: "", pontoDeAtencao: "" },
  posicionamento: { oQueVende: "", diferencial: "", nichoEspecifico: "", classificacao: "" },
  engajamento: { mediaCurtidas: "", mediaComentarios: "", mediaCompartilhamentos: "", interacoesStories: "" },
  resumo: { pontosFortes: "", oportunidades: "" },
  updatedAt: "",
});
