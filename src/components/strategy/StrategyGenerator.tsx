import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, ArrowRight, Loader2, Crown, Target, Sword, ShieldAlert, Zap, Users, Info, Lightbulb, Wallet } from 'lucide-react';
import { useStrategyAI, StrategyProfile } from '@/hooks/useStrategyAI';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';

interface StrategyGeneratorProps {
    onProfileGenerated: (profile: StrategyProfile) => void;
}

export function StrategyGenerator({ onProfileGenerated }: StrategyGeneratorProps) {
    const [niche, setNiche] = useState('');
    const [result, setResult] = useState<StrategyProfile | null>(null);
    const { generateProfile, isGenerating } = useStrategyAI();

    const handleGenerate = async () => {
        if (!niche.trim()) return;
        const profile = await generateProfile(niche);
        if (profile) {
            setResult(profile);
            onProfileGenerated(profile);
            setNiche(''); // Limpar após gerar
        }
    };

    return (
        <Card className="mb-8 border-primary/20 bg-primary/5 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Sparkles className="w-24 h-24 text-primary" />
            </div>

            <CardContent className="pt-6 relative z-10">
                <div className="flex flex-col space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold">
                        <Crown className="w-5 h-5" />
                        <span>MAESTRO V2 — Psicologia de Alta Conversão</span>
                    </div>

                    <p className="text-sm text-muted-foreground max-w-2xl">
                        Informe seu nicho e o Maestro criará sua estratégia de elite: Mecanismo Único, Promessa de 90 dias e a diferenciação dos 3 tipos de clientes para cobrar High-Ticket.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Input
                            placeholder="Ex: Nutrição funcional para executivas com fadiga crônica..."
                            value={niche}
                            onChange={(e) => setNiche(e.target.value)}
                            className="bg-background/80 backdrop-blur-sm border-primary/20 flex-1 h-12"
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        />
                        <Button
                            onClick={handleGenerate}
                            disabled={isGenerating || !niche.trim()}
                            className="h-12 px-8 font-bold gap-2 transition-all hover:shadow-lg active:scale-95 bg-primary text-primary-foreground"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Injetando Inteligência...
                                </>
                            ) : (
                                <>
                                    Gerar Estratégia de Elite
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </Button>
                    </div>

                    {result && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 mt-6">
                            {/* Hero Strategy: Mechanism & Promise */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <Card className="border-indigo-500/30 bg-indigo-500/5 shadow-md relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                        <Lightbulb className="w-12 h-12 text-indigo-500" />
                                    </div>
                                    <CardHeader className="pb-2">
                                        <Badge className="w-fit mb-2 bg-indigo-500 hover:bg-indigo-600">Mecanismo Único</Badge>
                                        <CardTitle className="text-xl font-black text-indigo-700 leading-tight">
                                            {result.uniqueMechanism}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-indigo-900/70 font-medium">Sua metodologia exclusiva para se diferenciar de qualquer "nutri comum".</p>
                                    </CardContent>
                                </Card>

                                <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-md relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                        <Target className="w-12 h-12 text-emerald-500" />
                                    </div>
                                    <CardHeader className="pb-2">
                                        <Badge className="w-fit mb-2 bg-emerald-500 hover:bg-emerald-600">Promessa de 90 Dias</Badge>
                                        <CardTitle className="text-xl font-black text-emerald-700 leading-tight">
                                            {result.mainPromise90D}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-emerald-900/70 font-medium">O resultado tangível e visceral que seu cliente pagará caro para ter.</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Persona & Pain */}
                            <Card className="border-primary/10 shadow-sm overflow-hidden">
                                <CardHeader className="bg-primary/5 pb-4">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Users className="h-5 w-5 text-primary" />
                                        Perfil da Persona: {result.personaProfile?.name || result.persona}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Nicho Refinado</p>
                                            <p className="font-bold text-sm">{result.niche}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Idade / Sub-nicho</p>
                                            <p className="font-bold text-sm">{result.personaProfile?.age || ""} • {result.subNiche}</p>
                                        </div>
                                    </div>

                                    <div className="bg-destructive/5 border border-destructive/10 p-4 rounded-2xl">
                                        <p className="text-xs font-black uppercase text-destructive tracking-widest mb-1 flex items-center gap-1.5">
                                            <ShieldAlert className="w-3 h-3" /> Dor da Alma (O Problema Agudo)
                                        </p>
                                        <p className="text-sm text-destructive/90 italic font-medium">"{result.personaProfile?.soulPain || result.mainPain}"</p>
                                    </div>

                                    {(result.personaProfile?.routineConflict || result.persona) && (
                                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                                            <p className="text-xs font-black uppercase text-slate-500 tracking-widest mb-1 flex items-center gap-1.5">
                                                <Info className="w-3 h-3" /> Contexto / Conflito
                                            </p>
                                            <p className="text-sm text-slate-700 leading-relaxed">{result.personaProfile?.routineConflict || result.persona}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Differentiated Client Segments */}
                            {result.clientSegments && (
                                <Card className="border-amber-500/20 shadow-md">
                                    <CardHeader className="pb-3 border-b border-amber-500/10">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Wallet className="h-5 w-5 text-amber-500" />
                                            Psicotipos de Compra (Business Strategy)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <Tabs defaultValue="desenvolvidos" className="w-full">
                                            <TabsList className="grid w-full grid-cols-3 mb-6">
                                                <TabsTrigger value="inconformados" className="text-xs">Inconformados</TabsTrigger>
                                                <TabsTrigger value="frustrados" className="text-xs">Frustrados</TabsTrigger>
                                                <TabsTrigger value="desenvolvidos" className="text-xs border-2 border-primary/20">Desenvolvidos (Elite)</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="inconformados" className="p-4 bg-muted/30 rounded-2xl border border-dashed border-muted-foreground/20">
                                                <h4 className="font-bold text-sm mb-2 text-muted-foreground">O Cliente de Base (Low Margin)</h4>
                                                <p className="text-sm text-muted-foreground leading-relaxed">{result.clientSegments.inconformados}</p>
                                            </TabsContent>
                                            <TabsContent value="frustrados" className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                                <h4 className="font-bold text-sm mb-2 text-indigo-700">O Cliente em Busca de Alívio (Mid Margin)</h4>
                                                <p className="text-sm text-indigo-900/70 leading-relaxed">{result.clientSegments.frustrados}</p>
                                            </TabsContent>
                                            <TabsContent value="desenvolvidos" className="p-4 bg-primary/5 rounded-2xl border-2 border-primary/20">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Crown className="w-4 h-4 text-primary" />
                                                    <h4 className="font-black text-sm text-primary uppercase tracking-wider">O Seu Cliente High-Ticket</h4>
                                                </div>
                                                <p className="text-sm text-primary/80 font-medium leading-relaxed">{result.clientSegments.desenvolvidos}</p>
                                            </TabsContent>
                                        </Tabs>
                                    </CardContent>
                                </Card>
                            )}

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Objections */}
                                <Card className="h-fit">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Sword className="h-4 w-4 text-primary" />
                                            Objeções de Elite (Quebra de Muros)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-3">
                                            {(result.objections || result.eliteObjections || []).map((o, i) => (
                                                <li key={i} className="flex gap-2 text-sm text-muted-foreground border-l-2 border-primary/20 pl-3 py-1">
                                                    <span className="font-bold text-primary">⚠️</span>
                                                    {o}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>

                                {/* Maestro Verdict */}
                                <Card className="border-primary/30 bg-primary/5 h-fit relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                                        <Sparkles className="w-16 h-16 text-primary" />
                                    </div>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Sparkles className="h-4 w-4 text-primary" />
                                            Veredito do Maestro
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm italic font-bold leading-relaxed text-slate-800">
                                            &ldquo;{result.maestroVerdict}&rdquo;
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Quick Action */}
                            <div className="bg-slate-900 p-6 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="space-y-1 relative z-10">
                                    <h4 className="font-black text-xl tracking-tight">Estratégia Gerada com Sucesso</h4>
                                    <p className="text-slate-400 text-sm">Agora vamos injetar esses parâmetros no seu Business Lab e Criador de Carrosséis.</p>
                                </div>
                                <Button variant="secondary" className="bg-white text-slate-900 hover:bg-white/90 font-bold px-8 h-12 rounded-2xl relative z-10" asChild>
                                    <Link to="/business-lab">Acessar Business Lab</Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
