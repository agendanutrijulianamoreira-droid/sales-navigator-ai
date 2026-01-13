import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProducts } from "@/hooks/useProducts";
import { useAISpecialist } from "@/hooks/useAISpecialist";
import { useGenerations } from "@/hooks/useGenerations";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Package, FileText, Trophy, Plus, Trash2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function Products() {
  const { products, addProduct, removeProduct } = useProducts();
  const { generateContent, isLoading, streamedContent } = useAISpecialist();
  const { saveGeneration } = useGenerations();
  const [activeTab, setActiveTab] = useState("ladder");
  const [copied, setCopied] = useState(false);
  
  // New product form
  const [newProduct, setNewProduct] = useState({
    nome: "",
    ticket: "",
    tipo_produto: "servico",
    tipo_cliente: "desenvolvimento",
    descricao: "",
  });

  // Material generator
  const [materialType, setMaterialType] = useState("ebook");
  const [materialTopic, setMaterialTopic] = useState("");

  // Challenge generator
  const [challengeDays, setChallengeDays] = useState("7");
  const [challengeFocus, setChallengeFocus] = useState("");

  const handleAddProduct = async () => {
    if (!newProduct.nome || !newProduct.ticket) {
      toast.error("Preencha nome e valor do produto");
      return;
    }
    await addProduct({
      ...newProduct,
      ticket: parseFloat(newProduct.ticket),
    });
    setNewProduct({ nome: "", ticket: "", tipo_produto: "servico", tipo_cliente: "desenvolvimento", descricao: "" });
    toast.success("Produto adicionado!");
  };

  const handleGenerateMaterial = async () => {
    if (!materialTopic) {
      toast.error("Digite o tema do material");
      return;
    }
    await generateContent("material_copywriter", materialType, {
      tipo: materialType,
      tema: materialTopic,
    });
  };

  const handleGenerateChallenge = async () => {
    if (!challengeFocus) {
      toast.error("Digite o foco do desafio");
      return;
    }
    await generateContent("challenge_coach", "desafio", {
      dias: challengeDays,
      foco: challengeFocus,
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

  const handleSave = async (tipo: string, subtipo: string, titulo: string) => {
    if (streamedContent) {
      await saveGeneration({
        tipo,
        subtipo,
        specialist: tipo === "material" ? "material_copywriter" : "challenge_coach",
        output_content: streamedContent,
        titulo,
        input_data: {},
      });
      toast.success("Salvo na biblioteca!");
    }
  };

  return (
    <AppLayout title="Produtos" description="Materiais Ricos & Desafios">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ladder">Escada de Produtos</TabsTrigger>
          <TabsTrigger value="materials">Materiais Ricos</TabsTrigger>
          <TabsTrigger value="challenges">Fábrica de Desafios</TabsTrigger>
        </TabsList>

        {/* Product Ladder */}
        <TabsContent value="ladder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Sua Escada de Produtos
              </CardTitle>
              <CardDescription>Organize seus produtos do mais acessível ao premium</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Product List */}
              {products && products.length > 0 ? (
                <div className="space-y-3">
                  {products
                    .sort((a, b) => a.ticket - b.ticket)
                    .map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{product.nome}</h4>
                            <Badge variant="secondary">{product.tipo_produto}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{product.descricao}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-lg">
                            R$ {product.ticket.toLocaleString("pt-BR")}
                          </span>
                          <Button size="icon" variant="ghost" onClick={() => removeProduct(product.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Nenhum produto cadastrado ainda</p>
                </div>
              )}

              {/* Add Product Form */}
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar Produto
                </h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nome do Produto</Label>
                    <Input
                      value={newProduct.nome}
                      onChange={(e) => setNewProduct({ ...newProduct, nome: e.target.value })}
                      placeholder="Ex: Consulta Avulsa"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valor (R$)</Label>
                    <Input
                      type="number"
                      value={newProduct.ticket}
                      onChange={(e) => setNewProduct({ ...newProduct, ticket: e.target.value })}
                      placeholder="250"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de Produto</Label>
                    <Select value={newProduct.tipo_produto} onValueChange={(v) => setNewProduct({ ...newProduct, tipo_produto: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="isca">Isca Digital (Grátis)</SelectItem>
                        <SelectItem value="entrada">Produto de Entrada</SelectItem>
                        <SelectItem value="servico">Serviço Principal</SelectItem>
                        <SelectItem value="premium">Premium / VIP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de Cliente</Label>
                    <Select value={newProduct.tipo_cliente} onValueChange={(v) => setNewProduct({ ...newProduct, tipo_cliente: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inconformado">Inconformado (Iniciante)</SelectItem>
                        <SelectItem value="frustrado">Frustrado (Já tentou)</SelectItem>
                        <SelectItem value="desenvolvimento">Em Desenvolvimento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <Label>Descrição</Label>
                  <Textarea
                    value={newProduct.descricao}
                    onChange={(e) => setNewProduct({ ...newProduct, descricao: e.target.value })}
                    placeholder="Breve descrição do produto..."
                    rows={2}
                  />
                </div>
                <Button onClick={handleAddProduct} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Produto
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Materials */}
        <TabsContent value="materials" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Criar Material Rico
                </CardTitle>
                <CardDescription>Iscas que geram "pequenas vitórias"</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de Material</Label>
                  <Select value={materialType} onValueChange={setMaterialType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ebook">E-book</SelectItem>
                      <SelectItem value="checklist">Checklist</SelectItem>
                      <SelectItem value="guia">Guia Prático</SelectItem>
                      <SelectItem value="planner">Planner</SelectItem>
                      <SelectItem value="roteiro">Roteiro de Aula</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tema</Label>
                  <Textarea
                    value={materialTopic}
                    onChange={(e) => setMaterialTopic(e.target.value)}
                    placeholder="Sobre o que será o material? (Ex: Guia de compras no supermercado)"
                    rows={3}
                  />
                </div>
                <Button onClick={handleGenerateMaterial} disabled={isLoading} className="w-full">
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Gerar Material
                </Button>
              </CardContent>
            </Card>

            {/* Output */}
            <Card className="h-fit">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Material Gerado</CardTitle>
                  {streamedContent && activeTab === "materials" && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleCopy}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleSave("material", materialType, materialTopic)}>
                        Salvar
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {streamedContent && activeTab === "materials" ? (
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap bg-muted/50 p-4 rounded-lg max-h-96 overflow-y-auto">
                    {streamedContent}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>Seu material aparecerá aqui</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Challenges */}
        <TabsContent value="challenges" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Criar Desafio
                </CardTitle>
                <CardDescription>Gamificação que engaja e converte</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Duração do Desafio</Label>
                  <div className="flex gap-2">
                    {["5", "7", "14", "21"].map((d) => (
                      <Badge
                        key={d}
                        variant={challengeDays === d ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setChallengeDays(d)}
                      >
                        {d} dias
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Foco do Desafio</Label>
                  <Textarea
                    value={challengeFocus}
                    onChange={(e) => setChallengeFocus(e.target.value)}
                    placeholder="Qual transformação o participante terá? (Ex: Eliminar o açúcar)"
                    rows={3}
                  />
                </div>
                <Button onClick={handleGenerateChallenge} disabled={isLoading} className="w-full">
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Criar Estrutura do Desafio
                </Button>
              </CardContent>
            </Card>

            {/* Output */}
            <Card className="h-fit">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Estrutura do Desafio</CardTitle>
                  {streamedContent && activeTab === "challenges" && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleCopy}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleSave("desafio", `${challengeDays}dias`, challengeFocus)}>
                        Salvar
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {streamedContent && activeTab === "challenges" ? (
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap bg-muted/50 p-4 rounded-lg max-h-96 overflow-y-auto">
                    {streamedContent}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>Seu desafio aparecerá aqui</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
