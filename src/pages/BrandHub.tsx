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
import {
    Loader2, Sparkles, Target, Crown, Sword, Lightbulb,
    ShieldAlert, BrainCircuit, Trophy, Palette, Package, Check
} from "lucide-react";
import { StrategyGenerator } from "@/components/strategy/StrategyGenerator";
import { StrategyProfile } from "@/hooks/useStrategyAI";
import { BrandKit } from "@/components/BrandKit";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useProducts } from "@/hooks/useProducts";
import { toast } from "sonner";

export default function BrandHub() {
    const { profile, updateProfile } = useProfile();
    const { generateContent, isLoading, streamedContent } = useAISpecialist();
    const [activeTab, setActiveTab] = useState("ai");
    const [maestroVerdict, setMaestroVerdict] = useState<string | null>(null);
    const [generatedPromises, setGeneratedPromises] = useState<string[]>([]);
    const [selectedPromise, setSelectedPromise] = useState<string>("");
    const [suggestedProducts, setSuggestedProducts] = useState<any[]>([]);
    const { addProduct } = useProducts();

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
        const personaText = data.persona || (data.personaProfile ? `${data.personaProfile.name} (${data.personaProfile.age})\nConflito: ${data.personaProfile.routineConflict}` : "");
        const mainPainText = data.mainPain || (data.personaProfile?.soulPain ?? "");
        const mainDesireText = data.mainDesire || data.mainPromise90D || (data.promises?.[0] ?? "");
        const objectionsText = (data.objections || data.eliteObjections || []).map(o => `• ${o}`).join('\n');
        const promessaText = data.mainPromise90D || data.promises?.[2] || data.promises?.[0] || "";

        updateProfile({
            nicho: data.niche,
            sub_nicho: data.subNiche,
            persona_ideal: personaText,
            dor_principal: mainPainText,
            desejo_principal: mainDesireText,
            objecoes: objectionsText,
            tom_voz: data.brandVoice ? data.brandVoice.toLowerCase() : profile?.tom_voz,
            inimigo_comum: data.commonEnemy || '',
            promessa_principal: promessaText,
            mecanismo_unico: data.uniqueMechanism || "Sua Metodologia de Elite",
            problema_90_dias: data.mainPromise90D ? `Promessa 90D: ${data.mainPromise90D}` : (data.promises?.map(p => `• ${p}`).join('\n') ?? "")
        });

        if (data.maestroVerdict) {
            setMaestroVerdict(data.maestroVerdict);
        }

        if (data.promises && data.promises.length > 0) {
            setGeneratedPromises(data.promises);
            setSelectedPromise(promessaText || data.promises[0]);
        } else if (data.mainPromise90D) {
            setGeneratedPromises([data.mainPromise90D]);
            setSelectedPromise(data.mainPromise90D);
        }

        if (data.productLadder) {
            setSuggestedProducts([
                { nome: data.productLadder.tripwire, tipo: 'entrada', ticket: 47, descricao: 'Produto de entrada para atrair leads (Isca Paga)' },
                { nome: data.productLadder.coreOffer, tipo: 'servico', ticket: 497, descricao: 'Sua oferta principal e mecanismo único' },
                { nome: data.productLadder.highTicket, tipo: 'premium', ticket: 2500, descricao: 'Acompanhamento VIP / Mentoria de Elite' }
            ]);
        }
    };

    const handleApplyProducts = async () => {
        if (suggestedProducts.length === 0) return;

        try {
            for (const prod of suggestedProducts) {
                await addProduct({
                    nome: prod.nome,
                    tipo_produto: prod.tipo,
                    ticket: prod.ticket,
                    descricao: prod.descricao,
                    tipo_cliente: 'inconformado',
                    ativo: true,
                    ordem: 0
                });
            }
            toast.success("Escada de produtos aplicada ao laboratório!");
            setSuggestedProducts([]);
        } catch (error) {
            toast.error("Erro ao aplicar produtos");
        }
    };

    return (
        <AppLayout title="Central da Marca" description="Identidade & Estratégia de Elite">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="ai" className="gap-2 text-primary font-bold">
                        <Sparkles className="h-4 w-4" />
                        Maestro IA
                    </TabsTrigger>
                    <TabsTrigger value="strategy" className="gap-2">
                        <Target className="h-4 w-4" />
                        Estratégia de Marca
                    </TabsTrigger>
                    <TabsTrigger value="kit" className="gap-2">
                        <Palette className="h-4 w-4" />
                        Identidade Visual
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="ai" className="space-y-6">
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

                    {suggestedProducts.length > 0 && (
                        <div className="mt-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Package className="w-5 h-5 text-primary" />
                                    Escada de Produtos Sugerida
                                </h3>
                                <Button onClick={handleApplyProducts} size="sm" className="gap-2">
                                    <Check className="w-4 h-4" /> Aplicar ao Meu Catálogo
                                </Button>
                            </div>
                            <div className="grid md:grid-cols-3 gap-4">
                                {suggestedProducts.map((prod, idx) => (
                                    <Card key={idx} className="border-primary/20 bg-primary/5">
                                        <CardHeader className="p-4 pb-2">
                                            <Badge variant="outline" className="w-fit text-[10px] uppercase mb-1">{prod.tipo}</Badge>
                                            <CardTitle className="text-sm font-bold">{prod.nome}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-0">
                                            <p className="text-[10px] text-muted-foreground line-clamp-2">{prod.descricao}</p>
                                            <div className="mt-2 text-primary font-black text-sm">R$ {prod.ticket}</div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="strategy" className="space-y-6">
                    {/* ... Strategy Content ... */}
                    <div className="grid gap-6">
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
                                        Objeções Comuns
                                    </Label>
                                    <Textarea
                                        value={profile?.objecoes || ""}
                                        onChange={(e) => updateProfile({ objecoes: e.target.value })}
                                        placeholder="Quais motivos fariam ela NÃO comprar de você?"
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
                                        placeholder="Qual transformação você entrega?"
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
                                        placeholder="O que você combate?"
                                        rows={2}
                                    />
                                </div>
                                <Button onClick={handleGenerateBrand} disabled={isLoading}>
                                    {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                                    Gerar Posicionamento com IA
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Método */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lightbulb className="h-5 w-5 text-primary" />
                                    Seu Método
                                </CardTitle>
                                <CardDescription>Sua metodologia única</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Nome do Método</Label>
                                    <Input
                                        value={profile?.nome_metodo || ""}
                                        onChange={(e) => updateProfile({ nome_metodo: e.target.value })}
                                        placeholder="Ex: Método Nutri Leve"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Mecanismo Único</Label>
                                    <Textarea
                                        value={profile?.mecanismo_unico || ""}
                                        onChange={(e) => updateProfile({ mecanismo_unico: e.target.value })}
                                        placeholder="O que torna seu método diferente?"
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Problema que resolve em 90 dias</Label>
                                    <Textarea
                                        value={profile?.problema_90_dias || ""}
                                        onChange={(e) => updateProfile({ problema_90_dias: e.target.value })}
                                        placeholder="Qual transformação concreta entrega?"
                                        rows={2}
                                    />
                                </div>
                                <Button onClick={handleGenerateMethod} disabled={isLoading}>
                                    {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                                    Refinar Método com IA
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Tom de Voz */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Tom de Voz & Arquétipo</CardTitle>
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
                    </div>
                </TabsContent>
                <TabsContent value="kit" className="space-y-6">
                    <BrandKit />
                </TabsContent>
            </Tabs>

            {/* AI Response Footer */}
            {streamedContent && (
                <Card className="mt-6 border-primary/20 glass-card">
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
