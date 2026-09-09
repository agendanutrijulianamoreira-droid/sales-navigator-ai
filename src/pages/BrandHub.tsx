import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Pencil, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import BrandKit from "@/components/BrandKit";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProfile } from "@/hooks/useProfile";
import { useStrategyAI, type StrategyProfile } from "@/hooks/useStrategyAI";

type StrategyDraft = {
  nicho: string;
  sub_nicho: string;
  persona_ideal: string;
  dor_principal: string;
  desejo_principal: string;
  promessa_principal: string;
  mecanismo_unico: string;
  tom_voz: string;
  objecoes: string;
  inimigo_comum: string;
  nome_metodo: string;
  problema_90_dias: string;
};

const EMPTY_DRAFT: StrategyDraft = {
  nicho: "",
  sub_nicho: "",
  persona_ideal: "",
  dor_principal: "",
  desejo_principal: "",
  promessa_principal: "",
  mecanismo_unico: "",
  tom_voz: "",
  objecoes: "",
  inimigo_comum: "",
  nome_metodo: "",
  problema_90_dias: "",
};

function getDraftFromProfile(profile: ReturnType<typeof useProfile>["profile"]): StrategyDraft {
  if (!profile) return EMPTY_DRAFT;
  return {
    nicho: profile.nicho || "",
    sub_nicho: profile.sub_nicho || "",
    persona_ideal: profile.persona_ideal || "",
    dor_principal: profile.dor_principal || "",
    desejo_principal: profile.desejo_principal || "",
    promessa_principal: profile.promessa_principal || "",
    mecanismo_unico: profile.mecanismo_unico || "",
    tom_voz: profile.tom_voz || "",
    objecoes: profile.objecoes || "",
    inimigo_comum: profile.inimigo_comum || "",
    nome_metodo: profile.nome_metodo || "",
    problema_90_dias: profile.problema_90_dias || "",
  };
}

function getGeneratedProfileDraft(data: StrategyProfile, fallback: StrategyDraft): StrategyDraft {
  const persona = data.persona || (data.personaProfile
    ? `${data.personaProfile.name} (${data.personaProfile.age})\n${data.personaProfile.routineConflict}`
    : fallback.persona_ideal);

  return {
    ...fallback,
    nicho: data.niche || fallback.nicho,
    sub_nicho: data.subNiche || fallback.sub_nicho,
    persona_ideal: persona,
    dor_principal: data.mainPain || data.personaProfile?.soulPain || fallback.dor_principal,
    desejo_principal: data.mainDesire || data.mainPromise90D || fallback.desejo_principal,
    promessa_principal: data.mainPromise90D || data.promises?.[0] || fallback.promessa_principal,
    mecanismo_unico: data.uniqueMechanism || fallback.mecanismo_unico,
    tom_voz: data.brandVoice?.toLowerCase() || fallback.tom_voz,
    objecoes: (data.objections || data.eliteObjections || []).map((item) => `• ${item}`).join("\n") || fallback.objecoes,
    inimigo_comum: data.commonEnemy || fallback.inimigo_comum,
    problema_90_dias: data.mainPromise90D ? `Resultado em 90 dias: ${data.mainPromise90D}` : fallback.problema_90_dias,
  };
}

function SummaryRow({ label, value, emptyText }: { label: string; value?: string | null; emptyText: string }) {
  return (
    <div className="grid gap-1 border-b border-border px-5 py-4 last:border-b-0 sm:grid-cols-[140px_1fr] sm:gap-5 md:px-6">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className={value ? "line-clamp-2 text-sm leading-6 text-foreground" : "text-sm italic text-muted-foreground/70"}>
        {value || emptyText}
      </p>
    </div>
  );
}

