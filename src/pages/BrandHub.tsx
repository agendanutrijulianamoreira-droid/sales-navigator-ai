import { useState, useMemo } from "react";
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
    ShieldAlert, BrainCircuit, Trophy, Palette, Package, Check,
    Zap, Activity, LayoutGrid, Info
} from "lucide-react";
import { StrategyGenerator } from "@/components/strategy/StrategyGenerator";
import { StrategyProfile } from "@/hooks/useStrategyAI";
import BrandKit from "@/components/BrandKit";
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

    // Cálculo intuitivo de "Saúde da Marca"
    const brandHealth = useMemo(() => {
        if (!profile) return 0;
        const fields = [
            profile.nicho, profile.sub_nicho, profile.persona_ideal, 
            profile.dor_principal, profile.desejo_principal, 
            profile.promessa_principal, profile.mecanismo_unico
        ];
        const completed = fields.filter(f => !!f).length;
        return Math.round((completed / fields.length) * 100);
    }, [profile]);

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
            <div className="flex flex-col gap-8">
                {/* Brand Health Header */}
                <header className="grid gap-4 md:grid-cols-3">
                    <Card className="md:col-span-2 border-primary/10 bg-gradient-to-br from-card to-card/50 backdrop-blur-xl">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-primary" />
                                        Brand Integrity
                                    </h2>
                                    <p className="text-muted-foreground text-sm">Status da sua fundação estratégica</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-black text-primary">{brandHealth}%</div>
                                    <div className="text-[10px] uppercase tracking-widest font-bold opacity-50">Score de Elite</div>
                                </div>
                            </div>
                            <div className="h-2 w-full bg-primary/5 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-primary transition-all duration-1000 ease-out" 
                                    style={{ width: `${brandHealth}%` }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-primary/10 bg-primary/5">
                        <CardContent className="pt-6 h-full flex flex-col justify-center items-center text-center">
                            <Zap className="w-8 h-8 text-primary mb-2 animate-pulse" />
                            <h3 className="font-bold text-sm uppercase tracking-tighter">Status: {brandHealth > 80 ? 'Inabalável' : 'Em Construção'}</h3>
                            <p className="text-[10px] text-muted-foreground mt-1 max-w-[150px]">
                                {brandHealth > 80 ? 'Sua marca está pronta para escalar com autoridade.' : 'Complete seu posicionamento para destravar a IA.'}
                            </p>
                        </CardContent>
                    </Card>
                </header>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="bg-muted/50 p-1 border-primary/10 backdrop-blur-sm self-start">
                        <TabsTrigger value="ai" className="gap-2 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                            <Sparkles className="h-4 w-4" />
                            Maestro IA
                        </TabsTrigger>
                        <TabsTrigger value="strategy" className="gap-2 px-6">
                            <Target className="h-4 w-4" />
                            Estratégia
                        </TabsTrigger>
                        <TabsTrigger value="kit" className="gap-2 px-6">
                            <Palette className="h-4 w-4" />
                            Visual Kit
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="ai" className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                        <div className="grid gap-6 lg:grid-cols-[1fr,350px]">
                            <div className="space-y-6">
                                <StrategyGenerator onProfileGenerated={handleAutoFill} />
                                
                                {maestroVerdict && (
                                    <div className="p-8 bg-indigo-950/40 border border-indigo-500/20 backdrop-blur-md rounded-3xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-all duration-500" />
                                        
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="bg-indigo-500/20 p-3 rounded-2xl">
                                                <BrainCircuit className="w-8 h-8 text-indigo-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-xl tracking-tighter text-indigo-100 uppercase">Veredito do Maestro</h3>
                                                <Badge variant="outline" className="text-indigo-400/80 border-indigo-400/20 text-[10px]">INTELIGÊNCIA ESTRATÉGICA ATIVA</Badge>
                                            </div>
                                        </div>

                                        <p className="text-indigo-200/90 text-lg leading-relaxed italic border-l-2 border-indigo-500/40 pl-6 mb-8">
                                            "{maestroVerdict}"
                                        </p>

                                        <div className="flex flex-wrap gap-3">
                                            <Button className="bg-indigo-500 hover:bg-indigo-400 text-indigo-950 font-black h-12 px-8 rounded-xl shadow-lg shadow-indigo-500/20">
                                                Aplicar ao Funil de Vendas
                                            </Button>
                                            <Button variant="outline" className="bg-indigo-950/50 border-indigo-500/30 text-indigo-200 hover:bg-indigo-900 h-12 rounded-xl">
                                                Refinar Objeções
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <aside className="space-y-6">
                                {generatedPromises.length > 0 && (
                                    <Card className="border-primary/10 bg-card/40 backdrop-blur-sm sticky top-6">
                                        <CardHeader>
                                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                                <Trophy className="w-5 h-5 text-primary" />
                                                Promessas de Elite
                                            </CardTitle>
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
                                                    <div key={index} className={`relative p-4 border rounded-xl transition-all cursor-pointer group ${selectedPromise === promise ? 'bg-primary/5 border-primary shadow-[0_0_20px_rgba(var(--primary),0.1)]' : 'bg-transparent hover:border-primary/30 border-primary/10'}`}>
                                                        <RadioGroupItem value={promise} id={`p-${index}`} className="absolute top-4 right-4" />
                                                        <Label htmlFor={`p-${index}`} className="leading-tight cursor-pointer font-medium text-xs block pr-6">
                                                            {promise}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </CardContent>
                                    </Card>
                                )}

                                {suggestedProducts.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 px-2">
                                            <Package className="w-4 h-4" /> Escada Suggested
                                        </h3>
                                        <div className="grid gap-3">
                                            {suggestedProducts.map((prod, idx) => (
                                                <div key={idx} className="p-4 rounded-2xl bg-muted/30 border border-primary/5 relative group overflow-hidden">
                                                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Info className="w-3 h-3 text-muted-foreground" />
                                                    </div>
                                                    <Badge variant="secondary" className="text-[9px] mb-1">{prod.tipo}</Badge>
                                                    <h4 className="text-xs font-bold truncate">{prod.nome}</h4>
                                                    <div className="text-primary font-black text-sm mt-1">R$ {prod.ticket}</div>
                                                </div>
                                            ))}
                                            <Button onClick={handleApplyProducts} className="w-full mt-2 gap-2 font-bold" variant="outline">
                                                <Check className="w-4 h-4" /> Sincronizar Tudo
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </aside>
                        </div>
                    </TabsContent>

                    <TabsContent value="strategy" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Nicho & Persona */}
                            <Card className="border-primary/10 bg-card/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-xl font-black">
                                        <Target className="h-5 w-5 text-primary" />
                                        Fundação
                                    </CardTitle>
                                    <CardDescription>Nicho e seu Cliente dos Sonhos</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Nicho Principal</Label>
                                            <Input
                                                value={profile?.nicho || ""}
                                                onChange={(e) => updateProfile({ nicho: e.target.value })}
                                                placeholder="Ex: Emagrecimento Feminino"
                                                className="bg-background/50 border-primary/5 focus:border-primary/30"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Sub-nicho</Label>
                                            <Input
                                                value={profile?.sub_nicho || ""}
                                                onChange={(e) => updateProfile({ sub_nicho: e.target.value })}
                                                placeholder="Ex: Mães ocupadas"
                                                className="bg-background/50 border-primary/5 focus:border-primary/30"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Persona Ideal</Label>
                                        <Textarea
                                            value={profile?.persona_ideal || ""}
                                            onChange={(e) => updateProfile({ persona_ideal: e.target.value })}
                                            placeholder="Detalhes profundos da sua persona..."
                                            rows={5}
                                            className="bg-background/50 border-primary/5 resize-none"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Dores & Desejos */}
                            <Card className="border-primary/10 bg-card/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-xl font-black">
                                        <BrainCircuit className="h-5 w-5 text-primary" />
                                        Psicologia
                                    </CardTitle>
                                    <CardDescription>Dores, Desejos e Resistências</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Dor de Alma</Label>
                                        <Textarea
                                            value={profile?.dor_principal || ""}
                                            onChange={(e) => updateProfile({ dor_principal: e.target.value })}
                                            placeholder="O que tira o sono dela?"
                                            rows={3}
                                            className="bg-background/50 border-primary/5"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Desejo Ardente</Label>
                                        <Textarea
                                            value={profile?.desejo_principal || ""}
                                            onChange={(e) => updateProfile({ desejo_principal: e.target.value })}
                                            placeholder="Qual o maior sonho inconfessável?"
                                            rows={3}
                                            className="bg-background/50 border-primary/5"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-2">
                                            <ShieldAlert className="h-3 w-3" /> Objeções Críticas
                                        </Label>
                                        <Textarea
                                            value={profile?.objecoes || ""}
                                            onChange={(e) => updateProfile({ objecoes: e.target.value })}
                                            placeholder="Por que ela não compraria?"
                                            rows={2}
                                            className="bg-background/50 border-primary/5"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Posicionamento */}
                            <Card className="border-primary/10 bg-card/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-xl font-black">
                                        <Crown className="h-5 w-5 text-primary" />
                                        Autoridade
                                    </CardTitle>
                                    <CardDescription>Posicionamento e Diferenciação</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Big Promise</Label>
                                        <Textarea
                                            value={profile?.promessa_principal || ""}
                                            onChange={(e) => updateProfile({ promessa_principal: e.target.value })}
                                            className="bg-background/50 border-primary/5 font-bold"
                                            rows={3}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-2">
                                            <Sword className="h-3 w-3" /> Inimigo Comum
                                        </Label>
                                        <Input
                                            value={profile?.inimigo_comum || ""}
                                            onChange={(e) => updateProfile({ inimigo_comum: e.target.value })}
                                            className="bg-background/50 border-primary/5"
                                        />
                                    </div>
                                    <Button onClick={handleGenerateBrand} disabled={isLoading} className="w-full h-12 gap-2 font-black uppercase tracking-tighter">
                                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                        Refining Positioning
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Método */}
                            <Card className="border-primary/10 bg-card/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-xl font-black">
                                        <Lightbulb className="h-5 w-5 text-primary" />
                                        Mecanismo
                                    </CardTitle>
                                    <CardDescription>Sua Metodologia de Entrega</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Codinome do Método</Label>
                                        <Input
                                            value={profile?.nome_metodo || ""}
                                            onChange={(e) => updateProfile({ nome_metodo: e.target.value })}
                                            className="bg-background/50 border-primary/5 font-mono"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Mecanismo Único</Label>
                                        <Textarea
                                            value={profile?.mecanismo_unico || ""}
                                            onChange={(e) => updateProfile({ mecanismo_unico: e.target.value })}
                                            rows={4}
                                            className="bg-background/50 border-primary/5"
                                        />
                                    </div>
                                    <Button onClick={handleGenerateMethod} disabled={isLoading} variant="outline" className="w-full h-12 gap-2 font-black uppercase tracking-tighter">
                                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
                                        Sharpen Mechanism
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="kit" className="animate-in fade-in zoom-in-95 duration-500">
                        <BrandKit />
                    </TabsContent>
                </Tabs>

                {/* AI Response Overlay */}
                {streamedContent && (
                    <Card className="fixed bottom-6 right-6 w-[450px] border-primary/20 shadow-2xl glass-card animate-in slide-in-from-right-full duration-700 z-50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                                Maestro Insight
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="max-h-[300px] overflow-y-auto custom-scrollbar">
                            <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-xs text-muted-foreground leading-relaxed">
                                {streamedContent}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}

