import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight, ArrowLeft, CheckCircle2, Sparkles, Target,
  Package, Clock, DollarSign, Gift, Crown, Loader2, Copy, Save
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface OfferData {
  promessa: string;
  entregaveis: string;
  pilares: string;
  tempo: string;
  ticket: string;
  bonus: string;
  nome: string;
  ladder_stage: string;
  tipo_produto: string;
}

const STEPS = [
  { key: "promessa", title: "Promessa", subtitle: "Qual problema você resolve em 90 dias?", icon: Target, emoji: "🎯" },
  { key: "entregaveis", title: "Entregáveis", subtitle: "O que o paciente recebe concretamente?", icon: Package, emoji: "📦" },
  { key: "pilares", title: "Pilares", subtitle: "3-4 pilares do seu método", icon: Crown, emoji: "👑" },
  { key: "tempo", title: "Tempo", subtitle: "Duração do acompanhamento", icon: Clock, emoji: "⏱️" },
  { key: "ticket", title: "Ticket", subtitle: "Investimento do paciente", icon: DollarSign, emoji: "💰" },
  { key: "bonus", title: "Bônus", subtitle: "O que você entrega a mais?", icon: Gift, emoji: "🎁" },
  { key: "nome", title: "Nome da Oferta", subtitle: "Como vai se chamar?", icon: Sparkles, emoji: "✨" },
];

