import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useCredits } from "@/hooks/useCredits";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
    Loader2, Target, Search, Magnet, DollarSign, MessageSquare,
    Users, Copy, Check, ArrowLeft, ArrowRight, Sparkles, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

// — Funnel Blueprint Types —
interface FunnelQuestion {
    id: string;
    label: string;
    placeholder: string;
}

interface FunnelBlueprint {
    id: string;
    category: "attract" | "sell" | "cashbox";
    title: string;
    promise: string;
    description: string;
    icon: React.ElementType;
    gradient: string;
    outputFormat: "roteiro_stories" | "script_whatsapp" | "carousel";
    questions: FunnelQuestion[];
}

// — 6 Funnel Blueprints —
const FUNNEL_BLUEPRINTS: FunnelBlueprint[] = [
    // FASE 1: ATRAÇÃO
    {
        id: "f1",
        category: "attract",
        title: "Funil de Pesquisa",
        promise: "Entenda sua audiência e venda no final.",
        description: "Use uma pesquisa estratégica para segmentar leads e oferecer uma Sessão Estratégica gratuita para os mais qualificados.",
        icon: Search,
        gradient: "from-amber-500 to-amber-700",
        outputFormat: "roteiro_stories",
        questions: [
            { id: "q1", label: "Qual o tema principal da pesquisa?", placeholder: "Ex: Dores no Emagrecimento" },
            { id: "q2", label: "Qual o prêmio para quem responder?", placeholder: "Ex: Sorteio de 5 Check-ups Virtuais" },
        ],
    },
    {
        id: "f2",
        category: "attract",
        title: "Funil de Presente (Lead Magnet)",
        promise: "Construa sua lista de potenciais clientes.",
        description: "Post focado em troca: conteúdo rico por contato no Direct. Troca ética de valor.",
        icon: Magnet,
        gradient: "from-blue-500 to-blue-700",
        outputFormat: "roteiro_stories",
        questions: [
            { id: "q1", label: "Qual o nome do seu material gratuito?", placeholder: "Ex: Guia da Desinflamação" },
            { id: "q2", label: "Qual o benefício imediato dele?", placeholder: "Ex: Desinchar em 7 dias" },
        ],
    },
    // FASE 2: CONVERSÃO
    {
        id: "f3",
        category: "sell",
        title: "Conversão Direta (The Money Post)",
        promise: "Filtre os Inconformados e venda agora.",
        description: "Post curto, visceral e agressivo focado no nível máximo de consciência. Identifica o problema e oferece a solução imediata.",
        icon: Target,
        gradient: "from-green-600 to-emerald-800",
        outputFormat: "carousel",
        questions: [
            { id: "q1", label: "Qual a dor latente que vamos atacar?", placeholder: 'Ex: O efeito sanfona que nunca acaba' },
            { id: "q2", label: "Qual a palavra-chave de ação?", placeholder: 'Ex: Comente "METABOLISMO"' },
        ],
    },
    {
        id: "f4",
        category: "sell",
        title: "Funil de Aplicação",
        promise: "Inverta a polaridade: O cliente se vende.",
        description: "Roteiro para levar interessados a preencherem um formulário para tentar uma vaga na sua Mentoria Premium.",
        icon: MessageSquare,
        gradient: "from-purple-500 to-purple-700",
        outputFormat: "roteiro_stories",
        questions: [
            { id: "q1", label: "Qual a promessa da Mentoria?", placeholder: "Ex: Emagrecimento Definitivo em 90 dias" },
            { id: "q2", label: "Qual o perfil que você NÃO quer?", placeholder: "Ex: Quem procura pílula mágica" },
        ],
    },
    // FASE 3: CAIXA RÁPIDO
    {
        id: "f7",
        category: "cashbox",
        title: "Oferta Especial Interna",
        promise: "Faturamento imediato com ex-clientes.",
        description: "Scripts de WhatsApp para reativar base de pacientes antigos com uma oferta exclusiva e por tempo limitado.",
        icon: DollarSign,
        gradient: "from-emerald-500 to-emerald-700",
        outputFormat: "script_whatsapp",
        questions: [
            { id: "q1", label: "Qual a condição especial?", placeholder: "Ex: Preço antigo antes do reajuste" },
            { id: "q2", label: "Qual o bônus de urgência?", placeholder: "Ex: 1 mês extra de acompanhamento" },
        ],
    },
    {
        id: "f_referral",
        category: "cashbox",
        title: "Máquina de Indicações",
        promise: "Multiplique seus pacientes atuais.",
        description: "Estratégia de NPS e recompensa para incentivar pacientes felizes a trazerem amigos.",
        icon: Users,
        gradient: "from-pink-500 to-rose-700",
        outputFormat: "script_whatsapp",
        questions: [
            { id: "q1", label: "Qual a recompensa para quem indica?", placeholder: "Ex: Kit de suplementos ou desconto" },
            { id: "q2", label: "Qual a vantagem para o indicado?", placeholder: "Ex: Primeira consulta com valor especial" },
        ],
    },
];

