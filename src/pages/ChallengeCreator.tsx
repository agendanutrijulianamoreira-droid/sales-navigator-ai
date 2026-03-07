import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useCredits } from "@/hooks/useCredits";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
    Loader2, Trophy, Sparkles, Copy, Check, ArrowLeft, Rocket,
    Sun, Moon, Star, Zap, Gift
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DailyMission {
    day: number;
    theme: string;
    title: string;
    description: string;
    morning_script: string;
    night_script: string;
    mentor_tip: string;
    gamification_points: number;
}

interface ChallengeData {
    title: string;
    price: number;
    launch_strategy: { day: string; script: string }[];
    daily_missions: DailyMission[];
}

export default function ChallengeCreator() {
    const { profile } = useProfile();
    const { consumeCredit } = useCredits();
    const { toast } = useToast();

    const [challengeTitle, setChallengeTitle] = useState("");
    const [challengePillar, setChallengePillar] = useState("");
    const [challengeDuration, setChallengeDuration] = useState("7");
    const [challengePrice, setChallengePrice] = useState("27");
    const [isGenerating, setIsGenerating] = useState(false);
    const [challenge, setChallenge] = useState<ChallengeData | null>(null);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"timeline" | "launch">("timeline");

    const handleGenerate = async () => {
        if (!challengeTitle.trim()) {
            toast({ variant: "destructive", title: "Digite o nome do desafio" });
            return;
        }

        const hasCredit = await consumeCredit(1);
        if (!hasCredit) return;

        setIsGenerating(true);
        setChallenge(null);
        setSelectedDay(null);

        try {
            const { data, error } = await supabase.functions.invoke("generate-challenge", {
                body: {
                    config: {
                        title: challengeTitle,
                        pillar: challengePillar || challengeTitle,
                        duration: parseInt(challengeDuration),
                        price: parseFloat(challengePrice),
                    },
                    profile,
                },
            });

            if (error) throw error;
            setChallenge(data);
            toast({
                title: "Desafio criado! 🏆",
                description: `${data?.daily_missions?.length || 0} missões geradas`,
            });
        } catch (err) {
            console.error("Challenge generation error:", err);
            toast({
                variant: "destructive",
                title: "Erro ao gerar desafio",
                description: err instanceof Error ? err.message : "Tente novamente",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = async (text: string, field: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
        toast({ title: "Copiado!" });
    };

    const CopyButton = ({ text, field }: { text: string; field: string }) => (
        <Button variant="ghost" size="sm" onClick={() => handleCopy(text, field)} className="shrink-0 h-7">
            {copiedField === field ? (
                <><Check className="h-3 w-3 mr-1 text-green-500" /> Copiado</>
            ) : (
                <><Copy className="h-3 w-3 mr-1" /> Copiar</>
            )}
        </Button>
    );

    // — RESULT VIEW —
    if (challenge) {
        const mission = selectedDay !== null ? challenge.daily_missions?.[selectedDay] : null;

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => setChallenge(null)} className="rounded-full">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">{challenge.title}</h1>
                            <p className="text-sm text-muted-foreground">
                                {challenge.daily_missions?.length || 0} dias • R$ {challenge.price}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={viewMode === "launch" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setViewMode("launch")}
                            className="rounded-xl"
                        >
                            <Rocket className="h-4 w-4 mr-1" /> Lançamento
                        </Button>
                        <Button
                            variant={viewMode === "timeline" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setViewMode("timeline")}
                            className="rounded-xl"
                        >
                            <Star className="h-4 w-4 mr-1" /> Missões
                        </Button>
                    </div>
                </div>

                {/* Launch Strategy */}
                {viewMode === "launch" && challenge.launch_strategy && (
                    <div className="space-y-4 max-w-3xl">
                        <h2 className="font-bold text-lg flex items-center gap-2">
                            <Rocket className="h-5 w-5 text-primary" /> Estratégia de Lançamento
                        </h2>
                        {challenge.launch_strategy.map((step, idx) => (
                            <Card key={idx} className="glass-card">
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <Badge variant="secondary" className="font-bold">{step.day}</Badge>
                                        <CopyButton text={step.script} field={`launch-${idx}`} />
                                    </div>
                                    <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                                        {step.script}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Daily Missions Timeline */}
                {viewMode === "timeline" && (
                    <div className="grid lg:grid-cols-12 gap-6">
                        {/* Day Selector */}
                        <div className="lg:col-span-4 space-y-2">
                            <h2 className="font-bold text-sm text-muted-foreground mb-3">MISSÕES DIÁRIAS</h2>
                            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                                {challenge.daily_missions?.map((m, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedDay(idx)}
                                        className={cn(
                                            "p-4 rounded-xl cursor-pointer transition-all duration-200",
                                            selectedDay === idx
                                                ? "glass-card-elevated border-primary/40 shadow-lg"
                                                : "hover:bg-muted/50 border border-transparent"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold",
                                                selectedDay === idx
                                                    ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white"
                                                    : "bg-muted text-muted-foreground"
                                            )}>
                                                D{m.day}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-sm truncate">{m.theme}</p>
                                                <p className="text-xs text-muted-foreground truncate">{m.title}</p>
                                            </div>
                                            <Badge variant="outline" className="shrink-0 text-[10px]">
                                                ⭐ {m.gamification_points}pts
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Day Detail */}
                        <div className="lg:col-span-8">
                            {mission ? (
                                <div className="space-y-4 animate-in fade-in duration-300">
                                    <Card className="glass-card-elevated">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                                    D{mission.day}
                                                </div>
                                                <div>
                                                    <CardTitle>{mission.theme}</CardTitle>
                                                    <CardDescription>{mission.title}</CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-1">
                                            <p className="text-sm leading-relaxed">{mission.description}</p>
                                        </CardContent>
                                    </Card>

                                    {/* Morning Script */}
                                    <Card className="border-amber-200/50 bg-amber-50/30">
                                        <CardContent className="p-5">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <Sun className="h-4 w-4 text-amber-600" />
                                                    <span className="font-bold text-sm text-amber-700">Script da Manhã</span>
                                                </div>
                                                <CopyButton text={mission.morning_script} field={`morning-${mission.day}`} />
                                            </div>
                                            <p className="text-sm leading-relaxed whitespace-pre-line">{mission.morning_script}</p>
                                        </CardContent>
                                    </Card>

                                    {/* Night Script */}
                                    <Card className="border-indigo-200/50 bg-indigo-50/30">
                                        <CardContent className="p-5">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <Moon className="h-4 w-4 text-indigo-600" />
                                                    <span className="font-bold text-sm text-indigo-700">Check-in Noturno</span>
                                                </div>
                                                <CopyButton text={mission.night_script} field={`night-${mission.day}`} />
                                            </div>
                                            <p className="text-sm leading-relaxed whitespace-pre-line">{mission.night_script}</p>
                                        </CardContent>
                                    </Card>

                                    {/* Mentor Tip */}
                                    {mission.mentor_tip && (
                                        <Card className="border-green-200/50 bg-green-50/30">
                                            <CardContent className="p-5">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Zap className="h-4 w-4 text-green-600" />
                                                    <span className="font-bold text-sm text-green-700">Dica de Bastidor</span>
                                                </div>
                                                <p className="text-sm leading-relaxed whitespace-pre-line text-green-800">{mission.mentor_tip}</p>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                                    <Trophy className="h-12 w-12 mb-4 opacity-20" />
                                    <p className="text-sm">Selecione um dia para ver a missão completa.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // — CONFIG VIEW —
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center p-3 bg-purple-500/10 rounded-full">
                    <Trophy className="h-8 w-8 text-purple-600" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Fábrica de Desafios</h1>
                <p className="text-muted-foreground max-w-lg mx-auto">
                    Crie produtos de entrada magnéticos que geram engajamento e vendem sua mentoria.
                </p>
            </div>

            {/* Config Form */}
            <Card className="glass-card-elevated max-w-2xl mx-auto border-purple-200/30">
                <CardHeader>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white mb-3">
                        <Sparkles className="h-6 w-6" />
                    </div>
                    <CardTitle>Configurar Desafio</CardTitle>
                    <CardDescription>Preencha os detalhes e a IA criará missões diárias completas com scripts.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label className="font-semibold">Nome do Desafio</Label>
                        <Input
                            value={challengeTitle}
                            onChange={(e) => setChallengeTitle(e.target.value)}
                            placeholder="Ex: Desafio Desinflama em 7 Dias"
                            className="rounded-xl"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="font-semibold">Pilar / Foco Principal</Label>
                        <Input
                            value={challengePillar}
                            onChange={(e) => setChallengePillar(e.target.value)}
                            placeholder="Ex: Emagrecimento, Desinflamação, Energia..."
                            className="rounded-xl"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="font-semibold">Duração</Label>
                            <div className="flex gap-2">
                                {["5", "7", "14", "21"].map((d) => (
                                    <div
                                        key={d}
                                        onClick={() => setChallengeDuration(d)}
                                        className={cn(
                                            "flex-1 py-3 rounded-xl border cursor-pointer transition-all text-center text-sm font-bold",
                                            challengeDuration === d
                                                ? "bg-purple-600 border-purple-600 text-white shadow-lg"
                                                : "hover:bg-muted/50 border-border"
                                        )}
                                    >
                                        {d} dias
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold">Preço Sugerido (R$)</Label>
                            <Input
                                type="number"
                                value={challengePrice}
                                onChange={(e) => setChallengePrice(e.target.value)}
                                placeholder="27"
                                className="rounded-xl"
                            />
                        </div>
                    </div>

                    <Button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="w-full h-14 rounded-2xl font-bold text-white shadow-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all"
                    >
                        {isGenerating ? (
                            <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Arquitetando Desafio...</>
                        ) : (
                            <><Trophy className="h-5 w-5 mr-2" /> Criar Desafio Completo</>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <Card className="glass-card text-center p-4">
                    <Gift className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                    <p className="text-xs font-semibold">Scripts de Lançamento</p>
                    <p className="text-[10px] text-muted-foreground">3 stories pré-desafio</p>
                </Card>
                <Card className="glass-card text-center p-4">
                    <Star className="h-6 w-6 mx-auto mb-2 text-amber-500" />
                    <p className="text-xs font-semibold">Missões Diárias</p>
                    <p className="text-[10px] text-muted-foreground">Manhã + Noite + Gamificação</p>
                </Card>
                <Card className="glass-card text-center p-4">
                    <Zap className="h-6 w-6 mx-auto mb-2 text-green-500" />
                    <p className="text-xs font-semibold">Dicas de Bastidor</p>
                    <p className="text-[10px] text-muted-foreground">Mentoria para a nutri</p>
                </Card>
            </div>
        </div>
    );
}