export default function BrandHub() {
  const { profile, loading, error: profileError, updateProfile } = useProfile();
  const { generateProfile, isGenerating } = useStrategyAI();
  const [draft, setDraft] = useState<StrategyDraft>(EMPTY_DRAFT);
  const [editOpen, setEditOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [specialty, setSpecialty] = useState("");
  const [audience, setAudience] = useState("");
  const [result, setResult] = useState("");

  useEffect(() => {
    setDraft(getDraftFromProfile(profile));
    setSpecialty((current) => current || profile?.nicho || "");
    setAudience((current) => current || profile?.persona_ideal || "");
    setResult((current) => current || profile?.promessa_principal || profile?.desejo_principal || "");
  }, [profile]);

  const completion = useMemo(() => {
    if (!profile) return { completed: 0, total: 7, percentage: 0 };
    const essential = [
      profile.nicho,
      profile.persona_ideal,
      profile.dor_principal,
      profile.desejo_principal,
      profile.promessa_principal,
      profile.mecanismo_unico,
      profile.tom_voz,
    ];
    const completed = essential.filter(Boolean).length;
    return { completed, total: essential.length, percentage: Math.round((completed / essential.length) * 100) };
  }, [profile]);

  const updateDraft = (field: keyof StrategyDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await updateProfile(draft);
    setIsSaving(false);

    if (error) {
      toast.error("Não foi possível salvar sua marca.");
      return;
    }

    toast.success("Estratégia da marca salva.");
    setEditOpen(false);
  };

  const handleGenerate = async () => {
    if (!specialty.trim() || !audience.trim() || !result.trim()) {
      toast.error("Preencha as três respostas para a IA criar sua estratégia.");
      return;
    }

    const generated = await generateProfile(
      `Especialidade: ${specialty.trim()}\nPúblico que quero atender: ${audience.trim()}\nResultado que entrego: ${result.trim()}`,
    );
    if (!generated) return;

    const generatedDraft = getGeneratedProfileDraft(generated, draft);
    const { error } = await updateProfile(generatedDraft);
    if (error) {
      toast.error("A estratégia foi gerada, mas não foi possível salvá-la.");
      return;
    }

    setDraft(generatedDraft);
    setAiOpen(false);
  };

  if (loading) {
    return (
      <AppLayout title="Central da Marca">
        <div className="flex min-h-64 items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando sua marca...
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Central da Marca">
      <div className="mx-auto max-w-4xl space-y-7 pb-8">
        <section className="flex flex-col justify-between gap-5 border-b border-border pb-6 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="rounded-md border-primary/20 bg-primary/5 text-primary">
                {completion.completed} de {completion.total} itens prontos
              </Badge>
              {completion.completed === completion.total && (
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" /> Pronta para orientar a IA
                </span>
              )}
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Seu guia de marca</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Estas informações orientam os títulos, textos e estratégias criados no sistema.
            </p>
            <div className="mt-4 h-1.5 max-w-sm overflow-hidden rounded-full bg-muted" aria-label={`${completion.percentage}% concluído`}>
              <div className="h-full bg-primary transition-[width]" style={{ width: `${completion.percentage}%` }} />
            </div>
          </div>

          <Button className="h-11 shrink-0 gap-2 rounded-xl px-5" onClick={() => setAiOpen(true)}>
            <Sparkles className="h-4 w-4" />
            {completion.completed > 0 ? "Atualizar com IA" : "Criar com IA"}
          </Button>
        </section>

        {profileError ? (
          <div className="border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">
            Não foi possível carregar sua marca. Atualize a página para tentar novamente.
          </div>
        ) : (
          <section className="overflow-hidden border border-border bg-card" aria-labelledby="brand-summary-title">
            <div className="flex items-center justify-between border-b border-border px-5 py-4 md:px-6">
              <h3 id="brand-summary-title" className="font-semibold text-foreground">Estratégia em uso</h3>
              <Button variant="ghost" size="sm" className="gap-2" onClick={() => setEditOpen(true)}>
                <Pencil className="h-3.5 w-3.5" /> Editar estratégia
              </Button>
            </div>
            <SummaryRow label="Para quem" value={profile?.persona_ideal} emptyText="Defina o público que você quer atender" />
            <SummaryRow label="Problema" value={profile?.dor_principal} emptyText="Defina o principal problema desse público" />
            <SummaryRow label="Resultado" value={profile?.promessa_principal || profile?.desejo_principal} emptyText="Defina o resultado que você entrega" />
            <SummaryRow label="Diferencial" value={profile?.mecanismo_unico} emptyText="Defina o que torna seu método diferente" />
            <SummaryRow label="Voz" value={profile?.tom_voz} emptyText="Defina como sua marca deve se comunicar" />
          </section>
        )}

        <BrandKit profile={profile} updateProfile={updateProfile} />
      </div>

      <Dialog open={aiOpen} onOpenChange={setAiOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Criar estratégia com IA</DialogTitle>
            <DialogDescription>Responda três perguntas. A IA completa o restante e salva no seu guia de marca.</DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label htmlFor="brand-specialty">Qual é sua especialidade?</Label>
              <Input
                id="brand-specialty"
                value={specialty}
                onChange={(event) => setSpecialty(event.target.value)}
                placeholder="Ex.: Nutrição para mulheres na menopausa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand-audience">Quem você quer atender?</Label>
              <Textarea
                id="brand-audience"
                value={audience}
                onChange={(event) => setAudience(event.target.value)}
                placeholder="Ex.: Mulheres de 40 a 55 anos, com rotina corrida..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand-result">Qual resultado você entrega?</Label>
              <Textarea
                id="brand-result"
                value={result}
                onChange={(event) => setResult(event.target.value)}
                placeholder="Ex.: Recuperar energia e emagrecer sem dietas restritivas"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAiOpen(false)} disabled={isGenerating}>Cancelar</Button>
            <Button onClick={handleGenerate} disabled={isGenerating} className="gap-2">
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {isGenerating ? "Criando estratégia..." : "Criar e salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Editar estratégia</DialogTitle>
            <DialogDescription>Faça os ajustes e salve tudo de uma vez.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-2 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="brand-niche">Especialidade</Label>
              <Input id="brand-niche" value={draft.nicho} onChange={(event) => updateDraft("nicho", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand-sub-niche">Recorte do público</Label>
              <Input id="brand-sub-niche" value={draft.sub_nicho} onChange={(event) => updateDraft("sub_nicho", event.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="brand-persona">Para quem</Label>
              <Textarea id="brand-persona" value={draft.persona_ideal} onChange={(event) => updateDraft("persona_ideal", event.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand-pain">Principal problema</Label>
              <Textarea id="brand-pain" value={draft.dor_principal} onChange={(event) => updateDraft("dor_principal", event.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand-desire">Principal desejo</Label>
              <Textarea id="brand-desire" value={draft.desejo_principal} onChange={(event) => updateDraft("desejo_principal", event.target.value)} rows={3} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="brand-promise">Resultado prometido</Label>
              <Textarea id="brand-promise" value={draft.promessa_principal} onChange={(event) => updateDraft("promessa_principal", event.target.value)} rows={2} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="brand-mechanism">Seu diferencial</Label>
              <Textarea id="brand-mechanism" value={draft.mecanismo_unico} onChange={(event) => updateDraft("mecanismo_unico", event.target.value)} rows={3} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="brand-voice">Tom de voz</Label>
              <Input id="brand-voice" value={draft.tom_voz} onChange={(event) => updateDraft("tom_voz", event.target.value)} placeholder="Ex.: acolhedor, direto e baseado em ciência" />
            </div>
          </div>

          <Accordion type="single" collapsible className="border-y border-border">
            <AccordionItem value="advanced" className="border-0">
              <AccordionTrigger className="hover:no-underline">Ajustes avançados</AccordionTrigger>
              <AccordionContent className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="brand-method-name">Nome do método</Label>
                  <Input id="brand-method-name" value={draft.nome_metodo} onChange={(event) => updateDraft("nome_metodo", event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand-enemy">Inimigo comum</Label>
                  <Input id="brand-enemy" value={draft.inimigo_comum} onChange={(event) => updateDraft("inimigo_comum", event.target.value)} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="brand-objections">Objeções do público</Label>
                  <Textarea id="brand-objections" value={draft.objecoes} onChange={(event) => updateDraft("objecoes", event.target.value)} rows={4} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="brand-90-days">Resultado em 90 dias</Label>
                  <Textarea id="brand-90-days" value={draft.problema_90_dias} onChange={(event) => updateDraft("problema_90_dias", event.target.value)} rows={2} />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={isSaving}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSaving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
