import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useProfile } from "@/hooks/useProfile";
import { HighTicketProposal } from "@/components/business/HighTicketProposal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAISpecialist } from "@/hooks/useAISpecialist";
import { useGenerations } from "@/hooks/useGenerations";
import { useProducts } from "@/hooks/useProducts";
import { useCredits } from "@/hooks/useCredits";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, MessageSquare, Users, Copy, Check, Crown, Zap, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MESSAGE_TYPES = [
  { value: "levantada_mao", label: "Levantada de Mão", description: "Descubra quem tem interesse" },
  { value: "caixinha_3x1", label: "Caixinha 3x1", description: "3 valores + 1 link" },
  { value: "empurraozinho", label: "Empurrãozinho", description: "Ative leads mornos" },
  { value: "boas_vindas", label: "Boas-vindas VIP", description: "Primeiro contato especial" },
  { value: "sequencia_vendas", label: "Sequência de Vendas", description: "Funil completo por DM" },
  { value: "objecao", label: "Quebra de Objeção", description: "Responda dúvidas comuns" },
];

const SCRIPT_CARDS = [
  {
    key: "qualificacao",
    title: "Script de Qualificação",
    desc: "Identifique leads qualificados",
    subtipo: "script_cedo_conectar",
  },
  {
    key: "apresentacao",
    title: "Script de Apresentação",
    desc: "Apresente sua oferta com elegância",
    subtipo: "script_apresentacao",
  },
  {
    key: "fechamento",
    title: "Script de Fechamento",
    desc: "Conduza para a decisão",
    subtipo: "script_fechamento",
  },
] as const;

type ScriptKey = (typeof SCRIPT_CARDS)[number]["key"];

