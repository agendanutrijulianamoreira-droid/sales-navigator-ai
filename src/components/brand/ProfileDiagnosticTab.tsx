import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ClipboardCheck, ImageIcon, FileText, Target, BarChart3, Save, ThumbsUp, Lightbulb } from "lucide-react";
import { useProfileDiagnostic } from "@/hooks/useProfileDiagnostic";
import { AuditAnswer, EngagementLevel, PositioningStrength } from "@/types/profileDiagnostic";
import { toast } from "sonner";

function AuditRadio({
  name, value, onChange, options,
}: { name: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <RadioGroup value={value} onValueChange={onChange} className="flex flex-wrap gap-4">
      {options.map((opt) => (
        <div key={opt.value} className="flex items-center gap-1.5">
          <RadioGroupItem value={opt.value} id={`${name}-${opt.value}`} />
          <Label htmlFor={`${name}-${opt.value}`} className="text-xs font-medium cursor-pointer">
            {opt.label}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}

const SIM_NAO_PARCIAL = [
  { value: "sim", label: "Sim" },
  { value: "nao", label: "Não" },
  { value: "parcial", label: "Mais ou menos" },
];

export function ProfileDiagnosticTab() {
  const { diagnostic, save } = useProfileDiagnostic();
  const [draft, setDraft] = useState(diagnostic);

  // sincroniza quando o localStorage termina de carregar (primeiro render é vazio)
  useEffect(() => {
    setDraft(diagnostic);
  }, [diagnostic.updatedAt]);

  const handleSave = () => {
    save(draft);
    toast.success("Diagnóstico salvo!");
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/10 bg-primary/5">
        <CardContent className="pt-6 flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-2xl">
            <ClipboardCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Diagnóstico do Perfil</h3>
            <p className="text-xs text-muted-foreground">
              Use este checklist periodicamente para revisar a saúde do seu Instagram.
              {diagnostic.updatedAt && (
                <> Última atualização: {new Date(diagnostic.updatedAt).toLocaleDateString("pt-BR")}.</>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ImageIcon className="h-4 w-4 text-primary" /> Identidade Visual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">A foto de perfil representa bem a marca?</Label>
            <AuditRadio
              name="foto-perfil"
              value={draft.visualIdentity.fotoPerfilRepresenta}
              onChange={(v) => setDraft((d) => ({ ...d, visualIdentity: { ...d.visualIdentity, fotoPerfilRepresenta: v as AuditAnswer } }))}
              options={SIM_NAO_PARCIAL}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Os destaques são estratégicos (categorização clara)?</Label>
            <AuditRadio
              name="destaques-estrategicos"
              value={draft.visualIdentity.destaquesEstrategicos}
              onChange={(v) => setDraft((d) => ({ ...d, visualIdentity: { ...d.visualIdentity, destaquesEstrategicos: v as AuditAnswer } }))}
              options={SIM_NAO_PARCIAL}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">O conteúdo do feed está atualizado e com padrão visual?</Label>
            <AuditRadio
              name="conteudo-atualizado"
              value={draft.visualIdentity.conteudoAtualizado}
              onChange={(v) => setDraft((d) => ({ ...d, visualIdentity: { ...d.visualIdentity, conteudoAtualizado: v as AuditAnswer } }))}
              options={SIM_NAO_PARCIAL}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Observações</Label>
            <Textarea
              rows={2}
              value={draft.visualIdentity.observacoes}
              onChange={(e) => setDraft((d) => ({ ...d, visualIdentity: { ...d.visualIdentity, observacoes: e.target.value } }))}
              placeholder="Ex: capas dos destaques inconsistentes, pouco humanizado..."
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" /> Bio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">A bio é clara e persuasiva?</Label>
            <AuditRadio
              name="bio-clara"
              value={draft.bio.claraEPersuasiva}
              onChange={(v) => setDraft((d) => ({ ...d, bio: { ...d.bio, claraEPersuasiva: v as AuditAnswer } }))}
              options={SIM_NAO_PARCIAL}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">O link da bio está funcional e direciona para onde importa?</Label>
            <AuditRadio
              name="bio-link"
              value={draft.bio.linkFuncional}
              onChange={(v) => setDraft((d) => ({ ...d, bio: { ...d.bio, linkFuncional: v as AuditAnswer } }))}
              options={SIM_NAO_PARCIAL}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Ponto de atenção ou oportunidade identificada</Label>
            <Textarea
              rows={2}
              value={draft.bio.pontoDeAtencao}
              onChange={(e) => setDraft((d) => ({ ...d, bio: { ...d.bio, pontoDeAtencao: e.target.value } }))}
              placeholder="Ex: falta uma chamada para ação clara"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-primary" /> Posicionamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">O que o perfil vende?</Label>
            <Input
              value={draft.posicionamento.oQueVende}
              onChange={(e) => setDraft((d) => ({ ...d, posicionamento: { ...d.posicionamento, oQueVende: e.target.value } }))}
              placeholder="Ex: Consultas e acompanhamento nutricional"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Existe um diferencial claro?</Label>
            <Input
              value={draft.posicionamento.diferencial}
              onChange={(e) => setDraft((d) => ({ ...d, posicionamento: { ...d.posicionamento, diferencial: e.target.value } }))}
              placeholder="Ex: método próprio, linguagem acolhedora"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Fala com um nicho específico?</Label>
            <Input
              value={draft.posicionamento.nichoEspecifico}
              onChange={(e) => setDraft((d) => ({ ...d, posicionamento: { ...d.posicionamento, nichoEspecifico: e.target.value } }))}
              placeholder="Ex: emagrecimento pós-parto"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Classificação do posicionamento</Label>
            <AuditRadio
              name="posicionamento-classificacao"
              value={draft.posicionamento.classificacao}
              onChange={(v) => setDraft((d) => ({ ...d, posicionamento: { ...d.posicionamento, classificacao: v as PositioningStrength } }))}
              options={[
                { value: "forte", label: "Forte" },
                { value: "generico", label: "Genérico" },
                { value: "confuso", label: "Confuso" },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4 text-primary" /> Engajamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Média de curtidas</Label>
              <Input
                value={draft.engajamento.mediaCurtidas}
                onChange={(e) => setDraft((d) => ({ ...d, engajamento: { ...d.engajamento, mediaCurtidas: e.target.value } }))}
                placeholder="Ex: 150"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Média de comentários</Label>
              <Input
                value={draft.engajamento.mediaComentarios}
                onChange={(e) => setDraft((d) => ({ ...d, engajamento: { ...d.engajamento, mediaComentarios: e.target.value } }))}
                placeholder="Ex: 8"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Média de compartilhamentos</Label>
              <Input
                value={draft.engajamento.mediaCompartilhamentos}
                onChange={(e) => setDraft((d) => ({ ...d, engajamento: { ...d.engajamento, mediaCompartilhamentos: e.target.value } }))}
                placeholder="Ex: 5"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Interações nos stories</Label>
            <AuditRadio
              name="engajamento-stories"
              value={draft.engajamento.interacoesStories}
              onChange={(v) => setDraft((d) => ({ ...d, engajamento: { ...d.engajamento, interacoesStories: v as EngagementLevel } }))}
              options={[
                { value: "alto", label: "Alto" },
                { value: "medio", label: "Médio" },
                { value: "baixo", label: "Baixo" },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="text-base">Resumo Final do Diagnóstico</CardTitle>
          <CardDescription className="text-xs">Anote suas conclusões antes de salvar.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1.5"><ThumbsUp className="h-3.5 w-3.5 text-emerald-500" /> Pontos fortes</Label>
            <Textarea
              rows={3}
              value={draft.resumo.pontosFortes}
              onChange={(e) => setDraft((d) => ({ ...d, resumo: { ...d.resumo, pontosFortes: e.target.value } }))}
              placeholder="O que já está funcionando bem..."
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1.5"><Lightbulb className="h-3.5 w-3.5 text-amber-500" /> Oportunidades de melhoria</Label>
            <Textarea
              rows={3}
              value={draft.resumo.oportunidades}
              onChange={(e) => setDraft((d) => ({ ...d, resumo: { ...d.resumo, oportunidades: e.target.value } }))}
              placeholder="O que vale priorizar no próximo mês..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" /> Salvar Diagnóstico
        </Button>
      </div>
    </div>
  );
}
