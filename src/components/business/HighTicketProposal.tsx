import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Sparkles, Trophy, Target, DollarSign,
    CheckCircle, Copy, Check, Download,
    Presentation, Star, ShieldCheck, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ProposalData {
    clientName: string;
    mainProblem: string;
    solutionName: string;
    mainBenefit: string;
    priceReal: string;
    priceSpecial: string;
    bonus: string;
}

export function HighTicketProposal() {
    const [data, setData] = useState<ProposalData>({
        clientName: "",
        mainProblem: "",
        solutionName: "",
        mainBenefit: "",
        priceReal: "",
        priceSpecial: "",
        bonus: ""
    });

    const [isGenerated, setIsGenerated] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleInputChange = (field: keyof ProposalData, value: string) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const handleGenerate = () => {
        if (!data.solutionName || !data.priceSpecial) {
            toast.error("Preencha ao menos o nome da solução e o valor especial.");
            return;
        }
        setIsGenerated(true);
        toast.success("Proposta Elite estruturada!");
    };

    const handleCopy = () => {
        const text = `
🏆 PROPOSTA EXCLUSIVA: ${data.solutionName}
Para: ${data.clientName || 'Cliente VIP'}

🎯 O DESAFIO: ${data.mainProblem || 'Transformação Profissional'}
💎 A SOLUÇÃO: ${data.mainBenefit || 'Acompanhamento Premium'}

💰 INVESTIMENTO:
De: R$ ${data.priceReal || '---'}
Por apenas: R$ ${data.priceSpecial}

🎁 BÔNUS EXCLUSIVO: ${data.bonus || 'Consultoria Individual'}

✅ VAGAS LIMITADAS. Vamos começar?
        `.trim();

        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Texto copiado para o seu CRM!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Editor Side */}
                <div className="space-y-6">
                    <Card className="glass-card border-primary/20">
                        <CardHeader>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Target className="h-5 w-5 text-primary" />
                                </div>
                                <Badge variant="outline" className="text-primary border-primary/30 uppercase font-black tracking-widest text-[10px]">
                                    Arquitetura de Oferta
                                </Badge>
                            </div>
                            <CardTitle>Estruturar Proposta High Ticket</CardTitle>
                            <CardDescription>Defina os pilares da sua oferta de alto valor.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nome do Lead (Opcional)</Label>
                                    <Input
                                        placeholder="Ex: Dra. Ana Silva"
                                        value={data.clientName}
                                        onChange={(e) => handleInputChange('clientName', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Nome do Programa</Label>
                                    <Input
                                        placeholder="Ex: Mentoria Elite 90D"
                                        value={data.solutionName}
                                        onChange={(e) => handleInputChange('solutionName', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Maior Dor/Problema que vamos resolver</Label>
                                <Input
                                    placeholder="Ex: Falta de paciência para criar conteúdo"
                                    value={data.mainProblem}
                                    onChange={(e) => handleInputChange('mainProblem', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Promessa Principal (O grande benefício)</Label>
                                <Textarea
                                    placeholder="Ex: Transformar seus stories em uma máquina de vendas automática"
                                    value={data.mainBenefit}
                                    onChange={(e) => handleInputChange('mainBenefit', e.target.value)}
                                    rows={2}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Valor Real (Âncora)</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">R$</span>
                                        <Input
                                            placeholder="5.000"
                                            className="pl-8"
                                            value={data.priceReal}
                                            onChange={(e) => handleInputChange('priceReal', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Valor Especial (Oferta)</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold text-xs">R$</span>
                                        <Input
                                            placeholder="2.997"
                                            className="pl-8 border-primary/30 bg-primary/5 font-bold"
                                            value={data.priceSpecial}
                                            onChange={(e) => handleInputChange('priceSpecial', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Bônus Irresistível (Escassez/Diferencial)</Label>
                                <Input
                                    placeholder="Ex: 1 Consultoria Individual de 1h"
                                    value={data.bonus}
                                    onChange={(e) => handleInputChange('bonus', e.target.value)}
                                />
                            </div>

                            <Button onClick={handleGenerate} className="w-full h-12 rounded-xl font-bold bg-gradient-to-r from-primary to-purple-600 shadow-lg shadow-primary/20">
                                <Sparkles className="h-4 w-4 mr-2" /> Estruturar Proposta de Elite
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Preview Side */}
                <div className="space-y-6">
                    {isGenerated ? (
                        <Card className="border-none shadow-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white overflow-hidden animate-in zoom-in-95 duration-500 min-h-[500px] flex flex-col">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Trophy className="h-40 w-40" />
                            </div>

                            <CardHeader className="relative z-10 border-b border-white/10 pb-6">
                                <div className="flex items-center justify-between">
                                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 font-black tracking-widest text-[10px] py-1 px-3">
                                        OFERTA EXCLUSIVA
                                    </Badge>
                                    <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                                </div>
                                <CardTitle className="text-3xl font-black mt-4 leading-tight">
                                    {data.solutionName || "Programa de Mentoria"}
                                </CardTitle>
                                <p className="text-slate-400 text-sm mt-1">
                                    Preparada especialmente para: <span className="text-white font-bold">{data.clientName || "Você"}</span>
                                </p>
                            </CardHeader>

                            <CardContent className="relative z-10 flex-1 py-8 space-y-8">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                                            <Target className="h-5 w-5 text-indigo-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-none mb-1">O FOCO</p>
                                            <p className="text-sm font-medium leading-relaxed">{data.mainProblem || "Eliminar as barreiras que impedem seu crescimento digital."}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                                            <Zap className="h-5 w-5 text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-none mb-1">A TRANSFORMAÇÃO</p>
                                            <p className="text-sm font-medium leading-relaxed">{data.mainBenefit || "Método validado para escalar seu faturamento de forma leve."}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <DollarSign className="h-12 w-12" />
                                    </div>
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-4">Investimento Especial</p>
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-slate-500 line-through text-sm">R$ {data.priceReal || "5.000"}</span>
                                        <span className="text-4xl font-black text-white">R$ {data.priceSpecial}</span>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-500/10 w-fit px-3 py-1 rounded-full border border-emerald-500/20">
                                        <ShieldCheck className="h-3 w-3" /> Condição por tempo limitado
                                    </div>
                                </div>

                                {data.bonus && (
                                    <div className="flex items-center gap-3 p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5">
                                        <div className="h-8 w-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                                            <Sparkles className="h-4 w-4" />
                                        </div>
                                        <div className="text-xs">
                                            <span className="text-amber-400 font-black block text-[10px] leading-none mb-1">PRESENTE EXCLUSIVO</span>
                                            <span className="text-white font-bold">{data.bonus}</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>

                            <div className="p-8 pt-0 mt-auto flex gap-3 relative z-10">
                                <Button onClick={handleCopy} className="flex-1 h-12 rounded-xl font-bold bg-white text-slate-900 hover:bg-slate-100">
                                    {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                                    {copied ? "Copiado para o CRM" : "Copiar Texto da Proposta"}
                                </Button>
                                <Button variant="outline" className="h-12 w-12 rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10" size="icon">
                                    <Download className="h-5 w-5" />
                                </Button>
                            </div>
                        </Card>
                    ) : (
                        <div className="h-[500px] border-2 border-dashed border-muted rounded-3xl flex flex-col items-center justify-center text-center p-8 bg-muted/20">
                            <Presentation className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                            <h4 className="text-lg font-bold text-muted-foreground opacity-40">Preview da Proposta Elite</h4>
                            <p className="text-sm text-muted-foreground opacity-40 max-w-xs mt-2">
                                Preencha os detalhes ao lado para estruturar sua oferta de alto ticket e visualizar o impacto visual.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