export function OfferBuilder() {
  const { addProduct } = useProducts();
  const { profile } = useProfile();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [offer, setOffer] = useState<OfferData>({
    promessa: "",
    entregaveis: "",
    pilares: "",
    tempo: "trimestral",
    ticket: "",
    bonus: "",
    nome: "",
    ladder_stage: "core",
    tipo_produto: "consultoria",
  });

  const updateField = (key: keyof OfferData, value: string) => {
    setOffer(prev => ({ ...prev, [key]: value }));
  };

  const progress = Math.round(((currentStep + 1) / STEPS.length) * 100);

  const canAdvance = () => {
    const key = STEPS[currentStep].key as keyof OfferData;
    return (offer[key] || "").trim().length > 0;
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handleSaveProduct = async () => {
    if (!offer.nome || !offer.ticket) {
      toast.error("Preencha pelo menos o nome e o ticket");
      return;
    }
    setIsSaving(true);
    try {
      await addProduct({
        nome: offer.nome,
        ticket: parseFloat(offer.ticket),
        tipo_produto: offer.tipo_produto,
        tipo_cliente: "frustrado",
        descricao: `${offer.promessa}\n\nEntregáveis: ${offer.entregaveis}\nPilares: ${offer.pilares}\nDuração: ${offer.tempo}\nBônus: ${offer.bonus}`,
        ativo: true,
        ordem: 0,
        ladder_stage: offer.ladder_stage,
        promessa: offer.promessa,
        bonus: offer.bonus,
      } as any);
      setIsComplete(true);
      toast.success("Oferta salva no catálogo!");
    } catch (err) {
      toast.error("Erro ao salvar oferta");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyOffer = () => {
    const text = `OFERTA: ${offer.nome}\n\n🎯 PROMESSA\n${offer.promessa}\n\n📦 ENTREGÁVEIS\n${offer.entregaveis}\n\n👑 PILARES DO MÉTODO\n${offer.pilares}\n\n⏱️ DURAÇÃO\n${offer.tempo}\n\n💰 INVESTIMENTO\nR$ ${offer.ticket}\n\n🎁 BÔNUS\n${offer.bonus}`;
    navigator.clipboard.writeText(text);
    toast.success("Oferta copiada!");
  };

  const handleReset = () => {
    setOffer({ promessa: "", entregaveis: "", pilares: "", tempo: "trimestral", ticket: "", bonus: "", nome: "", ladder_stage: "core", tipo_produto: "consultoria" });
    setCurrentStep(0);
    setIsComplete(false);
  };

  // ── Complete View ──
  if (isComplete) {
    return (
      <Card className="border-2 border-emerald-200 bg-emerald-50/30 max-w-3xl mx-auto">
        <CardContent className="p-8 text-center space-y-6">
          <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto" />
          <div>
            <h2 className="text-2xl font-bold">Oferta Criada!</h2>
            <p className="text-muted-foreground mt-1">"{offer.nome}" foi salva no seu catálogo de produtos.</p>
          </div>

          <Card className="text-left">
            <CardContent className="p-6 space-y-3">
              {[
                { label: "Promessa", value: offer.promessa, emoji: "🎯" },
                { label: "Entregáveis", value: offer.entregaveis, emoji: "📦" },
                { label: "Pilares", value: offer.pilares, emoji: "👑" },
                { label: "Duração", value: offer.tempo, emoji: "⏱️" },
                { label: "Ticket", value: `R$ ${offer.ticket}`, emoji: "💰" },
                { label: "Bônus", value: offer.bonus, emoji: "🎁" },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-2">
                  <span className="shrink-0 mt-0.5">{item.emoji}</span>
                  <div>
                    <span className="text-xs font-bold text-muted-foreground uppercase">{item.label}</span>
                    <p className="text-sm">{item.value}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={handleCopyOffer}>
              <Copy className="h-4 w-4 mr-2" /> Copiar Oferta
            </Button>
            <Button onClick={handleReset}>
              <Sparkles className="h-4 w-4 mr-2" /> Criar Nova Oferta
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── Wizard Steps ──
  const step = STEPS[currentStep];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Construtor de Oferta</h2>
        <p className="text-sm text-muted-foreground">
          Monte uma oferta de acompanhamento irresistível em 7 passos. Acompanhamento vende mais que consulta avulsa.
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Passo {currentStep + 1} de {STEPS.length}</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex gap-1">
          {STEPS.map((s, i) => (
            <button
              key={s.key}
              onClick={() => i <= currentStep && setCurrentStep(i)}
              className={cn(
                "flex-1 h-1 rounded-full transition-all",
                i < currentStep ? "bg-emerald-400" : i === currentStep ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      {/* Step Card */}
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{step.emoji}</span>
            <div>
              <CardTitle className="text-lg">{step.title}</CardTitle>
              <CardDescription>{step.subtitle}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {step.key === "promessa" && (
            <>
              <Textarea
                value={offer.promessa}
                onChange={(e) => updateField("promessa", e.target.value)}
                placeholder="Ex: Ajudar mulheres 30-50 anos a emagrecerem de forma sustentável em 90 dias, sem dietas restritivas, com acompanhamento personalizado"
                className="min-h-[120px]"
              />
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                <strong>Dica:</strong> Use o formato "[Quem você atende] + [Problema resolvido] + [Prazo] + [Diferencial]". Quanto mais específico, mais vendedor.
              </div>
            </>
          )}

          {step.key === "entregaveis" && (
            <>
              <Textarea
                value={offer.entregaveis}
                onChange={(e) => updateField("entregaveis", e.target.value)}
                placeholder={"Ex:\n- Consulta inicial detalhada (60min)\n- Plano alimentar individualizado\n- Ajustes semanais conforme evolução\n- Suporte via WhatsApp (seg-sex)\n- Feedbacks proativos semanais\n- Acompanhamento de exames"}
                className="min-h-[150px]"
              />
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
                <strong>Dica:</strong> Liste tudo que o paciente recebe. Quanto mais itens tangíveis, maior o valor percebido. Inclua suporte proativo e feedbacks.
              </div>
            </>
          )}

          {step.key === "pilares" && (
            <>
              <Textarea
                value={offer.pilares}
                onChange={(e) => updateField("pilares", e.target.value)}
                placeholder={"Ex:\n1. Nutrição de Precisão — planos baseados em exames bioquímicos\n2. Equilíbrio Hormonal — alimentação que regula cortisol e insulina\n3. Sustentabilidade — sem restrição, com flexibilidade real\n4. Suporte de Perto — você não fica sozinha no processo"}
                className="min-h-[150px]"
              />
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-800">
                <strong>Dica:</strong> 3-4 pilares é o ideal. Cada pilar deve explicar "como" você resolve, não apenas "o que" faz. Esses pilares viram conteúdo para o Instagram.
              </div>
            </>
          )}

          {step.key === "tempo" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "trimestral", label: "Trimestral", desc: "3 meses — ideal para começar", recommended: true },
                  { value: "semestral", label: "Semestral", desc: "6 meses — melhor adesão" },
                  { value: "anual", label: "Anual", desc: "12 meses — máximo resultado" },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateField("tempo", opt.value)}
                    className={cn(
                      "p-4 rounded-xl border-2 text-center transition-all",
                      offer.tempo === opt.value ? "border-primary bg-primary/5" : "border-muted hover:border-primary/30"
                    )}
                  >
                    <p className="font-bold text-sm">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
                    {opt.recommended && <Badge className="mt-2 text-[9px] bg-primary/10 text-primary border-none">Recomendado</Badge>}
                  </button>
                ))}
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                <strong>Por que acompanhamento?</strong> Planos de acompanhamento geram previsibilidade financeira, melhor adesão do paciente e menos esforço de venda (renovação é mais barata que captação).
              </div>
            </div>
          )}

          {step.key === "ticket" && (
            <div className="space-y-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">R$</span>
                <Input
                  type="number"
                  value={offer.ticket}
                  onChange={(e) => updateField("ticket", e.target.value)}
                  placeholder="1.497"
                  className="pl-12 h-14 text-2xl font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Posição na escada</Label>
                  <Select value={offer.ladder_stage} onValueChange={(v) => updateField("ladder_stage", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entrada">Entrada (R$ 47-197)</SelectItem>
                      <SelectItem value="core">Core (R$ 497-1.997)</SelectItem>
                      <SelectItem value="premium">Premium (R$ 2.000+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Tipo de produto</Label>
                  <Select value={offer.tipo_produto} onValueChange={(v) => updateField("tipo_produto", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultoria">Consultoria</SelectItem>
                      <SelectItem value="mentoria">Mentoria</SelectItem>
                      <SelectItem value="grupo">Grupo</SelectItem>
                      <SelectItem value="curso">Curso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                <strong>Regra de ouro:</strong> O valor percebido deve ser 10x maior que o preço. Se você entrega R$ 15.000 em valor (tempo, expertise, resultado), cobrar R$ 1.500 é justo.
              </div>
            </div>
          )}

          {step.key === "bonus" && (
            <>
              <Textarea
                value={offer.bonus}
                onChange={(e) => updateField("bonus", e.target.value)}
                placeholder={"Ex:\n- E-book '30 Receitas Rápidas para Rotina Corrida'\n- Grupo exclusivo no WhatsApp com outras pacientes\n- 1 consulta bônus de manutenção após o plano\n- Planilha de compras semanal personalizada"}
                className="min-h-[120px]"
              />
              <div className="p-3 bg-pink-50 border border-pink-200 rounded-xl text-xs text-pink-800">
                <strong>Dica:</strong> Bônus devem resolver objeções ("não tenho tempo" → receitas rápidas) ou aumentar o resultado ("grupo de apoio" → adesão).
              </div>
            </>
          )}

          {step.key === "nome" && (
            <>
              <Input
                value={offer.nome}
                onChange={(e) => updateField("nome", e.target.value)}
                placeholder="Ex: Programa Equilíbrio 90 Dias"
                className="h-14 text-lg font-bold"
              />
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl text-xs text-foreground">
                <strong>Sugestões de nome:</strong> Use palavras que transmitam transformação e exclusividade. Exemplos: "Programa [Resultado] [Prazo]", "Método [Nome do Seu Método]", "Jornada [Benefício Principal]".
              </div>
              {offer.nome && (
                <div className="p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl border border-primary/20 text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Preview da oferta</p>
                  <p className="text-xl font-bold text-primary">{offer.nome}</p>
                  <p className="text-sm text-muted-foreground mt-1">R$ {offer.ticket || "___"} — {offer.tempo}</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Anterior
        </Button>

        {currentStep < STEPS.length - 1 ? (
          <Button onClick={handleNext} disabled={!canAdvance()} className="gap-2">
            Próximo <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSaveProduct}
            disabled={isSaving || !offer.nome || !offer.ticket}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar Oferta no Catálogo
          </Button>
        )}
      </div>
    </div>
  );
}
