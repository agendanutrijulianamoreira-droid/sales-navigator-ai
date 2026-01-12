import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight, ArrowLeft, Sparkles, Target, Users, Lightbulb, Package } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const STEPS = [
  { id: 1, title: "Identidade", icon: Sparkles, description: "Quem é você?" },
  { id: 2, title: "Nicho", icon: Target, description: "Seu posicionamento" },
  { id: 3, title: "Público", icon: Users, description: "Quem você atende" },
  { id: 4, title: "Método", icon: Lightbulb, description: "Seu diferencial" },
  { id: 5, title: "Tom de Voz", icon: Package, description: "Como você fala" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useProfile();
  const { toast } = useToast();
  
  const [step, setStep] = useState(profile?.onboarding_step || 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    nome: profile?.nome || "",
    experiencias_marcantes: profile?.experiencias_marcantes || "",
    nicho: profile?.nicho || "",
    sub_nicho: profile?.sub_nicho || "",
    persona_ideal: profile?.persona_ideal || "",
    dor_principal: profile?.dor_principal || "",
    desejo_principal: profile?.desejo_principal || "",
    inimigo_comum: profile?.inimigo_comum || "",
    problema_90_dias: profile?.problema_90_dias || "",
    mecanismo_unico: profile?.mecanismo_unico || "",
    nome_metodo: profile?.nome_metodo || "",
    promessa_principal: profile?.promessa_principal || "",
    tom_voz: profile?.tom_voz || "empático",
    arquetipo: profile?.arquetipo || "",
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    setIsSubmitting(true);
    const { error } = await updateProfile({ ...formData, onboarding_step: step + 1 });
    setIsSubmitting(false);

    if (error) {
      toast({ variant: "destructive", title: "Erro ao salvar", description: error.message });
      return;
    }

    if (step < 5) {
      setStep(step + 1);
    } else {
      await updateProfile({ ...formData, onboarding_completed: true, onboarding_step: 5 });
      toast({ title: "Onboarding concluído!", description: "Bem-vinda ao NutriSales OS" });
      navigate("/");
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const progress = (step / 5) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Configure seu Perfil</h1>
          <p className="text-muted-foreground mt-1">A IA vai usar essas informações para personalizar tudo</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-4">
            {STEPS.map((s) => (
              <div key={s.id} className={`flex flex-col items-center ${step >= s.id ? "text-primary" : "text-muted-foreground"}`}>
                <s.icon className="h-5 w-5" />
                <span className="text-xs mt-1 hidden sm:block">{s.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {STEPS[step - 1].icon && <STEPS[step - 1].icon className="h-5 w-5 text-primary" />}
              {STEPS[step - 1].title}
            </CardTitle>
            <CardDescription>{STEPS[step - 1].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label>Seu nome</Label>
                  <Input value={formData.nome} onChange={(e) => updateField("nome", e.target.value)} placeholder="Como você quer ser chamada?" />
                </div>
                <div className="space-y-2">
                  <Label>Experiências marcantes</Label>
                  <Textarea value={formData.experiencias_marcantes} onChange={(e) => updateField("experiencias_marcantes", e.target.value)} placeholder="O que te levou a ser nutricionista? Alguma história pessoal?" rows={4} />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label>Nicho principal</Label>
                  <Select value={formData.nicho} onValueChange={(v) => updateField("nicho", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emagrecimento">Emagrecimento</SelectItem>
                      <SelectItem value="esportiva">Nutrição Esportiva</SelectItem>
                      <SelectItem value="clinica">Nutrição Clínica</SelectItem>
                      <SelectItem value="materno">Materno-infantil</SelectItem>
                      <SelectItem value="comportamental">Comportamento Alimentar</SelectItem>
                      <SelectItem value="funcional">Nutrição Funcional</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sub-nicho ou especialização</Label>
                  <Input value={formData.sub_nicho} onChange={(e) => updateField("sub_nicho", e.target.value)} placeholder="Ex: Emagrecimento para mulheres 40+" />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="space-y-2">
                  <Label>Quem é seu cliente ideal?</Label>
                  <Textarea value={formData.persona_ideal} onChange={(e) => updateField("persona_ideal", e.target.value)} placeholder="Descreva: idade, profissão, estilo de vida..." rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Qual a maior dor do seu público?</Label>
                  <Textarea value={formData.dor_principal} onChange={(e) => updateField("dor_principal", e.target.value)} placeholder="O que mais incomoda eles?" rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>Qual o maior desejo deles?</Label>
                  <Textarea value={formData.desejo_principal} onChange={(e) => updateField("desejo_principal", e.target.value)} placeholder="O que eles querem alcançar?" rows={2} />
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <div className="space-y-2">
                  <Label>Qual problema você resolve em 90 dias?</Label>
                  <Textarea value={formData.problema_90_dias} onChange={(e) => updateField("problema_90_dias", e.target.value)} placeholder="Resultado concreto que você entrega" rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>Qual seu mecanismo único? (como você resolve)</Label>
                  <Textarea value={formData.mecanismo_unico} onChange={(e) => updateField("mecanismo_unico", e.target.value)} placeholder="Seu diferencial, sua metodologia" rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>Nome do seu método (opcional)</Label>
                  <Input value={formData.nome_metodo} onChange={(e) => updateField("nome_metodo", e.target.value)} placeholder="Ex: Método XYZ, Protocolo ABC" />
                </div>
                <div className="space-y-2">
                  <Label>Sua promessa principal</Label>
                  <Input value={formData.promessa_principal} onChange={(e) => updateField("promessa_principal", e.target.value)} placeholder="Uma frase de impacto" />
                </div>
              </>
            )}

            {step === 5 && (
              <>
                <div className="space-y-2">
                  <Label>Tom de voz</Label>
                  <Select value={formData.tom_voz} onValueChange={(v) => updateField("tom_voz", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="empático">Empático e acolhedor</SelectItem>
                      <SelectItem value="técnico">Técnico e científico</SelectItem>
                      <SelectItem value="descontraído">Descontraído e leve</SelectItem>
                      <SelectItem value="motivador">Motivador e energético</SelectItem>
                      <SelectItem value="direto">Direto e objetivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quem é o "inimigo comum" do seu público?</Label>
                  <Input value={formData.inimigo_comum} onChange={(e) => updateField("inimigo_comum", e.target.value)} placeholder="Ex: Dietas restritivas, industria de ultra-processados" />
                </div>
                <div className="space-y-2">
                  <Label>Arquétipo da marca (opcional)</Label>
                  <Select value={formData.arquetipo} onValueChange={(v) => updateField("arquetipo", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sábio">Sábio (expertise)</SelectItem>
                      <SelectItem value="cuidador">Cuidador (acolhimento)</SelectItem>
                      <SelectItem value="herói">Herói (superação)</SelectItem>
                      <SelectItem value="explorador">Explorador (descoberta)</SelectItem>
                      <SelectItem value="criador">Criador (inovação)</SelectItem>
                      <SelectItem value="mago">Mago (transformação)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleBack} disabled={step === 1 || isSubmitting}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
              </Button>
              <Button onClick={handleNext} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {step === 5 ? "Concluir" : "Próximo"} <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