export default function Conversion() {
  const { profile } = useProfile();
  const { consumeCredit } = useCredits();
  const { generateContent, isLoading, streamedContent } = useAISpecialist();
  const { saveGeneration } = useGenerations();
  const { products } = useProducts();
  const [activeTab, setActiveTab] = useState("roteiros");
  const [messageType, setMessageType] = useState("levantada_mao");
  const [context, setContext] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [copied, setCopied] = useState(false);

  // Sales Closer — Objection breaking
  const [objection, setObjection] = useState("");
  const [objectionResult, setObjectionResult] = useState("");
  const [isBreaking, setIsBreaking] = useState(false);

  // Scripts tab — each card has its own output + loading state
  const [scriptOutputs, setScriptOutputs] = useState<Record<ScriptKey, string>>({
    qualificacao: "",
    apresentacao: "",
    fechamento: "",
  });
  const [scriptLoading, setScriptLoading] = useState<Record<ScriptKey, boolean>>({
    qualificacao: false,
    apresentacao: false,
    fechamento: false,
  });
  const [scriptCopied, setScriptCopied] = useState<Record<ScriptKey, boolean>>({
    qualificacao: false,
    apresentacao: false,
    fechamento: false,
  });

  const handleGenerateScript = async (card: (typeof SCRIPT_CARDS)[number]) => {
    const product = products?.find(p => p.id === selectedProduct);

    const hasCredits = await consumeCredit(1);
    if (!hasCredits) return;

    setScriptLoading(prev => ({ ...prev, [card.key]: true }));
    setScriptOutputs(prev => ({ ...prev, [card.key]: "" }));

    try {
      const typeMap: Record<string, string> = {
        qualificacao: "qualification_script",
        apresentacao: "presentation_script",
        fechamento: "closing_script",
      };

      const { data, error } = await supabase.functions.invoke("generate-sales-closer", {
        body: {
          type: typeMap[card.key],
          data: {
            product: product ? { nome: product.nome, ticket: product.ticket } : null,
          },
          profile
        }
      });

      if (error) throw error;

      setScriptOutputs(prev => ({ ...prev, [card.key]: data.response || "" }));
      toast.success("Script gerado!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar script");
    } finally {
      setScriptLoading(prev => ({ ...prev, [card.key]: false }));
    }
  };

  const handleCopyScript = (key: ScriptKey) => {
    const text = scriptOutputs[key];
    if (!text) return;
    navigator.clipboard.writeText(text);
    setScriptCopied(prev => ({ ...prev, [key]: true }));
    toast.success("Copiado!");
    setTimeout(() => setScriptCopied(prev => ({ ...prev, [key]: false })), 2000);
  };

  const handleGenerate = async () => {
    const product = products?.find(p => p.id === selectedProduct);

    await generateContent("vip_closer", messageType, {
      tipo: messageType,
      contexto: context,
      produto: product ? { nome: product.nome, ticket: product.ticket } : null,
    });
  };

  const handleCopy = () => {
    if (streamedContent) {
      navigator.clipboard.writeText(streamedContent);
      setCopied(true);
      toast.success("Copiado!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = async () => {
    if (streamedContent) {
      await saveGeneration({
        tipo: "mensagem_vip",
        subtipo: messageType,
        specialist: "vip_closer",
        output_content: streamedContent,
        titulo: MESSAGE_TYPES.find(t => t.value === messageType)?.label || messageType,
        input_data: { context, selectedProduct },
        favorito: false,
        tags: [],
      });
      toast.success("Salvo com sucesso!");
    }
  };

  const handleBreakObjection = async () => {
    if (!objection.trim()) return;
    setIsBreaking(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-sales-closer", {
        body: {
          type: "breaking_objection",
          data: { objection },
          profile: profile
        }
      });
      if (error) throw error;
      setObjectionResult(data.response || "");
      toast.success("Argumento gerado!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar quebra de objeção");
    } finally {
      setIsBreaking(false);
    }
  };

  return (
    <AppLayout title="Acelerador de Vendas" description="Scripts de Elite & Propostas High Ticket">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="roteiros">Roteiros Prontos</TabsTrigger>
          <TabsTrigger value="vip">Lista VIP</TabsTrigger>
          <TabsTrigger value="scripts">Scripts IA</TabsTrigger>
          <TabsTrigger value="proposals">Propostas Elite</TabsTrigger>
        </TabsList>

        {/* Roteiros Prontos (Operação 26) */}
        <TabsContent value="roteiros" className="space-y-6">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold">Roteiros de Vendas Prontos</h2>
            <p className="text-sm text-muted-foreground">Scripts testados e validados. Copie, personalize e use.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Script 1: Roteiro de Vendas Completo */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-primary/10 text-primary border-none text-[10px]">Alta Conversão</Badge>
                </div>
                <CardTitle className="text-lg">Roteiro de Primeiro Contato</CardTitle>
                <CardDescription>Use no WhatsApp quando o lead entrar em contato</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-muted/50 rounded-xl">
                    <p className="text-[10px] font-bold uppercase text-primary mb-1">1. Saudação</p>
                    <p className="text-sm text-foreground">"Olá [Nome], tudo bem? Que bom que você entrou em contato! Sou a [Seu Nome] e estou aqui para te ajudar a alcançar seus objetivos na nutrição."</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-xl">
                    <p className="text-[10px] font-bold uppercase text-amber-600 mb-1">2. Situação (Identificar dores)</p>
                    <p className="text-sm text-foreground">"Para eu entender melhor como posso te ajudar, me conta um pouco: qual o seu principal objetivo hoje? Você já tentou algum acompanhamento antes? O que mais te trava hoje na alimentação?"</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-xl">
                    <p className="text-[10px] font-bold uppercase text-blue-600 mb-1">3. Identificação (Autoridade)</p>
                    <p className="text-sm text-foreground">"Entendo perfeitamente, [Nome]. Muitos pacientes chegam até mim com essa mesma dificuldade. Isso acontece porque [explicação técnica rápida e simples]."</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-xl">
                    <p className="text-[10px] font-bold uppercase text-emerald-600 mb-1">4. Solução (O Método)</p>
                    <p className="text-sm text-foreground">"No meu método, a gente não foca apenas em 'passar uma dieta'. Trabalhamos com [seus pilares]. O objetivo é que você não se sinta sozinha no processo."</p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                    <p className="text-[10px] font-bold uppercase text-primary mb-1">5. Oferta</p>
                    <p className="text-sm text-foreground">"Para o seu caso, recomendo o Plano de Acompanhamento [Trimestral/Semestral]. Inclui: consulta inicial detalhada, ajustes semanais, suporte via WhatsApp e [benefícios]. O investimento é de R$ [valor]."</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const script = `ROTEIRO DE PRIMEIRO CONTATO\n\n1. SAUDAÇÃO\n"Olá [Nome], tudo bem? Que bom que você entrou em contato! Sou a [Seu Nome] e estou aqui para te ajudar a alcançar seus objetivos na nutrição."\n\n2. SITUAÇÃO\n"Para eu entender melhor como posso te ajudar, me conta um pouco: qual o seu principal objetivo hoje? Você já tentou algum acompanhamento antes? O que mais te trava hoje na alimentação?"\n\n3. IDENTIFICAÇÃO\n"Entendo perfeitamente, [Nome]. Muitos pacientes chegam até mim com essa mesma dificuldade. Isso acontece porque [explicação técnica]."\n\n4. SOLUÇÃO\n"No meu método, a gente não foca apenas em 'passar uma dieta'. Trabalhamos com [seus pilares]. O objetivo é que você não se sinta sozinha no processo."\n\n5. OFERTA\n"Para o seu caso, recomendo o Plano de Acompanhamento [Trimestral/Semestral]. Inclui: consulta detalhada, ajustes semanais, suporte WhatsApp e [benefícios]. Investimento: R$ [valor]."`;
                    navigator.clipboard.writeText(script);
                    toast.success("Roteiro copiado!");
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" /> Copiar Roteiro Completo
                </Button>
              </CardContent>
            </Card>

            {/* Script 2: Pós-Consulta */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-[10px]">Retenção</Badge>
                </div>
                <CardTitle className="text-lg">Mensagens de Suporte</CardTitle>
                <CardDescription>Use após consultas e durante o acompanhamento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-muted/50 rounded-xl">
                    <p className="text-[10px] font-bold uppercase text-emerald-600 mb-1">Pós-Consulta (imediata)</p>
                    <p className="text-sm text-foreground">"Olá [Nome]! Foi um prazer te atender hoje. Já estou finalizando seu plano alimentar e em breve te envio aqui. Lembre-se: o segredo está na constância, não na perfeição. Vamos juntas!"</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-xl">
                    <p className="text-[10px] font-bold uppercase text-blue-600 mb-1">Primeiro Feedback (3-7 dias)</p>
                    <p className="text-sm text-foreground">"Oi [Nome], como foi sua primeira semana? Conseguiu fazer as compras e iniciar a rotina? Teve alguma dificuldade com as substituições que combinamos?"</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-xl">
                    <p className="text-[10px] font-bold uppercase text-amber-600 mb-1">Demanda Complexa (gestão de tempo)</p>
                    <p className="text-sm text-foreground">"Bom dia, [Nome]! Que bom que trouxe essa dúvida! Como é uma alteração mais técnica, eu reservo as quintas-feiras para ajustes finos. Na quinta já te mando o plano atualizado, ok?"</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const msgs = `MENSAGENS DE SUPORTE\n\nPÓS-CONSULTA (imediata):\n"Olá [Nome]! Foi um prazer te atender hoje. Já estou finalizando seu plano alimentar e em breve te envio aqui. Lembre-se: o segredo está na constância, não na perfeição. Vamos juntas!"\n\nPRIMEIRO FEEDBACK (3-7 dias):\n"Oi [Nome], como foi sua primeira semana? Conseguiu fazer as compras e iniciar a rotina? Teve alguma dificuldade com as substituições que combinamos?"\n\nDEMANDA COMPLEXA:\n"Bom dia, [Nome]! Que bom que trouxe essa dúvida! Como é uma alteração mais técnica, eu reservo as quintas-feiras para ajustes finos. Na quinta já te mando o plano atualizado, ok?"`;
                    navigator.clipboard.writeText(msgs);
                    toast.success("Mensagens copiadas!");
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" /> Copiar Todas as Mensagens
                </Button>
              </CardContent>
            </Card>

            {/* Script 3: Recuperação de Leads */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-600">Recuperação</Badge>
                </div>
                <CardTitle className="text-lg">Recuperação de Leads</CardTitle>
                <CardDescription>Reaborde contatos que não fecharam</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-muted/50 rounded-xl">
                    <p className="text-[10px] font-bold uppercase text-amber-600 mb-1">Abordagem Direta (3-7 dias depois)</p>
                    <p className="text-sm text-foreground">"Oi [Nome], tudo bem? Estive pensando no que conversamos sobre [citar a dor]. Queria saber se conseguiu resolver ou se ainda precisa de ajuda com isso. Tenho uma condição especial essa semana que pode te ajudar."</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-xl">
                    <p className="text-[10px] font-bold uppercase text-purple-600 mb-1">Empurrãozinho (lead morno)</p>
                    <p className="text-sm text-foreground">"[Nome], vi que uma paciente com situação muito parecida com a sua acabou de completar 30 dias de acompanhamento e já [resultado]. Se quiser conversar sobre como podemos fazer o mesmo por você, estou aqui!"</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const recovery = `RECUPERAÇÃO DE LEADS\n\nABORDAGEM DIRETA (3-7 dias):\n"Oi [Nome], tudo bem? Estive pensando no que conversamos sobre [citar a dor]. Queria saber se conseguiu resolver ou se ainda precisa de ajuda com isso. Tenho uma condição especial essa semana que pode te ajudar."\n\nEMPURRÃOZINHO:\n"[Nome], vi que uma paciente com situação parecida acabou de completar 30 dias e já [resultado]. Se quiser conversar sobre como podemos fazer o mesmo por você, estou aqui!"`;
                    navigator.clipboard.writeText(recovery);
                    toast.success("Scripts copiados!");
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" /> Copiar Scripts
                </Button>
              </CardContent>
            </Card>

            {/* Script 4: Levantada de Mão Stories */}
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50/50 to-transparent">
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-purple-100 text-purple-600 border-none text-[10px]">Stories</Badge>
                </div>
                <CardTitle className="text-lg">Levantada de Mão (Stories)</CardTitle>
                <CardDescription>Sequência de 4 stories para gerar leads</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                    <p className="text-[10px] font-bold uppercase text-purple-600 mb-1">Story 1 — Prova Social</p>
                    <p className="text-sm text-foreground">Foto de resultado real (antes/depois ou depoimento de paciente)</p>
                  </div>
                  <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                    <p className="text-[10px] font-bold uppercase text-purple-600 mb-1">Story 2 — Método</p>
                    <p className="text-sm text-foreground">"Esse resultado não veio do acaso. Trabalhamos em 3 pilares: [Pilar 1], [Pilar 2] e [Pilar 3]."</p>
                  </div>
                  <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                    <p className="text-[10px] font-bold uppercase text-purple-600 mb-1">Story 3 — Desejo</p>
                    <p className="text-sm text-foreground">"Você gostaria de passar por uma transformação que mudasse sua vida e autoestima dessa forma?"</p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                    <p className="text-[10px] font-bold uppercase text-primary mb-1">Story 4 — CTA</p>
                    <p className="text-sm text-foreground">Enquete ou CTA: "Comenta 'EU QUERO' ou clica no link da bio para conversarmos."</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const stories = `LEVANTADA DE MÃO — STORIES\n\nSTORY 1: Foto de resultado real (antes/depois ou depoimento)\n\nSTORY 2: "Esse resultado não veio do acaso. Trabalhamos em 3 pilares: [Pilar 1], [Pilar 2] e [Pilar 3]."\n\nSTORY 3: "Você gostaria de passar por uma transformação que mudasse sua vida e autoestima dessa forma?"\n\nSTORY 4: Enquete ou CTA: "Comenta 'EU QUERO' ou clica no link da bio para conversarmos."`;
                    navigator.clipboard.writeText(stories);
                    toast.success("Sequência copiada!");
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" /> Copiar Sequência
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vip" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-primary" />
                    Gerar Mensagem VIP
                  </CardTitle>
                  <CardDescription>Mensagens que nutrem e convertem</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Message Type */}
                  <div className="space-y-2">
                    <Label>Tipo de Mensagem</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {MESSAGE_TYPES.map((type) => (
                        <div
                          key={type.value}
                          onClick={() => setMessageType(type.value)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${messageType === type.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                            }`}
                        >
                          <span className="font-medium text-sm">{type.label}</span>
                          <p className="text-xs text-muted-foreground">{type.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Product Selection */}
                  {products && products.length > 0 && (
                    <div className="space-y-2">
                      <Label>Produto para Oferta (opcional)</Label>
                      <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um produto" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.nome} - R$ {product.ticket.toLocaleString("pt-BR")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Context */}
                  <div className="space-y-2">
                    <Label>Contexto / Situação</Label>
                    <Textarea
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder="Descreva a situação (Ex: Lead que viu os stories mas não respondeu)"
                      rows={3}
                    />
                  </div>

                  <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    Gerar Mensagem
                  </Button>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Dica do VIP Closer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    A regra de ouro: <strong>3 mensagens de valor</strong> para cada <strong>1 de oferta</strong>.
                    Nutrir primeiro, colher depois. Sua lista VIP é um jardim, não uma máquina de vendas.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Output */}
            <Card className="h-fit">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    Mensagem Gerada
                  </CardTitle>
                  {streamedContent && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleCopy}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleSave}>
                        Salvar
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {streamedContent ? (
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">
                    {streamedContent}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>Sua mensagem aparecerá aqui</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scripts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scripts de Vendas por DM</CardTitle>
              <CardDescription>Sequências completas para converter leads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                {SCRIPT_CARDS.map((card) => (
                  <div key={card.key} className="flex flex-col gap-3">
                    <Card className="hover:border-primary/30 transition-colors">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{card.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">{card.desc}</p>
                        <Button
                          size="sm"
                          className="mt-4 w-full"
                          variant="outline"
                          disabled={scriptLoading[card.key]}
                          onClick={() => handleGenerateScript(card)}
                        >
                          {scriptLoading[card.key] ? (
                            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                          ) : (
                            <Sparkles className="h-3 w-3 mr-2" />
                          )}
                          {scriptLoading[card.key] ? "Gerando..." : "Gerar"}
                        </Button>
                      </CardContent>
                    </Card>

                    {scriptOutputs[card.key] && (
                      <Card className="border-primary/20 bg-primary/5 animate-in fade-in slide-in-from-top-2">
                        <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                            Script Sugerido
                          </p>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-xs gap-1.5 hover:bg-primary/10"
                            onClick={() => handleCopyScript(card.key)}
                          >
                            {scriptCopied[card.key] ? (
                              <><Check className="h-3.5 w-3.5 text-green-500" /> Copiado</>
                            ) : (
                              <><Copy className="h-3.5 w-3.5" /> Copiar</>
                            )}
                          </Button>
                        </CardHeader>
                        <CardContent className="pt-0 pb-4">
                          <p className="text-sm text-foreground whitespace-pre-line leading-relaxed italic">
                            {scriptOutputs[card.key]}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="proposals" className="space-y-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <HighTicketProposal />
            </div>

            <div className="space-y-6">
              <Card className="glass-card border-amber-500/20 bg-amber-500/5">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-amber-500" />
                    Quebra de Objeções (IA Closer)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs">O que o cliente disse?</Label>
                    <Textarea
                      placeholder="Ex: Está caro, vou pensar, preciso falar com meu marido..."
                      value={objection}
                      onChange={(e) => setObjection(e.target.value)}
                      className="text-sm h-24"
                    />
                  </div>
                  <Button
                    onClick={handleBreakObjection}
                    disabled={isBreaking || !objection}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    {isBreaking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                    Gerar Contra-Argumento
                  </Button>

                  {objectionResult && (
                    <div className="mt-4 p-4 rounded-xl bg-white/10 border border-white/20 animate-in fade-in slide-in-from-top-2">
                      <p className="text-xs font-bold uppercase text-amber-500 mb-2">Sugestão de Resposta:</p>
                      <p className="text-sm italic leading-relaxed">"{objectionResult}"</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-3 w-full h-8 text-xs underline"
                        onClick={() => {
                          navigator.clipboard.writeText(objectionResult);
                          toast.success("Copiado!");
                        }}
                      >
                        Copiar para o WhatsApp
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Fechamento High Ticket</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Lembre-se: Em vendas de alto valor, você não vende "tempo", você vende **velocidade e segurança**.
                    Use a proposta visual para tangibilizar o invisível.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