const CATEGORY_LABELS: Record<string, { label: string; description: string }> = {
    attract: { label: "Atração & Validação", description: "Construa sua audiência qualificada" },
    sell: { label: "Conversão Diária", description: "Transforme seguidores em clientes" },
    cashbox: { label: "Caixa Rápido", description: "Faturamento imediato e escala" },
};

const FORMAT_LABELS: Record<string, string> = {
    roteiro_stories: "Roteiro de Stories",
    script_whatsapp: "Script WhatsApp",
    carousel: "Carrossel",
};

export default function Funnels() {
    const { profile } = useProfile();
    const { consumeCredit } = useCredits();
    const { toast } = useToast();

    const [selectedFunnel, setSelectedFunnel] = useState<FunnelBlueprint | null>(null);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<{ parts: { title: string; script: string }[] } | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleSelectFunnel = (funnel: FunnelBlueprint) => {
        setSelectedFunnel(funnel);
        setAnswers({});
        setResult(null);
    };

    const handleBack = () => {
        setSelectedFunnel(null);
        setAnswers({});
        setResult(null);
    };

    const handleGenerate = async () => {
        if (!selectedFunnel) return;

        const unanswered = selectedFunnel.questions.some(q => !answers[q.id]?.trim());
        if (unanswered) {
            toast({ variant: "destructive", title: "Preencha todas as perguntas" });
            return;
        }

        const hasCredit = await consumeCredit(1);
        if (!hasCredit) return;

        setIsGenerating(true);
        setResult(null);

        try {
            const { data, error } = await supabase.functions.invoke("generate-funnel-content", {
                body: {
                    blueprint: {
                        title: selectedFunnel.title,
                        description: selectedFunnel.description,
                        promise: selectedFunnel.promise,
                        outputFormat: selectedFunnel.outputFormat,
                    },
                    answers,
                    profile,
                    format: selectedFunnel.outputFormat,
                },
            });

            if (error) throw error;
            setResult(data);
            toast({ title: "Funil gerado com sucesso!", description: `${data?.parts?.length || 0} partes criadas` });
        } catch (err) {
            console.error("Funnel generation error:", err);
            toast({
                variant: "destructive",
                title: "Erro ao gerar funil",
                description: err instanceof Error ? err.message : "Tente novamente",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = async (text: string, index: number) => {
        await navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
        toast({ title: "Copiado!" });
    };

    // — RESULT VIEW —
    if (result && selectedFunnel) {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => setResult(null)} className="rounded-full">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">{selectedFunnel.title}</h1>
                            <p className="text-sm text-muted-foreground">
                                {FORMAT_LABELS[selectedFunnel.outputFormat]} • {result.parts?.length || 0} partes
                            </p>
                        </div>
                    </div>
                    <Badge className={cn("bg-gradient-to-r text-white border-none px-4 py-1.5", selectedFunnel.gradient)}>
                        {FORMAT_LABELS[selectedFunnel.outputFormat]}
                    </Badge>
                </div>

                <div className="grid gap-4 max-w-3xl">
                    {result.parts?.map((part, idx) => (
                        <Card key={idx} className="glass-card hover:shadow-lg transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br", selectedFunnel.gradient)}>
                                            {idx + 1}
                                        </div>
                                        <h3 className="font-semibold text-sm">{part.title}</h3>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleCopy(part.script, idx)}
                                        className="shrink-0"
                                    >
                                        {copiedIndex === idx ? (
                                            <><Check className="h-4 w-4 mr-1 text-green-500" /> Copiado</>
                                        ) : (
                                            <><Copy className="h-4 w-4 mr-1" /> Copiar</>
                                        )}
                                    </Button>
                                </div>
                                <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                                    {part.script}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setResult(null)} className="rounded-xl">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
                    </Button>
                    <Button onClick={handleGenerate} disabled={isGenerating} className="rounded-xl">
                        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                        Gerar Novamente
                    </Button>
                </div>
            </div>
        );
    }

    // — QUESTION VIEW —
    if (selectedFunnel) {
        const IconComp = selectedFunnel.icon;
        return (
            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{selectedFunnel.title}</h1>
                        <p className="text-sm text-muted-foreground">{selectedFunnel.promise}</p>
                    </div>
                </div>

                <Card className="glass-card-elevated border-primary/20">
                    <CardHeader>
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br text-white mb-3", selectedFunnel.gradient)}>
                            <IconComp className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-lg">{selectedFunnel.description}</CardTitle>
                        <CardDescription>Responda as perguntas abaixo para personalizar o funil:</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {selectedFunnel.questions.map((q) => (
                            <div key={q.id} className="space-y-2">
                                <label className="text-sm font-semibold">{q.label}</label>
                                <Input
                                    value={answers[q.id] || ""}
                                    onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                                    placeholder={q.placeholder}
                                    className="rounded-xl"
                                />
                            </div>
                        ))}

                        <Button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className={cn("w-full h-14 rounded-2xl font-bold text-white shadow-xl transition-all bg-gradient-to-r", selectedFunnel.gradient)}
                        >
                            {isGenerating ? (
                                <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Construindo Funil...</>
                            ) : (
                                <><Zap className="h-5 w-5 mr-2" /> Gerar {FORMAT_LABELS[selectedFunnel.outputFormat]}</>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // — MAIN GRID VIEW —
    const categories = ["attract", "sell", "cashbox"] as const;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full">
                    <Target className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Sales Hub Pro</h1>
                <p className="text-muted-foreground max-w-lg mx-auto">
                    Selecione o funil ideal para o seu momento de faturamento.
                </p>
            </div>

            {/* Funnel Grid by Category */}
            {categories.map((cat) => {
                const funnels = FUNNEL_BLUEPRINTS.filter((f) => f.category === cat);
                const categoryInfo = CATEGORY_LABELS[cat];

                return (
                    <div key={cat} className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-2 h-8 rounded-full",
                                cat === "attract" ? "bg-amber-500" : cat === "sell" ? "bg-green-500" : "bg-pink-500"
                            )} />
                            <div>
                                <h2 className="font-bold text-lg">{categoryInfo.label}</h2>
                                <p className="text-sm text-muted-foreground">{categoryInfo.description}</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            {funnels.map((funnel) => {
                                const IconComp = funnel.icon;
                                return (
                                    <Card
                                        key={funnel.id}
                                        className="glass-card cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group"
                                        onClick={() => handleSelectFunnel(funnel)}
                                    >
                                        <CardContent className="p-6">
                                            <div className="flex items-start gap-4">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br text-white shrink-0 shadow-lg group-hover:scale-110 transition-transform",
                                                    funnel.gradient
                                                )}>
                                                    <IconComp className="h-6 w-6" />
                                                </div>
                                                <div className="space-y-1.5 min-w-0">
                                                    <h3 className="font-bold text-base leading-tight">{funnel.title}</h3>
                                                    <p className="text-sm font-medium text-primary">{funnel.promise}</p>
                                                    <p className="text-xs text-muted-foreground line-clamp-2">{funnel.description}</p>
                                                    <div className="flex gap-2 pt-2">
                                                        <Badge variant="outline" className="text-[10px]">
                                                            {FORMAT_LABELS[funnel.outputFormat]}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <ArrowRight className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0 mt-1" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
