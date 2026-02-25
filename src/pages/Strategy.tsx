import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfile } from "@/hooks/useProfile";
import { useAISpecialist } from "@/hooks/useAISpecialist";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Target, Crown, Sword, Lightbulb, ShieldAlert, BarChart3, BrainCircuit, Trophy } from "lucide-react";
import { StrategyGenerator } from "@/components/strategy/StrategyGenerator";
import { StrategyProfile } from "@/hooks/useStrategyAI";
import { PricingCalculator } from "@/components/business/PricingCalculator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function Strategy() {
  const { profile, updateProfile } = useProfile();
  const { generateContent, isLoading, streamedContent } = useAISpecialist();
  const [activeTab, setActiveTab] = useState("brand");
  const [maestroVerdict, setMaestroVerdict] = useState<string | null>(null);
  const [generatedPromises, setGeneratedPromises] = useState<string[]>([]);
  const [selectedPromise, setSelectedPromise] = useState<string>("");

  const handleGenerateBrand = async () => {
    await generateContent("brand_architect", "posicionamento", {
      nicho: profile?.nicho,
      sub_nicho: profile?.sub_nicho,
      persona: profile?.persona_ideal,
      dor: profile?.dor_principal,
      desejo: profile?.desejo_principal,
    });
  };

  const handleGenerateMethod = async () => {
    await generateContent("brand_architect", "metodo", {
      nome: profile?.nome,
      nicho: profile?.nicho,
      promessa: profile?.promessa_principal,
      mecanismo: profile?.mecanismo_unico,
    });
  };

  const handleAutoFill = (data: StrategyProfile) => {
    updateProfile({
      nicho: data.niche,
      sub_nicho: data.subNiche,
      persona_ideal: data.persona,
      dor_principal: data.mainPain,
      desejo_principal: data.mainDesire,
      objecoes: data.objections.map(o => `• ${o}`).join('\n'),
      tom_voz: data.brandVoice ? data.brandVoice.toLowerCase() : profile?.tom_voz,
      inimigo_comum: data.commonEnemy,
      promessa_principal: data.promises[2] || data.promises[0], // 90-day promise preferred
      mecanismo_unico: "Sua Metodologia de Elite",
      problema_90_dias: data.promises.map(p => `• ${p}`).join('\n')
    });

    if (data.maestroVerdict) {
      setMaestroVerdict(data.maestroVerdict);
    }

    if (data.promises && data.promises.length > 0) {
      setGeneratedPromises(data.promises);
      setSelectedPromise(data.promises[2] || data.promises[0]);
    }
  };

  return (
    <AppLayout title="Estratégia" description="Brand Hub & Business Lab">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="brand">Brand Hub</TabsTrigger>
          <TabsTrigger value="lab">Business Lab</TabsTrigger>
        </TabsList>

        <TabsContent value="brand" className="space-y-6">
          <StrategyGenerator onProfileGenerated={handleAutoFill} />

          {maestroVerdict && (
            <div className="mt-4 p-6 bg-indigo-900 text-white rounded-2xl shadow-xl border-t-4 border-indigo-400 animate-in slide-in-from-top duration-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-indigo-400 p-2 rounded-full animate-pulse">
                  <BrainCircuit className="w-6 h-6 text-indigo-900" />
                </div>
                <div>
                  <h3 className="font-bold text-lg tracking-tight leading-none">O MAESTRO ANALISOU</h3>
                  <p className="text-[10px] text-indigo-300 uppercase tracking-widest font-bold mt-1">Veredito do Mentor Estrategista</p>
                </div>
              </div>

              <p className="text-indigo-100 text-sm leading-relaxed mb-6 italic">
                "{maestroVerdict}"
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button variant="outline" className="bg-transparent border-indigo-400 text-white hover:bg-indigo-800 h-11">
                  Gerar Conteúdo de Objeção
                </Button>
                <Button className="bg-white text-indigo-900 hover:bg-indigo-100 h-11 font-bold">
                  Aplicar ao Funil de Vendas
                </Button>
              </div>
            </div>
          )}

          {generatedPromises.length > 0 && (
            <Card className="border-2 border-yellow-500/20 bg-yellow-500/5 overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  Escolha sua Promessa de Elite
                </CardTitle>
                <CardDescription>O Maestro gerou 3 ângulos de escala. Qual você prefere?</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedPromise}
                  onValueChange={(val) => {
                    setSelectedPromise(val);
                    updateProfile({ promessa_principal: val });
                  }}
                  className="grid gap-3"
                >
                  {generatedPromises.map((promise, index) => (
                    <div key={index} className={`flex items-start space-x-3 p-4 border rounded-xl transition-all cursor-pointer ${selectedPromise === promise ? 'bg-white border-yellow-500 shadow-md ring-1 ring-yellow-500' : 'bg-background hover:bg-muted/50'}`}>
                      <RadioGroupItem value={promise} id={`p-${index}`} className="mt-1" />
                      <Label htmlFor={`p-${index}`} className="leading-relaxed cursor-pointer font-medium text-sm">
                        {promise}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          )}

          {/* Nicho & Persona */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Nicho & Persona
              </CardTitle>
              <CardDescription>Defina seu público-alvo com precisão</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nicho Principal</Label>
                  <Input
                    value={profile?.nicho || ""}
                    onChange={(e) => updateProfile({ nicho: e.target.value })}
                    placeholder="Ex: Emagrecimento Feminino"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sub-nicho</Label>
                  <Input
                    value={profile?.sub_nicho || ""}
                    onChange={(e) => updateProfile({ sub_nicho: e.target.value })}
                    placeholder="Ex: Mães que trabalham fora"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Persona Ideal (Cliente dos Sonhos)</Label>
                <Textarea
                  value={profile?.persona_ideal || ""}
                  onChange={(e) => updateProfile({ persona_ideal: e.target.value })}
                  placeholder="Descreva em detalhes: idade, rotina, frustrações, desejos..."
                  rows={4}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Dor Principal</Label>
                  <Textarea
                    value={profile?.dor_principal || ""}
                    onChange={(e) => updateProfile({ dor_principal: e.target.value })}
                    placeholder="O que mais incomoda sua persona?"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Desejo Principal</Label>
                  <Textarea
                    value={profile?.desejo_principal || ""}
                    onChange={(e) => updateProfile({ desejo_principal: e.target.value })}
                    placeholder="O que ela mais quer conquistar?"
                    rows={2}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4" />
                  Objeções Comuns (O que impede a compra?)
                </Label>
                <Textarea
                  value={profile?.objecoes || ""}
                  onChange={(e) => updateProfile({ objecoes: e.target.value })}
                  placeholder="Quais motivos fariam ela NÃO comprar de você? (Ex: Falta de tempo, medo de dieta restritiva)"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Posicionamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Posicionamento Único
              </CardTitle>
              <CardDescription>Diferencie-se da concorrência</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Promessa Principal</Label>
                <Textarea
                  value={profile?.promessa_principal || ""}
                  onChange={(e) => updateProfile({ promessa_principal: e.target.value })}
                  placeholder="Qual transformação você entrega? (Ex: Emagrecer 10kg em 90 dias sem passar fome)"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Sword className="h-4 w-4" />
                  Inimigo Comum
                </Label>
                <Textarea
                  value={profile?.inimigo_comum || ""}
                  onChange={(e) => updateProfile({ inimigo_comum: e.target.value })}
                  placeholder="O que você combate? (Ex: Dietas restritivas, indústria do efeito sanfona)"
                  rows={2}
                />
              </div>
              <Button onClick={handleGenerateBrand} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Gerar Posicionamento com IA
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lab" className="space-y-6">
          {/* Calculadora de Preços */}
          <PricingCalculator />

          {/* Método */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Seu Método
              </CardTitle>
              <CardDescription>Batize e estruture sua metodologia única</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Método</Label>
                <Input
                  value={profile?.nome_metodo || ""}
                  onChange={(e) => updateProfile({ nome_metodo: e.target.value })}
                  placeholder="Ex: Método Nutri Leve, Protocolo Renascer"
                />
              </div>
              <div className="space-y-2">
                <Label>Mecanismo Único</Label>
                <Textarea
                  value={profile?.mecanismo_unico || ""}
                  onChange={(e) => updateProfile({ mecanismo_unico: e.target.value })}
                  placeholder="O que torna seu método diferente? (Ex: Abordagem hormonal + comportamental)"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Problema que resolve em 90 dias</Label>
                <Textarea
                  value={profile?.problema_90_dias || ""}
                  onChange={(e) => updateProfile({ problema_90_dias: e.target.value })}
                  placeholder="Qual transformação concreta entrega nos primeiros 90 dias?"
                  rows={2}
                />
              </div>
              <Button onClick={handleGenerateMethod} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Refinar Método com IA
              </Button>
            </CardContent>
          </Card>

          {/* Arquétipo */}
          <Card>
            <CardHeader>
              <CardTitle>Tom de Voz & Arquétipo</CardTitle>
              <CardDescription>Como você quer ser percebida?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Arquétipo de Marca</Label>
                <div className="flex flex-wrap gap-2">
                  {["Sábia", "Cuidadora", "Heroína", "Rebelde", "Amiga", "Criadora"].map((arq) => (
                    <Badge
                      key={arq}
                      variant={profile?.arquetipo === arq ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => updateProfile({ arquetipo: arq })}
                    >
                      {arq}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tom de Voz</Label>
                <div className="flex flex-wrap gap-2">
                  {["Empático", "Técnico", "Motivador", "Direto", "Acolhedor", "Inspirador"].map((tom) => (
                    <Badge
                      key={tom}
                      variant={profile?.tom_voz === tom.toLowerCase() ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => updateProfile({ tom_voz: tom.toLowerCase() })}
                    >
                      {tom}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Response */}
      {streamedContent && (
        <Card className="mt-6 border-primary/20">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Sugestão da IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap">{streamedContent}</div>
          </CardContent>
        </Card>
      )}
    </AppLayout>
  );
}
