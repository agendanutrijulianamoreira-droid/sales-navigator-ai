import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
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
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, MessageSquare, Users, Copy, Check, Crown } from "lucide-react";
import { toast } from "sonner";

const MESSAGE_TYPES = [
  { value: "levantada_mao", label: "Levantada de Mão", description: "Descubra quem tem interesse" },
  { value: "caixinha_3x1", label: "Caixinha 3x1", description: "3 valores + 1 link" },
  { value: "empurraozinho", label: "Empurrãozinho", description: "Ative leads mornos" },
  { value: "boas_vindas", label: "Boas-vindas VIP", description: "Primeiro contato especial" },
  { value: "sequencia_vendas", label: "Sequência de Vendas", description: "Funil completo por DM" },
  { value: "objecao", label: "Quebra de Objeção", description: "Responda dúvidas comuns" },
];

export default function Conversion() {
  const { generateContent, isLoading, streamedContent } = useAISpecialist();
  const { saveGeneration } = useGenerations();
  const { products } = useProducts();
  const [activeTab, setActiveTab] = useState("vip");
  const [messageType, setMessageType] = useState("levantada_mao");
  const [context, setContext] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [copied, setCopied] = useState(false);

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
      });
      toast.success("Salvo na biblioteca!");
    }
  };

  return (
    <AppLayout title="Conversão" description="Lista VIP & Closer">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="vip">Lista VIP</TabsTrigger>
          <TabsTrigger value="scripts">Scripts de Vendas</TabsTrigger>
        </TabsList>

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
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            messageType === type.value 
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
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { title: "Script de Qualificação", desc: "Identifique leads qualificados" },
                  { title: "Script de Apresentação", desc: "Apresente sua oferta com elegância" },
                  { title: "Script de Fechamento", desc: "Conduza para a decisão" },
                ].map((script) => (
                  <Card key={script.title} className="cursor-pointer hover:border-primary/30 transition-colors">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{script.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">{script.desc}</p>
                      <Button size="sm" className="mt-4 w-full" variant="outline">
                        <Sparkles className="h-3 w-3 mr-2" />
                        Gerar
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
